import type { OAuthProvider, TokenResult } from "@/lib/oauth/types";
import { getProviderCallbackUrl } from "@/lib/oauth/utils";

type InstagramTokenResponse = {
  access_token?: string;
  user_id?: string | number;
  expires_in?: number;
  error_type?: string;
  error_message?: string;
};

type InstagramProfileResponse = {
  id?: string;
  user_id?: string;
  username?: string;
  name?: string;
  account_type?: string;
  profile_picture_url?: string;
  profile_pic?: string;
  media_count?: number;
};

function getInstagramAppId() {
  return process.env.META_INSTAGRAM_APP_ID?.trim() || process.env.META_APP_ID?.trim() || "";
}

function getInstagramAppSecret() {
  return process.env.META_INSTAGRAM_APP_SECRET?.trim() || process.env.META_APP_SECRET?.trim() || "";
}

async function readJson<T>(response: Response): Promise<T> {
  return (await response.json().catch(() => ({}))) as T;
}

async function exchangeCodeForToken(request: Request, code: string) {
  const appId = getInstagramAppId();
  const appSecret = getInstagramAppSecret();
  if (!appId || !appSecret) {
    throw new Error("META_INSTAGRAM_APP_ID / META_INSTAGRAM_APP_SECRET 尚未設定。");
  }

  const shortTokenResponse = await fetch("https://api.instagram.com/oauth/access_token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: appId,
      client_secret: appSecret,
      grant_type: "authorization_code",
      redirect_uri: getProviderCallbackUrl(request, "meta-instagram"),
      code,
    }),
  });
  const shortToken = await readJson<InstagramTokenResponse>(shortTokenResponse);
  if (!shortTokenResponse.ok || !shortToken.access_token) {
    throw new Error(shortToken.error_message || "Instagram OAuth token 交換失敗。");
  }

  const longTokenUrl = new URL("https://graph.instagram.com/access_token");
  longTokenUrl.searchParams.set("grant_type", "ig_exchange_token");
  longTokenUrl.searchParams.set("client_secret", appSecret);
  longTokenUrl.searchParams.set("access_token", shortToken.access_token);

  const longTokenResponse = await fetch(longTokenUrl, { cache: "no-store" });
  const longToken = await readJson<InstagramTokenResponse>(longTokenResponse);

  return {
    accessToken: longToken.access_token || shortToken.access_token,
    userId: String(shortToken.user_id || ""),
    expiresAt: new Date(Date.now() + (longToken.expires_in || shortToken.expires_in || 3600) * 1000),
  };
}

async function getInstagramProfile(accessToken: string) {
  const fieldAttempts = [
    "id,user_id,username,name,account_type,profile_picture_url,media_count",
    "id,user_id,username,name,account_type,profile_pic,media_count",
    "id,user_id,username,name,account_type,media_count",
  ];

  let lastError: unknown;
  for (const fields of fieldAttempts) {
    const url = new URL("https://graph.instagram.com/me");
    url.searchParams.set("fields", fields);
    url.searchParams.set("access_token", accessToken);

    const response = await fetch(url, { cache: "no-store" });
    const data = await readJson<InstagramProfileResponse>(response);
    if (response.ok && data.id) {
      return data;
    }
    lastError = new Error("Instagram profile 讀取失敗。");
  }

  throw lastError instanceof Error ? lastError : new Error("Instagram profile 讀取失敗。");
}

export const metaInstagramProvider: OAuthProvider = {
  id: "meta-instagram",
  label: "Instagram",
  mode: "oauth",
  getAuthUrl(context) {
    const appId = getInstagramAppId();
    if (!appId) {
      throw new Error("META_INSTAGRAM_APP_ID 或 META_APP_ID 尚未設定。");
    }

    const params = new URLSearchParams({
      client_id: appId,
      redirect_uri: getProviderCallbackUrl(context.request, "meta-instagram"),
      response_type: "code",
      state: context.state,
      force_authentication: "1",
      scope: [
        "instagram_business_basic",
        "instagram_business_manage_comments",
        "instagram_business_manage_messages",
      ].join(","),
    });

    return `https://api.instagram.com/oauth/authorize?${params}`;
  },
  async handleCallback(context): Promise<TokenResult> {
    const token = await exchangeCodeForToken(context.request, context.code);
    const profile = await getInstagramProfile(token.accessToken);

    return {
      providerAccountId: profile.user_id || profile.id || token.userId,
      displayName: profile.name || profile.username || `Instagram ${profile.id || token.userId}`,
      username: profile.username,
      avatarUrl: profile.profile_picture_url || profile.profile_pic,
      accessToken: token.accessToken,
      expiresAt: token.expiresAt,
      scopes: [
        "instagram_business_basic",
        "instagram_business_manage_comments",
        "instagram_business_manage_messages",
      ],
      accountType: profile.account_type,
      profile: {
        id: profile.id,
        userId: profile.user_id,
        username: profile.username,
        name: profile.name,
        accountType: profile.account_type,
        profilePictureUrl: profile.profile_picture_url || profile.profile_pic,
        mediaCount: profile.media_count,
      },
      metadata: {
        oauthProvider: "instagram",
        oauthUserId: token.userId,
      },
    };
  },
};
