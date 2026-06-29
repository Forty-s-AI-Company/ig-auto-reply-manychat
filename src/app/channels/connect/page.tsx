import Link from "next/link";
import { Bot, FlaskConical, Link2 } from "lucide-react";
import { ChannelConnectionShell, GiftVisual } from "@/components/ChannelConnectionShell";
import { requireUser } from "@/lib/auth";
import { getChannelConnectOptionState } from "@/lib/channels/channel-connect-visibility";
import type { ChannelConnectOptionId } from "@/lib/channels/channel-connect-visibility";
import { getInboxPilotDeploymentEnv } from "@/lib/deployment-env";
import { isSimpleRelease } from "@/lib/release-mode";

const channels: Array<{
  id: ChannelConnectOptionId;
  name: string;
  description: string;
  href: string;
  icon: string;
}> = [
  {
    id: "instagram",
    name: "Instagram",
    description: "正式站先只開放 Instagram 連線，收件匣、聯絡人、自動化都會以 IG 為主。",
    href: "/channels/connect/social",
    icon: "social",
  },
  {
    id: "telegram-bot",
    name: "Telegram Bot",
    description: "若只需要 Bot Token，會在同一套 provider 架構內完成驗證與儲存。",
    href: "/channels/connect/social",
    icon: "tg",
  },
  {
    id: "mock",
    name: "Mock OAuth Provider",
    description: "本機測試用 provider，完整走 popup、callback、postMessage 流程。",
    href: "/channels/connect/social",
    icon: "mock",
  },
  {
    id: "tiktok",
    name: "TikTok",
    description: "正式開放後會在這裡接入對應 provider。",
    href: "/channels/connect/tiktok",
    icon: "tt",
  },
  {
    id: "whatsapp",
    name: "WhatsApp",
    description: "WhatsApp Business 連線入口會集中在這裡。",
    href: "/channels/connect/whatsapp",
    icon: "wa",
  },
];

export default async function ChannelConnectionPage() {
  await requireUser();
  const simpleRelease = await isSimpleRelease();
  const deploymentEnv = getInboxPilotDeploymentEnv();
  const visibleChannels = channels
    .map((channel) => ({
      ...channel,
      uiState: getChannelConnectOptionState(channel.id, {
        simpleRelease,
        deploymentEnv,
      }),
    }))
    .filter((channel) => channel.uiState.visible);

  return (
    <ChannelConnectionShell
      title="連接平台帳號"
      description="先選擇平台，再進入對應的 OAuth popup 或 token 授權流程。成功後會回到社群帳號頁面顯示已連接狀態。"
      backHref="/dashboard"
      backLabel="返回主控台"
      visual={<GiftVisual />}
    >
        <div className="space-y-6">
          {visibleChannels.map((channel) =>
          !channel.uiState.enabled ? (
            <div key={channel.name} className="flex min-h-[132px] items-center gap-6 rounded-md bg-white px-8 py-6 shadow-[0_8px_28px_rgba(16,24,40,0.08)]">
              <ChannelIcon type={channel.icon} />
              <div>
                <h2 className="text-2xl font-bold text-[#17191c]">{channel.name}</h2>
                <p className="mt-2 max-w-[360px] text-sm leading-6 text-[#596170]">{channel.description}</p>
                {channel.uiState.disabledReason ? (
                  <p className="mt-2 max-w-[420px] text-xs leading-6 text-[#b54708]">{channel.uiState.disabledReason}</p>
                ) : null}
                <button
                  type="button"
                  disabled
                  aria-disabled="true"
                  className="mt-4 inline-flex cursor-not-allowed rounded-md border border-[#d7dbe0] bg-[#f8fafc] px-3 py-2 text-sm font-medium text-[#98a2b3]"
                >
                  {channel.id === "mock" ? "僅限本機 / QA 使用" : "正式開放後可連線"}
                </button>
              </div>
            </div>
          ) : (
            <Link
              key={channel.name}
              href={channel.href}
              className="flex min-h-[132px] items-center gap-6 rounded-md bg-white px-8 py-6 shadow-[0_8px_28px_rgba(16,24,40,0.08)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_34px_rgba(16,24,40,0.12)]"
            >
              <ChannelIcon type={channel.icon} />
              <div>
                <h2 className="text-2xl font-bold text-[#17191c]">{channel.name}</h2>
                <p className="mt-2 max-w-[360px] text-sm leading-6 text-[#596170]">{channel.description}</p>
              </div>
            </Link>
          ),
        )}
      </div>
    </ChannelConnectionShell>
  );
}

const channelIconMap = {
  social: { icon: Link2, background: "#0f766e" },
  tg: { icon: Bot, background: "#26A5E4" },
  mock: { icon: FlaskConical, background: "#7c3aed" },
  tt: { icon: Link2, background: "#000000" },
  wa: { icon: Link2, background: "#25D366" },
};

function ChannelIcon({ type }: { type: string }) {
  const item = channelIconMap[type as keyof typeof channelIconMap] ?? channelIconMap.social;
  const Icon = item.icon;

  return (
    <span
      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full"
      style={{ backgroundColor: item.background }}
      aria-label={type}
    >
      <Icon className="h-6 w-6 text-white" />
    </span>
  );
}
