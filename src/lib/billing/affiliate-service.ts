import type { Prisma } from "@prisma/client";
import { calculateCommission, commissionHoldUntil } from "@/lib/billing/calculations";
import { isCashPayoutEligiblePlan, MIN_PAYOUT_AMOUNT_TWD } from "@/lib/billing/plans";
import { encryptSecret } from "@/lib/secrets";
import { getDb } from "@/lib/db";

type DbOrTx = ReturnType<typeof getDb> | Prisma.TransactionClient;

export function affiliateCommissionRatePercent(level: string, customCommissionRate?: number | null) {
  if (level === "agency" && customCommissionRate !== null && customCommissionRate !== undefined) {
    return customCommissionRate;
  }
  if (level === "gold") return 20;
  if (level === "silver") return 15;
  return 10;
}

export async function canApplyAffiliate(userId: string, db: DbOrTx = getDb()) {
  const subscription = await db.subscription.findFirst({
    where: { userId, status: "active" },
    orderBy: { updatedAt: "desc" },
  });
  return Boolean(subscription && isCashPayoutEligiblePlan(subscription.planKey));
}

export async function applyAffiliate(userId: string, db: DbOrTx = getDb()) {
  if (!(await canApplyAffiliate(userId, db))) {
    throw new Error("Creator 以上付費方案才能申請現金分潤。");
  }
  return db.affiliateProfile.upsert({
    where: { userId },
    update: { status: "pending" },
    create: { userId, status: "pending", level: "partner" },
  });
}

export async function upsertPayoutProfile(params: {
  userId: string;
  legalName: string;
  identityType: "individual" | "company";
  taxId: string;
  bankCode: string;
  bankBranchCode?: string;
  bankAccount: string;
  bankAccountName: string;
  phone: string;
  email: string;
  address: string;
  taxResidentCountry: string;
}, db: DbOrTx = getDb()) {
  const bankAccount = params.bankAccount.replace(/\D/g, "");
  return db.affiliateProfile.upsert({
    where: { userId: params.userId },
    update: {
      legalName: params.legalName,
      identityType: params.identityType,
      taxIdEncrypted: encryptSecret(params.taxId),
      bankCode: params.bankCode,
      bankBranchCode: params.bankBranchCode || null,
      bankAccountEncrypted: encryptSecret(bankAccount),
      bankAccountLast4: bankAccount.slice(-4),
      bankAccountName: params.bankAccountName,
      phone: params.phone,
      email: params.email,
      address: params.address,
      taxResidentCountry: params.taxResidentCountry,
      status: "pending",
    },
    create: {
      userId: params.userId,
      status: "pending",
      level: "partner",
      legalName: params.legalName,
      identityType: params.identityType,
      taxIdEncrypted: encryptSecret(params.taxId),
      bankCode: params.bankCode,
      bankBranchCode: params.bankBranchCode || null,
      bankAccountEncrypted: encryptSecret(bankAccount),
      bankAccountLast4: bankAccount.slice(-4),
      bankAccountName: params.bankAccountName,
      phone: params.phone,
      email: params.email,
      address: params.address,
      taxResidentCountry: params.taxResidentCountry,
    },
  });
}

export async function createAffiliateCommission(params: {
  referredUserId: string;
  invoiceId: string;
  paymentOrderId?: string;
  actualPaidAmount: number;
  creditsUsed: number;
  discounts: number;
}, db: DbOrTx = getDb()) {
  if (params.actualPaidAmount <= 0) return null;
  const attribution = await db.referralAttribution.findUnique({ where: { referredUserId: params.referredUserId } });
  if (!attribution) return null;

  const profile = await db.affiliateProfile.findUnique({ where: { userId: attribution.referrerUserId } });
  const referrerSubscription = await db.subscription.findFirst({
    where: { userId: attribution.referrerUserId, status: "active" },
    orderBy: { updatedAt: "desc" },
  });
  if (!profile || profile.status !== "approved" || !isCashPayoutEligiblePlan(referrerSubscription?.planKey)) {
    return null;
  }

  const commissionRate = affiliateCommissionRatePercent(profile.level, profile.customCommissionRate);
  const calculated = calculateCommission({
    actualPaidAmount: params.actualPaidAmount,
    creditsUsed: params.creditsUsed,
    discounts: params.discounts,
    commissionRatePercent: commissionRate,
  });
  if (calculated.commissionAmount <= 0) return null;

  return db.affiliateCommission.upsert({
    where: { invoiceId_affiliateUserId: { invoiceId: params.invoiceId, affiliateUserId: attribution.referrerUserId } },
    update: {},
    create: {
      affiliateUserId: attribution.referrerUserId,
      referredUserId: params.referredUserId,
      invoiceId: params.invoiceId,
      paymentOrderId: params.paymentOrderId,
      commissionBase: calculated.commissionBase,
      commissionRate,
      commissionAmount: calculated.commissionAmount,
      status: "pending",
      holdUntil: commissionHoldUntil(),
    },
  });
}

export async function releaseAvailableCommissions(now = new Date(), db: DbOrTx = getDb()) {
  return db.affiliateCommission.updateMany({
    where: { status: "pending", holdUntil: { lte: now } },
    data: { status: "available", availableAt: now },
  });
}

export async function getAffiliateDashboard(userId: string, db: DbOrTx = getDb()) {
  const [profile, commissions] = await Promise.all([
    db.affiliateProfile.findUnique({ where: { userId } }),
    db.affiliateCommission.findMany({
      where: { affiliateUserId: userId },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
  ]);
  const available = commissions
    .filter((commission) => commission.status === "available")
    .reduce((sum, commission) => sum + commission.commissionAmount, 0);

  return {
    profile,
    commissions,
    availableBalance: available,
    minimumPayoutAmount: MIN_PAYOUT_AMOUNT_TWD,
  };
}
