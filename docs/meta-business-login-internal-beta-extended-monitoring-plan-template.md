# Meta Business Login Internal Beta Extended Monitoring Plan Template

Date: 2026-06-17
Status: Extended monitoring plan template / internal beta Hold / App Review submission preparation Hold / production implementation No-Go

## Scope

This plan template defines the extended monitoring period after the first 24-hour Meta Business Login / Instagram Business Login internal beta monitoring window.

Source document:

```text
docs/meta-business-login-internal-beta-continuation-decision-memo-template.md
```

This plan does not approve production implementation. It only defines the continued internal beta monitoring process when the continuation decision is Continue.

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

## 1. Extended Monitoring Cycle And Owners

| Field | Value |
| --- | --- |
| Extended monitoring plan ID | `IBE-EXT-MON-YYYYMMDD-NNN` |
| Continuation memo ID | `IBE-CONTINUATION-YYYYMMDD-NNN` |
| First-24h monitoring report ID | `IBE-24H-MON-YYYYMMDD-NNN` |
| Run ID | `IBE-RUN-YYYYMMDD-NNN` |
| Monitoring start |  |
| Monitoring end |  |
| Monitoring cadence | Daily + weekly review |
| Monitoring owner |  |
| Engineering owner |  |
| Security reviewer |  |
| Operations owner |  |
| App Review owner |  |
| Product owner |  |
| Rollback owner |  |
| Release owner |  |
| Workspaces monitored | Masked workspace markers only |
| Users monitored | Masked user markers only |
| Extended monitoring status | Draft |
| App Review submission preparation decision | Hold |
| Production implementation decision | No-Go |

Monitoring cycle:

| Cycle | Frequency | Required owner | Required output |
| --- | --- | --- | --- |
| Daily monitoring | Every beta day | monitoring-owner | Daily checklist result |
| Daily security review | Every beta day with new artifacts | security-reviewer | Redaction / guard check result |
| Daily operations review | Every beta day | operations-owner | Allowlist / role / fallback result |
| Weekly decision review | Weekly | release-owner | Continue / Pause / Rollback decision |
| App Review prep review | Weekly or after evidence package changes | app-review-owner | App Review prep gate status |

## 2. Daily Monitoring Checklist

| Daily check | Required result | Owner | Result | Status | Evidence |
| --- | --- | --- | --- | --- | --- |
| Approved workspaces can access internal beta. | Pass | operations-owner |  | Hold |  |
| Non-allowlisted workspaces are blocked. | Pass | operations-owner |  | Hold |  |
| Approved tester/admin users can access internal beta. | Pass | operations-owner |  | Hold |  |
| Non-approved users are blocked. | Pass | operations-owner |  | Hold |  |
| Internal-only entry point remains internal-only. | Pass | engineering-owner |  | Hold |  |
| Production login button remains unchanged. | Pass | engineering-owner |  | Hold |  |
| Production OAuth flow remains unchanged. | Pass | engineering-owner |  | Hold |  |
| Production callback route remains unchanged except approved sandbox guard behavior. | Pass | engineering-owner |  | Hold |  |
| Existing Instagram OAuth fallback remains available. | Pass | operations-owner |  | Hold |  |
| Account selection UX remains acceptable. | Pass | app-review-owner |  | Hold |  |
| Consent / callback evidence remains redacted. | Pass | security-reviewer |  | Hold |  |
| No active pause trigger. | Pass | monitoring-owner |  | Hold |  |
| All new evidence artifacts are versioned and owned. | Pass | release-owner |  | Hold |  |

Daily rule:

```text
Any daily Hold or Fail must be assigned an owner before the next monitoring cycle.
```

## 3. Weekly Monitoring Checklist

| Weekly check | Required result | Owner | Result | Status | Evidence |
| --- | --- | --- | --- | --- | --- |
| Daily monitoring results reviewed. | Pass | release-owner |  | Hold |  |
| Open issues reviewed and prioritized. | Pass | monitoring-owner |  | Hold |  |
| Redaction reports reviewed. | Pass | security-reviewer |  | Hold |  |
| Production write guard trend reviewed. | Pass | engineering-owner |  | Hold |  |
| Token exchange guard trend reviewed. | Pass | engineering-owner |  | Hold |  |
| Account selection UX evidence reviewed. | Pass | app-review-owner |  | Hold |  |
| Permission proof remains aligned with requested scopes. | Pass | product-owner |  | Hold |  |
| Fallback / rollback readiness reviewed. | Pass | operations-owner |  | Hold |  |
| Workspace allowlist remains minimal. | Pass | operations-owner |  | Hold |  |
| App Review submission preparation gate reviewed. | Pass / Hold | app-review-owner |  | Hold |  |
| Continue / Pause / Rollback weekly decision recorded. | Continue / Pause / Rollback | release-owner |  | Hold |  |

Weekly rule:

```text
Weekly review must not mark Continue if any High/Critical issue, redaction failure, guard failure, fallback failure, or active pause trigger is unresolved.
```

## 4. Redaction / Production Write Guard / Token Exchange Guard Continuous Checks

### 4.1 Redaction Checks

| Check | Frequency | Required result | Owner | Status |
| --- | --- | --- | --- | --- |
| New artifacts contain no raw token. | Every artifact update | Pass | security-reviewer | Hold |
| New artifacts contain no raw authorization code. | Every artifact update | Pass | security-reviewer | Hold |
| New artifacts contain no raw state. | Every artifact update | Pass | security-reviewer | Hold |
| New artifacts contain no raw nonce. | Every artifact update | Pass | security-reviewer | Hold |
| New artifacts contain no full callback URL. | Every artifact update | Pass | security-reviewer | Hold |
| New artifacts contain no app secret, client secret, API key, database URL, or Supabase key. | Every artifact update | Pass | security-reviewer | Hold |
| New artifacts contain no cookie, browser storage, credential, or OTP. | Every artifact update | Pass | security-reviewer | Hold |
| New artifacts contain no unmasked asset ID. | Every artifact update | Pass | security-reviewer | Hold |
| New artifacts contain no real customer data. | Every artifact update | Pass | security-reviewer | Hold |

### 4.2 Production Write Guard Checks

| Check | Frequency | Required result | Owner | Status |
| --- | --- | --- | --- | --- |
| No production ConnectedAccount write occurs. | Daily | Pass | engineering-owner | Hold |
| No production Channel write occurs. | Daily | Pass | engineering-owner | Hold |
| No webhook registration occurs. | Daily | Pass | engineering-owner | Hold |
| No production channel sync starts. | Daily | Pass | engineering-owner | Hold |
| No token refresh / revocation lifecycle starts. | Daily | Pass | engineering-owner | Hold |
| Guard test output remains redaction-safe. | Daily or after changes | Pass | security-reviewer | Hold |

### 4.3 Token Exchange Guard Checks

| Check | Frequency | Required result | Owner | Status |
| --- | --- | --- | --- | --- |
| No real Meta token exchange occurs. | Daily | Pass | engineering-owner | Hold |
| `exchangeAttempted=false` evidence remains available when applicable. | Daily or after callback capture | Pass | engineering-owner | Hold |
| No token storage occurs. | Daily | Pass | engineering-owner | Hold |
| No refresh token storage occurs. | Daily | Pass | engineering-owner | Hold |
| No token appears in logs, audit, reports, screenshots, or recordings. | Every artifact update | Pass | security-reviewer | Hold |

Guard rule:

```text
Any production write guard or token exchange guard failure requires immediate Pause or Rollback review.
```

## 5. Account Selection UX / Consent / Callback / Dry-Run Evidence Collection Conditions

| Evidence area | Collection condition | Owner | Required redaction gate | Status |
| --- | --- | --- | --- | --- |
| Account selection UX | Capture only when test workspace and test user are approved. | app-review-owner | Pass | Hold |
| Consent screen | Capture only without browser address-bar query parameters. | app-review-owner | Pass | Hold |
| Callback evidence | Store redacted callback evidence only. | engineering-owner | Pass | Hold |
| Workspace linking dry-run | Store dry-run mapping only; no production write. | engineering-owner | Pass | Hold |
| Channel sync dry-run | Store dry-run payload only; no production sync. | engineering-owner | Pass | Hold |
| Guard output | Store targeted tests / monitoring output only after redaction review. | engineering-owner | Pass | Hold |
| Fallback health | Store redacted fallback verification evidence only. | operations-owner | Pass | Hold |
| Issue remediation | Store owner, remediation, retest evidence, and final status. | monitoring-owner | Pass | Hold |

Collection restrictions:

- Do not record raw authorization code, raw state, raw nonce, full callback URL, token, or secret.
- Do not record unmasked Business / Page / IG / workspace / user / customer identifiers.
- Do not record real customer messages, comments, media, insights, profile data, or billing data.
- Do not package unreviewed evidence for App Review.
- Do not use continued evidence collection to justify production writes.

## 6. Pause / Rollback / Continue Decision Rules

### 6.1 Continue

Continue is allowed only when:

- Daily and weekly monitoring gates are Pass.
- Redaction unresolved finding count is `0`.
- No active pause trigger exists.
- No unresolved High / Critical issue exists.
- Production write guard is Pass.
- Token exchange guard is Pass.
- Fallback health is Pass.
- Rollback readiness is Pass.
- App Review evidence remains versioned, owned, and redaction-gated.

### 6.2 Pause

Pause is required when:

- A redaction finding is unresolved.
- A High / Critical issue is open.
- Evidence is missing owner, version, reviewer, or redaction gate.
- Workspace allowlist or user role behavior is uncertain.
- App Review package evidence is stale or unsafe.
- Fallback health is uncertain.

### 6.3 Rollback

Rollback is required when:

- Production ConnectedAccount or Channel write is attempted.
- Real Meta token exchange is attempted.
- Token storage, refresh, revocation, webhook registration, or production channel sync starts.
- Non-allowlisted workspace gains access.
- Non-approved user gains access.
- Existing Instagram OAuth fallback is unavailable.
- Internal-only entry point cannot be contained.
- Rollback drill fails.

Decision register:

| Review date | Decision | Reason | Owner | Follow-up | Status |
| --- | --- | --- | --- | --- | --- |
|  | Hold |  |  |  | Open |
|  | Hold |  |  |  | Open |
|  | Hold |  |  |  | Open |

## 7. App Review Submission Preparation Gate

App Review submission preparation can start only if all gates below are Pass.

| Gate | Required result | Actual result | Decision |
| --- | --- | --- | --- |
| Internal beta continuation decision | Continue |  | Hold |
| Extended monitoring trend | Pass |  | Hold |
| Redaction unresolved finding count | `0` |  | Hold |
| No active pause trigger | Pass |  | Hold |
| No unresolved High / Critical issue | Pass |  | Hold |
| Reviewer recording package remains valid. | Pass |  | Hold |
| Screenshot package remains valid. | Pass |  | Hold |
| Permission proof package remains valid. | Pass |  | Hold |
| Test asset proof package remains valid. | Pass |  | Hold |
| Scope reconciliation remains valid. | Pass |  | Hold |
| Account selection UX evidence remains valid. | Pass |  | Hold |
| Fallback / rollback readiness remains valid. | Pass |  | Hold |
| Production write guard remains Pass. | Pass |  | Hold |
| Token exchange guard remains Pass. | Pass |  | Hold |

App Review prep rule:

```text
App Review submission preparation remains Hold if internal beta is paused, rolled back, stale, or has unresolved findings.
```

Current decision:

```text
App Review submission preparation: Hold
```

## 8. Why Production Implementation Still Cannot Start

Production implementation remains No-Go after this plan is created or filled.

Reasons:

- This plan only governs extended internal beta monitoring.
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

## 9. Explicit Restrictions

Do not perform these actions while using or filling this plan:

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

## 10. Documents To Backfill After Completion

After extended monitoring is planned, executed, or reviewed, backfill:

| Document | Required update |
| --- | --- |
| `docs/meta-business-login-internal-beta-extended-monitoring-plan-template.md` | Fill daily / weekly monitoring status, decisions, and evidence references. |
| `docs/meta-business-login-internal-beta-continuation-decision-memo-template.md` | Link extended monitoring plan and update continuation status. |
| `docs/meta-business-login-internal-beta-first-24h-monitoring-execution-report-template.md` | Link extended monitoring decision. |
| `docs/meta-business-login-internal-beta-launch-execution-runbook-template.md` | Link extended monitoring plan and update launch follow-up. |
| `docs/meta-business-login-internal-beta-launch-authorization-memo-template.md` | Link extended monitoring status. |
| `docs/meta-business-login-internal-beta-release-sign-off-checklist.md` | Update sign-off status if monitoring changes readiness. |
| `docs/meta-business-login-internal-beta-final-package-gate-review-template.md` | Update package gate impact from monitoring. |
| `docs/meta-business-login-internal-beta-artifact-redaction-review-checklist.md` | Link ongoing redaction results. |
| `docs/meta-business-login-internal-beta-artifact-manifest-template.md` | Update evidence artifact references if new artifacts are collected. |
| `docs/meta-business-login-internal-beta-real-evidence-execution-report-blank-run.md` | Link extended monitoring status. |
| `docs/meta-business-login-internal-beta-real-evidence-execution-plan.md` | Mark extended monitoring step Pass / Hold / Fail. |
| `docs/meta-business-login-internal-beta-evidence-execution-report-template.md` | Summarize extended monitoring evidence. |
| `docs/meta-business-login-internal-beta-monitoring-report-template.md` | Reference daily / weekly monitoring outputs. |
| `docs/meta-business-login-internal-beta-closeout-report-template.md` | Fill only after beta closeout. |
| `docs/meta-business-login-final-app-review-package-assembly-checklist.md` | Update App Review preparation readiness. |
| `docs/meta-business-login-sandbox-go-no-go-checklist.md` | Update extended monitoring gate. |
| `docs/meta-app-review-checklist.md` | Update App Review readiness and monitoring status. |
| `docs/security-review.md` | Update extended monitoring redaction / guard security posture. |
| `docs/fix-roadmap.md` | Add remaining Hold / Fail blockers after current unrelated edits are resolved. |
| `docs/codex-session-log.md` | Add session result after current unrelated edits are resolved. |

## Final Plan Template Status

```text
Extended monitoring plan template: Ready
Extended monitoring started: No
Extended monitoring completed: No
App Review submission preparation: Hold
Production implementation: No-Go
```

