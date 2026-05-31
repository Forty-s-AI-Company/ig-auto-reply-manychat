import { NextResponse } from "next/server";
import { handlePayuniCallback } from "@/lib/billing/payuni-callback";
import { assertRateLimit, getClientIp } from "@/lib/security";

function appRedirect(path: string, request: Request) {
  const base = (process.env.APP_URL || new URL(request.url).origin).replace(/\/$/, "");
  return new URL(path, base);
}

export async function POST(request: Request) {
  const rateLimitFailure = assertRateLimit({
    key: `payuni-return:${getClientIp(request)}`,
    limit: 120,
    windowMs: 60 * 1000,
  });
  if (rateLimitFailure) return rateLimitFailure;

  try {
    const params = Object.fromEntries((await request.formData()).entries()) as Record<string, string>;
    const result = await handlePayuniCallback(params);
    return NextResponse.redirect(
      appRedirect(`/billing?payment=${result.paid ? "success" : "failed"}`, request),
      303,
    );
  } catch {
    console.error("[payuni:return] callback handling failed");
    return NextResponse.redirect(appRedirect("/billing?payment=failed", request), 303);
  }
}

export async function GET(request: Request) {
  return NextResponse.redirect(appRedirect("/billing", request));
}
