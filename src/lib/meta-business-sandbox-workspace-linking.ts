import type { SandboxCallbackCaptureResult } from "@/lib/meta-business-sandbox-callback-capture";
import type { SandboxMetaBusinessProviderId } from "@/lib/meta-business-sandbox";
import { maskSandboxId } from "@/lib/meta-business-sandbox";
import { assertNoSandboxSensitiveFields } from "@/lib/meta-business-sandbox-redaction";
import {
  SANDBOX_PRODUCTION_WRITE_OPERATIONS,
  blockSandboxProductionWrite,
} from "@/lib/meta-business-sandbox-write-guard";

export type SandboxWorkspaceLinkingDraftInput = {
  providerId: SandboxMetaBusinessProviderId;
  workspaceId: string;
  requestId: string;
  callbackEvidence: SandboxCallbackCaptureResult;
  selectedAssets?: {
    businessId?: string | null;
    pageId?: string | null;
    instagramAccountId?: string | null;
    instagramUsername?: string | null;
  };
};

export type SandboxWorkspaceLinkingDraft = {
  mode: "sandbox_workspace_linking_dry_run";
  providerId: SandboxMetaBusinessProviderId;
  workspaceId: string;
  requestId: string;
  callbackEvidence: {
    mode: "sandbox_callback_capture";
    status: "success" | "error";
    code: "[REDACTED_CODE]" | null;
    state: "[REDACTED_STATE]" | null;
    callbackUrl: "[REDACTED_CALLBACK_URL]";
    exchangeAttempted: false;
    productionWritesAllFalse: boolean;
  };
  connectedAccountDraft: {
    wouldCreate: false;
    providerAccountId: string;
    accountType: "instagram_business";
    displayName: string;
    tokenStored: false;
  };
  channelDraft: {
    wouldCreate: false;
    type: "instagram";
    identity: string;
    displayName: string;
    syncMode: "dry_run";
  };
  channelSyncDryRun: {
    wouldStart: false;
    selectedBusinessId: string | null;
    selectedPageId: string | null;
    selectedInstagramAccountId: string | null;
    requestedOperations: Array<"profile_read" | "message_capability_check" | "comment_capability_check" | "insights_capability_check">;
    tokenRequiredButNotPresent: true;
  };
  productionWriteGuard: {
    blocked: true;
    attemptedWrites: [];
    guardedOperations: string[];
  };
  sensitiveFindings: string[];
};

function maskOptional(prefix: string, value?: string | null) {
  return value ? maskSandboxId(prefix, value) : null;
}

function hasOnlyFalseProductionWrites(evidence: SandboxCallbackCaptureResult) {
  return Object.values(evidence.productionWrites).every((value) => value === false);
}

export function buildSandboxWorkspaceLinkingDraft(input: SandboxWorkspaceLinkingDraftInput): SandboxWorkspaceLinkingDraft {
  const instagramIdentity =
    maskOptional("ig", input.selectedAssets?.instagramAccountId) ||
    input.callbackEvidence.codeHash ||
    maskSandboxId("ig", input.requestId);
  const displayName = input.selectedAssets?.instagramUsername
    ? `@${input.selectedAssets.instagramUsername}`
    : "Instagram Business Sandbox";
  const guardResults = SANDBOX_PRODUCTION_WRITE_OPERATIONS.map(blockSandboxProductionWrite);
  if (!guardResults.every((result) => result.allowed === false)) {
    throw new Error("Sandbox production write guard must block every operation.");
  }

  const draft: SandboxWorkspaceLinkingDraft = {
    mode: "sandbox_workspace_linking_dry_run",
    providerId: input.providerId,
    workspaceId: maskSandboxId("workspace", input.workspaceId),
    requestId: maskSandboxId("req", input.requestId),
    callbackEvidence: {
      mode: "sandbox_callback_capture",
      status: input.callbackEvidence.status,
      code: input.callbackEvidence.code,
      state: input.callbackEvidence.state,
      callbackUrl: input.callbackEvidence.callbackUrl,
      exchangeAttempted: false,
      productionWritesAllFalse: hasOnlyFalseProductionWrites(input.callbackEvidence),
    },
    connectedAccountDraft: {
      wouldCreate: false,
      providerAccountId: instagramIdentity,
      accountType: "instagram_business",
      displayName,
      tokenStored: false,
    },
    channelDraft: {
      wouldCreate: false,
      type: "instagram",
      identity: instagramIdentity,
      displayName,
      syncMode: "dry_run",
    },
    channelSyncDryRun: {
      wouldStart: false,
      selectedBusinessId: maskOptional("business", input.selectedAssets?.businessId),
      selectedPageId: maskOptional("page", input.selectedAssets?.pageId),
      selectedInstagramAccountId: maskOptional("ig", input.selectedAssets?.instagramAccountId),
      requestedOperations: [
        "profile_read",
        "message_capability_check",
        "comment_capability_check",
        "insights_capability_check",
      ],
      tokenRequiredButNotPresent: true,
    },
    productionWriteGuard: {
      blocked: true,
      attemptedWrites: [],
      guardedOperations: guardResults.map((result) => result.operation),
    },
    sensitiveFindings: [],
  };

  return {
    ...draft,
    sensitiveFindings: assertNoSandboxSensitiveFields(draft),
  };
}

export function validateSandboxWorkspaceLinkingDraft(draft: SandboxWorkspaceLinkingDraft) {
  const errors: string[] = [];

  if (draft.mode !== "sandbox_workspace_linking_dry_run") errors.push("mode_invalid");
  if (draft.callbackEvidence.mode !== "sandbox_callback_capture") errors.push("callback_evidence_mode_invalid");
  if (draft.callbackEvidence.exchangeAttempted !== false) errors.push("exchange_must_not_be_attempted");
  if (!draft.callbackEvidence.productionWritesAllFalse) errors.push("callback_production_writes_not_false");
  if (draft.connectedAccountDraft.wouldCreate !== false) errors.push("connected_account_must_not_be_created");
  if (draft.connectedAccountDraft.tokenStored !== false) errors.push("token_must_not_be_stored");
  if (draft.channelDraft.wouldCreate !== false) errors.push("channel_must_not_be_created");
  if (draft.channelDraft.syncMode !== "dry_run") errors.push("channel_sync_must_be_dry_run");
  if (draft.channelSyncDryRun.wouldStart !== false) errors.push("channel_sync_must_not_start");
  if (draft.channelSyncDryRun.tokenRequiredButNotPresent !== true) errors.push("token_must_remain_absent");
  if (!draft.productionWriteGuard.blocked) errors.push("production_write_guard_not_blocked");
  if (draft.productionWriteGuard.attemptedWrites.length > 0) errors.push("production_write_attempts_present");
  if (draft.sensitiveFindings.length > 0) errors.push("sensitive_findings_present");

  return errors;
}
