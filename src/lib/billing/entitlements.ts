import { getAddon, getPlan, planToLegacyLimits, type BillingPlanLimits, type PlanEntitlements } from "@/lib/billing";
import { getDb } from "@/lib/db";

export type WorkspaceUsage = {
  igAccounts: number;
  automations: number;
  broadcasts: number;
  contacts: number;
  activeContacts: number;
  messageEvents: number;
  teamSeats: number;
  knowledgeBaseItems: number;
  webhookTriggers: number;
};

export type WorkspaceEntitlement = {
  planKey: string;
  planName: string;
  isPaid: boolean;
  isTrial: boolean;
  limits: BillingPlanLimits;
  usage: WorkspaceUsage;
  usageWarning80: boolean;
  usageBlocked100: boolean;
};

export type EntitlementResource = keyof WorkspaceUsage;

const resourceLabels: Record<EntitlementResource, string> = {
  igAccounts: "IG 帳號",
  automations: "自動化流程",
  broadcasts: "廣播",
  contacts: "聯絡人",
  activeContacts: "Active Contacts",
  messageEvents: "Message Events",
  teamSeats: "團隊席位",
  knowledgeBaseItems: "Knowledge Base",
  webhookTriggers: "Webhook 觸發",
};

function currentPeriod(now = new Date()) {
  const start = new Date(now);
  start.setDate(1);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setMonth(end.getMonth() + 1);
  return { start, end };
}

function addLimit(current: number | null, amount: number) {
  if (current === null) return null;
  return current + amount;
}

function applyAddonToLimits(limits: BillingPlanLimits, addonKey: string, quantity: number) {
  const addon = getAddon(addonKey);
  if (!addon) return limits;
  const amount = addon.quantity * quantity;
  if (addon.appliesTo === "messageEventsLimit") {
    return { ...limits, messageEvents: addLimit(limits.messageEvents, amount) ?? limits.messageEvents };
  }
  if (addon.appliesTo === "activeContactsLimit") {
    return {
      ...limits,
      activeContacts: addLimit(limits.activeContacts, amount) ?? limits.activeContacts,
      contacts: addLimit(limits.contacts, amount) ?? limits.contacts,
    };
  }
  if (addon.appliesTo === "teamSeatsLimit") {
    return { ...limits, teamSeats: addLimit(limits.teamSeats, amount) ?? limits.teamSeats };
  }
  return { ...limits, conversationRetentionDays: limits.conversationRetentionDays + amount };
}

function buildLimits(plan: PlanEntitlements, addons: Array<{ addonKey: string; quantity: number }>) {
  return addons.reduce(
    (limits, addon) => applyAddonToLimits(limits, addon.addonKey, addon.quantity),
    planToLegacyLimits(plan),
  );
}

export async function getWorkspaceUsage(workspaceId: string): Promise<WorkspaceUsage> {
  const db = getDb();
  const { start, end } = currentPeriod();
  const [igAccounts, automations, broadcasts, contacts, knowledgeBaseItems, usagePeriod] = await Promise.all([
    db.channel.count({ where: { workspaceId, type: "instagram", enabled: true } }),
    db.automation.count({ where: { workspaceId } }),
    db.broadcast.count({ where: { workspaceId } }),
    db.contact.count({ where: { channel: { workspaceId } } }),
    db.knowledgeBaseItem.count({ where: { workspaceId } }),
    db.usagePeriod.findUnique({
      where: { workspaceId_periodStart_periodEnd: { workspaceId, periodStart: start, periodEnd: end } },
    }),
  ]);

  return {
    igAccounts,
    automations,
    broadcasts,
    contacts,
    activeContacts: contacts,
    messageEvents: usagePeriod?.messageEventsCount || 0,
    teamSeats: 1,
    knowledgeBaseItems,
    webhookTriggers: usagePeriod?.webhookEventsCount || 0,
  };
}

export async function getWorkspaceEntitlement(workspaceId: string): Promise<WorkspaceEntitlement> {
  const db = getDb();
  const { start, end } = currentPeriod();
  const [subscription, usage, addons] = await Promise.all([
    db.subscription.findFirst({
      where: { workspaceId, status: { in: ["trialing", "active"] } },
      orderBy: { updatedAt: "desc" },
    }),
    getWorkspaceUsage(workspaceId),
    db.subscriptionAddon.findMany({
      where: { workspaceId, periodStart: { lte: end }, periodEnd: { gte: start } },
    }),
  ]);

  const plan = getPlan(subscription?.planKey || "trial") || getPlan("trial")!;
  const limits = buildLimits(plan, addons);
  const messageEventsLimit = subscription?.trialEventsLimit || limits.messageEvents;
  limits.messageEvents = messageEventsLimit;

  const usageRate = messageEventsLimit > 0 ? usage.messageEvents / messageEventsLimit : 0;
  return {
    planKey: plan.key,
    planName: plan.name,
    isPaid: subscription?.status === "active" && plan.key !== "trial",
    isTrial: subscription?.status === "trialing" || plan.key === "trial",
    limits,
    usage,
    usageWarning80: usageRate >= 0.8,
    usageBlocked100: usageRate >= 1,
  };
}

export async function assertWorkspaceLimit(workspaceId: string, resource: EntitlementResource, increment = 1) {
  const entitlement = await getWorkspaceEntitlement(workspaceId);
  const limit = entitlement.limits[resource as keyof BillingPlanLimits];
  if (limit === null || typeof limit !== "number") return entitlement;

  const nextUsage = entitlement.usage[resource] + increment;
  if (nextUsage > limit) {
    throw new Error(`${entitlement.planName} 目前最多可使用 ${limit} 個${resourceLabels[resource]}，請升級或加購額度。`);
  }

  return entitlement;
}

export async function canRunBillableAutomation(workspaceId: string) {
  const entitlement = await getWorkspaceEntitlement(workspaceId);
  return !entitlement.usageBlocked100;
}
