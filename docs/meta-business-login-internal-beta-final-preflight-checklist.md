# Meta Business Login Internal Beta Final Preflight Checklist

Date: 2026-06-16
Status: Draft preflight checklist / internal beta Hold / production implementation No-Go

## Scope

This checklist is the final preflight gate before releasing Meta Business Login / Instagram Business Login sandbox from internal beta Hold.

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
Do not run Supabase migration or db push for this preflight.
Before any future Supabase migration or db push, record current project_id, linked project, and Supabase account email, then wait for explicit confirmation.
```

Source documents:

```text
docs/meta-business-login-final-app-review-package-assembly-checklist.md
docs/meta-business-login-final-redaction-search-execution-report-template.md
docs/meta-business-login-final-reviewer-recording-shot-list.md
docs/meta-business-login-final-permission-usage-proof-matrix.md
docs/meta-business-login-sandbox-internal-beta-access-rollback-runbook.md
```

## 1. Preflight Metadata

```text
Preflight date:
Executor:
Reviewer:
Branch / commit:
Internal beta package version:
App Review package version:
Redaction report version:
Reviewer recording version:
Screenshot package version:
Permission proof matrix version:
Test asset proof version:
Rollback / fallback proof version:
Final decision owner:
```

Initial decision:

```text
Internal beta: Hold
Production implementation: No-Go
```

## 2. App Review Package Assembly Completion

The App Review package must be assembled before internal beta Hold can be released.

| Gate | Required result | Evidence | Status |
| --- | --- | --- | --- |
| Package inventory | Reviewer recording, screenshots, permission proof, redaction report, test asset proof, scope reconciliation, callback evidence, workspace linking dry-run, channel sync dry-run, and rollback proof are listed. | Package manifest / checklist row. | Hold |
| Package versioning | Every artifact has a version, owner, and review timestamp. | Assembly metadata. | Hold |
| Per-file gates | Each artifact passes source approval, redaction search, visual redaction, no-secret, no-unmasked-ID, no-real-customer-data, rollback, and sign-off gates. | Per-file gate table. | Hold |
| Scope reconciliation | Meta Dashboard scopes match the final permission proof matrix. | Scope reconciliation record. | Hold |
| Final sign-off | Product owner or designated reviewer approves internal beta package use. | Sign-off record. | Hold |

Decision:

```text
App Review package assembly complete: Go / Hold
Reason:
Required follow-up:
```

## 3. Redaction Report Pass Gate

The final redaction report must pass before internal beta starts.

| Gate | Required result | Evidence | Status |
| --- | --- | --- | --- |
| Token / secret search | No real access token, refresh token, app secret, client secret, webhook verify token, or credential appears. | Redaction report section. | Hold |
| Authorization code search | No raw authorization code appears. | Redaction report section. | Hold |
| Raw state / nonce search | No raw state or raw nonce appears. | Redaction report section. | Hold |
| Full callback URL search | No full callback URL with query parameters appears. | Redaction report section. | Hold |
| Unmasked asset ID search | No unmasked Business / Page / IG / workspace ID appears outside approved secure Meta fields. | Redaction report section. | Hold |
| Visual review | Recording and screenshots show no sensitive values, credentials, browser storage, or real customer data. | Manual visual review section. | Hold |
| Findings resolved | Every non-allowed finding is cleaned, excluded, or blocked before beta. | Finding record table. | Hold |

Decision:

```text
Final redaction report: Pass / Hold / No-Go
Reason:
Required follow-up:
```

## 4. Reviewer Recording / Screenshots / Permission Proof / Test Asset Proof

All reviewer-facing evidence must be complete and safe.

| Evidence area | Required result | Status |
| --- | --- | --- |
| Reviewer recording | Final recording follows the shot list, uses reviewer-safe test assets, and shows account selection, consent, redacted callback, workspace linking dry-run, channel sync dry-run, and product proof. | Hold |
| Screenshots | Screenshots are redacted and cover account selection, consent, product screens, callback evidence, workspace linking dry-run, and channel sync dry-run. | Hold |
| Permission proof | Every kept permission has product screen, user action, data read/write/store explanation, retention/deletion note, and reviewer proof. | Hold |
| Test asset proof | Business / Page / IG account, reviewer workspace, reviewer role, and test user proof are documented with masked identifiers. | Hold |
| Unsupported scopes | Content publish, insights, and any Facebook Login for Business scopes without proof are removed or deferred. | Hold |
| Customer data protection | No real customer messages, comments, account identifiers, credentials, OTP, cookies, localStorage, or sessionStorage appear. | Hold |

Decision:

```text
Reviewer recording: Pass / Hold
Screenshots: Pass / Hold
Permission proof: Pass / Hold
Test asset proof: Pass / Hold
Reason:
```

## 5. Internal-Only Access Controls

Internal beta can only open through a guarded internal entry point.

| Gate | Required result | Evidence | Status |
| --- | --- | --- | --- |
| Internal-only entry point | Entry point is not linked from the production login button or standard channel connect flow. | Route / access policy note. | Hold |
| Workspace allowlist | Only approved test workspaces can access the beta flow. | Allowlist record. | Hold |
| User role | Only approved admin / tester roles can start the beta flow. | Role policy record. | Hold |
| Audit safety | Audit entries use redacted markers only and exclude code/state/token/full callback URL. | Redaction report / audit sample. | Hold |
| No production discoverability | Public users cannot discover or start the beta path from production UI. | Manual access check. | Hold |

Decision:

```text
Internal-only entry point: Pass / Hold
Workspace allowlist: Pass / Hold
User / admin role: Pass / Hold
Reason:
```

## 6. Rollback / Fallback Gate

Rollback and fallback must pass before internal beta Hold can be released.

| Gate | Required result | Evidence | Status |
| --- | --- | --- | --- |
| Existing Instagram OAuth fallback | Existing production Instagram OAuth flow remains available and unchanged. | Fallback verification record. | Pass evidence exists, final beta verification Hold |
| Disable beta path | Internal beta can be disabled without deploy-time schema or env changes. | Disable procedure. | Hold |
| Clear allowlist | Workspace allowlist can be cleared or reduced quickly. | Allowlist rollback step. | Hold |
| Confirm no production writes | ConnectedAccount / Channel / webhook / token refresh production writes remain blocked. | Guard test output. | Hold |
| Token exchange must not happen | No real Meta token exchange occurs in sandbox/internal beta preflight. | Callback / log evidence. | Hold |
| Post-rollback verification | Fallback flow and production write guard are checked after rollback. | Retest record. | Hold |

Decision:

```text
Rollback / fallback: Pass / Hold
Reason:
Required follow-up:
```

## 7. Internal Beta Go / Hold Decision

Internal beta can move from Hold to Go only when every row below is Pass.

| Gate | Required result | Current status |
| --- | --- | --- |
| App Review package assembly | Final package is assembled, versioned, and approved. | Hold |
| Final redaction report | Search and visual review pass with all findings resolved. | Hold |
| Reviewer recording | Final recording is captured and approved. | Hold |
| Screenshots | Final screenshots are redacted and approved. | Hold |
| Permission proof | Every kept permission has reviewer-visible proof. | Hold |
| Test asset proof | Reviewer-safe Business / Page / IG / workspace assets are documented. | Hold |
| Scope reconciliation | Meta Dashboard scopes match the final permission matrix. | Hold |
| Internal-only entry point | Access is restricted and not production-discoverable. | Hold |
| Workspace allowlist | Approved beta workspace list exists. | Hold |
| User / admin role | Approved tester/admin role policy exists. | Hold |
| Rollback / fallback | Disable beta and fallback verification pass. | Hold |
| Production write guard | Production ConnectedAccount / Channel / webhook / sync / token refresh writes remain blocked. | Pass evidence exists, final beta verification Hold |
| Token exchange guard | Real Meta token exchange remains disabled for sandbox/internal beta preflight. | Pass evidence exists, final beta verification Hold |
| Product owner sign-off | Approval is recorded. | Hold |

Decision:

```text
Internal beta: Go / Hold
Reason:
Required follow-up:
```

Current recommendation:

```text
Internal beta: Hold
Reason: final package assembly, redaction execution, final recording, screenshot package, permission proof, test asset proof, access controls, rollback proof, and sign-off are not complete.
```

## 8. Why Production Implementation Still Cannot Start

Production implementation remains No-Go even if internal beta later becomes Go.

Reasons:

- App Review is not submitted or approved.
- Business Verification / Advanced Access status is not confirmed for the final scope set.
- Internal beta has not completed with evidence from real reviewer-safe test workspaces.
- Production env migration plan is not approved.
- No Supabase migration / db push has been reviewed or confirmed for this provider.
- Production callback behavior for real token exchange is not implemented or reviewed.
- Production ConnectedAccount / Channel writes remain intentionally blocked in sandbox.
- Real token storage, encryption, refresh, revocation, and expiry lifecycle are not approved for this provider.
- Webhook registration and channel sync lifecycle are not approved for real assets.
- Tenant isolation regression for real Business / Page / IG asset writes is not complete.
- Production rollback / monitoring plan is not complete.
- Existing Instagram OAuth fallback must remain available until a separate production implementation ADR is approved.

Decision:

```text
Production implementation: No-Go
```

## Final Preflight Decision

```text
Internal beta final preflight checklist: Draft complete
Internal beta: Hold
Production implementation: No-Go

Next step:
Assemble the actual final package, execute the redaction report, capture reviewer recording/screenshots, complete permission/test asset proof, verify internal-only access controls, and run rollback/fallback proof before asking for internal beta Go.
```
