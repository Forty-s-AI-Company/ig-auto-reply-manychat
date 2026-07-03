import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { getSafeChannelActionMessage } from "@/lib/channels/channel-action-feedback";

const routeSource = readFileSync("src/app/api/instagram/token/refresh/route.ts", "utf8");

describe("Instagram token refresh route feedback", () => {
  it("uses safe channel-action copy instead of echoing raw provider errors", () => {
    expect(routeSource).toContain("getSafeChannelActionMessage");
    expect(routeSource).toContain('getSafeChannelActionMessage("token", error)');
    expect(routeSource).not.toContain("`${error.message}");
    expect(routeSource).not.toContain("Instagram token refresh failed.");
  });

  it("redacts raw token refresh provider details", () => {
    const message = getSafeChannelActionMessage("token", new Error("Error validating access token fbtrace_id=abc123"));

    expect(message).toContain("重新登入 Instagram");
    expect(message).not.toContain("access token");
    expect(message).not.toContain("fbtrace");
  });
});
