import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { knowledgeBaseSchema } from "@/lib/validation";
import { getCurrentWorkspaceId } from "@/lib/workspaces";

export async function GET() {
  const auth = await requireApiUser();
  if (auth.response) return auth.response;
  const workspaceId = await getCurrentWorkspaceId();
  return NextResponse.json(
    await getDb().knowledgeBaseItem.findMany({ where: { workspaceId }, orderBy: { updatedAt: "desc" } }),
  );
}

export async function POST(request: Request) {
  const auth = await requireApiUser();
  if (auth.response) return auth.response;
  const parsed = knowledgeBaseSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid item." }, { status: 400 });
  const workspaceId = await getCurrentWorkspaceId();

  return NextResponse.json(await getDb().knowledgeBaseItem.create({ data: { ...parsed.data, workspaceId } }));
}
