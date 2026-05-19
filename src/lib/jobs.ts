import { filterBroadcastRecipients } from "@/lib/compliance";
import { continueAutomationRun } from "@/lib/automation/engine";
import { getDb } from "@/lib/db";
import { findOrCreateOpenConversation, sendOutboundMessage } from "@/lib/messages";

function asRecord(value: unknown) {
  return (value || {}) as Record<string, unknown>;
}

export async function queueBroadcast(broadcastId: string) {
  const db = getDb();
  const broadcast = await db.broadcast.findUnique({ where: { id: broadcastId } });
  if (!broadcast) throw new Error("Broadcast not found.");

  const target = asRecord(broadcast.targetConfigJson);
  const tagId = String(target.tagId || "");
  if (!tagId) throw new Error("Broadcast target tag is required.");

  const contacts = await db.contact.findMany({
    include: { tags: true, channel: true },
  });
  const recipients = filterBroadcastRecipients(contacts, tagId);

  await db.broadcast.update({
    where: { id: broadcastId },
    data: { status: "queued", sentCount: 0, failedCount: 0 },
  });

  const runAt = broadcast.scheduledAt || new Date();
  for (const contact of recipients) {
    await db.job.create({
      data: {
        type: "broadcast_send",
        status: "queued",
        runAt,
        payloadJson: { broadcastId, contactId: contact.id },
      },
    });
  }

  return recipients.length;
}

export async function processJob(jobId: string) {
  const db = getDb();
  const job = await db.job.findUnique({ where: { id: jobId } });
  if (!job || job.status !== "queued") return;

  await db.job.update({
    where: { id: job.id },
    data: { status: "running", attempts: { increment: 1 } },
  });

  try {
    const payload = asRecord(job.payloadJson);

    if (job.type === "broadcast_send") {
      const broadcastId = String(payload.broadcastId || "");
      const contactId = String(payload.contactId || "");
      const [broadcast, contact] = await Promise.all([
        db.broadcast.findUnique({ where: { id: broadcastId } }),
        db.contact.findUnique({ where: { id: contactId }, include: { channel: true } }),
      ]);

      if (!broadcast || !contact) throw new Error("Broadcast or contact not found.");
      if (contact.consentStatus !== "opted_in") throw new Error("Contact is not opted in.");
      if (!contact.channel.enabled) throw new Error("Channel is disabled.");

      const text = String(asRecord(broadcast.messageJson).text || "");
      const conversation = await findOrCreateOpenConversation(contact.id, contact.channelId);
      await sendOutboundMessage(conversation.id, text);

      await db.broadcast.update({
        where: { id: broadcast.id },
        data: { status: "sending", sentCount: { increment: 1 } },
      });
    }

    if (job.type === "automation_continue") {
      await continueAutomationRun(String(payload.runId || ""));
    }

    await db.job.update({
      where: { id: job.id },
      data: { status: "completed", lastError: null },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown job error";
    await db.job.update({
      where: { id: job.id },
      data: { status: job.attempts + 1 >= 3 ? "failed" : "queued", lastError: message },
    });

    const payload = asRecord(job.payloadJson);
    if (job.type === "broadcast_send" && payload.broadcastId) {
      await db.broadcast.update({
        where: { id: String(payload.broadcastId) },
        data: { failedCount: { increment: 1 } },
      });
    }
  }
}

export async function processDueJobs(limit = 10) {
  const db = getDb();
  const jobs = await db.job.findMany({
    where: { status: "queued", runAt: { lte: new Date() } },
    orderBy: { runAt: "asc" },
    take: limit,
  });

  for (const job of jobs) {
    await processJob(job.id);
  }

  await markFinishedBroadcasts();
  return jobs.length;
}

export async function markFinishedBroadcasts() {
  const db = getDb();
  const broadcasts = await db.broadcast.findMany({
    where: { status: { in: ["queued", "sending"] } },
  });

  for (const broadcast of broadcasts) {
    const jobs = await db.job.findMany({
      where: {
        type: "broadcast_send",
        status: { in: ["queued", "running"] },
      },
      select: { payloadJson: true },
    });
    const pending = jobs.filter(
      (job) => asRecord(job.payloadJson).broadcastId === broadcast.id,
    ).length;

    if (pending === 0) {
      await db.broadcast.update({
        where: { id: broadcast.id },
        data: { status: broadcast.failedCount > 0 ? "failed" : "sent" },
      });
    }
  }
}
