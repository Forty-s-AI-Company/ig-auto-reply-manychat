# Meta OAuth App ID Switch Attempt Report

Generated: 2026-07-06

## Scope

This report records a staging-only attempt to align the Instagram OAuth consent app with the `InboxPilot` Meta Developers app. It did not submit Meta App Review, did not deploy Production, did not touch production DB, did not switch PayUNI production, and did not output any secret.

## Requested Direction

The operator selected option 2:

```text
Use InboxPilot app id 924285843989683 for staging Instagram OAuth.
```

## Local Env Adjustment

Local `.env.local` was updated so:

```text
META_INSTAGRAM_APP_ID=924285843989683
META_INSTAGRAM_APP_SECRET=<same source as META_APP_SECRET, redacted>
```

No secret value was printed or committed.

## Vercel Preview / Staging Env Adjustment

Updated Vercel `preview` env scoped to git branch `staging`:

```text
META_INSTAGRAM_APP_ID=924285843989683
META_INSTAGRAM_APP_SECRET=<redacted>
```

Then a Preview redeploy was created:

```text
Preview URL: https://inboxpilot-9a38rglfa-a25814740s-projects.vercel.app
Deployment ID: dpl_2nAF8upRPBRYB3WyB7vHuJUzTL5j
```

## Validation Result

The redeployed staging OAuth flow failed at Instagram authorization:

```text
Instagram error: Invalid platform app
```

Observed browser URL:

```text
https://www.instagram.com/oauth/authorize/third_party/error/?message=...Invalid platform app
```

Assessment:

- `924285843989683` is the InboxPilot Meta Developers app.
- It is not currently accepted by Instagram as the platform app for this Instagram OAuth flow.
- The current working Instagram OAuth lane appears to require the Instagram app id `1530009762118735` / app name `manychat-auto-reply-IG`.
- Therefore, switching staging Instagram OAuth directly to `924285843989683` is not viable without additional Meta Dashboard configuration / app product setup.

## Rollback Action

To avoid leaving staging broken, the custom staging alias was restored to the previously working Preview deployment:

```text
https://staging.carry-digital-nomad.in.net
-> https://inboxpilot-8p7i2pdcf-a25814740s-projects.vercel.app
```

Staging health after rollback:

```text
status=ok
deployment=staging
dbEnv=staging
releaseChannel=full
vercelEnv=preview
vercelGitCommitRef=staging
```

## Important Residual Risk

The Vercel `preview` env for git branch `staging` is now configured with `META_INSTAGRAM_APP_ID=924285843989683`.

That means the next staging branch Preview deployment will likely reproduce the `Invalid platform app` error unless one of these is done first:

1. Restore the branch-scoped staging `META_INSTAGRAM_APP_ID` / `META_INSTAGRAM_APP_SECRET` to the working Instagram app `1530009762118735` and its matching secret.
2. Configure `924285843989683` in Meta Developers so it is valid for the Instagram OAuth flow and has the required Instagram Login / redirect / permission setup.

## Recommended Path

Recommended safe path for App Review recording:

1. Keep the working Instagram OAuth app id `1530009762118735`.
2. Gain admin access to that app in Meta Developers.
3. Rename its display name from `manychat-auto-reply-IG` to `InboxPilot`, or document the relationship clearly in reviewer notes.
4. Restore staging branch Preview env to the working `1530009762118735` app id and matching secret before any new staging deployment.
5. Re-run staging OAuth and capture consent evidence only after it no longer shows `Invalid platform app`.

## 2026-07-06 Meta 924 Platform Setup Audit

A follow-up browser audit was performed against the correct Meta Developers app:

```text
App name: InboxPilot
App ID: 924285843989683
Business ID: 1098456978116700
```

Confirmed:

- Meta Dashboard selects `InboxPilot / 924285843989683`.
- Dashboard shows the Instagram business use case `管理 Instagram 的訊息和內容`.
- App Review submission page shows no active submission.

Not confirmed:

- Instagram API Setup main panel did not fully render in the in-app browser.
- Permissions main panel did not fully render in the in-app browser.
- Webhooks main panel did not fully render in the in-app browser.

Browser console showed Meta page loading errors (`Failed to fetch` and MutationObserver errors), so no safe dashboard mutation was performed.

See:

```text
reports/ai-team/META_924_INSTAGRAM_PLATFORM_SETUP_AUDIT.md
reports/ai-team/meta-924-platform-audit/
```

Updated assessment:

- `924285843989683` is confirmed as the correct parent Meta Developers app.
- It is still not confirmed as a valid Instagram OAuth platform app id for `https://api.instagram.com/oauth/authorize`.
- The staging Preview env remains unsafe for future redeploys until the branch-scoped Instagram OAuth app id/secret are restored to the working Instagram platform app, or 924's Instagram platform setup is completed and verified.

## Status

```text
META_OAUTH_APP_ID_SWITCH=FAIL
REASON=Invalid platform app
STAGING_ALIAS_ROLLED_BACK=PASS
STAGING_HEALTH_AFTER_ROLLBACK=PASS
STAGING_PREVIEW_ENV_NEEDS_REPAIR=YES
APP_NAME_CONSISTENCY=WARNING
META_924_PLATFORM_AUDIT=HUMAN_ACTION_REQUIRED
INSTAGRAM_PLATFORM_SETUP_CONFIRMED=NO
NEXT_REQUIRED_ACTION=Restore working Instagram app env or configure InboxPilot app as a valid Instagram platform app before final recording.
```

## 2026-07-06 Full Unification Feasibility Update

The 924 Instagram API setup page was rechecked and rendered successfully. It confirms that the correct `InboxPilot / 924285843989683` parent app contains an Instagram API setup with:

```text
Instagram app name: manychat-auto-reply-IG
Instagram app id: 1530009762118735
```

Two non-secret OAuth smoke tests were run:

- `client_id=924285843989683`: failed with `Invalid platform app`.
- `client_id=1530009762118735`: opened Instagram consent.

Updated status:

```text
META_924_FULL_UNIFICATION_FEASIBLE=NO
STAGING_CAN_USE_924=NO
INVALID_PLATFORM_APP_RESOLVED=NO
RECOMMENDED_CLIENT_ID_FOR_INSTAGRAM_OAUTH=1530009762118735
APP_NAME_CONSISTENCY=WARNING
NEXT_REQUIRED_ACTION=Restore staging/Preview env to the Instagram platform app id 1530009762118735 and matching secret before final recording.
```
