# Staging Evidence Checklist

Generated: 2026-07-04

## Scope

This checklist is for staging evidence collection only. It does not authorize production deployment, production database mutation, Meta App Review submission, or PayUNI production switching.

## Staging Target

| Item | Status | Evidence / Notes |
| --- | --- | --- |
| Staging URL | PASS | `https://staging.carry-digital-nomad.in.net` |
| Staging health endpoint | PASS | `/api/health/staging` returned HTTP 200 with staging checks marked ok. |
| Generic health endpoint | PASS | `/api/health` returned HTTP 200. |
| Staging env available | PASS | Health response confirms database, Redis, staging host, release channel, DB env, and expected staging signals. |
| Reviewer-safe account | HUMAN_INPUT_REQUIRED | No staging reviewer-safe credential variables are present in local env. Do not guess credentials. |
| Reviewer-safe demo data | HUMAN_INPUT_REQUIRED | Local reviewer demo data exists and passes local rehearsal. Staging tenant/data still needs reviewer-safe account or controlled staging seed lane. |

## Desktop Browser QA

| Item | Status | Evidence / Notes |
| --- | --- | --- |
| Public landing / official route | PASS | Public smoke loaded `/` on desktop without 5xx or horizontal overflow. |
| Login page | PASS | `/login` loaded on desktop without 5xx or horizontal overflow. |
| Signup page | PASS | `/signup` loaded on desktop without 5xx or horizontal overflow. |
| Pricing page | PASS | `/pricing` loaded on desktop without 5xx or horizontal overflow; PayUNI Sandbox wording visible. |
| Privacy / Terms / Data deletion | PASS | Legal pages loaded on desktop without 5xx or horizontal overflow. |
| Status page | PASS | `/status` loaded on desktop without 5xx or horizontal overflow. |
| Authenticated dashboard / product pages | HUMAN_INPUT_REQUIRED | Requires staging reviewer-safe login. |

## Mobile Browser QA

| Item | Status | Evidence / Notes |
| --- | --- | --- |
| Public landing / official route | PASS | Public smoke loaded `/` on Pixel 5 profile without 5xx or horizontal overflow. |
| Login / signup | PASS | Both pages loaded on Pixel 5 profile without 5xx or horizontal overflow. |
| Pricing / legal / status pages | PASS | Pages loaded on Pixel 5 profile without 5xx or horizontal overflow. |
| Authenticated Dashboard / Inbox / Contacts / Automations | HUMAN_INPUT_REQUIRED | Requires staging reviewer-safe login. |

## Console / Network

| Item | Status | Evidence / Notes |
| --- | --- | --- |
| Console errors on public pages | PASS | Public smoke did not record browser console errors. |
| Network errors on public pages | PASS_WITH_NOTES | Only navigation aborts / Vercel live overlay-related aborted requests were observed during route transitions. No failing 5xx product route was observed. |
| Authenticated app console / network | HUMAN_INPUT_REQUIRED | Requires staging reviewer-safe login. |

## Auth / Login

| Item | Status | Evidence / Notes |
| --- | --- | --- |
| Login page reachable | PASS | `/login` returns HTTP 200 and renders Email / Google login UI. |
| Reviewer-safe staging login | HUMAN_INPUT_REQUIRED | Need reviewer-safe staging email/password or a safe browser session. |
| Authenticated route scope | HUMAN_INPUT_REQUIRED | Need reviewer-safe staging tenant. |

## Product Evidence Areas

| Area | Status | Evidence / Notes |
| --- | --- | --- |
| Dashboard | HUMAN_INPUT_REQUIRED | Requires reviewer-safe staging login. |
| Channels / Instagram connect reviewer-safe flow | HUMAN_INPUT_REQUIRED | Requires reviewer-safe Meta / Instagram asset lane and staging account. Do not submit App Review. |
| Sidebar connected account dropdown | HUMAN_INPUT_REQUIRED | Requires connected staging Instagram channel. |
| Inbox | HUMAN_INPUT_REQUIRED | Requires reviewer-safe staging conversation data. |
| Contacts | HUMAN_INPUT_REQUIRED | Requires reviewer-safe staging contact data. |
| Automations | HUMAN_INPUT_REQUIRED | Requires reviewer-safe staging automation draft / tenant. |
| Billing Sandbox / PayUNI Sandbox evidence | PARTIAL | Public pricing page shows PayUNI Sandbox positioning. Full checkout evidence requires staging login and sandbox flow. |
| Meta reviewer-safe real asset lane | HUMAN_INPUT_REQUIRED | Requires real reviewer-safe IG / Meta session, connected channel, webhook / message / comment evidence, and redacted recording. |

## Automatically Verifiable Now

- Staging health endpoints.
- Public desktop/mobile pages.
- Public console / network smoke.
- Pricing / legal / data deletion visibility.
- Local reviewer rehearsal evidence from `reports/ai-team/yolo-validation.md`.

## Requires Human Login / Screenshot / Third-Party Confirmation

- Staging reviewer-safe account credentials or active logged-in session.
- Reviewer-safe Instagram / Meta asset lane.
- Connected channel evidence on staging.
- Inbox / Contacts / Automations authenticated staging evidence.
- PayUNI Sandbox checkout screenshot / transaction evidence.
- Meta Developers dashboard permission / webhook evidence.
- Final App Review submission package capture.

