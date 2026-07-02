# Meta Business Login Internal Beta Launch Execution Runbook Template

Date: 2026-06-17
Status: Launch execution runbook template / internal beta Hold / App Review submission preparation Hold / production implementation No-Go

## Scope

This runbook template records the execution steps for a Meta Business Login / Instagram Business Login internal beta launch after launch authorization is reviewed.

Source document:

```text
docs/meta-business-login-internal-beta-launch-authorization-memo-template.md
```

This template does not authorize launch by itself. It can be executed only if the launch authorization memo records internal beta launch authorization as Go.

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

## 1. Launch Metadata

| Field | Value |
| --- | --- |
| Launch runbook ID | `IBE-LAUNCH-RUNBOOK-YYYYMMDD-NNN` |
| Run ID | `IBE-RUN-YYYYMMDD-NNN` |
| Launch authorization memo ID | `IBE-LAUNCH-AUTH-YYYYMMDD-NNN` |
| Release sign-off ID | `IBE-SIGNOFF-YYYYMMDD-NNN` |
| Final package gate review ID | `IBE-FP-GATE-YYYYMMDD-NNN` |
| Launch date / time |  |
| Launch owner |  |
| Operations owner |  |
| Engineering owner |  |
| Security reviewer |  |
| App Review owner |  |
| Rollback owner |  |
| Monitoring owner |  |
| Launch status | Draft |
| Internal beta launch authorization | Hold |
| App Review submission preparation decision | Hold |
| Production implementation decision | No-Go |

Launch execution rule:

```text
Do not execute this runbook unless internal beta launch authorization is Go.
```

## 2. Final Pre-Launch Checklist

| Check | Required result | Actual result | Status | Evidence |
| --- | --- | --- | --- | --- |
| Launch authorization memo is completed. | Go |  | Hold |  |
| Release sign-off checklist has all required role decisions as Go. | Go |  | Hold |  |
| Final package gate review is Pass. | Pass |  | Hold |  |
| Redaction report is Pass. | Pass |  | Hold |  |
| Unresolved finding count is `0`. | Pass |  | Hold |  |
| Workspace allowlist plan is approved. | Pass |  | Hold |  |
| User role allowlist plan is approved. | Pass |  | Hold |  |
| Internal-only entry point is identified. | Pass |  | Hold |  |
| Monitoring owner is assigned. | Pass |  | Hold |  |
| Rollback owner is assigned. | Pass |  | Hold |  |
| Pause triggers are accepted. | Pass |  | Hold |  |
| Existing Instagram OAuth fallback is verified. | Pass |  | Hold |  |
| No Supabase migration or db push is planned. | Pass |  | Hold |  |
| No production OAuth flow change is planned. | Pass |  | Hold |  |
| No env or Prisma schema change is planned. | Pass |  | Hold |  |

Pre-launch rule:

```text
Any Hold or Fail in this table blocks launch execution.
```

## 3. Workspace Allowlist / User Role Enablement Record

### 3.1 Workspace Allowlist

| Workspace marker | Access decision | Added by | Added at | Verification result | Notes |
| --- | --- | --- | --- | --- | --- |
| `workspace:masked-001` | Hold |  |  |  |  |
| `workspace:masked-002` | Hold |  |  |  |  |
| `workspace:masked-denied-001` | Deny test |  |  |  |  |

Workspace allowlist rules:

- Use masked workspace markers only.
- Do not record raw workspace IDs.
- Non-allowlisted workspaces must remain blocked.
- Allowlist must be reversible by rollback owner.

### 3.2 User Role Allowlist

| User marker | Role marker | Access decision | Added by | Added at | Verification result | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| `user:masked-admin-001` | `role:approved-admin` | Hold |  |  |  |  |
| `user:masked-tester-001` | `role:approved-tester` | Hold |  |  |  |  |
| `user:masked-member-001` | `role:non-approved-member` | Deny test |  |  |  |  |

User role rules:

- Approved tester/admin users only.
- No personal email, phone, password, OTP, cookie, browser storage, or private profile URL.
- Non-approved roles must be blocked.

## 4. Internal-Only Entry Point Enablement Record

| Step | Required result | Actual result | Owner | Status | Evidence |
| --- | --- | --- | --- | --- | --- |
| Confirm entry point is internal-only. | Pass |  | engineering-owner | Hold |  |
| Confirm entry point is not linked from production login button. | Pass |  | engineering-owner | Hold |  |
| Confirm standard production channel connect flow is unchanged. | Pass |  | engineering-owner | Hold |  |
| Confirm existing Instagram OAuth fallback remains available. | Pass |  | operations-owner | Hold |  |
| Confirm access requires allowlisted workspace. | Pass |  | engineering-owner | Hold |  |
| Confirm access requires approved user role. | Pass |  | engineering-owner | Hold |  |
| Confirm access logs are redacted. | Pass |  | security-reviewer | Hold |  |

Entry point rule:

```text
Internal beta entry point must never replace or modify the production login button, production OAuth flow, or production callback route.
```

## 5. Monitoring / Pause Trigger / Rollback Owner Fields

### 5.1 Owner Assignment

| Area | Owner | Backup owner | Contact method marker | Status |
| --- | --- | --- | --- | --- |
| Launch execution |  |  | role marker only | Hold |
| Monitoring |  |  | role marker only | Hold |
| Redaction review |  |  | role marker only | Hold |
| Production write guard |  |  | role marker only | Hold |
| Token exchange guard |  |  | role marker only | Hold |
| Workspace allowlist |  |  | role marker only | Hold |
| User role access |  |  | role marker only | Hold |
| Rollback |  |  | role marker only | Hold |
| Fallback verification |  |  | role marker only | Hold |

### 5.2 Pause Triggers

| Pause trigger | Detection method | Owner | Action | Status |
| --- | --- | --- | --- | --- |
| Raw token/code/state/nonce/full callback URL/secret appears. | Redaction search / visual review. | security-reviewer | Pause beta and quarantine artifact. | Hold |
| Production ConnectedAccount or Channel write attempted. | Guard output / audit review. | engineering-owner | Pause beta and run rollback. | Hold |
| Real Meta token exchange attempted. | Guard output / callback evidence. | engineering-owner | Pause beta and quarantine evidence. | Hold |
| Non-allowlisted workspace gains access. | Access monitoring. | operations-owner | Pause beta and clear allowlist. | Hold |
| Non-approved user role gains access. | Access monitoring. | operations-owner | Pause beta and revoke access. | Hold |
| Existing Instagram OAuth fallback unavailable. | Fallback check. | operations-owner | Pause beta and restore fallback. | Hold |
| Production login button / OAuth / callback / env / Prisma changes unexpectedly. | Diff / release review. | release-owner | Pause beta and block rollout. | Hold |
| Rollback cannot disable beta access. | Rollback drill. | operations-owner | Escalate No-Go. | Hold |

## 6. Launch-Time Redaction / Production Write Guard / Token Exchange Guard Checks

Run these checks during launch execution.

Targeted test command:

```bash
npx vitest run tests/meta-business-login-sandbox-sbl08.test.ts tests/meta-business-login-sandbox-sbl12-callback-capture.test.ts tests/meta-business-login-sandbox-sbl12-callback-route.test.ts tests/meta-business-login-sandbox-sbl13-workspace-linking-sync.test.ts
```

| Check | Required result | Actual result | Status | Evidence |
| --- | --- | --- | --- | --- |
| Targeted tests pass. | Pass |  | Hold |  |
| Redaction search has no unresolved findings. | Pass |  | Hold |  |
| Launch artifact output contains no raw token/code/state/nonce/full callback URL/secret. | Pass |  | Hold |  |
| Launch artifact output contains no unmasked asset ID or customer data. | Pass |  | Hold |  |
| Production ConnectedAccount write guard passes. | Pass |  | Hold |  |
| Production Channel write guard passes. | Pass |  | Hold |  |
| Token exchange guard passes. | Pass |  | Hold |  |
| `exchangeAttempted=false` evidence is present when applicable. | Pass |  | Hold |  |
| No token storage, refresh, or revocation lifecycle starts. | Pass |  | Hold |  |
| No webhook registration or production channel sync starts. | Pass |  | Hold |  |

Guard rule:

```text
If any launch-time guard fails, pause launch and execute rollback.
```

## 7. Fallback To Existing Instagram OAuth Flow Verification

| Check | Required result | Actual result | Owner | Status | Evidence |
| --- | --- | --- | --- | --- | --- |
| Existing Instagram OAuth connect path is reachable. | Pass |  | operations-owner | Hold |  |
| Production login button behavior is unchanged. | Pass |  | engineering-owner | Hold |  |
| Production OAuth authorize URL behavior is unchanged. | Pass |  | engineering-owner | Hold |  |
| Production callback route behavior is unchanged. | Pass |  | engineering-owner | Hold |  |
| Existing connected account / channel flow remains usable. | Pass |  | operations-owner | Hold |  |
| Fallback evidence contains no raw sensitive values. | Pass |  | security-reviewer | Hold |  |

Fallback rule:

```text
Internal beta cannot launch if the existing Instagram OAuth fallback is unavailable or altered.
```

## 8. Launch Execution Timeline

| Step | Action | Owner | Expected result | Actual result | Status |
| --- | --- | --- | --- | --- | --- |
| 1 | Confirm authorization memo is Go. | release-owner | Go |  | Hold |
| 2 | Confirm final package gate review is Pass. | release-owner | Pass |  | Hold |
| 3 | Confirm monitoring and rollback owners. | operations-owner | Assigned |  | Hold |
| 4 | Enable workspace allowlist. | operations-owner | Approved workspaces only |  | Hold |
| 5 | Enable user role access. | operations-owner | Approved users only |  | Hold |
| 6 | Verify internal-only entry point. | engineering-owner | Internal-only |  | Hold |
| 7 | Run launch-time targeted tests. | engineering-owner | Pass |  | Hold |
| 8 | Run launch-time redaction checks. | security-reviewer | Pass |  | Hold |
| 9 | Verify fallback flow. | operations-owner | Pass |  | Hold |
| 10 | Start monitoring window. | monitoring-owner | Active |  | Hold |
| 11 | Record launch decision. | release-owner | Go / Hold / Rollback |  | Hold |

## 9. First 24 Hours Monitoring Backfill Fields

Fill these fields within 24 hours after launch starts.

| Monitoring field | Required data | Owner | Result | Status |
| --- | --- | --- | --- | --- |
| Launch start timestamp | Date / time | release-owner |  | Hold |
| Launch end of first 24h timestamp | Date / time | monitoring-owner |  | Hold |
| Workspaces monitored | Masked workspace markers only | operations-owner |  | Hold |
| Users monitored | Masked user markers only | operations-owner |  | Hold |
| Account selection UX result | Pass / Hold / Fail | app-review-owner |  | Hold |
| Consent screen result | Pass / Hold / Fail | app-review-owner |  | Hold |
| Callback evidence result | Pass / Hold / Fail | engineering-owner |  | Hold |
| Workspace linking dry-run result | Pass / Hold / Fail | engineering-owner |  | Hold |
| Channel sync dry-run result | Pass / Hold / Fail | engineering-owner |  | Hold |
| Redaction monitoring result | Pass / Hold / Fail | security-reviewer |  | Hold |
| Production write guard monitoring result | Pass / Hold / Fail | engineering-owner |  | Hold |
| Token exchange guard monitoring result | Pass / Hold / Fail | engineering-owner |  | Hold |
| Fallback health result | Pass / Hold / Fail | operations-owner |  | Hold |
| Pause trigger count | Number | monitoring-owner |  | Hold |
| Rollback executed? | Yes / No | rollback-owner |  | Hold |
| Open issues | Issue IDs or none | monitoring-owner |  | Hold |
| Required follow-up | Plain text | release-owner |  | Hold |

24-hour rule:

```text
Internal beta cannot be considered stable until the first 24-hour monitoring backfill is complete and all unresolved issues are owned.
```

## 10. Rollback Execution Record

Use this table if launch pauses or rolls back.

| Rollback step | Required result | Actual result | Owner | Status | Evidence |
| --- | --- | --- | --- | --- | --- |
| Disable internal-only entry point. | Beta blocked |  | rollback-owner | Hold |  |
| Clear or reduce workspace allowlist. | Non-approved workspaces blocked |  | operations-owner | Hold |  |
| Revoke non-required user role access. | Non-approved users blocked |  | operations-owner | Hold |  |
| Confirm existing Instagram OAuth fallback. | Available |  | operations-owner | Hold |  |
| Confirm no production write occurred. | Pass |  | engineering-owner | Hold |  |
| Confirm no token exchange occurred. | Pass |  | engineering-owner | Hold |  |
| Run redaction check on rollback evidence. | Pass |  | security-reviewer | Hold |  |
| Record rollback reason and follow-up. | Complete |  | release-owner | Hold |  |

Rollback rule:

```text
Rollback evidence must use masked markers and must not contain raw sensitive values.
```

## 11. Why Production Implementation Still Cannot Start

Production implementation remains No-Go after this runbook is created or filled.

Reasons:

- This runbook only covers internal beta launch execution, not production implementation.
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

## 12. Explicit Restrictions

Do not perform these actions while using or filling this runbook:

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

## 13. Documents To Backfill After Completion

After launch execution or launch hold review, backfill:

| Document | Required update |
| --- | --- |
| `docs/meta-business-login-internal-beta-launch-execution-runbook-template.md` | Fill launch execution, monitoring, pause trigger, fallback, and rollback results. |
| `docs/meta-business-login-internal-beta-launch-authorization-memo-template.md` | Link execution runbook and update launch result. |
| `docs/meta-business-login-internal-beta-release-sign-off-checklist.md` | Link launch execution result and any sign-off changes. |
| `docs/meta-business-login-internal-beta-final-package-gate-review-template.md` | Link launch execution status and package gate impact. |
| `docs/meta-business-login-internal-beta-artifact-redaction-review-checklist.md` | Link launch-time redaction checks. |
| `docs/meta-business-login-internal-beta-artifact-manifest-template.md` | Update launch artifact references if any evidence changes. |
| `docs/meta-business-login-internal-beta-real-evidence-execution-report-blank-run.md` | Link launch execution result. |
| `docs/meta-business-login-internal-beta-real-evidence-execution-plan.md` | Mark launch execution step Pass / Hold / Fail. |
| `docs/meta-business-login-internal-beta-evidence-execution-report-template.md` | Summarize launch execution and first monitoring outcome. |
| `docs/meta-business-login-internal-beta-release-decision-memo-template.md` | Add launch execution reference. |
| `docs/meta-business-login-internal-beta-monitoring-report-template.md` | Fill first 24-hour monitoring results if launch starts. |
| `docs/meta-business-login-internal-beta-closeout-report-template.md` | Fill only after beta closeout. |
| `docs/meta-business-login-final-app-review-package-assembly-checklist.md` | Update App Review preparation readiness. |
| `docs/meta-business-login-sandbox-go-no-go-checklist.md` | Update internal beta launch execution gate. |
| `docs/meta-app-review-checklist.md` | Update App Review readiness and internal beta launch status. |
| `docs/security-review.md` | Update launch-time redaction / guard security posture. |
| `docs/fix-roadmap.md` | Add remaining Hold / Fail blockers after current unrelated edits are resolved. |
| `docs/codex-session-log.md` | Add session result after current unrelated edits are resolved. |

## Final Runbook Template Status

```text
Launch execution runbook template: Ready
Launch execution started: No
First 24-hour monitoring completed: No
Internal beta launch authorization: Hold
App Review submission preparation: Hold
Production implementation: No-Go
```

