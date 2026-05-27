import { AdminShell } from "@/components/AdminShell";
import { AutomationBuilderClient } from "@/components/AutomationBuilderClient";
import { requireUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { getCurrentWorkspaceId } from "@/lib/workspaces";

export default async function AutomationsPage() {
  await requireUser();
  const workspaceId = await getCurrentWorkspaceId();
  const automations = await getDb().automation.findMany({
    where: { workspaceId },
    orderBy: { updatedAt: "desc" },
    include: {
      steps: { orderBy: { order: "asc" } },
      runs: {
        orderBy: { createdAt: "desc" },
        take: 10,
        include: {
          contact: { select: { id: true, displayName: true, username: true } },
          conversation: { select: { id: true, status: true } },
        },
      },
    },
  });

  return (
    <AdminShell title="自動化">
      <AutomationBuilderClient initialItems={JSON.parse(JSON.stringify(automations))} />
    </AdminShell>
  );
}
