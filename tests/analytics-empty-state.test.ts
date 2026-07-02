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
});
