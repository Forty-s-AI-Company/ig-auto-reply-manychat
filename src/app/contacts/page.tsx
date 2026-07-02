import { AdminShell } from "@/components/AdminShell";
import { ContactsListClient } from "@/components/ContactsListClient";
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
  searchParams: Promise<{ q?: string; status?: string; tag?: string }>;
}) {
  await requireUser();
  const params = await searchParams;
  const q = params.q || "";
  const status = ["opted_in", "opted_out", "unknown"].includes(params.status || "") ? params.status || "" : "";
  const tagId = params.tag || "";
  const workspaceId = await getCurrentWorkspaceId();
  const selectedChannelId = await getSelectedInstagramChannelId();
  const channelWhere = instagramChannelWhere(selectedChannelId, workspaceId);
  const contactWhere = {
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
    ...(status ? { consentStatus: status as "opted_in" | "opted_out" | "unknown" } : {}),
    ...(tagId ? { tags: { some: { tagId } } } : {}),
  };
  const [contacts, tags, totalContacts, subscribedCount, unknownCount, workspaceContactCount] = await Promise.all([
    getDb().contact.findMany({
      where: contactWhere,
      orderBy: [{ lastInboundAt: "desc" }, { updatedAt: "desc" }],
      take: 100,
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
    getDb().contact.count({ where: { channel: { workspaceId } } }),
  ]);

  return (
    <AdminShell title="聯絡人">
      <ContactsListClient
        contacts={contacts.map((contact) => ({
          id: contact.id,
          displayName: contact.displayName,
          username: contact.username,
          externalId: contact.externalId,
          channelName: contact.channel.name,
          consentStatus: contact.consentStatus,
          consentLabel: consentLabel(contact.consentStatus),
          tags: contact.tags.map(({ tag }) => ({ id: tag.id, name: tag.name, color: tag.color })),
          conversationsCount: contact._count.conversations,
          lastInteractionLabel: formatDate(contact.lastInboundAt || contact.lastOutboundAt),
        }))}
        tags={tags.map((tag) => ({ id: tag.id, name: tag.name, color: tag.color }))}
        totalContacts={totalContacts}
        subscribedCount={subscribedCount}
        unknownCount={unknownCount}
        filteredContactCount={contacts.length}
        workspaceContactCount={workspaceContactCount}
        isChannelScoped={Boolean(selectedChannelId)}
        q={q}
        status={status}
        tagId={tagId}
      />
    </AdminShell>
  );
}
