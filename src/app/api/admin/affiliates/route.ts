import { NextResponse } from "next/server";
import { requireAdminApiUser } from "@/lib/admin-auth";
import { getDb } from "@/lib/db";

export async function GET() {
  const auth = await requireAdminApiUser();
  if (auth.response) return auth.response;
  const affiliates = await getDb().affiliateProfile.findMany({
    orderBy: { updatedAt: "desc" },
    include: { user: { select: { id: true, email: true, name: true } } },
  });
  return NextResponse.json({ affiliates });
}
