# Meta Business Login Internal Beta Real Evidence Execution Plan

Date: 2026-06-16
Status: Real evidence execution plan / internal beta Hold / App Review submission preparation Hold / production implementation No-Go

## Scope

This plan defines the first real artifact evidence execution sequence for Meta Business Login / Instagram Business Login internal beta review.

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
Do not run Supabase migration or db push for this evidence execution plan.
Before any future Supabase migration or db push, record current project_id, linked project, and Supabase account email, then wait for explicit confirmation.
```

Source documents:

```text
docs/meta-business-login-internal-beta-doc-index.md
docs/meta-business-login-final-app-review-package-assembly-checklist.md
```

Related execution templates:

```text
docs/meta-business-login-final-redaction-search-execution-report-template.md
docs/meta-business-login-internal-beta-evidence-collection-runbook.md
docs/meta-business-login-internal-beta-evidence-execution-report-template.md
docs/meta-business-login-internal-beta-release-decision-memo-template.md
docs/meta-business-login-internal-beta-launch-checklist.md
docs/meta-business-login-internal-beta-monitoring-report-template.md
docs/meta-business-login-internal-beta-closeout-report-template.md
```

## 1. Real Artifact Collection List

Collect these real artifacts before requesting internal beta Go.

| Artifact | Required content | Source / location | Owner | Version | Redaction gate |
| --- | --- | --- | --- | --- | --- |
| Reviewer recording | End-to-end reviewer-safe recording covering account selection, consent, redacted callback, workspace linking dry-run, channel sync dry-run, and product proof. | Final recording package | App Review owner |  | Manual visual review + final redaction report |
| Screenshot package | Account selection, consent, product screens, callback evidence, workspace linking dry-run, channel sync dry-run, rollback / fallback proof. | Final screenshot package | App Review owner |  | Manual visual review + final redaction report |
| Permission proof matrix | Final kept scope proof with product screen, user action, data read/write/store, retention/deletion, reviewer proof. | `docs/meta-business-login-final-permission-usage-proof-matrix.md` or finalized copy | Product owner |  | Scope reconciliation + evidence review |
| Test asset proof | Masked Business / Page / IG account, reviewer workspace, reviewer role, test user proof. | Test asset proof package | Operations owner |  | No credentials, OTP, raw IDs, or customer data |
| Meta Dashboard scope reconciliation | Current Dashboard scopes matched to permission proof. | Redacted reconciliation record | App Review owner |  | No dashboard secret or unapproved scope |
| Redacted callback evidence | Sandbox callback capture with redacted code/state/callback URL and guard flags. | Callback evidence package | Engineering owner |  | No raw code/state/nonce/full callback URL/token/secret |
| Workspace linking dry-run evidence | Workspace and ConnectedAccount draft mapping without writes. | Dry-run evidence package | Engineering owner |  | Hashed / masked workspace and asset markers |
| Channel sync dry-run evidence | Channel draft and dry-run sync checks without production sync. | Dry-run evidence package | Engineering owner |  | No token/code/secret/state/callback URL |
| Production write guard test output | Targeted SBL tests proving no production write. | Local / CI test output | Engineering owner |  | Search for raw sensitive values |
| Token exchange guard evidence | Evidence showing no real token exchange. | Callback and test output | Engineering owner |  | `exchangeAttempted=false` only |
| Rollback / fallback proof | Disable beta, clear allowlist, fallback available, login button unchanged, no env/schema rollback needed. | Rollback proof package | Operations owner |  | No secrets / no customer data |
| Redaction execution report | Search and visual review results across final artifacts. | Final redaction report | Security reviewer |  | Must be Pass before Go |

## 2. Artifact Owner / Version / Redaction Gate

Use this tracker while collecting artifacts.

| Artifact ID | Artifact | Owner | Version | Stored location | Redaction gate status | Package status |
| --- | --- | --- | --- | --- | --- | --- |
| IBE-ART-01 | Reviewer recording | App Review owner |  |  | Hold | Not packaged |
| IBE-ART-02 | Screenshot package | App Review owner |  |  | Hold | Not packaged |
| IBE-ART-03 | Permission proof matrix | Product owner |  |  | Hold | Not packaged |
| IBE-ART-04 | Test asset proof | Operations owner |  |  | Hold | Not packaged |
| IBE-ART-05 | Scope reconciliation | App Review owner |  |  | Hold | Not packaged |
| IBE-ART-06 | Redacted callback evidence | Engineering owner |  |  | Hold | Not packaged |
| IBE-ART-07 | Workspace linking dry-run evidence | Engineering owner |  |  | Hold | Not packaged |
| IBE-ART-08 | Channel sync dry-run evidence | Engineering owner |  |  | Hold | Not packaged |
| IBE-ART-09 | Guard test output | Engineering owner |  |  | Hold | Not packaged |
| IBE-ART-10 | Rollback / fallback proof | Operations owner |  |  | Hold | Not packaged |
| IBE-ART-11 | Redaction execution report | Security reviewer |  |  | Hold | Not packaged |

Required gate rule:

```text
No artifact enters the internal beta / App Review package unless its redaction gate is Pass.
```

## 3. Reviewer Recording / Screenshots / Permission Proof / Test Asset Proof Order

Collect visual and proof artifacts in this order:

1. Confirm reviewer workspace and test user are approved.
2. Confirm test Business / Page / IG assets are reviewer-safe and masked in documentation.
3. Reconcile current Meta Dashboard scopes against the permission proof matrix.
4. Remove or defer unsupported scopes before recording.
5. Capture reviewer recording from a test workspace only.
6. Capture account selection and consent screenshots without address-bar secrets.
7. Capture redacted callback evidence screenshot or exported redacted JSON.
8. Capture workspace linking dry-run evidence.
9. Capture channel sync dry-run evidence.
10. Capture product screens for each kept permission.
11. Capture rollback / fallback evidence.
12. Run manual visual review on all recordings and screenshots.
13. Update package assembly tracker with artifact version and reviewer.

Required visual exclusions:

- Raw authorization code.
- Raw state.
- Raw nonce.
- Full callback URL.
- Access token or refresh token.
- App secret, client secret, or webhook verify token.
- Cookies, localStorage, sessionStorage, credentials, or OTP.
- Unmasked Business / Page / IG / workspace identifiers.
- Real customer messages or comments.

## 4. Redaction Report Execution Order

Run redaction after the real artifacts are collected and before internal beta Go review.

1. Freeze package artifact versions.
2. Run text searches against repository docs, tests, and source.
3. Run text searches against exported reports, terminal output, CI output, logs, and audit exports.
4. Manually review recordings and screenshots.
5. Classify false positives as redacted markers, synthetic fixtures, command examples, or generic field names only.
6. Clean or exclude every real sensitive finding.
7. Re-run the exact failed search or visual review.
8. Re-run the full required search set.
9. Fill `docs/meta-business-login-final-redaction-search-execution-report-template.md`.
10. Link the completed redaction report in the evidence execution report.

Required search categories:

```text
Token / secret search
Authorization code search
Raw state / nonce search
Full callback URL search
Unmasked Meta asset ID search
Recording visual review
Screenshot visual review
Log / audit / test output review
```

Decision rule:

```text
Any unresolved real token, code, secret, raw state, raw nonce, full callback URL, unmasked asset ID, browser storage, credential, OTP, or customer data keeps internal beta at Hold.
```

## 5. Internal-Only Access / Allowlist / Role / Rollback / Guard Test Order

Run these checks after artifact collection and before release decision memo sign-off.

Access control checks:

1. Confirm the internal beta entry point is not linked from the production login button.
2. Confirm it is not reachable from the standard production channel connect flow.
3. Confirm approved workspace can access the beta flow.
4. Confirm non-allowlisted workspace is blocked.
5. Confirm approved admin / tester role can access the beta flow.
6. Confirm non-approved user role is blocked.
7. Confirm access-control audit records use redacted markers only.

Rollback / fallback checks:

1. Document how to disable the internal beta entry point.
2. Document how to clear or reduce the workspace allowlist.
3. Verify the existing Instagram OAuth fallback remains available.
4. Verify the production login button remains unchanged.
5. Verify rollback does not require env or Prisma schema changes.
6. Perform post-rollback verification: beta blocked and fallback available.

Guard checks:

1. Run targeted SBL tests.
2. Confirm `exchangeAttempted=false`.
3. Confirm production ConnectedAccount writes are false.
4. Confirm production Channel writes are false.
5. Confirm webhook writes are false.
6. Confirm channel sync starts are false.
7. Confirm token refresh / token storage writes are false.
8. Search guard output for raw token/code/state/nonce/full callback URL.

Targeted test command:

```bash
npx vitest run tests/meta-business-login-sandbox-sbl08.test.ts tests/meta-business-login-sandbox-sbl12-callback-capture.test.ts tests/meta-business-login-sandbox-sbl12-callback-route.test.ts tests/meta-business-login-sandbox-sbl13-workspace-linking-sync.test.ts
```

## 6. Templates To Fill After Execution

Fill these templates after the real artifact evidence run:

| Template | When to fill | Required result before next stage |
| --- | --- | --- |
| `docs/meta-business-login-final-redaction-search-execution-report-template.md` | After artifact collection and searches. | Pass |
| `docs/meta-business-login-internal-beta-evidence-execution-report-template.md` | After evidence execution. | Every gate Pass |
| `docs/meta-business-login-internal-beta-release-decision-memo-template.md` | After evidence execution report. | Go or Hold decision signed |
| `docs/meta-business-login-internal-beta-launch-checklist.md` | Only if release decision is Go. | Launch or Hold |
| `docs/meta-business-login-internal-beta-monitoring-report-template.md` | Only if internal beta launches. | Continue / Pause / End |
| `docs/meta-business-login-internal-beta-closeout-report-template.md` | After monitoring or beta stop. | App Review prep Go / Hold |
| `docs/meta-business-login-sandbox-go-no-go-checklist.md` | After each gate decision. | Latest stage status |
| `docs/meta-app-review-checklist.md` | After evidence and App Review prep decisions. | Latest App Review readiness |
| `docs/security-review.md` | After redaction / guard / launch / closeout decisions. | Latest security posture |

## 7. Internal Beta Go / Hold Decision

Internal beta can become Go only if all gates below are Pass.

| Gate | Required result | Current status |
| --- | --- | --- |
| Real artifact package assembled | All required artifacts are versioned and gated. | Hold |
| Redaction execution report | Completed with all findings resolved. | Hold |
| Reviewer recording | Captured and visually reviewed. | Hold |
| Screenshot package | Captured and visually reviewed. | Hold |
| Permission proof | Every kept scope has proof. | Hold |
| Test asset proof | Reviewer-safe assets documented. | Hold |
| Scope reconciliation | Dashboard scopes match final matrix. | Hold |
| Internal-only access | Entry point / allowlist / roles verified. | Hold |
| Rollback / fallback | Disable and fallback proof verified. | Hold |
| Production write guard | Final guard tests pass. | Hold |
| Token exchange guard | No real token exchange. | Hold |
| Product owner / engineering / security / App Review / operations sign-off | All sign-offs recorded. | Hold |

Decision rule:

```text
Internal beta: Go only when every gate is Pass.
Any Hold, Fail, No-Go, unresolved finding, missing sign-off, or unreviewed artifact keeps internal beta at Hold.
```

Current decision:

```text
Internal beta: Hold
```

## 8. Why Production Implementation Still Cannot Start

Production implementation remains No-Go even if this real evidence execution plan is completed.

Reasons:

- App Review is not submitted or approved.
- Business Verification / Advanced Access status is not confirmed for the final scope set.
- Internal beta has not yet moved from Hold to Go.
- Internal beta has not launched, monitored, or closed out.
- App Review submission preparation is still Hold.
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

Do not perform these actions during this planning task:

- Do not run Supabase migration.
- Do not run Supabase `db push`.
- Do not modify the production OAuth flow.
- Do not modify the callback route.
- Do not modify the login button.
- Do not modify environment variables.
- Do not modify Prisma schema.
- Do not create or update production ConnectedAccount / Channel records.
- Do not perform real Meta token exchange.
- Do not write raw token, authorization code, raw state, raw nonce, full callback URL, app secret, client secret, webhook verify token, cookie, localStorage, sessionStorage, unmasked asset ID, or real customer data into docs, logs, audit, test output, screenshots, or recordings.

## 10. Backfill After Completion

After real evidence execution, backfill these documents:

| Document | Required update |
| --- | --- |
| `docs/meta-business-login-internal-beta-real-evidence-execution-plan.md` | Mark each execution step Pass / Hold / Fail. |
| `docs/meta-business-login-final-redaction-search-execution-report-template.md` | Fill actual redaction execution results. |
| `docs/meta-business-login-internal-beta-evidence-execution-report-template.md` | Fill real evidence results. |
| `docs/meta-business-login-internal-beta-release-decision-memo-template.md` | Record Go / Hold decision and sign-off. |
| `docs/meta-business-login-sandbox-go-no-go-checklist.md` | Update latest internal beta status. |
| `docs/meta-app-review-checklist.md` | Update App Review readiness and scope reconciliation status. |
| `docs/security-review.md` | Add security note for real evidence execution. |
| `docs/fix-roadmap.md` | Add remaining Hold / Fail / production blockers after current unrelated edits are resolved. |
| `docs/codex-session-log.md` | Add session result after current unrelated edits are resolved. |

## Final Execution Plan Decision

```text
Real evidence execution plan: Ready
Real evidence execution completed: No
Internal beta: Hold
App Review submission preparation: Hold
Production implementation: No-Go

Next step:
Execute this plan against real artifacts, fill the redaction and evidence execution templates, then request internal beta Go / Hold review.
```
