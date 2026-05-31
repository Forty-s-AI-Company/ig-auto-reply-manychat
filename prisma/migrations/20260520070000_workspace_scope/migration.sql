-- CreateTable
CREATE TABLE "Workspace" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "WorkspaceUser" (
    "workspaceId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'admin',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("workspaceId", "userId"),
    CONSTRAINT "WorkspaceUser_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "WorkspaceUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- AlterTable
ALTER TABLE "Channel" ADD COLUMN "workspaceId" TEXT;
ALTER TABLE "Tag" ADD COLUMN "workspaceId" TEXT;
ALTER TABLE "Automation" ADD COLUMN "workspaceId" TEXT;
ALTER TABLE "Broadcast" ADD COLUMN "workspaceId" TEXT;
ALTER TABLE "Job" ADD COLUMN "workspaceId" TEXT;
ALTER TABLE "KnowledgeBaseItem" ADD COLUMN "workspaceId" TEXT;

-- Backfill a default workspace for existing local data.
INSERT INTO "Workspace" ("id", "name", "slug", "updatedAt")
VALUES ('default-workspace', 'Default Workspace', 'default', CURRENT_TIMESTAMP);

INSERT INTO "WorkspaceUser" ("workspaceId", "userId", "role")
SELECT 'default-workspace', "id", "role" FROM "User";

UPDATE "Channel" SET "workspaceId" = 'default-workspace' WHERE "workspaceId" IS NULL;
UPDATE "Tag" SET "workspaceId" = 'default-workspace' WHERE "workspaceId" IS NULL;
UPDATE "Automation" SET "workspaceId" = 'default-workspace' WHERE "workspaceId" IS NULL;
UPDATE "Broadcast" SET "workspaceId" = 'default-workspace' WHERE "workspaceId" IS NULL;
UPDATE "Job" SET "workspaceId" = 'default-workspace' WHERE "workspaceId" IS NULL;
UPDATE "KnowledgeBaseItem" SET "workspaceId" = 'default-workspace' WHERE "workspaceId" IS NULL;

-- Replace global uniqueness with workspace-scoped uniqueness.
DROP INDEX IF EXISTS "Channel_type_name_key";
DROP INDEX IF EXISTS "Tag_name_key";

-- CreateIndex
CREATE UNIQUE INDEX "Workspace_slug_key" ON "Workspace"("slug");
CREATE INDEX "WorkspaceUser_userId_idx" ON "WorkspaceUser"("userId");
CREATE INDEX "Channel_workspaceId_idx" ON "Channel"("workspaceId");
CREATE UNIQUE INDEX "Channel_workspaceId_type_name_key" ON "Channel"("workspaceId", "type", "name");
CREATE INDEX "Tag_workspaceId_idx" ON "Tag"("workspaceId");
CREATE UNIQUE INDEX "Tag_workspaceId_name_key" ON "Tag"("workspaceId", "name");
CREATE INDEX "Automation_workspaceId_idx" ON "Automation"("workspaceId");
CREATE INDEX "Broadcast_workspaceId_idx" ON "Broadcast"("workspaceId");
CREATE INDEX "Job_workspaceId_idx" ON "Job"("workspaceId");
CREATE INDEX "KnowledgeBaseItem_workspaceId_idx" ON "KnowledgeBaseItem"("workspaceId");
