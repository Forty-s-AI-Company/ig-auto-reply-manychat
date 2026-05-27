import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

const COOKIE_NAME = "pca_session";
const MIN_PRODUCTION_SECRET_LENGTH = 32;
const LOCAL_DEV_AUTH_SECRET = "local-dev-auth-secret-change-before-production";

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

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, getAuthSecret());
    if (typeof payload.userId !== "string") return null;
    return getDb().user.findUnique({
      where: { id: payload.userId },
      select: { id: true, email: true, name: true, role: true },
    });
  } catch {
    return null;
  }
}

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
