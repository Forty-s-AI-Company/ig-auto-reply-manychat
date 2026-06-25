# Project Launch Checklist

## 2026-06-26 - Meta / PayUNI launch package preparation

- `[x]` Prepared Meta App Review submission package: `docs/meta-app-review-submission-package.md`.
- `[x]` Prepared PayUNI production go-live checklist: `docs/payuni-production-go-live-checklist.md`.
- `[x]` Documented Meta reviewer recording, screenshot, permission matrix, redaction, dashboard, and Go / Hold requirements.
- `[x]` Documented PayUNI production env, dashboard, controlled enablement, callback verification, rollback, and Go / Hold requirements.
- `[x]` Did not submit Meta App Review.
- `[x]` Did not enable PayUNI production checkout.
- `[x]` Did not execute a live card transaction.
- `[ ]` Complete Meta reviewer assets, recording, screenshots, redaction review, and final submission.
- `[ ]` Complete PayUNI merchant approval and operator-approved low-value production smoke.

## 2026-06-26 - PR #2 post-deploy launch readiness delta

- `[x]` PR #2 is merged into `master` at merge commit `5d014be`.
- `[x]` PR #3 is merged into `master` at merge commit `cf9e80c`.
- `[x]` Production was deployed after PR #2 and is Ready at deployment `dpl_2Ramd6D54Xn1qc7vxxsgXGXacUni`.
- `[x]` Production was redeployed after PR #3 through controlled Vercel CLI deployment `dpl_GGk9zyF3r1F1hZ6ons3Fzfh6y5hL`.
- `[x]` `https://inboxpilot.carry-digital-nomad.in.net` resolves to the PR #2 production deployment.
- `[x]` `https://inboxpilot.carry-digital-nomad.in.net` resolves to the controlled PR #3 production deployment after running `Update Production Alias`.
- `[x]` `https://staging.carry-digital-nomad.in.net` remains on a Preview deployment from the `staging` branch.
- `[x]` Production `/api/health` returned `status=ok` with database and redis checks ok.
- `[x]` Staging `/api/health/staging` returned `status=ok`, `deployment=staging`, `dbEnv=staging`, `releaseChannel=full`, and `vercelEnv=preview`.
- `[x]` Production Instagram connect page returned HTTP 200.
- `[x]` Production Meta global fallback hardening is live by deployed code plus production deployment target: production runtime disables fallback to global `META_PAGE_ACCESS_TOKEN` and `META_INSTAGRAM_BUSINESS_ACCOUNT_ID`.
- `[x]` Added route-level tenant isolation regression tests for channel update, contact read/tagging, manual automation run, and PayUNI checkout idempotency/invoice scope.
- `[x]` Non-DB launch regression suite passed: 12 files, 43 tests.
- `[ ]` Authenticated channel reconnect smoke is still required for any workspace that previously depended on global Meta fallback.
- `[ ]` Meta App Review / Advanced Access / Business Verification evidence remains a public paid launch gate.
- `[ ]` PayUNI production merchant approval and first low-value production checkout smoke remain public paid launch gates.
- `[ ]` DB-backed tenant isolation regression suite still needs to run against staging/fresh test DB before public paid launch.

## 2026-06-26 - Public paid launch gate cleanup

- `[x]` Added production deployment env helper for runtime-sensitive guards.
- `[x]` Disabled production Meta global env fallback for channel token and Instagram business account id paths.
- `[x]` Production webhook channel updates no longer add `META_PAGE_ACCESS_TOKEN` fallback markers.
- `[x]` Production execution of `scripts/refresh-meta-token.mjs` is blocked.
- `[x]` Added regression coverage for production Meta fallback disablement.
- `[x]` Added PayUNI Production SOP.
- `[x]` Updated Billing, Terms, Privacy, and Data Deletion copy for controlled payments, PayUNI handling, refunds, workspace isolation, and audit retention.
- `[x]` Deploy this change through the controlled Production deployment process.
- `[x]` Re-run Production `/api/health` and public simple-release smoke after deployment.
- `[x]` Add first broader route-level tenant isolation regression coverage.
- `[ ]` Run authenticated tenant-safe smoke after deployment.
- `[ ]` Run DB-backed tenant isolation regression coverage against staging/fresh test DB before public paid launch.
- `[ ]` Complete Meta App Review / Advanced Access / Business Verification evidence.
- `[ ]` Complete PayUNI merchant review and first low-value production checkout smoke.

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

## 2026-06-26 - Public paid launch control room

- `[x]` PR #5 has been merged into `master` with the Meta App Review package, reviewer recording shot list, screenshot redaction checklist, reviewer-safe test asset handoff checklist, and PayUNI go-live checklist.
- `[x]` Master CI passed after merge: lint, test, and build.
- `[x]` Merge-created Vercel deployment was Preview-only and Ready; no manual Production redeploy was performed in this step.
- `[x]` Production custom domain still points to a Ready Production deployment.
- `[x]` Staging custom domain still points to a Ready Preview deployment.
- `[x]` Production `/api/health` returns `status=ok`, `database.ok=true`, and `redis.ok=true`.
- `[x]` Staging `/api/health/staging` returns `status=ok`, `dbEnv=staging`, `releaseChannel=full`, and `vercelEnv=preview`.
- `[x]` Added the launch control room: `docs/public-paid-launch-control-room.md`.
- `[ ]` Meta App Review / Advanced Access / Business Verification must be completed manually before public paid launch.
- `[ ]` PAYUNi production merchant approval and first low-value live checkout smoke must be completed manually before public paid launch.

Current decision:

- Private beta / whitelist: Go.
- Public paid launch: Hold until Meta and PayUNI external gates are complete.

## 2026-06-26 - Meta App Review operator package

- `[x]` Added `docs/meta-app-review-operator-submission-workbook.md`.
- `[x]` Consolidated reviewer recording, screenshot capture, Dashboard field checklist, permission evidence mapping, safe submission text, redaction review, and upload manifest into one operator-facing package.
- `[x]` Added `docs/meta-app-review-day-of-recording-run-card.md` for the actual recording/submission-prep day.
- `[ ]` Human operator still needs to prepare reviewer-safe credentials through a secure handoff method.
- `[ ]` Human operator still needs to capture the final recording/screenshots and run visual redaction review.
- `[ ]` Human operator still needs to fill Meta Dashboard and submit manually.
