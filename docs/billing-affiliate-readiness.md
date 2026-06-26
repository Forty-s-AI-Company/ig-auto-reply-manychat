# Billing / Affiliate Readiness

## 2026-06-26 - Billing CI authenticated smoke

- Authenticated route smoke now covers the Billing page in CI and nightly automation.
- The smoke renders the Billing page only and does not submit PayUNI checkout.
- The smoke runs against `TEST_DATABASE_URL` and refuses Production DB markers.
- PayUNI production remains disabled until the controlled production go-live checklist is approved.

## 2026-06-26 - PayUNI production go-live checklist prepared

- Added [PayUNI Production Go-Live Checklist](./payuni-production-go-live-checklist.md).
- The checklist defines required Vercel Production env names, PAYUNi dashboard checks, pre-go-live validation, controlled enablement, callback verification, rollback, and Go / Hold criteria.
- No `PAYUNI_ALLOW_PRODUCTION=true` switch was performed.
- No production checkout or live card transaction was executed.
- No PayUNI secret, Hash Key, Hash IV, Merchant ID value, or transaction credential was recorded.

Current decision:

- PayUNI production readiness is operationally clearer.
- Public paid launch remains Hold until merchant approval, operator-approved low-value production smoke, callback/idempotency evidence, and refund/settlement ownership are complete.

## 2026-06-26 - PR #2 post-deploy PayUNI delta

- PR #2 billing/legal copy and PayUNI Production SOP are now deployed to the production target.
- Production `/api/health` is ok after deployment.
- Added route-level regression coverage confirming PayUNI checkout idempotency lookup and invoice creation are scoped to the current workspace and user.
- No PayUNI production checkout was executed in this delta.
- No DB commands, Prisma commands, SQL, migrations, schema changes, or secret output were used.

Remaining PayUNI production gates:

- Confirm PayUNI production merchant approval and final production credentials in Vercel Production.
- Keep production checkout blocked until the SOP explicitly enables `PAYUNI_ALLOW_PRODUCTION=true`.
- Run one low-value production checkout after the controlled switch.
- Verify notify/return idempotency using real production callbacks.
- Assign an owner for refunds, settlement reconciliation, failed payment support, and customer billing copy review.

## 2026-06-26 - PayUNI production SOP and billing copy cleanup

- Added [PayUNI Production SOP](./payuni-production-sop.md).
- Billing page now labels PayUNI production as controlled until `PAYUNI_ALLOW_PRODUCTION=true`.
- Terms now state that card number, CVV, OTP, and 3-D Secure data are handled by PayUNI/bank pages, not stored by InboxPilot.
- Terms now include refund/cancellation and workspace data-boundary language.
- Privacy policy now describes payment metadata retention and workspace/channel data isolation.
- Data Deletion page now clarifies Meta channel token deletion and payment/audit record retention boundaries.

Billing launch implication:

- Documentation and customer-facing copy are improved enough for private beta and whitelist customers.
- Public paid launch remains Hold until production merchant review, first low-value production checkout smoke, notify/return idempotency evidence, and refund/settlement owner assignment.

更新日期：2026-06-10

## PayUNI 目前狀態

### 實際狀態

- Checkout：`可用`
- Return：`可用`
- Notify：`可用`
- Notify 簽章驗證：`可用`
- Notify idempotency：`可用`
- Production 自動收費：`尚未建議公開開啟`

### 核心檔案

- `src/app/api/billing/payuni/checkout/route.ts`
- `src/app/api/billing/payuni/notify/route.ts`
- `src/app/api/billing/payuni/return/route.ts`
- `src/lib/payuni.ts`
- `src/lib/billing/payuni-callback.ts`
- `src/lib/billing/payment-service.ts`
- `prisma/schema.prisma`

## 測試站 / 正式站差異

目前設計：

- `PAYUNI_GATEWAY_URL` 可切 sandbox / production
- `isPayuniSandboxGateway()` 會辨識 sandbox host
- 若不是 sandbox，且 `PAYUNI_ALLOW_PRODUCTION !== "true"`，checkout 會拒絕

結論：

- sandbox 流程可測
- production 流程仍受保守開關限制
- 這代表 merchant review 與 go-live 切換還沒有完全收尾

## checkout / return / notify 完成度

### checkout

已完成：

- auth
- same-origin 驗證
- rate limit
- idempotency-key 重送保護
- 建立 invoice / paymentOrder
- 保存 `interval`

這一輪補強：

- `PaymentOrder` 新增 `interval`
- 一般付款 checkout 建立 payment order 時，會保存 month / year
- zero-amount / credit-only checkout 不再只做 redirect，會呼叫正式 internal completion flow

### return

已完成：

- 會重新走 callback handler
- 依實際付款狀態 redirect success / failed

### notify

已完成：

- `HashInfo` 驗證
- 付款成功後走共用 callback completion
- paid order 重複通知不會重複啟用 subscription

## notify 簽章驗證與 idempotency

### 簽章驗證

檔案：

- `src/lib/payuni.ts`

現況：

- 已驗證 `HashInfo`
- 未在 audit / log 中記錄 PayUNI secret

### idempotency

檔案：

- `src/lib/billing/payuni-callback.ts`
- `src/lib/billing/payment-service.ts`
- `src/app/api/billing/payuni/checkout/route.ts`

現況：

- PayUNI callback：`paymentOrder.status === "paid"` 會 short-circuit
- Internal credit flow：以既有 `invoiceId + provider=internal_credit` order 重用，再透過 `completePaidPaymentOrder()` 的 paid short-circuit 保持 idempotent
- Checkout side：同 idempotency-key 的 pending payuni order 會重送原結帳表單；同 idempotency-key 的已完成訂單會直接 success redirect

## 訂閱流程完成度

### 這一輪修正前的 P0

1. `completePaidPaymentOrder()` 把 interval 寫死成 `month`
2. zero-amount / credit-only checkout 成功後未必真的啟用 subscription

### 這一輪修正後

- `PaymentOrder.interval` 保存訂單的實際 billing interval
- `completePaidPaymentOrder()` 直接使用 `order.interval`
- `completeInternalInvoicePaymentOrder()` 會建立 `internal_credit` payment order，再走共用 completion flow
- completion 成功後，invoice / paymentOrder / subscription 狀態會一起收斂
- completion 失敗會寫安全 audit，不含敏感付款資訊

結論：

- `month / year subscription correctness`：已修正
- `zero-amount subscription activation`：已修正

## 試用期完成度

檔案：

- `prisma/schema.prisma`
- `src/lib/billing/referral-service.ts`

現況：

- schema 與 trial days 基礎存在
- trial bonus / referral side effect 有骨架
- 但 trial 到 expired / past_due / unpaid 的整體產品限制仍未完全收斂

## 推薦碼完成度

檔案：

- `src/lib/billing/referral-service.ts`

現況：

- referral code / attribution / first payment credit 有基本實作
- anti-fraud、self-referral、防重複歸因規則還不夠完整

## 聯盟分潤完成度

檔案：

- `src/lib/billing/affiliate-service.ts`
- `prisma/schema.prisma`

現況：

- affiliate profile / payout profile / commission / payout request / payout batch schema 已存在
- 仍缺完整 monthly settlement、refund clawback、營運 SOP

## 目前能不能正式收費

### 正式自動收費

`不建議直接公開開放`

原因：

1. PayUNI production 仍受保守開關限制
2. 正式 merchant review / production SOP 尚未收尾
3. Billing 對外文案與 legal 頁仍待整理

### Beta 試賣

`可以`

前提：

- 少量客戶
- 人工確認每筆付款與 subscription 狀態
- 有 admin 對帳與稽核流程

## 如果不能正式自動收費，MVP 人工收費替代方案

建議做法：

1. 先由業務或客服人工收款
2. 後台建立 invoice / paymentOrder 記錄
3. 由 admin 內部觸發 subscription 啟用
4. 保留 invoice / paymentOrder / audit 對帳鏈
5. 等 PayUNI production merchant review 完成後，再切回正式 checkout

## 尚未完成的 billing P0

1. PayUNI production merchant review 與正式站切換 SOP
2. Billing / Terms / Privacy / Data Deletion / README 對外可讀性整理

## 測試狀態

這一輪已實測：

- `npm run lint` ✅
- `npm run build` ✅
- `npm test` ✅
- `npm run payuni:smoke` ✅

補充：

- `npm test` 第一次遇到既有的 Vitest 子程序 crash（Windows / Node 24 / Vitest 既有不穩定），第二次完整通過
- `npm run build` 成功，但仍有既有 Prisma engine DLL lock `EPERM` 噪音；`prisma-generate-safe` 已 fallback 成功
