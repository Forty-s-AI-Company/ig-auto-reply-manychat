import { AdminShell } from "@/components/AdminShell";
import { requireUser } from "@/lib/auth";
import { formatTwd } from "@/lib/billing";
import { getWalletLedger, getWalletSummary } from "@/lib/billing/wallet-service";

function formatLedgerDate(date: Date) {
  return new Intl.DateTimeFormat("zh-TW", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function ledgerTypeLabel(type: string) {
  return (
    {
      credit: "入帳",
      debit: "折抵",
    }[type] || type
  );
}

function ledgerSourceLabel(source: string) {
  return (
    {
      referral_credit: "推薦折抵金",
      invoice_credit: "帳單折抵",
    }[source] || source
  );
}

function ledgerStatusLabel(status: string) {
  return (
    {
      available: "可使用",
      pending: "待確認",
      used: "已折抵",
      payout_requested: "提領申請中",
      paid: "已提領",
    }[status] || status
  );
}

export default async function WalletPage() {
  const user = await requireUser();
  const [summary, ledger] = await Promise.all([getWalletSummary(user.id), getWalletLedger(user.id)]);
  const summaryCards = [
    {
      label: "可用折抵金",
      value: summary.availableCredits,
      description: "可在後續方案付款時折抵。",
    },
    {
      label: "待確認折抵金",
      value: summary.pendingCredits,
      description: "等待付款或推薦狀態確認後入帳。",
    },
    {
      label: "已使用折抵金",
      value: summary.usedCredits,
      description: "已套用在過往帳單的金額。",
    },
  ];

  return (
    <AdminShell title="折抵金錢包">
      <div className="space-y-6">
        <section className="grid gap-4 md:grid-cols-3">
          {summaryCards.map((card) => (
            <article key={card.label} className="rounded-lg border border-[var(--border-soft)] bg-white p-5">
              <p className="text-sm font-medium text-[var(--text-secondary)]">{card.label}</p>
              <p className="mt-2 text-3xl font-semibold text-[var(--text-primary)]">{formatTwd(card.value)}</p>
              <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">{card.description}</p>
            </article>
          ))}
        </section>
        <section className="ip-dashboard-card overflow-hidden">
          <div className="border-b border-[var(--border-soft)] px-4 py-3">
            <h2 className="font-semibold text-[var(--text-primary)]">折抵金流水</h2>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">最近 100 筆折抵金入帳、折抵與提領狀態。</p>
          </div>
          {ledger.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-[var(--ip-surface-muted)] text-xs font-semibold text-[var(--text-secondary)]">
                  <tr>
                    <th scope="col" className="px-4 py-3">類型</th>
                    <th scope="col" className="px-4 py-3">來源</th>
                    <th scope="col" className="px-4 py-3">狀態</th>
                    <th scope="col" className="px-4 py-3 text-right">金額</th>
                    <th scope="col" className="px-4 py-3">時間</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-soft)] bg-white text-[var(--text-secondary)]">
                  {ledger.map((entry) => (
                    <tr key={entry.id}>
                      <td className="px-4 py-3 font-medium text-[var(--text-primary)]">{ledgerTypeLabel(entry.type)}</td>
                      <td className="px-4 py-3">{ledgerSourceLabel(entry.source)}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex rounded-full border border-[var(--border-soft)] bg-[var(--ip-surface-muted)] px-2 py-0.5 text-xs font-medium text-[var(--text-secondary)]">
                          {ledgerStatusLabel(entry.status)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-[var(--text-primary)]">{formatTwd(entry.amount)}</td>
                      <td className="px-4 py-3 text-[var(--text-muted)]">{formatLedgerDate(entry.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="px-4 py-8 text-sm leading-6 text-[var(--text-muted)]">
              目前還沒有折抵金紀錄。完成推薦活動或帳單折抵後，這裡會顯示入帳與使用明細。
            </div>
          )}
        </section>
      </div>
    </AdminShell>
  );
}
