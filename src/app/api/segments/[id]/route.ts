import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { requireApiUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { segmentSchema } from "@/lib/validation";
import { getCurrentWorkspaceId } from "@/lib/workspaces";

type Context = { params: Promise<{ id: string }> };

export async function PUT(request: Request, context: Context) {
  const auth = await requireApiUser();
  if (auth.response) return auth.response;
  const parsed = segmentSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "分群資料格式不正確。" }, { status: 400 });
  }

  const { id } = await context.params;
  const workspaceId = await getCurrentWorkspaceId();
  const existing = await getDb().segment.findFirst({ where: { id, workspaceId }, select: { id: true } });
  if (!existing) return NextResponse.json({ error: "找不到這個工作區的分群。" }, { status: 404 });

  try {
    const segment = await getDb().segment.update({
      where: { id },
      data: {
        name: parsed.data.name,
        description: parsed.data.description || null,
        filterJson: parsed.data.filterJson,
      },
    });
    return NextResponse.json(segment);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ error: "同名分群已存在。" }, { status: 409 });
    }
    throw error;
  }
}

export async function DELETE(_request: Request, context: Context) {
  const auth = await requireApiUser();
  if (auth.response) return auth.response;
  const { id } = await context.params;
  const workspaceId = await getCurrentWorkspaceId();
  const existing = await getDb().segment.findFirst({ where: { id, workspaceId }, select: { id: true } });
  if (!existing) return NextResponse.json({ error: "找不到這個工作區的分群。" }, { status: 404 });

  await getDb().segment.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
