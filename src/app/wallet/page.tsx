import { AdminShell } from "@/components/AdminShell";
import { requireUser } from "@/lib/auth";
import { formatTwd } from "@/lib/billing";
import { getWalletLedger, getWalletSummary } from "@/lib/billing/wallet-service";

export default async function WalletPage() {
  const user = await requireUser();
  const [summary, ledger] = await Promise.all([getWalletSummary(user.id), getWalletLedger(user.id)]);

  return (
    <AdminShell title="折抵金錢包">
      <div className="space-y-6">
        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
            <p className="text-sm text-zinc-400">可用折抵金</p>
            <p className="mt-2 text-2xl font-semibold">{formatTwd(summary.availableCredits)}</p>
          </div>
          <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
            <p className="text-sm text-zinc-400">Pending</p>
            <p className="mt-2 text-2xl font-semibold">{formatTwd(summary.pendingCredits)}</p>
          </div>
          <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
            <p className="text-sm text-zinc-400">已使用</p>
            <p className="mt-2 text-2xl font-semibold">{formatTwd(summary.usedCredits)}</p>
          </div>
        </section>
        <section className="rounded-lg border border-zinc-800 bg-zinc-900">
          <div className="border-b border-zinc-800 px-4 py-3 font-medium">流水帳</div>
          {ledger.map((entry) => (
            <div key={entry.id} className="grid gap-2 border-b border-zinc-800 px-4 py-3 text-sm md:grid-cols-5">
              <span>{entry.type}</span>
              <span>{entry.source}</span>
              <span>{entry.status}</span>
              <span>{formatTwd(entry.amount)}</span>
              <span>{entry.createdAt.toLocaleDateString("zh-TW")}</span>
            </div>
          ))}
        </section>
      </div>
    </AdminShell>
  );
}
