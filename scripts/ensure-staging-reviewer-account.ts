import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { loadProjectEnv } from "./load-env.mjs";

const PRODUCTION_SUPABASE_PROJECT_REF = "lmwvzskffzozuiamjxvc";
const STAGING_SUPABASE_PROJECT_REF = "ndhtwqtshselqwgjenjd";

loadProjectEnv();

function requiredEnv(name: string) {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`${name} is required in .env.local before creating reviewer-safe staging data.`);
  }
  return value;
}

function assertReviewerStagingEnv() {
  const reviewerMode = process.env.REVIEWER_STAGING_MODE?.trim().toLowerCase();
  if (reviewerMode !== "true") {
    throw new Error("REVIEWER_STAGING_MODE=true is required before creating reviewer-safe staging data.");
  }

  const databaseUrl = process.env.DATABASE_URL?.trim() || "";
  const directUrl = process.env.DIRECT_URL?.trim() || "";
  const baseUrl = requiredEnv("REVIEWER_STAGING_BASE_URL");

  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required before creating reviewer-safe staging data.");
  }

  if (!baseUrl.includes("staging.carry-digital-nomad.in.net")) {
    throw new Error("REVIEWER_STAGING_BASE_URL must point to the staging domain.");
  }

  const combinedUrls = `${databaseUrl}\n${directUrl}`;
  if (process.env.INBOXPILOT_DB_ENV === "production" || combinedUrls.includes(PRODUCTION_SUPABASE_PROJECT_REF)) {
    throw new Error("Refusing to create reviewer-safe staging data against the production database.");
  }

  if (!combinedUrls.includes(STAGING_SUPABASE_PROJECT_REF)) {
    throw new Error(
      "DATABASE_URL or DIRECT_URL must point to the staging Supabase project before creating reviewer-safe staging data.",
    );
  }
}

assertReviewerStagingEnv();

const prisma = new PrismaClient();

const reviewerEmail = requiredEnv("REVIEWER_STAGING_EMAIL").toLowerCase();
const reviewerPassword = requiredEnv("REVIEWER_STAGING_PASSWORD");
const reviewerWorkspaceName =
  process.env.REVIEWER_STAGING_WORKSPACE_NAME?.trim() || "Reviewer Safe Workspace";
const reviewerChannelName = process.env.REVIEWER_STAGING_CHANNEL_NAME?.trim() || "Review Channel";
const reviewerWorkspaceId = "reviewer-safe-staging-workspace";
const reviewerWorkspaceSlug = "reviewer-safe-staging";
const reviewerChannelExternalId = "reviewer-safe-staging-channel";
const reviewerContactExternalId = "reviewer-safe-staging-contact";
const reviewerConversationId = "reviewer-safe-staging-conversation";
const reviewerAutomationId = "reviewer-safe-staging-keyword-automation";
const reviewerSegmentName = "reviewer-safe staging demo segment";
const reviewerTagName = "reviewer-safe staging demo";

async function main() {
  if (reviewerPassword.length < 12) {
    throw new Error("REVIEWER_STAGING_PASSWORD must be at least 12 characters.");
  }

  const passwordHash = await bcrypt.hash(reviewerPassword, 12);

  const user = await prisma.user.upsert({
    where: { email: reviewerEmail },
    update: {
      name: "Reviewer Safe Staging Admin",
      role: "admin",
      passwordHash,
    },
    create: {
      email: reviewerEmail,
      name: "Reviewer Safe Staging Admin",
      role: "admin",
      passwordHash,
    },
  });

  const workspace = await prisma.workspace.upsert({
    where: { id: reviewerWorkspaceId },
    update: {
      name: reviewerWorkspaceName,
      slug: reviewerWorkspaceSlug,
    },
    create: {
      id: reviewerWorkspaceId,
      name: reviewerWorkspaceName,
      slug: reviewerWorkspaceSlug,
    },
  });

  await prisma.workspaceUser.upsert({
    where: { workspaceId_userId: { workspaceId: workspace.id, userId: user.id } },
    update: { role: "admin" },
    create: { workspaceId: workspace.id, userId: user.id, role: "admin" },
  });

  await prisma.connectedAccount.upsert({
    where: {
      workspaceId_provider_providerAccountId: {
        workspaceId: workspace.id,
        provider: "meta-instagram",
        providerAccountId: reviewerChannelExternalId,
      },
    },
    update: {
      accountType: "reviewer-safe-staging-demo",
      displayName: "Reviewer Safe Staging Instagram",
      username: "reviewer_safe_staging_demo",
      avatarUrl: null,
      encryptedAccessToken: null,
      encryptedRefreshToken: null,
      tokenExpiresAt: null,
      scopesJson: ["instagram_business_basic", "instagram_business_manage_comments", "instagram_business_manage_messages"],
      profileJson: {
        reviewerSafe: true,
        stagingDemo: true,
        note: "Synthetic account record for staging reviewer rehearsal only.",
      },
      metadataJson: {
        source: "reviewer-safe-staging-seed",
        noRealInstagramUserData: true,
      },
    },
    create: {
      workspaceId: workspace.id,
      provider: "meta-instagram",
      providerAccountId: reviewerChannelExternalId,
      accountType: "reviewer-safe-staging-demo",
      displayName: "Reviewer Safe Staging Instagram",
      username: "reviewer_safe_staging_demo",
      avatarUrl: null,
      encryptedAccessToken: null,
      encryptedRefreshToken: null,
      tokenExpiresAt: null,
      scopesJson: ["instagram_business_basic", "instagram_business_manage_comments", "instagram_business_manage_messages"],
      profileJson: {
        reviewerSafe: true,
        stagingDemo: true,
        note: "Synthetic account record for staging reviewer rehearsal only.",
      },
      metadataJson: {
        source: "reviewer-safe-staging-seed",
        noRealInstagramUserData: true,
      },
    },
  });

  const channel = await prisma.channel.upsert({
    where: {
      workspaceId_type_name: {
        workspaceId: workspace.id,
        type: "instagram",
        name: reviewerChannelName,
      },
    },
    update: {
      enabled: true,
      configJson: {
        source: "reviewer-safe-staging-seed",
        reviewerSafe: true,
        stagingDemo: true,
        instagramBusinessAccountId: reviewerChannelExternalId,
        instagramOauthUserId: reviewerChannelExternalId,
        instagramUsername: "reviewer_safe_staging_demo",
        instagramName: "Reviewer Safe Staging Instagram",
        instagramProfilePictureUrl: "",
        noRealInstagramUserData: true,
      },
    },
    create: {
      workspaceId: workspace.id,
      type: "instagram",
      name: reviewerChannelName,
      enabled: true,
      configJson: {
        source: "reviewer-safe-staging-seed",
        reviewerSafe: true,
        stagingDemo: true,
        instagramBusinessAccountId: reviewerChannelExternalId,
        instagramOauthUserId: reviewerChannelExternalId,
        instagramUsername: "reviewer_safe_staging_demo",
        instagramName: "Reviewer Safe Staging Instagram",
        instagramProfilePictureUrl: "",
        noRealInstagramUserData: true,
      },
    },
  });

  const tag = await prisma.tag.upsert({
    where: { workspaceId_name: { workspaceId: workspace.id, name: reviewerTagName } },
    update: { color: "#0f766e" },
    create: {
      workspaceId: workspace.id,
      name: reviewerTagName,
      color: "#0f766e",
    },
  });

  const contact = await prisma.contact.upsert({
    where: {
      channelId_externalId: {
        channelId: channel.id,
        externalId: reviewerContactExternalId,
      },
    },
    update: {
      displayName: "Reviewer Safe Staging Demo Contact",
      username: "reviewer_safe_contact",
      email: "reviewer-safe-staging-contact@example.com",
      phone: null,
      consentStatus: "opted_in",
      lastInboundAt: new Date(),
      metadataJson: {
        source: "reviewer-safe-staging-seed",
        reviewerSafe: true,
        stagingDemo: true,
      },
    },
    create: {
      channelId: channel.id,
      externalId: reviewerContactExternalId,
      displayName: "Reviewer Safe Staging Demo Contact",
      username: "reviewer_safe_contact",
      email: "reviewer-safe-staging-contact@example.com",
      phone: null,
      consentStatus: "opted_in",
      lastInboundAt: new Date(),
      metadataJson: {
        source: "reviewer-safe-staging-seed",
        reviewerSafe: true,
        stagingDemo: true,
      },
    },
  });

  await prisma.contactTag.upsert({
    where: { contactId_tagId: { contactId: contact.id, tagId: tag.id } },
    update: {},
    create: { contactId: contact.id, tagId: tag.id },
  });

  await prisma.segment.upsert({
    where: { workspaceId_name: { workspaceId: workspace.id, name: reviewerSegmentName } },
    update: {
      description: "Reviewer-safe staging demo segment for App Review rehearsal.",
      filterJson: {
        reviewerSafe: true,
        stagingDemo: true,
        tag: reviewerTagName,
      },
    },
    create: {
      workspaceId: workspace.id,
      name: reviewerSegmentName,
      description: "Reviewer-safe staging demo segment for App Review rehearsal.",
      filterJson: {
        reviewerSafe: true,
        stagingDemo: true,
        tag: reviewerTagName,
      },
    },
  });

  const now = new Date();
  await prisma.conversation.upsert({
    where: { id: reviewerConversationId },
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
      id: reviewerConversationId,
      contactId: contact.id,
      channelId: channel.id,
      status: "open",
      unreadCount: 1,
      lastMessageAt: now,
      lastReadAt: null,
    },
  });

  await prisma.message.deleteMany({ where: { conversationId: reviewerConversationId } });
  await prisma.message.create({
    data: {
      conversationId: reviewerConversationId,
      contactId: contact.id,
      channelId: channel.id,
      direction: "inbound",
      messageType: "text",
      text: "Reviewer-safe staging demo message: I want to learn about InboxPilot automation.",
      payloadJson: {
        source: "reviewer-safe-staging-seed",
        reviewerSafe: true,
        stagingDemo: true,
      },
    },
  });

  const automation = await prisma.automation.upsert({
    where: { id: reviewerAutomationId },
    update: {
      workspaceId: workspace.id,
      name: "Reviewer-safe staging keyword reply demo",
      enabled: false,
      triggerType: "keyword",
      triggerConfigJson: {
        keywords: ["demo", "price"],
        match: "contains",
        reviewerSafe: true,
        stagingDemo: true,
      },
    },
    create: {
      id: reviewerAutomationId,
      workspaceId: workspace.id,
      name: "Reviewer-safe staging keyword reply demo",
      enabled: false,
      triggerType: "keyword",
      triggerConfigJson: {
        keywords: ["demo", "price"],
        match: "contains",
        reviewerSafe: true,
        stagingDemo: true,
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
        text: "Reviewer-safe staging reply draft only. No real Instagram user will receive this message.",
      },
    },
  });

  console.log("[ensure-staging-reviewer-account] reviewer-safe staging account and demo data are ready.");
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
