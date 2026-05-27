import { NextResponse } from "next/server";
import { getSelectedInstagramChannelId, instagramChannelWhere } from "@/lib/account-scope";
import { requireApiUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { addInternalNote } from "@/lib/messages";
import { internalNoteSchema } from "@/lib/validation";
import { getCurrentWorkspaceId } from "@/lib/workspaces";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  const auth = await requireApiUser();
  if (auth.response) return auth.response;

  const parsed = internalNoteSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "內部備註內容不完整。" }, { status: 400 });
  }

  const { id } = await params;
  const workspaceId = await getCurrentWorkspaceId();
  const selectedChannelId = await getSelectedInstagramChannelId();
  const existing = await getDb().conversation.findFirst({
    where: { id, ...instagramChannelWhere(selectedChannelId, workspaceId) },
    select: { id: true },
  });
  if (!existing) {
    return NextResponse.json({ error: "找不到這個工作區的對話。" }, { status: 404 });
  }

  const note = await addInternalNote({
    conversationId: id,
    userId: auth.user.id,
    text: parsed.data.text,
  });

  return NextResponse.json(note);
}
