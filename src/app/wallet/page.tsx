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
      expiry: "折抵到期失效",
      clawback: "退款 / 稽核沖回",
    }[source] || source
  );
}

function ledgerStatusLabel(status: string) {
  return (
    {
      available: "可使用",
      pending: "待確認",
      used: "已折抵",
      expired: "已失效",
      cancelled: "已取消",
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
      description: "首筆有效付費後先觀察 7 天，超過退款期才可使用。",
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
            <p className="mt-1 text-sm text-[var(--text-secondary)]">最近 100 筆折抵金入帳、待確認、到期失效、退款沖回與帳單折抵紀錄。</p>
            <p className="mt-2 text-xs leading-5 text-[var(--text-muted)]">
              推薦折抵只能折抵方案費，單筆帳單最低可折到 0 元；轉成可用後 30 天內未使用會自動失效。
            </p>
            <div className="mt-3 flex flex-wrap gap-3 text-xs text-[var(--text-muted)]">
              <span>下一筆可用時間：{summary.nextAvailableAt ? formatLedgerDate(summary.nextAvailableAt) : "目前沒有待確認折抵"}</span>
              <span>下一筆到期時間：{summary.nextExpiryAt ? formatLedgerDate(summary.nextExpiryAt) : "目前沒有可用折抵即將到期"}</span>
            </div>
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
