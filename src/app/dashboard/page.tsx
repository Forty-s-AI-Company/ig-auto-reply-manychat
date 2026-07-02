import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Bot,
  CheckCircle2,
  Inbox,
  Megaphone,
  MessageCircle,
  PlugZap,
  Sparkles,
  Users,
} from "lucide-react";
import { AdminShell } from "@/components/AdminShell";
import { DismissibleNoticeToast } from "@/components/DismissibleNoticeToast";
import { getSelectedInstagramChannelId } from "@/lib/account-scope";
import { requireUser } from "@/lib/auth";
import { getMetaChannelConfig } from "@/lib/channels/meta";
import { getDashboardSummary } from "@/lib/dashboard-summary";
import { getHealthCheckResult } from "@/lib/health";
import { isSimpleRelease } from "@/lib/release-mode";
import { getServerCache } from "@/lib/server-cache";
import { getCurrentWorkspaceId } from "@/lib/workspaces";

function directionLabel(direction: string) {
  return { inbound: "用戶訊息", outbound: "自動回覆" }[direction] || direction;
}

const gatedFeatureLabels: Record<string, string> = {
  billing: "金流",
  broadcasts: "廣播",
  "ai-settings": "AI 設定",
  "knowledge-base": "知識庫",
  segments: "分眾",
  sequences: "序列",
  tags: "標籤管理",
  wallet: "錢包",
  admin: "管理後台",
  affiliate: "聯盟行銷",
  templates: "範本",
  "mock-tester": "測試工具",
};

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("zh-TW", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(value);
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams?: Promise<{ alert?: string; feature?: string }>;
}) {
  await requireUser();
  const params = searchParams ? await searchParams : {};
  const workspaceId = await getCurrentWorkspaceId();
  const selectedChannelId = await getSelectedInstagramChannelId();
  const simpleRelease = await isSimpleRelease();

  const {
    contacts,
    messages,
    openConversations,
    automations,
    connectedInstagramChannelRows,
    selectedChannelDisplayName,
    recentMessages,
    recentAutomations,
  } = await getDashboardSummary({ workspaceId, selectedChannelId });
  const health = await getServerCache(`dashboard:health:${workspaceId}`, 5_000, getHealthCheckResult);
  const connectedInstagramChannels = connectedInstagramChannelRows.filter((channel) => {
    const config = getMetaChannelConfig(channel.configJson);
    return Boolean(config.instagramUsername || config.instagramBusinessAccountId || config.instagramProfilePictureUrl || channel.name.startsWith("Instagram @"));
  }).length;

  const quickAutomations = [
    {
      title: "Instagram 預設回覆",
      description: "設定未命中關鍵字時的預設回覆。",
      href: "/automations/instagram-default-reply",
      icon: MessageCircle,
      label: "設定預設回覆",
    },
    {
      title: "私訊關鍵字回覆",
      description: "收到指定關鍵字後，自動回覆訊息並加標籤。",
      href: "/automations",
      icon: Sparkles,
      label: "建立關鍵字流程",
    },
    {
      title: "AI 常見問題回覆",
      description: "用知識庫回答常見問題，減少人工處理。",
      href: "/knowledge-base",
      icon: Bot,
      label: "整理知識庫",
    },
  ];
  const visibleQuickAutomations = simpleRelease ? quickAutomations.filter((item) => item.href !== "/knowledge-base") : quickAutomations;

  const nextSteps = [
    {
      done: connectedInstagramChannels > 0,
      title: "連接 Instagram 帳號",
      href: "/channels/connect",
    },
    {
      done: automations > 0,
      title: "建立第一個自動化",
      href: "/automations",
    },
    {
      done: messages > 0,
      title: simpleRelease ? "查看收件匣與最近訊息" : "送一則測試訊息並查看收件匣",
      href: simpleRelease ? "/inbox" : "/mock-tester",
    },
  ];
  const recentMessagesEmptyState = simpleRelease
    ? {
        title: "目前還沒有最近訊息",
        body: connectedInstagramChannels > 0
          ? "先從收件匣確認是否已有新對話；如果還沒有資料，請用已連接的 Instagram 帳號實際互動一則訊息。"
          : "先連接 Instagram 帳號，收到第一則訊息後，這裡就會開始顯示最近對話。",
        href: connectedInstagramChannels > 0 ? "/inbox" : "/channels/connect",
        label: connectedInstagramChannels > 0 ? "查看收件匣" : "連接 Instagram",
      }
    : {
        title: "目前還沒有最近訊息",
        body: "可以先用測試工具送一則測試訊息，再回到收件匣確認對話流程。",
        href: "/mock-tester",
        label: "送一則測試訊息",
      };
  const healthItems = [
    { label: "IG 連線", value: `${connectedInstagramChannels} 個帳號`, ok: connectedInstagramChannels > 0 },
    { label: "自動化", value: `${automations} 個流程`, ok: automations > 0 },
    { label: "待處理", value: `${openConversations} 則對話`, ok: openConversations === 0 },
    { label: "資料庫", value: health.checks.database.ok ? "正常" : "異常", ok: health.checks.database.ok },
    {
      label: "Redis",
      value: health.checks.redis.configured ? (health.checks.redis.ok ? "正常" : "異常") : "未設定",
      ok: !health.checks.redis.configured || health.checks.redis.ok,
    },
  ];

  return (
    <AdminShell title="首頁">
      <div className="space-y-6">
        {params.alert === "feature_gated" ? (
          <DismissibleNoticeToast title="此功能目前受控開通" tone="warning">
            {`此功能${params.feature ? `（${gatedFeatureLabels[params.feature] || params.feature}）` : ""}在正式營運版中受控開通。若您是白名單測試用戶或想體驗完整版，請使用我們的 Staging 測試站台：`}
            <a
              href="https://staging.carry-digital-nomad.in.net"
              className="font-semibold text-[#0057b8] underline underline-offset-2"
            >
              https://staging.carry-digital-nomad.in.net
            </a>
          </DismissibleNoticeToast>
        ) : null}
        <section className="grid gap-5 xl:grid-cols-[1fr_340px]">
          <div className="space-y-4">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-[var(--teal-dark)]">營運總覽</p>
                <h2 className="mt-1 text-2xl font-semibold text-[var(--text-primary)]">今天需要注意的訊息與流程</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link href="/inbox" className="inline-flex h-10 items-center gap-2 rounded-md border border-[var(--border)] bg-white px-3 text-sm font-semibold text-[var(--text-primary)] hover:bg-[var(--ip-surface-muted)]">
                  <Inbox className="h-4 w-4" />
                  查看收件匣
                </Link>
                {simpleRelease ? (
                  <Link href="/channels/connect" className="inline-flex h-10 items-center gap-2 rounded-md bg-[var(--primary)] px-3 text-sm font-semibold text-[#063a3d] hover:bg-[var(--primary-hover)]">
                    <PlugZap className="h-4 w-4" />
                    連接 IG
                  </Link>
                ) : (
                  <Link href="/broadcasts" className="inline-flex h-10 items-center gap-2 rounded-md bg-[var(--primary)] px-3 text-sm font-semibold text-[#063a3d] hover:bg-[var(--primary-hover)]">
                    <Megaphone className="h-4 w-4" />
                    新增廣播
                  </Link>
                )}
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {[
                { label: "聯絡人", value: contacts, icon: Users },
                { label: "訊息", value: messages, icon: MessageCircle },
                { label: "待處理對話", value: openConversations, icon: Inbox },
                { label: "自動化", value: automations, icon: BarChart3 },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="ip-dashboard-card p-4">
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-sm font-medium text-[var(--text-secondary)]">{item.label}</p>
                      <span className="flex h-9 w-9 items-center justify-center rounded-md bg-[var(--primary-soft)]">
                        <Icon className="h-4 w-4 text-[var(--teal-dark)]" />
                      </span>
                    </div>
                    <p className="mt-3 text-3xl font-semibold leading-none text-[var(--text-primary)]">{item.value}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="ip-dashboard-card p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-[var(--text-primary)]">帳號連線狀態</p>
                <p className="mt-1 text-sm text-[var(--text-secondary)]">Instagram 連線狀態</p>
              </div>
              <span className="flex h-10 w-10 items-center justify-center rounded-md bg-[var(--primary-soft)]">
                <PlugZap className="h-5 w-5 text-[var(--teal-dark)]" />
              </span>
            </div>
            <div className="mt-5 rounded-md border border-[var(--border-soft)] bg-[var(--ip-surface-muted)] p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <span className="text-sm text-[var(--text-secondary)]">已連線 IG 帳號</span>
                  <p className="mt-1 text-xs leading-5 text-[var(--text-muted)]">
                    {selectedChannelDisplayName
                      ? `目前左側切到「${selectedChannelDisplayName}」，首頁、收件匣、聯絡人與分析都會跟著切換資料範圍。`
                      : "目前看的是整個工作區；如果想縮小到單一 IG 帳號，請從左側帳號切換器選擇對應項目。"}
                  </p>
                </div>
                <span className="text-lg font-semibold text-[var(--text-primary)]">{connectedInstagramChannels}</span>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link
                  href="/channels/connect"
                  className="inline-flex h-9 items-center gap-2 rounded-md border border-[var(--border-soft)] bg-white px-3 text-sm font-semibold text-[var(--teal-dark)] hover:bg-[var(--primary-soft)]"
                >
                  <PlugZap className="h-4 w-4" />
                  {connectedInstagramChannels > 0 ? "管理 IG 連線" : "連接 Instagram"}
                </Link>
                <Link
                  href="/inbox"
                  className="inline-flex h-9 items-center gap-2 rounded-md border border-[var(--border-soft)] bg-white px-3 text-sm font-semibold text-[var(--text-primary)] hover:bg-[var(--ip-surface-muted)]"
                >
                  <Inbox className="h-4 w-4" />
                  查看目前帳號的收件匣
                </Link>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between rounded-md border border-[var(--border-soft)] bg-white px-3 py-2 text-sm">
              <span className="text-[var(--text-secondary)]">系統健康</span>
              <span
                className={`font-medium ${
                  health.status === "ok"
                    ? "text-green-700"
                    : health.status === "degraded"
                      ? "text-amber-700"
                      : "text-red-700"
                }`}
              >
                {health.status === "ok" ? "正常" : health.status === "degraded" ? "部分退化" : "異常"}
              </span>
            </div>
            <div className="mt-4 grid gap-2">
              {healthItems.map((item) => (
                <div key={item.label} className="flex items-center justify-between rounded-md border border-[var(--border-soft)] bg-white px-3 py-2 text-sm">
                  <span className="text-[var(--text-secondary)]">{item.label}</span>
                  <span className={item.ok ? "font-medium text-green-700" : "font-medium text-amber-700"}>{item.value}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 space-y-2">
              {nextSteps.map((step) => (
                <Link
                  key={step.title}
                  href={step.href}
                  className="flex items-center justify-between rounded-md border border-[var(--border-soft)] bg-white px-3 py-2 text-sm hover:border-[var(--primary)] hover:bg-[var(--primary-soft)]"
                >
                  <span className={step.done ? "text-[var(--text-muted)] line-through" : "text-[var(--text-primary)]"}>
                    {step.title}
                  </span>
                  {step.done ? (
                    <CheckCircle2 className="h-4 w-4 text-[var(--success)]" />
                  ) : (
                    <ArrowRight className="h-4 w-4 text-[var(--text-muted)]" />
                  )}
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section>
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-[var(--text-primary)]">快速建立自動化</h3>
              <p className="text-sm text-[var(--text-secondary)]">先把最常用的 IG 自動回覆流程做好。</p>
            </div>
            <Link href="/automations" className="text-sm font-semibold text-[var(--teal-dark)] hover:text-[var(--primary-hover)]">
              查看全部
            </Link>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {visibleQuickAutomations.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.title}
                  href={item.href}
                  className="ip-dashboard-card p-5 transition hover:-translate-y-0.5 hover:border-[var(--primary)]"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--primary-soft)]">
                    <Icon className="h-6 w-6 text-[var(--teal-dark)]" />
                  </div>
                  <h4 className="mt-4 font-semibold text-[var(--text-primary)]">{item.title}</h4>
                  <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">{item.description}</p>
                  <p className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[var(--teal-dark)]">
                    {item.label}
                    <ArrowRight className="h-4 w-4" />
                  </p>
                </Link>
              );
            })}
          </div>
        </section>

        <section className="grid gap-5 lg:grid-cols-2">
          <div className="ip-dashboard-card overflow-hidden">
            <div className="border-b border-[var(--border-soft)] px-4 py-3">
              <h3 className="font-semibold text-[var(--text-primary)]">最近訊息</h3>
            </div>
            <div className="divide-y divide-[var(--border-soft)]">
              {recentMessages.map((message) => (
                <div key={message.id} className="px-4 py-3 text-sm">
                  <div className="flex justify-between gap-4">
                    <span className="text-[var(--text-secondary)]">
                      {message.contact.displayName} / {message.channel.name} / {directionLabel(message.direction)}
                    </span>
                    <span className="text-[var(--text-muted)]">{formatDate(message.createdAt)}</span>
                  </div>
                  <p className="mt-1 text-[var(--text-primary)]">{message.text || "非文字訊息"}</p>
                </div>
              ))}
              {recentMessages.length === 0 ? (
                <div className="px-4 py-6 text-sm leading-6 text-[var(--text-secondary)]" data-testid="dashboard-recent-messages-empty">
                  <p className="font-semibold text-[var(--text-primary)]">{recentMessagesEmptyState.title}</p>
                  <p className="mt-1">{recentMessagesEmptyState.body}</p>
                  <Link
                    href={recentMessagesEmptyState.href}
                    data-testid="dashboard-recent-messages-empty-cta"
                    className="mt-4 inline-flex h-9 items-center gap-2 rounded-md border border-[var(--border-soft)] bg-white px-3 text-sm font-semibold text-[var(--teal-dark)] hover:bg-[var(--primary-soft)]"
                  >
                    {recentMessagesEmptyState.label}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              ) : null}
            </div>
          </div>

          <div className="ip-dashboard-card overflow-hidden">
            <div className="border-b border-[var(--border-soft)] px-4 py-3">
              <h3 className="font-semibold text-[var(--text-primary)]">最近自動化</h3>
            </div>
            <div className="divide-y divide-[var(--border-soft)]">
              {recentAutomations.map((automation) => (
                <Link
                  key={automation.id}
                  href="/automations"
                  className="block px-4 py-3 text-sm hover:bg-[var(--ip-surface-muted)]"
                >
                  <div className="flex items-center justify-between gap-4">
                    <span className="font-medium text-[var(--text-primary)]">{automation.name}</span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs ${
                        automation.enabled ? "bg-green-50 text-green-700" : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {automation.enabled ? "啟用中" : "已停止"}
                    </span>
                  </div>
                  <p className="mt-1 text-[var(--text-muted)]">{automation._count.steps} 個步驟</p>
                </Link>
              ))}
              {recentAutomations.length === 0 ? (
                <div className="px-4 py-6 text-sm leading-6 text-[var(--text-secondary)]" data-testid="dashboard-recent-automations-empty">
                  <p className="font-semibold text-[var(--text-primary)]">還沒有最近自動化</p>
                  <p className="mt-1">從 Instagram 預設回覆或私訊關鍵字回覆開始最順，建立後這裡會顯示最近更新的流程。</p>
                  <Link
                    href="/automations"
                    data-testid="dashboard-recent-automations-empty-cta"
                    className="mt-4 inline-flex h-9 items-center gap-2 rounded-md border border-[var(--border-soft)] bg-white px-3 text-sm font-semibold text-[var(--teal-dark)] hover:bg-[var(--primary-soft)]"
                  >
                    建立自動化
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              ) : null}
            </div>
          </div>
        </section>
      </div>
    </AdminShell>
  );
}
