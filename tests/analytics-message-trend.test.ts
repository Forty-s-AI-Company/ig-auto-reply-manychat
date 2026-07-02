import { describe, expect, it } from "vitest";
import { buildMessageTrendPoints } from "@/lib/dashboard-summary";
import { readFileSync } from "node:fs";
import { join } from "node:path";

describe("analytics message trend", () => {
  it("groups messages into the latest seven UTC days", () => {
    const points = buildMessageTrendPoints(
      [
        { createdAt: new Date("2026-06-26T23:59:59.000Z") },
        { createdAt: new Date("2026-06-27T00:01:00.000Z") },
        { createdAt: new Date("2026-06-27T12:00:00.000Z") },
        { createdAt: new Date("2026-07-02T08:30:00.000Z") },
      ],
      new Date("2026-07-02T12:00:00.000Z"),
    );

    expect(points).toEqual([
      { date: "2026-06-26", label: "6/26", messages: 1 },
      { date: "2026-06-27", label: "6/27", messages: 2 },
      { date: "2026-06-28", label: "6/28", messages: 0 },
      { date: "2026-06-29", label: "6/29", messages: 0 },
      { date: "2026-06-30", label: "6/30", messages: 0 },
      { date: "2026-07-01", label: "7/1", messages: 0 },
      { date: "2026-07-02", label: "7/2", messages: 1 },
    ]);
  });

  it("uses the Recharts component instead of the previous text-only placeholder", () => {
    const page = readFileSync(join(process.cwd(), "src/app/analytics/page.tsx"), "utf8");
    const chart = readFileSync(join(process.cwd(), "src/components/AnalyticsMessageTrendChart.tsx"), "utf8");

    expect(page).toContain("AnalyticsMessageTrendChart");
    expect(page).not.toContain("這裡先不畫假圖表");
    expect(chart).toContain("ResponsiveContainer");
    expect(chart).toContain("LineChart");
    expect(chart).toContain('data-testid="analytics-message-trend-chart"');
  });
});
