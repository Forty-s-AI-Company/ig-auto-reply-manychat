import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { automationSchema } from "@/lib/validation";

export async function GET() {
  const auth = await requireApiUser();
  if (auth.response) return auth.response;

  const automations = await getDb().automation.findMany({
    orderBy: { updatedAt: "desc" },
    include: { steps: { orderBy: { order: "asc" } } },
  });

  return NextResponse.json(automations);
}

export async function POST(request: Request) {
  const auth = await requireApiUser();
  if (auth.response) return auth.response;
  const parsed = automationSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid automation." }, { status: 400 });
  }

  const automation = await getDb().automation.create({
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
