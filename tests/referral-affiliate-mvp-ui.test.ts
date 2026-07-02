import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

function read(path: string) {
  return readFileSync(path, "utf8");
}

describe("referral and affiliate MVP UX guards", () => {
  it("keeps referrals from showing fake click metrics or raw status enums", () => {
    const source = read("src/app/referrals/page.tsx");

    expect(source).toContain("推薦折抵制度 v1");
    expect(source).toContain("受控開通");
    expect(source).toContain("不顯示假點擊數");
    expect(source).toContain("待確認折抵");
    expect(source).toContain("可用折抵");
    expect(source).toContain("受控付款");
    expect(source).toContain("referralStatusLabel");
    expect(source).toContain("ReferralLinkCopyButton");
    expect(source).toContain('data-testid="referrals-url"');
    expect(source).toContain("7 天退款觀察期");
    expect(source).toContain("30 天內要使用");
    expect(source).toContain("formatReferralDate");
    expect(source).toContain("break-all");
    expect(source).not.toContain("<span>{item.status}</span>");
    expect(source).not.toContain("現金提領");
    expect(source).not.toContain("toLocaleDateString");
  });

  it("keeps affiliate cash payout behind a controlled-opening gate", () => {
    const source = read("src/app/affiliate/page.tsx");
    const serviceSource = read("src/lib/billing/affiliate-service.ts");
    const payoutServiceSource = read("src/lib/billing/payout-service.ts");

    expect(source).toContain("受控聯盟後續開放");
    expect(source).toContain("正式產品主線目前以推薦折抵為主");
    expect(source).toContain("目前不開放受控付款");
    expect(source).toContain("內部可審核金額");
    expect(source).toContain("不代表會自動匯款");
    expect(source).toContain("分潤安全規則");
    expect(source).toContain("內部計算紀錄");
    expect(source).not.toContain("現金分潤後續開放");
    expect(source).not.toContain("現金提領後續開放");
    expect(source).not.toContain("重新開啟現金分潤");
    expect(serviceSource).toContain("內部可審核佣金尚未達");
    expect(serviceSource).toContain("受控聯盟付款資料尚未完整送審");
    expect(serviceSource).toContain("Creator 以上付費方案才能申請受控聯盟付款");
    expect(payoutServiceSource).toContain("內部可審核餘額不足");
    expect(payoutServiceSource).toContain("受控聯盟審核通過後才能建立付款申請");
    expect(payoutServiceSource).not.toContain("可提領餘額不足");
    expect(payoutServiceSource).not.toContain("申請提領");
    expect(serviceSource).not.toContain("可提領佣金");
  });

  it("gives admin operators approve and reject controls for payout requests", () => {
    const source = read("src/app/admin/payouts/page.tsx");

    expect(source).toContain("/approve");
    expect(source).toContain("/reject");
    expect(source).toContain("分潤審核（內部）");
    expect(source).toContain("內部保留的受控分潤審核面板");
    expect(source).toContain("不會觸發銀行匯款、金流付款或現金提領");
    expect(source).toContain("核准進入對帳");
    expect(source).toContain("退回申請");
    expect(source).toContain("表格可左右滑動查看 Email、金額、狀態與操作");
    expect(source).not.toContain("提領管理");
    expect(source).not.toContain("已付款");
    expect(source).not.toContain("付款失敗");
  });

  it("keeps admin payout batches as internal reconciliation instead of payment execution", () => {
    const source = read("src/app/admin/payouts/batches/page.tsx");

    expect(source).toContain("分潤對帳批次");
    expect(source).toContain("建立內部對帳批次");
    expect(source).toContain("不會觸發銀行匯款、PayUNI 付款或現金提領");
    expect(source).toContain("下載對帳 CSV");
    expect(source).toContain("下載內部對帳 CSV，不會執行付款");
    expect(source).toContain("表格可左右滑動查看批次 ID、金額與匯出操作");
    expect(source).not.toContain("建立付款批次");
    expect(source).not.toContain("產生本月 15 日批次");
    expect(source).not.toContain("目前還沒有提領批次");
  });
});
