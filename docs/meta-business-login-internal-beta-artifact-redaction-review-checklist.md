# Meta Business Login Internal Beta Artifact Redaction Review Checklist

Date: 2026-06-17
Status: Redaction review checklist / internal beta Hold / App Review submission preparation Hold / production implementation No-Go

## Scope

This checklist defines the redaction review gates for Meta Business Login / Instagram Business Login internal beta artifacts before they can enter the final package.

Source document:

```text
docs/meta-business-login-internal-beta-artifact-manifest-template.md
```

This checklist only governs artifact review. It does not approve internal beta, App Review submission, or production implementation.

Global prohibited values:

- Raw authorization code.
- Raw state.
- Raw nonce.
- Full callback URL.
- Access token or refresh token.
- App secret, client secret, webhook verify token, API key, database URL, or Supabase key.
- Cookies, localStorage, sessionStorage, credentials, OTP, or private browser profile data.
- Unmasked Meta Business ID, Page ID, IG account ID, workspace ID, user ID, or customer ID.
- Real customer messages, comments, profile data, private business data, or billing data.

Allowed safe markers:

```text
[REDACTED_CODE]
[REDACTED_STATE]
[REDACTED_NONCE]
[REDACTED_CALLBACK_URL]
[REDACTED_TOKEN]
[REDACTED_SECRET]
business:masked-001
page:masked-001
ig:masked-001
workspace:masked-001
user:masked-001
```

## 1. Reviewer Recording Redaction Checklist

Artifact:

```text
IBE-ART-01 reviewer-recording
```

| Check | Required result | Actual result | Status | Notes |
| --- | --- | --- | --- | --- |
| Recording filename follows manifest naming format. | Pass |  | Hold |  |
| Owner is `app-review-owner`. | Pass |  | Hold |  |
| Reviewer is `security-reviewer`. | Pass |  | Hold |  |
| Version is exact `vNN`. | Pass |  | Hold |  |
| Browser address bar is hidden, cropped, or contains no OAuth callback query. | Pass |  | Hold |  |
| No raw authorization code appears on screen. | Pass |  | Hold |  |
| No raw state appears on screen. | Pass |  | Hold |  |
| No raw nonce appears on screen. | Pass |  | Hold |  |
| No full callback URL appears on screen. | Pass |  | Hold |  |
| No token, secret, cookie, localStorage, sessionStorage, request header, OTP, or password appears. | Pass |  | Hold |  |
| Business / Page / IG / workspace / user identifiers are masked. | Pass |  | Hold |  |
| Account selection UX is visible without exposing private account data. | Pass |  | Hold |  |
| Consent screen is visible without exposing private account data. | Pass |  | Hold |  |
| Callback evidence segment shows redacted JSON or approved redacted screenshot only. | Pass |  | Hold |  |
| Workspace linking dry-run segment shows no production writes. | Pass |  | Hold |  |
| Channel sync dry-run segment shows no token/code/secret/state/callback URL. | Pass |  | Hold |  |
| Product proof screens do not show real customer messages or comments. | Pass |  | Hold |  |
| Rollback / fallback segment does not reveal env, secrets, or admin-only private data. | Pass |  | Hold |  |
| Visual reviewer has signed off. | Pass |  | Hold |  |
| Finding count is recorded. | Pass |  | Hold |  |
| Unresolved finding count is `0`. | Pass |  | Hold |  |

Decision rule:

```text
Reviewer recording can enter 11_final_package only when every required check is Pass and unresolved finding count is 0.
```

## 2. Screenshots Redaction Checklist

Artifact:

```text
IBE-ART-02 screenshot-package
```

| Screenshot group | Required redaction review | Required result | Actual result | Status |
| --- | --- | --- | --- | --- |
| Account selection | No private profile, full account ID, raw URL, cookie, or browser credential visible. | Pass |  | Hold |
| Consent | No private account details beyond reviewer-safe test asset labels. | Pass |  | Hold |
| Callback | Redacted callback evidence only; no raw code/state/nonce/full callback URL. | Pass |  | Hold |
| Product proof | No real customer messages, comments, names, avatars, media, billing, or private business data. | Pass |  | Hold |
| Workspace linking dry-run | Workspace and asset markers are masked; no production writes. | Pass |  | Hold |
| Channel sync dry-run | No token/code/secret/state/callback URL; no real sync started. | Pass |  | Hold |
| Rollback / fallback | No env values, secrets, deployment settings, or private admin data. | Pass |  | Hold |
| Metadata | Screenshot metadata has no private path, username, or account data if exported. | Pass |  | Hold |

Package rule:

```text
Screenshots with browser address-bar OAuth query parameters must be rejected or sanitized into a new version before review.
```

## 3. Permission Proof Redaction Checklist

Artifacts:

```text
IBE-ART-03 permission-proof
IBE-ART-05 scope-reconciliation
```

| Permission / scope | Product proof redaction | Data-use proof redaction | Retention / deletion proof redaction | Reviewer proof redaction | Status |
| --- | --- | --- | --- | --- | --- |
| `instagram_business_basic` |  |  |  |  | Hold |
| `instagram_business_manage_messages` |  |  |  |  | Hold |
| `instagram_business_manage_comments` |  |  |  |  | Hold |
| `instagram_business_content_publish` |  |  |  |  | Hold |
| `instagram_business_manage_insights` |  |  |  |  | Hold |

Required checks:

| Check | Required result | Actual result | Status |
| --- | --- | --- | --- |
| Permission proof has no raw token/code/state/nonce/callback URL. | Pass |  | Hold |
| Permission proof has no app secret, client secret, API key, or Supabase key. | Pass |  | Hold |
| Product screen proof uses test or masked data only. | Pass |  | Hold |
| Read/write/store descriptions do not include raw payloads. | Pass |  | Hold |
| Retention / deletion explanation has no customer-specific data. | Pass |  | Hold |
| Scope reconciliation does not expose dashboard secrets. | Pass |  | Hold |
| Unsupported or unproven scopes are marked deferred or removed from package. | Pass |  | Hold |
| Unresolved finding count is `0`. | Pass |  | Hold |

Permission gate rule:

```text
Any kept permission without redacted proof remains Hold. Unsupported or insufficiently proven permissions must be removed, deferred, or separately documented before App Review packaging.
```

## 4. Test Asset Proof Redaction Checklist

Artifact:

```text
IBE-ART-04 test-asset-proof
```

| Asset type | Required masking | Actual result | Status | Notes |
| --- | --- | --- | --- | --- |
| Meta Business | Use `business:masked-NNN`; no raw Business ID. |  | Hold |  |
| Facebook Page | Use `page:masked-NNN`; no raw Page ID. |  | Hold |  |
| Instagram account | Use `ig:masked-NNN`; no raw IG account ID or private profile data. |  | Hold |  |
| Reviewer workspace | Use `workspace:masked-NNN`; no raw workspace ID. |  | Hold |  |
| Reviewer user | Use `user:masked-NNN`; no email, phone, or private profile URL. |  | Hold |  |
| Tester role | Role marker only; no private account credential. |  | Hold |  |
| Fallback flow | No raw callback URL, env value, or credential. |  | Hold |  |

Required checks:

- Test asset screenshots must not show unmasked IDs.
- Meta Dashboard screenshots must not show app secret, webhook verify token, private user data, raw app role user email, or privileged account details.
- Any test asset proof with unmasked identifiers must move to quarantine until replaced.

## 5. Callback / Workspace Linking / Channel Sync Dry-Run Artifact Redaction Checklist

Artifacts:

```text
IBE-ART-06 callback-evidence
IBE-ART-07 workspace-linking-dry-run
IBE-ART-08 channel-sync-dry-run
```

### 5.1 Callback Evidence

| Check | Required result | Actual result | Status |
| --- | --- | --- | --- |
| Callback artifact contains `sandbox_callback_capture` or equivalent redacted marker only. | Pass |  | Hold |
| No raw authorization code. | Pass |  | Hold |
| No raw state. | Pass |  | Hold |
| No raw nonce. | Pass |  | Hold |
| No full callback URL. | Pass |  | Hold |
| No access token or refresh token. | Pass |  | Hold |
| `exchangeAttempted=false` is present when applicable. | Pass |  | Hold |
| Production write flags are all false when applicable. | Pass |  | Hold |
| JSON payload is pretty-printed or exported without hidden raw fields. | Pass |  | Hold |

### 5.2 Workspace Linking Dry-Run

| Check | Required result | Actual result | Status |
| --- | --- | --- | --- |
| Workspace marker is masked. | Pass |  | Hold |
| Provider marker is sandbox-only. | Pass |  | Hold |
| ConnectedAccount draft has no production write. | Pass |  | Hold |
| No token/code/secret/state/callback URL appears in mapping. | Pass |  | Hold |
| No tenant boundary data from another workspace appears. | Pass |  | Hold |
| Audit evidence is redacted. | Pass |  | Hold |

### 5.3 Channel Sync Dry-Run

| Check | Required result | Actual result | Status |
| --- | --- | --- | --- |
| Channel marker is draft-only. | Pass |  | Hold |
| No production Channel write. | Pass |  | Hold |
| No real channel sync starts. | Pass |  | Hold |
| No token/code/secret/state/callback URL appears in payload. | Pass |  | Hold |
| No webhook registration or webhook write occurs. | Pass |  | Hold |
| No real customer media, message, comment, or insight data appears. | Pass |  | Hold |

## 6. Guard Test Output Redaction Checklist

Artifacts:

```text
IBE-ART-09 guard-test-output
IBE-ART-10 token-exchange-guard
```

Targeted test command:

```bash
npx vitest run tests/meta-business-login-sandbox-sbl08.test.ts tests/meta-business-login-sandbox-sbl12-callback-capture.test.ts tests/meta-business-login-sandbox-sbl12-callback-route.test.ts tests/meta-business-login-sandbox-sbl13-workspace-linking-sync.test.ts
```

| Check | Required result | Actual result | Status |
| --- | --- | --- | --- |
| Test output includes no raw token. | Pass |  | Hold |
| Test output includes no raw authorization code. | Pass |  | Hold |
| Test output includes no raw state. | Pass |  | Hold |
| Test output includes no raw nonce. | Pass |  | Hold |
| Test output includes no full callback URL. | Pass |  | Hold |
| Test output includes no app secret, client secret, API key, database URL, or Supabase key. | Pass |  | Hold |
| Test output confirms production ConnectedAccount write guard. | Pass |  | Hold |
| Test output confirms production Channel write guard. | Pass |  | Hold |
| Test output confirms token exchange guard. | Pass |  | Hold |
| Test output confirms channel sync dry-run guard. | Pass |  | Hold |
| Test output confirms redaction assertions. | Pass |  | Hold |

Allowed false positives:

```text
Field names such as code, state, nonce, token, or secret without real values.
Synthetic fixture labels.
Redacted placeholders.
Masked markers.
Command examples.
```

## 7. Final Package Redaction Gate Pass / Hold / Fail

Use this decision table for each artifact.

| Gate result | Required condition | Package action |
| --- | --- | --- |
| Pass | All required visual/text checks complete, unresolved finding count is `0`, owner/reviewer/version filled, and file follows naming rules. | Copy exact version to `11_final_package/`. |
| Hold | Artifact is missing, unreviewed, partially reviewed, has unresolved questions, or has missing metadata. | Keep outside final package. |
| Fail | Artifact contains prohibited data or cannot be safely sanitized. | Move to quarantine or excluded register. |
| Excluded | Artifact is intentionally not used, superseded, or deferred. | Record reason and do not package. |

Final package entry rule:

```text
No artifact can be marked Packaged unless Redaction gate=Pass and unresolved finding count=0.
```

Internal beta rule:

```text
Any Hold, Fail, missing artifact, missing reviewer, missing version, unresolved finding, or package mismatch keeps internal beta at Hold.
```

## 8. Quarantine / Excluded Artifact Handling Rules

Use quarantine for:

- Any artifact containing raw token/code/state/nonce/full callback URL.
- Any artifact containing app secret, client secret, API key, database URL, or Supabase key.
- Any artifact showing browser cookies, storage, credential, OTP, or private login content.
- Any artifact showing unmasked Business / Page / IG / workspace / user / customer identifiers.
- Any artifact showing real customer messages, comments, media, profile data, billing data, or private business data.
- Any artifact with uncertain redaction status.
- Any artifact that failed review and needs replacement.

Quarantine handling:

| Step | Required action | Status |
| --- | --- | --- |
| Move failed artifact to `quarantine_do_not_package/` or `excluded/`. | Required | Hold |
| Record original artifact ID and filename in quarantine register. | Required | Hold |
| Record finding category without raw sensitive value. | Required | Hold |
| Assign cleanup owner. | Required | Hold |
| Create new sanitized version instead of editing reviewed artifact in place. | Required | Hold |
| Re-run failed review check. | Required | Hold |
| Re-run full final redaction search before package Go. | Required | Hold |
| Link replacement artifact if it passes. | Required if replaced | Hold |

Excluded artifact rule:

```text
Excluded artifacts do not support internal beta Go. If a required artifact is excluded, the gate remains Hold unless a replacement artifact passes redaction review.
```

## 9. Production Implementation Still Cannot Start

Production implementation remains No-Go after this checklist is created.

Reasons:

- This checklist does not collect or approve real evidence.
- Redaction review has not been executed for real artifacts.
- Manifest entries are not filled, versioned, reviewed, or redaction-gated.
- Internal beta remains Hold until every required artifact has Redaction gate=Pass and unresolved finding count=0.
- App Review has not been submitted or approved.
- Business Verification / Advanced Access status is not confirmed for the final scope set.
- App Review package assembly remains incomplete.
- Production env migration plan is not approved.
- No Supabase migration / db push has been reviewed or confirmed for this provider.
- Production callback behavior for real token exchange is not implemented or reviewed.
- Production ConnectedAccount / Channel writes remain intentionally blocked in sandbox.
- Real token storage, encryption, refresh, revocation, and expiry lifecycle are not approved for this provider.
- Webhook registration and channel sync lifecycle are not approved for real assets.
- Tenant isolation regression for real Business / Page / IG asset writes is not complete.
- Existing Instagram OAuth fallback must remain available until a separate production implementation ADR is approved.

Current decision:

```text
Production implementation: No-Go
```

## 10. Explicit Restrictions

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
- Do not store raw token, authorization code, raw state, raw nonce, full callback URL, app secret, client secret, webhook verify token, cookie, browser storage, credential, OTP, unmasked asset ID, or real customer data.

Supabase safety note:

```text
If a future task requires Supabase migration or db push, first show current project_id, linked project, and Supabase account email, then wait for explicit confirmation.
```

## 11. Documents To Backfill After Completion

After redaction review is executed for a real run, backfill:

| Document | Required update |
| --- | --- |
| `docs/meta-business-login-internal-beta-artifact-redaction-review-checklist.md` | Fill actual Pass / Hold / Fail results and unresolved finding counts. |
| `docs/meta-business-login-internal-beta-artifact-manifest-template.md` | Update artifact redaction gate, package result, finding count, unresolved finding count, and final paths. |
| `docs/meta-business-login-internal-beta-artifact-folder-structure-spec.md` | Record whether folder structure and quarantine rules were followed. |
| `docs/meta-business-login-internal-beta-real-evidence-execution-report-blank-run.md` | Link redaction review results to artifact execution status. |
| `docs/meta-business-login-internal-beta-real-evidence-execution-plan.md` | Mark redaction review steps Pass / Hold / Fail. |
| `docs/meta-business-login-final-redaction-search-execution-report-template.md` | Fill search commands, visual review result, false positives, findings, cleanup, and retest. |
| `docs/meta-business-login-internal-beta-evidence-execution-report-template.md` | Summarize redaction status and unresolved findings. |
| `docs/meta-business-login-internal-beta-release-decision-memo-template.md` | Reference final redaction gate status in Go / Hold decision. |
| `docs/meta-business-login-final-app-review-package-assembly-checklist.md` | Confirm only redaction-passed artifacts entered final package. |
| `docs/meta-business-login-sandbox-go-no-go-checklist.md` | Update internal beta redaction gate status. |
| `docs/meta-app-review-checklist.md` | Update App Review readiness and package redaction status. |
| `docs/security-review.md` | Update redaction and artifact handling security posture. |
| `docs/fix-roadmap.md` | Add remaining Hold / Fail blockers after current unrelated edits are resolved. |
| `docs/codex-session-log.md` | Add session result after current unrelated edits are resolved. |

## Final Checklist Status

```text
Artifact redaction review checklist: Ready
Redaction review executed: No
Final package entries approved: No
Artifacts redaction-gated: No
Internal beta: Hold
App Review submission preparation: Hold
Production implementation: No-Go
```

