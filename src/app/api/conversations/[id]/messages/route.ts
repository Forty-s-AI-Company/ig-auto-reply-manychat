import { NextResponse } from "next/server";
import { getSelectedInstagramChannelId, instagramChannelWhere } from "@/lib/account-scope";
import { requireApiUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { sendOutboundMessage } from "@/lib/messages";
import { assertRateLimit, assertSameOriginRequest } from "@/lib/security";
import { outboundMessageSchema } from "@/lib/validation";
import { getCurrentWorkspaceId } from "@/lib/workspaces";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  const originFailure = assertSameOriginRequest(request);
  if (originFailure) return originFailure;

  const auth = await requireApiUser();
  if (auth.response) return auth.response;
  const rateLimitFailure = assertRateLimit({
    key: `send-message:${auth.user.id}`,
    limit: 120,
    windowMs: 60 * 1000,
  });
  if (rateLimitFailure) return rateLimitFailure;
  const { id } = await params;
  const parsed = outboundMessageSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid message." }, { status: 400 });
  }

  const workspaceId = await getCurrentWorkspaceId();
  const selectedChannelId = await getSelectedInstagramChannelId();
  const channelWhere = instagramChannelWhere(selectedChannelId, workspaceId);
  const existing = await getDb().conversation.findFirst({
    where: { id, ...channelWhere },
    select: { id: true },
  });
  if (!existing) {
    return NextResponse.json({ error: "找不到這個 IG 帳號的對話。" }, { status: 404 });
  }

  try {
    const message = await sendOutboundMessage(id, parsed.data.text);
    return NextResponse.json(message);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "訊息送出失敗。" },
      { status: 400 },
    );
  }
}
