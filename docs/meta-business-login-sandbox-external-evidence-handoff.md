# Meta Business Login Sandbox External Evidence Handoff

Date: 2026-06-15  
Status: Handoff required  
Scope: Real Meta App Dashboard and dialog evidence collection

## Current State

The local sandbox scaffold is complete and validated, but external Meta evidence has not been collected.

Current local status:

| Area | Status |
| --- | --- |
| Internal dry-run scaffold | Pass |
| Redaction helpers | Pass |
| Production write guard | Pass |
| Production isolation regression | Pass |
| Local evidence packet | Pass |
| Real Meta App Dashboard evidence | Hold |
| Real Meta dialog evidence | Hold |
| Account selection UX evidence | Hold |
| App Review reviewer demo evidence | Hold |
| Internal beta | No-Go |
| Production implementation | No-Go |

## Chrome Attempt Record

Chrome was opened to:

```text
https://developers.facebook.com/apps/
```

Observed page metadata before automation was blocked:

```text
Title: 所有應用程式 - Meta for Developers
URL: https://developers.facebook.com/apps/
```

Automation could not read the page DOM because Chrome reported another extension UI was open on the page.

This is not valid Meta App Review evidence. It only means evidence collection is blocked until the user closes or completes the blocking Chrome extension UI.

## Resume Attempt Record

After the user asked Codex to continue, Chrome automation could again list and claim Meta-related tabs.

Observed safe metadata:

```text
Title: 所有應用程式 - Meta for Developers
URL: https://developers.facebook.com/apps/
```

Additional observations:

- DOM snapshot / page evaluate / screenshot attempts against the Meta Apps page timed out.
- A direct navigation attempt to the Business Login settings URL redirected back to `https://developers.facebook.com/apps/`.
- No Meta App Dashboard settings, Business Login settings, App Review status, permission status, Meta dialog UX, account selection UX, or callback evidence was collected.
- No token, authorization code, app secret, client secret, webhook verify token, raw state, raw nonce, full callback URL, reusable authorize URL, or unmasked Meta asset id was captured.

This remains a handoff state, not App Review evidence.

## Required User Handoff Step

Before continuing external evidence collection:

1. In Chrome, close or complete the extension UI currently blocking automation.
2. Keep the Meta Developers Apps page open if possible.
3. Do not paste tokens, authorization codes, app secrets, client secrets, webhook verify tokens, raw state, raw nonce, full callback URLs, or reusable authorize URLs into chat or docs.
4. Ask Codex to continue from the open Chrome tab.

## Evidence Collection Goals After Chrome Is Unblocked

Collect redacted evidence for:

| Evidence | Required output | Redaction rule |
| --- | --- | --- |
| Meta App Dashboard app list / selected app | App name or masked app id only | Do not record app secret |
| Product settings | Whether Facebook Login for Business / Instagram Business Login is available | Do not record secret fields |
| Valid OAuth redirect URI settings | Host/path only | Do not record query strings |
| Permission list | Permission names and status | Do not record access tokens |
| App Review status | Review status and missing items | Do not record reviewer private notes beyond necessary status |
| Meta dialog UX | Screenshot or textual observation | Do not include raw code/state/callback URL |
| Business / Page / IG selection | Whether account selection is shown | Mask business/page/IG ids |
| Callback result | Redacted callback evidence packet only | Replace code/state/nonce/callback URL |

## Expected Next Codex Flow

When Chrome is unblocked, continue with:

1. Claim the open Meta Developers Apps tab.
2. Identify whether the user is logged in.
3. If multiple apps are shown, inspect only visible app metadata; do not open secret settings unless needed.
4. Open the relevant app dashboard if it is clearly identifiable.
5. Record:
   - Product availability.
   - OAuth / callback configuration shape.
   - App Review status.
   - Permission review status.
6. If a sandbox authorize flow is run, capture only redacted authorize / callback evidence.
7. Backfill:
   - `docs/meta-business-login-sandbox-runbook-template.md`
   - `docs/meta-business-login-sandbox-experiment-report-template.md`
   - `docs/meta-business-login-sandbox-go-no-go-checklist.md`
   - `docs/meta-business-login-sandbox-implementation-final-report.md`
   - `docs/meta-app-review-checklist.md`
   - `docs/security-review.md`
   - `docs/fix-roadmap.md`
   - `docs/codex-session-log.md`

## Go / No-Go

Current decision:

```text
External evidence collection: Hold
Internal beta: No-Go
Production implementation: No-Go
```

Reason:

Real Meta App Dashboard, Meta dialog, account selection UX, redacted callback, reviewer demo, and App Review evidence have not been collected yet.

## Explicit Boundaries

Still do not:

- Modify the production Instagram OAuth flow.
- Modify existing callback routes.
- Modify login buttons.
- Modify env files.
- Modify Prisma schema.
- Create or update production ConnectedAccount records.
- Create or update production Channel records.
- Perform real Meta token exchange unless a later approved sandbox execution task explicitly allows it.
- Store token, code, secret, raw state, raw nonce, full callback URL, or reusable authorize URL in docs, logs, audit, screenshots, or reports.
