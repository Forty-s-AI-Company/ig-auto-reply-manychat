import { describe, expect, it } from "vitest";

import { buildSandboxCallbackCaptureEvidence } from "@/lib/meta-business-sandbox-callback-capture";
import {
  buildSandboxWorkspaceLinkingDraft,
  validateSandboxWorkspaceLinkingDraft,
} from "@/lib/meta-business-sandbox-workspace-linking";
import { assertSbl09Redacted } from "./helpers/sbl09-redaction";

function buildCallbackEvidence() {
  return buildSandboxCallbackCaptureEvidence({
    providerId: "meta-business-instagram-sandbox",
    requestId: "req-sbl13-callback",
    sessionWorkspaceId: "default-workspace",
    stateWorkspaceId: "default-workspace",
    sandboxHeader: "sbl-callback-capture",
    callbackUrl: "https://inboxpilot.example.test/api/instagram/oauth/callback?code=RAW_CODE&state=RAW_STATE",
    code: "RAW_CODE",
    state: "RAW_STATE",
    expectedState: "RAW_STATE",
  });
}

describe("SBL-13 sandbox workspace linking and channel sync dry-run", () => {
  it("maps redacted callback evidence into workspace linking and channel sync drafts without production writes", () => {
    const callbackEvidence = buildCallbackEvidence();
    const draft = buildSandboxWorkspaceLinkingDraft({
      providerId: "meta-business-instagram-sandbox",
      workspaceId: "default-workspace",
      requestId: "req-sbl13-linking",
      callbackEvidence,
      selectedAssets: {
        businessId: "123456789",
        pageId: "987654321",
        instagramAccountId: "111222333",
        instagramUsername: "carry.digital.nomad",
      },
    });
    const serialized = JSON.stringify(draft);

    expect(draft.mode).toBe("sandbox_workspace_linking_dry_run");
    expect(draft.callbackEvidence.mode).toBe("sandbox_callback_capture");
    expect(draft.callbackEvidence.code).toBe("[REDACTED_CODE]");
    expect(draft.callbackEvidence.state).toBe("[REDACTED_STATE]");
    expect(draft.callbackEvidence.callbackUrl).toBe("[REDACTED_CALLBACK_URL]");
    expect(draft.callbackEvidence.exchangeAttempted).toBe(false);
    expect(draft.callbackEvidence.productionWritesAllFalse).toBe(true);
    expect(draft.connectedAccountDraft.wouldCreate).toBe(false);
    expect(draft.connectedAccountDraft.tokenStored).toBe(false);
    expect(draft.channelDraft.wouldCreate).toBe(false);
    expect(draft.channelDraft.syncMode).toBe("dry_run");
    expect(draft.channelSyncDryRun.wouldStart).toBe(false);
    expect(draft.channelSyncDryRun.tokenRequiredButNotPresent).toBe(true);
    expect(draft.channelSyncDryRun.selectedBusinessId).toMatch(/^business_[a-f0-9]{8}$/);
    expect(draft.channelSyncDryRun.selectedPageId).toMatch(/^page_[a-f0-9]{8}$/);
    expect(draft.channelSyncDryRun.selectedInstagramAccountId).toMatch(/^ig_[a-f0-9]{8}$/);
    expect(draft.productionWriteGuard.blocked).toBe(true);
    expect(draft.productionWriteGuard.attemptedWrites).toEqual([]);
    expect(draft.sensitiveFindings).toEqual([]);
    expect(validateSandboxWorkspaceLinkingDraft(draft)).toEqual([]);
    expect(serialized).not.toContain("RAW_CODE");
    expect(serialized).not.toContain("RAW_STATE");
    expect(serialized).not.toContain("123456789");
    expect(serialized).not.toContain("987654321");
    expect(serialized).not.toContain("111222333");
    expect(() => assertSbl09Redacted(serialized)).not.toThrow();
  });

  it("keeps the draft invalid when callback evidence does not prove production writes are false", () => {
    const callbackEvidence = {
      ...buildCallbackEvidence(),
      productionWrites: {
        connectedAccount: false,
        channel: true,
        webhook: false,
        channelSync: false,
        tokenRefresh: false,
      },
    };
    const draft = buildSandboxWorkspaceLinkingDraft({
      providerId: "meta-business-instagram-sandbox",
      workspaceId: "default-workspace",
      requestId: "req-sbl13-linking",
      callbackEvidence,
    });

    expect(draft.callbackEvidence.productionWritesAllFalse).toBe(false);
    expect(validateSandboxWorkspaceLinkingDraft(draft)).toContain("callback_production_writes_not_false");
    expect(draft.connectedAccountDraft.wouldCreate).toBe(false);
    expect(draft.channelDraft.wouldCreate).toBe(false);
    expect(draft.channelSyncDryRun.wouldStart).toBe(false);
  });
});
