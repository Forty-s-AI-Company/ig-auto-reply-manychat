import { afterEach, describe, expect, it, vi } from "vitest";

import {
  getCallbackMode,
  getInstagramAppSecret,
  getMetaOauthErrorCode,
  getMetaOauthUserMessage,
} from "../src/app/api/meta/oauth/callback/route";
import { getMetaBusinessLoginPreference } from "../src/app/api/meta/oauth/start/route";

describe("Meta OAuth configuration", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("requires a dedicated Instagram app secret when Instagram and Facebook app IDs differ", () => {
    vi.stubEnv("META_INSTAGRAM_APP_ID", "instagram-app-id");
    vi.stubEnv("META_APP_ID", "facebook-app-id");
    vi.stubEnv("META_INSTAGRAM_APP_SECRET", "");
    vi.stubEnv("META_APP_SECRET", "facebook-secret");

    expect(() => getInstagramAppSecret()).toThrow("META_INSTAGRAM_APP_SECRET is required");
  });

  it("uses the Instagram app secret for Instagram Login", () => {
    vi.stubEnv("META_INSTAGRAM_APP_ID", "instagram-app-id");
    vi.stubEnv("META_APP_ID", "facebook-app-id");
    vi.stubEnv("META_INSTAGRAM_APP_SECRET", "instagram-secret");
    vi.stubEnv("META_APP_SECRET", "facebook-secret");

    expect(getInstagramAppSecret()).toBe("instagram-secret");
  });

  it("defaults the Meta Business login preference to the requested OAuth mode", () => {
    expect(getMetaBusinessLoginPreference("facebook", null)).toBe("facebook");
    expect(getMetaBusinessLoginPreference("instagram", null)).toBe("instagram");
    expect(getMetaBusinessLoginPreference("facebook", "instagram")).toBe("instagram");
  });

  it("falls back to the callback path when the OAuth mode cookie is missing", () => {
    expect(getCallbackMode(new Request("https://example.com/api/meta/oauth/callback"))).toBe("facebook");
    expect(getCallbackMode(new Request("https://example.com/api/instagram/oauth/callback"))).toBe("instagram");
  });

  it("maps Meta OAuth failures to safe user-facing Chinese messages", () => {
    expect(getMetaOauthErrorCode("invalid_state")).toBe("invalid_state");
    expect(getMetaOauthUserMessage("invalid_state", "instagram")).toContain("登入驗證已失效");

    const permissionMessage = getMetaOauthUserMessage(
      "Missing permission instagram_business_manage_messages",
      "instagram",
    );
    expect(getMetaOauthErrorCode("Missing permission instagram_business_manage_messages")).toBe("missing_permissions");
    expect(permissionMessage).toContain("Meta 未核發 Instagram 訊息讀取權限");

    const channelMessage = getMetaOauthUserMessage("Meta did not return any usable Instagram channels.", "facebook");
    expect(getMetaOauthErrorCode("Meta did not return any usable Instagram channels.")).toBe("no_instagram_channel");
    expect(channelMessage).toContain("沒有回傳可用的 Instagram 專業帳號");
  });
});
