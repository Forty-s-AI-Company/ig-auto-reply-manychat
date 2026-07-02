import { randomBytes } from "node:crypto";
import type { Prisma } from "@prisma/client";
import { addDays, applyTrialReferralBonus, calculateReferralCredit } from "@/lib/billing/calculations";
import { REFERRAL_CREDIT_EXPIRES_DAYS, REFERRAL_CREDIT_PENDING_DAYS, TRIAL_DAYS } from "@/lib/billing/plans";
import { createReferralCredit, getWalletSummary, syncWalletLedgerLifecycle } from "@/lib/billing/wallet-service";
import { getDb } from "@/lib/db";

type DbOrTx = ReturnType<typeof getDb> | Prisma.TransactionClient;

function normalizeCode(code: string) {
  return code.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
}

export function buildReferralUrl(code: string) {
  const base = (process.env.APP_URL || "http://localhost:3041").replace(/\/$/, "");
  return `${base}/signup?ref=${encodeURIComponent(code)}`;
}

export async function ensureReferralCode(userId: string, db: DbOrTx = getDb()) {
  const existing = await db.referralCode.findFirst({ where: { userId, disabledAt: null } });
  if (existing) return existing;

  for (let index = 0; index < 8; index += 1) {
    const code = normalizeCode(randomBytes(5).toString("base64url"));
    try {
      return await db.referralCode.create({ data: { userId, code } });
    } catch {
      // Unique collision is unlikely, retry with a fresh code.
    }
  }
  throw new Error("Unable to create unique referral code.");
}

export async function applyReferralCode(params: {
  referredUserId: string;
  code: string;
  ip?: string | null;
  userAgent?: string | null;
}, db: DbOrTx = getDb()) {
  const code = normalizeCode(params.code);
  const referralCode = await db.referralCode.findUnique({ where: { code } });
  if (!referralCode || referralCode.disabledAt) throw new Error("推薦碼不存在或已停用。");
  if (referralCode.userId === params.referredUserId) throw new Error("不能使用自己的推薦碼。");

  const referredMembership = await db.workspaceUser.findFirst({ where: { userId: params.referredUserId } });
  const referrerMembership = await db.workspaceUser.findFirst({ where: { userId: referralCode.userId } });
  if (referredMembership?.workspaceId && referredMembership.workspaceId === referrerMembership?.workspaceId) {
    throw new Error("同一個 workspace 不能互相推薦。");
  }

  return db.referralAttribution.upsert({
    where: { referredUserId: params.referredUserId },
    update: {},
    create: {
      referrerUserId: referralCode.userId,
      referredUserId: params.referredUserId,
      referralCode: code,
      status: "pending",
      riskFlagsJson: {
        ip: params.ip || null,
        userAgent: params.userAgent || null,
      },
    },
  });
}

export async function getReferralDashboard(userId: string, db: DbOrTx = getDb()) {
  await syncWalletLedgerLifecycle(userId, new Date(), db);
  const code = await ensureReferralCode(userId, db);
  const [attributions, rewards, walletCredits, walletSummary] = await Promise.all([
    db.referralAttribution.findMany({
      where: { referrerUserId: userId },
      orderBy: { createdAt: "desc" },
      include: { referred: { select: { email: true, name: true } } },
    }),
    db.referralReward.findMany({ where: { referrerUserId: userId }, orderBy: { createdAt: "desc" } }),
    db.walletLedger.findMany({
      where: { userId, source: "referral_credit" },
      orderBy: { createdAt: "desc" },
    }),
    getWalletSummary(userId, db),
  ]);

  return {
    code: code.code,
    referralUrl: buildReferralUrl(code.code),
    attributions,
    rewards,
    walletCredits,
    trialDaysEarned: rewards.filter((reward) => reward.type === "trial_day" && reward.status === "granted").length,
    creditsEarned: walletCredits
      .filter((entry) => entry.type === "credit" && entry.status !== "cancelled")
      .reduce((sum, entry) => sum + entry.amount, 0),
    walletSummary,
    metrics: {
      clickTrackingAvailable: false,
      signupsTracked: attributions.length,
      activatedCount: attributions.filter((item) => item.status === "activated" || item.status === "paid").length,
      paidConversions: attributions.filter((item) => item.status === "paid" || item.firstPaidAt).length,
      pendingCount: attributions.filter((item) => item.status === "pending").length,
      invalidCount: attributions.filter((item) => item.status === "invalid").length,
    },
  };
}

export async function checkReferralActivation(referredUserId: string, db: DbOrTx = getDb()) {
  const attribution = await db.referralAttribution.findUnique({ where: { referredUserId } });
  if (!attribution || attribution.status !== "pending") return null;

  const [user, igCount, automationCount] = await Promise.all([
    db.user.findUnique({ where: { id: referredUserId }, select: { emailVerifiedAt: true } }),
    db.channel.count({
      where: { workspace: { users: { some: { userId: referredUserId } } }, type: "instagram", enabled: true },
    }),
    db.automation.count({
      where: { workspace: { users: { some: { userId: referredUserId } } } },
    }),
  ]);

  const ready = Boolean(user?.emailVerifiedAt) && igCount >= 1 && automationCount >= 1;
  if (!ready) return { activated: false, reason: "email_verified_and_ig_and_automation_required" };

  const now = new Date();
  await db.referralAttribution.update({
    where: { id: attribution.id },
    data: { status: "activated", activatedAt: now },
  });
  await db.referralReward.createMany({
    data: [
      { referrerUserId: attribution.referrerUserId, referredUserId, type: "trial_day", amount: 1, status: "granted" },
      { referrerUserId: attribution.referrerUserId, referredUserId, type: "trial_events", amount: 300, status: "granted" },
      { referrerUserId: referredUserId, referredUserId, type: "trial_day", amount: 1, status: "granted" },
    ],
  });

  const subscriptions = await db.subscription.findMany({
    where: { userId: { in: [attribution.referrerUserId, referredUserId] }, status: "trialing" },
  });
  for (const subscription of subscriptions) {
    const currentDays = Math.ceil(((subscription.trialEndsAt || addDays(now, TRIAL_DAYS)).getTime() - now.getTime()) / 86400000);
    const bonus = applyTrialReferralBonus(currentDays, subscription.trialEventsLimit || 3000);
    await db.subscription.update({
      where: { id: subscription.id },
      data: {
        trialEndsAt: addDays(now, bonus.trialDays),
        currentPeriodEnd: addDays(now, bonus.trialDays),
        trialEventsLimit: bonus.trialEvents,
      },
    });
  }

  return { activated: true };
}

export async function createFirstPaymentReferralCredit(params: {
  referredUserId: string;
  workspaceId: string;
  invoiceId: string;
  paymentOrderId?: string;
  actualPaidAmount: number;
  creditsUsed: number;
}, db: DbOrTx = getDb()) {
  const attribution = await db.referralAttribution.findUnique({ where: { referredUserId: params.referredUserId } });
  if (!attribution || attribution.status === "invalid" || attribution.firstPaidAt) return null;

  const amount = calculateReferralCredit(params.actualPaidAmount, params.creditsUsed);
  if (amount <= 0) return null;
  const availableAt = addDays(new Date(), REFERRAL_CREDIT_PENDING_DAYS);

  await db.referralAttribution.update({
    where: { id: attribution.id },
    data: { status: "paid", firstPaidAt: new Date() },
  });
  return createReferralCredit({
    userId: attribution.referrerUserId,
    workspaceId: params.workspaceId,
    amount,
    relatedInvoiceId: params.invoiceId,
    relatedPaymentOrderId: params.paymentOrderId,
    availableAt,
    expiresAt: addDays(availableAt, REFERRAL_CREDIT_EXPIRES_DAYS),
  }, db);
}
