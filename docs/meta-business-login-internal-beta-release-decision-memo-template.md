# Meta Business Login Internal Beta Release Decision Memo Template

Date: 2026-06-16
Status: Blank decision memo template / internal beta Hold / production implementation No-Go

## Scope

This memo records the final decision on whether Meta Business Login / Instagram Business Login sandbox can move from internal beta Hold to internal beta Go.

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
Do not run Supabase migration or db push for this release decision memo.
Before any future Supabase migration or db push, record current project_id, linked project, and Supabase account email, then wait for explicit confirmation.
```

Source document:

```text
docs/meta-business-login-internal-beta-evidence-execution-report-template.md
```

Related decision documents:

```text
docs/meta-business-login-internal-beta-evidence-collection-runbook.md
docs/meta-business-login-internal-beta-final-preflight-checklist.md
docs/meta-business-login-final-app-review-package-assembly-checklist.md
docs/meta-business-login-sandbox-go-no-go-checklist.md
```

## 1. Decision Metadata

```text
Decision memo ID:
Decision date:
Decision owner:
Reviewer:
Branch / commit:
Evidence execution report:
Evidence run ID:
Internal beta package version:
App Review package version:
Reviewer workspace marker:
Workspace allowlist version:
Reviewer user role:
Final decision:
  - Internal beta Go
  - Internal beta Hold
Production implementation:
  - No-Go
```

## 2. Evidence Execution Report Summary

Summarize the evidence execution report without copying sensitive values.

```text
Evidence execution report completed: Yes / No
All required evidence sections completed: Yes / No
All findings resolved: Yes / No
Any No-Go finding present: Yes / No
Product owner sign-off present: Yes / No
```

Summary table:

| Evidence area | Result | Key note | Blocking issue |
| --- | --- | --- | --- |
| Package assembly evidence | Pass / Hold / Fail |  | Yes / No |
| Redaction report | Pass / Hold / No-Go |  | Yes / No |
| Reviewer recording | Pass / Hold / Fail |  | Yes / No |
| Screenshots | Pass / Hold / Fail |  | Yes / No |
| Permission proof | Pass / Hold / Fail |  | Yes / No |
| Test asset proof | Pass / Hold / Fail |  | Yes / No |
| Internal-only access | Pass / Hold / Fail |  | Yes / No |
| Workspace allowlist | Pass / Hold / Fail |  | Yes / No |
| User / role gate | Pass / Hold / Fail |  | Yes / No |
| Rollback / fallback | Pass / Hold / Fail |  | Yes / No |
| Production write guard | Pass / Hold / No-Go |  | Yes / No |
| Token exchange guard | Pass / Hold / No-Go |  | Yes / No |

## 3. App Review Package Assembly Gate Result

| Gate | Required result | Actual result | Decision |
| --- | --- | --- | --- |
| Package inventory | All package artifacts are listed and versioned. |  | Pass / Hold / Fail |
| Package file gates | Every file passed source, redaction, visual, no-secret, no-customer-data, rollback, and sign-off gates. |  | Pass / Hold / Fail |
| Scope reconciliation | Meta Dashboard scopes match the final permission proof matrix. |  | Pass / Hold / Fail |
| Package exclusions | Raw recordings, unredacted screenshots, HAR exports, raw logs, env files, browser storage, database dumps, raw Meta responses, and real customer data are excluded or redacted. |  | Pass / Hold / Fail |

Decision:

```text
App Review package assembly gate: Pass / Hold / Fail
Reason:
Required follow-up:
```

## 4. Redaction / Recording / Screenshots / Permission Proof / Test Asset Proof Gate Result

| Gate | Required result | Actual result | Decision |
| --- | --- | --- | --- |
| Redaction report | No raw token, code, secret, raw state, raw nonce, full callback URL, unmasked asset ID, browser storage, or customer data. |  | Pass / Hold / No-Go |
| Reviewer recording | Follows shot list and passes visual redaction. |  | Pass / Hold / Fail |
| Screenshots | Redacted and matched to required evidence areas. |  | Pass / Hold / Fail |
| Permission proof | Every kept permission has product proof and data-use explanation. |  | Pass / Hold / Fail |
| Test asset proof | Business / Page / IG / workspace / reviewer role proof exists with masked identifiers. |  | Pass / Hold / Fail |
| Unsupported scopes | Unsupported scopes are removed or deferred. |  | Pass / Hold / Fail |

Decision:

```text
Evidence proof gates: Pass / Hold / No-Go
Reason:
Required follow-up:
```

## 5. Internal-Only Access / Allowlist / Role Gate Result

| Gate | Required result | Actual result | Decision |
| --- | --- | --- | --- |
| Internal-only entry point | Not linked from production login button or standard channel connect flow. |  | Pass / Hold / Fail |
| Workspace allowlist | Only approved workspaces can access beta. |  | Pass / Hold / Fail |
| Non-allowlisted workspace block | Non-approved workspaces are blocked. |  | Pass / Hold / Fail |
| User / admin role | Only approved admin / tester roles can start beta. |  | Pass / Hold / Fail |
| Non-approved user block | Non-approved users are blocked. |  | Pass / Hold / Fail |
| Audit redaction | Audit evidence uses redacted markers only. |  | Pass / Hold / Fail |
| Public discoverability | Public production users cannot discover or start beta path. |  | Pass / Hold / Fail |

Decision:

```text
Internal-only access gate: Pass / Hold / Fail
Reason:
Required follow-up:
```

## 6. Rollback / Fallback / Production Write Guard / Token Exchange Guard Result

| Gate | Required result | Actual result | Decision |
| --- | --- | --- | --- |
| Disable beta path | Internal beta can be disabled. |  | Pass / Hold / Fail |
| Clear allowlist | Workspace allowlist can be cleared or reduced. |  | Pass / Hold / Fail |
| Existing Instagram OAuth fallback | Existing production flow remains available and unchanged. |  | Pass / Hold / Fail |
| Production login button | Unchanged. |  | Pass / Hold / Fail |
| Env / schema rollback need | No env or Prisma schema change required. |  | Pass / Hold / Fail |
| Production write guard | No production ConnectedAccount / Channel / webhook / sync / token refresh write. |  | Pass / Hold / No-Go |
| Token exchange guard | No real Meta token exchange. |  | Pass / Hold / No-Go |

Decision:

```text
Rollback / fallback / guard gates: Pass / Hold / No-Go
Reason:
Required follow-up:
```

## 7. Internal Beta Go / Hold Decision

Go rule:

```text
Internal beta can become Go only when every gate is Pass and product owner sign-off is recorded.
Any Hold, Fail, or No-Go keeps internal beta at Hold.
```

Decision record:

```text
Internal beta decision:
  - Go
  - Hold

Decision reason:
Blocking issues:
Required follow-up:
Decision owner:
Decision date:
```

## 8. If Go: Internal Beta Restrictions

If internal beta is approved as Go, record the restrictions below.

```text
Allowed workspaces:
Allowed users / roles:
Allowed entry point:
Allowed provider:
Allowed scopes:
Allowed test assets:
Allowed evidence capture:
Beta start date:
Beta review date:
Beta stop / rollback trigger:
```

Required restrictions:

- Internal beta must remain internal-only and not linked from the production login button.
- Workspace allowlist must remain active.
- Only approved admin / tester roles may start the flow.
- Evidence must remain redacted.
- Real Meta token exchange must remain disabled unless separately approved.
- Production ConnectedAccount / Channel / webhook / sync / token refresh writes must remain blocked unless separately approved.
- Existing Instagram OAuth fallback must remain available.
- Any raw token, authorization code, raw state, raw nonce, full callback URL, app secret, client secret, webhook verify token, browser storage, or real customer data finding immediately pauses beta.

## 9. If Hold: Required Fix Items

If internal beta remains Hold, record every required fix before the next decision review.

| Fix ID | Blocking gate | Required fix | Owner | Evidence needed | Target date | Status |
| --- | --- | --- | --- | --- | --- | --- |
|  | Package assembly / redaction / recording / screenshots / permission proof / test asset proof / access / rollback / write guard / token guard / sign-off |  |  |  |  | Open |

Hold summary:

```text
Primary hold reason:
Can the issue be fixed with documentation only: Yes / No
Requires sandbox coding: Yes / No
Requires product code change: Yes / No
Requires App Review / Dashboard change: Yes / No
Requires Supabase migration: Yes / No
```

Supabase rule if a future fix requires migration:

```text
Before any Supabase migration or db push:
1. Show current project_id.
2. Show current linked project.
3. Show current Supabase account email.
4. Wait for explicit confirmation.
```

## 10. Why Production Implementation Still Cannot Start

Production implementation remains No-Go regardless of this internal beta decision.

Reasons:

- App Review is not submitted or approved.
- Business Verification / Advanced Access status is not confirmed for the final scope set.
- Internal beta must complete successfully before production planning.
- Production env migration plan is not approved.
- No Supabase migration / db push has been reviewed or confirmed for this provider.
- Production callback behavior for real token exchange is not implemented or reviewed.
- Production ConnectedAccount / Channel writes remain intentionally blocked in sandbox.
- Real token storage, encryption, refresh, revocation, and expiry lifecycle are not approved for this provider.
- Webhook registration and channel sync lifecycle are not approved for real assets.
- Tenant isolation regression for real Business / Page / IG asset writes is not complete.
- Production rollback / monitoring plan is not complete.
- Existing Instagram OAuth fallback must remain available until a separate production implementation ADR is approved.

## 11. Decision Sign-Off

| Role | Name | Decision | Signature / approval record | Date |
| --- | --- | --- | --- | --- |
| Product owner |  | Go / Hold |  |  |
| Engineering owner |  | Go / Hold |  |  |
| Security reviewer |  | Go / Hold |  |  |
| App Review owner |  | Go / Hold |  |  |
| Operations owner |  | Go / Hold |  |  |

Final memo decision:

```text
Internal beta release decision memo: Ready / Completed
Internal beta: Go / Hold
Production implementation: No-Go

Next step:
If Go, start the internal beta under the restrictions in this memo.
If Hold, resolve required fix items and run a new evidence execution report before re-review.
```
