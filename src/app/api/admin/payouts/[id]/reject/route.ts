import { NextResponse } from "next/server";
import { requireAdminApiUser } from "@/lib/admin-auth";
import { getDb } from "@/lib/db";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminApiUser();
  if (auth.response) return auth.response;
  const { id } = await context.params;
  const body = await request.json().catch(() => ({}));
  const payout = await getDb().payoutRequest.update({
    where: { id },
    data: {
      status: "rejected",
      reviewedAt: new Date(),
      reviewedBy: auth.user.id,
      failureReason: String(body.reason || "rejected_by_admin"),
    },
  });
  return NextResponse.json({ ok: true, payout });
}
