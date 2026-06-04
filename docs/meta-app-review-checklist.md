# InboxPilot Meta App Review Checklist

這份文件用來送審 `InboxPilot` 的 Meta / Instagram 連線能力，目標是讓非 App admin / developer / tester 的 Instagram 專業帳號也能授權綁定 InboxPilot。

## Current Production URLs

- App domain: `inboxpilot.carry-digital-nomad.in.net`
- App URL: `https://inboxpilot.carry-digital-nomad.in.net`
- Login page for reviewer: `https://inboxpilot.carry-digital-nomad.in.net/login`
- Social login page: `https://inboxpilot.carry-digital-nomad.in.net/channels/connect/social`
- OAuth redirect URIs: `https://inboxpilot.carry-digital-nomad.in.net/api/oauth/meta-instagram/callback` and `https://inboxpilot.carry-digital-nomad.in.net/api/oauth/meta-facebook/callback`
- Webhook callback URL: `https://inboxpilot.carry-digital-nomad.in.net/api/webhooks/meta`
- Privacy Policy URL: `https://inboxpilot.carry-digital-nomad.in.net/privacy-policy`
- Terms of Service URL: `https://inboxpilot.carry-digital-nomad.in.net/terms-of-service`
- Data Deletion Instructions URL: `https://inboxpilot.carry-digital-nomad.in.net/data-deletion`
- Data deletion callback: `https://inboxpilot.carry-digital-nomad.in.net/api/meta/data-deletion`
- Deauthorize callback: `https://inboxpilot.carry-digital-nomad.in.net/api/meta/deauthorize`

## Meta App Basic Settings

- Display name: `InboxPilot`
- App icon: use the InboxPilot brand icon.
- App domains: `inboxpilot.carry-digital-nomad.in.net`
- Contact email: use the production support email.
- Privacy Policy URL: `https://inboxpilot.carry-digital-nomad.in.net/privacy-policy`
- Terms of Service URL: `https://inboxpilot.carry-digital-nomad.in.net/terms-of-service`
- User data deletion: choose Data Deletion Callback URL, and use `https://inboxpilot.carry-digital-nomad.in.net/api/meta/data-deletion`.

## OAuth Settings

Add both redirect URIs for the popup flow:

- `https://inboxpilot.carry-digital-nomad.in.net/api/oauth/meta-instagram/callback`
- `https://inboxpilot.carry-digital-nomad.in.net/api/oauth/meta-facebook/callback`

Enable:

- Client OAuth Login
- Web OAuth Login
- Enforce HTTPS
- Strict Mode for Redirect URIs

## Permissions to Request

Request only the permissions that are actually used in the reviewer demo. Fewer permissions usually makes review easier.

| Permission | Why InboxPilot needs it | Reviewer demo proof |
| --- | --- | --- |
| `instagram_business_basic` | Reads the Instagram professional account identity, username, and profile metadata through Instagram Login. | Show the connected Instagram profile in Channels. |
| `instagram_business_manage_messages` | Reads and replies to Instagram DMs sent to the connected professional account. | Send a DM to the test IG account, show it in Inbox, and reply from InboxPilot. |
| `instagram_business_manage_comments` | Reads and replies to Instagram media comments for automation triggers. | Comment on a test IG post, show the comment in InboxPilot, and trigger/reply from automation. |

Legacy Facebook Login permissions such as `pages_show_list`, `pages_read_engagement`, `pages_manage_metadata`, `pages_messaging`, `instagram_basic`, `instagram_manage_messages`, and `business_management` should only be requested if InboxPilot intentionally re-enables the Facebook Page / Meta Business asset selection flow.

## Review Demo Account Package

Prepare these before submission:

- InboxPilot reviewer login email and password.
- A workspace with no private customer data.
- One Instagram professional account that can receive DMs and comments.
- One public test Instagram post for comment automation testing.
- A test Facebook / Meta account that has access to the professional IG account if using the Business Login flow.
- A short note telling Meta which account to choose in the popup.

## Reviewer Instructions

Use this text as the base reviewer instruction:

```text
1. Go to https://inboxpilot.carry-digital-nomad.in.net/login and sign in with the provided reviewer account.
2. Open Channels > Social Accounts, or go directly to https://inboxpilot.carry-digital-nomad.in.net/channels/connect/social.
3. Click "Connect Account" on Instagram OAuth or Facebook / Meta Login.
4. In the popup, choose the provided Instagram professional account and approve the requested permissions.
5. After the popup closes, InboxPilot shows the connected account in Social Accounts.
6. Send a direct message to the connected Instagram account from another Instagram account. Open Inbox in InboxPilot and confirm the message is visible.
7. Reply to the message from InboxPilot.
8. Add a comment to the provided test Instagram post. Open Automations / InboxPilot comment automation and confirm the comment can trigger a reply.
```

## Permission Explanation Text

Use concise, feature-specific explanations:

```text
InboxPilot is a SaaS inbox and automation platform for Instagram professional accounts. Customers connect their own Instagram professional account, receive Instagram DMs and comment events in InboxPilot, and configure automatic replies for common customer questions.
```

```text
instagram_business_manage_messages is required so InboxPilot can receive and reply to Instagram direct messages for the user's connected professional account. Without this permission, the Inbox and automation reply features cannot work.
```

```text
instagram_business_manage_comments is required so InboxPilot can read comments on the user's Instagram media and send configured public replies. This powers comment keyword automation and customer support workflows.
```

```text
Instagram Webhooks are required so new Instagram messages and comments can be delivered to InboxPilot in real time.
```

```text
instagram_business_basic is required to identify the connected Instagram professional account, display its username/profile in InboxPilot, and associate messages/comments with the correct customer workspace.
```

## Demo Video Script

Record a 3-5 minute screen recording:

1. Show the production URL and sign in to InboxPilot.
2. Open `Channels`.
3. Click `Social Accounts` and then `Connect Account` on Instagram OAuth or Facebook / Meta Login.
4. Approve the Meta permissions.
5. Return to InboxPilot and show the connected account under `Social Accounts` or the linked Instagram channel list.
6. Send a DM to the connected IG account from another IG account.
7. Show the new conversation in `Inbox`.
8. Reply from InboxPilot.
9. Add a comment to a test IG post.
10. Show the comment in InboxPilot or trigger a configured automation.
11. Show the privacy policy and data deletion pages briefly.

## Pre-Submission Fixes

- Change the Meta app display name from `manychat-auto-reply` to `InboxPilot`.
- Confirm the app is in Live mode.
- Complete Business Verification.
- Confirm the review account can sign in without 2FA blockers.
- Confirm the IG account is a professional account.
- Confirm the same IG account is not blocked by account quality or asset restrictions.
- Remove or justify `business_management` if the demo does not require business asset discovery.
- Use fresh/incognito browser sessions during reviewer testing to avoid accidental login to the wrong IG account.

## Why the Current Popup Fails

If the popup says `你無法使用此帳號連結到 manychat-auto-reply`, the OAuth redirect URI is no longer the main issue. Meta is rejecting the selected account for the current app. Typical causes:

- The app display name / business identity is not production-ready.
- The app has not passed Advanced Access / App Review for the requested Instagram permissions.
- The selected account is not accepted for this app because it is not in an allowed app role or approved business context.
- The app requests too many permissions for an unreviewed app.

The fix is to complete the app setup, business verification, and permission review, then retest with a clean browser session.
