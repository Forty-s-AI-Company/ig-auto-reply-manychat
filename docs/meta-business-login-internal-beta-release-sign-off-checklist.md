# Meta Business Login Internal Beta Release Sign-Off Checklist

Date: 2026-06-17
Status: Release sign-off checklist / internal beta Hold / App Review submission preparation Hold / production implementation No-Go

## Scope

This checklist records the release sign-off requirements for Meta Business Login / Instagram Business Login internal beta.

Source document:

```text
docs/meta-business-login-internal-beta-final-package-gate-review-template.md
```

This checklist does not approve internal beta by itself. Internal beta can become Go only after final package gate review passes, all required owners sign off, and every unresolved finding count is `0`.

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

## 1. Sign-Off Metadata

| Field | Value |
| --- | --- |
| Sign-off ID | `IBE-SIGNOFF-YYYYMMDD-NNN` |
| Run ID | `IBE-RUN-YYYYMMDD-NNN` |
| Final package gate review ID | `IBE-FP-GATE-YYYYMMDD-NNN` |
| Sign-off date |  |
| Sign-off status | Draft |
| Final package root | `meta-business-login-internal-beta-artifacts/IBE-RUN-YYYYMMDD-NNN/11_final_package/` |
| Final package gate review path | `docs/meta-business-login-internal-beta-final-package-gate-review-template.md` |
| Artifact manifest path | `docs/meta-business-login-internal-beta-artifact-manifest-template.md` |
| Redaction review checklist path | `docs/meta-business-login-internal-beta-artifact-redaction-review-checklist.md` |
| Redaction execution report path |  |
| Evidence execution report path |  |
| Release decision memo path |  |
| Internal beta decision | Hold |
| Production implementation decision | No-Go |

## 2. Product / Engineering / Security / App Review / Operations Sign-Off

Every role below must sign off before internal beta can become Go.

| Role | Required review area | Reviewer | Decision | Date | Required follow-up | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| Product owner | Permission proof, product-screen proof, kept scope justification, UX readiness. |  | Hold |  |  |  |
| Engineering owner | Sandbox-only behavior, internal-only entry point, guards, dry-run mapping, test results. |  | Hold |  |  |  |
| Security reviewer | Redaction, unresolved finding count, artifact package safety, token/code/secret handling. |  | Hold |  |  |  |
| App Review owner | Reviewer recording, screenshots, permission usage proof, test asset proof, scope reconciliation. |  | Hold |  |  |  |
| Operations owner | Workspace allowlist, reviewer user/role, rollback, fallback, monitoring readiness. |  | Hold |  |  |  |
| Release owner | Final package gate decision, cross-role sign-off completeness, Go / Hold release decision. |  | Hold |  |  |  |

Allowed decision values:

```text
Go
Hold
No-Go
Not reviewed
```

Sign-off rule:

```text
Internal beta can become Go only when product, engineering, security, App Review, operations, and release owner decisions are all Go.
```

## 3. Final Package Gate Review Pass Check

| Gate | Required result | Actual result | Status |
| --- | --- | --- | --- |
| Final package metadata is complete. | Pass |  | Hold |
| Artifact manifest references are exact and versioned. | Pass |  | Hold |
| All required artifacts exist in final package. | Pass |  | Hold |
| Every packaged artifact has Redaction gate=Pass. | Pass |  | Hold |
| Every packaged artifact has unresolved finding count `0`. | Pass |  | Hold |
| Reviewer recording gate passes. | Pass |  | Hold |
| Screenshots gate passes. | Pass |  | Hold |
| Permission proof gate passes. | Pass |  | Hold |
| Test asset proof gate passes. | Pass |  | Hold |
| Callback evidence gate passes. | Pass |  | Hold |
| Workspace linking dry-run gate passes. | Pass |  | Hold |
| Channel sync dry-run gate passes. | Pass |  | Hold |
| Guard test output gate passes. | Pass |  | Hold |
| Rollback / fallback artifact is present and redaction-passed. | Pass |  | Hold |
| Quarantine / excluded artifacts have no unresolved gate impact. | Pass |  | Hold |
| Required owners and reviewers signed off. | Pass |  | Hold |

Final package gate rule:

```text
If any final package gate is Hold or Fail, internal beta remains Hold.
```

## 4. Redaction / Unresolved Finding Count Pass Check

| Area | Required result | Actual result | Status |
| --- | --- | --- | --- |
| Redaction execution report is complete. | Pass |  | Hold |
| Reviewer recording unresolved finding count is `0`. | Pass |  | Hold |
| Screenshot package unresolved finding count is `0`. | Pass |  | Hold |
| Permission proof unresolved finding count is `0`. | Pass |  | Hold |
| Test asset proof unresolved finding count is `0`. | Pass |  | Hold |
| Callback evidence unresolved finding count is `0`. | Pass |  | Hold |
| Workspace linking dry-run unresolved finding count is `0`. | Pass |  | Hold |
| Channel sync dry-run unresolved finding count is `0`. | Pass |  | Hold |
| Guard test output unresolved finding count is `0`. | Pass |  | Hold |
| Rollback / fallback proof unresolved finding count is `0`. | Pass |  | Hold |
| Quarantine register has no unresolved required artifact. | Pass |  | Hold |
| Final package contains no raw token/code/state/nonce/full callback URL/secret. | Pass |  | Hold |
| Final package contains no unmasked asset ID or customer data. | Pass |  | Hold |

Redaction rule:

```text
Any unresolved real finding keeps internal beta at Hold.
```

## 5. Rollback / Fallback / Production Write Guard / Token Exchange Guard Pass Check

| Guard | Required result | Actual result | Status |
| --- | --- | --- | --- |
| Rollback proof exists and is redaction-passed. | Pass |  | Hold |
| Internal beta can be disabled without env change. | Pass |  | Hold |
| Workspace allowlist can be cleared or reduced. | Pass |  | Hold |
| Existing Instagram OAuth fallback remains available. | Pass |  | Hold |
| Production login button remains unchanged. | Pass |  | Hold |
| Production OAuth flow remains unchanged. | Pass |  | Hold |
| Callback route remains unchanged except previously approved sandbox guard behavior. | Pass |  | Hold |
| Production ConnectedAccount write guard passes. | Pass |  | Hold |
| Production Channel write guard passes. | Pass |  | Hold |
| Token exchange guard passes. | Pass |  | Hold |
| `exchangeAttempted=false` evidence is present for sandbox callback capture when applicable. | Pass |  | Hold |
| No real Meta token exchange occurred. | Pass |  | Hold |
| No real token storage, refresh, or revocation lifecycle started. | Pass |  | Hold |
| No webhook registration or production channel sync started. | Pass |  | Hold |

Guard rule:

```text
Rollback, fallback, production write guard, and token exchange guard must all be Pass before internal beta can become Go.
```

## 6. Internal Beta Go / Hold Sign-Off Conditions

### 6.1 Go Conditions

Internal beta can become Go only when all conditions below are true:

| Condition | Required result | Actual result | Status |
| --- | --- | --- | --- |
| Product owner signs Go. | Go |  | Hold |
| Engineering owner signs Go. | Go |  | Hold |
| Security reviewer signs Go. | Go |  | Hold |
| App Review owner signs Go. | Go |  | Hold |
| Operations owner signs Go. | Go |  | Hold |
| Release owner signs Go. | Go |  | Hold |
| Final package gate review is Pass. | Pass |  | Hold |
| Redaction report is Pass. | Pass |  | Hold |
| Unresolved finding count is `0` across every packaged artifact. | Pass |  | Hold |
| Rollback / fallback readiness is Pass. | Pass |  | Hold |
| Production write guard is Pass. | Pass |  | Hold |
| Token exchange guard is Pass. | Pass |  | Hold |
| Internal-only access, workspace allowlist, and user role gates are Pass. | Pass |  | Hold |
| App Review package artifacts are reviewer-safe. | Pass |  | Hold |

### 6.2 Hold Conditions

Internal beta remains Hold if any condition below is true:

- Any required role decision is Hold, No-Go, or Not reviewed.
- Final package gate review is Hold or Fail.
- Redaction report is incomplete or has unresolved findings.
- Any artifact has Redaction gate=Hold or Fail.
- Any artifact has unresolved finding count greater than `0`.
- Any required artifact is missing, unversioned, unowned, unreviewed, quarantined, or excluded without replacement.
- Rollback / fallback proof is missing or incomplete.
- Production write guard fails or is not verified.
- Token exchange guard fails or is not verified.
- Any raw token/code/state/nonce/full callback URL/secret appears in package artifacts.
- Any unmasked asset ID or real customer data appears in package artifacts.

## 7. Internal Beta Go Restrictions

If internal beta becomes Go, it remains limited by these restrictions:

- Internal-only entry point only.
- Workspace allowlist only.
- Approved tester/admin users only.
- Dry-run-first evidence collection remains required.
- No production login button change.
- No production OAuth flow replacement.
- No production callback route replacement.
- No env change unless separately approved in a later task.
- No Prisma schema change.
- No Supabase migration or db push.
- No real Meta token exchange unless a later approved task explicitly changes the boundary.
- No production ConnectedAccount / Channel writes from this beta sign-off.
- Existing Instagram OAuth fallback must remain available.
- Redaction search must run after every evidence package update.
- Any guard failure pauses beta immediately.

Internal beta Go does not mean production implementation Go.

## 8. Internal Beta Hold Required Fixes

If internal beta remains Hold, fill this required-fix register.

| Fix ID | Blocking gate | Required fix | Owner | Due date | Retest required | Status |
| --- | --- | --- | --- | --- | --- | --- |
| IBE-HOLD-001 |  |  |  |  | Yes | Open |
| IBE-HOLD-002 |  |  |  |  | Yes | Open |
| IBE-HOLD-003 |  |  |  |  | Yes | Open |

Hold remediation rule:

```text
Every Hold item must have owner, fix, retest evidence, and updated sign-off before internal beta can be reconsidered.
```

## 9. Production Implementation Still Cannot Start

Production implementation remains No-Go after this checklist is created or filled.

Reasons:

- This checklist only signs off internal beta readiness, not production implementation.
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

## 10. Explicit Restrictions

Do not perform these actions while using or filling this checklist:

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

## 11. Documents To Backfill After Completion

After release sign-off is executed, backfill:

| Document | Required update |
| --- | --- |
| `docs/meta-business-login-internal-beta-release-sign-off-checklist.md` | Fill sign-off decisions, final Go / Hold decision, and required fixes. |
| `docs/meta-business-login-internal-beta-final-package-gate-review-template.md` | Link release sign-off decision and update final gate outcome. |
| `docs/meta-business-login-internal-beta-artifact-redaction-review-checklist.md` | Link final sign-off and unresolved finding count. |
| `docs/meta-business-login-internal-beta-artifact-manifest-template.md` | Update final package references and sign-off status. |
| `docs/meta-business-login-internal-beta-real-evidence-execution-report-blank-run.md` | Link sign-off checklist and final internal beta decision. |
| `docs/meta-business-login-internal-beta-real-evidence-execution-plan.md` | Mark release sign-off step Pass / Hold / Fail. |
| `docs/meta-business-login-internal-beta-evidence-execution-report-template.md` | Summarize sign-off results. |
| `docs/meta-business-login-internal-beta-release-decision-memo-template.md` | Use sign-off result for release decision. |
| `docs/meta-business-login-internal-beta-launch-checklist.md` | Fill only if internal beta becomes Go. |
| `docs/meta-business-login-final-app-review-package-assembly-checklist.md` | Update package readiness status. |
| `docs/meta-business-login-sandbox-go-no-go-checklist.md` | Update internal beta release sign-off gate. |
| `docs/meta-app-review-checklist.md` | Update App Review readiness and beta sign-off status. |
| `docs/security-review.md` | Update security sign-off and residual risk. |
| `docs/fix-roadmap.md` | Add remaining Hold / Fail blockers after current unrelated edits are resolved. |
| `docs/codex-session-log.md` | Add session result after current unrelated edits are resolved. |

## Final Checklist Status

```text
Release sign-off checklist: Ready
Release sign-off executed: No
Final package gate review passed: No
All role sign-offs complete: No
Internal beta: Hold
App Review submission preparation: Hold
Production implementation: No-Go
```

