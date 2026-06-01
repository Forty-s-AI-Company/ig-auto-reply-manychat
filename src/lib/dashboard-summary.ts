import { instagramChannelWhere } from "@/lib/account-scope";
import { publicChannelSelect } from "@/lib/channels/public";
import { getDb } from "@/lib/db";
import { getServerCache } from "@/lib/server-cache";

const DASHBOARD_SUMMARY_CACHE_TTL_MS = 5_000;

type SummaryInput = {
  workspaceId: string;
  selectedChannelId?: string;
};

function summaryCacheKey(prefix: string, { workspaceId, selectedChannelId }: SummaryInput) {
  return `${prefix}:${workspaceId}:${selectedChannelId || "all"}`;
}

export function getDashboardSummary(input: SummaryInput) {
  return getServerCache(summaryCacheKey("dashboard-summary", input), DASHBOARD_SUMMARY_CACHE_TTL_MS, async () => {
    const db = getDb();
    const channelWhere = instagramChannelWhere(input.selectedChannelId, input.workspaceId);

    const [
      contacts,
      messages,
      openConversations,
      automations,
      connectedInstagramChannelRows,
      recentMessages,
      recentAutomations,
    ] = await Promise.all([
      db.contact.count({ where: channelWhere }),
      db.message.count({ where: channelWhere }),
      db.conversation.count({ where: { status: "open", ...channelWhere } }),
      db.automation.count({ where: { workspaceId: input.workspaceId } }),
      db.channel.findMany({
        where: { workspaceId: input.workspaceId, type: "instagram", enabled: true },
        select: { configJson: true, name: true },
      }),
      db.message.findMany({
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
      }),
      db.automation.findMany({
        where: { workspaceId: input.workspaceId },
        orderBy: { updatedAt: "desc" },
        take: 4,
        select: {
          id: true,
          name: true,
          enabled: true,
          _count: { select: { steps: true } },
        },
      }),
    ]);

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
    ]);

    return {
      contacts,
      messages,
      recentMessages,
      openConversations,
      broadcasts,
      queuedBroadcasts,
      sentCount: sentBroadcasts._sum.sentCount || 0,
      failedCount: sentBroadcasts._sum.failedCount || 0,
      automations,
      enabledAutomations,
    };
  });
}
