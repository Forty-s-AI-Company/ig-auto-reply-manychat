# Meta 924 Full Unification Feasibility Report

Generated: 2026-07-06

## Scope

This report evaluates whether InboxPilot can fully unify Meta / Instagram OAuth around the parent Meta app id:

```text
InboxPilot Meta App ID: 924285843989683
Previous working Instagram platform app id: 1530009762118735
```

This run did not submit Meta App Review, did not deploy Production, did not touch production DB, did not switch PayUNI production, did not expose app secrets, and did not connect real customer assets.

## Current OAuth Mode

The product currently uses a mixed OAuth architecture.

### Instagram Platform OAuth

Used for the default Instagram connection flow.

| Item | Value |
| --- | --- |
| Authorize endpoint | `https://api.instagram.com/oauth/authorize` |
| App id env source | `META_INSTAGRAM_APP_ID || META_APP_ID` |
| Client id sent | Selected app id is sent as `client_id` |
| Scopes | `instagram_business_basic`, `instagram_business_manage_comments`, `instagram_business_manage_messages` |
| Redirect URI | `META_INSTAGRAM_REDIRECT_URI`, falling back to `/api/instagram/oauth/callback` |
| Token exchange endpoint | `https://api.instagram.com/oauth/access_token` |
| Long-lived token endpoint | `https://graph.instagram.com/access_token` |
| Relevant source | `src/app/api/meta/oauth/start/route.ts`, `src/app/api/meta/oauth/callback/route.ts`, `src/lib/oauth/providers/meta-instagram.ts` |

For this mode, the working client id is the Instagram platform app id shown by Meta's Instagram API setup, not necessarily the parent Meta app id.

### Facebook / Meta Graph OAuth

Available as the Facebook-mode path.

| Item | Value |
| --- | --- |
| Authorize endpoint | `https://www.facebook.com/<graphVersion>/dialog/oauth` |
| App id env source | `META_APP_ID` |
| Token exchange endpoint | `https://graph.facebook.com/<graphVersion>/oauth/access_token` |
| Relevant source | `src/app/api/meta/oauth/start/route.ts`, `src/app/api/meta/oauth/callback/route.ts`, `src/lib/oauth/providers/meta-facebook.ts` |

This mode uses the parent Meta app id.

## 924 Dashboard Setup Evidence

The correct Meta Developers app page was opened:

```text
App name: InboxPilot
Parent Meta App ID: 924285843989683
Business ID: 1098456978116700
```

The Instagram API setup page rendered successfully during this feasibility run. It showed:

```text
Instagram API
含有 Instagram 登入的 API 設定
Instagram 應用程式名稱 manychat-auto-reply-IG
Instagram 應用程式編號 1530009762118735
instagram_business_basic
instagram_business_manage_comments
instagram_business_manage_messages
```

Evidence files:

- `reports/ai-team/meta-924-unification/924-api-setup-current.png`
- `reports/ai-team/meta-924-unification/924-api-setup-current-text.txt`
- `reports/ai-team/meta-924-unification/924-api-setup-current-dom.txt`
- `reports/ai-team/meta-924-unification/924-api-setup-console.json`

Important conclusion:

```text
924285843989683 is the InboxPilot parent Meta app.
1530009762118735 is the Instagram app / platform app id shown inside that app's Instagram API setup.
```

## OAuth Smoke Test Results

### 924 as Instagram OAuth client id

Test URL used `client_id=924285843989683` against:

```text
https://api.instagram.com/oauth/authorize
```

Result:

```text
Invalid platform app
```

Evidence:

- `reports/ai-team/meta-924-unification/924-direct-instagram-authorize-smoke.png`
- `reports/ai-team/meta-924-unification/924-direct-instagram-authorize-smoke.txt`

### 153 as Instagram OAuth client id

Test URL used `client_id=1530009762118735` against:

```text
https://api.instagram.com/oauth/authorize
```

Result:

```text
Instagram consent opened successfully.
Observed consent app name: manychat-auto-reply-IG
```

Evidence:

- `reports/ai-team/meta-924-unification/153-direct-instagram-authorize-smoke.png`
- `reports/ai-team/meta-924-unification/153-direct-instagram-authorize-smoke.txt`

## Feasibility Decision

Full runtime unification by setting `META_INSTAGRAM_APP_ID=924285843989683` is not feasible for the current Instagram Platform OAuth flow.

The correct interpretation is:

1. Governance / parent app is `InboxPilot / 924285843989683`.
2. Instagram Platform OAuth client id must remain the Instagram app id shown in the parent app's Instagram API setup: `1530009762118735`.
3. The app-name mismatch should be handled by renaming the Instagram app display name if Meta Dashboard allows it, or by documenting the relationship in the App Review package.

## Decision Matrix

| Decision | Value |
| --- | --- |
| `META_924_FULL_UNIFICATION_FEASIBLE` | `NO` |
| `STAGING_CAN_USE_924` | `NO` |
| `INVALID_PLATFORM_APP_RESOLVED` | `NO` |
| `RECOMMENDED_CLIENT_ID_FOR_INSTAGRAM_OAUTH` | `1530009762118735` |
| `APP_NAME_CONSISTENCY` | `WARNING` |
| `READY_TO_RESUME_META_RECORDING` | `YES_AFTER_STAGING_ENV_REPAIRED_TO_153` |

## Next Recommended Action

1. Restore Preview / staging env for Instagram OAuth:

```text
META_APP_ID=924285843989683
META_INSTAGRAM_APP_ID=1530009762118735
META_INSTAGRAM_APP_SECRET=<matching Instagram app secret, do not print or commit>
```

2. Redeploy only staging / Preview when deployment quota and release timing are acceptable.
3. Re-run connected-channel evidence.
4. Continue Meta final MP4 recording using the working Instagram app id.
5. If app name consistency must be perfect before recording, update the Instagram app display name from `manychat-auto-reply-IG` to `InboxPilot` inside Meta Developers, if Meta allows this without changing the platform app id.

## Final Status

```text
META_924_FULL_UNIFICATION_FEASIBLE=NO
STAGING_CAN_USE_924=NO
INVALID_PLATFORM_APP_RESOLVED=NO
RECOMMENDED_CLIENT_ID_FOR_INSTAGRAM_OAUTH=1530009762118735
READY_TO_RESUME_META_RECORDING=YES_AFTER_STAGING_ENV_REPAIRED_TO_153
NEXT_REQUIRED_ACTION=Restore staging/Preview Instagram OAuth env to 1530009762118735 with its matching secret, then rerun Meta reviewer-safe recording evidence.
```
