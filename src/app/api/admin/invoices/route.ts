import { NextResponse } from "next/server";
import { requireAdminApiUser } from "@/lib/admin-auth";
import { getDb } from "@/lib/db";

export async function GET() {
  const auth = await requireAdminApiUser();
  if (auth.response) return auth.response;
  const invoices = await getDb().invoice.findMany({
    orderBy: { createdAt: "desc" },
    include: { user: { select: { email: true, name: true } }, workspace: true, items: true },
    take: 100,
  });
  return NextResponse.json({ invoices });
}
