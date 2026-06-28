import { describe, expect, it } from "vitest";
import { getChannelActionDisabledReason, getSafeChannelActionMessage } from "@/lib/channels/channel-action-feedback";

describe("channel action feedback", () => {
  it("disables channel actions when no stored token exists", () => {
    expect(getChannelActionDisabledReason("media", { hasStoredToken: false })).toMatch(/沒有可用授權/);
    expect(getChannelActionDisabledReason("comments", { hasStoredToken: false })).toMatch(/沒有可用授權/);
  });

  it("disables token refresh for facebook login channels", () => {
    expect(getChannelActionDisabledReason("token", { hasStoredToken: true, loginProvider: "facebook" })).toMatch(
      /Facebook 粉專登入/,
    );
  });

  it("redacts raw provider errors for profile refresh", () => {
    const message = getSafeChannelActionMessage("profile", new Error("Unsupported request - method type: get fbtrace_id=abc"));
    expect(message).toContain("Meta 目前沒有允許");
    expect(message).not.toContain("fbtrace");
  });

  it("maps token and media failures into readable chinese copy", () => {
    expect(getSafeChannelActionMessage("token", new Error("Error validating access token"))).toContain("重新登入 Instagram");
    expect(getSafeChannelActionMessage("media", new Error("Session has expired"))).toContain("抓取貼文");
    expect(getSafeChannelActionMessage("comments", new Error("permission denied"))).toContain("同步留言觸發");
  });
});
