import { beforeEach, describe, expect, it } from "vitest";
import { runManualAutomation, runWebhookAutomations } from "@/lib/automation/triggers";
import { getDb } from "@/lib/db";
import { findOrCreateOpenConversation, handleInboundMessage } from "@/lib/messages";
import { ensureDefaultWorkspace } from "@/lib/workspaces";

const db = getDb();

async function cleanDb() {
  await db.sequenceSubscription.deleteMany();
  await db.sequenceStep.deleteMany();
  await db.sequence.deleteMany();
  await db.contactFieldValue.deleteMany();
  await db.contactFieldDefinition.deleteMany();
  await db.job.deleteMany();
  await db.automationRun.deleteMany();
  await db.automationStep.deleteMany();
  await db.automation.deleteMany();
  await db.message.deleteMany();
  await db.conversation.deleteMany();
  await db.contactTag.deleteMany();
  await db.contact.deleteMany();
  await db.tag.deleteMany();
  await db.channel.deleteMany();
  await db.knowledgeBaseItem.deleteMany();
}

describe("automation triggers", () => {
  beforeEach(async () => {
    await cleanDb();
  });

  it("runs new_contact automations only when the contact is first created", async () => {
    const workspace = await ensureDefaultWorkspace();
    await db.automation.create({
      data: {
        workspaceId: workspace.id,
        name: "welcome",
        enabled: true,
        triggerType: "new_contact",
        triggerConfigJson: {},
        steps: {
          create: [{ order: 1, type: "send_message", configJson: { text: "歡迎加入" } }],
        },
      },
    });

    const first = await handleInboundMessage({
      channelType: "mock",
      channelName: "Local Mock",
      externalId: "new-contact-user",
      displayName: "New Contact",
      text: "hello",
      consentStatus: "opted_in",
    });
    await handleInboundMessage({
      channelType: "mock",
      channelName: "Local Mock",
      externalId: "new-contact-user",
      displayName: "New Contact",
      text: "hello again",
      consentStatus: "opted_in",
    });

    const outboundMessages = await db.message.findMany({
      where: { conversationId: first.conversation.id, direction: "outbound" },
    });
    expect(outboundMessages).toHaveLength(1);
    expect(outboundMessages[0].text).toBe("歡迎加入");
  }, 45000);

  it("runs a manual automation for an existing contact", async () => {
    const workspace = await ensureDefaultWorkspace();
    const channel = await db.channel.create({
      data: { workspaceId: workspace.id, type: "mock", name: "Local Mock", enabled: true, configJson: {} },
    });
    const contact = await db.contact.create({
      data: {
        channelId: channel.id,
        externalId: "manual-user",
        displayName: "Manual User",
        consentStatus: "opted_in",
        metadataJson: {},
      },
    });
    const conversation = await findOrCreateOpenConversation(contact.id, channel.id);
    const automation = await db.automation.create({
      data: {
        workspaceId: workspace.id,
        name: "manual follow-up",
        enabled: true,
        triggerType: "manual",
        triggerConfigJson: {},
        steps: {
          create: [{ order: 1, type: "send_message", configJson: { text: "人工啟動流程" } }],
        },
      },
    });

    const matched = await runManualAutomation({
      automationId: automation.id,
      contactId: contact.id,
      conversationId: conversation.id,
    });

    const messages = await db.message.findMany({ where: { conversationId: conversation.id } });
    expect(matched).toBe(1);
    expect(messages.some((message) => message.text === "人工啟動流程")).toBe(true);
  });

  it("runs webhook automations by webhook key", async () => {
    const workspace = await ensureDefaultWorkspace();
    const channel = await db.channel.create({
      data: { workspaceId: workspace.id, type: "mock", name: "Local Mock", enabled: true, configJson: {} },
    });
    const contact = await db.contact.create({
      data: {
        channelId: channel.id,
        externalId: "webhook-user",
        displayName: "Webhook User",
        consentStatus: "opted_in",
        metadataJson: {},
      },
    });
    const conversation = await findOrCreateOpenConversation(contact.id, channel.id);
    await db.automation.create({
      data: {
        workspaceId: workspace.id,
        name: "webhook",
        enabled: true,
        triggerType: "webhook",
        triggerConfigJson: { webhookKey: "abc123456789" },
        steps: {
          create: [{ order: 1, type: "send_message", configJson: { text: "Webhook 已收到" } }],
        },
      },
    });

    const matched = await runWebhookAutomations({
      webhookKey: "abc123456789",
      contactId: contact.id,
      conversationId: conversation.id,
      text: "paid",
    });

    const messages = await db.message.findMany({ where: { conversationId: conversation.id } });
    expect(matched).toBe(1);
    expect(messages.some((message) => message.text === "Webhook 已收到")).toBe(true);
  });
});
