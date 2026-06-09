import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { getAppUrl } from "@/lib/app-url";
import { recordAuditEvent } from "@/lib/audit";
import { getCurrentUser } from "@/lib/auth";
import {
  buildInstagramChannelName,
  getMetaChannelConfig,
  toPrismaJson,
  type MetaChannelConfig,
} from "@/lib/channels/meta";
import { assertWorkspaceLimit } from "@/lib/billing/entitlements";
import { getDb } from "@/lib/db";
import { clearPopupState, readPopupState } from "@/lib/oauth/state";
import { getPopupBridgeUrl } from "@/lib/oauth/utils";
import { getClientIp } from "@/lib/security";
import { getDefaultWorkspaceId } from "@/lib/workspaces";

export const runtime = "nodejs";

const META_OAUTH_STATE_COOKIE = "meta_oauth_state";
const META_OAUTH_WORKSPACE_COOKIE = "meta_oauth_workspace";
const META_OAUTH_MODE_COOKIE = "meta_oauth_mode";
const DEFAULT_GRAPH_API_VERSION = "v25.0";
const DEFAULT_FACEBOOK_OAUTH_CALLBACK_PATH = "/api/meta/oauth/callback";
const DEFAULT_INSTAGRAM_OAUTH_CALLBACK_PATH = "/api/instagram/oauth/callback";

type MetaGraphError = {
  error?: {
    message?: string;
    code?: number;
    type?: string;
    error_subcode?: number;
    fbtrace_id?: string;
  };
};

type MetaTokenResponse = MetaGraphError & {
  access_token?: string;
  expires_in?: number;
};

type MetaOauthMode = "instagram" | "facebook";

type InstagramTokenResponse = MetaGraphError & {
  access_token?: string;
  user_id?: number | string;
  expires_in?: number;
};

type InstagramProfile = MetaGraphError & {
  id?: string;
  user_id?: string;
  username?: string;
  name?: string;
  account_type?: string;
  profile_picture_url?: string;
  profile_pic?: string;
  oauthUserId?: string;
  profileReadWarning?: string;
};

type MetaAccountPage = {
  id: string;
  name: string;
  access_token?: string;
  tasks?: string[];
  instagram_business_account?: {
    id: string;
    username?: string;
    name?: string;
    profile_picture_url?: string;
  };
  connected_instagram_account?: {
    id: string;
    username?: string;
  };
};

type MetaInstagramBusinessAsset = {
  id: string;
  username?: string;
  name?: string;
  profile_picture_url?: string;
};

type MetaBusiness = {
  id: string;
  name?: string;
  owned_instagram_accounts?: { data?: MetaInstagramBusinessAsset[] };
  client_instagram_accounts?: { data?: MetaInstagramBusinessAsset[] };
};

function getOAuthRedirectUri(request: Request, mode: MetaOauthMode) {
  const configuredRedirect =
    mode === "instagram"
      ? process.env.META_INSTAGRAM_REDIRECT_URI?.trim()
      : process.env.META_FACEBOOK_REDIRECT_URI?.trim();
  if (configuredRedirect) return configuredRedirect;
  const callbackPath =
    mode === "instagram" ? DEFAULT_INSTAGRAM_OAUTH_CALLBACK_PATH : DEFAULT_FACEBOOK_OAUTH_CALLBACK_PATH;
  return `${getAppUrl(request)}${callbackPath}`;
}

function requiredEnv(name: string) {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`${name} is not configured.`);
  }
  return value;
}

function getOptionalEnv(...names: string[]) {
  for (const name of names) {
    const value = process.env[name]?.trim();
    if (value) return value;
  }
  return "";
}

function requiredAnyEnv(...names: string[]) {
  const value = getOptionalEnv(...names);
  if (!value) throw new Error(`${names.join(" or ")} is not configured.`);
  return value;
}

export function getInstagramAppSecret() {
  const instagramAppId = process.env.META_INSTAGRAM_APP_ID?.trim();
  const facebookAppId = process.env.META_APP_ID?.trim();
  const instagramSecret = process.env.META_INSTAGRAM_APP_SECRET?.trim();

  if (instagramSecret) return instagramSecret;
  if (!instagramAppId || instagramAppId === facebookAppId) {
    return requiredAnyEnv("META_INSTAGRAM_APP_SECRET", "META_APP_SECRET");
  }

  throw new Error("META_INSTAGRAM_APP_SECRET is required for Instagram Login because META_INSTAGRAM_APP_ID is different from META_APP_ID.");
}

async function graphGet<T>(path: string, params: Record<string, string>) {
  const version = process.env.META_GRAPH_API_VERSION || DEFAULT_GRAPH_API_VERSION;
  const url = new URL(`https://graph.facebook.com/${version}/${path}`);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }

  const response = await fetch(url);
  const data = (await response.json()) as T & MetaGraphError;
  if (!response.ok || data.error) {
    throw new Error(data.error?.message || "Meta Graph API request failed.");
  }
  return data;
}

async function instagramGraphGet<T>(path: string, params: Record<string, string>) {
  const version = process.env.META_GRAPH_API_VERSION || DEFAULT_GRAPH_API_VERSION;
  const url = new URL(`https://graph.instagram.com/${version}/${path}`);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }

  const response = await fetch(url);
  const data = (await response.json()) as T & MetaGraphError;
  if (!response.ok || data.error) {
    throw new Error(data.error?.message || "Instagram Graph API request failed.");
  }
  return data;
}

async function instagramFormPost<T>(url: string, params: Record<string, string>) {
  const response = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(params),
  });
  const data = (await response.json()) as T & MetaGraphError;
  if (!response.ok || data.error) {
    const detail = data.error?.message || "Instagram OAuth request failed.";
    const trace = data.error?.fbtrace_id ? ` fbtrace_id=${data.error.fbtrace_id}` : "";
    throw new Error(`${detail}${trace}`);
  }
  return data;
}

async function graphPost<T>(path: string, params: Record<string, string>) {
  const version = process.env.META_GRAPH_API_VERSION || DEFAULT_GRAPH_API_VERSION;
  const response = await fetch(`https://graph.facebook.com/${version}/${path}`, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(params),
  });
  const data = (await response.json()) as T & MetaGraphError;
  if (!response.ok || data.error) {
    throw new Error(data.error?.message || "Meta Graph API request failed.");
  }
  return data;
}

async function exchangeCodeForInstagramToken(request: Request, code: string) {
  const appId = requiredAnyEnv("META_INSTAGRAM_APP_ID", "META_APP_ID");
  const appSecret = getInstagramAppSecret();
  const redirectUri = getOAuthRedirectUri(request, "instagram");

  const shortToken = await instagramFormPost<InstagramTokenResponse>("https://api.instagram.com/oauth/access_token", {
    client_id: appId,
    client_secret: appSecret,
    grant_type: "authorization_code",
    redirect_uri: redirectUri,
    code,
  });

  if (!shortToken.access_token) {
    throw new Error("Instagram OAuth did not return an access token.");
  }

  let longToken: InstagramTokenResponse | null = null;
  try {
    longToken = await instagramFormPost<InstagramTokenResponse>("https://graph.instagram.com/access_token", {
      grant_type: "ig_exchange_token",
      client_secret: appSecret,
      access_token: shortToken.access_token,
    });
  } catch {
    longToken = null;
  }

  return {
    accessToken: longToken?.access_token || shortToken.access_token,
    userId: String(shortToken.user_id || ""),
    expiresAt: new Date(Date.now() + (longToken?.expires_in || shortToken.expires_in || 60 * 24 * 60 * 60) * 1000),
  };
}

async function getInstagramProfile(accessToken: string) {
  const fieldAttempts = [
    "id,user_id,username,name,account_type,profile_picture_url",
    "id,user_id,username,name,account_type,profile_pic",
    "id,user_id,username,name,account_type",
  ];

  let lastError: unknown;
  for (const fields of fieldAttempts) {
    try {
      return await instagramGraphGet<InstagramProfile>("me", {
        fields,
        access_token: accessToken,
      });
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError instanceof Error ? lastError : new Error("Instagram profile request failed.");
}

async function getInstagramProfileOrFallback(accessToken: string, tokenUserId: string) {
  try {
    const profile = await getInstagramProfile(accessToken);
    return { ...profile, oauthUserId: tokenUserId } satisfies InstagramProfile;
  } catch (error) {
    if (!tokenUserId) throw error;
    const message = error instanceof Error ? error.message : "Instagram profile request failed.";
    return {
      id: tokenUserId,
      user_id: tokenUserId,
      oauthUserId: tokenUserId,
      name: `ID ${tokenUserId}`,
      profileReadWarning: message,
    } satisfies InstagramProfile;
  }
}

async function exchangeCodeForUserToken(request: Request, code: string) {
  const appId = requiredEnv("META_APP_ID");
  const appSecret = requiredEnv("META_APP_SECRET");
  const redirectUri = getOAuthRedirectUri(request, "facebook");

  const shortToken = await graphGet<MetaTokenResponse>("oauth/access_token", {
    client_id: appId,
    client_secret: appSecret,
    redirect_uri: redirectUri,
    code,
  });

  if (!shortToken.access_token) {
    throw new Error("Meta OAuth did not return a user access token.");
  }

  const longToken = await graphGet<MetaTokenResponse>("oauth/access_token", {
    grant_type: "fb_exchange_token",
    client_id: appId,
    client_secret: appSecret,
    fb_exchange_token: shortToken.access_token,
  });

  return {
    accessToken: longToken.access_token || shortToken.access_token,
    expiresAt: new Date(Date.now() + (longToken.expires_in || shortToken.expires_in || 60 * 24 * 60 * 60) * 1000),
  };
}

async function getInstagramPages(userAccessToken: string) {
  const fieldAttempts = [
    "name,id,access_token,tasks,instagram_business_account{id,username,name,profile_picture_url},connected_instagram_account{id,username}",
    "name,id,access_token,tasks,instagram_business_account{id,username,name},connected_instagram_account{id,username}",
  ];

  let data: { data?: MetaAccountPage[] } | null = null;
  let lastError: unknown;
  for (const fields of fieldAttempts) {
    try {
      data = await graphGet<{ data?: MetaAccountPage[] }>("me/accounts", {
        fields,
        access_token: userAccessToken,
      });
      break;
    } catch (error) {
      lastError = error;
    }
  }

  if (!data) throw lastError instanceof Error ? lastError : new Error("Meta pages request failed.");

  return (data.data || []).filter(
    (page) =>
      page.access_token &&
      (page.instagram_business_account?.id || page.connected_instagram_account?.id),
  );
}

async function getBusinessInstagramAccounts(userAccessToken: string) {
  const data = await graphGet<{ data?: MetaBusiness[] }>("me/businesses", {
    fields: [
      "id",
      "name",
      "owned_instagram_accounts{id,username,name,profile_picture_url}",
      "client_instagram_accounts{id,username,name,profile_picture_url}",
    ].join(","),
    access_token: userAccessToken,
  });

  const seen = new Set<string>();
  const accounts: Array<MetaInstagramBusinessAsset & { businessId: string; businessName?: string }> = [];
  for (const business of data.data || []) {
    const instagramAccounts = [
      ...(business.owned_instagram_accounts?.data || []),
      ...(business.client_instagram_accounts?.data || []),
    ];
    for (const account of instagramAccounts) {
      if (!account.id || seen.has(account.id)) continue;
      seen.add(account.id);
      accounts.push({ ...account, businessId: business.id, businessName: business.name });
    }
  }

  return accounts;
}

async function subscribeMetaWebhooks(page: MetaAccountPage) {
  const appId = requiredEnv("META_APP_ID");
  const appSecret = requiredEnv("META_APP_SECRET");
  const callbackUrl = `${(process.env.APP_URL || "").replace(/\/$/, "")}/api/webhooks/meta`;
  const verifyToken = process.env.META_VERIFY_TOKEN || "";
  if (!callbackUrl.startsWith("https://") || !verifyToken || !page.access_token) return;

  await graphPost<{ success?: boolean }>(`${appId}/subscriptions`, {
    object: "instagram",
    callback_url: callbackUrl,
    verify_token: verifyToken,
    fields: "comments,messages,messaging_postbacks,message_reactions,messaging_seen",
    include_values: "true",
    access_token: `${appId}|${appSecret}`,
  });

  await graphPost<{ success?: boolean }>(`${page.id}/subscribed_apps`, {
    subscribed_fields: "comments,messages,messaging_postbacks,message_reactions,message_reads,message_echoes",
    access_token: page.access_token,
  });
}

function buildChannelConfig(page: MetaAccountPage, userAccessToken: string, userTokenExpiresAt: Date): MetaChannelConfig {
  const instagram = page.instagram_business_account || page.connected_instagram_account;
  return {
    loginProvider: "facebook",
    pageId: page.id,
    pageName: page.name,
    userAccessToken,
    pageAccessToken: page.access_token,
    instagramBusinessAccountId: instagram?.id,
    instagramUsername: instagram?.username,
    instagramName: page.instagram_business_account?.name,
    instagramProfilePictureUrl: page.instagram_business_account?.profile_picture_url,
    connectedAt: new Date().toISOString(),
    userTokenExpiresAt: userTokenExpiresAt.toISOString(),
  };
}

function buildInstagramLoginChannelConfig(
  profile: InstagramProfile,
  accessToken: string,
  userTokenExpiresAt: Date,
): MetaChannelConfig {
  const instagramId = String(profile.user_id || profile.id || "");
  return {
    loginProvider: "instagram",
    userAccessToken: accessToken,
    pageAccessToken: accessToken,
    instagramBusinessAccountId: instagramId,
    instagramOauthUserId: profile.oauthUserId,
    instagramUsername: profile.username,
    instagramName: profile.name,
    instagramProfilePictureUrl: profile.profile_picture_url || profile.profile_pic,
    profileReadWarning: profile.profileReadWarning,
    connectedAt: new Date().toISOString(),
    userTokenExpiresAt: userTokenExpiresAt.toISOString(),
  };
}

async function upsertInstagramChannels(
  pages: MetaAccountPage[],
  userAccessToken: string,
  userTokenExpiresAt: Date,
  workspaceId: string,
) {
  const db = getDb();
  const channels = [];

  for (const page of pages) {
    const instagram = page.instagram_business_account || page.connected_instagram_account;
    if (!instagram || !page.access_token) continue;
    const name = buildInstagramChannelName(instagram.username || "", page.name);
    const existing = await db.channel.findUnique({
      where: {
        workspaceId_type_name: {
          workspaceId,
          type: "instagram",
          name,
        },
      },
      select: { id: true },
    });
    if (!existing) await assertWorkspaceLimit(workspaceId, "igAccounts");

    const channel = await db.channel.upsert({
      where: {
        workspaceId_type_name: {
          workspaceId,
          type: "instagram",
          name,
        },
      },
      update: {
        enabled: true,
        configJson: toPrismaJson(buildChannelConfig(page, userAccessToken, userTokenExpiresAt)),
      },
      create: {
        workspaceId,
        type: "instagram",
        name,
        enabled: true,
        configJson: toPrismaJson(buildChannelConfig(page, userAccessToken, userTokenExpiresAt)),
      },
    });
    channels.push(channel);

    try {
      await subscribeMetaWebhooks(page);
    } catch {
      // The connection remains usable locally; surface detailed webhook issues in Meta setup logs instead.
    }
  }

  if (channels.length > 0) {
    await db.channel.updateMany({
      where: { workspaceId, type: "mock" },
      data: {
        enabled: false,
        configJson: { mode: "disabled_after_instagram_connection" } as Prisma.InputJsonValue,
      },
    });
  }

  return channels;
}

async function upsertBusinessInstagramChannels(
  accounts: Array<MetaInstagramBusinessAsset & { businessId: string; businessName?: string }>,
  userAccessToken: string,
  userTokenExpiresAt: Date,
  workspaceId: string,
) {
  const db = getDb();
  const channels = [];

  for (const account of accounts) {
    const name = buildInstagramChannelName(account.username || "", account.name || account.businessName || "Meta Business");
    const existingChannels = await db.channel.findMany({
      where: { workspaceId, type: "instagram" },
      select: { id: true, configJson: true },
    });
    const existingByInstagramId = existingChannels.find((channel) => {
      const config = getMetaChannelConfig(channel.configJson);
      return config.instagramBusinessAccountId === account.id || config.instagramOauthUserId === account.id;
    });
    const existingByName = existingByInstagramId
      ? null
      : await db.channel.findUnique({
          where: { workspaceId_type_name: { workspaceId, type: "instagram", name } },
          select: { id: true },
        });
    const existing = existingByInstagramId || existingByName;
    if (!existing) await assertWorkspaceLimit(workspaceId, "igAccounts");

    const configJson = toPrismaJson({
      loginProvider: "facebook",
      businessId: account.businessId,
      pageName: account.businessName,
      userAccessToken,
      instagramBusinessAccountId: account.id,
      instagramOauthUserId: account.id,
      instagramUsername: account.username,
      instagramName: account.name,
      instagramProfilePictureUrl: account.profile_picture_url,
      connectedAt: new Date().toISOString(),
      userTokenExpiresAt: userTokenExpiresAt.toISOString(),
    } satisfies MetaChannelConfig);

    const channel = existing
      ? await db.channel.update({
          where: { id: existing.id },
          data: { name, enabled: true, configJson },
        })
      : await db.channel.create({
          data: { workspaceId, type: "instagram", name, enabled: true, configJson },
        });
    channels.push(channel);
  }

  if (channels.length > 0) {
    await db.channel.updateMany({
      where: { workspaceId, type: "mock" },
      data: {
        enabled: false,
        configJson: { mode: "disabled_after_instagram_connection" } as Prisma.InputJsonValue,
      },
    });
  }

  return channels;
}

async function upsertInstagramLoginChannel(profile: InstagramProfile, accessToken: string, expiresAt: Date, workspaceId: string) {
  const db = getDb();
  const instagramId = String(profile.user_id || profile.id || "");
  if (!instagramId) throw new Error("Instagram OAuth did not return an Instagram user ID.");

  const name = buildInstagramChannelName(profile.username || "", profile.name || "Instagram Login");
  const existingByName = await db.channel.findUnique({
    where: { workspaceId_type_name: { workspaceId, type: "instagram", name } },
    select: { id: true },
  });
  const instagramChannels = await db.channel.findMany({
    where: { workspaceId, type: "instagram" },
    select: { id: true, configJson: true },
  });
  const existingByInstagramId = instagramChannels.find((channel) => {
    const config = getMetaChannelConfig(channel.configJson);
    return (
      config.instagramBusinessAccountId === instagramId ||
      config.instagramBusinessAccountId === profile.oauthUserId ||
      config.instagramOauthUserId === profile.oauthUserId
    );
  });
  const existing = existingByInstagramId || existingByName;
  if (!existing) await assertWorkspaceLimit(workspaceId, "igAccounts");

  const configJson = toPrismaJson(buildInstagramLoginChannelConfig(profile, accessToken, expiresAt));
  const channel = existing
    ? await db.channel.update({
        where: { id: existing.id },
        data: { name, enabled: true, configJson },
      })
    : await db.channel.create({
        data: { workspaceId, type: "instagram", name, enabled: true, configJson },
      });

  await db.channel.updateMany({
    where: { workspaceId, type: "mock" },
    data: {
      enabled: false,
      configJson: { mode: "disabled_after_instagram_connection" } as Prisma.InputJsonValue,
    },
  });

  return channel;
}

export function getCallbackMode(request: Request, cookieValue?: string): MetaOauthMode {
  if (cookieValue === "facebook" || cookieValue === "instagram") return cookieValue;
  return new URL(request.url).pathname.startsWith(DEFAULT_INSTAGRAM_OAUTH_CALLBACK_PATH)
    ? "instagram"
    : "facebook";
}

async function recordMetaOauthFailure(params: {
  request: Request;
  workspaceId: string;
  userId?: string;
  provider: string;
  mode: MetaOauthMode;
  reason: string;
  transport?: "popup" | "redirect";
}) {
  const sanitizedReason = params.reason
    .replace(/\b(access[_-]?token|refresh[_-]?token|client[_-]?secret|app[_-]?secret|authorization[_-]?code|code|state|secret)\b/gi, "[redacted]")
    .replace(/([?&](?:code|state|access_token|refresh_token|client_secret|app_secret)=)[^&\s]+/gi, "$1[redacted]")
    .slice(0, 500);

  await recordAuditEvent({
    action: "oauth_callback_failed",
    resourceType: "channel",
    workspaceId: params.workspaceId,
    userId: params.userId,
    actorIp: getClientIp(params.request),
    userAgent: params.request.headers.get("user-agent"),
    success: false,
    metadata: {
      provider: params.provider,
      mode: params.mode,
      transport: params.transport || "popup",
      reason: sanitizedReason,
    },
  });
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const providerError = url.searchParams.get("error_description") || url.searchParams.get("error") || "";
  const cookieStore = await cookies();
  const popupState = await readPopupState();
  const expectedState = cookieStore.get(META_OAUTH_STATE_COOKIE)?.value;
  const workspaceId = cookieStore.get(META_OAUTH_WORKSPACE_COOKIE)?.value || (await getDefaultWorkspaceId());
  const mode = getCallbackMode(request, cookieStore.get(META_OAUTH_MODE_COOKIE)?.value);
  const currentUser = await getCurrentUser();
  const popupProvider =
    popupState.provider === "meta-instagram" || popupState.provider === "meta-facebook" ? popupState.provider : "";
  const auditProvider = popupProvider || `meta-${mode}`;
  cookieStore.delete(META_OAUTH_STATE_COOKIE);
  cookieStore.delete(META_OAUTH_WORKSPACE_COOKIE);
  cookieStore.delete(META_OAUTH_MODE_COOKIE);

  if (providerError) {
    await recordMetaOauthFailure({
      request,
      workspaceId,
      userId: currentUser?.id,
      provider: auditProvider,
      mode,
      transport: popupState.transport,
      reason: providerError,
    });
    if (popupProvider) {
      await clearPopupState();
      return NextResponse.redirect(
        getPopupBridgeUrl(request, {
          status: "error",
          provider: popupProvider,
          message: providerError,
        }),
      );
    }
    return NextResponse.redirect(`${getAppUrl(request)}/channels/connect/social?meta_error=${encodeURIComponent(providerError)}`);
  }

  if (!code || !state || !expectedState || state !== expectedState) {
    await recordMetaOauthFailure({
      request,
      workspaceId,
      userId: currentUser?.id,
      provider: auditProvider,
      mode,
      transport: popupState.transport,
      reason: "invalid_state",
    });
    if (popupProvider) {
      await clearPopupState();
      return NextResponse.redirect(
        getPopupBridgeUrl(request, {
          status: "error",
          provider: popupProvider,
          message: "OAuth state verification failed.",
        }),
      );
    }
    return NextResponse.redirect(`${getAppUrl(request)}/channels/connect/social?meta_error=invalid_state`);
  }

  try {
    if (mode === "instagram") {
      const token = await exchangeCodeForInstagramToken(request, code);
      const profile = await getInstagramProfileOrFallback(token.accessToken, token.userId);
      const channel = await upsertInstagramLoginChannel(profile, token.accessToken, token.expiresAt, workspaceId);
      if (popupProvider) {
        await clearPopupState();
        return NextResponse.redirect(
          getPopupBridgeUrl(request, {
            status: "success",
            provider: popupProvider,
            accountId: channel.id,
            displayName: channel.name,
          }),
        );
      }
      return NextResponse.redirect(`${getAppUrl(request)}/channels/connect/success?connected=1&mode=instagram&channel=${channel.id}`);
    }

    const userToken = await exchangeCodeForUserToken(request, code);
    const pages = await getInstagramPages(userToken.accessToken);
    let channels = await upsertInstagramChannels(pages, userToken.accessToken, userToken.expiresAt, workspaceId);
    if (channels.length === 0) {
      try {
        const businessAccounts = await getBusinessInstagramAccounts(userToken.accessToken);
        channels = await upsertBusinessInstagramChannels(businessAccounts, userToken.accessToken, userToken.expiresAt, workspaceId);
      } catch {
        channels = [];
      }
    }
    if (channels.length === 0) {
      throw new Error("Meta did not return any usable Instagram channels.");
    }
    if (popupProvider) {
      await clearPopupState();
      return NextResponse.redirect(
        getPopupBridgeUrl(request, {
          status: "success",
          provider: popupProvider,
          accountId: channels[0]?.id,
          displayName: channels[0]?.name || "Meta",
          message: `Connected ${channels.length} Instagram channel(s).`,
        }),
      );
    }
    return NextResponse.redirect(
      `${getAppUrl(request)}/channels/connect/success?connected=${channels.length}&mode=facebook&channel=${channels[0]?.id || ""}`,
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Meta connection failed.";
    await recordMetaOauthFailure({
      request,
      workspaceId,
      userId: currentUser?.id,
      provider: auditProvider,
      mode,
      transport: popupState.transport,
      reason: message,
    });
    if (popupProvider) {
      await clearPopupState();
      return NextResponse.redirect(
        getPopupBridgeUrl(request, {
          status: "error",
          provider: popupProvider,
          message,
        }),
      );
    }
    return NextResponse.redirect(`${getAppUrl(request)}/channels/connect/social?meta_error=${encodeURIComponent(message)}`);
  }
}
