# Public Paid Launch Control Room

Last updated: 2026-06-26.

## Purpose

This document is the single launch control room for InboxPilot public paid launch readiness.

It links the already-prepared Meta, PayUNI, deployment, and database runbooks into one decision path. It does not submit Meta App Review, enable PayUNI live charging, run production checkout, modify Vercel env, or touch the database.

## Current Decision

```text
Private beta / whitelist launch: Go
Public paid launch: Hold
Reason: remaining external platform and payment gates require operator action.
```

Codex-direct gates are complete enough for private beta:

- Production health is `ok`.
- Staging health is `ok`.
- Production and staging custom domains are mutually isolated.
- Production Prisma migration-history baseline is complete.
- Production simple release is deployed.
- Staging full release is available for QA.
- Meta global fallback token paths are hardened in the latest merged launch package.
- Meta submission package and reviewer handoff documents exist.
- PayUNI production go-live checklist and SOP exist.

Public paid launch is still Hold because these cannot be completed safely by Codex without external approval or live platform actions:

- Meta App Review / Advanced Access / Business Verification submission and approval.
- Reviewer-safe Meta test account and test asset final handoff.
- Final reviewer recording and screenshot package capture.
- PAYUNi merchant dashboard production approval confirmation.
- Explicit approval to enable `PAYUNI_ALLOW_PRODUCTION=true`.
- First low-value production checkout smoke and settlement verification.

## Launch Surface

Production URL:

```text
https://inboxpilot.carry-digital-nomad.in.net
```

Staging URL:

```text
https://staging.carry-digital-nomad.in.net
```

Production surface:

- Dashboard / home
- Inbox
- Contacts
- Instagram connection
- Analytics
- Automations
- Referrals as invite/referral activity

Deferred from first public paid release:

- Affiliate cash payout
- Multi-platform production connection beyond Instagram
- Unreviewed full-release surfaces
- Production PayUNI live checkout until the controlled go-live window

## Readiness Matrix

| Area | Current status | Go condition | Next owner |
| --- | --- | --- | --- |
| Production runtime | Go | `/api/health` returns `status=ok`; alias points to Ready Production deployment. | Codex can verify |
| Staging runtime | Go | `/api/health/staging` returns `status=ok`, `dbEnv=staging`, `releaseChannel=full`. | Codex can verify |
| Database baseline | Go | `prisma migrate status` clean after production baseline; future schema changes use reviewed migrations. | Codex can verify only with safe credentials |
| Alias automation | Go | Production alias workflow only accepts Ready Production deployments; staging alias workflow only accepts staging Preview deployments. | Codex can verify |
| Meta production fallback | Go for current code | Production does not use global Meta env token fallback as tenant credential substitute. | Codex can test |
| Meta App Review | Hold | Final recording, screenshot package, permission proof, test assets, Dashboard fields, and submission approval are complete. | Operator / Meta |
| PayUNI production | Hold | Merchant approval, dashboard URLs, env names, controlled enablement, first low-value transaction, callback/idempotency, settlement note. | Operator / PayUNI |
| Tenant isolation | Partial Go | Existing smoke and Meta fallback tests pass; broader workspace-scoped regression should continue before scale. | Codex can expand |
| Legal / billing copy | Go for beta | Terms, Privacy, Data Deletion, Billing copy explain PayUNI/payment/data boundaries. | Operator final read |

## Meta App Review Execution Path

Primary documents:

- `docs/meta-app-review-submission-package.md`
- `docs/meta-reviewer-recording-shot-list.md`
- `docs/meta-app-review-screenshot-redaction-checklist.md`
- `docs/meta-reviewer-test-asset-handoff-checklist.md`

Final sequence:

1. Confirm production health.
2. Confirm Meta Dashboard URLs match production URLs.
3. Confirm requested permissions match the visible production product surface.
4. Prepare reviewer-safe test user and Instagram test asset.
5. Run reviewer flow once in a clean browser profile.
6. Capture reviewer recording using the shot list.
7. Capture screenshots.
8. Run redaction search and manual visual review.
9. Upload package manually in Meta Dashboard.
10. Record submission ID and reviewer feedback in the launch log.

Do not upload if any artifact shows:

- Access token, refresh token, app secret, client secret, authorization code, raw state, nonce, cookie, localStorage, database URL, Vercel env screen, Supabase secret screen, PAYUNi secret, or real customer data.

## PayUNI Production Execution Path

Primary documents:

- `docs/payuni-production-go-live-checklist.md`
- `docs/payuni-production-sop.md`
- `docs/billing-affiliate-readiness.md`

Final sequence:

1. Confirm production health.
2. Confirm Production `PAYUNI_*` env names exist without printing values.
3. Confirm PAYUNi merchant dashboard ReturnURL and NotifyURL.
4. Confirm support owner for refund, failed payment, duplicate callback, chargeback, and settlement reconciliation.
5. Get explicit operator approval for live low-value smoke.
6. Set `PAYUNI_ALLOW_PRODUCTION=true` only during the controlled payment window.
7. Redeploy production through the controlled deployment process.
8. Run one low-value checkout from a whitelisted operator account.
9. Verify return, notify, idempotency, invoice, subscription, audit, and settlement note.
10. Decide whether to keep live checkout enabled or set `PAYUNI_ALLOW_PRODUCTION=false`.

Stop immediately if:

- Merchant approval is not complete.
- Dashboard URLs do not match production.
- Callback signature or idempotency evidence is unclear.
- Any payment or audit log exposes card number, CVV, OTP, Hash Key, Hash IV, or raw secret.

## Final 30-Minute Pre-Launch Checklist

Run this checklist before announcing public paid launch.

- `[ ]` Production `/api/health` returns `status=ok`.
- `[ ]` Staging `/api/health/staging` returns `status=ok`.
- `[ ]` Production domain points to Ready Production deployment.
- `[ ]` Staging domain points to Ready staging Preview deployment.
- `[ ]` Latest `master` CI is green.
- `[ ]` No pending Prisma/schema/data migration is waiting.
- `[ ]` Meta App Review is approved for the exact requested permissions.
- `[ ]` Business Verification / Advanced Access status is acceptable for launch.
- `[ ]` Meta reviewer assets are cleaned up or converted into launch-safe test assets.
- `[ ]` PayUNI merchant production approval is confirmed.
- `[ ]` First low-value PayUNI production smoke is complete.
- `[ ]` Refund, failed payment, duplicate callback, and settlement owners are assigned.
- `[ ]` Terms, Privacy, Data Deletion, and Billing pages have had a final human read.
- `[ ]` Support contact / escalation path is ready.
- `[ ]` Launch log has final Go decision with owner and timestamp.

## Go / Hold Rule

Private beta can proceed when:

- Production health is ok.
- Staging is healthy for QA.
- The customer is whitelisted.
- Payment can be manual or carefully operator-assisted.
- Meta credentials are verified on the selected test/production asset.

Public paid launch can proceed only when:

- Meta approval is complete.
- PayUNI production is enabled and smoke-tested.
- Production checkout, callback, subscription, and audit behavior are verified.
- Legal/billing pages are final enough for real customers.
- Support owner is ready for payment and platform issues.

Hold if:

- Any required Meta permission is not approved.
- Any payment callback path is unverified.
- Any artifact leaks a secret or real customer data.
- Production/staging alias isolation is broken.
- A DB/schema change is pending without the production migration runbook.

