import Link from "next/link";
import { siInstagram, siMessenger, siTelegram, siTiktok, siWhatsapp } from "simple-icons";
import { ChannelConnectionShell, GiftVisual } from "@/components/ChannelConnectionShell";
import { requireUser } from "@/lib/auth";

const channels = [
  {
    name: "Instagram",
    description: "連接 Instagram，建立留言關鍵字、私訊與自動回覆流程。",
    href: "/channels/connect/instagram",
    icon: "ig",
  },
  {
    name: "TikTok",
    description: "連接 TikTok，建立短影音互動與訊息自動化。",
    href: "/channels/connect/tiktok",
    icon: "tt",
    disabled: true,
  },
  {
    name: "WhatsApp",
    description: "連接 WhatsApp，集中管理客戶訊息與回覆流程。",
    href: "/channels/connect/whatsapp",
    icon: "wa",
    disabled: true,
  },
  {
    name: "Facebook Messenger",
    description: "連接 Messenger，建立粉專訊息自動化與客服流程。",
    href: "/channels/connect/messenger",
    icon: "ms",
  },
  {
    name: "Telegram",
    description: "連接 Telegram，建立頻道與私訊自動化流程。",
    href: "/channels/connect/telegram",
    icon: "tg",
    disabled: true,
  },
];

export default async function ChannelConnectionPage() {
  await requireUser();

  return (
    <ChannelConnectionShell
      title="你想從哪個平台開始？"
      description="不用擔心，之後也可以再連接其他社群平台。"
      backHref="/dashboard"
      backLabel="返回"
      visual={<GiftVisual />}
    >
      <div className="space-y-6">
        {channels.map((channel) =>
          channel.disabled ? (
            <div key={channel.name} className="flex min-h-[132px] items-center gap-6 rounded-md bg-white px-8 py-6 opacity-70 shadow-[0_8px_28px_rgba(16,24,40,0.08)]">
              <ChannelIcon type={channel.icon} />
              <div>
                <h2 className="text-2xl font-bold text-[#17191c]">{channel.name}</h2>
                <p className="mt-2 max-w-[330px] text-sm leading-5 text-[#596170]">{channel.description}</p>
                <p className="mt-2 text-xs font-medium text-amber-700">需完成正式 API 設定</p>
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
                <p className="mt-2 max-w-[330px] text-sm leading-5 text-[#596170]">{channel.description}</p>
              </div>
            </Link>
          ),
        )}
      </div>
    </ChannelConnectionShell>
  );
}

const channelIconMap = {
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
