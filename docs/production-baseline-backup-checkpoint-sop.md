# Production Baseline Backup Checkpoint SOP

## Purpose

Create a read-only backup / export checkpoint before any production baseline command writes `_prisma_migrations` history rows.

This SOP exists for the baseline-maintenance case where live schema shape is already present and the team needs a recoverable checkpoint before running `prisma migrate resolve --applied`.

## Safety Rules

- Do not print database passwords or connection strings.
- Do not commit backup files.
- Store backup artifacts outside git tracking. This repo already ignores `/backups/`.
- Do not run `prisma migrate resolve`, `prisma migrate deploy`, `prisma db push`, or write SQL during checkpoint creation.
- Use a short maintenance-awareness window because logical export is read-only but may add load.

## Accepted Backup Methods

Use the first available method:

1. Managed platform backup / PITR if already enabled.
2. Supabase CLI `supabase db dump` against the production project.
3. Local Docker `postgres:*` image running `pg_dump` against production as a read-only export path.

## Required Metadata To Record

Record metadata only. Do not paste dump contents into docs.

- artifact path
- file size
- SHA-256 hash
- creation timestamp
- confirmed target environment
- confirmation that no secret or connection string was printed

## Checkpoint Procedure

1. Confirm production application health is OK.
2. Confirm staging is not pointing at production.
3. Create an ignored local folder for the artifact:

```powershell
New-Item -ItemType Directory -Force -Path backups\production-baseline | Out-Null
```

4. Receive the current production DB credential through a safe input path.
5. Run a read-only logical export.
6. Confirm the file exists and has non-zero size.
7. Record SHA-256 and basic metadata.
8. Re-run read-only migration-history inspection after the export if needed.

## Go / Hold Criteria

Go for production baseline maintenance only if all are true:

- production health is OK
- staging remains isolated
- backup / export checkpoint exists
- backup / export checkpoint is readable and non-empty
- clone baseline verification passed
- operator explicitly approves a maintenance window

Hold if any are true:

- checkpoint is missing or unreadable
- target production credential cannot be verified safely
- `_prisma_migrations` has unexpected rows
- migration-history state changed since the last read-only check
- production health is degraded

## Follow-On Step

After checkpoint creation, continue with [production-prisma-baseline-maintenance-runbook.md](./production-prisma-baseline-maintenance-runbook.md). Keep this SOP focused on backup / export only.
