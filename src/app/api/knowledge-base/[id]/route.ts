import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { knowledgeBaseSchema } from "@/lib/validation";
import { getCurrentWorkspaceId } from "@/lib/workspaces";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const auth = await requireApiUser();
  if (auth.response) return auth.response;
  const { id } = await params;
  const parsed = knowledgeBaseSchema.partial().safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid item." }, { status: 400 });

  const workspaceId = await getCurrentWorkspaceId();
  const existing = await getDb().knowledgeBaseItem.findFirst({ where: { id, workspaceId }, select: { id: true } });
  if (!existing) return NextResponse.json({ error: "找不到這個工作區的知識庫項目。" }, { status: 404 });

  return NextResponse.json(
    await getDb().knowledgeBaseItem.update({ where: { id }, data: parsed.data }),
  );
}

export async function DELETE(_request: Request, { params }: Params) {
  const auth = await requireApiUser();
  if (auth.response) return auth.response;
  const { id } = await params;
  const workspaceId = await getCurrentWorkspaceId();
  const existing = await getDb().knowledgeBaseItem.findFirst({ where: { id, workspaceId }, select: { id: true } });
  if (!existing) return NextResponse.json({ error: "找不到這個工作區的知識庫項目。" }, { status: 404 });

  await getDb().knowledgeBaseItem.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
