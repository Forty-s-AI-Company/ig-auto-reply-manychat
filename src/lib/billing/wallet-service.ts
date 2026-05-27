import type { Prisma } from "@prisma/client";
import { getDb } from "@/lib/db";

type DbOrTx = ReturnType<typeof getDb> | Prisma.TransactionClient;

export async function getWalletSummary(userId: string, db: DbOrTx = getDb()) {
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

  for (const row of rows) {
    const amount = row._sum.amount || 0;
    if (row.type === "credit" && row.status === "available") availableCreditGross += amount;
    if (row.type === "credit" && row.status === "pending") pendingCredits += amount;
    if (row.type === "debit" && row.status === "used") usedCredits += amount;
    if (row.status === "payout_requested") payoutRequested += amount;
    if (row.status === "paid") paidPayouts += amount;
  }

  return {
    availableCredits: Math.max(availableCreditGross - usedCredits - payoutRequested - paidPayouts, 0),
    pendingCredits,
    usedCredits,
    payoutRequested,
    paidPayouts,
  };
}

export async function createReferralCredit(params: {
  userId: string;
  workspaceId?: string | null;
  amount: number;
  relatedInvoiceId?: string;
  relatedPaymentOrderId?: string;
  expiresAt: Date;
}, db: DbOrTx = getDb()) {
  if (params.amount <= 0) return null;
  return db.walletLedger.create({
    data: {
      userId: params.userId,
      workspaceId: params.workspaceId || null,
      type: "credit",
      source: "referral_credit",
      amount: params.amount,
      status: "available",
      relatedInvoiceId: params.relatedInvoiceId,
      relatedPaymentOrderId: params.relatedPaymentOrderId,
      availableAt: new Date(),
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

export async function getWalletLedger(userId: string, db: DbOrTx = getDb()) {
  return db.walletLedger.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
}
