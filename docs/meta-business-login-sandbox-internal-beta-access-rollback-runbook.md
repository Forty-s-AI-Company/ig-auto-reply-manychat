# Meta Business Login Sandbox Internal Beta Access / Rollback Runbook

Date: 2026-06-16
Status: Draft runbook / internal beta still Hold / production implementation No-Go

## Scope

This runbook defines the access, monitoring, fallback, and rollback requirements before any Meta Business Login sandbox internal beta can begin.

This document does not approve implementation work and does not change:

- OAuth flow
- callback route
- login button
- environment variables
- Prisma schema
- production ConnectedAccount / Channel writes
- real Meta token exchange

Source review:

```text
docs/meta-business-login-sandbox-internal-beta-go-no-go-review.md
```

## Current Gate Summary

```text
Account selection UX: Pass
Consent screen: Pass
Redacted callback evidence: Pass
Workspace linking dry-run: Pass
Channel sync dry-run: Pass
Production write guard: Pass
Redaction: Pass
App Review readiness: Hold
Rollback / fallback readiness: Partial Pass
Internal beta: Hold
Production implementation: No-Go
```

## 1. Internal-Only Beta Entry Point Conditions

Internal beta entry point must satisfy all conditions below before it can be exposed to any tester.

Required conditions:

| Condition | Requirement | Status |
| --- | --- | --- |
| Entry point visibility | Must be hidden from normal production UI. | Required |
| Access control | Must require authenticated internal admin or explicitly allowlisted tester. | Required |
| Provider isolation | Must use sandbox provider identity only. | Required |
| Dry-run-first behavior | Must default to dry-run evidence, not production writes. | Required |
| Feature disable path | Must have a documented disable / rollback procedure. | Required |
| Existing fallback | Existing Instagram OAuth flow must remain available. | Required |

Must not happen:

- Do not add a public dashboard button for this provider.
- Do not replace the existing Instagram connect button.
- Do not silently route production users into sandbox or beta flow.
- Do not let beta entry point execute real token exchange until a separate approved implementation task exists.

Entry point decision:

```text
Internal beta entry point: Hold
Reason: access control and disable path are not yet implemented or tested.
```

## 2. Workspace Allowlist Conditions

Workspace allowlist is required to prevent accidental tenant exposure.

Required workspace conditions:

| Condition | Requirement |
| --- | --- |
| Explicit workspace ID | Every beta run must name one allowlisted workspace. |
| Session workspace match | Session workspace and requested workspace must match. |
| No cross-tenant linking | Callback evidence must not be usable across workspaces. |
| Evidence hashing | Workspace ID in evidence must be hashed or redacted. |
| Test workspace ownership | Workspace owner and reviewer/tester purpose must be documented. |

Allowlist record format:

```text
Workspace display name:
Workspace hashed marker:
Owner:
Tester:
Purpose:
Approved by:
Approved date:
Expiration date:
Allowed provider: meta-business-instagram-sandbox
Allowed mode: dry-run / beta-only
```

Current decision:

```text
Workspace allowlist: Hold
Reason: SBL-13 dry-run validates hashed workspace mapping, but beta tester workspace allowlist is not finalized.
```

## 3. User / Admin Permission Conditions

Internal beta must require clear user and admin permissions.

Required user conditions:

| Role | Allowed actions | Not allowed |
| --- | --- | --- |
| Internal admin | Start sandbox beta run, inspect redacted evidence, disable beta entry point. | Export raw code, token, state, callback URL, or secret. |
| Allowlisted tester | Execute approved beta flow in assigned workspace. | Use non-allowlisted workspace or production user account. |
| Normal production user | No access to sandbox beta entry point. | Any sandbox provider action. |

Permission checks required before beta:

- Authenticated user exists.
- User is internal admin or explicit allowlisted tester.
- User belongs to the allowlisted workspace.
- User is not using a shared reviewer credential unless explicitly approved.
- Admin audit trail records only redacted metadata.

Current decision:

```text
User / admin permission readiness: Hold
Reason: role and tester allowlist policy is documented here but not implemented as a beta gate.
```

## 4. Redaction Search Flow

Run redaction search after every beta evidence run.

Forbidden values:

- raw authorization code
- raw state
- raw nonce
- full callback URL
- access token
- refresh token
- app secret
- client secret
- webhook verify token
- unmasked Business ID
- unmasked Page ID
- unmasked Instagram account ID

Required local search commands:

```bash
rg -n "access_token|refresh_token|client_secret|app_secret|verify_token" docs tests src
rg -n "code=|state=sblcap\\.|/api/instagram/oauth/callback\\?" docs tests src
rg -n "businessId\\s*[:=]\\s*[\"']?\\d{6,}|pageId\\s*[:=]\\s*[\"']?\\d{6,}|instagramAccountId\\s*[:=]\\s*[\"']?\\d{6,}" docs tests src
```

Allowed findings:

- Redacted markers such as `[REDACTED_CODE]`, `[REDACTED_STATE]`, `[REDACTED_CALLBACK_URL]`.
- Test-only unsafe fixtures under explicitly unsafe fixture folders.
- Documentation examples that do not contain real values and are clearly redacted.

Required result format:

```text
Search date:
Run id:
Commands executed:
Findings:
False positives:
Cleanup required: Yes / No
Retest required: Yes / No
Reviewer:
```

Current decision:

```text
Redaction search readiness: Partial Pass
Reason: patterns are documented, but must be executed after the next beta evidence run.
```

## 5. Production Write Guard Monitoring Items

Monitoring must verify that sandbox beta does not perform production writes.

Guarded operations:

```text
connectedAccount.create
connectedAccount.updateToken
channel.create
channel.update
webhook.register
channel.sync
token.refresh
```

Required monitoring checks:

| Check | Expected result |
| --- | --- |
| ConnectedAccount create/update | No production write. |
| Channel create/update | No production write. |
| Webhook registration | No registration. |
| Channel sync job | No job started. |
| Token refresh schedule | No schedule created. |
| Audit metadata | Redacted only. |
| Server logs | No raw code/token/state/callback URL. |

Current tested evidence:

```text
docs/meta-business-login-sandbox-sbl13-workspace-linking-sync-dry-run.md
tests/meta-business-login-sandbox-sbl08.test.ts
tests/meta-business-login-sandbox-sbl13-workspace-linking-sync.test.ts
```

Current decision:

```text
Production write guard readiness: Pass for dry-run
Reason: tests prove guarded operations remain blocked in dry-run.
```

## 6. Token Exchange Must Not Happen Checks

Internal beta cannot perform real token exchange until separately approved.

Must remain false:

```text
exchangeAttempted: false
tokenStored: false
tokenRequiredButNotPresent: true
wouldScheduleTokenRefresh: false
```

Forbidden calls during sandbox beta:

- Instagram OAuth token exchange endpoint.
- Meta Graph OAuth token exchange endpoint.
- Long-lived token exchange.
- Token refresh worker scheduling.
- Token storage or encryption path.

Evidence to verify after each run:

| Evidence | Expected |
| --- | --- |
| callback evidence | `exchangeAttempted=false` |
| workspace linking draft | `tokenStored=false` |
| channel sync dry-run | `tokenRequiredButNotPresent=true` |
| production write guard | `token.refresh` blocked |
| logs / audit | no token material |

Current decision:

```text
Token exchange readiness: Pass for dry-run / Hold for beta implementation
Reason: current evidence proves no exchange in dry-run; beta entry point must preserve this behavior.
```

## 7. Fallback To Existing Instagram OAuth Flow

Fallback path:

```text
Existing Instagram OAuth flow remains the production fallback.
```

Fallback requirements:

- Existing Instagram connect UI remains unchanged.
- Existing `meta-instagram` provider remains available.
- Existing production callback behavior remains available for normal OAuth state.
- Sandbox provider must not replace production provider.
- If beta is disabled, users continue using the existing Instagram OAuth path.

Fallback communication:

```text
Meta Business Login sandbox is unavailable for internal beta.
Use the existing Instagram connection flow while sandbox review continues.
```

Current decision:

```text
Fallback readiness: Pass
Reason: existing production flow was not replaced.
```

## 8. Rollback / Disable Beta Steps

Rollback must be executable without touching production OAuth behavior.

Disable checklist:

1. Disable internal-only beta entry point.
2. Remove or expire tester workspace allowlist entries.
3. Confirm sandbox provider is no longer reachable from UI or internal route.
4. Confirm existing Instagram OAuth flow still works.
5. Run redaction search against new evidence.
6. Confirm no production ConnectedAccount / Channel was created by beta.
7. Confirm no webhook subscription or channel sync job was created by beta.
8. Record rollback result in runbook and session log.

Rollback record format:

```text
Rollback date:
Triggered by:
Reason:
Entry point disabled: Yes / No
Workspace allowlist cleared: Yes / No
Production writes found: Yes / No
Redaction search passed: Yes / No
Fallback verified: Yes / No
Follow-up required:
```

Current decision:

```text
Rollback readiness: Partial Pass
Reason: procedure is documented here, but beta disable mechanism is not implemented or tested.
```

## 9. Internal Beta Final Checklist

Internal beta cannot start until all items below are Pass.

| Gate | Required status | Current status |
| --- | --- | --- |
| Account selection UX | Pass | Pass |
| Consent screen | Pass | Pass |
| Redacted callback evidence | Pass | Pass |
| Workspace linking dry-run | Pass | Pass |
| Channel sync dry-run | Pass | Pass |
| Production write guard | Pass | Pass |
| Redaction search after latest run | Pass | Hold |
| App Review demo package | Pass | Hold |
| Permission usage proof | Pass | Hold |
| Internal-only entry point | Pass | Hold |
| Workspace allowlist | Pass | Hold |
| User / admin permission policy | Pass | Hold |
| Rollback disable path | Pass | Hold |
| Product owner sign-off | Pass | Hold |

Internal beta decision:

```text
Internal beta: Hold
Reason: evidence gates are strong, but access control, App Review package, redaction search after beta run, and rollback disable path are not complete.
```

## 10. Why Production Implementation Still Cannot Start

Production implementation remains blocked.

Reasons:

- App Review is not submitted or approved.
- Production env migration plan is not approved.
- Production callback behavior for real token exchange is not implemented for this provider.
- Production ConnectedAccount / Channel writes are intentionally blocked in sandbox.
- Real token storage / refresh lifecycle is not approved.
- Webhook registration lifecycle is not approved.
- Channel sync lifecycle for real assets is not approved.
- Tenant isolation regression for real Business / Page / IG asset writes is not complete.
- Rollback / monitoring for production rollout is not complete.

Production decision:

```text
Production implementation: No-Go
```

## Final Runbook Decision

```text
Internal beta entry point: Hold
Workspace allowlist: Hold
User / admin permissions: Hold
Redaction search process: Partial Pass
Production write guard monitoring: Pass for dry-run
Token exchange prevention: Pass for dry-run / Hold for beta implementation
Fallback: Pass
Rollback: Partial Pass
Internal beta: Hold
Production implementation: No-Go
```

Next step:

```text
Create the final App Review demo package and reconcile the permission usage table with the current Meta App Dashboard before any internal beta starts.
```
