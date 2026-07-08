# Meta App Name Consistency Check

Generated: 2026-07-06

## Scope

This check records app naming consistency for Meta App Review preparation only. It does not modify Meta Dashboard settings and does not submit App Review.

## Observed Names

| Surface | Observed name | Status |
| --- | --- | --- |
| Product / README | `InboxPilot` | PASS |
| Staging website brand | `InboxPilot` | PASS |
| Privacy Policy | `InboxPilot` | PASS |
| Terms of Service | `InboxPilot` | PASS |
| Data Deletion page | `InboxPilot` | PASS |
| Canonical AI source of truth | `InboxPilot`, App ID `924285843989683` | PASS |
| Meta App Dashboard app display name | `InboxPilot` captured from Meta Developers page title / navigation | PASS |
| Instagram OAuth consent screen | `manychat-auto-reply-IG` | WARNING |
| Instagram OAuth / consent app id | `1530009762118735` from captured OAuth evidence / historical runbook | WARNING |
| Meta Developers app id under review | `924285843989683` | PASS |

## Assessment

The product, legal pages, and project documentation consistently use `InboxPilot`. The OAuth consent screen shown during the reviewer-safe Instagram Login flow displays `manychat-auto-reply-IG`.

The current evidence also shows an app-id lane mismatch that must be reviewed before final recording:

- Meta Developers app under review: `InboxPilot`, App ID `924285843989683`.
- Instagram OAuth consent / API setup evidence: `manychat-auto-reply-IG`, App ID `1530009762118735`.

This may be an expected Instagram product app identity associated with the InboxPilot review lane, but it should not be assumed. The final recording should either use a consent screen branded as `InboxPilot`, or explicitly document why `manychat-auto-reply-IG` / `1530009762118735` is the correct Instagram OAuth app for the submitted InboxPilot review package.

This is not a product P0/P1 code bug, but it is a review-package risk because reviewers may see a brand mismatch between:

- Staging product: `InboxPilot`
- Legal pages: `InboxPilot`
- App Review package: `InboxPilot`
- OAuth consent: `manychat-auto-reply-IG`

## Recommendation

Use one public-facing app display name before final recording/submission:

```text
RECOMMENDED_APP_DISPLAY_NAME=InboxPilot
```

If Meta Dashboard allows editing the display name without breaking the app review path, update the consent-facing app name to `InboxPilot` before the final MP4 recording. If the historical app name must remain during testing, explicitly mention the legacy name in reviewer notes and show that legal pages and app ownership match the same app.

## 2026-07-06 Staging Switch Attempt

An attempt was made to configure staging Instagram OAuth to use the InboxPilot app id `924285843989683`.

Result:

```text
META_OAUTH_APP_ID_SWITCH=FAIL
ERROR=Invalid platform app
```

The staging alias was rolled back to the previous working Preview deployment. This confirms that `924285843989683` cannot simply replace `1530009762118735` for the current Instagram OAuth flow without additional Meta product / platform configuration.

See:

```text
reports/ai-team/META_OAUTH_APP_ID_SWITCH_ATTEMPT_REPORT.md
```

## 2026-07-06 Meta 924 Platform Audit

The correct Meta Developers app was opened:

```text
App name: InboxPilot
App ID: 924285843989683
```

Dashboard evidence confirms the app name and parent app id. The dashboard also shows the Instagram business use case.

However, the Instagram Business API Setup / Permissions / Webhooks panels did not fully render in the in-app browser, and the previous staging OAuth test still failed with `Invalid platform app`.

Conclusion:

- The Meta dashboard display name is already aligned with `InboxPilot`.
- The OAuth consent name mismatch is not resolved by directly switching `META_INSTAGRAM_APP_ID` to `924285843989683`.
- The remaining mismatch is now an Instagram platform identity / setup issue, not a product website branding issue.

See:

```text
reports/ai-team/META_924_INSTAGRAM_PLATFORM_SETUP_AUDIT.md
reports/ai-team/meta-924-platform-audit/
```

## Status

```text
APP_NAME_CONSISTENCY=WARNING_ACCEPTED
RECOMMENDED_APP_DISPLAY_NAME=InboxPilot
NEEDS_META_DASHBOARD_RENAME=OPTIONAL
META_DASHBOARD_DISPLAY_NAME=PASS
OAUTH_CONSENT_DISPLAY_NAME=WARNING
CLIENT_ID_REVIEW_REQUIRED=NO
META_APP_UNDER_REVIEW=924285843989683
OAUTH_CONSENT_APP_ID_OBSERVED=1530009762118735
META_OAUTH_APP_ID_SWITCH=FAIL
META_924_PLATFORM_AUDIT=HUMAN_ACTION_REQUIRED
INSTAGRAM_PLATFORM_ID_CONFIRMED=NO
STAGING_PREVIEW_ENV_NEEDS_REPAIR=YES
NEXT_REQUIRED_ACTION=Restore working Instagram app env for future staging deployments, or configure 924285843989683 as a valid Instagram platform app before final recording. Do not auto-submit Meta App Review.
```

## 2026-07-06 Full Unification Feasibility Update

The name mismatch is now confirmed to come from the Instagram platform app nested under the correct `InboxPilot / 924285843989683` parent app.

Meta Developers Instagram API setup showed:

```text
Parent app: InboxPilot / 924285843989683
Instagram app name: manychat-auto-reply-IG
Instagram app id: 1530009762118735
```

Therefore:

- The website and parent Meta app already align to `InboxPilot`.
- The Instagram OAuth consent still shows `manychat-auto-reply-IG` because the valid Instagram Platform OAuth client id is `1530009762118735`.
- Switching `META_INSTAGRAM_APP_ID` to `924285843989683` is not a valid fix; it produces `Invalid platform app`.

Updated recommendation:

```text
APP_NAME_CONSISTENCY=WARNING
META_DASHBOARD_DISPLAY_NAME=PASS
OAUTH_CONSENT_DISPLAY_NAME=WARNING
META_924_FULL_UNIFICATION_FEASIBLE=NO
RECOMMENDED_CLIENT_ID_FOR_INSTAGRAM_OAUTH=1530009762118735
NEXT_REQUIRED_ACTION=If Meta allows it, rename the Instagram app display name to InboxPilot while keeping client_id 1530009762118735. Otherwise document the parent/Instagram-app relationship in reviewer notes.
```

## 2026-07-06 Owner Decision

The owner accepted the lower-risk review strategy:

1. Continue using `1530009762118735` as `META_INSTAGRAM_APP_ID`.
2. Document in the App Review package:
   - Parent Meta App is `InboxPilot / 924285843989683`.
   - Instagram OAuth client id is `1530009762118735`, as shown inside the parent app's Instagram API setup.
3. If a safe Meta support / deeper Instagram setup path later allows renaming or recreating the Instagram app identity, use that path later. Do not block current final recording on it.

Updated decision:

```text
APP_NAME_CONSISTENCY=WARNING_ACCEPTED
CLIENT_ID_REVIEW_REQUIRED=NO
NEEDS_META_DASHBOARD_RENAME=OPTIONAL
REVIEWER_NOTE_REQUIRED=YES
READY_TO_CONTINUE_FINAL_RECORDING=YES
```

## 2026-07-06 New InboxPilot App Lane Attempt

The owner later selected option B: create a new clean Meta App / Instagram OAuth lane so the consent display name can start as `InboxPilot`.

Creation wizard progress:

```text
App name: InboxPilot
Use case: Instagram API / 管理 Instagram 的訊息和內容
Business portfolio: 零元兄弟
```

The final create action was blocked by Meta password re-authentication. No password was entered by Codex.

```text
META_NEW_APP_LANE_CREATED=NO
HUMAN_PASSWORD_REAUTH_REQUIRED=YES
NEW_PARENT_META_APP_ID=UNKNOWN
NEW_INSTAGRAM_OAUTH_CLIENT_ID=UNKNOWN
OAUTH_CONSENT_DISPLAY_NAME=UNKNOWN
READY_TO_UPDATE_STAGING_ENV=NO
```

The accepted current lane remains valid as a fallback until the new lane is completed.

## 2026-07-06 New InboxPilot App Lane Created

The human owner completed Meta password re-authentication and the clean InboxPilot lane was created.

Observed in Meta Developers:

```text
Parent Meta App name: InboxPilot
Parent Meta App ID: 1383365527078199
Instagram app display name: InboxPilot-IG
Instagram OAuth client ID: 2542520412924029
```

Basic App Review URLs were saved:

```text
Privacy Policy URL: https://carry-digital-nomad.in.net/privacy-policy
Terms URL: https://carry-digital-nomad.in.net/terms-of-service
Data Deletion URL: https://carry-digital-nomad.in.net/data-deletion
Instagram redirect URI: https://staging.carry-digital-nomad.in.net/api/instagram/oauth/callback
```

A no-consent OAuth smoke using `client_id=2542520412924029` no longer returned `Invalid platform app`. It returned `開發人員角色不足`, which means the new app id is recognized but the reviewer-safe Meta / Instagram account still needs app role / tester access.

Updated naming status:

```text
APP_NAME_CONSISTENCY=PASS_FOR_NEW_LANE_AFTER_TESTER_SETUP
OAUTH_CONSENT_DISPLAY_NAME=InboxPilot-IG
NEW_PARENT_META_APP_ID=1383365527078199
NEW_INSTAGRAM_OAUTH_CLIENT_ID=2542520412924029
INVALID_PLATFORM_APP_RESOLVED=YES
READY_TO_UPDATE_STAGING_ENV=YES_AFTER_SECRET_AND_TESTER_SETUP
```

## 2026-07-06 New Lane Activated On Staging

Staging had still been serving the older deployment and older OAuth lane. After the branch-scoped Preview env values were updated for `staging`, the latest Preview was redeployed, and `staging.carry-digital-nomad.in.net` was re-aliased to the fresh deployment.

Verified smoke result:

```text
STAGING_OAUTH_CLIENT_ID_OBSERVED=2542520412924029
STAGING_OAUTH_REDIRECT_URI=https://staging.carry-digital-nomad.in.net/api/instagram/oauth/callback
INVALID_PLATFORM_APP_RESOLVED=YES
DEVELOPER_ROLE_INSUFFICIENT=NO_ON_CURRENT_RUN
```

The current staging flow now reaches the Instagram login page on the new lane. The exact post-login consent label still needs to be confirmed after the reviewer-safe Instagram / Meta account signs in, but the lane itself is now aligned to the new InboxPilot app family instead of the legacy `1530009762118735` client id.

Updated status:

```text
APP_NAME_CONSISTENCY=PENDING_POST_LOGIN_CONFIRMATION
NEW_LANE_ACTIVE_ON_STAGING=YES
READY_TO_RESUME_META_RECORDING=YES_AFTER_META_LOGIN
```

## 2026-07-07 Real Login Result

The reviewer-safe Instagram credentials were submitted on the new staging lane. Instagram then redirected to:

```text
/oauth/authorize/third_party/error/?message=開發人員角色不足
```

This means:

- The lane switch itself is correct.
- App-name confirmation still cannot be completed because the flow never reaches the consent surface after login.
- The remaining blocker is Meta role/tester access for the reviewer-safe account.

Updated status:

```text
APP_NAME_CONSISTENCY=PENDING_POST_ROLE_GATE
NEW_LANE_ACTIVE_ON_STAGING=YES
READY_TO_RESUME_META_RECORDING=NO
HUMAN_TESTER_ROLE_REQUIRED=YES
```
