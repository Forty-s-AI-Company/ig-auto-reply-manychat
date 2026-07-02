# Meta Business Login Internal Beta First Artifact Collection Operator Runbook

Date: 2026-06-17
Status: Operator runbook / artifact collection not executed / internal beta Hold / App Review submission preparation Hold / production implementation No-Go

## Scope

This runbook tells the operator how to execute the first real artifact collection run for Meta Business Login / Instagram Business Login internal beta.

Source execution record:

```text
docs/meta-business-login-internal-beta-artifact-collection-first-execution-blank-run.md
```

This runbook is operational guidance only. It does not approve internal beta, App Review submission preparation, or production implementation.

This runbook does not change:

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
Do not run Supabase migration or db push during this artifact collection run.
Before any future Supabase migration or db push, first show current project_id, linked project, and Supabase account email, then wait for explicit confirmation.
```

Sensitive data rule:

```text
Do not capture or record raw token, authorization code, raw state, raw nonce, full callback URL, app secret, client secret, webhook verify token, API key, database URL, Supabase key, cookie, browser storage, credential, OTP, unmasked asset ID, or real customer data.
```

## 1. Operator Roles

Use role markers only. Do not write personal email addresses, private profile links, phone numbers, or unmasked user IDs into evidence.

| Role marker | Responsibility | Required before run |
| --- | --- | --- |
| `release-owner` | Owns run timing, Go/Hold routing, rollback owner assignment, and final package handoff. | Yes |
| `app-review-owner` | Captures reviewer recording, screenshots, scope reconciliation, and App Review package evidence. | Yes |
| `product-owner` | Verifies permission proof, product screen proof, user action proof, retention/deletion explanation. | Yes |
| `engineering-owner` | Captures callback, workspace linking, channel sync, guard test, and token exchange guard evidence. | Yes |
| `operations-owner` | Captures test asset proof, fallback proof, rollback proof, allowlist/role evidence. | Yes |
| `security-reviewer` | Reviews recordings, screenshots, logs, test output, redaction report, and quarantine decisions. | Yes |

Role separation rule:

```text
The artifact owner should not be the sole reviewer for redaction-critical artifacts.
```

## 2. Pre-Run Operator Checklist

Complete this checklist before capturing any artifact.

| Step | Operator action | Required result | Status |
| --- | --- | --- | --- |
| 1 | Open the blank run document. | `docs/meta-business-login-internal-beta-artifact-collection-first-execution-blank-run.md` is available. | Hold |
| 2 | Assign run ID. | `IBE-RUN-YYYYMMDD-NNN` is filled. | Hold |
| 3 | Confirm artifact package root. | `meta-business-login-internal-beta-artifacts/{run_id}/` is selected. | Hold |
| 4 | Confirm quarantine folder. | `quarantine_do_not_package/` is selected. | Hold |
| 5 | Confirm final package folder starts empty. | `11_final_package/` has no unreviewed artifacts. | Hold |
| 6 | Confirm role owners. | All required role markers are assigned. | Hold |
| 7 | Confirm source docs are open. | Checklist, blank run, folder spec, manifest template are available. | Hold |
| 8 | Confirm no Supabase migration. | No migration or `db push` will run. | Pass |
| 9 | Confirm no product flow mutation. | OAuth, callback, login button, env, Prisma stay unchanged. | Pass |
| 10 | Confirm no token exchange. | No real Meta token exchange will be attempted. | Pass |
| 11 | Confirm no production writes. | No production ConnectedAccount / Channel / webhook / sync write will be performed. | Pass |

Stop condition:

```text
If the run requires env, Prisma schema, Supabase migration, production OAuth/callback/button changes, or real token exchange, stop this run and create a separate approval request.
```

## 3. Artifact Folder And Filename Setup

The operator should prepare the artifact folder structure before capturing files.

Required root:

```text
meta-business-login-internal-beta-artifacts/{run_id}/
```

Required folders:

```text
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

Filename format:

```text
{run_id}_{artifact_id}_{artifact_type}_{scope_or_area}_{owner}_{version}_{redaction_status}.{ext}
```

Initial filename guidance:

| Artifact ID | Initial redaction status | Example artifact type |
| --- | --- | --- |
| IBE-ART-01 | `hold` | `reviewer-recording` |
| IBE-ART-02 | `hold` | `screenshot-package` |
| IBE-ART-03 | `hold` | `permission-proof` |
| IBE-ART-04 | `hold` | `test-asset-proof` |
| IBE-ART-05 | `hold` | `scope-reconciliation` |
| IBE-ART-06 | `hold` | `callback-evidence` |
| IBE-ART-07 | `hold` | `workspace-linking-dry-run` |
| IBE-ART-08 | `hold` | `channel-sync-dry-run` |
| IBE-ART-09 | `hold` | `guard-test-output` |
| IBE-ART-10 | `hold` | `token-exchange-guard` |
| IBE-ART-11 | `hold` | `rollback-fallback-proof` |
| IBE-ART-12 | `hold` | `redaction-report` |

Packaging rule:

```text
Never place artifacts directly into 11_final_package/.
Only copy exact redaction-passed versions into 11_final_package/ after security review.
```

## 4. Collection Order

Collect artifacts in this exact order so downstream evidence can reference upstream setup.

| Order | Artifact ID | Operator | Action | Record in blank run |
| --- | --- | --- | --- | --- |
| 1 | IBE-ART-04 | operations-owner | Capture masked reviewer workspace, test user, Meta Business, Page, IG account, role, and fallback asset proof. | Section 3 and 6.2 |
| 2 | IBE-ART-05 | app-review-owner | Capture Meta Dashboard scope reconciliation with no secrets or unmasked asset IDs. | Section 3 and 6.1 |
| 3 | IBE-ART-03 | product-owner | Complete permission proof for kept scopes. | Section 3 and 6.1 |
| 4 | IBE-ART-01 | app-review-owner | Capture reviewer recording. | Section 3 and 5.1 |
| 5 | IBE-ART-02 | app-review-owner | Capture screenshot package. | Section 3 and 5.2 |
| 6 | IBE-ART-06 | engineering-owner | Export or capture redacted callback evidence. | Section 3 and 7 |
| 7 | IBE-ART-07 | engineering-owner | Capture workspace linking dry-run evidence. | Section 3 and 7 |
| 8 | IBE-ART-08 | engineering-owner | Capture channel sync dry-run evidence. | Section 3 and 7 |
| 9 | IBE-ART-09 | engineering-owner | Run targeted production write guard tests and save output. | Section 3 and 7 |
| 10 | IBE-ART-10 | engineering-owner | Capture token exchange guard evidence. | Section 3 and 7 |
| 11 | IBE-ART-11 | operations-owner | Capture rollback / fallback proof. | Section 3 and 7 |
| 12 | IBE-ART-12 | security-reviewer | Execute final redaction search and visual review report. | Section 8 |

Operator note:

```text
If an earlier artifact remains Hold, later artifacts may still be collected, but internal beta must remain Hold until all required artifacts pass.
```

## 5. Reviewer Recording Procedure

Use this procedure for IBE-ART-01.

| Step | Capture | Operator action | Stop if visible |
| --- | --- | --- | --- |
| 1 | Start state | Begin from reviewer-safe workspace and approved test user only. | Real customer data |
| 2 | Internal-only entry point | Show beta entry point is not the production login button. | Private links, cookies, browser storage |
| 3 | Account selection | Show Business / Page / IG account selection. | Unmasked asset IDs or private account data |
| 4 | Consent | Show consent screen only if reviewer-safe. | Credential, OTP, private profile data |
| 5 | Callback | Show redacted callback evidence only. | Raw code, state, nonce, full callback URL |
| 6 | Workspace dry-run | Show masked workspace / ConnectedAccount draft mapping. | Production write or raw asset ID |
| 7 | Channel dry-run | Show channel draft and no production sync. | Token, webhook secret, sync write |
| 8 | Product proof | Show each kept scope's product screen and user action. | Real customer message/comment/profile |
| 9 | Fallback | Show existing Instagram OAuth fallback remains available. | Credential or callback query params |
| 10 | End | Stop recording and store as draft/hold. | Any sensitive value |

Recording rule:

```text
If a sensitive value appears during recording, stop, quarantine the recording, and create a new sanitized recording.
```

## 6. Screenshot Procedure

Use this procedure for IBE-ART-02.

| Screenshot group | Required capture | Storage folder | Must not include |
| --- | --- | --- | --- |
| Account selection | Business / Page / IG selection evidence. | `02_screenshots/account_selection/` | Unmasked IDs, private account data |
| Consent | Consent screen evidence. | `02_screenshots/consent/` | Credentials, OTP, browser storage |
| Product proof | Screens for kept permissions. | `02_screenshots/product_proof/` | Real customer data |
| Callback evidence | Redacted callback only. | `02_screenshots/callback_evidence/` | Address bar with OAuth query params |
| Workspace dry-run | Draft mapping and no-write evidence. | `02_screenshots/workspace_linking_dry_run/` | Production write, raw asset ID |
| Channel dry-run | Draft payload and no-sync evidence. | `02_screenshots/channel_sync_dry_run/` | Token, secret, webhook write |
| Rollback / fallback | Disable beta and fallback available proof. | `02_screenshots/rollback_fallback/` | Credentials or raw callback URL |

Screenshot rule:

```text
Crop or mask before review only if the edited version receives a new version number.
Do not overwrite a reviewed screenshot.
```

## 7. Permission Proof And Test Asset Procedure

### 7.1 Permission Proof

For each kept scope, the operator must capture:

| Required proof | Description | Status |
| --- | --- | --- |
| Product screen proof | Where the user sees the feature. | Hold |
| User action proof | What action the user takes before data is used. | Hold |
| Data read proof | What data is read and why. | Hold |
| Data write proof | What is written, if anything. | Hold |
| Storage proof | What is stored, if anything. | Hold |
| Retention / deletion proof | How retained data can expire, be removed, or be disconnected. | Hold |
| Reviewer proof | Which recording/screenshot/artifact supports the claim. | Hold |

Scope handling rule:

```text
If a scope lacks proof, mark it Hold and recommend remove, defer, or collect additional evidence before App Review preparation.
```

### 7.2 Test Asset Proof

Use masked markers only:

```text
workspace:masked-___
business:masked-___
page:masked-___
ig:masked-___
user:masked-___
```

Do not capture:

- Unmasked Business ID.
- Unmasked Page ID.
- Unmasked Instagram account ID.
- Personal profile URL.
- Reviewer email.
- OTP or login credential.
- Real customer content.

## 8. Engineering Evidence Procedure

### 8.1 Callback Evidence

The callback artifact must prove:

| Requirement | Expected value |
| --- | --- |
| Callback response type | Redacted sandbox callback capture |
| Raw authorization code present | No |
| Raw state present | No |
| Raw nonce present | No |
| Full callback URL present | No |
| Token or secret present | No |
| `exchangeAttempted` | `false` |
| Production writes | All false |

### 8.2 Workspace Linking Dry-Run

The workspace linking artifact must prove:

- Sandbox provider marker is used.
- Workspace marker is masked.
- ConnectedAccount draft mapping is dry-run only.
- No production ConnectedAccount write occurs.
- No token is stored.

### 8.3 Channel Sync Dry-Run

The channel sync artifact must prove:

- Channel draft uses masked markers.
- Sync payload is dry-run only.
- No production Channel write occurs.
- No webhook registration occurs.
- No production sync starts.
- No token/code/secret/state/callback URL appears.

### 8.4 Guard Tests

Run the targeted tests and save output as IBE-ART-09 / IBE-ART-10 candidate evidence:

```bash
npx vitest run tests/meta-business-login-sandbox-sbl08.test.ts tests/meta-business-login-sandbox-sbl12-callback-capture.test.ts tests/meta-business-login-sandbox-sbl12-callback-route.test.ts tests/meta-business-login-sandbox-sbl13-workspace-linking-sync.test.ts
```

Guard output must be searched before packaging.

## 9. Rollback And Fallback Procedure

Use this procedure for IBE-ART-11.

| Check | Required proof | Status |
| --- | --- | --- |
| Disable beta | Operator can disable or stop using internal-only beta entry point. | Hold |
| Clear/reduce allowlist | Workspace allowlist can be cleared or reduced. | Hold |
| Revoke role access | Non-approved user role is blocked. | Hold |
| Existing OAuth fallback | Existing Instagram OAuth flow remains reachable. | Hold |
| No env rollback | Rollback does not require env changes. | Hold |
| No schema rollback | Rollback does not require Prisma schema changes. | Hold |
| No production write cleanup | No production ConnectedAccount / Channel cleanup needed. | Hold |

Rollback stop condition:

```text
If rollback requires env, schema, migration, production OAuth changes, or production data cleanup, keep internal beta at Hold and open a separate risk review.
```

## 10. Redaction Review Procedure

The security reviewer performs IBE-ART-12 after all candidate artifacts exist.

| Step | Action | Result field |
| --- | --- | --- |
| 1 | Freeze artifact versions. | Blank run section 8 |
| 2 | Complete manifest rows. | Blank run section 4 |
| 3 | Search text artifacts. | Blank run section 8 |
| 4 | Search test output and logs. | Blank run section 8 |
| 5 | Review recording visually. | Blank run section 5.1 |
| 6 | Review screenshots visually. | Blank run section 5.2 |
| 7 | Classify false positives. | Blank run section 8 |
| 8 | Quarantine failed/uncertain artifacts. | Blank run section 10 |
| 9 | Create sanitized replacement versions. | Blank run section 10 |
| 10 | Re-run failed checks. | Blank run section 8 |
| 11 | Re-run full search set. | Blank run section 8 |
| 12 | Fill final redaction report. | Blank run section 8 |

Search categories:

```text
Token / secret
Authorization code
Raw state
Raw nonce
Full callback URL
Unmasked Meta asset ID
Cookie / browser storage / credential / OTP
Real customer data
```

Pass rule:

```text
Redaction gate can be Pass only when unresolved finding count is 0 for every packaged artifact.
```

## 11. Quarantine Procedure

Quarantine an artifact when:

- It contains a raw token/code/state/nonce/full callback URL/secret.
- It contains a cookie, browser storage value, credential, or OTP.
- It contains unmasked Business/Page/IG/workspace/user/customer IDs.
- It contains real customer data.
- It is uncertain or not yet reviewed.
- It was superseded by a sanitized replacement.

Quarantine workflow:

| Step | Action |
| --- | --- |
| 1 | Move the artifact to `quarantine_do_not_package/` or `excluded/`. |
| 2 | Record `IBE-QTN-NNN` in the blank run. |
| 3 | Record finding category and cleanup owner. |
| 4 | Create a new sanitized version with a new version number. |
| 5 | Review the replacement artifact. |
| 6 | Package only the replacement if redaction gate is Pass. |

Quarantine rule:

```text
A quarantined artifact must never be copied into 11_final_package/.
```

## 12. Blank Run Fill-In Procedure

As each artifact is collected, update:

| Blank run section | Fill when |
| --- | --- |
| Section 1 Run Metadata | Before collection starts. |
| Section 2 Pre-Execution Checklist | Before collection starts. |
| Section 3 Artifact Collection Execution Log | Immediately after each artifact candidate is captured. |
| Section 4 Artifact Manifest Update Log | After manifest row is updated. |
| Section 5 Recording / Screenshots | After visual artifacts are captured and reviewed. |
| Section 6 Permission / Test Asset Proof | After proof artifacts are collected. |
| Section 7 Engineering Evidence | After callback, dry-run, guard, rollback/fallback evidence is collected. |
| Section 8 Redaction Gate | During security review. |
| Section 9 Final Package | After redaction gate Pass. |
| Section 10 Quarantine | Whenever any artifact is excluded or replaced. |
| Section 11 Backfill | After run is reviewed. |
| Section 12 Internal Beta Decision | After all artifact gates are reviewed. |

Fill-in rule:

```text
Do not mark a section Pass because the artifact exists. Mark Pass only after owner, reviewer, version, manifest row, redaction result, and final package status are complete.
```

## 13. Final Package Procedure

Before copying any artifact into `11_final_package/`, confirm:

| Check | Required result |
| --- | --- |
| Artifact ID exists. | Yes |
| Filename follows spec. | Yes |
| Owner is filled. | Yes |
| Reviewer is filled. | Yes |
| Version is filled. | `vNN` |
| Manifest row is complete. | Yes |
| Visual review is complete, if required. | Pass |
| Text search is complete, if required. | Pass |
| Finding count is recorded. | Yes |
| Unresolved finding count is zero. | Yes |
| Redaction gate is Pass. | Pass |
| Final package path is exact. | Yes |

Final package rule:

```text
Only exact redaction-passed versions can enter 11_final_package/.
```

## 14. Go / Hold Decision Routing

After collection and redaction review, route the decision.

| Condition | Decision |
| --- | --- |
| All artifacts collected, reviewed, redaction-passed, packaged, and signed. | Internal beta Go can be considered. |
| Any artifact missing. | Hold |
| Any redaction finding unresolved. | Hold |
| Any recording or screenshot unreviewed. | Hold |
| Any manifest row incomplete. | Hold |
| Any owner/reviewer/version missing. | Hold |
| Any rollback/fallback proof missing. | Hold |
| Any production write or token exchange happened. | Hold and escalate |
| Any env, Prisma, Supabase migration, OAuth, callback, or login button change required. | Hold and create separate approval task |

Current decision:

```text
Internal beta: Hold
App Review submission preparation: Hold
Production implementation: No-Go
```

## 15. Backfill Procedure

After the operator run is complete, backfill these documents.

| Document | Backfill action |
| --- | --- |
| `docs/meta-business-login-internal-beta-artifact-collection-first-execution-blank-run.md` | Fill actual run results and final Go/Hold decision. |
| `docs/meta-business-login-internal-beta-real-artifact-collection-execution-checklist.md` | Mark steps Pass / Hold / Fail and link run ID. |
| `docs/meta-business-login-internal-beta-artifact-manifest-template.md` | Fill or copy into run-specific manifest. |
| `docs/meta-business-login-internal-beta-artifact-folder-structure-spec.md` | Record folder structure exceptions, if any. |
| `docs/meta-business-login-internal-beta-real-evidence-execution-report-blank-run.md` | Link artifact paths and evidence summary. |
| `docs/meta-business-login-internal-beta-real-evidence-execution-plan.md` | Mark execution plan items Pass / Hold / Fail. |
| `docs/meta-business-login-final-redaction-search-execution-report-template.md` | Fill final redaction report. |
| `docs/meta-business-login-internal-beta-evidence-execution-report-template.md` | Summarize evidence execution. |
| `docs/meta-business-login-internal-beta-final-package-gate-review-template.md` | Record final package gate result. |
| `docs/meta-business-login-internal-beta-release-sign-off-checklist.md` | Record whether sign-off can start. |
| `docs/meta-business-login-internal-beta-release-decision-memo-template.md` | Record internal beta Go / Hold decision. |
| `docs/meta-business-login-sandbox-go-no-go-checklist.md` | Update internal beta gate status. |
| `docs/meta-app-review-checklist.md` | Update App Review readiness. |
| `docs/security-review.md` | Update redaction and guard posture. |
| `docs/fix-roadmap.md` | Add remaining blockers after current unrelated edits are resolved. |
| `docs/codex-session-log.md` | Add session result after current unrelated edits are resolved. |

## 16. Explicit Restrictions

Do not perform these actions while using this runbook:

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

## 17. Final Runbook Status

```text
Operator runbook: Ready
Artifact collection executed: No
Manifest filled: No
Final package assembled: No
Final redaction report executed: No
Internal beta: Hold
App Review submission preparation: Hold
Production implementation: No-Go
```
