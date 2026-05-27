import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/auth";
import { requestPayout } from "@/lib/billing/payout-service";

export async function POST(request: Request) {
  const auth = await requireApiUser();
  if (auth.response) return auth.response;
  const body = await request.json().catch(() => ({}));
  try {
    return NextResponse.json({ ok: true, payout: await requestPayout(auth.user.id, Number(body.amount || 0)) });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "提領申請失敗。" }, { status: 400 });
  }
}
