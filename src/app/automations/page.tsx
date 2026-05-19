import { AdminShell } from "@/components/AdminShell";
import { JsonCrudClient } from "@/components/JsonCrudClient";
import { requireUser } from "@/lib/auth";
import { getDb } from "@/lib/db";

export default async function AutomationsPage() {
  await requireUser();
  const automations = await getDb().automation.findMany({
    orderBy: { updatedAt: "desc" },
    include: { steps: { orderBy: { order: "asc" } } },
  });
  return (
    <AdminShell>
      <JsonCrudClient
        title="Automations"
        description="第一版用 JSON 編輯 keyword trigger 與 steps，先把流程跑通。"
        endpoint="/api/automations"
        updateMethod="PUT"
        initialItems={JSON.parse(JSON.stringify(automations))}
        createTemplate={{
          name: "關鍵字自動回覆",
          enabled: true,
          triggerType: "keyword",
          triggerConfigJson: { keywords: ["hello"], match: "contains" },
          steps: [
            { order: 1, type: "send_message", configJson: { text: "收到，我晚點回你。" } },
          ],
        }}
      />
    </AdminShell>
  );
}
