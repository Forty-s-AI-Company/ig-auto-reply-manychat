import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const referralRules = readFileSync("docs/referral-affiliate/REFERRAL_RULES.md", "utf8");
const affiliateRules = readFileSync("docs/referral-affiliate/AFFILIATE_RULES.md", "utf8");
const billingPlans = readFileSync("docs/billing/PLANS.md", "utf8");

describe("referral and affiliate rule docs", () => {
  it("keeps referral credits aligned with the non-cash v1 lifecycle", () => {
    expect(referralRules).toContain("不可提現");
    expect(referralRules).toContain("超過 7 天退款觀察期");
    expect(referralRules).toContain("30 天內要使用");
    expect(referralRules).toContain("clawback / debit");
    expect(referralRules).not.toContain("折抵金有效期限 180 天");
    expect(referralRules).not.toContain("剩餘折抵金留到下月");
  });

  it("keeps cash affiliate payout documented as a controlled future operation", () => {
    expect(affiliateRules).toContain("目前公開產品主線是「推薦折抵制度 v1」");
    expect(affiliateRules).toContain("不代表已對使用者開放提領");
    expect(affiliateRules).toContain("正式開放前必須完成法務");
    expect(affiliateRules).toContain("只代表內部可審核");
    expect(affiliateRules).not.toContain("Starter 不能申請現金提領，只能拿折抵金");
  });

  it("keeps plan docs from promising public cash commission on add-ons", () => {
    expect(billingPlans).toContain("推薦折抵制度 v1 只承諾折抵方案費");
    expect(billingPlans).toContain("維持受控開通");
    expect(billingPlans).not.toContain("也可產生聯盟分潤");
  });
});
