import { createHash } from "node:crypto";
import { validateSandboxWorkspaceAllowlist } from "@/lib/meta-business-sandbox-allowlist";
import { exchangeSandboxAuthorizationCode } from "@/lib/meta-business-sandbox-code-exchange";
import { buildMetaBusinessSandboxDryRunPayload } from "@/lib/meta-business-sandbox-dry-run";
import { createSandboxOAuthState } from "@/lib/meta-business-sandbox-state";
import { SANDBOX_PRODUCTION_WRITE_OPERATIONS, blockSandboxProductionWrite } from "@/lib/meta-business-sandbox-write-guard";

export type SandboxMetaBusinessProviderId =
  | "meta-business-facebook-sandbox"
  | "meta-business-instagram-sandbox";

export type SandboxFlowType = "facebook_login_for_business" | "instagram_business_login";
export type SandboxTransport = "popup" | "redirect" | "mobile_redirect" | "mobile_in_app_browser";

export type SandboxAccessInput = {
  nodeEnv: string | undefined;
  providerId: string;
  workspaceId: string;
  queryWorkspaceId?: string | null;
  user: { id: string; role?: string | null } | null;
  sandboxHeader: string | null;
};

export type SandboxDryRunPayload = {
  status: "success" | "error";
  mode: "dry_run";
  provider: SandboxMetaBusinessProviderId;
  flowType: SandboxFlowType;
  workspaceId: string;
  requestId: string;
  errorType: string | null;
  auth: {
    state: "[REDACTED_STATE]";
    nonce: "[REDACTED_NONCE]";
    code: "[REDACTED_CODE]" | null;
    exchangeAttempted: false;
  };
  stateRecord?: {
    state: "[REDACTED_STATE]";
    nonce: "[REDACTED_NONCE]";
    stateId: string;
    nonceId: string;
  };
  authorize?: {
    host: "www.facebook.com";
    path: "/dialog/oauth";
    queryKeys: string[];
    responseType: "code";
    redactedUrl: "[REDACTED_AUTHORIZE_URL]";
  };
  writes: {
    wouldCreateConnectedAccount: false;
    wouldCreateChannel: false;
    wouldRegisterWebhook: false;
    wouldStartChannelSync: false;
    wouldScheduleTokenRefresh: false;
  };
};

const SANDBOX_HEADER_VALUE = "sbl-01";
export function isSandboxMetaBusinessProviderId(providerId: string): providerId is SandboxMetaBusinessProviderId {
  return providerId === "meta-business-facebook-sandbox" || providerId === "meta-business-instagram-sandbox";
}

export function getSandboxMetaBusinessFlowType(providerId: SandboxMetaBusinessProviderId): SandboxFlowType {
  return providerId === "meta-business-facebook-sandbox" ? "facebook_login_for_business" : "instagram_business_login";
}

export function maskSandboxId(prefix: string, value: string) {
  const hash = createHash("sha256").update(value).digest("hex").slice(0, 8);
  return `${prefix}_${hash}`;
}

export function readSandboxTransport(value: string | null): SandboxTransport {
  if (value === "redirect" || value === "mobile_redirect" || value === "mobile_in_app_browser") return value;
  return "popup";
}

export function validateSandboxAccess(input: SandboxAccessInput): { ok: true } | { ok: false; status: number; errorType: string } {
  if (input.nodeEnv === "production") return { ok: false, status: 404, errorType: "sandbox_disabled_in_production" };
  if (!isSandboxMetaBusinessProviderId(input.providerId)) return { ok: false, status: 404, errorType: "unsupported_provider" };
  if (!input.user) return { ok: false, status: 401, errorType: "unauthorized" };
  if (input.user.role !== "admin") return { ok: false, status: 403, errorType: "internal_only" };
  if (input.sandboxHeader !== SANDBOX_HEADER_VALUE) return { ok: false, status: 403, errorType: "sandbox_header_required" };
  const workspace = validateSandboxWorkspaceAllowlist({
    sessionWorkspaceId: input.workspaceId,
    queryWorkspaceId: input.queryWorkspaceId,
  });
  if (!workspace.ok) return { ok: false, status: 403, errorType: workspace.errorType };
  return { ok: true };
}

function baseDryRunPayload(input: {
  providerId: SandboxMetaBusinessProviderId;
  workspaceId: string;
  requestId: string;
  code?: string | null;
  errorType?: string | null;
}): SandboxDryRunPayload {
  return {
    status: input.errorType ? "error" : "success",
    mode: "dry_run",
    provider: input.providerId,
    flowType: getSandboxMetaBusinessFlowType(input.providerId),
    workspaceId: maskSandboxId("workspace", input.workspaceId),
    requestId: maskSandboxId("req", input.requestId),
    errorType: input.errorType || null,
    auth: {
      state: "[REDACTED_STATE]",
      nonce: "[REDACTED_NONCE]",
      code: input.code ? "[REDACTED_CODE]" : null,
      exchangeAttempted: false,
    },
    writes: {
      wouldCreateConnectedAccount: false,
      wouldCreateChannel: false,
      wouldRegisterWebhook: false,
      wouldStartChannelSync: false,
      wouldScheduleTokenRefresh: false,
    },
  };
}

export function buildSandboxAuthorizeDryRunPayload(input: {
  providerId: SandboxMetaBusinessProviderId;
  workspaceId: string;
  requestId: string;
  userId?: string;
  transport?: SandboxTransport;
}): SandboxDryRunPayload {
  const state = createSandboxOAuthState({
    workspaceId: input.workspaceId,
    userId: input.userId || "sandbox-user",
    providerId: input.providerId,
    transport: input.transport || "popup",
  });
  return {
    ...baseDryRunPayload(input),
    stateRecord: state.redacted,
    authorize: {
      host: "www.facebook.com",
      path: "/dialog/oauth",
      queryKeys: ["client_id", "redirect_uri", "scope", "state", "response_type"],
      responseType: "code",
      redactedUrl: "[REDACTED_AUTHORIZE_URL]",
    },
  };
}

export async function buildSandboxCallbackIntegratedDryRunPayload(input: {
  providerId: SandboxMetaBusinessProviderId;
  workspaceId: string;
  requestId: string;
  transport: SandboxTransport;
  query: URLSearchParams;
}) {
  const base = buildSandboxCallbackDryRunPayload(input);
  const codeExchange = await exchangeSandboxAuthorizationCode({
    providerId: input.providerId,
    code: input.query.get("code"),
    redirectUri: null,
  });
  const dryRunEvidence = buildMetaBusinessSandboxDryRunPayload({
    providerId: input.providerId,
    flowType: getSandboxMetaBusinessFlowType(input.providerId),
    transport: input.transport,
    workspaceId: input.workspaceId,
    requestId: input.requestId,
    errorType: base.errorType,
  });
  const writeGuardResults = SANDBOX_PRODUCTION_WRITE_OPERATIONS.map(blockSandboxProductionWrite);

  return {
    ...base,
    codeExchange,
    dryRunEvidence,
    productionWriteGuard: {
      blocked: writeGuardResults.every((result) => result.allowed === false),
      attemptedWrites: [],
      guardedOperations: writeGuardResults.map((result) => result.operation),
    },
  };
}

export function buildSandboxCallbackDryRunPayload(input: {
  providerId: SandboxMetaBusinessProviderId;
  workspaceId: string;
  requestId: string;
  query: URLSearchParams;
}): SandboxDryRunPayload {
  const userError = input.query.get("error");
  if (userError) {
    return baseDryRunPayload({
      ...input,
      errorType: userError === "access_denied" ? "user_cancel" : "permission_denied",
    });
  }

  const code = input.query.get("code");
  const state = input.query.get("state");
  if (!state) return baseDryRunPayload({ ...input, errorType: "invalid_state" });
  if (!code) return baseDryRunPayload({ ...input, errorType: "code_required" });

  return baseDryRunPayload({ ...input, code });
}

export function validateSandboxNoProductionWrites(payload: Pick<SandboxDryRunPayload, "writes">) {
  return Object.entries(payload.writes)
    .filter(([, value]) => value !== false)
    .map(([key]) => key);
}
