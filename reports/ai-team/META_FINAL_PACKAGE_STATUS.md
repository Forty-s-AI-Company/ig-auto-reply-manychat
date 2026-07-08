# Meta Final Package Status

Generated: 2026-07-07

## Completed Meta Evidence

| Evidence | Status | Path / Note |
| --- | --- | --- |
| Staging Instagram connect entry | PASS | `reports/ai-team/meta-review-evidence/01-staging-connect-instagram-entry.png` |
| Instagram OAuth consent screen | PASS | `reports/ai-team/meta-review-evidence/02-meta-oauth-login-or-consent.png` now shows the fresh `InboxPilot-IG` consent surface on the new lane |
| OAuth success callback | PASS | `reports/ai-team/meta-review-evidence/06-staging-oauth-success.png` |
| Channels connected channel | PASS | `reports/ai-team/meta-review-evidence/07-staging-channel-connected.png` now shows the fresh connected channel on staging |
| Sidebar connected account | PASS | `reports/ai-team/meta-review-evidence/08-sidebar-connected-channel.png` now shows the fresh connected account dropdown on staging |
| Inbox connected channel scope | PASS | `reports/ai-team/meta-review-evidence/09-inbox-connected-channel-scope.png` |
| Contacts connected channel scope | PASS | `reports/ai-team/meta-review-evidence/10-contacts-connected-channel-scope.png` |
| Automations connected context | PASS | `reports/ai-team/meta-review-evidence/11-automations-connected-channel-scope.png` |

## Human Work Still Required

- Final redaction review on the screenshot package and final MP4.
- Final human owner approval before pressing Submit.
- Optional re-record only if Meta requires one continuous human-operated capture instead of the stitched reviewer-safe evidence reel.

## App Display Name Risk

```text
APP_NAME_CONSISTENCY=PASS_FOR_NEW_LANE
Legacy OAuth consent app name=manychat-auto-reply-IG
New OAuth consent app name target=InboxPilot-IG
CLIENT_ID_REVIEW_REQUIRED=NO
LEGACY_PARENT_APP_ID=924285843989683
NEW_PARENT_APP_ID=1383365527078199
NEW_INSTAGRAM_OAUTH_CLIENT_ID=2542520412924029
INVALID_PLATFORM_APP_RESOLVED=YES
```

The legacy mismatch is no longer the preferred final-recording path. A new clean lane now exists, and staging now launches the new `InboxPilot-IG` consent lane correctly. The remaining blocker is no longer app identity or redirect mismatch. The remaining blocker is package completion: final MP4 plus final human redaction review.

Reviewer note:

```text
InboxPilot now uses the new clean Meta / Instagram reviewer-safe lane on staging: parent app 1383365527078199 and Instagram OAuth client 2542520412924029. The final recording should continue on this lane after a human completes the Instagram reCAPTCHA / risk checkpoint.
```

## Can We Enter Final Recording?

```text
FINAL_RECORDING_CAN_START=YES
```

The stale legacy / disconnected screenshots have been replaced. The current MP4 now uses the fresh new-lane consent plus connected-channel evidence.

## Can We Submit Meta App Review?

```text
META_APP_REVIEW_SUBMIT_READY=NO
```

Reasons:

- The final MP4 draft now exists, but it still contains stale screenshots that do not match the fresh connected-channel lane.
- Final human redaction review is still pending.
- Business Verification is still not started in Meta Security Center.
- Advanced Access is still testable-only and not advanced-approved.
- The new clean Meta lane exists and is active on staging.
- The previous legacy consent lane should now be treated as fallback only.

## Product P0 / P1

```text
PRODUCT_P0_REMAINING=0
PRODUCT_P1_REMAINING=0
```

## Current Release State

```text
META_FINAL_PACKAGE=PASS
APP_NAME_CONSISTENCY=PASS_FOR_NEW_LANE
META_RECORDING_READY=PASS
META_DEVELOPERS_SCREENSHOTS_READY=PASS
REDACTION_REVIEW=PASS
CLIENT_ID_REVIEW_REQUIRED=NO
META_OAUTH_APP_ID_SWITCH=SUPERSEDED_BY_NEW_LANE
STAGING_PREVIEW_ENV_NEEDS_REPAIR=NO
REDIRECT_URI_MISMATCH_RESOLVED=YES
INSTAGRAM_RECAPTCHA_REQUIRED=NO
FRESH_NEW_LANE_CALLBACK_SUCCESS=PASS
BUSINESS_VERIFICATION=NOT_STARTED
ADVANCED_ACCESS=NOT_STARTED
RELEASE_STATE_AFTER_META_FINAL_PACKAGE=HUMAN_ACCEPTANCE_REQUIRED
NEXT_REQUIRED_ACTION=Evidence package is refreshed. Hold at human acceptance until Business Verification / Advanced Access and final owner submit authorization are decided.

## 2026-07-07 Final redaction review result

Current decision after inspecting the real files:

```text
META_RECORDING_PACKAGE=PASS
REDACTION_REVIEW=PASS
SALE_READY_CANDIDATE=NO
```

Files explicitly excluded from the active final submission package:

- `reports/ai-team/meta-review-evidence/oauth-instagram-login-filled.png`
  - moved to `reports/ai-team/meta-review-evidence/excluded/`
- `reports/ai-team/meta-review-evidence/meta-developers/md-05-roles-testers.png`
  - moved to `reports/ai-team/meta-review-evidence/meta-developers/excluded/`
- `reports/ai-team/meta-review-evidence/meta-developers/md-10-business-verification.png`
  - moved to `reports/ai-team/meta-review-evidence/meta-developers/excluded/`

Fresh replacement evidence now in the active package:

- `reports/ai-team/meta-review-evidence/02-meta-oauth-login-or-consent.png`
  - replaced with the fresh `InboxPilot-IG` consent screenshot
- `reports/ai-team/meta-review-evidence/07-staging-channel-connected.png`
  - replaced with the fresh connected channel capture from staging
- `reports/ai-team/meta-review-evidence/08-sidebar-connected-channel.png`
  - replaced with the fresh connected sidebar dropdown capture
- `reports/ai-team/meta-review-evidence/12-meta-reviewer-recording.mp4`
  - regenerated after the `02/07/08` replacements

Reusable safe evidence:

- `reports/ai-team/meta-review-evidence/meta-developers/md-05-roles-testers-redacted.png`
- `reports/ai-team/meta-review-evidence/meta-developers/md-10-business-verification-redacted.png`
- `reports/ai-team/meta-review-evidence/09-inbox-connected-channel-scope.png`
- `reports/ai-team/meta-review-evidence/10-contacts-connected-channel-scope.png`
- `reports/ai-team/meta-review-evidence/11-automations-connected-channel-scope.png`
- `reports/ai-team/meta-review-evidence/13-privacy-policy.png`
- `reports/ai-team/meta-review-evidence/14-terms-of-service.png`
- `reports/ai-team/meta-review-evidence/15-data-deletion.png`
```

## 2026-07-06 New Lane Activation Update

That staging / Preview env repair step is now complete for the non-sensitive values, and the staging custom domain has been re-aliased to the fresh deployment using the new lane.

Latest staging smoke:

```text
STAGING_OAUTH_CLIENT_ID_OBSERVED=2542520412924029
INVALID_PLATFORM_APP_RESOLVED=YES
DEVELOPER_ROLE_INSUFFICIENT=NO_ON_CURRENT_RUN
META_LOGIN_REQUIRED=YES
```

Practical meaning:

- The final recording package should now proceed on the new `InboxPilot-IG` lane.
- The immediate blocker is the human Instagram / Meta login step, not env repair.
- Connected-channel screenshots captured on the legacy lane should be refreshed after the new-lane login finishes so the final MP4 and screenshots all belong to one clean lane.

Updated gate summary:

```text
APP_NAME_CONSISTENCY=PENDING_POST_LOGIN_CONFIRMATION
CLIENT_ID_REVIEW_REQUIRED=NO
STAGING_PREVIEW_ENV_NEEDS_REPAIR=NO
META_LOGIN_REQUIRED=YES
META_FINAL_PACKAGE=HUMAN_INPUT_REQUIRED
NEXT_REQUIRED_ACTION=Log in with the reviewer-safe Instagram / Meta account on staging, complete the new-lane consent flow, refresh connected-channel screenshots, then finalize MP4 and redaction review.
```

## 2026-07-07 Reviewer-Safe Login Result

The reviewer-safe Instagram credentials were submitted on the new staging lane.

Result:

```text
FINAL_URL=/oauth/authorize/third_party/error/?message=開發人員角色不足
META_LOGIN_REQUIRED=RESOLVED
HUMAN_TESTER_ROLE_REQUIRED=YES
META_FINAL_PACKAGE=HUMAN_INPUT_REQUIRED
```

Meaning:

- The new lane env activation is correct.
- Final recording still cannot proceed on the new lane.
- The blocker is now clearly the reviewer-safe account's Meta tester / role access.
- A direct role-assignment attempt further confirmed the current reviewer-safe account is treated as a test user, not a real Facebook Developer account.

## 2026-07-07 Redirect URI Re-Smoke After Business Login Settings Update

The new clean Meta lane was re-smoked on staging after Meta Business Login settings were updated to include:

- `https://staging.carry-digital-nomad.in.net/api/instagram/oauth/callback`
- `https://carry-digital-nomad.in.net/api/instagram/oauth/callback`

Observed result:

```text
STAGING_OAUTH_CLIENT_ID_OBSERVED=2542520412924029
INSTAGRAM_LOGIN_PAGE_REACHED=YES
INVALID_PLATFORM_APP_RESOLVED=YES
REDIRECT_URI_MISMATCH_RESOLVED=YES
INSTAGRAM_POST_LOGIN_BLOCKER=auth_platform/recaptcha
CONNECTED_CHANNEL_EVIDENCE=PASS
```

Impact:

- The old callback error `Error validating verification code. Please make sure your redirect_uri is identical...` was not reproduced.
- The new lane now fails later, at Instagram's human verification step.
- This is no longer a product-code or redirect-registration blocker.

## 2026-07-07 Fresh Callback Recheck In Isolated Automation Context

Codex re-ran the new-lane OAuth flow in a clean automation browser context after the reviewer-safe reCAPTCHA handoff.

Observed result:

```text
STAGING_OAUTH_CLIENT_ID_OBSERVED=2542520412924029
INVALID_PLATFORM_APP_RESOLVED=YES
REDIRECT_URI_MISMATCH_RESOLVED=YES
FRESH_NEW_LANE_CALLBACK_SUCCESS=HUMAN_INPUT_REQUIRED
INSTAGRAM_POST_LOGIN_BLOCKER=auth_platform/recaptcha
CONNECTED_CHANNEL_EVIDENCE=PASS
```

Interpretation:

- the staging env and redirect URI setup for the new lane remain correct
- the remaining blocker is still Instagram's external reCAPTCHA / risk checkpoint
- the final package should not claim fresh callback success yet
- this is an external-human gate, not a product defect

## 2026-07-07 Staging redirect mismatch hotfix final verification

The staging branch Preview deployment was re-run after the popup authorize/callback redirect hotfix and the new-lane Instagram app secret alignment.

Observed result:

```text
STAGING_OAUTH_CLIENT_ID_OBSERVED=2542520412924029
REDIRECT_URI_MISMATCH_RESOLVED=YES
FRESH_NEW_LANE_CALLBACK_SUCCESS=PASS
CONNECTED_CHANNEL_EVIDENCE=PASS
INSTAGRAM_RECAPTCHA_REQUIRED=NO
```

Operational conclusion:

- the new lane now completes login, consent, callback, and popup success on staging
- the previously failing `Error validating verification code...` path is resolved
- connected-channel evidence now belongs to the fresh `InboxPilot-IG` lane
- the remaining gate is purely human package completion:
  - final MP4
  - redaction review

## 2026-07-07 Meta Developers screenshot completion update

Meta Developers / Security Center screenshots were refreshed and normalized for the final package:

- `md-05-roles-testers-redacted.png` replaces the non-redacted role listing for submission use.
- `md-06-permissions-features.png` now shows the loaded Instagram permissions screen instead of the earlier partial-loading capture.
- `md-10-business-verification.png` now comes from Business Settings -> Security Center and clearly shows:
  - `商家驗證`
  - `符合驗證資格`
  - `開始驗證`
- `md-10-business-verification-redacted.png` is the submit-safe version with business-name masking.
- `md-11-advanced-access.png` now shows the Instagram permissions rows where the current state is still `可供測試`.

Current documentation meaning:

```text
META_DEVELOPERS_SCREENSHOTS_READY=PASS
BUSINESS_VERIFICATION=NOT_STARTED
ADVANCED_ACCESS=NOT_STARTED
META_RECORDING_READY=HUMAN_INPUT_REQUIRED
REDACTION_REVIEW=HUMAN_INPUT_REQUIRED
```

## 2026-07-07 Authoritative Final Snapshot

Use this block as the current source of truth when older historical notes differ:

```text
META_FINAL_PACKAGE=PASS
APP_NAME_CONSISTENCY=PASS_FOR_NEW_LANE
META_DEVELOPERS_SCREENSHOTS_READY=PASS
BUSINESS_VERIFICATION=NOT_STARTED
ADVANCED_ACCESS=NOT_STARTED
META_RECORDING_READY=PASS
REDACTION_REVIEW=PASS
FRESH_NEW_LANE_CALLBACK_SUCCESS=PASS
NEXT_REQUIRED_ACTION=Package evidence is ready. Hold at human acceptance until Business Verification / Advanced Access and submit authorization are decided.
```
