import { beforeEach, describe, expect, it, vi } from "vitest";
import { Prisma } from "@prisma/client";

const mocks = vi.hoisted(() => ({
  requireAdminApiUser: vi.fn(),
  markInvoiceRefunded: vi.fn(),
  recordAuditEvent: vi.fn(),
}));

vi.mock("@/lib/admin-auth", () => ({ requireAdminApiUser: mocks.requireAdminApiUser }));
vi.mock("@/lib/billing/invoice-service", () => ({ markInvoiceRefunded: mocks.markInvoiceRefunded }));
vi.mock("@/lib/audit", () => ({ recordAuditEvent: mocks.recordAuditEvent }));

import { POST } from "@/app/api/admin/invoices/[id]/refund/route";

function request() {
  return new Request("http://local.test/api/admin/invoices/invoice-1/refund", { method: "POST" });
}

describe("admin invoice refund route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireAdminApiUser.mockResolvedValue({
      user: { id: "admin-1", email: "admin@example.com", role: "admin" },
      response: null,
    });
    mocks.markInvoiceRefunded.mockResolvedValue({
      invoice: { id: "invoice-1", workspaceId: "workspace-1", status: "refunded" },
      referralCreditReconciliation: {
        affectedCredits: 2,
        cancelledPendingAmount: 59,
        clawbackAmount: 59,
      },
    });
  });

  it("requires admin auth and records a safe refund reconciliation audit event", async () => {
    const response = await POST(request(), { params: Promise.resolve({ id: "invoice-1" }) });
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({
      ok: true,
      invoice: { id: "invoice-1", status: "refunded" },
      referralCreditReconciliation: {
        affectedCredits: 2,
        cancelledPendingAmount: 59,
        clawbackAmount: 59,
      },
    });
    expect(mocks.requireAdminApiUser).toHaveBeenCalledWith(expect.any(Request));
    expect(mocks.markInvoiceRefunded).toHaveBeenCalledWith("invoice-1");
    expect(mocks.recordAuditEvent).toHaveBeenCalledWith({
      action: "billing_invoice_refunded",
      resourceType: "billing",
      resourceId: "invoice-1",
      workspaceId: "workspace-1",
      userId: "admin-1",
      success: true,
      metadata: {
        cancelledPendingAmount: 59,
        clawbackAmount: 59,
        affectedCredits: 2,
      },
    });
  });

  it("does not run reconciliation when admin auth blocks the request", async () => {
    const blocked = Response.json({ error: "Admin only." }, { status: 403 });
    mocks.requireAdminApiUser.mockResolvedValue({ user: null, response: blocked });

    const response = await POST(request(), { params: Promise.resolve({ id: "invoice-1" }) });

    expect(response).toBe(blocked);
    expect(mocks.markInvoiceRefunded).not.toHaveBeenCalled();
  });

  it("returns a safe not-found error without exposing Prisma details", async () => {
    mocks.markInvoiceRefunded.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError("Record not found", {
        code: "P2025",
        clientVersion: "test",
      }),
    );

    const response = await POST(request(), { params: Promise.resolve({ id: "missing-invoice" }) });
    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body).toEqual({ error: "找不到這張帳單。" });
    expect(JSON.stringify(body)).not.toContain("P2025");
  });
});
