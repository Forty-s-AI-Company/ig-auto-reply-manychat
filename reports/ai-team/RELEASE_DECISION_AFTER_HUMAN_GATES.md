# Release Decision After Human Gates

Generated: 2026-07-07

```text
PRODUCT_CODE_READY=YES
LOCAL_VALIDATION_READY=YES
STAGING_BASIC_READY=YES
AUTHENTICATED_STAGING_READY=YES
EXTERNAL_GATES_READY=NO
SALE_READY_CANDIDATE=NO
CURRENT_RELEASE_STATE=HUMAN_ACCEPTANCE_REQUIRED
PAYUNI_SANDBOX_EVIDENCE=PASS
PAYUNI_PRODUCTION_SWITCH=NOT_STARTED_HUMAN_GATE
META_REVIEWER_SAFE_ASSET_LANE=PASS
META_APP_REVIEW_RECORDING=PASS
META_DEVELOPERS_SCREENSHOTS=PASS
APP_NAME_CONSISTENCY=PASS_FOR_NEW_LANE
REDACTION_REVIEW=PASS
CLIENT_ID_REVIEW_REQUIRED=NO
META_OAUTH_APP_ID_SWITCH=FAIL
STAGING_PREVIEW_ENV_NEEDS_REPAIR=NO
META_LOGIN_REQUIRED=RESOLVED
BUSINESS_VERIFICATION=NOT_STARTED
ADVANCED_ACCESS=NOT_STARTED
PRODUCT_P0_REMAINING=0
PRODUCT_P1_REMAINING=0
META_924_FULL_UNIFICATION_FEASIBLE=NO
STAGING_CAN_USE_924=NO
INVALID_PLATFORM_APP_RESOLVED=YES
RECOMMENDED_CLIENT_ID_FOR_INSTAGRAM_OAUTH=2542520412924029
REDIRECT_URI_MISMATCH_RESOLVED=YES
INSTAGRAM_RECAPTCHA_REQUIRED=NO
READY_TO_RESUME_META_RECORDING=YES
META_NEW_APP_LANE_CREATED=YES
HUMAN_PASSWORD_REAUTH_REQUIRED=NO
INSTAGRAM_LOGIN_AND_CONSENT=PASS
INSTAGRAM_CALLBACK_TOKEN_EXCHANGE=PASS
INSTAGRAM_CALLBACK_FAIL_REASON=resolved after staging branch secret alignment
FRESH_NEW_LANE_CALLBACK_SUCCESS=PASS
```

## Evidence Summary

| Area | Status | Evidence |
| --- | --- | --- |
| Product code | READY | No confirmed product P0/P1 remains in latest evidence. |
| Local validation | READY | lint/build/test/reviewer E2E pass. |
| Public staging | READY | Health and public browser smoke pass. |
| Authenticated staging | READY | Reviewer-safe login, fresh new-lane OAuth callback success, and connected-channel scope all pass on staging. |
| External integration gates | PARTIAL | PayUNI Sandbox evidence and Meta reviewer-safe connected channel evidence are collected. The Meta MP4 and screenshot package are refreshed and redaction-reviewed; Business Verification and Advanced Access remain not started. |

## Human Gates Required Before Sale-Ready Candidate

- [x] Reviewer-safe IG / Meta connected channel evidence.
- [x] PayUNI Sandbox app-side checkout / return / entitlement evidence.
- [x] PayUNI Sandbox merchant back-office transaction screenshot.
- [ ] Meta App Review final redaction review and package sign-off.
- [ ] Business Verification / Advanced Access status confirmed.
- [ ] Human owner accepts remaining risks.

## PayUNI Sandbox Evidence Snapshot

```text
PAYUNI_SANDBOX_CHECKOUT_RETURN_ENTITLEMENT=PASS
PAYUNI_SANDBOX_MERCHANT_TRADE_NO=IG1783269991397IRV10ADFA1A2
PAYUNI_MERCHANT_BACKOFFICE_EVIDENCE=PASS
PAYUNI_SANDBOX_EVIDENCE=PASS
PAYUNI_PRODUCTION_SWITCH=NOT_STARTED_HUMAN_GATE
```

Evidence paths:

- `reports/ai-team/payuni-sandbox-evidence/04-payuni-sandbox-before-card-entry.png`
- `reports/ai-team/payuni-sandbox-evidence/05-return-or-payment-result.png`
- `reports/ai-team/payuni-sandbox-evidence/06-billing-after-payment.png`
- `reports/ai-team/payuni-sandbox-evidence/07-payuni-merchant-search-result.png`
- `reports/ai-team/payuni-sandbox-evidence/08-payuni-merchant-transaction-detail.png`
- `reports/ai-team/payuni-sandbox-evidence/09-payuni-merchant-payment-status.png`
- `reports/ai-team/payuni-sandbox-evidence/payment-run-result.json`

PayUNI Sandbox merchant evidence:

- Host / environment: `sandbox.payuni.com.tw`, visible Sandbox / test environment banner.
- Merchant trade no `IG1783269991397IRV10ADFA1A2` found in merchant back office.
- Status: `已付款 / 請款成功`.
- Amount: `NT$199`.

Still required:

- Reviewer-safe IG / Meta connected channel evidence.
- Meta App Review recording / screenshot package.
- Business Verification / Advanced Access status confirmation.

## Meta Reviewer-Safe Asset Lane Snapshot

```text
META_REVIEWER_SAFE_ASSET_LANE=PASS
META_OAUTH_RECORDING_READY=HUMAN_INPUT_REQUIRED
CONNECTED_CHANNEL_EVIDENCE=PASS
REVIEWER_SAFE_INBOX_AUTOMATION_EVIDENCE=PASS
META_LOGIN_REQUIRED=RESOLVED
META_APP_REVIEW_SUBMITTED=NO
BUSINESS_VERIFICATION=NOT_STARTED
ADVANCED_ACCESS=NOT_STARTED
INSTAGRAM_LOGIN_AND_CONSENT=PASS
REDIRECT_URI_MISMATCH_RESOLVED=YES
FRESH_NEW_LANE_CALLBACK_SUCCESS=PASS
INSTAGRAM_CALLBACK_FAIL_REASON=resolved after staging branch secret alignment
```

Ready to record without external asset selection:

- Staging login.
- Dashboard.
- Channels / Connect / Social entry.
- Inbox / Contacts synthetic reviewer-safe data.
- Automations demo / draft surface.
- Privacy Policy, Terms, Data Deletion.
- PayUNI Sandbox evidence.
- Login page, reviewer-safe staging dashboard, Channels / Connect / Social entry, and the new `InboxPilot-IG` consent screen.

Still human-operated:

- Final MP4 recording and final redaction review.
- App display name warning is accepted with reviewer note.
- OAuth consent app id/name lane is now on the new clean app: parent Meta app `1383365527078199`, Instagram OAuth client id `2542520412924029`, consent name `InboxPilot-IG`.
- Business Verification is visible in Meta Security Center as eligible but not started.
- Advanced Access is still testable-only and not started.

## Final Recording Package Status

```text
META_FINAL_PACKAGE=HUMAN_INPUT_REQUIRED
META_APP_REVIEW_RECORDING=HUMAN_INPUT_REQUIRED
META_DEVELOPERS_SCREENSHOTS=PASS
APP_NAME_CONSISTENCY=WARNING_ACCEPTED
REDACTION_REVIEW=HUMAN_INPUT_REQUIRED
CLIENT_ID_REVIEW_REQUIRED=NO
META_OAUTH_APP_ID_SWITCH=FAIL
STAGING_PREVIEW_ENV_NEEDS_REPAIR=NO
BUSINESS_VERIFICATION=NOT_STARTED
ADVANCED_ACCESS=NOT_STARTED
META_APP_REVIEW_SUBMITTED=NO
EXTERNAL_GATES_READY=NO
CURRENT_RELEASE_STATE=HUMAN_ACCEPTANCE_REQUIRED
```

## 2026-07-06 New InboxPilot Meta / Instagram Lane Update

The clean InboxPilot lane has been created and should replace the legacy naming lane for final Meta recording after staging env and tester setup.

```text
META_NEW_APP_LANE_CREATED=YES
NEW_PARENT_META_APP_ID=1383365527078199
NEW_INSTAGRAM_OAUTH_CLIENT_ID=2542520412924029
OAUTH_CONSENT_DISPLAY_NAME=InboxPilot-IG
INVALID_PLATFORM_APP_RESOLVED=YES
READY_TO_UPDATE_STAGING_ENV=COMPLETED
STAGING_CAN_USE_NEW_LANE=YES
HUMAN_SECRET_INPUT_REQUIRED=NO_LONGER_PRIMARY_BLOCKER
HUMAN_TESTER_ROLE_REQUIRED=YES
META_LOGIN_REQUIRED=RESOLVED
META_ROLE_GATE_RESULT=DEVELOPER_ROLE_INSUFFICIENT
META_REVIEWER_ACCOUNT_IS_TEST_USER=YES
HUMAN_ASSET_SELECTION_REQUIRED=LIKELY
META_APP_REVIEW_SUBMITTED=NO
EXTERNAL_GATES_READY=NO
CURRENT_RELEASE_STATE=HUMAN_ACCEPTANCE_REQUIRED
```

Decision impact:

- The legacy `manychat-auto-reply-IG` display-name warning is no longer the preferred final recording path.
- A staging/Preview env update is now needed for the new lane, but production env must remain unchanged.
- The new client id `2542520412924029` passed the platform validity check because OAuth no longer returns `Invalid platform app`.
- The current blocker is Meta / Instagram tester role access, not product code.
- The current blocker on live staging is now confirmed: after real reviewer-safe login, Instagram still returns `開發人員角色不足`.
- Direct role-assignment follow-up confirmed the current reviewer-safe Meta account is treated as a test user and cannot be added to app roles.
- The env keys required for the switch are documented in `reports/ai-team/META_NEW_APP_STAGING_ENV_SETUP_CHECKLIST.md`.

## New Clean InboxPilot App Lane Creation History

The initial creation attempt required Meta password re-authentication, and the owner completed that step in-browser. The new clean app lane now exists and supersedes the earlier blocked attempt.

Historical note only:

```text
INITIAL_CREATE_ATTEMPT_REQUIRED_PASSWORD_REAUTH=YES
FINAL_CREATE_RESULT=SUCCESS
CURRENT_META_NEW_APP_LANE_CREATED=YES
```

Prepared support files:

- `reports/ai-team/META_APP_REVIEW_FINAL_RECORDING_PACKAGE.md`
- `reports/ai-team/META_APP_NAME_CONSISTENCY_CHECK.md`
- `reports/ai-team/META_DEVELOPERS_SCREENSHOT_CHECKLIST.md`
- `reports/ai-team/META_RECORDING_SCRIPT.md`
- `reports/ai-team/META_FINAL_PACKAGE_STATUS.md`

Execution evidence captured:

- `reports/ai-team/meta-review-evidence/01-staging-connect-instagram-entry.png`
- `reports/ai-team/meta-review-evidence/02-meta-oauth-login-or-consent.png`
- `reports/ai-team/meta-review-evidence/06-staging-oauth-success.png`
- `reports/ai-team/meta-review-evidence/07-staging-channel-connected.png`
- `reports/ai-team/meta-review-evidence/08-sidebar-connected-channel.png`
- `reports/ai-team/meta-review-evidence/09-inbox-connected-channel-scope.png`
- `reports/ai-team/meta-review-evidence/10-contacts-connected-channel-scope.png`
- `reports/ai-team/meta-review-evidence/11-automations-connected-channel-scope.png`

## Decision

Current decision:

```text
HOLD_FOR_HUMAN_ACCEPTANCE
```

The project can move to `SALE_READY_CANDIDATE=YES` only after external gates are completed or explicitly waived by the human owner.

## Meta 924 / Instagram OAuth Client ID Decision

The latest feasibility run confirms:

```text
Parent Meta app: InboxPilot / 924285843989683
Instagram API setup app id: 1530009762118735
924 as Instagram OAuth client_id: Invalid platform app
153 as Instagram OAuth client_id: Instagram consent opens
```

Release impact:

- Do not use `924285843989683` as `META_INSTAGRAM_APP_ID` for the current Instagram Platform OAuth flow.
- Keep `META_APP_ID=924285843989683` for the parent Meta app / governance lane.
- Use `META_INSTAGRAM_APP_ID=1530009762118735` with the matching Instagram app secret for staging / Preview recording.
- App name consistency remains a warning, but it is accepted with an explicit reviewer note. Renaming the Instagram app display name is optional if Meta later exposes a safe path.

```text
META_924_FULL_UNIFICATION_FEASIBLE=NO
STAGING_CAN_USE_924=NO
INVALID_PLATFORM_APP_RESOLVED=NO
RECOMMENDED_CLIENT_ID_FOR_INSTAGRAM_OAUTH=1530009762118735
CLIENT_ID_REVIEW_REQUIRED=NO
APP_NAME_CONSISTENCY=WARNING_ACCEPTED
CURRENT_RELEASE_STATE=HUMAN_ACCEPTANCE_REQUIRED
```

## 2026-07-07 New lane fresh callback success

- The staging branch Preview `META_INSTAGRAM_APP_SECRET` override was repaired for the new clean lane.
- Fresh staging OAuth result on the new lane:
  - reviewer-safe login: PASS
  - `InboxPilot-IG` consent: PASS
  - popup callback returned `status=success`
  - connected account name: `Instagram @carry.digital.nomad`
- Fresh scope verification also passed on:
  - Channels / Settings
  - sidebar account dropdown
  - Inbox
  - Contacts
  - Automations

Updated release meaning:

```text
AUTHENTICATED_STAGING_READY=YES
META_REVIEWER_SAFE_ASSET_LANE=PASS
CONNECTED_CHANNEL_EVIDENCE=PASS
INSTAGRAM_CALLBACK_TOKEN_EXCHANGE=PASS
FRESH_NEW_LANE_CALLBACK_SUCCESS=PASS
CURRENT_RELEASE_STATE=HUMAN_ACCEPTANCE_REQUIRED
```

Only human package-completion gates remain:

- final Meta MP4 recording
- redaction review
- Business Verification / Advanced Access confirmation

## 2026-07-07 Meta Developers screenshot completion

The screenshot package is now materially complete:

- `md-05-roles-testers-redacted.png` is ready for submission use.
- `md-06-permissions-features.png` shows the Instagram permissions screen fully loaded.
- `md-10-business-verification-redacted.png` now comes from Security Center and shows Business Verification is eligible but not started.
- `md-11-advanced-access.png` shows the relevant Instagram permissions are still `可供測試`.

Updated gate meaning:

```text
META_DEVELOPERS_SCREENSHOTS=PASS
BUSINESS_VERIFICATION=NOT_STARTED
ADVANCED_ACCESS=NOT_STARTED
META_APP_REVIEW_RECORDING=PASS
REDACTION_REVIEW=PASS
CURRENT_RELEASE_STATE=HUMAN_ACCEPTANCE_REQUIRED
```

## 2026-07-07 Meta stale-evidence replacement closeout

The stale legacy / disconnected package has now been replaced:

- `02-meta-oauth-login-or-consent.png` now uses the fresh `InboxPilot-IG` consent capture
- `07-staging-channel-connected.png` now shows the fresh connected channel
- `08-sidebar-connected-channel.png` now shows the fresh connected dropdown
- `12-meta-reviewer-recording.mp4` was regenerated after those replacements
- unsafe originals were moved into excluded folders and are no longer part of the active submission package

Authoritative release meaning after the replacement pass:

```text
META_APP_REVIEW_RECORDING=PASS
META_DEVELOPERS_SCREENSHOTS=PASS
REDACTION_REVIEW=PASS
PAYUNI_SANDBOX_EVIDENCE=PASS
BUSINESS_VERIFICATION=NOT_STARTED
ADVANCED_ACCESS=NOT_STARTED
EXTERNAL_GATES_READY=NO
SALE_READY_CANDIDATE=NO
CURRENT_RELEASE_STATE=HUMAN_ACCEPTANCE_REQUIRED
NEXT_REQUIRED_ACTION=Hold at human acceptance until Business Verification / Advanced Access and final Meta App Review submit authorization are decided.
```
