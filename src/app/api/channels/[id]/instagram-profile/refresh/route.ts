import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/auth";
import {
  buildInstagramChannelName,
  encryptMetaConfigJson,
  getMetaChannelConfig,
} from "@/lib/channels/meta";
import { getDb } from "@/lib/db";
import { getCurrentWorkspaceId } from "@/lib/workspaces";

type Params = { params: Promise<{ id: string }> };

type InstagramProfileResponse = {
  id?: string;
  user_id?: string;
  username?: string;
  name?: string;
  account_type?: string;
  profile_picture_url?: string;
  profile_pic?: string;
  error?: {
    message?: string;
    fbtrace_id?: string;
  };
};

async function readInstagramProfile(accessToken: string, instagramUserId?: string) {
  const version = process.env.META_GRAPH_API_VERSION || "v25.0";
  const graphAttempts = instagramUserId
    ? [
        {
          base: `https://graph.facebook.com/${version}/${instagramUserId}`,
          fields: "id,username,name,profile_picture_url",
        },
        {
          base: `https://graph.facebook.com/${version}/${instagramUserId}`,
          fields: "id,username,name",
        },
      ]
    : [];
  const fieldAttempts = [
    "id,user_id,username,name,account_type,profile_picture_url",
    "id,user_id,username,name,account_type,profile_pic",
    "id,user_id,username,name,account_type",
  ];

  let lastError = "Instagram profile request failed.";
  for (const attempt of graphAttempts) {
    const url = new URL(attempt.base);
    url.searchParams.set("fields", attempt.fields);
    url.searchParams.set("access_token", accessToken);

    const response = await fetch(url);
    const data = (await response.json()) as InstagramProfileResponse;
    if (response.ok && !data.error) return data;

    const trace = data.error?.fbtrace_id ? ` fbtrace_id=${data.error.fbtrace_id}` : "";
    lastError = `${data.error?.message || lastError}${trace}`;
  }

  for (const fields of fieldAttempts) {
    const url = new URL(`https://graph.instagram.com/${version}/me`);
    url.searchParams.set("fields", fields);
    url.searchParams.set("access_token", accessToken);

    const response = await fetch(url);
    const data = (await response.json()) as InstagramProfileResponse;
    if (response.ok && !data.error) return data;

    const trace = data.error?.fbtrace_id ? ` fbtrace_id=${data.error.fbtrace_id}` : "";
    lastError = `${data.error?.message || lastError}${trace}`;
  }
  throw new Error(lastError);
}

export async function POST(_request: Request, { params }: Params) {
  const auth = await requireApiUser();
  if (auth.response) return auth.response;

  const { id } = await params;
  const workspaceId = await getCurrentWorkspaceId();
  const db = getDb();
  const channel = await db.channel.findFirst({
    where: { id, workspaceId, type: "instagram" },
    select: { id: true, name: true, configJson: true },
  });
  if (!channel) {
    return NextResponse.json({ error: "找不到這個 IG 帳號。" }, { status: 404 });
  }

  const config = getMetaChannelConfig(channel.configJson);
  const accessToken = config.userAccessToken || config.pageAccessToken;
  if (!accessToken) {
    return NextResponse.json({ error: "這個 IG 帳號沒有可用 token，請重新登入 Instagram。" }, { status: 400 });
  }

  try {
    const existingInstagramId = config.instagramBusinessAccountId || config.instagramOauthUserId;
    const profile = await readInstagramProfile(accessToken, existingInstagramId);
    const instagramId = String(profile.user_id || profile.id || config.instagramBusinessAccountId || "");
    if (!instagramId) {
      return NextResponse.json({ error: "Instagram 未回傳帳號 ID，請重新登入 Instagram。" }, { status: 400 });
    }

    const nextName = buildInstagramChannelName(profile.username || "", profile.name || `ID ${instagramId}`);
    const existingName = await db.channel.findFirst({
      where: {
        workspaceId,
        type: "instagram",
        name: nextName,
        id: { not: channel.id },
      },
      select: { id: true },
    });

    if (existingName) {
      return NextResponse.json(
        { error: `已經有一個「${nextName}」帳號，請先刪除重複的舊卡片。` },
        { status: 409 },
      );
    }

    const nextConfig = {
      ...config,
      instagramBusinessAccountId: instagramId,
      instagramOauthUserId: config.instagramOauthUserId || config.instagramBusinessAccountId,
      instagramUsername: profile.username,
      instagramName: profile.name,
      instagramProfilePictureUrl: profile.profile_picture_url || profile.profile_pic || config.instagramProfilePictureUrl,
      profileReadWarning: undefined,
    };

    const updated = await db.channel.update({
      where: { id: channel.id },
      data: {
        name: nextName,
        enabled: true,
        configJson: encryptMetaConfigJson(nextConfig),
      },
      select: { id: true, name: true },
    });

    return NextResponse.json({ ok: true, channel: updated });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Meta 目前仍未允許讀取帳號名稱。請確認已接受 Instagram 測試員邀請後再試一次。",
      },
      { status: 400 },
    );
  }
}
