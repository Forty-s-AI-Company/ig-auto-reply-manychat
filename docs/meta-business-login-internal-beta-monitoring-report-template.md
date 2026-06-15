# Meta Business Login Internal Beta Monitoring Report Template

Date: 2026-06-16
Status: Blank monitoring report template / internal beta Hold / production implementation No-Go

## Scope

This template records monitoring results during a Meta Business Login / Instagram Business Login internal beta run.

This document does not change:

- OAuth flow
- callback route
- login button
- environment variables
- Prisma schema
- Supabase migration state
- production ConnectedAccount / Channel writes
- real Meta token exchange

Supabase note:

```text
Do not run Supabase migration or db push for this monitoring report.
Before any future Supabase migration or db push, record current project_id, linked project, and Supabase account email, then wait for explicit confirmation.
```

Source document:

```text
docs/meta-business-login-internal-beta-launch-checklist.md
```

Related documents:

```text
docs/meta-business-login-internal-beta-release-decision-memo-template.md
docs/meta-business-login-internal-beta-evidence-execution-report-template.md
docs/meta-business-login-internal-beta-evidence-collection-runbook.md
docs/meta-business-login-sandbox-go-no-go-checklist.md
docs/security-review.md
```

## 1. Beta Run Metadata

```text
Monitoring report ID:
Beta run ID:
Run date:
Monitoring window:
Monitor owner:
Reviewer:
Branch / commit:
Internal beta launch checklist:
Release decision memo:
Evidence execution report:
Workspace allowlist version:
Allowed users / roles version:
Allowed entry point:
Allowed provider:
Allowed scopes:
Rollback plan version:
Production implementation:
  - No-Go
```

Initial run state:

```text
Internal beta status:
  - Continue
  - Pause
  - End
Production implementation: No-Go
```

## 2. Workspace Allowlist / User Role / Internal-Only Access Monitoring

| Check | Expected result | Observed result | Status | Evidence |
| --- | --- | --- | --- | --- |
| Workspace allowlist active | Only approved workspaces can access beta. |  | Pass / Watch / Fail |  |
| Non-allowlisted workspace blocked | Non-approved workspaces are blocked. |  | Pass / Watch / Fail |  |
| Approved user role allowed | Only approved admin / tester roles can start beta. |  | Pass / Watch / Fail |  |
| Non-approved user blocked | Non-approved users are blocked. |  | Pass / Watch / Fail |  |
| Internal-only entry point | Beta remains hidden from production login button and standard connect flow. |  | Pass / Watch / Fail |  |
| Public discoverability | Public production users cannot discover or start beta. |  | Pass / Watch / Fail |  |

Decision:

```text
Access monitoring: Pass / Watch / Pause
Reason:
Required follow-up:
```

## 3. Redaction / Logging / Audit / Evidence Artifact Monitoring

Record only redacted findings. Do not copy raw sensitive values into this report.

| Check | Expected result | Observed result | Status | Evidence |
| --- | --- | --- | --- | --- |
| Redaction markers | Code/state/nonce/callback URL/token/secret values are redacted. |  | Pass / Watch / Fail |  |
| Runtime logs | Logs contain no raw token, code, secret, raw state, raw nonce, full callback URL, or browser storage. |  | Pass / Watch / Fail |  |
| Audit records | Audit records use redacted markers only. |  | Pass / Watch / Fail |  |
| Evidence artifacts | Recordings, screenshots, logs, reports, and test output remain redacted. |  | Pass / Watch / Fail |  |
| Asset IDs | Business / Page / IG / workspace IDs are masked or hashed. |  | Pass / Watch / Fail |  |
| Customer data | No real customer messages, comments, credentials, OTP, cookies, localStorage, or sessionStorage appear. |  | Pass / Watch / Fail |  |

Finding record:

```text
Finding ID:
Finding type:
Artifact:
Raw value copied here: No
Severity:
Immediate action:
Retest required:
Beta status impact:
```

Decision:

```text
Redaction / logging / audit monitoring: Pass / Watch / Pause
Reason:
Required follow-up:
```

## 4. Production Write Guard / Token Exchange Guard Monitoring

Targeted test command:

```bash
npx vitest run tests/meta-business-login-sandbox-sbl08.test.ts tests/meta-business-login-sandbox-sbl12-callback-capture.test.ts tests/meta-business-login-sandbox-sbl12-callback-route.test.ts tests/meta-business-login-sandbox-sbl13-workspace-linking-sync.test.ts
```

| Guard | Expected result | Observed result | Status | Evidence |
| --- | --- | --- | --- | --- |
| Token exchange guard | No real Meta token exchange; `exchangeAttempted=false` unless separately approved. |  | Pass / Watch / Fail |  |
| ConnectedAccount write guard | No production ConnectedAccount create/update. |  | Pass / Watch / Fail |  |
| Channel write guard | No production Channel create/update. |  | Pass / Watch / Fail |  |
| Webhook write guard | No production webhook registration/update. |  | Pass / Watch / Fail |  |
| Channel sync guard | Dry-run only; no production sync start. |  | Pass / Watch / Fail |  |
| Token refresh guard | No token refresh or token storage. |  | Pass / Watch / Fail |  |
| Redaction guard | No raw token/code/state/nonce/full callback URL. |  | Pass / Watch / Fail |  |

Decision:

```text
Production write guard monitoring: Pass / Watch / Pause
Token exchange guard monitoring: Pass / Watch / Pause
Reason:
Required follow-up:
```

## 5. Account Selection UX / Consent / Callback Evidence Monitoring

| Check | Expected result | Observed result | Status | Evidence |
| --- | --- | --- | --- | --- |
| Account selection UX | Account/profile or Business/Page/IG selection remains visible as documented. |  | Pass / Watch / Fail |  |
| Use another account path | Reviewer can see or reach account-switch behavior when expected. |  | Pass / Watch / Fail |  |
| Consent screen | App name, permission context, and policy links remain visible without secrets. |  | Pass / Watch / Fail |  |
| Callback response | Redacted callback evidence is returned. |  | Pass / Watch / Fail |  |
| Callback redaction | Callback evidence shows redacted markers only. |  | Pass / Watch / Fail |  |
| Callback guard | Token exchange and production write flags remain false. |  | Pass / Watch / Fail |  |
| UX regression | Flow remains close enough to ManyChat-style account selection for internal beta evidence. |  | Pass / Watch / Fail |  |

Decision:

```text
Account selection / consent / callback monitoring: Pass / Watch / Pause
Reason:
Required follow-up:
```

## 6. Rollback / Fallback Health

| Check | Expected result | Observed result | Status | Evidence |
| --- | --- | --- | --- | --- |
| Disable beta path | Internal beta can be disabled quickly. |  | Pass / Watch / Fail |  |
| Clear allowlist | Workspace allowlist can be cleared or reduced. |  | Pass / Watch / Fail |  |
| Existing Instagram OAuth fallback | Existing production flow remains available and unchanged. |  | Pass / Watch / Fail |  |
| Production login button | Unchanged. |  | Pass / Watch / Fail |  |
| Env / schema rollback | No env or Prisma schema change is needed for rollback. |  | Pass / Watch / Fail |  |
| Post-rollback verification | Beta blocked and fallback available after rollback. |  | Pass / Watch / Fail |  |

Decision:

```text
Rollback / fallback health: Pass / Watch / Pause
Reason:
Required follow-up:
```

## 7. Issue / Pause Trigger Record

Use one record for every beta issue, even if it does not pause the beta.

```text
Issue ID:
Detected at:
Detected by:
Monitoring area:
Severity:
  - Critical
  - High
  - Medium
  - Low
Pause trigger:
  - Yes
  - No
Raw value copied here: No
Description:
Immediate action:
Owner:
Required fix:
Retest plan:
Status:
  - Open
  - Monitoring
  - Resolved
  - Beta paused
```

Pause triggers:

- Raw token, authorization code, raw state, raw nonce, full callback URL, app secret, client secret, webhook verify token, cookie, localStorage, sessionStorage, unmasked asset ID, or real customer data appears in any artifact.
- Real Meta token exchange occurs without a separately approved task.
- Production ConnectedAccount, Channel, webhook, channel sync, token refresh, or token storage write occurs.
- Non-allowlisted workspace or non-approved user role can start beta.
- Existing Instagram OAuth fallback becomes unavailable.
- Meta Dashboard scope list changes without scope reconciliation.
- App Review package or evidence report has unresolved Hold / Fail / No-Go findings.
- Rollback path cannot disable beta quickly.

## 8. Internal Beta Continue / Pause / End Decision

Decision rule:

```text
Internal beta may continue only when all monitoring areas are Pass or approved Watch.
Any Fail on redaction, token exchange, production write, access control, fallback, or rollback must pause beta.
Internal beta may end only after evidence is collected, issues are resolved or accepted, and final status is documented.
```

Decision record:

```text
Monitoring decision:
  - Continue
  - Pause
  - End

Decision reason:
Open issues:
Pause triggers:
Required follow-up:
Owner:
Decision date:
```

## 9. Why Production Implementation Still Cannot Start

Production implementation remains No-Go even if internal beta monitoring is clean.

Reasons:

- App Review is not submitted or approved.
- Business Verification / Advanced Access status is not confirmed for the final scope set.
- Internal beta must complete successfully before production planning.
- Production env migration plan is not approved.
- No Supabase migration / db push has been reviewed or confirmed for this provider.
- Production callback behavior for real token exchange is not implemented or reviewed.
- Production ConnectedAccount / Channel writes remain intentionally blocked in sandbox.
- Real token storage, encryption, refresh, revocation, and expiry lifecycle are not approved for this provider.
- Webhook registration and channel sync lifecycle are not approved for real assets.
- Tenant isolation regression for real Business / Page / IG asset writes is not complete.
- Production rollback / monitoring plan is not complete.
- Existing Instagram OAuth fallback must remain available until a separate production implementation ADR is approved.

## 10. Monitoring Backfill

Backfill these documents after each monitoring report.

| Document | Required update | When |
| --- | --- | --- |
| `docs/meta-business-login-internal-beta-launch-checklist.md` | Link monitoring report and update launch / pause / end status. | After each monitoring report |
| `docs/meta-business-login-internal-beta-release-decision-memo-template.md` | Link monitoring report if it changes Go / Hold context. | After pause or end decision |
| `docs/meta-business-login-internal-beta-evidence-execution-report-template.md` | Link monitoring evidence if new findings affect execution status. | After any Watch / Fail |
| `docs/meta-business-login-sandbox-go-no-go-checklist.md` | Latest beta monitoring decision. | After each monitoring report |
| `docs/meta-app-review-checklist.md` | App Review readiness and beta monitoring status. | After each monitoring report |
| `docs/security-review.md` | Security monitoring / pause note. | After each monitoring report |
| `docs/fix-roadmap.md` | Remaining Hold, Watch, Fail, or production blockers. | After current unrelated edits are resolved |
| `docs/codex-session-log.md` | Session result and validation. | After current unrelated edits are resolved |

## Final Monitoring Report Decision

```text
Internal beta monitoring report template: Ready
This monitoring report completed: Yes / No
Internal beta status:
  - Continue
  - Pause
  - End
Production implementation: No-Go

Next step:
If Continue, keep monitoring under this template.
If Pause, resolve pause trigger and rerun release / launch gates before resuming.
If End, compile final beta closeout report before any production planning.
```
