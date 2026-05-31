import { NextResponse } from "next/server";
import { getSelectedInstagramChannelId, instagramChannelWhere } from "@/lib/account-scope";
import { requireApiUser } from "@/lib/auth";
import { publicChannelSelect } from "@/lib/channels/public";
import { getDb } from "@/lib/db";
import { getCurrentWorkspaceId } from "@/lib/workspaces";

export async function GET(request: Request) {
  const auth = await requireApiUser();
  if (auth.response) return auth.response;
  const searchParams = new URL(request.url).searchParams;
  const channelId = searchParams.get("channelId") || undefined;
  const limit = Math.min(Math.max(Number(searchParams.get("limit") || "50"), 1), 100);
  const workspaceId = await getCurrentWorkspaceId();
  const selectedChannelId = channelId || (await getSelectedInstagramChannelId());
  const channelWhere = instagramChannelWhere(selectedChannelId, workspaceId);

  const conversations = await getDb().conversation.findMany({
    where: channelWhere,
    orderBy: [{ lastMessageAt: "desc" }, { updatedAt: "desc" }],
    take: limit,
    include: {
      contact: { include: { tags: { include: { tag: true } } } },
      channel: { select: publicChannelSelect },
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });

  return NextResponse.json(conversations);
}
