import { AdminShell } from "@/components/AdminShell";
import { DismissibleNoticeToast } from "@/components/DismissibleNoticeToast";
import { ManualActionNotice } from "@/components/ManualActionNotice";
import { billingAddons, billingPlans, formatTwd } from "@/lib/billing";
import { getWorkspaceEntitlement } from "@/lib/billing/entitlements";
import { listInvoices } from "@/lib/billing/invoice-service";
import { requireUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { getCurrentWorkspaceId } from "@/lib/workspaces";

function formatDate(date?: Date | null) {
  if (!date) return "-";
  return new Intl.DateTimeFormat("zh-TW", { dateStyle: "medium" }).format(date);
}

function progress(used: number, limit: number) {
  if (limit <= 0) return 0;
  return Math.min(Math.round((used / limit) * 100), 100);
}

function ProgressBar({ label, used, limit }: { label: string; used: number; limit: number }) {
  const percent = progress(used, limit);
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
      <div className="flex justify-between text-sm">
        <span className="text-zinc-300">{label}</span>
        <span className={percent >= 100 ? "text-red-300" : percent >= 80 ? "text-amber-300" : "text-zinc-400"}>
          {used.toLocaleString()} / {limit.toLocaleString()}
        </span>
      </div>
      <div className="mt-3 h-2 rounded-full bg-zinc-800">
        <div className="h-2 rounded-full bg-cyan-400" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

export default async function BillingPage({ searchParams }: { searchParams?: Promise<{ payment?: string }> }) {
  await requireUser();
  const params = await searchParams;
  const workspaceId = await getCurrentWorkspaceId();
  const [entitlement, invoices, recentOrders, subscriptions] = await Promise.all([
    getWorkspaceEntitlement(workspaceId),
    listInvoices(workspaceId),
    getDb().paymentOrder.findMany({ where: { workspaceId }, orderBy: { createdAt: "desc" }, take: 5 }),
    getDb().subscription.findMany({ where: { workspaceId }, orderBy: { updatedAt: "desc" }, take: 3 }),
  ]);
  const activeSubscription = subscriptions.find((subscription) => ["active", "trialing"].includes(subscription.status));

  return (
    <AdminShell title="付款與用量">
      <div className="space-y-6">
        {params?.payment === "success" ? (
          <DismissibleNoticeToast title="付款已完成" tone="success">
            帳單與訂閱已更新。
          </DismissibleNoticeToast>
        ) : null}
        {params?.payment === "failed" ? (
          <DismissibleNoticeToast title="付款未完成" tone="danger">
            請重新確認訂單。
          </DismissibleNoticeToast>
        ) : null}

        <ManualActionNotice title="需要你操作：PayUNI 付款" tone="cyan" stackIndex={params?.payment ? 1 : 0}>
          <p>信用卡資料、OTP、3D 驗證都會在 PayUNI 頁面完成；系統只接收回傳結果，不會保存卡號。</p>
        </ManualActionNotice>

        <section className="rounded-lg border border-zinc-800 bg-zinc-950 p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm text-zinc-400">目前方案</p>
              <h2 className="mt-1 text-3xl font-semibold">{entitlement.planName}</h2>
              <p className="mt-2 text-sm text-zinc-500">
                {activeSubscription?.currentPeriodEnd ? `本期到 ${formatDate(activeSubscription.currentPeriodEnd)}` : "尚未建立付費訂閱"}
              </p>
            </div>
            <div className="rounded-md border border-zinc-800 px-4 py-3 text-sm text-zinc-300">
              {entitlement.usageWarning80 ? "用量已達 80%，建議加購或升級。" : "用量正常"}
            </div>
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <ProgressBar label="Active Contacts" used={entitlement.usage.activeContacts} limit={entitlement.limits.activeContacts} />
            <ProgressBar label="Message Events" used={entitlement.usage.messageEvents} limit={entitlement.limits.messageEvents} />
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-5">
          {billingPlans.filter((plan) => plan.key !== "trial").map((plan) => (
            <article key={plan.key} className="rounded-lg border border-zinc-800 bg-zinc-900 p-5">
              <h3 className="text-lg font-semibold">{plan.name}</h3>
              <p className="mt-1 min-h-[60px] text-sm text-zinc-400">{plan.description}</p>
              <p className="mt-4 text-2xl font-bold">{plan.customSales ? "客製" : formatTwd(plan.priceMonthly || 0)}</p>
              <form action="/api/billing/payuni/checkout" method="post" className="mt-4 space-y-3">
                <input type="hidden" name="planKey" value={plan.key} />
                <input type="hidden" name="interval" value="month" />
                <button
                  disabled={plan.customSales}
                  className="w-full rounded-md bg-cyan-500 px-4 py-2 text-sm font-medium text-zinc-950 disabled:cursor-not-allowed disabled:bg-zinc-700 disabled:text-zinc-400"
                >
                  {plan.customSales ? "聯絡管理員" : "月繳付款"}
                </button>
              </form>
            </article>
          ))}
        </section>

        <section className="rounded-lg border border-zinc-800 bg-zinc-900 p-5">
          <h3 className="font-semibold">加量包</h3>
          <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {billingAddons.map((addon) => (
              <div key={addon.key} className="rounded-md border border-zinc-800 bg-zinc-950 p-4">
                <p className="font-medium">{addon.name}</p>
                <p className="mt-1 text-sm text-zinc-400">{formatTwd(addon.priceMonthly)} / 月</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-lg border border-zinc-800 bg-zinc-900">
          <div className="border-b border-zinc-800 px-4 py-3 font-medium">Invoices</div>
          <div className="divide-y divide-zinc-800">
            {invoices.map((invoice) => (
              <div key={invoice.id} className="grid gap-2 px-4 py-3 text-sm md:grid-cols-5">
                <span className="font-mono text-xs text-zinc-400">{invoice.invoiceNumber}</span>
                <span>{invoice.status}</span>
                <span>{formatTwd(invoice.subtotalAmount)}</span>
                <span>折抵 {formatTwd(invoice.creditUsedAmount)}</span>
                <span>{formatDate(invoice.createdAt)}</span>
              </div>
            ))}
            {invoices.length === 0 ? <p className="px-4 py-6 text-sm text-zinc-500">尚無帳單。</p> : null}
          </div>
        </section>

        <section className="rounded-lg border border-zinc-800 bg-zinc-900">
          <div className="border-b border-zinc-800 px-4 py-3 font-medium">最近 PayUNI 訂單</div>
          <div className="divide-y divide-zinc-800">
            {recentOrders.map((order) => (
              <div key={order.id} className="grid gap-2 px-4 py-3 text-sm md:grid-cols-4">
                <span className="font-mono text-xs text-zinc-400">{order.merTradeNo}</span>
                <span>{order.planKey}</span>
                <span>{formatTwd(order.amount)}</span>
                <span>{order.status}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </AdminShell>
  );
}
