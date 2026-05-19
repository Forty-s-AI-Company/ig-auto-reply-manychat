import Link from "next/link";
import { AdminShell } from "@/components/AdminShell";
import { requireUser } from "@/lib/auth";
import { getDb } from "@/lib/db";

export default async function ContactsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  await requireUser();
  const q = (await searchParams).q || "";
  const contacts = await getDb().contact.findMany({
    where: q
      ? {
          OR: [
            { displayName: { contains: q } },
            { username: { contains: q } },
            { email: { contains: q } },
          ],
        }
      : undefined,
    orderBy: { updatedAt: "desc" },
    include: { channel: true, tags: { include: { tag: true } }, conversations: true },
  });

  return (
    <AdminShell>
      <div className="space-y-4">
        <div>
          <h2 className="text-2xl font-semibold">Contacts</h2>
          <p className="text-sm text-zinc-400">搜尋與查看聯絡人基本資料。</p>
        </div>
        <form className="flex gap-2">
          <input
            name="q"
            defaultValue={q}
            placeholder="搜尋名稱、username、email"
            className="w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2"
          />
          <button className="rounded-md bg-cyan-500 px-4 py-2 text-zinc-950">搜尋</button>
        </form>
        <div className="overflow-hidden rounded-lg border border-zinc-800">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-900 text-zinc-400">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Channel</th>
                <th className="px-4 py-3">Consent</th>
                <th className="px-4 py-3">Tags</th>
                <th className="px-4 py-3">Last inbound</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800 bg-zinc-950">
              {contacts.map((contact) => (
                <tr key={contact.id}>
                  <td className="px-4 py-3">
                    <Link href={`/contacts/${contact.id}`} className="font-medium text-cyan-300">
                      {contact.displayName}
                    </Link>
                    <div className="text-xs text-zinc-500">{contact.externalId}</div>
                  </td>
                  <td className="px-4 py-3">{contact.channel.type}</td>
                  <td className="px-4 py-3">{contact.consentStatus}</td>
                  <td className="px-4 py-3">
                    {contact.tags.map(({ tag }) => tag.name).join(", ") || "-"}
                  </td>
                  <td className="px-4 py-3">
                    {contact.lastInboundAt?.toLocaleString("zh-TW") || "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminShell>
  );
}
