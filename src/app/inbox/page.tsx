import { AdminShell } from "@/components/AdminShell";
import { InboxClient } from "@/components/InboxClient";
import { requireUser } from "@/lib/auth";
import { getDb } from "@/lib/db";

export default async function InboxPage() {
  await requireUser();
  const [conversations, tags] = await Promise.all([
    getDb().conversation.findMany({
      orderBy: [{ lastMessageAt: "desc" }, { updatedAt: "desc" }],
      include: {
        contact: { include: { tags: { include: { tag: true } } } },
        channel: true,
        messages: { orderBy: { createdAt: "asc" } },
      },
    }),
    getDb().tag.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <AdminShell>
      <div className="mb-4">
        <h2 className="text-2xl font-semibold">Inbox</h2>
        <p className="text-sm text-zinc-400">查看對話、手動回覆、調整狀態與 tag。</p>
      </div>
      <InboxClient
        initialConversations={JSON.parse(JSON.stringify(conversations))}
        tags={JSON.parse(JSON.stringify(tags))}
      />
    </AdminShell>
  );
}
