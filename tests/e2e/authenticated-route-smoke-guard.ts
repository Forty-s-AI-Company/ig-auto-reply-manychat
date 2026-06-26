const PRODUCTION_SUPABASE_PROJECT_REF = "lmwvzskffzozuiamjxvc";

type EnvLike = Record<string, string | undefined>;

export function getAuthenticatedRouteSmokeGuard(env: EnvLike = process.env) {
  const testDatabaseUrl = env.TEST_DATABASE_URL?.trim() || "";

  if (!testDatabaseUrl) {
    return {
      shouldSkip: true,
      reason: "Authenticated smoke tests require TEST_DATABASE_URL.",
    };
  }

  const usesProductionDatabase =
    env.INBOXPILOT_DB_ENV === "production" || testDatabaseUrl.includes(PRODUCTION_SUPABASE_PROJECT_REF);

  if (usesProductionDatabase) {
    return {
      shouldSkip: true,
      reason: "Authenticated smoke tests refuse to run against the production database.",
    };
  }

  return {
    shouldSkip: false,
    reason: "Authenticated smoke tests are using TEST_DATABASE_URL.",
  };
}
