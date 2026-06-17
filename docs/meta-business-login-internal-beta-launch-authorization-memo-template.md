# Meta Business Login Internal Beta Launch Authorization Memo Template

Date: 2026-06-17
Status: Launch authorization memo template / internal beta Hold / App Review submission preparation Hold / production implementation No-Go

## Scope

This memo template records the final launch authorization decision for Meta Business Login / Instagram Business Login internal beta.

Source document:

```text
docs/meta-business-login-internal-beta-release-sign-off-checklist.md
```

This template does not authorize launch by itself. Internal beta can launch only when release sign-off is Go, final package gates are Pass, redaction unresolved finding count is `0`, and all launch restrictions are accepted.

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

## 1. Release Sign-Off Summary

| Field | Value |
| --- | --- |
| Authorization memo ID | `IBE-LAUNCH-AUTH-YYYYMMDD-NNN` |
| Run ID | `IBE-RUN-YYYYMMDD-NNN` |
| Release sign-off ID | `IBE-SIGNOFF-YYYYMMDD-NNN` |
| Final package gate review ID | `IBE-FP-GATE-YYYYMMDD-NNN` |
| Authorization date |  |
| Authorization status | Draft |
| Release sign-off checklist path | `docs/meta-business-login-internal-beta-release-sign-off-checklist.md` |
| Final package gate review path | `docs/meta-business-login-internal-beta-final-package-gate-review-template.md` |
| Redaction execution report path |  |
| Evidence execution report path |  |
| Launch checklist path | `docs/meta-business-login-internal-beta-launch-checklist.md` |
| Launch owner |  |
| Product owner decision | Hold |
| Engineering owner decision | Hold |
| Security reviewer decision | Hold |
| App Review owner decision | Hold |
| Operations owner decision | Hold |
| Release owner decision | Hold |
| Final package gate review result | Hold |
| Redaction unresolved finding count |  |
| Rollback / fallback result | Hold |
| Production write guard result | Hold |
| Token exchange guard result | Hold |
| Internal beta decision | Hold |
| App Review submission preparation decision | Hold |
| Production implementation decision | No-Go |

Release sign-off summary:

```text
Release sign-off is not complete until every required role decision is Go, final package gate review is Pass, and unresolved finding count is 0.
```

## 2. Internal Beta Go / Hold Decision

| Decision item | Required result for Go | Actual result | Decision |
| --- | --- | --- | --- |
| Product owner sign-off | Go |  | Hold |
| Engineering owner sign-off | Go |  | Hold |
| Security reviewer sign-off | Go |  | Hold |
| App Review owner sign-off | Go |  | Hold |
| Operations owner sign-off | Go |  | Hold |
| Release owner sign-off | Go |  | Hold |
| Final package gate review | Pass |  | Hold |
| Redaction report | Pass |  | Hold |
| Unresolved finding count | `0` |  | Hold |
| Rollback / fallback | Pass |  | Hold |
| Production write guard | Pass |  | Hold |
| Token exchange guard | Pass |  | Hold |
| Workspace allowlist / user role | Pass |  | Hold |
| Monitoring / pause trigger readiness | Pass |  | Hold |

Decision rule:

```text
Internal beta launch can become Go only when every decision item is Go or Pass and unresolved finding count is 0.
Any Hold, No-Go, Fail, missing sign-off, unresolved finding, or unaccepted launch restriction keeps launch authorization at Hold.
```

Final authorization:

| Authorization field | Result | Notes |
| --- | --- | --- |
| Internal beta launch authorization | Hold |  |
| Authorization owner |  |  |
| Authorization date |  |  |
| Required follow-up |  |  |

## 3. If Go: Beta Launch Restrictions

If internal beta launch is authorized as Go, the launch remains limited by every restriction below.

### 3.1 Entry Point Restrictions

| Restriction | Required result | Accepted? | Notes |
| --- | --- | --- | --- |
| Internal-only entry point only. | Required | No |  |
| Production login button remains unchanged. | Required | No |  |
| Production OAuth flow remains unchanged. | Required | No |  |
| Production callback route remains unchanged except previously approved sandbox guard behavior. | Required | No |  |
| Existing Instagram OAuth fallback remains available. | Required | No |  |

### 3.2 Workspace Allowlist Restrictions

| Restriction | Required result | Accepted? | Notes |
| --- | --- | --- | --- |
| Only explicitly approved workspaces can access the beta. | Required | No |  |
| Non-allowlisted workspace access is blocked. | Required | No |  |
| Allowlist can be cleared or reduced for rollback. | Required | No |  |
| Workspace markers are masked in logs, reports, and artifacts. | Required | No |  |

### 3.3 User Role Restrictions

| Restriction | Required result | Accepted? | Notes |
| --- | --- | --- | --- |
| Approved tester/admin users only. | Required | No |  |
| Non-approved users are blocked. | Required | No |  |
| Reviewer user proof uses masked markers only. | Required | No |  |
| No credentials, OTP, cookies, or browser storage are recorded. | Required | No |  |

### 3.4 Monitoring Requirements

| Monitoring item | Required result | Owner | Status |
| --- | --- | --- | --- |
| Redaction search after every evidence package update. | Required | security-reviewer | Hold |
| Production write guard observation. | Required | engineering-owner | Hold |
| Token exchange guard observation. | Required | engineering-owner | Hold |
| Workspace allowlist access monitoring. | Required | operations-owner | Hold |
| User role access monitoring. | Required | operations-owner | Hold |
| Rollback / fallback health check. | Required | operations-owner | Hold |
| Account selection UX issue monitoring. | Required | app-review-owner | Hold |
| Evidence artifact version tracking. | Required | release-owner | Hold |

### 3.5 Pause Triggers

Internal beta must pause immediately if any trigger below occurs:

- Raw token, authorization code, state, nonce, full callback URL, secret, cookie, credential, OTP, unmasked asset ID, or customer data appears in any artifact, log, audit, screenshot, recording, or report.
- Production ConnectedAccount or Channel write is attempted.
- Real Meta token exchange is attempted.
- Token storage, refresh, revocation, or webhook registration starts.
- Non-allowlisted workspace gains access.
- Non-approved user role gains access.
- Existing Instagram OAuth fallback becomes unavailable.
- Production login button, OAuth flow, callback route, env, or Prisma schema changes unexpectedly.
- Rollback cannot disable beta access.
- App Review evidence package includes unreviewed or unversioned artifacts.

## 4. If Hold: Required Fixes / Owner / Retest Evidence

If internal beta launch remains Hold, fill this table before reconsidering launch authorization.

| Fix ID | Blocking area | Required fix | Owner | Retest evidence required | Target date | Status |
| --- | --- | --- | --- | --- | --- | --- |
| IBE-LAUNCH-HOLD-001 |  |  |  | Yes |  | Open |
| IBE-LAUNCH-HOLD-002 |  |  |  | Yes |  | Open |
| IBE-LAUNCH-HOLD-003 |  |  |  | Yes |  | Open |
| IBE-LAUNCH-HOLD-004 |  |  |  | Yes |  | Open |

Retest evidence rule:

```text
Every Hold item must be fixed, retested, linked to evidence, and re-reviewed before launch authorization can be reconsidered.
```

## 5. Rollback / Fallback / Production Write Guard / Token Exchange Guard Summary

| Guard | Required result | Actual result | Status | Evidence reference |
| --- | --- | --- | --- | --- |
| Rollback proof exists and is redaction-passed. | Pass |  | Hold |  |
| Internal beta can be disabled without env change. | Pass |  | Hold |  |
| Workspace allowlist can be cleared or reduced. | Pass |  | Hold |  |
| Existing Instagram OAuth fallback remains available. | Pass |  | Hold |  |
| Production login button remains unchanged. | Pass |  | Hold |  |
| Production OAuth flow remains unchanged. | Pass |  | Hold |  |
| Production callback route remains unchanged except approved sandbox guard behavior. | Pass |  | Hold |  |
| Production ConnectedAccount write guard passes. | Pass |  | Hold |  |
| Production Channel write guard passes. | Pass |  | Hold |  |
| Token exchange guard passes. | Pass |  | Hold |  |
| `exchangeAttempted=false` evidence is present when applicable. | Pass |  | Hold |  |
| No real token storage, refresh, or revocation starts. | Pass |  | Hold |  |
| No webhook registration or production channel sync starts. | Pass |  | Hold |  |

Guard summary rule:

```text
Rollback, fallback, production write guard, and token exchange guard must all be Pass before internal beta launch can be authorized.
```

## 6. App Review Submission Preparation Decision

Internal beta launch authorization does not automatically authorize App Review submission preparation.

| Decision item | Required result to start preparation | Actual result | Decision |
| --- | --- | --- | --- |
| Internal beta launch authorization | Go |  | Hold |
| Final package gate review | Pass |  | Hold |
| Redaction unresolved finding count | `0` |  | Hold |
| Reviewer recording package | Pass |  | Hold |
| Screenshot package | Pass |  | Hold |
| Permission proof matrix | Pass |  | Hold |
| Test asset proof | Pass |  | Hold |
| Scope reconciliation | Pass |  | Hold |
| Rollback / fallback proof | Pass |  | Hold |
| Monitoring plan accepted | Pass |  | Hold |

App Review preparation rule:

```text
App Review submission preparation can start only when internal beta launch authorization is Go and all package evidence remains redaction-passed.
```

Current decision:

```text
App Review submission preparation: Hold
```

## 7. Why Production Implementation Still Cannot Start

Production implementation remains No-Go after this memo is created or filled.

Reasons:

- This memo only authorizes or holds internal beta launch, not production implementation.
- App Review has not been submitted or approved.
- Business Verification / Advanced Access status is not confirmed for the final scope set.
- Internal beta must launch, be monitored, and close out before production implementation review.
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

After launch authorization is reviewed, backfill:

| Document | Required update |
| --- | --- |
| `docs/meta-business-login-internal-beta-launch-authorization-memo-template.md` | Fill final Go / Hold decision, restrictions, Hold fixes, and guard summaries. |
| `docs/meta-business-login-internal-beta-release-sign-off-checklist.md` | Link launch authorization memo and update sign-off outcome. |
| `docs/meta-business-login-internal-beta-final-package-gate-review-template.md` | Link launch authorization decision and package gate status. |
| `docs/meta-business-login-internal-beta-artifact-redaction-review-checklist.md` | Link authorization result and unresolved finding status. |
| `docs/meta-business-login-internal-beta-artifact-manifest-template.md` | Update final package references and authorization status. |
| `docs/meta-business-login-internal-beta-real-evidence-execution-report-blank-run.md` | Link authorization memo and internal beta decision. |
| `docs/meta-business-login-internal-beta-real-evidence-execution-plan.md` | Mark launch authorization step Pass / Hold / Fail. |
| `docs/meta-business-login-internal-beta-evidence-execution-report-template.md` | Summarize launch authorization result. |
| `docs/meta-business-login-internal-beta-release-decision-memo-template.md` | Use authorization memo as release decision evidence. |
| `docs/meta-business-login-internal-beta-launch-checklist.md` | Fill only if internal beta launch authorization becomes Go. |
| `docs/meta-business-login-internal-beta-monitoring-report-template.md` | Fill only after beta starts. |
| `docs/meta-business-login-final-app-review-package-assembly-checklist.md` | Update App Review preparation readiness. |
| `docs/meta-business-login-sandbox-go-no-go-checklist.md` | Update internal beta launch authorization gate. |
| `docs/meta-app-review-checklist.md` | Update App Review readiness and internal beta authorization status. |
| `docs/security-review.md` | Update launch authorization security posture. |
| `docs/fix-roadmap.md` | Add remaining Hold / Fail blockers after current unrelated edits are resolved. |
| `docs/codex-session-log.md` | Add session result after current unrelated edits are resolved. |

## Final Memo Template Status

```text
Launch authorization memo template: Ready
Launch authorization reviewed: No
Internal beta launch authorization: Hold
App Review submission preparation: Hold
Production implementation: No-Go
```

