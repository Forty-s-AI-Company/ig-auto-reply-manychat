import { AdminShell } from "@/components/AdminShell";
import { AutomationScopeBanner } from "@/components/AutomationScopeBanner";
import { InstagramDefaultReplyClient } from "@/components/InstagramDefaultReplyClient";
import { getSelectedInstagramChannelId } from "@/lib/account-scope";
import { getAutomationScopeNotice } from "@/lib/automation-scope-policy";
import { requireUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { getCurrentWorkspaceId } from "@/lib/workspaces";

export default async function InstagramDefaultReplyPage() {
  await requireUser();
  const workspaceId = await getCurrentWorkspaceId();
  const selectedChannelId = await getSelectedInstagramChannelId();
  const db = getDb();
  const [automation, instagramChannel] = await Promise.all([
    db.automation.findFirst({
      where: {
        workspaceId,
        name: "Instagram Default Reply",
      },
      include: {
        steps: { orderBy: { order: "asc" } },
      },
    }),
    db.channel.findFirst({
      where: { workspaceId, type: "instagram", enabled: true },
      orderBy: { updatedAt: "desc" },
      select: { name: true },
    }),
  ]);
  const selectedChannel = selectedChannelId
    ? await db.channel.findFirst({
        where: { id: selectedChannelId, workspaceId, type: "instagram", enabled: true },
        select: { name: true },
      })
    : null;

  return (
    <AdminShell title="Instagram Default Reply">
      <AutomationScopeBanner
        badgeLabel="工作區共用"
        notice={getAutomationScopeNotice(selectedChannel?.name)}
        selectedChannelName={selectedChannel?.name}
        releaseNote="預設回覆"
        testId="automation-scope-notice"
      />
      <InstagramDefaultReplyClient
        initialAutomation={automation ? JSON.parse(JSON.stringify(automation)) : null}
        instagramAccountName={instagramChannel?.name}
      />
    </AdminShell>
  );
}
