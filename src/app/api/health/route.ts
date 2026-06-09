import { NextResponse } from "next/server";
import { getHealthCheckResult } from "@/lib/health";

export async function GET(request: Request) {
  const result = await getHealthCheckResult();
  const requestId = request.headers.get("x-request-id") || crypto.randomUUID();
  const statusCode = result.status === "down" ? 503 : 200;

  const response = NextResponse.json(result, {
    status: statusCode,
    headers: {
      "cache-control": "no-store, max-age=0",
      "x-request-id": requestId,
      "x-health-status": result.status,
    },
  });

  return response;
}
