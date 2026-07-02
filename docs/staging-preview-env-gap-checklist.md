# Staging Preview Env Gap Checklist

## Scope

This checklist tracks non-DB runtime environment readiness for Vercel Preview staging.

Do not paste secret values into this file. Store real values only in Vercel environment variables scoped to Preview / staging.

## Staging Foundations

Required environment names:

```text
APP_DOMAIN
APP_URL
AUTH_SECRET
DATABASE_URL
DIRECT_URL
INBOXPILOT_DB_ENV
INBOXPILOT_DEPLOYMENT_ENV
INBOXPILOT_RELEASE_CHANNEL
NEXT_PUBLIC_SUPABASE_ANON_KEY
NEXT_PUBLIC_SUPABASE_URL
STAGING_SUPABASE_PROJECT_REF
SUPABASE_SERVICE_ROLE_KEY
TOKEN_ENCRYPTION_KEY
```

## Runtime Services

- `REDIS_URL`
  - Purpose: enables queue-backed runtime behavior and healthy Redis checks.

- `CRON_SECRET`
  - Purpose: protects internal cron and worker trigger routes.

- `JOB_QUEUE_NAME`
- `WORKER_CONCURRENCY`
- `WORKER_INTERVAL_MS`
- `WORKER_DB_BATCH_SIZE`
  - Purpose: align staging worker behavior with the intended runtime profile.

## Meta Test-App Readiness

- `META_VERIFY_TOKEN`
- `META_APP_ID`
- `META_APP_SECRET`
- `META_INSTAGRAM_APP_ID`
- `META_INSTAGRAM_APP_SECRET`
- `META_GRAPH_API_VERSION`
- `META_INSTAGRAM_REDIRECT_URI`
- `META_FACEBOOK_REDIRECT_URI`

Notes:

- prefer real OAuth-connected account records over global fallback env values
- do not store reviewer credentials or tokens in docs

## PayUNI Sandbox Readiness

- `PAYUNI_ALLOW_PRODUCTION=false`
- `PAYUNI_GATEWAY_URL`
- `PAYUNI_MERCHANT_ID`
- `PAYUNI_HASH_KEY`
- `PAYUNI_HASH_IV`
- `PAYUNI_NOTIFY_URL`
- `PAYUNI_RETURN_URL`
- `PAYUNI_VERSION`

Notes:

- staging must stay on sandbox values
- do not enable production gateway usage in Preview

## Can Be Deferred Unless Explicitly Under Test

- Google auth envs
- Telegram bot envs
- SMTP envs
- AI API keys
- Meta global fallback envs for special debugging only

## Health Interpretation

Use `/api/health/staging` as the first runtime check.

Expected staging signals:

```text
status=ok
checks.database.ok=true
checks.redis.configured=true
checks.redis.ok=true
checks.staging.ok=true
```

If staging health is degraded, inspect missing env names before assuming application code regression.
