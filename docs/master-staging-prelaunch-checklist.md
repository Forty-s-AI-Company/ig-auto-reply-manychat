# Master / Staging Pre-Launch Checklist

Date: 2026-06-24

## Current Summary

Current intended release plan:

- `master` / Production custom domain should run the `simple` release.
- `staging` / Preview custom domain should run the `full` release.
- Production URL: `https://inboxpilot.carry-digital-nomad.in.net`
- Staging URL: `https://staging.carry-digital-nomad.in.net`
- Staging alias currently points to a `staging` branch Preview deployment.

Important finding:

- Vercel env is already split for release channel.
- The committed `master` and `staging` branches do not currently include `src/lib/release-mode.ts`.
- Local workspace has uncommitted release mode implementation files.
- Treat the production simple / staging full app behavior as not fully secured until those app changes are committed and deployed.

## Release Mode Matrix

| Target | Branch | Domain | Intended release mode | Current status |
| --- | --- | --- | --- | --- |
| Production | `master` | `inboxpilot.carry-digital-nomad.in.net` | `simple` | Vercel env exists, but committed app code does not yet include the release-mode implementation file. |
| Staging | `staging` | `staging.carry-digital-nomad.in.net` | `full` | Vercel env exists and staging alias automation is verified. Full behavior still depends on committing release-mode app changes. |
| Other Preview | feature / codex branches | Vercel generated preview URL | `full` by default | Should not update `staging.carry-digital-nomad.in.net`. |

## Vercel Environment Variable Snapshot

Checked with:

```text
npx vercel env ls production --scope a25814740s-projects
npx vercel env ls preview --scope a25814740s-projects
```

Values were not printed or copied.

### Production

Configured in Production:

```text
INBOXPILOT_RELEASE_CHANNEL
PAYUNI_ALLOW_PRODUCTION
PAYUNI_HASH_IV
PAYUNI_HASH_KEY
PAYUNI_RETURN_URL
PAYUNI_NOTIFY_URL
PAYUNI_MERCHANT_ID
PRISMA_CONNECTION_LIMIT
PAYUNI_GATEWAY_URL
DIRECT_URL
DATABASE_URL
META_INSTAGRAM_REDIRECT_URI
META_INSTAGRAM_APP_SECRET
META_INSTAGRAM_APP_ID
META_APP_SECRET
META_APP_ID
NEXT_PUBLIC_APP_URL
APP_URL
CRON_SECRET
GOOGLE_CLIENT_SECRET
GOOGLE_CLIENT_ID
CODEX_CLI_TIMEOUT_MS
CODEX_CLI_COMMAND
OPENAI_API_KEY
TELEGRAM_WEBHOOK_SECRET
TELEGRAM_BOT_TOKEN
SUPABASE_SERVICE_ROLE_KEY
NEXT_PUBLIC_SUPABASE_ANON_KEY
NEXT_PUBLIC_SUPABASE_URL
PAYUNI_VERSION
META_TOKEN_RENEWAL_WINDOW_DAYS
META_USER_ACCESS_TOKEN_EXPIRES_AT
META_USER_ACCESS_TOKEN
META_INSTAGRAM_BUSINESS_ACCOUNT_ID
META_PAGE_ACCESS_TOKEN
META_PAGE_ID
META_VERIFY_TOKEN
META_GRAPH_API_VERSION
APP_DOMAIN
AUTH_SECRET
```

Expected value:

```text
INBOXPILOT_RELEASE_CHANNEL=simple
```

### Preview / Staging

Configured in Preview:

```text
INBOXPILOT_RELEASE_CHANNEL
```

Expected value:

```text
INBOXPILOT_RELEASE_CHANNEL=full
```

Concern:

- Preview currently does not list `DATABASE_URL`, `DIRECT_URL`, `AUTH_SECRET`, `APP_URL`, Meta, PayUNI, Supabase, Google, Telegram, Redis, or cron env vars.
- If staging should use the same DB temporarily, copy the required runtime env vars to Preview deliberately.
- If staging should not share DB, create separate Preview/staging DB env vars instead.
- Do not assume Production env vars are available to Preview deployments.

## DB Sharing Risk

Current product decision:

- DB sharing is temporarily accepted only because the product is not live with real customers.
- This must stop before real customer onboarding, paid launch, Meta production testing with real customer assets, or affiliate/billing tests.

Main risks while DB is shared:

- Staging tests can create, modify, or delete production-visible workspace data.
- Staging webhook tests can process real production events if webhook URLs or tokens point at shared resources.
- Staging automation tests can send real messages if connected channel tokens are shared.
- Billing, referral, and affiliate records can be polluted by test data.
- Meta env token fallback can weaken tenant boundaries.
- Debug or test users may become mixed with future customer data.

If Preview currently lacks DB env vars:

- The immediate risk is not only shared DB; it is staging runtime incompleteness.
- Staging may build successfully but fail when routes require database access.
- Before relying on staging, confirm whether Preview has intentional DB access.

## Go / No-Go Checklist

### P0 - Must Fix Before Real Customer Onboarding

- `[x]` Prepare the release mode implementation for commit so `master` serves simple release and `staging` serves full release.
- `[x]` Add `src/lib/release-mode.ts` to the release-mode change set for both `master` and `staging`.
- `[x]` Confirm `src/proxy.ts` blocks full-only routes and non-Instagram OAuth paths on simple production by smoke test.
- `[ ]` Confirm Production `INBOXPILOT_RELEASE_CHANNEL=simple`.
- `[ ]` Confirm Preview `INBOXPILOT_RELEASE_CHANNEL=full`.
- `[ ]` Decide whether staging temporarily shares DB or receives a separate DB.
- `[ ]` If temporarily sharing DB, explicitly add required DB/runtime env vars to Preview and mark the risk accepted.
- `[ ]` Before real users, split Production and Staging `DATABASE_URL` / `DIRECT_URL`.
- `[ ]` Remove or disable Meta env token fallback in production.
- `[ ]` Confirm `TOKEN_ENCRYPTION_KEY` exists in Production before storing real channel tokens.
- `[ ]` Confirm staging alias automation only updates from staging branch Preview deployments.

### P1 - Must Fix Before Paid / Public Launch

- `[ ]` Complete Meta App Review / Advanced Access / Business Verification evidence.
- `[ ]` Finalize PayUNI production merchant review and production payment SOP.
- `[ ]` Keep affiliate payout hidden from production simple release until anti-fraud, clawback, terms, and payout SOP are complete.
- `[ ]` Add tenant isolation regression tests for sensitive Prisma queries.
- `[x]` Add smoke tests for simple-release route redirects and non-Instagram OAuth blocking.
- `[ ]` Add staging smoke test against `https://staging.carry-digital-nomad.in.net`.
- `[ ]` Clean production-facing Terms, Privacy, Data Deletion, Billing, and refund/cancellation copy.

### P2 - Should Fix Before Scaling

- `[ ]` Deploy a dedicated worker runtime.
- `[ ]` Configure Redis / BullMQ for production worker processing.
- `[ ]` Add monitoring and alerting for webhook, billing, auth, worker, and cron failures.
- `[ ]` Run load tests before high-volume automation or broadcast use.
- `[ ]` Decide whether AI local CLI providers stay local-only or receive a dedicated authenticated runtime.

## Recommended Immediate Order

1. Commit the release mode app implementation.
2. Push the same implementation to `master` and `staging`.
3. Verify Production still resolves to `simple`.
4. Verify Staging resolves to `full`.
5. Fix Preview env completeness: either intentionally share DB temporarily or create a staging DB.
6. Add smoke tests for both domains.
7. Split DB before onboarding real customers.
