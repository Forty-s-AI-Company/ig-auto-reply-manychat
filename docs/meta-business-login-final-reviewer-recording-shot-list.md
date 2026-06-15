# Meta Business Login Final Reviewer Recording Shot List

Date: 2026-06-16
Status: Draft recording plan / App Review readiness Hold / internal beta Hold / production implementation No-Go

## Scope

This document defines the final reviewer-facing recording shot list for the Meta Business Login / Instagram Business Login App Review package.

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
docs/meta-business-login-final-permission-usage-proof-matrix.md
docs/meta-business-login-final-app-review-demo-package-checklist.md
docs/meta-business-login-sandbox-controlled-consent-run-2026-06-16.md
docs/meta-business-login-sandbox-sbl13-workspace-linking-sync-dry-run.md
```

## Recording Principles

The final reviewer video must be short, reproducible, and free of secrets.

Required recording constraints:

- Use a dedicated reviewer test workspace.
- Use only approved test Business / Page / IG assets.
- Show product screens that prove each requested permission.
- Show redacted callback and dry-run evidence only.
- Do not show raw authorization code, raw state, raw nonce, full callback URL, access token, refresh token, app secret, client secret, webhook verify token, private credentials, OTP, cookies, localStorage, sessionStorage, or unmasked Meta asset IDs.
- Do not present sandbox callback capture or dry-run channel sync as production behavior.

## 1. Permission-To-Shot Matrix

| Permission / scope | Required recording shot | Product screen | Evidence status before recording | Recording recommendation |
| --- | --- | --- | --- | --- |
| `instagram_business_basic` | Show connected IG professional account identity, username, account type, and channel detail with masked account marker. | Channels, Channel detail, profile refresh result | Partial Pass | Record. This is part of the minimum IG Business Login scope set. |
| `instagram_business_manage_messages` | Show test IG DM appearing in Inbox or a reviewer-safe dry-run message proof if live message is not available. | Inbox, conversation detail, automation reply builder | Hold | Record only after test message proof exists. Keep all message participant identifiers masked. |
| `instagram_business_manage_comments` | Show test post/comment sync or reviewer-safe dry-run comment proof if live comment sync is not available. | Comment sync, automation comment trigger, channel activity | Hold | Record only after test comment proof exists. Mask media/comment/account IDs. |
| `instagram_business_content_publish` | Do not record unless an actual publishing feature exists. | No confirmed current product screen | Defer / Remove | Remove or defer from final scope. A recording without a product screen should not be submitted. |
| `instagram_business_manage_insights` | Do not record unless an actual analytics/insights feature exists. | Analytics / channel insights, if implemented | Defer / Remove | Remove or defer from final scope. Do not request based only on candidate URL evidence. |
| `public_profile` | Show Facebook identity only if Facebook Login for Business remains in the selected flow. | Social Accounts, connected account list | Hold | Record only for Facebook Login for Business package. Not required for IG Business Login-only package. |
| `pages_show_list` | Show Page selection or Page-linked IG asset selection with masked Page marker. | Business / Page / IG selection, Channel creation | Hold | Record only if Facebook Login for Business path is selected. |
| `pages_read_engagement` | Show why Page engagement metadata is required for channel detail or sync. | Channel detail, Page/IG sync, comment sync support | Hold | Record only if product proof exists; otherwise remove from final request. |
| `pages_manage_metadata` | Show webhook/setup status or explain the Page metadata operation with safe dry-run evidence. | Channel connection, webhook setup / verification status | Hold | Record only if production plan requires Page webhook metadata management. |
| `pages_messaging` | Show Page/Messenger messaging proof only if Page/Messenger flow remains in scope. | Inbox, automation reply, Page / Messenger messaging support | Hold | Keep separate from IG Business Login-only message proof. |
| `instagram_basic` | Show Page-linked IG basic profile details if Facebook Graph path is selected. | Channel detail, profile refresh for Page-linked IG account | Hold | Record only for Facebook Login / Page-linked IG flow. |
| `instagram_manage_comments` | Show Page-linked IG comment proof if Facebook Graph path is selected. | Comment sync, automation comment trigger | Hold | Record only for Facebook Graph path. |
| `instagram_manage_messages` | Show Page-linked IG message proof if Facebook Graph path is selected. | Inbox, automation reply for Page-linked IG messages | Hold | Record only for Facebook Graph path. |
| `business_management` | Show Business / asset selection and masked mapping proof. | Business / Page / IG asset selection | Hold | Required only if Facebook Login for Business is selected. |
| `openid` | Do not record. | Not applicable | Defer / Remove | Not currently requested by InboxPilot. |

## 2. Recommended Recording Segments

### Segment A - Reviewer Workspace Entry

Purpose:

- Prove the reviewer is inside the intended InboxPilot test workspace.
- Establish that the recording uses a test workspace, not a production customer workspace.

Steps:

1. Open the reviewer test login route or pre-authenticated test workspace.
2. Show the workspace name or masked workspace marker.
3. Show the user/admin role required for the review.
4. Do not open developer tools, cookies, localStorage, sessionStorage, or environment screens.

Must show:

- Workspace context.
- Reviewer-safe account role.

Must not show:

- Private credentials.
- OTP or recovery code.
- Raw workspace ID if it is globally identifying.

### Segment B - Navigate To Social Connection Area

Purpose:

- Prove where the user starts account linking.
- Show that the existing product navigation remains understandable.

Steps:

1. Navigate to Channels / Social Accounts.
2. Show the available Instagram / Meta connection area.
3. State visually through page context that this is the test workspace channel setup area.

Must show:

- Channel/social connection page.
- Test workspace context.

Must not show:

- Existing customer account tokens.
- Unmasked production channel identifiers.

### Segment C - Start Instagram Business Login Flow

Purpose:

- Prove that the intended Meta / Instagram Business Login flow is entered.
- Show the account/profile selection or use-another-profile path.

Steps:

1. Start the sandbox recording from the documented internal beta entry point or controlled test entry point.
2. Show Instagram / Meta account selection if it appears.
3. Select the approved test IG professional account.
4. Continue only through the reviewer-approved consent flow.

Must show:

- Account/profile selection or use-another-profile option.
- Selected test IG profile, masked if needed.
- Consent screen with app name and requested permissions.

Must not show:

- Full authorize URL.
- Full callback URL.
- Raw state.
- Raw authorization code.
- Browser address bar if it contains sensitive query parameters.

### Segment D - Consent Screen

Purpose:

- Prove that the reviewer can see app identity, requested permissions, and policy links.

Steps:

1. Pause on the consent screen long enough for reviewer context.
2. Show app name.
3. Show requested permission groups.
4. Show Privacy Policy and Terms links if visible.
5. Continue only with an approved test account.

Must show:

- App identity.
- Permission wording.
- Policy links.

Must not show:

- Raw account IDs.
- Private user credentials.
- App secret or dashboard secret.

### Segment E - Redacted Callback Evidence

Purpose:

- Prove the callback returns redacted sandbox evidence without token exchange or production writes.

Steps:

1. After consent completes, show only the redacted callback response body or a sanitized evidence page.
2. Confirm the response mode is `sandbox_callback_capture`.
3. Confirm code/state/callback URL fields use redacted markers.
4. Confirm `exchangeAttempted=false`.
5. Confirm all production write flags are false.

Must show:

```text
mode: sandbox_callback_capture
status: success
code: [REDACTED_CODE]
state: [REDACTED_STATE]
callbackUrl: [REDACTED_CALLBACK_URL]
exchangeAttempted: false
productionWrites.connectedAccount: false
productionWrites.channel: false
productionWrites.webhook: false
productionWrites.channelSync: false
productionWrites.tokenRefresh: false
```

Must not show:

- Raw authorization code.
- Raw state.
- Raw nonce.
- Full callback URL.
- Access token.
- Refresh token.
- Secret.

### Segment F - Workspace Linking Dry-Run Evidence

Purpose:

- Prove how the callback evidence maps to a workspace and channel draft without production writes.

Steps:

1. Show the workspace linking dry-run evidence page or sanitized report section.
2. Show the sandbox provider id.
3. Show hashed workspace marker only.
4. Show ConnectedAccount draft with `wouldCreate=false`.
5. Show `tokenStored=false`.

Must show:

- Sandbox provider.
- Hashed workspace marker.
- ConnectedAccount draft.
- No production write.
- No token storage.

Must not show:

- Raw workspace ID if it is sensitive.
- Raw Business / Page / IG asset ID.
- Token or authorization code.

### Segment G - Channel Sync Dry-Run Evidence

Purpose:

- Prove channel sync intent without creating production Channel records or starting real sync.

Steps:

1. Show channel sync dry-run evidence page or sanitized report section.
2. Show channel draft with `wouldCreate=false`.
3. Show `syncMode=dry_run`.
4. Show `wouldStart=false`.
5. Show `tokenRequiredButNotPresent=true`.
6. Show requested checks for profile, message, comment, and optional capability checks.

Must show:

- Channel draft.
- Dry-run sync mode.
- Production write guard result.
- Redaction result.

Must not show:

- Raw token.
- Raw authorization code.
- Raw state.
- Full callback URL.
- Unmasked asset IDs.

### Segment H - Channel Detail Proof

Purpose:

- Prove `instagram_business_basic` with a visible product screen.

Steps:

1. Open Channel detail or a reviewer-safe channel draft detail.
2. Show the IG username / account type / profile metadata, masked where required.
3. Show workspace association.
4. Explain through visible labels that the channel belongs to the test workspace.

Must show:

- IG professional account identity.
- Channel/workspace association.
- No token display.

Must not show:

- Token fields.
- Raw provider account ID.
- Full Meta asset IDs.

### Segment I - Inbox / Message Proof

Purpose:

- Prove `instagram_business_manage_messages` if this scope remains in the final request.

Steps:

1. Send or use a pre-approved test IG message from a reviewer test account.
2. Show the message appears in Inbox or a reviewer-safe dry-run message proof.
3. Show automation reply configuration or reply behavior if included in scope proof.
4. Mask sender identifiers and message IDs.

Must show:

- Inbox / conversation context.
- Message use case.
- Workspace/channel isolation.

Must not show:

- Real customer messages.
- Personal message content outside the test scenario.
- Sender raw identifiers.
- Tokens or secrets.

### Segment J - Comment Automation Proof

Purpose:

- Prove `instagram_business_manage_comments` if this scope remains in the final request.

Steps:

1. Use an approved test IG post and test comment.
2. Show comment sync or comment-triggered automation.
3. Show the automation action or safe dry-run execution result.
4. Mask media/comment/account IDs.

Must show:

- Test post/comment context.
- Comment automation or sync use case.
- Workspace/channel association.

Must not show:

- Real customer comments.
- Unmasked media/comment/account IDs.
- Tokens or callback query parameters.

### Segment K - Business / Page / IG Asset Selection Proof

Purpose:

- Prove Facebook Login for Business / Business asset flow only if that path remains in final scope.

Steps:

1. Show Business selection in the Meta dialog if available.
2. Show Page selection or Page-linked IG account selection.
3. Show the selected IG professional account mapping back to InboxPilot.
4. Use masked Business / Page / IG asset markers in product evidence.

Must show:

- Business / Page / IG asset selection or equivalent account selection surface.
- Selected asset mapping.
- Workspace association.

Must not show:

- Unmasked Business ID.
- Unmasked Page ID.
- Unmasked IG asset ID.
- App secret or dashboard secret.

## 3. Must Mask Or Exclude

The recording must not show any of the following:

| Sensitive item | Required handling |
| --- | --- |
| Authorization code | Replace with `[REDACTED_CODE]`; never show query string. |
| Raw state | Replace with `[REDACTED_STATE]`; never show raw state marker. |
| Raw nonce | Replace with `[REDACTED_NONCE]`. |
| Full callback URL | Replace with `[REDACTED_CALLBACK_URL]`; hide address bar when needed. |
| Reusable authorize URL | Replace with `[REDACTED_AUTHORIZE_URL]`. |
| Access token / refresh token | Never show. |
| App secret / client secret | Never show. |
| Webhook verify token | Never show. |
| Cookies / localStorage / sessionStorage | Do not open browser storage. |
| Meta Business / Page / IG raw IDs | Mask or hash. |
| Private credentials / OTP | Never show. |
| Real customer messages / comments | Use test assets only. |

## 4. Final Redaction Search Checklist

Run these checks immediately before packaging the recording and App Review files.

```bash
rg -n "access_token|refresh_token|client_secret|app_secret|verify_token" docs tests src
rg -n "code=|state=sblcap\\.|/api/instagram/oauth/callback\\?" docs tests src
rg -n "businessId\\s*[:=]\\s*[\"']?\\d{6,}|pageId\\s*[:=]\\s*[\"']?\\d{6,}|instagramAccountId\\s*[:=]\\s*[\"']?\\d{6,}" docs tests src
```

Recording package review fields:

```text
Recording date:
Reviewer:
Video file:
Raw token visible: Pass / Fail
Raw code visible: Pass / Fail
Raw state visible: Pass / Fail
Raw nonce visible: Pass / Fail
Full callback URL visible: Pass / Fail
Unmasked asset ID visible: Pass / Fail
Real customer data visible: Pass / Fail
False positives:
Cleanup required:
Retest required:
```

Allowed false positives:

- Explicit redacted markers.
- Unsafe synthetic fixtures under unsafe fixture paths.
- Documentation instructions that do not contain real values.

Any real sensitive finding keeps App Review readiness at Hold.

## 5. Internal Beta Hold Release Conditions

Internal beta can only move from Hold to Go when all conditions are met:

| Gate | Required result | Current status |
| --- | --- | --- |
| Reviewer recording shot list | Recording captured and reviewed. | Hold |
| Permission usage proof | Every requested permission has product-screen proof. | Hold |
| Scope reconciliation | Current Meta Dashboard scopes match the approved matrix. | Hold |
| Business / Page / IG test assets | Reviewer-accessible assets documented with masked IDs. | Hold |
| Account selection UX | Account/profile or Business/Page/IG selection evidence is included. | Pass evidence exists, final recording Hold |
| Redacted callback evidence | Redacted callback response is shown safely. | Pass evidence exists, final recording Hold |
| Workspace linking dry-run | Mapping evidence is included without production writes. | Pass dry-run, final recording Hold |
| Channel sync dry-run | Sync evidence is included without production writes. | Pass dry-run, final recording Hold |
| Redaction search | Final package search passes. | Hold |
| Internal-only beta entry point | Access policy is approved. | Hold |
| Workspace allowlist | Approved beta workspace list exists. | Hold |
| User / admin permissions | Reviewer/tester roles are approved. | Hold |
| Rollback / disable beta | Disable path is tested and recorded. | Hold |
| Product owner sign-off | Approval is recorded. | Hold |

Decision:

```text
Internal beta: Hold
Reason: final reviewer recording, scope reconciliation, test asset package, redaction search, access controls, rollback proof, and sign-off are still incomplete.
```

## 6. Why Production Implementation Still Cannot Start

Production implementation remains No-Go.

Reasons:

- App Review is not submitted or approved.
- Business Verification / Advanced Access status is not confirmed for the final scope set.
- Final reviewer recording is not captured and reviewed.
- Current Meta Dashboard scopes are not reconciled with the permission matrix.
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

## Final Shot List Decision

```text
Final reviewer recording shot list: Draft complete
App Review readiness: Hold
Internal beta: Hold
Production implementation: No-Go

Next step:
Capture the reviewer recording using this shot list, then run the final redaction search and reconcile the current Meta Dashboard scope set against the permission matrix.
```
