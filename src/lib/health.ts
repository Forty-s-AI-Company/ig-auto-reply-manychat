import { getDb } from "@/lib/db";

export type HealthCheckState = "ok" | "degraded" | "down";

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
