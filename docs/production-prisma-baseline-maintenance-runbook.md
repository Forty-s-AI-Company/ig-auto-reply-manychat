# Production Prisma Baseline Maintenance Runbook

## Purpose

Use this runbook when InboxPilot production already has the expected live schema shape, but Prisma migration history is absent or incomplete.

This is a migration-history operation, not a schema rollout. The goal is to align `_prisma_migrations` with the already-existing production schema by using `prisma migrate resolve --applied`.

## When This Runbook Applies

Use this runbook only if all are true:

- live production schema already matches the intended application schema closely enough
- `_prisma_migrations` is absent or missing the expected applied rows
- running `prisma migrate deploy` directly would incorrectly treat old migrations as pending

If live schema is actually missing tables, enums, indexes, or foreign keys, stop and return to a normal reviewed migration flow instead.

## Hard Rules

- Do not run `prisma migrate deploy` first.
- Do not run `prisma db push` on production.
- Do not treat baseline maintenance as a no-op; it still writes migration-history rows.
- Do not continue without a backup / export checkpoint.

## Migration Order

Resolve local migrations in folder order.

Current InboxPilot sequence:

```text
20260519100312_init
20260520070000_workspace_scope
20260520083353_billing_payuni
20260529033000_user_avatar_url
20260530072000_automation_folders
20260531090000_launch_security_hardening
20260604143000_connected_accounts_oauth
20260609093000_audit_events
20260610112900_billing_interval_enum
20260610113000_payment_order_interval
20260625120000_schema_drift_reconciliation
```

If new migrations are added later, update this list only after verifying that production live schema already includes their effective shape.

## Clone Verification First

Preferred command:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/prisma-baseline-verify.ps1
```

If using an existing non-production clone:

```powershell
$env:BASELINE_DATABASE_URL = "<non-production-postgresql-url>"
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/prisma-baseline-verify.ps1
Remove-Item Env:BASELINE_DATABASE_URL
```

The verification target must not contain the production project ref or production domain markers.

## Production Preconditions

- backup / export checkpoint exists
- production health is OK
- target production credential is confirmed
- `_prisma_migrations` state has been read recently
- clone verification passed
- maintenance approval is explicit

## Production Procedure

1. Load production `DATABASE_URL` / `DIRECT_URL` through a safe secret input path.
2. Confirm the target is production.
3. Confirm `_prisma_migrations` is still absent or matches the expected pre-baseline state.
4. Resolve each migration:

```powershell
npx prisma migrate resolve --schema prisma/schema.prisma --applied 20260519100312_init
npx prisma migrate resolve --schema prisma/schema.prisma --applied 20260520070000_workspace_scope
npx prisma migrate resolve --schema prisma/schema.prisma --applied 20260520083353_billing_payuni
npx prisma migrate resolve --schema prisma/schema.prisma --applied 20260529033000_user_avatar_url
npx prisma migrate resolve --schema prisma/schema.prisma --applied 20260530072000_automation_folders
npx prisma migrate resolve --schema prisma/schema.prisma --applied 20260531090000_launch_security_hardening
npx prisma migrate resolve --schema prisma/schema.prisma --applied 20260604143000_connected_accounts_oauth
npx prisma migrate resolve --schema prisma/schema.prisma --applied 20260609093000_audit_events
npx prisma migrate resolve --schema prisma/schema.prisma --applied 20260610112900_billing_interval_enum
npx prisma migrate resolve --schema prisma/schema.prisma --applied 20260610113000_payment_order_interval
npx prisma migrate resolve --schema prisma/schema.prisma --applied 20260625120000_schema_drift_reconciliation
```

5. Verify:

```powershell
npx prisma migrate status --schema prisma/schema.prisma
npx prisma validate --schema prisma/schema.prisma
```

6. Confirm production application health.

## Stop Conditions

Stop before or during baseline if:

- clone verification fails
- schema diff is non-empty and not understood
- backup checkpoint is missing
- `_prisma_migrations` contains unexpected rows
- production target cannot be confirmed safely
- application health degrades during the window

## After Baseline

Once history is aligned and `prisma migrate status` is clean, future reviewed schema changes should go back to the normal `prisma migrate deploy` path documented in [prisma-production-migration-runbook.md](./prisma-production-migration-runbook.md).
