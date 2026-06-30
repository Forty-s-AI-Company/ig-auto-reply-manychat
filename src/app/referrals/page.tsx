import { AdminShell } from "@/components/AdminShell";
import { requireUser } from "@/lib/auth";
import { getReferralDashboard } from "@/lib/billing/referral-service";
import { formatTwd } from "@/lib/billing";
import { isSimpleRelease } from "@/lib/release-mode";

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
              ? "目前推薦活動只記錄邀請連結、推薦名單與試用加值，暫不提供聯盟分潤或現金獎金。"
              : "有效推薦會讓雙方各 +1 天試用；推薦人額外 +300 trial events，最高試用 20 天、最高 7,000 events。"}
          </p>
        </section>

        <section className={`grid gap-4 ${simpleRelease ? "md:grid-cols-2" : "md:grid-cols-3"}`}>
          <ReferralMetric label="已推薦" value={dashboard.attributions.length} />
          <ReferralMetric label="試用天數獎勵" value={dashboard.trialDaysEarned} />
          {simpleRelease ? null : (
            <ReferralMetric label="折抵金" value={formatTwd(dashboard.creditsEarned)} />
          )}
        </section>

        <section className="ip-dashboard-card overflow-hidden" data-testid="referrals-records-card">
          <div className="border-b border-[var(--border-soft)] px-4 py-3 font-medium text-[var(--text-primary)]">推薦紀錄</div>
          {dashboard.attributions.map((item) => (
            <div key={item.id} className="grid gap-2 border-b border-[var(--border-soft)] px-4 py-3 text-sm text-[var(--text-secondary)] md:grid-cols-4">
              <span className="font-medium text-[var(--text-primary)]">{item.referred.name}</span>
              <span>{item.referred.email}</span>
              <span>{item.status}</span>
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

function ReferralMetric({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="ip-dashboard-card p-4">
      <p className="text-sm text-[var(--text-secondary)]">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-[var(--text-primary)]">{value}</p>
    </div>
  );
}
