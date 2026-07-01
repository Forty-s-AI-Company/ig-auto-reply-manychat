import Link from "next/link";
import { AdminShell } from "@/components/AdminShell";
import { requireUser } from "@/lib/auth";
import { formatTwd } from "@/lib/billing";
import { getDb } from "@/lib/db";

export default async function AdminPayoutsPage() {
  const user = await requireUser();
  if (user.role !== "admin") return <AdminShell title="管理後台"><p>僅管理員可查看。</p></AdminShell>;
  const requests = await getDb().payoutRequest.findMany({
    orderBy: { requestedAt: "desc" },
    include: { affiliate: { select: { email: true, name: true } } },
  });

  return (
    <AdminShell title="提領管理" headerRight={<Link className="rounded-md bg-cyan-500 px-3 py-2 text-sm font-bold text-zinc-950" href="/admin/payouts/batches">批次</Link>}>
      <section className="rounded-lg border border-zinc-800 bg-zinc-900">
        <div className="border-b border-zinc-800 px-4 py-3 font-medium">提領申請</div>
        {requests.map((request) => (
          <div key={request.id} className="grid gap-2 border-b border-zinc-800 px-4 py-3 text-sm md:grid-cols-5">
            <span>{request.affiliate.name}</span>
            <span>{request.affiliate.email}</span>
            <span>{formatTwd(request.amount)}</span>
            <span>{request.status}</span>
            <span>{request.requestedAt.toLocaleDateString("zh-TW")}</span>
          </div>
        ))}
      </section>
    </AdminShell>
  );
}
