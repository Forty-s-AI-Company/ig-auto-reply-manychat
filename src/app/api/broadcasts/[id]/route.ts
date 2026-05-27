import { NextResponse } from "next/server";
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
  if (!parsed.success) return NextResponse.json({ error: "Invalid broadcast." }, { status: 400 });

  const workspaceId = await getCurrentWorkspaceId();
  const existing = await getDb().broadcast.findFirst({ where: { id, workspaceId }, select: { id: true } });
  if (!existing) return NextResponse.json({ error: "找不到這個工作區的群發。" }, { status: 404 });

  return NextResponse.json(
    await getDb().broadcast.update({
      where: { id },
      data: {
        ...parsed.data,
        scheduledAt: parsed.data.scheduledAt ? new Date(parsed.data.scheduledAt) : undefined,
      },
    }),
  );
}

export async function DELETE(_request: Request, { params }: Params) {
  const auth = await requireApiUser();
  if (auth.response) return auth.response;
  const { id } = await params;
  const workspaceId = await getCurrentWorkspaceId();
  const existing = await getDb().broadcast.findFirst({ where: { id, workspaceId }, select: { id: true } });
  if (!existing) return NextResponse.json({ error: "找不到這個工作區的群發。" }, { status: 404 });

  await getDb().broadcast.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
