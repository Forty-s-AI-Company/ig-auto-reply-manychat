import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { automationFolderSchema } from "@/lib/validation";
import { getCurrentWorkspaceId } from "@/lib/workspaces";

type Params = { params: Promise<{ id: string }> };

export async function PUT(request: Request, { params }: Params) {
  const auth = await requireApiUser();
  if (auth.response) return auth.response;
  const parsed = automationFolderSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "資料夾名稱格式不正確。" }, { status: 400 });
  }

  const { id } = await params;
  const workspaceId = await getCurrentWorkspaceId();
  const existing = await getDb().automationFolder.findFirst({ where: { id, workspaceId }, select: { id: true } });
  if (!existing) return NextResponse.json({ error: "找不到指定的資料夾。" }, { status: 404 });

  const folder = await getDb().automationFolder.update({
    where: { id },
    data: { name: parsed.data.name.trim() },
    include: { _count: { select: { automations: true } } },
  });

  return NextResponse.json(folder);
}

export async function DELETE(_request: Request, { params }: Params) {
  const auth = await requireApiUser();
  if (auth.response) return auth.response;
  const { id } = await params;
  const workspaceId = await getCurrentWorkspaceId();
  const existing = await getDb().automationFolder.findFirst({ where: { id, workspaceId }, select: { id: true } });
  if (!existing) return NextResponse.json({ error: "找不到指定的資料夾。" }, { status: 404 });

  await getDb().automationFolder.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
