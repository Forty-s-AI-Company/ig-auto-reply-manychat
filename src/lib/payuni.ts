import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";

type PayuniConfig = {
  merchantId: string;
  hashKey: string;
  hashIv: string;
  version: string;
  gatewayUrl: string;
  returnUrl: string;
  notifyUrl: string;
};

export type PayuniTradePayload = {
  MerID: string;
  MerTradeNo: string;
  TradeAmt: number;
  Timestamp: number;
  ProdDesc: string;
  ReturnURL: string;
  NotifyURL: string;
  UsrMail?: string;
  [key: string]: string | number | undefined;
};

export type PayuniResult = {
  Status?: string;
  Message?: string;
  MerID?: string;
  MerTradeNo?: string;
  TradeNo?: string;
  TradeAmt?: string;
  PayTime?: string;
  [key: string]: string | undefined;
};

export type PayuniGatewayStatus = {
  label: string;
  detail: string;
  sandbox: boolean;
  productionEnabled: boolean;
  checkoutEnabled: boolean;
  checkoutDisabledReason: string | null;
};

function requiredEnv(name: string) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} is required for PayUNI integration.`);
  return value;
}

function appUrl() {
  return process.env.APP_URL?.replace(/\/$/, "") || "http://localhost:3041";
}

function payuniGatewayUrl() {
  return (process.env.PAYUNI_GATEWAY_URL?.trim() || "https://sandbox-api.payuni.com.tw/api").replace(/\/$/, "");
}

function resolveGatewayAction(rawGatewayUrl: string) {
  const normalized = rawGatewayUrl.replace(/\/$/, "");
  return normalized.endsWith("/upp") ? normalized : `${normalized}/upp`;
}

export function isPayuniSandboxGateway(gatewayUrl: string) {
  const hostname = new URL(gatewayUrl).hostname.toLowerCase();
  return hostname.includes("sandbox") || hostname.includes("test");
}

export function getPayuniConfig(): PayuniConfig {
  return {
    merchantId: requiredEnv("PAYUNI_MERCHANT_ID"),
    hashKey: requiredEnv("PAYUNI_HASH_KEY"),
    hashIv: requiredEnv("PAYUNI_HASH_IV"),
    version: process.env.PAYUNI_VERSION?.trim() || "1.0",
    gatewayUrl: payuniGatewayUrl(),
    returnUrl: process.env.PAYUNI_RETURN_URL?.trim() || `${appUrl()}/api/billing/payuni/return`,
    notifyUrl: process.env.PAYUNI_NOTIFY_URL?.trim() || `${appUrl()}/api/billing/payuni/notify`,
  };
}

export function getPayuniGatewayStatus(
  config: Pick<PayuniConfig, "gatewayUrl"> = { gatewayUrl: payuniGatewayUrl() },
  productionEnabled = process.env.PAYUNI_ALLOW_PRODUCTION === "true",
): PayuniGatewayStatus {
  const sandbox = isPayuniSandboxGateway(config.gatewayUrl);
  const checkoutEnabled = sandbox || productionEnabled;
  const checkoutDisabledReason = checkoutEnabled
    ? null
    : "目前付款按鈕先停用，因為正式金流尚未開通。請先切回測試站驗證流程，等 merchant review 與營運開關完成後再切正式站。";

  return {
    label: sandbox ? "PayUNI 測試站" : "PayUNI 正式站",
    detail: sandbox
      ? "目前付款會先走 sandbox，不會影響正式帳務。"
      : productionEnabled
        ? "正式站已受控開通，仍建議先用小額與對帳流程確認。"
        : "正式站尚未開通自動扣款，先用測試站驗證流程。付款按鈕已先停用，避免送出後才知道不能用。",
    sandbox,
    productionEnabled,
    checkoutEnabled,
    checkoutDisabledReason,
  };
}

export function createMerchantTradeNo(workspaceId: string) {
  const suffix = randomBytes(4).toString("hex").toUpperCase();
  return `IG${Date.now()}${workspaceId.slice(-4).toUpperCase()}${suffix}`.slice(0, 40);
}

function encryptPayuniInfo(payload: Record<string, string | number | undefined>, config: PayuniConfig) {
  const query = new URLSearchParams(
    Object.entries(payload)
      .filter(([, value]) => value !== undefined)
      .map(([key, value]) => [key, String(value)]),
  ).toString();
  const cipher = createCipheriv(
    "aes-256-gcm",
    Buffer.from(config.hashKey.trim(), "utf8"),
    Buffer.from(config.hashIv.trim(), "utf8"),
  );
  const encrypted = Buffer.concat([cipher.update(query, "utf8"), cipher.final()]).toString("base64");
  const tag = cipher.getAuthTag().toString("base64");
  return Buffer.from(`${encrypted}:::${tag}`, "utf8").toString("hex");
}

function decryptPayuniInfo(encryptInfo: string, config: PayuniConfig) {
  const decoded = Buffer.from(encryptInfo, "hex").toString("utf8");
  const [encrypted, tag] = decoded.split(":::");
  if (!encrypted || !tag) throw new Error("Invalid PayUNI EncryptInfo payload.");

  const decipher = createDecipheriv(
    "aes-256-gcm",
    Buffer.from(config.hashKey.trim(), "utf8"),
    Buffer.from(config.hashIv.trim(), "utf8"),
  );
  decipher.setAuthTag(Buffer.from(tag, "base64"));
  const query = Buffer.concat([
    decipher.update(Buffer.from(encrypted, "base64")),
    decipher.final(),
  ]).toString("utf8");

  return Object.fromEntries(new URLSearchParams(query)) as PayuniResult;
}

function hashPayuniInfo(encryptInfo: string, config: PayuniConfig) {
  return createHash("sha256")
    .update(`${config.hashKey}${encryptInfo}${config.hashIv}`)
    .digest("hex")
    .toUpperCase();
}

export function createPayuniCheckout(payload: PayuniTradePayload) {
  const config = getPayuniConfig();
  const encryptInfo = encryptPayuniInfo(payload, config);
  return {
    action: resolveGatewayAction(config.gatewayUrl),
    method: "POST",
    fields: {
      MerID: config.merchantId,
      Version: config.version,
      EncryptInfo: encryptInfo,
      HashInfo: hashPayuniInfo(encryptInfo, config),
    },
  };
}

export function parsePayuniResult(params: Record<string, string>) {
  const config = getPayuniConfig();
  const encryptInfo = params.EncryptInfo;
  const hashInfo = params.HashInfo;
  if (!encryptInfo || !hashInfo) throw new Error("Missing PayUNI EncryptInfo or HashInfo.");

  const expectedHash = hashPayuniInfo(encryptInfo, config);
  if (expectedHash !== hashInfo.toUpperCase()) throw new Error("PayUNI HashInfo mismatch.");
  return decryptPayuniInfo(encryptInfo, config);
}

export function isPayuniPaid(result: PayuniResult) {
  const status = String(result.Status || "").toUpperCase();
  return status === "SUCCESS" || status === "TRADE_SUCCESS" || status === "PAID";
}

export function renderAutoSubmitForm(action: string, fields: Record<string, string>) {
  const safeAction = action.replace(/"/g, "&quot;");
  const inputs = Object.entries(fields)
    .map(([name, value]) => {
      const safeName = name.replace(/"/g, "&quot;");
      const safeValue = value.replace(/"/g, "&quot;");
      return `<input type="hidden" name="${safeName}" value="${safeValue}" />`;
    })
    .join("\n");

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Redirecting to PayUNI</title>
  </head>
  <body>
    <form id="payuni-form" method="post" action="${safeAction}">
      ${inputs}
      <button type="submit">Continue to PayUNI</button>
    </form>
    <script>document.getElementById("payuni-form").submit();</script>
  </body>
</html>`;
}
