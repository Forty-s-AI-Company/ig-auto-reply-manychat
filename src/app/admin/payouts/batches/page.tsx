import { AdminShell } from "@/components/AdminShell";
import { requireUser } from "@/lib/auth";
import { formatTwd } from "@/lib/billing";
import { getDb } from "@/lib/db";

export default async function AdminPayoutBatchesPage() {
  const user = await requireUser();
  if (user.role !== "admin") return <AdminShell title="Admin"><p>Admin only.</p></AdminShell>;
  const batches = await getDb().payoutBatch.findMany({ orderBy: { createdAt: "desc" }, include: { items: true } });

  return (
    <AdminShell title="Payout Batches">
      <div className="space-y-4">
        <form action="/api/admin/payouts/batches" method="post" className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
          <button className="rounded-md bg-cyan-500 px-4 py-2 text-sm font-bold text-zinc-950">產生本月 15 日批次</button>
        </form>
        <section className="rounded-lg border border-zinc-800 bg-zinc-900">
          <div className="border-b border-zinc-800 px-4 py-3 font-medium">批次</div>
          {batches.map((batch) => (
            <div key={batch.id} className="grid gap-2 border-b border-zinc-800 px-4 py-3 text-sm md:grid-cols-6">
              <span className="font-mono text-xs">{batch.id}</span>
              <span>{batch.status}</span>
              <span>{batch.itemCount} 筆</span>
              <span>{formatTwd(batch.totalAmount)}</span>
              <a className="text-cyan-300" href={`/api/admin/payouts/batches/${batch.id}/export`}>下載 CSV</a>
              <span>{batch.createdAt.toLocaleDateString("zh-TW")}</span>
            </div>
          ))}
        </section>
      </div>
    </AdminShell>
  );
}
