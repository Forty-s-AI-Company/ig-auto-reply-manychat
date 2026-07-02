import { createHash } from "node:crypto";
import type { SandboxMetaBusinessProviderId, SandboxFlowType } from "@/lib/meta-business-sandbox";

type JsonValue = null | string | number | boolean | JsonValue[] | { [key: string]: JsonValue };

const tokenKeys = new Set(["access_token", "accessToken", "refresh_token", "refreshToken", "token"]);
const codeKeys = new Set(["code", "authorization_code", "authorizationCode"]);
const secretKeys = new Set(["client_secret", "clientSecret", "app_secret", "appSecret", "verify_token", "verifyToken"]);
const stateKeys = new Set(["state", "rawState"]);
const nonceKeys = new Set(["nonce", "rawNonce"]);
const callbackUrlKeys = new Set(["callbackUrl", "redirectUri", "redirect_uri"]);

function hashId(prefix: string, value: string) {
  return `${prefix}_${createHash("sha256").update(value).digest("hex").slice(0, 8)}`;
}

export function redactMetaBusinessSandboxValue(key: string, value: JsonValue): JsonValue {
  if (typeof value !== "string") return value;
  if (tokenKeys.has(key)) return "[REDACTED_TOKEN]";
  if (codeKeys.has(key)) return "[REDACTED_CODE]";
  if (secretKeys.has(key)) return "[REDACTED_SECRET]";
  if (stateKeys.has(key)) return "[REDACTED_STATE]";
  if (nonceKeys.has(key)) return "[REDACTED_NONCE]";
  if (callbackUrlKeys.has(key)) return "[REDACTED_CALLBACK_URL]";
  if (/authorizeUrl/i.test(key)) return "[REDACTED_AUTHORIZE_URL]";
  if (/businessId/i.test(key)) return hashId("business", value);
  if (/pageId/i.test(key)) return hashId("page", value);
  if (/instagram.*id/i.test(key) || /ig.*id/i.test(key)) return hashId("ig", value);
  if (/^https?:\/\/.+\/callback\?/i.test(value)) return "[REDACTED_CALLBACK_URL]";
  if (/^https?:\/\/.+\/dialog\/oauth\?/i.test(value)) return "[REDACTED_AUTHORIZE_URL]";
  return value;
}

export function redactMetaBusinessSandboxPayload<T extends JsonValue>(payload: T): T {
  if (Array.isArray(payload)) {
    return payload.map((item) => redactMetaBusinessSandboxPayload(item)) as T;
  }
  if (payload && typeof payload === "object") {
    return Object.fromEntries(
      Object.entries(payload).map(([key, value]) => [key, redactMetaBusinessSandboxPayload(redactMetaBusinessSandboxValue(key, value))]),
    ) as T;
  }
  return payload;
}

export function createMetaBusinessSandboxAuditEvent(input: {
  event: string;
  providerId: SandboxMetaBusinessProviderId;
  flowType: SandboxFlowType;
  workspaceId: string;
  requestId: string;
  result: "success" | "error";
  selectedBusinessId?: string | null;
  selectedPageId?: string | null;
  selectedInstagramAccountId?: string | null;
  errorType?: string | null;
}) {
  return redactMetaBusinessSandboxPayload({
    event: input.event,
    providerId: input.providerId,
    flowType: input.flowType,
    workspaceId: hashId("workspace", input.workspaceId),
    requestId: hashId("req", input.requestId),
    selectedBusinessId: input.selectedBusinessId || null,
    selectedPageId: input.selectedPageId || null,
    selectedInstagramAccountId: input.selectedInstagramAccountId || null,
    selectedAssetCount: [input.selectedBusinessId, input.selectedPageId, input.selectedInstagramAccountId].filter(Boolean).length,
    result: input.result,
    errorType: input.errorType || null,
  });
}

export function assertNoSandboxSensitiveFields(payload: JsonValue): string[] {
  const text = JSON.stringify(payload);
  const findings: string[] = [];
  const checks: Array<[string, RegExp]> = [
    ["raw_token_key", /"(access_token|refresh_token|accessToken|refreshToken)"\s*:\s*"(?!\[REDACTED_TOKEN\])/i],
    ["raw_code_key", /"(code|authorization_code|authorizationCode)"\s*:\s*"(?!\[REDACTED_CODE\])/i],
    ["raw_secret_key", /"(client_secret|clientSecret|app_secret|appSecret|verify_token|verifyToken)"\s*:\s*"(?!\[REDACTED_SECRET\])/i],
    ["raw_state_key", /"(state|rawState)"\s*:\s*"(?!\[REDACTED_STATE\])/i],
    ["raw_nonce_key", /"(nonce|rawNonce)"\s*:\s*"(?!\[REDACTED_NONCE\])/i],
    ["raw_callback_url", /https?:\/\/[^"]+\/callback\?[^"]+/i],
    ["raw_authorize_url", /https?:\/\/[^"]+\/dialog\/oauth\?[^"]+/i],
  ];

  for (const [name, pattern] of checks) {
    if (pattern.test(text)) findings.push(name);
  }

  return findings;
}
