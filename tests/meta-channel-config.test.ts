import { afterEach, describe, expect, it, vi } from "vitest";
import {
  getMetaChannelConfig,
  getMetaGlobalInstagramBusinessAccountId,
  isMetaGlobalEnvFallbackEnabled,
} from "@/lib/channels/meta";
import { encryptSecret } from "@/lib/secrets";

describe("Meta channel config", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("does not crash when stored Meta tokens cannot be decrypted", () => {
    const config = getMetaChannelConfig({
      loginProvider: "instagram",
      instagramUsername: "inboxpilot",
      encryptedUserAccessToken: "enc:v1:invalid:invalid:invalid",
      encryptedPageAccessToken: "enc:v1:invalid:invalid:invalid",
    });

    expect(config.instagramUsername).toBe("inboxpilot");
    expect(config.userAccessToken).toBeUndefined();
    expect(config.pageAccessToken).toBeUndefined();
    expect(config.tokenReadWarning).toContain("請重新連結帳號");
  });

  it("reads encrypted Meta tokens when the deployment secret matches", () => {
    const config = getMetaChannelConfig({
      loginProvider: "instagram",
      encryptedUserAccessToken: encryptSecret("user-token"),
      encryptedPageAccessToken: encryptSecret("page-token"),
    });

    expect(config.userAccessToken).toBe("user-token");
    expect(config.pageAccessToken).toBe("page-token");
    expect(config.tokenReadWarning).toBeUndefined();
  });

  it("disables global Meta env fallback in production deployments", () => {
    vi.stubEnv("INBOXPILOT_DEPLOYMENT_ENV", "production");
    vi.stubEnv("META_INSTAGRAM_BUSINESS_ACCOUNT_ID", "global-ig-id");

    expect(isMetaGlobalEnvFallbackEnabled()).toBe(false);
    expect(getMetaGlobalInstagramBusinessAccountId()).toBe("");
  });

  it("keeps global Meta env fallback available outside production for local and staging smoke tests", () => {
    vi.stubEnv("INBOXPILOT_DEPLOYMENT_ENV", "staging");
    vi.stubEnv("META_INSTAGRAM_BUSINESS_ACCOUNT_ID", "staging-ig-id");

    expect(isMetaGlobalEnvFallbackEnabled()).toBe(true);
    expect(getMetaGlobalInstagramBusinessAccountId()).toBe("staging-ig-id");
  });
});
