# Meta Developers Screenshot Checklist

Generated: 2026-07-06

## Scope

This checklist defines the Meta Developers screenshots needed before App Review submission. It does not submit App Review and does not modify Meta Dashboard values.

## Required App

```text
App name: InboxPilot
App ID: 924285843989683
```

## Screenshot Checklist

| Meta Developers page / item | Required | Current status | Suggested filename | Redaction needed |
| --- | --- | --- | --- | --- |
| App Dashboard overview | REQUIRED | PASS | `meta-developers/md-01-app-overview.png` | Redact unrelated app/business IDs if visible. |
| App mode / testing status | REQUIRED | PASS | `meta-developers/md-01-app-overview.png` | Redact unrelated account info if visible. |
| Roles / testers | REQUIRED | PASS_WITH_REDACTION_REVIEW | `meta-developers/md-05-roles-testers.png` | Redact personal emails / unrelated personal identifiers before submission. |
| Basic settings | REQUIRED | PASS_WITH_REDACTION_REVIEW | `meta-developers/md-02-basic-settings-display-name.png` | Confirm App Secret is not visible; redact any secret fields. |
| App domains | REQUIRED | PASS_WITH_REDACTION_REVIEW | `meta-developers/md-03-app-domains.png` | Usually no redaction unless unrelated domains appear. |
| OAuth redirect URI / callback | REQUIRED | PASS_WITH_REDACTION_REVIEW | `meta-developers/md-04-oauth-redirect-uri.png` | Redact secret values; callback URL may remain visible. |
| Permissions and features | REQUIRED | PASS | `meta-developers/md-06-permissions-features.png` | No tokens; permission statuses can remain visible. |
| Instagram / Facebook Login settings | REQUIRED | PASS_WITH_REDACTION_REVIEW | `meta-developers/md-07-instagram-facebook-login-settings.png` | Redact unrelated app/account data. |
| Webhooks settings | REQUIRED | PASS_WITH_REDACTION_REVIEW | `meta-developers/md-08-webhooks-settings.png` | Redact verify token; callback URL may remain visible. |
| Data deletion callback | REQUIRED | PASS_WITH_REDACTION_REVIEW | `meta-developers/md-09-data-deletion-callback.png` | Redact secrets; public data deletion URL can remain visible. |
| Privacy Policy URL | REQUIRED | PASS_WITH_REDACTION_REVIEW | `meta-developers/md-02-basic-settings-display-name.png` | No secret expected; confirm URL is visible in screenshot. |
| Terms URL | REQUIRED | PASS_WITH_REDACTION_REVIEW | `meta-developers/md-02-basic-settings-display-name.png` | No secret expected; confirm URL is visible in screenshot. |
| Business Verification status | REQUIRED | HUMAN_INPUT_REQUIRED | `meta-developers/md-10-business-verification-redacted.png` | Redacted candidate exists, but the captured page redirected to Business Suite users list and does not prove Business Verification status. Prefer replacing with the correct Security Center / verification status screenshot. |
| Advanced Access / App Review status | REQUIRED | PASS | `meta-developers/md-11-advanced-access.png` | Permission status can remain visible; redact unrelated account info. |
| App icon / brand state | OPTIONAL_BUT_RECOMMENDED | HUMAN_INPUT_REQUIRED | `meta-developers/md-02-basic-settings-display-name.png` | Confirm app icon visibility before final package. |

## Pass Standard

Meta Developers evidence can be marked `PASS` only when:

- All required screenshots exist in `reports/ai-team/meta-review-evidence/`.
- No App Secret, verify token, access token, cookies, or passwords are visible.
- App display name / legal URLs / app domains are consistent enough for reviewer interpretation.
- Permission status is documented honestly as current state.
- App Review is still not submitted.

## Current Status

```text
META_DEVELOPERS_SCREENSHOTS_READY=HUMAN_INPUT_REQUIRED
BUSINESS_VERIFICATION=HUMAN_INPUT_REQUIRED
ADVANCED_ACCESS=HUMAN_INPUT_REQUIRED
APP_NAME_CONSISTENCY=WARNING
REDACTION_REVIEW=REDACTION_REQUIRED
BUSINESS_VERIFICATION_REDACTED_CANDIDATE=reports/ai-team/meta-review-evidence/meta-developers/md-10-business-verification-redacted.png
NEXT_REQUIRED_ACTION=Replace Business Verification screenshot with the correct Security Center / verification status page if possible, run redaction review on all Meta Developers screenshots, and confirm OAuth app name/client_id before final package acceptance.
```
