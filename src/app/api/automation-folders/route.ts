import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { requireApiUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { automationFolderSchema } from "@/lib/validation";
import { getCurrentWorkspaceId } from "@/lib/workspaces";

export async function GET() {
  const auth = await requireApiUser();
  if (auth.response) return auth.response;
  const workspaceId = await getCurrentWorkspaceId();

  const folders = await getDb().automationFolder.findMany({
    where: { workspaceId },
    orderBy: { updatedAt: "desc" },
    include: { _count: { select: { automations: true } } },
  });

  return NextResponse.json(folders);
}

export async function POST(request: Request) {
  const auth = await requireApiUser();
  if (auth.response) return auth.response;
  const parsed = automationFolderSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "資料夾名稱格式不正確。" }, { status: 400 });
  }

  const workspaceId = await getCurrentWorkspaceId();
  try {
    const folder = await getDb().automationFolder.create({
      data: { workspaceId, name: parsed.data.name.trim() },
      include: { _count: { select: { automations: true } } },
    });
    return NextResponse.json(folder);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ error: "已有同名資料夾。" }, { status: 409 });
    }
    throw error;
  }
}
