# PayUNI Production SOP

Last updated: 2026-06-26.

## Purpose

This SOP controls when InboxPilot can switch PayUNI from sandbox to production payments.

The goal is to avoid accidental public charging before merchant review, callback verification, refund handling, and customer-facing billing copy are ready.

## Current Decision

- Private beta / whitelist billing: allowed with manual operator review.
- Public automatic paid checkout: Hold until every Go condition below is complete.
- Production DB or schema changes are out of scope for this SOP.

## Go Conditions

- PayUNI production merchant account is approved.
- Production `PAYUNI_GATEWAY_URL` points to the production PayUNI API host.
- Production `PAYUNI_MERCHANT_ID`, `PAYUNI_HASH_KEY`, and `PAYUNI_HASH_IV` are set in Vercel Production as secrets.
- Production `PAYUNI_RETURN_URL` points to `https://inboxpilot.carry-digital-nomad.in.net/api/billing/payuni/return`.
- Production `PAYUNI_NOTIFY_URL` points to `https://inboxpilot.carry-digital-nomad.in.net/api/billing/payuni/notify`.
- `PAYUNI_ALLOW_PRODUCTION=true` is set only after a successful controlled smoke test.
- Notify callback signature verification has been tested with a production-like callback.
- Duplicate notify / return callbacks are idempotent.
- Failed payment does not activate a subscription.
- Refund, chargeback, cancellation, and settlement reconciliation owner is assigned.
- Terms, Privacy, Data Deletion, and Billing page copy are reviewed for public customers.

## Hold Conditions

Keep production checkout disabled if any of these are true:

- Merchant review is not approved.
- Production signing credentials are missing or recently rotated without smoke verification.
- Return / notify URLs do not match the PayUNI dashboard.
- Production callback logs show signature mismatch, unknown order, or duplicate handling errors.
- Settlement / refund process owner is not assigned.
- Legal / billing copy is unclear or still describes only sandbox behavior.

## Controlled Enablement Steps

1. Confirm Production `/api/health` is healthy.
2. Confirm current Production deployment and alias are correct.
3. Confirm the current deployment has no pending DB/schema migration.
4. Confirm Production PayUNI env names exist in Vercel without printing values.
5. Confirm PayUNI dashboard return / notify URLs match the Production URLs.
6. Set or confirm `PAYUNI_ALLOW_PRODUCTION=true`.
7. Redeploy Production only through the controlled deployment process.
8. Create one low-value production checkout from a whitelisted operator account.
9. Confirm payment order, invoice, subscription, return callback, notify callback, and audit event are consistent.
10. Confirm repeated notify delivery does not duplicate subscription, wallet, affiliate, or referral side effects.
11. Record settlement and refund handling notes in the launch log.

## Rollback

Use this order:

1. Set `PAYUNI_ALLOW_PRODUCTION=false` in Vercel Production.
2. Redeploy Production or rollback to the last known good deployment.
3. Confirm checkout returns the controlled disabled message.
4. Keep return / notify endpoints online so already-started transactions can settle.
5. Review pending orders manually before retrying.

## Customer Support Notes

- Do not ask customers for full card numbers.
- Do not store card numbers, OTP, CVV, or 3-D Secure data in InboxPilot.
- For payment disputes, identify orders by InboxPilot invoice number, PayUNI trade number, user email, and workspace.
- Refund and cancellation decisions should be recorded in the audit log or operator notes.
