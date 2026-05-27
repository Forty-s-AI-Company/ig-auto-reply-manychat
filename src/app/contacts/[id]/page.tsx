import { notFound } from "next/navigation";
import { AdminShell } from "@/components/AdminShell";
import { getSelectedInstagramChannelId, instagramChannelWhere } from "@/lib/account-scope";
import { requireUser } from "@/lib/auth";
import { publicChannelSelect } from "@/lib/channels/public";
import { getDb } from "@/lib/db";
import { getCurrentWorkspaceId } from "@/lib/workspaces";

function consentLabel(status: string) {
  return { opted_in: "已同意", opted_out: "已取消", unknown: "未知" }[status] || status;
}

function statusLabel(status: string) {
  return { open: "開啟", pending: "待處理", closed: "已結案" }[status] || status;
}

function directionLabel(direction: string) {
  return { inbound: "客戶", outbound: "我們" }[direction] || direction;
}

export default async function ContactDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireUser();
  const { id } = await params;
  const workspaceId = await getCurrentWorkspaceId();
  const selectedChannelId = await getSelectedInstagramChannelId();
  const channelWhere = instagramChannelWhere(selectedChannelId, workspaceId);
  const contact = await getDb().contact.findFirst({
    where: { id, ...channelWhere },
    include: {
      channel: { select: publicChannelSelect },
      tags: { include: { tag: true } },
      conversations: {
        orderBy: { updatedAt: "desc" },
        include: { messages: { orderBy: { createdAt: "asc" } } },
      },
    },
  });
  if (!contact) notFound();

  return (
    <AdminShell title="Contact">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold">{contact.displayName}</h2>
          <p className="text-sm text-zinc-400">
            {contact.channel.name} / {contact.externalId} / {consentLabel(contact.consentStatus)}
          </p>
        </div>
        <section className="rounded-lg border border-zinc-800 bg-zinc-900 p-4 text-sm">
          <p>使用者名稱：{contact.username || "-"}</p>
          <p>Email：{contact.email || "-"}</p>
          <p>電話：{contact.phone || "-"}</p>
          <p>標籤：{contact.tags.map(({ tag }) => tag.name).join(", ") || "-"}</p>
        </section>
        {contact.conversations.map((conversation) => (
          <section key={conversation.id} className="rounded-lg border border-zinc-800 bg-zinc-900">
            <div className="border-b border-zinc-800 px-4 py-3 text-sm font-medium">
              對話 / {statusLabel(conversation.status)}
            </div>
            <div className="space-y-2 p-4">
              {conversation.messages.map((message) => (
                <div key={message.id} className="text-sm">
                  <span className="text-zinc-500">{directionLabel(message.direction)}</span>{" "}
                  {message.text}
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </AdminShell>
  );
}
