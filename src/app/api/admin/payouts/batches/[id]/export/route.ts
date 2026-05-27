import { NextResponse } from "next/server";
import { requireAdminApiUser } from "@/lib/admin-auth";
import { exportPayoutBatchCsv } from "@/lib/billing/payout-service";

export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminApiUser();
  if (auth.response) return auth.response;
  const { id } = await context.params;
  const csv = await exportPayoutBatchCsv(id);
  return new NextResponse(csv, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="inboxpilot-payout-${id}.csv"`,
    },
  });
}
