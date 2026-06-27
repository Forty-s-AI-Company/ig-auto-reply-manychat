import { AdminShell } from "@/components/AdminShell";
import { AutomationBuilderClient } from "@/components/AutomationBuilderClient";
import { getSelectedInstagramChannelId } from "@/lib/account-scope";
import { getAutomationScopeNotice } from "@/lib/automation-scope-policy";
import { requireUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { getCurrentWorkspaceId } from "@/lib/workspaces";

export default async function AutomationsPage() {
  await requireUser();
  const workspaceId = await getCurrentWorkspaceId();
  const selectedChannelId = await getSelectedInstagramChannelId();
  const [automations, folders] = await Promise.all([
    getDb().automation.findMany({
      where: { workspaceId },
      orderBy: { updatedAt: "desc" },
      include: {
        folder: { select: { id: true, name: true } },
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
    }),
    getDb().automationFolder.findMany({
      where: { workspaceId },
      orderBy: { updatedAt: "desc" },
      include: { _count: { select: { automations: true } } },
    }),
  ]);

  return (
    <AdminShell title="自動化">
      <div className="mb-4 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900">
        {getAutomationScopeNotice(selectedChannelId)}
      </div>
      <AutomationBuilderClient
        initialItems={JSON.parse(JSON.stringify(automations))}
        initialFolders={JSON.parse(JSON.stringify(folders))}
      />
    </AdminShell>
  );
}
