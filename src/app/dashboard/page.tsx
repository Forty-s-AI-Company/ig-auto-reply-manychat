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
import { getSelectedInstagramChannelId } from "@/lib/account-scope";
import { requireUser } from "@/lib/auth";
import { getMetaChannelConfig } from "@/lib/channels/meta";
import { getDashboardSummary } from "@/lib/dashboard-summary";
import { getHealthCheckResult } from "@/lib/health";
import { getServerCache } from "@/lib/server-cache";
import { getCurrentWorkspaceId } from "@/lib/workspaces";

function directionLabel(direction: string) {
  return { inbound: "用戶訊息", outbound: "自動回覆" }[direction] || direction;
}

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("zh-TW", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(value);
}

export default async function DashboardPage() {
  await requireUser();
  const workspaceId = await getCurrentWorkspaceId();
  const selectedChannelId = await getSelectedInstagramChannelId();

  const {
    contacts,
    messages,
    openConversations,
    automations,
    connectedInstagramChannelRows,
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
      title: "送一則測試訊息並查看收件匣",
      href: "/mock-tester",
    },
  ];
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
                <Link href="/broadcasts" className="inline-flex h-10 items-center gap-2 rounded-md bg-[var(--primary)] px-3 text-sm font-semibold text-[#063a3d] hover:bg-[var(--primary-hover)]">
                  <Megaphone className="h-4 w-4" />
                  新增廣播
                </Link>
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
              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--text-secondary)]">已連線 IG 帳號</span>
                <span className="text-lg font-semibold text-[var(--text-primary)]">{connectedInstagramChannels}</span>
              </div>
              <div className="mt-4 h-2 rounded-full bg-[#d9eef1]">
                <div
                  className="h-2 rounded-full bg-[var(--primary)]"
                  style={{ width: `${Math.min(100, (contacts / 1000) * 100)}%` }}
                />
              </div>
              <p className="mt-2 text-xs text-[var(--text-muted)]">免費方案聯絡人用量：{contacts}/1000</p>
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
            {quickAutomations.map((item) => {
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
                <p className="px-4 py-6 text-sm text-[var(--text-muted)]">
                  還沒有訊息。可以先用測試工具送一則測試訊息。
                </p>
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
                <p className="px-4 py-6 text-sm text-[var(--text-muted)]">
                  還沒有自動化。從預設回覆或私訊關鍵字回覆開始最順。
                </p>
              ) : null}
            </div>
          </div>
        </section>
      </div>
    </AdminShell>
  );
}
