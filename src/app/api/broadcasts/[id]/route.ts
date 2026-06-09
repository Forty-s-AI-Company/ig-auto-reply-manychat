import { NextResponse } from "next/server";
import { recordAuditEvent } from "@/lib/audit";
import { requireApiUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { broadcastSchema } from "@/lib/validation";
import { getCurrentWorkspaceId } from "@/lib/workspaces";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const auth = await requireApiUser();
  if (auth.response) return auth.response;
  const { id } = await params;
  const parsed = broadcastSchema.partial().safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "廣播資料格式錯誤，請重新確認。" }, { status: 400 });

  const workspaceId = await getCurrentWorkspaceId();
  const existing = await getDb().broadcast.findFirst({ where: { id, workspaceId }, select: { id: true } });
  if (!existing) return NextResponse.json({ error: "找不到這個工作區的廣播。" }, { status: 404 });

  const broadcast = await getDb().broadcast.update({
    where: { id },
    data: {
      ...parsed.data,
      scheduledAt: parsed.data.scheduledAt ? new Date(parsed.data.scheduledAt) : undefined,
    },
  });

  await recordAuditEvent({
    action: "broadcast_updated",
    resourceType: "broadcast",
    resourceId: broadcast.id,
    workspaceId,
    userId: auth.user.id,
    metadata: {
      name: broadcast.name,
      scheduledAt: broadcast.scheduledAt?.toISOString() || null,
    },
  });

  return NextResponse.json(broadcast);
}

export async function DELETE(_request: Request, { params }: Params) {
  const auth = await requireApiUser();
  if (auth.response) return auth.response;
  const { id } = await params;
  const workspaceId = await getCurrentWorkspaceId();
  const existing = await getDb().broadcast.findFirst({ where: { id, workspaceId }, select: { id: true, name: true } });
  if (!existing) return NextResponse.json({ error: "找不到這個工作區的廣播。" }, { status: 404 });

  await getDb().broadcast.delete({ where: { id } });

  await recordAuditEvent({
    action: "broadcast_deleted",
    resourceType: "broadcast",
    resourceId: id,
    workspaceId,
    userId: auth.user.id,
    metadata: {
      name: existing.name,
    },
  });

  return NextResponse.json({ ok: true });
}
