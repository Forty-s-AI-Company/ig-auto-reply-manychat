import type { BillingInterval } from "@prisma/client";
import { createAffiliateCommission } from "@/lib/billing/affiliate-service";
import { createFirstPaymentReferralCredit } from "@/lib/billing/referral-service";
import { getPlan, getPlanAmount } from "@/lib/billing/plans";
import { getDb } from "@/lib/db";

function currentPeriodEnd(interval: BillingInterval, now: Date) {
  const end = new Date(now);
  if (interval === "year") end.setFullYear(end.getFullYear() + 1);
  else end.setMonth(end.getMonth() + 1);
  return end;
}

export async function completePaidPaymentOrder(paymentOrderId: string) {
  const db = getDb();
  return db.$transaction(async (tx) => {
    const order = await tx.paymentOrder.findUnique({
      where: { id: paymentOrderId },
      include: { invoice: true },
    });
    if (!order) throw new Error("Payment order not found.");
    if (order.status === "paid") return { order, alreadyProcessed: true };

    const invoice = order.invoice;
    const now = new Date();
    const interval = "month";
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

    return { order, alreadyProcessed: false };
  });
}
