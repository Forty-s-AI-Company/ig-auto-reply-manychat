# Meta Business Login Internal Beta Real Artifact Collection Execution Checklist

Date: 2026-06-17
Status: Real artifact collection execution checklist / internal beta Hold / App Review submission preparation Hold / production implementation No-Go

## Scope

This checklist turns the current Meta Business Login / Instagram Business Login internal beta evidence plan into an executable artifact collection workflow.

Source documents:

```text
docs/meta-business-login-final-doc-index-and-production-decision-map.md
docs/meta-business-login-internal-beta-real-evidence-execution-plan.md
docs/meta-business-login-internal-beta-artifact-folder-structure-spec.md
docs/meta-business-login-internal-beta-artifact-manifest-template.md
```

This checklist does not approve internal beta, App Review submission preparation, or production implementation.

This checklist does not change:

- Product functionality code.
- OAuth flow.
- Callback route.
- Login button.
- Environment variables.
- Prisma schema.
- Supabase migration state.
- Production ConnectedAccount / Channel records.
- Real Meta token exchange.

Supabase safety rule:

```text
Do not run Supabase migration or db push for this checklist.
Before any future Supabase migration or db push, first show current project_id, linked project, and Supabase account email, then wait for explicit confirmation.
```

Sensitive data rule:

```text
Do not store raw token, authorization code, raw state, raw nonce, full callback URL, app secret, client secret, webhook verify token, API key, database URL, Supabase key, cookie, browser storage, credential, OTP, unmasked asset ID, or real customer data in artifacts, docs, logs, audit output, test output, screenshots, or recordings.
```

## 1. Run Setup Checklist

Create one immutable collection run before gathering artifacts.

| Check | Required value | Actual value | Status |
| --- | --- | --- | --- |
| Run ID assigned. | `IBE-RUN-YYYYMMDD-NNN` |  | Hold |
| Run owner assigned. | Role marker only |  | Hold |
| Release owner assigned. | Role marker only |  | Hold |
| Security reviewer assigned. | Role marker only |  | Hold |
| App Review owner assigned. | Role marker only |  | Hold |
| Product owner assigned. | Role marker only |  | Hold |
| Operations owner assigned. | Role marker only |  | Hold |
| Engineering owner assigned. | Role marker only |  | Hold |
| Artifact root selected. | `meta-business-login-internal-beta-artifacts/{run_id}/` |  | Hold |
| Manifest version selected. | `v01` or later |  | Hold |
| Final package folder empty at run start. | Yes |  | Hold |
| Quarantine folder exists. | Yes |  | Hold |
| Internal beta decision before run. | Hold | Hold | Pass |
| App Review submission preparation before run. | Hold | Hold | Pass |
| Production implementation before run. | No-Go | No-Go | Pass |

Run safety assertion:

```text
This run must not modify production OAuth, callback, login button, env, Prisma schema, Supabase migration state, production ConnectedAccount / Channel records, or perform real Meta token exchange.
```

## 2. Artifact Collection Checklist

Collect artifacts in this order. Do not move any artifact into `11_final_package/` until the redaction gate is Pass.

| Step | Artifact ID | Artifact | Required output | Owner | Reviewer | Initial storage | Redaction gate before package |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | IBE-ART-04 | Test asset proof | Masked reviewer workspace, test user, Meta Business, Page, IG account, role, and fallback asset proof. | operations-owner | security-reviewer | `04_test_asset_proof/` | Hold |
| 2 | IBE-ART-05 | Scope reconciliation | Current Meta Dashboard scopes matched to final permission proof matrix. | app-review-owner | product-owner | `03_permission_proof/scope_reconciliation/` | Hold |
| 3 | IBE-ART-03 | Permission proof matrix | Final kept scope proof with product screen, user action, read/write/store behavior, retention/deletion, and reviewer proof. | product-owner | app-review-owner | `03_permission_proof/` | Hold |
| 4 | IBE-ART-01 | Reviewer recording | End-to-end reviewer-safe recording covering account selection, consent, redacted callback, dry-run mapping, channel sync, permission proof, rollback/fallback. | app-review-owner | security-reviewer | `01_reviewer_recording/draft_review_required/` | Hold |
| 5 | IBE-ART-02 | Screenshot package | Account selection, consent, product screens, callback evidence, workspace linking dry-run, channel sync dry-run, fallback proof. | app-review-owner | security-reviewer | `02_screenshots/` | Hold |
| 6 | IBE-ART-06 | Redacted callback evidence | Redacted callback capture with no raw code/state/nonce/full callback URL/token/secret. | engineering-owner | security-reviewer | `05_callback_evidence/` | Hold |
| 7 | IBE-ART-07 | Workspace linking dry-run evidence | Sandbox provider, workspace marker, ConnectedAccount draft mapping, and no production write proof. | engineering-owner | security-reviewer | `06_workspace_linking_dry_run/` | Hold |
| 8 | IBE-ART-08 | Channel sync dry-run evidence | Channel draft and sync payload without production sync, token storage, or webhook writes. | engineering-owner | security-reviewer | `07_channel_sync_dry_run/` | Hold |
| 9 | IBE-ART-09 | Production write guard output | Targeted SBL test output proving no production ConnectedAccount / Channel write. | engineering-owner | security-reviewer | `08_guard_test_output/` | Hold |
| 10 | IBE-ART-10 | Token exchange guard evidence | Evidence showing no real Meta token exchange and no token storage. | engineering-owner | security-reviewer | `08_guard_test_output/` | Hold |
| 11 | IBE-ART-11 | Rollback / fallback proof | Disable beta, clear/reduce allowlist, fallback available, no env/schema rollback required. | operations-owner | release-owner | `09_rollback_fallback/` | Hold |
| 12 | IBE-ART-12 | Redaction execution report | Final search and visual review results across all package candidates. | security-reviewer | release-owner | `10_redaction_report/` | Hold |

Collection rule:

```text
If any artifact contains or may contain sensitive data, move it to quarantine_do_not_package/ and create a new sanitized version.
```

## 3. Artifact Filename, Owner, Version, And Manifest Reference

Every artifact must use the folder structure spec naming format:

```text
{run_id}_{artifact_id}_{artifact_type}_{scope_or_area}_{owner}_{version}_{redaction_status}.{ext}
```

Use this execution tracker during collection:

| Artifact ID | Artifact type | Scope / area | Owner | Reviewer | Version | Filename | Manifest row updated? | Redaction status | Final package path |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| IBE-ART-01 | reviewer-recording | end-to-end-demo | app-review-owner | security-reviewer |  |  | No | Hold |  |
| IBE-ART-02 | screenshot-package | visual-proof | app-review-owner | security-reviewer |  |  | No | Hold |  |
| IBE-ART-03 | permission-proof | scope-matrix | product-owner | app-review-owner |  |  | No | Hold |  |
| IBE-ART-04 | test-asset-proof | reviewer-assets | operations-owner | security-reviewer |  |  | No | Hold |  |
| IBE-ART-05 | scope-reconciliation | meta-dashboard | app-review-owner | product-owner |  |  | No | Hold |  |
| IBE-ART-06 | callback-evidence | redacted-callback-json | engineering-owner | security-reviewer |  |  | No | Hold |  |
| IBE-ART-07 | workspace-linking-dry-run | draft-mapping | engineering-owner | security-reviewer |  |  | No | Hold |  |
| IBE-ART-08 | channel-sync-dry-run | dry-run-payload | engineering-owner | security-reviewer |  |  | No | Hold |  |
| IBE-ART-09 | guard-test-output | targeted-tests | engineering-owner | security-reviewer |  |  | No | Hold |  |
| IBE-ART-10 | token-exchange-guard | no-exchange | engineering-owner | security-reviewer |  |  | No | Hold |  |
| IBE-ART-11 | rollback-fallback-proof | rollback | operations-owner | release-owner |  |  | No | Hold |  |
| IBE-ART-12 | redaction-report | final-package | security-reviewer | release-owner |  |  | No | Hold |  |

Manifest reference rule:

```text
Every artifact must be recorded in docs/meta-business-login-internal-beta-artifact-manifest-template.md or the copied run manifest before it can support an internal beta Go decision.
```

## 4. Reviewer Recording And Screenshot Collection Steps

### 4.1 Reviewer Recording

| Step | Required capture | Required redaction handling | Status |
| --- | --- | --- | --- |
| 1 | Start from reviewer-safe test workspace. | Mask workspace and user markers. | Hold |
| 2 | Show internal-only beta entry point. | Do not show private links, cookies, or browser storage. | Hold |
| 3 | Show Business / Page / IG account selection. | Mask account identifiers and any personal/private account data. | Hold |
| 4 | Show consent screen. | Do not expose secrets, browser credentials, or private profile data. | Hold |
| 5 | Show redacted callback evidence. | Show redacted JSON or masked screenshot only. | Hold |
| 6 | Show workspace linking dry-run evidence. | Use masked workspace and asset markers only. | Hold |
| 7 | Show channel sync dry-run evidence. | Do not show token/code/secret/state/callback URL. | Hold |
| 8 | Show product proof for each kept scope. | Use test data only. | Hold |
| 9 | Show rollback / fallback proof. | Keep existing Instagram OAuth fallback visible but do not expose credentials. | Hold |
| 10 | Stop recording and move draft into review folder. | Do not package until visual redaction Pass. | Hold |

### 4.2 Screenshots

| Screenshot group | Required evidence | Storage folder | Visual review required | Status |
| --- | --- | --- | --- | --- |
| Account selection | Business / Page / IG selection screen evidence. | `02_screenshots/account_selection/` | Yes | Hold |
| Consent | Consent screen evidence. | `02_screenshots/consent/` | Yes | Hold |
| Product proof | Product screens for kept permissions. | `02_screenshots/product_proof/` | Yes | Hold |
| Callback evidence | Redacted callback capture only. | `02_screenshots/callback_evidence/` | Yes | Hold |
| Workspace linking dry-run | Draft mapping and no-write evidence. | `02_screenshots/workspace_linking_dry_run/` | Yes | Hold |
| Channel sync dry-run | Dry-run payload and no-sync evidence. | `02_screenshots/channel_sync_dry_run/` | Yes | Hold |
| Rollback / fallback | Beta disable and existing OAuth fallback evidence. | `02_screenshots/rollback_fallback/` | Yes | Hold |

Visual exclusion rule:

```text
The address bar must not show OAuth callback query parameters, raw code, raw state, raw nonce, full callback URL, token, or secret.
```

## 5. Permission Proof And Test Asset Proof Steps

### 5.1 Permission Proof

| Scope / permission | Product screen proof | User action proof | Data read proof | Data write proof | Storage proof | Retention / deletion proof | Evidence status |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `instagram_business_basic` | Required | Required | Required | Not expected unless documented | Required if stored | Required | Hold |
| `instagram_business_manage_messages` | Required | Required | Required | Required only for reply / automation proof | Required if stored | Required | Hold |
| `instagram_business_manage_comments` | Required | Required | Required | Required only for comment automation proof | Required if stored | Required | Hold |
| `instagram_business_content_publish` | Required if kept | Required if kept | Required if kept | Required if kept | Required if stored | Required | Hold |
| `instagram_business_manage_insights` | Required if kept | Required if kept | Required | Usually read-only unless documented | Required if stored | Required | Hold |

Permission proof rule:

```text
Any scope without product screen proof, user action proof, data-use proof, and reviewer-safe evidence should be removed, deferred, or kept at Hold before App Review preparation.
```

### 5.2 Test Asset Proof

| Asset | Required proof | Masking rule | Status |
| --- | --- | --- | --- |
| Reviewer workspace | Workspace is internal beta allowlisted. | Use `workspace:masked-___`. | Hold |
| Reviewer user | User has approved tester/admin role. | Use `user:masked-___`. | Hold |
| Meta Business | Business asset is test/reviewer-safe. | Use `business:masked-___`. | Hold |
| Facebook Page | Page belongs to test asset set. | Use `page:masked-___`. | Hold |
| Instagram account | IG account is test/reviewer-safe and connected to eligible asset. | Use `ig:masked-___`. | Hold |
| Existing OAuth fallback | Current Instagram OAuth fallback remains available. | Do not expose credentials or callback query parameters. | Hold |

## 6. Callback, Workspace Linking, Channel Sync, And Guard Evidence Steps

| Area | Required evidence | Forbidden evidence | Status |
| --- | --- | --- | --- |
| Callback capture | Redacted JSON with callback type, provider marker, request marker, guard flags, and `exchangeAttempted=false`. | Raw code, raw state, raw nonce, full callback URL, token, secret. | Hold |
| Workspace linking dry-run | Sandbox provider, masked workspace marker, ConnectedAccount draft mapping, no production write. | Production ConnectedAccount write, raw asset ID, token. | Hold |
| Channel sync dry-run | Channel draft, dry-run sync payload, no production sync, no webhook write. | Production Channel write, webhook registration, token storage. | Hold |
| Production write guard | Test output proving ConnectedAccount / Channel / webhook / sync writes are false. | Any production write attempt. | Hold |
| Token exchange guard | Evidence showing `exchangeAttempted=false` and no token storage. | Real token exchange, access token, refresh token. | Hold |
| Rollback / fallback | Beta can be disabled and existing Instagram OAuth fallback stays available. | Env rollback, schema rollback, production OAuth mutation. | Hold |

Targeted test command for guard evidence:

```bash
npx vitest run tests/meta-business-login-sandbox-sbl08.test.ts tests/meta-business-login-sandbox-sbl12-callback-capture.test.ts tests/meta-business-login-sandbox-sbl12-callback-route.test.ts tests/meta-business-login-sandbox-sbl13-workspace-linking-sync.test.ts
```

## 7. Redaction Gate Execution Checklist

Run the final redaction gate after all artifact candidates are collected and before final packaging.

| Step | Required action | Result | Status |
| --- | --- | --- | --- |
| 1 | Freeze artifact versions. |  | Hold |
| 2 | Update manifest rows for every artifact. |  | Hold |
| 3 | Search docs and text artifacts for token/code/secret/state/nonce/callback URL patterns. |  | Hold |
| 4 | Search test output, CI output, logs, and audit exports. |  | Hold |
| 5 | Manually review reviewer recording. |  | Hold |
| 6 | Manually review screenshots. |  | Hold |
| 7 | Classify allowed false positives. |  | Hold |
| 8 | Quarantine every failed or uncertain artifact. |  | Hold |
| 9 | Create sanitized replacement versions. |  | Hold |
| 10 | Re-run failed searches or visual reviews. |  | Hold |
| 11 | Re-run the full final redaction search set. |  | Hold |
| 12 | Fill final redaction search execution report. |  | Hold |
| 13 | Mark artifact redaction gate Pass only when unresolved findings are zero. |  | Hold |

Allowed false positive categories:

```text
Redacted marker examples
Synthetic fixture names
Generic field names
Documentation examples without real values
```

Fail rule:

```text
Any unresolved real sensitive value keeps final package gate, internal beta, and App Review submission preparation at Hold.
```

## 8. Final Package Entry Checklist

Use this gate before copying each artifact into `11_final_package/`.

| Check | Required result | Actual result | Status |
| --- | --- | --- | --- |
| Artifact has exact artifact ID. | Yes |  | Hold |
| Artifact has exact filename. | Yes |  | Hold |
| Artifact has owner. | Yes |  | Hold |
| Artifact has reviewer. | Yes |  | Hold |
| Artifact has version. | `vNN` |  | Hold |
| Artifact is latest approved version. | Yes |  | Hold |
| Artifact source folder follows spec. | Yes |  | Hold |
| Manifest row is complete. | Yes |  | Hold |
| Visual review is Pass or not required. | Pass / Not required |  | Hold |
| Text search is Pass or not required. | Pass / Not required |  | Hold |
| Finding count is recorded. | Yes |  | Hold |
| Unresolved finding count is zero. | Yes |  | Hold |
| Redaction gate is Pass. | Pass |  | Hold |
| Package result is Packaged. | Packaged |  | Hold |
| Artifact has no raw sensitive values. | Pass |  | Hold |
| Artifact has no unmasked asset IDs or real customer data. | Pass |  | Hold |
| Artifact is referenced in Go / Hold review. | Yes |  | Hold |

Final package rule:

```text
Only exact redaction-passed versions can enter 11_final_package/.
Draft, failed, uncertain, quarantined, or unreviewed artifacts must never enter the final package.
```

## 9. Quarantine And Excluded Artifact Checklist

| Check | Required action | Status |
| --- | --- | --- |
| Failed artifact moved to `excluded/` or `quarantine_do_not_package/`. | Yes | Hold |
| Finding category recorded. | Yes | Hold |
| Cleanup owner assigned. | Yes | Hold |
| Replacement version created instead of editing failed artifact in place. | Yes | Hold |
| Replacement version reviewed. | Yes | Hold |
| Replacement version has new version number. | Yes | Hold |
| Replacement version passes redaction gate. | Yes | Hold |
| Quarantined artifact is not copied into final package. | Yes | Hold |
| Manifest quarantine register updated. | Yes | Hold |

Quarantine rule:

```text
A quarantined artifact can never become final evidence. Only a new sanitized replacement version can be reviewed and packaged.
```

## 10. Templates To Backfill After Collection

After this artifact collection checklist is executed, backfill these documents.

| Document | Required backfill |
| --- | --- |
| `docs/meta-business-login-internal-beta-real-artifact-collection-execution-checklist.md` | Mark collection steps Pass / Hold / Fail and link artifact run ID. |
| `docs/meta-business-login-internal-beta-artifact-manifest-template.md` | Fill run metadata, artifact index, owner, reviewer, version, redaction gate, final package path, quarantine register. |
| `docs/meta-business-login-internal-beta-artifact-folder-structure-spec.md` | Record whether the run followed folder structure without exception. |
| `docs/meta-business-login-internal-beta-real-evidence-execution-report-blank-run.md` | Fill actual collection results and artifact references. |
| `docs/meta-business-login-internal-beta-real-evidence-execution-plan.md` | Mark real artifact collection and redaction packaging steps Pass / Hold / Fail. |
| `docs/meta-business-login-final-redaction-search-execution-report-template.md` | Fill final search, visual review, false positive, cleanup, and retest results. |
| `docs/meta-business-login-internal-beta-evidence-execution-report-template.md` | Summarize evidence execution and unresolved findings. |
| `docs/meta-business-login-internal-beta-final-package-gate-review-template.md` | Record final package gate result. |
| `docs/meta-business-login-internal-beta-release-sign-off-checklist.md` | Record whether sign-off can start or stays Hold. |
| `docs/meta-business-login-internal-beta-release-decision-memo-template.md` | Record internal beta Go / Hold decision after sign-off. |
| `docs/meta-business-login-sandbox-go-no-go-checklist.md` | Update internal beta gate status. |
| `docs/meta-app-review-checklist.md` | Update App Review readiness and scope evidence status. |
| `docs/security-review.md` | Update artifact redaction and guard posture. |
| `docs/fix-roadmap.md` | Add remaining blockers after current unrelated edits are resolved. |
| `docs/codex-session-log.md` | Add session result after current unrelated edits are resolved. |

## 11. Internal Beta Go / Hold Decision

Internal beta can become Go only when every gate below is Pass.

| Gate | Required result | Current status |
| --- | --- | --- |
| Artifact package root created. | Pass | Hold |
| Manifest completed. | Pass | Hold |
| Reviewer recording collected and redaction-passed. | Pass | Hold |
| Screenshot package collected and redaction-passed. | Pass | Hold |
| Permission proof completed for every kept scope. | Pass | Hold |
| Test asset proof completed. | Pass | Hold |
| Meta Dashboard scope reconciliation completed. | Pass | Hold |
| Callback evidence redaction-passed. | Pass | Hold |
| Workspace linking dry-run evidence redaction-passed. | Pass | Hold |
| Channel sync dry-run evidence redaction-passed. | Pass | Hold |
| Production write guard evidence Pass. | Pass | Hold |
| Token exchange guard evidence Pass. | Pass | Hold |
| Rollback / fallback evidence Pass. | Pass | Hold |
| Final redaction report completed with zero unresolved findings. | Pass | Hold |
| Final package gate review Pass. | Pass | Hold |
| Product / engineering / security / App Review / operations sign-off complete. | Pass | Hold |

Decision rule:

```text
Internal beta: Go only when every gate is Pass.
Any Hold, Fail, missing artifact, missing sign-off, unresolved finding, unreviewed recording, unreviewed screenshot, or package mismatch keeps internal beta at Hold.
```

Current decision:

```text
Internal beta: Hold
```

## 12. App Review Submission Preparation Decision

App Review submission preparation remains Hold until:

- Internal beta has a signed Go decision.
- Final package artifacts are complete and redaction-passed.
- Reviewer recording and screenshots are approved.
- Permission proof and test asset proof are complete.
- Scope reconciliation matches Meta Dashboard.
- Internal beta launch, monitoring, and closeout have completed or are explicitly waived by a signed decision.
- Final closeout says App Review submission preparation can start.

Current decision:

```text
App Review submission preparation: Hold
```

## 13. Why Production Implementation Still Cannot Start

Production implementation remains No-Go after this checklist is created or executed.

Reasons:

- This checklist collects internal beta artifacts only; it does not approve production implementation.
- App Review has not been submitted or approved.
- Business Verification / Advanced Access status is not confirmed for the final scope set.
- Internal beta is still Hold.
- App Review submission preparation is still Hold.
- Production env migration plan is not approved.
- No Supabase migration / db push has been reviewed or confirmed for this provider.
- Production OAuth, callback, token exchange, token storage, refresh, revocation, and expiry lifecycle are not approved for this provider.
- Production ConnectedAccount / Channel writes remain intentionally blocked in sandbox evidence.
- Webhook registration and channel sync lifecycle for real Meta assets are not approved.
- Tenant isolation regression for real Business / Page / IG asset writes is incomplete.
- Production rollback, monitoring, and incident response plan are incomplete.
- Existing Instagram OAuth fallback must remain available until a separate production implementation ADR is approved.

Current decision:

```text
Production implementation: No-Go
```

## 14. Explicit Restrictions

Do not perform these actions while using this checklist:

- Do not run Supabase migration.
- Do not run Supabase `db push`.
- Do not modify the production OAuth flow.
- Do not modify the callback route.
- Do not modify the login button.
- Do not modify environment variables.
- Do not modify Prisma schema.
- Do not create or update production ConnectedAccount / Channel records.
- Do not perform real Meta token exchange.
- Do not store raw token, authorization code, raw state, raw nonce, full callback URL, app secret, client secret, webhook verify token, API key, database URL, Supabase key, cookie, browser storage, credential, OTP, unmasked asset ID, or real customer data.

## 15. Final Checklist Status

```text
Real artifact collection execution checklist: Ready
Real artifact collection executed: No
Artifact manifest filled: No
Final package assembled: No
Final redaction report executed: No
Internal beta: Hold
App Review submission preparation: Hold
Production implementation: No-Go
```
