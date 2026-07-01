import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const files = [
  "src/app/admin/affiliates/page.tsx",
  "src/app/admin/payouts/page.tsx",
  "src/app/admin/payouts/batches/page.tsx",
];

describe("admin affiliate and payout light-theme polish", () => {
  it("keeps affiliate and payout admin pages aligned with the light dashboard surface", () => {
    for (const file of files) {
      const source = readFileSync(file, "utf8");

      expect(source).toContain("ip-dashboard-card");
      expect(source).toContain("border-[var(--border-soft)]");
      expect(source).toContain("bg-[var(--ip-surface-muted)]");
      expect(source).not.toMatch(/bg-zinc-9|border-zinc-8|border-zinc-7|text-zinc-100|text-zinc-200|text-cyan-300|bg-cyan-500/);
    }
  });

  it("uses user-facing Chinese status and empty-state copy instead of raw list rows", () => {
    const affiliateSource = readFileSync("src/app/admin/affiliates/page.tsx", "utf8");
    const payoutSource = readFileSync("src/app/admin/payouts/page.tsx", "utf8");
    const batchSource = readFileSync("src/app/admin/payouts/batches/page.tsx", "utf8");

    expect(affiliateSource).toContain("待審核");
    expect(affiliateSource).toContain("目前沒有聯盟申請");
    expect(payoutSource).toContain("提領申請");
    expect(payoutSource).toContain("目前沒有待處理的提領申請");
    expect(batchSource).toContain("建立付款批次");
    expect(batchSource).toContain("目前還沒有提領批次");
  });
});
