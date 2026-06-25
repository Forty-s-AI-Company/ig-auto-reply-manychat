export type InboxPilotDeploymentEnv = "production" | "staging" | "development" | "test" | "unknown";

function normalizeEnv(value: string | undefined): InboxPilotDeploymentEnv | null {
  const normalized = value?.trim().toLowerCase();
  if (
    normalized === "production" ||
    normalized === "staging" ||
    normalized === "development" ||
    normalized === "test"
  ) {
    return normalized;
  }
  return null;
}

export function getInboxPilotDeploymentEnv(): InboxPilotDeploymentEnv {
  const explicit = normalizeEnv(process.env.INBOXPILOT_DEPLOYMENT_ENV);
  if (explicit) return explicit;

  const dbEnv = normalizeEnv(process.env.INBOXPILOT_DB_ENV);
  if (dbEnv === "production" || dbEnv === "staging") return dbEnv;

  if (process.env.VERCEL_ENV === "production") return "production";
  if (process.env.VERCEL_ENV === "preview") return "staging";
  if (process.env.NODE_ENV === "test") return "test";
  if (process.env.NODE_ENV === "development") return "development";

  return "unknown";
}

export function isProductionDeploymentEnv() {
  return getInboxPilotDeploymentEnv() === "production";
}
