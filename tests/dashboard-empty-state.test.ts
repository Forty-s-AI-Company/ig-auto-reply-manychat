import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("dashboard recent message empty state", () => {
  const source = readFileSync(join(process.cwd(), "src/app/dashboard/page.tsx"), "utf8");

  it("uses release-aware CTAs without making mock-tester the primary onboarding path", () => {
    expect(source).toContain("recentMessagesEmptyState = simpleRelease");
    expect(source).toContain('href: connectedInstagramChannels > 0 ? "/inbox" : "/channels/connect"');
    expect(source).toContain('label: connectedInstagramChannels > 0 ? "查看收件匣" : "連接 Instagram"');
    expect(source).toContain('data-testid="dashboard-recent-messages-empty-secondary-cta"');
    expect(source).toContain("需要快速驗證時，改用測試工具");
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

  it("keeps the top primary CTA aligned with onboarding stage instead of defaulting straight to broadcasts", () => {
    expect(source).toContain("const primaryDashboardAction =");
    expect(source).toContain('href: "/channels/connect"');
    expect(source).toContain('label: "連接 IG"');
    expect(source).toContain('href: "/inbox"');
    expect(source).toContain('label: "查看收件匣"');
    expect(source).toContain('href: "/broadcasts"');
    expect(source).toContain('label: "新增廣播"');
    expect(source).toContain("PrimaryDashboardActionIcon");
  });

  it("keeps dashboard action links keyboard visible and decorative icons quiet", () => {
    expect(source).toContain("focus-visible:ring-2 focus-visible:ring-[var(--primary)]");
    expect(source).toContain("focus-visible:ring-inset");
    expect(source).toContain('<PrimaryDashboardActionIcon className="h-4 w-4" aria-hidden="true" />');
    expect(source).toContain('<Inbox className="h-4 w-4" aria-hidden="true" />');
    expect(source).toContain('<ArrowRight className="h-4 w-4 text-[var(--text-muted)]" aria-hidden="true" />');
  });

  it("labels gated affiliate routes as referral credit instead of cash affiliate marketing", () => {
    expect(source).toContain('affiliate: "推薦折抵"');
    expect(source).not.toContain('affiliate: "聯盟行銷"');
  });
});
