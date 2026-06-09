import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";
import { cache } from "react";
import { getDb } from "@/lib/db";

const COOKIE_NAME = "pca_session";
const MIN_PRODUCTION_SECRET_LENGTH = 32;
const LOCAL_DEV_AUTH_SECRET = "local-dev-auth-secret-change-before-production";
const SESSION_CACHE_TTL_MS = 5_000;

type CachedSessionUser = {
  expiresAt: number;
  user: {
    id: string;
    email: string;
    name: string;
    avatarUrl: string | null;
    role: "admin" | "operator";
  } | null;
};

const sessionUserCache = new Map<string, CachedSessionUser>();

function getAuthSecret() {
  const secret = process.env.AUTH_SECRET || LOCAL_DEV_AUTH_SECRET;
  const isWeakProductionSecret =
    !process.env.AUTH_SECRET ||
    secret.length < MIN_PRODUCTION_SECRET_LENGTH ||
    secret === "change-me-in-local-dev" ||
    secret === LOCAL_DEV_AUTH_SECRET;

  if (process.env.NODE_ENV === "production" && isWeakProductionSecret) {
    throw new Error("AUTH_SECRET must be set to a strong production-only value.");
  }

  return new TextEncoder().encode(secret);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export async function createSession(userId: string) {
  return new SignJWT({ userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getAuthSecret());
}

export async function setSessionCookie(userId: string) {
  const token = await createSession(userId);
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export const getCurrentUser = cache(async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    const cached = sessionUserCache.get(token);
    if (cached && cached.expiresAt > Date.now()) return cached.user;

    const { payload } = await jwtVerify(token, getAuthSecret());
    if (typeof payload.userId !== "string") return null;
    const user = await getDb().user.findUnique({
      where: { id: payload.userId },
      select: { id: true, email: true, name: true, avatarUrl: true, role: true },
    });
    sessionUserCache.set(token, { user, expiresAt: Date.now() + SESSION_CACHE_TTL_MS });
    return user;
  } catch {
    return null;
  }
});

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

export async function requireApiUser() {
  const user = await getCurrentUser();
  if (!user) {
    return {
      user: null,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  return { user, response: null };
}
