import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/auth";
import { applyAffiliate } from "@/lib/billing/affiliate-service";
import { assertRateLimit, assertSameOriginRequest, getClientIp } from "@/lib/security";

export async function POST(request: Request) {
  const originFailure = assertSameOriginRequest(request);
  if (originFailure) return originFailure;

  const auth = await requireApiUser();
  if (auth.response) return auth.response;

  const rateLimitFailure = await assertRateLimit({
    key: `affiliate-apply:${auth.user.id}:${getClientIp(request)}`,
    limit: 5,
    windowMs: 60 * 60 * 1000,
  });
  if (rateLimitFailure) return rateLimitFailure;

  try {
    return NextResponse.json({ ok: true, profile: await applyAffiliate(auth.user.id) });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "申請失敗。" }, { status: 400 });
  }
}
