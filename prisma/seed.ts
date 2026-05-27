import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const DEFAULT_WORKSPACE_ID = "default-workspace";

async function main() {
  const email = process.env.ADMIN_EMAIL || "admin@example.com";
  const password = process.env.ADMIN_PASSWORD || "admin123456";
  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.upsert({
    where: { email },
    update: { passwordHash, name: process.env.ADMIN_NAME || "Admin", role: "admin" },
    create: {
      email,
      passwordHash,
      name: process.env.ADMIN_NAME || "Admin",
      role: "admin",
    },
  });

  const workspace = await prisma.workspace.upsert({
    where: { id: DEFAULT_WORKSPACE_ID },
    update: {},
    create: {
      id: DEFAULT_WORKSPACE_ID,
      name: "Default Workspace",
      slug: "default",
    },
  });

  await prisma.workspaceUser.upsert({
    where: { workspaceId_userId: { workspaceId: workspace.id, userId: user.id } },
    update: { role: user.role },
    create: { workspaceId: workspace.id, userId: user.id, role: user.role },
  });

  await prisma.channel.upsert({
    where: { workspaceId_type_name: { workspaceId: workspace.id, type: "mock", name: "Local Mock" } },
    update: { enabled: true, configJson: { note: "Local testing channel" } },
    create: {
      workspaceId: workspace.id,
      type: "mock",
      name: "Local Mock",
      enabled: true,
      configJson: { note: "Local testing channel" },
    },
  });

  await prisma.channel.upsert({
    where: { workspaceId_type_name: { workspaceId: workspace.id, type: "telegram", name: "Telegram Bot" } },
    update: { enabled: false, configJson: { tokenEnv: "TELEGRAM_BOT_TOKEN" } },
    create: {
      workspaceId: workspace.id,
      type: "telegram",
      name: "Telegram Bot",
      enabled: false,
      configJson: { tokenEnv: "TELEGRAM_BOT_TOKEN" },
    },
  });

  for (const tag of [
    { name: "lead", color: "#2563eb" },
    { name: "customer", color: "#16a34a" },
    { name: "needs-followup", color: "#f97316" },
  ]) {
    await prisma.tag.upsert({
      where: { workspaceId_name: { workspaceId: workspace.id, name: tag.name } },
      update: { color: tag.color },
      create: { ...tag, workspaceId: workspace.id },
    });
  }

  await prisma.knowledgeBaseItem.upsert({
    where: { id: "demo-kb-1" },
    update: {
      workspaceId: workspace.id,
      title: "產品資料",
      content: "如果使用者索取產品資料，請提供 demo link，並提醒可以回覆問題。",
      enabled: true,
    },
    create: {
      id: "demo-kb-1",
      workspaceId: workspace.id,
      title: "產品資料",
      content: "如果使用者索取產品資料，請提供 demo link，並提醒可以回覆問題。",
      enabled: true,
    },
  });

  const automation = await prisma.automation.upsert({
    where: { id: "demo-keyword-automation" },
    update: {
      workspaceId: workspace.id,
      name: "關鍵字自動回覆",
      enabled: true,
      triggerType: "keyword",
      triggerConfigJson: { keywords: ["資料"], match: "contains" },
    },
    create: {
      id: "demo-keyword-automation",
      workspaceId: workspace.id,
      name: "關鍵字自動回覆",
      enabled: true,
      triggerType: "keyword",
      triggerConfigJson: { keywords: ["資料"], match: "contains" },
    },
  });

  await prisma.automationStep.deleteMany({ where: { automationId: automation.id } });
  await prisma.automationStep.createMany({
    data: [
      {
        automationId: automation.id,
        order: 1,
        type: "send_message",
        configJson: {
          text: "收到，這是你的資料連結：{{demo_link}}",
        },
      },
      {
        automationId: automation.id,
        order: 2,
        type: "add_tag",
        configJson: { tagName: "lead" },
      },
      {
        automationId: automation.id,
        order: 3,
        type: "ai_reply",
        configJson: {
          prompt: "請根據知識庫，用自然、簡短的語氣回答。",
        },
      },
    ],
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
