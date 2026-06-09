# InboxPilot Fix Roadmap

更新日期：2026-06-10

## Phase 0：正式販售前 blocker

### 目標

先把「會直接影響收錢、授權、租戶安全、平台連接」的問題關掉。

### 主要修項

1. 修 PayUNI production readiness 與 billing flow
   - `src/app/api/billing/payuni/checkout/route.ts`
   - `src/lib/billing/payment-service.ts`
   - `src/lib/billing/invoice-service.ts`
2. 修正年繳 / 零元訂單 subscription activation
3. production 移除 Meta env token fallback
   - `src/lib/channels/meta.ts`
   - `src/app/api/webhooks/meta/route.ts`
   - `src/lib/instagram/comments-sync.ts`
4. 收斂 Meta OAuth 主流程
   - `src/app/api/meta/oauth/start/route.ts`
   - `src/app/api/meta/oauth/callback/route.ts`
   - `src/app/api/oauth/[provider]/authorize/route.ts`
   - `src/lib/oauth/providers/meta-facebook.ts`
   - `src/lib/oauth/providers/meta-instagram.ts`
5. 修 Billing / legal / README 亂碼

### 驗證指令

```bash
npm run lint
npm run build
npm test
```

建議額外補：

```bash
npm run test:e2e
```

## Phase 1：Beta 試賣必修

### 目標

讓少量付費客戶能穩定用，且不會被 UI / 文件 / onboarding 拖死。

### 主要修項

1. Billing 頁面與 legal 頁面文字重整
2. 補 refund policy / cookie policy / affiliate terms
3. 補 subscription gate tests
4. 補 tenant isolation tests
5. 補 Meta 連接成功後的帳號確認與解除綁定 UX
6. 強化 admin / audit / payout / affiliate 操作頁

### 驗證指令

```bash
npm run lint
npm run build
npm test
npm run test:e2e
```

## Phase 2：公開販售必修

### 目標

從 private beta 進入公開 SaaS。

### 主要修項

1. Meta App Review / Advanced Access / Business Verification 全收斂
2. 正式 PayUNI production 收款
3. 完整方案限制 enforcement
4. 取消訂閱 / 過期 / past_due / unpaid 產品行為閉環
5. affiliate payout reconciliation / clawback / anti-fraud
6. production observability：
   - structured logs
   - alerts
   - queue lag
   - billing callback failure alert

### 驗證指令

```bash
npm run lint
npm run build
npm test
npm run test:e2e
npm run test:coverage
```

## Phase 3：規模化優化

### 目標

準備更大流量與更多客戶。

### 主要修項

1. 1000 user single-wave 負載問題
2. queue-first ingestion / durable job orchestration
3. materialized summaries / cache
4. affiliate / billing ops automation
5. 更多渠道正式化（WhatsApp / SMS / LINE / TikTok）

### 驗證指令

```bash
npm run lint
npm run build
npm test
npm run test:e2e
npm run load:test
```

## 下一個 Codex 任務建議

```text
請根據 docs/product-readiness-review.md 與 docs/billing-affiliate-readiness.md，先只修 Phase 0 的四項：
1. 修正 billing interval 與 zero-amount invoice 不會啟用 subscription 的問題
2. 移除 production 下的 Meta env token fallback，避免多租戶誤綁定
3. 修復 Billing / Terms / Privacy / Data Deletion 的亂碼與中文文案
4. 補對應測試：PayUNI 年繳、credit-only 升級、Meta token fallback guard

限制：
- 不要大重構
- 每完成一項就回報
- 完成後跑 npm run lint、npm run build、npm test
```
