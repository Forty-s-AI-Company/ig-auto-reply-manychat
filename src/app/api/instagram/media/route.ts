import { NextResponse } from "next/server";
import { getSelectedInstagramChannelId } from "@/lib/account-scope";
import { requireApiUser } from "@/lib/auth";
import { getMetaChannelConfig, toPrismaJson } from "@/lib/channels/meta";
import {
  isInstagramTokenRefreshable,
  refreshInstagramLongLivedToken,
} from "@/lib/channels/instagram-token";
import { getDb } from "@/lib/db";
import { getCurrentWorkspaceId } from "@/lib/workspaces";

type MetaMediaItem = {
  id?: string;
  caption?: string;
  media_type?: string;
  media_url?: string;
  thumbnail_url?: string;
  permalink?: string;
  timestamp?: string;
};

type MetaMediaResponse = {
  data?: MetaMediaItem[];
  error?: {
    message?: string;
    fbtrace_id?: string;
  };
};

function graphVersion() {
  return process.env.META_GRAPH_API_VERSION || "v25.0";
}

async function readInstagramMedia(input: {
  accessToken: string;
  instagramBusinessAccountId?: string;
  loginProvider?: "instagram" | "facebook";
}) {
  const version = graphVersion();
  const base =
    input.loginProvider === "instagram"
      ? `https://graph.instagram.com/${version}/me/media`
      : `https://graph.facebook.com/${version}/${input.instagramBusinessAccountId}/media`;
  const url = new URL(base);
  url.searchParams.set("fields", "id,caption,media_type,media_url,thumbnail_url,permalink,timestamp");
  url.searchParams.set("limit", "25");
  url.searchParams.set("access_token", input.accessToken);

  const response = await fetch(url, { cache: "no-store" });
  const data = (await response.json().catch(() => ({}))) as MetaMediaResponse;
  if (!response.ok || data.error) {
    const trace = data.error?.fbtrace_id ? ` fbtrace_id=${data.error.fbtrace_id}` : "";
    throw new Error(`${data.error?.message || "Instagram media request failed."}${trace}`);
  }

  return (data.data || []).map((item) => ({
    id: String(item.id || ""),
    caption: item.caption || "",
    mediaType: item.media_type || "MEDIA",
    mediaUrl: item.media_url || "",
    thumbnailUrl: item.thumbnail_url || "",
    permalink: item.permalink || "",
    timestamp: item.timestamp || "",
  })).filter((item) => item.id);
}

export async function GET(request: Request) {
  const auth = await requireApiUser();
  if (auth.response) return auth.response;

  const workspaceId = await getCurrentWorkspaceId();
  const selectedChannelId = await getSelectedInstagramChannelId();
  const requestedChannelId = new URL(request.url).searchParams.get("channelId") || "";
  const channel = await getDb().channel.findFirst({
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

  const db = getDb();
  let config = getMetaChannelConfig(channel.configJson);
  if (isInstagramTokenRefreshable(config)) {
    try {
      config = await refreshInstagramLongLivedToken(config);
      await db.channel.update({
        where: { id: channel.id },
        data: { configJson: toPrismaJson(config) },
      });
    } catch {
      // The media request below will return the provider error if the token is already expired.
    }
  }

  const accessToken = config.pageAccessToken || config.userAccessToken;
  if (!accessToken) {
    return NextResponse.json({ error: "這個 IG 帳號沒有可用 token，請重新登入 Instagram。" }, { status: 400 });
  }

  if (config.loginProvider !== "instagram" && !config.instagramBusinessAccountId) {
    return NextResponse.json({ error: "這個 IG 帳號缺少 Instagram Business Account ID。" }, { status: 400 });
  }

  try {
    const items = await readInstagramMedia({
      accessToken,
      instagramBusinessAccountId: config.instagramBusinessAccountId,
      loginProvider: config.loginProvider,
    });
    return NextResponse.json({ channel: { id: channel.id, name: channel.name }, items });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "無法讀取 Instagram 貼文。" },
      { status: 400 },
    );
  }
}
