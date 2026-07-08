import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const source = readFileSync("src/app/wallet/page.tsx", "utf8");

describe("wallet page light theme", () => {
  it("keeps the wallet surface aligned with the light dashboard system", () => {
    expect(source).toContain("ip-dashboard-card");
    expect(source).toContain("border-[var(--border-soft)]");
    expect(source).toContain("bg-white");
    expect(source).toContain("overflow-x-auto");
    expect(source).toContain("折抵使用提醒");
    expect(source).toContain("折抵概況");
    expect(source).toContain("先看目前可用、待確認與已使用折抵的總覽");
    expect(source).toContain("下一筆可用時間");
    expect(source).toContain("下一筆到期時間");
    expect(source).toContain("快速前往");
    expect(source).toContain("grid w-full grid-cols-1 gap-2 sm:w-auto sm:grid-cols-2");
    expect(source).toContain("items-center justify-center");
    expect(source).toContain("目前還沒有折抵金紀錄");
    expect(source).not.toMatch(/bg-zinc-9|bg-zinc-8|border-zinc-8|border-zinc-7|text-zinc-100|text-zinc-200|text-zinc-300|text-cyan-300/);
  });

  it("uses semantic ledger table labels instead of raw dark list rows", () => {
    expect(source).toContain("<table");
    expect(source).toContain('scope="col"');
    expect(source).toContain("待確認折抵金");
    expect(source).toContain("ledgerStatusLabel");
    expect(source).toContain("內部審核中");
    expect(source).toContain("待確認折抵會取消");
    expect(source).toContain("已使用折抵會以沖回紀錄抵銷");
    expect(source).toContain('data-testid="wallet-open-referrals"');
    expect(source).toContain('data-testid="wallet-open-billing"');
    expect(source).toContain("查看推薦活動");
    expect(source).toContain("查看方案與用量");
    expect(source).toContain("focus-visible:ring-2 focus-visible:ring-[var(--primary)]");
    expect(source).toContain("直接使用上方的快速操作即可");
    expect(source).toContain("完成推薦活動或帳單折抵後，這裡會顯示入帳、待確認、到期失效與實際折抵明細。");
    expect(source).not.toContain("提領申請中");
    expect(source).not.toContain("已提領");
    expect(source).not.toContain("Pending");
    expect(source).not.toContain("toLocaleDateString");
  });
});
