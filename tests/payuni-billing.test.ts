import { beforeEach, describe, expect, it, vi } from "vitest";
import { handlePayuniCallback } from "@/lib/billing/payuni-callback";
import { getDb } from "@/lib/db";
import { createPayuniCheckout } from "@/lib/payuni";

const db = getDb();

async function cleanDb() {
  await db.affiliateCommission.deleteMany();
  await db.walletLedger.deleteMany();
  await db.referralAttribution.deleteMany();
  await db.referralCode.deleteMany();
  await db.paymentOrder.deleteMany();
  await db.invoiceItem.deleteMany();
  await db.invoice.deleteMany();
  await db.subscription.deleteMany();
  await db.workspaceUser.deleteMany();
  await db.user.deleteMany();
  await db.workspace.deleteMany();
}

function payuniResultParams(merTradeNo: string, status = "SUCCESS", amount = 599) {
  const checkout = createPayuniCheckout({
    MerID: "TEST_MERCHANT",
    MerTradeNo: merTradeNo,
    TradeAmt: amount,
    Timestamp: Math.floor(Date.now() / 1000),
    ProdDesc: "Billing callback test",
    ReturnURL: "https://example.com/return",
    NotifyURL: "https://example.com/notify",
    UsrMail: "test@example.com",
    Status: status,
    TradeNo: "PAYUNI_TRADE_1",
  });

  return checkout.fields;
}

describe("PayUNI billing callback", () => {
  beforeEach(async () => {
    vi.stubEnv("PAYUNI_MERCHANT_ID", "TEST_MERCHANT");
    vi.stubEnv("PAYUNI_HASH_KEY", "12345678901234567890123456789012");
    vi.stubEnv("PAYUNI_HASH_IV", "1234567890123456");
    vi.stubEnv("PAYUNI_GATEWAY_URL", "https://sandbox-api.payuni.com.tw/api/upp");
    await cleanDb();
  });

  it("marks invoice paid and activates subscription once", async () => {
    const workspace = await db.workspace.create({
      data: { id: "billing-workspace", name: "Billing Workspace", slug: "billing-workspace" },
    });
    const user = await db.user.create({
      data: { id: "billing-user", email: "billing@example.com", name: "Billing User", passwordHash: "test" },
    });
    await db.workspaceUser.create({ data: { workspaceId: workspace.id, userId: user.id, role: "admin" } });
    const invoice = await db.invoice.create({
      data: {
        invoiceNumber: "INV-TEST-1",
        workspaceId: workspace.id,
        userId: user.id,
        periodStart: new Date(),
        periodEnd: new Date(Date.now() + 30 * 86400000),
        subtotalAmount: 599,
        totalAmount: 599,
        status: "pending_payment",
      },
    });
    await db.paymentOrder.create({
      data: {
        workspaceId: workspace.id,
        userId: user.id,
        invoiceId: invoice.id,
        planKey: "creator",
        merTradeNo: "PAYUNI_ORDER_1",
        amount: 599,
        currency: "TWD",
        checkoutPayload: {},
      },
    });

    await handlePayuniCallback(payuniResultParams("PAYUNI_ORDER_1"));
    await handlePayuniCallback(payuniResultParams("PAYUNI_ORDER_1"));

    const [order, subscription, paidInvoice, commissionCount] = await Promise.all([
      db.paymentOrder.findUnique({ where: { merTradeNo: "PAYUNI_ORDER_1" } }),
      db.subscription.findFirst({ where: { workspaceId: workspace.id } }),
      db.invoice.findUnique({ where: { id: invoice.id } }),
      db.affiliateCommission.count(),
    ]);

    expect(order?.status).toBe("paid");
    expect(subscription?.status).toBe("active");
    expect(subscription?.planKey).toBe("creator");
    expect(paidInvoice?.status).toBe("paid");
    expect(commissionCount).toBe(0);
  });

  it("does not activate subscription for failed payment", async () => {
    const workspace = await db.workspace.create({
      data: { id: "failed-workspace", name: "Failed Workspace", slug: "failed-workspace" },
    });
    await db.paymentOrder.create({
      data: {
        workspaceId: workspace.id,
        planKey: "creator",
        merTradeNo: "PAYUNI_ORDER_FAILED",
        amount: 599,
        currency: "TWD",
        checkoutPayload: {},
      },
    });

    const result = await handlePayuniCallback(payuniResultParams("PAYUNI_ORDER_FAILED", "FAILED"));
    const subscription = await db.subscription.findFirst({ where: { workspaceId: workspace.id } });
    expect(result.paid).toBe(false);
    expect(subscription).toBeNull();
  });
});
