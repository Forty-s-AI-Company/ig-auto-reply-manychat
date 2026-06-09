-- Backfill tenant ownership before tightening core multi-tenant constraints.
INSERT INTO "Workspace" ("id", "name", "slug", "createdAt", "updatedAt")
VALUES ('default-workspace', 'Default Workspace', 'default', NOW(), NOW())
ON CONFLICT ("id") DO NOTHING;

UPDATE "Channel" SET "workspaceId" = 'default-workspace' WHERE "workspaceId" IS NULL;
UPDATE "Broadcast" SET "workspaceId" = 'default-workspace' WHERE "workspaceId" IS NULL;
UPDATE "Job" SET "workspaceId" = 'default-workspace' WHERE "workspaceId" IS NULL;

ALTER TABLE "Channel" ALTER COLUMN "workspaceId" SET NOT NULL;
ALTER TABLE "Broadcast" ALTER COLUMN "workspaceId" SET NOT NULL;
ALTER TABLE "Job" ALTER COLUMN "workspaceId" SET NOT NULL;

ALTER TABLE "Job" ADD COLUMN "lockedAt" TIMESTAMP(3);

CREATE INDEX "Message_conversationId_createdAt_idx" ON "Message"("conversationId", "createdAt");
CREATE INDEX "Message_contactId_createdAt_idx" ON "Message"("contactId", "createdAt");
CREATE INDEX "Message_channelId_providerMessageId_idx" ON "Message"("channelId", "providerMessageId");

CREATE INDEX "AutomationRun_automationId_status_idx" ON "AutomationRun"("automationId", "status");
CREATE INDEX "AutomationRun_contactId_status_idx" ON "AutomationRun"("contactId", "status");
CREATE INDEX "AutomationRun_conversationId_createdAt_idx" ON "AutomationRun"("conversationId", "createdAt");

CREATE INDEX "Broadcast_workspaceId_status_scheduledAt_idx" ON "Broadcast"("workspaceId", "status", "scheduledAt");
CREATE INDEX "Job_workspaceId_type_status_runAt_idx" ON "Job"("workspaceId", "type", "status", "runAt");
