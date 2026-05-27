import { NextResponse } from "next/server";
import { requireAdminApiUser } from "@/lib/admin-auth";
import { markPayoutBatchPaid } from "@/lib/billing/payout-service";

export async function POST(_: Request, context: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminApiUser();
  if (auth.response) return auth.response;
  const { id } = await context.params;
  return NextResponse.json({ ok: true, batch: await markPayoutBatchPaid(id) });
}
