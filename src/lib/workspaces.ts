import { randomBytes } from "node:crypto";
import type { UserRole, Workspace } from "@prisma/client";
import { cookies } from "next/headers";
import { cache } from "react";
import { getCurrentUser } from "@/lib/auth";
import { getDb } from "@/lib/db";

export const DEFAULT_WORKSPACE_ID = "default-workspace";
export const DEFAULT_WORKSPACE_SLUG = "default";
export const WORKSPACE_SCOPE_COOKIE = "selected_workspace_id";
const WORKSPACE_CACHE_TTL_MS = 5_000;

type WorkspaceUser = { id: string; name?: string | null; role?: UserRole };
const userWorkspaceCache = new Map<string, { expiresAt: number; workspace: Workspace }>();

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

export const getUserWorkspaces = cache(async function getUserWorkspaces(userId: string) {
  return getDb().workspace.findMany({
    where: { users: { some: { userId } } },
    orderBy: { createdAt: "asc" },
  });
});

export const getCurrentWorkspace = cache(async function getCurrentWorkspace() {
  const user = await getCurrentUser();
  if (!user) return ensureDefaultWorkspace();

  const cookieStore = await cookies();
  const selectedWorkspaceId = cookieStore.get(WORKSPACE_SCOPE_COOKIE)?.value;
  const cacheKey = `${user.id}:${selectedWorkspaceId || ""}`;
  const cached = userWorkspaceCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) return cached.workspace;

  if (selectedWorkspaceId) {
    const selected = await getDb().workspace.findFirst({
      where: {
        id: selectedWorkspaceId,
        users: { some: { userId: user.id } },
      },
    });
    if (selected) {
      userWorkspaceCache.set(cacheKey, { workspace: selected, expiresAt: Date.now() + WORKSPACE_CACHE_TTL_MS });
      return selected;
    }
  }

  const firstMembership = await getDb().workspaceUser.findFirst({
    where: { userId: user.id },
    orderBy: { createdAt: "asc" },
    include: { workspace: true },
  });
  if (firstMembership) {
    userWorkspaceCache.set(cacheKey, { workspace: firstMembership.workspace, expiresAt: Date.now() + WORKSPACE_CACHE_TTL_MS });
    return firstMembership.workspace;
  }

  const workspace = await ensureDefaultWorkspace(user);
  userWorkspaceCache.set(cacheKey, { workspace, expiresAt: Date.now() + WORKSPACE_CACHE_TTL_MS });
  return workspace;
});

export const getCurrentWorkspaceId = cache(async function getCurrentWorkspaceId() {
  const workspace = await getCurrentWorkspace();
  return workspace.id;
});

export async function getDefaultWorkspaceId() {
  const workspace = await ensureDefaultWorkspace();
  return workspace.id;
}

export function workspaceWhere(workspaceId: string) {
  return { workspaceId };
}
