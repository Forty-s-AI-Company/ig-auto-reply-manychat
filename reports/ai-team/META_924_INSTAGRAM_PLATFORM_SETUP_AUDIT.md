# Meta 924 Instagram Platform Setup Audit

Generated: 2026-07-06

## Scope

This audit checks why staging Instagram OAuth failed with `Invalid platform app` after switching the Instagram OAuth client id to the Meta Developers app:

```text
App name: InboxPilot
App ID: 924285843989683
Business ID: 1098456978116700
```

This audit did not submit Meta App Review, did not deploy Production, did not touch production DB, did not switch PayUNI production, and did not output any Meta / Instagram / Facebook secret.

## Evidence Captured

Screenshots and browser evidence were captured under:

```text
reports/ai-team/meta-924-platform-audit/
```

Captured files:

- `924-01-dashboard.png`
- `924-02-basic-settings.png`
- `924-03-instagram-api-setup.png`
- `924-04-permissions.png`
- `924-05-webhooks.png`
- `924-06-roles.png`
- `924-07-app-review.png`
- `924-08-clicked-instagram-usecase.png`
- `924-current-after-wait.png`
- `audit-results.json`
- `browser-console-errors.json`
- `clicked-instagram-usecase-dom.txt`
- `dashboard-visible-dom.json`

## Confirmed From Meta Developers

| Area | Result |
| --- | --- |
| Correct app selected | `InboxPilot`, App ID `924285843989683` |
| App status | Published / live state visible in dashboard |
| Dashboard app id | `924285843989683` |
| Instagram business use case | Dashboard shows `管理 Instagram 的訊息和內容` |
| App Review submission | Not submitted; submission page shows no active submission |
| App roles | Business-managed app roles are visible; an Instagram tester entry exists |

## Meta Dashboard Pages That Could Not Fully Render

The following pages were reachable by URL, but the main setup panel stayed on a loading spinner in the in-app browser:

- Instagram Business API Setup
- Instagram Business Permissions
- Instagram Business Webhooks

Browser console evidence includes:

```text
Failed to fetch
MutationObserver observe parameter is not of type Node
```

Because these panels did not fully render, this audit cannot safely confirm the exact current values for:

- Instagram API setup completion state
- OAuth redirect URI list
- Webhook callback URL
- Webhook verify token presence
- Advanced Access state for each permission

Do not treat those unrendered panels as configured.

## Product Code Path Confirmed

The staging Instagram OAuth start route uses this environment selection:

```text
META_INSTAGRAM_APP_ID || META_APP_ID
```

For Instagram mode, the route sends that value as:

```text
https://api.instagram.com/oauth/authorize?client_id=<selected_app_id>
```

Source paths:

- `src/app/api/meta/oauth/start/route.ts`
- `src/lib/oauth/providers/meta-instagram.ts`
- `src/app/api/meta/oauth/callback/route.ts`

That means if `META_INSTAGRAM_APP_ID=924285843989683`, the value `924285843989683` is sent directly to Instagram OAuth as `client_id`.

## Root Cause Assessment

The observed failure:

```text
Invalid platform app
```

is consistent with this state:

1. `924285843989683` is the correct Meta Developers app for `InboxPilot`.
2. `924285843989683` is not currently accepted by `api.instagram.com/oauth/authorize` as a valid Instagram OAuth platform app id.
3. The previous working OAuth lane used `1530009762118735`, which displayed the consent name `manychat-auto-reply-IG`.
4. Therefore, the fix is not simply replacing `META_INSTAGRAM_APP_ID` with `924285843989683`.

The likely required fix is one of these:

### Option A - Configure 924 as the valid Instagram Login platform app

In Meta Developers for `InboxPilot / 924285843989683`, complete the Instagram Business / Instagram Login setup so that the Instagram OAuth authorization endpoint accepts this app id.

Required fields to confirm in Meta Dashboard:

```text
App Domains:
- staging.carry-digital-nomad.in.net
- carry-digital-nomad.in.net

Instagram OAuth / Valid OAuth Redirect URIs:
- https://staging.carry-digital-nomad.in.net/api/instagram/oauth/callback
- https://carry-digital-nomad.in.net/api/instagram/oauth/callback

Privacy Policy URL:
- https://carry-digital-nomad.in.net/privacy-policy

Terms URL:
- https://carry-digital-nomad.in.net/terms-of-service

Data Deletion URL:
- https://carry-digital-nomad.in.net/data-deletion

Webhook callback:
- https://staging.carry-digital-nomad.in.net/api/webhooks/meta
- production equivalent only when production deploy is authorized
```

Important: if Meta creates or shows a separate Instagram platform app id under this app, use that Instagram platform id for `META_INSTAGRAM_APP_ID`, not necessarily the parent Meta app id.

### Option B - Keep the working Instagram app id and fix the display-name mismatch

If `1530009762118735` is the actual Instagram platform app that belongs to the same review lane, keep it as `META_INSTAGRAM_APP_ID` and rename its public display name from `manychat-auto-reply-IG` to `InboxPilot`, or document the app-id relationship clearly in the App Review package.

This is the lowest-risk path for restoring staging quickly because it matches the previously working OAuth behavior.

## Safe Actions Not Performed

No dashboard setting was changed in this audit because the Instagram API Setup / Webhooks / Permissions panels did not fully render, and changing platform settings blindly could break the reviewer-safe asset lane.

No secret was copied from Meta Dashboard.

## Required Human / Dashboard Actions

Before the next staging redeploy, complete one of these:

1. Restore Vercel branch-scoped staging env:
   - `META_INSTAGRAM_APP_ID=<working Instagram platform app id, previously 1530009762118735>`
   - `META_INSTAGRAM_APP_SECRET=<matching secret, redacted>`
2. Or finish Meta Dashboard setup for `924285843989683` so Instagram OAuth accepts it:
   - Confirm Instagram Business / API Setup panel loads.
   - Confirm the Instagram OAuth platform app id.
   - Add staging and production OAuth redirect URIs.
   - Confirm app domains, privacy, terms, data deletion.
   - Confirm webhook callback and subscribed fields.
   - Confirm permissions are at least testable for reviewer-safe testing.

## Current Status

```text
META_924_PLATFORM_AUDIT=HUMAN_ACTION_REQUIRED
META_APP_SELECTED=PASS
INSTAGRAM_USE_CASE_PRESENT=PASS
INSTAGRAM_API_SETUP_CONFIRMED=NO
OAUTH_REDIRECT_URI_CONFIRMED=NO
WEBHOOKS_CONFIRMED=NO
PERMISSIONS_CONFIRMED=PARTIAL
INVALID_PLATFORM_APP_ROOT_CAUSE=924285843989683 is not currently accepted as the Instagram OAuth platform client id.
CAN_FIX_WITHOUT_HUMAN=NO
STAGING_PREVIEW_ENV_NEEDS_REPAIR=YES
META_APP_REVIEW_SUBMITTED=NO
NEXT_REQUIRED_ACTION=Restore working Instagram app env for staging or complete Instagram platform setup for 924 before redeploying staging.
```

## 2026-07-06 Full Unification Feasibility Update

A follow-up feasibility run successfully loaded the 924 Instagram API setup page. The page confirmed that the parent Meta app is:

```text
InboxPilot / 924285843989683
```

but its Instagram API setup shows a separate Instagram app identity:

```text
Instagram app name: manychat-auto-reply-IG
Instagram app id: 1530009762118735
```

Direct OAuth smoke tests confirmed the split:

- `client_id=924285843989683` against `https://api.instagram.com/oauth/authorize` returns `Invalid platform app`.
- `client_id=1530009762118735` opens the Instagram consent flow.

Updated conclusion:

```text
META_924_FULL_UNIFICATION_FEASIBLE=NO
STAGING_CAN_USE_924=NO
RECOMMENDED_CLIENT_ID_FOR_INSTAGRAM_OAUTH=1530009762118735
INSTAGRAM_API_SETUP_CONFIRMED=YES
INVALID_PLATFORM_APP_ROOT_CAUSE=924 is the parent Meta app id, while 1530009762118735 is the Instagram platform app id accepted by Instagram OAuth.
```

See:

```text
reports/ai-team/META_924_FULL_UNIFICATION_FEASIBILITY_REPORT.md
reports/ai-team/meta-924-unification/
```
