import { NextResponse } from "next/server";
import {
  findMetaChannelForInbound,
  isConfiguredMetaObject,
  parseMetaWebhookComments,
  parseMetaWebhookMessages,
  verifyMetaSignature,
  verifyMetaWebhook,
} from "@/lib/channels/meta";
import { getDb } from "@/lib/db";
import { processInstagramCommentEvent } from "@/lib/instagram/comments-sync";
import { getOrCreateChannel, handleInboundMessage } from "@/lib/messages";
import { getDefaultWorkspaceId } from "@/lib/workspaces";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const challenge = verifyMetaWebhook(new URL(request.url).searchParams);
  if (challenge === null) {
    return NextResponse.json({ error: "Meta webhook verification failed." }, { status: 403 });
  }
  return new Response(challenge, { status: 200 });
}

async function ensureChannelEnabled(
  channelType: "instagram" | "messenger",
  channelName: string,
  workspaceId: string,
) {
  const channel = await getOrCreateChannel(channelType, channelName, workspaceId);
  const existingConfig =
    channel.configJson && typeof channel.configJson === "object" && !Array.isArray(channel.configJson)
      ? channel.configJson
      : {};
  const hasStoredPageToken = "pageAccessToken" in existingConfig;

  return getDb().channel.update({
    where: { id: channel.id },
    data: {
      enabled: true,
      configJson: {
        ...existingConfig,
        pageId: "pageId" in existingConfig ? existingConfig.pageId : process.env.META_PAGE_ID || "",
        instagramBusinessAccountId:
          "instagramBusinessAccountId" in existingConfig
            ? existingConfig.instagramBusinessAccountId
            : process.env.META_INSTAGRAM_BUSINESS_ACCOUNT_ID || "",
        ...(hasStoredPageToken ? {} : { tokenEnv: "META_PAGE_ACCESS_TOKEN" }),
      },
    },
  });
}

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-hub-signature-256");
  const signatureValid =
    verifyMetaSignature(rawBody, signature, process.env.META_APP_SECRET) ||
    verifyMetaSignature(rawBody, signature, process.env.META_INSTAGRAM_APP_SECRET);
  if (!signatureValid) {
    return NextResponse.json({ error: "Invalid Meta webhook signature." }, { status: 401 });
  }

  let payload: unknown;
  try {
    payload = JSON.parse(rawBody || "{}");
  } catch {
    return NextResponse.json({ error: "Invalid Meta webhook payload." }, { status: 400 });
  }

  if (!payload || typeof payload !== "object") {
    return NextResponse.json({ error: "Invalid Meta webhook payload." }, { status: 400 });
  }

  const metaPayload = payload as { object?: string };
  if (!isConfiguredMetaObject(metaPayload.object)) {
    return NextResponse.json({ ok: true, ignored: true });
  }

  const inboundMessages = parseMetaWebhookMessages(metaPayload);
  const inboundComments = parseMetaWebhookComments(metaPayload);
  const processedConversationIds: string[] = [];
  const processedCommentIds: string[] = [];
  let duplicated = 0;

  for (const inbound of inboundMessages) {
    const configuredChannel = await findMetaChannelForInbound(inbound);
    const channelName = configuredChannel?.name || inbound.channelName;
    const workspaceId = configuredChannel?.workspaceId || (await getDefaultWorkspaceId());
    const channel = await ensureChannelEnabled(inbound.channelType, channelName, workspaceId);
    if (inbound.providerMessageId) {
      const existing = await getDb().message.findFirst({
        where: {
          channelId: channel.id,
          direction: "inbound",
          providerMessageId: inbound.providerMessageId,
        },
      });
      if (existing) {
        duplicated += 1;
        continue;
      }
    }

    const result = await handleInboundMessage({ ...inbound, workspaceId });
    processedConversationIds.push(result.conversation.id);
  }

  for (const comment of inboundComments) {
    const result = await processInstagramCommentEvent(comment);
    if (result.status === "duplicated") {
      duplicated += 1;
      continue;
    }
    if (result.status !== "processed") continue;

    processedConversationIds.push(result.conversationId);
    processedCommentIds.push(result.commentId);
  }

  return NextResponse.json({
    ok: true,
    received: inboundMessages.length + inboundComments.length,
    receivedMessages: inboundMessages.length,
    receivedComments: inboundComments.length,
    processed: processedConversationIds.length,
    processedComments: processedCommentIds.length,
    duplicated,
    conversationIds: processedConversationIds,
    commentIds: processedCommentIds,
  });
}
