import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/auth";
import { assertCanSendAutomation } from "@/lib/billing/usage-service";
import { getDb } from "@/lib/db";
import { queueBroadcast } from "@/lib/jobs";
import { assertRateLimit, assertSameOriginRequest } from "@/lib/security";
import { getCurrentWorkspaceId } from "@/lib/workspaces";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  const originFailure = assertSameOriginRequest(request);
  if (originFailure) return originFailure;

  const auth = await requireApiUser();
  if (auth.response) return auth.response;
  const rateLimitFailure = await assertRateLimit({
    key: `queue-broadcast:${auth.user.id}`,
    limit: 20,
    windowMs: 60 * 1000,
  });
  if (rateLimitFailure) return rateLimitFailure;
  const { id } = await params;
  const workspaceId = await getCurrentWorkspaceId();
  const broadcast = await getDb().broadcast.findFirst({ where: { id, workspaceId }, select: { id: true } });
  if (!broadcast) return NextResponse.json({ error: "找不到這個工作區的群發。" }, { status: 404 });

  try {
    await assertCanSendAutomation(workspaceId);
    const queued = await queueBroadcast(id);
    return NextResponse.json({ ok: true, queued });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "排程群發失敗。" },
      { status: 400 },
    );
  }
}
