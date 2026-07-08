import { NextResponse } from "next/server";
import { getSelectedInstagramChannelId } from "@/lib/account-scope";
import { requireApiUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { assertRateLimit, assertSameOriginRequest, getClientIp } from "@/lib/security";
import { getCurrentWorkspaceId } from "@/lib/workspaces";

const DEMO_EXTERNAL_ID = "inboxpilot-demo-contact";

async function getDemoChannel(workspaceId: string, selectedChannelId: string | null) {
  const db = getDb();

  if (selectedChannelId) {
    const selected = await db.channel.findFirst({
      where: { id: selectedChannelId, workspaceId },
      select: { id: true },
    });
    if (selected) return selected;
  }

  const instagram = await db.channel.findFirst({
    where: { workspaceId, type: "instagram" },
    orderBy: [{ enabled: "desc" }, { createdAt: "asc" }],
    select: { id: true },
  });
  if (instagram) return instagram;

  return db.channel.upsert({
    where: {
      workspaceId_type_name: {
        workspaceId,
        type: "mock",
        name: "InboxPilot Demo Channel",
      },
    },
    update: { enabled: true },
    create: {
      workspaceId,
      type: "mock",
      name: "InboxPilot Demo Channel",
      enabled: true,
      configJson: { demo: true, source: "contacts_empty_state" },
    },
    select: { id: true },
  });
}

export async function POST(request: Request) {
  const originFailure = assertSameOriginRequest(request);
  if (originFailure) return originFailure;

  const auth = await requireApiUser();
  if (auth.response) return auth.response;

  const rateLimitFailure = await assertRateLimit({
    key: `contacts-demo:${auth.user.id}:${getClientIp(request)}`,
    limit: 10,
    windowMs: 60 * 1000,
  });
  if (rateLimitFailure) return rateLimitFailure;

  const workspaceId = await getCurrentWorkspaceId();
  const selectedChannelId = await getSelectedInstagramChannelId();
  const channel = await getDemoChannel(workspaceId, selectedChannelId || null);
  const now = new Date();

  const contact = await getDb().contact.upsert({
    where: {
      channelId_externalId: {
        channelId: channel.id,
        externalId: DEMO_EXTERNAL_ID,
      },
    },
    update: {
      displayName: "示範聯絡人",
      username: "inboxpilot_demo",
      consentStatus: "unknown",
      lastInboundAt: now,
      metadataJson: { demo: true, source: "contacts_empty_state" },
    },
    create: {
      channelId: channel.id,
      externalId: DEMO_EXTERNAL_ID,
      displayName: "示範聯絡人",
      username: "inboxpilot_demo",
      consentStatus: "unknown",
      lastInboundAt: now,
      metadataJson: { demo: true, source: "contacts_empty_state" },
    },
  });

  const existingConversation = await getDb().conversation.findFirst({
    where: { contactId: contact.id, channelId: channel.id },
    orderBy: { updatedAt: "desc" },
  });
  const conversation = existingConversation
    ? await getDb().conversation.update({
        where: { id: existingConversation.id },
        data: {
          status: "open",
          lastMessageAt: now,
          unreadCount: 1,
        },
      })
    : await getDb().conversation.create({
        data: {
      contactId: contact.id,
      channelId: channel.id,
      status: "open",
      lastMessageAt: now,
      unreadCount: 1,
        },
      });

  await getDb().message.create({
    data: {
      conversationId: conversation.id,
      contactId: contact.id,
      channelId: channel.id,
      direction: "inbound",
      text: "您好，我想了解 InboxPilot 如何管理 Instagram 訊息。",
      payloadJson: { demo: true, source: "contacts_empty_state" },
      providerMessageId: `demo-${Date.now()}`,
    },
  });

  return NextResponse.json({ ok: true, contactId: contact.id });
}
