import { AdminShell } from "@/components/AdminShell";
import { DismissibleNoticeToast } from "@/components/DismissibleNoticeToast";
import { ManualActionNotice } from "@/components/ManualActionNotice";
import { billingAddons, billingPlans, formatTwd } from "@/lib/billing";
import { getWorkspaceEntitlement } from "@/lib/billing/entitlements";
import { listInvoices } from "@/lib/billing/invoice-service";
import { getWalletSummary } from "@/lib/billing/wallet-service";
import { requireUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { getPayuniGatewayStatus } from "@/lib/payuni";
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
    <div className="rounded-lg border border-[var(--border-soft)] bg-white p-4">
      <div className="flex justify-between text-sm">
        <span className="text-[var(--text-secondary)]">{label}</span>
        <span className={percent >= 100 ? "text-red-700" : percent >= 80 ? "text-amber-700" : "text-[var(--text-muted)]"}>
          {used.toLocaleString()} / {limit.toLocaleString()}
        </span>
      </div>
      <div className="mt-3 h-2 rounded-full bg-[#d9eef1]">
        <div className="h-2 rounded-full bg-[var(--primary)]" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

export default async function BillingPage({ searchParams }: { searchParams?: Promise<{ payment?: string; payuni?: string }> }) {
  const user = await requireUser();
  const params = await searchParams;
  const workspaceId = await getCurrentWorkspaceId();
  const payuniStatus = getPayuniGatewayStatus();
  const [entitlement, invoices, recentOrders, subscriptions, walletSummary] = await Promise.all([
    getWorkspaceEntitlement(workspaceId),
    listInvoices(workspaceId),
    getDb().paymentOrder.findMany({ where: { workspaceId }, orderBy: { createdAt: "desc" }, take: 5 }),
    getDb().subscription.findMany({ where: { workspaceId }, orderBy: { updatedAt: "desc" }, take: 3 }),
    getWalletSummary(user.id),
  ]);
  const activeSubscription = subscriptions.find((subscription) => ["active", "trialing"].includes(subscription.status));

  return (
    <AdminShell title="方案與用量">
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
        {params?.payuni === "production_gate_pending" ? (
          <DismissibleNoticeToast title="PayUNI 正式站尚未開通" tone="danger">
            這次付款還沒真的送到正式金流，先停在受控開通階段。請先用測試站驗證流程，等 merchant review 與營運開關完成後再切正式站。
          </DismissibleNoticeToast>
        ) : null}

        <ManualActionNotice title="需要你操作：PayUNI 付款" tone="cyan" stackIndex={params?.payment ? 1 : 0}>
          <p>信用卡資料、OTP、3D 驗證都會在 PayUNI 頁面完成；系統只接收回傳結果，不會保存卡號。</p>
          <p className="mt-2">
            {payuniStatus.label} - {payuniStatus.detail}
          </p>
          {!payuniStatus.productionEnabled ? (
            <p className="mt-2">若你是白名單客戶，可以先由營運人員人工確認付款與方案啟用，不會直接打開正式自動扣款。</p>
          ) : null}
        </ManualActionNotice>

        <section className="ip-dashboard-card p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm text-[var(--text-secondary)]">目前方案</p>
              <h2 className="mt-1 text-3xl font-semibold text-[var(--text-primary)]">{entitlement.planName}</h2>
              <p className="mt-2 text-sm text-[var(--text-muted)]">
                {activeSubscription?.currentPeriodEnd ? `本期到 ${formatDate(activeSubscription.currentPeriodEnd)}` : "尚未建立付費訂閱"}
              </p>
            </div>
            <div className="grid gap-2 text-sm sm:text-right">
              <span className="rounded-md border border-[var(--border-soft)] bg-[var(--ip-surface-muted)] px-4 py-2 font-medium text-[var(--text-primary)]">
                {entitlement.usageWarning80 ? "用量已達 80%，建議加購或升級。" : "用量正常"}
              </span>
              <span className="rounded-md border border-amber-200 bg-amber-50 px-4 py-2 font-medium text-amber-800">
                {payuniStatus.label}
                {!payuniStatus.productionEnabled ? " / 受控開通" : ""}
              </span>
            </div>
          </div>
          <p className="mt-4 rounded-md border border-dashed border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900">
            {payuniStatus.detail}
          </p>
          <div className="mt-4 rounded-md border border-[var(--border-soft)] bg-[var(--ip-surface-muted)] px-4 py-3 text-sm leading-6 text-[var(--text-secondary)]">
            <p className="font-semibold text-[var(--text-primary)]">推薦折抵制度 v1</p>
            <p className="mt-1">
              目前可用折抵 {formatTwd(walletSummary.availableCredits)}，待確認折抵 {formatTwd(walletSummary.pendingCredits)}。
              折抵只能用在方案費，單筆帳單最低可折到 0 元；首筆有效付費需先經過 7 天退款觀察期，轉成可用後 30 天內未使用會失效。
            </p>
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <ProgressBar label="活躍聯絡人" used={entitlement.usage.activeContacts} limit={entitlement.limits.activeContacts} />
            <ProgressBar label="訊息事件" used={entitlement.usage.messageEvents} limit={entitlement.limits.messageEvents} />
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-5">
          {billingPlans.filter((plan) => plan.key !== "trial").map((plan) => (
            <article key={plan.key} className="rounded-lg border border-[var(--border-soft)] bg-white p-5">
              <h3 className="text-lg font-semibold text-[var(--text-primary)]">{plan.name}</h3>
              <p className="mt-1 min-h-[60px] text-sm leading-6 text-[var(--text-secondary)]">{plan.description}</p>
              <p className="mt-4 text-2xl font-bold text-[var(--text-primary)]">{plan.customSales ? "客製" : formatTwd(plan.priceMonthly || 0)}</p>
              <form action="/api/billing/payuni/checkout" method="post" className="mt-4 space-y-3">
                <input type="hidden" name="planKey" value={plan.key} />
                <input type="hidden" name="interval" value="month" />
                <button
                  type="submit"
                  disabled={plan.customSales || !payuniStatus.checkoutEnabled}
                  title={
                    plan.customSales
                      ? "客製方案需要由管理員手動開通。"
                      : payuniStatus.checkoutDisabledReason || undefined
                  }
                  className="w-full rounded-md bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-[#063a3d] disabled:cursor-not-allowed disabled:bg-[var(--ip-surface-muted)] disabled:text-[var(--text-muted)]"
                >
                  {plan.customSales ? "聯絡管理員" : payuniStatus.checkoutEnabled ? "月繳付款" : "正式站受控開通中"}
                </button>
              </form>
              {!plan.customSales && !payuniStatus.checkoutEnabled ? (
                <p className="mt-2 text-xs leading-5 text-amber-800">{payuniStatus.checkoutDisabledReason}</p>
              ) : null}
            </article>
          ))}
        </section>

        <section className="ip-dashboard-card p-5">
          <h3 className="font-semibold text-[var(--text-primary)]">加量包</h3>
          <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {billingAddons.map((addon) => (
              <div key={addon.key} className="rounded-md border border-[var(--border-soft)] bg-[var(--ip-surface-muted)] p-4">
                <p className="font-medium text-[var(--text-primary)]">{addon.name}</p>
                <p className="mt-1 text-sm text-[var(--text-secondary)]">{formatTwd(addon.priceMonthly)} / 月</p>
              </div>
            ))}
          </div>
        </section>

        <section className="ip-dashboard-card overflow-hidden">
          <div className="border-b border-[var(--border-soft)] px-4 py-3 font-medium text-[var(--text-primary)]">發票紀錄</div>
          <div className="divide-y divide-[var(--border-soft)]">
            {invoices.map((invoice) => (
              <div key={invoice.id} className="grid gap-2 px-4 py-3 text-sm text-[var(--text-secondary)] md:grid-cols-5">
                <span className="font-mono text-xs text-[var(--text-muted)]">{invoice.invoiceNumber}</span>
                <span>{invoice.status}</span>
                <span>{formatTwd(invoice.subtotalAmount)}</span>
                <span>折抵 {formatTwd(invoice.creditUsedAmount)}</span>
                <span>{formatDate(invoice.createdAt)}</span>
              </div>
            ))}
            {invoices.length === 0 ? <p className="px-4 py-6 text-sm text-[var(--text-muted)]">尚無帳單。</p> : null}
          </div>
        </section>

        <section className="ip-dashboard-card overflow-hidden">
          <div className="border-b border-[var(--border-soft)] px-4 py-3 font-medium text-[var(--text-primary)]">最近 PayUNI 訂單</div>
          <div className="divide-y divide-[var(--border-soft)]">
            {recentOrders.map((order) => (
              <div key={order.id} className="grid gap-2 px-4 py-3 text-sm text-[var(--text-secondary)] md:grid-cols-4">
                <span className="font-mono text-xs text-[var(--text-muted)]">{order.merTradeNo}</span>
                <span>{order.planKey}</span>
                <span>{formatTwd(order.amount)}</span>
                <span>{order.status}</span>
              </div>
            ))}
            {recentOrders.length === 0 ? <p className="px-4 py-6 text-sm text-[var(--text-muted)]">尚無 PayUNI 訂單。</p> : null}
          </div>
        </section>
      </div>
    </AdminShell>
  );
}
