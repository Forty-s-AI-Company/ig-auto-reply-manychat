import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { loadProjectEnv } from "./load-env.mjs";

const PRODUCTION_SUPABASE_PROJECT_REF = "lmwvzskffzozuiamjxvc";
const DEFAULT_WORKSPACE_ID = "default-workspace";
const DEFAULT_WORKSPACE_SLUG = "default";
const E2E_CHANNEL_NAME = "Instagram E2E";
const E2E_ALT_CHANNEL_NAME = "Instagram E2E Alt";

loadProjectEnv();

const testDatabaseUrl = process.env.TEST_DATABASE_URL?.trim();

if (!testDatabaseUrl) {
  throw new Error("TEST_DATABASE_URL is required before creating an E2E admin user.");
}

if (process.env.INBOXPILOT_DB_ENV === "production" || testDatabaseUrl.includes(PRODUCTION_SUPABASE_PROJECT_REF)) {
  throw new Error("Refusing to create an E2E admin user against the production database.");
}

process.env.DATABASE_URL = testDatabaseUrl;
process.env.DIRECT_URL = process.env.TEST_DIRECT_URL?.trim() || testDatabaseUrl;

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL?.trim();
  const password = process.env.ADMIN_PASSWORD?.trim();
  const name = process.env.ADMIN_NAME?.trim() || "Admin";

  if (!email || !password) {
    throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD must be set before creating an E2E admin user.");
  }

  if (password.length < 8) {
    throw new Error("ADMIN_PASSWORD must be at least 8 characters.");
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.upsert({
    where: { email },
    update: { name, role: "admin", passwordHash },
    create: { email, name, role: "admin", passwordHash },
  });

  const workspace = await prisma.workspace.upsert({
    where: { id: DEFAULT_WORKSPACE_ID },
    update: {},
    create: { id: DEFAULT_WORKSPACE_ID, name: "Default Workspace", slug: DEFAULT_WORKSPACE_SLUG },
  });

  await prisma.workspaceUser.upsert({
    where: { workspaceId_userId: { workspaceId: workspace.id, userId: user.id } },
    update: { role: "admin" },
    create: { workspaceId: workspace.id, userId: user.id, role: "admin" },
  });

  const channel = await prisma.channel.upsert({
    where: { workspaceId_type_name: { workspaceId: workspace.id, type: "instagram", name: E2E_CHANNEL_NAME } },
    update: { enabled: true, configJson: { source: "e2e-smoke" } },
    create: {
      workspaceId: workspace.id,
      type: "instagram",
      name: E2E_CHANNEL_NAME,
      enabled: true,
      configJson: { source: "e2e-smoke" },
    },
  });
  const altChannel = await prisma.channel.upsert({
    where: { workspaceId_type_name: { workspaceId: workspace.id, type: "instagram", name: E2E_ALT_CHANNEL_NAME } },
    update: { enabled: true, configJson: { source: "e2e-smoke-alt" } },
    create: {
      workspaceId: workspace.id,
      type: "instagram",
      name: E2E_ALT_CHANNEL_NAME,
      enabled: true,
      configJson: { source: "e2e-smoke-alt" },
    },
  });

  const vipTag = await prisma.tag.upsert({
    where: { workspaceId_name: { workspaceId: workspace.id, name: "e2e-vip" } },
    update: { color: "#7c3aed" },
    create: { workspaceId: workspace.id, name: "e2e-vip", color: "#7c3aed" },
  });
  const followupTag = await prisma.tag.upsert({
    where: { workspaceId_name: { workspaceId: workspace.id, name: "e2e-followup" } },
    update: { color: "#f97316" },
    create: { workspaceId: workspace.id, name: "e2e-followup", color: "#f97316" },
  });
  const detailSeedTag = await prisma.tag.upsert({
    where: { workspaceId_name: { workspaceId: workspace.id, name: "e2e-detail-tag" } },
    update: { color: "#0891b2" },
    create: { workspaceId: workspace.id, name: "e2e-detail-tag", color: "#0891b2" },
  });

  await prisma.contactTag.deleteMany({
    where: {
      contactId: { in: ["e2e-contact-detail", "e2e-contact-detail-chromium", "e2e-contact-detail-mobile"] },
      tagId: detailSeedTag.id,
    },
  });
  await prisma.contactTag.deleteMany({
    where: {
      tagId: { in: [vipTag.id, followupTag.id] },
      contact: {
        channelId: channel.id,
        externalId: {
          in: ["e2e-contact-1", "e2e-contact-2", "e2e-batch-contact-chromium", "e2e-batch-contact-mobile"],
        },
      },
    },
  });

  for (const contact of [
    {
      id: "e2e-contact-detail",
      externalId: "e2e-contact-detail",
      displayName: "E2E 詳情頁聯絡人",
      username: "detail_before",
      email: "detail-before@example.com",
      phone: "0900000000",
      consentStatus: "opted_in" as const,
    },
    {
      id: "e2e-contact-detail-chromium",
      externalId: "e2e-contact-detail-chromium",
      displayName: "E2E 詳情頁聯絡人 Desktop",
      username: "detail_before",
      email: "detail-before@example.com",
      phone: "0900000000",
      consentStatus: "opted_in" as const,
    },
    {
      id: "e2e-contact-detail-mobile",
      externalId: "e2e-contact-detail-mobile",
      displayName: "E2E 詳情頁聯絡人 Mobile",
      username: "detail_before",
      email: "detail-before@example.com",
      phone: "0900000000",
      consentStatus: "opted_in" as const,
    },
    {
      id: undefined,
      externalId: "e2e-batch-contact-chromium",
      displayName: "E2E 批次聯絡人 Desktop",
      username: "e2e_batch_desktop",
      email: "e2e-batch-desktop@example.com",
      phone: null,
      consentStatus: "opted_in" as const,
    },
    {
      id: undefined,
      externalId: "e2e-batch-contact-mobile",
      displayName: "E2E 批次聯絡人 Mobile",
      username: "e2e_batch_mobile",
      email: "e2e-batch-mobile@example.com",
      phone: null,
      consentStatus: "opted_in" as const,
    },
    {
      id: undefined,
      externalId: "e2e-contact-1",
      displayName: "E2E 測試聯絡人 A",
      username: "e2e_contact_a",
      email: "e2e-a@example.com",
      phone: null,
      consentStatus: "opted_in" as const,
    },
    {
      id: undefined,
      externalId: "e2e-contact-2",
      displayName: "E2E 測試聯絡人 B",
      username: "e2e_contact_b",
      email: "e2e-b@example.com",
      phone: null,
      consentStatus: "unknown" as const,
    },
  ]) {
    await prisma.contact.upsert({
      where: { channelId_externalId: { channelId: channel.id, externalId: contact.externalId } },
      update: {
        displayName: contact.displayName,
        username: contact.username,
        email: contact.email,
        phone: contact.phone,
        consentStatus: contact.consentStatus,
        lastInboundAt: new Date(),
        metadataJson: { source: "e2e-smoke" },
      },
      create: {
        ...(contact.id ? { id: contact.id } : {}),
        channelId: channel.id,
        externalId: contact.externalId,
        displayName: contact.displayName,
        username: contact.username,
        email: contact.email,
        phone: contact.phone,
        consentStatus: contact.consentStatus,
        lastInboundAt: new Date(),
        metadataJson: { source: "e2e-smoke" },
      },
    });
  }

  const primaryContact = await prisma.contact.findUniqueOrThrow({
    where: { channelId_externalId: { channelId: channel.id, externalId: "e2e-contact-1" } },
  });
  const unreadContact = await prisma.contact.findUniqueOrThrow({
    where: { channelId_externalId: { channelId: channel.id, externalId: "e2e-contact-2" } },
  });
  const altContact = await prisma.contact.upsert({
    where: { channelId_externalId: { channelId: altChannel.id, externalId: "e2e-inbox-alt-contact" } },
    update: {
      displayName: "E2E 第二 IG 帳號聯絡人",
      username: "e2e_alt_ig",
      consentStatus: "opted_in",
      lastInboundAt: new Date(),
      metadataJson: { source: "e2e-inbox-alt" },
    },
    create: {
      channelId: altChannel.id,
      externalId: "e2e-inbox-alt-contact",
      displayName: "E2E 第二 IG 帳號聯絡人",
      username: "e2e_alt_ig",
      consentStatus: "opted_in",
      lastInboundAt: new Date(),
      metadataJson: { source: "e2e-inbox-alt" },
    },
  });

  const now = new Date();
  const inboxFixtures = [
    {
      id: "e2e-inbox-primary-conversation",
      contactId: primaryContact.id,
      channelId: channel.id,
      text: "E2E Inbox 主要對話，可搜尋與選取",
      unreadCount: 0,
    },
    {
      id: "e2e-inbox-unread-conversation",
      contactId: unreadContact.id,
      channelId: channel.id,
      text: "E2E Inbox 未讀篩選對話",
      unreadCount: 2,
    },
    {
      id: "e2e-inbox-alt-conversation",
      contactId: altContact.id,
      channelId: altChannel.id,
      text: "E2E Inbox 第二 IG channel scope 對話",
      unreadCount: 1,
    },
  ];

  await prisma.message.deleteMany({
    where: { conversationId: { in: inboxFixtures.map((fixture) => fixture.id) } },
  });

  for (const fixture of inboxFixtures) {
    await prisma.conversation.upsert({
      where: { id: fixture.id },
      update: {
        contactId: fixture.contactId,
        channelId: fixture.channelId,
        status: "open",
        assignedToId: null,
        reminderAt: null,
        isFavorite: false,
        unreadCount: fixture.unreadCount,
        lastMessageAt: now,
        lastReadAt: fixture.unreadCount > 0 ? null : now,
      },
      create: {
        id: fixture.id,
        contactId: fixture.contactId,
        channelId: fixture.channelId,
        status: "open",
        unreadCount: fixture.unreadCount,
        lastMessageAt: now,
        lastReadAt: fixture.unreadCount > 0 ? null : now,
      },
    });
    await prisma.message.create({
      data: {
        conversationId: fixture.id,
        contactId: fixture.contactId,
        channelId: fixture.channelId,
        direction: "inbound",
        messageType: "text",
        text: fixture.text,
        payloadJson: { source: "e2e-inbox-smoke" },
      },
    });
  }

  console.log("[ensure-e2e-admin] admin user is ready in the local test workspace.");
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
