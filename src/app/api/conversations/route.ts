import { NextResponse } from "next/server";
import { getSelectedInstagramChannelId } from "@/lib/account-scope";
import { requireApiUser } from "@/lib/auth";
import { getConversationApiList } from "@/lib/inbox-data";
import { getCurrentWorkspaceId } from "@/lib/workspaces";

export async function GET(request: Request) {
  const auth = await requireApiUser();
  if (auth.response) return auth.response;
  const searchParams = new URL(request.url).searchParams;
  const channelId = searchParams.get("channelId") || undefined;
  const limit = Math.min(Math.max(Number(searchParams.get("limit") || "50"), 1), 100);
  const workspaceId = await getCurrentWorkspaceId();
  const selectedChannelId = channelId || (await getSelectedInstagramChannelId());

  const conversations = await getConversationApiList({ workspaceId, selectedChannelId, limit });

  return NextResponse.json(conversations);
}
