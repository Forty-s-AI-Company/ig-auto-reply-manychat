import type { OAuthProvider, TokenResult } from "@/lib/oauth/types";

function decodeMockCode(code: string) {
  try {
    const payload = JSON.parse(Buffer.from(code, "base64url").toString("utf8")) as {
      id?: string;
      name?: string;
      username?: string;
    };
    if (!payload.id) throw new Error("missing id");
    return payload;
  } catch {
    throw new Error("Mock OAuth code 無效。");
  }
}

export function encodeMockCode(payload: { id: string; name: string; username: string }) {
  return Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
}

export const mockProvider: OAuthProvider = {
  id: "mock",
  label: "Mock OAuth",
  mode: "oauth",
  getAuthUrl(context) {
    const url = new URL("/oauth/providers/mock", context.popupOrigin);
    url.searchParams.set("state", context.state);
    return url.toString();
  },
  async handleCallback(context): Promise<TokenResult> {
    const payload = decodeMockCode(context.code);
    return {
      providerAccountId: payload.id || "mock-user",
      displayName: payload.name || "Mock User",
      username: payload.username,
      accessToken: `mock-token-${payload.id || "user"}`,
      refreshToken: `mock-refresh-${payload.id || "user"}`,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      accountType: "mock-user",
      scopes: ["profile:read", "messages:write"],
      profile: payload,
      metadata: {
        oauthProvider: "mock",
      },
    };
  },
};
