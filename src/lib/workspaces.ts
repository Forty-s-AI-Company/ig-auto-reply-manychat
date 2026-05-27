import { randomBytes } from "node:crypto";
import type { UserRole } from "@prisma/client";
import { cookies } from "next/headers";
import { getCurrentUser } from "@/lib/auth";
import { getDb } from "@/lib/db";

export const DEFAULT_WORKSPACE_ID = "default-workspace";
export const DEFAULT_WORKSPACE_SLUG = "default";
export const WORKSPACE_SCOPE_COOKIE = "selected_workspace_id";

type WorkspaceUser = { id: string; name?: string | null; role?: UserRole };

function slugify(value: string) {
  const slug = value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\u4e00-\u9fff]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug || `workspace-${randomBytes(3).toString("hex")}`;
}

export async function createUniqueWorkspaceSlug(name: string) {
  const db = getDb();
  const base = slugify(name);
  let slug = base;
  let index = 1;

  while (await db.workspace.findUnique({ where: { slug }, select: { id: true } })) {
    index += 1;
    slug = `${base}-${index}`;
  }

  return slug;
}

export async function ensureDefaultWorkspace(user?: WorkspaceUser) {
  const db = getDb();
  const workspace = await db.workspace.upsert({
    where: { id: DEFAULT_WORKSPACE_ID },
    update: {},
    create: {
      id: DEFAULT_WORKSPACE_ID,
      name: "Default Workspace",
      slug: DEFAULT_WORKSPACE_SLUG,
    },
  });

  if (user) {
    await db.workspaceUser.upsert({
      where: {
        workspaceId_userId: {
          workspaceId: workspace.id,
          userId: user.id,
        },
      },
      update: { role: user.role || "admin" },
      create: {
        workspaceId: workspace.id,
        userId: user.id,
        role: user.role || "admin",
      },
    });
  }

  return workspace;
}

export async function createWorkspaceForUser(user: WorkspaceUser, name: string) {
  const db = getDb();
  const workspace = await db.workspace.create({
    data: {
      name,
      slug: await createUniqueWorkspaceSlug(name),
      users: {
        create: {
          userId: user.id,
          role: user.role || "admin",
        },
      },
    },
  });

  return workspace;
}

export async function getUserWorkspaces(userId: string) {
  return getDb().workspace.findMany({
    where: { users: { some: { userId } } },
    orderBy: { createdAt: "asc" },
  });
}

export async function getCurrentWorkspace() {
  const user = await getCurrentUser();
  if (!user) return ensureDefaultWorkspace();

  const cookieStore = await cookies();
  const selectedWorkspaceId = cookieStore.get(WORKSPACE_SCOPE_COOKIE)?.value;
  if (selectedWorkspaceId) {
    const selected = await getDb().workspace.findFirst({
      where: {
        id: selectedWorkspaceId,
        users: { some: { userId: user.id } },
      },
    });
    if (selected) return selected;
  }

  const firstMembership = await getDb().workspaceUser.findFirst({
    where: { userId: user.id },
    orderBy: { createdAt: "asc" },
    include: { workspace: true },
  });
  if (firstMembership) return firstMembership.workspace;

  return ensureDefaultWorkspace(user);
}

export async function getCurrentWorkspaceId() {
  const workspace = await getCurrentWorkspace();
  return workspace.id;
}

export async function getDefaultWorkspaceId() {
  const workspace = await ensureDefaultWorkspace();
  return workspace.id;
}

export function workspaceWhere(workspaceId: string) {
  return { workspaceId };
}
