import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { requireApiUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { contactFieldDefinitionSchema } from "@/lib/validation";
import { getCurrentWorkspaceId } from "@/lib/workspaces";

export async function GET() {
  const auth = await requireApiUser();
  if (auth.response) return auth.response;

  const workspaceId = await getCurrentWorkspaceId();
  const fields = await getDb().contactFieldDefinition.findMany({
    where: { workspaceId },
    orderBy: [{ createdAt: "asc" }],
  });

  return NextResponse.json(fields);
}

export async function POST(request: Request) {
  const auth = await requireApiUser();
  if (auth.response) return auth.response;

  const parsed = contactFieldDefinitionSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "自訂欄位資料不完整。" }, { status: 400 });
  }

  const workspaceId = await getCurrentWorkspaceId();
  try {
    const field = await getDb().contactFieldDefinition.create({
      data: { workspaceId, ...parsed.data },
    });
    return NextResponse.json(field);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ error: "這個欄位 key 已經存在。" }, { status: 409 });
    }
    throw error;
  }
}
