-- CreateTable
CREATE TABLE "AutomationFolder" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AutomationFolder_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "Automation" ADD COLUMN "folderId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "AutomationFolder_workspaceId_name_key" ON "AutomationFolder"("workspaceId", "name");

-- CreateIndex
CREATE INDEX "AutomationFolder_workspaceId_idx" ON "AutomationFolder"("workspaceId");

-- CreateIndex
CREATE INDEX "Automation_folderId_idx" ON "Automation"("folderId");

-- AddForeignKey
ALTER TABLE "AutomationFolder" ADD CONSTRAINT "AutomationFolder_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Automation" ADD CONSTRAINT "Automation_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "AutomationFolder"("id") ON DELETE SET NULL ON UPDATE CASCADE;
