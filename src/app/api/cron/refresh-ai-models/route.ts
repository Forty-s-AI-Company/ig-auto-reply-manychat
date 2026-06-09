import { refreshAllAiModels } from "@/lib/ai/providers";
import { getDb } from "@/lib/db";
import { getCronAuthFailure } from "@/lib/security";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  const authFailure = getCronAuthFailure(request);
  if (authFailure) return authFailure;

  const workspaces = await getDb().workspace.findMany({
    select: { id: true },
    orderBy: { createdAt: "asc" },
  });
  const workspaceIds = workspaces.length ? workspaces.map((workspace) => workspace.id) : [null];
  const results: Record<string, Record<string, number>> = {};

  for (const workspaceId of workspaceIds) {
    results[workspaceId || "default"] = await refreshAllAiModels(workspaceId);
  }

  return Response.json({
    ok: true,
    refreshedAt: new Date().toISOString(),
    results,
  });
}
