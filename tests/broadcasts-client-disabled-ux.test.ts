import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("Broadcasts disabled UX", () => {
  it("shows concrete reasons for disabled broadcast draft and row actions", () => {
    const source = readFileSync("src/components/BroadcastsClient.tsx", "utf8");

    expect(source).toContain("function getCreateDisabledReason");
    expect(source).toContain("請先補齊");
    expect(source).toContain('aria-describedby={!canSubmit ? "broadcast-create-disabled-reason" : undefined}');
    expect(source).toContain('id="broadcast-create-disabled-reason"');
    expect(source).toContain("已完成發送的廣播活動不能再次排程");
    expect(source).toContain("發送中的廣播活動不能刪除");
    expect(source).toContain("aria-label={disabledReason ? `${label}：${disabledReason}` : label}");
    expect(source).toContain("setDeleteTarget(item)");
    expect(source).toContain('data-testid="broadcast-delete-dialog"');
    expect(source).toContain('data-testid="broadcast-confirm-delete"');
    expect(source).toContain("確認刪除廣播草稿？");
    expect(source).toContain("focus-visible:ring-[var(--primary)]");
    expect(source).not.toContain("window.confirm");
  });

  it("announces failed broadcast actions as alerts", () => {
    const source = readFileSync("src/components/BroadcastsClient.tsx", "utf8");

    expect(source).toContain('type Feedback = {');
    expect(source).toContain('showFeedback("danger", body?.error || "建立廣播活動失敗。")');
    expect(source).toContain('showFeedback("danger", body?.error || "讀取預覽失敗。")');
    expect(source).toContain('showFeedback("danger", body?.error || "排程發送失敗。")');
    expect(source).toContain('showFeedback("danger", body?.error || "刪除廣播活動失敗。")');
    expect(source).toContain('role={feedback.tone === "danger" ? "alert" : "status"}');
    expect(source).toContain('aria-live="polite"');
  });
});
