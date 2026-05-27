import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/auth";
import { getAffiliateDashboard } from "@/lib/billing/affiliate-service";

export async function GET() {
  const auth = await requireApiUser();
  if (auth.response) return auth.response;
  return NextResponse.json(await getAffiliateDashboard(auth.user.id));
}
