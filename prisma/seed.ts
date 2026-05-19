import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL || "admin@example.com";
  const password = process.env.ADMIN_PASSWORD || "admin123456";
  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.user.upsert({
    where: { email },
    update: { passwordHash, name: process.env.ADMIN_NAME || "Admin", role: "admin" },
    create: {
      email,
      passwordHash,
      name: process.env.ADMIN_NAME || "Admin",
      role: "admin",
    },
  });

  await prisma.channel.upsert({
    where: { type_name: { type: "mock", name: "Local Mock" } },
    update: { enabled: true, configJson: { note: "Local testing channel" } },
    create: {
      type: "mock",
      name: "Local Mock",
      enabled: true,
      configJson: { note: "Local testing channel" },
    },
  });

  await prisma.channel.upsert({
    where: { type_name: { type: "telegram", name: "Telegram Bot" } },
    update: { enabled: false, configJson: { tokenEnv: "TELEGRAM_BOT_TOKEN" } },
    create: {
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
      where: { name: tag.name },
      update: { color: tag.color },
      create: tag,
    });
  }

  await prisma.knowledgeBaseItem.upsert({
    where: { id: "demo-kb-1" },
    update: {
      title: "領取資料",
      content:
        "如果使用者想領取資料，請提供 demo link，並提醒對方可以直接回覆問題。",
      enabled: true,
    },
    create: {
      id: "demo-kb-1",
      title: "領取資料",
      content:
        "如果使用者想領取資料，請提供 demo link，並提醒對方可以直接回覆問題。",
      enabled: true,
    },
  });

  const automation = await prisma.automation.upsert({
    where: { id: "demo-keyword-automation" },
    update: {
      name: "關鍵字：領取",
      enabled: true,
      triggerType: "keyword",
      triggerConfigJson: { keywords: ["領取"], match: "contains" },
    },
    create: {
      id: "demo-keyword-automation",
      name: "關鍵字：領取",
      enabled: true,
      triggerType: "keyword",
      triggerConfigJson: { keywords: ["領取"], match: "contains" },
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
          text: "你好，這是你要領取的資料連結：{{demo_link}}",
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
          prompt: "請用簡短、自然的語氣補充說明。",
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
