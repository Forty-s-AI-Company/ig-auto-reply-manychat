import type { BillingInterval } from "@prisma/client";
import { recordAuditEvent } from "@/lib/audit";
import { createAffiliateCommission } from "@/lib/billing/affiliate-service";
import { createFirstPaymentReferralCredit } from "@/lib/billing/referral-service";
import { getPlan, getPlanAmount } from "@/lib/billing/plans";
import { createMerchantTradeNo } from "@/lib/payuni";
import { getDb } from "@/lib/db";

function currentPeriodEnd(interval: BillingInterval, now: Date) {
  const end = new Date(now);
  if (interval === "year") end.setFullYear(end.getFullYear() + 1);
  else end.setMonth(end.getMonth() + 1);
  return end;
}

type CompletePaidPaymentOrderResult = {
  order: {
    id: string;
    workspaceId: string;
    userId: string | null;
    invoiceId: string | null;
    planKey: string;
    interval: BillingInterval;
    amount: number;
    status: "pending" | "paid" | "failed" | "canceled";
  };
  alreadyProcessed: boolean;
};

export async function completePaidPaymentOrder(paymentOrderId: string) {
  const db = getDb();
  try {
    const result = await db.$transaction(async (tx): Promise<CompletePaidPaymentOrderResult> => {
      const order = await tx.paymentOrder.findUnique({
        where: { id: paymentOrderId },
        include: { invoice: true },
      });
      if (!order) throw new Error("Payment order not found.");
      if (order.status === "paid") {
        return {
          order: {
            id: order.id,
            workspaceId: order.workspaceId,
            userId: order.userId,
            invoiceId: order.invoiceId,
            planKey: order.planKey,
            interval: order.interval,
            amount: order.amount,
            status: order.status,
          },
          alreadyProcessed: true,
        };
      }

      const invoice = order.invoice;
      const now = new Date();
      const interval = order.interval;
      const plan = getPlan(order.planKey);
      const amount = getPlanAmount(order.planKey, interval);

      let subscriptionId = order.subscriptionId;
      if (plan && amount !== null) {
        subscriptionId = order.subscriptionId || `sub_${order.workspaceId}`;
        await tx.subscription.updateMany({
          where: {
            workspaceId: order.workspaceId,
            id: { not: subscriptionId },
            status: { in: ["trialing", "active", "past_due", "unpaid"] },
          },
          data: { status: "canceled", canceledAt: now },
        });
        await tx.subscription.upsert({
          where: { id: subscriptionId },
          update: {
            userId: order.userId,
            planKey: order.planKey,
            status: "active",
            interval,
            amount,
            currency: order.currency,
            currentPeriodStart: now,
            currentPeriodEnd: currentPeriodEnd(interval, now),
            canceledAt: null,
          },
          create: {
            id: subscriptionId,
            workspaceId: order.workspaceId,
            userId: order.userId,
            planKey: order.planKey,
            status: "active",
            interval,
            amount,
            currency: order.currency,
            currentPeriodStart: now,
            currentPeriodEnd: currentPeriodEnd(interval, now),
          },
        });
      }

      await tx.paymentOrder.update({
        where: { id: order.id },
        data: { status: "paid", paidAt: now, subscriptionId },
      });

      if (invoice) {
        await tx.invoice.update({
          where: { id: invoice.id },
          data: { status: "paid", paidAt: now, subscriptionId },
        });
      }

      if (order.userId && invoice) {
        await createFirstPaymentReferralCredit({
          referredUserId: order.userId,
          workspaceId: order.workspaceId,
          invoiceId: invoice.id,
          paymentOrderId: order.id,
          actualPaidAmount: order.amount,
          creditsUsed: invoice.creditUsedAmount,
        }, tx);
        await createAffiliateCommission({
          referredUserId: order.userId,
          invoiceId: invoice.id,
          paymentOrderId: order.id,
          actualPaidAmount: order.amount,
          creditsUsed: invoice.creditUsedAmount,
          discounts: invoice.discountAmount,
        }, tx);
      }

      return {
        order: {
          id: order.id,
          workspaceId: order.workspaceId,
          userId: order.userId,
          invoiceId: order.invoiceId,
          planKey: order.planKey,
          interval: order.interval,
          amount: order.amount,
          status: "paid",
        },
        alreadyProcessed: false,
      };
    });

    if (!result.alreadyProcessed) {
      await recordAuditEvent({
        action: "billing_payment_completed",
        resourceType: "billing",
        resourceId: result.order.id,
        workspaceId: result.order.workspaceId,
        userId: result.order.userId,
        metadata: {
          invoiceId: result.order.invoiceId,
          planKey: result.order.planKey,
          interval: result.order.interval,
          amount: result.order.amount,
        },
      });
    }

    return result;
  } catch (error) {
    const order = await db.paymentOrder.findUnique({
      where: { id: paymentOrderId },
      select: {
        id: true,
        workspaceId: true,
        userId: true,
        invoiceId: true,
        planKey: true,
        interval: true,
        amount: true,
      },
    }).catch(() => null);

    await recordAuditEvent({
      action: "billing_payment_completion_failed",
      resourceType: "billing",
      resourceId: order?.id || paymentOrderId,
      workspaceId: order?.workspaceId,
      userId: order?.userId,
      success: false,
      metadata: {
        invoiceId: order?.invoiceId || null,
        planKey: order?.planKey || null,
        interval: order?.interval || null,
        amount: order?.amount || null,
        reason: error instanceof Error ? error.message : "payment_completion_failed",
      },
    });
    throw error;
  }
}

export async function completeInternalInvoicePaymentOrder(params: {
  workspaceId: string;
  userId: string;
  invoiceId: string;
  planKey: string;
  interval: BillingInterval;
  currency: string;
  idempotencyKey?: string;
}) {
  const db = getDb();
  const existingOrder = await db.paymentOrder.findFirst({
    where: {
      invoiceId: params.invoiceId,
      provider: "internal_credit",
    },
    orderBy: { createdAt: "desc" },
  });

  const order = existingOrder || await db.paymentOrder.create({
    data: {
      workspaceId: params.workspaceId,
      userId: params.userId,
      invoiceId: params.invoiceId,
      provider: "internal_credit",
      planKey: params.planKey,
      interval: params.interval,
      merTradeNo: createMerchantTradeNo(params.workspaceId),
      amount: 0,
      currency: params.currency,
      checkoutPayload: {
        mode: "internal_credit",
        idempotencyKey: params.idempotencyKey || null,
      },
    },
  });

  return completePaidPaymentOrder(order.id);
}
