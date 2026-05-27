import { NextResponse } from "next/server";
import { requireAdminApiUser } from "@/lib/admin-auth";
import { markPayoutBatchFailed } from "@/lib/billing/payout-service";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminApiUser();
  if (auth.response) return auth.response;
  const { id } = await context.params;
  const body = await request.json().catch(() => ({}));
  return NextResponse.json({ ok: true, batch: await markPayoutBatchFailed(id, String(body.reason || "manual_failed")) });
}
