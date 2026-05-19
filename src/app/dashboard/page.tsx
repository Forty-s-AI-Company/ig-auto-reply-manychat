import { AdminShell } from "@/components/AdminShell";
import { requireUser } from "@/lib/auth";
import { getDb } from "@/lib/db";

export default async function DashboardPage() {
  await requireUser();
  const db = getDb();
  const [contacts, messages, openConversations, automations, recentMessages] =
    await Promise.all([
      db.contact.count(),
      db.message.count(),
      db.conversation.count({ where: { status: "open" } }),
      db.automation.count(),
      db.message.findMany({
        orderBy: { createdAt: "desc" },
        take: 8,
        include: { contact: true, channel: true },
      }),
    ]);

  return (
    <AdminShell>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold">Dashboard</h2>
          <p className="text-sm text-zinc-400">目前系統概況與最近訊息。</p>
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          {[
            ["Contacts", contacts],
            ["Messages", messages],
            ["Open Conversations", openConversations],
            ["Automations", automations],
          ].map(([label, value]) => (
            <div key={label} className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
              <p className="text-sm text-zinc-400">{label}</p>
              <p className="mt-2 text-3xl font-semibold">{value}</p>
            </div>
          ))}
        </div>
        <section className="rounded-lg border border-zinc-800 bg-zinc-900">
          <div className="border-b border-zinc-800 px-4 py-3 font-medium">最近訊息</div>
          <div className="divide-y divide-zinc-800">
            {recentMessages.map((message) => (
              <div key={message.id} className="px-4 py-3 text-sm">
                <div className="flex justify-between gap-4">
                  <span className="text-zinc-300">
                    {message.contact.displayName} · {message.channel.type} · {message.direction}
                  </span>
                  <span className="text-zinc-500">{message.createdAt.toLocaleString("zh-TW")}</span>
                </div>
                <p className="mt-1 text-zinc-100">{message.text}</p>
              </div>
            ))}
            {recentMessages.length === 0 ? (
              <p className="px-4 py-6 text-sm text-zinc-500">還沒有訊息，先到 Mock Tester 打一則試試。</p>
            ) : null}
          </div>
        </section>
      </div>
    </AdminShell>
  );
}
