import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/auth";
import { publicChannelSelect } from "@/lib/channels/public";
import { getDb } from "@/lib/db";
import { getCurrentWorkspaceId } from "@/lib/workspaces";

export async function GET() {
  const auth = await requireApiUser();
  if (auth.response) return auth.response;
  const workspaceId = await getCurrentWorkspaceId();
  return NextResponse.json(
    await getDb().channel.findMany({
      where: { workspaceId },
      orderBy: { createdAt: "asc" },
      select: publicChannelSelect,
    }),
  );
}
