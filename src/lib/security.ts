import { NextResponse } from "next/server";
import type Redis from "ioredis";

type RateLimitOptions = {
  key: string;
  limit: number;
  windowMs: number;
};

type Bucket = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, Bucket>();
let redisClientPromise: Promise<Redis | null> | null = null;

function isLocalhost(hostname: string) {
  return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1" || hostname === "[::1]";
}

function addLocalhostOrigins(allowedOrigins: Set<string>, port: string) {
  const hosts = ["localhost", "127.0.0.1", "[::1]"];
  for (const protocol of ["http", "https"]) {
    for (const host of hosts) {
      allowedOrigins.add(`${protocol}://${host}${port ? `:${port}` : ""}`);
    }
  }
}

export function getClientIp(request: Request) {
  return (
    request.headers.get("cf-connecting-ip") ||
    request.headers.get("x-real-ip") ||
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown"
  );
}

export function checkRateLimit({ key, limit, windowMs }: RateLimitOptions) {
  return checkRateLimitLocal({ key, limit, windowMs });
}

export function checkRateLimitLocal({ key, limit, windowMs }: RateLimitOptions) {
  const now = Date.now();
  const existing = buckets.get(key);
  if (!existing || existing.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: Math.max(0, limit - 1), resetAt: now + windowMs };
  }

  if (existing.count >= limit) {
    return { ok: false, remaining: 0, resetAt: existing.resetAt };
  }

  existing.count += 1;
  return { ok: true, remaining: Math.max(0, limit - existing.count), resetAt: existing.resetAt };
}

function rateLimitResponse(limit: number, resetAt: number) {
  const retryAfter = Math.max(1, Math.ceil((resetAt - Date.now()) / 1000));
  return NextResponse.json(
    { error: "Too many requests. Please try again later." },
    {
      status: 429,
      headers: {
        "retry-after": String(retryAfter),
        "x-ratelimit-limit": String(limit),
        "x-ratelimit-remaining": "0",
        "x-ratelimit-reset": String(Math.ceil(resetAt / 1000)),
      },
    },
  );
}

async function getRateLimitRedis() {
  const redisUrl = process.env.REDIS_URL?.trim();
  if (!redisUrl) return null;

  redisClientPromise ||= import("ioredis")
    .then(({ default: RedisClient }) => new RedisClient(redisUrl, { maxRetriesPerRequest: null, enableReadyCheck: false }))
    .catch((error) => {
      console.warn("[rate-limit] redis init failed, falling back to in-memory limits", error);
      return null;
    });

  return redisClientPromise;
}

export async function checkRateLimitAsync({ key, limit, windowMs }: RateLimitOptions) {
  const redis = await getRateLimitRedis();
  if (!redis) return checkRateLimitLocal({ key, limit, windowMs });

  try {
    const script = `
      local current = redis.call("INCR", KEYS[1])
      if current == 1 then
        redis.call("PEXPIRE", KEYS[1], ARGV[1])
      end
      local ttl = redis.call("PTTL", KEYS[1])
      local limit = tonumber(ARGV[2])
      if current > limit then
        return {0, 0, ttl}
      end
      return {1, limit - current, ttl}
    `;
    const [allowedRaw, remainingRaw, ttlRaw] = (await redis.eval(
      script,
      1,
      key,
      String(windowMs),
      String(limit),
    )) as [number | string, number | string, number | string];
    const allowed = Number(allowedRaw) === 1;
    const remaining = Number(remainingRaw);
    const ttl = Number(ttlRaw);
    const resetAt = Date.now() + Math.max(0, Number.isFinite(ttl) ? ttl : windowMs);
    return { ok: allowed, remaining, resetAt };
  } catch (error) {
    console.warn("[rate-limit] redis check failed, falling back to in-memory limits", error);
    return checkRateLimitLocal({ key, limit, windowMs });
  }
}

export async function assertRateLimit(options: RateLimitOptions) {
  const result = await checkRateLimitAsync(options);
  return result.ok ? null : rateLimitResponse(options.limit, result.resetAt);
}

export function assertSameOriginRequest(request: Request) {
  const method = request.method.toUpperCase();
  if (method === "GET" || method === "HEAD" || method === "OPTIONS") return null;

  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");
  const appUrl = process.env.APP_URL?.trim();
  const requestUrl = new URL(request.url);
  const allowedOrigins = new Set<string>([requestUrl.origin]);

  if (appUrl) allowedOrigins.add(new URL(appUrl).origin);
  if (process.env.NODE_ENV !== "production" && isLocalhost(requestUrl.hostname)) {
    addLocalhostOrigins(allowedOrigins, requestUrl.port);
  }

  const candidate = origin || (referer ? new URL(referer).origin : "");
  if (!candidate && process.env.NODE_ENV !== "production") return null;
  if (!candidate || !allowedOrigins.has(candidate)) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }

  return null;
}

export function getCronAuthFailure(request: Request) {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) return process.env.NODE_ENV === "production"
    ? NextResponse.json({ ok: false, error: "CRON_SECRET is required." }, { status: 500 })
    : null;

  return request.headers.get("authorization") === `Bearer ${secret}`
    ? null
    : NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
}
