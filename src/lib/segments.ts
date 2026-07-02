import type { Prisma } from "@prisma/client";

type SegmentFilter = {
  q?: string | null;
  tagId?: string | null;
  consentStatus?: "opted_in" | "opted_out" | "unknown" | null;
  channelId?: string | null;
  lastInboundWithinDays?: number | null;
};

function asSegmentFilter(value: unknown): SegmentFilter {
  return (value || {}) as SegmentFilter;
}

export function segmentContactWhere(workspaceId: string, filterJson: unknown): Prisma.ContactWhereInput {
  const filter = asSegmentFilter(filterJson);
  const where: Prisma.ContactWhereInput = {
    channel: { workspaceId },
  };

  if (filter.channelId) {
    where.channelId = filter.channelId;
  }

  if (filter.q?.trim()) {
    const q = filter.q.trim();
    where.OR = [{ displayName: { contains: q } }, { username: { contains: q } }, { email: { contains: q } }];
  }

  if (filter.consentStatus) {
    where.consentStatus = filter.consentStatus;
  }

  if (filter.tagId) {
    where.tags = { some: { tagId: filter.tagId } };
  }

  if (filter.lastInboundWithinDays) {
    where.lastInboundAt = {
      gte: new Date(Date.now() - filter.lastInboundWithinDays * 24 * 60 * 60 * 1000),
    };
  }

  return where;
}
