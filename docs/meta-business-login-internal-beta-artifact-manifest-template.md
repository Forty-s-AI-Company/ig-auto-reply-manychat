# Meta Business Login Internal Beta Artifact Manifest Template

Date: 2026-06-17
Status: Manifest template / internal beta Hold / App Review submission preparation Hold / production implementation No-Go

## Scope

This manifest template tracks the artifact package for a Meta Business Login / Instagram Business Login internal beta real evidence run.

Source spec:

```text
docs/meta-business-login-internal-beta-artifact-folder-structure-spec.md
```

This template is for artifact tracking only. It does not approve internal beta, App Review submission, or production implementation.

Do not record raw sensitive values in this manifest, including:

- Raw authorization code.
- Raw state.
- Raw nonce.
- Full callback URL.
- Access token or refresh token.
- App secret, client secret, webhook verify token, API key, database URL, or Supabase key.
- Cookies, localStorage, sessionStorage, credentials, OTP, or unmasked asset IDs.
- Real customer messages, comments, profile data, private business data, or billing data.

## 1. Run Metadata

| Field | Value |
| --- | --- |
| Run ID | `IBE-RUN-YYYYMMDD-NNN` |
| Manifest version | `v01` |
| Manifest status | Draft |
| Run date |  |
| Run owner |  |
| Release owner |  |
| Engineering reviewer |  |
| Security reviewer |  |
| App Review owner |  |
| Product owner |  |
| Operations owner |  |
| Source folder structure spec version |  |
| Source blank run report version |  |
| Artifact package root | `meta-business-login-internal-beta-artifacts/IBE-RUN-YYYYMMDD-NNN/` |
| Final package folder | `meta-business-login-internal-beta-artifacts/IBE-RUN-YYYYMMDD-NNN/11_final_package/` |
| Quarantine folder | `meta-business-login-internal-beta-artifacts/IBE-RUN-YYYYMMDD-NNN/quarantine_do_not_package/` |
| Workspace marker | `workspace:masked-___` |
| Meta Business marker | `business:masked-___` |
| Facebook Page marker | `page:masked-___` |
| Instagram account marker | `ig:masked-___` |
| Test user marker | `user:masked-___` |
| Redaction report path |  |
| Internal beta decision | Hold |
| Production implementation decision | No-Go |

Run safety assertion:

```text
No Supabase migration, Supabase db push, production OAuth flow change, callback route change, login button change, env change, Prisma schema change, production ConnectedAccount write, production Channel write, or real Meta token exchange was performed for this manifest.
```

## 2. Artifact Index Fields

Every artifact row must include these fields.

| Field | Required? | Format | Notes |
| --- | --- | --- | --- |
| Artifact ID | Yes | `IBE-ART-NN` | Stable artifact ID from the blank run report. |
| Artifact type | Yes | lowercase kebab-case | Example: `reviewer-recording`. |
| Scope / area | Yes | lowercase kebab-case | Example: `account-selection`. |
| Required evidence | Yes | Plain text | Describe what this artifact proves. |
| Source folder | Yes | Folder path | Must follow folder structure spec. |
| Artifact filename | Yes | Full filename | Must follow naming format. |
| Final package path | Required only after pass | Folder path | Must point to `11_final_package/` only after redaction pass. |
| Owner | Yes | Role marker | No personal email in owner field. |
| Reviewer | Required before package | Role marker | Required before final package entry. |
| Version | Yes | `vNN` | Never reuse reviewed version numbers. |
| Redaction gate | Yes | `Not started`, `Hold`, `Pass`, `Fail`, `Excluded` | Must be `Pass` before final package. |
| Package result | Yes | `Not packaged`, `Packaged`, `Excluded`, `Blocked` | `Packaged` requires redaction pass. |
| Collected | Yes | `Yes` / `No` |  |
| Visual review required | Yes | `Yes` / `No` | Required for video and screenshot artifacts. |
| Text search required | Yes | `Yes` / `No` | Required for text, JSON, logs, reports, and test output. |
| Finding count | Yes | Number | Use `0` only after review. |
| Unresolved finding count | Yes | Number | Must be `0` before Go. |
| Decision usage | Yes | Plain text | Which gate this artifact supports. |
| Notes | No | Plain text | No raw sensitive values. |

## 3. Artifact Index

| Artifact ID | Artifact type | Scope / area | Required evidence | Source folder | Artifact filename | Final package path | Owner | Reviewer | Version | Redaction gate | Package result | Collected | Visual review required | Text search required | Finding count | Unresolved finding count | Decision usage | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| IBE-ART-01 | reviewer-recording | end-to-end-demo | Account selection, consent, callback, dry-run mapping, channel sync, permission proof, rollback / fallback. | `01_reviewer_recording/` |  |  | app-review-owner | security-reviewer |  | Hold | Not packaged | No | Yes | No |  |  | Supports App Review demo and account selection UX gates. |  |
| IBE-ART-02 | screenshot-package | visual-proof | Account selection, consent, product screens, callback evidence, dry-run evidence, fallback proof. | `02_screenshots/` |  |  | app-review-owner | security-reviewer |  | Hold | Not packaged | No | Yes | No |  |  | Supports reviewer proof and visual evidence gates. |  |
| IBE-ART-03 | permission-proof | scope-matrix | Product screen, user action, data use, retention / deletion, reviewer proof for kept scopes. | `03_permission_proof/` |  |  | product-owner | app-review-owner |  | Hold | Not packaged | No | No | Yes |  |  | Supports permission usage proof gate. |  |
| IBE-ART-04 | test-asset-proof | reviewer-assets | Masked Business / Page / IG / workspace / test user proof. | `04_test_asset_proof/` |  |  | operations-owner | security-reviewer |  | Hold | Not packaged | No | Yes | Yes |  |  | Supports test asset readiness gate. |  |
| IBE-ART-05 | scope-reconciliation | meta-dashboard | Dashboard scopes matched to final permission proof. | `03_permission_proof/scope_reconciliation/` |  |  | app-review-owner | product-owner |  | Hold | Not packaged | No | Yes | Yes |  |  | Supports App Review scope reconciliation gate. |  |
| IBE-ART-06 | callback-evidence | redacted-callback-json | Sandbox callback capture with no raw code/state/nonce/full callback URL/token/secret. | `05_callback_evidence/` |  |  | engineering-owner | security-reviewer |  | Hold | Not packaged | No | Yes | Yes |  |  | Supports callback security and token exchange guard. |  |
| IBE-ART-07 | workspace-linking-dry-run | draft-mapping | Sandbox provider / workspace / ConnectedAccount draft mapping without production write. | `06_workspace_linking_dry_run/` |  |  | engineering-owner | security-reviewer |  | Hold | Not packaged | No | No | Yes |  |  | Supports workspace linking gate. |  |
| IBE-ART-08 | channel-sync-dry-run | dry-run-payload | Channel draft and sync payload without production sync or token exposure. | `07_channel_sync_dry_run/` |  |  | engineering-owner | security-reviewer |  | Hold | Not packaged | No | No | Yes |  |  | Supports channel sync gate. |  |
| IBE-ART-09 | guard-test-output | targeted-tests | SBL targeted test output proving production write guard. | `08_guard_test_output/` |  |  | engineering-owner | security-reviewer |  | Hold | Not packaged | No | No | Yes |  |  | Supports production write guard gate. |  |
| IBE-ART-10 | token-exchange-guard | no-exchange | Evidence showing `exchangeAttempted=false`. | `08_guard_test_output/` |  |  | engineering-owner | security-reviewer |  | Hold | Not packaged | No | No | Yes |  |  | Supports token exchange guard gate. |  |
| IBE-ART-11 | rollback-fallback-proof | rollback | Disable beta, clear allowlist, fallback available, no env/schema rollback. | `09_rollback_fallback/` |  |  | operations-owner | release-owner |  | Hold | Not packaged | No | Yes | Yes |  |  | Supports rollback / fallback gate. |  |
| IBE-ART-12 | redaction-report | final-package | Search and visual review report across final artifacts. | `10_redaction_report/` |  |  | security-reviewer | release-owner |  | Hold | Not packaged | No | No | Yes |  |  | Supports final redaction gate. |  |

## 4. Owner / Reviewer / Version / Redaction Gate Fields

### 4.1 Allowed Owner And Reviewer Values

Use role markers only:

```text
app-review-owner
product-owner
engineering-owner
operations-owner
security-reviewer
release-owner
```

Do not use:

- Personal email addresses.
- Phone numbers.
- Private profile URLs.
- Unmasked user IDs.
- Unmasked workspace IDs.

### 4.2 Version Field

Version format:

```text
v01
v02
v03
```

Version rules:

- Increment version after any crop, blur, mask, metadata removal, text edit, artifact replacement, or redaction cleanup.
- Never overwrite a reviewed artifact.
- Never reuse a version number after redaction gate review.
- Final package entries must reference exact versions.

### 4.3 Redaction Gate Field

Allowed values:

```text
Not started
Hold
Pass
Fail
Excluded
```

Gate rule:

```text
No artifact can be marked Packaged unless Redaction gate=Pass and unresolved finding count=0.
```

## 5. Final Package Entry Checklist

Before copying any artifact into `11_final_package/`, verify:

| Check | Required result | Actual result | Status |
| --- | --- | --- | --- |
| Artifact ID is present. | Yes |  | Hold |
| Artifact filename follows naming format. | Yes |  | Hold |
| Artifact has owner. | Yes |  | Hold |
| Artifact has reviewer. | Yes |  | Hold |
| Artifact has exact version. | Yes |  | Hold |
| Artifact is the latest approved version. | Yes |  | Hold |
| Artifact source folder follows spec. | Yes |  | Hold |
| Visual review completed if required. | Pass or Not required |  | Hold |
| Text search completed if required. | Pass or Not required |  | Hold |
| Finding count recorded. | Yes |  | Hold |
| Unresolved finding count is zero. | Yes |  | Hold |
| Redaction gate is Pass. | Pass |  | Hold |
| Package result is Packaged. | Packaged |  | Hold |
| Artifact has no raw code/state/nonce/callback URL/token/secret. | Pass |  | Hold |
| Artifact has no unmasked asset IDs or customer data. | Pass |  | Hold |
| Artifact path is referenced in Go / Hold review. | Yes |  | Hold |

Final package entry note:

```text
Files in 11_final_package must be exact redaction-passed versions only.
Draft, failed, uncertain, or unreviewed files must remain outside final package.
```

## 6. Quarantine / Excluded Artifact Register

Use this register for any artifact that fails review, contains possible sensitive data, is superseded, or must not be packaged.

| Quarantine ID | Original artifact ID | Original filename | Original folder | Reason | Finding category | Cleanup owner | Replacement artifact path | Final status | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| IBE-QTN-001 |  |  |  |  |  |  |  | Hold |  |
| IBE-QTN-002 |  |  |  |  |  |  |  | Hold |  |
| IBE-QTN-003 |  |  |  |  |  |  |  | Hold |  |

Allowed final status values:

```text
Quarantined
Excluded
Replaced
Cleaned and re-reviewed
Blocked
```

Quarantine rule:

```text
Never move a quarantined artifact into 11_final_package. Create a new sanitized version, review it, and package only the passed replacement.
```

## 7. Internal Beta Go / Hold Artifact Reference Format

Every Go / Hold decision must reference exact artifacts in this format:

```text
Artifact ID:
Artifact type:
Final package path:
Version:
Owner:
Reviewer:
Redaction gate:
Package result:
Finding count:
Unresolved finding count:
Decision usage:
Gate supported:
```

Decision reference table:

| Gate | Required artifact references | Current reference status |
| --- | --- | --- |
| App Review demo gate | IBE-ART-01, IBE-ART-02, IBE-ART-03, IBE-ART-04, IBE-ART-05 | Hold |
| Account selection UX gate | IBE-ART-01, IBE-ART-02 | Hold |
| Callback security gate | IBE-ART-06, IBE-ART-12 | Hold |
| Workspace linking gate | IBE-ART-07, IBE-ART-12 | Hold |
| Channel sync gate | IBE-ART-08, IBE-ART-12 | Hold |
| Redaction gate | IBE-ART-12 plus every packaged artifact | Hold |
| Production write guard gate | IBE-ART-09, IBE-ART-10 | Hold |
| Rollback / fallback gate | IBE-ART-11 | Hold |
| Release sign-off gate | Manifest, redaction report, release decision memo | Hold |

Go rule:

```text
Internal beta can become Go only when every required artifact has exact final-package path, version, owner, reviewer, Redaction gate=Pass, Package result=Packaged, and unresolved finding count=0.
```

Hold rule:

```text
Any missing path, missing version, missing owner, missing reviewer, redaction Hold/Fail, unresolved finding, unreviewed visual artifact, or unreviewed text artifact keeps internal beta at Hold.
```

## 8. Production Implementation Still Cannot Start

Production implementation remains No-Go after this manifest template is created.

Reasons:

- This template does not collect or approve real evidence.
- Manifest entries are not filled, versioned, reviewed, or redaction-gated yet.
- Internal beta remains Hold until all required artifacts are collected and pass review.
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

## 9. Explicit Restrictions

Do not perform these actions while using or filling this manifest template:

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

After this manifest is filled for a real run, backfill:

| Document | Required update |
| --- | --- |
| `docs/meta-business-login-internal-beta-artifact-manifest-template.md` | Fill run metadata, artifact index, redaction gate, final package, quarantine, and Go / Hold references. |
| `docs/meta-business-login-internal-beta-artifact-folder-structure-spec.md` | Record whether the package followed the folder structure without exception. |
| `docs/meta-business-login-internal-beta-real-evidence-execution-report-blank-run.md` | Link exact manifest version and final package artifact paths. |
| `docs/meta-business-login-internal-beta-real-evidence-execution-plan.md` | Mark artifact collection, manifest, and packaging steps Pass / Hold / Fail. |
| `docs/meta-business-login-final-redaction-search-execution-report-template.md` | Fill redaction search, visual review, false positives, and retest results. |
| `docs/meta-business-login-internal-beta-evidence-execution-report-template.md` | Summarize artifact manifest and unresolved findings. |
| `docs/meta-business-login-internal-beta-release-decision-memo-template.md` | Reference final artifact paths in Go / Hold decision. |
| `docs/meta-business-login-final-app-review-package-assembly-checklist.md` | Confirm package entries meet final App Review assembly gates. |
| `docs/meta-business-login-sandbox-go-no-go-checklist.md` | Update internal beta gate status. |
| `docs/meta-app-review-checklist.md` | Update App Review readiness and scope evidence status. |
| `docs/security-review.md` | Update redaction and artifact handling security posture. |
| `docs/fix-roadmap.md` | Add remaining Hold / Fail blockers after current unrelated edits are resolved. |
| `docs/codex-session-log.md` | Add session result after current unrelated edits are resolved. |

## Final Manifest Template Status

```text
Artifact manifest template: Ready
Manifest filled for real run: No
Final package entries approved: No
Artifacts redaction-gated: No
Internal beta: Hold
App Review submission preparation: Hold
Production implementation: No-Go
```

