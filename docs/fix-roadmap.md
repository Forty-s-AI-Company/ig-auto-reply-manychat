# InboxPilot Fix Roadmap

## 2026-06-15：Meta Login 帳號選擇研究待辦

- 已新增 `docs/meta-login-account-selection-analysis.md`，記錄目前 Instagram OAuth、Facebook OAuth、legacy Meta Business Login 相容路徑與 ManyChat 差異。
- 後續建議：
  - 評估 Facebook Login for Business / Business Login for Instagram 是否可成為正式 account selection flow。
  - 在實驗分支測試 `force_reauth`、`force_authentication`、`enable_fb_login` 對不同瀏覽器 session 的實際效果。
  - 調整 UI 文案，避免承諾「一定能強制切換帳號」。
  - 若導入 login configuration / `config_id`，同步更新 Meta App Review 文件與 QA demo script。

更新日期：2026-06-10

## 目前驗證狀態

已執行：

```bash
git status
npm run lint
npm run build
npm test
npm run payuni:smoke
```

結果：

- `git status`：有本輪預期變更
- `npm run lint`：通過
- `npm run build`：通過
- `npm test`：第一次遇到既有 Vitest 子程序 crash，第二次完整通過
- `npm run payuni:smoke`：通過

補充：

- `npm run build` 仍有既有 Prisma engine DLL lock `EPERM` 噪音
- `scripts/prisma-generate-safe.mjs` 已 fallback 到既有 generated client，因此不構成 build failure

## Phase 0：正式販售前 blocker

### 任務 1：修正 billing interval 與 subscription correctness

狀態：`已完成`

檔案：

- `src/lib/billing/payment-service.ts`
- `src/app/api/billing/payuni/checkout/route.ts`
- `prisma/schema.prisma`
- `prisma/migrations/20260610113000_payment_order_interval/migration.sql`
- `tests/payuni-billing.test.ts`
- `tests/billing-checkout-route.test.ts`
- `src/lib/audit.ts`

完成內容：

- `PaymentOrder` 新增 `interval`
- checkout 建立 payment order 時保存實際 month / year
- completion 改用 `order.interval`
- zero-amount / credit-only checkout 改走 internal completion flow
- completion success / failure 補安全 audit
- 補 month / year / zero-amount / idempotency 測試

### 任務 2：production 移除 Meta env token fallback

狀態：`未完成`

檔案：

- `src/lib/channels/meta.ts`
- `src/app/api/webhooks/meta/route.ts`
- `src/lib/instagram/comments-sync.ts`
- `scripts/refresh-meta-token.mjs`

具體任務：

- production 停用 `META_*` env fallback
- 強制 channel token / account binding
- 補 tenant isolation regression tests

### 任務 3：收斂 Meta OAuth production 主流程

狀態：`未完成`

檔案：

- `src/app/api/meta/oauth/start/route.ts`
- `src/app/api/meta/oauth/callback/route.ts`
- `src/app/api/oauth/[provider]/authorize/route.ts`
- `src/app/api/oauth/[provider]/callback/route.ts`
- `src/lib/oauth/providers/meta-facebook.ts`
- `src/lib/oauth/providers/meta-instagram.ts`

具體任務：

- 收斂 generic / legacy callback 混線
- 明確定義 Page / IG Business Account 選擇與重連流程
- 補 reviewer / QA demo 支援文件

### 任務 4：整理 Billing / legal / README 亂碼與對外文案

狀態：`未完成`

檔案：

- `README.md`
- `docs/project-launch-checklist.md`
- `docs/environment-variables.md`
- `src/lib/billing/plans.ts`
- `src/app/billing/page.tsx`
- `src/app/privacy-policy/page.tsx`
- `src/app/terms-of-service/page.tsx`
- `src/app/data-deletion/page.tsx`

具體任務：

- 統一 UTF-8
- 補齊繁中對外文案
- 明確標示 sandbox / production / trial / refund / cancellation 說明

### Phase 0 驗證指令

```bash
npm run lint
npm run build
npm test
npm run payuni:smoke
```

## Phase 1：Beta 試賣必修

### 任務 1：補齊 plan enforcement

檔案：

- `src/lib/billing/entitlements.ts`
- `src/app/api/sequences/route.ts`
- `src/app/api/automations/route.ts`
- `src/app/api/broadcasts/route.ts`

具體任務：

- 補 `sequences`
- 補 `teamSeats`
- 補 `activeContacts`
- 補 usage summary 與 quota gate 一致性

### 任務 2：補 trial / expired / past_due / unpaid 產品行為

檔案：

- `src/lib/billing/usage-service.ts`
- `src/lib/billing/entitlements.ts`
- `src/app/billing/page.tsx`

### 任務 3：補 onboarding / reconnect UX

檔案：

- `src/app/channels/connect/social/page.tsx`
- `src/app/channels/connect/success/page.tsx`
- `src/app/channels/page.tsx`

### 任務 4：補 affiliate terms / refund policy / cookie policy

檔案：

- `src/app/**`
- `docs/**`

### Phase 1 驗證指令

```bash
npm run lint
npm run build
npm test
npm run test:e2e
```

## Phase 2：公開販售必修

### 任務 1：完成 Meta App Review / Advanced Access / Business Verification

檔案：

- `docs/meta-app-review-checklist.md`
- Meta Developer 後台設定

### 任務 2：完成 PayUNI production go-live

檔案：

- `src/app/api/billing/payuni/checkout/route.ts`
- deployment env / runbook

### 任務 3：補 affiliate anti-fraud / payout reconciliation

檔案：

- `src/lib/billing/referral-service.ts`
- `src/lib/billing/affiliate-service.ts`
- `src/app/api/admin/**`

### 任務 4：補 billing / webhook / admin observability

檔案：

- `src/lib/audit.ts`
- `src/app/api/**`
- `scripts/**`

### Phase 2 驗證指令

```bash
npm run lint
npm run build
npm test
npm run test:e2e
npm run payuni:smoke
```

## Phase 3：規模化優化

### 任務 1：高併發與 load test 收斂

檔案：

- `src/lib/queue.ts`
- `scripts/worker.ts`
- `src/lib/messages.ts`
- `src/lib/instagram/comments-sync.ts`
- `src/app/api/dashboard/route.ts`

### 任務 2：queue-first ingestion / durable processing

檔案：

- `src/lib/jobs.ts`
- `src/lib/queue.ts`
- `scripts/worker.ts`

### 任務 3：補齊正式 channel productization

檔案：

- `src/lib/channels/**`
- `src/app/channels/**`

### Phase 3 驗證指令

```bash
npm run lint
npm run build
npm test
npm run test:e2e
npm run load:test
```

## 下一個建議 Codex 任務

```text
請先閱讀 AGENTS.md、docs/product-readiness-review.md、docs/security-review.md、docs/meta-app-review-checklist.md、docs/billing-affiliate-readiness.md、docs/fix-roadmap.md，然後只修 Phase 0 任務 2：

1. 在 production 模式移除 Meta env token fallback
2. 保留 local / sandbox 開發可用性，但正式環境必須強制使用 channel token
3. 補 tenant isolation regression tests，覆蓋 webhook、comment sync、send message
4. 更新 docs/codex-session-log.md、docs/fix-roadmap.md、docs/security-review.md、docs/product-readiness-review.md

限制：
- 不要大重構
- 不要改 Meta OAuth 主流程
- 先列出風險
- 完成後跑 npm run lint、npm run build、npm test
```
