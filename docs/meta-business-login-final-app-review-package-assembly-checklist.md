# Meta Business Login Final App Review Package Assembly Checklist

Date: 2026-06-16
Status: Draft package assembly checklist / App Review readiness Hold / internal beta Hold / production implementation No-Go

## Scope

This checklist defines the final assembly gate before any Meta Business Login / Instagram Business Login App Review package is uploaded or used to release internal beta Hold.

This document does not change:

- OAuth flow
- callback route
- login button
- environment variables
- Prisma schema
- production ConnectedAccount / Channel writes
- real Meta token exchange

Supabase note:

```text
No Supabase migration or db push is part of this package assembly checklist.
Before any future Supabase migration or db push, record current project_id, linked project, and Supabase account email, then wait for explicit confirmation.
```

Source documents:

```text
docs/meta-business-login-final-redaction-search-execution-report-template.md
docs/meta-business-login-final-reviewer-recording-shot-list.md
docs/meta-business-login-final-permission-usage-proof-matrix.md
docs/meta-business-login-final-app-review-demo-package-checklist.md
docs/meta-business-login-sandbox-internal-beta-access-rollback-runbook.md
```

## 1. Package Assembly Metadata

Record this before packaging any file for Meta App Review.

```text
Package version:
Assembly date:
Assembler:
Reviewer:
Branch / commit:
Meta App:
Meta Dashboard scope reconciliation record:
Reviewer recording package:
Screenshot package:
Permission proof matrix:
Redaction execution report:
Test asset proof package:
Rollback / fallback proof:
Final decision owner:
```

Initial decision:

```text
Final App Review package assembled: No
App Review readiness: Hold
Internal beta: Hold
Production implementation: No-Go
```

## 2. Final Package Checklist

| Artifact | Required files | Purpose | Gate before packaging | Status |
| --- | --- | --- | --- | --- |
| Final reviewer recording | Edited reviewer demo video and optional redacted transcript. | Show the reviewer the end-to-end account selection, consent, callback evidence, and product proof. | Shot list completed, manual visual redaction review passed, no raw code/state/nonce/full callback URL/token/secret/unmasked IDs. | Hold |
| Screenshots | Meta account selection, consent screen, InboxPilot product screens, redacted callback evidence, workspace linking dry-run, channel sync dry-run. | Provide still evidence for each App Review claim. | Address bar and sensitive values masked; screenshots contain no credentials, browser storage, raw callback query, or real customer data. | Hold |
| Permission proof | Final permission usage proof matrix. | Prove every requested scope has a matching product screen and user action. | Every kept permission is `Pass` or explicitly justified; unsupported scopes are removed or deferred. | Hold |
| Redaction report | Completed final redaction search execution report. | Prove package artifacts were searched before upload. | Token, code, secret, raw state, raw nonce, full callback URL, unmasked asset ID, and customer-data searches pass. | Hold |
| Test asset proof | Masked Business / Page / IG account evidence, reviewer workspace, reviewer role, test user proof. | Prove Meta reviewer can reproduce the flow using safe assets. | No raw IDs unless Meta Dashboard requires them in its own secure field; no customer data or credentials in the package. | Hold |
| Meta Dashboard scope reconciliation | Scope list copied into a redacted reconciliation table. | Confirm Dashboard scopes match the proof matrix. | No extra scope is requested without proof; publish / insights scopes are removed or deferred unless proof exists. | Hold |
| Redacted callback evidence | Redacted JSON or screenshot from sandbox callback capture. | Prove callback capture does not exchange token or write production records. | `exchangeAttempted=false`; all production write flags are false; code/state/callback URL are redacted markers only. | Pass evidence exists, final package Hold |
| Workspace linking dry-run evidence | Redacted workspace/channel draft evidence. | Prove workspace mapping intent without production writes. | Workspace marker is hashed or masked; `wouldCreate=false`; `tokenStored=false`. | Pass evidence exists, final package Hold |
| Channel sync dry-run evidence | Redacted channel sync payload and test output. | Prove sync intent without creating Channel or starting real sync. | `syncMode=dry_run`; `wouldCreate=false`; `wouldStart=false`; no token/code/state/full callback URL. | Pass evidence exists, final package Hold |
| Rollback / fallback proof | Internal beta access / rollback runbook plus execution notes. | Prove the beta can be disabled and existing Instagram OAuth remains fallback. | Disable path, allowlist clear path, fallback verification, and no-production-write verification are documented. | Hold |

## 3. Per-File Gate Before App Review Package

Each file must pass every applicable gate before entering the upload package.

| Gate | Required result | Evidence field | Status |
| --- | --- | --- | --- |
| Source approval | File is listed in this assembly checklist and owned by the App Review package. | File name / owner / package version. | Hold |
| Redaction search | Text artifacts pass final search commands. | Redaction report finding IDs. | Hold |
| Visual redaction | Video and screenshots pass manual review. | Reviewer initials and timestamp. | Hold |
| No secrets | No token, secret, authorization code, raw state, raw nonce, full callback URL, cookie, localStorage, or sessionStorage. | Search and manual review result. | Hold |
| No unmasked asset IDs | Business / Page / IG / workspace identifiers are masked or hashed unless entered only into Meta secure dashboard fields. | Masking note. | Hold |
| No real customer data | Recording, screenshots, logs, and reports use test assets only. | Test asset proof. | Hold |
| Permission proof match | The file supports one or more permissions in the proof matrix. | Permission row reference. | Hold |
| Scope reconciliation | File does not imply a scope that is absent from the Dashboard or proof matrix. | Scope reconciliation row. | Hold |
| Rollback readiness | Package includes fallback / disable evidence if it references internal beta. | Rollback proof row. | Hold |
| Final sign-off | Product owner or designated reviewer approves upload. | Sign-off field. | Hold |

## 4. Files And Sensitive Data That Must Not Be Packaged

Do not include these file types in the App Review package:

- Raw browser recordings before redaction review.
- Unredacted screenshots.
- HAR files or network exports.
- Raw server logs, runtime logs, audit exports, or terminal transcripts that have not passed redaction search.
- `.env`, `.env.*`, secret manager exports, Supabase credential files, or dashboard secret screenshots.
- Cookie, localStorage, sessionStorage, browser profile, or device backup exports.
- Database dumps, Prisma migration experiments, production seed exports, or real customer data exports.
- Raw Meta API responses that contain tokens, codes, raw state, raw nonce, full callback URLs, or unmasked asset IDs.
- Any file containing private credentials, OTP, recovery codes, app secrets, client secrets, webhook verify tokens, or customer messages/comments outside the approved test scenario.

Sensitive data rules:

| Sensitive item | Required handling |
| --- | --- |
| Authorization code | Must never appear. Use `[REDACTED_CODE]`. |
| Raw state | Must never appear. Use `[REDACTED_STATE]`. |
| Raw nonce | Must never appear. Use `[REDACTED_NONCE]`. |
| Full callback URL | Must never appear. Use `[REDACTED_CALLBACK_URL]`. |
| Access / refresh token | Must never appear in package artifacts. |
| App / client / webhook secret | Must never appear in package artifacts. |
| Business / Page / IG raw IDs | Mask or hash unless Meta requires entry in a secure Dashboard field. |
| Workspace ID | Use a masked or hashed workspace marker. |
| Real customer data | Exclude; use reviewer-safe test assets only. |

## 5. Meta Dashboard Scope Reconciliation

Before packaging, reconcile the exact current Meta Dashboard scopes against the permission matrix.

| Meta Dashboard scope | Permission matrix row | Product proof | Reviewer recording segment | Decision |
| --- | --- | --- | --- | --- |
| `instagram_business_basic` | Required minimum IG Business scope. | Channel / profile identity proof. | Channel detail proof. | Keep if final proof passes. |
| `instagram_business_manage_messages` | Core messaging use case. | Inbox / automation message proof. | Inbox / message proof. | Keep only with final test message evidence. |
| `instagram_business_manage_comments` | Core comment automation use case. | Comment sync / automation proof. | Comment automation proof. | Keep only with final test comment evidence. |
| `instagram_business_content_publish` | Candidate only. | No current confirmed product proof. | No required segment unless product exists. | Remove or defer. |
| `instagram_business_manage_insights` | Candidate only. | No current confirmed product proof. | No required segment unless analytics exists. | Remove or defer. |
| Facebook Login for Business scopes | Candidate path only. | Business / Page / IG asset proof. | Business / Page / IG asset selection proof. | Hold until selected-flow reconciliation. |

Hard gate:

```text
The final App Review package must not request or demonstrate a permission that is absent from both the Meta Dashboard reconciliation and the permission proof matrix.
```

## 6. Internal Beta Hold Release Conditions

Internal beta can move from Hold to Go only if every gate below is Pass.

| Gate | Required result | Current status |
| --- | --- | --- |
| Final package assembly | All package artifacts are listed, reviewed, and versioned. | Hold |
| Redaction execution report | Completed against final artifacts with all findings resolved. | Hold |
| Reviewer recording | Captured, edited, and visually reviewed. | Hold |
| Screenshots | Redacted screenshots approved. | Hold |
| Permission proof | Every kept permission has reviewer-visible product proof. | Hold |
| Scope reconciliation | Meta Dashboard scopes match the final permission matrix. | Hold |
| Test asset proof | Reviewer-safe Business / Page / IG / workspace assets are documented. | Hold |
| Account selection UX evidence | Account/profile or Business/Page/IG selection is included. | Pass evidence exists |
| Callback evidence | Redacted callback evidence is included. | Pass evidence exists |
| Workspace linking dry-run | Dry-run mapping evidence is included. | Pass evidence exists |
| Channel sync dry-run | Dry-run sync evidence is included. | Pass evidence exists |
| Access controls | Internal-only beta entry point, workspace allowlist, and user/admin role policy are approved. | Hold |
| Rollback / fallback | Disable beta and fallback verification are documented and tested. | Hold |
| Product owner sign-off | Final approval is recorded. | Hold |

Decision:

```text
Internal beta: Hold
Reason: final package assembly, redaction execution, recording, screenshots, permission proof, scope reconciliation, test assets, access controls, rollback proof, and sign-off are not complete.
```

## 7. Why Production Implementation Still Cannot Start

Production implementation remains No-Go even after this checklist is created.

Reasons:

- App Review is not submitted or approved.
- Business Verification / Advanced Access status is not confirmed for the final scope set.
- Final App Review package is not assembled or approved.
- Production env migration plan is not approved.
- Production callback behavior for real token exchange is not implemented or reviewed.
- Production ConnectedAccount / Channel writes remain intentionally blocked in sandbox.
- Real token storage, encryption, refresh, and expiry lifecycle are not approved for this provider.
- Webhook registration and channel sync lifecycle are not approved for real assets.
- Tenant isolation regression for real Business / Page / IG asset writes is not complete.
- Production rollback / monitoring plan is not complete.
- Existing Instagram OAuth fallback must remain available until a separate production implementation ADR is approved.

## Final Assembly Decision

```text
Final App Review package assembly checklist: Draft complete
Actual App Review package assembled: No
App Review readiness: Hold
Internal beta: Hold
Production implementation: No-Go

Next step:
Assemble the actual reviewer recording, screenshots, permission proof, redaction execution report, and test asset proof package, then run this checklist as the final package gate.
```
