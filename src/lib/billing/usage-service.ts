import { Prisma } from "@prisma/client";
import { canRunBillableAutomation, getWorkspaceEntitlement } from "@/lib/billing/entitlements";
import { getDb } from "@/lib/db";

type DbOrTx = ReturnType<typeof getDb> | Prisma.TransactionClient;

export type MessageEventType =
  | "ig_comment_received"
  | "keyword_evaluated"
  | "auto_dm_sent"
  | "dm_received"
  | "dm_auto_replied"
  | "ai_faq_executed"
  | "broadcast_contact_sent"
  | "webhook_triggered";

export function getBillingPeriod(now = new Date()) {
  const periodStart = new Date(now);
  periodStart.setDate(1);
  periodStart.setHours(0, 0, 0, 0);
  const periodEnd = new Date(periodStart);
  periodEnd.setMonth(periodEnd.getMonth() + 1);
  return { periodStart, periodEnd };
}

export async function recordMessageEvent(params: {
  workspaceId: string;
  contactId?: string | null;
  type: MessageEventType;
  source: string;
  amount?: number;
  metadata?: Record<string, unknown>;
}, db: DbOrTx = getDb()) {
  const amount = params.amount ?? 1;
  const { periodStart, periodEnd } = getBillingPeriod();

  const [ledger] = await Promise.all([
    db.messageEventLedger.create({
      data: {
        workspaceId: params.workspaceId,
        contactId: params.contactId || null,
        type: params.type,
        source: params.source,
        amount,
        metadataJson: (params.metadata || {}) as Prisma.InputJsonValue,
      },
    }),
    db.usagePeriod.upsert({
      where: {
        workspaceId_periodStart_periodEnd: {
          workspaceId: params.workspaceId,
          periodStart,
          periodEnd,
        },
      },
      update: {
        messageEventsCount: { increment: amount },
        webhookEventsCount: params.type === "webhook_triggered" ? { increment: amount } : undefined,
        broadcastEventsCount: params.type === "broadcast_contact_sent" ? { increment: amount } : undefined,
      },
      create: {
        workspaceId: params.workspaceId,
        periodStart,
        periodEnd,
        messageEventsCount: amount,
        webhookEventsCount: params.type === "webhook_triggered" ? amount : 0,
        broadcastEventsCount: params.type === "broadcast_contact_sent" ? amount : 0,
        activeContactsCount: 0,
      },
    }),
  ]);

  const entitlement = await getWorkspaceEntitlement(params.workspaceId);
  const usageRate = entitlement.limits.messageEvents > 0
    ? entitlement.usage.messageEvents / entitlement.limits.messageEvents
    : 0;
  if (usageRate >= 0.8 || usageRate >= 1) {
    await db.usagePeriod.update({
      where: {
        workspaceId_periodStart_periodEnd: {
          workspaceId: params.workspaceId,
          periodStart,
          periodEnd,
        },
      },
      data: {
        warning80SentAt: usageRate >= 0.8 ? new Date() : undefined,
        limit100ReachedAt: usageRate >= 1 ? new Date() : undefined,
      },
    });
  }

  return ledger;
}

export async function assertCanSendAutomation(workspaceId: string) {
  if (!(await canRunBillableAutomation(workspaceId))) {
    throw new Error("Message Events 已達 100%，新的自動化與 broadcast 已暫停。人工 Inbox 回覆仍可使用。");
  }
}

export async function getUsageSummary(workspaceId: string) {
  return getWorkspaceEntitlement(workspaceId);
}
