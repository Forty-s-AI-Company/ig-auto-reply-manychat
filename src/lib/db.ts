import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

function normalizePrismaPoolUrl(name: "DATABASE_URL" | "DIRECT_URL") {
  const value = process.env[name];
  if (!value) return;

  try {
    const url = new URL(value);
    const isPostgres = url.protocol === "postgresql:" || url.protocol === "postgres:";
    const isSupabasePooler = url.hostname.includes(".pooler.supabase.com");
    if (!isPostgres || !isSupabasePooler) return;

    const defaultConnectionLimit = process.env.NODE_ENV === "production" ? "5" : "10";
    url.searchParams.set("connection_limit", process.env.PRISMA_CONNECTION_LIMIT || defaultConnectionLimit);
    const currentTimeout = Number(url.searchParams.get("pool_timeout") || "0");
    if (!currentTimeout || currentTimeout < 60) {
      url.searchParams.set("pool_timeout", "60");
    }

    process.env[name] = url.toString();
  } catch {
    // Keep the original value so Prisma can report configuration errors.
  }
}

export function getDb() {
  if (!globalForPrisma.prisma) {
    normalizePrismaPoolUrl("DATABASE_URL");
    normalizePrismaPoolUrl("DIRECT_URL");
    globalForPrisma.prisma = new PrismaClient({
      log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    });
  }

  return globalForPrisma.prisma;
}

export type DbClient = ReturnType<typeof getDb>;
