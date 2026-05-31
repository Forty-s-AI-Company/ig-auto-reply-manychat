import { NextResponse, type NextRequest } from "next/server";

const EXTERNAL_POST_PREFIXES = [
  "/api/automation-webhooks/",
  "/api/billing/payuni/notify",
  "/api/billing/payuni/return",
  "/api/cron/",
  "/api/meta/data-deletion",
  "/api/meta/deauthorize",
  "/api/webhooks/",
];

function isMutating(method: string) {
  return method !== "GET" && method !== "HEAD" && method !== "OPTIONS";
}

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

export function proxy(request: NextRequest) {
  if (!isMutating(request.method)) return NextResponse.next();

  const pathname = request.nextUrl.pathname;
  if (EXTERNAL_POST_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    return NextResponse.next();
  }

  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");
  const candidate = origin || (referer ? new URL(referer).origin : "");
  if (!candidate && process.env.NODE_ENV !== "production") return NextResponse.next();

  const allowedOrigins = new Set<string>([request.nextUrl.origin]);
  if (process.env.APP_URL) allowedOrigins.add(new URL(process.env.APP_URL).origin);
  if (process.env.NODE_ENV !== "production" && isLocalhost(request.nextUrl.hostname)) {
    addLocalhostOrigins(allowedOrigins, request.nextUrl.port);
  }

  if (!candidate || !allowedOrigins.has(candidate)) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/api/:path*",
};
