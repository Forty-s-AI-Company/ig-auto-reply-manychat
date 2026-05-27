import type { Channel } from "@prisma/client";
import { executeAutomation } from "@/lib/automation/engine";
import {
  findMetaChannelForComment,
  getMetaChannelConfig,
  likeInstagramComment,
  type MetaCommentEvent,
  replyInstagramComment,
  toPrismaJson,
} from "@/lib/channels/meta";
import {
  isInstagramTokenRefreshable,
  refreshInstagramLongLivedToken,
} from "@/lib/channels/instagram-token";
import { getDb } from "@/lib/db";
import { handleInboundMessage } from "@/lib/messages";
import { getDefaultWorkspaceId } from "@/lib/workspaces";

type GraphComment = {
  id?: string;
  text?: string;
  username?: string;
  timestamp?: string;
  from?: {
    id?: string;
    username?: string;
  };
};

type GraphCommentResponse = {
  data?: GraphComment[];
  error?: {
    message?: string;
    fbtrace_id?: string;
  };
};

type ProcessResult =
  | { status: "processed"; commentId: string; conversationId: string; actionErrors: string[] }
  | { status: "duplicated"; commentId: string }
  | { status: "ignored"; commentId: string; reason: string };

let lastSyncAt = 0;

function graphVersion() {
  return process.env.META_GRAPH_API_VERSION || "v25.0";
}

function asRecord(value: unknown) {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

function keywordMatches(text: string, config: Record<string, unknown>) {
  const value = text.toLowerCase();
  const keywords = Array.isArray(config.keywords) ? config.keywords.map(String) : [];
  return keywords.some((keyword) => value.includes(keyword.toLowerCase()));
}

function postMatches(mediaId: string, config: Record<string, unknown>) {
  const mode = String(config.postSelectionMode || "specific");
  if (mode === "all" || mode === "continue" || mode === "next") return true;
  return !config.selectedPostId || String(config.selectedPostId) === mediaId;
}

async function getUsableChannelToken(channel: Pick<Channel, "id" | "configJson">) {
  const db = getDb();
  let config = getMetaChannelConfig(channel.configJson);

  if (isInstagramTokenRefreshable(config)) {
    try {
      config = await refreshInstagramLongLivedToken(config);
      await db.channel.update({
        where: { id: channel.id },
        data: { configJson: toPrismaJson(config) },
      });
    } catch {
      // The Graph request below will surface the real provider error when the token is unusable.
    }
  }

  return {
    config,
    accessToken: config.pageAccessToken || config.userAccessToken || "",
  };
}

async function fetchMediaComments(input: {
  mediaId: string;
  channel: Pick<Channel, "id" | "configJson">;
}) {
  const { config, accessToken } = await getUsableChannelToken(input.channel);
  if (!accessToken) throw new Error("Instagram comment sync failed: token is not configured.");

  const base =
    config.loginProvider === "instagram"
      ? `https://graph.instagram.com/${graphVersion()}/${input.mediaId}/comments`
      : `https://graph.facebook.com/${graphVersion()}/${input.mediaId}/comments`;
  const url = new URL(base);
  url.searchParams.set("fields", "id,text,username,timestamp,from");
  url.searchParams.set("limit", "50");
  url.searchParams.set("access_token", accessToken);

  const response = await fetch(url, { cache: "no-store" });
  const data = (await response.json().catch(() => ({}))) as GraphCommentResponse;
  if (!response.ok || data.error) {
    const trace = data.error?.fbtrace_id ? ` fbtrace_id=${data.error.fbtrace_id}` : "";
    throw new Error(`${data.error?.message || "Instagram comments request failed."}${trace}`);
  }

  return data.data || [];
}

async function ensureInstagramChannelEnabled(channel: Channel) {
  if (channel.enabled) return channel;
  return getDb().channel.update({
    where: { id: channel.id },
    data: { enabled: true },
  });
}

export async function processInstagramCommentEvent(
  comment: MetaCommentEvent,
  input?: { channel?: Channel; workspaceId?: string },
): Promise<ProcessResult> {
  const db = getDb();
  const configuredChannel = input?.channel || (await findMetaChannelForComment(comment));
  if (!configuredChannel) return { status: "ignored", commentId: comment.commentId, reason: "channel_not_found" };

  const channel = await ensureInstagramChannelEnabled(configuredChannel);
  const workspaceId = input?.workspaceId || channel.workspaceId || (await getDefaultWorkspaceId());

  const existing = await db.message.findFirst({
    where: {
      channelId: channel.id,
      direction: "inbound",
      providerMessageId: comment.commentId,
    },
  });
  if (existing) return { status: "duplicated", commentId: comment.commentId };

  const automations = await db.automation.findMany({
    where: { workspaceId, enabled: true, triggerType: "keyword" },
    include: { steps: { orderBy: { order: "asc" } } },
  });
  const matchedAutomation = automations.find((automation) => {
    const config = asRecord(automation.triggerConfigJson);
    return postMatches(comment.mediaId, config) && keywordMatches(comment.text, config);
  });
  if (!matchedAutomation) return { status: "ignored", commentId: comment.commentId, reason: "no_matching_automation" };

  const config = asRecord(matchedAutomation.triggerConfigJson);
  const actionErrors: string[] = [];
  if (config.autoLike !== false) {
    try {
      await likeInstagramComment(channel.id, comment.commentId);
    } catch (error) {
      actionErrors.push(error instanceof Error ? error.message : "Instagram comment like failed.");
    }
  }
  if (config.publicReplyEnabled !== false && config.publicReplyText) {
    try {
      await replyInstagramComment(channel.id, comment.commentId, String(config.publicReplyText));
    } catch (error) {
      actionErrors.push(error instanceof Error ? error.message : "Instagram comment public reply failed.");
    }
  }

  const result = await handleInboundMessage({
    channelType: comment.channelType,
    channelName: channel.name,
    externalId: comment.externalId,
    displayName: comment.displayName,
    username: comment.username,
    text: comment.text,
    providerMessageId: comment.commentId,
    payload: comment.payload,
    metadataJson: {
      source: "instagram_comment",
      commentId: comment.commentId,
      mediaId: comment.mediaId,
      parentId: comment.parentId,
      syncSource: "instagram_comments_sync",
      actionErrors,
    },
    workspaceId,
    skipAutomations: true,
  });

  await executeAutomation({
    automation: matchedAutomation,
    contactId: result.contact.id,
    conversationId: result.conversation.id,
    inboundText: comment.text,
  });

  return {
    status: "processed",
    commentId: comment.commentId,
    conversationId: result.conversation.id,
    actionErrors,
  };
}

export async function syncInstagramCommentsFromActiveAutomations() {
  const db = getDb();
  const automations = await db.automation.findMany({
    where: { enabled: true, triggerType: "keyword" },
    select: { workspaceId: true, triggerConfigJson: true },
  });
  const mediaByWorkspace = new Map<string, Set<string>>();
  for (const automation of automations) {
    const config = asRecord(automation.triggerConfigJson);
    const mediaId = typeof config.selectedPostId === "string" ? config.selectedPostId : "";
    if (!mediaId) continue;
    const workspaceId = automation.workspaceId || (await getDefaultWorkspaceId());
    const set = mediaByWorkspace.get(workspaceId) || new Set<string>();
    set.add(mediaId);
    mediaByWorkspace.set(workspaceId, set);
  }

  const results: ProcessResult[] = [];
  for (const [workspaceId, mediaIds] of mediaByWorkspace.entries()) {
    const channels = await db.channel.findMany({
      where: { workspaceId, type: "instagram", enabled: true },
      orderBy: { updatedAt: "desc" },
    });
    const channel = channels[0];
    if (!channel) continue;

    const config = getMetaChannelConfig(channel.configJson);
    const instagramBusinessAccountId =
      config.instagramBusinessAccountId || config.instagramOauthUserId || process.env.META_INSTAGRAM_BUSINESS_ACCOUNT_ID || "";

    for (const mediaId of mediaIds) {
      const comments = await fetchMediaComments({ mediaId, channel });
      for (const item of comments) {
        const commentId = String(item.id || "");
        const text = item.text?.trim() || "";
        if (!commentId || !text) continue;

        results.push(
          await processInstagramCommentEvent(
            {
              channelType: "instagram",
              channelName: channel.name,
              instagramBusinessAccountId,
              externalId: item.from?.id || commentId,
              displayName: item.from?.username || item.username || item.from?.id || commentId,
              username: item.from?.username || item.username,
              text,
              commentId,
              mediaId,
              payload: {
                field: "comments",
                value: {
                  id: commentId,
                  text,
                  from: item.from,
                  media: { id: mediaId },
                },
              },
            },
            { channel, workspaceId },
          ),
        );
      }
    }
  }

  return results;
}

export async function syncInstagramCommentsFromWorker(options?: { minIntervalMs?: number }) {
  if (process.env.INSTAGRAM_COMMENT_SYNC_ENABLED === "false") return [];

  const minIntervalMs = options?.minIntervalMs ?? Number(process.env.INSTAGRAM_COMMENT_SYNC_INTERVAL_MS || 30000);
  const now = Date.now();
  if (now - lastSyncAt < minIntervalMs) return [];

  lastSyncAt = now;
  return syncInstagramCommentsFromActiveAutomations();
}
