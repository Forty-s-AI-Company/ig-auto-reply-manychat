# Meta Business Login Sandbox Production Isolation Test Command

Date: 2026-06-15  
Status: Added  
Scope: SBL production isolation regression test

## Purpose

This test verifies that the sandbox-only Meta Business Login scaffold remains isolated from production OAuth and UI flows.

It is a guardrail test only. It does not change the current Instagram OAuth flow, callback route, login button, environment variables, Prisma schema, ConnectedAccount writes, or Channel writes.

## Targeted Command

```bash
npx vitest run tests/meta-business-login-sandbox-production-isolation.test.ts
```

## Full Sandbox Targeted Command

```bash
npx vitest run tests/meta-business-login-sandbox-production-isolation.test.ts tests/meta-business-login-sandbox-sbl01-route.test.ts tests/meta-business-login-sandbox-sbl01.test.ts tests/meta-business-login-sandbox-sbl03.test.ts tests/meta-business-login-sandbox-sbl04.test.ts tests/meta-business-login-sandbox-sbl05.test.ts tests/meta-business-login-sandbox-sbl06.test.ts tests/meta-business-login-sandbox-sbl07.test.ts tests/meta-business-login-sandbox-sbl08.test.ts tests/meta-business-login-sandbox-sbl09.test.ts
```

## Assertions

The test checks that:

- Existing production OAuth route files do not reference sandbox provider ids, sandbox helpers, or `/api/internal/oauth`.
- UI source files under `src/app` and `src/components` do not expose `/api/internal/oauth`.
- `prisma/schema.prisma` does not include sandbox-specific Meta Business Login models or fields.
- Sandbox implementation references remain limited to internal routes, sandbox helper modules, tests, and docs.

## Expected Result

```text
PASS tests/meta-business-login-sandbox-production-isolation.test.ts
```

## Failure Meaning

A failure means sandbox code may have leaked into production OAuth, UI entry points, or schema surfaces.

Before continuing toward sandbox execution evidence collection, fix the isolation failure without changing the production OAuth behavior.

## npm test Note

This targeted test is part of the SBL sandbox suite. Full `npm test` can still be run before merge or PR, but the targeted command is the required regression signal for this isolation rule.
