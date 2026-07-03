import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const source = readFileSync("src/app/billing/page.tsx", "utf8");

describe("billing page status copy", () => {
  it("renders invoice and PayUNI order statuses as user-facing Chinese labels", () => {
    expect(source).toContain("invoiceStatusLabel");
    expect(source).toContain("paymentStatusLabel");
    expect(source).toContain("已退款");
    expect(source).toContain("待付款");
    expect(source).toContain("付款失敗");
    expect(source).toContain("退款，推薦折抵會依規則取消或沖回");
    expect(source).toContain("前往 PayUNI Sandbox 月繳");
    expect(source).toContain("這會前往 PayUNI Sandbox 測試站，不會進入正式扣款。");
    expect(source).toContain("客製方案需要由管理員手動開通；請先聯絡我們確認用量、折抵與付款安排。");
    expect(source).toContain("aria-describedby={checkoutReasonId}");
    expect(source).toContain("id={checkoutReasonId}");
    expect(source).toContain("focus-visible:ring-2 focus-visible:ring-[var(--primary)]");
    expect(source).toContain("待確認折抵會取消");
    expect(source).toContain("已使用後才退款，會以沖回紀錄抵銷");
    expect(source).toContain("查看推薦活動");
    expect(source).toContain("查看折抵明細");
    expect(source).toContain("transition hover:bg-[var(--ip-surface-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2");
    expect(source).toContain("addonDisplayName");
    expect(source).toContain("對話保留 +180 天");
    expect(source).toContain("+5,000 訊息事件");
    expect(source).toContain("+1 個團隊席位");
    expect(source).not.toContain("{addon.name}");
    expect(source).not.toContain("<span>{invoice.status}</span>");
    expect(source).not.toContain("<span>{order.status}</span>");
  });
});
