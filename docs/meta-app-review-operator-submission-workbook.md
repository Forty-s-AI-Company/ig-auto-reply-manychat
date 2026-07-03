# Meta App Review Operator Submission Workbook

Last updated: 2026-06-26.

## 2026-07-03 Preflight Gap Status

Observed from the real Meta Developers dashboard for `InboxPilot` (`924285843989683`):

- Dashboard is published and shows no required actions.
- Basic Settings already contain the production domain, contact email, privacy/terms URLs, data deletion callback, and website URL.
- Instagram API setup Webhooks step is configured against the production callback URL.
- Instagram permission entries needed for InboxPilot remain in `可供測試`.
- The visible generated Instagram login flow currently uses `/api/instagram/oauth/callback`.

Current preflight decision:

```text
Meta App Review submission: Hold
Package preparation: Go
Manual dashboard completion needed: Yes
```

## Reviewer-Safe Evidence Status

Use this section before any recording or screenshot work so the operator does not over-claim what the current product can prove.

| Evidence item | Current status | Why | Operator action |
| --- | --- | --- | --- |
| Channels connect entry | 已可直接錄 | The product already shows a clear Instagram connect entry and readable error UX. | Can be recorded after reviewer-safe login. |
| Successful OAuth return + connected channel | 需要人工資產 | Real proof still depends on a reviewer-safe Instagram asset and workspace. | Prepare reviewer-safe IG asset, workspace, and secure credential handoff. |
| Inbox message read / reply | 需要先補 demo data | The reviewer-safe staging tenant exists, but the synthetic conversation still needs a remote non-production seed lane. | Deliver the authenticated mock inbound workspace-scope fix to staging or use a direct staging-only seed path. |
| Contacts workspace scope | 需要先補 demo data | The reviewer-safe staging tenant exists, but the safe contact is not yet visible remotely. | Seed one reviewer-safe contact under the staging reviewer tenant. |
| Automations keyword/comment configuration | 已可直接錄 | A real staging draft named `Meta Review Keyword Reply` has already been created and saved. | Record it after the final redaction pass. |
| Live webhook-backed message/comment proof | 目前無法安全證明 | Webhook verification is configured, but reviewer-safe remote asset proof is still missing. | Keep submission in Hold for live event proof until remote reviewer-safe rehearsal is complete. |
| Privacy / Terms / Data Deletion | 已可直接錄 | Public pages are already available and reviewer-safe. | Record and screenshot directly after final redaction check. |

## Purpose

This workbook is the operator-facing checklist for preparing a real Meta App Review submission package for InboxPilot.

It turns these source documents into one manual workflow:

- `docs/public-paid-launch-control-room.md`
- `docs/meta-app-review-submission-package.md`
- `docs/meta-reviewer-recording-shot-list.md`
- `docs/meta-app-review-screenshot-redaction-checklist.md`
- `docs/meta-reviewer-test-asset-handoff-checklist.md`
- `docs/meta-reviewer-demo-data-prep-runbook.md`
- `docs/meta-reviewer-staging-rehearsal-gap-audit.md`
- `docs/meta-reviewer-staging-tenant-sop.md`

This workbook intentionally stops before logging in to Meta Dashboard or submitting App Review.

Do not write passwords, tokens, authorization codes, raw callback URLs, app secrets, verify tokens, database URLs, service role keys, PAYUNi secrets, cookies, browser storage, or real customer data into this file.

## Current Decision

```text
Private beta / whitelist: Go
Meta App Review submission: Prepare
Public paid launch: Hold
```

Submission can move from Prepare to Go only after:

- Production health is ok.
- Reviewer-safe user and workspace are ready, and remote reviewer-safe demo data is complete.
- Recording and screenshots pass redaction.
- Meta Dashboard fields match the production URLs and requested permissions.
- Business Verification / Advanced Access status is acceptable for the selected permissions.
- Product/security owner signs off.

## Safe Working Folder

Create a local, non-git folder for real artifacts:

```text
meta-review-package-YYYYMMDD/
```

Suggested structure:

```text
meta-review-package-YYYYMMDD/
  01-recording/
  02-screenshots/
  03-dashboard-field-notes/
  04-redaction-review/
  05-final-upload-manifest/
```

Do not place this folder inside the repository unless it is explicitly gitignored and has been checked for secrets. The safer default is outside the repo.

## Phase 1 - Operator Prep

Complete before recording or screenshot capture.

### Runtime Checks

- `[ ]` Production `/api/health` returns `status=ok`.
- `[ ]` Production URL opens: `https://inboxpilot.carry-digital-nomad.in.net`.
- `[ ]` Privacy Policy opens: `https://inboxpilot.carry-digital-nomad.in.net/privacy-policy`.
- `[ ]` Terms opens: `https://inboxpilot.carry-digital-nomad.in.net/terms-of-service`.
- `[ ]` Data Deletion opens: `https://inboxpilot.carry-digital-nomad.in.net/data-deletion`.
- `[ ]` Meta Data Deletion endpoint is known: `https://inboxpilot.carry-digital-nomad.in.net/api/meta/data-deletion`.
- `[x]` Meta Webhook endpoint is known: `https://inboxpilot.carry-digital-nomad.in.net/api/webhooks/meta`.
- `[ ]` Current Instagram OAuth callback is known: `https://inboxpilot.carry-digital-nomad.in.net/api/instagram/oauth/callback`.
- `[ ]` Generic provider callback is documented separately and not treated as the main review callback unless product flow is migrated: `https://inboxpilot.carry-digital-nomad.in.net/api/oauth/meta-instagram/callback`.

### Reviewer-Safe Assets

Prepare these outside git and docs:

- `[ ]` Reviewer-safe InboxPilot user.
- `[ ]` Secure password handoff method.
- `[ ]` Reviewer-safe workspace.
- `[ ]` Reviewer-safe Instagram Business or Creator account.
- `[ ]` Reviewer-safe Facebook Page if the selected Meta flow requires it.
- `[ ]` Synthetic test conversation.
- `[ ]` Synthetic test contact.
- `[ ]` Simple Instagram keyword or comment automation.
- `[ ]` Revocation plan after App Review.

Before collecting the final package, read:

- `docs/meta-reviewer-demo-data-prep-runbook.md`

That runbook explains which existing local seed / fixture chains are reusable for rehearsal and which reviewer-safe assets still must be created manually.

Use `docs/meta-reviewer-staging-rehearsal-gap-audit.md` to decide whether the next rehearsal can move from local-only proof into a reviewer-safe staging tenant, or whether the operator still needs to prepare remote assets first.
Use `docs/meta-reviewer-staging-tenant-sop.md` when the decision is Go and the operator needs a step-by-step staging login / tenant / cleanup flow.

Use safe example data:

```text
Workspace: InboxPilot Review Workspace
Contact: Meta Reviewer Test Contact
Message: Hi, I want product information.
Keyword: price
Automation response: Thanks for your message. We will send details shortly.
```

Hold if the reviewer user can access real customer workspaces, admin-only tools, payout surfaces, production dashboards, or real customer conversations.

## Phase 2 - Recording Script

Target length: 4 to 6 minutes.

Use a clean browser profile. Keep DevTools closed. Hide bookmarks, extension popups, password managers, OS notifications, and personal tabs.

### Recording Order

| Step | Screen | Operator action | Narration cue | Required proof |
| --- | --- | --- | --- | --- |
| 1 | Production entry | Open production URL. | "This is InboxPilot, an Instagram-first inbox and automation workspace." | Production domain loads. |
| 2 | Login | Sign in with reviewer-safe user. | "I sign in with a reviewer-safe test account." | Login succeeds. |
| 3 | Dashboard | Show workspace navigation. | "The account opens a workspace where channels, contacts, and automations are scoped." | Workspace context is visible. |
| 4 | Channels | Open Channels. | "The Instagram connection starts from Channels." | Instagram connect entry is visible. |
| 5 | Connect Instagram | Click Connect Instagram. | "The user authorizes a reviewer-safe Instagram asset." | OAuth starts from user action. |
| 6 | Meta / Instagram consent | Complete authorization if safe. | "The requested permissions support Instagram inbox and automation features." | Consent context is visible. |
| 7 | Connected channel | Return to InboxPilot. | "The connected Instagram channel appears inside the current workspace." | Channel connected state is visible. |
| 8 | Inbox | Show test conversation. | "The Inbox shows Instagram conversations for this workspace." | Inbox use case is visible. |
| 9 | Contacts | Show test contact. | "Contacts are scoped to the workspace and channel context." | Contact use case is visible. |
| 10 | Automations | Show keyword/comment automation. | "The business can configure a simple Instagram automation." | Requested use case is visible. |
| 11 | Privacy Policy | Open public page. | "The privacy policy explains data processing." | Policy URL loads. |
| 12 | Data Deletion | Open public page. | "The data deletion page explains deletion requests." | Deletion URL loads. |
| 13 | Terms | Open public page. | "The terms explain service and billing boundaries." | Terms URL loads. |
| 14 | Closing | Return to dashboard or Channels. | "This completes the Instagram connection, inbox, contacts, automation, and policy walkthrough." | Flow is complete. |

### Recording Red Lines

Pause, discard, and re-record if any of these appear:

- `code=`, `state=`, `nonce=`, raw OAuth callback URL.
- Access token, refresh token, app secret, client secret, verify token.
- Cookie, localStorage, sessionStorage, network inspector, DevTools.
- Vercel env, Supabase project secret, DB connection string, Meta App Secret, PAYUNi Hash Key / Hash IV.
- Real customer message, email, phone, address, payment, order, workspace, or admin data.

### Recording File

Suggested file name:

```text
meta-reviewer-walkthrough-YYYYMMDD-v1.mp4
```

Also create a redaction review note:

```text
meta-reviewer-walkthrough-redaction-review-YYYYMMDD.md
```

## Phase 3 - Screenshot Package

Capture screenshots after the recording flow is stable.

Use browser viewport screenshots only. Avoid full desktop screenshots.

| ID | File name | Required content | Hold if |
| --- | --- | --- | --- |
| S01 | `s01-production-entry.png` | Production entry or login. | Password manager or personal bookmarks visible. |
| S02 | `s02-login.png` | Reviewer-safe login screen. | Password visible. |
| S03 | `s03-dashboard-workspace.png` | Authenticated workspace. | Workspace/internal IDs visible. |
| S04 | `s04-channels-connect-instagram.png` | Instagram connection entry. | Internal-only surfaces dominate. |
| S05 | `s05-meta-instagram-consent.png` | Consent screen if safe. | Raw OAuth URL or personal profile data visible. |
| S06 | `s06-connected-instagram-channel.png` | Connected Instagram channel. | Raw token/config visible. |
| S07 | `s07-inbox-test-conversation.png` | Test conversation. | Real customer data visible. |
| S08 | `s08-contacts-workspace-scope.png` | Test contact scoped to workspace/channel. | Real contact info visible. |
| S09 | `s09-automation-trigger.png` | Simple keyword/comment trigger. | Unsupported feature claims visible. |
| S10 | `s10-automation-response.png` | Simple response configuration. | Webhook secret or key visible. |
| S11 | `s11-privacy-policy.png` | Privacy Policy. | Wrong domain. |
| S12 | `s12-data-deletion.png` | Data Deletion page. | Personal deletion request data visible. |
| S13 | `s13-terms-of-service.png` | Terms. | Wrong domain. |

Optional:

- `s14-reconnect-ux-optional.png` only if reconnect UX is needed and does not expose raw Meta error payloads.

## Phase 4 - Meta Dashboard Field Checklist

Use this as the manual checklist while filling Meta Dashboard. Do not paste secret values into this workbook.

### App-Level Fields

- `[ ]` App name matches InboxPilot branding.
- `[ ]` App icon is current and non-placeholder.
- `[ ]` App category matches product use.
- `[ ]` Contact email is monitored.
- `[ ]` App domain includes `inboxpilot.carry-digital-nomad.in.net`.
- `[ ]` Privacy Policy URL is `https://inboxpilot.carry-digital-nomad.in.net/privacy-policy`.
- `[ ]` Terms URL is `https://inboxpilot.carry-digital-nomad.in.net/terms-of-service` if requested.
- `[ ]` Data Deletion instruction URL is `https://inboxpilot.carry-digital-nomad.in.net/data-deletion`, or callback is configured as required.

### OAuth / Redirect Fields

Confirm the exact Meta product settings before submission:

- `[ ]` Current Instagram OAuth redirect URI in Meta Dashboard matches `https://inboxpilot.carry-digital-nomad.in.net/api/instagram/oauth/callback`.
- `[ ]` Generic provider callback `https://inboxpilot.carry-digital-nomad.in.net/api/oauth/meta-instagram/callback` is not submitted as the main Instagram callback unless the app flow is intentionally migrated and re-verified.
- `[ ]` No localhost, staging, preview, or test callback is submitted for public production review unless explicitly required and explained.
- `[ ]` Browser recording does not show full callback URL query parameters.

### Webhook / Data Deletion Fields

- `[x]` Webhook callback URL is `https://inboxpilot.carry-digital-nomad.in.net/api/webhooks/meta`.
- `[x]` Webhook verify token is configured in Meta Dashboard, but not pasted here.
- `[ ]` Data deletion callback or instruction URL is configured as required by Meta.
- `[ ]` Any verify token or app secret remains in the dashboard/secret manager only.
- `[ ]` Do not move submission from Hold to Go until reviewer-safe remote evidence is complete, even though webhook callback / verify token are now configured.

### Permission Request Fields

Fill the exact permission names from Meta Dashboard in the final package manifest.

Recommended first submission scope should map only to visible product evidence:

| Permission purpose | Product evidence | Recording step | Screenshot |
| --- | --- | --- | --- |
| Instagram account identity / basic connection | Connect Instagram and connected channel. | Steps 4-7 | S04-S06 |
| Instagram messaging | Inbox conversation view. | Step 8 | S07 |
| Instagram comments / automation | Automation keyword/comment setup. | Step 10 | S09-S10 |
| Webhook event delivery | App receives and processes Instagram events. | Explain in submission text; do not expose logs/secrets. | Not required unless safe evidence exists. |

Do not request permissions that are not visible in recording or screenshots.

### Business / Access Status

- `[ ]` Business Verification status reviewed.
- `[ ]` Advanced Access status reviewed for every requested permission.
- `[ ]` App mode / reviewer access status reviewed.
- `[ ]` Reviewer test account can access the app without operator intervention.
- `[ ]` Technical provider / access verification prompt on the app dashboard has been reviewed and accepted as either complete or intentionally deferred with a documented reason.

## Phase 5 - Submission Text Draft

Use this as a safe starting point. Adjust permission names to match Meta Dashboard exactly.

```text
InboxPilot helps businesses manage Instagram conversations, contacts, and simple automations in one workspace.

Reviewer flow:
1. Sign in to the provided InboxPilot reviewer account.
2. Open Channels and click Connect Instagram.
3. Authorize the provided reviewer-safe Instagram test asset.
4. Return to InboxPilot and confirm the Instagram channel is connected.
5. Open Inbox to view Instagram message handling.
6. Open Contacts to confirm workspace-scoped contact data.
7. Open Automations to review the Instagram keyword/comment automation setup.
8. Review Privacy Policy, Data Deletion, and Terms pages on the production domain.

InboxPilot stores access tokens server-side, encrypted at rest, and uses tenant-scoped channel credentials in production. Global Meta fallback tokens are disabled in production.
```

Do not claim:

- Affiliate payout is part of the first public review.
- Multi-platform integrations beyond Instagram are production-ready.
- Production payment checkout is part of Meta permission use.
- Reviewers need access to Vercel, Supabase, GitHub, PayUNI, database, logs, or env screens.

## Phase 6 - Final Redaction Review

Run text search against docs and any text manifests/transcripts before upload:

```powershell
rg -n "access_token|refresh_token|client_secret|app_secret|authorization code|code=|state=|nonce|META_APP_SECRET|META_INSTAGRAM_APP_SECRET|META_VERIFY_TOKEN|PAYUNI_HASH|DATABASE_URL|DIRECT_URL" docs tests src
```

For real artifact folders, run the same search against any exported transcript, OCR text, or manifest.

Manual visual review must confirm:

- `[ ]` Recording has no secret, token, raw OAuth value, browser storage, or real customer data.
- `[ ]` Screenshots have no secret, token, raw OAuth value, browser storage, or real customer data.
- `[ ]` Package does not include HAR files, DevTools output, logs, env files, DB dumps, raw Meta responses, or password handoff files.
- `[ ]` Permission claims match exactly what is shown in the product walkthrough.
- `[ ]` Dashboard fields match production URLs.
- `[ ]` Product/security owner signs off.

## Phase 7 - Final Upload Manifest

Create a manifest next to the upload package. Keep it secret-free.

```text
Package version:
Prepared date:
Production URL:
Reviewer account label:
Reviewer workspace label:
Reviewer Instagram asset label:
Secure password handoff method:
Recording file:
Screenshot package:
Permission names requested:
Privacy Policy URL:
Terms URL:
Data Deletion URL or callback:
Webhook callback URL:
OAuth callback URL:
Redaction reviewer:
Final decision: Go / Hold
Notes:
```

## Go / Hold

Go to manual Meta Dashboard submission only when:

- `[ ]` Production health is ok.
- `[ ]` Reviewer test user can sign in.
- `[ ]` Reviewer-safe Instagram asset can connect.
- `[ ]` Recording is complete and redaction-passed.
- `[ ]` Screenshot package is complete and redaction-passed.
- `[ ]` Dashboard URLs and requested permissions are checked against the real Meta Dashboard.
- `[ ]` Business Verification / Advanced Access status is acceptable.
- `[ ]` Secure reviewer credential handoff is ready.
- `[ ]` Product/security owner signs off.

Hold if:

- Any secret, raw OAuth value, browser storage, or real customer data appears.
- Reviewer cannot reproduce the flow.
- Any requested permission lacks product evidence.
- OAuth callback stores channel credentials under the wrong workspace.
- Dashboard URLs do not match production URLs.
- Reviewer credentials would need to be pasted into docs, chat, PR comments, or recordings.

This workbook intentionally stops before Meta Dashboard login, upload, or submission.

