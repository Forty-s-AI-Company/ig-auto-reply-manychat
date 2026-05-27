import { AdminShell } from "@/components/AdminShell";
import { requireUser } from "@/lib/auth";
import { getDb } from "@/lib/db";

export default async function AdminAffiliatesPage() {
  const user = await requireUser();
  if (user.role !== "admin") return <AdminShell title="Admin"><p>Admin only.</p></AdminShell>;
  const affiliates = await getDb().affiliateProfile.findMany({
    orderBy: { updatedAt: "desc" },
    include: { user: { select: { email: true, name: true } } },
  });

  return (
    <AdminShell title="Admin Affiliates">
      <section className="rounded-lg border border-zinc-800 bg-zinc-900">
        <div className="border-b border-zinc-800 px-4 py-3 font-medium">聯盟申請</div>
        {affiliates.map((profile) => (
          <div key={profile.id} className="grid gap-2 border-b border-zinc-800 px-4 py-3 text-sm md:grid-cols-6">
            <span>{profile.user.name}</span>
            <span>{profile.user.email}</span>
            <span>{profile.status}</span>
            <span>{profile.level}</span>
            <span>{profile.bankAccountLast4 ? `****${profile.bankAccountLast4}` : "未填銀行"}</span>
            <span className="flex gap-2">
              <form action={`/api/admin/affiliates/${profile.id}/approve`} method="post"><button className="text-cyan-300">Approve</button></form>
              <form action={`/api/admin/affiliates/${profile.id}/reject`} method="post"><button className="text-red-300">Reject</button></form>
            </span>
          </div>
        ))}
      </section>
    </AdminShell>
  );
}
