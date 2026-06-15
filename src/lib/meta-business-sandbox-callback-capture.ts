import { createHash } from "node:crypto";

import type { SandboxMetaBusinessProviderId } from "@/lib/meta-business-sandbox";

export type SandboxCallbackCaptureInput = {
  providerId: SandboxMetaBusinessProviderId;
  requestId: string;
  sessionWorkspaceId: string;
  stateWorkspaceId: string;
  sandboxHeader: string | null;
  callbackUrl: string;
  code: string | null;
  state: string | null;
  expectedState: string | null;
  allowlistedWorkspaces?: string[];
};

export type SandboxCallbackCaptureResult = {
  status: "success" | "error";
  mode: "sandbox_callback_capture";
  providerId: SandboxMetaBusinessProviderId;
  requestId: string;
  workspaceId: string;
  code: "[REDACTED_CODE]" | null;
  codeHash: string | null;
  state: "[REDACTED_STATE]" | null;
  stateHash: string | null;
  callbackUrl: "[REDACTED_CALLBACK_URL]";
  errorType: string | null;
  exchangeAttempted: false;
  productionWrites: {
    connectedAccount: false;
    channel: false;
    webhook: false;
    channelSync: false;
    tokenRefresh: false;
  };
};

const SANDBOX_CALLBACK_CAPTURE_HEADER = "sbl-callback-capture";
const DEFAULT_ALLOWLISTED_WORKSPACES = ["default-workspace", "workspace-1", "workspace_6f2a1c"];

function hashEvidence(prefix: string, value: string) {
  return `${prefix}_${createHash("sha256").update(value).digest("hex").slice(0, 12)}`;
}

function baseResult(input: SandboxCallbackCaptureInput, errorType: string | null): SandboxCallbackCaptureResult {
  return {
    status: errorType ? "error" : "success",
    mode: "sandbox_callback_capture",
    providerId: input.providerId,
    requestId: hashEvidence("req", input.requestId),
    workspaceId: hashEvidence("workspace", input.sessionWorkspaceId),
    code: input.code ? "[REDACTED_CODE]" : null,
    codeHash: input.code ? hashEvidence("code", input.code) : null,
    state: input.state ? "[REDACTED_STATE]" : null,
    stateHash: input.state ? hashEvidence("state", input.state) : null,
    callbackUrl: "[REDACTED_CALLBACK_URL]",
    errorType,
    exchangeAttempted: false,
    productionWrites: {
      connectedAccount: false,
      channel: false,
      webhook: false,
      channelSync: false,
      tokenRefresh: false,
    },
  };
}

export function buildSandboxCallbackCaptureEvidence(input: SandboxCallbackCaptureInput): SandboxCallbackCaptureResult {
  const allowlistedWorkspaces = input.allowlistedWorkspaces || DEFAULT_ALLOWLISTED_WORKSPACES;

  if (input.sandboxHeader !== SANDBOX_CALLBACK_CAPTURE_HEADER) {
    return baseResult(input, "sandbox_callback_capture_header_required");
  }
  if (!allowlistedWorkspaces.includes(input.sessionWorkspaceId)) {
    return baseResult(input, "workspace_not_allowed");
  }
  if (!input.stateWorkspaceId || input.stateWorkspaceId !== input.sessionWorkspaceId) {
    return baseResult(input, "workspace_mismatch");
  }
  if (!input.code) {
    return baseResult(input, "code_required");
  }
  if (!input.state || !input.expectedState || input.state !== input.expectedState) {
    return baseResult(input, "invalid_state");
  }

  return baseResult(input, null);
}

export function validateSandboxCallbackCaptureEvidence(result: SandboxCallbackCaptureResult) {
  const errors: string[] = [];
  const serialized = JSON.stringify(result);

  if (result.mode !== "sandbox_callback_capture") errors.push("mode_invalid");
  if (result.exchangeAttempted !== false) errors.push("exchange_must_not_be_attempted");
  if (Object.values(result.productionWrites).some((value) => value !== false)) errors.push("production_write_not_blocked");
  if (result.code && result.code !== "[REDACTED_CODE]") errors.push("raw_code_present");
  if (result.state && result.state !== "[REDACTED_STATE]") errors.push("raw_state_present");
  if (result.callbackUrl !== "[REDACTED_CALLBACK_URL]") errors.push("raw_callback_url_present");
  if (/RAW_CODE|RAW_STATE|https?:\/\/[^"]+\/callback\?/.test(serialized)) errors.push("sensitive_value_present");

  return errors;
}
