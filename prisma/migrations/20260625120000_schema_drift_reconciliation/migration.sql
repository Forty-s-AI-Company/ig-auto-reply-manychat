-- Reconcile Prisma schema drift without dropping existing production data.
-- Existing TEXT enum-like columns are converted in place with USING casts.
-- If any existing value is outside the target enum, PostgreSQL will abort the migration.

DO $$
BEGIN
    CREATE TYPE "BillingInterval" AS ENUM ('month', 'year');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    CREATE TYPE "UserRole" AS ENUM ('admin', 'operator');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    CREATE TYPE "ChannelType" AS ENUM ('mock', 'telegram', 'instagram', 'messenger', 'whatsapp', 'tiktok', 'sms', 'email');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    CREATE TYPE "ConsentStatus" AS ENUM ('opted_in', 'opted_out', 'unknown');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    CREATE TYPE "ConversationStatus" AS ENUM ('open', 'pending', 'closed');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    CREATE TYPE "MessageDirection" AS ENUM ('inbound', 'outbound');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    CREATE TYPE "MessageType" AS ENUM ('text', 'image', 'button', 'system');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    CREATE TYPE "TriggerType" AS ENUM ('keyword', 'new_contact', 'manual', 'webhook');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    CREATE TYPE "AutomationStepType" AS ENUM ('send_message', 'add_tag', 'remove_tag', 'wait', 'condition', 'ai_reply', 'set_field');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    CREATE TYPE "AutomationRunStatus" AS ENUM ('running', 'completed', 'failed');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    CREATE TYPE "BroadcastStatus" AS ENUM ('draft', 'queued', 'sending', 'sent', 'failed');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    CREATE TYPE "JobStatus" AS ENUM ('queued', 'running', 'completed', 'failed');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    CREATE TYPE "SubscriptionStatus" AS ENUM ('trialing', 'active', 'past_due', 'canceled', 'unpaid');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    CREATE TYPE "PaymentStatus" AS ENUM ('pending', 'paid', 'failed', 'canceled');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    CREATE TYPE "InvoiceStatus" AS ENUM ('draft', 'open', 'pending_payment', 'paid', 'failed', 'void', 'refunded');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    CREATE TYPE "InvoiceItemType" AS ENUM ('plan', 'addon', 'overage', 'setup_fee', 'discount', 'credit', 'tax_adjustment', 'manual_adjustment');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    CREATE TYPE "WalletLedgerType" AS ENUM ('credit', 'debit');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    CREATE TYPE "WalletLedgerSource" AS ENUM ('referral_credit', 'affiliate_commission', 'invoice_credit', 'payout', 'adjustment', 'expiry', 'clawback');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    CREATE TYPE "WalletLedgerStatus" AS ENUM ('pending', 'available', 'used', 'expired', 'cancelled', 'payout_requested', 'paid', 'failed');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    CREATE TYPE "ReferralAttributionStatus" AS ENUM ('pending', 'activated', 'paid', 'invalid');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    CREATE TYPE "ReferralRewardType" AS ENUM ('trial_day', 'trial_events', 'credit');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    CREATE TYPE "ReferralRewardStatus" AS ENUM ('pending', 'granted', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    CREATE TYPE "AffiliateProfileStatus" AS ENUM ('not_applied', 'pending', 'approved', 'rejected', 'suspended');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    CREATE TYPE "AffiliateLevel" AS ENUM ('partner', 'silver', 'gold', 'agency');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    CREATE TYPE "IdentityType" AS ENUM ('individual', 'company');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    CREATE TYPE "AffiliateCommissionStatus" AS ENUM ('pending', 'available', 'payout_requested', 'paid', 'cancelled', 'clawback');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    CREATE TYPE "PayoutRequestStatus" AS ENUM ('requested', 'approved', 'rejected', 'batched', 'paid', 'failed', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    CREATE TYPE "PayoutBatchStatus" AS ENUM ('draft', 'exported', 'processing', 'paid', 'partially_failed', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    CREATE TYPE "PayoutBatchItemStatus" AS ENUM ('pending', 'paid', 'failed');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    CREATE TYPE "CouponStatus" AS ENUM ('active', 'disabled', 'expired');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE "Automation" ALTER COLUMN "triggerType" TYPE "TriggerType" USING "triggerType"::"TriggerType";

ALTER TABLE "AutomationRun" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "AutomationRun" ALTER COLUMN "status" TYPE "AutomationRunStatus" USING "status"::"AutomationRunStatus";
ALTER TABLE "AutomationRun" ALTER COLUMN "status" SET DEFAULT 'running';

ALTER TABLE "AutomationStep" ALTER COLUMN "type" TYPE "AutomationStepType" USING "type"::"AutomationStepType";

ALTER TABLE "Broadcast" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Broadcast" ALTER COLUMN "status" TYPE "BroadcastStatus" USING "status"::"BroadcastStatus";
ALTER TABLE "Broadcast" ALTER COLUMN "status" SET DEFAULT 'draft';

ALTER TABLE "Channel" ALTER COLUMN "type" TYPE "ChannelType" USING "type"::"ChannelType";

ALTER TABLE "Contact" ALTER COLUMN "consentStatus" DROP DEFAULT;
ALTER TABLE "Contact" ALTER COLUMN "consentStatus" TYPE "ConsentStatus" USING "consentStatus"::"ConsentStatus";
ALTER TABLE "Contact" ALTER COLUMN "consentStatus" SET DEFAULT 'unknown';

ALTER TABLE "Conversation" ADD COLUMN IF NOT EXISTS "isFavorite" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Conversation" ADD COLUMN IF NOT EXISTS "lastReadAt" TIMESTAMP(3);
ALTER TABLE "Conversation" ADD COLUMN IF NOT EXISTS "reminderAt" TIMESTAMP(3);
ALTER TABLE "Conversation" ADD COLUMN IF NOT EXISTS "unreadCount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Conversation" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Conversation" ALTER COLUMN "status" TYPE "ConversationStatus" USING "status"::"ConversationStatus";
ALTER TABLE "Conversation" ALTER COLUMN "status" SET DEFAULT 'open';

ALTER TABLE "Job" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Job" ALTER COLUMN "status" TYPE "JobStatus" USING "status"::"JobStatus";
ALTER TABLE "Job" ALTER COLUMN "status" SET DEFAULT 'queued';

ALTER TABLE "Message" ALTER COLUMN "direction" TYPE "MessageDirection" USING "direction"::"MessageDirection";
ALTER TABLE "Message" ALTER COLUMN "messageType" DROP DEFAULT;
ALTER TABLE "Message" ALTER COLUMN "messageType" TYPE "MessageType" USING "messageType"::"MessageType";
ALTER TABLE "Message" ALTER COLUMN "messageType" SET DEFAULT 'text';

ALTER TABLE "PaymentOrder" ADD COLUMN IF NOT EXISTS "invoiceId" TEXT;
ALTER TABLE "PaymentOrder" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "PaymentOrder" ALTER COLUMN "status" TYPE "PaymentStatus" USING "status"::"PaymentStatus";
ALTER TABLE "PaymentOrder" ALTER COLUMN "status" SET DEFAULT 'pending';

ALTER TABLE "Subscription" ADD COLUMN IF NOT EXISTS "trialEndsAt" TIMESTAMP(3);
ALTER TABLE "Subscription" ADD COLUMN IF NOT EXISTS "trialEventsLimit" INTEGER;
ALTER TABLE "Subscription" ADD COLUMN IF NOT EXISTS "userId" TEXT;
ALTER TABLE "Subscription" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Subscription" ALTER COLUMN "status" TYPE "SubscriptionStatus" USING "status"::"SubscriptionStatus";
ALTER TABLE "Subscription" ALTER COLUMN "status" SET DEFAULT 'trialing';
ALTER TABLE "Subscription" ALTER COLUMN "interval" DROP DEFAULT;
ALTER TABLE "Subscription" ALTER COLUMN "interval" TYPE "BillingInterval" USING "interval"::"BillingInterval";
ALTER TABLE "Subscription" ALTER COLUMN "interval" SET DEFAULT 'month';

ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "emailVerifiedAt" TIMESTAMP(3);
ALTER TABLE "User" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "User" ALTER COLUMN "role" TYPE "UserRole" USING "role"::"UserRole";
ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'admin';

ALTER TABLE "WorkspaceUser" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "WorkspaceUser" ALTER COLUMN "role" TYPE "UserRole" USING "role"::"UserRole";
ALTER TABLE "WorkspaceUser" ALTER COLUMN "role" SET DEFAULT 'admin';
-- CreateTable
CREATE TABLE "WorkspaceAiSetting" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "provider" TEXT NOT NULL DEFAULT 'chatgpt',
    "model" TEXT NOT NULL DEFAULT 'gpt-4o-mini',
    "reasoningEffort" TEXT,
    "thinkingLevel" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkspaceAiSetting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkspaceAiCredential" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "encryptedApiKey" TEXT,
    "testStatus" TEXT NOT NULL DEFAULT 'untested',
    "testError" TEXT,
    "testedModel" TEXT,
    "lastTestedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkspaceAiCredential_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiModelCache" (
    "id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "modelId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "intelligenceTier" TEXT NOT NULL DEFAULT 'standard',
    "speedTier" TEXT NOT NULL DEFAULT 'standard',
    "supportsReasoning" BOOLEAN NOT NULL DEFAULT false,
    "supportsThinking" BOOLEAN NOT NULL DEFAULT false,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "rawJson" JSONB NOT NULL,
    "fetchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AiModelCache_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContactFieldDefinition" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'text',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContactFieldDefinition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContactFieldValue" (
    "id" TEXT NOT NULL,
    "contactId" TEXT NOT NULL,
    "definitionId" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContactFieldValue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Segment" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "filterJson" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Segment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Sequence" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Sequence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SequenceStep" (
    "id" TEXT NOT NULL,
    "sequenceId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "delaySeconds" INTEGER NOT NULL DEFAULT 0,
    "messageJson" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SequenceStep_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SequenceSubscription" (
    "id" TEXT NOT NULL,
    "sequenceId" TEXT NOT NULL,
    "contactId" TEXT NOT NULL,
    "currentStep" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "nextRunAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SequenceSubscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubscriptionAddon" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "subscriptionId" TEXT,
    "addonKey" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "amount" INTEGER NOT NULL,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SubscriptionAddon_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkspaceUsageOverride" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "resource" TEXT NOT NULL,
    "limit" INTEGER NOT NULL,
    "reason" TEXT,
    "startsAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endsAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkspaceUsageOverride_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UsagePeriod" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "activeContactsCount" INTEGER NOT NULL DEFAULT 0,
    "messageEventsCount" INTEGER NOT NULL DEFAULT 0,
    "webhookEventsCount" INTEGER NOT NULL DEFAULT 0,
    "broadcastEventsCount" INTEGER NOT NULL DEFAULT 0,
    "warning80SentAt" TIMESTAMP(3),
    "limit100ReachedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UsagePeriod_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MessageEventLedger" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "contactId" TEXT,
    "type" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "amount" INTEGER NOT NULL DEFAULT 1,
    "metadataJson" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MessageEventLedger_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReferralCode" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "disabledAt" TIMESTAMP(3),

    CONSTRAINT "ReferralCode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReferralAttribution" (
    "id" TEXT NOT NULL,
    "referrerUserId" TEXT NOT NULL,
    "referredUserId" TEXT NOT NULL,
    "referralCode" TEXT NOT NULL,
    "status" "ReferralAttributionStatus" NOT NULL DEFAULT 'pending',
    "riskFlagsJson" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "activatedAt" TIMESTAMP(3),
    "firstPaidAt" TIMESTAMP(3),

    CONSTRAINT "ReferralAttribution_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReferralReward" (
    "id" TEXT NOT NULL,
    "referrerUserId" TEXT NOT NULL,
    "referredUserId" TEXT NOT NULL,
    "type" "ReferralRewardType" NOT NULL,
    "amount" INTEGER NOT NULL,
    "status" "ReferralRewardStatus" NOT NULL DEFAULT 'pending',
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReferralReward_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WalletLedger" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "workspaceId" TEXT,
    "type" "WalletLedgerType" NOT NULL,
    "source" "WalletLedgerSource" NOT NULL,
    "amount" INTEGER NOT NULL,
    "status" "WalletLedgerStatus" NOT NULL,
    "relatedInvoiceId" TEXT,
    "relatedPaymentOrderId" TEXT,
    "relatedCommissionId" TEXT,
    "relatedPayoutId" TEXT,
    "availableAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WalletLedger_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AffiliateProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "AffiliateProfileStatus" NOT NULL DEFAULT 'not_applied',
    "level" "AffiliateLevel" NOT NULL DEFAULT 'partner',
    "customCommissionRate" INTEGER,
    "legalName" TEXT,
    "identityType" "IdentityType",
    "taxIdEncrypted" TEXT,
    "bankCode" TEXT,
    "bankBranchCode" TEXT,
    "bankAccountEncrypted" TEXT,
    "bankAccountLast4" TEXT,
    "bankAccountName" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "address" TEXT,
    "taxResidentCountry" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "reviewedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AffiliateProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AffiliateCommission" (
    "id" TEXT NOT NULL,
    "affiliateUserId" TEXT NOT NULL,
    "referredUserId" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "paymentOrderId" TEXT,
    "commissionBase" INTEGER NOT NULL,
    "commissionRate" INTEGER NOT NULL,
    "commissionAmount" INTEGER NOT NULL,
    "status" "AffiliateCommissionStatus" NOT NULL DEFAULT 'pending',
    "holdUntil" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "availableAt" TIMESTAMP(3),
    "paidAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),

    CONSTRAINT "AffiliateCommission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Invoice" (
    "id" TEXT NOT NULL,
    "invoiceNumber" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "subscriptionId" TEXT,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "subtotalAmount" INTEGER NOT NULL,
    "discountAmount" INTEGER NOT NULL DEFAULT 0,
    "creditUsedAmount" INTEGER NOT NULL DEFAULT 0,
    "totalAmount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'TWD',
    "status" "InvoiceStatus" NOT NULL DEFAULT 'draft',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dueAt" TIMESTAMP(3),
    "paidAt" TIMESTAMP(3),

    CONSTRAINT "Invoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InvoiceItem" (
    "id" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "type" "InvoiceItemType" NOT NULL,
    "description" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "unitAmount" INTEGER NOT NULL,
    "amount" INTEGER NOT NULL,
    "metadataJson" JSONB NOT NULL,

    CONSTRAINT "InvoiceItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PayoutRequest" (
    "id" TEXT NOT NULL,
    "affiliateUserId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "status" "PayoutRequestStatus" NOT NULL DEFAULT 'requested',
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMP(3),
    "reviewedBy" TEXT,
    "failureReason" TEXT,

    CONSTRAINT "PayoutRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PayoutBatch" (
    "id" TEXT NOT NULL,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "status" "PayoutBatchStatus" NOT NULL DEFAULT 'draft',
    "totalAmount" INTEGER NOT NULL DEFAULT 0,
    "itemCount" INTEGER NOT NULL DEFAULT 0,
    "csvFormat" TEXT NOT NULL DEFAULT 'generic_csv',
    "bankFormat" TEXT,
    "exportedAt" TIMESTAMP(3),
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,

    CONSTRAINT "PayoutBatch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PayoutBatchItem" (
    "id" TEXT NOT NULL,
    "batchId" TEXT NOT NULL,
    "payoutRequestId" TEXT NOT NULL,
    "affiliateUserId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "bankCode" TEXT NOT NULL,
    "bankBranchCode" TEXT,
    "bankAccountEncrypted" TEXT NOT NULL,
    "bankAccountLast4" TEXT,
    "bankAccountName" TEXT NOT NULL,
    "status" "PayoutBatchItemStatus" NOT NULL DEFAULT 'pending',
    "failureReason" TEXT,
    "paidAt" TIMESTAMP(3),

    CONSTRAINT "PayoutBatchItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Coupon" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT,
    "code" TEXT NOT NULL,
    "percentOff" INTEGER,
    "amountOff" INTEGER,
    "status" "CouponStatus" NOT NULL DEFAULT 'active',
    "expiresAt" TIMESTAMP(3),
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Coupon_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "WorkspaceAiSetting_workspaceId_key" ON "WorkspaceAiSetting"("workspaceId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "WorkspaceAiCredential_provider_idx" ON "WorkspaceAiCredential"("provider");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "WorkspaceAiCredential_workspaceId_provider_key" ON "WorkspaceAiCredential"("workspaceId", "provider");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "AiModelCache_provider_idx" ON "AiModelCache"("provider");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "AiModelCache_fetchedAt_idx" ON "AiModelCache"("fetchedAt");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "AiModelCache_provider_modelId_key" ON "AiModelCache"("provider", "modelId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "ContactFieldDefinition_workspaceId_idx" ON "ContactFieldDefinition"("workspaceId");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "ContactFieldDefinition_workspaceId_key_key" ON "ContactFieldDefinition"("workspaceId", "key");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "ContactFieldValue_definitionId_idx" ON "ContactFieldValue"("definitionId");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "ContactFieldValue_contactId_definitionId_key" ON "ContactFieldValue"("contactId", "definitionId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Segment_workspaceId_idx" ON "Segment"("workspaceId");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "Segment_workspaceId_name_key" ON "Segment"("workspaceId", "name");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Sequence_workspaceId_idx" ON "Sequence"("workspaceId");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "Sequence_workspaceId_name_key" ON "Sequence"("workspaceId", "name");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "SequenceStep_sequenceId_order_key" ON "SequenceStep"("sequenceId", "order");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "SequenceSubscription_active_nextRunAt_idx" ON "SequenceSubscription"("active", "nextRunAt");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "SequenceSubscription_sequenceId_contactId_key" ON "SequenceSubscription"("sequenceId", "contactId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "SubscriptionAddon_workspaceId_periodStart_periodEnd_idx" ON "SubscriptionAddon"("workspaceId", "periodStart", "periodEnd");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "SubscriptionAddon_addonKey_idx" ON "SubscriptionAddon"("addonKey");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "WorkspaceUsageOverride_workspaceId_resource_idx" ON "WorkspaceUsageOverride"("workspaceId", "resource");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "WorkspaceUsageOverride_endsAt_idx" ON "WorkspaceUsageOverride"("endsAt");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "UsagePeriod_workspaceId_idx" ON "UsagePeriod"("workspaceId");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "UsagePeriod_workspaceId_periodStart_periodEnd_key" ON "UsagePeriod"("workspaceId", "periodStart", "periodEnd");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "MessageEventLedger_workspaceId_createdAt_idx" ON "MessageEventLedger"("workspaceId", "createdAt");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "MessageEventLedger_contactId_idx" ON "MessageEventLedger"("contactId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "MessageEventLedger_type_idx" ON "MessageEventLedger"("type");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "ReferralCode_code_key" ON "ReferralCode"("code");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "ReferralCode_userId_idx" ON "ReferralCode"("userId");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "ReferralAttribution_referredUserId_key" ON "ReferralAttribution"("referredUserId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "ReferralAttribution_referrerUserId_idx" ON "ReferralAttribution"("referrerUserId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "ReferralAttribution_status_idx" ON "ReferralAttribution"("status");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "ReferralReward_referrerUserId_idx" ON "ReferralReward"("referrerUserId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "ReferralReward_referredUserId_idx" ON "ReferralReward"("referredUserId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "ReferralReward_status_idx" ON "ReferralReward"("status");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "WalletLedger_userId_status_idx" ON "WalletLedger"("userId", "status");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "WalletLedger_workspaceId_idx" ON "WalletLedger"("workspaceId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "WalletLedger_relatedInvoiceId_idx" ON "WalletLedger"("relatedInvoiceId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "WalletLedger_relatedCommissionId_idx" ON "WalletLedger"("relatedCommissionId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "WalletLedger_relatedPayoutId_idx" ON "WalletLedger"("relatedPayoutId");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "AffiliateProfile_userId_key" ON "AffiliateProfile"("userId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "AffiliateProfile_status_idx" ON "AffiliateProfile"("status");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "AffiliateProfile_level_idx" ON "AffiliateProfile"("level");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "AffiliateCommission_affiliateUserId_status_idx" ON "AffiliateCommission"("affiliateUserId", "status");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "AffiliateCommission_holdUntil_idx" ON "AffiliateCommission"("holdUntil");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "AffiliateCommission_invoiceId_affiliateUserId_key" ON "AffiliateCommission"("invoiceId", "affiliateUserId");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "Invoice_invoiceNumber_key" ON "Invoice"("invoiceNumber");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Invoice_userId_status_idx" ON "Invoice"("userId", "status");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Invoice_workspaceId_status_idx" ON "Invoice"("workspaceId", "status");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Invoice_subscriptionId_idx" ON "Invoice"("subscriptionId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Invoice_periodStart_periodEnd_idx" ON "Invoice"("periodStart", "periodEnd");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "InvoiceItem_invoiceId_idx" ON "InvoiceItem"("invoiceId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "InvoiceItem_type_idx" ON "InvoiceItem"("type");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "PayoutRequest_affiliateUserId_status_idx" ON "PayoutRequest"("affiliateUserId", "status");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "PayoutRequest_requestedAt_idx" ON "PayoutRequest"("requestedAt");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "PayoutBatch_status_idx" ON "PayoutBatch"("status");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "PayoutBatch_periodStart_periodEnd_idx" ON "PayoutBatch"("periodStart", "periodEnd");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "PayoutBatchItem_payoutRequestId_key" ON "PayoutBatchItem"("payoutRequestId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "PayoutBatchItem_batchId_status_idx" ON "PayoutBatchItem"("batchId", "status");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "PayoutBatchItem_affiliateUserId_idx" ON "PayoutBatchItem"("affiliateUserId");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "Coupon_code_key" ON "Coupon"("code");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Coupon_workspaceId_idx" ON "Coupon"("workspaceId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Coupon_status_idx" ON "Coupon"("status");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "AutomationRun_automationId_status_idx" ON "AutomationRun"("automationId", "status");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "AutomationRun_contactId_status_idx" ON "AutomationRun"("contactId", "status");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Broadcast_workspaceId_status_scheduledAt_idx" ON "Broadcast"("workspaceId", "status", "scheduledAt");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "Channel_workspaceId_type_name_key" ON "Channel"("workspaceId", "type", "name");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Conversation_status_idx" ON "Conversation"("status");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Conversation_assignedToId_idx" ON "Conversation"("assignedToId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Conversation_reminderAt_idx" ON "Conversation"("reminderAt");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Conversation_isFavorite_idx" ON "Conversation"("isFavorite");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Conversation_unreadCount_idx" ON "Conversation"("unreadCount");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Job_status_runAt_idx" ON "Job"("status", "runAt");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Job_workspaceId_type_status_runAt_idx" ON "Job"("workspaceId", "type", "status", "runAt");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "PaymentOrder_invoiceId_idx" ON "PaymentOrder"("invoiceId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "PaymentOrder_status_idx" ON "PaymentOrder"("status");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Subscription_userId_idx" ON "Subscription"("userId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Subscription_status_idx" ON "Subscription"("status");

-- AddForeignKey
ALTER TABLE "WorkspaceAiSetting" ADD CONSTRAINT "WorkspaceAiSetting_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkspaceAiCredential" ADD CONSTRAINT "WorkspaceAiCredential_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContactFieldDefinition" ADD CONSTRAINT "ContactFieldDefinition_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContactFieldValue" ADD CONSTRAINT "ContactFieldValue_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContactFieldValue" ADD CONSTRAINT "ContactFieldValue_definitionId_fkey" FOREIGN KEY ("definitionId") REFERENCES "ContactFieldDefinition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Segment" ADD CONSTRAINT "Segment_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sequence" ADD CONSTRAINT "Sequence_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SequenceStep" ADD CONSTRAINT "SequenceStep_sequenceId_fkey" FOREIGN KEY ("sequenceId") REFERENCES "Sequence"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SequenceSubscription" ADD CONSTRAINT "SequenceSubscription_sequenceId_fkey" FOREIGN KEY ("sequenceId") REFERENCES "Sequence"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SequenceSubscription" ADD CONSTRAINT "SequenceSubscription_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentOrder" ADD CONSTRAINT "PaymentOrder_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubscriptionAddon" ADD CONSTRAINT "SubscriptionAddon_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubscriptionAddon" ADD CONSTRAINT "SubscriptionAddon_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "Subscription"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkspaceUsageOverride" ADD CONSTRAINT "WorkspaceUsageOverride_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsagePeriod" ADD CONSTRAINT "UsagePeriod_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MessageEventLedger" ADD CONSTRAINT "MessageEventLedger_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MessageEventLedger" ADD CONSTRAINT "MessageEventLedger_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReferralCode" ADD CONSTRAINT "ReferralCode_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReferralAttribution" ADD CONSTRAINT "ReferralAttribution_referrerUserId_fkey" FOREIGN KEY ("referrerUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReferralAttribution" ADD CONSTRAINT "ReferralAttribution_referredUserId_fkey" FOREIGN KEY ("referredUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReferralReward" ADD CONSTRAINT "ReferralReward_referrerUserId_fkey" FOREIGN KEY ("referrerUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReferralReward" ADD CONSTRAINT "ReferralReward_referredUserId_fkey" FOREIGN KEY ("referredUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WalletLedger" ADD CONSTRAINT "WalletLedger_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WalletLedger" ADD CONSTRAINT "WalletLedger_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WalletLedger" ADD CONSTRAINT "WalletLedger_relatedInvoiceId_fkey" FOREIGN KEY ("relatedInvoiceId") REFERENCES "Invoice"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WalletLedger" ADD CONSTRAINT "WalletLedger_relatedPaymentOrderId_fkey" FOREIGN KEY ("relatedPaymentOrderId") REFERENCES "PaymentOrder"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WalletLedger" ADD CONSTRAINT "WalletLedger_relatedCommissionId_fkey" FOREIGN KEY ("relatedCommissionId") REFERENCES "AffiliateCommission"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WalletLedger" ADD CONSTRAINT "WalletLedger_relatedPayoutId_fkey" FOREIGN KEY ("relatedPayoutId") REFERENCES "PayoutRequest"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AffiliateProfile" ADD CONSTRAINT "AffiliateProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AffiliateProfile" ADD CONSTRAINT "AffiliateProfile_reviewedBy_fkey" FOREIGN KEY ("reviewedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AffiliateCommission" ADD CONSTRAINT "AffiliateCommission_affiliateUserId_fkey" FOREIGN KEY ("affiliateUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AffiliateCommission" ADD CONSTRAINT "AffiliateCommission_referredUserId_fkey" FOREIGN KEY ("referredUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AffiliateCommission" ADD CONSTRAINT "AffiliateCommission_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AffiliateCommission" ADD CONSTRAINT "AffiliateCommission_paymentOrderId_fkey" FOREIGN KEY ("paymentOrderId") REFERENCES "PaymentOrder"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "Subscription"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvoiceItem" ADD CONSTRAINT "InvoiceItem_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PayoutRequest" ADD CONSTRAINT "PayoutRequest_affiliateUserId_fkey" FOREIGN KEY ("affiliateUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PayoutRequest" ADD CONSTRAINT "PayoutRequest_reviewedBy_fkey" FOREIGN KEY ("reviewedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PayoutBatch" ADD CONSTRAINT "PayoutBatch_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PayoutBatchItem" ADD CONSTRAINT "PayoutBatchItem_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "PayoutBatch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PayoutBatchItem" ADD CONSTRAINT "PayoutBatchItem_payoutRequestId_fkey" FOREIGN KEY ("payoutRequestId") REFERENCES "PayoutRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Coupon" ADD CONSTRAINT "Coupon_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Coupon" ADD CONSTRAINT "Coupon_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

