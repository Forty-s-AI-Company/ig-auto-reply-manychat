import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { hashPassword, setSessionCookie } from "@/lib/auth";
import { ensureReferralCode, applyReferralCode } from "@/lib/billing/referral-service";
import { addDays } from "@/lib/billing/calculations";
import { getDb } from "@/lib/db";
import { signupSchema } from "@/lib/validation";
import { createUniqueWorkspaceSlug } from "@/lib/workspaces";

export async function POST(request: Request) {
  const parsed = signupSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "註冊資料不完整或格式不正確。" }, { status: 400 });
  }

  const db = getDb();
  const passwordHash = await hashPassword(parsed.data.password);

  try {
    const user = await db.$transaction(async (tx) => {
      const created = await tx.user.create({
        data: {
          email: parsed.data.email.toLowerCase(),
          name: parsed.data.name,
          passwordHash,
          role: "admin",
          workspaces: {
            create: {
              role: "admin",
              workspace: {
                create: {
                  name: parsed.data.workspaceName,
                  slug: await createUniqueWorkspaceSlug(parsed.data.workspaceName),
                },
              },
            },
          },
        },
        select: { id: true, workspaces: { select: { workspaceId: true }, take: 1 } },
      });

      const workspaceId = created.workspaces[0]?.workspaceId;
      if (workspaceId) {
        const now = new Date();
        await tx.subscription.create({
          data: {
            workspaceId,
            userId: created.id,
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

      await ensureReferralCode(created.id, tx);
      if (parsed.data.referralCode) {
        await applyReferralCode({
          referredUserId: created.id,
          code: parsed.data.referralCode,
          ip: request.headers.get("x-forwarded-for"),
          userAgent: request.headers.get("user-agent"),
        }, tx);
      }
      return created;
    });

    await setSessionCookie(user.id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ error: "這個 Email 已經註冊過。" }, { status: 409 });
    }
    throw error;
  }
}
