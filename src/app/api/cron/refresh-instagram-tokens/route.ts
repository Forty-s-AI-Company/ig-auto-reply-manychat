import { refreshDueInstagramTokens } from "@/lib/channels/instagram-token";
import { getCronAuthFailure } from "@/lib/security";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  const authFailure = getCronAuthFailure(request);
  if (authFailure) return authFailure;

  const results = await refreshDueInstagramTokens();
  return Response.json({
    ok: true,
    refreshedAt: new Date().toISOString(),
    results,
  });
}
