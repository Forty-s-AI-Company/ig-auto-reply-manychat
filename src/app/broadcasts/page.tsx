import { AdminShell } from "@/components/AdminShell";
import { JsonCrudClient } from "@/components/JsonCrudClient";
import { requireUser } from "@/lib/auth";
import { getDb } from "@/lib/db";

export default async function BroadcastsPage() {
  await requireUser();
  const [broadcasts, tags] = await Promise.all([
    getDb().broadcast.findMany({ orderBy: { updatedAt: "desc" } }),
    getDb().tag.findMany({ orderBy: { name: "asc" } }),
  ]);
  const firstTag = tags[0]?.id || "replace-with-tag-id";

  return (
    <AdminShell>
      <JsonCrudClient
        title="Broadcasts"
        description="只會發送給指定 tag 且 opted_in 的 contact；Queue 後由 worker 處理。"
        endpoint="/api/broadcasts"
        initialItems={JSON.parse(JSON.stringify(broadcasts))}
        queueBroadcast
        createTemplate={{
          name: "測試廣播",
          targetConfigJson: { tagId: firstTag },
          messageJson: { text: "這是一則合規測試訊息。" },
          scheduledAt: null,
        }}
      />
    </AdminShell>
  );
}
