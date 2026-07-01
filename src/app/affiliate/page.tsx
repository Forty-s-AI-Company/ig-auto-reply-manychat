import { AdminShell } from "@/components/AdminShell";
import { requireUser } from "@/lib/auth";
import { canApplyAffiliate, getAffiliateDashboard } from "@/lib/billing/affiliate-service";
import { formatTwd } from "@/lib/billing";

function formatCommissionDate(date: Date) {
  return new Intl.DateTimeFormat("zh-TW", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function affiliateStatusLabel(status?: string | null) {
  return (
    {
      pending: "審核中",
      approved: "已通過",
      rejected: "未通過",
      suspended: "已暫停",
    }[status || ""] || "尚未申請"
  );
}

function commissionStatusLabel(status: string) {
  return (
    {
      pending: "等待確認",
      available: "可提領",
      payout_requested: "提領申請中",
      paid: "已付款",
      clawback: "已沖回",
      cancelled: "已取消",
    }[status] || status
  );
}

export default async function AffiliatePage() {
  const user = await requireUser();
  const [dashboard, canApply] = await Promise.all([getAffiliateDashboard(user.id), canApplyAffiliate(user.id)]);
  const profileStatus = dashboard.profile?.status;
  const applyDisabled = !canApply || profileStatus === "pending" || profileStatus === "approved";
  const applyLabel = profileStatus === "pending" ? "審核中" : profileStatus === "approved" ? "已是聯盟夥伴" : "申請聯盟夥伴";
  const applyHelp = canApply
    ? "送出後會由營運人員審核，確認資格與稅務/匯款資料後才會開通現金分潤。"
    : "現金分潤目前只開放 Creator 以上付費方案；Starter 仍可使用推薦活動與折抵金。";
  const summaryCards = [
    {
      label: "等待確認",
      value: formatTwd(dashboard.summary.pendingAmount),
      description: "仍在退款 / 爭議等待期內，暫不可提領。",
    },
    {
      label: "可提領佣金",
      value: formatTwd(dashboard.availableBalance),
      description: "已過等待期、可申請批次匯款的金額。",
    },
    {
      label: "提領申請中",
      value: formatTwd(dashboard.summary.payoutRequestedAmount),
      description: "已鎖定並等待營運審核 / 匯款批次。",
    },
    {
      label: "已付款",
      value: formatTwd(dashboard.summary.paidAmount),
      description: "已由營運端標記完成付款的佣金。",
    },
  ];

  return (
    <AdminShell title="聯盟分潤">
      <div className="space-y-6">
        <section className="ip-dashboard-card p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-[var(--text-secondary)]">聯盟夥伴狀態</p>
              <h2 className="mt-1 text-2xl font-semibold text-[var(--text-primary)]">{affiliateStatusLabel(profileStatus)}</h2>
            </div>
            <span className="rounded-full border border-[var(--border-soft)] bg-[var(--ip-surface-muted)] px-3 py-1 text-sm font-medium text-[var(--text-secondary)]">
              {canApply ? "可申請現金分潤" : "目前僅開放折抵金"}
            </span>
          </div>
          <p className="mt-4 text-sm leading-6 text-[var(--text-secondary)]">
            Starter 只能拿折抵金；Creator 以上審核通過後可累積現金分潤。佣金會經過等待期、退款 / 爭議檢查與人工審核，才會進入批次匯款。
          </p>
          <form action="/api/affiliate/apply" method="post" className="mt-4">
            <button
              type="submit"
              disabled={applyDisabled}
              className="inline-flex h-10 items-center rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[#063a3d] hover:bg-[var(--primary-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-[var(--ip-surface-muted)] disabled:text-[var(--text-muted)]"
            >
              {applyLabel}
            </button>
            <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">{applyHelp}</p>
          </form>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          {summaryCards.map((card) => (
            <article key={card.label} className="rounded-lg border border-[var(--border-soft)] bg-white p-5">
              <p className="text-sm font-medium text-[var(--text-secondary)]">{card.label}</p>
              <p className="mt-2 text-3xl font-semibold text-[var(--text-primary)]">{card.value}</p>
              <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">{card.description}</p>
            </article>
          ))}
        </section>

        <section className="grid gap-4 lg:grid-cols-[1fr_1.1fr]">
          <article className="ip-dashboard-card p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-base font-semibold text-[var(--text-primary)]">提領狀態</h2>
              <span className="rounded-full border border-[var(--border-soft)] bg-[var(--ip-surface-muted)] px-2.5 py-1 text-xs font-semibold text-[var(--text-secondary)]">
                最低 {formatTwd(dashboard.minimumPayoutAmount)}
              </span>
            </div>
            {dashboard.cashPayoutReady ? (
              <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
                已達提領門檻。正式提領仍由營運端建立或審核 payout request，避免付款資料、稅務資料或退款爭議未完成時誤匯款。
              </p>
            ) : (
              <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm leading-6 text-amber-900">
                <p className="font-semibold">暫時不能申請提領</p>
                <ul className="mt-2 list-disc space-y-1 pl-5">
                  {dashboard.payoutBlockedReasons.length > 0 ? (
                    dashboard.payoutBlockedReasons.map((reason) => <li key={reason}>{reason}</li>)
                  ) : (
                    <li>提領流程仍需營運端完成對帳與付款批次。</li>
                  )}
                </ul>
              </div>
            )}
            <button
              type="button"
              disabled
              className="mt-4 inline-flex h-10 cursor-not-allowed items-center rounded-md border border-[var(--border-soft)] bg-[var(--ip-surface-muted)] px-4 text-sm font-semibold text-[var(--text-muted)]"
            >
              申請提領（營運審核開通）
            </button>
          </article>

          <article className="ip-dashboard-card p-5">
            <h2 className="text-base font-semibold text-[var(--text-primary)]">分潤安全規則</h2>
            <div className="mt-3 grid gap-2 text-sm leading-6 text-[var(--text-secondary)]">
              <p>同一個 workspace、自己的推薦碼、重複歸因不會產生有效推薦。</p>
              <p>佣金以實收金額扣除折抵與折扣後計算，並保留等待期處理退款、爭議與人工稽核。</p>
              <p>點擊追蹤與自助提領屬於下一階段能力；正式啟用前不顯示假數據，也不自動匯款。</p>
            </div>
          </article>
        </section>

        <section className="ip-dashboard-card overflow-hidden">
          <div className="border-b border-[var(--border-soft)] px-4 py-3">
            <h2 className="font-semibold text-[var(--text-primary)]">佣金紀錄</h2>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">最近 100 筆分潤計算、等待期與提領狀態。</p>
          </div>
          {dashboard.commissions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-[var(--ip-surface-muted)] text-xs font-semibold text-[var(--text-secondary)]">
                  <tr>
                    <th scope="col" className="px-4 py-3">狀態</th>
                    <th scope="col" className="px-4 py-3">分潤率</th>
                    <th scope="col" className="px-4 py-3 text-right">計算基礎</th>
                    <th scope="col" className="px-4 py-3 text-right">佣金</th>
                    <th scope="col" className="px-4 py-3">建立時間</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-soft)] bg-white text-[var(--text-secondary)]">
                  {dashboard.commissions.map((commission) => (
                    <tr key={commission.id}>
                      <td className="px-4 py-3">
                        <span className="inline-flex rounded-full border border-[var(--border-soft)] bg-[var(--ip-surface-muted)] px-2 py-0.5 text-xs font-medium text-[var(--text-secondary)]">
                          {commissionStatusLabel(commission.status)}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-medium text-[var(--text-primary)]">{commission.commissionRate}%</td>
                      <td className="px-4 py-3 text-right">{formatTwd(commission.commissionBase)}</td>
                      <td className="px-4 py-3 text-right font-semibold text-[var(--text-primary)]">{formatTwd(commission.commissionAmount)}</td>
                      <td className="px-4 py-3 text-[var(--text-muted)]">{formatCommissionDate(commission.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="px-4 py-8 text-sm leading-6 text-[var(--text-muted)]">
              目前還沒有現金分潤紀錄。Simple release 仍以推薦活動與折抵金為主；現金分潤會等方案、審核與提領流程完整後再開通。
            </div>
          )}
        </section>
      </div>
    </AdminShell>
  );
}
