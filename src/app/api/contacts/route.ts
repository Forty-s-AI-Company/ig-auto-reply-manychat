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
  const limit = Math.min(Math.max(Number(searchParams.get("limit") || "50"), 1), 100);
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
    take: limit,
    include: {
      channel: { select: publicChannelSelect },
      tags: { include: { tag: true } },
      _count: { select: { conversations: true } },
    },
  });

  return NextResponse.json(contacts);
}
