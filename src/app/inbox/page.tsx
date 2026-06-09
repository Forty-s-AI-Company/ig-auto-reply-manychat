import { Settings } from "lucide-react";
import { AdminShell } from "@/components/AdminShell";
import { InboxHeaderSearch } from "@/components/InboxHeaderSearch";
import { InboxClient } from "@/components/InboxClient";
import { getSelectedInstagramChannelId } from "@/lib/account-scope";
import { requireUser } from "@/lib/auth";
import { ensureInboxDefaultTags, getConversationList, getInboxReferenceData } from "@/lib/inbox-data";
import { getCurrentWorkspaceId } from "@/lib/workspaces";

export default async function InboxPage() {
  const user = await requireUser();
  const workspaceId = await getCurrentWorkspaceId();
  const selectedChannelId = await getSelectedInstagramChannelId();

  await ensureInboxDefaultTags(workspaceId);

  const [conversations, referenceData] = await Promise.all([
    getConversationList({ workspaceId, selectedChannelId }),
    getInboxReferenceData(workspaceId),
  ]);
  const { tags, teamMembers, contactFields } = referenceData;

  return (
    <AdminShell title="收件匣" headerCenter={<InboxHeaderSearch />} headerRight={<Settings className="h-5 w-5 text-[#667085]" />}>
      <InboxClient
        initialConversations={JSON.parse(JSON.stringify(conversations.map((conversation) => ({
          ...conversation,
          messages: [...conversation.messages].reverse(),
        }))))}
        tags={JSON.parse(JSON.stringify(tags))}
        teamMembers={JSON.parse(JSON.stringify(teamMembers.map((member) => member.user)))}
        contactFields={JSON.parse(JSON.stringify(contactFields))}
        currentUserId={user.id}
      />
    </AdminShell>
  );
}
