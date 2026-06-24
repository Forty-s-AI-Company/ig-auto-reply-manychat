import Link from "next/link";
import type { ReactNode } from "react";
import {
  Bell,
  Bot,
  Camera,
  CreditCard,
  Inbox,
  KeyRound,
  MessageCircle,
  Plug,
  Settings,
  Tags,
  Users,
  Workflow,
} from "lucide-react";
import { AdminShell } from "@/components/AdminShell";
import { DismissibleNoticeToast } from "@/components/DismissibleNoticeToast";
import { DisconnectChannelButton } from "@/components/DisconnectChannelButton";
import { InstagramChannelActions } from "@/components/InstagramChannelActions";
import { RefreshInstagramProfileButton } from "@/components/RefreshInstagramProfileButton";
import { requireUser } from "@/lib/auth";
import { getMetaChannelConfig } from "@/lib/channels/meta";
import { getDb } from "@/lib/db";
import { isSimpleRelease } from "@/lib/release-mode";
import { getCurrentWorkspaceId } from "@/lib/workspaces";

type Props = {
  searchParams?: Promise<{
    connected?: string;
    meta_error?: string;
    mode?: string;
  }>;
};

const INSTAGRAM_TESTER_INVITES_URL = "https://www.instagram.com/accounts/manage_access/";

const settingsGroups = [
  {
    title: "主要設定",
    items: [
      { label: "一般設定", href: "#general" },
      { label: "通知設定", href: "#notifications" },
      { label: "團隊成員", href: "#team" },
      { label: "操作紀錄", href: "#logs" },
      { label: "顯示設定", href: "#display" },
    ],
  },
  {
    title: "帳務",
    items: [
      { label: "訂閱方案", href: "#billing" },
      { label: "發票紀錄", href: "#billing" },
      { label: "付款資料", href: "#billing" },
    ],
  },
  {
    title: "收件匣",
    items: [
      { label: "收件匣行為", href: "#inbox" },
      { label: "自動指派", href: "#assignment" },
    ],
  },
  {
    title: "連線渠道",
    items: [
      { label: "Instagram", href: "#instagram" },
      { label: "其他平台", href: "#platform-connect" },
    ],
  },
  {
    title: "自動化",
    items: [
      { label: "自動化清單", href: "#automation-settings" },
      { label: "基礎規則", href: "#automation-settings" },
      { label: "序列設定", href: "#automation-settings" },
      { label: "自訂欄位", href: "#automation-data" },
      { label: "標籤", href: "#automation-data" },
      { label: "轉換事件", href: "#automation-data" },
    ],
  },
  {
    title: "擴充整合",
    items: [
      { label: "API 存取", href: "#extensions" },
      { label: "應用程式", href: "#extensions" },
      { label: "第三方整合", href: "#extensions" },
      { label: "付款整合", href: "#extensions" },
      { label: "已安裝模板", href: "#extensions" },
      { label: "追蹤像素", href: "#extensions" },
    ],
  },
];

const channelCards = [
  ["Instagram", "正式站先只開放 Instagram 帳號連線；測試站仍可從社群帳號頁驗證其他 provider。", true, "/channels/connect/social"],
  ["Telegram Bot", "若只需要 Bot Token，會透過同一套 provider 架構完成驗證與儲存。", true, "/channels/connect/social"],
  ["Mock OAuth Provider", "本機測試用 provider，完整走 popup、callback、postMessage 流程。", true, "/channels/connect/social"],
  ["TikTok", "可先規劃平台入口，正式連線開放後會顯示授權按鈕。", false, ""],
  ["WhatsApp", "WhatsApp Business 連線入口會集中在此管理。", false, ""],
  ["簡訊", "簡訊供應商與地區規則會集中在此管理。", false, ""],
  ["電子郵件", "寄件網域與寄件者驗證會集中在此管理。", false, ""],
] as const;

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
    loginProvider: config.loginProvider || "facebook",
    pageId: config.pageId,
    pageName: config.pageName,
    instagramBusinessAccountId: config.instagramBusinessAccountId,
    instagramOauthUserId: config.instagramOauthUserId,
    instagramUsername: config.instagramUsername,
    instagramName: config.instagramName,
    profileReadWarning: config.profileReadWarning,
    tokenSource: hasStoredToken ? "channel" : config.tokenEnv || undefined,
    connectedAt: config.connectedAt,
    userTokenExpiresAt: config.userTokenExpiresAt,
  };
}

export default async function ChannelsPage({ searchParams }: Props) {
  await requireUser();
  const workspaceId = await getCurrentWorkspaceId();
  const params = searchParams ? await searchParams : {};
  const simpleRelease = await isSimpleRelease();
  const [channels, tagCount, contactCount, automationCount, teamCount] = await Promise.all([
    getDb().channel.findMany({
      where: { workspaceId },
      orderBy: [{ type: "asc" }, { createdAt: "asc" }],
    }),
    getDb().tag.count({ where: { workspaceId } }),
    getDb().contact.count({ where: { channel: { workspaceId } } }),
    getDb().automation.count({ where: { workspaceId } }),
    getDb().workspaceUser.count({ where: { workspaceId } }),
  ]);
  const instagramChannels = channels.filter((channel) => {
    if (channel.type !== "instagram") return false;
    const config = getMetaChannelConfig(channel.configJson);
    return Boolean(config.instagramUsername || config.instagramBusinessAccountId || config.instagramProfilePictureUrl || channel.name.startsWith("Instagram @"));
  });
  const visibleChannelCards = simpleRelease ? channelCards.filter(([name]) => name === "Instagram") : channelCards;

  return (
    <AdminShell title="設定">
      <div className="flex w-full gap-6">
        <aside className="sticky top-20 hidden h-[calc(100vh-6rem)] w-64 shrink-0 overflow-y-auto border-r border-[#d7dbe0] pr-4 lg:block">
          <div className="mb-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#667085]">設定</p>
            <h2 className="mt-1 text-xl font-semibold text-[#111827]">工作區設定</h2>
          </div>
          <nav className="space-y-5 text-sm">
            {settingsGroups.map((group) => (
              <div key={group.title}>
                <p className="mb-2 px-2 text-xs font-medium uppercase tracking-wide text-[#98a2b3]">{group.title}</p>
                <div className="space-y-1">
                  {group.items.map((item) => (
                    <Link key={`${group.title}-${item.label}`} href={item.href} className="block rounded-md px-2 py-1.5 text-[#4b5563] hover:bg-[#eceff3] hover:text-[#111827]">
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </nav>
        </aside>

        <div className="min-w-0 flex-1 space-y-5">
          <header className="flex flex-wrap items-start justify-between gap-3 border-b border-[#d7dbe0] pb-5">
            <div>
              <p className="text-sm font-medium text-[#006fe6]">設定</p>
              <h1 className="mt-1 text-2xl font-semibold text-[#111827]">帳號、渠道與自動化設定</h1>
              <p className="mt-2 max-w-3xl text-sm text-[#667085]">
                管理工作區、通知、收件匣行為、平台連線、帳務與整合。低頻設定集中在這裡，主選單保留日常操作。
              </p>
            </div>
            <Link href="/channels/connect" className="inline-flex items-center gap-2 rounded-md bg-[#006fe6] px-4 py-2 text-sm font-medium text-white hover:bg-[#0057b8]">
              <Camera className="h-4 w-4" />
              + 新增平台帳號
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

          <section id="general" className="grid gap-3 md:grid-cols-5">
            <Metric label="已連結 IG" value={instagramChannels.length} />
            <Metric label="聯絡人" value={contactCount} />
            <Metric label="自動化" value={automationCount} />
            <Metric label="標籤" value={tagCount} />
            <Metric label="團隊成員" value={teamCount} />
          </section>

          <section className="grid gap-3 lg:grid-cols-2">
            <SettingPanel id="notifications" icon={<Bell className="h-5 w-5" />} title="通知設定">
              Inbox 新訊息、指派、提醒與系統通知集中管理。瀏覽器音效與 Email 通知目前保留設定入口。
            </SettingPanel>
            <SettingPanel id="team" icon={<Users className="h-5 w-5" />} title="團隊成員">
              目前共有 {teamCount} 位成員。Inbox 已支援將對話指派給團隊成員。
            </SettingPanel>
            <SettingPanel id="logs" icon={<MessageCircle className="h-5 w-5" />} title="操作紀錄" badge="設定入口">
              設定變更、登入、權限刷新與自動化發布紀錄會集中在此，方便上線後稽核。
            </SettingPanel>
            <SettingPanel id="display" icon={<Settings className="h-5 w-5" />} title="顯示設定">
              目前介面固定使用繁體中文與 InboxPilot 淺色版面。
            </SettingPanel>
          </section>

          <section id="platform-connect" className="space-y-3">
            <SectionTitle title="新增平台帳號" description="依照平台授權流程整理成：先選擇平台，再登入授權，成功後回到本頁顯示已連結帳號。" />
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {visibleChannelCards.map(([name, description, ready, href]) => (
                <div key={name} className="rounded-lg border border-[#d7dbe0] bg-white p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-medium text-[#111827]">{name}</h3>
                      <p className="mt-1 text-sm leading-6 text-[#667085]">{description}</p>
                    </div>
                    <Plug className="h-5 w-5 text-[#98a2b3]" />
                  </div>
                  {ready ? (
                    <Link href={href} className="mt-4 inline-flex rounded-md bg-[#006fe6] px-3 py-2 text-sm font-medium text-white hover:bg-[#0057b8]">
                      登入並連線
                    </Link>
                  ) : (
                    <StatusBadge>未啟用</StatusBadge>
                  )}
                </div>
              ))}
            </div>
          </section>

          <section id="instagram" className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <SectionTitle title="Instagram" description="管理已連結帳號、token 狀態、權限刷新與帳號停用。" />
              <Link href={INSTAGRAM_TESTER_INVITES_URL} target="_blank" rel="noopener noreferrer" className="rounded-md border border-[#d7dbe0] px-3 py-2 text-sm text-[#344054] hover:bg-[#f8fafc]">
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
                          {config.instagramUsername ? `@${config.instagramUsername}` : "尚未取得使用者名稱"} · {config.loginProvider === "instagram" ? "Instagram 登入" : config.pageName || "Facebook 粉專登入"}
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={channel.enabled ? "text-sm text-green-700" : "text-sm text-[#667085]"}>{statusLabel(channel.enabled)}</span>
                        <RefreshInstagramProfileButton channelId={channel.id} />
                        <DisconnectChannelButton channelId={channel.id} channelName={channel.name} />
                      </div>
                    </div>
                    <dl className="mt-4 grid gap-3 text-sm md:grid-cols-2">
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
                    <InstagramChannelActions channelId={channel.id} />
                  </article>
                );
              })}
              {instagramChannels.length === 0 ? <EmptyState>尚未連結 Instagram 帳號。請使用上方「+ 新增平台帳號」開始授權。</EmptyState> : null}
            </div>
          </section>

          <section id="inbox" className="grid gap-3 md:grid-cols-2">
            <SettingPanel icon={<Inbox className="h-5 w-5" />} title="收件匣行為">
              已支援未指派、指派給我、提醒、收藏、熱門名單、合作夥伴與團隊指派。
            </SettingPanel>
            <SettingPanel id="assignment" icon={<Users className="h-5 w-5" />} title="自動指派" badge="部分啟用">
              目前支援手動指派；自動輪派、工作時段與條件分派會在此管理。
            </SettingPanel>
          </section>

          <section id="automation-settings" className="space-y-3">
            <SectionTitle title="自動化設定" description="整理自動化清單、基礎規則與序列設定。" />
            <div className="grid gap-3 md:grid-cols-3">
              <SettingPanel icon={<Workflow className="h-5 w-5" />} title="自動化清單">
                顯示平台帳號的自動化數量、啟用狀態，實際編輯入口在「自動化」頁。
              </SettingPanel>
              <SettingPanel icon={<Bot className="h-5 w-5" />} title="基礎規則">
                預設回覆、關鍵字、留言觸發、延遲、公開回覆與按讚設定已接在自動化流程中。
              </SettingPanel>
              <SettingPanel icon={<MessageCircle className="h-5 w-5" />} title="序列設定" badge="設定入口">
                序列推播、訂閱序列與時間間隔會集中在序列頁與此設定區。
              </SettingPanel>
            </div>
          </section>

          <section id="automation-data" className="grid gap-3 md:grid-cols-3">
            <SettingPanel icon={<Bot className="h-5 w-5" />} title="自訂欄位">
              使用者欄位可先使用聯絡人的 email、phone、locale、source；欄位管理會集中在此。
            </SettingPanel>
            <SettingPanel icon={<Tags className="h-5 w-5" />} title="標籤">
              目前有 {tagCount} 個標籤，可用於分眾、條件判斷與 Inbox 快速分類。
            </SettingPanel>
            <SettingPanel icon={<MessageCircle className="h-5 w-5" />} title="轉換事件" badge="設定入口">
              Meta CAPI 與購買、預約、領取等轉換事件會集中在此管理。
            </SettingPanel>
          </section>

          <section id="billing" className="grid gap-3 md:grid-cols-2">
            <SettingPanel icon={<CreditCard className="h-5 w-5" />} title="帳務">
              方案、發票與付款方式集中在帳務頁管理。
              <div className="mt-3">
                <Link className="text-sm font-medium text-[#006fe6] hover:text-[#0057b8]" href="/billing">
                  前往帳務頁
                </Link>
              </div>
            </SettingPanel>
            <SettingPanel icon={<KeyRound className="h-5 w-5" />} title="API / 第三方整合" badge="設定入口">
              API、應用程式、第三方整合、付款整合、已安裝模板、追蹤像素先集中保留入口。
            </SettingPanel>
          </section>

          <section id="extensions" className="rounded-lg border border-[#d7dbe0] bg-white p-4">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-[#111827]">擴充整合</h2>
              <StatusBadge>設定入口</StatusBadge>
            </div>
            <p className="mt-1 text-sm leading-6 text-[#667085]">
              API、應用程式、第三方整合、付款整合、模板與追蹤像素統一放在同一組，避免低頻工具擠在左側主選單。
            </p>
          </section>
        </div>
      </div>
    </AdminShell>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-[#d7dbe0] bg-white p-4">
      <p className="text-sm text-[#667085]">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-[#111827]">{value}</p>
    </div>
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

function SettingPanel({
  id,
  icon,
  title,
  badge,
  children,
}: {
  id?: string;
  icon: ReactNode;
  title: string;
  badge?: string;
  children: ReactNode;
}) {
  return (
    <div id={id} className="rounded-lg border border-[#d7dbe0] bg-white p-4">
      <div className="flex items-center justify-between gap-2 text-[#111827]">
        <div className="flex items-center gap-2">
          <span className="text-[#667085]">{icon}</span>
          <h3 className="font-medium">{title}</h3>
        </div>
        {badge ? <StatusBadge>{badge}</StatusBadge> : null}
      </div>
      <div className="mt-2 text-sm leading-6 text-[#667085]">{children}</div>
    </div>
  );
}

function StatusBadge({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex shrink-0 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">
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
