import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("analytics empty state CTA", () => {
  const source = readFileSync(join(process.cwd(), "src/app/analytics/page.tsx"), "utf8");

  it("routes recent message empty states to a concrete next step", () => {
    expect(source).toContain('testId="analytics-empty-messages-cta"');
    expect(source).toContain('actionLabel={analytics.connectedInstagramChannels > 0 ? "查看收件匣" : "連接 Instagram"}');
    expect(source).toContain('actionHref={analytics.connectedInstagramChannels > 0 ? "/inbox" : "/channels/connect"}');
  });

  it("routes automation empty states to automations instead of leaving a dead-end hint", () => {
    expect(source).toContain('testId="analytics-empty-automations-cta"');
    expect(source).toContain('actionHref="/automations"');
    expect(source).toContain('actionLabel="建立第一個流程"');
  });

  it("keeps analytics CTAs keyboard-visible and stable for smoke tests", () => {
    expect(source).toContain('data-testid="analytics-state-banner-action"');
    expect(source).toContain('data-testid="analytics-broadcast-open"');
    expect(source).toContain("focus-visible:ring-2 focus-visible:ring-[var(--primary)]");
    expect(source).toContain('<Compass className="h-4 w-4" aria-hidden="true" />');
    expect(source).toContain('<Megaphone className="h-4 w-4" aria-hidden="true" />');
  });

  it("shows a visible simple-release reason for disabled broadcast management", () => {
    expect(source).toContain('aria-describedby="analytics-broadcast-gate-reason"');
    expect(source).toContain('id="analytics-broadcast-gate-reason"');
    expect(source).toContain("目前 simple release 先保留分析讀取，不開放廣播管理。");
  });
});
