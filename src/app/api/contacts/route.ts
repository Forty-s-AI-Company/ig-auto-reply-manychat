import { NextResponse } from "next/server";
import { getSelectedInstagramChannelId, instagramChannelWhere } from "@/lib/account-scope";
import { requireApiUser } from "@/lib/auth";
import { publicChannelSelect } from "@/lib/channels/public";
import { getDb } from "@/lib/db";
import { getCurrentWorkspaceId } from "@/lib/workspaces";

export async function GET(request: Request) {
  const auth = await requireApiUser();
  if (auth.response) return auth.response;

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") || undefined;
  const workspaceId = await getCurrentWorkspaceId();
  const selectedChannelId = await getSelectedInstagramChannelId();
  const channelWhere = instagramChannelWhere(selectedChannelId, workspaceId);
  const contacts = await getDb().contact.findMany({
    where: {
      ...channelWhere,
      ...(q
        ? {
            OR: [
              { displayName: { contains: q } },
              { username: { contains: q } },
              { email: { contains: q } },
            ],
          }
        : {}),
    },
    orderBy: { updatedAt: "desc" },
    include: {
      channel: { select: publicChannelSelect },
      tags: { include: { tag: true } },
      conversations: { orderBy: { updatedAt: "desc" }, take: 3 },
    },
  });

  return NextResponse.json(contacts);
}
