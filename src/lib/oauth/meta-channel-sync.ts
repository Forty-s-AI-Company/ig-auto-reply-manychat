import { Prisma } from "@prisma/client";
import { assertWorkspaceLimit } from "@/lib/billing/entitlements";
import { buildInstagramChannelName, getMetaChannelConfig, toPrismaJson, type MetaChannelConfig } from "@/lib/channels/meta";
import { getDb } from "@/lib/db";
import type { OAuthProviderId, TokenResult } from "@/lib/oauth/types";

const DEFAULT_GRAPH_API_VERSION = "v25.0";

type MetaGraphError = {
  error?: {
    message?: string;
  };
};

type MetaAccountPage = {
  id: string;
  name: string;
  access_token?: string;
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

async function graphGet<T>(path: string, params: Record<string, string>) {
  const version = process.env.META_GRAPH_API_VERSION || DEFAULT_GRAPH_API_VERSION;
  const url = new URL(`https://graph.facebook.com/${version}/${path}`);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }

  const response = await fetch(url, { cache: "no-store" });
  const data = (await response.json().catch(() => ({}))) as T & MetaGraphError;
  if (!response.ok || data.error) {
    throw new Error(data.error?.message || "Meta Graph API request failed.");
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
  const data = (await response.json().catch(() => ({}))) as T & MetaGraphError;
  if (!response.ok || data.error) {
    throw new Error(data.error?.message || "Meta Graph API request failed.");
  }
  return data;
}

async function subscribeMetaWebhooks(page: MetaAccountPage) {
  const appId = process.env.META_APP_ID?.trim() || "";
  const appSecret = process.env.META_APP_SECRET?.trim() || "";
  const callbackUrl = `${(process.env.APP_URL || "").replace(/\/$/, "")}/api/webhooks/meta`;
  const verifyToken = process.env.META_VERIFY_TOKEN || "";
  if (!appId || !appSecret || !callbackUrl.startsWith("https://") || !verifyToken || !page.access_token) return;

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
    (page) => page.access_token && (page.instagram_business_account?.id || page.connected_instagram_account?.id),
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

function buildFacebookChannelConfig(page: MetaAccountPage, userAccessToken: string, userTokenExpiresAt: Date): MetaChannelConfig {
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
      where: { workspaceId_type_name: { workspaceId, type: "instagram", name } },
      select: { id: true },
    });
    if (!existing) await assertWorkspaceLimit(workspaceId, "igAccounts");

    const channel = await db.channel.upsert({
      where: { workspaceId_type_name: { workspaceId, type: "instagram", name } },
      update: {
        enabled: true,
        configJson: toPrismaJson(buildFacebookChannelConfig(page, userAccessToken, userTokenExpiresAt)),
      },
      create: {
        workspaceId,
        type: "instagram",
        name,
        enabled: true,
        configJson: toPrismaJson(buildFacebookChannelConfig(page, userAccessToken, userTokenExpiresAt)),
      },
    });
    channels.push(channel);

    try {
      await subscribeMetaWebhooks(page);
    } catch {
      // Ignore webhook setup failures here; the connected account and channel remain usable.
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

async function upsertInstagramLoginChannel(input: {
  workspaceId: string;
  accessToken: string;
  expiresAt: Date;
  providerAccountId: string;
  displayName: string;
  username?: string;
  avatarUrl?: string;
  accountType?: string;
  oauthUserId?: string;
  profileReadWarning?: string;
}) {
  const db = getDb();
  const instagramId = input.providerAccountId;
  if (!instagramId) throw new Error("Instagram OAuth did not return an Instagram user ID.");

  const name = buildInstagramChannelName(input.username || "", input.displayName || "Instagram Login");
  const existingByName = await db.channel.findUnique({
    where: { workspaceId_type_name: { workspaceId: input.workspaceId, type: "instagram", name } },
    select: { id: true },
  });
  const instagramChannels = await db.channel.findMany({
    where: { workspaceId: input.workspaceId, type: "instagram" },
    select: { id: true, configJson: true },
  });
  const existingByInstagramId = instagramChannels.find((channel) => {
    const config = getMetaChannelConfig(channel.configJson);
    return (
      config.instagramBusinessAccountId === instagramId ||
      config.instagramBusinessAccountId === input.oauthUserId ||
      config.instagramOauthUserId === input.oauthUserId
    );
  });
  const existing = existingByInstagramId || existingByName;
  if (!existing) await assertWorkspaceLimit(input.workspaceId, "igAccounts");

  const configJson = toPrismaJson({
    loginProvider: "instagram",
    userAccessToken: input.accessToken,
    pageAccessToken: input.accessToken,
    instagramBusinessAccountId: instagramId,
    instagramOauthUserId: input.oauthUserId || instagramId,
    instagramUsername: input.username,
    instagramName: input.displayName,
    instagramProfilePictureUrl: input.avatarUrl,
    profileReadWarning: input.profileReadWarning,
    connectedAt: new Date().toISOString(),
    userTokenExpiresAt: input.expiresAt.toISOString(),
  } satisfies MetaChannelConfig);

  const channel = existing
    ? await db.channel.update({
        where: { id: existing.id },
        data: { name, enabled: true, configJson },
      })
    : await db.channel.create({
        data: { workspaceId: input.workspaceId, type: "instagram", name, enabled: true, configJson },
      });

  await db.channel.updateMany({
    where: { workspaceId: input.workspaceId, type: "mock" },
    data: {
      enabled: false,
      configJson: { mode: "disabled_after_instagram_connection" } as Prisma.InputJsonValue,
    },
  });

  return channel;
}

export async function syncConnectedAccountToChannel(input: {
  provider: OAuthProviderId;
  workspaceId: string;
  result: TokenResult;
}) {
  if (!input.result.accessToken) return { channelIds: [] as string[] };

  if (input.provider === "meta-instagram") {
    const channel = await upsertInstagramLoginChannel({
      workspaceId: input.workspaceId,
      accessToken: input.result.accessToken,
      expiresAt: input.result.expiresAt || new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      providerAccountId: input.result.providerAccountId,
      displayName: input.result.displayName,
      username: input.result.username,
      avatarUrl: input.result.avatarUrl,
      accountType: input.result.accountType,
      oauthUserId:
        typeof input.result.metadata?.oauthUserId === "string" ? input.result.metadata.oauthUserId : input.result.providerAccountId,
      profileReadWarning:
        typeof input.result.metadata?.profileReadWarning === "string" ? input.result.metadata.profileReadWarning : undefined,
    });

    return { channelIds: [channel.id] };
  }

  if (input.provider === "meta-facebook") {
    const expiresAt = input.result.expiresAt || new Date(Date.now() + 60 * 24 * 60 * 60 * 1000);
    const pages = await getInstagramPages(input.result.accessToken);
    let channels = await upsertInstagramChannels(pages, input.result.accessToken, expiresAt, input.workspaceId);

    if (channels.length === 0) {
      try {
        const businessAccounts = await getBusinessInstagramAccounts(input.result.accessToken);
        channels = await upsertBusinessInstagramChannels(businessAccounts, input.result.accessToken, expiresAt, input.workspaceId);
      } catch {
        channels = [];
      }
    }

    if (channels.length === 0) {
      throw new Error("Meta 沒有回傳可連線的 Instagram 商業帳號。請確認該 IG 已連到 Facebook 粉專，且授權時有勾選正確資產。");
    }

    return { channelIds: channels.map((channel) => channel.id) };
  }

  return { channelIds: [] as string[] };
}
