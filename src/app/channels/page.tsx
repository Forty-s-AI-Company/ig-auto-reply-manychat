import Link from "next/link";
import type { ReactNode } from "react";
import {
  Camera,
  Plug,
} from "lucide-react";
import { AdminShell } from "@/components/AdminShell";
import { DismissibleNoticeToast } from "@/components/DismissibleNoticeToast";
import { DisconnectChannelButton } from "@/components/DisconnectChannelButton";
import { InstagramChannelActions } from "@/components/InstagramChannelActions";
import { RefreshInstagramProfileButton } from "@/components/RefreshInstagramProfileButton";
import { requireUser } from "@/lib/auth";
import { getMetaChannelConfig } from "@/lib/channels/meta";
import { getSafeInstagramProfileRefreshError } from "@/lib/channels/instagram-profile-errors";
import { getDb } from "@/lib/db";
import { getCurrentWorkspaceId } from "@/lib/workspaces";

type Props = {
  searchParams?: Promise<{
    connected?: string;
    meta_error?: string;
    mode?: string;
  }>;
};

const INSTAGRAM_TESTER_INVITES_URL = "https://www.instagram.com/accounts/manage_access/";

const settingsNavItems = [
  { label: "方案與用量", href: "/billing" },
  { label: "AI 設定", href: "/ai-settings" },
  { label: "社群平台", href: "/channels", current: true },
  { label: "關於 InboxPilot", href: "#about-inboxpilot" },
] as const;

const channelCards = [
  {
    id: "instagram" as const,
    name: "Instagram",
    description: "目前正式主線只開放 Instagram。收件匣、聯絡人、自動化與分析都會以已連結的 IG 帳號為 scope。",
    href: "/channels/connect/social",
    enabled: true,
    statusLabel: "可連線",
  },
  {
    id: "tiktok" as const,
    name: "TikTok",
    description: "尚未開放。需要完成官方 API、權限、客服與資料同步流程後，才會加入正式產品範圍。",
    href: "",
    enabled: false,
    statusLabel: "未開放",
  },
  {
    id: "whatsapp" as const,
    name: "WhatsApp",
    description: "尚未開放。WhatsApp Business 授權、訊息範本與 webhook 驗證完成前，不會顯示可連線操作。",
    href: "",
    enabled: false,
    statusLabel: "未開放",
  },
];

function statusLabel(enabled: boolean) {
  return enabled ? "已啟用" : "已停用";
}

function formatDate(value?: string) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("zh-TW", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function sanitizeConfig(configJson: unknown) {
  const config = getMetaChannelConfig(configJson);
  const hasStoredToken = Boolean(config.pageAccessToken || config.userAccessToken);
  return {
    hasStoredToken,
    loginProvider: config.loginProvider || "facebook",
    pageId: config.pageId,
    pageName: config.pageName,
    instagramBusinessAccountId: config.instagramBusinessAccountId,
    instagramOauthUserId: config.instagramOauthUserId,
    instagramUsername: config.instagramUsername,
    instagramName: config.instagramName,
    profileReadWarning: config.profileReadWarning
      ? getSafeInstagramProfileRefreshError(config.profileReadWarning)
      : undefined,
    tokenSource: hasStoredToken ? "channel" : config.tokenEnv || undefined,
    connectedAt: config.connectedAt,
    userTokenExpiresAt: config.userTokenExpiresAt,
  };
}

export default async function ChannelsPage({ searchParams }: Props) {
  await requireUser();
  const workspaceId = await getCurrentWorkspaceId();
  const params = searchParams ? await searchParams : {};
  const channels = await getDb().channel.findMany({
    where: { workspaceId },
    orderBy: [{ type: "asc" }, { createdAt: "asc" }],
  });
  const instagramChannels = channels.filter((channel) => {
    if (channel.type !== "instagram") return false;
    const config = getMetaChannelConfig(channel.configJson);
    return Boolean(config.instagramUsername || config.instagramBusinessAccountId || config.instagramProfilePictureUrl || channel.name.startsWith("Instagram @"));
  });

  return (
    <AdminShell title="設定">
      <div className="flex w-full gap-5 lg:h-[calc(100dvh-104px)] lg:overflow-hidden xl:gap-6">
        <aside className="hidden w-52 shrink-0 overflow-y-auto border-r border-[#d7dbe0] pr-5 xl:w-56 lg:block">
          <nav className="space-y-1 text-sm">
            {settingsNavItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                aria-current={"current" in item && item.current ? "page" : undefined}
                className={`block rounded-md px-3 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006fe6] focus-visible:ring-offset-2 ${
                  "current" in item && item.current
                    ? "bg-[#e6f8fa] font-semibold text-[#064e54]"
                    : "text-[#4b5563] hover:bg-[#eceff3] hover:text-[#111827]"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>

        <div className="min-w-0 flex-1 space-y-5 pb-6 pr-1 lg:overflow-y-auto lg:pb-0">
          <nav className="flex snap-x snap-mandatory gap-2 overflow-x-auto pb-1 lg:hidden" aria-label="設定快速導覽">
            {settingsNavItems.map((item) => (
              <Link
                key={`mobile-${item.label}`}
                href={item.href}
                aria-current={"current" in item && item.current ? "page" : undefined}
                className={`shrink-0 snap-start rounded-full border px-3 py-2 text-xs font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006fe6] focus-visible:ring-offset-2 sm:text-sm ${
                  "current" in item && item.current
                    ? "border-[#b6eef2] bg-[#e6f8fa] text-[#064e54]"
                    : "border-[#d7dbe0] bg-white text-[#344054] hover:bg-[#f8fafc]"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <header className="flex flex-wrap items-start justify-between gap-3 border-b border-[#d7dbe0] pb-5">
            <div>
              <h1 className="mt-1 text-2xl font-semibold text-[#111827]">社群平台</h1>
              <p className="mt-2 max-w-3xl text-sm text-[#667085]">
                管理 Instagram 連線與後續社群平台開放狀態。方案、AI 與其他設定已拆到各自頁面，避免設定頁變成一大串雜項。
              </p>
            </div>
            <Link href="/channels/connect" className="inline-flex items-center gap-2 rounded-md bg-[#006fe6] px-4 py-2 text-sm font-medium text-white hover:bg-[#0057b8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006fe6] focus-visible:ring-offset-2">
              <Camera className="h-4 w-4" aria-hidden="true" />
              <span className="sm:hidden">新增帳號</span>
              <span className="hidden sm:inline">+ 新增平台帳號</span>
            </Link>
          </header>

          {params.connected ? (
            <Notice title="Instagram 已連結" tone="success">
              已連結 {params.connected} 個 Instagram 帳號。
            </Notice>
          ) : null}
          {params.meta_error ? (
            <Notice title="Meta 授權失敗" tone="danger">
              {params.meta_error}
            </Notice>
          ) : null}

          <section id="platform-connect" className="space-y-3">
            <SectionTitle title="社群平台" description="依照平台授權流程整理成：先選擇平台，再登入授權，成功後回到本頁顯示已連結帳號。" />
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {channelCards.map((entry) => (
                <div
                  key={entry.name}
                  aria-disabled={!entry.enabled}
                  className={`flex h-full flex-col rounded-lg border border-[#d7dbe0] bg-white p-4 transition ${
                    entry.enabled ? "" : "cursor-not-allowed opacity-60"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-medium text-[#111827]">{entry.name}</h3>
                      <p className="mt-2 text-sm leading-6 text-[#667085]">{entry.description}</p>
                    </div>
                    <div className="flex shrink-0 items-start gap-2 md:flex-col md:items-end">
                      <ConnectionStateBadge tone={entry.enabled ? "success" : "neutral"}>
                        {entry.statusLabel}
                      </ConnectionStateBadge>
                      <Plug className="h-5 w-5 text-[#98a2b3]" aria-hidden="true" />
                    </div>
                  </div>
                  {entry.enabled ? (
                    <Link
                      href={entry.href}
                      className="mt-4 inline-flex rounded-md bg-[#006fe6] px-3 py-2 text-sm font-medium text-white hover:bg-[#0057b8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006fe6] focus-visible:ring-offset-2"
                    >
                      登入並連線
                    </Link>
                  ) : (
                    <>
                      <div className="mt-4 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-xs leading-6 text-slate-600">
                        目前未開放線上連線。這個入口只用來讓使用者知道平台狀態，不會打開無效授權流程。
                      </div>
                      <DisabledFeatureButton reason="此平台尚未開放，完成官方 API、權限與訊息收發驗證後才會提供連線。">
                        未開放
                      </DisabledFeatureButton>
                    </>
                  )}
                </div>
              ))}
            </div>
          </section>

          <section id="instagram" className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <SectionTitle title="Instagram" description="管理已連結帳號、token 狀態、權限刷新與帳號停用。" />
              <Link href={INSTAGRAM_TESTER_INVITES_URL} target="_blank" rel="noopener noreferrer" className="rounded-md border border-[#d7dbe0] px-3 py-2 text-sm text-[#344054] hover:bg-[#f8fafc] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006fe6] focus-visible:ring-offset-2">
                開啟 Instagram 應用程式權限
              </Link>
            </div>
            <div className="space-y-3">
              {instagramChannels.map((channel) => {
                const config = sanitizeConfig(channel.configJson);
                return (
                  <article key={channel.id} className="rounded-lg border border-[#d7dbe0] bg-white p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h3 className="font-medium text-[#111827]">{channel.name}</h3>
                        <p className="mt-1 text-sm text-[#667085]">
                          {config.instagramUsername ? `@${config.instagramUsername}` : "尚未取得使用者名稱"} · {config.loginProvider === "instagram" ? "Instagram OAuth" : config.pageName || "Meta Page Login（舊流程）"}
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={channel.enabled ? "text-sm text-green-700" : "text-sm text-[#667085]"}>{statusLabel(channel.enabled)}</span>
                        <RefreshInstagramProfileButton channelId={channel.id} hasStoredToken={config.hasStoredToken} />
                        <DisconnectChannelButton channelId={channel.id} channelName={channel.name} />
                      </div>
                    </div>
                    <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2 xl:grid-cols-4">
                      <Info label="IG 使用者 ID" value={config.instagramBusinessAccountId || config.instagramOauthUserId || "-"} mono />
                      <Info label="權杖" value={config.tokenSource ? "已加密儲存" : "未設定"} />
                      <Info label="連結時間" value={formatDate(config.connectedAt)} />
                      <Info label="權杖到期" value={formatDate(config.userTokenExpiresAt)} />
                    </dl>
                    {config.profileReadWarning ? (
                      <Notice title="Instagram 帳號資料提醒" tone="warning">
                        {config.profileReadWarning}
                      </Notice>
                    ) : null}
                    <InstagramChannelActions
                      channelId={channel.id}
                      hasStoredToken={config.hasStoredToken}
                      loginProvider={config.loginProvider}
                    />
                  </article>
                );
              })}
              {instagramChannels.length === 0 ? <EmptyState>尚未連結 Instagram 帳號。請使用上方「+ 新增平台帳號」開始授權。</EmptyState> : null}
            </div>
          </section>

          <section id="about-inboxpilot" className="rounded-lg border border-[#d7dbe0] bg-white p-4">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-[#111827]">關於 InboxPilot</h2>
            </div>
            <div className="mt-3 space-y-3 text-sm leading-6 text-[#667085]">
              <p>2026 Luo Shih Lin All rights reserved.</p>
              <p>Copyright© Luo Shih Lin</p>
              <p>InboxPilot is operated by Luo Shih Lin.</p>
              <p>
                Contact:{" "}
                <a
                  href="mailto:zeroyuanbrothers@gmail.com"
                  className="font-medium text-[#006fe6] hover:text-[#0057b8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006fe6] focus-visible:ring-offset-2"
                >
                  zeroyuanbrothers@gmail.com
                </a>
              </p>
              <p>
                Website:{" "}
                <a
                  href="https://inboxpilot.carry-digital-nomad.in.net/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-[#006fe6] hover:text-[#0057b8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006fe6] focus-visible:ring-offset-2"
                >
                  https://inboxpilot.carry-digital-nomad.in.net/
                </a>
              </p>
            </div>
          </section>
        </div>
      </div>
    </AdminShell>
  );
}

function SectionTitle({ title, description }: { title: string; description: string }) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-[#111827]">{title}</h2>
      <p className="mt-1 text-sm leading-6 text-[#667085]">{description}</p>
    </div>
  );
}

function Info({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="rounded-md border border-[#d7dbe0] bg-[#f9fafb] px-3 py-2">
      <dt className="text-xs text-[#667085]">{label}</dt>
      <dd className={mono ? "mt-1 break-all font-mono text-xs text-[#111827]" : "mt-1 text-[#111827]"}>{value}</dd>
    </div>
  );
}

function ConnectionStateBadge({
  tone,
  children,
}: {
  tone: "success" | "warning" | "neutral";
  children: ReactNode;
}) {
  const toneClasses =
    tone === "success"
      ? "border-green-200 bg-green-50 text-green-700"
      : tone === "warning"
        ? "border-amber-200 bg-amber-50 text-amber-700"
        : "border-slate-200 bg-slate-50 text-slate-600";

  return (
    <span className={`inline-flex shrink-0 rounded-full border px-2 py-0.5 text-xs font-medium ${toneClasses}`}>
      {children}
    </span>
  );
}

function Notice({
  title,
  tone,
  children,
}: {
  title: string;
  tone: "success" | "danger" | "warning";
  children: ReactNode;
}) {
  return (
    <DismissibleNoticeToast title={title} tone={tone}>
      {children}
    </DismissibleNoticeToast>
  );
}

function EmptyState({ children }: { children: ReactNode }) {
  return <div className="rounded-lg border border-dashed border-[#d7dbe0] bg-white p-6 text-sm text-[#667085]">{children}</div>;
}

function DisabledFeatureButton({
  children,
  testId,
  reason,
}: {
  children: ReactNode;
  testId?: string;
  reason?: string;
}) {
  const visibleReason = reason || "此功能目前受控開通，完成安全、權限與營運規則驗證後才會開放。";
  const reasonId = testId && visibleReason ? `${testId}-reason` : undefined;

  return (
    <span className="mt-4 inline-flex max-w-full flex-col items-start gap-1">
      <button
        type="button"
        disabled
        aria-disabled="true"
        aria-describedby={reasonId}
        data-testid={testId}
        className="inline-flex cursor-not-allowed items-center rounded-md border border-[#d7dbe0] bg-[#f8fafc] px-3 py-2 text-sm font-medium text-[#98a2b3]"
      >
        {children}
      </button>
      {visibleReason ? (
        <span id={reasonId} className="max-w-sm text-xs leading-5 text-[#98a2b3]">
          {visibleReason}
        </span>
      ) : null}
    </span>
  );
}
