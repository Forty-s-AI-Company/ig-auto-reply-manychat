import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/auth";
import { applyAffiliate } from "@/lib/billing/affiliate-service";

export async function POST() {
  const auth = await requireApiUser();
  if (auth.response) return auth.response;
  try {
    return NextResponse.json({ ok: true, profile: await applyAffiliate(auth.user.id) });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "申請失敗。" }, { status: 400 });
  }
}
