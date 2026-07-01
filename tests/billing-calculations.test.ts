import { describe, expect, it } from "vitest";
import {
  applyTrialReferralBonus,
  calculateCommission,
  calculateInvoice,
  calculateReferralCredit,
} from "@/lib/billing/calculations";
import { affiliateCommissionRatePercent } from "@/lib/billing/affiliate-service";
import {
  MIN_PAYOUT_AMOUNT_TWD,
  REFERRAL_CREDIT_EXPIRES_DAYS,
  REFERRAL_CREDIT_PENDING_DAYS,
} from "@/lib/billing/plans";

describe("billing calculations", () => {
  it("does not allow credits to make invoice total negative", () => {
    const invoice = calculateInvoice({ planAmount: 599, addonAmount: 99, requestedCreditAmount: 1000 });
    expect(invoice.totalAmount).toBe(0);
    expect(invoice.creditUsedAmount).toBe(698);
    expect(invoice.remainingCreditAmount).toBe(302);
  });

  it("does not create referral credit when actual paid amount is zero", () => {
    expect(calculateReferralCredit(0)).toBe(0);
  });

  it("caps trial bonuses", () => {
    const bonus = applyTrialReferralBonus(20, 7000);
    expect(bonus.trialDays).toBe(20);
    expect(bonus.trialEvents).toBe(7000);
  });

  it("uses Partner / Silver / Gold rates and caps commission at 40 percent of paid amount", () => {
    expect(affiliateCommissionRatePercent("partner")).toBe(10);
    expect(affiliateCommissionRatePercent("silver")).toBe(15);
    expect(affiliateCommissionRatePercent("gold")).toBe(20);
    expect(calculateCommission({ actualPaidAmount: 1000, commissionRatePercent: 80 }).commissionAmount).toBe(400);
  });

  it("keeps minimum payout at NT$1000", () => {
    expect(MIN_PAYOUT_AMOUNT_TWD).toBe(1000);
  });

  it("keeps referral credits pending for 7 days and expiring after 30 days once available", () => {
    expect(REFERRAL_CREDIT_PENDING_DAYS).toBe(7);
    expect(REFERRAL_CREDIT_EXPIRES_DAYS).toBe(30);
  });
});
