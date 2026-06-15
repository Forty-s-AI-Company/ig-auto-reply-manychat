# Meta Business Login Internal Beta Evidence Collection Runbook

Date: 2026-06-16
Status: Draft evidence collection runbook / internal beta Hold / production implementation No-Go

## Scope

This runbook defines how to collect and record evidence before Meta Business Login / Instagram Business Login sandbox can move from internal beta Hold to internal beta Go.

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
Do not run Supabase migration or db push for this evidence collection run.
Before any future Supabase migration or db push, record current project_id, linked project, and Supabase account email, then wait for explicit confirmation.
```

Source document:

```text
docs/meta-business-login-internal-beta-final-preflight-checklist.md
```

Related evidence documents:

```text
docs/meta-business-login-final-app-review-package-assembly-checklist.md
docs/meta-business-login-final-redaction-search-execution-report-template.md
docs/meta-business-login-final-reviewer-recording-shot-list.md
docs/meta-business-login-final-permission-usage-proof-matrix.md
docs/meta-business-login-sandbox-internal-beta-access-rollback-runbook.md
```

## 1. Evidence Run Metadata

Record one metadata block for each evidence collection run.

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
Final decision owner:
```

Initial decision:

```text
Internal beta: Hold
Production implementation: No-Go
```

## 2. Final Package Assembly Evidence Collection

Goal: prove that the final App Review / internal beta package is complete, versioned, and safe to use as evidence.

Steps:

1. Create or update the package inventory.
2. List every artifact: reviewer recording, screenshots, permission proof, redaction report, test asset proof, scope reconciliation, redacted callback evidence, workspace linking dry-run, channel sync dry-run, and rollback / fallback proof.
3. Assign an owner, version, source path, and review timestamp to every artifact.
4. Confirm every artifact passed the package assembly gate before inclusion.
5. Exclude raw recordings, unredacted screenshots, HAR exports, raw logs, env files, browser storage exports, database dumps, raw Meta API responses, and any real customer data.

Evidence record:

| Artifact | Source path / package file | Owner | Version | Gate result | Notes |
| --- | --- | --- | --- | --- | --- |
| Reviewer recording |  |  |  | Hold |  |
| Screenshots |  |  |  | Hold |  |
| Permission proof matrix |  |  |  | Hold |  |
| Redaction report |  |  |  | Hold |  |
| Test asset proof |  |  |  | Hold |  |
| Scope reconciliation |  |  |  | Hold |  |
| Redacted callback evidence |  |  |  | Hold |  |
| Workspace linking dry-run |  |  |  | Hold |  |
| Channel sync dry-run |  |  |  | Hold |  |
| Rollback / fallback proof |  |  |  | Hold |  |

Decision:

```text
Package assembly evidence: Pass / Hold
Reason:
Required follow-up:
```

## 3. Redaction Report Execution And Recording

Goal: prove that all text, screenshot, recording, log, audit, and test output artifacts are free of sensitive data before internal beta.

Required searches:

```bash
rg -n "access_token|refresh_token|client_secret|app_secret|verify_token|appSecret|clientSecret|refreshToken|accessToken" docs tests src
rg -n "code=|authorization_code|\\bcode\\s*[:=]\\s*[\"'][A-Za-z0-9_\\-]{16,}" docs tests src
rg -n "state=sblcap\\.|raw state|raw_state|raw nonce|raw_nonce|nonce=|\\bnonce\\s*[:=]\\s*[\"'][A-Za-z0-9_\\-]{16,}" docs tests src
rg -n "/api/instagram/oauth/callback\\?|/api/meta/oauth/callback\\?|callbackUrl\\s*[:=]\\s*[\"']https?://|redirect_uri=.*callback" docs tests src
rg -n "businessId\\s*[:=]\\s*[\"']?\\d{6,}|pageId\\s*[:=]\\s*[\"']?\\d{6,}|instagramAccountId\\s*[:=]\\s*[\"']?\\d{6,}|igUserId\\s*[:=]\\s*[\"']?\\d{6,}|providerAccountId\\s*[:=]\\s*[\"']?\\d{6,}" docs tests src
```

Manual review steps:

1. Review reviewer recording frame-by-frame around account selection, consent, callback, workspace linking, and channel sync shots.
2. Review screenshots for address bar exposure, raw query strings, raw asset IDs, credentials, OTP, browser storage, and real customer data.
3. Review saved terminal output, CI output, server logs, audit exports, and screenshot captions.
4. For every finding, record only the finding type and location. Do not copy raw sensitive values into the report.
5. Clean, exclude, or block every non-allowed finding.
6. Re-run the exact search or visual review after cleanup.

Evidence record:

```text
Redaction report:
Text search result: Pass / Hold / Fail
Visual recording review: Pass / Hold / Fail
Screenshot review: Pass / Hold / Fail
Log / audit review: Pass / Hold / Fail
Findings unresolved: Yes / No
Reviewer:
Decision:
```

## 4. Reviewer Recording And Screenshot Collection

Goal: collect reviewer-safe visual evidence without exposing secrets.

Recording steps:

1. Start from a reviewer-safe test workspace.
2. Show the internal-only beta entry point only if it is approved for recording.
3. Show Meta / Instagram account selection or use-another-account behavior.
4. Show consent screen with app name and requested permission context.
5. Hide or crop address bars if a URL contains query parameters.
6. Show only redacted callback evidence.
7. Show workspace linking dry-run evidence.
8. Show channel sync dry-run evidence.
9. Show product screens for each kept permission.
10. Stop before any production write, real token exchange, dashboard secret, env, cookie, localStorage, or sessionStorage exposure.

Screenshot steps:

1. Capture account selection, consent, redacted callback, workspace linking dry-run, channel sync dry-run, product proof, and rollback / fallback proof.
2. Mask Business / Page / IG / workspace identifiers.
3. Exclude real customer messages and comments.
4. Store screenshots only in the approved package location after redaction review.

Evidence record:

| Evidence | Required result | Status | Notes |
| --- | --- | --- | --- |
| Reviewer recording | Follows final shot list and passes visual redaction. | Hold |  |
| Account selection screenshots | Account/profile selection is visible without raw IDs or query strings. | Hold |  |
| Consent screenshots | App and permission context are visible without credentials or secrets. | Hold |  |
| Callback screenshot | Redacted markers only; no raw code/state/full callback URL. | Hold |  |
| Workspace linking screenshot | Hashed/masked workspace marker only. | Hold |  |
| Channel sync screenshot | Dry-run only; no token/code/secret/state/callback URL. | Hold |  |
| Product proof screenshots | Match kept permission proof rows. | Hold |  |

## 5. Permission Proof And Test Asset Proof

Goal: prove every kept permission has a real product use case and reviewer-safe asset evidence.

Steps:

1. Reconcile the current Meta Dashboard scope list against the permission proof matrix.
2. Mark every kept permission as Pass, Hold, Defer, or Remove.
3. Remove or defer `instagram_business_content_publish` and `instagram_business_manage_insights` unless final product-screen proof exists.
4. Keep Facebook Login for Business scopes on Hold unless Business / Page / IG asset proof and selected-flow evidence exist.
5. Record reviewer-safe Business / Page / IG assets with masked IDs.
6. Record reviewer workspace, reviewer role, test user, and expected permission proof shots.

Evidence record:

| Permission / asset | Product proof | Test asset proof | Status | Recommendation |
| --- | --- | --- | --- | --- |
| `instagram_business_basic` | Channel / profile identity proof. | Test IG professional account. | Hold | Keep if final proof passes. |
| `instagram_business_manage_messages` | Inbox / automation message proof. | Test IG message account. | Hold | Keep if final proof passes. |
| `instagram_business_manage_comments` | Comment sync / automation proof. | Test IG post/comment. | Hold | Keep if final proof passes. |
| `instagram_business_content_publish` | No current proof. | Not applicable. | Hold | Remove / defer. |
| `instagram_business_manage_insights` | No current proof. | Not applicable. | Hold | Remove / defer. |
| Facebook Login for Business scopes | Business / Page / IG asset proof. | Test Business/Page/IG assets. | Hold | Hold until selected-flow proof exists. |

Decision:

```text
Permission proof: Pass / Hold
Test asset proof: Pass / Hold
Reason:
Required follow-up:
```

## 6. Internal-Only Entry Point / Workspace Allowlist / User Role Verification

Goal: prove that internal beta is not discoverable or usable by public production users.

Steps:

1. Confirm the internal beta entry point is not linked from the production login button or normal channel connect flow.
2. Confirm only approved workspaces are allowlisted.
3. Confirm only approved admin / tester roles can start the beta flow.
4. Attempt access from a non-allowlisted workspace and record the blocked result.
5. Attempt access from a non-approved user role and record the blocked result.
6. Confirm audit evidence uses redacted markers and does not expose raw code/state/token/full callback URL.

Evidence record:

| Check | Expected result | Actual result | Status |
| --- | --- | --- | --- |
| Internal route hidden from production UI | Not linked from production button / connect flow. |  | Hold |
| Allowlisted workspace | Access allowed only for approved workspace. |  | Hold |
| Non-allowlisted workspace | Access blocked. |  | Hold |
| Approved user role | Access allowed only for approved admin/tester role. |  | Hold |
| Non-approved user role | Access blocked. |  | Hold |
| Audit redaction | Redacted markers only. |  | Hold |

## 7. Rollback / Fallback Verification

Goal: prove the beta can be disabled and existing Instagram OAuth remains the production fallback.

Steps:

1. Document how to disable the internal beta entry point.
2. Document how to clear or reduce the workspace allowlist.
3. Verify existing Instagram OAuth flow remains available and unchanged.
4. Verify production login button remains unchanged.
5. Verify no env or Prisma schema change is required for rollback.
6. After rollback, verify the internal beta path is blocked.
7. After rollback, verify existing production fallback path still works as expected.

Evidence record:

| Rollback / fallback check | Expected result | Actual result | Status |
| --- | --- | --- | --- |
| Disable beta entry point | Internal beta unavailable. |  | Hold |
| Clear allowlist | No workspace can start beta unless re-added. |  | Hold |
| Existing Instagram OAuth fallback | Existing production flow remains available. |  | Hold |
| Production login button | Unchanged. |  | Hold |
| Env / schema rollback need | None. |  | Hold |
| Post-rollback verification | Beta blocked; fallback available. |  | Hold |

## 8. Production Write Guard / Token Exchange Guard Verification

Goal: prove internal beta evidence collection does not create production records or perform real Meta token exchange.

Steps:

1. Run targeted SBL tests that cover callback capture, callback route, workspace linking / channel sync dry-run, and production write guard.
2. Confirm callback evidence has `exchangeAttempted=false`.
3. Confirm production write flags remain false.
4. Confirm no production ConnectedAccount is created or updated.
5. Confirm no production Channel is created or updated.
6. Confirm no webhook registration, channel sync start, token refresh, or token storage occurs.
7. Search logs, audit, screenshots, and reports for raw token, authorization code, raw state, raw nonce, and full callback URL.

Required targeted tests:

```bash
npx vitest run tests/meta-business-login-sandbox-sbl08.test.ts tests/meta-business-login-sandbox-sbl12-callback-capture.test.ts tests/meta-business-login-sandbox-sbl12-callback-route.test.ts tests/meta-business-login-sandbox-sbl13-workspace-linking-sync.test.ts
```

Evidence record:

| Guard | Required result | Status | Evidence |
| --- | --- | --- | --- |
| Token exchange guard | `exchangeAttempted=false`. | Hold |  |
| ConnectedAccount write guard | Production write false. | Hold |  |
| Channel write guard | Production write false. | Hold |  |
| Webhook write guard | Production write false. | Hold |  |
| Channel sync guard | `syncMode=dry_run`; no production sync start. | Hold |  |
| Token refresh guard | No refresh or token storage. | Hold |  |
| Redaction guard | No raw token/code/state/nonce/full callback URL. | Hold |  |

## 9. Internal Beta Go / Hold Final Record

Use this record after completing the evidence collection run.

```text
Run ID:
Package assembly evidence: Pass / Hold
Redaction report: Pass / Hold / No-Go
Reviewer recording: Pass / Hold
Screenshots: Pass / Hold
Permission proof: Pass / Hold
Test asset proof: Pass / Hold
Internal-only entry point: Pass / Hold
Workspace allowlist: Pass / Hold
User / admin role: Pass / Hold
Rollback / fallback: Pass / Hold
Production write guard: Pass / Hold / No-Go
Token exchange guard: Pass / Hold / No-Go
Product owner sign-off: Pass / Hold

Internal beta decision: Go / Hold
Decision reason:
Required follow-up:
Reviewer:
Date:
```

Go rule:

```text
Internal beta can become Go only when every gate is Pass and product owner sign-off is recorded.
Any Hold or No-Go keeps internal beta at Hold.
```

## 10. Why Production Implementation Still Cannot Start

Production implementation remains No-Go even if internal beta evidence later passes.

Reasons:

- App Review is not submitted or approved.
- Business Verification / Advanced Access status is not confirmed for the final scope set.
- Internal beta evidence has not yet completed with reviewer-safe test workspaces.
- Production env migration plan is not approved.
- No Supabase migration / db push has been reviewed or confirmed for this provider.
- Production callback behavior for real token exchange is not implemented or reviewed.
- Production ConnectedAccount / Channel writes remain intentionally blocked in sandbox.
- Real token storage, encryption, refresh, revocation, and expiry lifecycle are not approved for this provider.
- Webhook registration and channel sync lifecycle are not approved for real assets.
- Tenant isolation regression for real Business / Page / IG asset writes is not complete.
- Production rollback / monitoring plan is not complete.
- Existing Instagram OAuth fallback must remain available until a separate production implementation ADR is approved.

## Final Runbook Decision

```text
Internal beta evidence collection runbook: Draft complete
Internal beta: Hold
Production implementation: No-Go

Next step:
Run this evidence collection process against the real final package, then fill the final go / hold record before requesting internal beta release.
```
