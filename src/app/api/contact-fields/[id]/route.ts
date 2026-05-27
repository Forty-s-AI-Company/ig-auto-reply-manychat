import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { requireApiUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { contactFieldDefinitionSchema } from "@/lib/validation";
import { getCurrentWorkspaceId } from "@/lib/workspaces";

type Params = { params: Promise<{ id: string }> };

export async function PUT(request: Request, { params }: Params) {
  const auth = await requireApiUser();
  if (auth.response) return auth.response;

  const parsed = contactFieldDefinitionSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "自訂欄位資料不完整。" }, { status: 400 });
  }

  const { id } = await params;
  const workspaceId = await getCurrentWorkspaceId();
  const existing = await getDb().contactFieldDefinition.findFirst({ where: { id, workspaceId } });
  if (!existing) return NextResponse.json({ error: "找不到這個自訂欄位。" }, { status: 404 });

  try {
    const field = await getDb().contactFieldDefinition.update({
      where: { id },
      data: parsed.data,
    });
    return NextResponse.json(field);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ error: "這個欄位 key 已經存在。" }, { status: 409 });
    }
    throw error;
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  const auth = await requireApiUser();
  if (auth.response) return auth.response;

  const { id } = await params;
  const workspaceId = await getCurrentWorkspaceId();
  const existing = await getDb().contactFieldDefinition.findFirst({ where: { id, workspaceId } });
  if (!existing) return NextResponse.json({ error: "找不到這個自訂欄位。" }, { status: 404 });

  await getDb().contactFieldDefinition.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
