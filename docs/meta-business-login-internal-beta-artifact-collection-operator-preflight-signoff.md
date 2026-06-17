# Meta Business Login Internal Beta Artifact Collection Operator Preflight Sign-Off

Date: 2026-06-18
Status: Preflight sign-off sheet / artifact collection not approved / internal beta Hold / App Review submission preparation Hold / production implementation No-Go

## Scope

This sign-off sheet records whether the first Meta Business Login / Instagram Business Login internal beta artifact collection operator run can start.

Source runbook:

```text
docs/meta-business-login-internal-beta-first-artifact-collection-operator-runbook.md
```

This sign-off sheet is a preflight gate only. It does not approve internal beta, App Review submission preparation, or production implementation.

This sign-off sheet does not change:

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
Do not run Supabase migration or db push for this preflight sign-off.
Before any future Supabase migration or db push, first show current project_id, linked project, and Supabase account email, then wait for explicit confirmation.
```

Sensitive data rule:

```text
Do not record raw token, authorization code, raw state, raw nonce, full callback URL, app secret, client secret, webhook verify token, API key, database URL, Supabase key, cookie, browser storage, credential, OTP, unmasked asset ID, or real customer data in this sign-off sheet.
```

## 1. Preflight Metadata

| Field | Value |
| --- | --- |
| Preflight sign-off ID | `IBE-PREFLIGHT-SIGNOFF-YYYYMMDD-NNN` |
| Target artifact run ID | `IBE-RUN-YYYYMMDD-NNN` |
| Source runbook version |  |
| Source blank run path | `docs/meta-business-login-internal-beta-artifact-collection-first-execution-blank-run.md` |
| Target artifact package root | `meta-business-login-internal-beta-artifacts/IBE-RUN-YYYYMMDD-NNN/` |
| Target manifest path |  |
| Preflight date |  |
| Preflight owner |  |
| Release owner |  |
| App Review owner |  |
| Product owner |  |
| Engineering owner |  |
| Operations owner |  |
| Security reviewer |  |
| Internal beta decision before preflight | Hold |
| App Review submission preparation decision before preflight | Hold |
| Production implementation decision before preflight | No-Go |
| Final preflight decision | Hold |

Preflight safety assertion:

```text
This preflight does not run migrations, change product code, change production OAuth/callback/button/env/Prisma, create production ConnectedAccount/Channel records, register webhooks, start channel sync, perform real Meta token exchange, or store tokens.
```

## 2. Required Source Documents

Every document below must be available before artifact collection starts.

| Document | Required status | Reviewed by | Actual status | Decision |
| --- | --- | --- | --- | --- |
| `docs/meta-business-login-internal-beta-first-artifact-collection-operator-runbook.md` | Ready | release-owner |  | Hold |
| `docs/meta-business-login-internal-beta-artifact-collection-first-execution-blank-run.md` | Ready | release-owner |  | Hold |
| `docs/meta-business-login-internal-beta-real-artifact-collection-execution-checklist.md` | Ready | release-owner |  | Hold |
| `docs/meta-business-login-internal-beta-artifact-folder-structure-spec.md` | Ready | operations-owner |  | Hold |
| `docs/meta-business-login-internal-beta-artifact-manifest-template.md` | Ready | security-reviewer |  | Hold |
| `docs/meta-business-login-final-redaction-search-execution-report-template.md` | Ready | security-reviewer |  | Hold |
| `docs/meta-business-login-final-permission-usage-proof-matrix.md` | Ready | product-owner |  | Hold |
| `docs/meta-business-login-final-reviewer-recording-shot-list.md` | Ready | app-review-owner |  | Hold |
| `docs/meta-business-login-sandbox-sbl13-workspace-linking-sync-dry-run.md` | Evidence reference available | engineering-owner |  | Hold |
| `docs/meta-business-login-sandbox-controlled-consent-run-2026-06-16.md` | Evidence reference available | engineering-owner |  | Hold |

Document gate rule:

```text
Artifact collection cannot start if any required source document is missing, stale, or not reviewed by the assigned role.
```

## 3. Role Assignment Sign-Off

Use role markers only. Do not write personal email addresses or unmasked user IDs.

| Role | Required responsibility | Assigned role marker | Sign-off status | Notes |
| --- | --- | --- | --- | --- |
| Release owner | Own run timing, Go/Hold routing, rollback owner assignment, final package handoff. | `release-owner` | Hold |  |
| App Review owner | Capture reviewer recording, screenshots, scope reconciliation, App Review package evidence. | `app-review-owner` | Hold |  |
| Product owner | Verify permission proof, product screens, user actions, retention/deletion explanations. | `product-owner` | Hold |  |
| Engineering owner | Capture callback, workspace linking, channel sync, guard tests, token exchange guard evidence. | `engineering-owner` | Hold |  |
| Operations owner | Capture test asset proof, fallback proof, rollback proof, allowlist/role evidence. | `operations-owner` | Hold |  |
| Security reviewer | Review recordings, screenshots, logs, test output, redaction report, quarantine decisions. | `security-reviewer` | Hold |  |

Role separation gate:

```text
Redaction-critical artifacts require owner and reviewer separation before the run can start.
```

## 4. Safety Boundary Sign-Off

Every boundary must be Pass before artifact collection starts.

| Boundary | Required result | Owner | Actual result | Decision |
| --- | --- | --- | --- | --- |
| No Supabase migration. | No migration and no `db push`. | release-owner |  | Pass |
| No product functionality code change. | No application behavior changes. | engineering-owner |  | Pass |
| No OAuth flow change. | Production OAuth flow remains unchanged. | engineering-owner |  | Pass |
| No callback route change. | Production callback route remains unchanged. | engineering-owner |  | Pass |
| No login button change. | Production login button remains unchanged. | product-owner |  | Pass |
| No env change. | No env files or dashboard env values changed. | release-owner |  | Pass |
| No Prisma schema change. | No schema or migration changes. | engineering-owner |  | Pass |
| No production ConnectedAccount write. | No production ConnectedAccount create/update/delete. | engineering-owner |  | Pass |
| No production Channel write. | No production Channel create/update/delete. | engineering-owner |  | Pass |
| No webhook registration. | No production webhook registration. | engineering-owner |  | Pass |
| No channel sync start. | No production channel sync. | engineering-owner |  | Pass |
| No real Meta token exchange. | `exchangeAttempted=false` remains required. | engineering-owner |  | Pass |
| No token storage. | No access/refresh token stored. | engineering-owner |  | Pass |

Stop rule:

```text
If any boundary requires a real product, env, schema, migration, token exchange, or production write change, artifact collection must stay Hold and a separate approval task must be created.
```

## 5. Artifact Package Setup Sign-Off

| Check | Required result | Owner | Actual result | Decision |
| --- | --- | --- | --- | --- |
| Run ID assigned. | `IBE-RUN-YYYYMMDD-NNN` | release-owner |  | Hold |
| Artifact package root selected. | `meta-business-login-internal-beta-artifacts/{run_id}/` | operations-owner |  | Hold |
| `00_manifest/` prepared. | Exists or is ready to create. | operations-owner |  | Hold |
| `01_reviewer_recording/` prepared. | Exists or is ready to create. | app-review-owner |  | Hold |
| `02_screenshots/` prepared. | Exists or is ready to create. | app-review-owner |  | Hold |
| `03_permission_proof/` prepared. | Exists or is ready to create. | product-owner |  | Hold |
| `04_test_asset_proof/` prepared. | Exists or is ready to create. | operations-owner |  | Hold |
| `05_callback_evidence/` prepared. | Exists or is ready to create. | engineering-owner |  | Hold |
| `06_workspace_linking_dry_run/` prepared. | Exists or is ready to create. | engineering-owner |  | Hold |
| `07_channel_sync_dry_run/` prepared. | Exists or is ready to create. | engineering-owner |  | Hold |
| `08_guard_test_output/` prepared. | Exists or is ready to create. | engineering-owner |  | Hold |
| `09_rollback_fallback/` prepared. | Exists or is ready to create. | operations-owner |  | Hold |
| `10_redaction_report/` prepared. | Exists or is ready to create. | security-reviewer |  | Hold |
| `11_final_package/` starts empty. | Empty at run start. | release-owner |  | Hold |
| `quarantine_do_not_package/` prepared. | Exists or is ready to create. | security-reviewer |  | Hold |

Package setup rule:

```text
Final package must start empty. Draft, failed, uncertain, or unreviewed artifacts must never be placed directly into 11_final_package/.
```

## 6. Artifact Collection Scope Sign-Off

The operator may collect only these artifacts during this run.

| Artifact ID | Artifact | Owner | Reviewer | Approved to collect? | Notes |
| --- | --- | --- | --- | --- | --- |
| IBE-ART-01 | Reviewer recording | app-review-owner | security-reviewer | Hold |  |
| IBE-ART-02 | Screenshot package | app-review-owner | security-reviewer | Hold |  |
| IBE-ART-03 | Permission proof matrix | product-owner | app-review-owner | Hold |  |
| IBE-ART-04 | Test asset proof | operations-owner | security-reviewer | Hold |  |
| IBE-ART-05 | Scope reconciliation | app-review-owner | product-owner | Hold |  |
| IBE-ART-06 | Redacted callback evidence | engineering-owner | security-reviewer | Hold |  |
| IBE-ART-07 | Workspace linking dry-run evidence | engineering-owner | security-reviewer | Hold |  |
| IBE-ART-08 | Channel sync dry-run evidence | engineering-owner | security-reviewer | Hold |  |
| IBE-ART-09 | Production write guard output | engineering-owner | security-reviewer | Hold |  |
| IBE-ART-10 | Token exchange guard evidence | engineering-owner | security-reviewer | Hold |  |
| IBE-ART-11 | Rollback / fallback proof | operations-owner | release-owner | Hold |  |
| IBE-ART-12 | Redaction execution report | security-reviewer | release-owner | Hold |  |

Scope rule:

```text
Any artifact outside this table requires a separate preflight update before collection.
```

## 7. Redaction Preflight Sign-Off

| Check | Required result | Security reviewer decision |
| --- | --- | --- |
| Redaction search categories are defined. | Token, secret, code, state, nonce, callback URL, unmasked asset ID, browser storage, credential, OTP, customer data. | Hold |
| Visual review owner is assigned. | security-reviewer. | Hold |
| Recording review process is defined. | Review before final packaging. | Hold |
| Screenshot review process is defined. | Review before final packaging. | Hold |
| Test output search process is defined. | Search before final packaging. | Hold |
| False positive rules are defined. | Redacted markers, synthetic fixtures, generic field names, documentation examples only. | Hold |
| Quarantine folder is ready. | `quarantine_do_not_package/`. | Hold |
| Replacement version rule is accepted. | New sanitized version, never overwrite reviewed artifact. | Hold |
| Final package entry rule is accepted. | Redaction gate Pass and unresolved finding count `0`. | Hold |

Redaction stop rule:

```text
If any artifact contains a real sensitive value, quarantine it and keep internal beta at Hold until a sanitized replacement passes review.
```

## 8. Operator Stop Conditions

The operator must stop the run and mark preflight or execution Hold if any condition occurs.

| Stop condition | Required response | Owner |
| --- | --- | --- |
| Supabase migration or `db push` becomes necessary. | Stop and request explicit confirmation after displaying project_id, linked project, and account email. | release-owner |
| Production OAuth flow change becomes necessary. | Stop and create separate approval task. | engineering-owner |
| Callback route change becomes necessary. | Stop and create separate approval task. | engineering-owner |
| Login button change becomes necessary. | Stop and create separate approval task. | product-owner |
| Env change becomes necessary. | Stop and create separate approval task. | release-owner |
| Prisma schema change becomes necessary. | Stop and create separate approval task. | engineering-owner |
| Real Meta token exchange occurs or becomes necessary. | Stop, quarantine evidence, and open security review. | engineering-owner |
| Production ConnectedAccount / Channel write occurs or becomes necessary. | Stop, quarantine evidence, and open security review. | engineering-owner |
| Raw token/code/state/nonce/full callback URL/secret appears. | Stop, quarantine artifact, create sanitized replacement. | security-reviewer |
| Unmasked asset ID or real customer data appears. | Stop, quarantine artifact, create sanitized replacement. | security-reviewer |
| Rollback requires env/schema/migration/product data cleanup. | Stop and open separate risk review. | release-owner |

## 9. Preflight Sign-Off Table

All sign-offs must be Pass before the artifact collection run can start.

| Sign-off area | Required signer | Required result | Actual result | Decision |
| --- | --- | --- | --- | --- |
| Source documents reviewed. | release-owner | Pass |  | Hold |
| Role assignments complete. | release-owner | Pass |  | Hold |
| Safety boundaries accepted. | release-owner | Pass |  | Hold |
| Artifact package setup ready. | operations-owner | Pass |  | Hold |
| Artifact collection scope approved. | release-owner | Pass |  | Hold |
| Reviewer recording/screenshot plan approved. | app-review-owner | Pass |  | Hold |
| Permission proof plan approved. | product-owner | Pass |  | Hold |
| Engineering evidence plan approved. | engineering-owner | Pass |  | Hold |
| Rollback / fallback plan approved. | operations-owner | Pass |  | Hold |
| Redaction process approved. | security-reviewer | Pass |  | Hold |
| Quarantine process approved. | security-reviewer | Pass |  | Hold |
| Final package entry process approved. | release-owner | Pass |  | Hold |

Final preflight rule:

```text
Artifact collection can start only when every sign-off area is Pass.
Any Hold, Fail, missing owner, missing reviewer, unclear scope, or unresolved safety boundary keeps collection at Hold.
```

## 10. Preflight Decision

Allowed decisions:

```text
Go
Hold
Fail
```

Decision criteria:

| Decision | Criteria | Next action |
| --- | --- | --- |
| Go | Every required preflight sign-off is Pass and all safety boundaries are accepted. | Start artifact collection using the operator runbook. |
| Hold | Any sign-off is incomplete, unclear, or not reviewed. | Resolve missing preflight items and re-review. |
| Fail | A required boundary cannot be met without product/code/env/schema/migration/token/write changes. | Stop and create separate approval task. |

Current decision:

```text
Artifact collection preflight: Hold
Internal beta: Hold
App Review submission preparation: Hold
Production implementation: No-Go
```

## 11. Backfill After Preflight

After this preflight is completed, backfill:

| Document | Required update |
| --- | --- |
| `docs/meta-business-login-internal-beta-artifact-collection-operator-preflight-signoff.md` | Fill actual preflight status and final decision. |
| `docs/meta-business-login-internal-beta-first-artifact-collection-operator-runbook.md` | Link sign-off result and any operator stop conditions. |
| `docs/meta-business-login-internal-beta-artifact-collection-first-execution-blank-run.md` | Fill pre-execution checklist only if preflight is Go. |
| `docs/meta-business-login-internal-beta-real-artifact-collection-execution-checklist.md` | Update collection readiness. |
| `docs/meta-business-login-sandbox-go-no-go-checklist.md` | Update internal beta artifact collection preflight gate. |
| `docs/meta-app-review-checklist.md` | Update App Review readiness if preflight changes package status. |
| `docs/security-review.md` | Update redaction and stop-condition posture. |
| `docs/fix-roadmap.md` | Add remaining blockers after current unrelated edits are resolved. |
| `docs/codex-session-log.md` | Add session result after current unrelated edits are resolved. |

## 12. Explicit Restrictions

Do not perform these actions while using this sign-off sheet:

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

## 13. Final Sign-Off Sheet Status

```text
Operator preflight sign-off sheet: Ready
Preflight executed: No
Artifact collection approved: No
Artifact collection decision: Hold
Internal beta: Hold
App Review submission preparation: Hold
Production implementation: No-Go
```
