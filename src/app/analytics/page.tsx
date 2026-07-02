import Link from "next/link";
import { BarChart3, Inbox, Megaphone, MessageCircle, TrendingUp, Users, AlertTriangle, Compass } from "lucide-react";
import type { ReactNode } from "react";
import { AdminShell } from "@/components/AdminShell";
import { AnalyticsMessageTrendChart } from "@/components/AnalyticsMessageTrendChart";
import { getSelectedInstagramChannelId } from "@/lib/account-scope";
import { requireUser } from "@/lib/auth";
import { getAnalyticsSummary } from "@/lib/dashboard-summary";
import { buildAnalyticsState, type AnalyticsSummarySnapshot } from "@/lib/analytics-state";
import { isSimpleRelease } from "@/lib/release-mode";
import { getCurrentWorkspaceId } from "@/lib/workspaces";

export default async function AnalyticsPage() {
  await requireUser();
  const workspaceId = await getCurrentWorkspaceId();
  const selectedChannelId = await getSelectedInstagramChannelId();
  const simpleRelease = await isSimpleRelease();

  let analyticsError: string | null = null;
  let analytics: AnalyticsSummarySnapshot = {
    contacts: 0,
    messages: 0,
    recentMessages: 0,
    messageTrend: [],
    openConversations: 0,
    broadcasts: 0,
    queuedBroadcasts: 0,
    sentCount: 0,
    failedCount: 0,
    automations: 0,
    enabledAutomations: 0,
    connectedInstagramChannels: 0,
    selectedChannelDisplayName: null,
  };

  try {
    analytics = await getAnalyticsSummary({ workspaceId, selectedChannelId });
  } catch {
    analyticsError = "分析資料暫時無法載入，請稍後再試。";
  }

  const analyticsState = buildAnalyticsState(analytics, analyticsError);

  return (
    <AdminShell title="分析">
      <div className="space-y-5">
        <section className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-[var(--teal-dark)]">分析總覽</p>
            <h2 className="mt-1 text-2xl font-semibold text-[var(--text-primary)]">訊息、受眾與廣播表現</h2>
            <div className="mt-3 flex flex-wrap gap-2 text-xs font-medium">
              <span className="rounded-full border border-[var(--border-soft)] bg-white px-3 py-1 text-[var(--text-secondary)]">
                資料範圍：{analyticsState.scopeBadge}
              </span>
              <span className="rounded-full border border-[var(--border-soft)] bg-white px-3 py-1 text-[var(--text-secondary)]">
                IG 連線：{analytics.connectedInstagramChannels} 個
              </span>
              <span className="rounded-full border border-[var(--border-soft)] bg-white px-3 py-1 text-[var(--text-secondary)]">
                近 7 天訊息：{analytics.recentMessages} 則
              </span>
            </div>
          </div>
          {simpleRelease ? (
            <button
              type="button"
              disabled
              aria-disabled="true"
              title="廣播活動在正式營運版中受控開通；目前 simple release 先保留分析讀取，不開放廣播管理。"
              data-testid="analytics-broadcast-gated"
              className="inline-flex h-10 cursor-not-allowed items-center gap-2 rounded-md border border-[var(--border-soft)] bg-[var(--ip-surface-muted)] px-3 text-sm font-semibold text-[var(--text-muted)]"
            >
              <Megaphone className="h-4 w-4" />
              廣播活動受控開通
            </button>
          ) : (
            <Link href="/broadcasts" className="inline-flex h-10 items-center gap-2 rounded-md bg-[var(--primary)] px-3 text-sm font-semibold text-[#063a3d]">
              <Megaphone className="h-4 w-4" />
              管理廣播活動
            </Link>
          )}
        </section>

        <section
          className={`rounded-2xl border px-5 py-4 shadow-sm ${
            analyticsState.bannerTone === "danger"
              ? "border-red-200 bg-red-50"
              : analyticsState.bannerTone === "warning"
                ? "border-amber-200 bg-amber-50"
                : analyticsState.bannerTone === "success"
                  ? "border-emerald-200 bg-emerald-50"
                  : "border-cyan-200 bg-cyan-50"
          }`}
          data-testid="analytics-state-banner"
        >
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                analyticsState.bannerTone === "danger"
                  ? "bg-red-100 text-red-900"
                  : analyticsState.bannerTone === "warning"
                    ? "bg-amber-100 text-amber-900"
                    : analyticsState.bannerTone === "success"
                      ? "bg-emerald-100 text-emerald-900"
                      : "bg-cyan-100 text-cyan-900"
              }`}
            >
              {analyticsState.scopeBadge}
            </span>
            <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-[var(--text-secondary)]">
              {analyticsState.scopeDetail}
            </span>
          </div>
          <div className="mt-3 flex flex-wrap items-start justify-between gap-3">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold text-[var(--text-primary)]">{analyticsState.bannerTitle}</p>
              <p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">{analyticsState.bannerBody}</p>
            </div>
            {analyticsState.bannerActionLabel && analyticsState.bannerActionHref ? (
              <Link
                href={analyticsState.bannerActionHref}
                className="inline-flex h-10 items-center gap-2 rounded-md bg-white px-3 text-sm font-semibold text-[var(--teal-dark)] shadow-sm transition hover:bg-[var(--ip-surface-muted)]"
              >
                <Compass className="h-4 w-4" />
                {analyticsState.bannerActionLabel}
              </Link>
            ) : null}
          </div>
          {analyticsError ? (
            <div className="mt-3 inline-flex items-center gap-2 rounded-md border border-red-200 bg-white px-3 py-2 text-xs font-medium text-red-900">
              <AlertTriangle className="h-4 w-4" />
              {analyticsError}
            </div>
          ) : null}
        </section>

        <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <Metric icon={<Users className="h-5 w-5" />} label="聯絡人" value={analytics.contacts} />
          <Metric icon={<MessageCircle className="h-5 w-5" />} label="總訊息" value={analytics.messages} />
          <Metric icon={<TrendingUp className="h-5 w-5" />} label="近 7 天訊息" value={analytics.recentMessages} />
          <Metric icon={<Inbox className="h-5 w-5" />} label="待處理對話" value={analytics.openConversations} />
        </section>

        <section className="grid gap-5 lg:grid-cols-2">
          <div className="ip-dashboard-card p-5">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-[var(--text-primary)]">廣播活動</h3>
              <BarChart3 className="h-5 w-5 text-[var(--text-muted)]" />
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <Stat label="活動數" value={analytics.broadcasts} hint={analytics.broadcasts === 0 ? "還沒有建立廣播活動。" : undefined} />
              <Stat label="排程中" value={analytics.queuedBroadcasts} hint={analytics.queuedBroadcasts === 0 ? "目前沒有排程中的活動。" : undefined} />
              <Stat label="送達率" value={analyticsState.deliveryRateLabel} hint={analyticsState.deliveryRateHint} />
            </div>
          </div>

          <div className="ip-dashboard-card p-5">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-[var(--text-primary)]">自動化健康度</h3>
              <TrendingUp className="h-5 w-5 text-[var(--text-muted)]" />
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <Stat label="流程數" value={analytics.automations} hint={analytics.automations === 0 ? "還沒有建立自動化流程。" : undefined} />
              <Stat label="啟用中" value={analytics.enabledAutomations} hint={analytics.enabledAutomations === 0 ? "目前沒有啟用中的流程。" : undefined} />
              <Stat label="啟用率" value={analyticsState.automationRateLabel} hint={analyticsState.automationRateHint} />
            </div>
          </div>
        </section>

        <section className="grid gap-5 lg:grid-cols-2">
          <div className="ip-dashboard-card overflow-hidden">
            <div className="border-b border-[var(--border-soft)] px-4 py-3">
              <h3 className="font-semibold text-[var(--text-primary)]">最近訊息</h3>
            </div>
            <div className="px-4 py-6">
              {analytics.messageTrend.length > 0 ? (
                <AnalyticsMessageTrendChart
                  data={analytics.messageTrend}
                  total={analytics.recentMessages}
                  scopeDetail={analyticsState.scopeDetail}
                />
              ) : (
                <EmptyState
                  title={analyticsState.recentMessagesTitle}
                  body={analyticsState.recentMessagesBody}
                  actionHref={analytics.connectedInstagramChannels > 0 ? "/inbox" : "/channels/connect"}
                  actionLabel={analytics.connectedInstagramChannels > 0 ? "查看收件匣" : "連接 Instagram"}
                  testId="analytics-empty-messages-cta"
                />
              )}
            </div>
          </div>

          <div className="ip-dashboard-card overflow-hidden">
            <div className="border-b border-[var(--border-soft)] px-4 py-3">
              <h3 className="font-semibold text-[var(--text-primary)]">最近自動化</h3>
            </div>
            <div className="px-4 py-6">
              {analytics.automations > 0 ? (
                <div className="space-y-2 text-sm leading-6 text-[var(--text-secondary)]">
                  <p className="font-semibold text-[var(--text-primary)]">共有 {analytics.automations} 個流程，啟用中 {analytics.enabledAutomations} 個</p>
                  <p>{analyticsState.automationRateLabel === "尚未建立流程" ? analyticsState.recentAutomationsBody : analyticsState.automationRateHint}</p>
                  <p>如果流程數量本來就少，顯示 0 不代表壞掉，只是目前還沒累積到太多資料。</p>
                </div>
              ) : (
                <EmptyState
                  title={analyticsState.recentAutomationsTitle}
                  body={analyticsState.recentAutomationsBody}
                  actionHref="/automations"
                  actionLabel="建立第一個流程"
                  testId="analytics-empty-automations-cta"
                />
              )}
            </div>
          </div>
        </section>
      </div>
    </AdminShell>
  );
}

function Metric({ icon, label, value }: { icon: ReactNode; label: string; value: number }) {
  return (
    <div className="ip-dashboard-card p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-[var(--text-secondary)]">{label}</p>
        <span className="flex h-9 w-9 items-center justify-center rounded-md bg-[var(--primary-soft)] text-[var(--teal-dark)]">{icon}</span>
      </div>
      <p className="mt-3 text-3xl font-semibold leading-none text-[var(--text-primary)]">{value}</p>
    </div>
  );
}

function Stat({ label, value, hint }: { label: string; value: number | string; hint?: string }) {
  return (
    <div className="rounded-md border border-[var(--border-soft)] bg-[var(--ip-surface-muted)] p-4">
      <p className="text-sm text-[var(--text-secondary)]">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-[var(--text-primary)]">{value}</p>
      {hint ? <p className="mt-2 text-xs leading-5 text-[var(--text-muted)]">{hint}</p> : null}
    </div>
  );
}

function EmptyState({
  title,
  body,
  actionHref,
  actionLabel,
  testId,
}: {
  title: string;
  body: string;
  actionHref?: string;
  actionLabel?: string;
  testId?: string;
}) {
  return (
    <div className="px-4 py-6 text-sm leading-6 text-[var(--text-secondary)]">
      <p className="font-semibold text-[var(--text-primary)]">{title}</p>
      <p className="mt-1">{body}</p>
      {actionHref && actionLabel ? (
        <Link
          href={actionHref}
          data-testid={testId}
          className="mt-4 inline-flex h-9 items-center gap-2 rounded-md border border-[var(--border-soft)] bg-white px-3 text-sm font-semibold text-[var(--teal-dark)] hover:bg-[var(--primary-soft)]"
        >
          {actionLabel}
          <Compass className="h-4 w-4" />
        </Link>
      ) : null}
    </div>
  );
}
