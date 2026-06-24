import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/db", () => ({
  getDb: vi.fn(),
}));

import { GET } from "@/app/api/health/route";
import { GET as STAGING_GET } from "@/app/api/health/staging/route";
import { getDb } from "@/lib/db";
import { getHealthCheckResult, getStagingHealthCheckResult } from "@/lib/health";

const mockedGetDb = vi.mocked(getDb);

afterEach(() => {
  vi.unstubAllEnvs();
  vi.clearAllMocks();
});

describe("health check", () => {
  it("returns degraded when redis is not configured", async () => {
    vi.stubEnv("REDIS_URL", "");
    const queryRaw = vi.fn().mockResolvedValue([{ "?column?": 1 }]);
    mockedGetDb.mockReturnValue({ $queryRaw: queryRaw } as never);

    const result = await getHealthCheckResult();

    expect(result.status).toBe("degraded");
    expect(result.checks.database.ok).toBe(true);
    expect(result.checks.redis.configured).toBe(false);
    expect(queryRaw).toHaveBeenCalledTimes(1);
  });

  it("returns down when the database is unavailable", async () => {
    vi.stubEnv("REDIS_URL", "");
    const queryRaw = vi.fn().mockRejectedValue(new Error("database unavailable"));
    mockedGetDb.mockReturnValue({ $queryRaw: queryRaw } as never);

    const result = await getHealthCheckResult();

    expect(result.status).toBe("down");
    expect(result.checks.database.ok).toBe(false);
  });

  it("exposes request and health headers from the route", async () => {
    vi.stubEnv("REDIS_URL", "");
    mockedGetDb.mockReturnValue({ $queryRaw: vi.fn().mockResolvedValue([{ "?column?": 1 }]) } as never);

    const response = await GET(new Request("http://localhost:3041/api/health"));

    expect(response.status).toBe(200);
    expect(response.headers.get("x-health-status")).toBe("degraded");
    expect(response.headers.get("x-request-id")).toBeTruthy();
  });

  it("passes staging health only when preview uses the staging DB guard", async () => {
    vi.stubEnv("REDIS_URL", "");
    vi.stubEnv("INBOXPILOT_RELEASE_CHANNEL", "full");
    vi.stubEnv("INBOXPILOT_DB_ENV", "staging");
    vi.stubEnv("STAGING_SUPABASE_PROJECT_REF", "staging-ref");
    vi.stubEnv(
      "DATABASE_URL",
      "postgresql://postgres.staging-ref:secret@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres?sslmode=require",
    );
    vi.stubEnv("DIRECT_URL", "postgresql://postgres:secret@db.staging-ref.supabase.co:5432/postgres?sslmode=require");
    mockedGetDb.mockReturnValue({ $queryRaw: vi.fn().mockResolvedValue([{ "?column?": 1 }]) } as never);

    const result = await getStagingHealthCheckResult("staging.carry-digital-nomad.in.net");

    expect(result.status).toBe("degraded");
    expect(result.checks.staging.ok).toBe(true);
    expect(result.environment.dbEnv).toBe("staging");
    expect(result.environment.releaseChannel).toBe("full");
  });

  it("fails staging health when the DB env is not explicitly staging", async () => {
    vi.stubEnv("REDIS_URL", "");
    vi.stubEnv("INBOXPILOT_RELEASE_CHANNEL", "full");
    vi.stubEnv("INBOXPILOT_DB_ENV", "production");
    vi.stubEnv("STAGING_SUPABASE_PROJECT_REF", "staging-ref");
    vi.stubEnv(
      "DATABASE_URL",
      "postgresql://postgres.staging-ref:secret@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres?sslmode=require",
    );
    vi.stubEnv("DIRECT_URL", "postgresql://postgres:secret@db.staging-ref.supabase.co:5432/postgres?sslmode=require");
    mockedGetDb.mockReturnValue({ $queryRaw: vi.fn().mockResolvedValue([{ "?column?": 1 }]) } as never);

    const response = await STAGING_GET(new Request("https://staging.carry-digital-nomad.in.net/api/health/staging"));
    const body = await response.json();

    expect(response.status).toBe(503);
    expect(body.checks.staging.ok).toBe(false);
    expect(body.checks.staging.reasons).toContain("db_env_not_staging");
  });
});
