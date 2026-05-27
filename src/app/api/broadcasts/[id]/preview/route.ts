import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/auth";
import { getBroadcastPreview } from "@/lib/broadcast-preview";
import { getCurrentWorkspaceId } from "@/lib/workspaces";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const auth = await requireApiUser();
  if (auth.response) return auth.response;

  const { id } = await params;
  const workspaceId = await getCurrentWorkspaceId();
  try {
    const preview = await getBroadcastPreview({ broadcastId: id, workspaceId });
    return NextResponse.json(preview);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "讀取廣播預覽失敗。" },
      { status: 400 },
    );
  }
}
