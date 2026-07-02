# Meta Business Login Sandbox SBL-06 To SBL-08 Test Command

Date: 2026-06-15  
Status: SBL-06 / SBL-07 / SBL-08 targeted test command reference

## Command

```bash
npx vitest run tests/meta-business-login-sandbox-sbl06.test.ts tests/meta-business-login-sandbox-sbl07.test.ts tests/meta-business-login-sandbox-sbl08.test.ts
```

## Coverage

- SBL-06 dry-run callback payload builder.
- SBL-07 workspace allowlist guard.
- SBL-08 production write guard.

## Boundaries

These helpers do not modify existing OAuth flow, existing callback routes, login buttons, env, Prisma schema, production ConnectedAccount, or production Channel records.
