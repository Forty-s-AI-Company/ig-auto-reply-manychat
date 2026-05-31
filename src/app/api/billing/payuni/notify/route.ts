import { NextResponse } from "next/server";
import { handlePayuniCallback } from "@/lib/billing/payuni-callback";
import { assertRateLimit, getClientIp } from "@/lib/security";

export async function POST(request: Request) {
  const rateLimitFailure = assertRateLimit({
    key: `payuni-notify:${getClientIp(request)}`,
    limit: 120,
    windowMs: 60 * 1000,
  });
  if (rateLimitFailure) return rateLimitFailure;

  try {
    const params = Object.fromEntries((await request.formData()).entries()) as Record<string, string>;
    await handlePayuniCallback(params);
    return NextResponse.json({ status: "success" });
  } catch {
    console.error("[payuni:notify] callback handling failed");
    return NextResponse.json({ status: "failed" }, { status: 400 });
  }
}
