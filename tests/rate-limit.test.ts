import { afterEach, describe, expect, it, vi } from "vitest";
import { assertRateLimit } from "@/lib/security";

describe("rate limiting", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("allows requests until the limit is reached", async () => {
    vi.stubEnv("REDIS_URL", "");
    const key = `rate-limit:${Date.now()}:allow`;

    const first = await assertRateLimit({ key, limit: 2, windowMs: 60_000 });
    const second = await assertRateLimit({ key, limit: 2, windowMs: 60_000 });

    expect(first).toBeNull();
    expect(second).toBeNull();
  });

  it("rejects requests after the limit is reached", async () => {
    vi.stubEnv("REDIS_URL", "");
    const key = `rate-limit:${Date.now()}:reject`;

    await assertRateLimit({ key, limit: 1, windowMs: 60_000 });
    const failure = await assertRateLimit({ key, limit: 1, windowMs: 60_000 });

    expect(failure).not.toBeNull();
    expect(failure?.status).toBe(429);
    expect(failure?.headers.get("retry-after")).toBeTruthy();
    expect(failure?.headers.get("x-ratelimit-limit")).toBe("1");
    expect(failure?.headers.get("x-ratelimit-remaining")).toBe("0");
  });
});
