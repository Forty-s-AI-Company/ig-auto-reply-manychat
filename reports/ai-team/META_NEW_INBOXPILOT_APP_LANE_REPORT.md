# Meta New InboxPilot App Lane Report

Generated: 2026-07-06

## Scope

This report records the new clean Meta / Instagram OAuth lane created for InboxPilot so the future OAuth consent display name no longer depends on the legacy `manychat-auto-reply-IG` lane.

This run did not submit Meta App Review, did not deploy Production, did not touch production DB, did not switch PayUNI production, did not output secrets, and did not connect real customer assets.

## Requested Strategy

The owner selected option B:

```text
Create a new Meta App / Instagram OAuth lane named InboxPilot.
Do not continue trying to rename the legacy manychat-auto-reply-IG display name.
```

## New App Lane Created

The Meta Developers creation wizard was completed after the human owner handled Meta password re-authentication in the browser.

Observed values:

```text
Parent Meta App name: InboxPilot
Parent Meta App ID: 1383365527078199
Business portfolio: 零元兄弟 / 1098456978116700
Use case: Instagram API / 管理 Instagram 的訊息和內容
Instagram app display name: InboxPilot-IG
Instagram OAuth client ID / platform app ID: 2542520412924029
```

Evidence:

```text
reports/ai-team/meta-new-inboxpilot-app-lane/01-new-app-instagram-api-setup.png
reports/ai-team/meta-new-inboxpilot-app-lane/02-basic-settings-policy-urls-saved.png
reports/ai-team/meta-new-inboxpilot-app-lane/03-instagram-redirect-uri-saved.png
reports/ai-team/meta-new-inboxpilot-app-lane/04-oauth-smoke-developer-role-insufficient.png
reports/ai-team/meta-new-inboxpilot-app-lane/05-app-roles-testers-empty.png
reports/ai-team/meta-new-inboxpilot-app-lane/06-staging-new-lane-instagram-login.png
reports/ai-team/meta-new-inboxpilot-app-lane/07-staging-new-lane-developer-role-insufficient-after-login.png
reports/ai-team/meta-new-inboxpilot-app-lane/08-meta-role-add-blocked-test-user.png
```

## Settings Completed

Non-secret settings updated in Meta Developers:

```text
Privacy Policy URL: https://carry-digital-nomad.in.net/privacy-policy
Terms URL: https://carry-digital-nomad.in.net/terms-of-service
Data Deletion URL: https://carry-digital-nomad.in.net/data-deletion
Instagram Business Login redirect URI: https://staging.carry-digital-nomad.in.net/api/instagram/oauth/callback
```

The app secret remained hidden. Codex did not click `顯示`, did not copy the secret, and did not write any secret to repo files.

## 2026-07-06 Staging / Preview Env Activation Verification

The owner had already entered the new secrets, but staging still served the old OAuth lane. The missing step was that the non-secret app-id / redirect env keys were still on the old lane and the custom staging alias still pointed to the older deployment.

Actions completed safely:

1. Overrode branch-scoped Preview env for `staging`:
   - `META_APP_ID=1383365527078199`
   - `META_INSTAGRAM_APP_ID=2542520412924029`
   - `META_INSTAGRAM_REDIRECT_URI=https://staging.carry-digital-nomad.in.net/api/instagram/oauth/callback`
   - `META_FACEBOOK_REDIRECT_URI=https://staging.carry-digital-nomad.in.net/api/meta/oauth/callback`
   - `APP_URL=https://staging.carry-digital-nomad.in.net`
   - `APP_DOMAIN=staging.carry-digital-nomad.in.net`
2. Redeployed the latest staging Preview deployment.
3. Re-pointed `staging.carry-digital-nomad.in.net` to the fresh deployment so the custom staging domain stopped serving the 3-day-old build.

Observed result after the redeploy:

```text
Staging Instagram OAuth now redirects with client_id=2542520412924029
redirect_uri=https://staging.carry-digital-nomad.in.net/api/instagram/oauth/callback
```

Evidence:

```text
reports/ai-team/meta-new-inboxpilot-app-lane/06-staging-new-lane-instagram-login.png
```

This confirms:

- The new clean InboxPilot lane is active on the staging custom domain.
- `Invalid platform app` is resolved on staging.
- The next step was to try a real reviewer-safe login.

## 2026-07-07 Real Login Verification

The reviewer-safe Instagram credentials stored in local `.env.local` were used on the new staging lane.

Observed result after the actual login submit:

```text
Final URL=https://www.instagram.com/oauth/authorize/third_party/error/?message=開發人員角色不足
OAUTH_BLOCKER=DEVELOPER_ROLE_INSUFFICIENT
```

Evidence:

```text
reports/ai-team/meta-new-inboxpilot-app-lane/07-staging-new-lane-developer-role-insufficient-after-login.png
```

Revised interpretation:

- The new lane is correctly active on staging.
- The reviewer-safe account can reach the login step.
- After authentication, Instagram still rejects the account for this new app lane with `開發人員角色不足`.
- Therefore the current blocker is a **real Meta role / tester / app access gate**, not product code, not secret configuration, and not the old `Invalid platform app` issue.

## 2026-07-07 Role Assignment Follow-Up

Codex then attempted to add the reviewer-safe account from local `.env.local` directly to app `1383365527078199` under the `測試人員` role.

Observed Meta response:

```text
A Facebook Developer Account is required to be added to an app. Test users can't be added.
```

Evidence:

```text
reports/ai-team/meta-new-inboxpilot-app-lane/08-meta-role-add-blocked-test-user.png
```

Final interpretation for this blocker:

- The reviewer-safe account currently stored in `.env.local` is treated by Meta as a test user / non-developer account.
- That type of account cannot be added to app roles for this new Meta app lane.
- To continue, the owner must use a real Facebook Developer account as the reviewer-safe Meta identity, or replace the reviewer-safe account with one that Meta recognizes as a Facebook Developer account and can accept the app role.

## OAuth Smoke Result

A no-consent OAuth smoke was opened with:

```text
client_id=2542520412924029
redirect_uri=https://staging.carry-digital-nomad.in.net/api/instagram/oauth/callback
scope=instagram_business_basic,instagram_business_manage_comments,instagram_business_manage_messages
```

Result:

```text
INVALID_PLATFORM_APP_RESOLVED=YES
OAUTH_PLATFORM_CLIENT_ID_ACCEPTED=YES
OAUTH_BLOCKER=DEVELOPER_ROLE_INSUFFICIENT
```

The previous `Invalid platform app` failure did not appear. Instagram instead returned:

```text
開發人員角色不足
```

Assessment:

- The new Instagram platform app id `2542520412924029` is recognized by Instagram OAuth.
- The next blocker is not product code and not invalid platform setup.
- The current Instagram / Meta account used in the OAuth smoke is not yet allowed for this new app lane.

## Roles / Tester Audit

Meta Developers app roles page for the new app shows:

```text
Admins: 1
Testers: 0 / 50
```

Observed admin row:

```text
林元 / 管理員
```

This is consistent with the OAuth smoke result `開發人員角色不足`.

Interpretation:

- The new app exists and the Instagram platform app id is valid.
- The reviewer-safe Meta / Instagram account that should run OAuth is not yet added as tester / allowed role for this new lane.

## Remaining Human / Secret Gates

The following still cannot be completed safely by Codex without human/secret input:

1. Replace the current reviewer-safe Meta identity with a real Facebook Developer account.
2. Add that developer account to app `1383365527078199` as `測試人員` or another allowed role, then accept the invitation if Meta requires it.
3. After the role gate is fixed, rerun Instagram login on the new lane.
4. Reviewer-safe Business / Page / IG asset selection must be performed by the owner if Meta asks which asset to connect after the role gate is fixed.
5. Webhooks require a callback URL and verify token. The verify token is secret and must be provided through secure env configuration, not repo.
6. Production env must not be changed until the new lane is fully verified in staging.

## Recommended Staging Env Update

For staging / Preview only:

```text
META_APP_ID=1383365527078199
META_APP_SECRET=<new parent Meta app secret, do not commit>
META_INSTAGRAM_APP_ID=2542520412924029
META_INSTAGRAM_APP_SECRET=<owner-provided secret, do not commit>
META_INSTAGRAM_REDIRECT_URI=https://staging.carry-digital-nomad.in.net/api/instagram/oauth/callback
META_FACEBOOK_REDIRECT_URI=https://staging.carry-digital-nomad.in.net/api/meta/oauth/callback
APP_URL=https://staging.carry-digital-nomad.in.net
APP_DOMAIN=staging.carry-digital-nomad.in.net
META_GRAPH_API_VERSION=v25.0
META_VERIFY_TOKEN=<existing or coordinated verify token>
```

Do not update production env yet.

Why `META_APP_SECRET` also matters:

- Instagram authorize uses `META_INSTAGRAM_APP_ID`.
- Instagram code exchange uses `META_INSTAGRAM_APP_SECRET`.
- Webhook subscription and some callback paths still use `META_APP_ID` + `META_APP_SECRET`.

See:

```text
reports/ai-team/META_NEW_APP_STAGING_ENV_SETUP_CHECKLIST.md
```

## Status

```text
META_NEW_APP_LANE_CREATED=YES
NEW_PARENT_META_APP_ID=1383365527078199
NEW_INSTAGRAM_OAUTH_CLIENT_ID=2542520412924029
OAUTH_CONSENT_DISPLAY_NAME=InboxPilot-IG
INVALID_PLATFORM_APP_RESOLVED=YES
STAGING_CAN_USE_NEW_LANE=YES
READY_TO_UPDATE_STAGING_ENV=COMPLETED
HUMAN_SECRET_INPUT_REQUIRED=NO_LONGER_BLOCKING_IF_ALREADY_SET
HUMAN_TESTER_ROLE_REQUIRED=YES
META_LOGIN_REQUIRED=RESOLVED
META_ROLE_INVITE_ACCEPTANCE_REQUIRED=LIKELY
META_REVIEWER_ACCOUNT_IS_TEST_USER=YES
HUMAN_ASSET_SELECTION_REQUIRED=LIKELY
META_APP_REVIEW_SUBMITTED=NO
NEXT_REQUIRED_ACTION=Use a real Facebook Developer account as the reviewer-safe Meta identity, add it to app 1383365527078199, then rerun login and continue connected-channel evidence.
```
