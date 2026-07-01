import Link from "next/link";
import { AdminShell } from "@/components/AdminShell";
import { AdminInvoiceRefundButton } from "@/components/AdminInvoiceRefundButton";
import { requireUser } from "@/lib/auth";
import { formatTwd } from "@/lib/billing";
import { getDb } from "@/lib/db";

function formatDate(value?: Date | null) {
  if (!value) return "尚未記錄";
  return new Intl.DateTimeFormat("zh-TW", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(value);
}

function invoiceStatusLabel(status: string) {
  const labels: Record<string, string> = {
    draft: "草稿",
    open: "待處理",
    pending_payment: "待付款",
    paid: "已付款",
    failed: "付款失敗",
    void: "已作廢",
    refunded: "已退款",
  };
  return labels[status] ?? "狀態待確認";
}

function statusClass(status: string) {
  if (status === "paid") return "border-green-200 bg-green-50 text-green-700";
  if (status === "failed" || status === "refunded" || status === "void") return "border-red-200 bg-red-50 text-red-700";
  return "border-amber-200 bg-amber-50 text-amber-800";
}

function paymentStatusLabel(status: string) {
  const labels: Record<string, string> = {
    pending: "待付款",
    paid: "已付款",
    failed: "付款失敗",
    canceled: "已取消",
  };
  return labels[status] ?? "狀態待確認";
}

export default async function AdminInvoicesPage() {
  const user = await requireUser();
  if (user.role !== "admin") {
    return (
      <AdminShell title="管理後台">
        <p>僅管理員可查看。</p>
      </AdminShell>
    );
  }

  const invoices = await getDb().invoice.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      workspace: { select: { name: true } },
      user: { select: { email: true, name: true } },
      paymentOrders: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { provider: true, status: true, merTradeNo: true, tradeNo: true },
      },
    },
  });

  return (
    <AdminShell
      title="帳單退款處理"
      headerRight={
        <Link
          href="/admin/payouts"
          className="inline-flex h-10 items-center rounded-md border border-[var(--border-soft)] bg-white px-3 text-sm font-semibold text-[var(--text-primary)] transition hover:bg-[var(--ip-surface-muted)]"
        >
          返回提領管理
        </Link>
      }
    >
      <section className="ip-dashboard-card overflow-hidden">
        <div className="border-b border-[var(--border-soft)] px-4 py-4">
          <h2 className="text-base font-semibold text-[var(--text-primary)]">帳單退款與折抵沖回</h2>
          <p className="mt-1 max-w-3xl text-sm leading-6 text-[var(--text-secondary)]">
            這是內部受控操作。標記退款只會更新 InboxPilot 帳單狀態，並執行推薦折抵取消 / 沖回；它不會自動向 PayUNI 發起退款。
            實際退款仍需依 PayUNI 後台與客服流程人工確認。
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1080px] text-left text-sm">
            <thead className="border-b border-[var(--border-soft)] bg-[var(--ip-surface-muted)] text-[var(--text-secondary)]">
              <tr>
                <th className="px-4 py-3 font-medium">發票</th>
                <th className="px-4 py-3 font-medium">Workspace</th>
                <th className="px-4 py-3 font-medium">使用者</th>
                <th className="px-4 py-3 font-medium">金額</th>
                <th className="px-4 py-3 font-medium">折抵</th>
                <th className="px-4 py-3 font-medium">狀態</th>
                <th className="px-4 py-3 font-medium">付款紀錄</th>
                <th className="px-4 py-3 font-medium">建立日</th>
                <th className="px-4 py-3 font-medium">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-soft)]">
              {invoices.map((invoice) => {
                const latestOrder = invoice.paymentOrders[0];
                const canMarkRefunded = invoice.status === "paid";

                return (
                  <tr key={invoice.id} className="align-top">
                    <td className="px-4 py-3">
                      <p className="font-mono text-xs text-[var(--text-muted)]">{invoice.invoiceNumber}</p>
                      <p className="mt-1 text-xs text-[var(--text-muted)]">{invoice.id}</p>
                    </td>
                    <td className="px-4 py-3 text-[var(--text-secondary)]">{invoice.workspace.name}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-[var(--text-primary)]">{invoice.user.name || "未命名使用者"}</p>
                      <p className="text-xs text-[var(--text-muted)]">{invoice.user.email}</p>
                    </td>
                    <td className="px-4 py-3 font-semibold text-[var(--text-primary)]">{formatTwd(invoice.totalAmount)}</td>
                    <td className="px-4 py-3 text-[var(--text-secondary)]">{formatTwd(invoice.creditUsedAmount)}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${statusClass(invoice.status)}`}>
                        {invoiceStatusLabel(invoice.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[var(--text-secondary)]">
                      {latestOrder ? (
                        <div>
                          <p>{latestOrder.provider} / {paymentStatusLabel(latestOrder.status)}</p>
                          <p className="font-mono text-xs text-[var(--text-muted)]">{latestOrder.tradeNo || latestOrder.merTradeNo}</p>
                        </div>
                      ) : (
                        "尚無付款紀錄"
                      )}
                    </td>
                    <td className="px-4 py-3 text-[var(--text-secondary)]">{formatDate(invoice.createdAt)}</td>
                    <td className="px-4 py-3">
                      {canMarkRefunded ? (
                        <AdminInvoiceRefundButton invoiceId={invoice.id} />
                      ) : (
                        <span className="text-xs text-[var(--text-muted)]">
                          {invoice.status === "refunded" ? "已完成退款沖回" : "只有已付款帳單可標記退款"}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
              {invoices.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-[var(--text-secondary)]">
                    目前沒有帳單紀錄。
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
