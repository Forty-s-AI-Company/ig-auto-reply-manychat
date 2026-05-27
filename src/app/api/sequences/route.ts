import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { requireApiUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { sequenceSchema } from "@/lib/validation";
import { getCurrentWorkspaceId } from "@/lib/workspaces";

export async function GET() {
  const auth = await requireApiUser();
  if (auth.response) return auth.response;

  const workspaceId = await getCurrentWorkspaceId();
  const sequences = await getDb().sequence.findMany({
    where: { workspaceId },
    orderBy: { updatedAt: "desc" },
    include: {
      steps: { orderBy: { order: "asc" } },
      subscriptions: { where: { active: true }, select: { id: true } },
    },
  });

  return NextResponse.json(
    sequences.map((sequence) => ({
      ...sequence,
      activeSubscriptionCount: sequence.subscriptions.length,
    })),
  );
}

export async function POST(request: Request) {
  const auth = await requireApiUser();
  if (auth.response) return auth.response;

  const parsed = sequenceSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "序列資料不完整。" }, { status: 400 });
  }

  const workspaceId = await getCurrentWorkspaceId();
  try {
    const sequence = await getDb().sequence.create({
      data: {
        workspaceId,
        name: parsed.data.name,
        enabled: parsed.data.enabled,
        steps: {
          create: parsed.data.steps.map((step) => ({
            order: step.order,
            delaySeconds: step.delaySeconds,
            messageJson: step.messageJson as Prisma.InputJsonValue,
          })),
        },
      },
      include: { steps: { orderBy: { order: "asc" } } },
    });
    return NextResponse.json(sequence);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ error: "這個序列名稱已經存在。" }, { status: 409 });
    }
    throw error;
  }
}
