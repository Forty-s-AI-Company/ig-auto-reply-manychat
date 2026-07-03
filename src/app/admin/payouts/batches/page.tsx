import { AdminShell } from "@/components/AdminShell";
import { AdminPayoutBatchCreateForm } from "@/components/AdminPayoutBatchCreateForm";
import { AdminPayoutBatchExportButton } from "@/components/AdminPayoutBatchExportButton";
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
    pending: "待匯出對帳",
    exported: "已匯出對帳",
    paid: "內部已結案",
    failed: "批次異常",
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
    <AdminShell title="分潤對帳批次">
      <div className="space-y-4">
        <AdminPayoutBatchCreateForm />

        <section className="ip-dashboard-card overflow-hidden">
          <div className="border-b border-[var(--border-soft)] px-4 py-4">
            <h2 className="text-base font-semibold text-[var(--text-primary)]">對帳批次紀錄</h2>
            <p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">
              CSV 僅供內部對帳與人工營運紀錄，下載前請再次確認金額、筆數與狀態。
            </p>
            <p className="mt-2 text-xs leading-5 text-[var(--text-muted)] sm:hidden">
              表格可左右滑動查看批次 ID、金額與匯出操作。
            </p>
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
                    <td className="px-4 py-3 font-mono text-xs text-[var(--text-secondary)]">
                      <span className="block max-w-64 break-all">{batch.id}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass(batch.status)}`}>
                        {formatBatchStatus(batch.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[var(--text-secondary)]">{batch.itemCount} 筆</td>
                    <td className="px-4 py-3 font-semibold text-[var(--text-primary)]">{formatTwd(batch.totalAmount)}</td>
                    <td className="px-4 py-3">
                      <AdminPayoutBatchExportButton batchId={batch.id} itemCount={batch.itemCount} totalAmountLabel={formatTwd(batch.totalAmount)} />
                    </td>
                    <td className="px-4 py-3 text-[var(--text-secondary)]">{formatDate(batch.createdAt)}</td>
                  </tr>
                ))}
                {batches.length === 0 ? (
                  <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-[var(--text-secondary)]">
                      目前還沒有內部對帳批次。
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
