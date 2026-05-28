import { randomBytes } from "node:crypto";
import type { Prisma } from "@prisma/client";
import { addDays } from "@/lib/billing/calculations";
import { ensureReferralCode, applyReferralCode } from "@/lib/billing/referral-service";
import { hashPassword } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { createUniqueWorkspaceSlug } from "@/lib/workspaces";

type DbOrTx = ReturnType<typeof getDb> | Prisma.TransactionClient;

export async function createUserWorkspaceSubscription(params: {
  email: string;
  name: string;
  workspaceName: string;
  password?: string;
  emailVerifiedAt?: Date | null;
  referralCode?: string | null;
  ip?: string | null;
  userAgent?: string | null;
}) {
  const db = getDb();
  const passwordHash = await hashPassword(params.password || randomBytes(32).toString("base64url"));

  return db.$transaction(async (tx) => {
    const created = await tx.user.create({
      data: {
        email: params.email.toLowerCase(),
        name: params.name,
        passwordHash,
        emailVerifiedAt: params.emailVerifiedAt || null,
        role: "admin",
        workspaces: {
          create: {
            role: "admin",
            workspace: {
              create: {
                name: params.workspaceName,
                slug: await createUniqueWorkspaceSlug(params.workspaceName),
              },
            },
          },
        },
      },
      select: { id: true, workspaces: { select: { workspaceId: true }, take: 1 } },
    });

    const workspaceId = created.workspaces[0]?.workspaceId;
    if (workspaceId) {
      await createTrialSubscription(tx, {
        userId: created.id,
        workspaceId,
      });
    }

    await ensureReferralCode(created.id, tx);
    if (params.referralCode) {
      await applyReferralCode(
        {
          referredUserId: created.id,
          code: params.referralCode,
          ip: params.ip,
          userAgent: params.userAgent,
        },
        tx,
      );
    }

    return created;
  });
}

async function createTrialSubscription(db: DbOrTx, params: { userId: string; workspaceId: string }) {
  const now = new Date();
  return db.subscription.create({
    data: {
      workspaceId: params.workspaceId,
      userId: params.userId,
      planKey: "trial",
      status: "trialing",
      interval: "month",
      amount: 0,
      currentPeriodStart: now,
      currentPeriodEnd: addDays(now, 7),
      trialEndsAt: addDays(now, 7),
      trialEventsLimit: 3000,
    },
  });
}
