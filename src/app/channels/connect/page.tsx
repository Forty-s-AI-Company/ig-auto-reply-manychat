import Link from "next/link";
import { Bot, FlaskConical, Link2 } from "lucide-react";
import { ChannelConnectionShell, GiftVisual } from "@/components/ChannelConnectionShell";
import { requireUser } from "@/lib/auth";

const channels = [
  {
    name: "Social Accounts",
    description: "統一的 OAuth popup 入口，Meta、Telegram 與 Mock provider 都會從這裡進入。",
    href: "/channels/connect/social",
    icon: "social",
  },
  {
    name: "Telegram Bot",
    description: "若只需要 Bot Token，會在同一套 provider 架構內完成驗證與儲存。",
    href: "/channels/connect/social",
    icon: "tg",
  },
  {
    name: "Mock OAuth Provider",
    description: "本機測試用 provider，完整走 popup、callback、postMessage 流程。",
    href: "/channels/connect/social",
    icon: "mock",
  },
  {
    name: "TikTok",
    description: "正式開放後會在這裡接入對應 provider。",
    href: "/channels/connect/tiktok",
    icon: "tt",
    disabled: true,
  },
  {
    name: "WhatsApp",
    description: "WhatsApp Business 連線入口會集中在這裡。",
    href: "/channels/connect/whatsapp",
    icon: "wa",
    disabled: true,
  },
];

export default async function ChannelConnectionPage() {
  await requireUser();

  return (
    <ChannelConnectionShell
      title="連接平台帳號"
      description="先選擇平台，再進入對應的 OAuth popup 或 token 授權流程。成功後會回到社群帳號頁面顯示已連接狀態。"
      backHref="/dashboard"
      backLabel="返回主控台"
      visual={<GiftVisual />}
    >
      <div className="space-y-6">
        {channels.map((channel) =>
          channel.disabled ? (
            <div key={channel.name} className="flex min-h-[132px] items-center gap-6 rounded-md bg-white px-8 py-6 opacity-70 shadow-[0_8px_28px_rgba(16,24,40,0.08)]">
              <ChannelIcon type={channel.icon} />
              <div>
                <h2 className="text-2xl font-bold text-[#17191c]">{channel.name}</h2>
                <p className="mt-2 max-w-[360px] text-sm leading-6 text-[#596170]">{channel.description}</p>
                <p className="mt-2 text-xs font-medium text-amber-700">尚未開放</p>
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
