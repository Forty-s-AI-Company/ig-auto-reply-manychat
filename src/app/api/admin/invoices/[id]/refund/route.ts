import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { recordAuditEvent } from "@/lib/audit";
import { markInvoiceRefunded } from "@/lib/billing/invoice-service";
import { requireAdminApiUser } from "@/lib/admin-auth";

type RouteContext = {
  params: Promise<{ id: string }>;
};

function isMissingRecordError(error: unknown) {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025";
}

export async function POST(request: Request, context: RouteContext) {
  const auth = await requireAdminApiUser(request);
  if (auth.response) return auth.response;

  const { id } = await context.params;
  try {
    const result = await markInvoiceRefunded(id);
    await recordAuditEvent({
      action: "billing_invoice_refunded",
      resourceType: "billing",
      resourceId: result.invoice.id,
      workspaceId: result.invoice.workspaceId,
      userId: auth.user.id,
      success: true,
      metadata: {
        cancelledPendingAmount: result.referralCreditReconciliation.cancelledPendingAmount,
        clawbackAmount: result.referralCreditReconciliation.clawbackAmount,
        affectedCredits: result.referralCreditReconciliation.affectedCredits,
      },
    });

    return NextResponse.json({
      ok: true,
      invoice: {
        id: result.invoice.id,
        status: result.invoice.status,
      },
      referralCreditReconciliation: result.referralCreditReconciliation,
    });
  } catch (error) {
    if (isMissingRecordError(error)) {
      return NextResponse.json({ error: "找不到這張帳單。" }, { status: 404 });
    }

    await recordAuditEvent({
      action: "billing_invoice_refund_failed",
      resourceType: "billing",
      resourceId: id,
      userId: auth.user.id,
      success: false,
      metadata: {
        reason: error instanceof Error ? error.message : "invoice_refund_failed",
      },
    });
    return NextResponse.json({ error: "退款折抵沖回失敗，請稍後再試。" }, { status: 500 });
  }
}
