import type { Prisma } from "@prisma/client";
import { MIN_PAYOUT_AMOUNT_TWD } from "@/lib/billing/plans";
import { decryptSecret } from "@/lib/secrets";
import { getDb } from "@/lib/db";

type DbOrTx = ReturnType<typeof getDb> | Prisma.TransactionClient;
type DbWithTransaction = ReturnType<typeof getDb>;

function csvEscape(value: string | number | null | undefined) {
  const text = String(value ?? "");
  if (!/[",\n]/.test(text)) return text;
  return `"${text.replace(/"/g, '""')}"`;
}

export async function requestPayout(userId: string, amount: number, db: DbWithTransaction = getDb()) {
  if (amount < MIN_PAYOUT_AMOUNT_TWD) throw new Error(`最低提領金額為 NT$${MIN_PAYOUT_AMOUNT_TWD}。`);
  const profile = await db.affiliateProfile.findUnique({ where: { userId } });
  if (!profile || profile.status !== "approved") throw new Error("聯盟夥伴審核通過後才能申請提領。");

  const availableCommissions = await db.affiliateCommission.findMany({
    where: { affiliateUserId: userId, status: "available" },
    orderBy: { availableAt: "asc" },
  });
  const available = availableCommissions.reduce((sum, commission) => sum + commission.commissionAmount, 0);
  if (available < amount) throw new Error("可提領餘額不足。");

  return db.$transaction(async (tx: Prisma.TransactionClient) => {
    const payout = await tx.payoutRequest.create({
      data: { affiliateUserId: userId, amount, status: "requested" },
    });

    let remaining = amount;
    for (const commission of availableCommissions) {
      if (remaining <= 0) break;
      const locked = Math.min(commission.commissionAmount, remaining);
      await tx.walletLedger.create({
        data: {
          userId,
          type: "debit",
          source: "payout",
          amount: locked,
          status: "payout_requested",
          relatedCommissionId: commission.id,
          relatedPayoutId: payout.id,
        },
      });
      await tx.affiliateCommission.update({
        where: { id: commission.id },
        data: { status: "payout_requested" },
      });
      remaining -= locked;
    }

    return payout;
  });
}

export async function createPayoutBatch(params: {
  periodStart: Date;
  periodEnd: Date;
  adminUserId?: string;
  csvFormat?: string;
}, db: DbWithTransaction = getDb()) {
  const requests = await db.payoutRequest.findMany({
    where: { status: "approved", requestedAt: { gte: params.periodStart, lte: params.periodEnd } },
    include: { affiliate: { include: { affiliateProfile: true } } },
  });

  return db.$transaction(async (tx: Prisma.TransactionClient) => {
    const totalAmount = requests.reduce((sum, request) => sum + request.amount, 0);
    const batch = await tx.payoutBatch.create({
      data: {
        periodStart: params.periodStart,
        periodEnd: params.periodEnd,
        status: "draft",
        totalAmount,
        itemCount: requests.length,
        csvFormat: params.csvFormat || "generic_csv",
        createdBy: params.adminUserId,
      },
    });

    for (const request of requests) {
      const profile = request.affiliate.affiliateProfile;
      if (!profile?.bankAccountEncrypted || !profile.bankCode || !profile.bankAccountName) continue;
      await tx.payoutBatchItem.create({
        data: {
          batchId: batch.id,
          payoutRequestId: request.id,
          affiliateUserId: request.affiliateUserId,
          amount: request.amount,
          bankCode: profile.bankCode,
          bankBranchCode: profile.bankBranchCode,
          bankAccountEncrypted: profile.bankAccountEncrypted,
          bankAccountLast4: profile.bankAccountLast4,
          bankAccountName: profile.bankAccountName,
          status: "pending",
        },
      });
      await tx.payoutRequest.update({ where: { id: request.id }, data: { status: "batched" } });
    }

    return tx.payoutBatch.findUnique({ where: { id: batch.id }, include: { items: true } });
  });
}

export async function exportPayoutBatchCsv(batchId: string, db: DbOrTx = getDb()) {
  const batch = await db.payoutBatch.findUnique({
    where: { id: batchId },
    include: {
      items: {
        include: { payoutRequest: true },
      },
    },
  });
  if (!batch) throw new Error("Payout batch not found.");

  const rows = [
    [
      "payoutItemId",
      "affiliateUserId",
      "legalName",
      "bankCode",
      "bankBranchCode",
      "bankAccount",
      "amount",
      "memo",
      "periodStart",
      "periodEnd",
    ],
  ];

  for (const item of batch.items) {
    const profile = await db.affiliateProfile.findUnique({ where: { userId: item.affiliateUserId } });
    rows.push([
      item.id,
      item.affiliateUserId,
      profile?.legalName || "",
      item.bankCode,
      item.bankBranchCode || "",
      decryptSecret(item.bankAccountEncrypted),
      String(item.amount),
      `InboxPilot payout ${batch.id}`,
      batch.periodStart.toISOString(),
      batch.periodEnd.toISOString(),
    ]);
  }

  return rows.map((row) => row.map(csvEscape).join(",")).join("\n");
}

export async function markPayoutBatchPaid(batchId: string, db: DbWithTransaction = getDb()) {
  const now = new Date();
  return db.$transaction(async (tx: Prisma.TransactionClient) => {
    const items = await tx.payoutBatchItem.findMany({ where: { batchId } });
    for (const item of items) {
      await tx.payoutBatchItem.update({ where: { id: item.id }, data: { status: "paid", paidAt: now } });
      await tx.payoutRequest.update({ where: { id: item.payoutRequestId }, data: { status: "paid" } });
      await tx.walletLedger.updateMany({
        where: { relatedPayoutId: item.payoutRequestId, status: "payout_requested" },
        data: { status: "paid" },
      });
      await tx.affiliateCommission.updateMany({
        where: { affiliateUserId: item.affiliateUserId, status: "payout_requested" },
        data: { status: "paid", paidAt: now },
      });
    }
    return tx.payoutBatch.update({ where: { id: batchId }, data: { status: "paid", paidAt: now } });
  });
}

export async function markPayoutBatchFailed(batchId: string, reason: string, db: DbWithTransaction = getDb()) {
  return db.$transaction(async (tx: Prisma.TransactionClient) => {
    const items = await tx.payoutBatchItem.findMany({ where: { batchId } });
    for (const item of items) {
      await tx.payoutBatchItem.update({ where: { id: item.id }, data: { status: "failed", failureReason: reason } });
      await tx.payoutRequest.update({ where: { id: item.payoutRequestId }, data: { status: "failed", failureReason: reason } });
      await tx.walletLedger.updateMany({
        where: { relatedPayoutId: item.payoutRequestId, status: "payout_requested" },
        data: { status: "failed" },
      });
      await tx.affiliateCommission.updateMany({
        where: { affiliateUserId: item.affiliateUserId, status: "payout_requested" },
        data: { status: "available" },
      });
    }
    return tx.payoutBatch.update({ where: { id: batchId }, data: { status: "partially_failed" } });
  });
}
