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
    const batchCreateSource = readFileSync("src/components/AdminPayoutBatchCreateForm.tsx", "utf8");

    expect(affiliateSource).toContain("待審核");
    expect(affiliateSource).toContain("目前沒有受控聯盟申請");
    expect(affiliateSource).toContain("付款資料審核狀態");
    expect(affiliateSource).not.toContain("分潤資格");
    expect(affiliateSource).not.toContain("尚未填寫銀行資料");
    expect(payoutSource).toContain("受控分潤審核");
    expect(payoutSource).toContain("目前沒有待審核的分潤紀錄");
    expect(payoutSource).toContain("max-w-56 break-all");
    expect(batchSource).toContain("AdminPayoutBatchCreateForm");
    expect(batchCreateSource).toContain("建立內部對帳批次");
    expect(batchCreateSource).toContain("不會觸發銀行匯款、PayUNI 付款或現金提領");
    expect(batchSource).toContain("目前還沒有內部對帳批次");
    expect(batchSource).toContain("待匯出對帳");
    expect(batchSource).not.toContain("已付款");
    expect(batchSource).not.toContain("付款失敗");
  });
});
