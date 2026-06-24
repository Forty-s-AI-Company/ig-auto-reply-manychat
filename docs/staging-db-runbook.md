# Staging DB Runbook

## Goal

Split production and staging data before real customer onboarding.

This runbook plans the staging Supabase project, Vercel Preview env, and health verification without touching production data.

## Hard Boundaries

- Do not run `prisma db push`, `prisma migrate deploy`, seed scripts, smoke tests, or data copy commands against production while preparing staging.
- Do not reuse Production `DATABASE_URL`, `DIRECT_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `AUTH_SECRET`, `TOKEN_ENCRYPTION_KEY`, PayUNI keys, Meta tokens, or webhook secrets in Preview.
- Do not copy production customer rows into staging.
- Do not paste secret values into docs, GitHub issues, logs, screenshots, or browser URLs.
- Use placeholders in documentation and store real values only in Vercel / Supabase secret storage.

## Supabase Staging Project Plan

Create a separate Supabase project:

```text
Project purpose: InboxPilot Staging
Region: same or nearest production region
Database password: new staging-only password
Billing/plan: enough for preview QA and smoke tests
Backups: enable before realistic QA or destructive migration testing
```

Required outputs from Supabase:

```text
STAGING_SUPABASE_PROJECT_REF=<staging-project-ref>
DATABASE_URL=<staging Supabase pooler URL>
DIRECT_URL=<staging Supabase direct URL>
NEXT_PUBLIC_SUPABASE_URL=<staging public URL>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<staging anon key>
SUPABASE_SERVICE_ROLE_KEY=<staging service role key>
```

Recommended Prisma connection format:

```text
DATABASE_URL=postgresql://postgres.<staging-ref>:<password>@<region>.pooler.supabase.com:5432/postgres?sslmode=require&connection_limit=5&pool_timeout=60
DIRECT_URL=postgresql://postgres:<password>@db.<staging-ref>.supabase.co:5432/postgres?sslmode=require
```

## Vercel Preview Env

Set these in Vercel Preview for the `inboxpilot` project. Use staging-only values.

Core:

```text
INBOXPILOT_RELEASE_CHANNEL=full
INBOXPILOT_DEPLOYMENT_ENV=staging
INBOXPILOT_DB_ENV=staging
STAGING_SUPABASE_PROJECT_REF=<staging-project-ref>
APP_DOMAIN=staging.carry-digital-nomad.in.net
APP_URL=https://staging.carry-digital-nomad.in.net
AUTH_SECRET=<staging-only-secret>
TOKEN_ENCRYPTION_KEY=<staging-only-secret>
DATABASE_URL=<staging-pooler-url>
DIRECT_URL=<staging-direct-url>
```

Supabase:

```text
NEXT_PUBLIC_SUPABASE_URL=<staging-supabase-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<staging-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<staging-service-role-key>
```

Platform / provider values:

```text
META_VERIFY_TOKEN=<staging-only-token>
META_GRAPH_API_VERSION=v25.0
META_APP_ID=<staging-or-test-meta-app-id>
META_APP_SECRET=<staging-or-test-meta-app-secret>
META_INSTAGRAM_REDIRECT_URI=https://staging.carry-digital-nomad.in.net/api/oauth/meta-instagram/callback
META_FACEBOOK_REDIRECT_URI=https://staging.carry-digital-nomad.in.net/api/oauth/meta-facebook/callback
PAYUNI_GATEWAY_URL=<sandbox-gateway-url>
PAYUNI_ALLOW_PRODUCTION=false
PAYUNI_RETURN_URL=https://staging.carry-digital-nomad.in.net/api/billing/payuni/return
PAYUNI_NOTIFY_URL=https://staging.carry-digital-nomad.in.net/api/billing/payuni/notify
REDIS_URL=<staging-redis-url-or-empty>
CRON_SECRET=<staging-only-secret>
```

Optional providers such as Google, Telegram, email, and AI keys must also be staging-only if enabled.

## Migration Flow

After Vercel Preview env is configured:

1. Verify local CLI is pointed at the staging Supabase project, not production.
2. Confirm `STAGING_SUPABASE_PROJECT_REF` matches the project ref in both staging DB URLs.
3. Run migrations only against staging:

```bash
DATABASE_URL="<staging-pooler-url>" DIRECT_URL="<staging-direct-url>" npx prisma migrate deploy
```

4. Seed only synthetic staging data if needed.
5. Do not import production customer data.

## Health Check

After a staging branch Preview deployment is Ready and the alias is updated:

```bash
curl -i https://staging.carry-digital-nomad.in.net/api/health/staging
```

Expected safe response properties:

```text
HTTP 200
checks.database.ok=true
checks.staging.ok=true
checks.staging.dbEnvOk=true
checks.staging.databaseProjectRefOk=true
checks.staging.directProjectRefOk=true
environment.dbEnv=staging
environment.releaseChannel=full
```

Failure examples:

```text
db_env_not_staging
staging_supabase_project_ref_missing
database_url_project_ref_mismatch
direct_url_project_ref_mismatch
release_channel_not_full
```

The endpoint only runs a DB connectivity ping and env guard checks. It does not read production data or return DB connection strings.

## Go / No-Go

Staging DB split is Go only when:

- Vercel Preview has staging-only DB, auth, token encryption, Supabase, PayUNI sandbox, and provider env values.
- `/api/health/staging` returns `checks.staging.ok=true`.
- `staging.carry-digital-nomad.in.net` points to the latest `staging` branch Preview deployment.
- Production env remains unchanged.
- No production data has been copied into staging.

Production customer onboarding remains Hold until this checklist is complete.
