import { AdminShell } from "@/components/AdminShell";
import { JsonCrudClient } from "@/components/JsonCrudClient";
import { requireUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { getCurrentWorkspaceId } from "@/lib/workspaces";

export default async function TagsPage() {
  await requireUser();
  const workspaceId = await getCurrentWorkspaceId();
  const tags = await getDb().tag.findMany({ where: { workspaceId }, orderBy: { name: "asc" } });
  return (
    <AdminShell title="Tags">
      <JsonCrudClient
        title="標籤"
        description="建立、編輯、刪除聯絡人標籤。"
        endpoint="/api/tags"
        initialItems={JSON.parse(JSON.stringify(tags))}
        createTemplate={{ name: "new-tag", color: "#2563eb" }}
      />
    </AdminShell>
  );
}
