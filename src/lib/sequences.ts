import { Prisma } from "@prisma/client";
import { getDb } from "@/lib/db";

function nextRunDate(delaySeconds: number) {
  return new Date(Date.now() + Math.max(0, delaySeconds) * 1000);
}

export async function subscribeContactToSequence(input: {
  workspaceId: string;
  sequenceId: string;
  contactId: string;
}) {
  const db = getDb();
  const sequence = await db.sequence.findFirst({
    where: { id: input.sequenceId, workspaceId: input.workspaceId, enabled: true },
    include: { steps: { orderBy: { order: "asc" } } },
  });
  if (!sequence) throw new Error("找不到可啟用的序列。");
  if (!sequence.steps.length) throw new Error("序列至少需要一個步驟。");

  const contact = await db.contact.findFirst({
    where: { id: input.contactId, channel: { workspaceId: input.workspaceId } },
    select: { id: true },
  });
  if (!contact) throw new Error("找不到這個工作區的聯絡人。");

  const firstStep = sequence.steps[0];
  const runAt = nextRunDate(firstStep.delaySeconds);
  const subscription = await db.sequenceSubscription.upsert({
    where: { sequenceId_contactId: { sequenceId: input.sequenceId, contactId: input.contactId } },
    update: { currentStep: 0, active: true, nextRunAt: runAt },
    create: {
      sequenceId: input.sequenceId,
      contactId: input.contactId,
      currentStep: 0,
      active: true,
      nextRunAt: runAt,
    },
  });

  await db.job.create({
    data: {
      workspaceId: input.workspaceId,
      type: "sequence_send",
      status: "queued",
      runAt,
      payloadJson: { subscriptionId: subscription.id },
    },
  });

  return subscription;
}

export async function replaceSequenceSteps(input: {
  sequenceId: string;
  steps: Array<{ order: number; delaySeconds: number; messageJson: { text: string } }>;
}) {
  const db = getDb();
  await db.sequenceStep.deleteMany({ where: { sequenceId: input.sequenceId } });
  await db.sequenceStep.createMany({
    data: input.steps.map((step) => ({
      sequenceId: input.sequenceId,
      order: step.order,
      delaySeconds: step.delaySeconds,
      messageJson: step.messageJson as Prisma.InputJsonValue,
    })),
  });
}
