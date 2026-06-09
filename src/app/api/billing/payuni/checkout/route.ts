import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { createPlanInvoice } from "@/lib/billing/invoice-service";
import { getPlan, getPlanAmount } from "@/lib/billing/plans";
import { requireApiUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import {
  createMerchantTradeNo,
  createPayuniCheckout,
  getPayuniConfig,
  isPayuniSandboxGateway,
  renderAutoSubmitForm,
  type PayuniTradePayload,
} from "@/lib/payuni";
import { assertRateLimit, assertSameOriginRequest, getClientIp } from "@/lib/security";
import { billingCheckoutSchema } from "@/lib/validation";
import { getCurrentWorkspaceId } from "@/lib/workspaces";

export async function POST(request: Request) {
  const originFailure = assertSameOriginRequest(request);
  if (originFailure) return originFailure;

  const auth = await requireApiUser();
  if (auth.response) return auth.response;

  const rateLimitFailure = await assertRateLimit({
    key: `payuni-checkout:${auth.user.id}:${getClientIp(request)}`,
    limit: 10,
    windowMs: 15 * 60 * 1000,
  });
  if (rateLimitFailure) return rateLimitFailure;

  const parsed = billingCheckoutSchema.safeParse(
    Object.fromEntries((await request.formData()).entries()),
  );
  if (!parsed.success) {
    return NextResponse.json({ error: "付款參數不完整。" }, { status: 400 });
  }

  const plan = getPlan(parsed.data.planKey);
  const amount = getPlanAmount(parsed.data.planKey, parsed.data.interval);
  if (!plan || amount === null) {
    return NextResponse.json({ error: "此方案需要聯絡管理員手動開通。" }, { status: 404 });
  }

  const workspaceId = await getCurrentWorkspaceId();
  const idempotencyKey = request.headers.get("idempotency-key")?.trim() || "";
  if (idempotencyKey) {
    const existingOrder = await getDb().paymentOrder.findFirst({
      where: {
        workspaceId,
        userId: auth.user.id,
        provider: "payuni",
        status: "pending",
        planKey: plan.key,
        checkoutPayload: { path: ["idempotencyKey"], equals: idempotencyKey },
      },
      orderBy: { createdAt: "desc" },
    });
    if (existingOrder) {
      const checkout = createPayuniCheckout(existingOrder.checkoutPayload as unknown as PayuniTradePayload);
      return new NextResponse(renderAutoSubmitForm(checkout.action, checkout.fields), {
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }
  }

  const invoice = await createPlanInvoice({
    userId: auth.user.id,
    workspaceId,
    planKey: plan.key,
    interval: parsed.data.interval,
    addonKeys: parsed.data.addonKeys,
    useCredits: parsed.data.useCredits,
  });

  if (invoice.totalAmount <= 0) {
    return NextResponse.redirect(new URL("/billing?payment=success&credit=1", request.url), 303);
  }

  const config = getPayuniConfig();
  if (!isPayuniSandboxGateway(config.gatewayUrl) && process.env.PAYUNI_ALLOW_PRODUCTION !== "true") {
    return NextResponse.json({ error: "PayUNI production gateway is not enabled while merchant review is pending." }, { status: 503 });
  }
  const merTradeNo = createMerchantTradeNo(workspaceId);
  const payload = {
    MerID: config.merchantId,
    MerTradeNo: merTradeNo,
    TradeAmt: invoice.totalAmount,
    Timestamp: Math.floor(Date.now() / 1000),
    ProdDesc: `InboxPilot ${plan.name}`,
    ReturnURL: config.returnUrl,
    NotifyURL: config.notifyUrl,
    UsrMail: auth.user.email,
    idempotencyKey: idempotencyKey || undefined,
  };

  await getDb().paymentOrder.create({
    data: {
      workspaceId,
      userId: auth.user.id,
      invoiceId: invoice.id,
      planKey: plan.key,
      merTradeNo,
      amount: invoice.totalAmount,
      currency: "TWD",
      checkoutPayload: payload as Prisma.InputJsonValue,
    },
  });

  const checkout = createPayuniCheckout(payload);
  return new NextResponse(renderAutoSubmitForm(checkout.action, checkout.fields), {
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}
