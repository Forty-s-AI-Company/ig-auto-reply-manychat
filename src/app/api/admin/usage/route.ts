import { NextResponse } from "next/server";
import { requireAdminApiUser } from "@/lib/admin-auth";
import { getDb } from "@/lib/db";

export async function GET() {
  const auth = await requireAdminApiUser();
  if (auth.response) return auth.response;
  const periods = await getDb().usagePeriod.findMany({
    orderBy: { updatedAt: "desc" },
    include: { workspace: true },
    take: 100,
  });
  return NextResponse.json({ periods });
}
