import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/auth";
import { getReferralDashboard } from "@/lib/billing/referral-service";

export async function GET() {
  const auth = await requireApiUser();
  if (auth.response) return auth.response;
  return NextResponse.json(await getReferralDashboard(auth.user.id));
}
