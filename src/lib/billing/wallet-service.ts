import type { Prisma } from "@prisma/client";
import { addDays } from "@/lib/billing/calculations";
import { REFERRAL_CREDIT_PENDING_DAYS } from "@/lib/billing/plans";
import { getDb } from "@/lib/db";

type DbOrTx = ReturnType<typeof getDb> | Prisma.TransactionClient;

export async function syncWalletLedgerLifecycle(userId: string, now = new Date(), db: DbOrTx = getDb()) {
  await db.walletLedger.updateMany({
    where: {
      userId,
      source: "referral_credit",
      status: "pending",
      availableAt: { lte: now },
    },
    data: { status: "available" },
  });

  await db.walletLedger.updateMany({
    where: {
      userId,
      source: "referral_credit",
      status: "available",
      expiresAt: { lt: now },
    },
    data: { status: "expired" },
  });
}

export async function getWalletSummary(userId: string, db: DbOrTx = getDb()) {
  const now = new Date();
  await syncWalletLedgerLifecycle(userId, now, db);

  const rows = await db.walletLedger.groupBy({
    by: ["type", "status"],
    where: { userId },
    _sum: { amount: true },
  });

  let availableCreditGross = 0;
  let pendingCredits = 0;
  let usedCredits = 0;
  let payoutRequested = 0;
  let paidPayouts = 0;
  let expiredCredits = 0;
  let cancelledCredits = 0;

  for (const row of rows) {
    const amount = row._sum.amount || 0;
    if (row.type === "credit" && row.status === "available") availableCreditGross += amount;
    if (row.type === "credit" && row.status === "pending") pendingCredits += amount;
    if (row.type === "credit" && row.status === "expired") expiredCredits += amount;
    if (row.type === "credit" && row.status === "cancelled") cancelledCredits += amount;
    if (row.type === "debit" && row.status === "used") usedCredits += amount;
    if (row.status === "payout_requested") payoutRequested += amount;
    if (row.status === "paid") paidPayouts += amount;
  }

  const availableCredits = await db.walletLedger.findMany({
    where: {
      userId,
      source: "referral_credit",
      type: "credit",
      status: "available",
    },
    select: {
      amount: true,
      expiresAt: true,
    },
    orderBy: { expiresAt: "asc" },
  });

  const nextExpiryAt = availableCredits.find((entry) => entry.expiresAt)?.expiresAt || null;
  const expiringWithin7Days = availableCredits
    .filter((entry) => entry.expiresAt && entry.expiresAt <= addDays(now, 7))
    .reduce((sum, entry) => sum + entry.amount, 0);

  const pendingCreditsWithDates = await db.walletLedger.findMany({
    where: {
      userId,
      source: "referral_credit",
      type: "credit",
      status: "pending",
    },
    select: {
      amount: true,
      availableAt: true,
    },
    orderBy: { availableAt: "asc" },
  });

  const nextAvailableAt = pendingCreditsWithDates.find((entry) => entry.availableAt)?.availableAt || null;

  return {
    availableCredits: Math.max(availableCreditGross - usedCredits - payoutRequested - paidPayouts, 0),
    pendingCredits,
    usedCredits,
    payoutRequested,
    paidPayouts,
    expiredCredits,
    cancelledCredits,
    expiringWithin7Days,
    nextExpiryAt,
    nextAvailableAt,
  };
}

export async function createReferralCredit(params: {
  userId: string;
  workspaceId?: string | null;
  amount: number;
  relatedInvoiceId?: string;
  relatedPaymentOrderId?: string;
  availableAt?: Date;
  expiresAt: Date;
}, db: DbOrTx = getDb()) {
  if (params.amount <= 0) return null;
  const availableAt = params.availableAt || addDays(new Date(), REFERRAL_CREDIT_PENDING_DAYS);
  return db.walletLedger.create({
    data: {
      userId: params.userId,
      workspaceId: params.workspaceId || null,
      type: "credit",
      source: "referral_credit",
      amount: params.amount,
      status: availableAt.getTime() > Date.now() ? "pending" : "available",
      relatedInvoiceId: params.relatedInvoiceId,
      relatedPaymentOrderId: params.relatedPaymentOrderId,
      availableAt,
      expiresAt: params.expiresAt,
    },
  });
}

export async function applyAvailableCredits(params: {
  userId: string;
  workspaceId?: string | null;
  invoiceId: string;
  requestedAmount: number;
}, db: DbOrTx = getDb()) {
  const requested = Math.max(params.requestedAmount, 0);
  if (requested <= 0) return { usedAmount: 0 };

  const summary = await getWalletSummary(params.userId, db);
  const usedAmount = Math.min(summary.availableCredits, requested);
  if (usedAmount > 0) {
    await db.walletLedger.create({
      data: {
        userId: params.userId,
        workspaceId: params.workspaceId || null,
        type: "debit",
        source: "invoice_credit",
        amount: usedAmount,
        status: "used",
        relatedInvoiceId: params.invoiceId,
        createdAt: new Date(),
      },
    });
  }

  return { usedAmount };
}

export async function reconcileReferralCreditsForRefundedInvoice(params: {
  invoiceId: string;
}, db: DbOrTx = getDb()) {
  const referralCredits = await db.walletLedger.findMany({
    where: {
      relatedInvoiceId: params.invoiceId,
      source: "referral_credit",
      type: "credit",
      status: { in: ["pending", "available"] },
    },
    orderBy: { createdAt: "asc" },
  });

  let cancelledPendingAmount = 0;
  let clawbackAmount = 0;

  for (const credit of referralCredits) {
    if (credit.status === "pending") {
      await db.walletLedger.update({
        where: { id: credit.id },
        data: { status: "cancelled" },
      });
      cancelledPendingAmount += credit.amount;
      continue;
    }

    const existingClawback = await db.walletLedger.aggregate({
      where: {
        userId: credit.userId,
        relatedInvoiceId: params.invoiceId,
        source: "clawback",
        type: "debit",
      },
      _sum: { amount: true },
    });
    const remainingClawback = Math.max(credit.amount - (existingClawback._sum.amount || 0), 0);
    if (remainingClawback <= 0) continue;

    await db.walletLedger.create({
      data: {
        userId: credit.userId,
        workspaceId: credit.workspaceId,
        type: "debit",
        source: "clawback",
        amount: remainingClawback,
        status: "used",
        relatedInvoiceId: params.invoiceId,
        relatedPaymentOrderId: credit.relatedPaymentOrderId,
      },
    });
    clawbackAmount += remainingClawback;
  }

  return {
    affectedCredits: referralCredits.length,
    cancelledPendingAmount,
    clawbackAmount,
  };
}

export async function getWalletLedger(userId: string, db: DbOrTx = getDb()) {
  await syncWalletLedgerLifecycle(userId, new Date(), db);
  return db.walletLedger.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
}
