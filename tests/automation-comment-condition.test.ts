import { beforeEach, describe, expect, it } from "vitest";
import { executeAutomation } from "@/lib/automation/engine";
import { getDb } from "@/lib/db";
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
  await db.channel.deleteMany();
}

describe("comment automation conditions", () => {
  beforeEach(async () => {
    await cleanDb();
  });

  it("matches commentText against comma separated keywords", async () => {
    const workspace = await ensureDefaultWorkspace();
    const channel = await db.channel.create({
      data: { workspaceId: workspace.id, type: "mock", name: "Local Mock", enabled: true, configJson: {} },
    });
    const contact = await db.contact.create({
      data: {
        channelId: channel.id,
        externalId: "commenter-1",
        displayName: "Commenter",
        metadataJson: {},
      },
    });
    const conversation = await db.conversation.create({
      data: { channelId: channel.id, contactId: contact.id, status: "open" },
    });
    const automation = await db.automation.create({
      data: {
        workspaceId: workspace.id,
        name: "comment keyword",
        enabled: true,
        triggerType: "keyword",
        triggerConfigJson: { keywords: ["canva"], match: "contains" },
        steps: {
          create: [
            {
              order: 1,
              type: "condition",
              configJson: { source: "commentText", operator: "contains", value: "canva, 學習, tips" },
            },
            { order: 2, type: "send_message", configJson: { text: "命中留言關鍵字" } },
          ],
        },
      },
      include: { steps: { orderBy: { order: "asc" } } },
    });

    await executeAutomation({
      automation,
      contactId: contact.id,
      conversationId: conversation.id,
      inboundText: "我想看 Canva 教學",
    });

    const messages = await db.message.findMany({ where: { conversationId: conversation.id } });
    expect(messages).toHaveLength(1);
    expect(messages[0].text).toBe("命中留言關鍵字");
  });
});
