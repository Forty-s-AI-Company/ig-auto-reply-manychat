import { AdminShell } from "@/components/AdminShell";
import { JsonCrudClient } from "@/components/JsonCrudClient";
import { requireUser } from "@/lib/auth";
import { getDb } from "@/lib/db";

export default async function KnowledgeBasePage() {
  await requireUser();
  const items = await getDb().knowledgeBaseItem.findMany({ orderBy: { updatedAt: "desc" } });
  return (
    <AdminShell>
      <JsonCrudClient
        title="Knowledge Base"
        description="AI FAQ 會用這裡的資料做簡單檢索；沒有 OpenAI key 時也會回 fallback。"
        endpoint="/api/knowledge-base"
        initialItems={JSON.parse(JSON.stringify(items))}
        createTemplate={{ title: "常見問題", content: "這裡放回答內容", enabled: true }}
      />
    </AdminShell>
  );
}
