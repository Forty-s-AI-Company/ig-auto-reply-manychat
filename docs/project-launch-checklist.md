# 2026-07-01 - Contacts no-filter empty-state guidance

- `[x]` Contacts no-filter empty-state now gives new workspaces concrete next steps: connect Instagram, open Inbox, or understand why CSV import is intentionally disabled.
- `[x]` Filtered empty-state behavior remains covered and unchanged.
- `[x]` Focused unit coverage now locks both empty-state modes.
- `[x]` `npx vitest run tests/contacts-empty-state.test.ts --reporter=dot`、`npm run lint`、`npm test`、`npm run build` passed.
- `[ ]` Meta App Review, PayUNI production enablement, production DB mutation, and Production deployment remain manual launch gates.

# 2026-06-30 - Launch readiness product sweep

- `[x]` 這一輪只整理 launch readiness 差距，不再把外部 gate 當成可以自動完成的產品任務。
- `[x]` 目前可安全自動處理的產品缺口，前幾輪已分別收斂到 Inbox / Channels / Contacts / Automations / Analytics / Billing 各自的可用邊界與 disabled UX。
- `[x]` 目前剩下的 public paid launch gate 都屬於 `HUMAN_REQUIRED`：Meta App Review / Advanced Access / Business Verification、PayUNI production merchant approval、controlled enablement、第一筆低額 production smoke、以及最後的法務 / 支援文件複核。
- `[ ]` 後續若再接產品任務，只能挑仍屬於安全 UI / UX 收斂的部分，不要把 human gate 重新塞回自動化 queue。

# 2026-06-30 - Billing checkout gate clarity

- `[x]` Billing 頁現在會在 PayUNI 仍停留在正式站且 `PAYUNI_ALLOW_PRODUCTION` 尚未開啟時，先把付款按鈕停用並說明原因。
- `[x]` sandbox 仍可直接驗證付款流程，正式站 gate 不會再像可直接送出的假按鈕。
- `[x]` `npm run lint`、`npm test`、`npm run build` 已通過。
- `[ ]` `npm run test:e2e:auth` 本機目前卡在既有 e2e admin / DB 狀態，等環境修好後再補一次 billing smoke。

## 2026-06-30 - Billing / PayUNI sandbox readiness

- `[x]` Billing 頁對 sandbox / production gate 的說明更清楚了。
- `[x]` 付款按鈕在未開通正式金流時會先停用，避免假操作感。
- `[ ]` 若後續要開正式站，仍需要 PayUNI production merchant approval 與 controlled enablement SOP。

# 2026-06-30 - Inbox / Channels visible-but-unusable closeout

- `[x]` Inbox contact panel `自動化暫停` 已改成真正 disabled UX。
- `[x]` IG dropdown partial metadata 現在有更清楚的 `資料未完整` badge。
- `[x]` `npm run lint`、`npm run build`、`npm test`、`npm run test:e2e:inbox` 已通過。
- `[ ]` Inbox / Channels 其餘 header / composer / 次要控制項仍可再做一輪 disabled UX 收斂。

# 2026-06-29 - Inbox assignment / reminder / empty-state pass

- `[x]` Inbox 空狀態的 `清除篩選並重新查看` 會真正清掉搜尋、標籤、指派與分類條件。
- `[x]` Inbox 提醒選單的 `選擇日期與時間` 已改成清楚 disabled UX，不再是假入口。
- `[x]` Inbox 指派、提醒、已讀等操作，現在會顯示更精準的成功訊息。
- `[x]` `tests/e2e/inbox-auth.spec.ts` 已擴充 assignment / reminder / empty-state reset 覆蓋。
- `[x]` `npm run test:e2e:inbox` 已通過 Chromium 與 mobile Chrome。
- `[ ]` 繼續 Inbox contact panel / bulk action 第四輪 audit，收斂剩餘 disabled UX 與最小可用功能邊界。

# 2026-06-28 - AI_TEAM docs baseline and autopilot retirement

- `[x]` Built the new `AI_TEAM/` document system from the attached control document.
- `[x]` Removed the root `npm run autopilot` entry and the old runner files.
- `[x]` Updated `README.md` to point at `AI_TEAM/README.md`.
- `[x]` Kept the product AI bridge files untouched.

# 2026-06-30 - Analytics readability and data-state sweep

- `[x]` Analytics 現在會清楚標出資料範圍：工作區全域 / 單一 IG 帳號，避免 0 值看起來像壞掉。
- `[x]` 空資料、載入失敗、沒有 IG 連線、以及本來就沒有發送 / 啟用紀錄的數值，都有對應說明或 CTA。
- `[x]` 新增只讀 `/api/analytics`，回傳 summary 與 state，方便前端與未來自動刷新共用。
- `[x]` `npm run lint`、`npm test`、`npm run build`、`npm run test:e2e:auth` 都已通過。
- `[ ]` 若後續要做真正的時間序列圖表，先補資料來源、刷新策略與更細的聚合 API。

# Project Launch Checklist

## 2026-06-30 - Automations scope clarity and disabled UX sweep

- `[x]` Automations 現在會明確說明流程是工作區共用，避免使用者誤以為左側 IG 帳號切換就代表 automation data model 已分帳號隔離。
- `[x]` 回收桶、幾個尚未支援的 basic automations、以及 simple release 的序列入口都改成真正 disabled UX。
- `[x]` `npm run lint`、`npm run build`、`npm test`、`npm run test:e2e:auth`、`npm run test:e2e:simple` 都已通過。
- `[ ]` 若後續要改成 per-channel automation scope，需先補資料模型與 migration，再重新評估 launch 範圍。

## 2026-06-30 - Channels / Connect visible-but-unusable sweep

- `[x]` Channels / Connect 現在把可連線 / 規劃中 / 暫停中的入口分流得更清楚，降低把未開放平台誤認成可直接授權的機率。
- `[x]` `InstagramChannelActions` 在授權不足時會直接顯示 inline disabled 說明。
- `[x]` `npm run lint`、`npm run build`、`npm test`、`INBOXPILOT_RELEASE_CHANNEL=simple npm run test:e2e:simple` 都已通過。
- `[ ]` 若後續還有新的 Channels / Connect visible-but-unusable 控制項，再依同樣標準收斂。

## 2026-06-30 - Inbox visible-but-unusable follow-up

- `[x]` Inbox contact actions menu 的匯出 / 封鎖項目已改成真正 disabled UX，不再看起來像可直接使用的功能。
- `[x]` simple-release Inbox 的序列訂閱入口已改成真正 disabled UX，避免把 full-release 才有的功能誤導成可操作。
- `[x]` `npm run lint`、`npm test`、`npm run build`、`npm run test:e2e:inbox`、`npm run test:e2e:simple` 都已通過。
- `[ ]` 若後續還有其他 visible-but-unusable 控制項，再依同樣標準收斂。

## 2026-06-30 - Contacts product completeness sweep

- `[x]` Contacts 現在會先顯示 segment 條件會套用到多少聯絡人，建立分群前不再完全靠猜。
- `[x]` Batch tag 操作在沒有標籤時會直接提示先建立標籤，避免留下看起來可操作、其實還不完整的區塊。
- `[x]` `PUT /api/contacts/[id]/fields` 已補 same-origin 驗證，Contacts write path 的安全邊界比較完整。
- `[x]` `npm run lint`、`npm run build`、`npm test`、`npm run test:e2e:contacts` 都已通過。
- `[ ]` 如果後續要繼續做 Contacts 深度收斂，可以再補更完整的匯入 / 空狀態引導。

# 2026-06-30 - Contacts filtered empty-state guidance

- `[x]` Contacts filtered empty-state 現在會列出目前套用的搜尋 / 狀態 / 標籤條件。
- `[x]` `清除篩選並重新查看` 已成為真正可用的返回完整列表入口。
- `[x]` filtered empty-state 的 Playwright smoke 已補上，並在 Chromium / mobile Chrome 通過。
- `[x]` `npm run lint`、`npm run build`、`npm run test:e2e:contacts`、`npm test` 都已通過。
- `[ ]` 如果要進一步打磨 Contacts，可再補 no-filter empty state 的建立 / 匯入引導。

## 2026-06-30 - Inbox / Channels visible-but-unusable closeout

- `[x]` Inbox header `視訊通話` 與 `更多對話操作` 已改成真正 disabled UX，並補上原因說明。
- `[x]` `清除提醒` 現在會先關閉 reminder menu，再送出清除更新，不會卡住後續點擊。
- `[x]` IG dropdown 的 partial metadata badge 與 Channels connect visibility 維持清楚分流。
- `[x]` focused Vitest、`npm run lint`、`npm run build`、`npm run test:e2e:inbox` 都已通過。
- `[ ]` `npm test` 仍有既有 Windows Vitest batch-level crash，需要另一輪專門收斂測試 runner 穩定性。
- `[ ]` 下一個安全產品任務先接 Contacts filtered empty-state guidance。

## 2026-06-28 - Inbox mobile scope and filter pass

- `[x]` Inbox mobile supports explicit pane switching for list / detail / contact.
- `[x]` Inbox custom tag and team-member filters work again in the sidebar, mobile chips, and filter panel.
- `[x]` Inbox filter panel now controls status, unread, sort, tag, and assignee scope.
- `[x]` Inbox contact summary no longer shows fake `取消訂閱` copy.
- `[x]` Simple-release Inbox sequence CTA now explains that Sequences is a full-release-only surface.
- `[x]` `PATCH /api/conversations/[id]` now has same-origin and rate-limit protection.
- `[x]` `POST /api/conversations/[id]/notes` now has rate-limit protection.
- `[x]` Focused lint, focused Vitest, and `npm run build` passed in the clean worktree.
- `[ ]` Authenticated Inbox Playwright smoke still needs local `ADMIN_EMAIL` / `ADMIN_PASSWORD` / `TEST_DATABASE_URL` in this clean worktree to run fully instead of skipping.

## 2026-06-28 - Inbox contact panel actions UX pass

- `[x]` Replaced Inbox contact panel `更多聯絡人操作` fake notice with a small action menu.
- `[x]` Added a real `開啟聯絡人詳情` link for the selected contact.
- `[x]` Converted export and block/unsubscribe into clear temporarily-disabled guidance instead of `尚未開放`.
- `[x]` Added authenticated Inbox smoke coverage for the desktop contact actions menu.
- `[ ]` Contact export and block/unsubscribe still require permission, sync, and audit design before launch.

## 2026-06-28 - Inbox header disabled UX pass

- `[x]` Converted Inbox conversation header `視訊通話` and `更多操作` from fake coming-soon buttons into clearly disabled-looking controls with in-page guidance.
- `[x]` The controls now explain that the feature is temporarily unavailable because the related product flow is not finished yet.
- `[x]` Kept the Inbox filter panel close action visible on desktop and mobile, so the panel does not block conversation header actions.
- `[x]` Added authenticated Inbox Playwright smoke coverage for both controls and confirmed the notice no longer uses `尚未開放`.
- `[ ]` Real video calling and richer conversation actions still require product/API design before launch.

## 2026-06-28 - Inbox media composer disabled UX pass

- `[x]` Converted Inbox composer `圖片上傳` and `語音訊息` from generic coming-soon actions into explicit temporarily-disabled controls.
- `[x]` Added in-page explanations for required media storage / scanning / attachment delivery and audio upload / conversion / delivery work.
- `[x]` Added authenticated Inbox Playwright smoke coverage for both controls.
- `[ ]` Real media and voice delivery remain future product/API gates before public paid launch.

## 2026-06-28 - Inbox functionality repair round 1

- `[x]` Audited Inbox completed / half-built / fake-button / missing-test areas.
- `[x]` Fixed selected Instagram channel scope refresh for Inbox.
- `[x]` Converted visible Inbox no-op controls into real actions or explicit in-page notices.
- `[x]` Added same-origin protection to internal note creation.
- `[x]` Added non-production E2E seed data for two Instagram channels and Inbox conversations.
- `[x]` Added desktop authenticated Inbox Playwright smoke and CI full-release auth smoke coverage.
- `[x]` Verified `npm run lint`, `npm run build`, and `npm run test:e2e:inbox` against local non-production `TEST_DATABASE_URL`.
- `[ ]` Fix mobile Inbox search/filter layout in a separate RWD pass.
- `[ ]` Continue product functionality audits for Contacts, Channels, Automations, and Analytics.

## 2026-06-26 - Autopilot report cleanup closeout

- `[x]` Autopilot runner exited cleanly.
- `[x]` Removed ignored transient report artifacts, including `reports/autopilot-live.log`.
- `[x]` Reports secret-pattern scan returned `NO_MATCHES`.
- `[x]` Confirmed report files are ignored and not tracked by git.
- `[ ]` Add authenticated route smoke / E2E for Dashboard, Inbox, Contacts, Instagram connect, Analytics, Automations, Referrals, and Billing.
- `[ ]` Complete Meta App Review and PayUNI production go-live before public paid launch.

## 2026-06-26 - Unattended loop 1 readiness refresh

- `[x]` Vercel CLI is authenticated and local project link exists.
- `[x]` Vercel Production env names include `TOKEN_ENCRYPTION_KEY`; values were not printed.
- `[x]` Vercel Preview env names include `TOKEN_ENCRYPTION_KEY`; values were not printed.
- `[x]` Supabase CLI can read project metadata, and local link points to the test project.
- `[x]` `npm install` passed.
- `[x]` `npm run lint` passed.
- `[x]` `npm test` passed against local non-production test DB.
- `[x]` `npm run build` passed.
- `[x]` `npm run payuni:smoke` passed against sandbox.
- `[x]` `npm audit --audit-level=high` passed.
- `[ ]` `reports/autopilot-live.log` remains locked by active runner processes; clean it before treating reports as safe.
- `[ ]` Add authenticated route smoke / E2E for Inbox, Contacts, Analytics, Automations, Referrals, and Billing.
- `[ ]` Public paid launch still requires Meta App Review approval and PayUNI production go-live.

## 2026-06-26 - Unattended loop 1 production safety hardening

- `[x]` Hardened production deployment detection so plain `NODE_ENV=production` is treated as production when no explicit InboxPilot/Vercel env is present.
- `[x]` Production secret encryption now requires a dedicated `TOKEN_ENCRYPTION_KEY` and rejects reusing `AUTH_SECRET`.
- `[x]` Added regression tests for production deployment fallback and token encryption key enforcement.
- `[x]` Ran non-force `npm audit fix` and removed the high-severity audit finding.
- `[x]` `npm run lint` passed.
- `[x]` Focused Vitest passed: `tests/security.test.ts`, `tests/unit/core-utils.test.ts`, `tests/meta-channel-config.test.ts`.
- `[x]` `npm run build` passed.
- `[x]` Production `/api/health` returned `status=ok`, database ok, redis ok.
- `[x]` Staging `/api/health/staging` returned `status=ok`, `deployment=staging`, `dbEnv=staging`, `releaseChannel=full`, and `vercelEnv=preview`.
- `[ ]` Full `npm test` still needs an isolated `TEST_DATABASE_URL` or safe non-production `DATABASE_URL`.
- `[ ]` PayUNI sandbox smoke still needs local sandbox env names/values.
- `[ ]` Supabase CLI is still unavailable on PATH.
- `[ ]` Local Vercel project link is missing; env-name inspection and Preview deployment were not performed.
- `[ ]` Confirm Vercel Production and Preview include `TOKEN_ENCRYPTION_KEY` before deploying this change.

## 2026-06-26 - InboxPilot unattended autopilot package

- `[x]` Added InboxPilot-specific unattended autopilot entry points: `npm run autopilot`, `run-autopilot.ps1`, and `run-autopilot.cmd`.
- `[x]` Added `scripts/autopilot-full.py` with Codex development, quality gates, PayUNI sandbox smoke, Vercel Preview readiness, Supabase readiness, route smoke, QA, safety, and final report phases.
- `[x]` Added `AUTOPILOT.md` and `docs/autopilot-code-review.md`.
- `[x]` Reports are ignored under `reports/`.
- `[x]` Default policy keeps PayUNI sandbox, blocks Meta App Review submission, blocks production DB/schema writes, and blocks Production deployment unless explicitly enabled by env.
- `[ ]` First real overnight run still needs operator review of `reports/final-report.md` and `reports/human-required.md`.
## 2026-06-26 - CI / nightly authenticated route smoke

- `[x]` Added authenticated route smoke for Dashboard, Inbox, Contacts, Instagram connect, Analytics, Automations, Referrals, and Billing.
- `[x]` Added CI and nightly scheduled execution using PostgreSQL service-backed `TEST_DATABASE_URL`.
- `[x]` Added production DB guard coverage so authenticated smoke refuses missing `TEST_DATABASE_URL`, production project ref, and explicit production DB markers.
- `[x]` Added guarded E2E admin seed script that refuses to write unless `TEST_DATABASE_URL` is present and non-production.
- `[x]` Confirmed smoke does not click Meta OAuth, submit Meta App Review, submit PayUNI checkout, or switch PayUNI production.

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

## 2026-06-26 - Autopilot readiness update

- `[x]` Supabase CLI authenticated with a secure local token input flow; token value was not printed or committed.
- `[x]` Supabase staging project ref confirmed as `ndhtwqtshselqwgjenjd`.
- `[x]` Supabase production project ref confirmed as `lmwvzskffzozuiamjxvc`.
- `[x]` Local Supabase link points to staging, not production.
- `[x]` Vercel CLI linked to the InboxPilot project.
- `[x]` Vercel Preview staging env metadata can be pulled without printing secret values.
- `[x]` PayUNI sandbox env exists locally in ignored `.env.local`.
- `[x]` PayUNI sandbox smoke passes.
- `[x]` Local test DB uses local Supabase Postgres for `npm test`.
- `[x]` `npm test`, `npm run lint`, `npm run build`, and `npm audit --audit-level=high` pass.
- `[ ]` Two moderate Next/PostCSS advisories remain; force update path is not launch-safe without a separate dependency review.
- `[ ]` Do not enable PayUNI production values until the production go-live SOP is approved.
- `[ ]` Do not submit Meta App Review from autopilot; keep it as a human-run dashboard action.

Current decision:

- Sandbox/test-safe autopilot: Go.
- Private beta / whitelist: Go.
- Public paid launch: Hold until Meta approval and PayUNI production gates are complete.

## 2026-06-27 - Contact detail edit readiness

- `[x]` Contact detail page uses the same bright theme direction as the Contacts list.
- `[x]` Username, email, and phone can be edited and persisted through `PATCH /api/contacts/[id]`.
- `[x]` Contact tags can be assigned and removed from the detail page.
- `[x]` Contact tag writes validate both the current contact scope and the current workspace tag scope.
- `[x]` `npm run lint`, focused route tests, `npm run build`, and `npm run test:e2e` passed.
- `[x]` Full `npm test` passed in the latest local run.
- `[x]` Authenticated browser smoke covers contact detail edit, cancel, save success toast, tag add, and tag remove.

## 2026-06-27 - IG connection error feedback

- `[x]` `/api/meta/oauth/start` defaults to Instagram.
- `[x]` Simple release allows the default Instagram start path and blocks explicit `mode=facebook`.
- `[x]` OAuth callback redirects include safe Chinese `meta_error` copy and `meta_error_code`.
- `[x]` `/channels/connect/social` renders `meta_error` in a red alert.
- `[x]` `npm run lint`, focused OAuth/proxy tests, `npm run build`, and `npm run test:e2e` passed.
- `[x]` Full `npm test` passed in the latest local run.
- `[x]` Playwright smoke covers Meta error alert rendering and simple-release provider visibility.

## 2026-06-27 - Simple release Full-only gate notice

- `[x]` Full-only simple-release routes redirect to `/dashboard?alert=feature_gated&feature=<route>`.
- `[x]` Dashboard displays a warning toast with the Staging full-release URL.
- `[x]` `npm run lint`, `npx vitest run tests/release-proxy.test.ts`, `npm run build`, `npm test`, and rerun `npm run test:e2e` passed.
- `[x]` Playwright simple-release smoke verifies `/billing` gated redirect and Dashboard feature notice.

## 2026-06-27 - Contacts filters and batch tagging

- `[x]` Contacts filter button opens a real filter panel.
- `[x]` Contacts supports query-backed status filtering.
- `[x]` Contacts supports query-backed tag filtering through the filter panel and sidebar tag links.
- `[x]` Contact row checkboxes support selected-contact batch add tag.
- `[x]` Batch tag API validates same-origin, auth, workspace tag ownership, and current workspace / selected IG contact scope.
- `[x]` `npx vitest run tests/tenant-isolation-routes.test.ts --reporter=dot`, `npm run lint`, `npm run build`, `npm test`, and `npm run test:e2e:auth` passed.
- `[ ]` Add batch remove tag before treating Contacts bulk operations as complete.
- `[ ]` Add create-segment-from-filter workflow if launch operators need reusable audiences.

## 2026-06-27 - Playwright smoke CI split

- `[x]` Full-release authenticated smoke runs in a dedicated CI job.
- `[x]` Contacts authenticated smoke runs as an explicit script inside the full-release smoke job.
- `[x]` Simple-release smoke runs in a dedicated CI job with `INBOXPILOT_RELEASE_CHANNEL=simple`.
- `[x]` Both smoke jobs use PostgreSQL service-backed `TEST_DATABASE_URL`.
- `[x]` Production DB guard remains active for authenticated smoke.
- `[x]` Local validation passed: `npm run test:e2e:auth`, `npm run test:e2e:contacts`, and simple-release `npm run test:e2e:simple`.
- `[ ]` Confirm the next GitHub Actions run completes both new Playwright jobs without flakes.

## 2026-06-27 - Contacts batch operations closeout

- `[x]` Selected contacts can batch add tag.
- `[x]` Selected contacts can batch remove tag.
- `[x]` Current Contacts filter can be saved as a Segment.
- `[x]` Segment filters preserve search text, subscription status, tag, and selected Instagram channel scope.
- `[x]` Tenant isolation tests cover batch remove and contact-filter segment creation.
- `[x]` Authenticated Playwright smoke covers batch add/remove and segment creation.
- `[ ]` Add clearer empty-state guidance for filtered Contacts before broader operator onboarding.

## 2026-06-27 - Instagram metadata fallback PR

- `[x]` ID-only Instagram channels are preserved in account switching UI.
- `[x]` Profile refresh errors are safe Chinese messages instead of raw Meta errors.
- `[x]` Automations channel-scope expectation is documented in UI.
- `[x]` Clean PR validation passed: targeted Vitest, `npm run lint`, `npm run build`, and local Docker PostgreSQL-backed `npm test`.
- `[ ]` Merge only after review; deploy Production later through controlled manual deployment.
