import { describe, expect, it } from "vitest";
import { normalizeInstagramMediaError } from "@/lib/instagram/media-errors";

describe("normalizeInstagramMediaError", () => {
  it("maps unsupported request into reviewer-safe permission guidance", () => {
    const error = normalizeInstagramMediaError(new Error("Unsupported request - method type: get fbtrace_id=raw-trace"));

    expect(error.status).toBe(403);
    expect(error.message).toContain("Meta 目前沒有允許");
    expect(error.message).toContain("讀取 Instagram 貼文");
    expect(error.actionHref).toBe("/channels/connect/social");
    expect(error.message).not.toContain("Unsupported request");
    expect(error.message).not.toContain("fbtrace");
  });

  it("maps expired tokens into reconnect guidance", () => {
    const error = normalizeInstagramMediaError(new Error("Error validating access token: Session has expired"));

    expect(error.status).toBe(401);
    expect(error.code).toBe("TOKEN_EXPIRED");
    expect(error.message).toContain("重新連接");
    expect(error.message).not.toContain("access token");
  });
});
