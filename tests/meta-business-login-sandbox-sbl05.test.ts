import { describe, expect, it } from "vitest";
import {
  assertNoSandboxSensitiveFields,
  createMetaBusinessSandboxAuditEvent,
  redactMetaBusinessSandboxPayload,
  redactMetaBusinessSandboxValue,
} from "@/lib/meta-business-sandbox-redaction";
import { assertSbl09Redacted } from "./helpers/sbl09-redaction";

describe("SBL-05 Meta Business Login sandbox redaction helper", () => {
  it("redacts token, code, secret, state, nonce, and OAuth URLs", () => {
    const redacted = redactMetaBusinessSandboxPayload({
      access_token: "RAW_TOKEN_SHOULD_NOT_APPEAR",
      code: "RAW_CODE_SHOULD_NOT_APPEAR",
      client_secret: "RAW_SECRET_SHOULD_NOT_APPEAR",
      state: "RAW_STATE_SHOULD_NOT_APPEAR",
      nonce: "RAW_NONCE_SHOULD_NOT_APPEAR",
      callbackUrl: "https://app.example.com/api/internal/oauth/meta-business-facebook-sandbox/callback?code=RAW&state=RAW",
      authorizeUrl: "https://www.facebook.com/dialog/oauth?client_id=123&state=RAW",
    });

    expect(redacted).toMatchObject({
      access_token: "[REDACTED_TOKEN]",
      code: "[REDACTED_CODE]",
      client_secret: "[REDACTED_SECRET]",
      state: "[REDACTED_STATE]",
      nonce: "[REDACTED_NONCE]",
      callbackUrl: "[REDACTED_CALLBACK_URL]",
      authorizeUrl: "[REDACTED_AUTHORIZE_URL]",
    });
    expect(assertNoSandboxSensitiveFields(redacted)).toEqual([]);
    expect(() => assertSbl09Redacted(JSON.stringify(redacted))).not.toThrow();
  });

  it("masks Meta asset ids with stable prefixes", () => {
    expect(redactMetaBusinessSandboxValue("selectedBusinessId", "123456789")).toMatch(/^business_[a-f0-9]{8}$/);
    expect(redactMetaBusinessSandboxValue("selectedPageId", "987654321")).toMatch(/^page_[a-f0-9]{8}$/);
    expect(redactMetaBusinessSandboxValue("selectedInstagramAccountId", "111222333")).toMatch(/^ig_[a-f0-9]{8}$/);
  });

  it("creates redacted audit events without raw workspace or request ids", () => {
    const event = createMetaBusinessSandboxAuditEvent({
      event: "meta_business_sandbox_callback_dry_run",
      providerId: "meta-business-instagram-sandbox",
      flowType: "instagram_business_login",
      workspaceId: "default-workspace",
      requestId: "req-real-value",
      selectedBusinessId: "123456789",
      selectedPageId: "987654321",
      selectedInstagramAccountId: "111222333",
      result: "success",
    });

    expect(event.workspaceId).toMatch(/^workspace_[a-f0-9]{8}$/);
    expect(event.requestId).toMatch(/^req_[a-f0-9]{8}$/);
    expect(event.selectedBusinessId).toMatch(/^business_[a-f0-9]{8}$/);
    expect(event.selectedPageId).toMatch(/^page_[a-f0-9]{8}$/);
    expect(event.selectedInstagramAccountId).toMatch(/^ig_[a-f0-9]{8}$/);
    expect(event.selectedAssetCount).toBe(3);
    expect(assertNoSandboxSensitiveFields(event)).toEqual([]);
  });

  it("detects unredacted sensitive fields in unsafe payloads", () => {
    expect(
      assertNoSandboxSensitiveFields({
        access_token: "RAW_TOKEN_SHOULD_FAIL",
        callbackUrl: "https://app.example.com/callback?code=RAW&state=RAW",
      }),
    ).toEqual(expect.arrayContaining(["raw_token_key", "raw_callback_url"]));
  });
});
