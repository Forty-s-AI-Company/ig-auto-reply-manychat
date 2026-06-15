# Meta Business Login Sandbox Controlled Callback Capture Plan

Date: 2026-06-16  
Status: Sandbox helper and signed-state route guard implemented
Scope: Controlled callback capture before completing Instagram Business Login OAuth

## Summary

This plan prepares the next safe step after Instagram Business Login account selection.

The current Meta-provided Instagram Business Login redirect URI still points to the production callback route. The next OAuth attempt may produce an authorization code or call the production callback. Before that happens, callback evidence must be captured without exposing raw code or writing production records.

```text
Sandbox callback capture helper: Implemented
Production callback integration: Implemented as read-only signed-state guard
Production callback behavior: Unchanged when state is not a sandbox capture marker
Internal beta: Hold
Production implementation: No-Go
```

## Production Callback Risk Map

`/api/instagram/oauth/callback` re-exports the production Meta callback:

```text
src/app/api/instagram/oauth/callback/route.ts
```

Actual implementation:

```text
src/app/api/meta/oauth/callback/route.ts
```

Risk points:

| Area | File / lines | Current behavior |
| --- | --- | --- |
| Instagram token exchange | `src/app/api/meta/oauth/callback/route.ts:200` | Exchanges authorization code at `https://api.instagram.com/oauth/access_token`. |
| Long-lived IG token exchange | `src/app/api/meta/oauth/callback/route.ts:217` | Exchanges short token for long-lived token. |
| Facebook user token exchange | `src/app/api/meta/oauth/callback/route.ts:273` | Exchanges Facebook OAuth code for user token. |
| Webhook subscription | `src/app/api/meta/oauth/callback/route.ts:359` | Registers app and page subscriptions when conditions allow. |
| Page-based channel upsert | `src/app/api/meta/oauth/callback/route.ts:419` | Upserts Instagram channels and disables mock channels. |
| Business asset channel write | `src/app/api/meta/oauth/callback/route.ts:486` | Creates / updates Instagram channels from Business assets. |
| Instagram Login channel write | `src/app/api/meta/oauth/callback/route.ts:552` | Creates / updates Instagram channel from Instagram Login profile. |
| Main callback state check | `src/app/api/meta/oauth/callback/route.ts:636` | Reads `code`, `state`, cookies, popup state, workspace, and mode. |
| Instagram Login success path | `src/app/api/meta/oauth/callback/route.ts:700` | Exchanges code, reads profile, upserts channel, redirects success. |
| Facebook success path | `src/app/api/meta/oauth/callback/route.ts:719` | Exchanges code, reads pages / business assets, upserts channels. |

## Sandbox Callback Capture Helper

Implemented:

```text
src/lib/meta-business-sandbox-callback-capture.ts
```

Test:

```text
tests/meta-business-login-sandbox-sbl12-callback-capture.test.ts
```

Targeted command:

```bash
npx vitest run tests/meta-business-login-sandbox-sbl12-callback-capture.test.ts
```

## Capture Rules

The helper requires:

- Sandbox provider id.
- Explicit sandbox callback capture header: `sbl-callback-capture`.
- Allowlisted workspace.
- Workspace in session and state must match.
- Authorization code must exist.
- State must exist and match expected state.

The helper records:

- `codeHash`
- `stateHash`
- redacted callback URL marker
- redacted code marker
- redacted state marker
- production write flags fixed to `false`
- `exchangeAttempted=false`

The helper does not:

- Exchange code for token.
- Read app secret.
- Store token.
- Create / update ConnectedAccount.
- Create / update Channel.
- Register webhook.
- Start channel sync.
- Schedule token refresh.
- Modify production callback behavior.

## Current Test Result

```text
npx vitest run tests/meta-business-login-sandbox-sbl12-callback-capture.test.ts
```

Result:

```text
1 test file passed
5 tests passed
```

Covered cases:

- Successful redacted callback evidence capture.
- Missing sandbox capture header.
- State mismatch.
- Workspace mismatch.
- Non-allowlisted workspace.

## Remaining Integration Gap

The helper is not wired into:

```text
/api/instagram/oauth/callback
/api/meta/oauth/callback
```

This is intentional for now.

Before wiring it into a route, a separate change must define exactly how the route detects sandbox capture mode without changing default production callback behavior.

## Safe Integration Options

### Option A - Register Sandbox Redirect URI

Register a separate Meta redirect URI:

```text
/api/internal/oauth/meta-business-instagram-sandbox/callback
```

Use the existing internal sandbox callback route to capture evidence.

Pros:

- Does not touch production callback.
- Best isolation.

Cons:

- Requires Meta App Dashboard redirect URI change.
- Needs a new sandbox authorize URL in Dashboard or manual URL construction.

### Option B - Production Callback Read-Only Guard

Add a narrow guard at the top of the production callback:

```text
if sandbox capture header / signed state is present:
  return redacted dry-run capture response
else:
  existing production behavior unchanged
```

Pros:

- Can capture callback from current registered redirect URI.

Cons:

- Touches production callback file.
- Must prove default production behavior is unchanged.
- Requires targeted regression tests around normal production callback paths.

### Option C - Use Production Callback With Explicit Test Write Approval

Allow a real callback into production-safe test workspace.

Pros:

- Most realistic evidence.

Cons:

- Highest risk.
- Can create / update Channel.
- Requires rollback, redaction search, and workspace / channel cleanup.

## Recommendation

Preferred next step:

```text
Option A: sandbox redirect URI
```

If Option A is not possible, use Option B with a very small route-level guard and tests before touching OAuth again.

Do not proceed with Option C unless App Review evidence requires a real callback and the test workspace / rollback plan is explicit.

## Gate Status

| Gate | Status |
| --- | --- |
| Callback capture helper | Pass |
| Raw code redaction | Pass |
| Raw state redaction | Pass |
| Workspace mismatch rejection | Pass |
| Production write guard | Pass at helper level |
| Production callback unchanged | Pass |
| Route integration | Hold |
| Real callback evidence | Hold |
| Workspace linking evidence | Hold |
| Channel sync evidence | Hold |
| Internal beta | Hold |
| Production implementation | No-Go |

## 2026-06-16 Update - Option B Implemented

Option B was selected because the currently registered Instagram Business Login redirect URI points to the existing Instagram callback route and OAuth redirects cannot carry custom request headers.

Implemented route behavior:

```text
if state is a valid sandbox callback capture marker:
  return redacted JSON evidence
  do not exchange authorization code
  do not read token / secret
  do not write ConnectedAccount / Channel
  do not subscribe webhook
  do not start channel sync
else:
  continue existing production callback behavior
```

Files:

```text
src/lib/meta-business-sandbox-callback-capture.ts
src/app/api/meta/oauth/callback/route.ts
tests/meta-business-login-sandbox-sbl12-callback-capture.test.ts
tests/meta-business-login-sandbox-sbl12-callback-route.test.ts
```

Security note:

- The sandbox callback capture state marker is only a routing marker for a read-only evidence response.
- It is not treated as a production OAuth security boundary.
- Normal production OAuth callbacks still rely on the existing cookie-backed state check.
- Raw authorization code, raw state, and full callback URL must not appear in response body, logs, audit records, reports, or App Review documents.

Updated targeted command:

```bash
npx vitest run tests/meta-business-login-sandbox-sbl12-callback-capture.test.ts tests/meta-business-login-sandbox-sbl12-callback-route.test.ts
```

Current targeted result:

```text
2 test files passed
9 tests passed
```

## 2026-06-16 Update - Production Probe And Consent Run

Production callback deployment probe:

```text
Status: Pass
Response: redacted JSON evidence
Raw fake code present: No
Raw sandbox state marker present: No
Invalid-state redirect: No
```

Browser OAuth result:

```text
force_reauth=true: account/profile selection was shown, then Instagram returned to home after profile selection.
without force_reauth=true: consent screen was shown.
callback evidence: Pass, after the user clicked allow.
```

Updated gate status:

| Gate | Status |
| --- | --- |
| Callback capture helper | Pass |
| Route integration | Pass |
| Production callback guard deployment | Pass |
| Account selection UX | Pass |
| Consent screen reachability | Pass |
| Real callback evidence | Pass |
| Workspace linking evidence | Hold |
| Channel sync evidence | Hold |
| Internal beta | Hold |
| Production implementation | No-Go |
