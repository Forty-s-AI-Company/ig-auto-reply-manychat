import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { ChannelConnectionShell, InstagramVisual } from "@/components/ChannelConnectionShell";
import { requireUser } from "@/lib/auth";
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
    ? await getDb().channel.findFirst({ where: { id: params.channel, workspaceId }, select: { name: true } })
    : await getDb().channel.findFirst({
        where: { workspaceId, type: "instagram", enabled: true },
        orderBy: { updatedAt: "desc" },
        select: { name: true },
      });
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
        <OAuthPopupSuccess />
        <Link
          href="/channels/connect/social"
          className="mt-8 flex h-11 w-full items-center justify-center rounded-md bg-[#006fe6] px-4 text-sm font-bold text-white hover:bg-[#005fd0]"
        >
          回到 Social Accounts
        </Link>
      </div>
    </ChannelConnectionShell>
  );
}
