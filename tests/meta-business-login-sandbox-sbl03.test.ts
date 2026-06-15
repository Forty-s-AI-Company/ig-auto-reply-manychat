import { describe, expect, it } from "vitest";
import {
  consumeSandboxOAuthState,
  createSandboxOAuthState,
  redactSandboxOAuthStateForAudit,
  verifySandboxOAuthState,
} from "@/lib/meta-business-sandbox-state";
import { assertSbl09Redacted } from "./helpers/sbl09-redaction";

describe("SBL-03 Meta Business Login sandbox state and nonce helpers", () => {
  it("creates opaque state and nonce records with redacted audit fields", () => {
    const now = new Date("2026-06-15T00:00:00.000Z");
    const bundle = createSandboxOAuthState({
      workspaceId: "default-workspace",
      userId: "user-1",
      providerId: "meta-business-facebook-sandbox",
      transport: "popup",
      now,
    });
    const audit = redactSandboxOAuthStateForAudit(bundle.record);

    expect(bundle.rawState).toMatch(/^sbl_/);
    expect(bundle.rawNonce).toMatch(/^nonce_/);
    expect(bundle.record.stateHash).not.toContain(bundle.rawState);
    expect(bundle.record.nonceHash).not.toContain(bundle.rawNonce);
    expect(audit.state).toBe("[REDACTED_STATE]");
    expect(audit.nonce).toBe("[REDACTED_NONCE]");
    expect(() => assertSbl09Redacted(JSON.stringify(audit))).not.toThrow();
  });

  it("verifies matching state, nonce, provider, workspace, and user", () => {
    const bundle = createSandboxOAuthState({
      workspaceId: "default-workspace",
      userId: "user-1",
      providerId: "meta-business-instagram-sandbox",
      transport: "redirect",
      now: new Date("2026-06-15T00:00:00.000Z"),
    });

    expect(
      verifySandboxOAuthState({
        rawState: bundle.rawState,
        rawNonce: bundle.rawNonce,
        record: bundle.record,
        providerId: "meta-business-instagram-sandbox",
        workspaceId: "default-workspace",
        userId: "user-1",
        now: new Date("2026-06-15T00:01:00.000Z"),
      }),
    ).toEqual({ ok: true, record: bundle.record });
  });

  it("rejects expired, replayed, mismatched state, and mismatched nonce cases", () => {
    const bundle = createSandboxOAuthState({
      workspaceId: "default-workspace",
      userId: "user-1",
      providerId: "meta-business-facebook-sandbox",
      transport: "popup",
      now: new Date("2026-06-15T00:00:00.000Z"),
      ttlMs: 1000,
    });

    expect(
      verifySandboxOAuthState({
        rawState: bundle.rawState,
        rawNonce: bundle.rawNonce,
        record: bundle.record,
        providerId: "meta-business-facebook-sandbox",
        workspaceId: "default-workspace",
        userId: "user-1",
        now: new Date("2026-06-15T00:00:02.000Z"),
      }),
    ).toEqual({ ok: false, errorType: "state_expired" });

    expect(
      verifySandboxOAuthState({
        rawState: bundle.rawState,
        rawNonce: bundle.rawNonce,
        record: consumeSandboxOAuthState(bundle.record),
        providerId: "meta-business-facebook-sandbox",
        workspaceId: "default-workspace",
        userId: "user-1",
        now: new Date("2026-06-15T00:00:00.500Z"),
      }),
    ).toEqual({ ok: false, errorType: "state_replayed" });

    expect(
      verifySandboxOAuthState({
        rawState: "wrong-state",
        rawNonce: bundle.rawNonce,
        record: bundle.record,
        providerId: "meta-business-facebook-sandbox",
        workspaceId: "default-workspace",
        userId: "user-1",
        now: new Date("2026-06-15T00:00:00.500Z"),
      }),
    ).toEqual({ ok: false, errorType: "invalid_state" });

    expect(
      verifySandboxOAuthState({
        rawState: bundle.rawState,
        rawNonce: "wrong-nonce",
        record: bundle.record,
        providerId: "meta-business-facebook-sandbox",
        workspaceId: "default-workspace",
        userId: "user-1",
        now: new Date("2026-06-15T00:00:00.500Z"),
      }),
    ).toEqual({ ok: false, errorType: "nonce_mismatch" });
  });

  it("rejects workspace, user, and provider mismatches", () => {
    const bundle = createSandboxOAuthState({
      workspaceId: "default-workspace",
      userId: "user-1",
      providerId: "meta-business-facebook-sandbox",
      transport: "popup",
    });

    expect(
      verifySandboxOAuthState({
        rawState: bundle.rawState,
        rawNonce: bundle.rawNonce,
        record: bundle.record,
        providerId: "meta-business-instagram-sandbox",
        workspaceId: "default-workspace",
        userId: "user-1",
      }),
    ).toEqual({ ok: false, errorType: "invalid_state" });

    expect(
      verifySandboxOAuthState({
        rawState: bundle.rawState,
        rawNonce: bundle.rawNonce,
        record: bundle.record,
        providerId: "meta-business-facebook-sandbox",
        workspaceId: "workspace-2",
        userId: "user-1",
      }),
    ).toEqual({ ok: false, errorType: "workspace_mismatch" });

    expect(
      verifySandboxOAuthState({
        rawState: bundle.rawState,
        rawNonce: bundle.rawNonce,
        record: bundle.record,
        providerId: "meta-business-facebook-sandbox",
        workspaceId: "default-workspace",
        userId: "user-2",
      }),
    ).toEqual({ ok: false, errorType: "workspace_mismatch" });
  });
});
