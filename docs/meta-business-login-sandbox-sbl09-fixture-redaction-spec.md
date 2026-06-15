# Meta Business Login Sandbox SBL-09 Fixture And Redaction Assertion Spec

Date: 2026-06-15  
Status: Draft for sandbox coding only  
Scope: SBL-09 test fixture, snapshot, and redaction assertion specification

## Summary

This document defines the fixture and redaction rules required before SBL-09 sandbox test scaffold coding can start.

It does not authorize production implementation, real Meta token exchange, production OAuth changes, callback route changes, login button changes, env changes, Prisma schema changes, or production ConnectedAccount / Channel writes.

Current decision:

```text
SBL-09 fixture readiness: Ready to specify
SBL-09 coding readiness: Hold until fixture and redaction rules are accepted
SBL-01 readiness: Hold
Internal beta readiness: No-Go
Production implementation readiness: No-Go
```

## 1. Test Fixture Naming Rules

Fixture names must make the test intent obvious and must not contain real user, workspace, Business, Page, Instagram, token, secret, state, nonce, or callback URL values.

### File Naming

Use this format:

```text
sbl09.<area>.<case>.<safety>.fixture.json
```

Allowed `<area>` values:

- `route`
- `workspace`
- `state`
- `nonce`
- `code`
- `redaction`
- `callback`
- `write-guard`

Allowed `<safety>` values:

- `safe`
- `unsafe`
- `expected-redacted`

Examples:

```text
sbl09.route.unauthenticated.safe.fixture.json
sbl09.workspace.not-allowlisted.safe.fixture.json
sbl09.state.raw-state-leak.unsafe.fixture.json
sbl09.callback.valid-dry-run.expected-redacted.fixture.json
sbl09.write-guard.channel-create-blocked.safe.fixture.json
```

### Fixture ID Naming

Each fixture must include a stable fixture id:

```json
{
  "fixtureId": "SBL09-CALLBACK-VALID-DRY-RUN-SAFE",
  "area": "callback",
  "safety": "safe"
}
```

Fixture ids must be uppercase and use this format:

```text
SBL09-<AREA>-<CASE>-<SAFETY>
```

## 2. Safe Fixture And Unsafe Fixture Examples

### Safe Fixture Example

Safe fixtures may contain redacted placeholders, hashed identifiers, and expected error classifications.

```json
{
  "fixtureId": "SBL09-CALLBACK-VALID-DRY-RUN-SAFE",
  "area": "callback",
  "safety": "safe",
  "input": {
    "mode": "dry_run",
    "provider": "meta-business-login-sandbox",
    "workspaceId": "workspace_6f2a1c",
    "state": "[REDACTED_STATE]",
    "nonce": "[REDACTED_NONCE]",
    "code": "[REDACTED_CODE]",
    "businessId": "business_8c1d2e",
    "pageId": "page_5a90bb",
    "instagramAccountId": "ig_1ef733"
  },
  "expected": {
    "status": "dry_run_only",
    "exchangeAttempted": false,
    "wouldCreateConnectedAccount": false,
    "wouldCreateChannel": false,
    "wouldRegisterWebhook": false,
    "wouldStartChannelSync": false
  }
}
```

### Unsafe Fixture Example

Unsafe fixtures are allowed only as negative test fixtures. They must be synthetic and obviously fake. They must never contain real secrets copied from Meta, logs, browser URLs, local env files, screenshots, recordings, or production data.

```json
{
  "fixtureId": "SBL09-REDACTION-RAW-CODE-UNSAFE",
  "area": "redaction",
  "safety": "unsafe",
  "input": {
    "code": "UNSAFE_FAKE_AUTH_CODE_SHOULD_FAIL",
    "state": "UNSAFE_FAKE_RAW_STATE_SHOULD_FAIL",
    "nonce": "UNSAFE_FAKE_RAW_NONCE_SHOULD_FAIL"
  },
  "expected": {
    "redactionResult": "fail",
    "errorType": "raw_oauth_artifact_detected"
  }
}
```

Unsafe fixture values must use one of these prefixes:

```text
UNSAFE_FAKE_
LEAK_TEST_FAKE_
SHOULD_FAIL_FAKE_
```

If an unsafe fixture value looks like a real Meta token, authorization code, app secret, or callback URL, the fixture must be rejected.

## 3. Forbidden Raw Value Rules

The following values must never appear raw in fixtures, snapshots, test output, logs, audit rows, reports, runbooks, screenshots, recordings, pull request descriptions, or documentation examples:

| Value Type | Forbidden Raw Form | Required Replacement |
| --- | --- | --- |
| Access token | Any reusable token-like value | `[REDACTED_TOKEN]` |
| Refresh token | Any reusable refresh token-like value | `[REDACTED_TOKEN]` |
| Authorization code | Any real or reusable OAuth code | `[REDACTED_CODE]` |
| App secret | Any Meta app secret | `[REDACTED_SECRET]` |
| Client secret | Any client secret | `[REDACTED_SECRET]` |
| Webhook verify token | Any verify token | `[REDACTED_SECRET]` |
| Raw state | Any raw state value | `[REDACTED_STATE]` |
| Raw nonce | Any raw nonce value | `[REDACTED_NONCE]` |
| Full callback URL | Any full URL containing callback query values | `[REDACTED_CALLBACK_URL]` |
| Reusable authorize URL | Any full authorize URL with app id, redirect URI, state, or scope | `[REDACTED_AUTHORIZE_URL]` |
| Business id | Any unmasked Meta Business id | `business_[HASH]` |
| Page id | Any unmasked Meta Page id | `page_[HASH]` |
| Instagram account id | Any unmasked Instagram id | `ig_[HASH]` |

### Callback URL Rule

Never store this shape in fixtures, logs, reports, or docs:

```text
https://app.example.com/api/.../callback?code=...&state=...
```

Store only:

```text
callback_url=[REDACTED_CALLBACK_URL]
callback_query_keys=["code","state"]
```

### Authorize URL Rule

Never store a reusable authorize URL. Store only the redacted structure:

```json
{
  "authorizeHost": "facebook.com",
  "authorizePath": "/dialog/oauth",
  "queryKeys": ["client_id", "redirect_uri", "scope", "state", "response_type"],
  "redactedUrl": "[REDACTED_AUTHORIZE_URL]"
}
```

## 4. Redaction Assertion Spec

SBL-09 redaction assertions must run against every fixture, snapshot, test output, and generated report.

### Assertion Inputs

Assertions must inspect:

- JSON fixture files.
- Expected snapshot files.
- Test stdout and stderr.
- Structured application logs.
- Audit event payloads.
- Dry-run callback payloads.
- Generated runbook entries.
- Generated experiment report entries.
- Browser console and network captures if browser verification is added later.

### Assertion Categories

| Assertion ID | Category | Fail If Found |
| --- | --- | --- |
| SBL09-REDACT-001 | Token | Raw access or refresh token |
| SBL09-REDACT-002 | Code | Raw authorization code |
| SBL09-REDACT-003 | Secret | App secret, client secret, webhook verify token |
| SBL09-REDACT-004 | State | Raw state |
| SBL09-REDACT-005 | Nonce | Raw nonce |
| SBL09-REDACT-006 | Callback URL | Full callback URL with query values |
| SBL09-REDACT-007 | Authorize URL | Reusable authorize URL |
| SBL09-REDACT-008 | Meta asset ids | Unmasked Business, Page, or IG account ids |
| SBL09-REDACT-009 | Meta raw error | Raw upstream error containing request data |

### Pass Criteria

```text
Redaction assertions pass only if:
- Every sensitive value is replaced with an approved marker.
- Every Meta asset id is masked or hashed.
- Every URL is reduced to host/path/query key metadata.
- Unsafe fixtures fail only in the expected negative test.
- No evidence artifact contains raw OAuth material.
```

## 5. Dry-Run Callback Payload Snapshot Spec

Dry-run snapshots must prove mapping behavior without creating production records.

### Snapshot Naming

Use this format:

```text
sbl09.callback.<case>.expected-redacted.snapshot.json
```

Examples:

```text
sbl09.callback.valid-dry-run.expected-redacted.snapshot.json
sbl09.callback.missing-page.expected-redacted.snapshot.json
sbl09.callback.workspace-linking-failed.expected-redacted.snapshot.json
```

### Required Snapshot Fields

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
    "wouldStartChannelSync": false,
    "wouldScheduleTokenRefresh": false
  },
  "result": {
    "status": "dry_run_only",
    "errorType": null
  }
}
```

### Snapshot Rejection Rules

Reject any dry-run snapshot that:

- Sets `mode` to anything other than `dry_run`.
- Uses provider other than `meta-business-login-sandbox`.
- Sets any `writes.*` value to `true`.
- Contains raw token, code, state, nonce, secret, callback URL, authorize URL, or unmasked Meta asset id.
- Contains production ConnectedAccount id or production Channel id.

## 6. Production Write Guard Fixture Spec

Production write guard fixtures must prove that sandbox dry-run paths cannot mutate production records.

### Fixture Shape

```json
{
  "fixtureId": "SBL09-WRITE-GUARD-CHANNEL-CREATE-BLOCKED-SAFE",
  "area": "write-guard",
  "safety": "safe",
  "input": {
    "mode": "dry_run",
    "provider": "meta-business-login-sandbox",
    "workspaceId": "workspace_6f2a1c",
    "operation": "channel.create",
    "selection": {
      "businessId": "business_8c1d2e",
      "pageId": "page_5a90bb",
      "instagramAccountId": "ig_1ef733"
    }
  },
  "expected": {
    "allowed": false,
    "errorType": "production_write_blocked",
    "wouldCreateConnectedAccount": false,
    "wouldCreateChannel": false
  }
}
```

### Required Guard Cases

| Fixture ID | Operation | Expected |
| --- | --- | --- |
| SBL09-WRITE-GUARD-CONNECTED-ACCOUNT-CREATE-BLOCKED-SAFE | `connectedAccount.create` | Blocked |
| SBL09-WRITE-GUARD-CONNECTED-ACCOUNT-TOKEN-UPDATE-BLOCKED-SAFE | `connectedAccount.updateToken` | Blocked |
| SBL09-WRITE-GUARD-CHANNEL-CREATE-BLOCKED-SAFE | `channel.create` | Blocked |
| SBL09-WRITE-GUARD-CHANNEL-UPDATE-BLOCKED-SAFE | `channel.update` | Blocked |
| SBL09-WRITE-GUARD-WEBHOOK-REGISTER-BLOCKED-SAFE | `webhook.register` | Blocked |
| SBL09-WRITE-GUARD-CHANNEL-SYNC-BLOCKED-SAFE | `channel.sync` | Blocked |
| SBL09-WRITE-GUARD-TOKEN-REFRESH-BLOCKED-SAFE | `token.refresh` | Blocked |

Any write guard fixture that expects an allowed production write must be rejected.

## 7. Search Standards For Test Output, Log, Audit, And Report

SBL-09 must define repeatable search commands or equivalent CI assertions before route coding starts.

### Required Search Targets

| Target | Search Requirement |
| --- | --- |
| Test output | No raw token, code, secret, state, nonce, callback URL, authorize URL |
| Fixture files | Only approved safe placeholders or synthetic unsafe markers |
| Snapshot files | Only expected redacted markers |
| Application logs | No raw OAuth material; sandbox events labeled as dry-run |
| Audit payloads | No raw OAuth material; workspace and Meta asset ids masked |
| Runbook entries | Redacted evidence only |
| Experiment report entries | Redacted evidence only |
| Browser console captures | No code, token, raw state, raw nonce |
| Network captures | No full callback URL or reusable authorize URL |

### Suggested Search Patterns

The final implementation can refine these, but SBL-09 should start with checks for:

```text
access_token
refresh_token
authorization_code
client_secret
app_secret
verify_token
code=
state=
nonce=
/callback?
/dialog/oauth?
graph.facebook.com
UNSAFE_FAKE_
LEAK_TEST_FAKE_
SHOULD_FAIL_FAKE_
```

Important distinction:

- Safe fixtures must not contain unsafe markers.
- Unsafe fixtures may contain unsafe markers only when the expected result is a redaction failure.
- No fixture may contain real secrets, even for negative tests.

### Evidence Format

Every SBL-09 run should record a redacted search summary:

```json
{
  "runId": "sbl09_run_YYYYMMDD_001",
  "searchedTargets": [
    "fixtures",
    "snapshots",
    "test_output",
    "logs",
    "audit",
    "runbook",
    "report"
  ],
  "rawSecretFindings": 0,
  "unsafeFixtureFindings": 0,
  "expectedUnsafeFixtureFailures": 0,
  "status": "pass"
}
```

## 8. SBL-09 Backfill Requirements

After SBL-09 fixture and redaction assertions are created or executed, update the following documents.

| Document | Required Backfill |
| --- | --- |
| `docs/meta-business-login-sandbox-runbook-template.md` | Add fixture set id, redaction assertion command, redacted search summary, and evidence path |
| `docs/meta-business-login-sandbox-experiment-report-template.md` | Add fixture coverage, unsafe fixture results, snapshot results, and redaction summary |
| `docs/meta-business-login-sandbox-go-no-go-checklist.md` | Update redaction gate, callback security gate, and production write guard gate |
| `docs/meta-business-login-sandbox-coding-risk-test-plan.md` | Mark fixture, redaction, dry-run payload, and write guard tests as planned or implemented |
| `docs/security-review.md` | Add any finding where raw OAuth material, raw URL, or unmasked Meta asset id appears |
| `docs/codex-session-log.md` | Record SBL-09 fixture spec or execution result |
| `docs/fix-roadmap.md` | Record whether SBL-09 remains Hold or can move to scaffold coding |

## Go / Hold Criteria

SBL-09 fixture and redaction rules can move from Hold to Ready only when:

- Fixture naming is accepted.
- Safe and unsafe fixture boundaries are accepted.
- Forbidden raw value list is accepted.
- Redaction assertion categories are accepted.
- Dry-run callback snapshot shape is accepted.
- Production write guard fixtures are accepted.
- Search targets and evidence format are accepted.

SBL-01 must remain Hold until SBL-09 fixture and redaction assertions are implemented or explicitly accepted as the required test scaffold.

## Explicit Non-Goals

This spec does not:

- Add test files.
- Add application routes.
- Add provider code.
- Add env variables.
- Change production OAuth.
- Change callback behavior.
- Change login buttons.
- Create or update production ConnectedAccount or Channel records.
- Perform real Meta token exchange.

## Next Recommended Step

```text
Create a final SBL-09 coding readiness checklist that confirms:
- test suite spec exists,
- fixture and redaction spec exists,
- go/no-go document still blocks SBL-01 until SBL-09 scaffold is accepted,
- internal beta and production implementation remain No-Go.
```
