import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { getSelectedInstagramChannelId } from "@/lib/account-scope";
import { requireApiUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { assertSameOriginRequest } from "@/lib/security";
import { contactFilterSegmentSchema } from "@/lib/validation";
import { getCurrentWorkspaceId } from "@/lib/workspaces";

export async function POST(request: Request) {
  const originFailure = assertSameOriginRequest(request);
  if (originFailure) return originFailure;

  const auth = await requireApiUser();
  if (auth.response) return auth.response;

  const parsed = contactFilterSegmentSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "分眾資料格式不正確。" }, { status: 400 });
  }

  const workspaceId = await getCurrentWorkspaceId();
  const tagId = parsed.data.tagId?.trim() || null;

  if (tagId) {
    const tag = await getDb().tag.findFirst({ where: { id: tagId, workspaceId }, select: { id: true } });
    if (!tag) return NextResponse.json({ error: "找不到這個工作區的標籤。" }, { status: 404 });
  }

  const selectedChannelId = await getSelectedInstagramChannelId();

  try {
    const segment = await getDb().segment.create({
      data: {
        workspaceId,
        name: parsed.data.name.trim(),
        description: parsed.data.description?.trim() || null,
        filterJson: {
          q: parsed.data.q?.trim() || null,
          consentStatus: parsed.data.status || null,
          tagId,
          channelId: selectedChannelId || null,
        },
      },
    });

    return NextResponse.json(segment);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ error: "同名分眾已存在。" }, { status: 409 });
    }
    throw error;
  }
}
