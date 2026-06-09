import { NextResponse } from "next/server";
import { clearSessionCookie } from "@/lib/auth";
import { assertSameOriginRequest } from "@/lib/security";

export async function POST(request: Request) {
  const originFailure = assertSameOriginRequest(request);
  if (originFailure) return originFailure;
  await clearSessionCookie();
  return NextResponse.json({ ok: true });
}
