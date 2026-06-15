import { describe, expect, it } from "vitest";
import {
  buildSandboxAuthorizeDryRunPayload,
  buildSandboxCallbackDryRunPayload,
  validateSandboxAccess,
  validateSandboxNoProductionWrites,
} from "@/lib/meta-business-sandbox";
import { assertSbl09Redacted } from "./helpers/sbl09-redaction";

describe("SBL-01 Meta Business Login sandbox route skeleton helpers", () => {
  it("blocks sandbox routes in production", () => {
    expect(
      validateSandboxAccess({
        nodeEnv: "production",
        providerId: "meta-business-facebook-sandbox",
        workspaceId: "default-workspace",
        user: { id: "user-1", role: "admin" },
        sandboxHeader: "sbl-01",
      }),
    ).toEqual({ ok: false, status: 404, errorType: "sandbox_disabled_in_production" });
  });

  it("requires admin internal access and sandbox header", () => {
    expect(
      validateSandboxAccess({
        nodeEnv: "test",
        providerId: "meta-business-facebook-sandbox",
        workspaceId: "default-workspace",
        user: { id: "user-1", role: "operator" },
        sandboxHeader: "sbl-01",
      }),
    ).toEqual({ ok: false, status: 403, errorType: "internal_only" });

    expect(
      validateSandboxAccess({
        nodeEnv: "test",
        providerId: "meta-business-facebook-sandbox",
        workspaceId: "default-workspace",
        user: { id: "user-1", role: "admin" },
        sandboxHeader: null,
      }),
    ).toEqual({ ok: false, status: 403, errorType: "sandbox_header_required" });
  });

  it("blocks unsupported providers and non-allowlisted workspaces", () => {
    expect(
      validateSandboxAccess({
        nodeEnv: "test",
        providerId: "meta-instagram",
        workspaceId: "default-workspace",
        user: { id: "user-1", role: "admin" },
        sandboxHeader: "sbl-01",
      }),
    ).toEqual({ ok: false, status: 404, errorType: "unsupported_provider" });

    expect(
      validateSandboxAccess({
        nodeEnv: "test",
        providerId: "meta-business-instagram-sandbox",
        workspaceId: "workspace-not-allowed",
        user: { id: "user-1", role: "admin" },
        sandboxHeader: "sbl-01",
      }),
    ).toEqual({ ok: false, status: 403, errorType: "workspace_not_allowed" });
  });

  it("builds redacted authorize dry-run payloads without raw URLs or state", () => {
    const payload = buildSandboxAuthorizeDryRunPayload({
      providerId: "meta-business-facebook-sandbox",
      workspaceId: "default-workspace",
      requestId: "req-real-value",
    });

    expect(payload.mode).toBe("dry_run");
    expect(payload.auth.exchangeAttempted).toBe(false);
    expect(payload.authorize?.redactedUrl).toBe("[REDACTED_AUTHORIZE_URL]");
    expect(validateSandboxNoProductionWrites(payload)).toEqual([]);
    expect(() => assertSbl09Redacted(JSON.stringify(payload))).not.toThrow();
  });

  it("builds dry-run callback payloads without code exchange or production writes", () => {
    const payload = buildSandboxCallbackDryRunPayload({
      providerId: "meta-business-instagram-sandbox",
      workspaceId: "default-workspace",
      requestId: "req-real-value",
      query: new URLSearchParams({ code: "REAL_CODE_SHOULD_NOT_APPEAR", state: "REAL_STATE_SHOULD_NOT_APPEAR" }),
    });

    expect(payload.status).toBe("success");
    expect(payload.auth.code).toBe("[REDACTED_CODE]");
    expect(payload.auth.state).toBe("[REDACTED_STATE]");
    expect(payload.auth.exchangeAttempted).toBe(false);
    expect(validateSandboxNoProductionWrites(payload)).toEqual([]);
    expect(() => assertSbl09Redacted(JSON.stringify(payload))).not.toThrow();
  });

  it("classifies callback errors as safe dry-run errors", () => {
    const payload = buildSandboxCallbackDryRunPayload({
      providerId: "meta-business-facebook-sandbox",
      workspaceId: "default-workspace",
      requestId: "req-real-value",
      query: new URLSearchParams({ error: "access_denied", state: "REAL_STATE_SHOULD_NOT_APPEAR" }),
    });

    expect(payload.status).toBe("error");
    expect(payload.errorType).toBe("user_cancel");
    expect(payload.auth.code).toBeNull();
    expect(() => assertSbl09Redacted(JSON.stringify(payload))).not.toThrow();
  });
});
