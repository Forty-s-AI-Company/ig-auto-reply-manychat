import { continueAutomationRun } from "@/lib/automation/engine";
import { filterBroadcastRecipients } from "@/lib/compliance";
import { getDb } from "@/lib/db";
import { syncInstagramCommentsFromWorker } from "@/lib/instagram/comments-sync";
import { findOrCreateOpenConversation, sendOutboundMessage } from "@/lib/messages";
import { segmentContactWhere } from "@/lib/segments";

function asRecord(value: unknown) {
  return (value || {}) as Record<string, unknown>;
}

async function resolveSegmentContacts(workspaceId: string, segmentId: string) {
  const db = getDb();
  const segment = await db.segment.findFirst({
    where: { id: segmentId, workspaceId },
  });
  if (!segment) throw new Error("找不到這個工作區的分群。");

  return db.contact.findMany({
    where: segmentContactWhere(workspaceId, segment.filterJson),
    include: { tags: true, channel: true },
  });
}

export async function queueBroadcast(broadcastId: string) {
  const db = getDb();
  const broadcast = await db.broadcast.findUnique({ where: { id: broadcastId } });
  if (!broadcast) throw new Error("找不到廣播任務。");

  const target = asRecord(broadcast.targetConfigJson);
  const tagId = String(target.tagId || "");
  const segmentId = String(target.segmentId || "");
  if (!tagId && !segmentId) throw new Error("廣播需要指定標籤或分群。");

  const workspaceId = broadcast.workspaceId || "";
  const contacts = segmentId
    ? await resolveSegmentContacts(workspaceId, segmentId)
    : await db.contact.findMany({
        where: { channel: { workspaceId } },
        include: { tags: true, channel: true },
      });
  const recipients = segmentId
    ? contacts.filter((contact) => contact.consentStatus === "opted_in")
    : filterBroadcastRecipients(contacts, tagId);

  await db.broadcast.update({
    where: { id: broadcastId },
    data: { status: "queued", sentCount: 0, failedCount: 0 },
  });

  const runAt = broadcast.scheduledAt || new Date();
  for (const contact of recipients) {
    await db.job.create({
      data: {
        workspaceId: broadcast.workspaceId,
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
        db.broadcast.findFirst({ where: { id: broadcastId, workspaceId: job.workspaceId } }),
        db.contact.findFirst({
          where: { id: contactId, channel: { workspaceId: job.workspaceId } },
          include: { channel: true },
        }),
      ]);

      if (!broadcast || !contact) throw new Error("找不到廣播任務或聯絡人。");
      if (contact.consentStatus !== "opted_in") throw new Error("聯絡人尚未同意接收廣播。");
      if (!contact.channel.enabled) throw new Error("IG 帳號尚未啟用。");

      const text = String(asRecord(broadcast.messageJson).text || "");
      const conversation = await findOrCreateOpenConversation(contact.id, contact.channelId);
      await sendOutboundMessage(conversation.id, text, { source: "broadcast", eventType: "broadcast_contact_sent" });

      await db.broadcast.update({
        where: { id: broadcast.id },
        data: { status: "sending", sentCount: { increment: 1 } },
      });
    }

    if (job.type === "automation_continue") {
      await continueAutomationRun(String(payload.runId || ""));
    }

    if (job.type === "sequence_send") {
      const subscriptionId = String(payload.subscriptionId || "");
      const subscription = await db.sequenceSubscription.findFirst({
        where: { id: subscriptionId, active: true },
        include: {
          contact: { include: { channel: true } },
          sequence: { include: { steps: { orderBy: { order: "asc" } } } },
        },
      });
      if (!subscription) throw new Error("找不到可執行的序列訂閱。");
      if (subscription.sequence.workspaceId !== job.workspaceId) throw new Error("序列訂閱不屬於這個工作區。");

      const step = subscription.sequence.steps.find((item) => item.order > subscription.currentStep);
      if (!step) {
        await db.sequenceSubscription.update({
          where: { id: subscription.id },
          data: { active: false, nextRunAt: null },
        });
      } else {
        const text = String(asRecord(step.messageJson).text || "");
        if (!text) throw new Error("序列訊息內容不可為空。");
        if (!subscription.contact.channel.enabled) throw new Error("聯絡人的渠道尚未啟用。");

        const conversation = await findOrCreateOpenConversation(
          subscription.contactId,
          subscription.contact.channelId,
        );
        await sendOutboundMessage(conversation.id, text, { source: "automation", eventType: "auto_dm_sent" });

        const nextStep = subscription.sequence.steps.find((item) => item.order > step.order);
        const nextRunAt = nextStep ? new Date(Date.now() + nextStep.delaySeconds * 1000) : null;
        await db.sequenceSubscription.update({
          where: { id: subscription.id },
          data: {
            currentStep: step.order,
            active: Boolean(nextStep),
            nextRunAt,
          },
        });

        if (nextStep && nextRunAt) {
          await db.job.create({
            data: {
              workspaceId: job.workspaceId,
              type: "sequence_send",
              status: "queued",
              runAt: nextRunAt,
              payloadJson: { subscriptionId: subscription.id },
            },
          });
        }
      }
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
  try {
    const commentResults = await syncInstagramCommentsFromWorker();
    const processedComments = commentResults.filter((result) => result.status === "processed").length;
    if (processedComments > 0) {
      console.log(`[worker] synced ${processedComments} Instagram comment(s)`);
    }
  } catch (error) {
    console.error("[worker] Instagram comment sync failed", error);
  }

  const jobs = await db.job.findMany({
    where: { status: "queued", runAt: { lte: new Date() } },
    orderBy: { runAt: "asc" },
    take: limit,
  });

  for (const job of jobs) {
    await processJob(job.id);
  }

  await markFinishedBroadcasts();
  await processDueReminders();
  return jobs.length;
}

export async function processDueReminders(limit = 20) {
  const db = getDb();
  const conversations = await db.conversation.findMany({
    where: { reminderAt: { lte: new Date() } },
    orderBy: { reminderAt: "asc" },
    take: limit,
  });

  for (const conversation of conversations) {
    await db.message.create({
      data: {
        conversationId: conversation.id,
        contactId: conversation.contactId,
        channelId: conversation.channelId,
        direction: "outbound",
        messageType: "system",
        text: "提醒時間到了，請回來追蹤這個對話。",
        payloadJson: { kind: "reminder_due", reminderAt: conversation.reminderAt?.toISOString() || "" },
      },
    });
    await db.conversation.update({
      where: { id: conversation.id },
      data: { reminderAt: null },
    });
  }

  return conversations.length;
}

export async function markFinishedBroadcasts() {
  const db = getDb();
  const broadcasts = await db.broadcast.findMany({
    where: { status: { in: ["queued", "sending"] } },
  });

  for (const broadcast of broadcasts) {
    const jobs = await db.job.findMany({
      where: {
        workspaceId: broadcast.workspaceId,
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
