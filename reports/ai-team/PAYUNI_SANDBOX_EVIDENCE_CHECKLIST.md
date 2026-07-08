# PayUNI Sandbox Evidence Checklist

Generated: 2026-07-06

## Scope

This checklist prepares PayUNI Sandbox evidence only. It does not authorize PayUNI production switching or real production transactions.

## Rules

- PayUNI must remain Sandbox.
- Do not use production keys.
- Do not use real card data.
- Do not switch production gateway.
- Do not expose keys, transaction signatures, or secrets in screenshots.

## Test Plan

### 1. Pre-Checkout

- [x] Log in to staging with reviewer-safe account.
- [x] Go to Billing / plan page.
- [x] Confirm Sandbox wording is visible.
- [x] Select a test plan.
- [x] Confirm amount / plan name before checkout.

Pass standard:

- User can tell this is Sandbox.
- Pricing and plan state are understandable.

### 2. Sandbox Checkout

- [x] Start PayUNI checkout.
- [x] Confirm gateway URL is Sandbox.
- [x] Use sandbox test card or sandbox payment method.
- [x] Complete payment.
- [x] Capture screenshot of PayUNI Sandbox page.

Pass standard:

- No production gateway.
- Sandbox payment can complete or clearly simulate completion.

### 3. Return URL

- [x] Confirm PayUNI return URL redirects back to InboxPilot.
- [x] Capture return page / billing status.
- [x] Confirm user-readable result message.

Pass standard:

- Return flow works.
- No raw payment error is exposed.

### 4. Notify URL / Entitlement

- [x] Confirm notify URL is configured for Sandbox.
- [x] Confirm entitlement / subscription / invoice state after payment.
- [x] Capture Billing UI state.
- [ ] If notify is asynchronous, record delay and final status.

Pass standard:

- Plan entitlement is understandable.
- Invoice / subscription state is consistent.

### 5. Back Office / Transaction Evidence

- [x] Capture PayUNI Sandbox transaction detail.
- [x] Record transaction ID.
- [x] Capture final paid / simulated-paid state.
- [x] Confirm the merchant back-office page is Sandbox / test environment.

Pass standard:

- Transaction ID is recorded.
- Payment result is auditable.

## Fields To Fill

```text
PayUNI sandbox checkout completed: YES
Plan tested: Starter
Billing interval: Month
Payment method: Sandbox credit card, one-time payment
Sandbox transaction ID / merchant trade no: IG1783269991397IRV10ADFA1A2
Checkout screenshot path: reports/ai-team/payuni-sandbox-evidence/04-payuni-sandbox-before-card-entry.png
Return URL screenshot path: reports/ai-team/payuni-sandbox-evidence/05-return-or-payment-result.png
Billing after-payment screenshot path: reports/ai-team/payuni-sandbox-evidence/06-billing-after-payment.png
PayUNI back-office screenshot path: reports/ai-team/payuni-sandbox-evidence/07-payuni-merchant-search-result.png; reports/ai-team/payuni-sandbox-evidence/08-payuni-merchant-transaction-detail.png; reports/ai-team/payuni-sandbox-evidence/09-payuni-merchant-payment-status.png
Notify result: RETURN_CALLBACK_PASS; independent asynchronous NotifyURL delivery was not separately observable from browser-only evidence.
Entitlement result: PASS - Billing UI shows Starter active, next period 2026-08-05, invoice paid, PayUNI order paid.
PAYUNI_APP_SIDE_CHECKOUT=PASS
PAYUNI_RETURN_URL=PASS
PAYUNI_ENTITLEMENT_OPENED=PASS
PAYUNI_MERCHANT_BACKOFFICE_EVIDENCE=PASS
Merchant trade no: IG1783269991397IRV10ADFA1A2
Merchant back-office transaction status: PASS - 已付款 / 請款成功
Merchant back-office screenshot paths: reports/ai-team/payuni-sandbox-evidence/07-payuni-merchant-search-result.png; reports/ai-team/payuni-sandbox-evidence/08-payuni-merchant-transaction-detail.png; reports/ai-team/payuni-sandbox-evidence/09-payuni-merchant-payment-status.png
Confirmed Sandbox transaction: YES - browser host is sandbox.payuni.com.tw and page banner says test environment / Sandbox.
Remaining blocker: None for PayUNI Sandbox evidence. PayUNI production switch remains a separate human gate.
```

## Current Status

```text
PAYUNI_SANDBOX_EVIDENCE_READY=PASS
PAYUNI_SANDBOX_CHECKOUT_RETURN_ENTITLEMENT=PASS
PAYUNI_BACK_OFFICE_EVIDENCE=PASS
PAYUNI_NOTIFY_DELIVERY_EVIDENCE=PARTIAL - app-side return callback completed; independent async notify server-log evidence remains optional.
PAYUNI_PRODUCTION_SWITCH=NO
NEXT_REQUIRED_ACTION=Continue Meta reviewer-safe asset lane and final human acceptance. Do not switch PayUNI production.
```

## Evidence Collected On Staging

- Staging reviewer-safe login: PASS.
- Billing / plan page reached with Sandbox wording: PASS.
- Starter monthly checkout reached PayUNI Sandbox: PASS.
- Sandbox credit card payment completed: PASS.
- Return URL redirected back to InboxPilot `/billing?payment=success`: PASS.
- Billing toast displayed `付款已完成 / 帳單與訂閱已更新`: PASS.
- Subscription / entitlement opened: PASS, current plan became `Starter`.
- Invoice status displayed as `已付款`: PASS.
- Recent PayUNI order displayed as `已付款`: PASS.

## Merchant Back-Office Evidence

Current status: `PASS`.

The in-app browser was logged in to the PayUNI Sandbox merchant back office and left on the transaction dynamic detail page. No PayUNI merchant credentials, tokens, cookies, or secrets were read, stored, or printed.

Observed non-sensitive merchant evidence:

- Host / environment: `sandbox.payuni.com.tw`, visible Sandbox / test environment banner.
- UNI sequence no: `1783269996965076165`.
- Merchant trade no: `IG1783269991397IRV10ADFA1A2`.
- Transaction date / payment date: `2026-07-06 00:46:36`.
- Payment method: Sandbox credit card, one-time 3D payment.
- Order amount / collected amount: `NT$199` / `NT$199`.
- Merchant back-office status: `已付款 / 請款成功`.
- Request time: `2026-07-06 00:46:38`.

Captured screenshot paths:

- `reports/ai-team/payuni-sandbox-evidence/07-payuni-merchant-search-result.png`
- `reports/ai-team/payuni-sandbox-evidence/08-payuni-merchant-transaction-detail.png`
- `reports/ai-team/payuni-sandbox-evidence/09-payuni-merchant-payment-status.png`

## Notes

- Card details were read from local `.env.local` and were not committed or printed.
- Screenshots intentionally avoid exposing full card data.
- The app-side paid state proves the PayUNI callback handler completed through the return flow. The notify route shares the same callback handler, but independent asynchronous delivery evidence still requires server logs or PayUNI Sandbox back-office confirmation.
