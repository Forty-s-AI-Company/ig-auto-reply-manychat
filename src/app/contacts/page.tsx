import Link from "next/link";
import { Filter, Plus, Search, Tags, Users } from "lucide-react";
import { AdminShell } from "@/components/AdminShell";
import { getSelectedInstagramChannelId, instagramChannelWhere } from "@/lib/account-scope";
import { requireUser } from "@/lib/auth";
import { publicChannelSelect } from "@/lib/channels/public";
import { getDb } from "@/lib/db";
import { getCurrentWorkspaceId } from "@/lib/workspaces";

function consentLabel(status: string) {
  return { opted_in: "已訂閱", opted_out: "已取消訂閱", unknown: "未知" }[status] || status;
}

function formatDate(value?: Date | null) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("zh-TW", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(value);
}

export default async function ContactsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  await requireUser();
  const q = (await searchParams).q || "";
  const workspaceId = await getCurrentWorkspaceId();
  const selectedChannelId = await getSelectedInstagramChannelId();
  const channelWhere = instagramChannelWhere(selectedChannelId, workspaceId);
  const [contacts, tags, totalContacts, subscribedCount, unknownCount] = await Promise.all([
    getDb().contact.findMany({
      where: {
        ...channelWhere,
        ...(q
          ? {
              OR: [
                { displayName: { contains: q } },
                { username: { contains: q } },
                { email: { contains: q } },
              ],
            }
          : {}),
      },
      orderBy: [{ lastInboundAt: "desc" }, { updatedAt: "desc" }],
      include: {
        channel: { select: publicChannelSelect },
        tags: { include: { tag: true } },
        _count: { select: { conversations: true } },
      },
    }),
    getDb().tag.findMany({ where: { workspaceId }, orderBy: { name: "asc" } }),
    getDb().contact.count({ where: channelWhere }),
    getDb().contact.count({ where: { ...channelWhere, consentStatus: "opted_in" } }),
    getDb().contact.count({ where: { ...channelWhere, consentStatus: "unknown" } }),
  ]);

  return (
    <AdminShell title="聯絡人">
      <div className="flex h-[calc(100vh-100px)] min-h-0 overflow-hidden rounded-lg border border-[#d7dbe0] bg-white">
        <aside className="hidden w-[260px] shrink-0 border-r border-[#d7dbe0] bg-[#f7f7f7] lg:block">
          <div className="space-y-1 p-3 text-sm">
            <ContactNavItem active icon={<Users className="h-4 w-4" />} label="全部聯絡人" count={totalContacts} />
            <ContactNavItem icon={<Users className="h-4 w-4" />} label="已訂閱" count={subscribedCount} />
            <ContactNavItem icon={<Users className="h-4 w-4" />} label="未知狀態" count={unknownCount} />
          </div>
          <div className="border-t border-[#e4e7ec] px-3 py-4">
            <div className="mb-2 flex items-center justify-between text-xs font-medium text-[#667085]">
              <span>標籤</span>
              <Plus className="h-4 w-4" />
            </div>
            <div className="space-y-1">
              {tags.map((tag) => (
                <ContactNavItem key={tag.id} icon={<Tags className="h-4 w-4" />} label={tag.name} />
              ))}
              {tags.length === 0 ? <p className="px-3 py-2 text-sm text-[#98a2b3]">尚未建立標籤</p> : null}
            </div>
          </div>
        </aside>

        <section className="flex min-w-0 flex-1 flex-col">
          <header className="flex h-14 shrink-0 items-center justify-between gap-3 border-b border-[#d7dbe0] px-5">
            <form className="relative w-full max-w-xl">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#98a2b3]" />
              <input
                name="q"
                defaultValue={q}
                placeholder="搜尋姓名、Instagram username、email"
                className="h-9 w-full rounded-md border border-[#d7dbe0] bg-white pl-9 pr-3 text-sm outline-none focus:border-[#006fe6] focus:ring-2 focus:ring-[#dbeafe]"
              />
            </form>
            <div className="flex shrink-0 items-center gap-2">
              <button className="inline-flex h-9 items-center gap-2 rounded-md border border-[#d7dbe0] bg-white px-3 text-sm text-[#344054] hover:bg-[#f8fafc]">
                <Filter className="h-4 w-4" />
                篩選
              </button>
              <Link href="/tags" className="inline-flex h-9 items-center gap-2 rounded-md bg-[#006fe6] px-3 text-sm font-medium text-white hover:bg-[#0057b8]">
                <Plus className="h-4 w-4" />
                新增標籤
              </Link>
            </div>
          </header>

          <div className="min-h-0 flex-1 overflow-auto">
            <table className="w-full text-left text-sm">
              <thead className="sticky top-0 z-10 border-b border-[#d7dbe0] bg-[#f8fafc] text-[#667085]">
                <tr>
                  <th className="w-10 px-4 py-3">
                    <input type="checkbox" aria-label="選取全部聯絡人" />
                  </th>
                  <th className="px-4 py-3">聯絡人</th>
                  <th className="px-4 py-3">渠道</th>
                  <th className="px-4 py-3">訂閱狀態</th>
                  <th className="px-4 py-3">標籤</th>
                  <th className="px-4 py-3">對話</th>
                  <th className="px-4 py-3">最後互動</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#eef0f2] bg-white">
                {contacts.map((contact) => (
                  <tr key={contact.id} className="hover:bg-[#f8fafc]">
                    <td className="px-4 py-4">
                      <input type="checkbox" aria-label={`選取 ${contact.displayName}`} />
                    </td>
                    <td className="px-4 py-4">
                      <Link href={`/contacts/${contact.id}`} className="font-semibold text-[#111827] hover:text-[#006fe6]">
                        {contact.displayName}
                      </Link>
                      <div className="mt-1 text-xs text-[#667085]">
                        {contact.username ? `@${contact.username}` : contact.externalId}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-[#667085]">{contact.channel.name}</td>
                    <td className="px-4 py-4">
                      <span className="rounded-full bg-[#eef6ff] px-2 py-1 text-xs text-[#006fe6]">
                        {consentLabel(contact.consentStatus)}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-wrap gap-1">
                        {contact.tags.map(({ tag }) => (
                          <span key={tag.id} className="rounded-full px-2 py-1 text-xs text-white" style={{ backgroundColor: tag.color }}>
                            {tag.name}
                          </span>
                        ))}
                        {contact.tags.length === 0 ? <span className="text-[#98a2b3]">-</span> : null}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-[#667085]">{contact._count.conversations}</td>
                    <td className="px-4 py-4 text-[#667085]">{formatDate(contact.lastInboundAt || contact.lastOutboundAt)}</td>
                  </tr>
                ))}
                {contacts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-[#667085]">
                      目前沒有符合條件的聯絡人。
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </AdminShell>
  );
}

function ContactNavItem({
  icon,
  label,
  count,
  active = false,
}: {
  icon: React.ReactNode;
  label: string;
  count?: number;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      className={`flex w-full items-center gap-2 rounded-md px-3 py-2 text-left ${
        active ? "bg-[#d7d7d7] font-semibold text-[#111827]" : "text-[#4b5563] hover:bg-[#eceff3]"
      }`}
    >
      <span className="text-[#667085]">{icon}</span>
      <span className="min-w-0 flex-1 truncate">{label}</span>
      {typeof count === "number" ? <span className="text-xs text-[#667085]">{count}</span> : null}
    </button>
  );
}
