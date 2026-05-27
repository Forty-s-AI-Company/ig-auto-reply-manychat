import { beforeEach, describe, expect, it } from "vitest";
import { upsertContactFieldValue } from "@/lib/contact-fields";
import { getDb } from "@/lib/db";
import { ensureDefaultWorkspace } from "@/lib/workspaces";

const db = getDb();

async function cleanDb() {
  await db.sequenceSubscription.deleteMany();
  await db.sequenceStep.deleteMany();
  await db.sequence.deleteMany();
  await db.contactFieldValue.deleteMany();
  await db.contactFieldDefinition.deleteMany();
  await db.message.deleteMany();
  await db.conversation.deleteMany();
  await db.contactTag.deleteMany();
  await db.contact.deleteMany();
  await db.channel.deleteMany();
}

describe("contact custom fields", () => {
  beforeEach(async () => {
    await cleanDb();
  });

  it("upserts a contact field value by key", async () => {
    const workspace = await ensureDefaultWorkspace();
    const channel = await db.channel.create({
      data: { workspaceId: workspace.id, type: "mock", name: "Local Mock", enabled: true, configJson: {} },
    });
    const contact = await db.contact.create({
      data: {
        channelId: channel.id,
        externalId: "field-user",
        displayName: "Field User",
        metadataJson: {},
      },
    });
    await db.contactFieldDefinition.create({
      data: { workspaceId: workspace.id, key: "course_interest", label: "課程興趣", type: "text" },
    });

    await upsertContactFieldValue({
      workspaceId: workspace.id,
      contactId: contact.id,
      key: "course_interest",
      value: "Canva",
    });
    const updated = await upsertContactFieldValue({
      workspaceId: workspace.id,
      contactId: contact.id,
      key: "course_interest",
      value: "AI 自動化",
    });

    const values = await db.contactFieldValue.findMany({ where: { contactId: contact.id } });
    expect(values).toHaveLength(1);
    expect(updated.value).toBe("AI 自動化");
  });
});
