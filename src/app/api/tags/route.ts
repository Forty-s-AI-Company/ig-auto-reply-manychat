import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { assertSameOriginRequest } from "@/lib/security";
import { tagSchema } from "@/lib/validation";
import { getCurrentWorkspaceId } from "@/lib/workspaces";

export async function GET() {
  const auth = await requireApiUser();
  if (auth.response) return auth.response;
  const workspaceId = await getCurrentWorkspaceId();
  return NextResponse.json(await getDb().tag.findMany({ where: { workspaceId }, orderBy: { name: "asc" } }));
}

export async function POST(request: Request) {
  const originFailure = assertSameOriginRequest(request);
  if (originFailure) return originFailure;

  const auth = await requireApiUser();
  if (auth.response) return auth.response;
  const parsed = tagSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid tag." }, { status: 400 });
  const workspaceId = await getCurrentWorkspaceId();

  const tag = await getDb().tag.create({ data: { ...parsed.data, workspaceId } });
  return NextResponse.json(tag);
}
