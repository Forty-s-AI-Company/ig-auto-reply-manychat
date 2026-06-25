# Meta App Review Screenshot and Redaction Checklist

Last updated: 2026-06-26.

## Purpose

This checklist prepares the still-image screenshot package that supports the Meta reviewer recording.

Do not log in to Meta Developer Dashboard from this flow. Do not submit App Review. Do not include secrets, tokens, authorization codes, raw callback URLs, env screens, database dashboards, or real customer data in screenshots.

Related documents:

- `docs/meta-app-review-submission-package.md`
- `docs/meta-reviewer-recording-shot-list.md`
- `docs/meta-reviewer-test-asset-handoff-checklist.md`

## Screenshot Package Goal

The screenshot package should let Meta reviewers quickly verify:

1. InboxPilot is a production app under the submitted domain.
2. A reviewer-safe user can access the product.
3. Instagram connection is a visible user action.
4. Inbox, Contacts, and Automations are real product screens tied to the requested Instagram use case.
5. Privacy Policy, Data Deletion, and Terms are public and accessible.
6. Screenshots contain no secret or real customer data.

## Capture Rules

- Use only reviewer-safe test accounts and demo data.
- Capture the browser viewport only; avoid full desktop screenshots.
- Hide bookmarks, browser extensions, password managers, OS notifications, and chat apps.
- Keep DevTools closed.
- Do not capture Vercel, Supabase, GitHub, PayUNI, Meta Dashboard, database clients, email inbox, or password manager screens.
- Crop or blur the address bar when OAuth callback query parameters might appear.
- Prefer screenshots after the app is in a stable state, not during redirects/loading.

## Required Screenshot List

| ID | Screenshot | Required content | Redact / avoid | File name |
| --- | --- | --- | --- | --- |
| S01 | Production entry or login | Production domain and InboxPilot entry point. | Password manager, personal browser bookmarks. | `s01-production-entry.png` |
| S02 | Login form | Reviewer-safe sign-in screen. | Password field contents, personal email if not reviewer-safe. | `s02-login.png` |
| S03 | Dashboard/workspace | Authenticated product workspace. | Workspace IDs, internal IDs, real account details. | `s03-dashboard-workspace.png` |
| S04 | Channels page | Instagram connection entry point. | Non-submission features if visually distracting. | `s04-channels-connect-instagram.png` |
| S05 | Meta / Instagram consent | Consent screen showing permission context, if safe. | Account IDs, full URL, raw OAuth query, personal profile data. | `s05-meta-instagram-consent.png` |
| S06 | Connected Instagram channel | Connected channel result inside InboxPilot. | Raw token, config, unsafe IG username/account ID. | `s06-connected-instagram-channel.png` |
| S07 | Inbox conversation | Test Instagram conversation or safe demo state. | Real customer messages, phone, email, payment/order details. | `s07-inbox-test-conversation.png` |
| S08 | Contacts | Test contacts scoped to workspace/channel. | Real names, emails, phone numbers, internal IDs. | `s08-contacts-workspace-scope.png` |
| S09 | Automation trigger | Simple Instagram keyword/comment trigger. | Internal-only features, unfinished surfaces. | `s09-automation-trigger.png` |
| S10 | Automation response | Simple response/action configuration. | Secrets, webhook URLs with keys, unsupported claims. | `s10-automation-response.png` |
| S11 | Privacy Policy | Public Privacy Policy page. | None expected. | `s11-privacy-policy.png` |
| S12 | Data Deletion | Public Data Deletion page. | Confirmation codes or personal identifiers. | `s12-data-deletion.png` |
| S13 | Terms of Service | Public Terms page. | None expected. | `s13-terms-of-service.png` |
| S14 | Optional error-safe reconnect UX | Reconnect prompt if token is invalid or expired. | Raw Meta error payload, token details, callback URL. | `s14-reconnect-ux-optional.png` |

Optional screenshots should not be included if they create more review confusion than evidence.

## Per-Screenshot Redaction Checklist

Apply this checklist to every screenshot before upload:

- `[ ]` No access token, refresh token, app secret, client secret, verify token, Hash Key, Hash IV, DB URL, or API key.
- `[ ]` No `code=`, `state=`, `nonce=`, raw callback URL, cookie, localStorage, sessionStorage, or network inspector.
- `[ ]` No real customer message, contact, email, phone, payment/order detail, or workspace data.
- `[ ]` No unmasked Business ID, Page ID, IG account ID, workspace ID, user ID, or internal database ID unless reviewer-safe and intentionally documented.
- `[ ]` No Vercel/Supabase/GitHub/PayUNI/Meta dashboard secret screen.
- `[ ]` No browser password manager, bookmarks containing private URLs, OS notification, personal tab, or extension popup.
- `[ ]` Screenshot supports a requested permission or required policy URL.
- `[ ]` Screenshot filename matches the package naming convention.

## Package-Level Redaction Checklist

Before zipping or attaching screenshots:

- `[ ]` All screenshots passed per-file redaction.
- `[ ]` Screenshot order matches the reviewer recording flow.
- `[ ]` Every screenshot has a purpose tied to the permission matrix or policy requirement.
- `[ ]` Screenshots do not imply unsupported permissions or out-of-scope features.
- `[ ]` Screenshots use only reviewer-safe test accounts/assets.
- `[ ]` Final package contains no raw recording exports, HAR files, console logs, database dumps, env files, or unredacted source files.
- `[ ]` Product/security reviewer sign-off is recorded outside the screenshot package.

## Redaction Search Commands

Use these commands against text artifacts in the package folder. They do not replace visual review.

```powershell
rg -n "access_token|refresh_token|client_secret|app_secret|authorization code|code=|state=|nonce|META_APP_SECRET|META_INSTAGRAM_APP_SECRET|META_VERIFY_TOKEN|PAYUNI_HASH|DATABASE_URL|DIRECT_URL" docs tests src
```

If screenshots are exported with OCR text or transcripts, run the same search against that output.

## Screenshot Manifest Template

Create a separate manifest when packaging real artifacts. Do not put secrets in the manifest.

```text
Package version:
Capture date:
Production domain:
Reviewer-safe workspace:
Reviewer-safe IG asset:
Recorded by:
Reviewed by:

Files:
- s01-production-entry.png - Pass / Hold - notes:
- s02-login.png - Pass / Hold - notes:
- s03-dashboard-workspace.png - Pass / Hold - notes:
- s04-channels-connect-instagram.png - Pass / Hold - notes:
- s05-meta-instagram-consent.png - Pass / Hold - notes:
- s06-connected-instagram-channel.png - Pass / Hold - notes:
- s07-inbox-test-conversation.png - Pass / Hold - notes:
- s08-contacts-workspace-scope.png - Pass / Hold - notes:
- s09-automation-trigger.png - Pass / Hold - notes:
- s10-automation-response.png - Pass / Hold - notes:
- s11-privacy-policy.png - Pass / Hold - notes:
- s12-data-deletion.png - Pass / Hold - notes:
- s13-terms-of-service.png - Pass / Hold - notes:
- s14-reconnect-ux-optional.png - Pass / Hold - notes:

Final decision:
```

## Go / Hold

Go when:

- Required screenshots are captured.
- Every screenshot passes redaction.
- Every included screenshot supports the permission matrix or policy evidence.
- Reviewer-safe assets are documented through a secure handoff method.
- Product/security reviewer signs off.

Hold when:

- Any screenshot leaks a secret, raw OAuth value, real customer data, or internal dashboard.
- A screenshot depends on staging/mock/internal-only behavior.
- A screenshot shows a feature not requested or not ready for review.
- The package lacks Privacy Policy, Data Deletion, or Terms evidence.

This document intentionally stops before upload or App Review submission.
