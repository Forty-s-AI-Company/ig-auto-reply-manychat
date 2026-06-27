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

function getProfileRefreshErrorMessage(error: unknown) {
  const rawMessage = error instanceof Error ? error.message : "";
  if (rawMessage.includes("Unsupported request") || rawMessage.includes("method type: get")) {
    return "Meta 目前沒有允許用這個授權方式讀取帳號名稱與頭像。請先確認此 IG 帳號仍授權 InboxPilot，或重新登入 Instagram 後再試一次。";
  }

  if (rawMessage.includes("permission") || rawMessage.includes("access token")) {
    return "Instagram 授權不足或 token 已失效，請重新登入 Instagram 後再試一次。";
  }

  return "Instagram 目前沒有回傳帳號名稱與頭像。請稍後再試，或重新登入 Instagram 後再讀取一次。";
}

async function readInstagramProfile(
  accessToken: string,
  instagramUserId?: string,
  loginProvider?: "instagram" | "facebook",
) {
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

  if (loginProvider === "instagram") {
    throw new Error(lastError);
  }

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
    const profile = await readInstagramProfile(accessToken, existingInstagramId, config.loginProvider);
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
        error: getProfileRefreshErrorMessage(error),
      },
      { status: 400 },
    );
  }
}
