# Meta App Review Recording Script

Generated: 2026-07-06

## Scope

This script is for the final reviewer-safe Meta App Review recording. It does not authorize submission.

## A. Opening

Narration:

> This is InboxPilot running in a reviewer-safe staging environment. The account and data shown here are synthetic and safe for App Review. We do not use real customer data, do not send production Instagram messages, and PayUNI remains in Sandbox.

Show:

- Staging URL: `https://staging.carry-digital-nomad.in.net`
- Product brand: InboxPilot
- Optional: reviewer-safe account already logged in

Do not show:

- Passwords
- Cookies
- Tokens
- Production env values

## B. Staging Login And Dashboard

Narration:

> I log in with the reviewer-safe staging account. The dashboard shows the workspace context and the navigation used to manage Instagram conversations, contacts, and automations.

Show:

- Login or logged-in Dashboard.
- Sidebar navigation.
- Current workspace / connected account context if visible.

## C. Instagram Connect

Narration:

> InboxPilot uses Instagram Login to connect a reviewer-safe Instagram professional account. The requested permissions are used to identify the Instagram account, read/manage messages, and support comment or keyword automation.

Show:

1. Channels / Connect / Social page.
2. Instagram OAuth entry.
3. Instagram OAuth consent screen.
4. OAuth success callback.
5. Channels page connected channel state.

Evidence references:

- `01-staging-connect-instagram-entry.png`
- `02-meta-oauth-login-or-consent.png`
- `06-staging-oauth-success.png`
- `07-staging-channel-connected.png`

Important note:

- The captured consent screen displays `manychat-auto-reply-IG`. Confirm whether this will be renamed to `InboxPilot` before final recording.

## D. Feature Demo

### Sidebar Connected Account

Narration:

> The connected Instagram account appears in the sidebar account switcher so the workspace can scope Inbox and Contacts to the selected Instagram channel.

Show:

- Sidebar / workspace account area.
- `@carry.digital.nomad`

Evidence:

- `08-sidebar-connected-channel.png`

### Inbox

Narration:

> InboxPilot uses Instagram message permissions to display reviewer-safe conversations for the connected channel. In this recording, we use synthetic reviewer-safe conversation data and do not send any real Instagram messages.

Show:

- Inbox page.
- Reviewer-safe conversation.
- Connected Instagram account context.
- Reply composer or clear sending limitation.

Evidence:

- `09-inbox-connected-channel-scope.png`

### Contacts

Narration:

> Contacts are scoped to the connected Instagram channel and workspace. This demonstrates how InboxPilot organizes Instagram users and related conversation context.

Show:

- Contacts page.
- Reviewer-safe contact.
- Channel column showing `Instagram @carry.digital.nomad`.

Evidence:

- `10-contacts-connected-channel-scope.png`

### Automations

Narration:

> InboxPilot uses Instagram comment and keyword capabilities to define automation workflows. This reviewer-safe automation draft demonstrates the configuration surface without sending production messages.

Show:

- Automations overview.
- `Meta Review Keyword Reply` or reviewer-safe automation draft.
- Connected account context.

Evidence:

- `11-automations-connected-channel-scope.png`

## E. Legal / Compliance

Narration:

> InboxPilot provides public Privacy Policy, Terms of Service, and Data Deletion instructions. These explain how Meta / Instagram connection data, channel tokens, conversations, contacts, billing, and deletion requests are handled.

Show:

- `/privacy-policy`
- `/terms-of-service`
- `/data-deletion`

## F. Closing

Narration:

> This completes the reviewer-safe demonstration. The requested Instagram Business permissions are used only for the product surfaces shown: connected channel identity, Inbox messages, Contacts scope, and Automations keyword/comment workflows. App Review has not been submitted during this preparation run.

Show:

- Channels connected state or final checklist.

## Redaction Reminder

Before attaching the recording:

- [ ] No credentials visible.
- [ ] No auth code visible in URL.
- [ ] No access token visible.
- [ ] No App Secret / verify token visible.
- [ ] No unrelated Meta accounts visible.
- [ ] No real customer data visible.
- [ ] No production message sent.
- [ ] No PayUNI production data visible.

## Current Status

```text
META_RECORDING_SCRIPT=PASS
META_RECORDING_READY=HUMAN_INPUT_REQUIRED
NEXT_REQUIRED_ACTION=Record final MP4 and run redaction checklist.
```
