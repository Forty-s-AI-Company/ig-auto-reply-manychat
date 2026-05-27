import { loadProjectEnv } from "./load-env.mjs";

loadProjectEnv();

const { createPayuniCheckout } = await import("../src/lib/payuni.ts");

function extractJsInfo(html) {
  const match = html.match(/window\.JS_INFO\s*=\s*(\{[\s\S]*?\});/);
  if (!match) return null;

  try {
    return JSON.parse(match[1]);
  } catch {
    return null;
  }
}

async function main() {
  const checkout = createPayuniCheckout({
    MerID: process.env.PAYUNI_MERCHANT_ID,
    MerTradeNo: `SMOKE${Date.now()}`,
    TradeAmt: 100,
    Timestamp: Math.floor(Date.now() / 1000),
    ProdDesc: "PayUNI smoke test",
    ReturnURL: process.env.PAYUNI_RETURN_URL || "https://example.com/payuni/return",
    NotifyURL: process.env.PAYUNI_NOTIFY_URL || "https://example.com/payuni/notify",
    UsrMail: "test@example.com",
  });

  const response = await fetch(checkout.action, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(checkout.fields).toString(),
    redirect: "manual",
  });

  const html = await response.text();
  const jsInfo = extractJsInfo(html);

  if (!jsInfo) {
    console.error("PAYUNI smoke test failed: unable to parse PAYUNI response.");
    process.exit(1);
  }

  console.log(`PAYUNI status: ${response.status}`);
  console.log(`PAYUNI success: ${jsInfo.success ? "true" : "false"}`);
  console.log(`PAYUNI message: ${jsInfo.message || "(empty)"}`);

  if (!jsInfo.success) {
    process.exit(1);
  }
}

main().catch((error) => {
  console.error("PAYUNI smoke test crashed.");
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
