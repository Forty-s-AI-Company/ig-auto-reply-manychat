import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const clientFeedbackFiles = [
  "src/components/DisconnectChannelButton.tsx",
  "src/components/oauth/OAuthPopupConnectButton.tsx",
  "src/components/JsonCrudClient.tsx",
];

describe("channel client feedback", () => {
  it("uses inline feedback instead of native alert dialogs for recoverable client errors", () => {
    for (const file of clientFeedbackFiles) {
      const source = readFileSync(file, "utf8");

      expect(source, file).not.toMatch(/\bwindow\.alert\s*\(/);
      expect(source, file).not.toMatch(/[^\w.]alert\s*\(/);
      expect(source, file).toContain('aria-live="polite"');
    }
  });

  it("keeps shared JSON CRUD delete failures visible to users", () => {
    const source = readFileSync("src/components/JsonCrudClient.tsx", "utf8");

    expect(source).toContain('setError("重新載入資料失敗，請稍後再試。")');
    expect(source).toContain('setError(typeof data.error === "string" ? data.error : "刪除失敗，請稍後再試。")');
    expect(source).toContain('setFeedback("已刪除資料。")');
    expect(source).not.toContain('await fetch(`${endpoint}/${id}`, { method: "DELETE" });\n    await reload();');
  });

  it("keeps automation delete failures visible to users", () => {
    const source = readFileSync("src/components/AutomationBuilderClient.tsx", "utf8");

    expect(source).toContain('"刪除自動化失敗，請稍後再試。"');
    expect(source).toContain('if (!response.ok)');
    expect(source).toContain("DeleteAutomationDialog");
    expect(source).toContain('role="dialog"');
    expect(source).toContain('data-testid="automation-confirm-delete"');
    expect(source).not.toContain('confirm("確定要刪除這個自動化嗎？")');
    expect(source).not.toContain('await fetch(`/api/automations/${id}`, { method: "DELETE" });\n    await reload();');
  });

  it("keeps Instagram channel action controls aligned with the light settings UI", () => {
    const disconnect = readFileSync("src/components/DisconnectChannelButton.tsx", "utf8");
    const profileRefresh = readFileSync("src/components/RefreshInstagramProfileButton.tsx", "utf8");
    const instagramActions = readFileSync("src/components/InstagramChannelActions.tsx", "utf8");

    expect(disconnect).toContain('bg-white');
    expect(disconnect).toContain('text-[#b42318]');
    expect(disconnect).not.toMatch(/red-900|red-950|text-red-300/);
    expect(profileRefresh).toContain('bg-white');
    expect(profileRefresh).toContain('text-[#b54708]');
    expect(profileRefresh).not.toMatch(/text-amber-100|bg-amber-900/);
    expect(instagramActions).toContain('bg-[#f0f9ff]');
    expect(instagramActions).toContain('text-[#0b4a6f]');
    expect(instagramActions).toContain("Instagram 功能檢查");
    expect(instagramActions).toContain('data-testid="instagram-action-disabled-reasons"');
    expect(instagramActions).toContain('["media", "comments", "token"]');
    expect(instagramActions).toContain("testId: `instagram-action-${action}`");
    expect(instagramActions).toContain("aria-describedby");
    expect(instagramActions).toContain("暫時停用原因");
    expect(instagramActions).not.toContain("功能已開始實作");
    expect(instagramActions).not.toMatch(/維持 disabled/);
    expect(instagramActions).not.toMatch(/bg-cyan-950|text-cyan-100|text-zinc-100|border-zinc-700|hover:bg-zinc-800/);
  });
});
