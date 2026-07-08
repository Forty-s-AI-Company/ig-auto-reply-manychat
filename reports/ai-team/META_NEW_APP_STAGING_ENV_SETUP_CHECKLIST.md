# Meta New App Staging Env Setup Checklist

Generated: 2026-07-06

## Scope

This checklist prepares staging / Preview-only environment variables for the new clean InboxPilot Meta / Instagram OAuth lane.

Do not paste real secret values into this file.
Do not update Production env from this checklist.

## New Lane Identity

```text
Parent Meta App name=InboxPilot
Parent Meta App ID=1383365527078199
Instagram OAuth client ID=2542520412924029
Instagram OAuth display name=InboxPilot-IG
```

## Why More Than One Key Must Change

The runtime does not use only one Meta env:

- Instagram authorize route uses `META_INSTAGRAM_APP_ID`, falling back to `META_APP_ID`.
- Instagram code exchange requires `META_INSTAGRAM_APP_SECRET`, and if the Instagram app id differs from `META_APP_ID`, the Instagram-specific secret is mandatory.
- Meta webhook subscription and some channel sync paths still use `META_APP_ID`, `META_APP_SECRET`, and `META_VERIFY_TOKEN`.

Because of that, staging / Preview should not run a mixed lane such as:

```text
old parent app + new Instagram app
or
new parent app + old Instagram app
```

Use one consistent new lane for staging / Preview verification.

## Keys To Update In Staging / Preview

| Key | Action | Why |
| --- | --- | --- |
| `META_APP_ID` | update | Parent Meta app should move to `1383365527078199` for the new lane. |
| `META_APP_SECRET` | update | Required by Facebook-side callback / webhook subscription paths. |
| `META_INSTAGRAM_APP_ID` | update | Instagram OAuth client must move to `2542520412924029`. |
| `META_INSTAGRAM_APP_SECRET` | update | Required because Instagram app id differs from parent app id. |
| `META_INSTAGRAM_REDIRECT_URI` | confirm/update | Must match `https://staging.carry-digital-nomad.in.net/api/instagram/oauth/callback`. |
| `META_FACEBOOK_REDIRECT_URI` | confirm/update | Keep aligned to staging: `https://staging.carry-digital-nomad.in.net/api/meta/oauth/callback`. |
| `APP_URL` | confirm | Must remain the staging origin used to build callback URLs and webhook callback URL. |
| `APP_DOMAIN` | confirm | Should remain the staging domain. |
| `META_GRAPH_API_VERSION` | keep unless intentionally changed | Current code defaults to `v25.0`; do not drift values across staging surfaces. |
| `META_VERIFY_TOKEN` | usually keep, but confirm | Needed for webhook verification; if rotated, Meta dashboard callback verification must be updated too. |

## Keys That Usually Do Not Need To Change For This Lane Switch

These are not the first blockers for the new OAuth lane switch:

- `META_USER_ACCESS_TOKEN`
- `META_USER_ACCESS_TOKEN_EXPIRES_AT`
- `META_PAGE_ID`
- `META_PAGE_ACCESS_TOKEN`
- `META_INSTAGRAM_BUSINESS_ACCOUNT_ID`

They may be refreshed later after a successful reviewer-safe connect, but they are not the initial lane-switch keys.

## Expected Staging / Preview Values

Do not store secrets here. This is the shape only:

```text
META_APP_ID=1383365527078199
META_APP_SECRET=<new parent Meta app secret>
META_INSTAGRAM_APP_ID=2542520412924029
META_INSTAGRAM_APP_SECRET=<new Instagram app secret>
META_INSTAGRAM_REDIRECT_URI=https://staging.carry-digital-nomad.in.net/api/instagram/oauth/callback
META_FACEBOOK_REDIRECT_URI=https://staging.carry-digital-nomad.in.net/api/meta/oauth/callback
APP_URL=https://staging.carry-digital-nomad.in.net
APP_DOMAIN=staging.carry-digital-nomad.in.net
META_GRAPH_API_VERSION=v25.0
META_VERIFY_TOKEN=<existing or newly coordinated verify token>
```

## Manual Secret Gate

The following values must be entered manually by the owner in staging / Preview env and must never be committed:

```text
META_APP_SECRET
META_INSTAGRAM_APP_SECRET
META_VERIFY_TOKEN (if you also rotate webhook verification)
```

## Tester / Reviewer-Safe Access Gate

Even after env is updated, OAuth can still fail if the current Meta / Instagram account is not allowed for the new app.

Observed first smoke result on the new lane:

```text
INVALID_PLATFORM_APP_RESOLVED=YES
OAUTH_BLOCKER=DEVELOPER_ROLE_INSUFFICIENT
```

Therefore the next human-controlled step is:

1. Add reviewer-safe Meta account as app role / tester for the new app lane.
2. Use only reviewer-safe Business / Page / Instagram assets.
3. Re-run OAuth smoke after env + tester setup.

Observed supporting evidence:

```text
Earlier app roles evidence:
- Admins: 1
- Testers: 0 / 50
Evidence: reports/ai-team/meta-new-inboxpilot-app-lane/05-app-roles-testers-empty.png
```

## 2026-07-06 Activation Update

The owner then confirmed the new secrets had already been entered. Codex completed the remaining non-secret branch-scoped Preview env updates for `staging`, redeployed the latest Preview, and re-pointed `staging.carry-digital-nomad.in.net` to the fresh deployment.

Verified live result:

```text
staging.carry-digital-nomad.in.net now redirects Instagram OAuth with client_id=2542520412924029
```

This means the env switch itself is now active on the staging custom domain.

New immediate blocker:

```text
META_LOGIN_REQUIRED=YES
```

No `Invalid platform app` appeared on the new staging smoke after the env + alias activation.

However, the blocker moved again after the reviewer-safe tester identity was corrected.

Observed 2026-07-07 live result:

```text
Instagram login page: PASS
Instagram consent page: PASS
OAuth consent display name: InboxPilot-IG
Final popup callback: Error validating verification code. Please make sure your redirect_uri is identical to the one you used in the OAuth dialog request
```

This proves:

- reviewer-safe Instagram login is now accepted by the new lane
- `Invalid platform app` is resolved
- the old `開發人員角色不足` blocker is no longer the active issue

New active blocker:

```text
INSTAGRAM_TOKEN_EXCHANGE_REDIRECT_MISMATCH=YES
```

Most likely follow-up checks:

1. Confirm `META_INSTAGRAM_APP_SECRET` in Preview/staging is the Instagram app secret for client id `2542520412924029`, not the parent Meta app secret.
2. Confirm the new app lane has exact valid redirect URIs for:
   - `https://staging.carry-digital-nomad.in.net/api/instagram/oauth/callback`
   - `https://carry-digital-nomad.in.net/api/instagram/oauth/callback`
3. Re-run staging OAuth after the secret / redirect-uri pair is verified.

## Post-Update Verification Sequence

After the owner updates staging / Preview env with the new secrets:

1. Check staging health.
2. Start Instagram OAuth from staging.
3. Log in with the reviewer-safe Instagram / Meta account.
4. Confirm the consent flow no longer shows `Invalid platform app`.
5. Confirm the flow no longer stops at `開發人員角色不足`.
6. Complete reviewer-safe connect.
7. Verify connected channel evidence in:
   - Channels
   - Sidebar dropdown
   - Inbox scope
   - Contacts scope
   - Automations channel context
8. Update final recording package.

## Success Criteria

The staging env switch can be considered ready only when all are true:

```text
STAGING_ENV_KEYS_UPDATED=YES
META_SECRET_GATE_COMPLETE=LIKELY_YES
TESTER_ROLE_GATE_COMPLETE=NO
OAUTH_SMOKE_INVALID_PLATFORM_APP=NO
OAUTH_SMOKE_DEVELOPER_ROLE_INSUFFICIENT=YES_AFTER_REAL_LOGIN
CONNECTED_CHANNEL_EVIDENCE=PASS
READY_TO_RESUME_META_RECORDING=YES
```

## Current Status

```text
STAGING_ENV_KEYS_IDENTIFIED=YES
META_SECRET_GATE_COMPLETE=NO_LONGER_PRIMARY_BLOCKER
TESTER_ROLE_GATE_COMPLETE=NO
READY_TO_UPDATE_STAGING_ENV=COMPLETED
NEXT_REQUIRED_ACTION=Human must replace the current reviewer-safe Meta identity with a real Facebook Developer account, add it to app 1383365527078199, then rerun the new-lane login.
```
