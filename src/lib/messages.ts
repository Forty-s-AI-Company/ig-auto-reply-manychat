import type { ChannelType, ConsentStatus } from "@prisma/client";
import { getChannelAdapter } from "@/lib/channels";
import { getDb } from "@/lib/db";

export type InboundMessageInput = {
  channelType: ChannelType;
  channelName?: string;
  externalId: string;
  displayName: string;
  username?: string;
  text: string;
  providerMessageId?: string;
  consentStatus?: ConsentStatus;
  payload?: unknown;
};

export async function getOrCreateChannel(type: ChannelType, name?: string) {
  const channelName =
    name ||
    (type === "mock"
      ? "Local Mock"
      : type === "telegram"
        ? "Telegram Bot"
        : `${type} Official`);

  return getDb().channel.upsert({
    where: { type_name: { type, name: channelName } },
    update: {},
    create: {
      type,
      name: channelName,
      enabled: type === "mock",
      configJson: {},
    },
  });
}

export async function findOrCreateOpenConversation(contactId: string, channelId: string) {
  const db = getDb();
  const existing = await db.conversation.findFirst({
    where: { contactId, channelId, status: { in: ["open", "pending"] } },
    orderBy: { updatedAt: "desc" },
  });

  if (existing) return existing;

  return db.conversation.create({
    data: {
      contactId,
      channelId,
      status: "open",
      lastMessageAt: new Date(),
    },
  });
}

export async function handleInboundMessage(input: InboundMessageInput) {
  const db = getDb();
  const channel = await getOrCreateChannel(input.channelType, input.channelName);
  const now = new Date();

  const contact = await db.contact.upsert({
    where: { channelId_externalId: { channelId: channel.id, externalId: input.externalId } },
    update: {
      displayName: input.displayName,
      username: input.username,
      lastInboundAt: now,
      consentStatus: input.consentStatus || undefined,
    },
    create: {
      channelId: channel.id,
      externalId: input.externalId,
      displayName: input.displayName,
      username: input.username,
      lastInboundAt: now,
      consentStatus: input.consentStatus || "unknown",
      metadataJson: {},
    },
  });

  const conversation = await findOrCreateOpenConversation(contact.id, channel.id);
  const message = await db.message.create({
    data: {
      conversationId: conversation.id,
      contactId: contact.id,
      channelId: channel.id,
      direction: "inbound",
      messageType: "text",
      text: input.text,
      providerMessageId: input.providerMessageId,
      payloadJson: input.payload ?? {},
    },
  });

  await db.conversation.update({
    where: { id: conversation.id },
    data: { lastMessageAt: now, status: "open" },
  });

  const { runKeywordAutomations } = await import("@/lib/automation/triggers");
  await runKeywordAutomations({
    contactId: contact.id,
    conversationId: conversation.id,
    text: input.text,
  });

  return { channel, contact, conversation, message };
}

export async function sendOutboundMessage(conversationId: string, text: string) {
  const db = getDb();
  const conversation = await db.conversation.findUnique({
    where: { id: conversationId },
    include: { contact: true, channel: true },
  });

  if (!conversation) throw new Error("Conversation not found.");
  if (!conversation.channel.enabled) throw new Error("Channel is disabled.");

  const adapter = getChannelAdapter(conversation.channel.type);
  const result = await adapter.sendMessage({
    channelId: conversation.channelId,
    externalId: conversation.contact.externalId,
    text,
  });

  const now = new Date();
  const message = await db.message.create({
    data: {
      conversationId,
      contactId: conversation.contactId,
      channelId: conversation.channelId,
      direction: "outbound",
      messageType: "text",
      text,
      providerMessageId: result.providerMessageId,
      payloadJson: result.raw ?? {},
    },
  });

  await db.contact.update({
    where: { id: conversation.contactId },
    data: { lastOutboundAt: now },
  });
  await db.conversation.update({
    where: { id: conversationId },
    data: { lastMessageAt: now },
  });

  return message;
}
