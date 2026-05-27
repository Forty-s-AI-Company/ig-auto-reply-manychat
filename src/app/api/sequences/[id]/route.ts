import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { requireApiUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { replaceSequenceSteps } from "@/lib/sequences";
import { sequenceSchema } from "@/lib/validation";
import { getCurrentWorkspaceId } from "@/lib/workspaces";

type Params = { params: Promise<{ id: string }> };

export async function PUT(request: Request, { params }: Params) {
  const auth = await requireApiUser();
  if (auth.response) return auth.response;

  const parsed = sequenceSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "序列資料不完整。" }, { status: 400 });
  }

  const { id } = await params;
  const workspaceId = await getCurrentWorkspaceId();
  const existing = await getDb().sequence.findFirst({ where: { id, workspaceId }, select: { id: true } });
  if (!existing) return NextResponse.json({ error: "找不到這個序列。" }, { status: 404 });

  try {
    await getDb().sequence.update({
      where: { id },
      data: { name: parsed.data.name, enabled: parsed.data.enabled },
    });
    await replaceSequenceSteps({ sequenceId: id, steps: parsed.data.steps });
    const sequence = await getDb().sequence.findUnique({
      where: { id },
      include: { steps: { orderBy: { order: "asc" } } },
    });
    return NextResponse.json(sequence);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ error: "這個序列名稱已經存在。" }, { status: 409 });
    }
    throw error;
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  const auth = await requireApiUser();
  if (auth.response) return auth.response;

  const { id } = await params;
  const workspaceId = await getCurrentWorkspaceId();
  const existing = await getDb().sequence.findFirst({ where: { id, workspaceId }, select: { id: true } });
  if (!existing) return NextResponse.json({ error: "找不到這個序列。" }, { status: 404 });

  await getDb().sequence.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
