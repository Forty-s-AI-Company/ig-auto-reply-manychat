import { beforeEach, describe, expect, it } from "vitest";
import { getBroadcastPreview } from "@/lib/broadcast-preview";
import { getDb } from "@/lib/db";
import { ensureDefaultWorkspace } from "@/lib/workspaces";

const db = getDb();

async function cleanDb() {
  await db.job.deleteMany();
  await db.broadcast.deleteMany();
  await db.contactTag.deleteMany();
  await db.contact.deleteMany();
  await db.tag.deleteMany();
  await db.channel.deleteMany();
  await db.segment.deleteMany();
}

describe("broadcast preview", () => {
  beforeEach(async () => {
    await cleanDb();
  });

  it("counts opted-in tagged recipients and skipped contacts", async () => {
    const workspace = await ensureDefaultWorkspace();
    const channel = await db.channel.create({
      data: { workspaceId: workspace.id, type: "mock", name: "Local Mock", enabled: true, configJson: {} },
    });
    const tag = await db.tag.create({
      data: { workspaceId: workspace.id, name: "lead", color: "#2563eb" },
    });
    const optedIn = await db.contact.create({
      data: {
        channelId: channel.id,
        externalId: "preview-1",
        displayName: "Preview One",
        consentStatus: "opted_in",
        metadataJson: {},
      },
    });
    const optedOut = await db.contact.create({
      data: {
        channelId: channel.id,
        externalId: "preview-2",
        displayName: "Preview Two",
        consentStatus: "opted_out",
        metadataJson: {},
      },
    });
    await db.contactTag.createMany({
      data: [
        { contactId: optedIn.id, tagId: tag.id },
        { contactId: optedOut.id, tagId: tag.id },
      ],
    });
    const broadcast = await db.broadcast.create({
      data: {
        workspaceId: workspace.id,
        name: "preview",
        targetConfigJson: { tagId: tag.id },
        messageJson: { text: "hello" },
      },
    });

    const preview = await getBroadcastPreview({ workspaceId: workspace.id, broadcastId: broadcast.id });
    expect(preview.totalCandidates).toBe(2);
    expect(preview.recipientCount).toBe(1);
    expect(preview.skippedCount).toBe(1);
    expect(preview.recipients[0].displayName).toBe("Preview One");
  });
});
