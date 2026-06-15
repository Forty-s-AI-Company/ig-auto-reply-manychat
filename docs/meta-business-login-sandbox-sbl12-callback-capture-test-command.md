# Meta Business Login Sandbox SBL-12 Callback Capture Test Command

Date: 2026-06-16  
Status: Added  
Scope: Sandbox-only callback capture helper

## Purpose

SBL-12 validates that an OAuth callback can be represented as redacted evidence without exposing raw authorization code, raw state, or full callback URL, and without attempting token exchange or production writes.

This does not modify the production callback route.

## Targeted Command

```bash
npx vitest run tests/meta-business-login-sandbox-sbl12-callback-capture.test.ts
```

## Expected Result

```text
1 test file passed
5 tests passed
```

## Assertions

The test covers:

- Successful redacted callback evidence capture.
- Missing sandbox callback capture header.
- Invalid state.
- Workspace mismatch.
- Non-allowlisted workspace.

Every result must keep:

- `exchangeAttempted=false`
- `productionWrites.connectedAccount=false`
- `productionWrites.channel=false`
- `productionWrites.webhook=false`
- `productionWrites.channelSync=false`
- `productionWrites.tokenRefresh=false`

The output must not contain:

- raw authorization code
- raw state
- full callback URL
- access token
- app secret
- client secret

## Full Sandbox Regression Command

```bash
npx vitest run tests/meta-business-login-sandbox-production-isolation.test.ts tests/meta-business-login-sandbox-sbl01-route.test.ts tests/meta-business-login-sandbox-sbl01.test.ts tests/meta-business-login-sandbox-sbl03.test.ts tests/meta-business-login-sandbox-sbl04.test.ts tests/meta-business-login-sandbox-sbl05.test.ts tests/meta-business-login-sandbox-sbl06.test.ts tests/meta-business-login-sandbox-sbl07.test.ts tests/meta-business-login-sandbox-sbl08.test.ts tests/meta-business-login-sandbox-sbl09.test.ts tests/meta-business-login-sandbox-sbl11-evidence-packet.test.ts tests/meta-business-login-sandbox-sbl12-callback-capture.test.ts
```

## Gate Result

```text
Callback capture helper: Pass
Production route integration: Hold
Real callback evidence: Hold
Internal beta: Hold
Production implementation: No-Go
```
