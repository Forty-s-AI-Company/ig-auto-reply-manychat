import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("inbox mobile pane disabled UX", () => {
  it("explains why detail and contact panes are disabled before a conversation is selected", () => {
    const source = readFileSync("src/components/InboxClient.tsx", "utf8");

    expect(source).toContain("請先從對話清單選一則對話，才能查看訊息內容。");
    expect(source).toContain("請先從對話清單選一則對話，才能查看聯絡人摘要。");
    expect(source).toContain("disabledReasonId");
    expect(source).toContain("aria-describedby={disabledReasonId}");
    expect(source).toContain("data-testid={disabledReasonId}");
  });
});
