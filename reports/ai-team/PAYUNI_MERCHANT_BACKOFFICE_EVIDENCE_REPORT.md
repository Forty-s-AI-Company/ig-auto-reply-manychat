# PayUNI Merchant Back-Office Evidence Report

Generated: 2026-07-06

## Scope

This report covers PayUNI Sandbox merchant back-office evidence only.

No Production deployment was performed. No production database was touched. PayUNI production was not enabled. Meta App Review was not submitted. No PayUNI credentials, cookies, tokens, or secrets were read, printed, stored, or committed.

## Transaction Verified

```text
Merchant trade no: IG1783269991397IRV10ADFA1A2
Plan: Starter monthly
App-side checkout: PASS
Return URL: PASS
Entitlement opened: PASS
Invoice / order status in InboxPilot staging: paid
```

## Browser Session Check

```text
Current browser URL: https://sandbox.payuni.com.tw/auth/transactions/detail
PayUNI Sandbox merchant console logged in: YES
Sandbox environment confirmed: YES
PAYUNI_MERCHANT_BACKOFFICE_EVIDENCE=PASS
```

Confirmation basis:

- Browser host is `sandbox.payuni.com.tw`.
- Page banner states the website is using the PayUNI test environment / Sandbox.
- The searched merchant trade no is visible in the PayUNI Sandbox merchant back office.

## Back-Office Evidence

| Evidence item | Status | Notes |
| --- | --- | --- |
| Transaction search by merchant trade no | PASS | `IG1783269991397IRV10ADFA1A2` appears in the transaction dynamic detail list. |
| Transaction detail screenshot | PASS | Screenshot captured from the merchant transaction detail overlay/list. |
| Payment status screenshot | PASS | Status is visible as `已付款 / 請款成功`. |
| Sandbox confirmation | PASS | URL and banner confirm Sandbox / test environment. |
| Notify / callback confirmation | PARTIAL | App-side return callback completed and opened entitlement. Independent server-log delivery evidence remains optional unless required by final reviewer acceptance. |

## Non-Sensitive Transaction Fields

```text
UNI sequence no: 1783269996965076165
Merchant trade no: IG1783269991397IRV10ADFA1A2
Transaction date: 2026-07-06 00:46:36
Payment date: 2026-07-06 00:46:36
Payment method: Sandbox credit card, one-time 3D payment
Order amount: NT$199
Collected amount: NT$199
Merchant back-office status: 已付款 / 請款成功
Request time: 2026-07-06 00:46:38
```

Sensitive values such as cookies, tokens, credentials, signatures, and full card numbers were not recorded.

## Screenshot Paths

- `reports/ai-team/payuni-sandbox-evidence/07-payuni-merchant-search-result.png`
- `reports/ai-team/payuni-sandbox-evidence/08-payuni-merchant-transaction-detail.png`
- `reports/ai-team/payuni-sandbox-evidence/09-payuni-merchant-payment-status.png`

## Release Gate Result

```text
PAYUNI_MERCHANT_BACKOFFICE_EVIDENCE=PASS
PAYUNI_SANDBOX_GATE=PASS
PAYUNI_PRODUCTION_SWITCH=NOT_STARTED_HUMAN_GATE
NEXT_REQUIRED_ACTION=Continue Meta reviewer-safe asset lane and final human acceptance. Do not switch PayUNI production.
```

## Can PayUNI Sandbox Gate Be Considered Complete?

Yes, for Sandbox evidence.

The app-side payment, return URL, invoice, order, entitlement, and merchant back-office transaction evidence are now collected. PayUNI production switching remains a separate human gate and was not started.
