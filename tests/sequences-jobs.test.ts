import { beforeEach, describe, expect, it } from "vitest";
import { getDb } from "@/lib/db";
import { processDueJobs, processDueReminders } from "@/lib/jobs";
import { findOrCreateOpenConversation } from "@/lib/messages";
import { subscribeContactToSequence } from "@/lib/sequences";
import { ensureDefaultWorkspace } from "@/lib/workspaces";

const db = getDb();

async function cleanDb() {
  await db.sequenceSubscription.deleteMany();
  await db.sequenceStep.deleteMany();
  await db.sequence.deleteMany();
  await db.contactFieldValue.deleteMany();
  await db.contactFieldDefinition.deleteMany();
  await db.job.deleteMany();
  await db.message.deleteMany();
  await db.conversation.deleteMany();
  await db.contactTag.deleteMany();
  await db.contact.deleteMany();
  await db.channel.deleteMany();
}

describe("sequence and reminder jobs", () => {
  beforeEach(async () => {
    await cleanDb();
  });

  it("subscribes a contact and sends sequence steps through due jobs", async () => {
    const workspace = await ensureDefaultWorkspace();
    const channel = await db.channel.create({
      data: { workspaceId: workspace.id, type: "mock", name: "Local Mock", enabled: true, configJson: {} },
    });
    const contact = await db.contact.create({
      data: {
        channelId: channel.id,
        externalId: "sequence-user",
        displayName: "Sequence User",
        consentStatus: "opted_in",
        metadataJson: {},
      },
    });
    const sequence = await db.sequence.create({
      data: {
        workspaceId: workspace.id,
        name: "welcome sequence",
        enabled: true,
        steps: {
          create: [
            { order: 1, delaySeconds: 0, messageJson: { text: "第一封" } },
            { order: 2, delaySeconds: 0, messageJson: { text: "第二封" } },
          ],
        },
      },
    });

    const subscription = await subscribeContactToSequence({
      workspaceId: workspace.id,
      sequenceId: sequence.id,
      contactId: contact.id,
    });
    await processDueJobs(5);
    await processDueJobs(5);

    const messages = await db.message.findMany({
      where: { contactId: contact.id },
      orderBy: { createdAt: "asc" },
    });
    const finalSubscription = await db.sequenceSubscription.findUniqueOrThrow({
      where: { id: subscription.id },
    });

    expect(messages.map((message) => message.text)).toEqual(["第一封", "第二封"]);
    expect(finalSubscription.active).toBe(false);
    expect(finalSubscription.currentStep).toBe(2);
  }, 45000);

  it("turns due reminders into system messages once", async () => {
    const workspace = await ensureDefaultWorkspace();
    const channel = await db.channel.create({
      data: { workspaceId: workspace.id, type: "mock", name: "Local Mock", enabled: true, configJson: {} },
    });
    const contact = await db.contact.create({
      data: {
        channelId: channel.id,
        externalId: "reminder-user",
        displayName: "Reminder User",
        metadataJson: {},
      },
    });
    const conversation = await findOrCreateOpenConversation(contact.id, channel.id);
    await db.conversation.update({
      where: { id: conversation.id },
      data: { reminderAt: new Date(Date.now() - 1000) },
    });

    const processed = await processDueReminders();
    await processDueReminders();

    const messages = await db.message.findMany({ where: { conversationId: conversation.id } });
    const updated = await db.conversation.findUniqueOrThrow({ where: { id: conversation.id } });
    expect(processed).toBe(1);
    expect(messages).toHaveLength(1);
    expect(messages[0].messageType).toBe("system");
    expect(updated.reminderAt).toBeNull();
  });
});
