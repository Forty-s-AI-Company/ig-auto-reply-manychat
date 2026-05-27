import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { requireApiUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { segmentContactWhere } from "@/lib/segments";
import { segmentSchema } from "@/lib/validation";
import { getCurrentWorkspaceId } from "@/lib/workspaces";

export async function GET() {
  const auth = await requireApiUser();
  if (auth.response) return auth.response;
  const workspaceId = await getCurrentWorkspaceId();
  const db = getDb();
  const segments = await db.segment.findMany({
    where: { workspaceId },
    orderBy: { updatedAt: "desc" },
  });

  const withCounts = await Promise.all(
    segments.map(async (segment) => ({
      ...segment,
      contactCount: await db.contact.count({
        where: segmentContactWhere(workspaceId, segment.filterJson),
      }),
    })),
  );

  return NextResponse.json(withCounts);
}

export async function POST(request: Request) {
  const auth = await requireApiUser();
  if (auth.response) return auth.response;
  const parsed = segmentSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "分群資料格式不正確。" }, { status: 400 });
  }

  const workspaceId = await getCurrentWorkspaceId();
  try {
    const segment = await getDb().segment.create({
      data: {
        workspaceId,
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
