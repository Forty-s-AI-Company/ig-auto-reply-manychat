import { NextResponse } from "next/server";
import { requireAdminApiUser } from "@/lib/admin-auth";
import { getDb } from "@/lib/db";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminApiUser(request);
  if (auth.response) return auth.response;
  const { id } = await context.params;
  const payout = await getDb().payoutRequest.update({
    where: { id },
    data: { status: "approved", reviewedAt: new Date(), reviewedBy: auth.user.id },
  });
  return NextResponse.json({ ok: true, payout });
}
