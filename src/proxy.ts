import { NextResponse, type NextRequest } from "next/server";
import { getReleaseChannelForHost, isFullOnlyAppPath } from "@/lib/release-mode";

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

function getRequestId(request: NextRequest) {
  return request.headers.get("x-request-id") || crypto.randomUUID();
}

function isBlockedSimpleOAuthPath(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  if (pathname.startsWith("/api/oauth/") && !pathname.startsWith("/api/oauth/meta-instagram/")) return true;
  if (pathname === "/api/meta/oauth/start" && request.nextUrl.searchParams.get("mode") !== "instagram") return true;
  if (pathname.startsWith("/oauth/providers/")) return true;
  return false;
}

export function proxy(request: NextRequest) {
  const requestId = getRequestId(request);
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-request-id", requestId);
  const pathname = request.nextUrl.pathname;

  const releaseChannel = getReleaseChannelForHost(request.nextUrl.host);

  if (releaseChannel === "simple" && isBlockedSimpleOAuthPath(request)) {
    if (pathname.startsWith("/api/")) {
      const response = NextResponse.json({ error: "Provider is not available on the simple production release." }, { status: 404 });
      response.headers.set("x-request-id", requestId);
      return response;
    }

    const url = request.nextUrl.clone();
    url.pathname = "/channels/connect/social";
    url.search = "";
    const response = NextResponse.redirect(url, 307);
    response.headers.set("x-request-id", requestId);
    return response;
  }

  if (releaseChannel === "simple" && isFullOnlyAppPath(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    url.search = "";
    const response = NextResponse.redirect(url, 307);
    response.headers.set("x-request-id", requestId);
    return response;
  }

  if (!isMutating(request.method)) {
    const response = NextResponse.next({ request: { headers: requestHeaders } });
    response.headers.set("x-request-id", requestId);
    return response;
  }

  if (EXTERNAL_POST_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    const response = NextResponse.next({ request: { headers: requestHeaders } });
    response.headers.set("x-request-id", requestId);
    return response;
  }

  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");
  const candidate = origin || (referer ? new URL(referer).origin : "");
  if (!candidate && process.env.NODE_ENV !== "production") {
    const response = NextResponse.next({ request: { headers: requestHeaders } });
    response.headers.set("x-request-id", requestId);
    return response;
  }

  const allowedOrigins = new Set<string>([request.nextUrl.origin]);
  if (process.env.APP_URL) allowedOrigins.add(new URL(process.env.APP_URL).origin);
  if (process.env.NODE_ENV !== "production" && isLocalhost(request.nextUrl.hostname)) {
    addLocalhostOrigins(allowedOrigins, request.nextUrl.port);
  }

  if (!candidate || !allowedOrigins.has(candidate)) {
    const response = NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
    response.headers.set("x-request-id", requestId);
    return response;
  }

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set("x-request-id", requestId);
  return response;
}

export const config = {
  matcher: ["/api/:path*", "/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
