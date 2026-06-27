import { instagramChannelWhere } from "@/lib/account-scope";
import { publicChannelSelect } from "@/lib/channels/public";
import { getDb } from "@/lib/db";
import { getServerCache } from "@/lib/server-cache";

const INBOX_DATA_CACHE_TTL_MS = 5_000;
const INBOX_DEFAULT_TAG_CACHE_TTL_MS = 60 * 60 * 1_000;

type ScopedListInput = {
  workspaceId: string;
  selectedChannelId?: string;
  limit?: number;
};

function scopedCacheKey(prefix: string, { workspaceId, selectedChannelId, limit }: ScopedListInput) {
  return `${prefix}:${workspaceId}:${selectedChannelId || "all"}:${limit || "default"}`;
}

export function ensureInboxDefaultTags(workspaceId: string) {
  return getServerCache(`inbox-default-tags:${workspaceId}`, INBOX_DEFAULT_TAG_CACHE_TTL_MS, async () => {
    const db = getDb();
    await Promise.all([
      db.tag.upsert({
        where: { workspaceId_name: { workspaceId, name: "熱門名單" } },
        update: {},
        create: { workspaceId, name: "熱門名單", color: "#f97316" },
      }),
      db.tag.upsert({
        where: { workspaceId_name: { workspaceId, name: "合作夥伴" } },
        update: {},
        create: { workspaceId, name: "合作夥伴", color: "#eab308" },
      }),
    ]);
  });
}

export function getConversationList(input: ScopedListInput) {
  return getServerCache(scopedCacheKey("conversation-list", input), INBOX_DATA_CACHE_TTL_MS, async () => {
    const limit = Math.min(Math.max(input.limit || 25, 1), 50);
    const channelWhere = instagramChannelWhere(input.selectedChannelId, input.workspaceId);

    return getDb().conversation.findMany({
      where: channelWhere,
      orderBy: [{ lastMessageAt: "desc" }, { updatedAt: "desc" }],
      take: limit,
      include: {
        contact: {
          include: {
            tags: { include: { tag: true } },
            fieldValues: { include: { definition: true } },
          },
        },
        channel: { select: publicChannelSelect },
        assignedTo: { select: { id: true, name: true, email: true } },
        messages: { orderBy: { createdAt: "desc" }, take: 10 },
      },
    });
  });
}

export function getConversationApiList(input: ScopedListInput) {
  return getServerCache(scopedCacheKey("conversation-api-list", input), INBOX_DATA_CACHE_TTL_MS, async () => {
    const limit = Math.min(Math.max(input.limit || 25, 1), 50);
    const channelWhere = instagramChannelWhere(input.selectedChannelId, input.workspaceId);

    return getDb().conversation.findMany({
      where: channelWhere,
      orderBy: [{ lastMessageAt: "desc" }, { updatedAt: "desc" }],
      take: limit,
      include: {
        contact: {
          include: {
            tags: { include: { tag: true } },
            fieldValues: { include: { definition: true } },
          },
        },
        channel: { select: publicChannelSelect },
        assignedTo: { select: { id: true, name: true, email: true } },
        messages: { orderBy: { createdAt: "desc" }, take: 10 },
      },
    });
  });
}

export function getContactApiList(input: ScopedListInput) {
  return getServerCache(scopedCacheKey("contact-api-list", input), INBOX_DATA_CACHE_TTL_MS, async () => {
    const limit = Math.min(Math.max(input.limit || 25, 1), 50);
    const channelWhere = instagramChannelWhere(input.selectedChannelId, input.workspaceId);

    return getDb().contact.findMany({
      where: channelWhere,
      orderBy: { updatedAt: "desc" },
      take: limit,
      include: {
        channel: { select: publicChannelSelect },
        tags: { include: { tag: true } },
        _count: { select: { conversations: true } },
      },
    });
  });
}

export function getInboxReferenceData(workspaceId: string) {
  return getServerCache(`inbox-reference-data:${workspaceId}`, INBOX_DATA_CACHE_TTL_MS, async () => {
    const [tags, teamMembers, contactFields] = await Promise.all([
      getDb().tag.findMany({ where: { workspaceId }, orderBy: { name: "asc" } }),
      getDb().workspaceUser.findMany({
        where: { workspaceId },
        orderBy: { createdAt: "asc" },
        include: { user: { select: { id: true, name: true, email: true } } },
      }),
      getDb().contactFieldDefinition.findMany({
        where: { workspaceId },
        orderBy: { createdAt: "asc" },
      }),
    ]);

    return { tags, teamMembers, contactFields };
  });
}

export function getBroadcastsPageData(workspaceId: string) {
  return getServerCache(`broadcasts-page-data:${workspaceId}`, INBOX_DATA_CACHE_TTL_MS, async () => {
    const [broadcasts, tags, segments] = await Promise.all([
      getDb().broadcast.findMany({ where: { workspaceId }, orderBy: { updatedAt: "desc" }, take: 100 }),
      getDb().tag.findMany({ where: { workspaceId }, orderBy: { name: "asc" } }),
      getDb().segment.findMany({ where: { workspaceId }, orderBy: { name: "asc" } }),
    ]);

    return { broadcasts, tags, segments };
  });
}
