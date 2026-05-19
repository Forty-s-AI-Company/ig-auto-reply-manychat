import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { conversationStatusSchema } from "@/lib/validation";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const auth = await requireApiUser();
  if (auth.response) return auth.response;
  const { id } = await params;

  const conversation = await getDb().conversation.findUnique({
    where: { id },
    include: {
      contact: { include: { tags: { include: { tag: true } } } },
      channel: true,
      messages: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!conversation) {
    return NextResponse.json({ error: "Conversation not found." }, { status: 404 });
  }

  return NextResponse.json(conversation);
}

export async function PATCH(request: Request, { params }: Params) {
  const auth = await requireApiUser();
  if (auth.response) return auth.response;
  const { id } = await params;
  const parsed = conversationStatusSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid conversation status." }, { status: 400 });
  }

  const conversation = await getDb().conversation.update({
    where: { id },
    data: { status: parsed.data.status },
  });

  return NextResponse.json(conversation);
}
