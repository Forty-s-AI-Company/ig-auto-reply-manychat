import { beforeEach, describe, expect, it, vi } from "vitest";
import { handlePayuniCallback } from "@/lib/billing/payuni-callback";
import { completeInternalInvoicePaymentOrder } from "@/lib/billing/payment-service";
import { getDb } from "@/lib/db";
import { createPayuniCheckout, getPayuniGatewayStatus } from "@/lib/payuni";
import { loadProjectEnv } from "../scripts/load-env.mjs";

loadProjectEnv();

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

  it("marks production checkout as disabled until the production gate is opened", () => {
    const sandboxStatus = getPayuniGatewayStatus(
      {
        gatewayUrl: "https://sandbox-api.payuni.com.tw/api",
      },
      false,
    );
    const productionStatus = getPayuniGatewayStatus(
      {
        gatewayUrl: "https://payuni.com.tw/api",
      },
      false,
    );
    const enabledProductionStatus = getPayuniGatewayStatus(
      {
        gatewayUrl: "https://payuni.com.tw/api",
      },
      true,
    );

    expect(sandboxStatus.label).toBe("PayUNI 測試站");
    expect(sandboxStatus.checkoutEnabled).toBe(true);
    expect(sandboxStatus.checkoutDisabledReason).toBeNull();
    expect(sandboxStatus.detail).toContain("sandbox");
    expect(productionStatus.label).toBe("PayUNI 正式站");
    expect(productionStatus.checkoutEnabled).toBe(false);
    expect(productionStatus.checkoutDisabledReason).toContain("請先切回測試站驗證流程");
    expect(productionStatus.detail).toContain("付款按鈕已先停用");
    expect(enabledProductionStatus.checkoutEnabled).toBe(true);
    expect(enabledProductionStatus.checkoutDisabledReason).toBeNull();
    expect(enabledProductionStatus.detail).toContain("正式站已受控開通");
  });

  it("can describe the gateway state even when billing secrets are unavailable", () => {
    vi.unstubAllEnvs();
    vi.stubEnv("PAYUNI_GATEWAY_URL", "https://payuni.com.tw/api");

    const status = getPayuniGatewayStatus();

    expect(status.label).toBe("PayUNI 正式站");
    expect(status.checkoutEnabled).toBe(false);
    expect(status.checkoutDisabledReason).toContain("正式金流尚未開通");
    expect(status.detail).toContain("正式站尚未開通自動扣款");
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
        interval: "month",
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
    expect(subscription?.interval).toBe("month");
    expect(paidInvoice?.status).toBe("paid");
    expect(commissionCount).toBe(0);
  });

  it("activates a yearly subscription with the saved order interval", async () => {
    const workspace = await db.workspace.create({
      data: { id: "yearly-workspace", name: "Yearly Workspace", slug: "yearly-workspace" },
    });
    const user = await db.user.create({
      data: { id: "yearly-user", email: "yearly@example.com", name: "Yearly User", passwordHash: "test" },
    });
    await db.workspaceUser.create({ data: { workspaceId: workspace.id, userId: user.id, role: "admin" } });
    const invoice = await db.invoice.create({
      data: {
        invoiceNumber: "INV-TEST-YEAR",
        workspaceId: workspace.id,
        userId: user.id,
        periodStart: new Date(),
        periodEnd: new Date(Date.now() + 365 * 86400000),
        subtotalAmount: 5990,
        totalAmount: 5990,
        status: "pending_payment",
      },
    });
    await db.paymentOrder.create({
      data: {
        workspaceId: workspace.id,
        userId: user.id,
        invoiceId: invoice.id,
        planKey: "creator",
        interval: "year",
        merTradeNo: "PAYUNI_ORDER_YEAR",
        amount: 5990,
        currency: "TWD",
        checkoutPayload: {},
      },
    });

    await handlePayuniCallback(payuniResultParams("PAYUNI_ORDER_YEAR", "SUCCESS", 5990));

    const subscription = await db.subscription.findFirst({ where: { workspaceId: workspace.id } });
    expect(subscription?.status).toBe("active");
    expect(subscription?.interval).toBe("year");
    expect(subscription?.amount).toBe(5990);
  });

  it("completes zero-amount internal credit orders and stays idempotent", async () => {
    const workspace = await db.workspace.create({
      data: { id: "credit-workspace", name: "Credit Workspace", slug: "credit-workspace" },
    });
    const user = await db.user.create({
      data: { id: "credit-user", email: "credit@example.com", name: "Credit User", passwordHash: "test" },
    });
    await db.workspaceUser.create({ data: { workspaceId: workspace.id, userId: user.id, role: "admin" } });
    const invoice = await db.invoice.create({
      data: {
        invoiceNumber: "INV-TEST-CREDIT",
        workspaceId: workspace.id,
        userId: user.id,
        periodStart: new Date(),
        periodEnd: new Date(Date.now() + 365 * 86400000),
        subtotalAmount: 5990,
        creditUsedAmount: 5990,
        totalAmount: 0,
        status: "paid",
        paidAt: new Date(),
      },
    });

    const first = await completeInternalInvoicePaymentOrder({
      workspaceId: workspace.id,
      userId: user.id,
      invoiceId: invoice.id,
      planKey: "creator",
      interval: "year",
      currency: "TWD",
      idempotencyKey: "credit-checkout-1",
    });
    const second = await completeInternalInvoicePaymentOrder({
      workspaceId: workspace.id,
      userId: user.id,
      invoiceId: invoice.id,
      planKey: "creator",
      interval: "year",
      currency: "TWD",
      idempotencyKey: "credit-checkout-1",
    });

    const [orderCount, order, subscription, paidInvoice] = await Promise.all([
      db.paymentOrder.count({ where: { invoiceId: invoice.id, provider: "internal_credit" } }),
      db.paymentOrder.findFirst({ where: { invoiceId: invoice.id, provider: "internal_credit" } }),
      db.subscription.findFirst({ where: { workspaceId: workspace.id } }),
      db.invoice.findUnique({ where: { id: invoice.id } }),
    ]);

    expect(first.alreadyProcessed).toBe(false);
    expect(second.alreadyProcessed).toBe(true);
    expect(orderCount).toBe(1);
    expect(order?.status).toBe("paid");
    expect(order?.interval).toBe("year");
    expect(subscription?.status).toBe("active");
    expect(subscription?.interval).toBe("year");
    expect(paidInvoice?.status).toBe("paid");
  });

  it("does not activate subscription for failed payment", async () => {
    const workspace = await db.workspace.create({
      data: { id: "failed-workspace", name: "Failed Workspace", slug: "failed-workspace" },
    });
    await db.paymentOrder.create({
      data: {
        workspaceId: workspace.id,
        planKey: "creator",
        interval: "month",
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
