# Meta Business Login Internal Beta Launch Checklist

Date: 2026-06-16
Status: Blank launch checklist / internal beta Hold / production implementation No-Go

## Scope

This checklist is used only after the Meta Business Login / Instagram Business Login internal beta release decision memo records `Internal beta: Go`.

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
Do not run Supabase migration or db push for this internal beta launch checklist.
Before any future Supabase migration or db push, record current project_id, linked project, and Supabase account email, then wait for explicit confirmation.
```

Source document:

```text
docs/meta-business-login-internal-beta-release-decision-memo-template.md
```

Related documents:

```text
docs/meta-business-login-internal-beta-evidence-execution-report-template.md
docs/meta-business-login-internal-beta-evidence-collection-runbook.md
docs/meta-business-login-internal-beta-final-preflight-checklist.md
docs/meta-business-login-sandbox-go-no-go-checklist.md
docs/security-review.md
```

## 1. Launch Metadata

```text
Launch checklist ID:
Launch date:
Launch owner:
Reviewer:
Branch / commit:
Release decision memo:
Evidence execution report:
Internal beta package version:
Workspace allowlist version:
Allowed users / roles version:
Rollback plan version:
Final launch decision:
  - Launch
  - Hold
Production implementation:
  - No-Go
```

## 2. Release Decision Memo Sign-Off

Internal beta launch can proceed only if the release decision memo is completed and signed.

| Gate | Required result | Actual result | Status |
| --- | --- | --- | --- |
| Decision memo completed | Memo is filled with final decision and evidence references. |  | Pass / Hold / Fail |
| Product owner sign-off | Product owner approved internal beta Go. |  | Pass / Hold / Fail |
| Engineering owner sign-off | Engineering owner approved technical launch boundary. |  | Pass / Hold / Fail |
| Security reviewer sign-off | Security reviewer approved redaction, guards, and restrictions. |  | Pass / Hold / Fail |
| App Review owner sign-off | App Review owner approved reviewer evidence and scope boundary. |  | Pass / Hold / Fail |
| Operations owner sign-off | Operations owner approved rollback and monitoring. |  | Pass / Hold / Fail |

Decision:

```text
Release decision memo sign-off: Pass / Hold / Fail
Reason:
Required follow-up:
```

## 3. Internal Beta Go Launch Preconditions

These checks must pass immediately before launch.

| Gate | Required result | Status | Notes |
| --- | --- | --- | --- |
| Internal beta decision | Release decision memo says `Internal beta: Go`. | Hold |  |
| Package assembly | Package assembly evidence is Pass. | Hold |  |
| Redaction report | Redaction report is Pass and all findings are resolved. | Hold |  |
| Reviewer recording / screenshots | Final visual evidence is Pass. | Hold |  |
| Permission proof / test asset proof | Kept scopes and test assets are Pass. | Hold |  |
| Scope reconciliation | Current Meta Dashboard scopes match approved matrix. | Hold |  |
| Existing fallback | Existing Instagram OAuth fallback is verified. | Hold |  |
| No production approval implied | Decision explicitly keeps production implementation No-Go. | Hold |  |

Decision:

```text
Launch preconditions: Pass / Hold
Reason:
Required follow-up:
```

## 4. Workspace Allowlist / User Role / Internal-Only Entry Point

Record the approved access boundary before launch.

```text
Allowed workspaces:
Allowed users:
Allowed roles:
Allowed entry point:
Allowed provider:
Allowed test assets:
Beta start window:
Beta review window:
Beta stop trigger owner:
```

Access checks:

| Check | Required result | Actual result | Status |
| --- | --- | --- | --- |
| Internal-only entry point | Not linked from production login button or normal channel connect flow. |  | Pass / Hold / Fail |
| Workspace allowlist active | Only approved workspaces can access beta. |  | Pass / Hold / Fail |
| Non-allowlisted workspace blocked | Non-approved workspaces are blocked. |  | Pass / Hold / Fail |
| Approved role allowed | Only approved admin / tester roles can start beta. |  | Pass / Hold / Fail |
| Non-approved role blocked | Non-approved users are blocked. |  | Pass / Hold / Fail |
| Public discoverability blocked | Public production users cannot discover or start beta path. |  | Pass / Hold / Fail |

## 5. Redaction / Logging / Audit / Evidence Artifact Checks

Internal beta launch must preserve evidence safety.

| Check | Required result | Actual result | Status |
| --- | --- | --- | --- |
| Redaction markers | Evidence uses redacted markers for code/state/nonce/callback URL/token/secret. |  | Pass / Hold / Fail |
| Logging | Logs do not contain raw token, authorization code, raw state, raw nonce, full callback URL, secret, or browser storage. |  | Pass / Hold / Fail |
| Audit | Audit records use redacted markers only. |  | Pass / Hold / Fail |
| Evidence artifacts | Recordings, screenshots, logs, and reports have passed redaction review. |  | Pass / Hold / Fail |
| Asset IDs | Business / Page / IG / workspace IDs are masked or hashed. |  | Pass / Hold / Fail |
| Customer data | No real customer messages, comments, credentials, OTP, cookies, localStorage, or sessionStorage appear. |  | Pass / Hold / Fail |

Immediate pause trigger:

```text
Pause internal beta immediately if raw token, authorization code, raw state, raw nonce, full callback URL, app secret, client secret, webhook verify token, browser storage, unmasked asset ID, or real customer data appears in any artifact.
```

## 6. Production Write Guard / Token Exchange Guard Checks

Internal beta launch is blocked unless production writes and token exchange remain guarded.

Targeted test command:

```bash
npx vitest run tests/meta-business-login-sandbox-sbl08.test.ts tests/meta-business-login-sandbox-sbl12-callback-capture.test.ts tests/meta-business-login-sandbox-sbl12-callback-route.test.ts tests/meta-business-login-sandbox-sbl13-workspace-linking-sync.test.ts
```

Guard checks:

| Guard | Required result | Actual result | Status |
| --- | --- | --- | --- |
| Token exchange guard | `exchangeAttempted=false` unless separately approved in a future task. |  | Pass / Hold / No-Go |
| ConnectedAccount write guard | No production ConnectedAccount create/update. |  | Pass / Hold / No-Go |
| Channel write guard | No production Channel create/update. |  | Pass / Hold / No-Go |
| Webhook write guard | No production webhook registration/update. |  | Pass / Hold / No-Go |
| Channel sync guard | Dry-run only; no production sync start. |  | Pass / Hold / No-Go |
| Token refresh guard | No token refresh or token storage. |  | Pass / Hold / No-Go |
| Redaction guard | No raw token/code/state/nonce/full callback URL. |  | Pass / Hold / No-Go |

Decision:

```text
Production write guard: Pass / Hold / No-Go
Token exchange guard: Pass / Hold / No-Go
Reason:
Required follow-up:
```

## 7. Rollback / Fallback Launch Checks

Rollback and fallback must be ready before launch.

| Check | Required result | Actual result | Status |
| --- | --- | --- | --- |
| Disable beta path | Internal beta can be disabled quickly. |  | Pass / Hold / Fail |
| Clear allowlist | Workspace allowlist can be cleared or reduced. |  | Pass / Hold / Fail |
| Fallback flow | Existing Instagram OAuth remains available and unchanged. |  | Pass / Hold / Fail |
| Login button | Production login button remains unchanged. |  | Pass / Hold / Fail |
| Env / schema rollback | No env or Prisma schema change is needed for rollback. |  | Pass / Hold / Fail |
| Post-rollback test | Beta blocked and fallback available after rollback. |  | Pass / Hold / Fail |

Decision:

```text
Rollback / fallback readiness: Pass / Hold / Fail
Reason:
Required follow-up:
```

## 8. Beta Monitoring Items

Monitor these items during the internal beta window.

| Monitoring item | Signal | Frequency | Owner | Pause threshold |
| --- | --- | --- | --- | --- |
| Redaction safety | Any raw code/state/nonce/callback URL/token/secret/customer data in logs, audit, reports, or screenshots. | Every beta run |  | Any finding |
| Production write guard | Any production ConnectedAccount / Channel / webhook / sync / token refresh write. | Every beta run |  | Any write |
| Token exchange guard | Any real Meta token exchange attempt. | Every beta run |  | Any attempt |
| Access control | Any non-allowlisted workspace or user role reaches beta. | Every beta run |  | Any unauthorized access |
| Account selection UX | Account/profile selection and consent behavior match evidence. | Each reviewer run |  | Regression blocks review |
| Fallback availability | Existing Instagram OAuth fallback remains available. | Daily during beta |  | Fallback unavailable |
| App Review scope drift | Meta Dashboard scope list changes. | Before each evidence run |  | Unreviewed scope appears |

## 9. Beta Pause Conditions

Pause internal beta immediately if any condition below occurs.

- Raw token, authorization code, raw state, raw nonce, full callback URL, app secret, client secret, webhook verify token, cookie, localStorage, sessionStorage, unmasked asset ID, or real customer data appears in any evidence artifact.
- Real Meta token exchange occurs without a separately approved task.
- Production ConnectedAccount, Channel, webhook, channel sync, token refresh, or token storage write occurs.
- Non-allowlisted workspace or non-approved user role can start beta.
- Existing Instagram OAuth fallback becomes unavailable.
- Meta Dashboard scope list changes without scope reconciliation.
- App Review package or evidence report has unresolved Hold / Fail / No-Go findings.
- Rollback path cannot disable beta quickly.

Pause record:

```text
Pause date:
Pause owner:
Trigger:
Immediate action:
Evidence artifact:
Raw value copied here: No
Follow-up required:
Internal beta status: Hold
Production implementation: No-Go
```

## 10. Why Production Implementation Still Cannot Start

Production implementation remains No-Go even if internal beta launches.

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

## 11. Post-Launch Backfill

After launch or launch Hold, backfill these documents.

| Document | Required update | When |
| --- | --- | --- |
| `docs/meta-business-login-internal-beta-release-decision-memo-template.md` | Final launch reference and decision link. | Before launch or Hold closeout |
| `docs/meta-business-login-internal-beta-evidence-execution-report-template.md` | Actual evidence results and launch decision reference. | Before launch or Hold closeout |
| `docs/meta-business-login-sandbox-go-no-go-checklist.md` | Latest internal beta launch status. | Immediately after decision |
| `docs/meta-app-review-checklist.md` | App Review readiness and beta status. | Immediately after decision |
| `docs/security-review.md` | Security launch / pause note. | Immediately after decision |
| `docs/fix-roadmap.md` | Remaining Hold or production blockers. | After current unrelated edits are resolved |
| `docs/codex-session-log.md` | Session result and validation. | After current unrelated edits are resolved |

## Final Launch Decision

```text
Internal beta launch checklist: Ready / Completed
Internal beta launch: Launch / Hold
Production implementation: No-Go

Next step:
If Launch, start internal beta under the restrictions and monitoring in this checklist.
If Hold, resolve blocking gates and rerun the release decision memo before launch.
```
