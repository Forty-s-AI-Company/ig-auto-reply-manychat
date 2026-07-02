import { describe, expect, it } from "vitest";
import { validateSandboxWorkspaceAllowlist } from "@/lib/meta-business-sandbox-allowlist";

describe("SBL-07 Meta Business Login sandbox workspace allowlist guard", () => {
  it("allows session workspace from allowlist", () => {
    expect(validateSandboxWorkspaceAllowlist({ sessionWorkspaceId: "default-workspace" })).toEqual({
      ok: true,
      workspaceId: "default-workspace",
    });
  });

  it("rejects missing and non-allowlisted workspaces", () => {
    expect(validateSandboxWorkspaceAllowlist({ sessionWorkspaceId: null })).toEqual({
      ok: false,
      errorType: "workspace_required",
    });
    expect(validateSandboxWorkspaceAllowlist({ sessionWorkspaceId: "workspace-not-allowed" })).toEqual({
      ok: false,
      errorType: "workspace_not_allowed",
    });
  });

  it("rejects query workspace spoofing", () => {
    expect(
      validateSandboxWorkspaceAllowlist({
        sessionWorkspaceId: "default-workspace",
        queryWorkspaceId: "workspace-not-allowed",
      }),
    ).toEqual({ ok: false, errorType: "workspace_spoofing_detected" });
  });
});
