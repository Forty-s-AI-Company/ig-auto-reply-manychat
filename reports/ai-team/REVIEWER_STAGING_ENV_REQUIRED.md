# Reviewer Staging Env Required

Generated: 2026-07-04

Add the following keys to local `.env.local` only. Do not commit real values.

```text
REVIEWER_STAGING_BASE_URL=https://staging.carry-digital-nomad.in.net
REVIEWER_STAGING_EMAIL=<reviewer-safe-staging-email>
REVIEWER_STAGING_PASSWORD=<strong-reviewer-safe-password>
REVIEWER_STAGING_WORKSPACE_NAME=Reviewer Safe Workspace
REVIEWER_STAGING_CHANNEL_NAME=Review Channel
REVIEWER_STAGING_MODE=true
```

The seed command also requires `DATABASE_URL` / `DIRECT_URL` to point at the staging Supabase project, not production.

Safety guards in `scripts/ensure-staging-reviewer-account.ts` refuse to run when:

- `REVIEWER_STAGING_MODE` is not `true`
- `REVIEWER_STAGING_BASE_URL` is not the staging domain
- `DATABASE_URL` is missing
- `DATABASE_URL` / `DIRECT_URL` contains the production Supabase project ref
- `DATABASE_URL` / `DIRECT_URL` does not contain the known staging Supabase project ref

Run:

```bash
npm run seed:staging-reviewer
```

