# InboxPilot Fix Roadmap

更新日期：2026-06-10

## 目前驗證狀態

本輪實際執行：

```bash
git status
npm run lint
npm run build
```

結果：

- `git status`：乾淨
- `npm run lint`：通過
- `npm run build`：通過

補充：

- build 過程仍出現既有 Prisma engine DLL lock `EPERM` 噪音
- `scripts/prisma-generate-safe.mjs` 已 fallback 到既有 generated client
- 這次不是 build failure，但仍是本機開發環境噪音，後續可整理

## Phase 0：正式販售前 blocker

### 任務 1：修正 billing interval 與 subscription correctness

檔案：

- `src/lib/billing/payment-service.ts`
- `src/app/api/billing/payuni/checkout/route.ts`
- `src/lib/billing/invoice-service.ts`

內容：

- 不要再把 interval 寫死成 `month`
- 讓 zero-amount / credit-only checkout 也會正確啟用 subscription

### 任務 2：production 移除 Meta env token fallback

檔案：

- `src/lib/channels/meta.ts`
- `src/app/api/webhooks/meta/route.ts`
- `src/lib/instagram/comments-sync.ts`
- `scripts/refresh-meta-token.mjs`

內容：

- 正式環境禁止拿全域 env token 當 channel token

### 任務 3：收斂 Meta OAuth 正式主流程

檔案：

- `src/app/api/meta/oauth/start/route.ts`
- `src/app/api/meta/oauth/callback/route.ts`
- `src/app/api/oauth/[provider]/authorize/route.ts`
- `src/app/api/oauth/[provider]/callback/route.ts`
- `src/lib/oauth/providers/meta-facebook.ts`
- `src/lib/oauth/providers/meta-instagram.ts`

內容：

- 明確定義正式主流程
- 降低 generic / legacy 混用造成的維護風險

### 任務 4：修正 Billing / legal / README 亂碼

檔案：

- `README.md`
- `docs/project-launch-checklist.md`
- `docs/environment-variables.md`
- `src/lib/billing/plans.ts`
- `src/app/billing/page.tsx`
- `src/app/privacy-policy/page.tsx`
- `src/app/terms-of-service/page.tsx`
- `src/app/data-deletion/page.tsx`

內容：

- 統一 UTF-8
- 先把對外可見頁面修乾淨

### Phase 0 驗證指令

```bash
npm run lint
npm run build
npm test
```

## Phase 1：Beta 試賣必修

### 任務 1：補齊 plan enforcement

檔案：

- `src/lib/billing/entitlements.ts`
- `src/app/api/sequences/route.ts`
- `src/app/api/automations/route.ts`
- `src/app/api/broadcasts/route.ts`

內容：

- 補 `sequences`
- 補 `teamSeats`
- 補 `activeContacts`
- 補更多 quota 行為

### 任務 2：補試用 / 過期 / past_due / unpaid 的產品行為

檔案：

- `src/lib/billing/usage-service.ts`
- `src/lib/billing/entitlements.ts`
- `src/app/billing/page.tsx`

### 任務 3：補 onboarding / 綁錯帳號 UX

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

### 任務 1：Meta App Review / Advanced Access / Business Verification 全收斂

檔案：

- `docs/meta-app-review-checklist.md`
- Meta app 後台設定

### 任務 2：PayUNI production 正式開通

檔案：

- `src/app/api/billing/payuni/checkout/route.ts`
- deployment env

### 任務 3：affiliate anti-fraud / payout reconciliation

檔案：

- `src/lib/billing/referral-service.ts`
- `src/lib/billing/affiliate-service.ts`
- `src/app/api/admin/**`

### 任務 4：billing / webhook / admin observability

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

### 任務 1：1000 user 負載優化

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

### 任務 3：更多渠道正式化

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

## 下一個 Codex 任務建議

```text
請先閱讀 AGENTS.md、docs/product-readiness-review.md、docs/security-review.md、docs/meta-app-review-checklist.md、docs/billing-affiliate-readiness.md、docs/fix-roadmap.md，然後只修 Phase 0：

1. 修正 billing interval 被寫死為 month 的問題
2. 修正 zero-amount / credit-only checkout 不會真正啟用 subscription 的問題
3. 在 production 模式移除 Meta env token fallback
4. 修正 Billing / Terms / Privacy / Data Deletion / README 的亂碼

限制：
- 不要大重構
- 不要改 UI 架構
- 先列出風險
- 補對應測試
- 完成後更新 docs/codex-session-log.md 與 docs/fix-roadmap.md
- 跑 npm run lint、npm run build、npm test
```
