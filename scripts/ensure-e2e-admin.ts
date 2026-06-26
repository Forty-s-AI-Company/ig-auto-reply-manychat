import bcrypt from "bcryptjs";
import { config } from "dotenv";
import { PrismaClient } from "@prisma/client";

const PRODUCTION_SUPABASE_PROJECT_REF = "lmwvzskffzozuiamjxvc";
const DEFAULT_WORKSPACE_ID = "default-workspace";
const DEFAULT_WORKSPACE_SLUG = "default";

config({ path: ".env", quiet: true });
config({ path: ".env.local", override: false, quiet: true });

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
