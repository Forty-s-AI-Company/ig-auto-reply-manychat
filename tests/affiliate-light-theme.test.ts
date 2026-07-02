import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const source = readFileSync("src/app/affiliate/page.tsx", "utf8");

describe("affiliate page light theme", () => {
  it("keeps the affiliate surface aligned with the light dashboard system", () => {
    expect(source).toContain("ip-dashboard-card");
    expect(source).toContain("border-[var(--border-soft)]");
    expect(source).toContain("bg-white");
    expect(source).toContain("overflow-x-auto");
    expect(source).not.toMatch(/bg-zinc-9|bg-zinc-8|border-zinc-8|border-zinc-7|text-zinc-100|text-zinc-200|text-zinc-300|text-cyan-300/);
  });

  it("uses clear eligibility and commission messaging instead of raw states", () => {
    expect(source).toContain("canApplyAffiliate");
    expect(source).toContain("disabled={applyDisabled}");
    expect(source).toContain("目前僅開放折抵金");
    expect(source).toContain("Simple release 仍以推薦活動與折抵金為主");
    expect(source).toContain("commissionStatusLabel");
    expect(source).not.toContain("可提領佣金");
    expect(source).not.toContain("提領申請中");
    expect(source).not.toContain("not_applied");
    expect(source).not.toContain("toLocaleDateString");
  });
});
