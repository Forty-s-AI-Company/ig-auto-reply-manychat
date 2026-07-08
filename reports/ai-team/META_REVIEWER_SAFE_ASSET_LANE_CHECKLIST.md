# Meta Reviewer-Safe Asset Lane Checklist

Generated: 2026-07-06

## Scope

This checklist covers Meta / Instagram reviewer-safe evidence preparation only.

No Meta App Review was submitted. No Production deployment was performed. No production database was touched. No PayUNI production switch was started. No Meta / IG / Facebook credentials, tokens, cookies, secrets, auth codes, or customer data were recorded.

## Current Release Context

```text
PRODUCT_CODE_READY=YES
LOCAL_VALIDATION_READY=YES
STAGING_BASIC_READY=YES
AUTHENTICATED_STAGING_READY=YES
PAYUNI_SANDBOX_GATE=PASS
PAYUNI_PRODUCTION_SWITCH=NOT_STARTED_HUMAN_GATE
CURRENT_RELEASE_STATE=HUMAN_ACCEPTANCE_REQUIRED
```

## Reviewer-Safe Asset Readiness

| Item | Status | Evidence / Next Step |
| --- | --- | --- |
| Reviewer-safe Meta account | HUMAN_INPUT_REQUIRED | Human owner must use a reviewer-safe Meta account. Do not use a production customer account. |
| Reviewer-safe Business | HUMAN_INPUT_REQUIRED | Must be selected or confirmed in Meta OAuth / Business Manager by the human owner. |
| Reviewer-safe Facebook Page | HUMAN_INPUT_REQUIRED | Required if the review flow uses Page-linked Instagram assets. |
| Reviewer-safe Instagram professional account | HUMAN_INPUT_REQUIRED | Must be a professional IG account safe for review recording. |
| Page connected to IG | HUMAN_INPUT_REQUIRED | Must be confirmed in Meta / Business Manager or during OAuth asset selection. |
| Meta App test / reviewable state | HUMAN_INPUT_REQUIRED | Current evidence says requested permissions are still testable / not Advanced Access approved. |
| App role / tester access | HUMAN_INPUT_REQUIRED | Reviewer-safe Meta account must have the needed tester / role access before OAuth recording. |
| Staging OAuth callback URL | READY_TO_RECORD | Product source supports staging-origin OAuth. Instagram Login uses `/api/instagram/oauth/callback`; generic provider route also supports `/api/oauth/meta-instagram/callback`. Confirm the Meta dashboard value before recording. |
| Privacy Policy URL | READY_TO_RECORD | `/privacy-policy` exists and is public. |
| Terms URL | READY_TO_RECORD | `/terms-of-service` exists and is public. |
| Data Deletion URL / callback | READY_TO_RECORD | `/data-deletion` exists; API route `/api/meta/data-deletion` exists. Confirm dashboard setting before recording. |
| Connected channel display positions | READY_TO_RECORD_AFTER_CONNECT | Channels page, sidebar account dropdown, Inbox scope, Contacts scope. Needs one successful reviewer-safe OAuth connect first. |

## Required Meta Permissions

| Permission | Product Purpose | Evidence To Record | Status |
| --- | --- | --- | --- |
| `instagram_business_basic` | Identify and display connected Instagram professional account / channel metadata. | OAuth connect, Channels connected account, sidebar account dropdown, metadata fallback if profile is incomplete. | HUMAN_INPUT_REQUIRED |
| `instagram_business_manage_messages` | Read / manage Instagram messages in Inbox and support reply workflow. | Reviewer-safe Inbox conversation and reply / clear limitation evidence. | HUMAN_INPUT_REQUIRED |
| `instagram_business_manage_comments` | Support comment / keyword automation and comment sync proof. | Automations keyword/comment draft and reviewer-safe comment evidence. | HUMAN_INPUT_REQUIRED |

## Product Flow Source Evidence

| Evidence point | Source / Route | Status |
| --- | --- | --- |
| Social connect entry | `src/app/channels/connect/social/page.tsx` | READY_TO_RECORD |
| Instagram OAuth start | `/api/oauth/meta-instagram/authorize?fresh_login=1` | READY_TO_RECORD |
| Switch / reconnect flow | `/api/oauth/meta-instagram/authorize?switch_account=1` | READY_TO_RECORD |
| OAuth callback handling | `src/app/api/oauth/[provider]/callback/route.ts`; legacy Instagram callback path `/api/instagram/oauth/callback` | READY_TO_RECORD |
| Safe OAuth failure UX | Social connect query states and safe Meta OAuth error mapping tests | READY_TO_RECORD |
| Connected channel creation | `src/lib/oauth/meta-channel-sync.ts` | READY_TO_RECORD_AFTER_CONNECT |
| Connected channel UI | `src/app/channels/page.tsx`, `src/components/AdminShell.tsx`, `src/components/InboxPilotAccountDropdown.tsx` | READY_TO_RECORD_AFTER_CONNECT |
| Meta webhook verification | `src/app/api/webhooks/meta/route.ts` | READY_TO_RECORD_FOR_DASHBOARD_SCREENSHOT |
| Public legal pages | `/privacy-policy`, `/terms-of-service`, `/data-deletion` | READY_TO_RECORD |

## Evidence Lane Classification

### A. READY_TO_RECORD

These can be recorded now with the reviewer-safe staging account, even before a real Meta asset connect:

- Staging login.
- Dashboard overview.
- Channels / Settings page.
- Channels / Connect / Social page.
- Instagram OAuth entry button and explanatory warning.
- Inbox reviewer-safe synthetic conversation.
- Contacts reviewer-safe synthetic contact.
- Automations reviewer-safe demo / draft surface.
- Privacy Policy, Terms, Data Deletion pages.
- PayUNI Sandbox evidence already collected.

### B. HUMAN_INPUT_REQUIRED

These require human Meta / Instagram operation. Codex must not guess credentials or connect real customer assets:

- Meta / Instagram login.
- Business selection.
- Facebook Page selection.
- Instagram professional asset selection.
- OAuth consent with reviewer-safe assets.
- Connected channel final state after successful OAuth.
- Meta Developers Basic Settings / App Review / permission status screenshots.
- Business Verification / Advanced Access confirmation.
- App Review final submit.

### C. BLOCKED_OR_MISSING

No confirmed product P0/P1 is currently identified from the available evidence.

Current blockers are external evidence / human acceptance gates:

- Reviewer-safe Meta / IG asset lane not yet recorded.
- Business Verification / Advanced Access not yet confirmed.
- Meta App Review recording package not yet completed.

## Recording Pass Standard

The Meta reviewer-safe asset lane can be marked `PASS` only when all of the following are captured:

1. Staging OAuth begins from the reviewer-safe staging account.
2. Meta / Instagram screen uses only reviewer-safe assets.
3. Correct Business / Page / IG professional asset is selected.
4. OAuth returns to staging without raw provider error.
5. Connected channel appears in Channels.
6. Connected channel appears in sidebar account dropdown.
7. Inbox and Contacts are scoped to the connected channel or clearly show reviewer-safe synthetic data.
8. Automations evidence shows keyword/comment usage without sending production messages.
9. Recording / screenshots do not expose secrets, tokens, cookies, auth codes, unrelated accounts, or real customer data.

## Current Status

```text
META_REVIEWER_SAFE_ASSET_LANE=PASS
CONNECTED_CHANNEL_EVIDENCE=PASS
META_APP_REVIEW_RECORDING_READY=HUMAN_INPUT_REQUIRED
META_LOGIN_REQUIRED=RESOLVED
PRODUCT_P0_REMAINING=0
PRODUCT_P1_REMAINING=0
NEW_PARENT_META_APP_ID=1383365527078199
NEW_INSTAGRAM_OAUTH_CLIENT_ID=2542520412924029
NEW_OAUTH_DISPLAY_NAME=InboxPilot-IG
INVALID_PLATFORM_APP_RESOLVED=YES
NEW_LANE_TESTER_ROLE_REQUIRED=YES
NEW_LANE_SECRET_INPUT_REQUIRED=YES
NEXT_REQUIRED_ACTION=Update staging/Preview env to the new Meta lane, add reviewer-safe tester access, rerun OAuth smoke, then record or attach the final Meta App Review video package and Meta Developers permission / Business Verification screenshots. Do not submit App Review yet.
```

## Execution Evidence - 2026-07-06

| Step | Status | Evidence |
| --- | --- | --- |
| Staging Channels / Connect / Social page | PASS | `reports/ai-team/meta-review-evidence/01-staging-connect-instagram-entry.png` |
| Instagram OAuth launched from staging | PASS | OAuth redirected to Instagram login with authorize `next` URL. |
| Instagram / Meta login gate | PASS | Human owner logged in with reviewer-safe account; `reports/ai-team/meta-review-evidence/02-meta-oauth-login-or-consent.png` |
| Instagram OAuth consent | PASS | Consent completed for `carry.digital.nomad`; OAuth returned to staging successfully. |
| Business / Page / IG asset selection | NOT_PRESENT_IN_THIS_FLOW | Instagram Login flow did not show separate Business / Page / IG selection pages. |
| OAuth success callback | PASS | `reports/ai-team/meta-review-evidence/06-staging-oauth-success.png` |
| Channels connected channel evidence | PASS | `reports/ai-team/meta-review-evidence/07-staging-channel-connected.png` |
| Sidebar connected channel evidence | PASS | `reports/ai-team/meta-review-evidence/08-sidebar-connected-channel.png` |
| Inbox connected channel scope evidence | PASS | `reports/ai-team/meta-review-evidence/09-inbox-connected-channel-scope.png` |
| Contacts connected channel scope evidence | PASS | `reports/ai-team/meta-review-evidence/10-contacts-connected-channel-scope.png` |
| Automations connected channel context evidence | PASS | `reports/ai-team/meta-review-evidence/11-automations-connected-channel-scope.png` |

Note: The Instagram consent screen displays the app name `manychat-auto-reply-IG`. Confirm this naming is acceptable for the final App Review recording, or align the Meta app display name before submission.
