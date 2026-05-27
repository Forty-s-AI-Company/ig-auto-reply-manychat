import { AdminShell } from "@/components/AdminShell";
import { JsonCrudClient } from "@/components/JsonCrudClient";
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
  const firstSegment = segments[0]?.id;
  const firstTag = tags[0]?.id || "replace-with-tag-id";

  return (
    <AdminShell title="Broadcasts">
      <JsonCrudClient
        title="廣播"
        description="建立廣播並指定標籤或受眾分群，worker 會依同意狀態與條件排程發送。"
        endpoint="/api/broadcasts"
        initialItems={JSON.parse(JSON.stringify(broadcasts))}
        queueBroadcast
        createTemplate={{
          name: "分群廣播",
          targetConfigJson: firstSegment ? { segmentId: firstSegment } : { tagId: firstTag },
          messageJson: { text: "這是一則分群廣播訊息。" },
          scheduledAt: null,
        }}
      />
    </AdminShell>
  );
}
