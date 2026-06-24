import { NextResponse } from "next/server";
import { getStagingHealthCheckResult } from "@/lib/health";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const result = await getStagingHealthCheckResult(url.host);
  const requestId = request.headers.get("x-request-id") || crypto.randomUUID();
  const statusCode = result.status === "ok" || result.status === "degraded" ? 200 : 503;

  return NextResponse.json(result, {
    status: statusCode,
    headers: {
      "cache-control": "no-store, max-age=0",
      "x-request-id": requestId,
      "x-health-status": result.status,
    },
  });
}
