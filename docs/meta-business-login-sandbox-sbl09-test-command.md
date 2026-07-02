# Meta Business Login Sandbox SBL-09 Test Command

Date: 2026-06-15  
Status: SBL-09 targeted test command reference  
Scope: Test scaffold only

## Command

Run the SBL-09 targeted tests with:

```bash
npx vitest run tests/meta-business-login-sandbox-sbl09.test.ts
```

## Coverage

This targeted test command covers:

- Safe fixture redaction checks.
- Unsafe fixture detection.
- Dry-run callback payload snapshot validation.
- Raw callback URL and reusable authorize URL rejection.
- Production write guard fixture validation.
- Minimum guarded production operations.

## Boundaries

The SBL-09 targeted test command does not:

- Change product code.
- Change OAuth flow.
- Change callback routes.
- Change login buttons.
- Change env variables.
- Change Prisma schema.
- Create or update production ConnectedAccount records.
- Create or update production Channel records.
- Perform real Meta token exchange.

## Required Follow-Up

After SBL-09 tests run, backfill:

- `docs/meta-business-login-sandbox-runbook-template.md`
- `docs/meta-business-login-sandbox-experiment-report-template.md`
- `docs/meta-business-login-sandbox-go-no-go-checklist.md`
- `docs/security-review.md`
- `docs/fix-roadmap.md`
- `docs/codex-session-log.md`
