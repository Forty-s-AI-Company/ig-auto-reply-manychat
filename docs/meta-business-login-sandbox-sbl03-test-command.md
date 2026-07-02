# Meta Business Login Sandbox SBL-03 Test Command

Date: 2026-06-15  
Status: SBL-03 targeted test command reference  
Scope: Sandbox-only state and nonce helpers

## Command

Run the SBL-03 targeted tests with:

```bash
npx vitest run tests/meta-business-login-sandbox-sbl03.test.ts
```

## Coverage

This targeted test command covers:

- Opaque state generation.
- Opaque nonce generation.
- State and nonce hash storage.
- Redacted audit output.
- TTL expiration.
- Single-use replay rejection.
- Provider mismatch rejection.
- Workspace / user mismatch rejection.
- Raw state mismatch rejection.
- Raw nonce mismatch rejection.

## Boundaries

The SBL-03 helpers do not:

- Change existing OAuth state helpers.
- Change existing callback routes.
- Change cookies.
- Change env variables.
- Change Prisma schema.
- Store token, code, raw state, or raw nonce.
- Perform real Meta token exchange.
