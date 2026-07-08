import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

function read(path: string) {
  return readFileSync(path, "utf8");
}

describe("referral and affiliate MVP UX guards", () => {
  it("keeps referrals from showing fake click metrics or raw status enums", () => {
    const source = read("src/app/referrals/page.tsx");

    expect(source).toContain("推薦折抵制度 v1");
    expect(source).toContain("逐步開放");
    expect(source).toContain("推薦折抵");
    expect(source).toContain("推薦成效概況");
    expect(source).toContain("先看這一輪推薦帶來的註冊、啟用與折抵進度");
    expect(source).toContain("不顯示假點擊數");
    expect(source).toContain("待確認折抵");
    expect(source).toContain("可用折抵");
    expect(source).not.toContain("受控付款");
    expect(source).toContain("referralStatusLabel");
    expect(source).toContain("ReferralLinkCopyButton");
    expect(source).toContain('data-testid="referrals-url"');
    expect(source).toContain("grid grid-cols-2 gap-4 md:grid-cols-4");
    expect(source).toContain("grid items-start gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(360px,0.85fr)]");
    expect(source).toContain("7 天退款觀察期");
    expect(source).toContain("30 天內要使用");
    expect(source).toContain("折抵金錢包會在後續版本開放");
    expect(source).not.toContain("Full release");
    expect(source).not.toContain("Simple release");
    expect(source).not.toContain("simple release");
    expect(source).toContain("查看方案與用量");
    expect(source).toContain('data-testid="referrals-open-wallet"');
    expect(source).toContain('data-testid="referrals-open-billing"');
    expect(source).toContain("快速前往");
    expect(source).toContain("grid w-full grid-cols-1 gap-2 sm:w-auto sm:grid-cols-2");
    expect(source).toContain("inline-flex h-8 items-center justify-center rounded-md border border-[var(--border-soft)] bg-white px-3");
    expect(source).toContain("focus-visible:ring-2 focus-visible:ring-[var(--primary)]");
    expect(source).toContain("若你想確認折抵何時可用");
    expect(source).toContain('data-testid="referrals-empty-open-billing"');
    expect(source).toContain('data-testid="referrals-empty-open-wallet"');
    expect(source).toContain("這裡會顯示實際帶入推薦碼後的註冊名單");
    expect(source).toContain("不顯示無法驗證的假點擊或虛構轉換數字");
    expect(source).toContain("名稱");
    expect(source).toContain("Email");
    expect(source).toContain("建立時間");
    expect(source).toContain("inline-flex w-fit rounded-full border border-[var(--border-soft)] bg-[var(--ip-surface-muted)]");
    expect(source).toContain("formatReferralDate");
    expect(source).toContain("break-all");
    expect(source).not.toContain("<span>{item.status}</span>");
    expect(source).not.toContain("現金提領");
    expect(source).not.toContain("toLocaleDateString");

    const copyButtonSource = read("src/components/ReferralLinkCopyButton.tsx");
    expect(copyButtonSource).toContain('role="alert"');
    expect(copyButtonSource).toContain("瀏覽器暫時不允許自動複製");
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
    expect(source).toContain("目前正式可用主線");
    expect(source).toContain('data-testid="affiliate-open-referrals"');
    expect(source).toContain('data-testid="affiliate-open-wallet"');
    expect(source).toContain('data-testid="affiliate-open-billing"');
    expect(source).toContain('aria-describedby="affiliate-apply-disabled-reason"');
    expect(source).toContain('id="affiliate-apply-disabled-reason"');
    expect(source).toContain("title={applyHelp}");
    expect(source).toContain("focus-visible:ring-2 focus-visible:ring-[var(--primary)]");
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
    const decisionSource = read("src/components/AdminPayoutDecisionButtons.tsx");

    expect(decisionSource).toContain("/approve");
    expect(decisionSource).toContain("/reject");
    expect(source).toContain("分潤審核（內部）");
    expect(source).toContain("內部保留的受控分潤審核面板");
    expect(source).toContain("不會觸發銀行匯款、金流付款或現金提領");
    expect(source).toContain("AdminPayoutDecisionButtons");
    expect(decisionSource).toContain("確認核准進入對帳？");
    expect(decisionSource).toContain("確認退回分潤申請？");
    expect(decisionSource).toContain("核准進入對帳");
    expect(decisionSource).toContain("退回申請");
    expect(decisionSource).toContain('role="dialog"');
    expect(decisionSource).toContain('aria-modal="true"');
    expect(decisionSource).toContain('data-testid="admin-payout-decision-dialog"');
    expect(decisionSource).toContain("不會自動匯款");
    expect(decisionSource).toContain("不會執行金流、匯款或提款動作");
    expect(decisionSource).not.toContain("window.confirm");
    expect(source).toContain("表格可左右滑動查看 Email、金額、狀態與操作");
    expect(source).not.toContain("提領管理");
    expect(source).not.toContain("已付款");
    expect(source).not.toContain("付款失敗");
  });

  it("keeps admin payout batches as internal reconciliation instead of payment execution", () => {
    const source = read("src/app/admin/payouts/batches/page.tsx");
    const createFormSource = read("src/components/AdminPayoutBatchCreateForm.tsx");
    const exportButtonSource = read("src/components/AdminPayoutBatchExportButton.tsx");

    expect(source).toContain("分潤對帳批次");
    expect(source).toContain("AdminPayoutBatchCreateForm");
    expect(source).toContain("AdminPayoutBatchExportButton");
    expect(createFormSource).toContain("建立內部對帳批次");
    expect(createFormSource).toContain("不會觸發銀行匯款、PayUNI 付款或現金提領");
    expect(createFormSource).toContain('role="dialog"');
    expect(createFormSource).toContain('aria-modal="true"');
    expect(createFormSource).toContain('data-testid="admin-payout-batch-create-dialog"');
    expect(createFormSource).toContain('data-testid="admin-payout-batch-create-confirm"');
    expect(exportButtonSource).toContain("下載對帳 CSV");
    expect(exportButtonSource).toContain("下載內部對帳 CSV，不會執行付款");
    expect(exportButtonSource).toContain('data-testid="admin-payout-batch-export-dialog"');
    expect(exportButtonSource).toContain('data-testid="admin-payout-batch-export-confirm"');
    expect(source).toContain("表格可左右滑動查看批次 ID、金額與匯出操作");
    expect(createFormSource).not.toContain("window.confirm");
    expect(exportButtonSource).not.toContain("window.confirm");
    expect(source).not.toContain("建立付款批次");
    expect(source).not.toContain("產生本月 15 日批次");
    expect(source).not.toContain("目前還沒有提領批次");
  });
});
