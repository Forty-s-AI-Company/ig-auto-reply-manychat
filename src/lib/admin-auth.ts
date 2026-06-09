import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/auth";
import { assertRateLimit, assertSameOriginRequest } from "@/lib/security";

export async function requireAdminApiUser(request?: Request) {
  if (request) {
    const originFailure = assertSameOriginRequest(request);
    if (originFailure) return { user: null, response: originFailure };
  }

  const auth = await requireApiUser();
  if (auth.response) return auth;
  if (auth.user.role !== "admin") {
    return {
      user: null,
      response: NextResponse.json({ error: "Admin only." }, { status: 403 }),
    };
  }
  if (request) {
    const rateLimitFailure = await assertRateLimit({
      key: `admin:${auth.user.id}`,
      limit: 60,
      windowMs: 60 * 1000,
    });
    if (rateLimitFailure) return { user: null, response: rateLimitFailure };
  }
  return auth;
}
