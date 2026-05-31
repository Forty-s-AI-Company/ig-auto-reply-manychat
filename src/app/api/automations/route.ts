import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/auth";
import { assertWorkspaceLimit } from "@/lib/billing/entitlements";
import { getDb } from "@/lib/db";
import { automationSchema } from "@/lib/validation";
import { getCurrentWorkspaceId } from "@/lib/workspaces";

export async function GET() {
  const auth = await requireApiUser();
  if (auth.response) return auth.response;
  const workspaceId = await getCurrentWorkspaceId();

  const automations = await getDb().automation.findMany({
    where: { workspaceId },
    orderBy: { updatedAt: "desc" },
    include: {
      folder: { select: { id: true, name: true } },
      steps: { orderBy: { order: "asc" } },
      runs: {
        orderBy: { createdAt: "desc" },
        take: 10,
        include: {
          contact: { select: { id: true, displayName: true, username: true } },
          conversation: { select: { id: true, status: true } },
        },
      },
    },
  });

  return NextResponse.json(automations);
}

export async function POST(request: Request) {
  const auth = await requireApiUser();
  if (auth.response) return auth.response;
  const parsed = automationSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "自動化資料格式不正確。" }, { status: 400 });
  }
  const workspaceId = await getCurrentWorkspaceId();
  const folderId = parsed.data.folderId || null;
  if (folderId) {
    const folder = await getDb().automationFolder.findFirst({ where: { id: folderId, workspaceId }, select: { id: true } });
    if (!folder) return NextResponse.json({ error: "找不到指定的資料夾。" }, { status: 404 });
  }
  try {
    await assertWorkspaceLimit(workspaceId, "automations");
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "已超過方案限制。" },
      { status: 402 },
    );
  }

  const automation = await getDb().automation.create({
    data: {
      workspaceId,
      folderId,
      name: parsed.data.name,
      enabled: parsed.data.enabled,
      triggerType: parsed.data.triggerType,
      triggerConfigJson: parsed.data.triggerConfigJson ?? {},
      steps: {
        create: parsed.data.steps.map((step) => ({
          order: step.order,
          type: step.type,
          configJson: step.configJson ?? {},
        })),
      },
    },
    include: {
      folder: { select: { id: true, name: true } },
      steps: { orderBy: { order: "asc" } },
      runs: {
        orderBy: { createdAt: "desc" },
        take: 10,
        include: {
          contact: { select: { id: true, displayName: true, username: true } },
          conversation: { select: { id: true, status: true } },
        },
      },
    },
  });

  return NextResponse.json(automation);
}
