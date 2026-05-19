import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { automationSchema } from "@/lib/validation";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const auth = await requireApiUser();
  if (auth.response) return auth.response;
  const { id } = await params;
  const automation = await getDb().automation.findUnique({
    where: { id },
    include: { steps: { orderBy: { order: "asc" } }, runs: { orderBy: { createdAt: "desc" }, take: 10 } },
  });

  if (!automation) return NextResponse.json({ error: "Automation not found." }, { status: 404 });
  return NextResponse.json(automation);
}

export async function PUT(request: Request, { params }: Params) {
  const auth = await requireApiUser();
  if (auth.response) return auth.response;
  const { id } = await params;
  const parsed = automationSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid automation." }, { status: 400 });

  const db = getDb();
  await db.automationStep.deleteMany({ where: { automationId: id } });
  const automation = await db.automation.update({
    where: { id },
    data: {
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
    include: { steps: { orderBy: { order: "asc" } } },
  });

  return NextResponse.json(automation);
}

export async function DELETE(_request: Request, { params }: Params) {
  const auth = await requireApiUser();
  if (auth.response) return auth.response;
  const { id } = await params;
  await getDb().automation.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
