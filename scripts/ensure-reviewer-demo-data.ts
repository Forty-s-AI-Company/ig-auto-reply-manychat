import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { loadProjectEnv } from "./load-env.mjs";

const PRODUCTION_SUPABASE_PROJECT_REF = "lmwvzskffzozuiamjxvc";

const REVIEWER_WORKSPACE_ID = "reviewer-demo-workspace";
const REVIEWER_WORKSPACE_SLUG = "reviewer-demo-workspace";
const REVIEWER_WORKSPACE_NAME = "InboxPilot Review Workspace";
const REVIEWER_CHANNEL_NAME = "Instagram Review Channel";
const REVIEWER_CONTACT_EXTERNAL_ID = "reviewer-demo-contact";
const REVIEWER_CONTACT_NAME = "Meta Reviewer Test Contact";
const REVIEWER_CONTACT_USERNAME = "meta_review_contact";
const REVIEWER_CONVERSATION_ID = "reviewer-demo-conversation";
const REVIEWER_AUTOMATION_ID = "reviewer-demo-keyword-automation";
const REVIEWER_AUTOMATION_NAME = "Meta Review Keyword Reply";
const REVIEWER_TAG_NAME = "reviewer-safe";
const REVIEWER_ADMIN_EMAIL = "reviewer-e2e-admin@example.com";
const REVIEWER_ADMIN_NAME = "Reviewer Demo Admin";

loadProjectEnv();

const testDatabaseUrl = process.env.TEST_DATABASE_URL?.trim();

if (!testDatabaseUrl) {
  throw new Error("TEST_DATABASE_URL is required before creating reviewer-safe demo data.");
}

if (process.env.INBOXPILOT_DB_ENV === "production" || testDatabaseUrl.includes(PRODUCTION_SUPABASE_PROJECT_REF)) {
  throw new Error("Refusing to create reviewer-safe demo data against the production database.");
}

process.env.DATABASE_URL = testDatabaseUrl;
process.env.DIRECT_URL = process.env.TEST_DIRECT_URL?.trim() || testDatabaseUrl;

const prisma = new PrismaClient();

async function main() {
  const password =
    process.env.REVIEWER_E2E_ADMIN_PASSWORD?.trim() ||
    process.env.EMPTY_E2E_ADMIN_PASSWORD?.trim() ||
    process.env.ADMIN_PASSWORD?.trim();
  const email = process.env.REVIEWER_E2E_ADMIN_EMAIL?.trim() || REVIEWER_ADMIN_EMAIL;
  const name = process.env.REVIEWER_E2E_ADMIN_NAME?.trim() || REVIEWER_ADMIN_NAME;

  if (!password) {
    throw new Error(
      "REVIEWER_E2E_ADMIN_PASSWORD, EMPTY_E2E_ADMIN_PASSWORD, or ADMIN_PASSWORD must be set before creating reviewer-safe demo data.",
    );
  }

  if (password.length < 8) {
    throw new Error("Reviewer demo admin password must be at least 8 characters.");
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.upsert({
    where: { email },
    update: { name, role: "admin", passwordHash },
    create: { email, name, role: "admin", passwordHash },
  });

  const workspace = await prisma.workspace.upsert({
    where: { id: REVIEWER_WORKSPACE_ID },
    update: { name: REVIEWER_WORKSPACE_NAME, slug: REVIEWER_WORKSPACE_SLUG },
    create: {
      id: REVIEWER_WORKSPACE_ID,
      name: REVIEWER_WORKSPACE_NAME,
      slug: REVIEWER_WORKSPACE_SLUG,
    },
  });

  await prisma.workspaceUser.upsert({
    where: { workspaceId_userId: { workspaceId: workspace.id, userId: user.id } },
    update: { role: "admin" },
    create: { workspaceId: workspace.id, userId: user.id, role: "admin" },
  });

  const channel = await prisma.channel.upsert({
    where: {
      workspaceId_type_name: {
        workspaceId: workspace.id,
        type: "instagram",
        name: REVIEWER_CHANNEL_NAME,
      },
    },
    update: {
      enabled: true,
      configJson: {
        source: "reviewer-safe-demo",
        connectedState: "local-rehearsal-only",
      },
    },
    create: {
      workspaceId: workspace.id,
      type: "instagram",
      name: REVIEWER_CHANNEL_NAME,
      enabled: true,
      configJson: {
        source: "reviewer-safe-demo",
        connectedState: "local-rehearsal-only",
      },
    },
  });

  const tag = await prisma.tag.upsert({
    where: { workspaceId_name: { workspaceId: workspace.id, name: REVIEWER_TAG_NAME } },
    update: { color: "#0f766e" },
    create: {
      workspaceId: workspace.id,
      name: REVIEWER_TAG_NAME,
      color: "#0f766e",
    },
  });

  const contact = await prisma.contact.upsert({
    where: {
      channelId_externalId: {
        channelId: channel.id,
        externalId: REVIEWER_CONTACT_EXTERNAL_ID,
      },
    },
    update: {
      displayName: REVIEWER_CONTACT_NAME,
      username: REVIEWER_CONTACT_USERNAME,
      email: "reviewer-demo-contact@example.com",
      phone: null,
      consentStatus: "opted_in",
      lastInboundAt: new Date(),
      metadataJson: { source: "reviewer-safe-demo" },
    },
    create: {
      channelId: channel.id,
      externalId: REVIEWER_CONTACT_EXTERNAL_ID,
      displayName: REVIEWER_CONTACT_NAME,
      username: REVIEWER_CONTACT_USERNAME,
      email: "reviewer-demo-contact@example.com",
      phone: null,
      consentStatus: "opted_in",
      lastInboundAt: new Date(),
      metadataJson: { source: "reviewer-safe-demo" },
    },
  });

  await prisma.contactTag.upsert({
    where: { contactId_tagId: { contactId: contact.id, tagId: tag.id } },
    update: {},
    create: { contactId: contact.id, tagId: tag.id },
  });

  const now = new Date();
  await prisma.conversation.upsert({
    where: { id: REVIEWER_CONVERSATION_ID },
    update: {
      contactId: contact.id,
      channelId: channel.id,
      status: "open",
      assignedToId: null,
      reminderAt: null,
      isFavorite: false,
      unreadCount: 1,
      lastMessageAt: now,
      lastReadAt: null,
    },
    create: {
      id: REVIEWER_CONVERSATION_ID,
      contactId: contact.id,
      channelId: channel.id,
      status: "open",
      unreadCount: 1,
      lastMessageAt: now,
      lastReadAt: null,
    },
  });

  await prisma.message.deleteMany({ where: { conversationId: REVIEWER_CONVERSATION_ID } });
  await prisma.message.create({
    data: {
      conversationId: REVIEWER_CONVERSATION_ID,
      contactId: contact.id,
      channelId: channel.id,
      direction: "inbound",
      messageType: "text",
      text: "Hi, I want product information.",
      payloadJson: {
        source: "reviewer-safe-demo",
        note: "Synthetic reviewer rehearsal message only.",
      },
    },
  });

  const automation = await prisma.automation.upsert({
    where: { id: REVIEWER_AUTOMATION_ID },
    update: {
      workspaceId: workspace.id,
      name: REVIEWER_AUTOMATION_NAME,
      enabled: false,
      triggerType: "keyword",
      triggerConfigJson: {
        keywords: ["price"],
        match: "contains",
        reviewerSafe: true,
      },
    },
    create: {
      id: REVIEWER_AUTOMATION_ID,
      workspaceId: workspace.id,
      name: REVIEWER_AUTOMATION_NAME,
      enabled: false,
      triggerType: "keyword",
      triggerConfigJson: {
        keywords: ["price"],
        match: "contains",
        reviewerSafe: true,
      },
    },
  });

  await prisma.automationStep.deleteMany({ where: { automationId: automation.id } });
  await prisma.automationStep.create({
    data: {
      automationId: automation.id,
      order: 1,
      type: "send_message",
      configJson: {
        text: "Thanks for your interest. Here is the product overview link prepared for review.",
      },
    },
  });

  console.log("[ensure-reviewer-demo-data] reviewer-safe local demo data is ready.");
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
