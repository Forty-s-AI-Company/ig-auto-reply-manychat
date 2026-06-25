# Meta App Review Submission Package

Last updated: 2026-06-26.

## Purpose

This package prepares InboxPilot for Meta App Review submission without submitting the app.

Do not upload this package, switch Meta app mode, request new permissions, or expose secrets from this document alone.

## External Reference Baseline

- Meta App Review exists so Meta can verify that an app uses Meta products and APIs in an approved way.
- Meta requires a privacy policy and either a data deletion callback URL or data deletion instruction URL for apps that process Meta user data.
- Instagram app setup and review requirements can change; re-check Meta Developer Dashboard before final submission.

Reference URLs:

- `https://developers.facebook.com/docs/resp-plat-initiatives/individual-processes/app-review/`
- `https://developers.facebook.com/docs/development/create-an-app/app-dashboard/data-deletion-callback/`
- `https://developers.facebook.com/documentation/instagram-platform/create-an-instagram-app`

## Current InboxPilot Scope

Production public surface:

- Home / dashboard
- Inbox
- Contacts
- Instagram connection
- Analytics
- Automations
- Referrals as invite/referral activity

Review target:

- Instagram-first messaging and comment automation for workspace-owned Instagram accounts.
- Production must use tenant-scoped channel credentials.
- Production must not rely on global Meta env fallback tokens.

Out of first submission scope:

- Affiliate payout.
- Multi-platform connections beyond Instagram.
- Broadcasts / sequences if not visible in simple release.
- Internal mock OAuth/testing surfaces.
- Any feature that cannot be demonstrated by a reviewer using safe test assets.

## Public URLs To Confirm

Use the production custom domain unless a reviewer-specific staging flow is explicitly approved.

```text
App URL:
https://inboxpilot.carry-digital-nomad.in.net

Privacy Policy:
https://inboxpilot.carry-digital-nomad.in.net/privacy-policy

Terms of Service:
https://inboxpilot.carry-digital-nomad.in.net/terms-of-service

Data Deletion Instructions:
https://inboxpilot.carry-digital-nomad.in.net/data-deletion

Meta Data Deletion Callback:
https://inboxpilot.carry-digital-nomad.in.net/api/meta/data-deletion

Meta Webhook Callback:
https://inboxpilot.carry-digital-nomad.in.net/api/webhooks/meta

Instagram OAuth Callback:
https://inboxpilot.carry-digital-nomad.in.net/api/oauth/meta-instagram/callback

Legacy-compatible Instagram Callback:
https://inboxpilot.carry-digital-nomad.in.net/api/instagram/oauth/callback
```

Before submission, confirm the exact callback URLs used in the Meta Dashboard match the app's production env values.

## Permission Request Matrix

Fill this table with the exact permission names shown in Meta Dashboard before upload.

| Permission | InboxPilot user action | Product screen evidence | API / route evidence | Status |
| --- | --- | --- | --- | --- |
| Instagram login / basic account identity | User clicks Connect Instagram and authorizes the account. | Channels connect screen and connected channel result. | `/api/oauth/meta-instagram/authorize`, `/api/oauth/meta-instagram/callback` | Prepare |
| Instagram messaging permission | User receives/sends IG messages from Inbox. | Inbox conversation view and reply action. | `/api/webhooks/meta`, Meta send message path | Prepare |
| Instagram comments permission | User syncs/comments automation for owned media. | Automation/comment keyword setup and comment sync result. | `/api/instagram/comments/sync`, comment webhook parsing | Prepare |
| Webhook subscription / event delivery | Meta delivers message/comment events to InboxPilot. | Webhook verification and event processing evidence. | `/api/webhooks/meta` | Prepare |

Do not request permissions that are not shown in the reviewer walkthrough.

## Required Artifacts

### Product Walkthrough Recording

Detailed recording plan:

- `docs/meta-reviewer-recording-shot-list.md`

Required scenes:

1. Start on production homepage.
2. Sign in with reviewer-safe test user.
3. Open Channels.
4. Click Connect Instagram.
5. Complete Meta / Instagram authorization using test assets.
6. Confirm connected channel appears in InboxPilot.
7. Show Inbox receiving or displaying a test conversation.
8. Show Contacts scoped to the same workspace/channel.
9. Show a simple automation using an Instagram keyword/comment trigger.
10. Show privacy policy, terms, and data deletion pages.

Recording rules:

- Do not show secrets, env values, access tokens, authorization code, raw state, nonce, cookies, localStorage, DB dashboards, Vercel env screens, or Supabase screens.
- Mask Business ID, Page ID, IG account ID, workspace ID, user email, and any real customer data unless Meta explicitly asks for the value in a secure dashboard field.
- Keep browser address bar hidden or redacted during OAuth callback and error pages.

### Screenshot Package

Detailed screenshot and redaction plan:

- `docs/meta-app-review-screenshot-redaction-checklist.md`

Required screenshots:

- Login page.
- Channels connect screen.
- Meta / Instagram consent screen, if allowed and safe to capture.
- Connected Instagram channel.
- Inbox message view.
- Contacts list filtered to workspace/channel.
- Automation setup screen.
- Privacy Policy page.
- Data Deletion page.
- Terms page.

Every screenshot needs a redaction pass before upload.

### Reviewer Test Assets

Prepare these outside this file; never paste credentials here.

- Reviewer test account email.
- Reviewer test account password or secure handoff method.
- Test workspace name.
- Test Instagram Business / Creator account.
- Connected Facebook Page, if required by the selected Meta flow.
- App role access instructions if the app is still not public.
- Exact steps to reproduce the reviewer flow.

### Dashboard Fields To Check

Confirm in Meta Developer Dashboard:

- App icon, app name, app category, contact email.
- Privacy Policy URL.
- Terms URL if requested.
- User Data Deletion callback or instruction URL.
- Valid OAuth redirect URIs.
- Webhook callback URL and verify token.
- Requested permissions match the permission matrix.
- Business Verification status.
- Advanced Access status for every required permission.

## Redaction Gate

Run these checks before any upload:

```powershell
rg -n "access_token|refresh_token|client_secret|app_secret|authorization code|code=|state=|nonce|META_APP_SECRET|META_INSTAGRAM_APP_SECRET|META_VERIFY_TOKEN|PAYUNI_HASH|DATABASE_URL|DIRECT_URL" docs tests src
```

Manual visual review is still required for screenshots and recordings.

Hold if any artifact contains:

- Token, secret, auth code, raw state, nonce, cookie, localStorage, or sessionStorage.
- Full callback URL containing OAuth query parameters.
- Real customer data.
- Unmasked internal IDs not required by Meta.
- Vercel, Supabase, GitHub, PayUNI, or Meta dashboard secret screens.

## Submission Draft Text

Use this as a starting point; adjust to the exact permissions selected in Meta Dashboard.

```text
InboxPilot helps businesses manage Instagram messages, contacts, and simple automation in one workspace.

Reviewer flow:
1. Sign in to the provided InboxPilot reviewer account.
2. Open Channels > Connect Instagram.
3. Authorize the provided Instagram test asset.
4. Return to InboxPilot and confirm the Instagram channel is connected.
5. Open Inbox to view message handling.
6. Open Contacts to verify contacts are shown only within the selected workspace/channel.
7. Open Automations to review the Instagram keyword/comment automation setup.

InboxPilot stores access tokens server-side, encrypted at rest, and uses tenant-scoped channel credentials in production. Global Meta fallback tokens are disabled in production.

Privacy, Terms, and Data Deletion URLs are available on the production domain.
```

## Go / Hold

Go to submit only when all are true:

- Production health is ok.
- Production Meta global fallback remains disabled.
- Reviewer test user can sign in.
- Reviewer test Instagram asset can connect successfully.
- Requested permissions match real product screens.
- Recording and screenshots pass redaction.
- Privacy Policy, Terms, and Data Deletion URLs are public and correct.
- Business Verification and Advanced Access prerequisites are complete or explicitly accepted by Meta flow.

Hold if any of these are true:

- The reviewer cannot reproduce the flow.
- OAuth callback fails or stores channel credentials under the wrong workspace.
- Any artifact leaks secrets or raw OAuth values.
- Requested permission lacks a visible product reason.
- Data deletion URL/callback is missing or incorrect.

## Final Operator Steps

1. Re-check Meta Dashboard fields.
2. Run production health check.
3. Run authenticated reviewer flow smoke.
4. Capture recording and screenshots.
5. Redact artifacts.
6. Fill permission matrix with exact permission names.
7. Product/security owner signs off.
8. Submit in Meta Dashboard manually.

This document intentionally stops before submission.
