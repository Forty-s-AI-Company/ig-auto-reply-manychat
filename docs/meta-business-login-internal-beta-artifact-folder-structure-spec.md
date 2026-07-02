# Meta Business Login Internal Beta Artifact Folder Structure Spec

Date: 2026-06-17
Status: Folder structure spec / internal beta Hold / App Review submission preparation Hold / production implementation No-Go

## Scope

This document defines the folder, file naming, versioning, owner, and redaction gate rules for Meta Business Login / Instagram Business Login internal beta real evidence artifacts.

Source document:

```text
docs/meta-business-login-internal-beta-real-evidence-execution-report-blank-run.md
```

This spec only defines artifact organization. It does not approve internal beta, App Review submission, or production implementation.

This task does not change:

- Product functionality code.
- OAuth flow.
- Callback route.
- Login button.
- Environment variables.
- Prisma schema.
- Supabase migration state.
- Production ConnectedAccount / Channel records.
- Real Meta token exchange.

## 1. Artifact Package Root

Use one immutable root folder per evidence run.

Root folder naming rule:

```text
meta-business-login-internal-beta-artifacts/{run_id}/
```

Run ID format:

```text
IBE-RUN-YYYYMMDD-NNN
```

Example:

```text
meta-business-login-internal-beta-artifacts/IBE-RUN-20260617-001/
```

Required root structure:

```text
meta-business-login-internal-beta-artifacts/
  IBE-RUN-YYYYMMDD-NNN/
    00_manifest/
    01_reviewer_recording/
    02_screenshots/
    03_permission_proof/
    04_test_asset_proof/
    05_callback_evidence/
    06_workspace_linking_dry_run/
    07_channel_sync_dry_run/
    08_guard_test_output/
    09_rollback_fallback/
    10_redaction_report/
    11_final_package/
    quarantine_do_not_package/
```

Folder rule:

```text
Only redaction-gated artifacts can move into 11_final_package.
Raw captures, failed artifacts, uncertain files, or files awaiting redaction must stay outside 11_final_package.
```

## 2. Folder Naming Rules

### 2.1 Manifest Folder

Folder:

```text
00_manifest/
```

Purpose:

- Track run metadata.
- Track owner, reviewer, version, redaction gate, and package status.
- Link artifacts back to the blank run report.

Allowed files:

```text
IBE-RUN-YYYYMMDD-NNN_manifest_vNN.md
IBE-RUN-YYYYMMDD-NNN_artifact-index_vNN.csv
IBE-RUN-YYYYMMDD-NNN_owner-reviewer-signoff_vNN.md
```

### 2.2 Reviewer Recording Folder

Folder:

```text
01_reviewer_recording/
```

Purpose:

- Store reviewer-safe recording segments and final combined recording.
- Record account selection, consent, redacted callback evidence, workspace linking dry-run, channel sync dry-run, permission proof, and rollback / fallback proof.

Required subfolders:

```text
01_reviewer_recording/
  draft_review_required/
  redaction_passed/
  excluded/
```

### 2.3 Screenshots Folder

Folder:

```text
02_screenshots/
```

Purpose:

- Store reviewer-safe screenshots for account selection, consent, product screens, callback evidence, workspace linking dry-run, channel sync dry-run, and fallback proof.

Required subfolders:

```text
02_screenshots/
  account_selection/
  consent/
  product_proof/
  callback_evidence/
  workspace_linking_dry_run/
  channel_sync_dry_run/
  rollback_fallback/
  excluded/
```

### 2.4 Permission Proof Folder

Folder:

```text
03_permission_proof/
```

Purpose:

- Store proof that each kept permission has a product screen, user action, data use explanation, retention / deletion explanation, and reviewer-safe artifact.

Required subfolders:

```text
03_permission_proof/
  instagram_business_basic/
  instagram_business_manage_messages/
  instagram_business_manage_comments/
  instagram_business_content_publish/
  instagram_business_manage_insights/
  scope_reconciliation/
  excluded_or_deferred_scopes/
```

### 2.5 Test Asset Proof Folder

Folder:

```text
04_test_asset_proof/
```

Purpose:

- Store masked proof for reviewer workspace, tester user, Meta Business, Page, IG account, role, and fallback availability.

Required subfolders:

```text
04_test_asset_proof/
  workspace/
  reviewer_user/
  meta_business/
  facebook_page/
  instagram_account/
  fallback_flow/
```

### 2.6 Callback Evidence Folder

Folder:

```text
05_callback_evidence/
```

Purpose:

- Store only redacted sandbox callback evidence.
- Confirm no raw authorization code, raw state, raw nonce, full callback URL, token, or secret is stored.

Required subfolders:

```text
05_callback_evidence/
  redacted_json/
  redacted_screenshots/
  redaction_assertions/
  excluded/
```

### 2.7 Workspace Linking Dry-Run Folder

Folder:

```text
06_workspace_linking_dry_run/
```

Purpose:

- Store dry-run mapping evidence for sandbox provider, workspace marker, ConnectedAccount draft, and no production write.

Required subfolders:

```text
06_workspace_linking_dry_run/
  draft_mapping/
  guard_evidence/
  redaction_assertions/
```

### 2.8 Channel Sync Dry-Run Folder

Folder:

```text
07_channel_sync_dry_run/
```

Purpose:

- Store dry-run channel mapping and sync payload evidence without production sync, token storage, or webhook writes.

Required subfolders:

```text
07_channel_sync_dry_run/
  draft_channel/
  dry_run_payload/
  guard_evidence/
  redaction_assertions/
```

### 2.9 Guard Test Output Folder

Folder:

```text
08_guard_test_output/
```

Purpose:

- Store targeted test output proving production write guard, token exchange guard, and redaction assertions.

Allowed files:

```text
IBE-RUN-YYYYMMDD-NNN_sbl-targeted-tests_vNN.txt
IBE-RUN-YYYYMMDD-NNN_sbl-targeted-tests-summary_vNN.md
IBE-RUN-YYYYMMDD-NNN_guard-redaction-search_vNN.md
```

### 2.10 Rollback / Fallback Folder

Folder:

```text
09_rollback_fallback/
```

Purpose:

- Store proof that internal beta can be disabled and the existing Instagram OAuth fallback remains available.

Required subfolders:

```text
09_rollback_fallback/
  disable_beta/
  clear_allowlist/
  fallback_existing_oauth/
  post_rollback_checks/
```

### 2.11 Redaction Report Folder

Folder:

```text
10_redaction_report/
```

Purpose:

- Store final redaction search execution report and evidence that every packaged artifact passed review.

Allowed files:

```text
IBE-RUN-YYYYMMDD-NNN_redaction-execution-report_vNN.md
IBE-RUN-YYYYMMDD-NNN_visual-review-recording_vNN.md
IBE-RUN-YYYYMMDD-NNN_visual-review-screenshots_vNN.md
IBE-RUN-YYYYMMDD-NNN_false-positive-register_vNN.md
IBE-RUN-YYYYMMDD-NNN_retest-summary_vNN.md
```

### 2.12 Final Package Folder

Folder:

```text
11_final_package/
```

Purpose:

- Store only artifacts that are ready to be referenced for internal beta Go / Hold review.

Entry condition:

```text
Collected=Yes
Version is filled
Owner is filled
Reviewer is filled
Redaction gate=Pass
Package result=Packaged
```

### 2.13 Quarantine Folder

Folder:

```text
quarantine_do_not_package/
```

Purpose:

- Store artifacts that are blocked, failed, suspicious, or awaiting cleanup.

Quarantine rule:

```text
Files in quarantine_do_not_package must never be copied into 11_final_package unless a new sanitized version is created, versioned, reviewed, and passed through redaction gate.
```

## 3. Artifact File Naming Format

Use a stable file naming format for every artifact:

```text
{run_id}_{artifact_id}_{artifact_type}_{scope_or_area}_{owner}_{version}_{redaction_status}.{ext}
```

Allowed field values:

| Field | Format | Example |
| --- | --- | --- |
| `run_id` | `IBE-RUN-YYYYMMDD-NNN` | `IBE-RUN-20260617-001` |
| `artifact_id` | `IBE-ART-NN` | `IBE-ART-01` |
| `artifact_type` | lowercase kebab-case | `reviewer-recording` |
| `scope_or_area` | lowercase kebab-case | `account-selection` |
| `owner` | role marker, not personal email | `app-review-owner` |
| `version` | `vNN` | `v01` |
| `redaction_status` | `draft`, `hold`, `pass`, `fail`, `excluded` | `pass` |
| `ext` | approved extension | `md`, `csv`, `txt`, `json`, `png`, `jpg`, `mp4`, `webm` |

Examples:

```text
IBE-RUN-20260617-001_IBE-ART-01_reviewer-recording_account-selection_app-review-owner_v01_hold.mp4
IBE-RUN-20260617-001_IBE-ART-02_screenshot_consent_app-review-owner_v01_pass.png
IBE-RUN-20260617-001_IBE-ART-03_permission-proof_instagram-business-basic_product-owner_v01_hold.md
IBE-RUN-20260617-001_IBE-ART-04_test-asset-proof_instagram-account_operations-owner_v01_pass.md
IBE-RUN-20260617-001_IBE-ART-12_redaction-report_full-package_security-reviewer_v01_pass.md
```

## 4. Version Format

Version values must use:

```text
v01
v02
v03
```

Version rules:

- Increment version after any visual crop, blur, masking, metadata removal, text edit, or artifact replacement.
- Never overwrite a reviewed artifact.
- Never reuse a version number after redaction gate review.
- Failed versions stay in their original folder or move to `excluded/` or `quarantine_do_not_package/`.
- Final package must reference exact versions, not floating filenames.

Version tracker:

| Artifact ID | Current version | Previous version | Reason for version bump | Owner | Reviewer | Redaction result |
| --- | --- | --- | --- | --- | --- | --- |
| IBE-ART-01 |  |  |  |  |  | Hold |
| IBE-ART-02 |  |  |  |  |  | Hold |
| IBE-ART-03 |  |  |  |  |  | Hold |
| IBE-ART-04 |  |  |  |  |  | Hold |
| IBE-ART-05 |  |  |  |  |  | Hold |
| IBE-ART-06 |  |  |  |  |  | Hold |
| IBE-ART-07 |  |  |  |  |  | Hold |
| IBE-ART-08 |  |  |  |  |  | Hold |
| IBE-ART-09 |  |  |  |  |  | Hold |
| IBE-ART-10 |  |  |  |  |  | Hold |
| IBE-ART-11 |  |  |  |  |  | Hold |
| IBE-ART-12 |  |  |  |  |  | Hold |

## 5. Owner Field Rules

Owner values must use role markers instead of personal email addresses.

Allowed owner values:

```text
app-review-owner
product-owner
engineering-owner
operations-owner
security-reviewer
release-owner
```

Owner requirements:

- Every artifact must have exactly one owner.
- Every artifact must have a reviewer before final packaging.
- Owner and reviewer must not be the same person for redaction-critical artifacts.
- Personal email addresses, phone numbers, account IDs, and private profile links must not be embedded in filenames.

Owner assignment:

| Artifact ID | Artifact | Required owner | Required reviewer |
| --- | --- | --- | --- |
| IBE-ART-01 | Reviewer recording | `app-review-owner` | `security-reviewer` |
| IBE-ART-02 | Screenshot package | `app-review-owner` | `security-reviewer` |
| IBE-ART-03 | Permission proof matrix | `product-owner` | `app-review-owner` |
| IBE-ART-04 | Test asset proof | `operations-owner` | `security-reviewer` |
| IBE-ART-05 | Scope reconciliation | `app-review-owner` | `product-owner` |
| IBE-ART-06 | Redacted callback evidence | `engineering-owner` | `security-reviewer` |
| IBE-ART-07 | Workspace linking dry-run evidence | `engineering-owner` | `security-reviewer` |
| IBE-ART-08 | Channel sync dry-run evidence | `engineering-owner` | `security-reviewer` |
| IBE-ART-09 | Guard test output | `engineering-owner` | `security-reviewer` |
| IBE-ART-10 | Token exchange guard evidence | `engineering-owner` | `security-reviewer` |
| IBE-ART-11 | Rollback / fallback proof | `operations-owner` | `release-owner` |
| IBE-ART-12 | Redaction execution report | `security-reviewer` | `release-owner` |

## 6. Prohibited Artifact Package Content

Do not place these in any artifact folder, final package, docs, logs, audit exports, screenshots, recordings, or reports:

- Raw authorization code.
- Raw state.
- Raw nonce.
- Full callback URL.
- Access token or refresh token.
- App secret, client secret, webhook verify token, API key, database URL, or Supabase key.
- Cookies, session cookies, localStorage, sessionStorage, browser profile data, or request headers containing credentials.
- OTP, password, recovery code, passkey prompt, or private login screen content.
- Unmasked Meta Business ID, Page ID, IG account ID, workspace ID, user ID, or customer ID.
- Real customer messages, comments, profile data, media, insights, private business data, or billing data.
- `.env`, `.env.local`, `.env.production.local`, Prisma migration files, database dumps, production logs, or production audit exports containing raw identifiers.
- Browser address bar screenshot containing OAuth callback query parameters.
- Terminal output that includes real secrets, raw codes, raw state, raw nonce, full callback URL, or unmasked identifiers.

Allowed replacements:

```text
[REDACTED_CODE]
[REDACTED_STATE]
[REDACTED_NONCE]
[REDACTED_CALLBACK_URL]
[REDACTED_TOKEN]
[REDACTED_SECRET]
business:masked-001
page:masked-001
ig:masked-001
workspace:masked-001
user:masked-001
```

## 7. Redaction Gate Storage Rules

### 7.1 Before Redaction Gate Pass

Before an artifact passes redaction gate:

- Store it in its source folder under `draft_review_required/`, a specific evidence subfolder, or `quarantine_do_not_package/`.
- Set filename `redaction_status` to `draft`, `hold`, or `fail`.
- Do not copy it to `11_final_package/`.
- Do not reference it as Go evidence.
- Do not submit it for App Review.
- Do not use it in final reviewer recording package.

### 7.2 After Redaction Gate Pass

After an artifact passes redaction gate:

- Set filename `redaction_status` to `pass`.
- Record owner, reviewer, version, date, and redaction gate result in `00_manifest/`.
- Copy only the exact passed version to `11_final_package/`.
- Link the exact passed version in the blank run report.
- Keep previous failed or draft versions outside final package.

### 7.3 Redaction Gate Failure

If redaction gate fails:

- Move the failed artifact to `excluded/` or `quarantine_do_not_package/`.
- Record finding category and cleanup owner.
- Create a new sanitized version instead of editing the failed artifact in place.
- Re-run the failed search or visual review.
- Re-run the full final redaction search before Go review.

Gate result values:

```text
Not started
Hold
Pass
Fail
Excluded
```

## 8. Referencing Artifacts In Internal Beta Go / Hold Decisions

Internal beta Go / Hold review must reference artifacts by exact path, version, owner, and redaction result.

Reference format:

```text
Artifact ID:
Artifact path:
Version:
Owner:
Reviewer:
Redaction gate:
Package result:
Decision usage:
```

Example:

```text
Artifact ID: IBE-ART-06
Artifact path: meta-business-login-internal-beta-artifacts/IBE-RUN-20260617-001/11_final_package/IBE-RUN-20260617-001_IBE-ART-06_callback-evidence_redacted-json_engineering-owner_v01_pass.json
Version: v01
Owner: engineering-owner
Reviewer: security-reviewer
Redaction gate: Pass
Package result: Packaged
Decision usage: Supports callback security gate and token exchange guard.
```

Go decision rule:

```text
Internal beta can become Go only when every required artifact has an exact final-package reference and Redaction gate=Pass.
```

Hold decision rule:

```text
Any missing artifact, unversioned artifact, unowned artifact, unreviewed artifact, redaction Hold/Fail, unresolved finding, or package mismatch keeps internal beta at Hold.
```

## 9. Production Implementation Still Cannot Start

Production implementation remains No-Go even after this folder structure spec is created.

Reasons:

- This spec defines artifact organization only; it does not collect or approve real evidence.
- Internal beta remains Hold until all artifacts are collected, redacted, reviewed, and signed off.
- App Review has not been submitted or approved.
- Business Verification / Advanced Access status is not confirmed for the final scope set.
- App Review package assembly remains incomplete.
- Production env migration plan is not approved.
- No Supabase migration / db push has been reviewed or confirmed for this provider.
- Production callback behavior for real token exchange is not implemented or reviewed.
- Production ConnectedAccount / Channel writes remain intentionally blocked in sandbox.
- Real token storage, encryption, refresh, revocation, and expiry lifecycle are not approved for this provider.
- Webhook registration and channel sync lifecycle are not approved for real assets.
- Tenant isolation regression for real Business / Page / IG asset writes is not complete.
- Existing Instagram OAuth fallback must remain available until a separate production implementation ADR is approved.

Current decision:

```text
Production implementation: No-Go
```

## 10. Explicit Restrictions

Do not perform these actions while using this artifact folder structure spec:

- Do not run Supabase migration.
- Do not run Supabase `db push`.
- Do not modify the production OAuth flow.
- Do not modify the callback route.
- Do not modify the login button.
- Do not modify environment variables.
- Do not modify Prisma schema.
- Do not create or update production ConnectedAccount / Channel records.
- Do not perform real Meta token exchange.
- Do not store raw token, authorization code, raw state, raw nonce, full callback URL, app secret, client secret, webhook verify token, cookie, browser storage, credential, OTP, unmasked asset ID, or real customer data in artifact folders.

Supabase safety note:

```text
If a future task requires Supabase migration or db push, first show current project_id, linked project, and Supabase account email, then wait for explicit confirmation.
```

## 11. Documents To Backfill After Completion

After the artifact package is created and reviewed, backfill:

| Document | Required update |
| --- | --- |
| `docs/meta-business-login-internal-beta-artifact-folder-structure-spec.md` | Record whether this structure was used without exception. |
| `docs/meta-business-login-internal-beta-real-evidence-execution-report-blank-run.md` | Fill exact artifact paths, versions, owners, reviewers, redaction gates, and Go / Hold decision. |
| `docs/meta-business-login-internal-beta-real-evidence-execution-plan.md` | Mark artifact collection and redaction packaging steps Pass / Hold / Fail. |
| `docs/meta-business-login-final-redaction-search-execution-report-template.md` | Fill real redaction search and visual review results. |
| `docs/meta-business-login-internal-beta-evidence-execution-report-template.md` | Summarize artifact package results and unresolved findings. |
| `docs/meta-business-login-internal-beta-release-decision-memo-template.md` | Reference final package artifacts in Go / Hold decision. |
| `docs/meta-business-login-final-app-review-package-assembly-checklist.md` | Confirm package entries meet App Review assembly gates. |
| `docs/meta-business-login-sandbox-go-no-go-checklist.md` | Update internal beta gate status. |
| `docs/meta-app-review-checklist.md` | Update App Review readiness and scope evidence status. |
| `docs/security-review.md` | Update redaction and artifact handling security posture. |
| `docs/fix-roadmap.md` | Add remaining Hold / Fail blockers after current unrelated edits are resolved. |
| `docs/codex-session-log.md` | Add session result after current unrelated edits are resolved. |

## Final Spec Status

```text
Artifact folder structure spec: Ready
Artifact package created: No
Artifacts redaction-gated: No
Internal beta: Hold
App Review submission preparation: Hold
Production implementation: No-Go
```

