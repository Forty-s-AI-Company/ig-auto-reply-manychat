import { AdminShell } from "@/components/AdminShell";
import { requireUser } from "@/lib/auth";
import { formatTwd } from "@/lib/billing";
import { getDb } from "@/lib/db";

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("zh-TW", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(value);
}

function formatBatchStatus(status: string) {
  const labels: Record<string, string> = {
    pending: "待匯出",
    exported: "已匯出",
    paid: "已付款",
    failed: "付款失敗",
  };

  return labels[status] ?? status;
}

function statusClass(status: string) {
  if (status === "paid") return "bg-green-50 text-green-700";
  if (status === "failed") return "bg-red-50 text-red-700";
  return "bg-amber-50 text-amber-800";
}

export default async function AdminPayoutBatchesPage() {
  const user = await requireUser();
  if (user.role !== "admin") {
    return (
      <AdminShell title="管理後台">
        <p>僅管理員可查看。</p>
      </AdminShell>
    );
  }

  const batches = await getDb().payoutBatch.findMany({
    orderBy: { createdAt: "desc" },
    include: { items: true },
  });

  return (
    <AdminShell title="提領批次">
      <div className="space-y-4">
        <form action="/api/admin/payouts/batches" method="post" className="ip-dashboard-card px-4 py-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-semibold text-[var(--text-primary)]">建立付款批次</h2>
              <p className="mt-1 text-sm text-[var(--text-secondary)]">依目前待核准提領資料產生本月 15 日付款批次。</p>
            </div>
            <button
              type="submit"
              className="inline-flex h-10 items-center justify-center rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[#063a3d] transition hover:bg-[var(--primary-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2"
            >
              產生本月 15 日批次
            </button>
          </div>
        </form>

        <section className="ip-dashboard-card overflow-hidden">
          <div className="border-b border-[var(--border-soft)] px-4 py-4">
            <h2 className="text-base font-semibold text-[var(--text-primary)]">批次紀錄</h2>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">下載 CSV 前請再次確認金額、筆數與狀態。</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-left text-sm">
              <thead className="border-b border-[var(--border-soft)] bg-[var(--ip-surface-muted)] text-[var(--text-secondary)]">
                <tr>
                  <th className="px-4 py-3 font-medium">批次 ID</th>
                  <th className="px-4 py-3 font-medium">狀態</th>
                  <th className="px-4 py-3 font-medium">筆數</th>
                  <th className="px-4 py-3 font-medium">總金額</th>
                  <th className="px-4 py-3 font-medium">匯出</th>
                  <th className="px-4 py-3 font-medium">建立日</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-soft)]">
                {batches.map((batch) => (
                  <tr key={batch.id} className="align-top">
                    <td className="px-4 py-3 font-mono text-xs text-[var(--text-secondary)]">{batch.id}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass(batch.status)}`}>
                        {formatBatchStatus(batch.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[var(--text-secondary)]">{batch.itemCount} 筆</td>
                    <td className="px-4 py-3 font-semibold text-[var(--text-primary)]">{formatTwd(batch.totalAmount)}</td>
                    <td className="px-4 py-3">
                      <a className="font-semibold text-[var(--teal-dark)] hover:text-[var(--primary-hover)]" href={`/api/admin/payouts/batches/${batch.id}/export`}>
                        下載 CSV
                      </a>
                    </td>
                    <td className="px-4 py-3 text-[var(--text-secondary)]">{formatDate(batch.createdAt)}</td>
                  </tr>
                ))}
                {batches.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-[var(--text-secondary)]">
                      目前還沒有提領批次。
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </AdminShell>
  );
}
