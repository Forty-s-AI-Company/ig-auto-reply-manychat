import { NextResponse } from "next/server";
import { recordAuditEvent } from "@/lib/audit";
import { requireApiUser } from "@/lib/auth";
import { assertWorkspaceLimit } from "@/lib/billing/entitlements";
import { getDb } from "@/lib/db";
import { assertSameOriginRequest } from "@/lib/security";
import { broadcastSchema } from "@/lib/validation";
import { getCurrentWorkspaceId } from "@/lib/workspaces";

export async function GET() {
  const auth = await requireApiUser();
  if (auth.response) return auth.response;
  const workspaceId = await getCurrentWorkspaceId();
  return NextResponse.json(
    await getDb().broadcast.findMany({ where: { workspaceId }, orderBy: { updatedAt: "desc" } }),
  );
}

export async function POST(request: Request) {
  const originFailure = assertSameOriginRequest(request);
  if (originFailure) return originFailure;

  const auth = await requireApiUser();
  if (auth.response) return auth.response;
  const parsed = broadcastSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "廣播資料格式錯誤，請重新確認。" }, { status: 400 });
  }
  const workspaceId = await getCurrentWorkspaceId();
  try {
    await assertWorkspaceLimit(workspaceId, "broadcasts");
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "方案限制不足" },
      { status: 402 },
    );
  }

  const broadcast = await getDb().broadcast.create({
    data: {
      workspaceId,
      name: parsed.data.name,
      targetConfigJson: parsed.data.targetConfigJson,
      messageJson: parsed.data.messageJson,
      scheduledAt: parsed.data.scheduledAt ? new Date(parsed.data.scheduledAt) : null,
    },
  });

  await recordAuditEvent({
    action: "broadcast_created",
    resourceType: "broadcast",
    resourceId: broadcast.id,
    workspaceId,
    userId: auth.user.id,
    metadata: {
      name: broadcast.name,
      scheduledAt: broadcast.scheduledAt?.toISOString() || null,
    },
  });

  return NextResponse.json(broadcast);
}
