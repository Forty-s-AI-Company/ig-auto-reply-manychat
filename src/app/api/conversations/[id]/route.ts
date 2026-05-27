import { NextResponse } from "next/server";
import { getSelectedInstagramChannelId, instagramChannelWhere } from "@/lib/account-scope";
import { requireApiUser } from "@/lib/auth";
import { publicChannelSelect } from "@/lib/channels/public";
import { getDb } from "@/lib/db";
import { conversationUpdateSchema } from "@/lib/validation";
import { getCurrentWorkspaceId } from "@/lib/workspaces";

type Params = { params: Promise<{ id: string }> };

const conversationInclude = {
  contact: { include: { tags: { include: { tag: true } } } },
  channel: { select: publicChannelSelect },
  assignedTo: { select: { id: true, name: true, email: true } },
  messages: { orderBy: { createdAt: "asc" as const } },
};

export async function GET(_request: Request, { params }: Params) {
  const auth = await requireApiUser();
  if (auth.response) return auth.response;
  const { id } = await params;
  const workspaceId = await getCurrentWorkspaceId();
  const selectedChannelId = await getSelectedInstagramChannelId();
  const channelWhere = instagramChannelWhere(selectedChannelId, workspaceId);

  const conversation = await getDb().conversation.findFirst({
    where: { id, ...channelWhere },
    include: conversationInclude,
  });

  if (!conversation) {
    return NextResponse.json({ error: "找不到這個 IG 帳號底下的對話。" }, { status: 404 });
  }

  return NextResponse.json(conversation);
}

export async function PATCH(request: Request, { params }: Params) {
  const auth = await requireApiUser();
  if (auth.response) return auth.response;
  const { id } = await params;
  const parsed = conversationUpdateSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid conversation update." }, { status: 400 });
  }

  const workspaceId = await getCurrentWorkspaceId();
  const selectedChannelId = await getSelectedInstagramChannelId();
  const channelWhere = instagramChannelWhere(selectedChannelId, workspaceId);
  const existing = await getDb().conversation.findFirst({
    where: { id, ...channelWhere },
    select: { id: true },
  });
  if (!existing) {
    return NextResponse.json({ error: "找不到這個 IG 帳號底下的對話。" }, { status: 404 });
  }

  if (parsed.data.assignedToId) {
    const member = await getDb().workspaceUser.findFirst({
      where: { workspaceId, userId: parsed.data.assignedToId },
      select: { userId: true },
    });
    if (!member) return NextResponse.json({ error: "指派對象不屬於目前工作區。" }, { status: 400 });
  }

  const conversation = await getDb().conversation.update({
    where: { id },
    data: {
      status: parsed.data.status,
      assignedToId: parsed.data.assignedToId,
      reminderAt:
        parsed.data.reminderAt === undefined
          ? undefined
          : parsed.data.reminderAt
            ? new Date(parsed.data.reminderAt)
            : null,
      isFavorite: parsed.data.isFavorite,
      lastReadAt:
        parsed.data.lastReadAt === undefined
          ? undefined
          : parsed.data.lastReadAt
            ? new Date(parsed.data.lastReadAt)
            : null,
      unreadCount: parsed.data.lastReadAt ? 0 : undefined,
    },
    include: conversationInclude,
  });

  return NextResponse.json(conversation);
}
