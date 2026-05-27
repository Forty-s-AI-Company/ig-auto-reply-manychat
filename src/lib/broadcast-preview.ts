import { filterBroadcastRecipients } from "@/lib/compliance";
import { getDb } from "@/lib/db";
import { segmentContactWhere } from "@/lib/segments";

function asRecord(value: unknown) {
  return (value || {}) as Record<string, unknown>;
}

export async function getBroadcastPreview(input: { broadcastId: string; workspaceId: string }) {
  const db = getDb();
  const broadcast = await db.broadcast.findFirst({
    where: { id: input.broadcastId, workspaceId: input.workspaceId },
  });
  if (!broadcast) throw new Error("Broadcast not found.");

  const target = asRecord(broadcast.targetConfigJson);
  const tagId = String(target.tagId || "");
  const segmentId = String(target.segmentId || "");
  if (!tagId && !segmentId) throw new Error("Broadcast target is required.");

  const segment = segmentId
    ? await db.segment.findFirstOrThrow({ where: { id: segmentId, workspaceId: input.workspaceId } })
    : null;

  const contacts = segment
    ? await db.contact.findMany({
        where: segmentContactWhere(input.workspaceId, segment.filterJson),
        include: { tags: true, channel: true },
      })
    : await db.contact.findMany({
        where: { channel: { workspaceId: input.workspaceId } },
        include: { tags: true, channel: true },
      });

  const recipients = segment
    ? contacts.filter((contact) => contact.consentStatus === "opted_in")
    : filterBroadcastRecipients(contacts, tagId);

  return {
    broadcast: {
      id: broadcast.id,
      name: broadcast.name,
      status: broadcast.status,
      scheduledAt: broadcast.scheduledAt?.toISOString() || null,
      messageText: String(asRecord(broadcast.messageJson).text || ""),
    },
    target: { tagId: tagId || null, segmentId: segmentId || null },
    totalCandidates: contacts.length,
    recipientCount: recipients.length,
    skippedCount: contacts.length - recipients.length,
    recipients: recipients.slice(0, 50).map((contact) => ({
      id: contact.id,
      displayName: contact.displayName,
      externalId: contact.externalId,
      consentStatus: contact.consentStatus,
      channel: { id: contact.channel.id, type: contact.channel.type, name: contact.channel.name },
    })),
  };
}
