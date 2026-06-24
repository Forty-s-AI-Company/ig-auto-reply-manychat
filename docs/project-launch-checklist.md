# Project Launch Checklist

## 2026-06-24 - Master / staging pre-launch audit

- `[x]` Produced `docs/master-staging-prelaunch-checklist.md`.
- `[x]` Confirmed Vercel Production has `INBOXPILOT_RELEASE_CHANNEL`.
- `[x]` Confirmed Vercel Preview has `INBOXPILOT_RELEASE_CHANNEL`.
- `[x]` Prepared the release-mode implementation and smoke tests for `master` / `staging` so the simple/full split can be committed and deployed.
- `[ ]` Preview currently needs explicit DB/runtime env confirmation; do not assume Production env vars are available to Preview.
- `[ ]` Production and staging DBs must be separated before real customer onboarding.

## 2026-06-24 - Release mode implementation

- `[x]` Added centralized release channel helper.
- `[x]` Production host defaults to simple release.
- `[x]` Non-production hosts default to full release.
- `[x]` `INBOXPILOT_RELEASE_CHANNEL` can override host detection for Vercel Production / Preview.
- `[x]` Simple release hides full-only nav items and non-IG connection options.
- `[x]` Simple release blocks full-only app routes and non-Instagram OAuth entry points in `src/proxy.ts`.
- `[x]` Added smoke tests for release channel detection and proxy behavior.
- `[ ]` Confirm the pushed `master` and `staging` deployments after Vercel finishes building.

## 2026-06-19 - Simple production release scope

Current launch direction:

- `[x]` Production custom domain uses simplified IG-first product surface.
- `[x]` Preview / testing deployment keeps full planned feature surface.
- `[x]` `staging.carry-digital-nomad.in.net` alias points to the current Preview deployment.
- `[x]` Staging alias auto-update workflow is documented and added through GitHub Actions.
- `[x]` Staging alias auto-update is restricted to successful `staging` branch Preview deployments.
- `[x]` Vercel Production env has `INBOXPILOT_RELEASE_CHANNEL=simple`.
- `[x]` Vercel Preview env has `INBOXPILOT_RELEASE_CHANNEL=full`.
- `[x]` Production simple release keeps Home, Inbox, Contacts, Instagram connection, Analytics, Automations, and Referrals.
- `[x]` Affiliate payout is not part of the first production surface.
- `[x]` GitHub Secrets are configured in the remote repository: `VERCEL_TOKEN` and `VERCEL_SCOPE`.
- `[ ]` Production and staging databases are still shared temporarily and must be separated before real customer onboarding.

Current known URLs:

```text
Production: https://inboxpilot.carry-digital-nomad.in.net
Staging: https://staging.carry-digital-nomad.in.net
Current Vercel Preview backing deployment: https://inboxpilot-ap79iimgd-a25814740s-projects.vercel.app
```

更新日期：2026-06-10

## 目前判定

- `[x]` 可以作為 private beta / 少量付費客戶上線
- `[ ]` 尚未達到可公開大規模販售 SaaS 標準

## 已完成

- `[x]` Workspace / membership / role 基礎結構
- `[x]` Inbox / Contacts / Tags / Segments
- `[x]` Automation / Broadcast / Sequence
- `[x]` IG / Meta webhook 基礎串接
- `[x]` Audit log / health check / worker / queue 骨架
- `[x]` PayUNI checkout / notify / return 基礎流程
- `[x]` Billing interval correctness
- `[x]` Zero-amount / credit-only checkout 正式 completion flow
- `[x]` `npm run lint`
- `[x]` `npm run build`
- `[x]` `npm test`
- `[x]` `npm run payuni:smoke`

## 上線前必做

- `[ ]` 完成 PayUNI production merchant review
- `[ ]` 建立 production 正式收款 SOP
- `[ ]` production 停用 Meta env token fallback
- `[ ]` 收斂 Meta OAuth production 主流程
- `[ ]` 整理 Billing / Terms / Privacy / Data Deletion / README 亂碼與對外文案

## 建議 Beta 前完成

- `[ ]` 補完整 plan enforcement
- `[ ]` 補 trial / expired / past_due / unpaid 產品限制
- `[ ]` 補 onboarding / reconnect UX
- `[ ]` 補 affiliate terms / refund policy / cookie policy

## 規模化前再做

- `[ ]` 高併發 load test 收斂
- `[ ]` queue-first ingestion / durable processing
- `[ ]` 補齊 WhatsApp / TikTok / SMS / LINE 正式產品化
