import { AdminShell } from "@/components/AdminShell";
import { SequencesClient } from "@/components/SequencesClient";
import { getSelectedInstagramChannelId, instagramChannelWhere } from "@/lib/account-scope";
import { requireUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { getCurrentWorkspaceId } from "@/lib/workspaces";

export default async function SequencesPage() {
  await requireUser();
  const workspaceId = await getCurrentWorkspaceId();
  const selectedChannelId = await getSelectedInstagramChannelId();
  const channelWhere = instagramChannelWhere(selectedChannelId, workspaceId);
  const [sequences, contacts] = await Promise.all([
    getDb().sequence.findMany({
      where: { workspaceId },
      orderBy: { updatedAt: "desc" },
      include: {
        steps: { orderBy: { order: "asc" } },
        subscriptions: { where: { active: true }, select: { id: true } },
      },
    }),
    getDb().contact.findMany({
      where: channelWhere,
      orderBy: { updatedAt: "desc" },
      take: 200,
      select: { id: true, displayName: true, externalId: true },
    }),
  ]);

  return (
    <AdminShell title="序列">
      <SequencesClient
        initialSequences={JSON.parse(
          JSON.stringify(
            sequences.map((sequence) => ({
              ...sequence,
              activeSubscriptionCount: sequence.subscriptions.length,
            })),
          ),
        )}
        contacts={JSON.parse(JSON.stringify(contacts))}
      />
    </AdminShell>
  );
}
