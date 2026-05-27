import { config } from "dotenv";

export function loadProjectEnv() {
  config({ path: ".env.local", override: true });
  config({ path: ".env", override: false });
  normalizeDatabaseUrl();
}

function normalizeDatabaseUrl() {
  if (!process.env.DATABASE_URL) return;

  try {
    const url = new URL(process.env.DATABASE_URL);
    const isPostgres = url.protocol === "postgresql:" || url.protocol === "postgres:";
    const isSupabase = url.hostname.endsWith(".supabase.co") || url.hostname.includes(".pooler.supabase.com");
    if (isPostgres && isSupabase && !url.searchParams.has("sslmode")) {
      url.searchParams.set("sslmode", "require");
      process.env.DATABASE_URL = url.toString();
    }
  } catch {
    // Keep the original value so Prisma can report the actual configuration error.
  }
}
