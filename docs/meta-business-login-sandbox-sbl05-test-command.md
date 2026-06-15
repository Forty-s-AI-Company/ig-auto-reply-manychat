# Meta Business Login Sandbox SBL-05 Test Command

Date: 2026-06-15  
Status: SBL-05 targeted test command reference  
Scope: Sandbox-only redacted logging helper

## Command

Run the SBL-05 targeted tests with:

```bash
npx vitest run tests/meta-business-login-sandbox-sbl05.test.ts
```

## Coverage

This targeted test command covers:

- Token redaction.
- Authorization code redaction.
- Secret redaction.
- State redaction.
- Nonce redaction.
- Callback URL redaction.
- Authorize URL redaction.
- Business / Page / Instagram id masking.
- Redacted audit event creation.
- Unsafe payload detection.

## Boundaries

The SBL-05 helper does not:

- Change production audit behavior.
- Change production logging format.
- Change existing OAuth flow.
- Change existing callback routes.
- Change env variables.
- Store token, code, secret, raw state, raw nonce, callback URL, or authorize URL.
