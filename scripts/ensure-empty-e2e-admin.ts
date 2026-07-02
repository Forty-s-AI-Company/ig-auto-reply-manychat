import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { loadProjectEnv } from "./load-env.mjs";

const PRODUCTION_SUPABASE_PROJECT_REF = "lmwvzskffzozuiamjxvc";
const EMPTY_WORKSPACE_ID = "empty-e2e-workspace";
const EMPTY_WORKSPACE_SLUG = "empty-e2e-workspace";
const EMPTY_ADMIN_EMAIL = "empty-e2e-admin@example.com";

loadProjectEnv();

const testDatabaseUrl = process.env.TEST_DATABASE_URL?.trim();

if (!testDatabaseUrl) {
  throw new Error("TEST_DATABASE_URL is required before creating an empty E2E workspace.");
}

if (process.env.INBOXPILOT_DB_ENV === "production" || testDatabaseUrl.includes(PRODUCTION_SUPABASE_PROJECT_REF)) {
  throw new Error("Refusing to create an empty E2E workspace against the production database.");
}

process.env.DATABASE_URL = testDatabaseUrl;
process.env.DIRECT_URL = process.env.TEST_DIRECT_URL?.trim() || testDatabaseUrl;

const prisma = new PrismaClient();

async function main() {
  const password = process.env.EMPTY_E2E_ADMIN_PASSWORD?.trim() || process.env.ADMIN_PASSWORD?.trim();
  const email = process.env.EMPTY_E2E_ADMIN_EMAIL?.trim() || EMPTY_ADMIN_EMAIL;
  const name = process.env.EMPTY_E2E_ADMIN_NAME?.trim() || "Empty E2E Admin";

  if (!password) {
    throw new Error("EMPTY_E2E_ADMIN_PASSWORD or ADMIN_PASSWORD must be set before creating an empty E2E admin user.");
  }

  if (password.length < 8) {
    throw new Error("Empty E2E admin password must be at least 8 characters.");
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.upsert({
    where: { email },
    update: { name, role: "admin", passwordHash },
    create: { email, name, role: "admin", passwordHash },
  });

  // Keep this fixture truly empty and isolated from the seeded default workspace.
  await prisma.workspace.deleteMany({ where: { id: EMPTY_WORKSPACE_ID } });
  await prisma.workspaceUser.deleteMany({ where: { userId: user.id } });

  const workspace = await prisma.workspace.create({
    data: {
      id: EMPTY_WORKSPACE_ID,
      name: "Empty E2E Workspace",
      slug: EMPTY_WORKSPACE_SLUG,
    },
  });

  await prisma.workspaceUser.create({
    data: {
      workspaceId: workspace.id,
      userId: user.id,
      role: "admin",
    },
  });

  console.log("[ensure-empty-e2e-admin] empty E2E workspace is ready.");
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
