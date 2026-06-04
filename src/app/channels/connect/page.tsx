import Link from "next/link";
import { siInstagram, siMessenger, siTelegram, siTiktok, siWhatsapp } from "simple-icons";
import { ChannelConnectionShell, GiftVisual } from "@/components/ChannelConnectionShell";
import { requireUser } from "@/lib/auth";

const channels = [
  {
    name: "Social Accounts",
    description: "新的可重用 OAuth Popup 模組。Meta、Telegram Bot 與 Mock provider 都從這裡進。",
    href: "/channels/connect/social",
    icon: "social",
  },
  {
    name: "Instagram",
    description: "沿用既有 Instagram 渠道連接頁，適合需要直接接回目前訊息渠道設定的情境。",
    href: "/channels/connect/instagram",
    icon: "ig",
  },
  {
    name: "Facebook Messenger",
    description: "沿用既有 Messenger / Meta Business 渠道頁，保留原本渠道授權流程。",
    href: "/channels/connect/messenger",
    icon: "ms",
  },
  {
    name: "Telegram",
    description: "透過新的 Social Accounts popup 視窗輸入 Bot Token，驗證後安全儲存。",
    href: "/channels/connect/social",
    icon: "tg",
  },
  {
    name: "TikTok",
    description: "保留擴充位，之後可掛上對應 provider strategy。",
    href: "/channels/connect/tiktok",
    icon: "tt",
    disabled: true,
  },
  {
    name: "WhatsApp",
    description: "保留擴充位，之後可掛上對應 provider strategy。",
    href: "/channels/connect/whatsapp",
    icon: "wa",
    disabled: true,
  },
];

export default async function ChannelConnectionPage() {
  await requireUser();

  return (
    <ChannelConnectionShell
      title="選擇要連接的渠道"
      description="先選擇你要連接的社群平台。新的 Social Accounts 模組會優先處理 OAuth popup 與 token 連接流程。"
      backHref="/dashboard"
      backLabel="返回後台"
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
                <p className="mt-2 text-xs font-medium text-amber-700">尚未接上正式 provider</p>
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
  social: { icon: siTelegram, background: "#0f766e" },
  ig: { icon: siInstagram, background: "#FF0069" },
  tt: { icon: siTiktok, background: "#000000" },
  wa: { icon: siWhatsapp, background: "#25D366" },
  ms: { icon: siMessenger, background: "#00B2FF" },
  tg: { icon: siTelegram, background: "#26A5E4" },
};

function ChannelIcon({ type }: { type: string }) {
  const item = channelIconMap[type as keyof typeof channelIconMap] ?? channelIconMap.ig;

  return (
    <span
      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full"
      style={{ backgroundColor: item.background }}
      aria-label={item.icon.title}
    >
      <svg className="h-6 w-6 text-white" role="img" viewBox="0 0 24 24" aria-hidden="true">
        <path fill="currentColor" d={item.icon.path} />
      </svg>
    </span>
  );
}
