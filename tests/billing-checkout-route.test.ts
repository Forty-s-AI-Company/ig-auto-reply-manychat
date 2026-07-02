import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  requireApiUser: vi.fn(),
  getCurrentWorkspaceId: vi.fn(),
  createPlanInvoice: vi.fn(),
  completeInternalInvoicePaymentOrder: vi.fn(),
  getPlan: vi.fn(),
  getPlanAmount: vi.fn(),
  assertRateLimit: vi.fn(),
  assertSameOriginRequest: vi.fn(),
  getClientIp: vi.fn(),
  createMerchantTradeNo: vi.fn(),
  createPayuniCheckout: vi.fn(),
  getPayuniConfig: vi.fn(),
  isPayuniSandboxGateway: vi.fn(),
  renderAutoSubmitForm: vi.fn(),
  recordAuditEvent: vi.fn(),
  db: {
    paymentOrder: {
      findFirst: vi.fn(),
      create: vi.fn(),
    },
  },
}));

vi.mock("@/lib/auth", () => ({ requireApiUser: mocks.requireApiUser }));
vi.mock("@/lib/workspaces", () => ({ getCurrentWorkspaceId: mocks.getCurrentWorkspaceId }));
vi.mock("@/lib/billing/invoice-service", () => ({ createPlanInvoice: mocks.createPlanInvoice }));
vi.mock("@/lib/billing/payment-service", () => ({ completeInternalInvoicePaymentOrder: mocks.completeInternalInvoicePaymentOrder }));
vi.mock("@/lib/billing/plans", () => ({ getPlan: mocks.getPlan, getPlanAmount: mocks.getPlanAmount }));
vi.mock("@/lib/security", () => ({
  assertRateLimit: mocks.assertRateLimit,
  assertSameOriginRequest: mocks.assertSameOriginRequest,
  getClientIp: mocks.getClientIp,
}));
vi.mock("@/lib/payuni", () => ({
  createMerchantTradeNo: mocks.createMerchantTradeNo,
  createPayuniCheckout: mocks.createPayuniCheckout,
  getPayuniConfig: mocks.getPayuniConfig,
  isPayuniSandboxGateway: mocks.isPayuniSandboxGateway,
  renderAutoSubmitForm: mocks.renderAutoSubmitForm,
}));
vi.mock("@/lib/db", () => ({ getDb: () => mocks.db }));
vi.mock("@/lib/audit", () => ({ recordAuditEvent: mocks.recordAuditEvent }));

import * as checkoutRoute from "@/app/api/billing/payuni/checkout/route";

function formRequest(body: Record<string, string>) {
  const formData = new FormData();
  for (const [key, value] of Object.entries(body)) {
    formData.set(key, value);
  }
  return new Request("http://local.test/api/billing/payuni/checkout", {
    method: "POST",
    body: formData,
  });
}

describe("billing checkout route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireApiUser.mockResolvedValue({ user: { id: "user-1", email: "user@example.com" }, response: null });
    mocks.getCurrentWorkspaceId.mockResolvedValue("workspace-1");
    mocks.assertRateLimit.mockResolvedValue(null);
    mocks.assertSameOriginRequest.mockReturnValue(null);
    mocks.getClientIp.mockReturnValue("127.0.0.1");
    mocks.getPlan.mockReturnValue({ key: "creator", name: "Creator" });
    mocks.getPlanAmount.mockReturnValue(5990);
    mocks.getPayuniConfig.mockReturnValue({
      merchantId: "TEST_MERCHANT",
      hashKey: "12345678901234567890123456789012",
      hashIv: "1234567890123456",
      version: "1.0",
      gatewayUrl: "https://sandbox-api.payuni.com.tw/api",
      returnUrl: "https://local.test/api/billing/payuni/return",
      notifyUrl: "https://local.test/api/billing/payuni/notify",
    });
    mocks.isPayuniSandboxGateway.mockReturnValue(true);
    mocks.db.paymentOrder.findFirst.mockResolvedValueOnce(null).mockResolvedValueOnce(null);
    mocks.createPlanInvoice.mockResolvedValue({
      id: "invoice-1",
      totalAmount: 0,
      currency: "TWD",
    });
    mocks.completeInternalInvoicePaymentOrder.mockResolvedValue({ alreadyProcessed: false });
  });

  it("routes zero-amount checkout through internal completion with the selected interval", async () => {
    const response = await checkoutRoute.POST(
      formRequest({
        planKey: "creator",
        interval: "year",
        useCredits: "true",
      }),
    );

    expect(mocks.createPlanInvoice).toHaveBeenCalledWith({
      userId: "user-1",
      workspaceId: "workspace-1",
      planKey: "creator",
      interval: "year",
      addonKeys: [],
      useCredits: true,
    });
    expect(mocks.completeInternalInvoicePaymentOrder).toHaveBeenCalledWith({
      workspaceId: "workspace-1",
      userId: "user-1",
      invoiceId: "invoice-1",
      planKey: "creator",
      interval: "year",
      currency: "TWD",
      idempotencyKey: undefined,
    });
    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toBe("http://local.test/billing?payment=success&credit=1");
  });

  it("redirects back to billing when PayUNI production is still gated", async () => {
    mocks.createPlanInvoice.mockResolvedValue({
      id: "invoice-2",
      totalAmount: 5990,
      currency: "TWD",
    });
    mocks.isPayuniSandboxGateway.mockReturnValue(false);

    const response = await checkoutRoute.POST(
      formRequest({
        planKey: "creator",
        interval: "month",
      }),
    );

    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toBe("http://local.test/billing?payuni=production_gate_pending");
    expect(mocks.createPayuniCheckout).not.toHaveBeenCalled();
  });
});
