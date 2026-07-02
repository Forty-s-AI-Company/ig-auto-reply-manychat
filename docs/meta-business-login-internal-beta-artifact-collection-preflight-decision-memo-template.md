# Meta Business Login Internal Beta Artifact Collection Preflight Decision Memo Template

Date: 2026-06-18
Status: Preflight decision memo template / preflight decision not signed / artifact collection Hold / internal beta Hold / App Review submission preparation Hold / production implementation No-Go

## Scope

This memo template records the Go / Hold / Fail decision after the Meta Business Login / Instagram Business Login internal beta artifact collection preflight execution report is completed.

Source execution report:

```text
docs/meta-business-login-internal-beta-artifact-collection-preflight-execution-report-template.md
```

This memo can approve the start of artifact collection only. It does not approve internal beta launch, App Review submission preparation, or production implementation.

This memo does not change:

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
Do not run Supabase migration or db push for this decision memo.
Before any future Supabase migration or db push, first show current project_id, linked project, and Supabase account email, then wait for explicit confirmation.
```

Sensitive data rule:

```text
Do not record raw token, authorization code, raw state, raw nonce, full callback URL, app secret, client secret, webhook verify token, API key, database URL, Supabase key, cookie, browser storage, credential, OTP, unmasked asset ID, or real customer data in this memo.
```

## 1. Decision Memo Metadata

| Field | Value |
| --- | --- |
| Decision memo ID | `IBE-PREFLIGHT-DECISION-YYYYMMDD-NNN` |
| Source preflight execution report ID | `IBE-PREFLIGHT-EXEC-YYYYMMDD-NNN` |
| Source preflight sign-off ID | `IBE-PREFLIGHT-SIGNOFF-YYYYMMDD-NNN` |
| Target artifact run ID | `IBE-RUN-YYYYMMDD-NNN` |
| Memo date |  |
| Memo owner |  |
| Release owner |  |
| App Review owner |  |
| Product owner |  |
| Engineering owner |  |
| Operations owner |  |
| Security reviewer |  |
| Target artifact package root | `meta-business-login-internal-beta-artifacts/IBE-RUN-YYYYMMDD-NNN/` |
| Target manifest path |  |
| Preflight execution final decision | Hold |
| Memo final decision | Hold |
| Artifact collection approved to start | No |
| Internal beta decision | Hold |
| App Review submission preparation decision | Hold |
| Production implementation decision | No-Go |

Decision safety assertion:

```text
This decision memo does not approve migrations, product code changes, production OAuth/callback/button/env/Prisma changes, production ConnectedAccount/Channel writes, webhook registration, production channel sync, real Meta token exchange, or token storage.
```

## 2. Preflight Execution Summary

| Area | Required result for Go | Actual result | Blocking finding count | Decision |
| --- | --- | --- | --- | --- |
| Source documents reviewed. | Pass |  |  | Hold |
| Role assignments complete. | Pass |  |  | Hold |
| Owner/reviewer separation valid. | Pass |  |  | Hold |
| Safety boundaries accepted. | Pass |  |  | Hold |
| Artifact package setup ready. | Pass |  |  | Hold |
| Artifact collection scope approved. | Pass |  |  | Hold |
| Reviewer recording/screenshot plan approved. | Pass |  |  | Hold |
| Permission proof plan approved. | Pass |  |  | Hold |
| Engineering evidence plan approved. | Pass |  |  | Hold |
| Rollback / fallback plan approved. | Pass |  |  | Hold |
| Redaction process approved. | Pass |  |  | Hold |
| Quarantine process approved. | Pass |  |  | Hold |
| Final package entry process approved. | Pass |  |  | Hold |
| Stop condition review. | No stop condition occurred. |  |  | Hold |
| Findings / remediation review. | No unresolved blocking finding. |  |  | Hold |

Summary rule:

```text
The memo can record Go only when every required preflight execution area is Pass and no blocking finding remains unresolved.
```

## 3. Safety Boundary Decision

Every safety boundary must remain Pass for Go.

| Boundary | Required result | Preflight result | Memo decision |
| --- | --- | --- | --- |
| No Supabase migration. | Pass |  | Hold |
| No Supabase `db push`. | Pass |  | Hold |
| No product functionality code change. | Pass |  | Hold |
| No production OAuth flow change. | Pass |  | Hold |
| No callback route change. | Pass |  | Hold |
| No login button change. | Pass |  | Hold |
| No environment variable change. | Pass |  | Hold |
| No Prisma schema change. | Pass |  | Hold |
| No production ConnectedAccount write. | Pass |  | Hold |
| No production Channel write. | Pass |  | Hold |
| No webhook registration. | Pass |  | Hold |
| No production channel sync start. | Pass |  | Hold |
| No real Meta token exchange. | Pass |  | Hold |
| No token storage. | Pass |  | Hold |

Boundary decision rule:

```text
Any failed or uncertain boundary keeps this memo at Hold or Fail.
```

## 4. Artifact Collection Authorization Scope

If this memo records Go, only these artifacts are authorized for collection.

| Artifact ID | Artifact | Authorized owner | Required reviewer | Authorized? | Notes |
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

Authorization scope rule:

```text
Go authorizes only artifact collection for the listed artifacts.
Go does not authorize internal beta launch, App Review submission preparation, production implementation, real token exchange, or production writes.
```

## 5. Findings And Remediation Decision

| Finding ID | Area | Severity | Source report status | Required remediation | Owner | Memo decision |
| --- | --- | --- | --- | --- | --- | --- |
| IBE-PF-FIND-001 |  |  |  |  |  | Open |
| IBE-PF-FIND-002 |  |  |  |  |  | Open |
| IBE-PF-FIND-003 |  |  |  |  |  | Open |

Finding decision rule:

```text
Any unresolved Critical or High finding blocks Go.
Any unresolved Medium finding requires explicit acceptance by release-owner and security-reviewer before Go.
```

## 6. Go Decision Conditions

The memo may record Go only if all conditions are true.

| Condition | Required result | Actual result | Decision |
| --- | --- | --- | --- |
| Preflight execution report final decision is Go. | Go |  | Hold |
| Every required source document is reviewed. | Pass |  | Hold |
| Every required role is assigned. | Pass |  | Hold |
| Owner/reviewer separation is valid. | Pass |  | Hold |
| Every safety boundary is Pass. | Pass |  | Hold |
| Artifact package root is ready. | Pass |  | Hold |
| Final package folder starts empty. | Pass |  | Hold |
| Quarantine folder is ready. | Pass |  | Hold |
| Authorized artifact scope is complete. | Pass |  | Hold |
| Redaction process is approved. | Pass |  | Hold |
| Stop condition review is Pass. | Pass |  | Hold |
| No unresolved blocking finding remains. | Pass |  | Hold |
| Release owner signs Go. | Pass |  | Hold |
| Security reviewer signs Go. | Pass |  | Hold |

Go condition rule:

```text
If any condition is Hold, Fail, missing, or unclear, final memo decision must be Hold or Fail.
```

## 7. Hold Decision Conditions

Use Hold when the run is not ready but can be retried after remediation.

| Hold reason | Applies? | Owner | Required action before retry |
| --- | --- | --- | --- |
| Source document missing or stale. |  | release-owner | Review or update source document. |
| Role assignment incomplete. |  | release-owner | Assign role marker. |
| Owner/reviewer separation unclear. |  | security-reviewer | Reassign reviewer or owner. |
| Artifact folder setup incomplete. |  | operations-owner | Prepare folder structure. |
| Artifact scope unclear. |  | release-owner | Clarify authorized artifacts. |
| Redaction process incomplete. |  | security-reviewer | Complete redaction process definition. |
| Quarantine process incomplete. |  | security-reviewer | Complete quarantine process. |
| Findings require remediation. |  | assigned owner | Resolve and retest/re-review. |
| Non-blocking stop condition uncertainty exists. |  | release-owner | Resolve uncertainty and re-run preflight. |

Hold rule:

```text
Hold does not authorize artifact collection.
```

## 8. Fail Decision Conditions

Use Fail when a required boundary cannot be met.

| Fail reason | Applies? | Required response |
| --- | --- | --- |
| Supabase migration or `db push` is required. |  | Stop and create a separate approval request after displaying project_id, linked project, and account email. |
| Product functionality code change is required. |  | Stop and create a separate implementation task. |
| Production OAuth flow change is required. |  | Stop and create a separate approval task. |
| Callback route change is required. |  | Stop and create a separate approval task. |
| Login button change is required. |  | Stop and create a separate approval task. |
| Env change is required. |  | Stop and create a separate approval task. |
| Prisma schema change is required. |  | Stop and create a separate approval task. |
| Real Meta token exchange is required. |  | Stop and open security/App Review review. |
| Production ConnectedAccount / Channel write is required. |  | Stop and open production implementation review. |
| Webhook registration or production sync is required. |  | Stop and open production implementation review. |
| Sensitive data already appeared in preflight evidence. |  | Quarantine evidence and open security review. |

Fail rule:

```text
Fail blocks artifact collection until a separate approved task resolves the boundary issue.
```

## 9. Final Decision

Allowed final decisions:

```text
Go
Hold
Fail
```

| Field | Value |
| --- | --- |
| Final memo decision | Hold |
| Artifact collection approved to start | No |
| Decision date |  |
| Decision owner |  |
| Required follow-up before artifact collection |  |
| Required escalation before retry |  |

Decision summary:

```text
Artifact collection preflight decision: Hold
Artifact collection approved to start: No
Internal beta: Hold
App Review submission preparation: Hold
Production implementation: No-Go
```

## 10. Sign-Off Fields

Use role markers only. Do not write personal email addresses.

| Sign-off role | Required for Go? | Decision | Role marker | Date | Notes |
| --- | --- | --- | --- | --- | --- |
| Release owner | Yes | Hold | `release-owner` |  |  |
| Security reviewer | Yes | Hold | `security-reviewer` |  |  |
| Engineering owner | Yes | Hold | `engineering-owner` |  |  |
| Operations owner | Yes | Hold | `operations-owner` |  |  |
| App Review owner | Yes | Hold | `app-review-owner` |  |  |
| Product owner | Yes | Hold | `product-owner` |  |  |

Sign-off rule:

```text
Go requires every required sign-off to be Pass/Go.
```

## 11. Backfill After Decision

After this memo is filled, backfill:

| Document | Required update |
| --- | --- |
| `docs/meta-business-login-internal-beta-artifact-collection-preflight-decision-memo-template.md` | Fill final memo decision and sign-offs. |
| `docs/meta-business-login-internal-beta-artifact-collection-preflight-execution-report-template.md` | Link this memo and update final decision. |
| `docs/meta-business-login-internal-beta-artifact-collection-operator-preflight-signoff.md` | Link decision memo and update final preflight state. |
| `docs/meta-business-login-internal-beta-first-artifact-collection-operator-runbook.md` | Link Go/Hold/Fail decision and operator next action. |
| `docs/meta-business-login-internal-beta-artifact-collection-first-execution-blank-run.md` | Fill pre-execution checklist only if memo decision is Go. |
| `docs/meta-business-login-internal-beta-real-artifact-collection-execution-checklist.md` | Update artifact collection readiness. |
| `docs/meta-business-login-sandbox-go-no-go-checklist.md` | Update artifact collection preflight decision. |
| `docs/meta-app-review-checklist.md` | Update App Review readiness only if package readiness changes. |
| `docs/security-review.md` | Update preflight boundary and redaction posture. |
| `docs/fix-roadmap.md` | Add remaining blockers after current unrelated edits are resolved. |
| `docs/codex-session-log.md` | Add session result after current unrelated edits are resolved. |

## 12. Production Implementation Still Cannot Start

Production implementation remains No-Go after this memo is created or filled.

Reasons:

- This memo can approve artifact collection only.
- Artifact collection has not been executed.
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

Do not perform these actions while using or filling this memo:

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

## 14. Final Memo Template Status

```text
Preflight decision memo template: Ready
Decision memo completed: No
Artifact collection approved to start: No
Artifact collection preflight decision: Hold
Internal beta: Hold
App Review submission preparation: Hold
Production implementation: No-Go
```
