import type { SandboxFlowType, SandboxMetaBusinessProviderId, SandboxTransport } from "@/lib/meta-business-sandbox";
import { createMetaBusinessSandboxAuditEvent } from "@/lib/meta-business-sandbox-redaction";

export type SandboxSelectedAssets = {
  businessId?: string | null;
  pageId?: string | null;
  instagramAccountId?: string | null;
};

export type SandboxDryRunBuildInput = {
  providerId: SandboxMetaBusinessProviderId;
  flowType: SandboxFlowType;
  transport: SandboxTransport;
  workspaceId: string;
  requestId: string;
  selectedAssets?: SandboxSelectedAssets;
  errorType?: string | null;
};

export function buildMetaBusinessSandboxDryRunPayload(input: SandboxDryRunBuildInput) {
  const audit = createMetaBusinessSandboxAuditEvent({
    event: "meta_business_sandbox_callback_dry_run",
    providerId: input.providerId,
    flowType: input.flowType,
    workspaceId: input.workspaceId,
    requestId: input.requestId,
    selectedBusinessId: input.selectedAssets?.businessId || null,
    selectedPageId: input.selectedAssets?.pageId || null,
    selectedInstagramAccountId: input.selectedAssets?.instagramAccountId || null,
    result: input.errorType ? "error" : "success",
    errorType: input.errorType || null,
  });

  return {
    status: input.errorType ? "error" : "success",
    mode: "dry_run",
    provider: input.providerId,
    flowType: input.flowType,
    transport: input.transport,
    workspaceId: audit.workspaceId,
    requestId: audit.requestId,
    selectedBusinessId: audit.selectedBusinessId,
    selectedPageId: audit.selectedPageId,
    selectedInstagramAccountId: audit.selectedInstagramAccountId,
    selectedAssetCount: audit.selectedAssetCount,
    errorType: input.errorType || null,
    wouldCreateConnectedAccount: false,
    wouldCreateChannel: false,
    wouldRegisterWebhook: false,
    wouldStartChannelSync: false,
    wouldScheduleTokenRefresh: false,
    audit,
  };
}

export function validateMetaBusinessSandboxDryRunPayload(payload: ReturnType<typeof buildMetaBusinessSandboxDryRunPayload>) {
  const errors: string[] = [];
  if (payload.mode !== "dry_run") errors.push("mode_must_be_dry_run");
  if (payload.wouldCreateConnectedAccount !== false) errors.push("connected_account_write_must_be_false");
  if (payload.wouldCreateChannel !== false) errors.push("channel_write_must_be_false");
  if (payload.wouldRegisterWebhook !== false) errors.push("webhook_write_must_be_false");
  if (payload.wouldStartChannelSync !== false) errors.push("channel_sync_must_be_false");
  if (payload.wouldScheduleTokenRefresh !== false) errors.push("token_refresh_must_be_false");
  return errors;
}
