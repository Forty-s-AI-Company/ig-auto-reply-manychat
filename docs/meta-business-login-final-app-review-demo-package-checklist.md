# Meta Business Login Final App Review Demo Package Checklist

Date: 2026-06-16
Status: Draft checklist / internal beta still Hold / production implementation No-Go

## Scope

This checklist defines the final evidence package required before Meta Business Login sandbox can request an internal beta go/no-go review.

This document does not approve production implementation and does not change:

- OAuth flow
- callback route
- login button
- environment variables
- Prisma schema
- production ConnectedAccount / Channel writes
- real Meta token exchange

Source documents:

```text
docs/meta-business-login-sandbox-internal-beta-access-rollback-runbook.md
docs/meta-business-login-app-review-demo-script.md
docs/meta-app-review-checklist.md
docs/meta-business-login-sandbox-controlled-consent-run-2026-06-16.md
docs/meta-business-login-sandbox-sbl13-workspace-linking-sync-dry-run.md
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
Internal beta: Hold
Production implementation: No-Go
```

Latest permission proof matrix:

```text
docs/meta-business-login-final-permission-usage-proof-matrix.md
```

Latest reviewer recording shot list:

```text
docs/meta-business-login-final-reviewer-recording-shot-list.md
```

Latest redaction search execution report template:

```text
docs/meta-business-login-final-redaction-search-execution-report-template.md
```

Current permission decision:

```text
Permission usage proof matrix: Draft complete
Core Instagram Business Login scopes: keep as candidate
Content publish / insights: defer or remove until product proof exists
Facebook Login for Business scopes: Hold until the selected flow and asset proof are reconciled
Reviewer recording shot list: Draft complete; final recording still Hold
Final redaction search execution report template: Ready; execution still Hold
```

## 1. Reviewer Demo Recording Checklist

Reviewer demo recording must show the flow without exposing secrets.

Required recording segments:

| Segment | Required evidence | Status |
| --- | --- | --- |
| Login to InboxPilot test workspace | Reviewer can see authenticated workspace context. | Hold |
| Navigate to social connection area | Reviewer understands where account linking starts. | Hold |
| Start Meta / Instagram Business Login flow | Reviewer sees the intended provider flow. | Hold |
| Account selection UX | Reviewer sees account/profile selection or use-another-profile option. | Pass evidence exists, final recording Hold |
| Consent screen | Reviewer sees app name, requested permission context, privacy policy, and terms links. | Pass evidence exists, final recording Hold |
| Redacted callback result | Reviewer sees success without raw code/state/token/callback URL. | Pass evidence exists, final recording Hold |
| Workspace linking explanation | Reviewer sees dry-run mapping explanation. | Hold |
| Channel sync explanation | Reviewer sees dry-run sync intent and no production write. | Hold |
| Disconnect / fallback explanation | Reviewer sees how existing Instagram flow remains available. | Hold |

Recording must not show:

- raw authorization code
- raw state
- raw nonce
- full callback URL
- access token
- refresh token
- app secret
- client secret
- webhook verify token
- unmasked Business / Page / IG account IDs

Decision:

```text
Reviewer demo recording: Hold
Reason: browser evidence exists, but final reviewer-facing recording package is not yet captured.
```

## 2. Permission Usage Proof Checklist

Permission usage must match the currently requested Meta permissions and the App Review demo narrative.

Required proof table:

| Permission / scope | Required proof | Status |
| --- | --- | --- |
| `instagram_business_basic` | Show IG professional account profile identity usage. | Hold |
| `instagram_business_manage_messages` | Show Inbox / automation message use case without exposing message secrets. | Hold |
| `instagram_business_manage_comments` | Show comment sync / automation use case. | Hold |
| `instagram_business_content_publish` | Either provide concrete product use proof or remove / defer if not used. | Hold |
| `instagram_business_manage_insights` | Either provide concrete analytics use proof or remove / defer if not used. | Hold |
| Facebook Login for Business permissions, if used | Reconcile exact scope list with current Meta Dashboard. | Hold |

Required per-permission fields:

```text
Permission:
Product screen:
User action:
Data read:
Data written:
Data stored:
Retention:
Reviewer proof:
Risk note:
```

Decision:

```text
Permission usage proof: Hold
Reason: permission evidence must be reconciled with current Meta App Dashboard before App Review or internal beta.
```

## 3. Business / Page / IG Test Asset Checklist

Meta reviewer must be able to reproduce the flow with approved test assets.

Required test asset record:

| Asset | Required information | Status |
| --- | --- | --- |
| Meta Business | Business name, masked ID, ownership, reviewer access status. | Hold |
| Facebook Page | Page name, masked ID, linked Business, reviewer access status. | Hold |
| Instagram Professional account | Username, masked ID, Page linkage, account type. | Partial Pass |
| InboxPilot workspace | Workspace owner, masked workspace marker, tester role. | Hold |
| Reviewer account | Test login route, role, expiration, access scope. | Hold |

Asset evidence must not include:

- raw access tokens
- full callback URL
- unmasked IDs
- private user credentials
- OTP or recovery codes

Decision:

```text
Business / Page / IG test assets: Hold
Reason: IG profile evidence exists, but final reviewer-accessible Business / Page / IG asset package is not complete.
```

## 4. Account Selection UX Evidence Checklist

Existing evidence:

```text
docs/meta-business-login-sandbox-oauth-profile-selection-run-2026-06-16.md
docs/meta-business-login-sandbox-controlled-consent-run-2026-06-16.md
```

Required evidence:

| Evidence | Required result | Status |
| --- | --- | --- |
| Login / profile selection shown | Multiple profiles or account selection surface appears. | Pass |
| Use another profile option | Alternative account path appears. | Pass |
| Selected test profile | Test profile selection documented. | Pass |
| `force_reauth=true` behavior | Reauth/profile selection behavior documented. | Partial Pass |
| Consent continuation | Flow can reach consent after profile session exists. | Pass |

Known limitation:

- `force_reauth=true` showed account selection but returned to Instagram home after selecting a profile in the observed run.
- Without `force_reauth=true`, consent screen was reached after the profile session existed.

Decision:

```text
Account selection UX evidence: Pass
ManyChat proximity: partially close to close
```

## 5. Redacted Callback Evidence Checklist

Existing evidence:

```text
docs/meta-business-login-sandbox-controlled-consent-run-2026-06-16.md
tests/meta-business-login-sandbox-sbl12-callback-capture.test.ts
tests/meta-business-login-sandbox-sbl12-callback-route.test.ts
```

Required callback evidence fields:

```text
mode: sandbox_callback_capture
status: success
providerId: meta-business-instagram-sandbox
code: [REDACTED_CODE]
state: [REDACTED_STATE]
callbackUrl: [REDACTED_CALLBACK_URL]
errorType: null
exchangeAttempted: false
productionWrites.connectedAccount: false
productionWrites.channel: false
productionWrites.webhook: false
productionWrites.channelSync: false
productionWrites.tokenRefresh: false
```

Decision:

```text
Redacted callback evidence: Pass
Reason: user-authorized callback returned sandbox redacted evidence without token exchange or production writes.
```

## 6. Workspace Linking / Channel Sync Dry-Run Evidence Checklist

Existing evidence:

```text
docs/meta-business-login-sandbox-sbl13-workspace-linking-sync-dry-run.md
tests/meta-business-login-sandbox-sbl13-workspace-linking-sync.test.ts
```

Required workspace linking evidence:

| Evidence | Required result | Status |
| --- | --- | --- |
| Workspace ID | Hashed marker only. | Pass |
| ConnectedAccount draft | `wouldCreate=false`. | Pass |
| Token storage | `tokenStored=false`. | Pass |
| Selected asset IDs | Hashed or null only. | Pass |

Required channel sync evidence:

| Evidence | Required result | Status |
| --- | --- | --- |
| Channel draft | `wouldCreate=false`. | Pass |
| Sync mode | `dry_run`. | Pass |
| Sync start | `wouldStart=false`. | Pass |
| Token state | `tokenRequiredButNotPresent=true`. | Pass |
| Requested checks | Profile, message, comment, insights capability checks only. | Pass |

Decision:

```text
Workspace linking / channel sync dry-run evidence: Pass
Reason: dry-run draft demonstrates intended mapping without production writes.
```

## 7. Redaction Search Checklist

Required commands before internal beta review:

```bash
rg -n "access_token|refresh_token|client_secret|app_secret|verify_token" docs tests src
rg -n "code=|state=sblcap\\.|/api/instagram/oauth/callback\\?" docs tests src
rg -n "businessId\\s*[:=]\\s*[\"']?\\d{6,}|pageId\\s*[:=]\\s*[\"']?\\d{6,}|instagramAccountId\\s*[:=]\\s*[\"']?\\d{6,}" docs tests src
```

Required review fields:

```text
Search date:
Reviewer:
Commands run:
Raw token finding: Pass / Fail
Raw code finding: Pass / Fail
Raw state finding: Pass / Fail
Full callback URL finding: Pass / Fail
Unmasked asset ID finding: Pass / Fail
False positives:
Cleanup required:
Retest required:
```

Allowed false positives:

- Explicitly redacted markers.
- Unsafe fixture files under unsafe fixture paths.
- Documentation instructions that do not contain real values.

Decision:

```text
Redaction search checklist: Hold
Reason: search process is documented, but final package search must be run immediately before internal beta review.
```

## 8. Rollback / Fallback Evidence Checklist

Existing evidence:

```text
docs/meta-business-login-sandbox-internal-beta-access-rollback-runbook.md
```

Fallback evidence:

| Evidence | Required result | Status |
| --- | --- | --- |
| Existing Instagram OAuth flow | Remains production fallback. | Pass |
| Existing login button | Not replaced. | Pass |
| Existing env | Not changed. | Pass |
| Existing Prisma schema | Not changed. | Pass |
| Sandbox provider | Separate identity from production provider. | Pass |

Rollback evidence still required:

| Evidence | Required result | Status |
| --- | --- | --- |
| Disable beta entry point | One documented disable path. | Hold |
| Clear workspace allowlist | Documented and tested. | Hold |
| Confirm no production writes | Procedure executed after beta run. | Hold |
| Verify fallback flow | Procedure executed after disable. | Hold |
| Record rollback result | Template filled after dry run. | Hold |

Decision:

```text
Rollback / fallback evidence: Partial Pass
Reason: fallback is intact, but beta disable and rollback evidence are not executed yet.
```

## 9. Conditions To Release Internal Beta Hold

Internal beta can only move from Hold to Go when every item below is Pass.

| Gate | Required status | Current status |
| --- | --- | --- |
| Reviewer demo recording package | Pass | Hold |
| Permission usage proof | Pass | Hold |
| Business / Page / IG test asset package | Pass | Hold |
| Account selection UX evidence | Pass | Pass |
| Redacted callback evidence | Pass | Pass |
| Workspace linking dry-run evidence | Pass | Pass |
| Channel sync dry-run evidence | Pass | Pass |
| Redaction search against final package | Pass | Hold |
| Production write guard evidence | Pass | Pass |
| Internal-only beta entry point policy | Pass | Hold |
| Workspace allowlist | Pass | Hold |
| User / admin permission policy | Pass | Hold |
| Rollback / disable beta path | Pass | Hold |
| Product owner sign-off | Pass | Hold |

Decision:

```text
Internal beta: Hold
Reason: technical evidence is strong, but final App Review package, beta access controls, redaction search, rollback proof, and sign-off are incomplete.
```

## 10. Why Production Implementation Still Cannot Start

Production implementation remains No-Go.

Reasons:

- App Review is not submitted or approved.
- Business Verification / Advanced Access status is not confirmed for final scope set.
- Production env migration plan is not approved.
- Production callback behavior for real Business Login token exchange is not implemented or reviewed.
- Production ConnectedAccount / Channel writes remain intentionally blocked in sandbox.
- Real token storage, encryption, refresh, and expiry lifecycle are not approved for this provider.
- Webhook registration and channel sync lifecycle are not approved for real assets.
- Tenant isolation regression for real Business / Page / IG asset writes is not complete.
- Production rollback / monitoring plan is not complete.
- Existing Instagram OAuth fallback must remain available until a separate production implementation ADR is approved.

Decision:

```text
Production implementation: No-Go
```

## Final Package Decision

```text
Final App Review demo package: Hold
Internal beta: Hold
Production implementation: No-Go

Main reason:
The core sandbox technical evidence is complete enough to assemble the final demo package, but the reviewer recording, permission proof, test asset package, redaction search, access controls, rollback proof, and sign-off are not complete.

Next step:
Record / assemble the final reviewer demo package and reconcile permissions against the current Meta App Dashboard.
```
