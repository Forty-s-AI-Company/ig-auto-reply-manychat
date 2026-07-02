export type BillingIntervalKey = "month" | "year";

export type BillingPlanKey = "trial" | "starter" | "creator" | "pro" | "business" | "agency";

export type PlanLimit = number | null;

export type PlanEntitlements = {
  activeContactsLimit: number;
  messageEventsLimit: number;
  automationsLimit: PlanLimit;
  keywordsLimit: PlanLimit;
  broadcastsLimit: number;
  teamSeatsLimit: number;
  conversationRetentionDays: number;
  knowledgeBaseItemsLimit: number;
  webhookTriggerLimit: number;
  apiAccess: boolean;
  prioritySupport: boolean;
  onboardingSessionIncluded?: boolean;
  affiliateCashPayoutEligible: boolean;
};

export type BillingPlan = PlanEntitlements & {
  key: BillingPlanKey;
  name: string;
  description: string;
  priceMonthly: number | null;
  priceYearly?: number | null;
  customSales?: boolean;
  features: string[];
};

export type AddonType = "message_events" | "active_contacts" | "team_seats" | "retention";

export type BillingAddon = {
  key: string;
  type: AddonType;
  name: string;
  priceMonthly: number;
  quantity: number;
  appliesTo: keyof Pick<
    PlanEntitlements,
    "messageEventsLimit" | "activeContactsLimit" | "teamSeatsLimit" | "conversationRetentionDays"
  >;
  commissionRatePercent: number;
};

export const TRIAL_DAYS = 7;
export const MAX_TRIAL_DAYS = 20;
export const TRIAL_EVENTS_PER_REFERRAL = 300;
export const MAX_TRIAL_EVENTS = 7000;
export const REFERRAL_CREDIT_RATE_PERCENT = 30;
export const REFERRAL_CREDIT_PENDING_DAYS = 7;
export const REFERRAL_CREDIT_EXPIRES_DAYS = 30;
export const AFFILIATE_HOLD_DAYS = 30;
export const MIN_PAYOUT_AMOUNT_TWD = 1000;
export const MAX_COMMISSION_RATE_PER_ORDER_PERCENT = 40;

export const billingPlans: readonly BillingPlan[] = [
  {
    key: "trial",
    name: "Trial",
    description: "免費 7 天試用，適合先驗證 IG 自動回覆流程。",
    priceMonthly: 0,
    priceYearly: 0,
    activeContactsLimit: 300,
    messageEventsLimit: 3000,
    automationsLimit: 3,
    keywordsLimit: 20,
    broadcastsLimit: 0,
    teamSeatsLimit: 1,
    conversationRetentionDays: 7,
    knowledgeBaseItemsLimit: 10,
    webhookTriggerLimit: 0,
    apiAccess: false,
    prioritySupport: false,
    affiliateCashPayoutEligible: false,
    features: ["7 天免費試用", "300 active contacts", "3,000 message events", "AI 可用，但需自接 API Key"],
  },
  {
    key: "starter",
    name: "Starter",
    description: "給剛開始經營 IG 自動回覆的個人品牌。",
    priceMonthly: 199,
    priceYearly: 1990,
    activeContactsLimit: 500,
    messageEventsLimit: 5000,
    automationsLimit: 10,
    keywordsLimit: 50,
    broadcastsLimit: 1,
    teamSeatsLimit: 1,
    conversationRetentionDays: 30,
    knowledgeBaseItemsLimit: 50,
    webhookTriggerLimit: 0,
    apiAccess: false,
    prioritySupport: false,
    affiliateCashPayoutEligible: false,
    features: ["500 active contacts", "5,000 message events", "10 條自動化", "推薦只能拿折抵金"],
  },
  {
    key: "creator",
    name: "Creator",
    description: "給創作者與小型團隊，支援更完整的自動化與推薦折抵追蹤。",
    priceMonthly: 599,
    priceYearly: 5990,
    activeContactsLimit: 3000,
    messageEventsLimit: 30000,
    automationsLimit: null,
    keywordsLimit: null,
    broadcastsLimit: 5,
    teamSeatsLimit: 2,
    conversationRetentionDays: 90,
    knowledgeBaseItemsLimit: 300,
    webhookTriggerLimit: 1000,
    apiAccess: false,
    prioritySupport: false,
    affiliateCashPayoutEligible: true,
    features: ["3,000 active contacts", "30,000 message events", "自動化與關鍵字不限", "推薦折抵成效面板"],
  },
  {
    key: "pro",
    name: "Pro",
    description: "給成熟品牌與高頻互動帳號，適合把推薦折抵當成成長工具。",
    priceMonthly: 1199,
    priceYearly: 11990,
    activeContactsLimit: 10000,
    messageEventsLimit: 100000,
    automationsLimit: null,
    keywordsLimit: null,
    broadcastsLimit: 20,
    teamSeatsLimit: 5,
    conversationRetentionDays: 180,
    knowledgeBaseItemsLimit: 1000,
    webhookTriggerLimit: 10000,
    apiAccess: true,
    prioritySupport: true,
    affiliateCashPayoutEligible: true,
    features: ["10,000 active contacts", "100,000 message events", "API access", "優先支援"],
  },
  {
    key: "business",
    name: "Business",
    description: "給多成員營運團隊與顧問服務商，支援更完整的用量與折抵管理。",
    priceMonthly: 2399,
    priceYearly: 23990,
    activeContactsLimit: 30000,
    messageEventsLimit: 300000,
    automationsLimit: null,
    keywordsLimit: null,
    broadcastsLimit: 100,
    teamSeatsLimit: 10,
    conversationRetentionDays: 365,
    knowledgeBaseItemsLimit: 5000,
    webhookTriggerLimit: 50000,
    apiAccess: true,
    prioritySupport: true,
    onboardingSessionIncluded: true,
    affiliateCashPayoutEligible: true,
    features: ["30,000 active contacts", "300,000 message events", "導入諮詢", "大型營運限制"],
  },
  {
    key: "agency",
    name: "Agency",
    description: "客製用量與人工開通，適合代理商與大型品牌。",
    priceMonthly: null,
    priceYearly: null,
    customSales: true,
    activeContactsLimit: 100000,
    messageEventsLimit: 1000000,
    automationsLimit: null,
    keywordsLimit: null,
    broadcastsLimit: 500,
    teamSeatsLimit: 50,
    conversationRetentionDays: 365,
    knowledgeBaseItemsLimit: 20000,
    webhookTriggerLimit: 250000,
    apiAccess: true,
    prioritySupport: true,
    onboardingSessionIncluded: true,
    affiliateCashPayoutEligible: true,
    features: ["100,000 active contacts 起", "1,000,000 message events 起", "後台手動開通", "客製合約"],
  },
] as const;

export const billingAddons: readonly BillingAddon[] = [
  { key: "events_5000", type: "message_events", name: "+5,000 Message Events", priceMonthly: 99, quantity: 5000, appliesTo: "messageEventsLimit", commissionRatePercent: 10 },
  { key: "events_20000", type: "message_events", name: "+20,000 Message Events", priceMonthly: 299, quantity: 20000, appliesTo: "messageEventsLimit", commissionRatePercent: 10 },
  { key: "events_50000", type: "message_events", name: "+50,000 Message Events", priceMonthly: 599, quantity: 50000, appliesTo: "messageEventsLimit", commissionRatePercent: 10 },
  { key: "events_100000", type: "message_events", name: "+100,000 Message Events", priceMonthly: 999, quantity: 100000, appliesTo: "messageEventsLimit", commissionRatePercent: 10 },
  { key: "events_500000", type: "message_events", name: "+500,000 Message Events", priceMonthly: 3999, quantity: 500000, appliesTo: "messageEventsLimit", commissionRatePercent: 10 },
  { key: "contacts_1000", type: "active_contacts", name: "+1,000 Active Contacts", priceMonthly: 99, quantity: 1000, appliesTo: "activeContactsLimit", commissionRatePercent: 10 },
  { key: "contacts_5000", type: "active_contacts", name: "+5,000 Active Contacts", priceMonthly: 399, quantity: 5000, appliesTo: "activeContactsLimit", commissionRatePercent: 10 },
  { key: "contacts_10000", type: "active_contacts", name: "+10,000 Active Contacts", priceMonthly: 699, quantity: 10000, appliesTo: "activeContactsLimit", commissionRatePercent: 10 },
  { key: "contacts_50000", type: "active_contacts", name: "+50,000 Active Contacts", priceMonthly: 2999, quantity: 50000, appliesTo: "activeContactsLimit", commissionRatePercent: 10 },
  { key: "seat_1", type: "team_seats", name: "+1 Team Seat", priceMonthly: 99, quantity: 1, appliesTo: "teamSeatsLimit", commissionRatePercent: 10 },
  { key: "seats_5", type: "team_seats", name: "+5 Team Seats", priceMonthly: 399, quantity: 5, appliesTo: "teamSeatsLimit", commissionRatePercent: 10 },
  { key: "retention_180", type: "retention", name: "Retention +180 days", priceMonthly: 299, quantity: 180, appliesTo: "conversationRetentionDays", commissionRatePercent: 10 },
  { key: "retention_365", type: "retention", name: "Retention +365 days", priceMonthly: 599, quantity: 365, appliesTo: "conversationRetentionDays", commissionRatePercent: 10 },
] as const;

export function getPlan(planKey: string | null | undefined) {
  return billingPlans.find((plan) => plan.key === planKey) || null;
}

export function getPaidPlan(planKey: string | null | undefined) {
  const plan = getPlan(planKey);
  if (!plan || plan.key === "trial" || plan.customSales) return null;
  return plan;
}

export function getAddon(addonKey: string | null | undefined) {
  return billingAddons.find((addon) => addon.key === addonKey) || null;
}

export function getPlanAmount(planKey: string, interval: BillingIntervalKey) {
  const plan = getPlan(planKey);
  if (!plan || plan.customSales) return null;
  return interval === "year" ? (plan.priceYearly ?? null) : plan.priceMonthly;
}

export function isCashPayoutEligiblePlan(planKey: string | null | undefined) {
  return Boolean(getPlan(planKey)?.affiliateCashPayoutEligible);
}

export function formatTwd(amount: number) {
  return new Intl.NumberFormat("zh-TW", {
    style: "currency",
    currency: "TWD",
    maximumFractionDigits: 0,
  }).format(amount);
}
