import { describe, expect, it } from "vitest";

import {
  buildSandboxCallbackCaptureEvidence,
  validateSandboxCallbackCaptureEvidence,
} from "@/lib/meta-business-sandbox-callback-capture";

const baseInput = {
  providerId: "meta-business-instagram-sandbox" as const,
  requestId: "req-callback-capture",
  sessionWorkspaceId: "default-workspace",
  stateWorkspaceId: "default-workspace",
  sandboxHeader: "sbl-callback-capture",
  callbackUrl: "https://inboxpilot.example.test/api/instagram/oauth/callback?code=RAW_CODE&state=RAW_STATE",
  code: "RAW_CODE",
  state: "RAW_STATE",
  expectedState: "RAW_STATE",
};

describe("SBL-12 sandbox callback capture evidence", () => {
  it("captures callback evidence without raw code, raw state, token exchange, or production writes", () => {
    const evidence = buildSandboxCallbackCaptureEvidence(baseInput);
    const serialized = JSON.stringify(evidence);

    expect(evidence.status).toBe("success");
    expect(evidence.mode).toBe("sandbox_callback_capture");
    expect(evidence.code).toBe("[REDACTED_CODE]");
    expect(evidence.state).toBe("[REDACTED_STATE]");
    expect(evidence.callbackUrl).toBe("[REDACTED_CALLBACK_URL]");
    expect(evidence.codeHash).toMatch(/^code_[a-f0-9]{12}$/);
    expect(evidence.stateHash).toMatch(/^state_[a-f0-9]{12}$/);
    expect(evidence.exchangeAttempted).toBe(false);
    expect(Object.values(evidence.productionWrites).every((value) => value === false)).toBe(true);
    expect(serialized).not.toContain("RAW_CODE");
    expect(serialized).not.toContain("RAW_STATE");
    expect(serialized).not.toContain("inboxpilot.example.test/api/instagram/oauth/callback");
    expect(validateSandboxCallbackCaptureEvidence(evidence)).toEqual([]);
  });

  it("requires the explicit sandbox callback capture header", () => {
    const evidence = buildSandboxCallbackCaptureEvidence({ ...baseInput, sandboxHeader: null });

    expect(evidence.status).toBe("error");
    expect(evidence.errorType).toBe("sandbox_callback_capture_header_required");
    expect(validateSandboxCallbackCaptureEvidence(evidence)).toEqual([]);
  });

  it("rejects state mismatch without exposing raw state", () => {
    const evidence = buildSandboxCallbackCaptureEvidence({ ...baseInput, expectedState: "EXPECTED_STATE" });
    const serialized = JSON.stringify(evidence);

    expect(evidence.status).toBe("error");
    expect(evidence.errorType).toBe("invalid_state");
    expect(serialized).not.toContain("RAW_STATE");
    expect(serialized).not.toContain("EXPECTED_STATE");
    expect(validateSandboxCallbackCaptureEvidence(evidence)).toEqual([]);
  });

  it("rejects workspace mismatch before treating callback capture as valid", () => {
    const evidence = buildSandboxCallbackCaptureEvidence({ ...baseInput, stateWorkspaceId: "workspace-other" });

    expect(evidence.status).toBe("error");
    expect(evidence.errorType).toBe("workspace_mismatch");
    expect(evidence.exchangeAttempted).toBe(false);
    expect(Object.values(evidence.productionWrites).every((value) => value === false)).toBe(true);
    expect(validateSandboxCallbackCaptureEvidence(evidence)).toEqual([]);
  });

  it("rejects non-allowlisted workspaces", () => {
    const evidence = buildSandboxCallbackCaptureEvidence({
      ...baseInput,
      sessionWorkspaceId: "workspace-not-allowed",
      stateWorkspaceId: "workspace-not-allowed",
    });

    expect(evidence.status).toBe("error");
    expect(evidence.errorType).toBe("workspace_not_allowed");
    expect(validateSandboxCallbackCaptureEvidence(evidence)).toEqual([]);
  });
});
