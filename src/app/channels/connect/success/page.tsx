import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { ChannelConnectionShell, InstagramVisual } from "@/components/ChannelConnectionShell";
import { requireUser } from "@/lib/auth";
import { getMetaChannelConfig } from "@/lib/channels/meta";
import { getDb } from "@/lib/db";
import { getCurrentWorkspaceId } from "@/lib/workspaces";
import { OAuthPopupSuccess } from "./OAuthPopupSuccess";

type Props = {
  searchParams?: Promise<{
    connected?: string;
    channel?: string;
    mode?: string;
  }>;
};

export default async function ChannelConnectionSuccessPage({ searchParams }: Props) {
  await requireUser();
  const params = searchParams ? await searchParams : {};
  const workspaceId = await getCurrentWorkspaceId();
  const channel = params.channel
    ? await getDb().channel.findFirst({ where: { id: params.channel, workspaceId }, select: { name: true, configJson: true } })
    : await getDb().channel.findFirst({
        where: { workspaceId, type: "instagram", enabled: true },
        orderBy: { updatedAt: "desc" },
        select: { name: true, configJson: true },
      });
  const config = getMetaChannelConfig(channel?.configJson);
  const accountName = channel?.name || "Connected account";
  const connectedCount = Number(params.connected || 1);

  return (
    <ChannelConnectionShell
      title="連接 Social Accounts"
      description="使用你的社群帳號連接到自動回覆平台。"
      backHref="/channels/connect/social"
      backLabel="選擇其他平台"
      visual={<InstagramVisual />}
    >
      <div className="max-w-[430px]">
        <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-green-50">
          <CheckCircle2 className="h-8 w-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold leading-tight text-[#17191c]">
          {accountName} 已成功連接
        </h2>
        <p className="mt-4 text-base leading-7 text-[#596170]">
          {connectedCount > 1 ? `已連接 ${connectedCount} 個帳號到自動回覆平台。` : "你的帳號已經成功連接到自動回覆平台。"}
        </p>
        {channel ? (
          <div className="mt-6 rounded-lg border border-[#d7dbe0] bg-white p-4">
            <div className="flex items-center gap-3">
              {config.instagramProfilePictureUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={config.instagramProfilePictureUrl}
                  alt={config.instagramName || config.instagramUsername || accountName}
                  className="h-12 w-12 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#eef6ff] text-sm font-semibold text-[#006fe6]">
                  IG
                </div>
              )}
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[#17191c]">{config.instagramName || accountName}</p>
                <p className="mt-1 text-xs text-[#596170]">
                  {config.instagramUsername ? `@${config.instagramUsername}` : "未讀取到 Instagram 使用者名稱"}
                </p>
                <p className="mt-1 text-xs text-[#98a2b3]">
                  {config.pageName ? `綁定粉專：${config.pageName}` : config.loginProvider === "instagram" ? "登入方式：Instagram OAuth" : "登入方式：Meta / Facebook"}
                </p>
              </div>
            </div>
          </div>
        ) : null}
        <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
          如果這不是你要綁定的帳號，請先到 Channels 解除綁定，再重新回到 Social Accounts 連接正確帳號。
        </div>
        <OAuthPopupSuccess />
        <div className="mt-8 grid gap-3">
          <Link
            href="/channels#instagram"
            className="flex h-11 w-full items-center justify-center rounded-md border border-[#d0d5dd] bg-white px-4 text-sm font-bold text-[#17191c] hover:bg-[#f9fafb]"
          >
            前往 Channels 檢查綁定
          </Link>
          <Link
            href="/channels/connect/social"
            className="flex h-11 w-full items-center justify-center rounded-md bg-[#006fe6] px-4 text-sm font-bold text-white hover:bg-[#005fd0]"
          >
            回到 Social Accounts
          </Link>
        </div>
      </div>
    </ChannelConnectionShell>
  );
}
