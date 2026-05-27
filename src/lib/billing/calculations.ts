import {
  AFFILIATE_HOLD_DAYS,
  MAX_COMMISSION_RATE_PER_ORDER_PERCENT,
  MAX_TRIAL_DAYS,
  MAX_TRIAL_EVENTS,
  REFERRAL_CREDIT_RATE_PERCENT,
  TRIAL_EVENTS_PER_REFERRAL,
} from "@/lib/billing/plans";

export type InvoiceCalculationInput = {
  planAmount: number;
  addonAmount?: number;
  overageAmount?: number;
  setupFeeAmount?: number;
  couponDiscountAmount?: number;
  requestedCreditAmount?: number;
};

export type InvoiceCalculation = {
  subtotalAmount: number;
  discountAmount: number;
  creditUsedAmount: number;
  totalAmount: number;
  remainingCreditAmount: number;
};

export function calculateInvoice(input: InvoiceCalculationInput): InvoiceCalculation {
  const subtotalAmount =
    input.planAmount + (input.addonAmount || 0) + (input.overageAmount || 0) + (input.setupFeeAmount || 0);
  const discountAmount = Math.min(Math.max(input.couponDiscountAmount || 0, 0), subtotalAmount);
  const afterDiscount = Math.max(subtotalAmount - discountAmount, 0);
  const requestedCreditAmount = Math.max(input.requestedCreditAmount || 0, 0);
  const creditUsedAmount = Math.min(requestedCreditAmount, afterDiscount);
  const totalAmount = Math.max(afterDiscount - creditUsedAmount, 0);

  return {
    subtotalAmount,
    discountAmount,
    creditUsedAmount,
    totalAmount,
    remainingCreditAmount: requestedCreditAmount - creditUsedAmount,
  };
}

export function calculateReferralCredit(actualPaidAmount: number, creditsUsed = 0) {
  const base = Math.max(actualPaidAmount - creditsUsed, 0);
  if (base <= 0) return 0;
  return Math.floor((base * REFERRAL_CREDIT_RATE_PERCENT) / 100);
}

export function calculateCommission(params: {
  actualPaidAmount: number;
  refundAmount?: number;
  creditsUsed?: number;
  discounts?: number;
  commissionRatePercent: number;
}) {
  const commissionBase = Math.max(
    params.actualPaidAmount - (params.refundAmount || 0) - (params.creditsUsed || 0) - (params.discounts || 0),
    0,
  );
  const requested = Math.floor((commissionBase * params.commissionRatePercent) / 100);
  const cap = Math.floor((Math.max(params.actualPaidAmount, 0) * MAX_COMMISSION_RATE_PER_ORDER_PERCENT) / 100);
  return {
    commissionBase,
    commissionAmount: Math.min(requested, cap),
  };
}

export function addDays(date: Date, days: number) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function commissionHoldUntil(now = new Date()) {
  return addDays(now, AFFILIATE_HOLD_DAYS);
}

export function applyTrialReferralBonus(currentTrialDays: number, currentTrialEvents: number) {
  return {
    trialDays: Math.min(currentTrialDays + 1, MAX_TRIAL_DAYS),
    trialEvents: Math.min(currentTrialEvents + TRIAL_EVENTS_PER_REFERRAL, MAX_TRIAL_EVENTS),
  };
}
