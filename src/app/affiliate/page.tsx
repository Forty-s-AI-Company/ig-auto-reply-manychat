import { AdminShell } from "@/components/AdminShell";
import { requireUser } from "@/lib/auth";
import { getAffiliateDashboard } from "@/lib/billing/affiliate-service";
import { formatTwd } from "@/lib/billing";

export default async function AffiliatePage() {
  const user = await requireUser();
  const dashboard = await getAffiliateDashboard(user.id);

  return (
    <AdminShell title="聯盟分潤">
      <div className="space-y-6">
        <section className="rounded-lg border border-zinc-800 bg-zinc-950 p-5">
          <h2 className="text-xl font-semibold">聯盟夥伴狀態：{dashboard.profile?.status || "not_applied"}</h2>
          <p className="mt-2 text-sm text-zinc-400">
            Starter 只能拿折抵金；Creator 以上審核通過後可累積現金分潤並申請批次匯款。
          </p>
          <form action="/api/affiliate/apply" method="post" className="mt-4">
            <button className="rounded-md bg-cyan-500 px-4 py-2 text-sm font-bold text-zinc-950">申請聯盟夥伴</button>
          </form>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
            <p className="text-sm text-zinc-400">可提領佣金</p>
            <p className="mt-2 text-2xl font-semibold">{formatTwd(dashboard.availableBalance)}</p>
          </div>
          <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
            <p className="text-sm text-zinc-400">最低提領</p>
            <p className="mt-2 text-2xl font-semibold">{formatTwd(dashboard.minimumPayoutAmount)}</p>
          </div>
          <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
            <p className="text-sm text-zinc-400">等級</p>
            <p className="mt-2 text-2xl font-semibold">{dashboard.profile?.level || "-"}</p>
          </div>
        </section>

        <section className="rounded-lg border border-zinc-800 bg-zinc-900">
          <div className="border-b border-zinc-800 px-4 py-3 font-medium">佣金</div>
          {dashboard.commissions.map((commission) => (
            <div key={commission.id} className="grid gap-2 border-b border-zinc-800 px-4 py-3 text-sm md:grid-cols-5">
              <span>{commission.status}</span>
              <span>{commission.commissionRate}%</span>
              <span>{formatTwd(commission.commissionBase)}</span>
              <span>{formatTwd(commission.commissionAmount)}</span>
              <span>{commission.createdAt.toLocaleDateString("zh-TW")}</span>
            </div>
          ))}
        </section>
      </div>
    </AdminShell>
  );
}
