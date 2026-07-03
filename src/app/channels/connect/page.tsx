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
    description: "Telegram 屬於後續受控通路；正式開放前不會打開 token 授權或儲存流程。",
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
    description: "TikTok 尚未納入本次付費版可用範圍，需完成官方 API、權限與客服流程後才會開放。",
    href: "/channels/connect/tiktok",
    icon: "tt",
  },
  {
    id: "whatsapp",
    name: "WhatsApp",
    description: "WhatsApp Business 尚未納入本次付費版可用範圍，正式開放前不會啟動授權流程。",
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
  const connectableChannels = visibleChannels.filter((channel) => channel.uiState.enabled);
  const disabledChannels = visibleChannels.filter((channel) => !channel.uiState.enabled);

  return (
    <ChannelConnectionShell
      title="連接平台帳號"
      description="先選擇平台，再進入對應的 OAuth popup 或 token 授權流程。成功後會回到社群帳號頁面顯示已連接狀態。"
      backHref="/dashboard"
      backLabel="返回主控台"
      visual={<GiftVisual />}
    >
      <div className="space-y-6">
        <section className="space-y-3">
          <SectionHeading title="目前可連線" description="這些入口會直接打開授權流程，完成後會回到社群帳號頁。" />
          <div className="space-y-3">
            {connectableChannels.map((channel) => (
              <Link
                key={channel.name}
                href={channel.href}
                className="flex min-h-[132px] flex-col items-start gap-4 rounded-md bg-white px-5 py-6 shadow-[0_8px_28px_rgba(16,24,40,0.08)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_34px_rgba(16,24,40,0.12)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006fe6] focus-visible:ring-offset-2 sm:flex-row sm:items-center sm:gap-6 sm:px-8"
              >
                <ChannelIcon type={channel.icon} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-2xl font-bold text-[#17191c]">{channel.name}</h2>
                    <ConnectionStateBadge tone="success">{channel.uiState.statusLabel || "可連線"}</ConnectionStateBadge>
                  </div>
                  <p className="mt-2 max-w-[360px] text-sm leading-6 text-[#596170]">{channel.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {disabledChannels.length > 0 ? (
          <section className="space-y-3">
            <SectionHeading
              title="規劃中與受控開通"
              description="這些平台保留成清楚的受控開通入口，但不會打開授權流程，避免看起來像壞掉的按鈕。"
            />
            <div className="space-y-3">
              {disabledChannels.map((channel) => {
                const disabledReasonId = `channels-connect-${channel.id}-disabled-reason`;

                return (
                  <div key={channel.name} className="flex min-h-[132px] flex-col items-start gap-4 rounded-md bg-white px-5 py-6 shadow-[0_8px_28px_rgba(16,24,40,0.08)] sm:flex-row sm:items-center sm:gap-6 sm:px-8">
                    <ChannelIcon type={channel.icon} />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-2xl font-bold text-[#17191c]">{channel.name}</h2>
                        <ConnectionStateBadge tone="warning">{channel.uiState.statusLabel || "暫停中"}</ConnectionStateBadge>
                      </div>
                      <p className="mt-2 max-w-[360px] text-sm leading-6 text-[#596170]">{channel.description}</p>
                      {channel.uiState.disabledReason ? (
                        <p id={disabledReasonId} className="mt-2 max-w-[420px] text-xs leading-6 text-[#b54708]">
                          {channel.uiState.disabledReason}
                        </p>
                      ) : null}
                      <button
                        type="button"
                        disabled
                        aria-disabled="true"
                        aria-describedby={channel.uiState.disabledReason ? disabledReasonId : undefined}
                        title={channel.uiState.disabledReason || "此平台目前受控開通，暫時不會打開授權流程。"}
                        data-testid={`channels-connect-${channel.id}-disabled`}
                        className="mt-4 inline-flex cursor-not-allowed rounded-md border border-[#d7dbe0] bg-[#f8fafc] px-3 py-2 text-sm font-medium text-[#98a2b3]"
                      >
                        {channel.id === "mock" ? "僅限本機 / QA 使用" : channel.uiState.statusLabel || "受控開通"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ) : null}
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
      aria-hidden="true"
    >
      <Icon className="h-6 w-6 text-white" />
    </span>
  );
}

function SectionHeading({ title, description }: { title: string; description: string }) {
  return (
    <div className="space-y-1">
      <h2 className="text-lg font-semibold text-[#17191c]">{title}</h2>
      <p className="text-sm leading-6 text-[#596170]">{description}</p>
    </div>
  );
}

function ConnectionStateBadge({
  tone,
  children,
}: {
  tone: "success" | "warning";
  children: string;
}) {
  const toneClasses =
    tone === "success" ? "border-green-200 bg-green-50 text-green-700" : "border-amber-200 bg-amber-50 text-amber-700";

  return <span className={`inline-flex shrink-0 rounded-full border px-2 py-0.5 text-xs font-medium ${toneClasses}`}>{children}</span>;
}
