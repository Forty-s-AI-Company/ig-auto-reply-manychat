# Meta Business Login Sandbox SBL-09 Coding Readiness Checklist

Date: 2026-06-15  
Status: Readiness checklist for SBL-09 sandbox coding only  
Scope: Decide whether SBL-09 test scaffold coding can start

## Summary

This checklist confirms whether InboxPilot can move from documentation-only planning into SBL-09 sandbox test scaffold coding.

SBL-09 is still not product implementation. It is the first coding step only for test fixtures, redaction assertions, dry-run payload snapshots, and production write guard tests.

Current decision:

```text
SBL-09 coding readiness: Go for sandbox test scaffold only
SBL-01 readiness: Hold
Internal beta readiness: No-Go
Production implementation readiness: No-Go
```

## 1. Required Documents Before SBL-09 Coding

SBL-09 coding may begin only if these documents exist and remain aligned with the internal-only / dry-run-first / no-production-write boundary.

| Document | Required | Current Status | Gate Result |
| --- | --- | --- | --- |
| `docs/meta-business-login-sandbox-doc-index.md` | Yes | Exists | Pass |
| `docs/meta-business-login-sandbox-final-readiness-review.md` | Yes | Exists | Pass |
| `docs/meta-business-login-sandbox-coding-kickoff-checklist.md` | Yes | Exists | Pass |
| `docs/meta-business-login-sandbox-sbl09-test-suite-spec.md` | Yes | Exists | Pass |
| `docs/meta-business-login-sandbox-sbl09-fixture-redaction-spec.md` | Yes | Exists | Pass |
| `docs/meta-business-login-sandbox-coding-risk-test-plan.md` | Yes | Exists | Pass |
| `docs/meta-business-login-sandbox-go-no-go-checklist.md` | Yes | Exists | Pass |
| `docs/meta-business-login-sandbox-runbook-template.md` | Yes | Exists | Pass |
| `docs/meta-business-login-sandbox-experiment-report-template.md` | Yes | Exists | Pass |

Required document gate:

```text
Result: Pass for SBL-09 sandbox test scaffold coding
Limitation: Does not authorize SBL-01 route coding, internal beta, or production implementation
```

## 2. Test Suite Spec Readiness

Source: `docs/meta-business-login-sandbox-sbl09-test-suite-spec.md`

| Requirement | Current Status | Notes |
| --- | --- | --- |
| SBL-09 test goal defined | Ready | Test scaffold only; no production implementation |
| Production boundary defined | Ready | No OAuth, callback, login button, env, Prisma schema, ConnectedAccount, Channel, webhook, token refresh, or sync job changes |
| Internal-only route tests defined | Ready | Covers unauthenticated, non-internal, allowlisted, unsupported provider, UI isolation, and helper isolation checks |
| Workspace allowlist tests defined | Ready | Covers missing, forbidden, not allowlisted, allowlisted, spoofing, and masked logging cases |
| State tests defined | Ready | Covers entropy, server-side or signed storage, TTL, reuse, expiration, mismatch, and redaction |
| Nonce tests defined | Ready | Covers generation, missing nonce, mismatch, replay, and redaction |
| Code exchange tests defined | Ready | Covers missing code, raw code redaction, dry-run no exchange, Meta error classification, and code/token leak failure |
| Redacted logging tests defined | Ready | Covers forbidden raw values and approved markers |
| Dry-run callback payload tests defined | Ready | Covers valid payload, missing Business / Page / IG, workspace mapping failure, write flag rejection, and raw artifact rejection |
| Production write guard tests defined | Ready | Covers ConnectedAccount, Channel, webhook, channel sync, token refresh, and audit events |
| Backfill requirements defined | Ready | Runbook, report, go/no-go, risk plan, security review, App Review checklist, session log, and roadmap |

Test suite spec gate:

```text
Result: Pass for SBL-09 sandbox test scaffold coding
```

## 3. Fixture / Redaction Assertion Spec Readiness

Source: `docs/meta-business-login-sandbox-sbl09-fixture-redaction-spec.md`

| Requirement | Current Status | Notes |
| --- | --- | --- |
| Fixture file naming rules defined | Ready | `sbl09.<area>.<case>.<safety>.fixture.json` |
| Fixture id naming rules defined | Ready | `SBL09-<AREA>-<CASE>-<SAFETY>` |
| Safe fixture examples defined | Ready | Uses redacted markers and hashed ids |
| Unsafe fixture examples defined | Ready | Synthetic negative fixtures only |
| Unsafe marker prefixes defined | Ready | `UNSAFE_FAKE_`, `LEAK_TEST_FAKE_`, `SHOULD_FAIL_FAKE_` |
| Real secret ban defined | Ready | Unsafe fixtures cannot use real Meta values |
| Forbidden raw value table defined | Ready | Token, code, secret, state, nonce, URL, and Meta asset id coverage |
| Redaction assertion categories defined | Ready | Token, code, secret, state, nonce, callback URL, authorize URL, Meta asset ids, raw Meta error |
| Assertion pass criteria defined | Ready | Sensitive values must be replaced with approved markers |

Fixture / redaction assertion gate:

```text
Result: Pass for SBL-09 sandbox test scaffold coding
```

## 4. Dry-Run Callback Payload Snapshot Readiness

The dry-run callback payload snapshot is ready for SBL-09 scaffold coding if it satisfies the following checklist.

| Requirement | Current Status | Required Rule |
| --- | --- | --- |
| Snapshot naming rule exists | Ready | `sbl09.callback.<case>.expected-redacted.snapshot.json` |
| Provider is fixed | Ready | Must be `meta-business-login-sandbox` |
| Mode is fixed | Ready | Must be `dry_run` |
| Workspace id is masked | Ready | Must use `workspace_[HASH]` |
| State is redacted | Ready | Must use `[REDACTED_STATE]` |
| Nonce is redacted | Ready | Must use `[REDACTED_NONCE]` |
| Code is redacted | Ready | Must use `[REDACTED_CODE]` |
| Business id is masked | Ready | Must use `business_[HASH]` |
| Page id is masked | Ready | Must use `page_[HASH]` |
| IG account id is masked | Ready | Must use `ig_[HASH]` |
| Token exchange is disabled | Ready | `exchangeAttempted=false` |
| Production writes are disabled | Ready | All `writes.*` values must be `false` |
| Result is classified | Ready | `status` and `errorType` must be explicit |

Snapshot rejection rules are also ready:

- Reject any non-`dry_run` mode.
- Reject any non-sandbox provider.
- Reject any `writes.*=true`.
- Reject any raw token, code, state, nonce, secret, callback URL, authorize URL, or unmasked Meta asset id.
- Reject any production ConnectedAccount id or production Channel id.

Dry-run callback payload snapshot gate:

```text
Result: Pass for SBL-09 sandbox test scaffold coding
```

## 5. Production Write Guard Fixture Readiness

Production write guard fixture coverage is ready for SBL-09 scaffold coding if the following blocked operations are represented.

| Operation | Required Fixture | Current Status |
| --- | --- | --- |
| `connectedAccount.create` | Block production ConnectedAccount creation | Ready |
| `connectedAccount.updateToken` | Block production token mutation | Ready |
| `channel.create` | Block production Channel creation | Ready |
| `channel.update` | Block production Channel mutation | Ready |
| `webhook.register` | Block production webhook registration | Ready |
| `channel.sync` | Block production channel sync | Ready |
| `token.refresh` | Block production token refresh | Ready |

Every write guard fixture must expect:

```text
allowed=false
errorType=production_write_blocked
wouldCreateConnectedAccount=false
wouldCreateChannel=false
```

Production write guard fixture gate:

```text
Result: Pass for SBL-09 sandbox test scaffold coding
```

## 6. Redaction Search Standard Readiness

The redaction search standard is ready if every SBL-09 run searches these targets.

| Target | Current Status | Pass Requirement |
| --- | --- | --- |
| Fixture files | Ready | No real secret; safe fixtures contain only approved placeholders |
| Snapshot files | Ready | Only expected redacted markers |
| Test output | Ready | No raw token, code, secret, state, nonce, callback URL, authorize URL |
| Application logs | Ready | No raw OAuth material; sandbox events labeled dry-run |
| Audit payloads | Ready | Workspace and Meta asset ids masked |
| Runbook entries | Ready | Redacted evidence only |
| Experiment report entries | Ready | Redacted evidence only |
| Browser console captures | Ready for future browser verification | No code, token, raw state, raw nonce |
| Network captures | Ready for future browser verification | No full callback URL or reusable authorize URL |

Minimum search patterns are ready:

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

Redaction search standard gate:

```text
Result: Pass for SBL-09 sandbox test scaffold coding
```

## 7. SBL-09 Go / Hold Decision

### Go Conditions

SBL-09 sandbox coding can start if the coding task is limited to:

- Test scaffold files.
- Safe and unsafe fixture files.
- Redaction assertion helper or test-only utility.
- Dry-run callback payload snapshot tests.
- Production write guard tests.
- Documentation backfill after test scaffold execution.

SBL-09 coding must not:

- Add production OAuth provider behavior.
- Add or change production callback behavior.
- Add or change login buttons.
- Add or change env variables.
- Add or change Prisma schema.
- Create or update production ConnectedAccount records.
- Create or update production Channel records.
- Register production webhooks.
- Start production channel sync.
- Schedule or run production token refresh.
- Perform real Meta token exchange.

### Current Decision

```text
SBL-09 coding readiness: Go
Allowed scope: sandbox test scaffold only
Required mode: internal-only / dry-run-first / no-production-write
Required verification: git status, npm run lint, npm run build, and targeted tests once scaffold exists
```

## 8. Still Blocked: SBL-01, Internal Beta, Production Implementation

### SBL-01 Still Cannot Start

SBL-01 internal-only route skeleton remains blocked until:

- SBL-09 scaffold is created.
- SBL-09 redaction assertions are runnable.
- SBL-09 dry-run callback snapshot tests are runnable.
- SBL-09 production write guard tests are runnable.
- SBL-09 runbook / report / go-no-go checklist are backfilled.

Current status:

```text
SBL-01 readiness: Hold
```

### Internal Beta Still Cannot Start

Internal beta remains blocked until:

- SBL-09 is implemented and executed.
- SBL-01 is implemented and executed.
- Actual sandbox runbook evidence exists.
- Experiment report is filled with real results.
- Account selection UX, callback security, workspace linking, channel sync, redaction, and rollback gates pass.

Current status:

```text
Internal beta readiness: No-Go
```

### Production Implementation Still Cannot Start

Production implementation remains blocked until:

- App Review evidence exists and passes.
- ManyChat-like account selection UX is validated with real Meta dialog evidence.
- Callback security is validated.
- Workspace linking and tenant isolation are validated.
- Channel sync behavior is validated.
- Redaction checks pass against real evidence.
- Rollback plan is tested.
- Production implementation ADR, env migration plan, schema impact review, and release / rollback checklist exist.

Current status:

```text
Production implementation readiness: No-Go
```

## 9. Required Backfill After SBL-09 Coding

After SBL-09 coding is completed, update:

| Document | Required Update |
| --- | --- |
| `docs/meta-business-login-sandbox-runbook-template.md` | Add SBL-09 run id, command, fixture set id, redaction search result, and evidence path |
| `docs/meta-business-login-sandbox-experiment-report-template.md` | Add SBL-09 fixture coverage, snapshot result, redaction result, and write guard result |
| `docs/meta-business-login-sandbox-go-no-go-checklist.md` | Update SBL-09 gate and decide whether SBL-01 can move from Hold |
| `docs/meta-business-login-sandbox-coding-risk-test-plan.md` | Mark implemented SBL-09 tests and any uncovered risks |
| `docs/security-review.md` | Add any security findings from redaction, state, nonce, code exchange, or write guard tests |
| `docs/meta-app-review-checklist.md` | Add App Review implication only if evidence changes reviewer assumptions |
| `docs/codex-session-log.md` | Record files changed and validation results |
| `docs/fix-roadmap.md` | Record next SBL task and remaining gates |

## Final Readiness Result

```text
SBL-09 sandbox test scaffold coding: Go
SBL-01 internal-only route skeleton: Hold
Internal beta: No-Go
Production implementation: No-Go
```

The next coding task should be:

```text
SBL-09: create sandbox-only test scaffold, fixtures, redaction assertions, dry-run payload snapshots, and production write guard tests.
```
