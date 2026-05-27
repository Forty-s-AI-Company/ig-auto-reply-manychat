import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/auth";
import { listInvoices } from "@/lib/billing/invoice-service";
import { getCurrentWorkspaceId } from "@/lib/workspaces";

export async function GET() {
  const auth = await requireApiUser();
  if (auth.response) return auth.response;
  return NextResponse.json({ invoices: await listInvoices(await getCurrentWorkspaceId()) });
}
