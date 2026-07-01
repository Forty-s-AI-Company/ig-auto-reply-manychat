import { AdminShell } from "@/components/AdminShell";
import { requireUser } from "@/lib/auth";
import { getDb } from "@/lib/db";

function formatAffiliateStatus(status: string) {
  const labels: Record<string, string> = {
    pending: "待審核",
    approved: "已核准",
    rejected: "已退回",
    suspended: "已停權",
  };

  return labels[status] ?? status;
}

function formatAffiliateLevel(level: string) {
  const labels: Record<string, string> = {
    starter: "Starter",
    creator: "Creator",
    pro: "Pro",
    business: "Business",
  };

  return labels[level] ?? level;
}

function statusClass(status: string) {
  if (status === "approved") return "bg-green-50 text-green-700";
  if (status === "rejected" || status === "suspended") return "bg-red-50 text-red-700";
  return "bg-amber-50 text-amber-800";
}

export default async function AdminAffiliatesPage() {
  const user = await requireUser();
  if (user.role !== "admin") {
    return (
      <AdminShell title="管理後台">
        <p>僅管理員可查看。</p>
      </AdminShell>
    );
  }

  const affiliates = await getDb().affiliateProfile.findMany({
    orderBy: { updatedAt: "desc" },
    include: { user: { select: { email: true, name: true } } },
  });

  return (
    <AdminShell title="聯盟夥伴管理">
      <section className="ip-dashboard-card overflow-hidden">
        <div className="border-b border-[var(--border-soft)] px-4 py-4">
          <h2 className="text-base font-semibold text-[var(--text-primary)]">聯盟申請</h2>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">管理創作者分潤資格、等級與銀行資料狀態。</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[920px] text-left text-sm">
            <thead className="border-b border-[var(--border-soft)] bg-[var(--ip-surface-muted)] text-[var(--text-secondary)]">
              <tr>
                <th className="px-4 py-3 font-medium">名稱</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">狀態</th>
                <th className="px-4 py-3 font-medium">等級</th>
                <th className="px-4 py-3 font-medium">銀行資料</th>
                <th className="px-4 py-3 font-medium">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-soft)]">
              {affiliates.map((profile) => (
                <tr key={profile.id} className="align-top">
                  <td className="px-4 py-3 font-medium text-[var(--text-primary)]">{profile.user.name || "未命名夥伴"}</td>
                  <td className="px-4 py-3 text-[var(--text-secondary)]">{profile.user.email}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass(profile.status)}`}>
                      {formatAffiliateStatus(profile.status)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[var(--text-secondary)]">{formatAffiliateLevel(profile.level)}</td>
                  <td className="px-4 py-3 text-[var(--text-secondary)]">
                    {profile.bankAccountLast4 ? `已填寫（末四碼 ${profile.bankAccountLast4}）` : "尚未填寫銀行資料"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <form action={`/api/admin/affiliates/${profile.id}/approve`} method="post">
                        <button
                          type="submit"
                          className="rounded-md border border-green-200 bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-700 transition hover:bg-green-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2"
                        >
                          核准
                        </button>
                      </form>
                      <form action={`/api/admin/affiliates/${profile.id}/reject`} method="post">
                        <button
                          type="submit"
                          className="rounded-md border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
                        >
                          退回
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
              {affiliates.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-[var(--text-secondary)]">
                    目前沒有聯盟申請。
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </AdminShell>
  );
}
