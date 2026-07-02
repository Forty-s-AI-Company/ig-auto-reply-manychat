# Prisma Production Migration Runbook

## Scope

This runbook covers reviewed Prisma migration work for InboxPilot production.

Use it when:

- local `prisma/schema.prisma` has changed
- reviewed SQL migrations already exist under `prisma/migrations`
- the team needs a controlled production rollout path

Do not use this runbook for ad hoc schema reconciliation or emergency production writes.

## Hard Rules

- Do not use `prisma db push` on production.
- Do not write schema changes directly in SQL consoles unless the migration plan explicitly requires a DBA-approved manual step.
- Do not copy production data into staging.
- Do not print database passwords, connection strings, or secret env values into docs, shell history, CI logs, or chat.

## Standard Rollout Path

1. Confirm the schema change is represented by reviewed migration files under `prisma/migrations`.
2. Validate the migration on a disposable clone or non-production PostgreSQL target first.
3. Capture a production backup / export checkpoint before any production write.
4. Confirm production health is `status=ok`.
5. Confirm the correct production target and maintenance window.
6. Run:

```powershell
npx prisma migrate deploy --schema prisma/schema.prisma
```

7. Verify:

```powershell
npx prisma migrate status --schema prisma/schema.prisma
npx prisma validate --schema prisma/schema.prisma
```

8. Re-run application health checks and targeted smoke checks.

## Required Preflight Checks

- Backup / export checkpoint exists and is readable.
- Production DB target is confirmed by project ref / host ownership.
- Staging is isolated from production.
- No missing enum values or incompatible live data remain.
- The migration plan has a clear rollback / failure handling note.

## Enum Preflight Pattern

When a migration introduces or tightens enums, run read-only checks first.

Example pattern:

```sql
SELECT DISTINCT "role" FROM "User" WHERE "role" NOT IN ('admin', 'operator');
SELECT DISTINCT "status" FROM "Subscription" WHERE "status" NOT IN ('trialing', 'active', 'past_due', 'canceled', 'unpaid');
```

Every query should return zero rows before production migration.

## Failure Handling

If `migrate deploy` fails before commit:

- keep the app on the previous deployment
- inspect the exact failing enum, index, foreign key, or data shape
- do not retry blindly

If the migration succeeds but the app fails afterward:

- roll back the application deployment first
- keep the database forward unless a DBA-approved restore is safer
- only use backup / PITR if the forward schema causes unrecoverable production impact

If Prisma reports checksum mismatch:

- stop
- compare applied migration history with repo migration files
- resolve history explicitly before touching production again

## InboxPilot-Specific Note

InboxPilot has a separate baseline runbook for the case where the live production schema already matches `prisma/schema.prisma`, but `_prisma_migrations` history is absent. That path is documented in [production-prisma-baseline-maintenance-runbook.md](./production-prisma-baseline-maintenance-runbook.md) and must not be treated as a normal `migrate deploy`.
