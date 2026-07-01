import Link from "next/link";
import { AdminShell } from "@/components/AdminShell";
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
          <p
            className="mt-3 break-all rounded-md border border-[var(--border-soft)] bg-[var(--ip-surface-muted)] px-3 py-2 text-sm font-medium text-[var(--teal-dark)]"
            data-testid="referrals-url"
          >
            {dashboard.referralUrl}
          </p>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--text-secondary)]">
            {simpleRelease
              ? "目前推薦活動只記錄邀請連結、推薦名單與試用加值；現金分潤會在聯盟審核流程完整後受控開放。"
              : "有效推薦會讓雙方各 +1 天試用；Creator 以上使用者可另外申請聯盟夥伴，審核通過後才會累積現金分潤。"}
          </p>
        </section>

        <section className={`grid gap-4 ${simpleRelease ? "md:grid-cols-2" : "md:grid-cols-4"}`}>
          <ReferralMetric label="追蹤註冊" value={dashboard.metrics.signupsTracked} description="已帶入推薦碼完成註冊的使用者。" />
          <ReferralMetric label="完成啟用" value={dashboard.metrics.activatedCount} description="已完成 Email、IG 與自動化條件的推薦。" />
          <ReferralMetric label="付費轉換" value={dashboard.metrics.paidConversions} description="已完成第一筆付款並可進入折抵 / 分潤判斷。" />
          {simpleRelease ? null : (
            <ReferralMetric label="折抵金" value={formatTwd(dashboard.creditsEarned)} description="已確認可用於帳單折抵的推薦金額。" />
          )}
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <article className="ip-dashboard-card p-5">
            <h2 className="text-base font-semibold text-[var(--text-primary)]">推薦活動與聯盟分潤的差異</h2>
            <div className="mt-4 grid gap-3 text-sm leading-6 text-[var(--text-secondary)]">
              <div className="rounded-lg border border-[var(--border-soft)] bg-[var(--ip-surface-muted)] p-3">
                <p className="font-semibold text-[var(--text-primary)]">推薦活動</p>
                <p className="mt-1">所有使用者都可使用推薦碼，主要獎勵是試用天數、trial events 與帳單折抵。</p>
              </div>
              <div className="rounded-lg border border-[var(--border-soft)] bg-[var(--ip-surface-muted)] p-3">
                <p className="font-semibold text-[var(--text-primary)]">聯盟分潤</p>
                <p className="mt-1">Creator 以上方案需申請並通過審核，才會依付費轉換產生現金佣金。</p>
                {!simpleRelease ? (
                  <Link className="mt-2 inline-flex text-sm font-semibold text-[var(--teal-dark)] hover:underline" href="/affiliate">
                    前往聯盟分潤
                  </Link>
                ) : null}
              </div>
            </div>
          </article>

          <article className="ip-dashboard-card p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-base font-semibold text-[var(--text-primary)]">點擊追蹤</h2>
              <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-800">
                受控開通
              </span>
            </div>
            <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
              目前不顯示假點擊數。點擊追蹤需要獨立事件表、去重規則與防作弊策略；在這些資料模型正式部署前，這裡只顯示已可驗證的註冊、啟用與付費轉換。
            </p>
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
