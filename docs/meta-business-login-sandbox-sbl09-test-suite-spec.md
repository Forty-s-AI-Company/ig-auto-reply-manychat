# Meta Business Login Sandbox SBL-09 Test Suite Spec

Date: 2026-06-15  
Status: Draft for sandbox coding only  
Scope: SBL-09 minimum test suite specification before SBL-01 route work

## Summary

SBL-09 defines the minimum test suite required before any internal-only Meta Business Login sandbox route is implemented.

This document does not authorize product implementation. It only defines the tests, fixtures, assertions, and evidence that must exist before SBL-01 can start.

Current decision:

```text
SBL-09 status: Ready to specify
SBL-01 status: Hold until SBL-09 tests are accepted
Internal beta status: No-Go
Production implementation status: No-Go
```

## 1. SBL-09 Test Goal And Production Boundary

### Test Goal

SBL-09 must prove that future sandbox coding can be verified without touching the existing Instagram OAuth production flow.

The minimum test suite must cover:

- Internal-only access control.
- Workspace allowlist enforcement.
- Sandbox provider isolation.
- State and nonce safety.
- Authorization code exchange safety.
- Redacted logging and audit evidence.
- Dry-run callback payload shape.
- Production ConnectedAccount and Channel write protection.

### Production Boundary

SBL-09 must not introduce or require changes to:

- Existing Instagram OAuth authorize flow.
- Existing OAuth callback routes.
- Existing login or connect buttons.
- Existing production env variables.
- Existing Prisma schema.
- Existing production ConnectedAccount creation.
- Existing production Channel creation.
- Existing production webhook registration.
- Existing token refresh or sync jobs.

Any future SBL-09 code must be test scaffold only. If a test requires product behavior, the task must stop and be reclassified before implementation.

## 2. Internal-Only Route Test Items

These tests describe the minimum behavior expected before SBL-01 can create any internal-only route skeleton.

| Test ID | Scenario | Expected Result | Required Evidence |
| --- | --- | --- | --- |
| SBL09-ROUTE-001 | Unauthenticated user requests sandbox authorize route | Request is rejected | Redacted response body and status code |
| SBL09-ROUTE-002 | Authenticated user without internal permission requests sandbox authorize route | Request is rejected | Redacted response body and status code |
| SBL09-ROUTE-003 | Internal user requests sandbox authorize route with allowed workspace | Request can proceed to dry-run-only behavior | Redacted route decision log |
| SBL09-ROUTE-004 | Internal user requests sandbox route with unsupported provider id | Request is rejected as unsupported provider | Redacted error classification |
| SBL09-ROUTE-005 | Sandbox route is not linked from production UI | No production connect button references sandbox route | Static route/link inspection result |
| SBL09-ROUTE-006 | Sandbox route does not call production OAuth helpers directly | No production OAuth helper invocation is required by test scaffold | Static import inspection result |

Route tests must classify failures without exposing token, code, raw state, raw nonce, full callback URL, app secret, or client secret.

## 3. Workspace Allowlist Test Items

Workspace allowlist tests must prove that sandbox execution cannot be triggered from arbitrary workspaces.

| Test ID | Scenario | Expected Result | Required Evidence |
| --- | --- | --- | --- |
| SBL09-WS-001 | Missing workspace id | Reject with `workspace_required` | Redacted response body |
| SBL09-WS-002 | Workspace id not owned by current user | Reject with `workspace_forbidden` | Redacted audit event |
| SBL09-WS-003 | Workspace id owned by user but not allowlisted | Reject with `workspace_not_allowed` | Redacted audit event |
| SBL09-WS-004 | Allowlisted workspace id | Permit dry-run-only path | Redacted allowlist decision |
| SBL09-WS-005 | Query string workspace spoofing attempt | Server-side session workspace wins; spoofed query value is rejected or ignored | Redacted test assertion |
| SBL09-WS-006 | Workspace id appears in logs | Workspace id is masked or hashed | Redaction search result |

Allowlist data must be test-only or configuration-only for sandbox coding. It must not require production env changes in this documentation phase.

## 4. State / Nonce / Code Exchange Test Items

SBL-09 must define the security expectations for state, nonce, and code exchange helpers before SBL-01 starts.

### State Tests

| Test ID | Scenario | Expected Result |
| --- | --- | --- |
| SBL09-STATE-001 | State is generated | Value is high entropy and opaque |
| SBL09-STATE-002 | State is stored | Storage is server-side or signed, with TTL |
| SBL09-STATE-003 | State is reused | Reuse is rejected |
| SBL09-STATE-004 | State is expired | Request fails as `state_expired` |
| SBL09-STATE-005 | State mismatches session or workspace | Request fails as `invalid_state` |
| SBL09-STATE-006 | State appears in logs, audit, URL snapshots, or reports | Raw state is never stored; only redacted marker appears |

### Nonce Tests

| Test ID | Scenario | Expected Result |
| --- | --- | --- |
| SBL09-NONCE-001 | Nonce is generated | Value is high entropy and one-time |
| SBL09-NONCE-002 | Nonce is missing on callback | Request fails as `nonce_required` |
| SBL09-NONCE-003 | Nonce mismatch | Request fails as `invalid_nonce` |
| SBL09-NONCE-004 | Nonce is replayed | Request fails as `nonce_replayed` |
| SBL09-NONCE-005 | Nonce appears in evidence | Raw nonce is redacted |

### Code Exchange Tests

| Test ID | Scenario | Expected Result |
| --- | --- | --- |
| SBL09-CODE-001 | Authorization code is missing | Request fails as `code_required` |
| SBL09-CODE-002 | Authorization code is present in dry-run callback | Code is classified, never logged raw |
| SBL09-CODE-003 | Code exchange would be called in dry-run mode | No real token exchange occurs unless explicitly enabled in a later approved sandbox task |
| SBL09-CODE-004 | Meta token endpoint returns error | Error is classified and redacted |
| SBL09-CODE-005 | Code or token appears in logs, audit, response, runbook, report, or screenshot | Test fails |

## 5. Redacted Logging Test Items

Redaction tests are required before any sandbox route or callback can be considered safe.

### Forbidden Raw Values

The test suite must fail if any of the following appear raw in logs, audit events, response bodies, browser console output, snapshots, screenshots, runbooks, reports, or pull request descriptions:

- Access token.
- Refresh token.
- Authorization code.
- App secret.
- Client secret.
- Webhook verify token.
- Raw state.
- Raw nonce.
- Full callback URL.
- Reusable authorize URL.
- Unmasked Business id.
- Unmasked Page id.
- Unmasked Instagram account id.
- Meta API raw error containing sensitive request data.

### Required Redaction Format

Use stable redacted markers so evidence remains useful without leaking secrets:

```text
access_token=[REDACTED_TOKEN]
refresh_token=[REDACTED_TOKEN]
code=[REDACTED_CODE]
state=[REDACTED_STATE]
nonce=[REDACTED_NONCE]
client_secret=[REDACTED_SECRET]
callback_url=[REDACTED_CALLBACK_URL]
business_id=business_[HASH]
page_id=page_[HASH]
ig_user_id=ig_[HASH]
```

### Search Standard

SBL-09 must include a repeatable redaction search procedure for:

- Application logs.
- Audit logs.
- Test output.
- Snapshot files.
- Generated reports.
- Browser console output, if browser verification is used later.
- Network URL captures, if browser verification is used later.
- Runbook and experiment report evidence.

The search passes only if no raw secret or reusable OAuth artifact is found.

## 6. Dry-Run Callback Payload Test Items

Dry-run callback payload tests must prove that future callback simulation can validate mapping without creating production records.

### Payload Shape

The minimum dry-run payload should use this shape:

```json
{
  "mode": "dry_run",
  "provider": "meta-business-login-sandbox",
  "workspace": {
    "id": "workspace_[HASH]",
    "allowlisted": true
  },
  "auth": {
    "state": "[REDACTED_STATE]",
    "nonce": "[REDACTED_NONCE]",
    "code": "[REDACTED_CODE]",
    "exchangeAttempted": false
  },
  "selection": {
    "businessId": "business_[HASH]",
    "pageId": "page_[HASH]",
    "instagramAccountId": "ig_[HASH]"
  },
  "writes": {
    "wouldCreateConnectedAccount": false,
    "wouldCreateChannel": false,
    "wouldRegisterWebhook": false,
    "wouldStartChannelSync": false
  },
  "result": {
    "status": "dry_run_only",
    "errorType": null
  }
}
```

### Callback Tests

| Test ID | Scenario | Expected Result |
| --- | --- | --- |
| SBL09-CB-001 | Valid dry-run callback payload | Returns redacted dry-run summary |
| SBL09-CB-002 | Missing selected Business | Returns `business_required` |
| SBL09-CB-003 | Missing selected Page | Returns `page_required` |
| SBL09-CB-004 | Missing selected IG account | Returns `instagram_account_required` |
| SBL09-CB-005 | Invalid workspace mapping | Returns `workspace_linking_failed` |
| SBL09-CB-006 | Dry-run payload tries to set `wouldCreateChannel=true` | Test fails |
| SBL09-CB-007 | Dry-run payload exposes raw code, state, nonce, token, or secret | Test fails |

## 7. Production Write Guard Test Items

Production write guard tests must be explicit. Passing lint/build alone is not enough to allow SBL-01.

| Test ID | Guard | Expected Result |
| --- | --- | --- |
| SBL09-WRITE-001 | ConnectedAccount create guard | Sandbox dry-run path cannot create production ConnectedAccount |
| SBL09-WRITE-002 | ConnectedAccount token update guard | Sandbox dry-run path cannot update production tokens |
| SBL09-WRITE-003 | Channel create guard | Sandbox dry-run path cannot create production Channel |
| SBL09-WRITE-004 | Channel update guard | Sandbox dry-run path cannot mutate production Channel |
| SBL09-WRITE-005 | Webhook registration guard | Sandbox dry-run path cannot register production webhooks |
| SBL09-WRITE-006 | Channel sync guard | Sandbox dry-run path cannot start production channel sync |
| SBL09-WRITE-007 | Token refresh guard | Sandbox dry-run path cannot schedule or run production token refresh |
| SBL09-WRITE-008 | Audit event guard | Audit event is redacted and labeled as sandbox dry-run |

If any guard fails, the go/no-go checklist must remain `No-Go` for SBL-01.

## 8. SBL-09 Backfill Requirements

After SBL-09 is completed, the implementer must backfill the following documents before requesting SBL-01:

| Document | Required Backfill |
| --- | --- |
| `docs/meta-business-login-sandbox-runbook-template.md` | Add SBL-09 run id, test command, redacted evidence location, and observed failures |
| `docs/meta-business-login-sandbox-experiment-report-template.md` | Add SBL-09 summary, environment, dry-run payload findings, and redaction result |
| `docs/meta-business-login-sandbox-go-no-go-checklist.md` | Update SBL-09 gate status and decide whether SBL-01 remains Hold or can proceed |
| `docs/meta-business-login-sandbox-coding-risk-test-plan.md` | Mark covered tests and add any discovered risk |
| `docs/security-review.md` | Add security findings if any redaction, state, nonce, code exchange, or write guard issue is found |
| `docs/meta-app-review-checklist.md` | Add App Review implications only if sandbox evidence changes reviewer demo assumptions |
| `docs/codex-session-log.md` | Record files changed, commands run, and whether product code remained untouched |
| `docs/fix-roadmap.md` | Record next SBL task and remaining gates |

## Go / Hold Criteria

SBL-09 can be marked complete only when:

- Minimum tests are implemented or explicitly accepted as pending test cases.
- Redaction search standard is repeatable.
- Dry-run callback payload schema is accepted.
- Production write guard cases are defined and passing or marked as blocking.
- No production OAuth, callback, button, env, schema, ConnectedAccount, or Channel behavior is changed.

SBL-01 may begin only when:

- SBL-09 test expectations are accepted.
- SBL-09 redaction and dry-run standards are documented.
- Go/no-go checklist is updated to allow sandbox coding only.
- Internal beta and production implementation remain blocked.

## Explicit Non-Goals

SBL-09 does not:

- Implement Facebook Login for Business.
- Implement Instagram Business Login.
- Change the current Instagram OAuth provider.
- Change callback routing.
- Add or change production env variables.
- Add production channel linking.
- Run real Meta token exchange in production.
- Submit or prepare a production App Review build.

## Next Recommended Step

```text
Create SBL-09 test scaffold only after this spec is accepted.
Keep SBL-01 on Hold until SBL-09 redaction, dry-run payload, and production write guard tests are ready.
Do not enter internal beta or production implementation.
```
