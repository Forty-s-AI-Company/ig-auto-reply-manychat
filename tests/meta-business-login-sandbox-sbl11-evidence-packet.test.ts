import { describe, expect, it } from "vitest";

import {
  buildSandboxAuthorizeDryRunPayload,
  buildSandboxCallbackIntegratedDryRunPayload,
  type SandboxDryRunPayload,
} from "@/lib/meta-business-sandbox";
import {
  buildMetaBusinessSandboxEvidencePacket,
  validateMetaBusinessSandboxEvidencePacket,
} from "@/lib/meta-business-sandbox-evidence";

async function buildCallbackPayload() {
  return buildSandboxCallbackIntegratedDryRunPayload({
    providerId: "meta-business-facebook-sandbox",
    workspaceId: "default-workspace",
    requestId: "req-evidence-test",
    transport: "popup",
    query: new URLSearchParams({ code: "RAW_CODE", state: "RAW_STATE" }),
  });
}

describe("SBL-11 Meta Business Login sandbox evidence packet", () => {
  it("builds a redacted local dry-run evidence packet while keeping beta and production blocked", async () => {
    const authorizePayload = buildSandboxAuthorizeDryRunPayload({
      providerId: "meta-business-facebook-sandbox",
      workspaceId: "default-workspace",
      requestId: "req-evidence-test",
      userId: "user-1",
      transport: "popup",
    });
    const callbackPayload = await buildCallbackPayload();
    const packet = buildMetaBusinessSandboxEvidencePacket({
      runId: "run-evidence-test",
      providerId: "meta-business-facebook-sandbox",
      workspaceId: "default-workspace",
      authorizePayload,
      callbackPayload,
    });

    expect(packet.mode).toBe("sandbox_evidence_packet");
    expect(packet.runId).toMatch(/^run_[a-f0-9]{10}$/);
    expect(packet.workspaceId).toMatch(/^workspace_[a-f0-9]{10}$/);
    expect(packet.sensitiveFindings).toEqual([]);
    expect(packet.productionWritesBlocked).toBe(true);
    expect(packet.gates.localDryRun.status).toBe("pass");
    expect(packet.gates.externalMetaEvidence.status).toBe("hold");
    expect(packet.gates.internalBeta.status).toBe("no_go");
    expect(packet.gates.productionImplementation.status).toBe("no_go");
    expect(JSON.stringify(packet)).not.toContain("RAW_CODE");
    expect(JSON.stringify(packet)).not.toContain("RAW_STATE");
    expect(validateMetaBusinessSandboxEvidencePacket(packet)).toEqual([]);
  });

  it("keeps production implementation no-go even when external evidence flags are present", async () => {
    const authorizePayload = buildSandboxAuthorizeDryRunPayload({
      providerId: "meta-business-instagram-sandbox",
      workspaceId: "default-workspace",
      requestId: "req-evidence-test",
      userId: "user-1",
      transport: "mobile_redirect",
    });
    const callbackPayload = await buildSandboxCallbackIntegratedDryRunPayload({
      providerId: "meta-business-instagram-sandbox",
      workspaceId: "default-workspace",
      requestId: "req-evidence-test",
      transport: "mobile_redirect",
      query: new URLSearchParams({ code: "RAW_CODE", state: "RAW_STATE" }),
    });
    const packet = buildMetaBusinessSandboxEvidencePacket({
      runId: "run-evidence-test",
      providerId: "meta-business-instagram-sandbox",
      workspaceId: "default-workspace",
      authorizePayload,
      callbackPayload,
      externalEvidence: {
        metaDialogCaptured: true,
        accountSelectionCaptured: true,
        redactedCallbackCaptured: true,
        reviewerDemoCaptured: true,
      },
    });

    expect(packet.gates.externalMetaEvidence.status).toBe("pass");
    expect(packet.gates.internalBeta.status).toBe("hold");
    expect(packet.gates.productionImplementation.status).toBe("no_go");
    expect(validateMetaBusinessSandboxEvidencePacket(packet)).toEqual([]);
  });

  it("reports hold when production write guard evidence is missing", async () => {
    const authorizePayload = buildSandboxAuthorizeDryRunPayload({
      providerId: "meta-business-facebook-sandbox",
      workspaceId: "default-workspace",
      requestId: "req-evidence-test",
      userId: "user-1",
    });
    const callbackPayload: SandboxDryRunPayload = {
      ...authorizePayload,
      auth: { ...authorizePayload.auth, code: "[REDACTED_CODE]" },
    };
    const packet = buildMetaBusinessSandboxEvidencePacket({
      runId: "run-evidence-test",
      providerId: "meta-business-facebook-sandbox",
      workspaceId: "default-workspace",
      authorizePayload,
      callbackPayload,
    });

    expect(packet.productionWritesBlocked).toBe(false);
    expect(packet.gates.localDryRun.status).toBe("hold");
    expect(validateMetaBusinessSandboxEvidencePacket(packet)).toContain("production_writes_not_blocked");
  });
});
