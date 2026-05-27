import { AdminShell } from "@/components/AdminShell";
import { requireUser } from "@/lib/auth";
import { getReferralDashboard } from "@/lib/billing/referral-service";
import { formatTwd } from "@/lib/billing";

export default async function ReferralsPage() {
  const user = await requireUser();
  const dashboard = await getReferralDashboard(user.id);

  return (
    <AdminShell title="推薦活動">
      <div className="space-y-6">
        <section className="rounded-lg border border-zinc-800 bg-zinc-950 p-5">
          <p className="text-sm text-zinc-400">你的推薦碼</p>
          <h2 className="mt-2 text-3xl font-semibold">{dashboard.code}</h2>
          <p className="mt-3 break-all rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-cyan-200">
            {dashboard.referralUrl}
          </p>
          <p className="mt-3 text-sm text-zinc-400">
            有效推薦會讓雙方各 +1 天試用；推薦人額外 +300 trial events，最高試用 20 天、最高 7,000 events。
          </p>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
            <p className="text-sm text-zinc-400">已推薦</p>
            <p className="mt-2 text-2xl font-semibold">{dashboard.attributions.length}</p>
          </div>
          <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
            <p className="text-sm text-zinc-400">試用天數獎勵</p>
            <p className="mt-2 text-2xl font-semibold">{dashboard.trialDaysEarned}</p>
          </div>
          <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
            <p className="text-sm text-zinc-400">折抵金</p>
            <p className="mt-2 text-2xl font-semibold">{formatTwd(dashboard.creditsEarned)}</p>
          </div>
        </section>

        <section className="rounded-lg border border-zinc-800 bg-zinc-900">
          <div className="border-b border-zinc-800 px-4 py-3 font-medium">推薦紀錄</div>
          {dashboard.attributions.map((item) => (
            <div key={item.id} className="grid gap-2 border-b border-zinc-800 px-4 py-3 text-sm md:grid-cols-4">
              <span>{item.referred.name}</span>
              <span>{item.referred.email}</span>
              <span>{item.status}</span>
              <span>{item.createdAt.toLocaleDateString("zh-TW")}</span>
            </div>
          ))}
          {dashboard.attributions.length === 0 ? <p className="px-4 py-6 text-sm text-zinc-500">尚無推薦紀錄。</p> : null}
        </section>
      </div>
    </AdminShell>
  );
}
