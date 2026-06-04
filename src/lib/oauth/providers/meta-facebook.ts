import type { OAuthProvider, TokenResult } from "@/lib/oauth/types";
import { getProviderCallbackUrl } from "@/lib/oauth/utils";

type FacebookTokenResponse = {
  access_token?: string;
  token_type?: string;
  expires_in?: number;
  error?: { message?: string };
};

type FacebookProfileResponse = {
  id?: string;
  name?: string;
  picture?: {
    data?: {
      url?: string;
    };
  };
};

function getFacebookAppId() {
  return process.env.META_APP_ID?.trim() || "";
}

function getFacebookAppSecret() {
  return process.env.META_APP_SECRET?.trim() || "";
}

async function readJson<T>(response: Response): Promise<T> {
  return (await response.json().catch(() => ({}))) as T;
}

async function exchangeCodeForToken(request: Request, code: string) {
  const appId = getFacebookAppId();
  const appSecret = getFacebookAppSecret();
  if (!appId || !appSecret) {
    throw new Error("META_APP_ID / META_APP_SECRET 尚未設定。");
  }

  const tokenUrl = new URL("https://graph.facebook.com/v25.0/oauth/access_token");
  tokenUrl.searchParams.set("client_id", appId);
  tokenUrl.searchParams.set("client_secret", appSecret);
  tokenUrl.searchParams.set("redirect_uri", getProviderCallbackUrl(request, "meta-facebook"));
  tokenUrl.searchParams.set("code", code);

  const response = await fetch(tokenUrl, { cache: "no-store" });
  const data = await readJson<FacebookTokenResponse>(response);
  if (!response.ok || !data.access_token) {
    throw new Error(data.error?.message || "Facebook OAuth token 交換失敗。");
  }

  return {
    accessToken: data.access_token,
    expiresAt: new Date(Date.now() + (data.expires_in || 3600) * 1000),
  };
}

async function getProfile(accessToken: string) {
  const url = new URL("https://graph.facebook.com/v25.0/me");
  url.searchParams.set("fields", "id,name,picture.type(large)");
  url.searchParams.set("access_token", accessToken);

  const response = await fetch(url, { cache: "no-store" });
  const data = await readJson<FacebookProfileResponse>(response);
  if (!response.ok || !data.id) {
    throw new Error("Facebook profile 讀取失敗。");
  }
  return data;
}

export const metaFacebookProvider: OAuthProvider = {
  id: "meta-facebook",
  label: "Facebook",
  mode: "oauth",
  getAuthUrl(context) {
    const appId = getFacebookAppId();
    if (!appId) {
      throw new Error("META_APP_ID 尚未設定。");
    }

    const params = new URLSearchParams({
      client_id: appId,
      redirect_uri: getProviderCallbackUrl(context.request, "meta-facebook"),
      response_type: "code",
      state: context.state,
      scope: [
        "public_profile",
        "pages_show_list",
        "pages_read_engagement",
        "pages_manage_metadata",
        "instagram_basic",
        "instagram_manage_messages",
      ].join(","),
    });

    return `https://www.facebook.com/v25.0/dialog/oauth?${params}`;
  },
  async handleCallback(context): Promise<TokenResult> {
    const token = await exchangeCodeForToken(context.request, context.code);
    const profile = await getProfile(token.accessToken);

    return {
      providerAccountId: profile.id || "",
      displayName: profile.name || `Facebook ${profile.id || ""}`,
      accessToken: token.accessToken,
      expiresAt: token.expiresAt,
      scopes: [
        "public_profile",
        "pages_show_list",
        "pages_read_engagement",
        "pages_manage_metadata",
        "instagram_basic",
        "instagram_manage_messages",
      ],
      avatarUrl: profile.picture?.data?.url,
      accountType: "facebook-user",
      profile: {
        id: profile.id,
        name: profile.name,
        pictureUrl: profile.picture?.data?.url,
      },
      metadata: {
        oauthProvider: "facebook",
      },
    };
  },
};
