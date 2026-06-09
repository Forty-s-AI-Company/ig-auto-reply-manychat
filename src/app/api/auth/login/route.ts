import { NextResponse } from "next/server";
import { recordAuditEvent } from "@/lib/audit";
import { setSessionCookie, verifyPassword } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { assertRateLimit, assertSameOriginRequest, getClientIp } from "@/lib/security";
import { loginSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const originFailure = assertSameOriginRequest(request);
  if (originFailure) return originFailure;

  const body = await request.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "登入資料格式錯誤，請重新確認。" }, { status: 400 });
  }

  const emailKey = parsed.data.email.toLowerCase();
  const rateLimitFailure = await assertRateLimit({
    key: `login:${getClientIp(request)}:${emailKey}`,
    limit: 8,
    windowMs: 10 * 60 * 1000,
  });
  if (rateLimitFailure) return rateLimitFailure;

  const user = await getDb().user.findUnique({ where: { email: parsed.data.email } });
  if (!user || !(await verifyPassword(parsed.data.password, user.passwordHash))) {
    await recordAuditEvent({
      action: "login_failed",
      resourceType: "auth",
      actorIp: getClientIp(request),
      userAgent: request.headers.get("user-agent"),
      metadata: { email: parsed.data.email.toLowerCase() },
    });
    return NextResponse.json({ error: "登入失敗，請確認 Email 與密碼是否正確。" }, { status: 401 });
  }

  await recordAuditEvent({
    action: "login_success",
    resourceType: "auth",
    resourceId: user.id,
    userId: user.id,
    actorIp: getClientIp(request),
    userAgent: request.headers.get("user-agent"),
    metadata: { email: user.email },
  });

  await setSessionCookie(user.id);
  return NextResponse.json({ ok: true });
}
