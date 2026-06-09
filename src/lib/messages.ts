import { Prisma, type ChannelType, type ConsentStatus } from "@prisma/client";
import { assertCanSendAutomation, recordMessageEvent } from "@/lib/billing/usage-service";
import { getChannelAdapter } from "@/lib/channels";
import { getDb } from "@/lib/db";
import { enqueueJobs } from "@/lib/queue";
import { getDefaultWorkspaceId } from "@/lib/workspaces";

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
  metadataJson?: Record<string, unknown>;
  workspaceId?: string;
  skipAutomations?: boolean;
  deferAutomations?: boolean;
};

export async function getOrCreateChannel(type: ChannelType, name?: string, workspaceId?: string) {
  const resolvedWorkspaceId = workspaceId || (await getDefaultWorkspaceId());
  const channelName =
    name ||
    (type === "mock"
      ? "Local Mock"
      : type === "telegram"
        ? "Telegram Bot"
        : `${type} Official`);

  return getDb().channel.upsert({
    where: { workspaceId_type_name: { workspaceId: resolvedWorkspaceId, type, name: channelName } },
    update: {},
    create: {
      workspaceId: resolvedWorkspaceId,
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
  const channel = await getOrCreateChannel(input.channelType, input.channelName, input.workspaceId);
  const now = new Date();
  const existingContact = await db.contact.findUnique({
    where: { channelId_externalId: { channelId: channel.id, externalId: input.externalId } },
    select: { id: true },
  });

  const contact = await db.contact.upsert({
    where: { channelId_externalId: { channelId: channel.id, externalId: input.externalId } },
    update: {
      displayName: input.displayName,
      username: input.username,
      lastInboundAt: now,
      consentStatus: input.consentStatus || undefined,
      metadataJson: input.metadataJson ? (input.metadataJson as Prisma.InputJsonValue) : undefined,
    },
    create: {
      channelId: channel.id,
      externalId: input.externalId,
      displayName: input.displayName,
      username: input.username,
      lastInboundAt: now,
      consentStatus: input.consentStatus || "unknown",
      metadataJson: (input.metadataJson || {}) as Prisma.InputJsonValue,
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
    data: { lastMessageAt: now, status: "open", unreadCount: { increment: 1 } },
  });

  if (channel.workspaceId) {
    await recordMessageEvent({
      workspaceId: channel.workspaceId,
      contactId: contact.id,
      type: "dm_received",
      source: `${input.channelType}:inbound`,
      metadata: { providerMessageId: input.providerMessageId || null },
    });
  }

  if (!input.skipAutomations) {
    if (input.deferAutomations && channel.workspaceId) {
      const jobs = [
        !existingContact
          ? {
              workspaceId: channel.workspaceId,
              type: "inbound_automation",
              status: "queued" as const,
              runAt: new Date(),
              payloadJson: {
                triggerType: "new_contact",
                contactId: contact.id,
                conversationId: conversation.id,
                text: input.text,
              },
            }
          : null,
        {
          workspaceId: channel.workspaceId,
          type: "inbound_automation",
          status: "queued" as const,
          runAt: new Date(),
          payloadJson: {
            triggerType: "keyword",
            contactId: contact.id,
            conversationId: conversation.id,
            text: input.text,
          },
        },
      ].filter((job): job is NonNullable<typeof job> => Boolean(job));

      if (jobs.length) {
        await enqueueJobs(jobs);
      }

      return { channel, contact, conversation, message };
    }

    const { runKeywordAutomations, runNewContactAutomations } = await import("@/lib/automation/triggers");
    if (!existingContact) {
      await runNewContactAutomations({
        contactId: contact.id,
        conversationId: conversation.id,
        text: input.text,
      });
    }
    await runKeywordAutomations({
      contactId: contact.id,
      conversationId: conversation.id,
      text: input.text,
    });
  }

  return { channel, contact, conversation, message };
}

export async function sendOutboundMessage(
  conversationId: string,
  text: string,
  options: {
    source?: "manual" | "automation" | "broadcast";
    eventType?: "auto_dm_sent" | "dm_auto_replied" | "broadcast_contact_sent";
  } = {},
) {
  const db = getDb();
  const conversation = await db.conversation.findUnique({
    where: { id: conversationId },
    include: { contact: true, channel: true },
  });

  if (!conversation) throw new Error("找不到對話。");
  if (!conversation.channel.enabled) throw new Error("這個 IG 帳號尚未啟用。");
  const workspaceId = conversation.channel.workspaceId;
  if (workspaceId && options.source && options.source !== "manual") {
    await assertCanSendAutomation(workspaceId);
  }

  const adapter = getChannelAdapter(conversation.channel.type);
  const contactMetadata =
    conversation.contact.metadataJson && typeof conversation.contact.metadataJson === "object" && !Array.isArray(conversation.contact.metadataJson)
      ? (conversation.contact.metadataJson as Record<string, unknown>)
      : {};
  const commentId = typeof contactMetadata.commentId === "string" ? contactMetadata.commentId : undefined;
  const usedCommentId =
    typeof contactMetadata.commentPrivateReplyUsed === "string" ? contactMetadata.commentPrivateReplyUsed : undefined;
  const result = await adapter.sendMessage({
    channelId: conversation.channelId,
    externalId: conversation.contact.externalId,
    text,
    commentId: commentId && usedCommentId !== commentId ? commentId : undefined,
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
    data: {
      lastOutboundAt: now,
      metadataJson:
        commentId && usedCommentId !== commentId
          ? ({
              ...contactMetadata,
              commentPrivateReplyUsed: commentId,
            } as Prisma.InputJsonValue)
          : undefined,
    },
  });
  await db.conversation.update({
    where: { id: conversationId },
    data: { lastMessageAt: now, unreadCount: 0, lastReadAt: now },
  });

  if (workspaceId) {
    await recordMessageEvent({
      workspaceId,
      contactId: conversation.contactId,
      type: options.eventType || (options.source === "broadcast" ? "broadcast_contact_sent" : "dm_auto_replied"),
      source: options.source || "manual",
      metadata: { conversationId, providerMessageId: result.providerMessageId || null },
    });
  }

  return message;
}

export async function addInternalNote(input: { conversationId: string; userId: string; text: string }) {
  const db = getDb();
  const conversation = await db.conversation.findUnique({
    where: { id: input.conversationId },
    include: { contact: true, channel: true },
  });
  if (!conversation) throw new Error("找不到對話。");

  return db.message.create({
    data: {
      conversationId: input.conversationId,
      contactId: conversation.contactId,
      channelId: conversation.channelId,
      direction: "outbound",
      messageType: "system",
      text: input.text,
      payloadJson: { kind: "internal_note", authorId: input.userId },
    },
  });
}

export async function markConversationRead(conversationId: string) {
  return getDb().conversation.update({
    where: { id: conversationId },
    data: { unreadCount: 0, lastReadAt: new Date() },
  });
}
