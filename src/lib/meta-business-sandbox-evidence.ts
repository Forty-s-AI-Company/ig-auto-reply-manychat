import { createHash } from "node:crypto";

import type { SandboxDryRunPayload, SandboxMetaBusinessProviderId } from "@/lib/meta-business-sandbox";
import { assertNoSandboxSensitiveFields, redactMetaBusinessSandboxPayload } from "@/lib/meta-business-sandbox-redaction";

type GateStatus = "pass" | "hold" | "no_go";

export type SandboxEvidencePacketInput = {
  runId: string;
  providerId: SandboxMetaBusinessProviderId;
  workspaceId: string;
  authorizePayload: SandboxDryRunPayload;
  callbackPayload: SandboxDryRunPayload & {
    codeExchange?: { exchangeAttempted: boolean; status: string };
    productionWriteGuard?: { blocked: boolean; attemptedWrites: string[] };
  };
  externalEvidence?: {
    metaDialogCaptured: boolean;
    accountSelectionCaptured: boolean;
    redactedCallbackCaptured: boolean;
    reviewerDemoCaptured: boolean;
  };
};

function hashEvidenceId(prefix: string, value: string) {
  return `${prefix}_${createHash("sha256").update(value).digest("hex").slice(0, 10)}`;
}

function hasOnlyFalseWrites(payload: SandboxDryRunPayload) {
  return Object.values(payload.writes).every((value) => value === false);
}

function buildGate(status: GateStatus, reason: string) {
  return { status, reason };
}

export function buildMetaBusinessSandboxEvidencePacket(input: SandboxEvidencePacketInput) {
  const externalEvidence = input.externalEvidence || {
    metaDialogCaptured: false,
    accountSelectionCaptured: false,
    redactedCallbackCaptured: false,
    reviewerDemoCaptured: false,
  };

  const redactedAuthorizePayload = redactMetaBusinessSandboxPayload(input.authorizePayload);
  const redactedCallbackPayload = redactMetaBusinessSandboxPayload(input.callbackPayload);
  const sensitiveFindings = [
    ...assertNoSandboxSensitiveFields(redactedAuthorizePayload),
    ...assertNoSandboxSensitiveFields(redactedCallbackPayload),
  ];
  const productionWritesBlocked =
    hasOnlyFalseWrites(input.authorizePayload) &&
    hasOnlyFalseWrites(input.callbackPayload) &&
    input.callbackPayload.productionWriteGuard?.blocked === true &&
    input.callbackPayload.productionWriteGuard.attemptedWrites.length === 0;

  const localDryRunReady =
    input.authorizePayload.mode === "dry_run" &&
    input.callbackPayload.mode === "dry_run" &&
    input.callbackPayload.auth.exchangeAttempted === false &&
    input.callbackPayload.codeExchange?.exchangeAttempted === false &&
    productionWritesBlocked &&
    sensitiveFindings.length === 0;

  const appReviewEvidenceReady =
    externalEvidence.metaDialogCaptured &&
    externalEvidence.accountSelectionCaptured &&
    externalEvidence.redactedCallbackCaptured &&
    externalEvidence.reviewerDemoCaptured;

  const gates = {
    localDryRun: localDryRunReady
      ? buildGate("pass", "local_dry_run_payloads_are_redacted_and_write_blocked")
      : buildGate("hold", "local_dry_run_payloads_need_redaction_or_write_guard_fix"),
    externalMetaEvidence: appReviewEvidenceReady
      ? buildGate("pass", "external_meta_dialog_and_reviewer_evidence_captured")
      : buildGate("hold", "real_meta_dialog_account_selection_callback_and_reviewer_evidence_missing"),
    internalBeta: appReviewEvidenceReady && localDryRunReady
      ? buildGate("hold", "requires_manual_go_no_go_review_before_internal_beta")
      : buildGate("no_go", "missing_required_sandbox_execution_evidence"),
    productionImplementation: buildGate("no_go", "production_implementation_requires_app_review_and_real_execution_evidence"),
  };

  return {
    packetVersion: 1,
    mode: "sandbox_evidence_packet",
    runId: hashEvidenceId("run", input.runId),
    providerId: input.providerId,
    workspaceId: hashEvidenceId("workspace", input.workspaceId),
    authorize: redactedAuthorizePayload,
    callback: redactedCallbackPayload,
    externalEvidence,
    sensitiveFindings,
    productionWritesBlocked,
    gates,
  };
}

export function validateMetaBusinessSandboxEvidencePacket(packet: ReturnType<typeof buildMetaBusinessSandboxEvidencePacket>) {
  const errors: string[] = [];

  if (packet.mode !== "sandbox_evidence_packet") errors.push("packet_mode_invalid");
  if (packet.sensitiveFindings.length > 0) errors.push("sensitive_findings_present");
  if (!packet.productionWritesBlocked) errors.push("production_writes_not_blocked");
  if (packet.authorize.mode !== "dry_run") errors.push("authorize_mode_must_be_dry_run");
  if (packet.callback.mode !== "dry_run") errors.push("callback_mode_must_be_dry_run");
  if (packet.gates.productionImplementation.status !== "no_go") errors.push("production_gate_must_remain_no_go");

  return errors;
}
