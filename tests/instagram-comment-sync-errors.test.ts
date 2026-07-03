import { describe, expect, it } from "vitest";
import { getSafeInstagramCommentSyncError } from "@/lib/instagram/comments-sync";

describe("getSafeInstagramCommentSyncError", () => {
  it("redacts unsupported request and fbtrace details", () => {
    const message = getSafeInstagramCommentSyncError(
      new Error("Unsupported request - method type: get fbtrace_id=AJInqhztGApS8ewvUyMqzYV"),
    );

    expect(message).toContain("Meta 目前沒有允許");
    expect(message).toContain("同步留言觸發");
    expect(message).not.toContain("Unsupported request");
    expect(message).not.toContain("fbtrace");
    expect(message).not.toContain("AJInqhzt");
  });

  it("maps expired token failures to reconnect guidance", () => {
    const message = getSafeInstagramCommentSyncError(new Error("Error validating access token: Session has expired"));

    expect(message).toContain("重新登入 Instagram");
    expect(message).not.toContain("access token");
  });
});
