# Meta Business Login Internal Beta Evidence Execution Report Template

Date: 2026-06-16
Status: Blank execution report template / internal beta Hold / production implementation No-Go

## Scope

This template records the actual execution result of the Meta Business Login / Instagram Business Login internal beta evidence collection run.

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
Do not run Supabase migration or db push for this evidence execution report.
Before any future Supabase migration or db push, record current project_id, linked project, and Supabase account email, then wait for explicit confirmation.
```

Source document:

```text
docs/meta-business-login-internal-beta-evidence-collection-runbook.md
```

## 1. Evidence Run Metadata

```text
Run ID:
Run date:
Executor:
Reviewer:
Branch / commit:
Environment:
Internal beta package version:
App Review package version:
Reviewer workspace marker:
Workspace allowlist version:
Reviewer user role:
Meta App:
Meta Dashboard scope reconciliation version:
Redaction report version:
Reviewer recording version:
Screenshot package version:
Permission proof version:
Test asset proof version:
Rollback / fallback proof version:
Final decision owner:
```

Initial decision:

```text
Internal beta: Hold
Production implementation: No-Go
```

## 2. Package Assembly Evidence Result

Record whether the final App Review / internal beta package has been assembled and gated.

| Artifact | Source path / package file | Version | Gate result | Reviewer | Notes |
| --- | --- | --- | --- | --- | --- |
| Reviewer recording |  |  | Pass / Hold / Fail |  |  |
| Screenshots |  |  | Pass / Hold / Fail |  |  |
| Permission proof matrix |  |  | Pass / Hold / Fail |  |  |
| Redaction report |  |  | Pass / Hold / Fail |  |  |
| Test asset proof |  |  | Pass / Hold / Fail |  |  |
| Scope reconciliation |  |  | Pass / Hold / Fail |  |  |
| Redacted callback evidence |  |  | Pass / Hold / Fail |  |  |
| Workspace linking dry-run |  |  | Pass / Hold / Fail |  |  |
| Channel sync dry-run |  |  | Pass / Hold / Fail |  |  |
| Rollback / fallback proof |  |  | Pass / Hold / Fail |  |  |

Package exclusions:

```text
Raw recordings excluded: Yes / No
Unredacted screenshots excluded: Yes / No
HAR / network exports excluded: Yes / No
Raw logs excluded or searched: Yes / No
Env / secret files excluded: Yes / No
Browser storage exports excluded: Yes / No
Database dumps excluded: Yes / No
Raw Meta responses excluded or redacted: Yes / No
Real customer data excluded: Yes / No
```

Decision:

```text
Package assembly evidence: Pass / Hold / Fail
Reason:
Required follow-up:
```

## 3. Redaction Report Execution Result

Record the final redaction search and manual review result.

Search execution:

| Search area | Command / review source | Exit code / result | Findings | Status |
| --- | --- | --- | --- | --- |
| Token / secret search |  |  |  | Pass / Hold / Fail |
| Authorization code search |  |  |  | Pass / Hold / Fail |
| Raw state / nonce search |  |  |  | Pass / Hold / Fail |
| Full callback URL search |  |  |  | Pass / Hold / Fail |
| Unmasked asset ID search |  |  |  | Pass / Hold / Fail |
| Recording visual review |  |  |  | Pass / Hold / Fail |
| Screenshot visual review |  |  |  | Pass / Hold / Fail |
| Log / audit review |  |  |  | Pass / Hold / Fail |
| Test output review |  |  |  | Pass / Hold / Fail |

Finding summary:

| Finding ID | Type | Artifact | Raw value copied here | Cleanup action | Retest result | Final status |
| --- | --- | --- | --- | --- | --- | --- |
|  | token / code / secret / state / nonce / callback URL / asset ID / customer data / other |  | No |  |  | cleaned / false positive / excluded / blocked |

Critical rule:

```text
Do not copy raw token, authorization code, secret, raw state, raw nonce, full callback URL, credential, OTP, cookie, browser storage, or real customer data into this report.
```

Decision:

```text
Redaction report execution: Pass / Hold / No-Go
All findings resolved: Yes / No
Reason:
Required follow-up:
```

## 4. Reviewer Recording / Screenshots Result

Record whether the final reviewer recording and screenshots are complete and safe.

| Evidence | Required result | Actual result | Status | Notes |
| --- | --- | --- | --- | --- |
| Reviewer recording | Follows final shot list and passes visual redaction. |  | Pass / Hold / Fail |  |
| Account selection screenshot | Account/profile selection visible without raw IDs or query strings. |  | Pass / Hold / Fail |  |
| Consent screenshot | App and permission context visible without credentials or secrets. |  | Pass / Hold / Fail |  |
| Redacted callback screenshot | Redacted markers only; no raw code/state/full callback URL. |  | Pass / Hold / Fail |  |
| Workspace linking screenshot | Hashed or masked workspace marker only. |  | Pass / Hold / Fail |  |
| Channel sync screenshot | Dry-run only; no token/code/secret/state/callback URL. |  | Pass / Hold / Fail |  |
| Product proof screenshots | Match kept permission proof rows. |  | Pass / Hold / Fail |  |

Sensitive visual review:

```text
Raw token visible: Pass / Fail
Raw code visible: Pass / Fail
Raw state visible: Pass / Fail
Raw nonce visible: Pass / Fail
Full callback URL visible: Pass / Fail
Unmasked asset ID visible: Pass / Fail
Credential / OTP visible: Pass / Fail
Browser storage visible: Pass / Fail
Real customer data visible: Pass / Fail
```

Decision:

```text
Reviewer recording: Pass / Hold / Fail
Screenshots: Pass / Hold / Fail
Reason:
Required follow-up:
```

## 5. Permission Proof / Test Asset Proof Result

Record whether every kept permission and test asset is proven.

| Permission / asset | Required proof | Evidence file / segment | Status | Recommendation |
| --- | --- | --- | --- | --- |
| `instagram_business_basic` | Channel / profile identity proof. |  | Pass / Hold / Fail | Keep / Remove / Defer |
| `instagram_business_manage_messages` | Inbox / automation message proof. |  | Pass / Hold / Fail | Keep / Remove / Defer |
| `instagram_business_manage_comments` | Comment sync / automation proof. |  | Pass / Hold / Fail | Keep / Remove / Defer |
| `instagram_business_content_publish` | Product publishing proof, if requested. |  | Pass / Hold / Fail | Keep / Remove / Defer |
| `instagram_business_manage_insights` | Product analytics proof, if requested. |  | Pass / Hold / Fail | Keep / Remove / Defer |
| Facebook Login for Business scopes | Business / Page / IG selected-flow proof, if requested. |  | Pass / Hold / Fail | Keep / Remove / Defer |
| Test Meta Business | Masked Business asset proof. |  | Pass / Hold / Fail |  |
| Test Facebook Page | Masked Page asset proof. |  | Pass / Hold / Fail |  |
| Test IG account | Masked IG professional account proof. |  | Pass / Hold / Fail |  |
| Reviewer workspace | Masked workspace proof. |  | Pass / Hold / Fail |  |
| Reviewer user role | Approved admin / tester proof. |  | Pass / Hold / Fail |  |

Scope reconciliation:

```text
Meta Dashboard scope list reconciled: Yes / No
Unsupported scopes removed or deferred: Yes / No
Reviewer proof matches kept scopes: Yes / No
```

Decision:

```text
Permission proof: Pass / Hold / Fail
Test asset proof: Pass / Hold / Fail
Reason:
Required follow-up:
```

## 6. Internal-Only Entry Point / Workspace Allowlist / User Role Result

Record whether beta access is restricted to approved internal users and workspaces.

| Check | Expected result | Actual result | Status |
| --- | --- | --- | --- |
| Internal route hidden from production UI | Not linked from production button / connect flow. |  | Pass / Hold / Fail |
| Allowlisted workspace | Access allowed only for approved workspace. |  | Pass / Hold / Fail |
| Non-allowlisted workspace | Access blocked. |  | Pass / Hold / Fail |
| Approved user role | Access allowed only for approved admin/tester role. |  | Pass / Hold / Fail |
| Non-approved user role | Access blocked. |  | Pass / Hold / Fail |
| Audit redaction | Redacted markers only. |  | Pass / Hold / Fail |
| Public discoverability | Public production users cannot discover or start beta path. |  | Pass / Hold / Fail |

Decision:

```text
Internal-only entry point: Pass / Hold / Fail
Workspace allowlist: Pass / Hold / Fail
User / admin role: Pass / Hold / Fail
Reason:
Required follow-up:
```

## 7. Rollback / Fallback Verification Result

Record whether beta can be disabled and the existing Instagram OAuth fallback remains available.

| Rollback / fallback check | Expected result | Actual result | Status |
| --- | --- | --- | --- |
| Disable beta entry point | Internal beta unavailable. |  | Pass / Hold / Fail |
| Clear allowlist | No workspace can start beta unless re-added. |  | Pass / Hold / Fail |
| Existing Instagram OAuth fallback | Existing production flow remains available. |  | Pass / Hold / Fail |
| Production login button | Unchanged. |  | Pass / Hold / Fail |
| Env / schema rollback need | None. |  | Pass / Hold / Fail |
| Post-rollback verification | Beta blocked; fallback available. |  | Pass / Hold / Fail |

Decision:

```text
Rollback / fallback: Pass / Hold / Fail
Reason:
Required follow-up:
```

## 8. Production Write Guard / Token Exchange Guard Result

Record whether sandbox/internal beta evidence collection avoided production writes and token exchange.

Targeted test result:

```text
npx vitest run tests/meta-business-login-sandbox-sbl08.test.ts tests/meta-business-login-sandbox-sbl12-callback-capture.test.ts tests/meta-business-login-sandbox-sbl12-callback-route.test.ts tests/meta-business-login-sandbox-sbl13-workspace-linking-sync.test.ts
Result:
```

Guard result:

| Guard | Required result | Actual result | Status |
| --- | --- | --- | --- |
| Token exchange guard | `exchangeAttempted=false`. |  | Pass / Hold / Fail |
| ConnectedAccount write guard | Production write false. |  | Pass / Hold / Fail |
| Channel write guard | Production write false. |  | Pass / Hold / Fail |
| Webhook write guard | Production write false. |  | Pass / Hold / Fail |
| Channel sync guard | `syncMode=dry_run`; no production sync start. |  | Pass / Hold / Fail |
| Token refresh guard | No refresh or token storage. |  | Pass / Hold / Fail |
| Redaction guard | No raw token/code/state/nonce/full callback URL. |  | Pass / Hold / Fail |

Decision:

```text
Production write guard: Pass / Hold / No-Go
Token exchange guard: Pass / Hold / No-Go
Reason:
Required follow-up:
```

## 9. Internal Beta Go / Hold Final Decision

Use this final record after all sections above are complete.

```text
Run ID:
Package assembly evidence: Pass / Hold / Fail
Redaction report: Pass / Hold / No-Go
Reviewer recording: Pass / Hold / Fail
Screenshots: Pass / Hold / Fail
Permission proof: Pass / Hold / Fail
Test asset proof: Pass / Hold / Fail
Internal-only entry point: Pass / Hold / Fail
Workspace allowlist: Pass / Hold / Fail
User / admin role: Pass / Hold / Fail
Rollback / fallback: Pass / Hold / Fail
Production write guard: Pass / Hold / No-Go
Token exchange guard: Pass / Hold / No-Go
Product owner sign-off: Pass / Hold

Internal beta decision: Go / Hold
Decision reason:
Required follow-up:
Reviewer:
Date:
```

Decision rule:

```text
Internal beta can become Go only when every gate is Pass and product owner sign-off is recorded.
Any Hold, Fail, or No-Go keeps internal beta at Hold.
```

## 10. Why Production Implementation Still Cannot Start

Production implementation remains No-Go even if this evidence execution report later records internal beta Go.

Reasons:

- App Review is not submitted or approved.
- Business Verification / Advanced Access status is not confirmed for the final scope set.
- Internal beta must complete successfully with reviewer-safe test workspaces before production planning.
- Production env migration plan is not approved.
- No Supabase migration / db push has been reviewed or confirmed for this provider.
- Production callback behavior for real token exchange is not implemented or reviewed.
- Production ConnectedAccount / Channel writes remain intentionally blocked in sandbox.
- Real token storage, encryption, refresh, revocation, and expiry lifecycle are not approved for this provider.
- Webhook registration and channel sync lifecycle are not approved for real assets.
- Tenant isolation regression for real Business / Page / IG asset writes is not complete.
- Production rollback / monitoring plan is not complete.
- Existing Instagram OAuth fallback must remain available until a separate production implementation ADR is approved.

## Final Report Decision

```text
Internal beta evidence execution report template: Ready
This execution report completed: Yes / No
Internal beta: Hold
Production implementation: No-Go

Next step:
Execute the evidence collection runbook, complete this report with real Pass/Hold/Fail results, and request internal beta Go only if every gate is Pass.
```
