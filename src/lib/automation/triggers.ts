import { getDb } from "@/lib/db";
import { executeAutomation } from "@/lib/automation/engine";
import { recordMessageEvent } from "@/lib/billing/usage-service";

export function keywordMatches(text: string, config: unknown) {
  const value = String(text || "").toLowerCase();
  const parsed = (config || {}) as { keywords?: string[]; keyword?: string; match?: string };
  const keywords = parsed.keywords?.length ? parsed.keywords : parsed.keyword ? [parsed.keyword] : [];
  const match = parsed.match || "contains";

  return keywords.some((keyword) => {
    const normalized = keyword.toLowerCase();
    if (match === "exact") return value.trim() === normalized.trim();
    return value.includes(normalized);
  });
}

export async function runKeywordAutomations(input: {
  contactId: string;
  conversationId: string;
  text: string;
}) {
  return runAutomationsByType({
    triggerType: "keyword",
    contactId: input.contactId,
    conversationId: input.conversationId,
    text: input.text,
    filter: (automation) => keywordMatches(input.text, automation.triggerConfigJson),
  });
}

async function runAutomationsByType(input: {
  triggerType: "keyword" | "new_contact" | "manual" | "webhook";
  contactId: string;
  conversationId: string;
  text: string;
  automationId?: string;
  webhookKey?: string;
  filter?: (automation: Awaited<ReturnType<typeof getWorkspaceAutomations>>[number]) => boolean;
}) {
  const contact = await getDb().contact.findUnique({
    where: { id: input.contactId },
    include: { channel: { select: { workspaceId: true } } },
  });
  const workspaceId = contact?.channel.workspaceId;
  if (workspaceId && input.triggerType === "keyword") {
    await recordMessageEvent({
      workspaceId,
      contactId: input.contactId,
      type: "keyword_evaluated",
      source: "automation:keyword",
      metadata: { text: input.text },
    });
  }
  if (workspaceId && input.triggerType === "webhook") {
    await recordMessageEvent({
      workspaceId,
      contactId: input.contactId,
      type: "webhook_triggered",
      source: "automation:webhook",
      metadata: { webhookKey: input.webhookKey || null },
    });
  }
  const automations = await getWorkspaceAutomations({
    workspaceId,
    triggerType: input.triggerType,
    automationId: input.automationId,
  });

  const matched = automations.filter((automation) => {
    if (input.webhookKey) {
      const config = (automation.triggerConfigJson || {}) as { webhookKey?: string };
      if (config.webhookKey !== input.webhookKey) return false;
    }
    return input.filter ? input.filter(automation) : true;
  });

  for (const automation of matched) {
    await executeAutomation({
      automation,
      contactId: input.contactId,
      conversationId: input.conversationId,
      inboundText: input.text,
    });
  }

  return matched.length;
}

function getWorkspaceAutomations(input: {
  workspaceId?: string | null;
  triggerType: "keyword" | "new_contact" | "manual" | "webhook";
  automationId?: string;
}) {
  return getDb().automation.findMany({
    where: {
      workspaceId: input.workspaceId || undefined,
      enabled: true,
      triggerType: input.triggerType,
      ...(input.automationId ? { id: input.automationId } : {}),
    },
    include: { steps: { orderBy: { order: "asc" } } },
  });
}

export async function runNewContactAutomations(input: {
  contactId: string;
  conversationId: string;
  text: string;
}) {
  return runAutomationsByType({
    triggerType: "new_contact",
    contactId: input.contactId,
    conversationId: input.conversationId,
    text: input.text,
  });
}

export async function runManualAutomation(input: {
  automationId: string;
  contactId: string;
  conversationId: string;
  text?: string;
}) {
  return runAutomationsByType({
    triggerType: "manual",
    automationId: input.automationId,
    contactId: input.contactId,
    conversationId: input.conversationId,
    text: input.text || "",
  });
}

export async function runWebhookAutomations(input: {
  webhookKey: string;
  contactId: string;
  conversationId: string;
  text?: string;
}) {
  return runAutomationsByType({
    triggerType: "webhook",
    webhookKey: input.webhookKey,
    contactId: input.contactId,
    conversationId: input.conversationId,
    text: input.text || "",
  });
}
