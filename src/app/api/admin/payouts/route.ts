import { NextResponse } from "next/server";
import { requireAdminApiUser } from "@/lib/admin-auth";
import { getDb } from "@/lib/db";

export async function GET() {
  const auth = await requireAdminApiUser();
  if (auth.response) return auth.response;
  const [requests, commissions] = await Promise.all([
    getDb().payoutRequest.findMany({
      orderBy: { requestedAt: "desc" },
      include: { affiliate: { select: { email: true, name: true } } },
    }),
    getDb().affiliateCommission.findMany({ orderBy: { createdAt: "desc" }, take: 100 }),
  ]);
  return NextResponse.json({ requests, commissions });
}
