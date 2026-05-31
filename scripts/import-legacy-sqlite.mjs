import { spawnSync } from "node:child_process";
import { PrismaClient } from "@prisma/client";
import { loadProjectEnv } from "./load-env.mjs";

loadProjectEnv();

const LEGACY_DB_PATH = "prisma/dev.db";
const DEFAULT_WORKSPACE_ID = "default-workspace";

function readLegacyTables() {
  const python = spawnSync(
    "python",
    [
      "-c",
      `
import json, sqlite3
conn = sqlite3.connect(${JSON.stringify(LEGACY_DB_PATH)})
conn.row_factory = sqlite3.Row
cur = conn.cursor()
tables = ["Workspace","WorkspaceUser","Channel","Tag","KnowledgeBaseItem","Automation","AutomationStep","Contact","ContactTag","Conversation","Message","AutomationRun"]
result = {}
for table in tables:
    result[table] = [dict(row) for row in cur.execute(f'SELECT * FROM "{table}"').fetchall()]
print(json.dumps(result, ensure_ascii=False))
conn.close()
      `,
    ],
    { encoding: "utf8", cwd: process.cwd() },
  );

  if (python.status !== 0) {
    throw new Error(python.stderr || "Failed to read legacy SQLite database.");
  }

  return JSON.parse(python.stdout);
}

function normalizeValue(value) {
  if (value === null || value === undefined) return null;
  if (typeof value === "number") return new Date(value);
  return new Date(value);
}

function parseJson(value, fallback = {}) {
  if (!value) return fallback;
  if (typeof value === "object") return value;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

async function main() {
  const legacy = readLegacyTables();
  const prisma = new PrismaClient();

  try {
    const channelIdMap = new Map();
    const tagIdMap = new Map();
    const automationIdMap = new Map();
    const contactIdMap = new Map();
    const conversationIdMap = new Map();

    const workspace = legacy.Workspace.find((item) => item.id === DEFAULT_WORKSPACE_ID);
    if (!workspace) throw new Error("Legacy default workspace not found.");

    await prisma.workspace.upsert({
      where: { id: workspace.id },
      update: { name: workspace.name, slug: workspace.slug },
      create: { id: workspace.id, name: workspace.name, slug: workspace.slug },
    });

    const adminEmail = process.env.ADMIN_EMAIL?.trim();
    const admin = adminEmail
      ? await prisma.user.findUnique({ where: { email: adminEmail } })
      : null;
    if (admin) {
      await prisma.workspaceUser.upsert({
        where: { workspaceId_userId: { workspaceId: workspace.id, userId: admin.id } },
        update: { role: "admin" },
        create: { workspaceId: workspace.id, userId: admin.id, role: "admin" },
      });
    }

    const channels = legacy.Channel.filter((item) => item.workspaceId === workspace.id);
    for (const channel of channels) {
      const existing = await prisma.channel.findFirst({
        where: { workspaceId: workspace.id, type: channel.type, name: channel.name },
      });
      const data = {
        workspaceId: workspace.id,
        type: channel.type,
        name: channel.name,
        enabled: Boolean(channel.enabled),
        configJson: parseJson(channel.configJson),
      };
      if (existing) {
        await prisma.channel.update({ where: { id: existing.id }, data });
        channelIdMap.set(channel.id, existing.id);
      } else {
        const created = await prisma.channel.create({ data: { id: channel.id, ...data } });
        channelIdMap.set(channel.id, created.id);
      }
    }

    for (const tag of legacy.Tag.filter((item) => item.workspaceId === workspace.id)) {
      const upserted = await prisma.tag.upsert({
        where: { workspaceId_name: { workspaceId: workspace.id, name: tag.name } },
        update: { color: tag.color },
        create: { id: tag.id, workspaceId: workspace.id, name: tag.name, color: tag.color },
      });
      tagIdMap.set(tag.id, upserted.id);
    }

    for (const item of legacy.KnowledgeBaseItem.filter((entry) => entry.workspaceId === workspace.id)) {
      await prisma.knowledgeBaseItem.upsert({
        where: { id: item.id },
        update: {
          workspaceId: workspace.id,
          title: item.title,
          content: item.content,
          enabled: Boolean(item.enabled),
        },
        create: {
          id: item.id,
          workspaceId: workspace.id,
          title: item.title,
          content: item.content,
          enabled: Boolean(item.enabled),
        },
      });
    }

    for (const automation of legacy.Automation.filter((item) => item.workspaceId === workspace.id)) {
      const upserted = await prisma.automation.upsert({
        where: { id: automation.id },
        update: {
          workspaceId: workspace.id,
          name: automation.name,
          enabled: Boolean(automation.enabled),
          triggerType: automation.triggerType,
          triggerConfigJson: parseJson(automation.triggerConfigJson),
        },
        create: {
          id: automation.id,
          workspaceId: workspace.id,
          name: automation.name,
          enabled: Boolean(automation.enabled),
          triggerType: automation.triggerType,
          triggerConfigJson: parseJson(automation.triggerConfigJson),
        },
      });
      automationIdMap.set(automation.id, upserted.id);
    }

    for (const step of legacy.AutomationStep) {
      await prisma.automationStep.upsert({
        where: { id: step.id },
        update: {
          automationId: automationIdMap.get(step.automationId) || step.automationId,
          order: step.order,
          type: step.type,
          configJson: parseJson(step.configJson),
        },
        create: {
          id: step.id,
          automationId: automationIdMap.get(step.automationId) || step.automationId,
          order: step.order,
          type: step.type,
          configJson: parseJson(step.configJson),
        },
      });
    }

    for (const contact of legacy.Contact) {
      const upserted = await prisma.contact.upsert({
        where: { id: contact.id },
        update: {
          channelId: channelIdMap.get(contact.channelId) || contact.channelId,
          externalId: contact.externalId,
          displayName: contact.displayName,
          username: contact.username,
          email: contact.email,
          phone: contact.phone,
          locale: contact.locale,
          timezone: contact.timezone,
          lastInboundAt: normalizeValue(contact.lastInboundAt),
          lastOutboundAt: normalizeValue(contact.lastOutboundAt),
          consentStatus: contact.consentStatus,
          metadataJson: parseJson(contact.metadataJson),
        },
        create: {
          id: contact.id,
          channelId: channelIdMap.get(contact.channelId) || contact.channelId,
          externalId: contact.externalId,
          displayName: contact.displayName,
          username: contact.username,
          email: contact.email,
          phone: contact.phone,
          locale: contact.locale,
          timezone: contact.timezone,
          lastInboundAt: normalizeValue(contact.lastInboundAt),
          lastOutboundAt: normalizeValue(contact.lastOutboundAt),
          consentStatus: contact.consentStatus,
          metadataJson: parseJson(contact.metadataJson),
        },
      });
      contactIdMap.set(contact.id, upserted.id);
    }

    for (const conversation of legacy.Conversation) {
      const upserted = await prisma.conversation.upsert({
        where: { id: conversation.id },
        update: {
          contactId: contactIdMap.get(conversation.contactId) || conversation.contactId,
          channelId: channelIdMap.get(conversation.channelId) || conversation.channelId,
          status: conversation.status,
          assignedToId: conversation.assignedToId,
          lastMessageAt: normalizeValue(conversation.lastMessageAt),
        },
        create: {
          id: conversation.id,
          contactId: contactIdMap.get(conversation.contactId) || conversation.contactId,
          channelId: channelIdMap.get(conversation.channelId) || conversation.channelId,
          status: conversation.status,
          assignedToId: conversation.assignedToId,
          lastMessageAt: normalizeValue(conversation.lastMessageAt),
        },
      });
      conversationIdMap.set(conversation.id, upserted.id);
    }

    for (const message of legacy.Message) {
      await prisma.message.upsert({
        where: { id: message.id },
        update: {
          conversationId: conversationIdMap.get(message.conversationId) || message.conversationId,
          contactId: contactIdMap.get(message.contactId) || message.contactId,
          channelId: channelIdMap.get(message.channelId) || message.channelId,
          direction: message.direction,
          messageType: message.messageType,
          text: message.text,
          payloadJson: parseJson(message.payloadJson),
          providerMessageId: message.providerMessageId,
        },
        create: {
          id: message.id,
          conversationId: conversationIdMap.get(message.conversationId) || message.conversationId,
          contactId: contactIdMap.get(message.contactId) || message.contactId,
          channelId: channelIdMap.get(message.channelId) || message.channelId,
          direction: message.direction,
          messageType: message.messageType,
          text: message.text,
          payloadJson: parseJson(message.payloadJson),
          providerMessageId: message.providerMessageId,
          createdAt: normalizeValue(message.createdAt) || undefined,
        },
      });
    }

    for (const relation of legacy.ContactTag) {
      await prisma.contactTag.upsert({
        where: {
          contactId_tagId: {
            contactId: contactIdMap.get(relation.contactId) || relation.contactId,
            tagId: tagIdMap.get(relation.tagId) || relation.tagId,
          },
        },
        update: {},
        create: {
          contactId: contactIdMap.get(relation.contactId) || relation.contactId,
          tagId: tagIdMap.get(relation.tagId) || relation.tagId,
          createdAt: normalizeValue(relation.createdAt) || undefined,
        },
      });
    }

    for (const run of legacy.AutomationRun) {
      await prisma.automationRun.upsert({
        where: { id: run.id },
        update: {
          automationId: automationIdMap.get(run.automationId) || run.automationId,
          contactId: contactIdMap.get(run.contactId) || run.contactId,
          conversationId: conversationIdMap.get(run.conversationId) || run.conversationId,
          status: run.status,
          currentStep: run.currentStep,
          logsJson: parseJson(run.logsJson, []),
        },
        create: {
          id: run.id,
          automationId: automationIdMap.get(run.automationId) || run.automationId,
          contactId: contactIdMap.get(run.contactId) || run.contactId,
          conversationId: conversationIdMap.get(run.conversationId) || run.conversationId,
          status: run.status,
          currentStep: run.currentStep,
          logsJson: parseJson(run.logsJson, []),
        },
      });
    }

    console.log(JSON.stringify({ ok: true, importedWorkspaceId: workspace.id }, null, 2));
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
