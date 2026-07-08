# Meta Reviewer-Safe Asset Lane Report

Generated: 2026-07-06

## Scope

This report covers the current Meta reviewer-safe IG / connected channel / Inbox / Contacts / Automations evidence lane.

No product code was modified. No Production deployment was performed. No production database was touched. PayUNI production was not enabled. Meta App Review was not submitted. No Meta / IG / Facebook credentials, tokens, cookies, secrets, auth codes, or customer data were recorded.

## Result Summary

```text
META_REVIEWER_SAFE_ASSET_LANE=PASS
CONNECTED_CHANNEL_EVIDENCE=PASS
META_APP_REVIEW_RECORDING_READY=HUMAN_INPUT_REQUIRED
RELEASE_STATE_AFTER_META_GATE=HUMAN_ACCEPTANCE_REQUIRED
META_LOGIN_REQUIRED=RESOLVED
INSTAGRAM_RECAPTCHA_REQUIRED=NO
REDIRECT_URI_MISMATCH_RESOLVED=YES
FRESH_NEW_LANE_CALLBACK_SUCCESS=PASS
PRODUCT_P0_REMAINING=0
PRODUCT_P1_REMAINING=0
```

## Execution Attempt - 2026-07-07 Staging redirect mismatch hotfix verification

After the popup authorize/callback redirect hotfix was deployed to staging, the new lane was re-run against:

- Parent Meta app `1383365527078199`
- Instagram OAuth client id `2542520412924029`
- Redirect URI `https://staging.carry-digital-nomad.in.net/api/instagram/oauth/callback`

Observed result:

1. OAuth launch still used the new lane `client_id=2542520412924029`
2. Reviewer-safe Instagram login succeeded
3. `InboxPilot-IG` consent screen loaded
4. Consent completed and returned to staging popup callback with:
   - `status=success`
   - `provider=meta-instagram`
   - `displayName=Instagram @carry.digital.nomad`
5. Fresh connected-channel scope was re-verified on:
   - Channels / Settings
   - Sidebar account dropdown
   - Inbox
   - Contacts
   - Automations

Important finding:

- the remaining blocker was not redirect registration
- the remaining blocker was not tester-role rejection
- the actual staging issue was that the branch-scoped Preview `META_INSTAGRAM_APP_SECRET` was not overridden correctly at first
- once the correct Preview/staging secret handling was repaired and staging was redeployed, the fresh callback succeeded

Updated decision:

```text
META_REVIEWER_SAFE_ASSET_LANE=PASS
CONNECTED_CHANNEL_EVIDENCE=PASS
FRESH_NEW_LANE_CALLBACK_SUCCESS=PASS
CURRENT_BLOCKER=FINAL_MP4_AND_META_DASHBOARD_SCREENSHOTS
```

## Execution Attempt - 2026-07-07 Recaptcha Continue Check

After the reviewer-safe Instagram reCAPTCHA handoff, Codex re-ran a fresh staging OAuth smoke against the new lane in an isolated Playwright context.

Observed result:

1. staging reviewer-safe login succeeded (`status=200`)
2. Channels / Connect / Social opened normally
3. OAuth popup launched with `client_id=2542520412924029`
4. reviewer-safe Instagram login page was reached again
5. the old `Invalid platform app` error did not return
6. the old `redirect_uri mismatch` error did not return
7. the flow still stopped at `https://www.instagram.com/auth_platform/recaptcha/...`

Meaning:

- the new clean lane is wired correctly on staging
- redirect URI registration is no longer the blocker
- the remaining blocker is still an external Instagram risk / verification gate
- a human-completed reCAPTCHA in one browser session does not automatically carry into a separate automated browser context

Updated decision:

```text
CURRENT_BLOCKER=INSTAGRAM_RECAPTCHA_HUMAN_GATE
FRESH_NEW_LANE_CALLBACK_SUCCESS=HUMAN_INPUT_REQUIRED
CONNECTED_CHANNEL_EVIDENCE=PASS
```

## Execution Attempt - 2026-07-07

This run used the new clean Meta lane on staging:

- Parent Meta app: `1383365527078199`
- Instagram OAuth client id: `2542520412924029`
- Consent display name target: `InboxPilot-IG`

Observed result:

1. reviewer-safe staging login succeeded
2. Channels / Connect / Social opened normally
3. Instagram OAuth popup launched with `client_id=2542520412924029`
4. reviewer-safe Instagram login form was reached
5. after login, the flow no longer returned `Invalid platform app`
6. after login, the flow also no longer returned the previous
   `Error validating verification code. Please make sure your redirect_uri is identical...`
7. the flow instead stopped at Instagram:
   `https://www.instagram.com/auth_platform/recaptcha/...`

This means the redirect URI mismatch is effectively cleared on the new lane, and the current blocker has moved to an external human gate:

```text
CURRENT_BLOCKER=INSTAGRAM_RECAPTCHA_HUMAN_GATE
```

## Execution Attempt - 2026-07-06

Codex started the reviewer-safe recording lane from staging and stopped at the first required human gate.

| Step | Result | Evidence |
| --- | --- | --- |
| Reviewer-safe staging session | PASS | Staging session was already authenticated and redirected to Dashboard. |
| Channels / Connect / Social | PASS | `reports/ai-team/meta-review-evidence/01-staging-connect-instagram-entry.png` |
| Instagram OAuth start | PASS | Clicking Instagram OAuth connect opened Instagram authorization login flow. |
| Instagram / Meta login | PASS | Human owner completed reviewer-safe login; `reports/ai-team/meta-review-evidence/02-meta-oauth-login-or-consent.png` |
| Instagram OAuth consent | PASS | Consent completed; OAuth returned to staging. |
| Business / Page / IG asset selection | NOT_PRESENT_IN_THIS_FLOW | Instagram Login did not show separate Business / Page / IG selection screens. |
| OAuth callback success | PASS | `reports/ai-team/meta-review-evidence/06-staging-oauth-success.png` |
| Connected channel evidence | PASS | Channels, sidebar, Inbox, Contacts, and Automations evidence captured. |

No Meta credentials, cookies, tokens, secrets, or auth codes were read or recorded. No real IG user was messaged.

## Captured Evidence Paths

- `reports/ai-team/meta-review-evidence/01-staging-connect-instagram-entry.png`
- `reports/ai-team/meta-review-evidence/02-meta-oauth-login-or-consent.png`
- `reports/ai-team/meta-review-evidence/06-staging-oauth-success.png`
- `reports/ai-team/meta-review-evidence/07-staging-channel-connected.png`
- `reports/ai-team/meta-review-evidence/08-sidebar-connected-channel.png`
- `reports/ai-team/meta-review-evidence/09-inbox-connected-channel-scope.png`
- `reports/ai-team/meta-review-evidence/10-contacts-connected-channel-scope.png`
- `reports/ai-team/meta-review-evidence/11-automations-connected-channel-scope.png`
- `reports/ai-team/meta-review-evidence/oauth-preflight-social-page.png`
- `reports/ai-team/meta-review-evidence/oauth-popup-initial.png`
- `reports/ai-team/meta-review-evidence/oauth-instagram-login-filled.png`

## Connected Channel Verification

| Surface | Status | Evidence |
| --- | --- | --- |
| Channels / Settings list | PASS | `Instagram @carry.digital.nomad`, enabled, encrypted token stored. |
| Sidebar / workspace dropdown | PASS | Sidebar shows `@carry.digital.nomad`. |
| Inbox scope | PASS | Inbox shows `@carry.digital.nomad` and reviewer-safe synthetic conversation. |
| Contacts scope | PASS | Contacts table shows `Instagram @carry.digital.nomad` and reviewer-safe contact. |
| Automations context | PASS | Automations page shows selected sidebar account and reviewer-safe automation draft; no production message was sent. |

Note:

- These connected-channel surfaces remain visible in staging and were re-captured in this run.
- The current run did **not** complete a fresh post-login callback success on the new lane because Instagram stopped at a reCAPTCHA / risk gate first.
- So the product surfaces are still usable evidence, but the final Meta recording package still needs a human-completed OAuth continuation.

## Remaining Review Package Gaps

- No MP4 recording file was created in this run.
- Meta Developers permission / App Review / Business Verification screenshots still require human dashboard capture.
- The new clean lane exists and is active:
  - Parent app `1383365527078199`
  - Instagram OAuth client id `2542520412924029`
  - Display name target `InboxPilot-IG`
- New-lane OAuth smoke no longer returns `Invalid platform app`.
- New-lane OAuth smoke no longer reproduces the old `redirect_uri mismatch` callback failure.
- The current blocker is Instagram `auth_platform/recaptcha`, which requires human completion before Codex can continue recording safely.

## What Is Ready

The product and evidence package are ready for the non-destructive recording surfaces:

- Staging reviewer-safe login is available.
- Dashboard can be recorded.
- Channels / Connect / Social entry can be recorded.
- Instagram OAuth start route exists.
- OAuth callback route exists.
- Switch-account / reconnect link exists.
- OAuth failure state is displayed as user-readable UI instead of raw provider errors.
- Privacy Policy, Terms, and Data Deletion pages are public product surfaces.
- Reviewer-safe Inbox / Contacts synthetic evidence is available from authenticated staging QA.
- PayUNI Sandbox gate is complete.

## What Still Requires Human Input

The remaining Meta gate requires human operation because it touches third-party account risk controls:

1. Continue the reviewer-safe Instagram OAuth flow through the reCAPTCHA / risk checkpoint.
2. If Meta / Instagram asks for extra verification, complete it with reviewer-safe assets only.
3. If Business / Page / IG asset selection appears after reCAPTCHA, choose reviewer-safe assets only.
4. Confirm the connected channel appears in staging after the fresh callback:
   - Channels / Settings list.
   - Sidebar account dropdown.
   - Inbox channel / account scope.
   - Contacts channel / account scope.
   - Automations channel scope.
5. Capture Meta Developers permission / Advanced Access / App Review screen.
6. Capture Business Verification status.
7. Record the final App Review package, but do not submit until human owner approves.

## Connected Channel Evidence

Current status: `PASS`.

Reason:

- The source code supports connected channel persistence and UI display.
- Authenticated staging QA proves reviewer-safe login and synthetic Inbox / Contacts data.
- The reviewer-safe staging surfaces still show connected channel evidence across Channels, sidebar, Inbox, Contacts, and Automations.
- The latest blocker is no longer a product callback error. It is an external Instagram reCAPTCHA gate.

## Can Meta App Review Package Be Recorded Now?

Partially.

Ready to record now:

- Staging login.
- Dashboard.
- Channels / Connect / Social page.
- Legal pages.
- Inbox / Contacts synthetic evidence.
- Automations demo / draft evidence.
- PayUNI Sandbox evidence.
- Connected channel evidence captured in this run.

Not ready without human input:

- Final MP4 recording file.
- Meta Developers permission / App Review / Business Verification screenshots.
- Human redaction review and submit/no-submit decision.
- Meta Developers permission / App Review / Business Verification screenshots.

## Minimum Human Operation Checklist

1. Review the captured screenshots under `reports/ai-team/meta-review-evidence/`.
2. Record or attach the final MP4 walkthrough for App Review.
3. Capture Meta Developers permission / App Review / Business Verification screens.
4. Confirm whether app display name `manychat-auto-reply-IG` is acceptable or must be corrected before final submission.
5. Do not submit App Review yet.

## Next Required Action

```text
NEXT_REQUIRED_ACTION=Human completes the reviewer-safe Instagram reCAPTCHA / risk gate on the new lane, then recheck fresh callback success, refresh connected-channel screenshots if needed, and record the final MP4 + Meta Developers evidence.
```
