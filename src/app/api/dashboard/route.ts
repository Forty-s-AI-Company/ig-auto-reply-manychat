import { NextResponse } from "next/server";
import { getSelectedInstagramChannelId, instagramChannelWhere } from "@/lib/account-scope";
import { requireApiUser } from "@/lib/auth";
import { publicChannelSelect } from "@/lib/channels/public";
import { getDb } from "@/lib/db";
import { getCurrentWorkspaceId } from "@/lib/workspaces";

export async function GET() {
  const auth = await requireApiUser();
  if (auth.response) return auth.response;

  const db = getDb();
  const workspaceId = await getCurrentWorkspaceId();
  const selectedChannelId = await getSelectedInstagramChannelId();
  const channelWhere = instagramChannelWhere(selectedChannelId, workspaceId);
  const [contacts, messages, openConversations, automations, recentMessages] =
    await Promise.all([
      db.contact.count({ where: channelWhere }),
      db.message.count({ where: channelWhere }),
      db.conversation.count({ where: { status: "open", ...channelWhere } }),
      db.automation.count({ where: { workspaceId } }),
      db.message.findMany({
        where: channelWhere,
        orderBy: { createdAt: "desc" },
        take: 8,
        include: { contact: true, channel: { select: publicChannelSelect } },
      }),
    ]);

  return NextResponse.json({
    contacts,
    messages,
    openConversations,
    automations,
    recentMessages,
  });
}
