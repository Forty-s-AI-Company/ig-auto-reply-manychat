import { AdminShell } from "@/components/AdminShell";
import { BroadcastsClient } from "@/components/BroadcastsClient";
import { requireUser } from "@/lib/auth";
import { getBroadcastsPageData } from "@/lib/inbox-data";
import { getCurrentWorkspaceId } from "@/lib/workspaces";

export default async function BroadcastsPage() {
  await requireUser();
  const workspaceId = await getCurrentWorkspaceId();
  const { broadcasts, tags, segments } = await getBroadcastsPageData(workspaceId);

  return (
    <AdminShell title="廣播活動">
      <BroadcastsClient
        initialBroadcasts={JSON.parse(JSON.stringify(broadcasts))}
        tags={JSON.parse(JSON.stringify(tags))}
        segments={JSON.parse(JSON.stringify(segments))}
      />
    </AdminShell>
  );
}
