import {
  billingAddons,
  billingPlans,
  formatTwd,
  getAddon,
  getPaidPlan,
  getPlan,
  getPlanAmount,
  isCashPayoutEligiblePlan,
  type BillingAddon,
  type BillingIntervalKey,
  type BillingPlan,
  type BillingPlanKey,
  type PlanEntitlements,
  type PlanLimit,
} from "@/lib/billing/plans";

export type BillingPlanLimits = {
  igAccounts: number | null;
  automations: PlanLimit;
  broadcasts: number;
  contacts: number;
  activeContacts: number;
  messageEvents: number;
  teamSeats: number;
  knowledgeBaseItems: number;
  webhookTriggers: number;
  conversationRetentionDays: number;
};

export const freePlanLimits: BillingPlanLimits = {
  igAccounts: null,
  automations: 3,
  broadcasts: 0,
  contacts: 300,
  activeContacts: 300,
  messageEvents: 3000,
  teamSeats: 1,
  knowledgeBaseItems: 10,
  webhookTriggers: 0,
  conversationRetentionDays: 7,
};

export function getBillingPlan(planKey: string) {
  const plan = getPlan(planKey);
  if (!plan) return null;
  const amount = plan.priceMonthly ?? 0;
  return {
    ...plan,
    amount,
    interval: "month" as const,
    limits: planToLegacyLimits(plan),
  };
}

export function planToLegacyLimits(plan: PlanEntitlements): BillingPlanLimits {
  return {
    igAccounts: null,
    automations: plan.automationsLimit,
    broadcasts: plan.broadcastsLimit,
    contacts: plan.activeContactsLimit,
    activeContacts: plan.activeContactsLimit,
    messageEvents: plan.messageEventsLimit,
    teamSeats: plan.teamSeatsLimit,
    knowledgeBaseItems: plan.knowledgeBaseItemsLimit,
    webhookTriggers: plan.webhookTriggerLimit,
    conversationRetentionDays: plan.conversationRetentionDays,
  };
}

export {
  billingAddons,
  billingPlans,
  formatTwd,
  getAddon,
  getPaidPlan,
  getPlan,
  getPlanAmount,
  isCashPayoutEligiblePlan,
};

export type {
  BillingAddon,
  BillingIntervalKey,
  BillingPlan,
  BillingPlanKey,
  PlanEntitlements,
  PlanLimit,
};
