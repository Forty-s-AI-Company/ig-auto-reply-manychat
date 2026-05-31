import { AdminShell } from "@/components/AdminShell";
import { BroadcastsClient } from "@/components/BroadcastsClient";
import { requireUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { getCurrentWorkspaceId } from "@/lib/workspaces";

export default async function BroadcastsPage() {
  await requireUser();
  const workspaceId = await getCurrentWorkspaceId();
  const [broadcasts, tags, segments] = await Promise.all([
    getDb().broadcast.findMany({ where: { workspaceId }, orderBy: { updatedAt: "desc" } }),
    getDb().tag.findMany({ where: { workspaceId }, orderBy: { name: "asc" } }),
    getDb().segment.findMany({ where: { workspaceId }, orderBy: { name: "asc" } }),
  ]);

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
