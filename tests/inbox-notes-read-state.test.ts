import { beforeEach, describe, expect, it } from "vitest";
import { getDb } from "@/lib/db";
import { addInternalNote, handleInboundMessage, markConversationRead } from "@/lib/messages";
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
}

describe("inbox notes and read state", () => {
  beforeEach(async () => {
    await cleanDb();
  });

  it("stores internal notes as system messages and can mark a conversation as read", async () => {
    const workspace = await ensureDefaultWorkspace();
    const user = await db.user.upsert({
      where: { email: "note-test@example.com" },
      update: {},
      create: {
        email: "note-test@example.com",
        passwordHash: "test",
        name: "Note Tester",
      },
    });
    await db.workspaceUser.upsert({
      where: { workspaceId_userId: { workspaceId: workspace.id, userId: user.id } },
      update: {},
      create: { workspaceId: workspace.id, userId: user.id },
    });

    const inbound = await handleInboundMessage({
      channelType: "mock",
      channelName: "Local Mock",
      externalId: "note-user",
      displayName: "Note User",
      text: "需要追蹤",
      consentStatus: "opted_in",
      skipAutomations: true,
    });

    await addInternalNote({
      conversationId: inbound.conversation.id,
      userId: user.id,
      text: "週五前回覆報價。",
    });
    const readConversation = await markConversationRead(inbound.conversation.id);
    const messages = await db.message.findMany({
      where: { conversationId: inbound.conversation.id },
      orderBy: { createdAt: "asc" },
    });

    expect(messages).toHaveLength(2);
    expect(messages[1].messageType).toBe("system");
    expect(messages[1].payloadJson).toMatchObject({ kind: "internal_note", authorId: user.id });
    expect(readConversation.unreadCount).toBe(0);
    expect(readConversation.lastReadAt).toBeInstanceOf(Date);
  });
});
