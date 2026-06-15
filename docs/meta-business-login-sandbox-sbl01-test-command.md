# Meta Business Login Sandbox SBL-01 Test Command

Date: 2026-06-15  
Status: SBL-01 targeted test command reference  
Scope: Internal-only route skeleton tests

## Command

Run the SBL-01 targeted tests with:

```bash
npx vitest run tests/meta-business-login-sandbox-sbl01.test.ts
npx vitest run tests/meta-business-login-sandbox-sbl01-route.test.ts
```

## Coverage

This targeted test command covers:

- Production environment route blocking.
- Admin-only internal access.
- Required sandbox header.
- Sandbox provider id guard.
- Workspace allowlist guard.
- Redacted authorize dry-run payload.
- Redacted callback dry-run payload.
- User cancel / permission error classification.
- Production write guard validation.
- Internal authorize route dry-run response.
- Internal callback route dry-run response.

## Boundaries

The SBL-01 targeted test command and route skeleton do not:

- Change existing OAuth flow.
- Change existing callback routes.
- Change login buttons.
- Change env variables.
- Change Prisma schema.
- Create or update production ConnectedAccount records.
- Create or update production Channel records.
- Perform real Meta token exchange.
- Redirect to Meta authorize URLs.
