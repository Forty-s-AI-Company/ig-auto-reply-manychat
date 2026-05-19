import { AdminShell } from "@/components/AdminShell";
import { requireUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { notFound } from "next/navigation";

export default async function ContactDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireUser();
  const { id } = await params;
  const contact = await getDb().contact.findUnique({
    where: { id },
    include: {
      channel: true,
      tags: { include: { tag: true } },
      conversations: {
        orderBy: { updatedAt: "desc" },
        include: { messages: { orderBy: { createdAt: "asc" } } },
      },
    },
  });
  if (!contact) notFound();

  return (
    <AdminShell>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold">{contact.displayName}</h2>
          <p className="text-sm text-zinc-400">
            {contact.channel.type} · {contact.externalId} · {contact.consentStatus}
          </p>
        </div>
        <section className="rounded-lg border border-zinc-800 bg-zinc-900 p-4 text-sm">
          <p>Username: {contact.username || "-"}</p>
          <p>Email: {contact.email || "-"}</p>
          <p>Phone: {contact.phone || "-"}</p>
          <p>Tags: {contact.tags.map(({ tag }) => tag.name).join(", ") || "-"}</p>
        </section>
        {contact.conversations.map((conversation) => (
          <section key={conversation.id} className="rounded-lg border border-zinc-800 bg-zinc-900">
            <div className="border-b border-zinc-800 px-4 py-3 text-sm font-medium">
              Conversation · {conversation.status}
            </div>
            <div className="space-y-2 p-4">
              {conversation.messages.map((message) => (
                <div key={message.id} className="text-sm">
                  <span className="text-zinc-500">{message.direction}</span> {message.text}
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </AdminShell>
  );
}
