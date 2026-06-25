# Meta Reviewer Recording Shot List

Last updated: 2026-06-26.

## Purpose

This document turns `docs/meta-app-review-submission-package.md` into a concrete recording plan for the Meta reviewer walkthrough.

Do not log in to Meta Developer Dashboard from this flow. Do not submit App Review. Do not show secrets, tokens, authorization codes, raw callback URLs, env pages, database dashboards, or real customer data.

Related documents:

- `docs/meta-app-review-submission-package.md`
- `docs/meta-app-review-screenshot-redaction-checklist.md`
- `docs/meta-reviewer-test-asset-handoff-checklist.md`

## Recording Goal

Show that a reviewer can understand and reproduce the InboxPilot Instagram flow:

1. A business user signs in.
2. The user connects an Instagram account.
3. InboxPilot stores the connection under the current workspace.
4. The user can review inbox/contact data for that workspace.
5. The user can configure a simple Instagram automation.
6. Privacy, Terms, and Data Deletion pages are visible.

Target length: 4 to 6 minutes.

## Before Recording

Prepare these items without placing credentials in this file:

- Reviewer-safe InboxPilot user.
- Reviewer-safe test workspace.
- Reviewer-safe Instagram Business or Creator account.
- Reviewer-safe Facebook Page if the selected Meta flow requires it.
- At least one safe test conversation, contact, or manually prepared demo data.
- A simple automation draft using a keyword or comment trigger.

Browser setup:

- Use a clean browser profile.
- Hide bookmarks bar if it contains private links.
- Use 125% zoom or lower so text fits without exposing browser chrome details.
- Keep DevTools closed.
- Do not open Vercel, Supabase, GitHub, PayUNI, email inbox, password manager, or Meta Dashboard.

Recording setup:

- Crop or blur the address bar during OAuth callback and error moments.
- Mask test user email if it appears.
- Mask workspace ID, Page ID, IG account ID, Business ID, and any real account identifier.
- Use a short neutral narration. Avoid reading secrets or IDs aloud.

## Redaction Rules While Recording

Pause and restart if any of these appear:

- `code=`, `state=`, `nonce=`, access token, refresh token, client secret, app secret.
- Full OAuth callback URL with query parameters.
- Cookies, localStorage, sessionStorage, or network details.
- Vercel env, Supabase connection info, database rows, Meta App Secret, PAYUNi Hash Key / Hash IV.
- Real customer name, email, message, phone, address, payment detail, or order detail.

## Shot List

| Shot | Screen | Goal | Narration cue | Evidence captured | Redaction note |
| --- | --- | --- | --- | --- | --- |
| 1 | Production home or login page | Establish the app under review. | "This is InboxPilot, an Instagram-first inbox and automation workspace." | Production domain and app entry. | Do not show password manager. |
| 2 | Login | Show reviewer account access. | "I sign in with the reviewer-safe test account." | Login process. | Mask email if needed. Never show password. |
| 3 | Dashboard | Show authenticated workspace. | "After login, the reviewer lands in a workspace dashboard." | Workspace context. | Mask workspace/account IDs. |
| 4 | Channels | Show where Instagram connection starts. | "The Instagram connection starts from Channels." | Connect Instagram entry point. | Do not show non-submission features. |
| 5 | Connect Instagram | Show user action for permission request. | "The user clicks Connect Instagram to authorize a test Instagram asset." | OAuth start action. | Stop before exposing raw callback URL. |
| 6 | Meta / Instagram consent | Show consent intent if safe. | "The consent screen asks for the permissions needed for messaging and comments." | Permission consent screen. | Mask account IDs and browser URL if needed. |
| 7 | Return to InboxPilot | Show successful connection. | "After authorization, InboxPilot returns to the workspace and shows the connected channel." | Connected Instagram channel. | Mask IG username if not reviewer-safe. |
| 8 | Inbox | Show message management. | "The user can view Instagram conversations in the workspace inbox." | Conversation list/detail. | Use test data only. |
| 9 | Contacts | Show tenant/workspace-scoped contacts. | "Contacts are shown inside the same workspace/channel context." | Contact list/detail. | Use test data only. |
| 10 | Automations | Show product use for requested permission. | "The user can configure a simple Instagram keyword or comment automation." | Automation trigger and response setup. | Do not show unfinished/internal features. |
| 11 | Privacy Policy | Show required public policy. | "The privacy policy explains data processing and service providers." | `/privacy-policy`. | No secrets expected. |
| 12 | Data Deletion | Show deletion path. | "The data deletion page explains how users can request deletion." | `/data-deletion`. | No secrets expected. |
| 13 | Terms | Show customer terms. | "The terms describe service and billing boundaries." | `/terms-of-service`. | No secrets expected. |
| 14 | Closing | Summarize review scope. | "This completes the Instagram connection, inbox, contacts, automation, and policy walkthrough." | End state. | Keep concise. |

## Step-By-Step Recording Script

### 1. Opening

Action:

1. Open `https://inboxpilot.carry-digital-nomad.in.net`.
2. Keep the first screen visible for 3 to 5 seconds.

Narration:

```text
This is InboxPilot. It helps a business manage Instagram conversations, contacts, and simple automations in a workspace.
```

Pass criteria:

- Production site loads.
- No internal testing or dashboard secret is visible.

### 2. Sign In

Action:

1. Open the login page.
2. Sign in with the reviewer-safe test account.
3. Do not show password entry if screen recording cannot mask it.

Narration:

```text
I am signing in with a reviewer-safe test account prepared for Meta review.
```

Pass criteria:

- Login succeeds.
- User lands inside the product.

Hold if:

- Login fails.
- Password, password manager, email inbox, or recovery code appears.

### 3. Workspace Context

Action:

1. Show dashboard or navigation.
2. Briefly show the workspace context if visible.

Narration:

```text
The account opens a workspace. Instagram channels, contacts, and automations are scoped to this workspace.
```

Pass criteria:

- The reviewer understands they are inside one workspace.
- No workspace ID or internal database identifier is visible.

### 4. Start Instagram Connection

Action:

1. Navigate to Channels.
2. Click the Instagram connection entry point.

Narration:

```text
From Channels, the user starts the Instagram connection flow.
```

Pass criteria:

- The Instagram connection action is visible.
- The recording shows user intent before OAuth.

### 5. Consent / Authorization

Action:

1. Proceed through the Meta / Instagram authorization flow using test assets.
2. If the callback URL appears with `code=` or `state=`, pause and re-record with the address bar hidden/cropped.

Narration:

```text
The user authorizes the test Instagram asset. InboxPilot requests only the permissions required for Instagram inbox and automation features.
```

Pass criteria:

- The reviewer can see the permission context.
- No raw code, state, token, or full callback URL is visible.

### 6. Connected Channel Confirmation

Action:

1. Return to InboxPilot.
2. Show the connected Instagram channel.

Narration:

```text
After authorization, the channel is connected inside the current workspace. Production uses tenant-scoped channel credentials instead of global fallback tokens.
```

Pass criteria:

- Connected channel is visible.
- No raw token, account ID, or internal config is visible.

### 7. Inbox Evidence

Action:

1. Open Inbox.
2. Show a reviewer-safe test conversation or prepared demo state.

Narration:

```text
The Inbox shows Instagram conversations for the connected workspace. This is where the business user reviews and responds to messages.
```

Pass criteria:

- Inbox feature is visible.
- Data is test-only and safe.

### 8. Contacts Evidence

Action:

1. Open Contacts.
2. Show one safe test contact.

Narration:

```text
Contacts are scoped to the same workspace and connected Instagram channel.
```

Pass criteria:

- Contacts feature is visible.
- No real customer data appears.

### 9. Automation Evidence

Action:

1. Open Automations.
2. Show a simple keyword/comment automation.
3. Show trigger and response configuration only.

Narration:

```text
Automations let the business configure simple Instagram keyword or comment responses for the connected account.
```

Pass criteria:

- The requested messaging/comment use case is represented.
- No internal-only or unfinished feature is highlighted.

### 10. Policy Evidence

Action:

1. Open Privacy Policy.
2. Open Data Deletion.
3. Open Terms of Service.

Narration:

```text
InboxPilot provides public Privacy Policy, Data Deletion, and Terms pages on the production domain.
```

Pass criteria:

- All pages load on production domain.
- Data deletion instructions are visible.

### 11. Closing

Action:

1. Return to dashboard or Channels.
2. End recording.

Narration:

```text
This completes the reviewer walkthrough for Instagram connection, workspace-scoped inbox and contacts, simple automation, and policy pages.
```

Pass criteria:

- Flow is complete and understandable.
- Recording remains under target length.

## Post-Recording Review Checklist

- `[ ]` Recording contains no password, token, secret, auth code, raw state, nonce, cookie, localStorage, or sessionStorage.
- `[ ]` Recording contains no full OAuth callback URL with query parameters.
- `[ ]` Recording contains no real customer data.
- `[ ]` All test account identifiers are masked or reviewer-safe.
- `[ ]` Permission claims in narration match the permission matrix.
- `[ ]` Privacy, Terms, and Data Deletion pages are visible.
- `[ ]` Recording file name includes date and package version.
- `[ ]` Product/security reviewer signs off before upload.

## Suggested File Names

```text
meta-reviewer-walkthrough-YYYYMMDD-v1.mp4
meta-reviewer-walkthrough-redaction-review-YYYYMMDD.md
meta-reviewer-screenshot-package-YYYYMMDD.zip
```

## Go / Hold

Go to attach this recording to the submission package only if:

- Every required shot is captured.
- Redaction checklist passes.
- Reviewer test credentials are prepared through a secure handoff method.
- The permission matrix in `docs/meta-app-review-submission-package.md` is filled with exact Meta Dashboard permission names.

Hold if:

- Any secret or raw OAuth value appears.
- The reviewer cannot reproduce the flow.
- The recording demonstrates a feature outside the requested permission scope.
- The recording depends on staging, mock provider, DB dashboard, or manual backend edits.

This document intentionally stops before Meta Dashboard upload or App Review submission.
