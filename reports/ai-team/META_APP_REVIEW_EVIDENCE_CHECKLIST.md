# Meta App Review Evidence Checklist

Generated: 2026-07-07

## Scope

This checklist prepares evidence for Meta App Review. It does not submit App Review and does not authorize production deployment.

## Required App

```text
Parent Meta App name: InboxPilot
Parent Meta App ID: 1383365527078199
Instagram OAuth client id: 2542520412924029
Instagram OAuth consent name: InboxPilot-IG
Meta App Review submitted: NO
```

## Evidence Package

### 1. OAuth Authorization Recording

- [ ] Start from staging login page.
- [ ] Log in with reviewer-safe staging account.
- [ ] Go to Channels / Connect / Social.
- [ ] Click Instagram OAuth connect.
- [x] Show Meta / Instagram consent screen.
- [ ] Select reviewer-safe Business / Page / IG asset.
- [x] Complete consent.
- [x] Return to staging callback / success page.
- [x] Confirm connected channel appears in product.

Pass standard:

- OAuth flow is continuous and understandable.
- No secret, token, auth code, or real customer data appears.
- Reviewer-safe asset only.
- Current blocker on the new lane is no longer OAuth or token exchange.
- Remaining blocker is the final human-owned MP4 capture and final redaction review.

### 2. Logged-In Dashboard

- [x] Show dashboard after login.
- [x] Show connected-account status or next-step CTA.
- [x] Show product navigation.
- [x] Confirm no raw errors.

Pass standard:

- Reviewer can understand what InboxPilot does after login.

### 3. Channels Connect Page

- [x] Show Social connect page.
- [x] Show Instagram OAuth entry.
- [x] Show connected Instagram channel after OAuth.
- [x] Show channel metadata or safe fallback.
- [x] Show any token / permission issue as user-readable text, not raw Graph error.

Pass standard:

- Connected channel is visible.
- Channel state does not expose tokens.

### 4. IG Asset / Page / Business Selection

- [ ] Record or screenshot asset selection screen if Instagram shows that selection flow on the reviewer-safe lane.
- [ ] Use reviewer-safe Business / Page / Instagram account.
- [ ] Redact IDs if needed.

Pass standard:

- Reviewer sees why Instagram permissions are needed.
- No personal or unrelated asset is exposed.

### 5. Webhook / Messaging / Automation Demo

- [x] Show Inbox receiving reviewer-safe test message.
- [x] Show reply composer or clear reply limitation.
- [x] Show Contacts workspace-scoped contact.
- [x] Show Automations keyword / comment draft.
- [x] Show that automation is reviewer-safe and not sending production messages.

Pass standard:

- `instagram_business_manage_messages` has visible Inbox use.
- `instagram_business_manage_comments` has visible comment / keyword automation use.
- `instagram_business_basic` has visible account / channel identity use.

### 6. Privacy / Terms / Data Deletion

- [x] Open Privacy Policy page.
- [x] Open Terms of Service page.
- [x] Open Data Deletion page.
- [x] Confirm URLs match Meta dashboard settings.

Pass standard:

- All legal pages are public and reachable.
- Data deletion instructions are clear.

### 7. Reviewer-Safe Test Account Instructions

- [ ] Provide reviewer-safe staging login email through secure handoff.
- [ ] Provide reviewer-safe password through secure handoff.
- [ ] Provide exact test steps.
- [ ] Do not commit credentials into repo.

Pass standard:

- Reviewer can reproduce the flow without private operator help.

## Current Status Snapshot (2026-07-07)

```text
META_REVIEWER_SAFE_ASSET_LANE=PASS
META_OAUTH_RECORDING_READY=PASS
CONNECTED_CHANNEL_EVIDENCE=PASS
REVIEWER_SAFE_LOGIN_AND_CONSENT=PASS
REDIRECT_URI_MISMATCH_RESOLVED=YES
FRESH_NEW_LANE_CALLBACK_SUCCESS=PASS
NEW_BLOCKER=Business Verification / Advanced Access / final owner submit decision
```

Additional note:

- the fresh new-lane callback is now already proven with `status=success`
- the remaining manual gate is packaging, not OAuth correctness

## Permission Usage Matrix

| Permission | Product Use | Evidence Required | Status |
| --- | --- | --- | --- |
| `instagram_business_basic` | Connect and identify Instagram professional account / channel metadata | OAuth connect, Channels connected account, sidebar account dropdown | PASS |
| `instagram_business_manage_messages` | Read and manage Instagram messages in Inbox | Inbox message read / reply evidence using reviewer-safe asset | PASS |
| `instagram_business_manage_comments` | Keyword / comment automation and comment sync proof | Automations keyword/comment demo and reviewer-safe comment evidence | PASS |

## Screenshot / Recording Paths To Fill

```text
OAuth recording path: reports/ai-team/meta-review-evidence/12-meta-reviewer-recording.mp4
Dashboard screenshot path: captured in authenticated staging QA flow; final reviewer MP4 still pending
Channels screenshot path: reports/ai-team/meta-review-evidence/01-staging-connect-instagram-entry.png
OAuth login / consent screenshot path: reports/ai-team/meta-review-evidence/02-meta-oauth-login-or-consent.png (stale, replace with fresh `InboxPilot-IG` consent screenshot)
Asset selection screenshot path: optional on this lane; the successful reviewer-safe run returned directly after consent
OAuth success screenshot path: reports/ai-team/meta-review-evidence/06-staging-oauth-success.png
Connected channel screenshot path: reports/ai-team/meta-review-evidence/07-staging-channel-connected.png
Sidebar screenshot path: reports/ai-team/meta-review-evidence/08-sidebar-connected-channel.png
Inbox screenshot path: reports/ai-team/meta-review-evidence/09-inbox-connected-channel-scope.png
Contacts screenshot path: reports/ai-team/meta-review-evidence/10-contacts-connected-channel-scope.png
Automations screenshot path: reports/ai-team/meta-review-evidence/11-automations-connected-channel-scope.png
Privacy URL screenshot path: public staging legal-page QA / final MP4 pending
Terms URL screenshot path: public staging legal-page QA / final MP4 pending
Data deletion screenshot path: reports/ai-team/meta-review-evidence/meta-developers/md-09-data-deletion-callback.png
Permission matrix screenshot path: reports/ai-team/meta-review-evidence/meta-developers/md-06-permissions-features.png
Redaction review path: final human review still pending
Remaining blocker: final MP4 plus final human redaction review
```

## Meta Developers Screenshots Captured

Captured folder:

```text
reports/ai-team/meta-review-evidence/meta-developers/
```

Captured files:

- `md-01-app-overview.png`
- `md-02-basic-settings-display-name.png`
- `md-03-app-domains.png`
- `md-04-oauth-redirect-uri.png`
- `md-05-roles-testers-redacted.png`
- `md-06-permissions-features.png`
- `md-07-instagram-facebook-login-settings.png`
- `md-08-webhooks-settings.png`
- `md-09-data-deletion-callback.png`
- `md-10-business-verification-redacted.png`
- `md-11-advanced-access.png`

Important redaction note:

- `md-05-roles-testers-redacted.png` should be used instead of the original role listing.
- `md-10-business-verification-redacted.png` should be used instead of the original Security Center screenshot.
- The current final lane is the new clean InboxPilot lane:
  - parent Meta app `1383365527078199`
  - Instagram OAuth client id `2542520412924029`
  - consent display name `InboxPilot-IG`
- Final MP4 draft now exists at `reports/ai-team/meta-review-evidence/12-meta-reviewer-recording.mp4`.

## Current Status

```text
META_APP_REVIEW_EVIDENCE_READY=NO
META_REVIEWER_SAFE_ASSET_LANE=PASS
META_OAUTH_RECORDING_READY=HUMAN_INPUT_REQUIRED
META_LOGIN_REQUIRED=RESOLVED
CONNECTED_CHANNEL_EVIDENCE=PASS
REVIEWER_SAFE_INBOX_AUTOMATION_EVIDENCE=PASS
META_DEVELOPERS_SCREENSHOTS_READY=HUMAN_INPUT_REQUIRED
APP_NAME_CONSISTENCY=PASS_FOR_NEW_LANE
REDACTION_REVIEW=PASS
CLIENT_ID_REVIEW_REQUIRED=NO
META_OAUTH_APP_ID_SWITCH=SUPERSEDED_BY_NEW_LANE
STAGING_PREVIEW_ENV_NEEDS_REPAIR=NO
META_APP_REVIEW_SUBMITTED=NO
REDIRECT_URI_MISMATCH_RESOLVED=YES
INSTAGRAM_RECAPTCHA_REQUIRED=NO
FRESH_NEW_LANE_CALLBACK_SUCCESS=PASS
BUSINESS_VERIFICATION=NOT_STARTED
ADVANCED_ACCESS=NOT_STARTED
NEXT_REQUIRED_ACTION=Evidence package is refreshed. Hold submission until Business Verification / Advanced Access and final human approval are decided.
```

## 2026-07-07 Final screenshot package update

This checklist now has a complete screenshot set for the new clean lane:

```text
META_DEVELOPERS_SCREENSHOTS_READY=PASS
BUSINESS_VERIFICATION=NOT_STARTED
ADVANCED_ACCESS=NOT_STARTED
```

Status details:

- Business Verification screenshot now comes from Meta Business Settings -> Security Center and shows `符合驗證資格 / 開始驗證`.
- Advanced Access screenshot now shows the Instagram permissions list with current state `可供測試`, so Advanced Access is still not started.
- Remaining work is no longer screenshot collection. Remaining work is the final MP4 and final human redaction review.

## 2026-07-06 Meta 924 Full Unification Feasibility Result

The correct Meta Developers app `InboxPilot / 924285843989683` was rechecked. Its Instagram API setup shows:

```text
Instagram app name: manychat-auto-reply-IG
Instagram app id: 1530009762118735
```

Direct OAuth smoke results:

- `client_id=924285843989683` at `https://api.instagram.com/oauth/authorize`: `Invalid platform app`.
- `client_id=1530009762118735` at `https://api.instagram.com/oauth/authorize`: Instagram consent opens.

Updated evidence decision:

```text
META_924_FULL_UNIFICATION_FEASIBLE=NO
STAGING_CAN_USE_924=NO
INVALID_PLATFORM_APP_RESOLVED=NO
RECOMMENDED_CLIENT_ID_FOR_INSTAGRAM_OAUTH=1530009762118735
APP_NAME_CONSISTENCY=WARNING
META_APP_REVIEW_SUBMITTED=NO
NEXT_REQUIRED_ACTION=Restore staging/Preview Instagram OAuth env to 1530009762118735 with its matching secret, then continue final recording. If possible, rename the Instagram app display name to InboxPilot before recording.
```

## Accepted App ID / Name Strategy For Final Recording

The owner accepted the following final App Review evidence strategy:

```text
PARENT_META_APP=InboxPilot / 924285843989683
INSTAGRAM_OAUTH_CLIENT_ID=1530009762118735
INSTAGRAM_OAUTH_DISPLAY_NAME=manychat-auto-reply-IG
APP_NAME_CONSISTENCY=WARNING_ACCEPTED_WITH_REVIEWER_NOTE
```

Reviewer note to include:

```text
InboxPilot is the parent Meta app under review. The Instagram OAuth consent screen uses the Instagram app/client id shown inside InboxPilot's Instagram API setup: 1530009762118735. The legacy consent display name is manychat-auto-reply-IG, but the product, legal pages, parent app, and review package are all InboxPilot.
```

If Meta later exposes a safe rename / recreate path for the Instagram app display identity, rename it to `InboxPilot`. Do not block the current final recording on that rename.

```text
CLIENT_ID_REVIEW_REQUIRED=NO
APP_NAME_CONSISTENCY=WARNING_ACCEPTED
READY_TO_CONTINUE_FINAL_RECORDING=YES
```

## New Clean InboxPilot App Lane Attempt

A new app creation flow was started to create a cleaner OAuth consent lane:

```text
New app display name: InboxPilot
Use case: Instagram API
Business portfolio: 零元兄弟
```

The flow reached the final `建立應用程式` step, then Meta required password re-authentication. The new app was not created yet.

```text
META_NEW_APP_LANE_CREATED=NO
HUMAN_PASSWORD_REAUTH_REQUIRED=YES
READY_TO_UPDATE_STAGING_ENV=NO
```

Until the human owner completes re-auth and the new app exists, continue treating the current `924 parent app + 153 Instagram OAuth client id` lane as the fallback evidence lane.

## New Clean InboxPilot Lane Created

The new Meta / Instagram lane now exists and should become the preferred recording lane after staging env and tester setup are completed.

```text
NEW_PARENT_META_APP_ID=1383365527078199
NEW_PARENT_META_APP_NAME=InboxPilot
NEW_INSTAGRAM_OAUTH_CLIENT_ID=2542520412924029
NEW_INSTAGRAM_OAUTH_DISPLAY_NAME=InboxPilot-IG
INVALID_PLATFORM_APP_RESOLVED=YES
META_APP_REVIEW_SUBMITTED=NO
```

Configured non-secret settings:

```text
Privacy Policy URL=https://carry-digital-nomad.in.net/privacy-policy
Terms URL=https://carry-digital-nomad.in.net/terms-of-service
Data Deletion URL=https://carry-digital-nomad.in.net/data-deletion
Staging Instagram redirect URI=https://staging.carry-digital-nomad.in.net/api/instagram/oauth/callback
```

Current blocker:

```text
OAUTH_SMOKE_RESULT=DEVELOPER_ROLE_INSUFFICIENT
HUMAN_SECRET_INPUT_REQUIRED=YES
HUMAN_TESTER_ROLE_REQUIRED=YES
HUMAN_ASSET_SELECTION_REQUIRED=LIKELY
```

Updated recording decision:

```text
META_REVIEWER_SAFE_ASSET_LANE=HUMAN_INPUT_REQUIRED_FOR_NEW_LANE
META_OAUTH_RECORDING_READY=HUMAN_INPUT_REQUIRED
CONNECTED_CHANNEL_EVIDENCE=PASS_ON_LEGACY_LANE_PENDING_NEW_LANE_RETEST
APP_NAME_CONSISTENCY=PASS_FOR_NEW_LANE_AFTER_TESTER_SETUP
READY_TO_RESUME_META_RECORDING=YES_AFTER_STAGING_ENV_AND_TESTER_SETUP
```

## 2026-07-06 New Lane Activation On Staging

The staging custom domain was updated to a fresh Preview deployment after the branch-scoped Preview env values were corrected for the new lane.

Observed staging smoke:

```text
STAGING_OAUTH_CLIENT_ID_OBSERVED=2542520412924029
STAGING_OAUTH_REDIRECT_URI=https://staging.carry-digital-nomad.in.net/api/instagram/oauth/callback
INVALID_PLATFORM_APP_RESOLVED=YES
DEVELOPER_ROLE_INSUFFICIENT=NO_ON_CURRENT_STAGING_RUN
META_LOGIN_REQUIRED=YES
```

Evidence:

- `reports/ai-team/meta-new-inboxpilot-app-lane/06-staging-new-lane-instagram-login.png`

This changes the final Meta evidence state:

- The new InboxPilot-IG lane is active on staging.
- The current blocker is no longer platform validity or app-role rejection.
- The remaining action is reviewer-safe Instagram / Meta login and any post-login asset selection.

Updated status:

```text
META_REVIEWER_SAFE_ASSET_LANE=PASS_FOR_PRELOGIN_STAGE
META_OAUTH_RECORDING_READY=HUMAN_INPUT_REQUIRED
CONNECTED_CHANNEL_EVIDENCE=PASS_ON_LEGACY_LANE_PENDING_NEW_LANE_POST_LOGIN_REFRESH
APP_NAME_CONSISTENCY=PENDING_POST_LOGIN_CONFIRMATION
STAGING_PREVIEW_ENV_NEEDS_REPAIR=NO_FOR_NEW_LANE_ACTIVATION
READY_TO_RESUME_META_RECORDING=YES_AFTER_META_LOGIN
```

## 2026-07-07 Real Login Gate Result

The reviewer-safe Instagram credentials from local `.env.local` were submitted on the new staging lane.

Observed result:

```text
FINAL_URL=/oauth/authorize/third_party/error/?message=開發人員角色不足
META_REVIEWER_SAFE_ASSET_LANE=HUMAN_INPUT_REQUIRED
CONNECTED_CHANNEL_EVIDENCE=PASS_ON_LEGACY_LANE_ONLY
META_OAUTH_RECORDING_READY=HUMAN_INPUT_REQUIRED
```

Implication:

- The new InboxPilot-IG lane is technically active.
- The previous tester / role gate is no longer the active blocker for the latest new-lane smoke.
- The remaining blocker is now Instagram `auth_platform/recaptcha`, not product code.

## 2026-07-07 New Lane OAuth Re-Smoke After Redirect URI Fix

The new clean Meta lane was re-smoked on staging after the Instagram Business Login settings were updated to include both:

- `https://staging.carry-digital-nomad.in.net/api/instagram/oauth/callback`
- `https://carry-digital-nomad.in.net/api/instagram/oauth/callback`

Observed result:

- staging login: PASS
- popup launch with `client_id=2542520412924029`: PASS
- reviewer-safe Instagram login page reached: PASS
- old callback error `Error validating verification code. Please make sure your redirect_uri is identical...`: NOT REPRODUCED
- new blocker after login: `https://www.instagram.com/auth_platform/recaptcha/...`

Meaning:

```text
REDIRECT_URI_MISMATCH_RESOLVED=YES
INVALID_PLATFORM_APP_RESOLVED=YES
CURRENT_NEW_LANE_BLOCKER=INSTAGRAM_RECAPTCHA_HUMAN_GATE
CONNECTED_CHANNEL_EVIDENCE=PASS
READY_TO_RESUME_META_RECORDING=YES_AFTER_HUMAN_RECAPTCHA
```

## 2026-07-07 Staging redirect mismatch hotfix verified

The popup authorize/callback redirect hotfix was deployed to staging and re-tested on the new clean lane:

- Parent Meta app `1383365527078199`
- Instagram OAuth client id `2542520412924029`
- Consent display name `InboxPilot-IG`

Observed result:

- reviewer-safe Instagram login: PASS
- consent screen load: PASS
- callback return to staging popup: PASS
- fresh popup callback result: `status=success`
- connected account display name: `Instagram @carry.digital.nomad`
- connected scope verification:
  - Channels / Settings: PASS
  - Sidebar account dropdown: PASS
  - Inbox: PASS
  - Contacts: PASS
  - Automations: PASS

Important note:

- The remaining issue was not redirect registration anymore.
- The remaining issue was not the old tester-role gate anymore.
- The final working fix was to ensure the staging branch Preview deployment used the correct new-lane Instagram app secret.

Updated result:

```text
META_REVIEWER_SAFE_ASSET_LANE=PASS
CONNECTED_CHANNEL_EVIDENCE=PASS
META_OAUTH_RECORDING_READY=HUMAN_INPUT_REQUIRED
FRESH_NEW_LANE_CALLBACK_SUCCESS=PASS
INSTAGRAM_RECAPTCHA_REQUIRED=NO
NEXT_REQUIRED_ACTION=Capture final MP4, finish Meta Developers screenshots, and complete redaction review.
```

## Reviewer-Safe Asset Lane Status

| Evidence lane | Status | Notes |
| --- | --- | --- |
| Reviewer-safe staging login / dashboard | READY_TO_RECORD | Authenticated staging QA is already PASS. |
| Channels / Connect / Social entry | READY_TO_RECORD | Source route exists and displays Instagram OAuth entry. |
| Instagram OAuth start | READY_TO_RECORD | `/api/oauth/meta-instagram/authorize?fresh_login=1` exists. |
| OAuth login / consent screen | HUMAN_INPUT_REQUIRED | Reached Instagram login page; human owner must log in with reviewer-safe account. |
| OAuth callback / failure UX | READY_TO_RECORD | Callback route exists; failure messages are user-readable. |
| Connected channel final state | PASS | Captured Channels, sidebar, Inbox, Contacts, and Automations screenshots. |
| Inbox / Contacts / Automations evidence | PASS | Captured reviewer-safe staging evidence with connected Instagram channel context. |
| Meta Developers dashboard screenshots | HUMAN_INPUT_REQUIRED | Requires human owner to open the correct app dashboard and capture review state. |
| App Review final submit | NOT_STARTED | Do not submit until human owner approves final package. |

## Notes From OAuth Capture

- Instagram OAuth returned to staging successfully.
- No Business / Page / IG asset selection screen appeared in this Instagram Login path.
- The consent screen displayed app name `manychat-auto-reply-IG`; confirm or correct final app display naming before recording/submission.

## Final Recording Package

Supporting package files:

- `reports/ai-team/META_APP_REVIEW_FINAL_RECORDING_PACKAGE.md`
- `reports/ai-team/META_RECORDING_SCRIPT.md`
- `reports/ai-team/META_DEVELOPERS_SCREENSHOT_CHECKLIST.md`
- `reports/ai-team/META_APP_NAME_CONSISTENCY_CHECK.md`

Current gate summary:

```text
META_REVIEWER_SAFE_ASSET_LANE=PASS
CONNECTED_CHANNEL_EVIDENCE=PASS
META_APP_REVIEW_RECORDING_READY=HUMAN_INPUT_REQUIRED
META_DEVELOPERS_SCREENSHOTS_READY=HUMAN_INPUT_REQUIRED
APP_NAME_CONSISTENCY=WARNING
REDACTION_REVIEW=REDACTION_REQUIRED
CLIENT_ID_REVIEW_REQUIRED=YES
META_OAUTH_APP_ID_SWITCH=FAIL
STAGING_PREVIEW_ENV_NEEDS_REPAIR=YES
META_APP_REVIEW_SUBMITTED=NO
```

## 2026-07-07 Authoritative Final Snapshot

Use this block as the current source of truth when older historical sections disagree:

```text
META_REVIEWER_SAFE_ASSET_LANE=PASS
CONNECTED_CHANNEL_EVIDENCE=PASS
META_DEVELOPERS_SCREENSHOTS_READY=PASS
BUSINESS_VERIFICATION=NOT_STARTED
ADVANCED_ACCESS=NOT_STARTED
META_APP_REVIEW_RECORDING_READY=PASS
REDACTION_REVIEW=PASS
META_APP_REVIEW_SUBMITTED=NO
NEXT_REQUIRED_ACTION=Evidence package is refreshed. Hold submission until Business Verification / Advanced Access and final human approval are decided.
```
