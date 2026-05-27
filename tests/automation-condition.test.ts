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

describe("automation condition steps", () => {
  beforeEach(async () => {
    await cleanDb();
    const workspace = await ensureDefaultWorkspace();
    await db.channel.create({
      data: { workspaceId: workspace.id, type: "mock", name: "Local Mock", enabled: true, configJson: {} },
    });
    await db.automation.create({
      data: {
        workspaceId: workspace.id,
        name: "vip condition",
        enabled: true,
        triggerType: "keyword",
        triggerConfigJson: { keywords: ["vip"], match: "contains" },
        steps: {
          create: [
            {
              order: 1,
              type: "condition",
              configJson: {
                source: "inboundText",
                operator: "contains",
                value: "yes",
                falseAction: "stop",
              },
            },
            { order: 2, type: "send_message", configJson: { text: "VIP confirmed" } },
          ],
        },
      },
    });
  });

  it("stops the flow when a condition fails", async () => {
    const result = await handleInboundMessage({
      channelType: "mock",
      channelName: "Local Mock",
      externalId: "condition-fail",
      displayName: "Condition Fail",
      text: "vip no",
      consentStatus: "opted_in",
    });

    const messages = await db.message.findMany({
      where: { conversationId: result.conversation.id },
      orderBy: { createdAt: "asc" },
    });

    expect(messages).toHaveLength(1);
    expect(messages[0].direction).toBe("inbound");

    const run = await db.automationRun.findFirst({
      where: { conversationId: result.conversation.id },
    });
    expect(run?.status).toBe("completed");
    expect(run?.logsJson).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ type: "condition", passed: false }),
      ]),
    );
  });

  it("continues the flow when a condition passes", async () => {
    const result = await handleInboundMessage({
      channelType: "mock",
      channelName: "Local Mock",
      externalId: "condition-pass",
      displayName: "Condition Pass",
      text: "vip yes",
      consentStatus: "opted_in",
    });

    const messages = await db.message.findMany({
      where: { conversationId: result.conversation.id },
      orderBy: { createdAt: "asc" },
    });

    expect(messages).toHaveLength(2);
    expect(messages[1].direction).toBe("outbound");
    expect(messages[1].text).toBe("VIP confirmed");

    const run = await db.automationRun.findFirst({
      where: { conversationId: result.conversation.id },
    });
    expect(run?.status).toBe("completed");
    expect(run?.logsJson).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ type: "condition", passed: true }),
        expect.objectContaining({ type: "send_message", completed: true }),
      ]),
    );
  });
});
