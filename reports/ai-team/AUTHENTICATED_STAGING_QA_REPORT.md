# Authenticated Staging QA Report

Generated: 2026-07-06

## Scope

This report records the reviewer-safe authenticated staging account setup and smoke check. No production database was touched. No Production deployment was executed. Meta App Review was not submitted. PayUNI production was not enabled.

## Reviewer Staging Env

The following keys are present in local `.env.local`:

```text
REVIEWER_STAGING_BASE_URL=SET
REVIEWER_STAGING_EMAIL=SET
REVIEWER_STAGING_PASSWORD=SET_NO_OUTPUT
REVIEWER_STAGING_WORKSPACE_NAME=SET
REVIEWER_STAGING_CHANNEL_NAME=SET
REVIEWER_STAGING_MODE=SET
```

The password was not printed and `.env.local` remains ignored by git.

## Account Creation

Because local `.env.local` still contains the production Supabase project ref in `DATABASE_URL` / `DIRECT_URL`, the direct DB seed script correctly refused to run. The reviewer-safe account was created through staging app APIs instead:

| Check | Result |
| --- | --- |
| `POST /api/auth/signup` | PASS, HTTP 200 |
| `POST /api/auth/login` | PASS, HTTP 200 |
| `POST /api/webhooks/mock` | PASS, HTTP 202 |

The mock webhook payload used only reviewer-safe synthetic text and did not send any real Instagram message.

## Authenticated Browser Smoke

| Page / Flow | Result |
| --- | --- |
| Dashboard after login | PASS |
| Inbox reviewer-safe conversation visible | PASS |
| Contacts reviewer-safe contact visible | PASS |

## Current State

```text
AUTHENTICATED_STAGING_QA=PASS
STAGING_LOGIN_READY=PASS
REVIEWER_SAFE_STAGING_ACCOUNT=PASS
REVIEWER_SAFE_STAGING_DEMO_DATA=PARTIAL
```

## Remaining Evidence Gaps

The staging account and mock Inbox / Contacts demo are now usable. Remaining staging evidence still requires:

- Reviewer-safe Instagram / Meta real asset lane.
- Connected Instagram channel evidence in Channels and sidebar dropdown.
- PayUNI Sandbox authenticated checkout evidence.
- Final Meta dashboard screenshot / recording package.

