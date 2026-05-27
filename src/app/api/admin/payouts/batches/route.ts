import { NextResponse } from "next/server";
import { requireAdminApiUser } from "@/lib/admin-auth";
import { createPayoutBatch } from "@/lib/billing/payout-service";
import { getDb } from "@/lib/db";

export async function GET() {
  const auth = await requireAdminApiUser();
  if (auth.response) return auth.response;
  const batches = await getDb().payoutBatch.findMany({ orderBy: { createdAt: "desc" }, include: { items: true } });
  return NextResponse.json({ batches });
}

export async function POST(request: Request) {
  const auth = await requireAdminApiUser();
  if (auth.response) return auth.response;
  const body = await request.json().catch(() => ({}));
  const now = new Date();
  const periodStart = body.periodStart ? new Date(String(body.periodStart)) : new Date(now.getFullYear(), now.getMonth(), 1);
  const periodEnd = body.periodEnd ? new Date(String(body.periodEnd)) : new Date(now.getFullYear(), now.getMonth(), 15, 23, 59, 59);
  return NextResponse.json({ batch: await createPayoutBatch({ periodStart, periodEnd, adminUserId: auth.user.id }) });
}
