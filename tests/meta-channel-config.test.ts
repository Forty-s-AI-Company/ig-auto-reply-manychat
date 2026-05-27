import { describe, expect, it } from "vitest";
import { getMetaChannelConfig } from "@/lib/channels/meta";
import { encryptSecret } from "@/lib/secrets";

describe("Meta channel config", () => {
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
});
