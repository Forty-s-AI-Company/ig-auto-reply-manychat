import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { setSessionCookie } from "@/lib/auth";
import { createUserWorkspaceSubscription } from "@/lib/auth-onboarding";
import { signupSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const parsed = signupSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "註冊資料不完整或格式不正確。" }, { status: 400 });
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

    await setSessionCookie(user.id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ error: "這個 Email 已經註冊過。" }, { status: 409 });
    }
    throw error;
  }
}
