# Meta App Review Final Recording Preflight

Last updated: 2026-07-04.

## Purpose

This is the final Go / Hold checklist before recording the InboxPilot Meta App Review walkthrough.

Use it after the reviewer-safe local rehearsal and staging tenant SOP are prepared, but before recording videos, capturing screenshots, or pressing any Meta App Review submit button.

Do not write secrets, passwords, tokens, app secrets, verify tokens, raw OAuth callback query strings, database URLs, PAYUNi keys, cookies, or real customer data into this file.

## Current Decision

```text
Meta App Review submission: Hold
Recording package preparation: Conditional Go
Production webhook callback: Pass
Instagram webhook subscriptions: Pass for core comments/messages fields
Permission approval / Advanced Access: Hold
PayUNI mode: Sandbox only
```

## Meta Dashboard Preflight

Observed from the logged-in Meta Developers dashboard for `InboxPilot` (`App ID: 924285843989683`):

| Area | Status | Recording impact | Final action |
| --- | --- | --- | --- |
| App identity | Pass | Correct app is selected. | Keep using `InboxPilot`, not the older test app. |
| App domains | Pass | Production/staging/custom domains are present. | Re-check before final submission if domains changed. |
| Privacy Policy | Pass | Public URL can be recorded. | Include in screenshot package. |
| Terms of Service | Pass | Public URL can be recorded. | Include in screenshot package. |
| Data deletion callback | Pass | Meta-required deletion path exists. | Do not expose callback internals. |
| Website URL | Pass | Production entry can be recorded. | Use production URL unless staging reviewer lane is explicitly chosen. |
| App icon | Hold / polish | Basic Settings still shows an upload/drop target. | Add a reviewer-safe InboxPilot app icon before final package capture if Meta requires branded app presentation. |
| Webhook callback | Pass | Callback is persisted as production endpoint. | Keep verify token masked; do not record it. |
| Instagram webhook object | Pass | Core comments/messages fields are subscribed. | Do not over-claim live webhook event proof until reviewer-safe event rehearsal exists. |
| Instagram permissions | Hold | Required permissions are still `可供測試`. | Submit App Review / Advanced Access only after final evidence package is ready. |

## Reviewer-Safe Asset Lane

| Evidence | Local rehearsal | Staging / real asset lane | Final recording decision |
| --- | --- | --- | --- |
| Dashboard / workspace | Covered by reviewer rehearsal smoke. | Needs reviewer-safe login and isolated workspace check. | Record only after workspace isolation is confirmed. |
| Channels connect entry | Covered by product UI. | Ready if reviewer-safe user can reach Channels. | Record. |
| Instagram OAuth connect | Not fully proven by local synthetic fixtures. | Requires reviewer-safe Instagram / Meta session and safe asset. | Record only with address bar cropped/hidden. |
| Connected Instagram channel | Covered in staging lane when OAuth succeeds. | Ready if channel display name/avatar are reviewer-safe. | Record after final redaction check. |
| Inbox synthetic conversation | Covered by local reviewer smoke. | Ready if staging workspace shows synthetic-only conversation. | Record only if no real customer data appears. |
| Contacts synthetic contact | Covered by local reviewer smoke. | Ready if staging workspace shows synthetic-only contact. | Record only if no real customer data appears. |
| Automations draft | Covered by local reviewer smoke. | Ready if staging has `Meta Review Keyword Reply` or equivalent safe draft. | Record, but do not claim live trigger delivery unless proven. |
| Live webhook message/comment delivery | Not fully proven by local fixtures. | Still needs reviewer-safe remote event rehearsal. | Hold unless a safe remote event is captured. |
| Privacy / Terms / Data Deletion | Public pages available. | Ready. | Record and screenshot. |

## Recording Checklist

Before pressing record:

- `[ ]` Use a clean browser profile or clean browser window.
- `[ ]` Close DevTools, password managers, email, Vercel, Supabase, GitHub, PayUNI, database tools, and Meta Dashboard.
- `[ ]` Disable desktop notifications.
- `[ ]` Prepare viewport-only capture.
- `[ ]` Prepare address-bar crop or blur for OAuth/callback moments.
- `[ ]` Confirm reviewer-safe credentials are available through a secure handoff method only.
- `[ ]` Confirm the reviewer-safe workspace contains synthetic-only data.
- `[ ]` Confirm the reviewer-safe Instagram asset does not contain real customer DMs/comments/media.
- `[ ]` Confirm app icon gap is accepted or fixed before final capture.
- `[ ]` Confirm required permission status is described accurately as review/Advanced Access pending.

Recommended shot order:

1. Production entry / login.
2. Reviewer-safe login.
3. Dashboard workspace context.
4. Channels Instagram connect entry.
5. Instagram OAuth consent, only if safe to show.
6. Connected channel confirmation.
7. Inbox synthetic conversation.
8. Contacts synthetic contact.
9. Automations keyword/comment draft.
10. Privacy Policy.
11. Data Deletion.
12. Terms of Service.
13. Closing summary.

## Redaction Hard Stops

Stop, discard, and re-record if any of these appear:

- `code=`, `state=`, `nonce=`, or a full OAuth callback URL.
- Access token, refresh token, app secret, client secret, verify token.
- Password, password manager popup, OTP, recovery code, or credential handoff.
- Cookie, localStorage, sessionStorage, DevTools, or network inspector.
- Vercel env, Supabase connection string, Meta App Secret, PAYUNi Hash Key / Hash IV.
- Real customer message, email, phone, address, payment, order, workspace, or admin data.
- Unsafe Instagram asset or unrelated Meta account picker.

## Final Manual Steps Before Submit

These remain manual even though Codex can prepare docs and inspect the dashboard:

1. Prepare or upload reviewer-safe App icon if required by Meta final package standards.
2. Confirm reviewer-safe staging credentials through a secure handoff channel.
3. Confirm reviewer-safe Instagram / Meta asset ownership and safe content.
4. Capture final recording and screenshots.
5. Run redaction review on every recording and screenshot.
6. Confirm requested permission text matches the real product proof:
   - `instagram_business_basic`
   - `instagram_business_manage_comments`
   - `instagram_business_manage_messages`
7. Confirm Business Verification / Advanced Access status in Meta.
8. Fill Meta App Review form.
9. Upload final reviewer-safe artifacts.
10. Only then press Submit.

## Do Not Do During Preflight

- Do not submit App Review.
- Do not switch PayUNI production.
- Do not deploy Production.
- Do not run production migrations or `db push`.
- Do not record secrets or private account identifiers.
- Do not claim live webhook event proof unless a reviewer-safe remote event rehearsal has actually passed.

