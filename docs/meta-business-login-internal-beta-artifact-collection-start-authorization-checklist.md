# Meta Business Login Internal Beta Artifact Collection Start Authorization Checklist

Date: 2026-06-18
Status: Start authorization checklist / artifact collection not authorized / internal beta Hold / App Review submission preparation Hold / production implementation No-Go

## Scope

This checklist is the final start authorization gate before the Meta Business Login / Instagram Business Login internal beta artifact collection run begins.

Source decision memo:

```text
docs/meta-business-login-internal-beta-artifact-collection-preflight-decision-memo-template.md
```

This checklist can authorize only the start of artifact collection after the preflight decision memo records Go. It does not approve internal beta launch, App Review submission preparation, or production implementation.

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
Do not run Supabase migration or db push for this start authorization.
Before any future Supabase migration or db push, first show current project_id, linked project, and Supabase account email, then wait for explicit confirmation.
```

Sensitive data rule:

```text
Do not record raw token, authorization code, raw state, raw nonce, full callback URL, app secret, client secret, webhook verify token, API key, database URL, Supabase key, cookie, browser storage, credential, OTP, unmasked asset ID, or real customer data in this checklist.
```

## 1. Authorization Metadata

| Field | Value |
| --- | --- |
| Start authorization ID | `IBE-START-AUTH-YYYYMMDD-NNN` |
| Source decision memo ID | `IBE-PREFLIGHT-DECISION-YYYYMMDD-NNN` |
| Source preflight execution report ID | `IBE-PREFLIGHT-EXEC-YYYYMMDD-NNN` |
| Source preflight sign-off ID | `IBE-PREFLIGHT-SIGNOFF-YYYYMMDD-NNN` |
| Target artifact run ID | `IBE-RUN-YYYYMMDD-NNN` |
| Authorization date |  |
| Authorization owner |  |
| Release owner |  |
| Security reviewer |  |
| Engineering owner |  |
| Operations owner |  |
| App Review owner |  |
| Product owner |  |
| Target artifact package root | `meta-business-login-internal-beta-artifacts/IBE-RUN-YYYYMMDD-NNN/` |
| Target manifest path |  |
| Decision memo final decision | Hold |
| Artifact collection approved to start | No |
| Internal beta decision | Hold |
| App Review submission preparation decision | Hold |
| Production implementation decision | No-Go |

Authorization safety assertion:

```text
This authorization does not approve migrations, product code changes, production OAuth/callback/button/env/Prisma changes, production ConnectedAccount/Channel writes, webhook registration, production channel sync, real Meta token exchange, or token storage.
```

## 2. Required Go Evidence

Artifact collection can start only when every source decision is Go or Pass.

| Required evidence | Required result | Actual result | Decision |
| --- | --- | --- | --- |
| Preflight execution report completed. | Yes |  | Hold |
| Preflight execution report final decision. | Go |  | Hold |
| Preflight decision memo completed. | Yes |  | Hold |
| Preflight decision memo final decision. | Go |  | Hold |
| Artifact collection approved in decision memo. | Yes |  | Hold |
| Required sign-offs completed. | Pass / Go |  | Hold |
| No unresolved blocking findings. | Yes |  | Hold |
| No active stop condition. | Yes |  | Hold |

Required evidence rule:

```text
If the preflight execution report or decision memo is Hold or Fail, this start authorization must remain Hold.
```

## 3. Final Safety Boundary Check

Run this check immediately before artifact collection starts.

| Boundary | Required result | Actual result | Start decision |
| --- | --- | --- | --- |
| No Supabase migration. | Pass |  | Pass |
| No Supabase `db push`. | Pass |  | Pass |
| No product functionality code change. | Pass |  | Pass |
| No production OAuth flow change. | Pass |  | Pass |
| No callback route change. | Pass |  | Pass |
| No login button change. | Pass |  | Pass |
| No environment variable change. | Pass |  | Pass |
| No Prisma schema change. | Pass |  | Pass |
| No production ConnectedAccount write. | Pass |  | Pass |
| No production Channel write. | Pass |  | Pass |
| No webhook registration. | Pass |  | Pass |
| No production channel sync start. | Pass |  | Pass |
| No real Meta token exchange. | Pass |  | Pass |
| No token storage. | Pass |  | Pass |

Boundary rule:

```text
Any boundary that is not Pass blocks artifact collection start.
```

## 4. Artifact Run Readiness

| Check | Required result | Actual result | Decision |
| --- | --- | --- | --- |
| Run ID assigned. | `IBE-RUN-YYYYMMDD-NNN` |  | Hold |
| Artifact package root confirmed. | `meta-business-login-internal-beta-artifacts/{run_id}/` |  | Hold |
| Manifest path confirmed. | Path recorded |  | Hold |
| Blank run document ready. | `docs/meta-business-login-internal-beta-artifact-collection-first-execution-blank-run.md` |  | Hold |
| Operator runbook ready. | `docs/meta-business-login-internal-beta-first-artifact-collection-operator-runbook.md` |  | Hold |
| Artifact collection checklist ready. | `docs/meta-business-login-internal-beta-real-artifact-collection-execution-checklist.md` |  | Hold |
| Folder structure spec ready. | `docs/meta-business-login-internal-beta-artifact-folder-structure-spec.md` |  | Hold |
| Manifest template ready. | `docs/meta-business-login-internal-beta-artifact-manifest-template.md` |  | Hold |
| Final redaction report template ready. | `docs/meta-business-login-final-redaction-search-execution-report-template.md` |  | Hold |
| Final package folder starts empty. | Yes |  | Hold |
| Quarantine folder is ready. | Yes |  | Hold |

Run readiness rule:

```text
Do not start collection until the blank run, manifest, final package folder, and quarantine folder are all ready.
```

## 5. Authorized Artifact Scope

Only these artifacts may be collected after start authorization is Go.

| Artifact ID | Artifact | Authorized owner | Required reviewer | Start authorized? | Notes |
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
Do not collect artifacts outside this table unless a new preflight decision memo authorizes the scope change.
```

## 6. Operator Start Checklist

The operator must complete these checks at the start of the run.

| Step | Operator action | Required result | Status |
| --- | --- | --- | --- |
| 1 | Open blank run document. | Blank run ready for live updates. | Hold |
| 2 | Open operator runbook. | Runbook available during collection. | Hold |
| 3 | Open manifest template or run manifest. | Manifest ready for artifact rows. | Hold |
| 4 | Confirm artifact folder root. | Root matches target run ID. | Hold |
| 5 | Confirm final package folder empty. | Empty. | Hold |
| 6 | Confirm quarantine folder available. | Available. | Hold |
| 7 | Confirm role owners are present. | Role markers assigned. | Hold |
| 8 | Confirm redaction reviewer is ready. | security-reviewer available. | Hold |
| 9 | Confirm stop conditions are understood. | Operator acknowledges stop rules. | Hold |
| 10 | Confirm first artifact to collect. | IBE-ART-04 test asset proof. | Hold |

Operator start rule:

```text
The first artifact collection step should start with IBE-ART-04 test asset proof unless the runbook is updated by an approved decision memo.
```

## 7. Redaction And Quarantine Readiness

| Check | Required result | Actual result | Decision |
| --- | --- | --- | --- |
| Redaction search categories confirmed. | Pass |  | Hold |
| Recording visual review process confirmed. | Pass |  | Hold |
| Screenshot visual review process confirmed. | Pass |  | Hold |
| Test output search process confirmed. | Pass |  | Hold |
| False positive rules confirmed. | Pass |  | Hold |
| Quarantine folder ready. | Pass |  | Hold |
| Replacement version rule accepted. | Pass |  | Hold |
| Final package entry rule accepted. | Pass |  | Hold |

Quarantine readiness rule:

```text
If quarantine is not ready, artifact collection must not start.
```

## 8. Start Stop Conditions

If any condition is true, do not start artifact collection.

| Stop condition | Occurred? | Required response |
| --- | --- | --- |
| Preflight decision memo is not Go. |  | Keep start authorization Hold. |
| Supabase migration or `db push` is needed. |  | Stop and create separate approval request after showing project_id, linked project, account email. |
| Product functionality code change is needed. |  | Stop and create separate implementation task. |
| Production OAuth flow change is needed. |  | Stop and create separate approval task. |
| Callback route change is needed. |  | Stop and create separate approval task. |
| Login button change is needed. |  | Stop and create separate approval task. |
| Env change is needed. |  | Stop and create separate approval task. |
| Prisma schema change is needed. |  | Stop and create separate approval task. |
| Real Meta token exchange is needed. |  | Stop and open security/App Review review. |
| Production ConnectedAccount / Channel write is needed. |  | Stop and open production implementation review. |
| Webhook registration or production sync is needed. |  | Stop and open production implementation review. |
| Redaction reviewer is unavailable. |  | Keep start authorization Hold. |
| Quarantine folder is unavailable. |  | Keep start authorization Hold. |

Stop condition rule:

```text
Any active stop condition blocks collection start.
```

## 9. Start Authorization Decision

Allowed decisions:

```text
Go
Hold
Fail
```

| Decision | Criteria | Next action |
| --- | --- | --- |
| Go | Decision memo is Go, all source docs are ready, safety boundaries are Pass, folders are ready, artifact scope is authorized, redaction/quarantine are ready, and no stop condition is active. | Start artifact collection with IBE-ART-04. |
| Hold | A required item is incomplete, unclear, not reviewed, or not yet signed. | Resolve and re-run start authorization. |
| Fail | A required boundary cannot be met without product/code/env/schema/migration/token/write changes. | Stop and create separate approval task. |

Current decision:

```text
Artifact collection start authorization: Hold
Artifact collection approved to start: No
Internal beta: Hold
App Review submission preparation: Hold
Production implementation: No-Go
```

## 10. Start Authorization Sign-Off

Use role markers only. Do not write personal email addresses.

| Sign-off role | Required for start Go? | Decision | Role marker | Date | Notes |
| --- | --- | --- | --- | --- | --- |
| Release owner | Yes | Hold | `release-owner` |  |  |
| Security reviewer | Yes | Hold | `security-reviewer` |  |  |
| Engineering owner | Yes | Hold | `engineering-owner` |  |  |
| Operations owner | Yes | Hold | `operations-owner` |  |  |
| App Review owner | Yes | Hold | `app-review-owner` |  |  |
| Product owner | Yes | Hold | `product-owner` |  |  |

Sign-off rule:

```text
Start Go requires every required sign-off to be Pass/Go.
```

## 11. Backfill After Start Authorization

After this checklist is filled, backfill:

| Document | Required update |
| --- | --- |
| `docs/meta-business-login-internal-beta-artifact-collection-start-authorization-checklist.md` | Fill final start authorization decision and sign-offs. |
| `docs/meta-business-login-internal-beta-artifact-collection-preflight-decision-memo-template.md` | Link start authorization result. |
| `docs/meta-business-login-internal-beta-artifact-collection-preflight-execution-report-template.md` | Link start authorization result. |
| `docs/meta-business-login-internal-beta-artifact-collection-operator-preflight-signoff.md` | Link start authorization result. |
| `docs/meta-business-login-internal-beta-first-artifact-collection-operator-runbook.md` | Update next operator action if start is Go. |
| `docs/meta-business-login-internal-beta-artifact-collection-first-execution-blank-run.md` | Fill pre-execution checklist only if start authorization is Go. |
| `docs/meta-business-login-internal-beta-real-artifact-collection-execution-checklist.md` | Update artifact collection start status. |
| `docs/meta-business-login-sandbox-go-no-go-checklist.md` | Update artifact collection start gate. |
| `docs/meta-app-review-checklist.md` | Update App Review readiness only if package collection starts. |
| `docs/security-review.md` | Update redaction/quarantine start posture. |
| `docs/fix-roadmap.md` | Add remaining blockers after current unrelated edits are resolved. |
| `docs/codex-session-log.md` | Add session result after current unrelated edits are resolved. |

## 12. Production Implementation Still Cannot Start

Production implementation remains No-Go after this checklist is created or filled.

Reasons:

- This checklist can authorize artifact collection only.
- Artifact collection has not been completed.
- Final redaction report has not been executed.
- Internal beta is still Hold.
- App Review submission preparation is still Hold.
- App Review has not been submitted or approved.
- Business Verification / Advanced Access status is not confirmed for the final scope set.
- Production env migration plan is not approved.
- Supabase migration or db push has not been reviewed or confirmed for this provider.
- Production OAuth, callback, token exchange, token storage, refresh, revocation, and expiry lifecycle are not approved for this provider.
- Production ConnectedAccount / Channel writes remain intentionally blocked.
- Webhook registration and channel sync lifecycle for real Meta assets are not approved.
- Tenant isolation regression for real Business / Page / IG asset writes is incomplete.
- Production rollback, monitoring, and incident response plan are incomplete.
- Existing Instagram OAuth fallback must remain available until a separate production implementation ADR is approved.

## 13. Explicit Restrictions

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
- Do not store raw token, authorization code, raw state, raw nonce, full callback URL, app secret, client secret, webhook verify token, API key, database URL, Supabase key, cookie, browser storage, credential, OTP, unmasked asset ID, or real customer data.

## 14. Final Checklist Status

```text
Artifact collection start authorization checklist: Ready
Start authorization completed: No
Artifact collection approved to start: No
Artifact collection start authorization: Hold
Internal beta: Hold
App Review submission preparation: Hold
Production implementation: No-Go
```
