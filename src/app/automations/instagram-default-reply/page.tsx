import { AdminShell } from "@/components/AdminShell";
import { InstagramDefaultReplyClient } from "@/components/InstagramDefaultReplyClient";
import { requireUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { getCurrentWorkspaceId } from "@/lib/workspaces";

export default async function InstagramDefaultReplyPage() {
  await requireUser();
  const workspaceId = await getCurrentWorkspaceId();
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

  return (
    <AdminShell title="Instagram Default Reply">
      <InstagramDefaultReplyClient
        initialAutomation={automation ? JSON.parse(JSON.stringify(automation)) : null}
        instagramAccountName={instagramChannel?.name}
      />
    </AdminShell>
  );
}
