-- OAuth popup module: reusable connected social accounts
CREATE TABLE "ConnectedAccount" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "accountType" TEXT,
    "displayName" TEXT NOT NULL,
    "username" TEXT,
    "avatarUrl" TEXT,
    "encryptedAccessToken" TEXT,
    "encryptedRefreshToken" TEXT,
    "tokenExpiresAt" TIMESTAMP(3),
    "scopesJson" JSONB NOT NULL,
    "profileJson" JSONB NOT NULL,
    "metadataJson" JSONB NOT NULL,
    "connectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConnectedAccount_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ConnectedAccount_workspaceId_provider_idx" ON "ConnectedAccount"("workspaceId", "provider");

CREATE UNIQUE INDEX "ConnectedAccount_workspaceId_provider_providerAccountId_key"
ON "ConnectedAccount"("workspaceId", "provider", "providerAccountId");

ALTER TABLE "ConnectedAccount"
ADD CONSTRAINT "ConnectedAccount_workspaceId_fkey"
FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
