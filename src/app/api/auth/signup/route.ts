import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { recordAuditEvent } from "@/lib/audit";
import { setSessionCookie } from "@/lib/auth";
import { createUserWorkspaceSubscription } from "@/lib/auth-onboarding";
import { assertRateLimit, assertSameOriginRequest, getClientIp } from "@/lib/security";
import { signupSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const originFailure = assertSameOriginRequest(request);
  if (originFailure) return originFailure;

  const rateLimitFailure = await assertRateLimit({
    key: `signup:${getClientIp(request)}`,
    limit: 5,
    windowMs: 60 * 60 * 1000,
  });
  if (rateLimitFailure) return rateLimitFailure;

  const parsed = signupSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "註冊資料格式錯誤，請重新確認。" }, { status: 400 });
  }

  try {
    const user = await createUserWorkspaceSubscription({
      email: parsed.data.email,
      name: parsed.data.name,
      workspaceName: parsed.data.workspaceName,
      password: parsed.data.password,
      referralCode: parsed.data.referralCode,
      ip: request.headers.get("x-forwarded-for"),
      userAgent: request.headers.get("user-agent"),
    });

    await recordAuditEvent({
      action: "signup_success",
      resourceType: "auth",
      resourceId: user.id,
      workspaceId: user.workspaces[0]?.workspaceId ?? null,
      userId: user.id,
      actorIp: getClientIp(request),
      userAgent: request.headers.get("user-agent"),
      metadata: {
        email: parsed.data.email.toLowerCase(),
        workspaceName: parsed.data.workspaceName,
        referralCode: parsed.data.referralCode || null,
      },
    });

    await setSessionCookie(user.id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    await recordAuditEvent({
      action: "signup_failed",
      resourceType: "auth",
      actorIp: getClientIp(request),
      userAgent: request.headers.get("user-agent"),
      success: false,
      metadata: {
        email: parsed.data.email.toLowerCase(),
        workspaceName: parsed.data.workspaceName,
        error: error instanceof Error ? error.message : "signup_failed",
      },
    });

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ error: "Email 已存在，請改用其他 Email。" }, { status: 409 });
    }
    throw error;
  }
}
