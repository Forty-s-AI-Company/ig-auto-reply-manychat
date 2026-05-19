import { AdminShell } from "@/components/AdminShell";
import { JsonCrudClient } from "@/components/JsonCrudClient";
import { requireUser } from "@/lib/auth";
import { getDb } from "@/lib/db";

export default async function TagsPage() {
  await requireUser();
  const tags = await getDb().tag.findMany({ orderBy: { name: "asc" } });
  return (
    <AdminShell>
      <JsonCrudClient
        title="Tags"
        description="建立、編輯、刪除聯絡人標籤。"
        endpoint="/api/tags"
        initialItems={JSON.parse(JSON.stringify(tags))}
        createTemplate={{ name: "new-tag", color: "#2563eb" }}
      />
    </AdminShell>
  );
}
