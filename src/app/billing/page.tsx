import Link from "next/link";
import type { ReactNode } from "react";
import { AdminShell } from "@/components/AdminShell";
import { DismissibleNoticeToast } from "@/components/DismissibleNoticeToast";
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

function paymentStatusLabel(status: string) {
  const labels: Record<string, string> = {
    pending: "待付款",
    paid: "已付款",
    failed: "付款失敗",
    canceled: "已取消",
  };
  return labels[status] ?? "狀態待確認";
}

function statusBadgeClass(status: string) {
  if (status === "paid") return "border-green-200 bg-green-50 text-green-700";
  if (status === "failed" || status === "refunded" || status === "void" || status === "canceled") {
    return "border-red-200 bg-red-50 text-red-700";
  }
  return "border-amber-200 bg-amber-50 text-amber-800";
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

function checkoutButtonLabel(plan: { customSales?: boolean }, payuniStatus: { checkoutEnabled: boolean; sandbox: boolean }) {
  if (plan.customSales) return "聯絡管理員";
  if (!payuniStatus.checkoutEnabled) return "付款服務準備中";
  return "前往安全付款";
}

function formatPlanLimit(value: number | null, unit: string) {
  if (value === null) return "不限";
  return `${value.toLocaleString()} ${unit}`;
}

function PlanComparisonRows({ plan }: { plan: (typeof billingPlans)[number] }) {
  const rows = [
    ["活躍聯絡人", formatPlanLimit(plan.activeContactsLimit, "位")],
    ["訊息事件", formatPlanLimit(plan.messageEventsLimit, "則 / 月")],
    ["自動化", formatPlanLimit(plan.automationsLimit, "條")],
    ["團隊席位", formatPlanLimit(plan.teamSeatsLimit, "席")],
    ["資料保留", `${plan.conversationRetentionDays} 天`],
  ];

  return (
    <dl className="mt-5 divide-y divide-[var(--border-soft)] rounded-md border border-[var(--border-soft)] bg-[var(--ip-surface-muted)] text-sm">
      {rows.map(([label, value]) => (
        <div key={label} className="grid grid-cols-[1fr_auto] gap-3 px-3 py-2.5">
          <dt className="text-[var(--text-secondary)]">{label}</dt>
          <dd className="text-right font-semibold text-[var(--text-primary)]">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

function addonDisplayName(name: string) {
  return (
    {
      "+5,000 Message Events": "+5,000 訊息事件",
      "+20,000 Message Events": "+20,000 訊息事件",
      "+50,000 Message Events": "+50,000 訊息事件",
      "+100,000 Message Events": "+100,000 訊息事件",
      "+500,000 Message Events": "+500,000 訊息事件",
      "+1,000 Active Contacts": "+1,000 活躍聯絡人",
      "+5,000 Active Contacts": "+5,000 活躍聯絡人",
      "+10,000 Active Contacts": "+10,000 活躍聯絡人",
      "+50,000 Active Contacts": "+50,000 活躍聯絡人",
      "+1 Team Seat": "+1 個團隊席位",
      "+5 Team Seats": "+5 個團隊席位",
      "Retention +180 days": "對話保留 +180 天",
      "Retention +365 days": "對話保留 +365 天",
    }[name] || name
  );
}

function RecordField({
  label,
  value,
  align = "left",
  emphasized = false,
}: {
  label: string;
  value: ReactNode;
  align?: "left" | "right";
  emphasized?: boolean;
}) {
  return (
    <div className={`grid gap-1 ${align === "right" ? "text-left md:text-right" : ""}`}>
      <span className="text-[11px] font-semibold uppercase tracking-wide text-[var(--text-muted)] md:hidden">{label}</span>
      <span className={emphasized ? "font-medium text-[var(--text-primary)]" : undefined}>{value}</span>
    </div>
  );
}

export default async function BillingPage({ searchParams }: { searchParams?: Promise<{ payment?: string; payuni?: string }> }) {
  const user = await requireUser();
  const params = await searchParams;
  const workspaceId = await getCurrentWorkspaceId();
  const payuniStatus = getPayuniGatewayStatus();
  const selfServePlans = billingPlans.filter((plan) => !["trial", "agency"].includes(plan.key));
  const agencyPlan = billingPlans.find((plan) => plan.key === "agency") ?? null;
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
          <DismissibleNoticeToast title="付款服務暫時無法使用" tone="danger">
            目前付款服務尚未完成啟用，請稍後再試或聯絡我們協助處理。
          </DismissibleNoticeToast>
        ) : null}

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
                {payuniStatus.checkoutEnabled ? "線上付款可用" : "付款服務準備中"}
              </span>
            </div>
          </div>
          <div className="mt-4 rounded-lg border border-cyan-200 bg-cyan-50 p-4 text-sm leading-6 text-cyan-950">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-cyan-950">安全付款說明</p>
                <p className="mt-1 max-w-3xl text-cyan-900">
                  信用卡資料、OTP 與 3D 驗證只會在 PayUNI 頁面完成；InboxPilot 只接收付款結果與帳單狀態，不會保存卡號。
                </p>
              </div>
              <span className="rounded-full border border-cyan-200 bg-white px-3 py-1 text-xs font-semibold text-cyan-800">
                付款資料不由 InboxPilot 保存
              </span>
            </div>
            <div className="mt-3 grid gap-2 md:grid-cols-2">
              <p className="rounded-md border border-cyan-100 bg-white px-3 py-2 text-cyan-900">
                付款完成後，系統會自動更新方案、發票與折抵狀態。
              </p>
              <p className="rounded-md border border-cyan-100 bg-white px-3 py-2 text-cyan-900">
                若付款後沒有立即更新，請保留訂單資訊並聯絡我們協助核對。
              </p>
            </div>
          </div>
          <div className="mt-4 rounded-md border border-[var(--border-soft)] bg-[var(--ip-surface-muted)] px-4 py-3 text-sm leading-6 text-[var(--text-secondary)]">
            <p className="font-semibold text-[var(--text-primary)]">推薦折抵制度 v1</p>
            <p className="mt-1">
              目前可用折抵 {formatTwd(walletSummary.availableCredits)}，待確認折抵 {formatTwd(walletSummary.pendingCredits)}。
              折抵只能用在方案費，單筆帳單最低可折到 0 元；首筆有效付費需先經過 7 天退款觀察期，轉成可用後 30 天內未使用會失效。
              若在觀察期內退款，待確認折抵會取消；若已使用後才退款，會以沖回紀錄抵銷。
            </p>
            <div className="mt-3 flex flex-col gap-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">快速前往</p>
              <div className="grid grid-cols-1 gap-2 sm:inline-grid sm:grid-cols-2">
                <Link
                  href="/referrals"
                  className="inline-flex h-8 items-center justify-center rounded-md border border-[var(--border-soft)] bg-white px-3 text-xs font-semibold text-[var(--text-primary)] transition hover:bg-[var(--ip-surface-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2"
                >
                  查看推薦活動
                </Link>
                <Link
                  href="/wallet"
                  className="inline-flex h-8 items-center justify-center rounded-md border border-[var(--border-soft)] bg-white px-3 text-xs font-semibold text-[var(--text-primary)] transition hover:bg-[var(--ip-surface-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2"
                >
                  查看折抵明細
                </Link>
              </div>
            </div>
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <ProgressBar label="活躍聯絡人" used={entitlement.usage.activeContacts} limit={entitlement.limits.activeContacts} />
            <ProgressBar label="訊息事件" used={entitlement.usage.messageEvents} limit={entitlement.limits.messageEvents} />
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex flex-col gap-1 px-1">
            <h3 className="text-base font-semibold text-[var(--text-primary)]">方案升級選項</h3>
            <p className="text-sm leading-6 text-[var(--text-secondary)]">
              先從目前方案與用量往下看，再決定是否升級月繳方案、規劃客製合作，或暫時只先確認加量包價格。
            </p>
          </div>
          <div className="grid gap-4 xl:grid-cols-4">
            {selfServePlans.map((plan) => {
              const isCurrentPlan = plan.key === entitlement.planKey;
              const checkoutDisabledReason = plan.customSales
                ? "客製方案需要由管理員手動開通；請先聯絡我們確認用量、折抵與付款安排。"
                : isCurrentPlan
                  ? "這是目前使用中的方案，無需重複購買。"
                  : !payuniStatus.checkoutEnabled
                    ? payuniStatus.checkoutDisabledReason
                    : "";
              const checkoutReasonId = checkoutDisabledReason ? `billing-checkout-${plan.key}-reason` : undefined;

              return (
                <article
                  key={plan.key}
                  data-current-plan={isCurrentPlan ? "true" : "false"}
                  className={`relative flex h-full flex-col rounded-lg border bg-white p-5 ${
                    isCurrentPlan
                      ? "border-emerald-300 shadow-[0_0_0_1px_rgba(16,185,129,0.28)]"
                      : plan.key === "pro"
                        ? "border-[var(--primary)] shadow-[0_0_0_1px_rgba(25,211,216,0.35)]"
                        : "border-[var(--border-soft)]"
                  }`}
                >
                  <div className="absolute -top-3 left-4 flex flex-wrap gap-2">
                    {isCurrentPlan ? (
                      <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
                        使用中
                      </span>
                    ) : null}
                    {!isCurrentPlan && plan.key === "pro" ? (
                      <span className="rounded-full bg-[var(--primary)] px-3 py-1 text-xs font-bold text-[#063a3d]">
                        最多人升級
                      </span>
                    ) : null}
                  </div>
                  <h3 className="text-lg font-semibold text-[var(--text-primary)]">{plan.name}</h3>
                  <p className="mt-1 min-h-[60px] text-sm leading-6 text-[var(--text-secondary)]">{plan.description}</p>
                  <div className="mt-4 flex items-end gap-1">
                    <p className="text-2xl font-bold text-[var(--text-primary)]">{plan.customSales ? "客製" : formatTwd(plan.priceMonthly || 0)}</p>
                    {!plan.customSales ? <p className="pb-1 text-xs text-[var(--text-muted)]">/ 月</p> : null}
                  </div>
                  <PlanComparisonRows plan={plan} />
                  <form action="/api/billing/payuni/checkout" method="post" className="mt-auto pt-4">
                    <input type="hidden" name="planKey" value={plan.key} />
                    <input type="hidden" name="interval" value="month" />
                    <button
                      type="submit"
                      disabled={isCurrentPlan || plan.customSales || !payuniStatus.checkoutEnabled}
                      data-testid={`billing-checkout-${plan.key}`}
                      aria-describedby={checkoutReasonId}
                      title={
                        checkoutDisabledReason ||
                        (payuniStatus.checkoutEnabled ? "將前往 PayUNI 安全付款頁。" : undefined)
                      }
                      className="w-full rounded-md bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-[#063a3d] hover:bg-[var(--primary-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-[var(--ip-surface-muted)] disabled:text-[var(--text-muted)]"
                    >
                      {isCurrentPlan ? "目前使用中" : checkoutButtonLabel(plan, payuniStatus)}
                    </button>
                  </form>
                  {checkoutDisabledReason ? (
                    <p id={checkoutReasonId} className="mt-2 text-xs leading-5 text-amber-800">
                      {checkoutDisabledReason}
                    </p>
                  ) : payuniStatus.checkoutEnabled ? (
                    <p className="mt-2 text-xs leading-5 text-[var(--text-muted)]">
                      付款會在 PayUNI 安全頁面完成，InboxPilot 不會保存卡號。
                    </p>
                  ) : null}
                </article>
              );
            })}
          </div>

          {agencyPlan ? (
            <article className="rounded-lg border border-[var(--border-soft)] bg-white p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="max-w-3xl">
                  <p className="text-sm font-semibold text-[var(--text-secondary)]">客製合作</p>
                  <h3 className="mt-1 text-2xl font-semibold text-[var(--text-primary)]">{agencyPlan.name}</h3>
                  <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">{agencyPlan.description}</p>
                  <div className="mt-4 grid gap-3 text-sm text-[var(--text-primary)] md:grid-cols-3">
                    <div className="rounded-md border border-[var(--border-soft)] bg-[var(--ip-surface-muted)] px-4 py-3">
                      <p className="text-xs text-[var(--text-secondary)]">活躍聯絡人</p>
                      <p className="mt-1 font-semibold">{formatPlanLimit(agencyPlan.activeContactsLimit, "位")}</p>
                    </div>
                    <div className="rounded-md border border-[var(--border-soft)] bg-[var(--ip-surface-muted)] px-4 py-3">
                      <p className="text-xs text-[var(--text-secondary)]">訊息事件</p>
                      <p className="mt-1 font-semibold">{formatPlanLimit(agencyPlan.messageEventsLimit, "則 / 月")}</p>
                    </div>
                    <div className="rounded-md border border-[var(--border-soft)] bg-[var(--ip-surface-muted)] px-4 py-3">
                      <p className="text-xs text-[var(--text-secondary)]">團隊席位</p>
                      <p className="mt-1 font-semibold">{formatPlanLimit(agencyPlan.teamSeatsLimit, "席")}</p>
                    </div>
                  </div>
                </div>
                <div className="w-full max-w-sm rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
                  <p className="font-semibold">聯絡管理員</p>
                  <p className="mt-1">
                    客製方案維持人工開通，會一起確認用量、推薦折抵規則、付款安排與啟用節點，避免直接進正式自動扣款。
                  </p>
                </div>
              </div>
            </article>
          ) : null}
        </section>

        <section className="ip-dashboard-card p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-semibold text-[var(--text-primary)]">加量包</h3>
              <p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">
                加量包價格目前只提供規格與預算規劃參考；線上購買尚未開放，避免在 checkout、entitlement 疊加與退款沖回規則完成前產生誤扣款。
              </p>
            </div>
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600">
              尚未開放線上購買
            </span>
          </div>
          <div className="mt-4 rounded-md border border-dashed border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900">
            目前只支援方案訂閱付款。加量包尚未開放的原因是三個流程還沒一起完成：
            checkout 建單、付款成功後自動寫入 entitlement，以及退款 / 作廢後的額度沖回。
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {billingAddons.map((addon) => (
              <div key={addon.key} className="rounded-md border border-[var(--border-soft)] bg-[var(--ip-surface-muted)] p-4">
                <p className="font-medium text-[var(--text-primary)]">{addonDisplayName(addon.name)}</p>
                <p className="mt-1 text-sm text-[var(--text-secondary)]">{formatTwd(addon.priceMonthly)} / 月</p>
                <button
                  type="button"
                  disabled
                  aria-disabled="true"
                  title="加量包線上購買尚未開放，需等用量疊加、退款與發票規則完成後才會啟用。"
                  className="mt-3 inline-flex cursor-not-allowed rounded-md border border-[var(--border-soft)] bg-white px-3 py-2 text-xs font-semibold text-[var(--text-muted)]"
                >
                  尚未開放購買
                </button>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-3">
          <div className="px-1">
            <h3 className="text-base font-semibold text-[var(--text-primary)]">帳單與付款紀錄</h3>
            <p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">
              下面開始是實際建立過的發票與付款訂單，不再是方案比較或折抵規則說明。
            </p>
          </div>
        <section className="ip-dashboard-card overflow-hidden">
          <div className="border-b border-[var(--border-soft)] px-4 py-4">
            <h3 className="font-semibold text-[var(--text-primary)]">發票紀錄</h3>
            <p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">
              發票狀態會以中文顯示；若發生退款，推薦折抵會依規則取消或沖回，不會留下看不懂的系統狀態。
            </p>
          </div>
          <div className="divide-y divide-[var(--border-soft)]">
            {invoices.length > 0 ? (
              <div className="hidden bg-[var(--ip-surface-muted)] px-4 py-3 text-xs font-semibold tracking-wide text-[var(--text-secondary)] md:grid md:grid-cols-5 md:gap-2">
                <span>發票號碼</span>
                <span>狀態</span>
                <span>小計</span>
                <span>折抵</span>
                <span>建立時間</span>
              </div>
            ) : null}
            {invoices.map((invoice) => (
              <div key={invoice.id} className="grid gap-3 px-4 py-3 text-sm text-[var(--text-secondary)] md:grid-cols-5 md:gap-2">
                <RecordField
                  label="發票號碼"
                  emphasized
                  value={<span className="font-mono text-xs text-[var(--text-muted)] md:text-[13px]">{invoice.invoiceNumber}</span>}
                />
                <RecordField
                  label="狀態"
                  value={
                    <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${statusBadgeClass(invoice.status)}`}>
                      {invoiceStatusLabel(invoice.status)}
                    </span>
                  }
                />
                <RecordField label="小計" value={formatTwd(invoice.subtotalAmount)} align="right" />
                <RecordField label="折抵" value={`折抵 ${formatTwd(invoice.creditUsedAmount)}`} align="right" />
                <RecordField label="建立時間" value={formatDate(invoice.createdAt)} />
              </div>
            ))}
            {invoices.length === 0 ? (
              <div className="px-4 py-8 text-sm leading-6 text-[var(--text-muted)]">
                <p className="font-semibold text-[var(--text-primary)]">尚無帳單。</p>
                <p className="mt-1">完成上方方案付款後，這裡會顯示發票號碼、折抵金額與付款狀態。</p>
              </div>
            ) : null}
          </div>
        </section>

        <section className="ip-dashboard-card overflow-hidden">
          <div className="border-b border-[var(--border-soft)] px-4 py-4">
            <h3 className="font-semibold text-[var(--text-primary)]">最近付款訂單</h3>
            <p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">
              這裡會顯示最近建立的付款訂單與付款結果，方便對照發票與推薦折抵是否同步更新。
            </p>
          </div>
          <div className="divide-y divide-[var(--border-soft)]">
            {recentOrders.length > 0 ? (
              <div className="hidden bg-[var(--ip-surface-muted)] px-4 py-3 text-xs font-semibold tracking-wide text-[var(--text-secondary)] md:grid md:grid-cols-4 md:gap-2">
                <span>Merchant Trade No</span>
                <span>方案</span>
                <span>金額</span>
                <span>付款狀態</span>
              </div>
            ) : null}
            {recentOrders.map((order) => (
              <div key={order.id} className="grid gap-3 px-4 py-3 text-sm text-[var(--text-secondary)] md:grid-cols-4 md:gap-2">
                <RecordField
                  label="Merchant Trade No"
                  emphasized
                  value={<span className="font-mono text-xs text-[var(--text-muted)] md:text-[13px]">{order.merTradeNo}</span>}
                />
                <RecordField label="方案" value={order.planKey} />
                <RecordField label="金額" value={formatTwd(order.amount)} align="right" />
                <RecordField
                  label="付款狀態"
                  value={
                    <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${statusBadgeClass(order.status)}`}>
                      {paymentStatusLabel(order.status)}
                    </span>
                  }
                />
              </div>
            ))}
            {recentOrders.length === 0 ? (
              <div className="px-4 py-8 text-sm leading-6 text-[var(--text-muted)]">
                <p className="font-semibold text-[var(--text-primary)]">尚無付款訂單。</p>
                <p className="mt-1">建立第一筆付款訂單後，這裡會顯示訂單編號、方案金額與付款狀態。</p>
              </div>
            ) : null}
          </div>
        </section>
        </section>
      </div>
    </AdminShell>
  );
}
