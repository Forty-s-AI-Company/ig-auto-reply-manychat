import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { tagSchema } from "@/lib/validation";
import { getCurrentWorkspaceId } from "@/lib/workspaces";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const auth = await requireApiUser();
  if (auth.response) return auth.response;
  const { id } = await params;
  const parsed = tagSchema.partial().safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid tag." }, { status: 400 });
  const workspaceId = await getCurrentWorkspaceId();
  const tag = await getDb().tag.findFirst({ where: { id, workspaceId }, select: { id: true } });
  if (!tag) return NextResponse.json({ error: "找不到這個工作區的標籤。" }, { status: 404 });

  return NextResponse.json(await getDb().tag.update({ where: { id }, data: parsed.data }));
}

export async function DELETE(_request: Request, { params }: Params) {
  const auth = await requireApiUser();
  if (auth.response) return auth.response;
  const { id } = await params;
  const workspaceId = await getCurrentWorkspaceId();
  const tag = await getDb().tag.findFirst({ where: { id, workspaceId }, select: { id: true } });
  if (!tag) return NextResponse.json({ error: "找不到這個工作區的標籤。" }, { status: 404 });
  await getDb().tag.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
