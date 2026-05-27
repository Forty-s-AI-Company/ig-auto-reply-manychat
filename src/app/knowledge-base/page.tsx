import { AdminShell } from "@/components/AdminShell";
import { JsonCrudClient } from "@/components/JsonCrudClient";
import { requireUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { getCurrentWorkspaceId } from "@/lib/workspaces";

export default async function KnowledgeBasePage() {
  await requireUser();
  const workspaceId = await getCurrentWorkspaceId();
  const items = await getDb().knowledgeBaseItem.findMany({ where: { workspaceId }, orderBy: { updatedAt: "desc" } });
  return (
    <AdminShell title="Knowledge Base">
      <JsonCrudClient
        title="知識庫"
        description="AI FAQ 會優先使用目前工作區的知識庫內容作為回覆參考。"
        endpoint="/api/knowledge-base"
        initialItems={JSON.parse(JSON.stringify(items))}
        createTemplate={{ title: "常見問題", content: "請填入回答內容。", enabled: true }}
      />
    </AdminShell>
  );
}
