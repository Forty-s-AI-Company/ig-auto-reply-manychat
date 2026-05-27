import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/auth";
import { applyReferralCode } from "@/lib/billing/referral-service";

export async function POST(request: Request) {
  const auth = await requireApiUser();
  if (auth.response) return auth.response;
  const body = await request.json().catch(() => ({}));
  try {
    const attribution = await applyReferralCode({
      referredUserId: auth.user.id,
      code: String(body.code || ""),
      ip: request.headers.get("x-forwarded-for"),
      userAgent: request.headers.get("user-agent"),
    });
    return NextResponse.json({ ok: true, attribution });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "推薦碼套用失敗。" }, { status: 400 });
  }
}
