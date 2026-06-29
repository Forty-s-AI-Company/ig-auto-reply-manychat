# 2026-06-30 - Inbox / Channels visible-but-unusable closeout

Status: improved for beta operator trust; still one more disabled UX pass can be做 if we want every visible entry to feel equally intentional.

- Inbox contact panel `自動化暫停` 已改成真正 disabled UX，避免看起來像壞掉的按鈕。
- IG dropdown partial metadata 現在會顯示 `資料未完整` badge，ID-only 帳號更清楚。
- 本輪 focused lint / build / unit / inbox smoke 已通過。

Readiness implication:

- Inbox / Channels 的誤導性控制項又少了一批。
- Public paid launch 仍維持 Hold；剩餘的 Inbox header / composer / Channels 次要控制項可以下一輪再收斂。

# 2026-06-29 - Inbox assignment / reminder / empty-state repair

Status: improved for private beta operator trust; Inbox still needs one more contact-panel / bulk-action pass before it can be treated as fully polished.

- Inbox 空狀態的 `清除篩選並重新查看` 現在會真的把搜尋、標籤、指派與分類條件全部清掉，不再留下看不見的殘留篩選。
- Inbox 提醒選單不再把 `選擇日期與時間` 偽裝成可用入口；目前改成 disabled UX，並明確說明先只支援固定提醒時段。
- Inbox 指派、提醒、已讀等操作，現在會顯示更精準的成功訊息，降低使用者覺得「有按但不知道有沒有成功」的感受。
- Authenticated Inbox Playwright smoke 現在已覆蓋 assignment、reminder、empty-state reset，且 Chromium / mobile Chrome 都通過。

Readiness implication:

- Inbox 的核心日常操作又少了一批看得到但像壞掉的控制項。
- 公開付費上線仍維持 Hold；剩餘阻塞仍在 Channels / Automations / Analytics 完整性，以及 Meta / PayUNI 外部人工 gate。

# 2026-06-28 - Inbox mobile scope and filter pass

Status: improved for beta operator usability; authenticated DB-backed smoke still needs local non-production test env in this clean worktree.

- Inbox mobile now supports explicit pane switching between conversation list, message detail, and contact summary instead of forcing a desktop-style layout.
- Inbox sidebar and mobile quick filters now support real custom tag and team-member scoping again.
- Inbox filter panel now controls status, unread, sort, tag, and assignee scope from one place.
- The contact summary no longer shows fake `取消訂閱` copy; it now displays the real read-only consent state.
- In simple release, the sequence CTA now explains that Sequences belongs to the full release instead of silently sending operators into a gated route.
- Conversation updates and internal note writes now have stronger request guards.

Readiness implication:

- Inbox is closer to a usable operator surface instead of a half-desktop, half-placeholder screen.
- Public paid launch status remains Hold because Meta App Review, PayUNI production go-live, and broader Channels / Automations / Analytics completeness work are still outstanding.

# 2026-06-28 - AI_TEAM docs baseline and autopilot retirement

Status: documentation re-org only; product readiness unchanged.

- The old root autopilot entrypoints are retired.
- `AI_TEAM/` is now the source of truth for unattended workflows.
- No product code, production DB, Meta submission, or PayUNI production action was changed.

# InboxPilot Product Readiness Review

## 2026-06-30 - Channels / Connect visible-but-unusable sweep

Status: improved for beta operator trust; public paid launch status remains Hold.

- Channels / Connect 現在把入口拆成可連線 / 規劃中 / 暫停中，未開放平台不再像同一種即將可用的主入口。
- `InstagramChannelActions` 在授權不足時會直接顯示 inline disabled 說明，減少需要猜測 title 的情況。
- `npm run lint`、`npm run build`、`npm test`、`INBOXPILOT_RELEASE_CHANNEL=simple npm run test:e2e:simple` 都已通過。

Readiness implication:

- Channels / Connect 又少了一批看得到但不能直接用的控制項。
- Public paid launch 仍維持 Hold；這輪只做 UI / smoke 收斂，沒有碰 production DB、Meta、或 PayUNI production。

## 2026-06-30 - Inbox visible-but-unusable follow-up

Status: improved for beta operator trust; public paid launch status remains Hold.

- Inbox contact actions menu 的匯出 / 封鎖項目已改成真正 disabled UX，不再像壞掉的操作入口。
- simple-release Inbox 的序列訂閱入口也改成真正 disabled UX，避免 full-release-only 功能在簡版表面上看起來可用。
- focused lint、`npm run test:e2e:inbox`、`npm run test:e2e:simple`、`npm test`、`npm run build` 都已通過。

Readiness implication:

- Inbox 又少了一批看得到但不能用的控制項。
- Public paid launch 仍維持 Hold；這輪只做 UI / smoke 收斂，沒有碰 production DB、Meta、或 PayUNI production。

## 2026-06-30 - Contacts filtered empty-state guidance

Status: improved for operator trust; public paid launch status remains Hold.

- Contacts filtered empty-state now explains the active search / status / tag conditions instead of only saying the list is empty.
- `清除篩選並重新查看` now takes operators back to the full Contacts list.
- Authenticated Contacts smoke now covers the empty-state guidance path on Chromium and mobile Chrome.
- Focused lint, build, `npm test`, and `npm run test:e2e:contacts` passed.

Readiness implication:

- Contacts is a little less ambiguous when filters hide all rows.
- Public paid launch still remains Hold; this change does not affect database, billing, Meta review, or production deployment gates.

## 2026-06-30 - Inbox / Channels visible-but-unusable closeout

Status: improved for beta operator trust; full Windows `npm test` still has an existing batch-level instability unrelated to this UX pass.

- Inbox header `視訊通話` 與 `更多對話操作` now use clear disabled UX with readable reasons.
- `清除提醒` now closes the reminder menu before applying the update, so the menu no longer blocks later clicks.
- IG partial metadata and Channels connect visibility remain intentionally explicit rather than pretending unfinished states are live.
- Focused Vitest, `npm run lint`, `npm run build`, and `npm run test:e2e:inbox` passed.

Readiness implication:

- Inbox / Channels now have fewer controls that look clickable but are not.
- Public paid launch status remains Hold; the next safe product task is Contacts filtered empty-state guidance.

## 2026-06-28 - Inbox contact panel actions UX pass

Status: improved for beta operator trust; contact export and block/unsubscribe remain future permission/audit gates.

- Inbox contact panel `更多聯絡人操作` now opens a small action menu instead of showing a generic `尚未開放` notice.
- Operators can open the selected contact detail page directly from the menu.
- Export and block/unsubscribe actions explain why they are temporarily disabled and what operational controls are still required.
- Authenticated Inbox Playwright smoke verifies the menu and disabled guidance on desktop.

Readiness implication:

- Inbox has one fewer misleading visible control during beta usage.
- Public paid launch still remains Hold until contact export governance, block/unsubscribe sync rules, Channels/Automations/Analytics audits, Meta App Review, and PayUNI production gates are complete.

## 2026-06-28 - Inbox header disabled UX pass

Status: improved for beta operator trust; real video calling and richer conversation actions remain future product/API gates.

- Inbox conversation header `視訊通話` and `更多操作` no longer behave like generic coming-soon fake buttons.
- The controls now look intentionally unavailable, use accessible labels, and explain why the related flow is not enabled yet.
- The user-facing message points operators back to text replies or other working Inbox tools instead of making the feature feel broken.
- The Inbox filter panel now has a visible close action on desktop and mobile, preventing it from blocking conversation header controls.
- Authenticated Inbox Playwright smoke verifies both controls show clear guidance and no longer display `尚未開放`.

Readiness implication:

- Inbox has fewer misleading visible controls for beta usage.
- Public paid launch still remains Hold until real media/voice delivery design, richer conversation actions, Channels/Automations/Analytics audits, Meta App Review, and PayUNI production gates are complete.

## 2026-06-28 - Inbox media composer disabled UX pass

Status: improved for beta operator trust; real media/voice sending remains a future product/API gate.

- Inbox composer `圖片上傳` and `語音訊息` no longer behave like generic coming-soon fake buttons.
- The controls now look intentionally unavailable, use accessible labels, and explain why media/voice sending is not enabled yet.
- The user-facing message points operators back to text replies or internal notes instead of making the feature feel broken.
- Authenticated Inbox Playwright smoke verifies the image and voice controls show clear guidance and no longer display `尚未開放`.

Readiness implication:

- Inbox has fewer misleading visible controls for beta usage.
- Public paid launch still remains Hold until real media/voice delivery design, Channels/Automations/Analytics audits, Meta App Review, and PayUNI production gates are complete.

## 2026-06-28 - Inbox emoji composer product pass

Status: improved for beta operator usability; advanced media composer work remains a later gate.

- Inbox composer `表情符號` now inserts a default emoji into the message draft instead of only showing a coming-soon notice.
- The interaction stays local to the client composer and does not call external providers or mutate production data by itself.
- Authenticated Inbox Playwright smoke now verifies the emoji button changes the composer value and no longer displays a `尚未開放` notice.

Readiness implication:

- One more visible Inbox fake-button gap is closed.
- Public paid launch still remains Hold until media/voice composer decisions, Channels/Automations/Analytics audits, Meta App Review, and PayUNI production gates are complete.

## 2026-06-28 - Inbox AI reply suggestion product pass

Status: improved for beta operator usability; provider-backed AI remains a later gate.

- Inbox composer `AI 回覆建議` now creates a reviewable reply draft instead of only showing a coming-soon notice.
- The draft generator uses local deterministic rules from the latest inbound message, so it does not require OpenAI/Gemini/Antigravity/Codex CLI credentials and does not expose secrets.
- Operators still review and manually send the message, keeping the feature safe for beta usage.
- Authenticated Inbox Playwright smoke now verifies the AI suggestion button fills the composer and no longer displays a `尚未開放` notice.

Readiness implication:

- One visible Inbox fake-button gap is closed.
- Public paid launch still remains Hold until provider-backed AI reply design, media/voice composer decisions, Channels/Automations/Analytics audits, Meta App Review, and PayUNI production gates are complete.

## 2026-06-28 - Inbox mobile RWD search/filter repair

Status: improved for mobile private beta Inbox usage; still not a public paid launch Go.

- PR #21 was merged into `master`, but post-merge master CI exposed a Contacts authenticated smoke race from duplicate segment names across parallel desktop/mobile workers.
- The Contacts smoke race is fixed by generating project/worker-specific segment names; this is test stability only and does not change product behavior.
- Mobile Inbox now has a visible search field and a mobile filter button, instead of relying on a desktop header control that is hidden on small viewports.
- The filter panel now uses a mobile-safe fixed layout with an explicit Done button, while preserving the desktop popover behavior.
- Inbox authenticated smoke now runs both desktop Chromium and mobile Chrome projects through `npm run test:e2e:inbox`.

Readiness implication:

- Mobile Inbox search/filter is less likely to feel unfinished during beta usage.
- Public paid launch remains Hold until remaining Inbox advanced actions, Channels, Automations, Analytics, Meta App Review, and PayUNI production gates are complete.

## 2026-06-28 - Inbox functionality repair round 1

Status: improved for private beta desktop operator use; still needs mobile Inbox RWD follow-up.

- Inbox desktop now has authenticated smoke coverage for page load, Instagram channel scoping, conversation selection, search/filter controls, internal notes, and manual reply success/failure feedback.
- Sidebar Instagram account switching now refreshes Inbox data immediately by selected channel instead of leaving the conversation list in the previous/all-channel scope.
- Inbox no-op controls have been converted to either real actions or explicit user-facing notices, reducing the "button looks clickable but nothing happens" problem.
- Internal note writes now use same-origin protection.
- The E2E seed now creates two safe non-production Instagram channels and Inbox conversations so CI can verify account-scope regressions without production DB access.

Readiness implication:

- Desktop Inbox is more credible for beta usage after this PR is merged and deployed through the normal controlled release process.
- Public paid launch still remains Hold until mobile Inbox RWD, remaining core module audits, Meta App Review, and PayUNI production go-live are completed.

## 2026-06-26 - Autopilot report cleanup closeout

Status: report handling blocker cleared; preview QA still needs authenticated smoke.

- `reports/autopilot-live.log` and raw output artifacts were removed after the runner exited.
- Reports secret-pattern scan returned `NO_MATCHES`.
- Local gates from the autopilot run remain green: lint, test, build, PayUNI sandbox smoke, route smoke, Production health, and staging health.
- Preview readiness still needs authenticated route smoke / E2E for Dashboard, Inbox, Contacts, Instagram connect, Analytics, Automations, Referrals, and Billing.
- Public paid launch remains Hold until Meta App Review and PayUNI production go-live are completed manually.

## 2026-06-26 - Unattended loop 1 readiness refresh

Status: local gates improved, still HUMAN_REQUIRED for final preview readiness.

- Local quality gates now pass: `npm install`, `npm run lint`, `npm test`, `npm run build`, `npm run payuni:smoke`, and `npm audit --audit-level=high`.
- PayUNI sandbox smoke now passes locally; PayUNI production remains blocked by policy.
- Vercel project link and env-name inspection are now complete enough to confirm `TOKEN_ENCRYPTION_KEY` exists in Production and Preview without exposing values.
- Supabase CLI read-only project inspection works, and the local link points to the test project.
- Preview readiness still cannot be marked ready while `reports/autopilot-live.log` is locked and authenticated route smoke / E2E evidence is missing.

Readiness implication:

- Sandbox/test-safe autopilot readiness improved.
- Private beta / whitelist remains Go with controlled operations.
- Public paid launch remains Hold until Meta App Review approval, PayUNI production merchant go-live, live low-value smoke, and final legal/billing review are complete.

## 2026-06-26 - Unattended loop 1 readiness delta

Status: safer, still HUMAN_REQUIRED for preview/staging completion.

- Production runtime classification is safer for non-Vercel or minimally configured production runtimes because `NODE_ENV=production` now maps to production behavior.
- Token encryption is safer because production no longer falls back from `TOKEN_ENCRYPTION_KEY` to `AUTH_SECRET`.
- High-severity npm audit exposure was removed through non-force lockfile updates.
- Production and staging public health checks remain ok.

Readiness implication:

- Preview/staging launch readiness improved, but this change should not be deployed until Vercel Production and Preview env names are confirmed to include `TOKEN_ENCRYPTION_KEY`.
- Public paid launch remains Hold because DB-backed tenant tests, Meta App Review, PayUNI production approval, and PayUNI live smoke are still incomplete.

## 2026-06-26 - Unattended autopilot readiness package

Status: preview/staging automation prepared.

- Added a project-specific autopilot runner to automate code/docs fixes, lint/test/build, PayUNI sandbox smoke, Vercel Preview readiness, Supabase readiness, route smoke, QA, safety review, and final reports.
- Missing secrets, logins, external approvals, Meta reviewer actions, or PayUNI production readiness are recorded as `HUMAN_REQUIRED` instead of guessed.
- Production DB/schema writes and PayUNI production switching are not part of unattended automation.

Product readiness implication:

- The project can now run longer unattended preview/staging improvement loops.
- Public paid launch remains Hold until Meta App Review, PayUNI production go-live, tenant isolation evidence, and final operator review are complete.
## 2026-06-26 - CI / nightly authenticated smoke readiness

Status: automated non-production smoke added.

- CI and nightly automation now run authenticated route smoke for Dashboard, Inbox, Contacts, Instagram connect, Analytics, Automations, Referrals, and Billing.
- The smoke path requires `TEST_DATABASE_URL` and refuses Production DB markers.
- This improves regression confidence for private beta and public paid launch preparation.
- Public paid launch still remains Hold for Meta App Review and PayUNI production go-live evidence.

## 2026-06-26 - Meta / PayUNI launch package preparation

Status: package prepared, public paid launch still Hold.

- Added `docs/meta-app-review-submission-package.md`.
- Added `docs/payuni-production-go-live-checklist.md`.
- Meta package now defines reviewer materials, permission evidence, production URLs, redaction gates, and final Go / Hold criteria.
- PayUNI checklist now defines production env/dashboard checks, controlled enablement, callback/idempotency verification, rollback, and final Go / Hold criteria.
- No Meta submission was performed.
- No PayUNI live charging was enabled or executed.

Readiness implication:

- The remaining public paid launch blockers are now mostly external/operator gates: Meta reviewer assets/submission approval, PayUNI merchant approval/live smoke, and final authenticated tenant-safe smoke.

## 2026-06-26 - PR #2 production deployment delta

Status: deployed and improved, still Hold for public paid launch.

- PR #2 is merged into `master` at `5d014be`.
- PR #3 is merged into `master` at `cf9e80c`.
- Production deployment `dpl_2Ramd6D54Xn1qc7vxxsgXGXacUni` is Ready and backs `https://inboxpilot.carry-digital-nomad.in.net`.
- Controlled production deployment `dpl_GGk9zyF3r1F1hZ6ons3Fzfh6y5hL` is Ready and now backs `https://inboxpilot.carry-digital-nomad.in.net`.
- Production `/api/health` is ok, and the public Instagram connect page returns HTTP 200.
- Staging alias remains on Preview and `/api/health/staging` is ok.
- Production Meta global fallback hardening is now live on the formal production target. In production runtime, channel token and Instagram business account id resolution no longer falls back to global Meta env values.
- Route-level tenant isolation regression coverage now includes channels, contacts, manual automation run, and PayUNI checkout idempotency/invoice scope.
- Non-DB launch regression suite passed: 12 files, 43 tests.

Remaining launch gates:

- Meta App Review: complete reviewer recording, permission proof, test asset proof, redirect URI review, Advanced Access / Business Verification evidence, and redaction review.
- PayUNI production: complete merchant approval, enable production only through the SOP, run a first low-value production checkout, verify notify/return idempotency, and assign refund/settlement ownership.
- Tenant isolation: run authenticated smoke and DB-backed tests against staging/fresh test DB for workspace-scoped channels, inbox, contacts, automations, billing, and webhook/callback paths.

## 2026-06-26 - Public paid launch gate cleanup

Status: improved, still Hold for public paid launch.

- Production Meta global env fallback is disabled in code for production deployment envs.
- Production now requires tenant-scoped channel token/account binding instead of falling back to `META_PAGE_ACCESS_TOKEN` or `META_INSTAGRAM_BUSINESS_ACCOUNT_ID`.
- Meta webhook channel config no longer adds global fallback token markers in production.
- The Meta token refresh script now refuses production runtime markers.
- First regression tests cover production fallback disablement and non-production smoke fallback behavior.
- PayUNI Production SOP is documented.
- Billing, Terms, Privacy, and Data Deletion copy now explain controlled payment enablement, PayUNI handling, refund/cancellation boundaries, workspace isolation, and audit retention.

Product readiness decision:

- Private beta / whitelist usage can continue.
- Public paid launch remains Hold until authenticated/DB-backed tenant isolation tests pass, Meta App Review evidence is complete, and PayUNI production smoke is verified.

## 2026-06-24 - Release mode implementation readiness

Status:

- `master` is prepared as the simple production release path.
- `staging` is prepared as the full release path.
- Production simple release keeps the IG-first product surface: Home, Inbox, Contacts, IG connection, Analytics, Automations, and Referrals.
- Full-only surfaces are hidden from simple release navigation and blocked by `src/proxy.ts`.
- Staging / Preview remains the place to validate the full planned product surface.

Remaining product caveats:

- This does not split the database. Staging and production data must still be separated before real customer onboarding.
- Simple release route blocking is a product-surface guard, not a replacement for auth, tenant isolation, quota enforcement, or payment checks.
- Preview runtime env vars still need deliberate completion before staging can be treated as a dependable QA environment.

## 2026-06-24 - Master / staging pre-launch audit

Status: documented / still pre-launch hold for real customers.

- `docs/master-staging-prelaunch-checklist.md` now summarizes release mode, Vercel env, and DB sharing risk.
- Vercel env split exists for `INBOXPILOT_RELEASE_CHANNEL`.
- Vercel Preview currently lists only `INBOXPILOT_RELEASE_CHANNEL`; staging runtime env completeness must be confirmed.
- The release-mode implementation and smoke tests are now prepared for commit to `master` and `staging`.
- Shared DB remains temporarily acceptable only before real customer onboarding.

## 2026-06-19 - Simple production surface update

Decision:

- Production custom domain should run a simplified IG-first launch surface.
- Preview / testing deployment should keep the full planned version for validation.
- Staging custom alias is `https://staging.carry-digital-nomad.in.net`.
- Staging alias now has a GitHub Actions auto-update workflow for successful Preview deployments.
- The automatic staging alias workflow is restricted to successful `staging` branch Preview deployments.
- Vercel env split is `INBOXPILOT_RELEASE_CHANNEL=simple` for Production and `full` for Preview.
- Shared DB is temporarily accepted only because the product is not live with real customers yet.

Simple production surface:

- Home / dashboard
- Inbox
- Contacts
- Channels with Instagram-only connection
- Analytics
- Automations
- Referrals as invite/referral activity only

Deferred from first production surface:

- Affiliate payout / affiliate admin
- Broadcasts
- Sequences
- AI settings / Knowledge Base
- Billing / Wallet
- Multi-platform connection beyond Instagram
- Mock tester and internal testing surfaces

Readiness implication:

- This reduces first-launch product complexity and App Review surface.
- It does not remove the need for production Meta approval, tenant isolation review, webhook reliability, billing/legal decisions, and staging/prod DB separation before real customer onboarding.

更新日期：2026-06-10

## 總結

- 產品成熟度總分：`69 / 100`
- 是否可以正式販售：`不建議`
- 是否可以 Beta 試賣：`可以，限白名單 / 少量付費客戶`
- 最大 P0 阻礙：`PayUNI production readiness、Meta production 權限收斂、多租戶 Meta token fallback`

這一輪已完成的改善：

- 已修正 `PaymentOrder -> Subscription` 的 billing interval 傳遞，月繳 / 年繳不再被寫死成 `month`
- 已讓 zero-amount / credit-only checkout 走正式 internal completion flow
- 已補上對應測試與安全 audit

這一輪仍未完成的正式販售 blocker：

1. PayUNI production gateway 仍受 `PAYUNI_ALLOW_PRODUCTION` 保守開關限制
2. Meta / Instagram production flow 仍是 generic OAuth + legacy callback 混合
3. production 模式下仍存在 Meta env token fallback 風險
4. 對外 Billing / legal / README 文案與亂碼問題仍待整理

## 為什麼目前只能 Beta

雖然核心 SaaS 結構已經有：

- workspace / membership / role
- subscription / invoice / paymentOrder / wallet ledger
- audit log / health check / worker / queue
- IG / Meta OAuth、webhook、Inbox、Broadcast、Automation、Sequence

但正式公開販售還差三類硬門檻：

1. 平台門檻：Meta App Review、Advanced Access、Business Verification
2. 金流門檻：PayUNI production merchant review 與正式收款 SOP
3. 多租戶安全門檻：channel token 與 env fallback 必須完全收斂

## 最小可販售 MVP 範圍

建議先賣這個範圍：

- Instagram 留言關鍵字觸發
- Instagram 私訊自動回覆
- Inbox / Contacts / Tags / Segments
- Automation / Broadcast / Sequence
- AI FAQ
- Email / Telegram

先不要對外承諾：

- WhatsApp 正式可用
- TikTok 正式可用
- SMS 正式可用
- LINE 正式可用
- 自動化 affiliate payout / 完整財務對帳

## P0 問題清單

### P0-1. PayUNI production gateway 尚未進入可正式販售狀態

檔案位置：

- `src/app/api/billing/payuni/checkout/route.ts`
- `src/lib/payuni.ts`
- `.env.example`

現況：

- 非 sandbox gateway 時，若 `PAYUNI_ALLOW_PRODUCTION !== "true"` 會直接拒絕 checkout
- 表示 production merchant review 與上線切換仍需人工確認

修復建議：

- 完成 PayUNI production merchant review
- 建立 production / sandbox 切換 runbook
- 在 Billing 頁明確說明目前站別與正式開通條件

### P0-2. Meta / Instagram production flow 尚未完全收斂

檔案位置：

- `src/app/api/meta/oauth/start/route.ts`
- `src/app/api/meta/oauth/callback/route.ts`
- `src/app/api/oauth/[provider]/authorize/route.ts`
- `src/app/api/oauth/[provider]/callback/route.ts`
- `src/lib/oauth/providers/meta-facebook.ts`
- `src/lib/oauth/providers/meta-instagram.ts`

現況：

- 目前仍是 generic OAuth 與 legacy Meta callback 並存
- UX 已補強切換帳號提示，但 production path 仍未完全統一
- 實際可用性仍受 Meta App Review / Advanced Access / Business Verification 影響

修復建議：

- 收斂主流程，只保留一條 production support 路徑
- 明確定義 Page / IG Business Account 選擇與重連流程
- 補齊 reviewer demo 與支援文件

### P0-3. production 模式仍存在 Meta env token fallback 風險

檔案位置：

- `src/lib/channels/meta.ts`
- `src/app/api/webhooks/meta/route.ts`
- `src/lib/instagram/comments-sync.ts`
- `scripts/refresh-meta-token.mjs`

現況：

- channel token 缺失時仍可能 fallback 到：
  - `META_PAGE_ACCESS_TOKEN`
  - `META_INSTAGRAM_BUSINESS_ACCOUNT_ID`
  - `META_PAGE_ID`
- 這在 demo 專案可接受，在多租戶 SaaS 不夠安全

修復建議：

- production 模式停用 env fallback
- 強制以 channel-level token / account binding 運作
- 補 tenant isolation regression tests

### P0-4. 對外 Billing / legal / README 文案與亂碼仍待整理

檔案位置：

- `README.md`
- `docs/project-launch-checklist.md`
- `docs/environment-variables.md`
- `src/lib/billing/plans.ts`
- `src/app/billing/page.tsx`
- `src/app/privacy-policy/page.tsx`
- `src/app/terms-of-service/page.tsx`
- `src/app/data-deletion/page.tsx`

現況：

- 仍有多處亂碼或不夠對外可讀的中文文案
- 這會直接影響正式收費時的信任感

修復建議：

- 全面整理 UTF-8 與繁中內容
- 先補 Billing / Pricing / Terms / Privacy / Data Deletion

## 已完成的 P0

### 已完成：billing interval 與 subscription correctness

檔案位置：

- `src/lib/billing/payment-service.ts`
- `src/app/api/billing/payuni/checkout/route.ts`
- `prisma/schema.prisma`
- `prisma/migrations/20260610113000_payment_order_interval/migration.sql`
- `tests/payuni-billing.test.ts`
- `tests/billing-checkout-route.test.ts`

結果：

- `PaymentOrder` 新增 `interval` 欄位，保存 month / year
- `completePaidPaymentOrder()` 改用 `order.interval`
- zero-amount / credit-only checkout 會建立 `internal_credit` payment order，再走共用 completion flow
- completion 維持 idempotent，不會重複建立 subscription 或重複發 referral / affiliate side effects

## P1 問題清單

### P1-1. plan enforcement 還不夠完整

檔案位置：

- `src/lib/billing/entitlements.ts`
- `src/app/api/automations/route.ts`
- `src/app/api/broadcasts/route.ts`
- `src/app/api/sequences/route.ts`

修復建議：

- 把 `automations`、`broadcasts`、`sequences`、`teamSeats`、`activeContacts` 全部收斂到一致的 quota gate

### P1-2. trial / expired / past_due / unpaid 仍缺完整產品行為

檔案位置：

- `src/lib/billing/usage-service.ts`
- `src/lib/billing/entitlements.ts`
- `src/app/billing/page.tsx`

修復建議：

- 補齊 subscription 狀態到 UI / API 的限制與提示

### P1-3. affiliate / referral 還不夠完整

檔案位置：

- `src/lib/billing/referral-service.ts`
- `src/lib/billing/affiliate-service.ts`
- `prisma/schema.prisma`

修復建議：

- 補 anti-fraud、refund / clawback、affiliate terms、monthly payout SOP

## P2 問題清單

- onboarding 還不夠自助式
- billing 頁對 sandbox / production 差異說明不足
- README 與 checklist 需要持續和實作同步
- refund policy / cookie policy / 客服流程還不夠完整

## P3 問題清單

- 部分文件與後台頁面仍需文字打磨
- 部分 placeholder 心智負擔仍在
- 管理後台資訊層級可再整理

## 建議上線判定

### 可以 Beta 試賣

條件：

- 白名單客戶
- 少量 workspace
- Meta 權限已在實際帳號上測通
- Redis + worker + Postgres + HTTPS 都已配置
- PayUNI 若 production 尚未開通，先採人工收費

### 不建議正式公開販售

原因：

- production 金流仍未完全開通
- Meta production 權限與 reviewer 流程仍未完全收斂
- 多租戶安全邊界還沒全收乾淨
- 對外法務與帳務頁文案仍需整理

## 2026-06-26 - Public paid launch control decision

Status:

- Private beta / whitelist launch: Go.
- Public paid launch: Hold.

Completed:

- Production runtime health is ok.
- Staging runtime health is ok and isolated as `dbEnv=staging`.
- Prisma production migration-history baseline is complete.
- Alias automation has guarded production/staging behavior.
- Meta App Review package, recording shot list, screenshot redaction checklist, reviewer-safe handoff checklist, and PayUNI go-live checklist are merged.
- `docs/public-paid-launch-control-room.md` now provides the final execution order.

Remaining public paid launch gates:

1. Meta App Review / Advanced Access / Business Verification approval.
2. Reviewer-safe Meta test assets and final redacted recording/screenshots.
3. PAYUNi production merchant approval.
4. Explicit controlled enablement of `PAYUNI_ALLOW_PRODUCTION=true`.
5. First low-value production checkout smoke with callback/idempotency/audit verification.
6. Final human read of Billing, Terms, Privacy, and Data Deletion pages.

Product readiness implication:

- Codex-direct launch packaging is complete.
- The remaining blockers are external approval or live-payment operations, so they should stay manual and recorded in the launch log.

## 2026-06-26 - Autopilot readiness implication

Status:

- Autopilot can now run with Supabase CLI auth, Vercel CLI project link, local Supabase test DB, and PayUNI sandbox smoke.
- The local execution path is suitable for overnight code/docs/test loops when production DB, Meta submission, and PayUNI production switching remain blocked.
- The test path uses local Supabase Postgres instead of production DB.

Product readiness implication:

- Engineering automation readiness improved.
- Public paid launch status does not change: still Hold until Meta App Review approval and PayUNI production go-live are completed manually.

Remaining product gates:

1. Meta App Review / Advanced Access / Business Verification approval.
2. Final reviewer recording and screenshot package.
3. PAYUNi production merchant approval.
4. Controlled `PAYUNI_ALLOW_PRODUCTION=true` enablement.
5. First low-value production checkout smoke.
6. Final legal, billing, refund, privacy, and support copy read-through.

## 2026-06-27 - Contact detail feature completeness

Status:

- Contact detail now matches the bright Contacts list visual language.
- Username, email, and phone are editable from the detail page.
- Contact-level tag add/remove is available from the detail page.
- The page keeps Server Component data loading and isolates browser interactivity in a focused Client Component.

Readiness implication:

- Contacts feature completeness improved for private beta.
- Public paid launch status does not change; Meta App Review and PayUNI production gates remain external/manual blockers.
- Add authenticated browser smoke for this workflow before treating it as fully regression-covered.

## 2026-06-27 - Instagram connection failure UX

Status:

- Meta OAuth callback failures now surface safe Chinese error messages on the social connection page.
- Simple release keeps the product flow aligned to Instagram by defaulting the legacy Meta start route to Instagram and blocking explicit Facebook MBS mode.
- The social connection page shows `meta_error` as a red alert instead of a quiet plain-text message.

Readiness implication:

- Private beta diagnosis is improved when IG connection fails.
- Public paid launch remains Hold until Meta App Review / Advanced Access / Business Verification are complete.
- Add browser smoke for the alert rendering and simple-mode provider visibility.

## 2026-06-27 - Simple release gated feature notice

Status:

- Full-only routes on the simple production release now redirect to Dashboard with `alert=feature_gated`.
- Dashboard shows a warning toast explaining that the feature is controlled in the production operating release.
- The toast points whitelist testers and full-version evaluators to `https://staging.carry-digital-nomad.in.net`.

Readiness implication:

- Production simple release is clearer for users who reach gated features.
- Public paid launch status does not change.
- Add browser smoke for the gated redirect and toast before treating it as fully regression-covered.

## 2026-06-27 - Contacts filter and batch tagging completeness

Status:

- Contacts search, subscription-status filter, tag filter, sidebar filter navigation, row selection, and selected-contact batch add tag are now implemented.
- The batch tag write path uses `POST /api/contacts/batch-tags` and limits writes to contacts visible to the current workspace / selected Instagram account scope.
- Authenticated Playwright smoke now verifies filtering and batch tagging with local/test DB seed data.

Readiness implication:

- Contacts is closer to a usable private-beta CRM surface instead of a static list.
- Public paid launch status does not change; Meta App Review and PayUNI production gates remain external/manual blockers.
- Remaining Contacts UX gaps are lower-risk: batch remove tag, segment creation from filters, and clearer filtered empty states.

## 2026-06-27 - Browser smoke coverage closeout

Status:

- Contact detail edit/cancel/save and tag add/remove now have authenticated Playwright smoke coverage.
- Meta OAuth failure rendering now has Playwright smoke coverage with safe Chinese `meta_error` copy and error code display.
- Simple release now has Playwright smoke coverage for hiding Facebook / Meta Login provider entries.
- Simple release `/billing` gating now has Playwright smoke coverage for redirect parameters and Dashboard feature-gated notice.

Readiness implication:

- Private beta regression confidence improved for Contacts and IG connection diagnostics.
- Public paid launch status does not change; Meta App Review approval and PayUNI production go-live remain external/manual blockers.
- Consider splitting full-release and simple-release Playwright smoke into separate CI jobs so both release modes are continuously verified.

## 2026-06-27 - Release-mode smoke CI split

Status:

- Full-release authenticated smoke and Contacts smoke now run separately from simple-release smoke in CI.
- Simple-release smoke has its own `INBOXPILOT_RELEASE_CHANNEL=simple` job, so `/billing` gate and Instagram-only provider visibility are no longer hidden inside the full-release path.
- Contacts smoke has its own spec, making Contacts regressions easier to diagnose without scanning the general route smoke.

Readiness implication:

- Regression confidence improved for both Production simple release and Staging/full release.
- Public paid launch status does not change; external Meta App Review and PayUNI production gates remain manual blockers.
- Next CI run should be reviewed once to confirm the new job split is stable.

## 2026-06-27 - Contacts bulk operations and segment creation

Status:

- Contacts now supports selected-contact batch add tag and batch remove tag.
- Contacts can save the current filter state as a reusable Segment.
- Segment filters now include optional search text (`q`) in addition to tag, consent status, channel, and recent inbound window.
- Browser smoke fixtures were isolated per Playwright project to prevent desktop/mobile parallel test contamination.

Readiness implication:

- Contacts is now closer to a usable private-beta CRM surface for daily operator workflows.
- Public paid launch status does not change; Meta App Review and PayUNI production gates remain external/manual blockers.
- Remaining Contacts UX improvements are lower-risk: clearer filtered empty states and optional segment preview counts.

## 2026-06-27 - Instagram multi-account metadata fallback

Status:

- Production operators can keep using ID-only Instagram channels after the fix is deployed; the sidebar no longer hides them.
- Partial metadata is shown honestly with a fallback name and reminder to retry profile refresh from Channels.
- Automations now communicates that flows are workspace-wide, avoiding a false expectation that sidebar channel switching scopes automation flows.

Readiness implication:

- This reduces confusion for multi-account IG beta testing.
- Public paid launch status does not change; Meta App Review and PayUNI production go-live remain manual external gates.
