import { Settings } from "lucide-react";
import { AdminShell } from "@/components/AdminShell";
import { InboxHeaderSearch } from "@/components/InboxHeaderSearch";
import { InboxClient } from "@/components/InboxClient";
import { getSelectedInstagramChannelId, instagramChannelWhere } from "@/lib/account-scope";
import { requireUser } from "@/lib/auth";
import { publicChannelSelect } from "@/lib/channels/public";
import { getDb } from "@/lib/db";
import { getCurrentWorkspaceId } from "@/lib/workspaces";

export default async function InboxPage() {
  const user = await requireUser();
  const workspaceId = await getCurrentWorkspaceId();
  const selectedChannelId = await getSelectedInstagramChannelId();
  const channelWhere = instagramChannelWhere(selectedChannelId, workspaceId);

  await Promise.all([
    getDb().tag.upsert({
      where: { workspaceId_name: { workspaceId, name: "熱門名單" } },
      update: {},
      create: { workspaceId, name: "熱門名單", color: "#f97316" },
    }),
    getDb().tag.upsert({
      where: { workspaceId_name: { workspaceId, name: "合作夥伴" } },
      update: {},
      create: { workspaceId, name: "合作夥伴", color: "#eab308" },
    }),
  ]);

  const [conversations, tags, teamMembers, contactFields] = await Promise.all([
    getDb().conversation.findMany({
      where: channelWhere,
      orderBy: [{ lastMessageAt: "desc" }, { updatedAt: "desc" }],
      include: {
        contact: {
          include: {
            tags: { include: { tag: true } },
            fieldValues: { include: { definition: true } },
          },
        },
        channel: { select: publicChannelSelect },
        assignedTo: { select: { id: true, name: true, email: true } },
        messages: { orderBy: { createdAt: "asc" } },
      },
    }),
    getDb().tag.findMany({ where: { workspaceId }, orderBy: { name: "asc" } }),
    getDb().workspaceUser.findMany({
      where: { workspaceId },
      orderBy: { createdAt: "asc" },
      include: { user: { select: { id: true, name: true, email: true } } },
    }),
    getDb().contactFieldDefinition.findMany({
      where: { workspaceId },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  return (
    <AdminShell title="收件匣" headerCenter={<InboxHeaderSearch />} headerRight={<Settings className="h-5 w-5 text-[#667085]" />}>
      <InboxClient
        initialConversations={JSON.parse(JSON.stringify(conversations))}
        tags={JSON.parse(JSON.stringify(tags))}
        teamMembers={JSON.parse(JSON.stringify(teamMembers.map((member) => member.user)))}
        contactFields={JSON.parse(JSON.stringify(contactFields))}
        currentUserId={user.id}
      />
    </AdminShell>
  );
}
