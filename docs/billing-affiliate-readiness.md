# Billing / Affiliate Readiness

更新日期：2026-06-10

## PayUNI 目前狀態

### 核心檔案

- `src/app/api/billing/payuni/checkout/route.ts`
- `src/app/api/billing/payuni/notify/route.ts`
- `src/app/api/billing/payuni/return/route.ts`
- `src/lib/payuni.ts`
- `src/lib/billing/payuni-callback.ts`
- `src/lib/billing/payment-service.ts`

### 目前判定

- **測試站可用**
- **正式站未達可放心公開收費**

原因：

- production gateway 仍受到 `PAYUNI_ALLOW_PRODUCTION` 保守開關控制
- 代表 merchant review / production launch 尚未完全就緒

## 測試站 / 正式站差異

來源：

- `src/lib/payuni.ts`
- `.env.example`
- `docs/environment-variables.md`

差異：

- `PAYUNI_GATEWAY_URL` 預設 sandbox
- `isPayuniSandboxGateway()` 會判斷 sandbox / test host
- 非 sandbox 時，若 `PAYUNI_ALLOW_PRODUCTION !== "true"`，checkout 直接拒絕

## checkout / return / notify 是否完整

### checkout

- 有 auth
- 有 same-origin
- 有 rate limit
- 有 idempotency-key 重入短路
- 會建 invoice / paymentOrder

但：

- 0 元 invoice 直接 success redirect，沒有完整 subscription activation flow

### notify

- 有 rate limit
- 會經過 `handlePayuniCallback()`
- 會做 `HashInfo` 驗證

但：

- callback 失敗 observability 還偏弱

### return

- 路由存在
- 與 notify 共用 callback handler 邏輯

整體結論：

- **結構是完整的**
- **production correctness 還不夠**

## notify 簽章驗證與 idempotency 是否完整

### 簽章驗證

來源：

- `src/lib/payuni.ts`

結果：

- 有 `HashInfo` 驗證
- 缺少 `EncryptInfo` / `HashInfo` 會直接報錯

### idempotency

來源：

- `src/lib/billing/payuni-callback.ts`

結果：

- 若 `paymentOrder.status === "paid"`，會直接 idempotent return
- 基本 callback idempotency 有做

但：

- checkout side 的 idempotency 只對 pending 同 plan 有效，對更複雜升級 / 重試情境仍可再強化

## 訂閱流程完成度

### 已完成

- schema 存在：`Subscription`、`PaymentOrder`、`Invoice`
- paid callback 後會更新 payment order / invoice / subscription
- referral / affiliate hook 已掛到付款完成

### 主要缺口

1. `completePaidPaymentOrder()` 內 interval 被寫死成 `month`
2. 0 元折抵成功未必真正啟用 subscription
3. 過期 / past_due / unpaid 的產品層行為限制不完整

## 試用期完成度

來源：

- `prisma/schema.prisma`
- `src/lib/billing/plans.ts`
- `src/lib/billing/referral-service.ts`

結果：

- 有 `trialing`
- 有 `TRIAL_DAYS`
- referral 會加 trial day / trial events

但：

- trial 結束後產品層限制與升級引導還不夠完整

## 推薦碼完成度

來源：

- `src/lib/billing/referral-service.ts`

結果：

- referral code 生成
- attribution
- trial bonus
- first payment credit

但：

- anti-fraud 邏輯偏弱
- `riskFlagsJson` 主要是記錄，不是完整防作弊

## 聯盟分潤完成度

來源：

- `src/lib/billing/affiliate-service.ts`
- `prisma/schema.prisma`

結果：

- affiliate profile
- payout profile
- commission 建立
- hold period
- payout request / payout batch schema

但：

- monthly settlement / payout ops 還不算完整營運系統
- 缺聯盟條款
- refund / clawback 閉環不完整

## 目前能不能正式收費

**不建議。**

主要原因：

1. PayUNI production 還在保守模式
2. subscription correctness 還有 P0 問題
3. 對外 Billing / legal 頁面存在亂碼

## 如果不能正式自動收費，MVP 人工收費替代方案

建議：

1. 官網保留方案頁，但不要承諾即時自助扣款
2. 用聯絡頁 / 表單收集購買需求
3. 人工請款：
   - 銀行轉帳
   - 第三方付款連結
   - 人工對帳
4. 後台由 admin 人工開通 subscription
5. 先把 invoice / paymentOrder 當內部紀錄

## 結論

- Billing 架構已具備產品骨架
- Affiliate / referral 不是空殼，但還不到成熟營運級
- 目前最務實的做法是：**先 Beta 試賣，金流可採人工替代**
