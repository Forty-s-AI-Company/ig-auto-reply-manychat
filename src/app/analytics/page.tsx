import Link from "next/link";
import { BarChart3, Inbox, Megaphone, MessageCircle, TrendingUp, Users } from "lucide-react";
import type { ReactNode } from "react";
import { AdminShell } from "@/components/AdminShell";
import { getSelectedInstagramChannelId } from "@/lib/account-scope";
import { requireUser } from "@/lib/auth";
import { getAnalyticsSummary } from "@/lib/dashboard-summary";
import { getCurrentWorkspaceId } from "@/lib/workspaces";

function formatPercent(value: number) {
  return `${Math.round(value * 100)}%`;
}

export default async function AnalyticsPage() {
  await requireUser();
  const workspaceId = await getCurrentWorkspaceId();
  const selectedChannelId = await getSelectedInstagramChannelId();

  const {
    contacts,
    messages,
    recentMessages,
    openConversations,
    broadcasts,
    queuedBroadcasts,
    sentCount,
    failedCount,
    automations,
    enabledAutomations,
  } = await getAnalyticsSummary({ workspaceId, selectedChannelId });

  const deliveryRate = sentCount + failedCount > 0 ? sentCount / (sentCount + failedCount) : 0;

  return (
    <AdminShell title="分析">
      <div className="space-y-5">
        <section className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-[var(--teal-dark)]">Analytics</p>
            <h2 className="mt-1 text-2xl font-semibold text-[var(--text-primary)]">訊息、受眾與廣播表現</h2>
          </div>
          <Link href="/broadcasts" className="inline-flex h-10 items-center gap-2 rounded-md bg-[var(--primary)] px-3 text-sm font-semibold text-[#063a3d]">
            <Megaphone className="h-4 w-4" />
            管理廣播活動
          </Link>
        </section>

        <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <Metric icon={<Users className="h-5 w-5" />} label="聯絡人" value={contacts} />
          <Metric icon={<MessageCircle className="h-5 w-5" />} label="總訊息" value={messages} />
          <Metric icon={<TrendingUp className="h-5 w-5" />} label="近 7 天訊息" value={recentMessages} />
          <Metric icon={<Inbox className="h-5 w-5" />} label="待處理對話" value={openConversations} />
        </section>

        <section className="grid gap-5 lg:grid-cols-2">
          <div className="ip-dashboard-card p-5">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-[var(--text-primary)]">廣播活動</h3>
              <BarChart3 className="h-5 w-5 text-[var(--text-muted)]" />
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <Stat label="活動數" value={broadcasts} />
              <Stat label="排程中" value={queuedBroadcasts} />
              <Stat label="送達率" value={formatPercent(deliveryRate)} />
            </div>
          </div>

          <div className="ip-dashboard-card p-5">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-[var(--text-primary)]">自動化健康度</h3>
              <TrendingUp className="h-5 w-5 text-[var(--text-muted)]" />
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <Stat label="流程數" value={automations} />
              <Stat label="啟用中" value={enabledAutomations} />
              <Stat label="啟用率" value={automations > 0 ? formatPercent(enabledAutomations / automations) : "0%"} />
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

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-md border border-[var(--border-soft)] bg-[var(--ip-surface-muted)] p-4">
      <p className="text-sm text-[var(--text-secondary)]">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-[var(--text-primary)]">{value}</p>
    </div>
  );
}
