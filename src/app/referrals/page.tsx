import Link from "next/link";
import { AdminShell } from "@/components/AdminShell";
import { ReferralLinkCopyButton } from "@/components/ReferralLinkCopyButton";
import { requireUser } from "@/lib/auth";
import { getReferralDashboard } from "@/lib/billing/referral-service";
import { formatTwd } from "@/lib/billing";
import { isSimpleRelease } from "@/lib/release-mode";

function referralStatusLabel(status: string) {
  return (
    {
      pending: "等待完成啟用條件",
      activated: "已啟用試用獎勵",
      paid: "已完成付費轉換",
      invalid: "已標記無效",
    }[status] || "待確認"
  );
}

export default async function ReferralsPage() {
  const user = await requireUser();
  const dashboard = await getReferralDashboard(user.id);
  const simpleRelease = await isSimpleRelease();

  return (
    <AdminShell title="推薦活動">
      <div className="space-y-6">
        <section className="ip-dashboard-card p-5" data-testid="referrals-hero-card">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-[var(--teal-dark)]">邀請追蹤</p>
              <h2 className="mt-1 text-2xl font-semibold text-[var(--text-primary)]">你的推薦碼</h2>
            </div>
            <span className="rounded-full border border-[var(--border-soft)] bg-[var(--ip-surface-muted)] px-3 py-1 text-xs font-medium text-[var(--text-secondary)]">
              {simpleRelease ? "Simple release" : "Full release"}
            </span>
          </div>
          <p className="mt-4 text-3xl font-semibold text-[var(--text-primary)]">{dashboard.code}</p>
          <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <p
              className="min-w-0 flex-1 break-all rounded-md border border-[var(--border-soft)] bg-[var(--ip-surface-muted)] px-3 py-2 text-sm font-medium text-[var(--teal-dark)]"
              data-testid="referrals-url"
            >
              {dashboard.referralUrl}
            </p>
            <ReferralLinkCopyButton referralUrl={dashboard.referralUrl} />
          </div>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--text-secondary)]">
            {simpleRelease
              ? "目前推薦活動以方案折抵為主：首筆有效付費會先進入待確認，超過退款觀察期才會轉成可用折抵金。"
              : "有效推薦會讓雙方各 +1 天試用；首筆有效付費會先進入待確認折抵金，超過退款觀察期後才可折抵後續方案費。"}
          </p>
        </section>

        <section className="grid gap-4 md:grid-cols-4">
          <ReferralMetric label="追蹤註冊" value={dashboard.metrics.signupsTracked} description="已帶入推薦碼完成註冊的使用者。" />
          <ReferralMetric label="完成啟用" value={dashboard.metrics.activatedCount} description="已完成 Email、IG 與自動化條件的推薦。" />
          <ReferralMetric label="待確認折抵" value={formatTwd(dashboard.walletSummary.pendingCredits)} description="首筆付費後先進入 7 天退款觀察期。" />
          <ReferralMetric label="可用折抵" value={formatTwd(dashboard.walletSummary.availableCredits)} description="可直接折抵後續方案費，單筆帳單最低可折到 0 元。" />
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <article className="ip-dashboard-card p-5">
            <h2 className="text-base font-semibold text-[var(--text-primary)]">推薦折抵制度 v1</h2>
            <div className="mt-4 grid gap-3 text-sm leading-6 text-[var(--text-secondary)]">
              <div className="rounded-lg border border-[var(--border-soft)] bg-[var(--ip-surface-muted)] p-3">
                <p className="font-semibold text-[var(--text-primary)]">折抵怎麼生效</p>
                <p className="mt-1">推薦人完成第一筆有效付費後，折抵金會先進 pending；超過退款觀察期才會轉成 available。</p>
              </div>
              <div className="rounded-lg border border-[var(--border-soft)] bg-[var(--ip-surface-muted)] p-3">
                <p className="font-semibold text-[var(--text-primary)]">折抵規則</p>
                <p className="mt-1">折抵只能用在方案費，單筆帳單最多折到 0 元；不可提現、不可轉讓，轉成可用後 30 天內要使用。</p>
              </div>
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
                <p className="font-semibold text-amber-900">退款與失效</p>
                <p className="mt-1 text-amber-900">退款觀察期內退款會直接取消待確認折抵；若後續有退款或人工判定異常，已用折抵會改以沖回或失效處理。</p>
              </div>
            </div>
          </article>

          <article className="ip-dashboard-card p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-base font-semibold text-[var(--text-primary)]">折抵與追蹤邊界</h2>
              <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-800">
                受控開通
              </span>
            </div>
            <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
              目前不顯示假點擊數，也不把現金提領包裝成已可用功能。這個頁面只顯示已可驗證的註冊、啟用、待確認折抵與可用折抵。
            </p>
            <div className="mt-4 rounded-lg border border-[var(--border-soft)] bg-[var(--ip-surface-muted)] p-3 text-sm leading-6 text-[var(--text-secondary)]">
              <p>下一筆可用折抵時間：{dashboard.walletSummary.nextAvailableAt ? dashboard.walletSummary.nextAvailableAt.toLocaleDateString("zh-TW") : "目前沒有待確認折抵"}</p>
              <p className="mt-1">下一筆到期時間：{dashboard.walletSummary.nextExpiryAt ? dashboard.walletSummary.nextExpiryAt.toLocaleDateString("zh-TW") : "目前沒有可用折抵即將到期"}</p>
            </div>
            {!simpleRelease ? (
              <Link className="mt-3 inline-flex text-sm font-semibold text-[var(--teal-dark)] hover:underline" href="/wallet">
                前往折抵金錢包
              </Link>
            ) : null}
          </article>
        </section>

        <section className="ip-dashboard-card overflow-hidden" data-testid="referrals-records-card">
          <div className="border-b border-[var(--border-soft)] px-4 py-3 font-medium text-[var(--text-primary)]">推薦紀錄</div>
          {dashboard.attributions.map((item) => (
            <div key={item.id} className="grid gap-2 border-b border-[var(--border-soft)] px-4 py-3 text-sm text-[var(--text-secondary)] md:grid-cols-4">
              <span className="font-medium text-[var(--text-primary)]">{item.referred.name}</span>
              <span>{item.referred.email}</span>
              <span>{referralStatusLabel(item.status)}</span>
              <span>{item.createdAt.toLocaleDateString("zh-TW")}</span>
            </div>
          ))}
          {dashboard.attributions.length === 0 ? (
            <div className="px-4 py-6 text-sm leading-6 text-[var(--text-secondary)]">
              <p className="font-semibold text-[var(--text-primary)]">尚無推薦紀錄。</p>
              <p className="mt-1">分享上方推薦連結後，成功註冊的名單會出現在這裡。</p>
            </div>
          ) : null}
        </section>
      </div>
    </AdminShell>
  );
}

function ReferralMetric({ label, value, description }: { label: string; value: number | string; description: string }) {
  return (
    <div className="ip-dashboard-card p-4">
      <p className="text-sm text-[var(--text-secondary)]">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-[var(--text-primary)]">{value}</p>
      <p className="mt-2 text-xs leading-5 text-[var(--text-muted)]">{description}</p>
    </div>
  );
}
