import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const source = readFileSync("src/app/wallet/page.tsx", "utf8");

describe("wallet page light theme", () => {
  it("keeps the wallet surface aligned with the light dashboard system", () => {
    expect(source).toContain("ip-dashboard-card");
    expect(source).toContain("border-[var(--border-soft)]");
    expect(source).toContain("bg-white");
    expect(source).toContain("overflow-x-auto");
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
    expect(source).toContain("上方保留了「查看推薦活動」與「查看方案與用量」");
    expect(source).not.toContain("提領申請中");
    expect(source).not.toContain("已提領");
    expect(source).not.toContain("Pending");
    expect(source).not.toContain("toLocaleDateString");
  });
});
