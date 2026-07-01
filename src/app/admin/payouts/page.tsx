import Link from "next/link";
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

function formatPayoutStatus(status: string) {
  const labels: Record<string, string> = {
    requested: "待審核",
    pending: "待審核",
    approved: "已核准",
    rejected: "已退回",
    batched: "已入批次",
    paid: "已付款",
    failed: "付款失敗",
    cancelled: "已取消",
  };

  return labels[status] ?? status;
}

function statusClass(status: string) {
  if (status === "paid" || status === "approved" || status === "batched") return "bg-green-50 text-green-700";
  if (status === "failed" || status === "rejected" || status === "cancelled") return "bg-red-50 text-red-700";
  return "bg-amber-50 text-amber-800";
}

export default async function AdminPayoutsPage() {
  const user = await requireUser();
  if (user.role !== "admin") {
    return (
      <AdminShell title="管理後台">
        <p>僅管理員可查看。</p>
      </AdminShell>
    );
  }

  const requests = await getDb().payoutRequest.findMany({
    orderBy: { requestedAt: "desc" },
    include: { affiliate: { select: { email: true, name: true } } },
  });

  return (
    <AdminShell
      title="提領管理"
      headerRight={
        <Link
          className="inline-flex h-10 items-center rounded-md bg-[var(--primary)] px-3 text-sm font-semibold text-[#063a3d] transition hover:bg-[var(--primary-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2"
          href="/admin/payouts/batches"
        >
          查看批次
        </Link>
      }
    >
      <section className="ip-dashboard-card overflow-hidden">
        <div className="border-b border-[var(--border-soft)] px-4 py-4">
          <h2 className="text-base font-semibold text-[var(--text-primary)]">提領申請</h2>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            這是內部保留的受控提領面板，不屬於目前公開銷售主線。核准只代表進入批次對帳，不會自動匯款。
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="border-b border-[var(--border-soft)] bg-[var(--ip-surface-muted)] text-[var(--text-secondary)]">
              <tr>
                <th className="px-4 py-3 font-medium">申請人</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">金額</th>
                <th className="px-4 py-3 font-medium">狀態</th>
                <th className="px-4 py-3 font-medium">申請日</th>
                <th className="px-4 py-3 font-medium">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-soft)]">
              {requests.map((request) => (
                <tr key={request.id} className="align-top">
                  <td className="px-4 py-3 font-medium text-[var(--text-primary)]">{request.affiliate.name || "未命名夥伴"}</td>
                  <td className="px-4 py-3 text-[var(--text-secondary)]">{request.affiliate.email}</td>
                  <td className="px-4 py-3 font-semibold text-[var(--text-primary)]">{formatTwd(request.amount)}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass(request.status)}`}>
                      {formatPayoutStatus(request.status)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[var(--text-secondary)]">{formatDate(request.requestedAt)}</td>
                  <td className="px-4 py-3">
                    {request.status === "requested" ? (
                      <div className="flex flex-wrap gap-2">
                        <form action={`/api/admin/payouts/${request.id}/approve`} method="post">
                          <button
                            type="submit"
                            className="inline-flex h-8 items-center rounded-md bg-[var(--primary)] px-3 text-xs font-semibold text-[#063a3d] hover:bg-[var(--primary-hover)]"
                          >
                            核准
                          </button>
                        </form>
                        <form action={`/api/admin/payouts/${request.id}/reject`} method="post">
                          <button
                            type="submit"
                            className="inline-flex h-8 items-center rounded-md border border-red-200 bg-red-50 px-3 text-xs font-semibold text-red-700 hover:bg-red-100"
                          >
                            退回
                          </button>
                        </form>
                      </div>
                    ) : (
                      <span className="text-xs text-[var(--text-muted)]">已進入後續流程</span>
                    )}
                  </td>
                </tr>
              ))}
              {requests.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-[var(--text-secondary)]">
                    目前沒有待處理的提領申請。
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </AdminShell>
  );
}
