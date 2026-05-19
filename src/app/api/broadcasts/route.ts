import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { broadcastSchema } from "@/lib/validation";

export async function GET() {
  const auth = await requireApiUser();
  if (auth.response) return auth.response;
  return NextResponse.json(await getDb().broadcast.findMany({ orderBy: { updatedAt: "desc" } }));
}

export async function POST(request: Request) {
  const auth = await requireApiUser();
  if (auth.response) return auth.response;
  const parsed = broadcastSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid broadcast." }, { status: 400 });
  }

  const broadcast = await getDb().broadcast.create({
    data: {
      name: parsed.data.name,
      targetConfigJson: parsed.data.targetConfigJson,
      messageJson: parsed.data.messageJson,
      scheduledAt: parsed.data.scheduledAt ? new Date(parsed.data.scheduledAt) : null,
    },
  });

  return NextResponse.json(broadcast);
}
