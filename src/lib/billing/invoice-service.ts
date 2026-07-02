import type { BillingInterval } from "@prisma/client";
import type { Prisma } from "@prisma/client";
import { billingAddons, getAddon, getPlan, getPlanAmount } from "@/lib/billing";
import { calculateInvoice } from "@/lib/billing/calculations";
import { applyAvailableCredits, reconcileReferralCreditsForRefundedInvoice } from "@/lib/billing/wallet-service";
import { getDb } from "@/lib/db";

type DbOrTx = ReturnType<typeof getDb> | Prisma.TransactionClient;

function currentPeriodEnd(interval: BillingInterval, now: Date) {
  const end = new Date(now);
  if (interval === "year") end.setFullYear(end.getFullYear() + 1);
  else end.setMonth(end.getMonth() + 1);
  return end;
}

function invoiceNumber(workspaceId: string) {
  return `INV-${Date.now()}-${workspaceId.slice(-6).toUpperCase()}`;
}

export async function createPlanInvoice(params: {
  userId: string;
  workspaceId: string;
  planKey: string;
  interval?: BillingInterval;
  addonKeys?: string[];
  couponDiscountAmount?: number;
  useCredits?: boolean;
}, db: DbOrTx = getDb()) {
  const interval = params.interval || "month";
  const plan = getPlan(params.planKey);
  const planAmount = getPlanAmount(params.planKey, interval);
  if (!plan || planAmount === null) throw new Error("Unknown or manual-only plan.");

  const addons = (params.addonKeys || []).map((key) => {
    const addon = getAddon(key);
    if (!addon) throw new Error(`Unknown addon: ${key}`);
    return addon;
  });
  const addonAmount = addons.reduce((sum, addon) => sum + addon.priceMonthly, 0);
  const requestedCredits = params.useCredits ? Number.MAX_SAFE_INTEGER : 0;
  const preview = calculateInvoice({
    planAmount,
    addonAmount,
    couponDiscountAmount: params.couponDiscountAmount || 0,
    requestedCreditAmount: requestedCredits,
  });

  const now = new Date();
  const periodEnd = currentPeriodEnd(interval, now);

  const invoice = await db.invoice.create({
    data: {
      invoiceNumber: invoiceNumber(params.workspaceId),
      userId: params.userId,
      workspaceId: params.workspaceId,
      periodStart: now,
      periodEnd,
      subtotalAmount: preview.subtotalAmount,
      discountAmount: preview.discountAmount,
      creditUsedAmount: 0,
      totalAmount: Math.max(preview.subtotalAmount - preview.discountAmount, 0),
      status: "open",
      dueAt: now,
      items: {
        create: [
          {
            type: "plan",
            description: `${plan.name} ${interval === "year" ? "年繳" : "月繳"}`,
            quantity: 1,
            unitAmount: planAmount,
            amount: planAmount,
            metadataJson: { planKey: plan.key, interval },
          },
          ...addons.map((addon) => ({
            type: "addon" as const,
            description: addon.name,
            quantity: 1,
            unitAmount: addon.priceMonthly,
            amount: addon.priceMonthly,
            metadataJson: { addonKey: addon.key, addonType: addon.type },
          })),
          ...(preview.discountAmount > 0
            ? [{
                type: "discount" as const,
                description: "優惠折扣",
                quantity: 1,
                unitAmount: -preview.discountAmount,
                amount: -preview.discountAmount,
                metadataJson: {},
              }]
            : []),
        ],
      },
    },
    include: { items: true },
  });

  if (params.useCredits) {
    const afterDiscount = Math.max(invoice.subtotalAmount - invoice.discountAmount, 0);
    const credit = await applyAvailableCredits({
      userId: params.userId,
      workspaceId: params.workspaceId,
      invoiceId: invoice.id,
      requestedAmount: afterDiscount,
    }, db);
    const totalAmount = Math.max(afterDiscount - credit.usedAmount, 0);
    return db.invoice.update({
      where: { id: invoice.id },
      data: {
        creditUsedAmount: credit.usedAmount,
        totalAmount,
        status: totalAmount === 0 ? "paid" : "pending_payment",
        paidAt: totalAmount === 0 ? new Date() : null,
        items: credit.usedAmount > 0
          ? {
              create: {
                type: "credit",
                description: "折抵金",
                quantity: 1,
                unitAmount: -credit.usedAmount,
                amount: -credit.usedAmount,
                metadataJson: {},
              },
            }
          : undefined,
      },
      include: { items: true },
    });
  }

  return invoice;
}

export async function markInvoicePaid(invoiceId: string, db: DbOrTx = getDb()) {
  return db.invoice.update({
    where: { id: invoiceId },
    data: { status: "paid", paidAt: new Date() },
  });
}

export async function markInvoiceRefunded(invoiceId: string, db = getDb()) {
  return db.$transaction(async (tx) => {
    const invoice = await tx.invoice.update({
      where: { id: invoiceId },
      data: { status: "refunded" },
    });
    const referralCreditReconciliation = await reconcileReferralCreditsForRefundedInvoice({ invoiceId }, tx);

    return {
      invoice,
      referralCreditReconciliation,
    };
  });
}

export async function listInvoices(workspaceId: string, db: DbOrTx = getDb()) {
  return db.invoice.findMany({
    where: { workspaceId },
    include: { items: true, paymentOrders: true },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
}

export { billingAddons };
