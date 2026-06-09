import { AdminShell } from "@/components/AdminShell";
import { requireUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { getCurrentWorkspaceId } from "@/lib/workspaces";

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("zh-TW", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(value);
}

function stringifyMetadata(value: unknown) {
  if (!value || typeof value !== "object") return "-";

  try {
    const raw = JSON.stringify(value);
    return raw.length > 140 ? `${raw.slice(0, 140)}...` : raw;
  } catch {
    return "[unserializable]";
  }
}

export default async function AdminAuditPage() {
  const user = await requireUser();
  if (user.role !== "admin") {
    return (
      <AdminShell title="稽核紀錄">
        <div className="rounded-md border border-[var(--border-soft)] bg-white px-4 py-6 text-sm text-[var(--text-secondary)]">
          只有管理員可以查看稽核紀錄。
        </div>
      </AdminShell>
    );
  }

  const workspaceId = await getCurrentWorkspaceId();
  const events = await getDb().auditEvent.findMany({
    where: {
      OR: [
        { workspaceId },
        { workspaceId: null, userId: user.id },
      ],
    },
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
        },
      },
    },
  });

  return (
    <AdminShell title="稽核紀錄">
      <section className="space-y-4">
        <div className="rounded-md border border-[var(--border-soft)] bg-white px-4 py-4">
          <h2 className="text-base font-semibold text-[var(--text-primary)]">最近 100 筆操作</h2>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            目前顯示當前工作區事件，以及你自己的登入與註冊紀錄。
          </p>
        </div>

        <div className="overflow-hidden rounded-md border border-[var(--border-soft)] bg-white">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-left text-sm">
              <thead className="border-b border-[var(--border-soft)] bg-[var(--ip-surface-muted)] text-[var(--text-secondary)]">
                <tr>
                  <th className="px-4 py-3 font-medium">時間</th>
                  <th className="px-4 py-3 font-medium">動作</th>
                  <th className="px-4 py-3 font-medium">操作者</th>
                  <th className="px-4 py-3 font-medium">資源</th>
                  <th className="px-4 py-3 font-medium">結果</th>
                  <th className="px-4 py-3 font-medium">IP</th>
                  <th className="px-4 py-3 font-medium">內容</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-soft)]">
                {events.map((event) => (
                  <tr key={event.id} className="align-top">
                    <td className="px-4 py-3 text-[var(--text-secondary)]">{formatDate(event.createdAt)}</td>
                    <td className="px-4 py-3 font-medium text-[var(--text-primary)]">{event.action}</td>
                    <td className="px-4 py-3 text-[var(--text-secondary)]">
                      {event.user ? `${event.user.name} (${event.user.email})` : "系統 / 未識別"}
                    </td>
                    <td className="px-4 py-3 text-[var(--text-secondary)]">
                      <div>{event.resourceType}</div>
                      <div className="mt-1 text-xs text-[var(--text-muted)]">{event.resourceId || "-"}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                          event.success ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
                        }`}
                      >
                        {event.success ? "成功" : "失敗"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[var(--text-secondary)]">{event.actorIp || "-"}</td>
                    <td className="px-4 py-3 text-xs text-[var(--text-secondary)]">{stringifyMetadata(event.metadataJson)}</td>
                  </tr>
                ))}
                {events.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-[var(--text-secondary)]">
                      目前還沒有稽核紀錄。
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </AdminShell>
  );
}
