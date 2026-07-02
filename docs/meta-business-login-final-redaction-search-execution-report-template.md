# Meta Business Login Final Redaction Search Execution Report Template

Date: 2026-06-16
Status: Blank execution report template / App Review readiness Hold / internal beta Hold / production implementation No-Go

## Scope

This template is used to execute and record the final redaction search before Meta Business Login / Instagram Business Login App Review packaging or internal beta review.

This document does not change:

- OAuth flow
- callback route
- login button
- environment variables
- Prisma schema
- production ConnectedAccount / Channel writes
- real Meta token exchange

Source documents:

```text
docs/meta-business-login-final-reviewer-recording-shot-list.md
docs/meta-business-login-final-permission-usage-proof-matrix.md
docs/meta-business-login-final-app-review-demo-package-checklist.md
```

## 1. Execution Metadata

```text
Execution date:
Executor:
Reviewer:
Branch / commit:
App Review package version:
Recording package version:
Screenshot package version:
Test output package version:
Log export package version:
Audit export package version:
Scope reconciliation document:
Permission matrix document:
Shot list document:
```

Decision before execution:

```text
App Review readiness: Hold
Internal beta: Hold
Production implementation: No-Go
```

## 2. Search Scope

Search must cover every artifact that could expose sensitive Meta / Instagram OAuth or account-linking data.

| Area | Required scope | Included paths / artifact names | Status | Notes |
| --- | --- | --- | --- | --- |
| App Review documents | Final checklist, permission matrix, reviewer recording shot list, runbook, report, go/no-go checklist, security notes. |  |  |  |
| Recording files | Reviewer demo video, raw screen recording, edited export, captions/transcripts if generated. |  |  |  |
| Screenshots | Meta dialog screenshots, consent screen, InboxPilot screens, callback evidence, dry-run evidence. |  |  |  |
| Test output | Targeted SBL tests, lint, build, CI logs, local terminal output saved for review. |  |  |  |
| Server logs | Vercel/runtime logs, local dev logs, callback route logs if exported. |  |  |  |
| Audit records | InboxPilot audit entries, sandbox evidence audit payloads, redacted callback audit output. |  |  |  |
| Browser console | Console screenshots or exports captured during recording. |  |  |  |
| Network evidence | Network panel exports if captured; must be redacted or excluded. |  |  |  |
| App Review upload package | Final files uploaded to Meta. |  |  |  |

Hard rule:

```text
If an artifact cannot be searched, it must be excluded from the App Review package or manually reviewed and recorded here.
```

## 3. Required Search Commands

Run these against repository files and any exported text artifacts. For binary video/image files, record manual visual review results in section 6.

### Token / Secret Search

```bash
rg -n "access_token|refresh_token|client_secret|app_secret|verify_token|appSecret|clientSecret|refreshToken|accessToken" docs tests src
```

Result:

```text
Command run:
Exit code:
Findings:
False positives:
Cleanup required:
Retest required:
Reviewer initials:
```

### Authorization Code Search

```bash
rg -n "code=|authorization_code|\\bcode\\s*[:=]\\s*[\"'][A-Za-z0-9_\\-]{16,}" docs tests src
```

Result:

```text
Command run:
Exit code:
Findings:
False positives:
Cleanup required:
Retest required:
Reviewer initials:
```

### Raw State / Nonce Search

```bash
rg -n "state=sblcap\\.|raw state|raw_state|raw nonce|raw_nonce|nonce=|\\bnonce\\s*[:=]\\s*[\"'][A-Za-z0-9_\\-]{16,}" docs tests src
```

Result:

```text
Command run:
Exit code:
Findings:
False positives:
Cleanup required:
Retest required:
Reviewer initials:
```

### Full Callback URL Search

```bash
rg -n "/api/instagram/oauth/callback\\?|/api/meta/oauth/callback\\?|callbackUrl\\s*[:=]\\s*[\"']https?://|redirect_uri=.*callback" docs tests src
```

Result:

```text
Command run:
Exit code:
Findings:
False positives:
Cleanup required:
Retest required:
Reviewer initials:
```

### Unmasked Meta Asset ID Search

```bash
rg -n "businessId\\s*[:=]\\s*[\"']?\\d{6,}|pageId\\s*[:=]\\s*[\"']?\\d{6,}|instagramAccountId\\s*[:=]\\s*[\"']?\\d{6,}|igUserId\\s*[:=]\\s*[\"']?\\d{6,}|providerAccountId\\s*[:=]\\s*[\"']?\\d{6,}" docs tests src
```

Result:

```text
Command run:
Exit code:
Findings:
False positives:
Cleanup required:
Retest required:
Reviewer initials:
```

### Screenshot / Recording Manual Review

For non-text artifacts, review visually.

```text
Video reviewed:
Screenshots reviewed:
Transcript reviewed:
Raw code visible: Pass / Fail
Raw state visible: Pass / Fail
Raw nonce visible: Pass / Fail
Full callback URL visible: Pass / Fail
Token visible: Pass / Fail
Secret visible: Pass / Fail
Unmasked asset ID visible: Pass / Fail
Private credential / OTP visible: Pass / Fail
Real customer data visible: Pass / Fail
Reviewer notes:
```

## 4. Allowed False Positive Rules

The following are allowed only when they do not contain real sensitive values.

| False positive type | Allowed example | Required note |
| --- | --- | --- |
| Redacted marker | `[REDACTED_CODE]`, `[REDACTED_STATE]`, `[REDACTED_CALLBACK_URL]`, `[REDACTED_TOKEN]` | Mark as allowed redacted marker. |
| Synthetic unsafe fixture | Files under explicit unsafe fixture paths using fake values. | Confirm it is synthetic and not copied from Meta. |
| Search command text | Documentation that contains search patterns such as `code=` or `state=sblcap\\.`. | Mark as instruction-only. |
| Generic field names | `accessToken`, `clientSecret`, `providerAccountId` as code identifiers without values. | Confirm no real value is present. |
| Hashed / masked asset marker | `hash:...`, `***1234`, `[MASKED_PAGE_ID]`. | Confirm original ID cannot be reconstructed. |

The following are not allowed false positives:

- Any real authorization code.
- Any raw state or nonce value.
- Any full callback URL with query parameters.
- Any access token or refresh token.
- Any app secret, client secret, or webhook verify token.
- Any unmasked Business / Page / IG account ID.
- Any real customer message, comment, credential, OTP, cookie, localStorage, or sessionStorage value.

## 5. Finding Record

Create one record for every finding that is not immediately accepted as an allowed false positive.

```text
Finding ID:
Discovery command / review source:
Artifact:
File / timestamp:
Line / frame:
Finding type:
  - token
  - authorization code
  - secret
  - raw state
  - raw nonce
  - full callback URL
  - unmasked asset ID
  - real customer data
  - other
Severity:
  - Critical
  - High
  - Medium
  - Low
Raw value copied into this report: No
Description:
Likely source:
App Review package impact:
Internal beta impact:
Production implementation impact:
Owner:
Required cleanup:
Cleanup PR / commit:
Retest command:
Retest result:
Final disposition:
  - cleaned
  - accepted false positive
  - excluded artifact
  - blocked
Reviewer approval:
```

Critical handling:

```text
If the finding is a real token, code, secret, raw state, raw nonce, full callback URL, credential, OTP, cookie, or real customer data:
- Do not copy the value into this report.
- Remove or rotate the exposed value where applicable.
- Exclude the artifact from App Review until cleaned.
- Keep internal beta at Hold.
- Keep production implementation at No-Go.
```

## 6. Cleanup And Retest Flow

Use this flow for every non-allowed finding.

1. Classify the finding without copying raw sensitive values.
2. Remove, redact, or exclude the affected artifact.
3. If a token, secret, credential, or webhook verify token was exposed, rotate it before reuse.
4. Re-run the exact command or manual review that found the issue.
5. Re-run the full required search set in section 3.
6. Record the cleanup commit or artifact replacement.
7. Record reviewer approval.

Retest summary:

| Finding ID | Cleanup action | Retest command / review | Retest result | Reviewer approval |
| --- | --- | --- | --- | --- |
|  |  |  |  |  |

## 7. Final Redaction Decision

```text
Token / secret search: Pass / Fail
Authorization code search: Pass / Fail
Raw state / nonce search: Pass / Fail
Full callback URL search: Pass / Fail
Unmasked asset ID search: Pass / Fail
Screenshot review: Pass / Fail
Recording review: Pass / Fail
Test output review: Pass / Fail
Server log review: Pass / Fail
Audit review: Pass / Fail
All findings resolved: Pass / Fail
```

Decision:

```text
Final redaction search: Pass / Hold / No-Go
Reason:
Reviewer:
Date:
```

## 8. Internal Beta Hold Release Decision

Internal beta can only move from Hold to Go if all items below are Pass.

| Gate | Required result | Status | Evidence |
| --- | --- | --- | --- |
| Final redaction search | All required text and visual searches pass. |  |  |
| Reviewer recording | Recording is captured and approved. |  |  |
| Screenshot package | Screenshots are redacted and approved. |  |  |
| Permission proof | Every requested permission has product-screen proof. |  |  |
| Scope reconciliation | Meta Dashboard scopes match the approved permission matrix. |  |  |
| Test assets | Business / Page / IG test assets are masked and reviewer-accessible. |  |  |
| Access controls | Internal-only beta entry point and user/admin roles are approved. |  |  |
| Workspace allowlist | Approved beta workspace list exists. |  |  |
| Rollback | Disable beta / fallback path is documented and tested. |  |  |
| Product owner sign-off | Sign-off is recorded. |  |  |

Decision:

```text
Internal beta: Go / Hold
Reason:
Required follow-up:
```

## 9. Why Production Implementation Still Cannot Start

Production implementation remains No-Go even if this redaction search passes.

Reasons:

- App Review is not submitted or approved.
- Business Verification / Advanced Access status is not confirmed for the final scope set.
- Production env migration plan is not approved.
- Production callback behavior for real token exchange is not implemented or reviewed.
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

## Final Report Decision

```text
Final redaction search execution report template: Ready
This execution report completed: Yes / No
App Review readiness: Hold
Internal beta: Hold
Production implementation: No-Go

Next step:
Execute this template against the actual final App Review recording, screenshots, docs, logs, audit exports, and test output package.
```
