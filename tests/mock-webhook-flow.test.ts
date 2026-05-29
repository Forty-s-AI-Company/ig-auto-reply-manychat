import { beforeEach, describe, expect, it } from "vitest";
import { getDb } from "@/lib/db";
import { handleInboundMessage } from "@/lib/messages";
import { ensureDefaultWorkspace } from "@/lib/workspaces";

const db = getDb();

async function cleanDb() {
  await db.job.deleteMany();
  await db.automationRun.deleteMany();
  await db.automationStep.deleteMany();
  await db.automation.deleteMany();
  await db.message.deleteMany();
  await db.conversation.deleteMany();
  await db.contactTag.deleteMany();
  await db.contact.deleteMany();
  await db.tag.deleteMany();
  await db.channel.deleteMany();
  await db.knowledgeBaseItem.deleteMany();
}

describe("mock inbound webhook flow", () => {
  beforeEach(async () => {
    await cleanDb();
    const workspace = await ensureDefaultWorkspace();
    await db.channel.create({
      data: { workspaceId: workspace.id, type: "mock", name: "Local Mock", enabled: true, configJson: {} },
    });
    await db.tag.create({ data: { workspaceId: workspace.id, name: "lead", color: "#2563eb" } });
    await db.knowledgeBaseItem.create({
      data: { workspaceId: workspace.id, title: "產品資料", content: "請提供 demo link。", enabled: true },
    });
    await db.automation.create({
      data: {
        workspaceId: workspace.id,
        name: "keyword",
        enabled: true,
        triggerType: "keyword",
        triggerConfigJson: { keywords: ["資料"], match: "contains" },
        steps: {
          create: [
            { order: 1, type: "send_message", configJson: { text: "資料連結：{{demo_link}}" } },
            { order: 2, type: "add_tag", configJson: { tagName: "lead" } },
            { order: 3, type: "ai_reply", configJson: {} },
          ],
        },
      },
    });
  });

  it("creates contact, conversation, inbound message and automation replies", async () => {
    const result = await handleInboundMessage({
      channelType: "mock",
      channelName: "Local Mock",
      externalId: "mock-test",
      displayName: "Mock Test",
      text: "請給我資料",
      consentStatus: "opted_in",
    });

    const messages = await db.message.findMany({
      where: { conversationId: result.conversation.id },
      orderBy: { createdAt: "asc" },
    });
    const tags = await db.contactTag.findMany({ where: { contactId: result.contact.id } });

    expect(messages).toHaveLength(3);
    expect(messages[0].direction).toBe("inbound");
    expect(messages[1].text).toContain("資料連結");
    expect(tags).toHaveLength(1);
  }, 45000);
});
