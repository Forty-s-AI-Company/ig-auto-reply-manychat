import { NextResponse } from "next/server";
import { getSelectedInstagramChannelId } from "@/lib/account-scope";
import { requireApiUser } from "@/lib/auth";
import { getMetaChannelConfig, toPrismaJson } from "@/lib/channels/meta";
import { refreshInstagramLongLivedToken } from "@/lib/channels/instagram-token";
import { getDb } from "@/lib/db";
import { getCurrentWorkspaceId } from "@/lib/workspaces";

export async function POST(request: Request) {
  const auth = await requireApiUser();
  if (auth.response) return auth.response;

  const workspaceId = await getCurrentWorkspaceId();
  const selectedChannelId = await getSelectedInstagramChannelId();
  const body = (await request.json().catch(() => ({}))) as { channelId?: string };
  const requestedChannelId = typeof body.channelId === "string" ? body.channelId : "";
  const db = getDb();
  const channel = await db.channel.findFirst({
    where: {
      workspaceId,
      type: "instagram",
      enabled: true,
      ...(requestedChannelId || selectedChannelId ? { id: requestedChannelId || selectedChannelId } : {}),
    },
    orderBy: { updatedAt: "desc" },
    select: { id: true, name: true, configJson: true },
  });

  if (!channel) {
    return NextResponse.json({ error: "目前沒有可用的 IG 帳號，請先在設定連接 Instagram。" }, { status: 404 });
  }

  const config = getMetaChannelConfig(channel.configJson);
  if (config.loginProvider !== "instagram") {
    return NextResponse.json(
      { error: "這個帳號是 Facebook Page Login，請改用重新連結粉專來更新 Page token。" },
      { status: 400 },
    );
  }

  try {
    const refreshed = await refreshInstagramLongLivedToken(config);
    await db.channel.update({
      where: { id: channel.id },
      data: { configJson: toPrismaJson(refreshed) },
    });

    return NextResponse.json({
      ok: true,
      channel: { id: channel.id, name: channel.name },
      userTokenExpiresAt: refreshed.userTokenExpiresAt,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? `${error.message} 如果 token 已經過期，Meta 不允許 refresh，請重新用 Instagram 登入授權。`
            : "Instagram token refresh failed.",
      },
      { status: 400 },
    );
  }
}
