import { beforeEach, describe, expect, it } from "vitest";
import { getDb } from "@/lib/db";
import { queueBroadcast } from "@/lib/jobs";
import { segmentContactWhere } from "@/lib/segments";

const db = getDb();

async function cleanDb() {
  await db.job.deleteMany();
  await db.broadcast.deleteMany();
  await db.segment.deleteMany();
  await db.contactTag.deleteMany();
  await db.tag.deleteMany();
  await db.message.deleteMany();
  await db.conversation.deleteMany();
  await db.contact.deleteMany();
  await db.channel.deleteMany();
  await db.workspaceUser.deleteMany();
  await db.user.deleteMany();
  await db.workspace.deleteMany();
}

describe("segments", () => {
  beforeEach(async () => {
    await cleanDb();
  });

  it("matches contacts by tag and consent status", async () => {
    const workspace = await db.workspace.create({
      data: { id: "segment-workspace", name: "Segment Workspace", slug: "segment-workspace" },
    });
    const channel = await db.channel.create({
      data: {
        workspaceId: workspace.id,
        type: "instagram",
        name: "Instagram @demo",
        enabled: true,
        configJson: {},
      },
    });
    const tag = await db.tag.create({
      data: { workspaceId: workspace.id, name: "lead", color: "#2563eb" },
    });
    const included = await db.contact.create({
      data: {
        channelId: channel.id,
        externalId: "included",
        displayName: "Included",
        consentStatus: "opted_in",
        metadataJson: {},
        lastInboundAt: new Date(),
      },
    });
    const excluded = await db.contact.create({
      data: {
        channelId: channel.id,
        externalId: "excluded",
        displayName: "Excluded",
        consentStatus: "opted_out",
        metadataJson: {},
        lastInboundAt: new Date(),
      },
    });
    await db.contactTag.createMany({
      data: [
        { contactId: included.id, tagId: tag.id },
        { contactId: excluded.id, tagId: tag.id },
      ],
    });

    const count = await db.contact.count({
      where: segmentContactWhere(workspace.id, { tagId: tag.id, consentStatus: "opted_in" }),
    });

    expect(count).toBe(1);
  });

  it("queues broadcasts by segment recipients", async () => {
    const workspace = await db.workspace.create({
      data: { id: "segment-broadcast-workspace", name: "Segment Broadcast", slug: "segment-broadcast" },
    });
    const channel = await db.channel.create({
      data: {
        workspaceId: workspace.id,
        type: "instagram",
        name: "Instagram @demo",
        enabled: true,
        configJson: {},
      },
    });
    const contact = await db.contact.create({
      data: {
        channelId: channel.id,
        externalId: "recipient",
        displayName: "Recipient",
        consentStatus: "opted_in",
        metadataJson: {},
        lastInboundAt: new Date(),
      },
    });
    const segment = await db.segment.create({
      data: {
        workspaceId: workspace.id,
        name: "Active opted in",
        filterJson: { consentStatus: "opted_in", lastInboundWithinDays: 7 },
      },
    });
    const broadcast = await db.broadcast.create({
      data: {
        workspaceId: workspace.id,
        name: "Segment broadcast",
        targetConfigJson: { segmentId: segment.id },
        messageJson: { text: "Hello" },
      },
    });

    const queued = await queueBroadcast(broadcast.id);
    const jobs = await db.job.findMany({ where: { workspaceId: workspace.id } });

    expect(queued).toBe(1);
    expect(jobs).toHaveLength(1);
    expect((jobs[0].payloadJson as { contactId: string }).contactId).toBe(contact.id);
  });
});
