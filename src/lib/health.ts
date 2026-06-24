import { getDb } from "@/lib/db";
import { getReleaseChannelForHost, type ReleaseChannel } from "@/lib/release-mode";

export type HealthCheckState = "ok" | "degraded" | "down";
export type DeploymentEnvironment = "production" | "staging" | "preview" | "development" | "test" | "unknown";

export type HealthCheckResult = {
  status: HealthCheckState;
  checks: {
    database: {
      ok: boolean;
    };
    redis: {
      configured: boolean;
      ok: boolean;
      reason?: string;
    };
  };
  timestamp: string;
  service: string;
};

export type StagingHealthCheckResult = HealthCheckResult & {
  environment: {
    deployment: DeploymentEnvironment;
    dbEnv: string | null;
    releaseChannel: ReleaseChannel;
    vercelEnv: string | null;
    vercelGitCommitRef: string | null;
  };
  checks: HealthCheckResult["checks"] & {
    staging: {
      ok: boolean;
      hostOk: boolean;
      releaseChannelOk: boolean;
      dbEnvOk: boolean;
      databaseUrlPresent: boolean;
      directUrlPresent: boolean;
      expectedSupabaseProjectRefConfigured: boolean;
      databaseProjectRefOk: boolean | null;
      directProjectRefOk: boolean | null;
      reasons: string[];
    };
  };
};

async function pingRedis() {
  const redisUrl = process.env.REDIS_URL?.trim();
  if (!redisUrl) {
    return { configured: false, ok: false, reason: "not_configured" as const };
  }

  try {
    const { default: Redis } = await import("ioredis");
    const redis = new Redis(redisUrl, {
      enableReadyCheck: false,
      lazyConnect: true,
      maxRetriesPerRequest: 1,
    });

    try {
      await redis.ping();
      return { configured: true, ok: true };
    } finally {
      redis.disconnect();
    }
  } catch (error) {
    const reason = error instanceof Error ? error.message : "redis_unavailable";
    return { configured: true, ok: false, reason };
  }
}

async function checkDatabase() {
  try {
    const db = getDb();
    await db.$queryRaw`SELECT 1`;
    return { ok: true };
  } catch {
    return { ok: false };
  }
}

export async function getHealthCheckResult(): Promise<HealthCheckResult> {
  const [database, redis] = await Promise.all([checkDatabase(), pingRedis()]);

  const status: HealthCheckState = !database.ok
    ? "down"
    : redis.configured && !redis.ok
      ? "down"
      : redis.configured
        ? "ok"
        : "degraded";

  return {
    status,
    checks: {
      database,
      redis,
    },
    timestamp: new Date().toISOString(),
    service: "inboxpilot",
  };
}

function normalizeHost(host: string) {
  return host.split(":")[0]?.toLowerCase() || "";
}

function normalizeEnv(value: string | undefined) {
  const normalized = value?.trim().toLowerCase();
  return normalized || null;
}

function getDeploymentEnvironment(host: string): DeploymentEnvironment {
  const explicit = normalizeEnv(process.env.INBOXPILOT_DEPLOYMENT_ENV);
  if (explicit === "production" || explicit === "staging" || explicit === "development" || explicit === "test") {
    return explicit;
  }

  const vercelEnv = normalizeEnv(process.env.VERCEL_ENV);
  if (vercelEnv === "production") return "production";
  if (vercelEnv === "preview" && process.env.VERCEL_GIT_COMMIT_REF === "staging") return "staging";
  if (vercelEnv === "preview") return "preview";
  if (vercelEnv === "development") return "development";
  if (process.env.NODE_ENV === "test") return "test";
  if (normalizeHost(host) === "staging.carry-digital-nomad.in.net") return "staging";
  return "unknown";
}

function extractSupabaseProjectRef(value: string | undefined) {
  if (!value) return null;

  try {
    const url = new URL(value);
    const username = decodeURIComponent(url.username);
    const usernameMatch = username.match(/^postgres\.([a-z0-9-]+)$/i);
    if (usernameMatch?.[1]) return usernameMatch[1].toLowerCase();

    const directHostMatch = url.hostname.match(/^db\.([a-z0-9-]+)\.supabase\.co$/i);
    if (directHostMatch?.[1]) return directHostMatch[1].toLowerCase();

    return null;
  } catch {
    return null;
  }
}

function compareSupabaseProjectRef(value: string | undefined, expectedRef: string | null) {
  if (!value || !expectedRef) return null;
  return extractSupabaseProjectRef(value) === expectedRef;
}

export async function getStagingHealthCheckResult(host: string): Promise<StagingHealthCheckResult> {
  const base = await getHealthCheckResult();
  const releaseChannel = getReleaseChannelForHost(host);
  const deployment = getDeploymentEnvironment(host);
  const dbEnv = normalizeEnv(process.env.INBOXPILOT_DB_ENV);
  const expectedProjectRef = normalizeEnv(process.env.STAGING_SUPABASE_PROJECT_REF);

  const databaseUrl = process.env.DATABASE_URL;
  const directUrl = process.env.DIRECT_URL;
  const databaseProjectRefOk = compareSupabaseProjectRef(databaseUrl, expectedProjectRef);
  const directProjectRefOk = compareSupabaseProjectRef(directUrl, expectedProjectRef);

  const reasons: string[] = [];
  const hostOk = deployment === "staging" || normalizeHost(host) === "staging.carry-digital-nomad.in.net";
  const releaseChannelOk = releaseChannel === "full";
  const dbEnvOk = dbEnv === "staging";
  const databaseUrlPresent = Boolean(databaseUrl);
  const directUrlPresent = Boolean(directUrl);
  const expectedSupabaseProjectRefConfigured = Boolean(expectedProjectRef);

  if (!hostOk) reasons.push("not_staging_host_or_ref");
  if (!releaseChannelOk) reasons.push("release_channel_not_full");
  if (!dbEnvOk) reasons.push("db_env_not_staging");
  if (!databaseUrlPresent) reasons.push("database_url_missing");
  if (!directUrlPresent) reasons.push("direct_url_missing");
  if (!expectedSupabaseProjectRefConfigured) reasons.push("staging_supabase_project_ref_missing");
  if (expectedProjectRef && databaseProjectRefOk !== true) reasons.push("database_url_project_ref_mismatch");
  if (expectedProjectRef && directProjectRefOk !== true) reasons.push("direct_url_project_ref_mismatch");

  const stagingOk = reasons.length === 0;
  const status: HealthCheckState = !base.checks.database.ok || !stagingOk ? "down" : base.status;

  return {
    ...base,
    status,
    checks: {
      ...base.checks,
      staging: {
        ok: stagingOk,
        hostOk,
        releaseChannelOk,
        dbEnvOk,
        databaseUrlPresent,
        directUrlPresent,
        expectedSupabaseProjectRefConfigured,
        databaseProjectRefOk,
        directProjectRefOk,
        reasons,
      },
    },
    environment: {
      deployment,
      dbEnv,
      releaseChannel,
      vercelEnv: normalizeEnv(process.env.VERCEL_ENV),
      vercelGitCommitRef: process.env.VERCEL_GIT_COMMIT_REF || null,
    },
  };
}
