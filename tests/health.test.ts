import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/db", () => ({
  getDb: vi.fn(),
}));

import { GET } from "@/app/api/health/route";
import { getDb } from "@/lib/db";
import { getHealthCheckResult } from "@/lib/health";

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
});
