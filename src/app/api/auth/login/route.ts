import { NextResponse } from "next/server";
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
    return NextResponse.json({ error: "登入資料格式不正確。" }, { status: 400 });
  }

  const emailKey = parsed.data.email.toLowerCase();
  const rateLimitFailure = assertRateLimit({
    key: `login:${getClientIp(request)}:${emailKey}`,
    limit: 8,
    windowMs: 10 * 60 * 1000,
  });
  if (rateLimitFailure) return rateLimitFailure;

  const user = await getDb().user.findUnique({ where: { email: parsed.data.email } });
  if (!user || !(await verifyPassword(parsed.data.password, user.passwordHash))) {
    return NextResponse.json({ error: "登入失敗，請確認帳號或密碼。" }, { status: 401 });
  }

  await setSessionCookie(user.id);
  return NextResponse.json({ ok: true });
}
