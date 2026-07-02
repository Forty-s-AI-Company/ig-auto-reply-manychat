# Meta Business Login Internal Beta Continuation Decision Memo Template

Date: 2026-06-17
Status: Continuation decision memo template / internal beta Hold / App Review submission preparation Hold / production implementation No-Go

## Scope

This memo template records the decision after the first 24 hours of Meta Business Login / Instagram Business Login internal beta monitoring.

Source document:

```text
docs/meta-business-login-internal-beta-first-24h-monitoring-execution-report-template.md
```

This memo does not approve production implementation. It only records whether internal beta should continue, pause, or roll back after the first 24-hour monitoring window.

This document does not change:

- Product functionality code.
- OAuth flow.
- Callback route.
- Login button.
- Environment variables.
- Prisma schema.
- Supabase migration state.
- Production ConnectedAccount / Channel records.
- Real Meta token exchange.

## 1. First-24h Monitoring Summary

| Field | Value |
| --- | --- |
| Continuation memo ID | `IBE-CONTINUATION-YYYYMMDD-NNN` |
| Monitoring report ID | `IBE-24H-MON-YYYYMMDD-NNN` |
| Run ID | `IBE-RUN-YYYYMMDD-NNN` |
| Launch runbook ID | `IBE-LAUNCH-RUNBOOK-YYYYMMDD-NNN` |
| Launch authorization memo ID | `IBE-LAUNCH-AUTH-YYYYMMDD-NNN` |
| Monitoring window start |  |
| Monitoring window end |  |
| Decision date / time |  |
| Decision owner |  |
| Monitoring owner |  |
| Engineering owner |  |
| Security reviewer |  |
| Operations owner |  |
| App Review owner |  |
| Rollback owner |  |
| Workspaces monitored | Masked workspace markers only |
| Users monitored | Masked user markers only |
| Pause trigger count |  |
| High / Critical issue count |  |
| Unresolved finding count |  |
| First-24h monitoring result | Hold |
| Continuation decision | Hold |
| App Review submission preparation decision | Hold |
| Production implementation decision | No-Go |

Monitoring summary checklist:

| Area | Required result to continue | Actual result | Decision |
| --- | --- | --- | --- |
| Workspace allowlist monitoring | Pass |  | Hold |
| User role monitoring | Pass |  | Hold |
| Internal-only entry point monitoring | Pass |  | Hold |
| Redaction monitoring | Pass |  | Hold |
| Production write guard monitoring | Pass |  | Hold |
| Token exchange guard monitoring | Pass |  | Hold |
| Account selection UX monitoring | Pass |  | Hold |
| Consent / callback monitoring | Pass |  | Hold |
| Workspace linking dry-run monitoring | Pass |  | Hold |
| Channel sync dry-run monitoring | Pass |  | Hold |
| Fallback health | Pass |  | Hold |
| Rollback health | Pass |  | Hold |
| No unresolved High / Critical issues | Pass |  | Hold |
| No active pause trigger | Pass |  | Hold |

## 2. Continue / Pause / Rollback Decision

Decision values:

```text
Continue
Pause
Rollback
Hold
```

Decision table:

| Decision item | Continue condition | Actual result | Decision |
| --- | --- | --- | --- |
| All monitoring gates are Pass. | Required |  | Hold |
| Redaction unresolved finding count is `0`. | Required |  | Hold |
| No active pause trigger. | Required |  | Hold |
| No unresolved High / Critical issues. | Required |  | Hold |
| Production write guard remains Pass. | Required |  | Hold |
| Token exchange guard remains Pass. | Required |  | Hold |
| Fallback health remains Pass. | Required |  | Hold |
| Rollback health remains Pass. | Required |  | Hold |
| Continue restrictions accepted. | Required |  | Hold |

Final decision:

| Field | Value |
| --- | --- |
| Internal beta continuation decision | Hold |
| Decision owner |  |
| Decision timestamp |  |
| Required follow-up |  |
| Next review window |  |

Decision rule:

```text
Internal beta can continue only when all decision items are Pass and unresolved finding count is 0.
Any active pause trigger, unresolved High/Critical issue, redaction failure, guard failure, fallback failure, or rollback readiness failure requires Pause or Rollback.
```

## 3. If Continue: Monitoring And Evidence Collection Conditions

If the decision is Continue, the following conditions remain mandatory.

### 3.1 Continued Monitoring Conditions

| Condition | Required result | Owner | Status | Notes |
| --- | --- | --- | --- | --- |
| Continue internal-only entry point only. | Required | engineering-owner | Hold |  |
| Continue workspace allowlist only. | Required | operations-owner | Hold |  |
| Continue approved tester/admin users only. | Required | operations-owner | Hold |  |
| Continue redaction search after every evidence update. | Required | security-reviewer | Hold |  |
| Continue production write guard monitoring. | Required | engineering-owner | Hold |  |
| Continue token exchange guard monitoring. | Required | engineering-owner | Hold |  |
| Continue fallback health checks. | Required | operations-owner | Hold |  |
| Continue rollback readiness checks. | Required | rollback-owner | Hold |  |
| Continue issue / pause trigger tracking. | Required | monitoring-owner | Hold |  |

### 3.2 Continued Evidence Collection Conditions

| Evidence area | Required collection | Owner | Status |
| --- | --- | --- | --- |
| Account selection UX | Capture only redacted / reviewer-safe evidence. | app-review-owner | Hold |
| Consent screen | Capture only redacted / reviewer-safe evidence. | app-review-owner | Hold |
| Callback evidence | Store redacted evidence only; no raw code/state/nonce/full callback URL. | engineering-owner | Hold |
| Workspace linking dry-run | Store dry-run mapping only; no production write. | engineering-owner | Hold |
| Channel sync dry-run | Store dry-run payload only; no production sync. | engineering-owner | Hold |
| Guard output | Store redaction-reviewed targeted test / monitoring output only. | engineering-owner | Hold |
| Fallback health | Store redacted fallback verification evidence only. | operations-owner | Hold |
| Issue remediation | Store owner, retest evidence, and final status. | monitoring-owner | Hold |

Continue rule:

```text
Continue does not allow production writes, real token exchange, env changes, Prisma schema changes, or production OAuth flow changes.
```

## 4. If Pause: Pause Trigger / Owner / Remediation / Retest Evidence

If the decision is Pause, fill this register.

| Pause ID | Pause trigger | Severity | Owner | Immediate action | Remediation | Retest evidence | Status |
| --- | --- | --- | --- | --- | --- | --- | --- |
| IBE-PAUSE-001 |  |  |  |  |  |  | Open |
| IBE-PAUSE-002 |  |  |  |  |  |  | Open |
| IBE-PAUSE-003 |  |  |  |  |  |  | Open |

Pause requirements:

- Disable or restrict beta access as needed.
- Preserve existing Instagram OAuth fallback.
- Quarantine affected artifacts.
- Do not package affected artifacts for App Review.
- Assign owner and remediation.
- Record retest evidence before reconsidering Continue.
- Re-run redaction search after remediation.
- Re-run affected guard tests after remediation.

Pause decision rule:

```text
Paused beta cannot continue until every pause trigger is resolved, retested, redaction-reviewed, and signed off.
```

## 5. If Rollback: Rollback Execution And Fallback Verification

If the decision is Rollback, fill this register.

### 5.1 Rollback Execution

| Rollback step | Required result | Actual result | Owner | Status | Evidence |
| --- | --- | --- | --- | --- | --- |
| Disable internal-only entry point. | Beta blocked. |  | rollback-owner | Hold |  |
| Clear or reduce workspace allowlist. | Non-approved workspaces blocked. |  | operations-owner | Hold |  |
| Revoke non-required user role access. | Non-approved users blocked. |  | operations-owner | Hold |  |
| Confirm no production ConnectedAccount write occurred. | Pass |  | engineering-owner | Hold |  |
| Confirm no production Channel write occurred. | Pass |  | engineering-owner | Hold |  |
| Confirm no real token exchange occurred. | Pass |  | engineering-owner | Hold |  |
| Confirm no env rollback is required. | Pass |  | engineering-owner | Hold |  |
| Confirm no Prisma schema rollback is required. | Pass |  | engineering-owner | Hold |  |
| Run redaction check on rollback evidence. | Pass |  | security-reviewer | Hold |  |

### 5.2 Fallback Verification

| Fallback check | Required result | Actual result | Owner | Status | Evidence |
| --- | --- | --- | --- | --- | --- |
| Existing Instagram OAuth fallback is reachable. | Pass |  | operations-owner | Hold |  |
| Production login button remains unchanged. | Pass |  | engineering-owner | Hold |  |
| Production OAuth authorize behavior remains unchanged. | Pass |  | engineering-owner | Hold |  |
| Production callback behavior remains unchanged. | Pass |  | engineering-owner | Hold |  |
| Existing connected account / channel flow remains usable. | Pass |  | operations-owner | Hold |  |
| Fallback evidence is redacted. | Pass |  | security-reviewer | Hold |  |

Rollback rule:

```text
Rollback evidence must not contain raw sensitive values and must confirm the existing Instagram OAuth fallback remains available.
```

## 6. App Review Submission Preparation Decision

App Review submission preparation can start only if internal beta continuation evidence supports it.

| Decision item | Required result to start preparation | Actual result | Decision |
| --- | --- | --- | --- |
| Internal beta continuation decision | Continue |  | Hold |
| First-24h monitoring result | Pass |  | Hold |
| Redaction unresolved finding count | `0` |  | Hold |
| No active pause trigger | Pass |  | Hold |
| No unresolved High / Critical issue | Pass |  | Hold |
| Reviewer recording package remains valid. | Pass |  | Hold |
| Screenshot package remains valid. | Pass |  | Hold |
| Permission proof package remains valid. | Pass |  | Hold |
| Test asset proof package remains valid. | Pass |  | Hold |
| Scope reconciliation remains valid. | Pass |  | Hold |
| Fallback / rollback readiness remains valid. | Pass |  | Hold |

App Review preparation rule:

```text
App Review submission preparation remains Hold if internal beta is paused, rolled back, or has unresolved findings.
```

Current decision:

```text
App Review submission preparation: Hold
```

## 7. Why Production Implementation Still Cannot Start

Production implementation remains No-Go after this memo is created or filled.

Reasons:

- This memo only decides internal beta continuation, pause, or rollback.
- App Review has not been submitted or approved.
- Business Verification / Advanced Access status is not confirmed for the final scope set.
- Internal beta must complete monitoring and closeout before production implementation review.
- Production env migration plan is not approved.
- No Supabase migration / db push has been reviewed or confirmed for this provider.
- Production callback behavior for real token exchange is not implemented or reviewed.
- Production ConnectedAccount / Channel writes remain intentionally blocked in sandbox.
- Real token storage, encryption, refresh, revocation, and expiry lifecycle are not approved for this provider.
- Webhook registration and channel sync lifecycle are not approved for real assets.
- Tenant isolation regression for real Business / Page / IG asset writes is not complete.
- Production rollback / monitoring plan is not complete.
- Existing Instagram OAuth fallback must remain available until a separate production implementation ADR is approved.

Current decision:

```text
Production implementation: No-Go
```

## 8. Explicit Restrictions

Do not perform these actions while using or filling this memo:

- Do not run Supabase migration.
- Do not run Supabase `db push`.
- Do not modify the production OAuth flow.
- Do not modify the callback route.
- Do not modify the login button.
- Do not modify environment variables.
- Do not modify Prisma schema.
- Do not create or update production ConnectedAccount / Channel records.
- Do not perform real Meta token exchange.
- Do not store raw token, authorization code, raw state, raw nonce, full callback URL, app secret, client secret, webhook verify token, cookie, browser storage, credential, OTP, unmasked asset ID, or real customer data.

Supabase safety note:

```text
If a future task requires Supabase migration or db push, first show current project_id, linked project, and Supabase account email, then wait for explicit confirmation.
```

## 9. Documents To Backfill After Completion

After continuation decision is reviewed, backfill:

| Document | Required update |
| --- | --- |
| `docs/meta-business-login-internal-beta-continuation-decision-memo-template.md` | Fill continuation / pause / rollback decision, owners, remediation, and evidence references. |
| `docs/meta-business-login-internal-beta-first-24h-monitoring-execution-report-template.md` | Link continuation decision and update final 24-hour result. |
| `docs/meta-business-login-internal-beta-launch-execution-runbook-template.md` | Link continuation decision and update launch runbook status. |
| `docs/meta-business-login-internal-beta-launch-authorization-memo-template.md` | Link continuation result and update authorization status. |
| `docs/meta-business-login-internal-beta-release-sign-off-checklist.md` | Link continuation decision and any sign-off changes. |
| `docs/meta-business-login-internal-beta-final-package-gate-review-template.md` | Link continuation decision and package gate impact. |
| `docs/meta-business-login-internal-beta-artifact-redaction-review-checklist.md` | Link monitoring redaction outcome and unresolved finding count. |
| `docs/meta-business-login-internal-beta-artifact-manifest-template.md` | Update monitoring evidence references if artifacts change. |
| `docs/meta-business-login-internal-beta-real-evidence-execution-report-blank-run.md` | Link continuation decision result. |
| `docs/meta-business-login-internal-beta-real-evidence-execution-plan.md` | Mark continuation decision step Pass / Hold / Fail. |
| `docs/meta-business-login-internal-beta-evidence-execution-report-template.md` | Summarize continuation decision and remaining issues. |
| `docs/meta-business-login-internal-beta-monitoring-report-template.md` | Reference this continuation memo. |
| `docs/meta-business-login-internal-beta-closeout-report-template.md` | Fill only after beta closeout. |
| `docs/meta-business-login-final-app-review-package-assembly-checklist.md` | Update App Review preparation readiness. |
| `docs/meta-business-login-sandbox-go-no-go-checklist.md` | Update internal beta continuation gate. |
| `docs/meta-app-review-checklist.md` | Update App Review readiness and continuation status. |
| `docs/security-review.md` | Update continuation redaction / guard security posture. |
| `docs/fix-roadmap.md` | Add remaining Hold / Fail blockers after current unrelated edits are resolved. |
| `docs/codex-session-log.md` | Add session result after current unrelated edits are resolved. |

## Final Memo Template Status

```text
Continuation decision memo template: Ready
Continuation decision reviewed: No
Internal beta continuation decision: Hold
App Review submission preparation: Hold
Production implementation: No-Go
```

