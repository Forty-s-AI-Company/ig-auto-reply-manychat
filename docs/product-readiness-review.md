# InboxPilot Product Readiness Review

## 2026-06-26 - Unattended autopilot readiness package

Status: preview/staging automation prepared.

- Added a project-specific autopilot runner to automate code/docs fixes, lint/test/build, PayUNI sandbox smoke, Vercel Preview readiness, Supabase readiness, route smoke, QA, safety review, and final reports.
- Missing secrets, logins, external approvals, Meta reviewer actions, or PayUNI production readiness are recorded as `HUMAN_REQUIRED` instead of guessed.
- Production DB/schema writes and PayUNI production switching are not part of unattended automation.

Product readiness implication:

- The project can now run longer unattended preview/staging improvement loops.
- Public paid launch remains Hold until Meta App Review, PayUNI production go-live, tenant isolation evidence, and final operator review are complete.

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
