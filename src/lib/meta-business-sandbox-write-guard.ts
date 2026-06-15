export type SandboxProductionWriteOperation =
  | "connectedAccount.create"
  | "connectedAccount.updateToken"
  | "channel.create"
  | "channel.update"
  | "webhook.register"
  | "channel.sync"
  | "token.refresh";

export type SandboxProductionWriteGuardResult = {
  allowed: false;
  errorType: "production_write_blocked";
  operation: SandboxProductionWriteOperation;
  mode: "dry_run";
};

export const SANDBOX_PRODUCTION_WRITE_OPERATIONS: SandboxProductionWriteOperation[] = [
  "connectedAccount.create",
  "connectedAccount.updateToken",
  "channel.create",
  "channel.update",
  "webhook.register",
  "channel.sync",
  "token.refresh",
];

export function blockSandboxProductionWrite(operation: SandboxProductionWriteOperation): SandboxProductionWriteGuardResult {
  return {
    allowed: false,
    errorType: "production_write_blocked",
    operation,
    mode: "dry_run",
  };
}

export function assertSandboxProductionWritesBlocked(results: SandboxProductionWriteGuardResult[]) {
  return results
    .filter((result) => result.allowed !== false || result.errorType !== "production_write_blocked" || result.mode !== "dry_run")
    .map((result) => result.operation);
}
