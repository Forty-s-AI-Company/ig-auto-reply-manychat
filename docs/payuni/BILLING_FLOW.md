# PayUNI Billing Flow

## Checkout

1. User 選擇方案 / interval / addons。
2. 系統建立 Invoice 與 InvoiceItem。
3. 套用可用折抵金，但 invoice total 不可小於 0。
4. 若 total = 0，直接標記 paid。
5. 若 total > 0，建立 PaymentOrder。
6. 送往 PayUNI checkout。

## Notify / Return

入口：

- `POST /api/billing/payuni/notify`
- `POST /api/billing/payuni/return`

PayUNI callback 會解析 `EncryptInfo` / `HashInfo`，再以 `MerTradeNo` 找回 PaymentOrder。

## Idempotency

若 PaymentOrder 已是 `paid`，callback 直接回傳成功，不重複：

- mark invoice paid
- update subscription
- create referral credit
- create affiliate commission

## Payment Success 後流程

1. `PaymentOrder.status = paid`
2. `Invoice.status = paid`
3. 更新 Subscription
4. 建立首次付費 referral credit
5. 若 referrer 是 approved Creator+，建立 affiliate commission

## 注意

目前 migration history 仍有舊 SQLite lock；Supabase 使用 `prisma db push` 已同步 schema。正式上線前建議重整 PostgreSQL migration history。
