import { processDueJobs } from "@/lib/jobs";
import { getCronAuthFailure } from "@/lib/security";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  const authFailure = getCronAuthFailure(request);
  if (authFailure) return authFailure;

  const limit = Number(new URL(request.url).searchParams.get("limit") || "25");
  const processed = await processDueJobs(Number.isFinite(limit) ? Math.min(Math.max(limit, 1), 100) : 25);
  return Response.json({
    ok: true,
    processed,
    processedAt: new Date().toISOString(),
  });
}
