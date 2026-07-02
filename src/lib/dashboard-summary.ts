import { instagramChannelWhere } from "@/lib/account-scope";
import { getMetaChannelConfig } from "@/lib/channels/meta";
import { publicChannelSelect } from "@/lib/channels/public";
import { getDb } from "@/lib/db";
import { getServerCache } from "@/lib/server-cache";

const DASHBOARD_SUMMARY_CACHE_TTL_MS = 5_000;
const ANALYTICS_TREND_DAYS = 7;

type SummaryInput = {
  workspaceId: string;
  selectedChannelId?: string;
};

function summaryCacheKey(prefix: string, { workspaceId, selectedChannelId }: SummaryInput) {
  return `${prefix}:${workspaceId}:${selectedChannelId || "all"}`;
}

function startOfUtcDay(date: Date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function formatTrendDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function formatTrendLabel(date: Date) {
  return `${date.getUTCMonth() + 1}/${date.getUTCDate()}`;
}

export function buildMessageTrendPoints(messages: Array<{ createdAt: Date }>, now = new Date()) {
  const today = startOfUtcDay(now);
  const days = Array.from({ length: ANALYTICS_TREND_DAYS }, (_, index) => {
    const day = new Date(today);
    day.setUTCDate(today.getUTCDate() - (ANALYTICS_TREND_DAYS - 1 - index));

    return {
      date: formatTrendDateKey(day),
      label: formatTrendLabel(day),
      messages: 0,
    };
  });
  const counts = new Map(days.map((day) => [day.date, day]));

  for (const message of messages) {
    const key = formatTrendDateKey(startOfUtcDay(message.createdAt));
    const point = counts.get(key);
    if (point) {
      point.messages += 1;
    }
  }

  return days;
}

export function getDashboardSummary(input: SummaryInput) {
  return getServerCache(summaryCacheKey("dashboard-summary", input), DASHBOARD_SUMMARY_CACHE_TTL_MS, async () => {
    const db = getDb();
    const channelWhere = instagramChannelWhere(input.selectedChannelId, input.workspaceId);

    // Production uses Supabase session pooling, so keep this dashboard read path
    // intentionally sequential. The page opens several server-side reads already,
    // and parallel Prisma queries can exhaust the pool under Vercel serverless.
    const contacts = await db.contact.count({ where: channelWhere });
    const messages = await db.message.count({ where: channelWhere });
    const openConversations = await db.conversation.count({ where: { status: "open", ...channelWhere } });
    const automations = await db.automation.count({ where: { workspaceId: input.workspaceId } });
    const connectedInstagramChannelRows = await db.channel.findMany({
      where: { workspaceId: input.workspaceId, type: "instagram", enabled: true },
      select: { configJson: true, name: true },
    });
    const recentMessages = await db.message.findMany({
      where: channelWhere,
      orderBy: { createdAt: "desc" },
      take: 6,
      select: {
        id: true,
        direction: true,
        text: true,
        createdAt: true,
        contact: { select: { displayName: true } },
        channel: { select: publicChannelSelect },
      },
    });
    const recentAutomations = await db.automation.findMany({
      where: { workspaceId: input.workspaceId },
      orderBy: { updatedAt: "desc" },
      take: 4,
      select: {
        id: true,
        name: true,
        enabled: true,
        _count: { select: { steps: true } },
      },
    });

    return {
      contacts,
      messages,
      openConversations,
      automations,
      connectedInstagramChannelRows,
      recentMessages,
      recentAutomations,
    };
  });
}

export function getAnalyticsSummary(input: SummaryInput) {
  return getServerCache(summaryCacheKey("analytics-summary", input), DASHBOARD_SUMMARY_CACHE_TTL_MS, async () => {
    const db = getDb();
    const channelWhere = instagramChannelWhere(input.selectedChannelId, input.workspaceId);
    const trendStart = startOfUtcDay(new Date());
    trendStart.setUTCDate(trendStart.getUTCDate() - (ANALYTICS_TREND_DAYS - 1));
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [
      contacts,
      messages,
      recentMessages,
      openConversations,
      broadcasts,
      queuedBroadcasts,
      sentBroadcasts,
      automations,
      enabledAutomations,
      connectedInstagramChannels,
      selectedChannel,
      messageTrendRows,
    ] = await Promise.all([
      db.contact.count({ where: channelWhere }),
      db.message.count({ where: channelWhere }),
      db.message.count({ where: { ...channelWhere, createdAt: { gte: sevenDaysAgo } } }),
      db.conversation.count({ where: { status: "open", ...channelWhere } }),
      db.broadcast.count({ where: { workspaceId: input.workspaceId } }),
      db.broadcast.count({ where: { workspaceId: input.workspaceId, status: { in: ["queued", "sending"] } } }),
      db.broadcast.aggregate({ where: { workspaceId: input.workspaceId }, _sum: { sentCount: true, failedCount: true } }),
      db.automation.count({ where: { workspaceId: input.workspaceId } }),
      db.automation.count({ where: { workspaceId: input.workspaceId, enabled: true } }),
      db.channel.count({ where: { workspaceId: input.workspaceId, type: "instagram", enabled: true } }),
      input.selectedChannelId
        ? db.channel.findFirst({
            where: { id: input.selectedChannelId, workspaceId: input.workspaceId, type: "instagram", enabled: true },
            select: { name: true, configJson: true },
          })
        : Promise.resolve(null),
      db.message.findMany({
        where: { ...channelWhere, createdAt: { gte: trendStart } },
        orderBy: { createdAt: "asc" },
        select: { createdAt: true },
      }),
    ]);

    const selectedChannelConfig = selectedChannel ? getMetaChannelConfig(selectedChannel.configJson) : null;
    const selectedChannelDisplayName =
      selectedChannelConfig?.instagramName ||
      selectedChannelConfig?.instagramUsername ||
      selectedChannel?.name ||
      null;

    return {
      contacts,
      messages,
      recentMessages,
      messageTrend: buildMessageTrendPoints(messageTrendRows),
      openConversations,
      broadcasts,
      queuedBroadcasts,
      sentCount: sentBroadcasts._sum.sentCount || 0,
      failedCount: sentBroadcasts._sum.failedCount || 0,
      automations,
      enabledAutomations,
      connectedInstagramChannels,
      selectedChannelDisplayName,
    };
  });
}
