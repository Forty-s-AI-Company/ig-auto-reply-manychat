import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { loadProjectEnv } from "./load-env.mjs";

loadProjectEnv();

const prisma = new PrismaClient();
const DEFAULT_WORKSPACE_ID = "default-workspace";
const DEFAULT_WORKSPACE_SLUG = "default";

async function main() {
  const email = process.env.ADMIN_EMAIL?.trim() || "admin@example.com";
  const password = process.env.ADMIN_PASSWORD?.trim() || "admin123456";
  const name = process.env.ADMIN_NAME?.trim() || "Admin";

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

  console.log(`[ensure-admin] ${email} is ready in ${workspace.name}.`);
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
