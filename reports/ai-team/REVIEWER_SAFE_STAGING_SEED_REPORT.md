# Reviewer Safe Staging Seed Report

Generated: 2026-07-04

## 1. Gitignore Safety

Confirmed `.gitignore` ignores:

- `.env`
- `.env.local`
- `.env.production.local`
- `.env.*.local` through the `.env*` rule

Only `.env.example` is intentionally allowed.

## 2. Modified Files

| File | Purpose |
| --- | --- |
| `.env.example` | Added reviewer-safe staging seed placeholders without real credentials. |
| `package.json` | Added `seed:staging-reviewer`. |
| `scripts/ensure-staging-reviewer-account.ts` | Added guarded, idempotent reviewer-safe staging account / demo data seed script. |
| `reports/ai-team/REVIEWER_STAGING_ENV_REQUIRED.md` | Lists private `.env.local` keys required before the staging seed can run. |
| `reports/ai-team/REVIEWER_SAFE_STAGING_SEED_REPORT.md` | This report. |

Existing dirty docs were detected but not changed by this seed task:

- `docs/codex-session-log.md`
- `docs/fix-roadmap.md`

## 3. Seed Script

Command:

```bash
npm run seed:staging-reviewer
```

Script:

```text
scripts/ensure-staging-reviewer-account.ts
```

The script is idempotent and uses upsert/delete-recreate where appropriate for reviewer-safe fixtures.

## 4. Safety Guards

The seed script refuses to run unless:

- `REVIEWER_STAGING_MODE=true`
- `REVIEWER_STAGING_BASE_URL` points to `https://staging.carry-digital-nomad.in.net`
- `DATABASE_URL` is set
- `DATABASE_URL` or `DIRECT_URL` contains the known staging Supabase project ref
- `DATABASE_URL` / `DIRECT_URL` does not contain the production Supabase project ref
- `INBOXPILOT_DB_ENV` is not `production`
- `REVIEWER_STAGING_PASSWORD` is at least 12 characters

It does not write real IG / Meta user data, does not store access tokens, and does not send messages to real Instagram users.

## 5. Required Local Env

Current `.env.local` check result:

```text
REVIEWER_STAGING_BASE_URL=MISSING
REVIEWER_STAGING_EMAIL=MISSING
REVIEWER_STAGING_PASSWORD=MISSING
REVIEWER_STAGING_WORKSPACE_NAME=MISSING
REVIEWER_STAGING_CHANNEL_NAME=MISSING
REVIEWER_STAGING_MODE=MISSING
```

Required local-only keys are listed in:

```text
reports/ai-team/REVIEWER_STAGING_ENV_REQUIRED.md
```

No secret values were printed.

## 6. Seed Execution Result

Command:

```bash
npm run seed:staging-reviewer
```

Result:

```text
DB_SEED_SKIPPED_BY_PRODUCTION_GUARD
```

Reason:

```text
The local DATABASE_URL / DIRECT_URL still contain the production Supabase project ref.
The direct DB seed path correctly refuses to run in this state.
```

This is the expected safe result unless local `.env.local` is pointed at the staging Supabase project. To avoid touching production DB, this run used the staging app signup/login/mock webhook APIs instead of direct DB writes.

## 6.1 Staging App Account Creation Result

The following private `.env.local` keys were added without printing secret values:

```text
REVIEWER_STAGING_BASE_URL=SET
REVIEWER_STAGING_EMAIL=SET
REVIEWER_STAGING_PASSWORD=SET_NO_OUTPUT
REVIEWER_STAGING_WORKSPACE_NAME=SET
REVIEWER_STAGING_CHANNEL_NAME=SET
REVIEWER_STAGING_MODE=SET
```

Staging app API checks:

| Check | Result |
| --- | --- |
| `POST /api/auth/signup` | PASS, HTTP 200 |
| `POST /api/auth/login` | PASS, HTTP 200 |
| `POST /api/webhooks/mock` | PASS, HTTP 202 |
| Reviewer-safe mock conversation created | PASS |

Authenticated staging browser checks:

| Check | Result |
| --- | --- |
| Dashboard visible | PASS |
| Inbox contains reviewer-safe conversation | PASS |
| Contacts contains reviewer-safe contact | PASS |

## 7. Validation

| Command | Result |
| --- | --- |
| `npx eslint scripts/ensure-staging-reviewer-account.ts` | PASS |
| `npm run build` | PASS |
| Authenticated staging Playwright check | PASS |

Build note: Prisma generate reported a local Windows file lock and safely reused the existing generated client. Next.js build completed successfully.

## 8. Readiness

```text
REVIEWER_SAFE_STAGING_SEED=PASS
STAGING_LOGIN_READY=PASS
READY_FOR_AUTHENTICATED_STAGING_QA=PASS
```

## 9. Next Step

Use the reviewer-safe staging credentials now stored in local `.env.local` to run the authenticated staging QA pass. Do not print the password.

If direct staging DB seed is still desired later, first replace local `DATABASE_URL` / `DIRECT_URL` with staging DB credentials, then run:

```bash
npm run seed:staging-reviewer
```

Do not run the direct DB seed while `.env.local` points at production.
