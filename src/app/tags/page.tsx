import { AdminShell } from "@/components/AdminShell";
import { TagsManagerClient } from "@/components/TagsManagerClient";
import { requireUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { getCurrentWorkspaceId } from "@/lib/workspaces";

export default async function TagsPage() {
  await requireUser();
  const workspaceId = await getCurrentWorkspaceId();
  const tags = await getDb().tag.findMany({ where: { workspaceId }, orderBy: { name: "asc" } });
  return (
    <AdminShell title="標籤管理">
      <TagsManagerClient initialTags={JSON.parse(JSON.stringify(tags))} />
    </AdminShell>
  );
}
