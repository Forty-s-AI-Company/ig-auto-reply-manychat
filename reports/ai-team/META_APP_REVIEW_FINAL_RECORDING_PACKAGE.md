# Meta App Review Final Recording Package

Generated: 2026-07-06

## Scope

This package prepares the final Meta App Review recording and screenshot set for InboxPilot. It does not submit Meta App Review, deploy Production, touch production DB, switch PayUNI production, or store any Meta / IG / Facebook credentials, tokens, cookies, auth codes, or secrets.

## Recording Purpose

The recording must prove, in one reviewer-safe flow, that InboxPilot uses the requested Instagram Business permissions for visible product features:

- Connect an Instagram professional account.
- Display connected channel identity.
- Read / manage reviewer-safe Inbox conversation evidence.
- Show reviewer-safe Contacts workspace scope.
- Show reviewer-safe Automations keyword / comment workflow evidence.
- Provide public Privacy Policy, Terms, and Data Deletion pages.

## Reviewer-Safe Test Account

Use the staging reviewer-safe account only. Credentials remain in local `.env.local` / secure handoff and must not be printed, committed, or shown in the recording.

```text
Environment: Staging
Base URL: https://staging.carry-digital-nomad.in.net
Data policy: Synthetic / reviewer-safe only
Real customer data: Forbidden
Production messages: Forbidden
```

## Test Data

Already captured evidence:

- Connected Instagram channel: `Instagram @carry.digital.nomad`
- Inbox synthetic conversation: `Meta Reviewer Test Contact`
- Contacts synthetic row: `Meta Reviewer Test Contact`
- Automations synthetic rule: `Meta Review Keyword Reply`
- PayUNI Sandbox evidence: PASS

Evidence folder:

```text
reports/ai-team/meta-review-evidence/
```

## Permission Usage Explanation

| Permission | What To Say In Recording | Product Evidence |
| --- | --- | --- |
| `instagram_business_basic` | InboxPilot uses this to identify the connected Instagram professional account and show channel metadata. | Channels page, sidebar account dropdown. |
| `instagram_business_manage_messages` | InboxPilot uses this to display and manage Instagram messages in the Inbox for the connected workspace. | Inbox reviewer-safe conversation. |
| `instagram_business_manage_comments` | InboxPilot uses this for comment / keyword automation and comment-sync related workflows. | Automations reviewer-safe keyword / comment rule. |

## Pre-Recording Checklist

- [ ] Confirm staging is available.
- [ ] Confirm reviewer-safe staging login works.
- [ ] Confirm PayUNI remains Sandbox.
- [ ] Confirm Production deploy is not being performed.
- [ ] Confirm Meta App Review submit button will not be pressed.
- [ ] Confirm no real customer data is visible.
- [ ] Confirm no token / cookie / secret / auth code appears in URL, devtools, console, or page text.
- [ ] Confirm the final app display name decision. Current OAuth consent screen shows `manychat-auto-reply-IG`; product/legal surfaces use `InboxPilot`.
- [ ] If app display name should be changed, do it manually in Meta Dashboard before final recording.
- [ ] Prepare a local folder for final recording: `reports/ai-team/meta-review-evidence/`.

## Recording Script

### Segment 1 - Opening

Show / say:

- This is the InboxPilot staging reviewer-safe environment.
- The recording uses synthetic reviewer-safe data only.
- No real customer data or production messages are used.
- PayUNI remains Sandbox and is not part of production switching.

Suggested screen:

- `https://staging.carry-digital-nomad.in.net/login` or Dashboard after login.

### Segment 2 - Login And Dashboard

Show:

- Reviewer-safe staging login or already-authenticated Dashboard.
- Dashboard navigation and Instagram-first product context.

Say:

- The reviewer-safe account is used only for App Review evidence.

### Segment 3 - Instagram Connect

Show:

- Channels / Connect / Social page.
- Instagram OAuth entry.
- Instagram consent screen.
- OAuth success callback.
- Connected channel on Channels page.

Evidence already captured:

- `01-staging-connect-instagram-entry.png`
- `02-meta-oauth-login-or-consent.png`
- `06-staging-oauth-success.png`
- `07-staging-channel-connected.png`

Say:

- `instagram_business_basic` is used to connect and identify the Instagram professional account.
- The channel token is stored securely and shown only as an encrypted stored state.

### Segment 4 - Connected Channel Across Product

Show:

- Sidebar connected account dropdown / current account context.
- Inbox connected channel scope.
- Contacts connected channel scope.
- Automations connected channel context.

Evidence already captured:

- `08-sidebar-connected-channel.png`
- `09-inbox-connected-channel-scope.png`
- `10-contacts-connected-channel-scope.png`
- `11-automations-connected-channel-scope.png`

Say:

- `instagram_business_manage_messages` supports the Inbox message workflow.
- `instagram_business_manage_comments` supports the keyword/comment automation workflow.
- This demo does not send messages to real Instagram users.

### Segment 5 - Legal / Compliance

Show:

- `/privacy-policy`
- `/terms-of-service`
- `/data-deletion`

Say:

- The app provides public privacy, terms, and data deletion instructions.
- Data deletion requests remove InboxPilot-held Meta / Instagram channel tokens and related workspace data where permitted.

### Segment 6 - Closing

Say:

- This recording demonstrates the minimum reviewer-safe flow for the requested Instagram Business permissions.
- The reviewer can reproduce the flow with the reviewer-safe account and the provided steps.
- App Review has not been submitted in this preparation run.

## Post-Recording Redaction Checklist

- [ ] No passwords visible.
- [ ] No cookies visible.
- [ ] No tokens or auth codes visible.
- [ ] No full callback query string with raw `code` visible.
- [ ] No unrelated Meta / Facebook / Instagram accounts visible.
- [ ] No real customer contacts or messages visible.
- [ ] No production database URL or secret visible.
- [ ] No PayUNI production key or real payment data visible.
- [ ] If IDs appear, they are reviewer-safe and acceptable, or redacted.
- [ ] Confirm app display name shown in consent screen is acceptable.

## Must Not Appear In Submission

- Meta / IG / Facebook passwords.
- Session cookies.
- Access tokens.
- OAuth authorization code.
- Full card number, CVV, OTP, or 3D password.
- Production DB connection strings.
- Production env values.
- Real customer names, messages, comments, or payment records.
- Any action that looks like sending a real IG message.

## Current Status

```text
META_REVIEWER_SAFE_ASSET_LANE=PASS
CONNECTED_CHANNEL_EVIDENCE=PASS
META_APP_REVIEW_RECORDING_READY=HUMAN_INPUT_REQUIRED
META_DEVELOPERS_SCREENSHOTS_READY=HUMAN_INPUT_REQUIRED
APP_NAME_CONSISTENCY=WARNING
META_APP_REVIEW_SUBMITTED=NO
NEXT_REQUIRED_ACTION=Record final MP4, capture Meta Developers screenshots, confirm app display name, run redaction review.
```
