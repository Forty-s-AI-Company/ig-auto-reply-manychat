const DEFAULT_SANDBOX_WORKSPACES = ["default-workspace", "workspace-1", "workspace_6f2a1c"];

export type SandboxWorkspaceAllowlistResult =
  | { ok: true; workspaceId: string }
  | { ok: false; errorType: "workspace_required" | "workspace_not_allowed" | "workspace_spoofing_detected" };

export function getSandboxWorkspaceAllowlist() {
  return new Set(DEFAULT_SANDBOX_WORKSPACES);
}

export function validateSandboxWorkspaceAllowlist(input: {
  sessionWorkspaceId: string | null | undefined;
  queryWorkspaceId?: string | null;
  allowedWorkspaceIds?: Set<string>;
}): SandboxWorkspaceAllowlistResult {
  if (!input.sessionWorkspaceId) return { ok: false, errorType: "workspace_required" };
  if (input.queryWorkspaceId && input.queryWorkspaceId !== input.sessionWorkspaceId) {
    return { ok: false, errorType: "workspace_spoofing_detected" };
  }
  const allowlist = input.allowedWorkspaceIds || getSandboxWorkspaceAllowlist();
  if (!allowlist.has(input.sessionWorkspaceId)) return { ok: false, errorType: "workspace_not_allowed" };
  return { ok: true, workspaceId: input.sessionWorkspaceId };
}
