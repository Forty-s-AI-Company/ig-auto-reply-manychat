# Billing / Affiliate Readiness

更新日期：2026-06-10

## PayUNI 目前狀態

### 程式碼狀態

核心檔案：

- `src/app/api/billing/payuni/checkout/route.ts`
- `src/app/api/billing/payuni/notify/route.ts`
- `src/app/api/billing/payuni/return/route.ts`
- `src/lib/payuni.ts`
- `src/lib/billing/payuni-callback.ts`
- `src/lib/billing/payment-service.ts`

目前流程：

1. `checkout` 建 invoice / paymentOrder
2. 產出 auto-submit form 導向 PayUNI
3. `notify` / `return` 都透過 `handlePayuniCallback()`
4. `parsePayuniResult()` 驗證 `HashInfo`
5. 成功後 `completePaidPaymentOrder()` 更新訂閱

### 目前判定

- **測試站可用**
- **正式站未達可直接公開收款**

原因：

- 非 sandbox gateway 時，若沒設 `PAYUNI_ALLOW_PRODUCTION=true`，checkout 直接拒絕
- 代表正式 merchant review / production 放行仍是 blocker

## 測試站 / 正式站差異

來源：

- `src/lib/payuni.ts`
- `.env.example`
- `docs/environment-variables.md`

差異：

- `PAYUNI_GATEWAY_URL` 預設指向 sandbox
- `isPayuniSandboxGateway()` 會識別 sandbox / test host
- production 需要額外開關 `PAYUNI_ALLOW_PRODUCTION=true`

## 訂閱流程完成度

### 已完成

- invoice / paymentOrder / subscription schema 存在
- PayUNI result 有 hash 驗證
- paid order 會更新 invoice / payment order / subscription
- referral / affiliate hook 已掛在付款完成後

### 未完成 / 有缺口

1. `completePaidPaymentOrder()` 把 interval 寫死成 `month`
2. 零元折抵交易沒有完整 subscription activation flow
3. add-on / seats / retention 的計費與權限套用不完整
4. 訂閱過期、`past_due`、`unpaid` 的產品行為限制還不夠完整

## 聯盟分潤完成度

核心檔案：

- `src/lib/billing/referral-service.ts`
- `src/lib/billing/affiliate-service.ts`
- `prisma/schema.prisma`

### 已完成

- referral code 生成
- attribution
- first payment referral credit
- affiliate profile / payout profile
- commission 建立
- hold period
- payout request / payout batch schema

### 未完成 / 不足

- anti-fraud 邏輯偏弱，`riskFlagsJson` 只記資料，沒有真正阻擋流程
- 沒有完整 affiliate terms 頁
- 沒有完整 refund / clawback 後台操作閉環
- monthly settlement / paid reconciliation 缺少完整營運介面驗證

## 目前能不能收費

### 自動正式收費

- **目前不建議**

### Beta / MVP 收費

- **可以，但要保守**

適合方式：

- 小量客戶
- sandbox 或人工對帳
- 人工開通方案
- 不主打自助升級與年繳

## 如果不能正式自動收費，MVP 人工收費替代方案

建議短期方案：

1. 官網保留方案頁，但不要直接承諾即時自助扣款
2. 使用表單或聯絡頁蒐集購買需求
3. 人工收款：
   - 銀行轉帳
   - 第三方付款連結
   - PayUNI sandbox 先不對外
4. 後台由 admin 人工建立 / 啟用 subscription
5. invoice / payment order 先保留內部紀錄

## 結論

- **Billing 架構有了，但還沒到可放心公開賣的程度**
- **Affiliate 骨架不錯，但還不算成熟營運系統**
- 若要先賣 MVP，應採 **人工收費 + 人工開通 + 白名單客戶** 模式
