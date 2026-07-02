import { createHmac, timingSafeEqual } from "crypto";
import { Prisma } from "@prisma/client";
import type { ChannelAdapter } from "@/lib/channels";
import { getDb } from "@/lib/db";
import { isProductionDeploymentEnv } from "@/lib/deployment-env";
import { encryptSecret, tryDecryptSecret } from "@/lib/secrets";

const DEFAULT_GRAPH_API_VERSION = "v25.0";

type MetaWebhookObject = "instagram" | "page";

type MetaWebhookPayload = {
  object?: string;
  entry?: Array<{
    id?: string;
    time?: number;
    messaging?: MetaMessagingEvent[];
    changes?: MetaWebhookChange[];
  }>;
};

type MetaWebhookChange = {
  field?: string;
  value?: {
    id?: string;
    text?: string;
    from?: { id?: string; username?: string };
    media?: { id?: string; media_product_type?: string };
    parent_id?: string;
  };
};

type MetaMessagingEvent = {
  sender?: { id?: string };
  recipient?: { id?: string };
  timestamp?: number;
  message?: {
    mid?: string;
    text?: string;
    is_echo?: boolean;
    attachments?: unknown[];
    quick_reply?: { payload?: string };
  };
  postback?: {
    title?: string;
    payload?: string;
    mid?: string;
  };
  read?: unknown;
  delivery?: unknown;
};

export type MetaChannelConfig = {
  loginProvider?: "instagram" | "facebook";
  businessId?: string;
  pageId?: string;
  pageName?: string;
  userAccessToken?: string;
  pageAccessToken?: string;
  instagramBusinessAccountId?: string;
  instagramOauthUserId?: string;
  instagramUsername?: string;
  instagramName?: string;
  instagramProfilePictureUrl?: string;
  profileReadWarning?: string;
  tokenReadWarning?: string;
  tokenEnv?: string;
  connectedAt?: string;
  userTokenExpiresAt?: string;
};

export type MetaInboundMessage = {
  channelType: "instagram" | "messenger";
  channelName: string;
  externalId: string;
  displayName: string;
  text: string;
  providerMessageId?: string;
  payload: MetaMessagingEvent;
};

export type MetaCommentEvent = {
  channelType: "instagram";
  channelName: string;
  instagramBusinessAccountId: string;
  externalId: string;
  displayName: string;
  username?: string;
  text: string;
  commentId: string;
  mediaId: string;
  parentId?: string;
  payload: MetaWebhookChange;
};

function getGraphVersion() {
  return process.env.META_GRAPH_API_VERSION || DEFAULT_GRAPH_API_VERSION;
}

function getPageAccessToken() {
  if (!isMetaGlobalEnvFallbackEnabled()) return "";
  return process.env.META_PAGE_ACCESS_TOKEN || "";
}

export function isMetaGlobalEnvFallbackEnabled() {
  return !isProductionDeploymentEnv();
}

export function getMetaGlobalInstagramBusinessAccountId() {
  return isMetaGlobalEnvFallbackEnabled() ? process.env.META_INSTAGRAM_BUSINESS_ACCOUNT_ID || "" : "";
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

function readSecret(config: Record<string, unknown>, plainKey: string, encryptedKey: string) {
  const plain = config[plainKey];
  if (typeof plain === "string") return { value: plain, failed: false };

  const encrypted = config[encryptedKey];
  if (typeof encrypted !== "string") return { value: undefined, failed: false };

  const decrypted = tryDecryptSecret(encrypted);
  return { value: decrypted || undefined, failed: !decrypted };
}

export function getMetaChannelConfig(value: unknown): MetaChannelConfig {
  const config = asRecord(value);
  const userAccessToken = readSecret(config, "userAccessToken", "encryptedUserAccessToken");
  const pageAccessToken = readSecret(config, "pageAccessToken", "encryptedPageAccessToken");
  const tokenReadWarning =
    userAccessToken.failed || pageAccessToken.failed ? "Meta token 無法解密，請重新連結帳號。" : undefined;

  return {
    loginProvider:
      config.loginProvider === "instagram" || config.loginProvider === "facebook" ? config.loginProvider : undefined,
    pageId: typeof config.pageId === "string" ? config.pageId : undefined,
    pageName: typeof config.pageName === "string" ? config.pageName : undefined,
    userAccessToken: userAccessToken.value,
    pageAccessToken: pageAccessToken.value,
    instagramBusinessAccountId:
      typeof config.instagramBusinessAccountId === "string" ? config.instagramBusinessAccountId : undefined,
    instagramOauthUserId: typeof config.instagramOauthUserId === "string" ? config.instagramOauthUserId : undefined,
    instagramUsername: typeof config.instagramUsername === "string" ? config.instagramUsername : undefined,
    instagramName: typeof config.instagramName === "string" ? config.instagramName : undefined,
    instagramProfilePictureUrl:
      typeof config.instagramProfilePictureUrl === "string" ? config.instagramProfilePictureUrl : undefined,
    profileReadWarning: typeof config.profileReadWarning === "string" ? config.profileReadWarning : undefined,
    tokenReadWarning,
    tokenEnv: typeof config.tokenEnv === "string" ? config.tokenEnv : undefined,
    connectedAt: typeof config.connectedAt === "string" ? config.connectedAt : undefined,
    userTokenExpiresAt: typeof config.userTokenExpiresAt === "string" ? config.userTokenExpiresAt : undefined,
  };
}

export function encryptMetaConfigJson(value: unknown): Prisma.InputJsonValue {
  const config = asRecord(value);
  const userAccessToken = readSecret(config, "userAccessToken", "encryptedUserAccessToken").value;
  const pageAccessToken = readSecret(config, "pageAccessToken", "encryptedPageAccessToken").value;
  const encryptedConfig: Record<string, unknown> = { ...config };

  delete encryptedConfig.userAccessToken;
  delete encryptedConfig.pageAccessToken;

  if (userAccessToken) encryptedConfig.encryptedUserAccessToken = encryptSecret(userAccessToken);
  if (pageAccessToken) encryptedConfig.encryptedPageAccessToken = encryptSecret(pageAccessToken);

  return encryptedConfig as Prisma.InputJsonValue;
}

async function getChannelPageAccessToken(channelId: string) {
  const channel = await getDb().channel.findUnique({ where: { id: channelId } });
  if (!channel) return getPageAccessToken();

  const config = getMetaChannelConfig(channel.configJson);
  return config.pageAccessToken || getPageAccessToken();
}

async function getChannelMetaConfig(channelId: string) {
  const channel = await getDb().channel.findUnique({ where: { id: channelId } });
  return channel ? getMetaChannelConfig(channel.configJson) : {};
}

function getInstagramBusinessAccountId(config?: MetaChannelConfig) {
  return config?.instagramBusinessAccountId || getMetaGlobalInstagramBusinessAccountId();
}

function getChannelType(object: string | undefined): "instagram" | "messenger" | null {
  if (object === "instagram") return "instagram";
  if (object === "page") return "messenger";
  return null;
}

function isSelfMessage(event: MetaMessagingEvent) {
  const senderId = event.sender?.id;
  const recipientId = event.recipient?.id;
  return Boolean(event.message?.is_echo || (senderId && recipientId && senderId === recipientId));
}

function getEventText(event: MetaMessagingEvent) {
  const text = event.message?.text?.trim();
  if (text) return text;

  const quickReply = event.message?.quick_reply?.payload?.trim();
  if (quickReply) return quickReply;

  const postbackText = event.postback?.title?.trim() || event.postback?.payload?.trim();
  if (postbackText) return postbackText;

  if (event.message?.attachments?.length) return "[非文字訊息]";
  return "";
}

function getProviderMessageId(event: MetaMessagingEvent) {
  return event.message?.mid || event.postback?.mid;
}

function getChannelName(channelType: "instagram" | "messenger") {
  return channelType === "instagram" ? "Instagram Official" : "Messenger Official";
}

export function metaAdapter(type: "instagram" | "messenger"): ChannelAdapter {
  return {
    type,
    async sendMessage(input) {
      const config = await getChannelMetaConfig(input.channelId);
      const token = config.pageAccessToken || (await getChannelPageAccessToken(input.channelId));
      if (!token) {
        throw new Error(
          `${type} official API token is not configured. Use Meta official Graph API setup first.`,
        );
      }

      if (type === "instagram" && !getInstagramBusinessAccountId(config)) {
        throw new Error("META_INSTAGRAM_BUSINESS_ACCOUNT_ID is not configured.");
      }

      const version = getGraphVersion();
      const endpoint =
        type === "instagram" && config.loginProvider === "instagram"
          ? `https://graph.instagram.com/${version}/me/messages`
          : `https://graph.facebook.com/${version}/me/messages`;
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          authorization: `Bearer ${token}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          messaging_type: "RESPONSE",
          recipient: input.commentId ? { comment_id: input.commentId } : { id: input.externalId },
          message: { text: input.text },
        }),
      });

      const data = await response.json().catch(() => null);
      if (!response.ok || data?.error) {
        const message = data?.error?.message || `${type} sendMessage failed.`;
        throw new Error(message);
      }

      return {
        providerMessageId: String(data?.message_id || data?.mid || ""),
        raw: data,
      };
    },
  };
}

export async function likeInstagramComment(channelId: string, commentId: string) {
  const config = await getChannelMetaConfig(channelId);
  const token = config.pageAccessToken || config.userAccessToken || (await getChannelPageAccessToken(channelId));
  if (!token) throw new Error("Instagram comment like failed: token is not configured.");

  const version = getGraphVersion();
  const endpoint =
    config.loginProvider === "instagram"
      ? `https://graph.instagram.com/${version}/${commentId}/likes`
      : `https://graph.facebook.com/${version}/${commentId}/likes`;
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ access_token: token }),
  });
  const data = await response.json().catch(() => null);
  if (!response.ok || data?.error) throw new Error(data?.error?.message || "Instagram comment like failed.");
  return data;
}

export async function replyInstagramComment(channelId: string, commentId: string, message: string) {
  const config = await getChannelMetaConfig(channelId);
  const token = config.pageAccessToken || config.userAccessToken || (await getChannelPageAccessToken(channelId));
  if (!token) throw new Error("Instagram comment reply failed: token is not configured.");

  const version = getGraphVersion();
  const endpoint =
    config.loginProvider === "instagram"
      ? `https://graph.instagram.com/${version}/${commentId}/replies`
      : `https://graph.facebook.com/${version}/${commentId}/replies`;
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ message, access_token: token }),
  });
  const data = await response.json().catch(() => null);
  if (!response.ok || data?.error) throw new Error(data?.error?.message || "Instagram comment reply failed.");
  return data;
}

export function verifyMetaWebhook(params: URLSearchParams) {
  const mode = params.get("hub.mode");
  const token = params.get("hub.verify_token");
  const challenge = params.get("hub.challenge");

  if (mode === "subscribe" && token && token === process.env.META_VERIFY_TOKEN) {
    return challenge || "";
  }

  return null;
}

export function parseMetaWebhookMessages(payload: MetaWebhookPayload): MetaInboundMessage[] {
  const channelType = getChannelType(payload.object);
  if (!channelType || !Array.isArray(payload.entry)) return [];

  const messages: MetaInboundMessage[] = [];
  for (const entry of payload.entry) {
    for (const event of entry.messaging || []) {
      if (isSelfMessage(event) || event.read || event.delivery) continue;

      const externalId = event.sender?.id;
      const text = getEventText(event);
      if (!externalId || !text) continue;

      messages.push({
        channelType,
        channelName: getChannelName(channelType),
        externalId,
        displayName: externalId,
        text,
        providerMessageId: getProviderMessageId(event),
        payload: event,
      });
    }
  }

  return messages;
}

export function parseMetaWebhookComments(payload: MetaWebhookPayload): MetaCommentEvent[] {
  if (payload.object !== "instagram" || !Array.isArray(payload.entry)) return [];

  const comments: MetaCommentEvent[] = [];
  for (const entry of payload.entry) {
    for (const change of entry.changes || []) {
      if (change.field !== "comments") continue;
      const value = change.value || {};
      const commentId = value.id;
      const mediaId = value.media?.id;
      const text = value.text?.trim();
      if (!commentId || !mediaId || !text) continue;

      comments.push({
        channelType: "instagram",
        channelName: "Instagram Official",
        instagramBusinessAccountId: entry.id || "",
        externalId: value.from?.id || commentId,
        displayName: value.from?.username || value.from?.id || commentId,
        username: value.from?.username,
        text,
        commentId,
        mediaId,
        parentId: value.parent_id,
        payload: change,
      });
    }
  }

  return comments;
}

export function getMetaRecipientId(message: MetaInboundMessage) {
  return message.payload.recipient?.id || "";
}

export function getMetaCommentRecipientId(comment: MetaCommentEvent) {
  return comment.instagramBusinessAccountId;
}

export async function findMetaChannelForInbound(message: MetaInboundMessage) {
  const recipientId = getMetaRecipientId(message);
  if (!recipientId) return null;

  const channels = await getDb().channel.findMany({
    where: { type: message.channelType },
  });

  return (
    channels.find((channel) => {
      const config = getMetaChannelConfig(channel.configJson);
      return config.instagramBusinessAccountId === recipientId || config.pageId === recipientId;
    }) || null
  );
}

export async function findMetaChannelForComment(comment: MetaCommentEvent) {
  const recipientId = getMetaCommentRecipientId(comment);
  if (!recipientId) return null;

  const channels = await getDb().channel.findMany({
    where: { type: "instagram" },
  });

  return (
    channels.find((channel) => {
      const config = getMetaChannelConfig(channel.configJson);
      return config.instagramBusinessAccountId === recipientId || config.instagramOauthUserId === recipientId;
    }) || null
  );
}

export function buildInstagramChannelName(username: string, fallbackPageName: string) {
  return username ? `Instagram @${username}` : `Instagram ${fallbackPageName}`;
}

export function toPrismaJson(value: MetaChannelConfig): Prisma.InputJsonValue {
  return encryptMetaConfigJson(value);
}

export function verifyMetaSignature(rawBody: string, signatureHeader: string | null, appSecret?: string) {
  if (!appSecret) return process.env.NODE_ENV !== "production";
  if (!signatureHeader?.startsWith("sha256=")) return false;

  const expected = createHmac("sha256", appSecret).update(rawBody).digest("hex");
  const actual = signatureHeader.slice("sha256=".length);
  const expectedBuffer = Buffer.from(expected, "hex");
  const actualBuffer = Buffer.from(actual, "hex");

  return expectedBuffer.length === actualBuffer.length && timingSafeEqual(expectedBuffer, actualBuffer);
}

export function isConfiguredMetaObject(object: string | undefined): object is MetaWebhookObject {
  return object === "instagram" || object === "page";
}
