import { AdminShell } from "@/components/AdminShell";
import { AutomationBuilderClient } from "@/components/AutomationBuilderClient";
import { getSelectedInstagramChannelId } from "@/lib/account-scope";
import { requireUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { isSimpleRelease } from "@/lib/release-mode";
import { getCurrentWorkspaceId } from "@/lib/workspaces";

export default async function AutomationsPage() {
  await requireUser();
  const workspaceId = await getCurrentWorkspaceId();
  const selectedChannelId = await getSelectedInstagramChannelId();
  const simpleRelease = await isSimpleRelease();
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
  const selectedChannel = selectedChannelId
    ? await getDb().channel.findFirst({
        where: { id: selectedChannelId, workspaceId, type: "instagram", enabled: true },
        select: { name: true },
      })
    : null;

  return (
    <AdminShell title="自動化">
      <AutomationBuilderClient
        initialItems={JSON.parse(JSON.stringify(automations))}
        initialFolders={JSON.parse(JSON.stringify(folders))}
        isSimpleRelease={simpleRelease}
        selectedChannelName={selectedChannel?.name || null}
      />
    </AdminShell>
  );
}
