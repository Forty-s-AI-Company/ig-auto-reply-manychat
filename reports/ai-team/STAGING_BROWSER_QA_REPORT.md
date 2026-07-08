# Staging Browser QA Report

Generated: 2026-07-04

## Scope

This report records automated staging browser evidence that can be collected without credentials. It intentionally does not modify source code, staging database state, production settings, Meta App Review, or PayUNI production configuration.

## Command

An ad hoc Playwright smoke was executed against:

```text
https://staging.carry-digital-nomad.in.net
```

The smoke checked:

- `/api/health/staging`
- `/api/health`
- `/`
- `/login`
- `/signup`
- `/pricing`
- `/privacy-policy`
- `/terms-of-service`
- `/data-deletion`
- `/status`

Across:

- Desktop viewport: 1366 x 768
- Mobile profile: Pixel 5

## Result

```text
STAGING_PUBLIC_BROWSER_QA=PASS
```

## Health

| Endpoint | Result |
| --- | --- |
| `/api/health/staging` | PASS, HTTP 200 |
| `/api/health` | PASS, HTTP 200 |

## Desktop Public Pages

| Route | Result | Notes |
| --- | --- | --- |
| `/` | PASS | HTTP 200, no horizontal overflow. |
| `/login` | PASS | HTTP 200, login UI visible, no horizontal overflow. |
| `/signup` | PASS | HTTP 200, signup UI visible, no horizontal overflow. |
| `/pricing` | PASS | HTTP 200, pricing content visible, PayUNI Sandbox wording visible, no horizontal overflow. |
| `/privacy-policy` | PASS | HTTP 200, legal content visible, no horizontal overflow. |
| `/terms-of-service` | PASS | HTTP 200, legal content visible, no horizontal overflow. |
| `/data-deletion` | PASS | HTTP 200, data deletion instructions visible, no horizontal overflow. |
| `/status` | PASS | HTTP 200, status page visible, no horizontal overflow. |

## Mobile Public Pages

| Route | Result | Notes |
| --- | --- | --- |
| `/` | PASS | HTTP 200, landing content visible, no horizontal overflow. |
| `/login` | PASS | HTTP 200, login UI visible, no horizontal overflow. |
| `/signup` | PASS | HTTP 200, signup UI visible, no horizontal overflow. |
| `/pricing` | PASS | HTTP 200, pricing content visible, no horizontal overflow. |
| `/privacy-policy` | PASS | HTTP 200, legal content visible, no horizontal overflow. |
| `/terms-of-service` | PASS | HTTP 200, legal content visible, no horizontal overflow. |
| `/data-deletion` | PASS | HTTP 200, data deletion instructions visible, no horizontal overflow. |
| `/status` | PASS | HTTP 200, status content visible, no horizontal overflow. |

## Console / Network Notes

```text
STAGING_CONSOLE_PUBLIC=PASS
STAGING_NETWORK_PUBLIC=PASS_WITH_NOTES
```

No browser console errors were observed on the checked public pages.

Observed network failures were limited to route-transition aborts and Vercel live overlay / RSC prefetch aborts such as `net::ERR_ABORTED`. No product route returned a 5xx response during this smoke.

## Not Covered

The following still require a reviewer-safe staging account or active logged-in browser session:

- Dashboard authenticated smoke.
- Channels / Instagram connected-channel evidence.
- Sidebar account dropdown evidence.
- Inbox reviewer-safe conversation evidence.
- Contacts reviewer-safe contact evidence.
- Automations reviewer-safe draft evidence.
- PayUNI Sandbox checkout evidence after login.
- Meta real asset / webhook evidence.

