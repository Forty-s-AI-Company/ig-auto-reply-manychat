# InboxPilot manual QA script

Date: 2026-07-02

Use this script for staging or local QA. Do not enter production secrets in reports or screenshots.

## Setup

1. Start the local app or open staging.
2. Use a seeded QA account only.
3. Keep PayUNI in Sandbox.
4. Do not submit Meta App Review.
5. Do not mutate production DB.

## Public / auth flow

1. Open `/`.
2. Verify landing CTA routes to sign up or login.
3. Open `/pricing`.
4. Confirm plan copy does not imply unavailable production payment behavior.
5. Login with QA account.
6. Expected: redirect to `/dashboard`, no console error, no horizontal overflow on mobile.

## Dashboard

1. Verify account scope card shows current Instagram account state.
2. Click primary CTA for missing/connected account.
3. Expected: CTA routes to Channels or Inbox appropriately.
4. Check recent messages and recent automations empty states.
5. Expected: each empty state has a clear next step.

## Channels / Social connect

1. Open `/channels`.
2. Verify Instagram cards show account name or clear fallback if metadata is partial.
3. Click profile refresh on a stale/partial account.
4. Expected: user-readable error if token/permission is invalid; no raw provider trace or token.
5. Click channel disconnect.
6. Expected: in-app confirmation dialog, clear deletion impact, cancel works.
7. Open `/channels/connect/social?meta_error=invalid_state`.
8. Expected: red alert with readable Chinese error.

## Inbox

1. Open `/inbox`.
2. Switch Instagram account from the sidebar.
3. Search conversations.
4. Apply filters.
5. Select a conversation.
6. Try reply composer.
7. Expected: message sends in supported test paths, or gives a clear reason why sending is unavailable.
8. Verify mobile width: no broken panes or unreachable controls.

## Contacts

1. Open `/contacts`.
2. Click tag `+`.
3. Expected: tag creation modal opens and validates input.
4. Filter by tag/status.
5. Select contacts and use batch tag actions.
6. Open a contact detail page.
7. Edit username/email/phone, cancel, save.
8. Add/remove tags.
9. Expected: success/error toast is readable.

## Automations / Sequences

1. Open `/automations`.
2. Verify unavailable features are disabled with a reason.
3. Open `/sequences`.
4. Create or edit a sequence in local/staging test data.
5. Delete a sequence.
6. Expected: in-app confirmation dialog, no native browser confirm.

## Analytics

1. Open `/analytics`.
2. Verify 7-day message trend chart renders.
3. Switch Instagram scope and refresh.
4. Expected: chart and empty states explain scoped data.

## Billing / referrals

1. Open `/billing`.
2. Confirm PayUNI Sandbox wording in test environments.
3. Open `/referrals` and `/wallet`.
4. Confirm referral credit is described as non-cash discount when applicable.
5. Do not perform production payment.

## Admin

1. Login as admin QA account.
2. Open `/admin/invoices`.
3. Click refund action on an eligible paid invoice in test data.
4. Expected: in-app confirmation dialog explains PayUNI is not called automatically.
5. Cancel first, then confirm only on disposable test data.

## Browser checks

For each key page, inspect:

- Console errors
- Network failures
- Mobile overflow
- Keyboard focus on dialogs
- Clear disabled states
- No raw token, provider trace, or callback query leaks

