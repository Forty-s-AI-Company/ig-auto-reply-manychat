import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/auth";
import { assertCanSendAutomation } from "@/lib/billing/usage-service";
import { getDb } from "@/lib/db";
import { queueBroadcast } from "@/lib/jobs";
import { getCurrentWorkspaceId } from "@/lib/workspaces";

type Params = { params: Promise<{ id: string }> };

export async function POST(_request: Request, { params }: Params) {
  const auth = await requireApiUser();
  if (auth.response) return auth.response;
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
