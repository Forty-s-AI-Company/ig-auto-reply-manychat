# PayUNI Production Go-Live Checklist

Last updated: 2026-06-26.

## Purpose

This checklist prepares InboxPilot for PayUNI production go-live without enabling live charging or running a real card transaction.

Do not set `PAYUNI_ALLOW_PRODUCTION=true`, redeploy for live charging, or run a production checkout unless the operator explicitly approves that step.

## External Reference Baseline

PAYUNi SDK references describe separate test/production usage, `UniversalTrade` request creation, and `ResultProcess` handling for ReturnURL / NotifyURL callbacks. The SDK also notes that Hash Key and Hash IV are obtained from PAYUNi platform merchant integration settings.

Reference URLs:

- `https://github.com/payuni/PHP_SDK`
- `https://github.com/payuni/NET_SDK`
- `https://www.payuni.com.tw/`

## Current InboxPilot Implementation

Relevant files:

- `src/app/api/billing/payuni/checkout/route.ts`
- `src/app/api/billing/payuni/return/route.ts`
- `src/app/api/billing/payuni/notify/route.ts`
- `src/lib/payuni.ts`
- `src/lib/billing/payuni-callback.ts`
- `src/lib/billing/payment-service.ts`
- `docs/payuni-production-sop.md`

Current safety behavior:

- Production checkout remains blocked unless `PAYUNI_ALLOW_PRODUCTION=true`.
- Checkout requires auth, same-origin check, rate limit, and idempotency handling.
- Notify verifies `HashInfo`.
- Paid order duplicate callback handling is idempotent.
- Card number, CVV, OTP, and 3-D Secure data are handled by PayUNI/bank pages, not InboxPilot.

## Required Production Env Names

Confirm these exist in Vercel Production without printing values:

```text
PAYUNI_MERCHANT_ID
PAYUNI_HASH_KEY
PAYUNI_HASH_IV
PAYUNI_VERSION
PAYUNI_GATEWAY_URL
PAYUNI_RETURN_URL
PAYUNI_NOTIFY_URL
PAYUNI_ALLOW_PRODUCTION
```

Expected production URLs:

```text
PAYUNI_RETURN_URL=https://inboxpilot.carry-digital-nomad.in.net/api/billing/payuni/return
PAYUNI_NOTIFY_URL=https://inboxpilot.carry-digital-nomad.in.net/api/billing/payuni/notify
```

Expected default:

```text
PAYUNI_ALLOW_PRODUCTION=false
```

Set `PAYUNI_ALLOW_PRODUCTION=true` only during the controlled enablement window.

## PAYUNi Dashboard Checklist

Confirm in PAYUNi merchant dashboard:

- Production merchant account is approved.
- Merchant ID matches Vercel Production `PAYUNI_MERCHANT_ID`.
- Hash Key and Hash IV are current and stored only as Vercel encrypted/sensitive env values.
- Return URL matches production return endpoint.
- Notify URL matches production notify endpoint.
- Any required IP/domain allowlist includes the production Vercel/custom domain configuration.
- Enabled payment methods match the public billing copy.
- Refund/cancel permissions and settlement reports are available to the assigned operator.

## Pre-Go-Live Checks

Run before enabling live charging:

```powershell
npm run lint
npm run build
npm run payuni:smoke
curl.exe -sS https://inboxpilot.carry-digital-nomad.in.net/api/health
```

Also confirm:

- No pending Prisma migration or DB maintenance window.
- Production custom domain points to the intended Ready Production deployment.
- Billing page shows PayUNI production as controlled until enabled.
- Terms / Privacy / Data Deletion pages describe PayUNI handling and retention boundaries.
- Support owner is assigned for failed payment, duplicate callback, refund, cancellation, chargeback, and settlement reconciliation.

## Controlled Enablement Steps

These steps are for the actual go-live window. Do not execute them from this document without explicit approval.

1. Announce short payment maintenance window.
2. Confirm production health is ok.
3. Confirm production alias points to intended deployment.
4. Confirm PAYUNi dashboard ReturnURL / NotifyURL.
5. Confirm Vercel Production env names exist without printing values.
6. Set `PAYUNI_ALLOW_PRODUCTION=true` in Vercel Production.
7. Redeploy Production through the controlled deployment process.
8. Confirm `/api/health` remains ok.
9. Use one whitelisted operator account to start a low-value checkout.
10. Complete payment on PayUNI/bank page.
11. Confirm return callback reaches `/billing?payment=success`.
12. Confirm notify callback marks the order paid exactly once.
13. Confirm invoice/subscription interval and workspace/user scope are correct.
14. Confirm audit log has no card number, CVV, OTP, Hash Key, Hash IV, or raw secret.
15. Record settlement/reconciliation note in the launch log.

## Callback Verification

For the first live transaction, verify:

- `PaymentOrder.status` changes from pending to paid once.
- Duplicate notify does not create duplicate subscription, wallet, referral, affiliate, invoice, or audit side effects.
- Failed/canceled transaction does not activate subscription.
- Return route and notify route both use the same callback handling rules.
- `HashInfo` mismatch is rejected.
- Unknown order is rejected or safely ignored.

## Rollback

Use this order if anything looks wrong:

1. Set `PAYUNI_ALLOW_PRODUCTION=false` in Vercel Production.
2. Redeploy Production or rollback to last known good deployment.
3. Confirm checkout returns the controlled disabled message.
4. Keep return/notify endpoints online so already-started transactions can settle.
5. Export affected order IDs for manual reconciliation.
6. Notify support owner and record the incident in launch log.

## Go / Hold

Go only when:

- Merchant approval is complete.
- Production env names exist and are current.
- ReturnURL and NotifyURL match dashboard.
- `PAYUNI_ALLOW_PRODUCTION` switch plan is approved.
- Production health is ok.
- First low-value production smoke has explicit operator approval.
- Refund/settlement owner is assigned.

Hold if:

- Merchant approval is incomplete.
- Hash Key / Hash IV were rotated without smoke verification.
- Dashboard URLs do not match app URLs.
- Callback idempotency is unverified.
- Legal/billing copy is unclear.
- No owner exists for failed payments and refunds.

## Final Operator Steps

1. Complete dashboard/env verification.
2. Get operator approval for live low-value smoke.
3. Enable `PAYUNI_ALLOW_PRODUCTION=true`.
4. Redeploy production.
5. Run one low-value payment.
6. Verify callback/idempotency/audit/settlement.
7. Decide whether to keep production checkout enabled or roll back to disabled.

This document intentionally stops before live charging.
