import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("dashboard recent message empty state", () => {
  const source = readFileSync(join(process.cwd(), "src/app/dashboard/page.tsx"), "utf8");

  it("uses release-aware CTAs instead of sending simple-release users to the mock tester", () => {
    expect(source).toContain("recentMessagesEmptyState = simpleRelease");
    expect(source).toContain('href: connectedInstagramChannels > 0 ? "/inbox" : "/channels/connect"');
    expect(source).toContain('href: "/mock-tester"');
    expect(source).toContain('data-testid="dashboard-recent-messages-empty"');
    expect(source).not.toContain("還沒有訊息。可以先用測試工具送一則測試訊息。");
  });

  it("gives the recent automation empty state a real next-step CTA", () => {
    expect(source).toContain('data-testid="dashboard-recent-automations-empty"');
    expect(source).toContain('data-testid="dashboard-recent-automations-empty-cta"');
    expect(source).toContain("還沒有最近自動化");
    expect(source).toContain('href="/automations"');
    expect(source).toContain("建立自動化");
    expect(source).not.toContain("還沒有自動化。從預設回覆或私訊關鍵字回覆開始最順。");
  });

  it("keeps the account connection card focused on channel scope instead of mixing in contact quota wording", () => {
    expect(source).toContain("目前左側切到");
    expect(source).toContain("管理 IG 連線");
    expect(source).toContain("查看目前帳號的收件匣");
    expect(source).not.toContain("免費方案聯絡人用量");
  });
});
