import { completePaidPaymentOrder } from "@/lib/billing/payment-service";
import { getDb } from "@/lib/db";
import { isPayuniPaid, parsePayuniResult } from "@/lib/payuni";

export async function handlePayuniCallback(params: Record<string, string>) {
  const result = parsePayuniResult(params);
  const merTradeNo = result.MerTradeNo;
  if (!merTradeNo) throw new Error("PayUNI callback missing MerTradeNo.");

  const db = getDb();
  const order = await db.paymentOrder.findUnique({ where: { merTradeNo } });
  if (!order) throw new Error(`Payment order not found: ${merTradeNo}`);

  if (order.status === "paid") {
    return { paid: true, merTradeNo, idempotent: true };
  }

  const paid = isPayuniPaid(result);
  if (!paid) {
    await db.paymentOrder.update({
      where: { id: order.id },
      data: {
        status: "failed",
        tradeNo: result.TradeNo,
        resultPayload: result,
      },
    });
    if (order.invoiceId) {
      await db.invoice.update({ where: { id: order.invoiceId }, data: { status: "failed" } });
    }
    return { paid: false, merTradeNo, idempotent: false };
  }

  await db.paymentOrder.update({
    where: { id: order.id },
    data: {
      tradeNo: result.TradeNo,
      resultPayload: result,
    },
  });
  await completePaidPaymentOrder(order.id);
  return { paid: true, merTradeNo, idempotent: false };
}
