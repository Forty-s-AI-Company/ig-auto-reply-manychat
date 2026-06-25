# Meta App Review Day-of Recording Run Card

Last updated: 2026-06-26.

## Purpose

This is the short, day-of-use run card for the human operator recording and packaging the InboxPilot Meta App Review submission.

Use it alongside:

- `docs/meta-app-review-operator-submission-workbook.md`
- `docs/meta-app-review-submission-package.md`
- `docs/meta-reviewer-recording-shot-list.md`
- `docs/meta-app-review-screenshot-redaction-checklist.md`
- `docs/meta-reviewer-test-asset-handoff-checklist.md`

This card intentionally stops before Meta Dashboard login, upload, or submission.

Do not write or show passwords, tokens, authorization codes, raw callback URLs, app secrets, verify tokens, database URLs, service role keys, PAYUNi secrets, cookies, browser storage, or real customer data.

## 1. Recording Prep

### Operator Setup

- `[ ]` Use a clean browser profile.
- `[ ]` Hide bookmarks bar if it contains private links.
- `[ ]` Close DevTools.
- `[ ]` Close password managers, email, chat apps, Vercel, Supabase, GitHub, PayUNI, database tools, and Meta Dashboard.
- `[ ]` Disable desktop notifications.
- `[ ]` Set browser zoom so text is readable without exposing browser chrome details.
- `[ ]` Prepare the recording tool to capture browser viewport only.
- `[ ]` Prepare a way to crop or blur the address bar during OAuth/callback moments.

### Runtime Check

- `[ ]` Open `https://inboxpilot.carry-digital-nomad.in.net`.
- `[ ]` Confirm production site loads.
- `[ ]` Confirm `/privacy-policy` loads.
- `[ ]` Confirm `/terms-of-service` loads.
- `[ ]` Confirm `/data-deletion` loads.
- `[ ]` Confirm reviewer-safe login credentials are available through secure handoff only.
- `[ ]` Confirm reviewer-safe workspace is selected or easy to reach.
- `[ ]` Confirm reviewer-safe Instagram asset is ready.
- `[ ]` Confirm demo Inbox, Contact, and Automation content uses synthetic data only.

### Artifact Folder

Create this outside the repository:

```text
meta-review-package-YYYYMMDD/
  01-recording/
  02-screenshots/
  03-dashboard-field-notes/
  04-redaction-review/
  05-final-upload-manifest/
```

Do not place raw recording files, screenshots, manifests, credentials, or handoff notes in git.

## 2. During Recording

Target length: 4 to 6 minutes.

### Recording Sequence

| Step | Action | Narration cue | Pass condition |
| --- | --- | --- | --- |
| 1 | Open production URL. | "This is InboxPilot, an Instagram-first inbox and automation workspace." | Production domain is visible. |
| 2 | Sign in with reviewer-safe user. | "I sign in with a reviewer-safe test account." | Login succeeds; password is not visible. |
| 3 | Show dashboard/workspace. | "This account opens a workspace where channels, contacts, and automations are scoped." | Workspace context is clear. |
| 4 | Open Channels. | "The Instagram connection starts from Channels." | Instagram connect entry is visible. |
| 5 | Click Connect Instagram. | "The user authorizes a reviewer-safe Instagram asset." | OAuth starts from a user action. |
| 6 | Complete Meta/Instagram consent if safe. | "The requested permissions support Instagram inbox and automation features." | No raw callback URL or secret is visible. |
| 7 | Return to InboxPilot. | "The connected Instagram channel appears inside the current workspace." | Connected channel is visible. |
| 8 | Open Inbox. | "The Inbox shows Instagram conversations for this workspace." | Synthetic test conversation is visible. |
| 9 | Open Contacts. | "Contacts are scoped to the workspace and channel context." | Synthetic test contact is visible. |
| 10 | Open Automations. | "The business can configure a simple Instagram automation." | Keyword/comment automation is visible. |
| 11 | Open Privacy Policy. | "The privacy policy explains data processing." | Public URL loads. |
| 12 | Open Data Deletion. | "The data deletion page explains deletion requests." | Public URL loads. |
| 13 | Open Terms. | "The terms explain service and billing boundaries." | Public URL loads. |
| 14 | Return to dashboard or Channels. | "This completes the Instagram connection, inbox, contacts, automation, and policy walkthrough." | Flow is complete. |

### Stop and Re-record If

- `code=`, `state=`, `nonce=`, or a full OAuth callback URL appears.
- Password, password manager, OTP, recovery code, or credential handoff appears.
- Access token, refresh token, app secret, client secret, verify token, DB URL, or PAYUNi secret appears.
- DevTools, network inspector, cookies, localStorage, or sessionStorage appears.
- Vercel, Supabase, GitHub, PayUNI, Meta Dashboard, database tools, or env screens appear.
- Any real customer message, email, phone, address, payment/order, workspace, or admin data appears.
- The OAuth flow connects the wrong workspace or unsafe asset.

### Recording Output

Save recording as:

```text
01-recording/meta-reviewer-walkthrough-YYYYMMDD-v1.mp4
```

Create a redaction note:

```text
04-redaction-review/meta-reviewer-walkthrough-redaction-review-YYYYMMDD.md
```

## 3. Screenshot Capture

Capture after the recording is stable. Use viewport screenshots only.

| ID | File name | Capture |
| --- | --- | --- |
| S01 | `s01-production-entry.png` | Production entry or login page. |
| S02 | `s02-login.png` | Reviewer-safe login screen, no password. |
| S03 | `s03-dashboard-workspace.png` | Authenticated workspace/dashboard. |
| S04 | `s04-channels-connect-instagram.png` | Channels page with Instagram connect entry. |
| S05 | `s05-meta-instagram-consent.png` | Consent screen only if no raw URL/private data is visible. |
| S06 | `s06-connected-instagram-channel.png` | Connected Instagram channel. |
| S07 | `s07-inbox-test-conversation.png` | Synthetic Inbox conversation. |
| S08 | `s08-contacts-workspace-scope.png` | Synthetic contact scoped to workspace/channel. |
| S09 | `s09-automation-trigger.png` | Simple Instagram keyword/comment trigger. |
| S10 | `s10-automation-response.png` | Simple response/action configuration. |
| S11 | `s11-privacy-policy.png` | Privacy Policy public page. |
| S12 | `s12-data-deletion.png` | Data Deletion public page. |
| S13 | `s13-terms-of-service.png` | Terms public page. |

Optional:

- `s14-reconnect-ux-optional.png` only if reconnect UX is relevant and no raw Meta error payload is visible.

Per-screenshot redaction check:

- `[ ]` No secret, token, raw OAuth value, cookie, browser storage, dashboard secret screen, or real customer data.
- `[ ]` No unmasked internal IDs unless intentionally reviewer-safe.
- `[ ]` Screenshot supports the requested permission evidence or public policy requirement.
- `[ ]` Filename matches the package list.

## 4. Dashboard Fill Checklist

Use this checklist while filling Meta Dashboard manually. Do not paste secret values into this file.

### App Fields

- `[ ]` App name matches InboxPilot.
- `[ ]` App icon is current.
- `[ ]` App category is appropriate.
- `[ ]` Contact email is monitored.
- `[ ]` App domain includes `inboxpilot.carry-digital-nomad.in.net`.
- `[ ]` Privacy Policy URL: `https://inboxpilot.carry-digital-nomad.in.net/privacy-policy`.
- `[ ]` Terms URL: `https://inboxpilot.carry-digital-nomad.in.net/terms-of-service`.
- `[ ]` Data Deletion URL: `https://inboxpilot.carry-digital-nomad.in.net/data-deletion`, or configured callback if Meta requires it.

### OAuth / Callback Fields

- `[ ]` OAuth callback includes `https://inboxpilot.carry-digital-nomad.in.net/api/oauth/meta-instagram/callback`.
- `[ ]` Legacy-compatible callback is included only if the selected flow still requires it: `https://inboxpilot.carry-digital-nomad.in.net/api/instagram/oauth/callback`.
- `[ ]` No localhost, preview, staging, or temporary callback is submitted for public review unless explicitly required and explained.
- `[ ]` Recording/screenshots do not show callback query parameters.

### Webhook / Data Deletion Fields

- `[ ]` Webhook callback URL: `https://inboxpilot.carry-digital-nomad.in.net/api/webhooks/meta`.
- `[ ]` Webhook verify token is configured in Meta Dashboard, but not copied here.
- `[ ]` Data deletion callback or instruction URL is configured as required.
- `[ ]` Any app secret, verify token, or credentials remain only in Meta Dashboard / secret manager.

### Permission Evidence Mapping

| Permission purpose | Evidence to attach or reference |
| --- | --- |
| Instagram account identity / basic connection | Recording steps 4-7; screenshots S04-S06. |
| Instagram messaging | Recording step 8; screenshot S07. |
| Instagram comments / automation | Recording step 10; screenshots S09-S10. |
| Webhook event delivery | Submission text explanation only unless a safe non-secret evidence artifact exists. |

Do not request a permission if it is not visible in the walkthrough or screenshots.

## 5. Pre-Submit Check

### Artifact Review

- `[ ]` Recording is 4-6 minutes and complete.
- `[ ]` Recording redaction review is complete.
- `[ ]` Screenshot package is complete.
- `[ ]` Screenshot redaction review is complete.
- `[ ]` Reviewer-safe credential handoff is ready through a secure method.
- `[ ]` Upload manifest contains labels only, no credentials or secrets.
- `[ ]` Permission names in the manifest exactly match Meta Dashboard.
- `[ ]` Product/security owner signs off.

### Text Redaction Search

Run against docs and text manifests/transcripts:

```powershell
rg -n "access_token|refresh_token|client_secret|app_secret|authorization code|code=|state=|nonce|META_APP_SECRET|META_INSTAGRAM_APP_SECRET|META_VERIFY_TOKEN|PAYUNI_HASH|DATABASE_URL|DIRECT_URL" docs tests src
```

For real artifact folders, run the same search against OCR/transcript/manifest text if available.

### Final Go / Hold

Go only if:

- `[ ]` Production health is ok.
- `[ ]` Reviewer user can sign in.
- `[ ]` Reviewer-safe Instagram asset can connect.
- `[ ]` Recording and screenshots pass redaction.
- `[ ]` Dashboard URLs match production URLs.
- `[ ]` Requested permissions match visible product evidence.
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

This run card intentionally stops before Meta Dashboard submission.

