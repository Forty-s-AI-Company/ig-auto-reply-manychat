import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { automationSchema } from "@/lib/validation";
import { getCurrentWorkspaceId } from "@/lib/workspaces";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const auth = await requireApiUser();
  if (auth.response) return auth.response;
  const { id } = await params;
  const workspaceId = await getCurrentWorkspaceId();
  const automation = await getDb().automation.findFirst({
    where: { id, workspaceId },
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

  if (!automation) return NextResponse.json({ error: "找不到指定的自動化。" }, { status: 404 });
  return NextResponse.json(automation);
}

export async function PUT(request: Request, { params }: Params) {
  const auth = await requireApiUser();
  if (auth.response) return auth.response;
  const { id } = await params;
  const parsed = automationSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "自動化資料格式不正確。" }, { status: 400 });

  const workspaceId = await getCurrentWorkspaceId();
  const folderId = parsed.data.folderId || null;
  if (folderId) {
    const folder = await getDb().automationFolder.findFirst({ where: { id: folderId, workspaceId }, select: { id: true } });
    if (!folder) return NextResponse.json({ error: "找不到指定的資料夾。" }, { status: 404 });
  }
  const db = getDb();
  const existing = await db.automation.findFirst({ where: { id, workspaceId }, select: { id: true } });
  if (!existing) return NextResponse.json({ error: "找不到指定的自動化。" }, { status: 404 });

  await db.automationStep.deleteMany({ where: { automationId: id } });
  const automation = await db.automation.update({
    where: { id },
    data: {
      name: parsed.data.name,
      folderId,
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

export async function DELETE(_request: Request, { params }: Params) {
  const auth = await requireApiUser();
  if (auth.response) return auth.response;
  const { id } = await params;
  const workspaceId = await getCurrentWorkspaceId();
  const existing = await getDb().automation.findFirst({ where: { id, workspaceId }, select: { id: true } });
  if (!existing) return NextResponse.json({ error: "找不到指定的自動化。" }, { status: 404 });

  await getDb().automation.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
