# Meta Business Login Sandbox SBL-04 Test Command

Date: 2026-06-15  
Status: SBL-04 targeted test command reference  
Scope: Sandbox-only code exchange helper

## Command

Run the SBL-04 targeted tests with:

```bash
npx vitest run tests/meta-business-login-sandbox-sbl04.test.ts
```

## Coverage

This targeted test command covers:

- Dry-run code exchange skip by default.
- Missing code safe error classification.
- Missing redirect URI safe error classification.
- Missing injected exchange client safe error classification.
- Redacted successful injected exchange output.
- Redacted failed injected exchange output.

## Boundaries

The SBL-04 helper does not:

- Call the Meta token endpoint by default.
- Read or change env variables.
- Store access tokens.
- Change existing OAuth flow.
- Change existing callback routes.
- Change Prisma schema.
- Create or update production ConnectedAccount / Channel records.
