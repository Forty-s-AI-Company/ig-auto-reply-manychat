import { continueAutomationRun } from "@/lib/automation/engine";
import { runKeywordAutomations, runNewContactAutomations, runWebhookAutomations } from "@/lib/automation/triggers";
import { getDb } from "@/lib/db";
import { syncInstagramCommentsFromWorker } from "@/lib/instagram/comments-sync";
import { findOrCreateOpenConversation, sendOutboundMessage } from "@/lib/messages";
import { enqueueJob, enqueueJobs, mirrorJobToExternalQueue } from "@/lib/queue";
import { segmentContactWhere } from "@/lib/segments";

function asRecord(value: unknown) {
  return (value || {}) as Record<string, unknown>;
}

async function getBroadcastRecipientPage(input: {
  workspaceId: string;
  tagId: string;
  segmentId: string;
  cursor?: string;
  take: number;
}) {
  const db = getDb();
  const segment = input.segmentId
    ? await db.segment.findFirst({
        where: { id: input.segmentId, workspaceId: input.workspaceId },
        select: { filterJson: true },
      })
    : null;
  if (input.segmentId && !segment) throw new Error("找不到這個工作區的分群。");

  const where = segment
    ? segmentContactWhere(input.workspaceId, segment.filterJson)
    : {
        channel: { workspaceId: input.workspaceId },
        consentStatus: "opted_in" as const,
        tags: { some: { tagId: input.tagId } },
      };

  return db.contact.findMany({
    where: {
      ...where,
      ...(input.segmentId ? { consentStatus: "opted_in" as const } : {}),
    },
    orderBy: { id: "asc" },
    ...(input.cursor ? { cursor: { id: input.cursor }, skip: 1 } : {}),
    take: input.take,
    select: { id: true },
  });
}

export async function queueBroadcast(broadcastId: string) {
  const db = getDb();
  const broadcast = await db.broadcast.findUnique({ where: { id: broadcastId } });
  if (!broadcast) throw new Error("找不到廣播任務。");
  if (broadcast.status === "queued" || broadcast.status === "sending") {
    return db.job.count({
      where: { workspaceId: broadcast.workspaceId, type: { in: ["broadcast_expand", "broadcast_send"] }, status: "queued", payloadJson: { path: ["broadcastId"], equals: broadcastId } },
    });
  }
  if (!broadcast.workspaceId) throw new Error("廣播缺少工作區，無法排程。");

  const target = asRecord(broadcast.targetConfigJson);
  const tagId = String(target.tagId || "");
  const segmentId = String(target.segmentId || "");
  if (!tagId && !segmentId) throw new Error("廣播需要指定標籤或分群。");

  const runAt = broadcast.scheduledAt || new Date();
  let queuedJob: { id: string; type: string; runAt: Date } | null = null;
  await db.$transaction(async (tx) => {
    await tx.job.deleteMany({
      where: { workspaceId: broadcast.workspaceId, type: { in: ["broadcast_expand", "broadcast_send"] }, status: "queued", payloadJson: { path: ["broadcastId"], equals: broadcastId } },
    });
    await tx.broadcast.update({
      where: { id: broadcastId },
      data: { status: "queued", sentCount: 0, failedCount: 0 },
    });
    queuedJob = await tx.job.create({
      data: {
        workspaceId: broadcast.workspaceId,
        type: "broadcast_expand",
        status: "queued",
        runAt,
        payloadJson: { broadcastId, tagId, segmentId, cursor: null, batchSize: 250 },
      },
    });
  });
  if (queuedJob) {
    await mirrorJobToExternalQueue(queuedJob);
  }

  return 1;
}

export async function processJob(jobId: string) {
  const db = getDb();
  const claimed = await db.job.updateMany({
    where: { id: jobId, status: "queued" },
    data: { status: "running", lockedAt: new Date(), attempts: { increment: 1 } },
  });
  if (claimed.count !== 1) return;

  const job = await db.job.findUnique({ where: { id: jobId } });
  if (!job) return;

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

    if (job.type === "broadcast_expand") {
      const broadcastId = String(payload.broadcastId || "");
      const tagId = String(payload.tagId || "");
      const segmentId = String(payload.segmentId || "");
      const cursor = typeof payload.cursor === "string" ? payload.cursor : undefined;
      const batchSize = Math.min(Math.max(Number(payload.batchSize || 250), 50), 500);
      const recipients = await getBroadcastRecipientPage({
        workspaceId: job.workspaceId,
        tagId,
        segmentId,
        cursor,
        take: batchSize + 1,
      });
      const batch = recipients.slice(0, batchSize);
      const nextCursor = recipients.length > batchSize ? batch[batch.length - 1]?.id : null;

      if (batch.length) {
        await enqueueJobs(
          batch.map((contact) => ({
            workspaceId: job.workspaceId,
            type: "broadcast_send",
            status: "queued",
            runAt: new Date(),
            payloadJson: { broadcastId, contactId: contact.id },
          })),
        );
        await db.broadcast.update({
          where: { id: broadcastId },
          data: { status: "queued" },
        });
      }

      if (nextCursor) {
        await enqueueJob({
          workspaceId: job.workspaceId,
          type: "broadcast_expand",
          status: "queued",
          runAt: new Date(),
          payloadJson: { broadcastId, tagId, segmentId, cursor: nextCursor, batchSize },
        });
      }
    }

    if (job.type === "automation_continue") {
      await continueAutomationRun(String(payload.runId || ""));
    }

    if (job.type === "inbound_automation") {
      const triggerType = String(payload.triggerType || "");
      const contactId = String(payload.contactId || "");
      const conversationId = String(payload.conversationId || "");
      const text = String(payload.text || "");
      if (triggerType === "new_contact") {
        await runNewContactAutomations({ contactId, conversationId, text });
      }
      if (triggerType === "keyword") {
        await runKeywordAutomations({ contactId, conversationId, text });
      }
      if (triggerType === "webhook") {
        await runWebhookAutomations({
          webhookKey: String(payload.webhookKey || ""),
          contactId,
          conversationId,
          text,
        });
      }
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
          await enqueueJob({
            workspaceId: job.workspaceId,
            type: "sequence_send",
            status: "queued",
            runAt: nextRunAt,
            payloadJson: { subscriptionId: subscription.id },
          });
        }
      }
    }

    await db.job.update({
      where: { id: job.id },
      data: { status: "completed", lockedAt: null, lastError: null },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown job error";
    await db.job.update({
      where: { id: job.id },
      data: { status: job.attempts >= 3 ? "failed" : "queued", lockedAt: null, lastError: message },
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
  const staleLockCutoff = new Date(Date.now() - 10 * 60 * 1000);
  try {
    const commentResults = await syncInstagramCommentsFromWorker();
    const processedComments = commentResults.filter((result) => result.status === "processed").length;
    if (processedComments > 0) {
      console.log(`[worker] synced ${processedComments} Instagram comment(s)`);
    }
  } catch (error) {
    console.error("[worker] Instagram comment sync failed", error);
  }

  await db.job.updateMany({
    where: { status: "running", lockedAt: { lt: staleLockCutoff }, attempts: { lt: 3 } },
    data: { status: "queued", lockedAt: null, lastError: "Job lock timed out and was re-queued." },
  });

  await db.job.updateMany({
    where: { status: "running", lockedAt: { lt: staleLockCutoff }, attempts: { gte: 3 } },
    data: { status: "failed", lockedAt: null, lastError: "Job lock timed out after maximum attempts." },
  });

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
        type: { in: ["broadcast_expand", "broadcast_send"] },
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
