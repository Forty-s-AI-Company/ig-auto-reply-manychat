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
});
