import { notFound } from "next/navigation";
import { AdminShell } from "@/components/AdminShell";
import { ContactDetailEditor } from "@/components/ContactDetailEditor";
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
  const [contact, allTags] = await Promise.all([
    getDb().contact.findFirst({
      where: { id, ...channelWhere },
      include: {
        channel: { select: publicChannelSelect },
        tags: { include: { tag: true } },
        conversations: {
          orderBy: { updatedAt: "desc" },
          include: { messages: { orderBy: { createdAt: "asc" } } },
        },
      },
    }),
    getDb().tag.findMany({ where: { workspaceId }, orderBy: { name: "asc" } }),
  ]);
  if (!contact) notFound();

  return (
    <AdminShell title="聯絡人詳情">
      <div className="min-h-[calc(100vh-100px)] space-y-6 rounded-lg border border-[#d7dbe0] bg-[#f8fafc] p-5">
        <ContactDetailEditor
          contact={{
            id: contact.id,
            displayName: contact.displayName,
            externalId: contact.externalId,
            username: contact.username,
            email: contact.email,
            phone: contact.phone,
            consentLabel: consentLabel(contact.consentStatus),
            channelName: contact.channel.name,
            tags: contact.tags.map(({ tag }) => ({
              tag: { id: tag.id, name: tag.name, color: tag.color },
            })),
          }}
          allTags={allTags.map((tag) => ({ id: tag.id, name: tag.name, color: tag.color }))}
        />
        {contact.conversations.map((conversation) => (
          <section key={conversation.id} className="rounded-lg border border-[#d7dbe0] bg-white shadow-sm">
            <div className="border-b border-[#e4e7ec] px-4 py-3 text-sm font-medium text-[#111827]">
              對話 / {statusLabel(conversation.status)}
            </div>
            <div className="space-y-2 p-4">
              {conversation.messages.map((message) => (
                <div key={message.id} className="rounded-md bg-[#f8fafc] px-3 py-2 text-sm text-[#344054]">
                  <span className="font-medium text-[#667085]">{directionLabel(message.direction)}</span>{" "}
                  <span>{message.text}</span>
                </div>
              ))}
              {conversation.messages.length === 0 ? (
                <p className="text-sm text-[#98a2b3]">這個對話目前沒有訊息。</p>
              ) : null}
            </div>
          </section>
        ))}
        {contact.conversations.length === 0 ? (
          <section className="rounded-lg border border-[#d7dbe0] bg-white p-6 text-sm text-[#667085] shadow-sm">
            目前沒有對話紀錄。
          </section>
        ) : null}
      </div>
    </AdminShell>
  );
}
