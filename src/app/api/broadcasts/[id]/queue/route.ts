import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/auth";
import { queueBroadcast } from "@/lib/jobs";

type Params = { params: Promise<{ id: string }> };

export async function POST(_request: Request, { params }: Params) {
  const auth = await requireApiUser();
  if (auth.response) return auth.response;
  const { id } = await params;

  try {
    const queued = await queueBroadcast(id);
    return NextResponse.json({ ok: true, queued });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Queue failed." },
      { status: 400 },
    );
  }
}
