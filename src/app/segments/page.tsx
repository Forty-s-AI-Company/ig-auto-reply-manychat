import { AdminShell } from "@/components/AdminShell";
import { SegmentsClient } from "@/components/SegmentsClient";
import { requireUser } from "@/lib/auth";
import { publicChannelSelect } from "@/lib/channels/public";
import { getDb } from "@/lib/db";
import { segmentContactWhere } from "@/lib/segments";
import { getCurrentWorkspaceId } from "@/lib/workspaces";

export default async function SegmentsPage() {
  await requireUser();
  const workspaceId = await getCurrentWorkspaceId();
  const db = getDb();
  const [segments, tags, channels] = await Promise.all([
    db.segment.findMany({ where: { workspaceId }, orderBy: { updatedAt: "desc" } }),
    db.tag.findMany({ where: { workspaceId }, orderBy: { name: "asc" } }),
    db.channel.findMany({
      where: { workspaceId, type: "instagram", enabled: true },
      orderBy: { name: "asc" },
      select: publicChannelSelect,
    }),
  ]);
  const segmentsWithCounts = await Promise.all(
    segments.map(async (segment) => ({
      ...segment,
      contactCount: await db.contact.count({
        where: segmentContactWhere(workspaceId, segment.filterJson),
      }),
    })),
  );

  return (
    <AdminShell title="分眾名單">
      <SegmentsClient
        initialSegments={JSON.parse(JSON.stringify(segmentsWithCounts))}
        tags={JSON.parse(JSON.stringify(tags))}
        channels={JSON.parse(JSON.stringify(channels))}
      />
    </AdminShell>
  );
}
