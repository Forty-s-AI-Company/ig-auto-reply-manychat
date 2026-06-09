# Database Migration Runbook

InboxPilot production DB is Supabase Postgres. The Supabase project must be `IG Auto Reply ManyChat`.

## Dry Run

Run against a non-production Supabase/Postgres database before production:

```bash
export DATABASE_URL="postgresql://..."
export DIRECT_URL="postgresql://..."
npx prisma migrate deploy
npx prisma generate
npm run test:coverage:db
```

Expected result:

- `prisma/migrations/migration_lock.toml` provider is `postgresql`.
- `20260531090000_launch_security_hardening` applies cleanly.
- RLS SQL in `docs/security/supabase-rls-fix.sql` applies cleanly in Supabase SQL Editor.
- Audit queries at the bottom of `docs/security/supabase-rls-fix.sql` return no public application tables with RLS disabled and no RLS-enabled tables without policies.

2026-05-31 verification: migration dry-run was executed against a temporary Supabase schema using the project pooler connection. All six Prisma migrations applied successfully and the temporary schema was dropped afterward.

## Production Apply

1. Take a Supabase backup or snapshot.
2. Deploy application code.
3. If the target `public` schema is an existing non-empty database that was not created by Prisma migrations, baseline it first with `prisma migrate resolve --applied <migration_name>` for the migrations that already match production. Do not run `migrate deploy` directly against a non-empty unbaselined production schema; Prisma will return `P3005`.
4. Run:

```bash
npx prisma migrate deploy
```

5. Apply:

```text
docs/security/supabase-rls-fix.sql
```

6. Re-run the RLS audit queries from the SQL file.
7. Smoke test login, dashboard, inbox, broadcasts, payment checkout, Meta webhook verification, and worker cron.

## Rollback

Prisma migrations are forward-only. Rollback is operational:

1. Pause Vercel deployment traffic or roll Vercel back to the previous deployment.
2. Restore the Supabase backup/snapshot if the schema migration caused data or compatibility issues.
3. If only RLS blocks traffic, disable the newly added policies temporarily from Supabase SQL Editor while keeping service-role server routes online:

```sql
-- Emergency only. Prefer policy fix over disabling RLS.
alter table public."User" disable row level security;
```

4. Re-apply corrected policies and rerun the audit queries.

## Current External Finding

On 2026-05-31, Supabase Advisor showed `RLS Disabled in Public` as Critical for the project overview. Visible affected tables included:

- `public.User`
- `public.Workspace`
- `public.Conversation`
- `public.Segment`

This item was later closed after the complete SQL file was applied and audited in Supabase.

Later on 2026-05-31, SQL Editor showed `Success. No rows returned` for a query titled `Supabase RLS Helper Functions for User Workspace Access`, but Security Advisor still showed 43 `RLS Disabled in Public` errors after opening the advisor page. After the user reported that the full `docs/security/supabase-rls-fix.sql` had been executed, `Rerun linter` was triggered in Supabase Security Advisor and the result still showed 43 `RLS Disabled in Public` errors. Treat RLS as unresolved until Advisor or the audit queries report zero affected tables.

The direct audit query then confirmed these tables still had `rowsecurity = false`:

- `public.Channel`
- `public.Contact`
- `public.Conversation`
- `public.Segment`
- `public.User`
- `public.Workspace`

This confirms the RLS enable statements did not take effect on the production branch/database being inspected by Advisor.

After manually running the minimal `alter table ... enable row level security` statements, the same audit returned `rowsecurity = true` for:

- `public.Channel`
- `public.Contact`
- `public.Conversation`
- `public.Segment`
- `public.User`
- `public.Workspace`

This confirms SQL Editor is targeting the correct production database and that the earlier full script did not fully apply or was rolled back before the RLS enable statements took effect.

The follow-up audit showed 37 remaining public tables with RLS still disabled, including operational, billing, referral, sequence, message, automation, and workspace configuration tables. The policy audit also showed the six manually enabled tables had no policies yet:

- `public.Channel`
- `public.Contact`
- `public.Conversation`
- `public.Segment`
- `public.User`
- `public.Workspace`

This is an intermediate unsafe state: some tables now enforce RLS but have no allow policies, while many other public tables still have RLS disabled.

After enabling RLS on the remaining tables, the `pg_tables` audit for `rowsecurity = false` returned 0 rows. Supabase Security Advisor was opened again and showed `Errors = 0` and `Warnings = 0`, with 43 informational suggestions remaining.

The direct `pg_policy` audit then showed every RLS-enabled application table still lacked policies. This meant Advisor's RLS-disabled errors were resolved, but the actual row-access policy layer was not yet applied.

Root cause found on 2026-05-31: the previous SQL Editor run only copied the first 100 lines of `docs/security/supabase-rls-fix.sql`. After the complete SQL file was pasted and executed, SQL Editor showed `Success. No rows returned` and `0 row` for the audit query, confirming no RLS-enabled application tables without policies. Supabase Security Advisor was checked again and showed `Errors = 0`, `Warnings = 0`, and `No errors detected`.
