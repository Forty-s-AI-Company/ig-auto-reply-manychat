import { refreshAllAiModels } from "@/lib/ai/providers";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function isAuthorized(request: Request) {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) return process.env.NODE_ENV !== "production";

  return request.headers.get("authorization") === `Bearer ${secret}`;
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

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
