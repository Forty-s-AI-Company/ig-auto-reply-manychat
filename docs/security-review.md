# InboxPilot Security Review

更新日期：2026-06-10

## 總結

- 高風險：`仍有`
- 中風險：`仍有`
- 低風險：`有`
- 是否有敏感資訊外洩風險：`目前未看到明顯前端外洩，但 production 仍需持續防守`
- 是否有多租戶資料外洩風險：`有中高風險，主因是 Meta env token fallback 尚未移除`

這一輪已完成的安全改善：

- billing completion 現在用 `PaymentOrder.interval` 驅動，不再因 hardcoded month 造成 plan / entitlement 錯配
- zero-amount / credit-only checkout 已走正式 internal completion flow
- billing completion success / failure 已補安全 audit，未記錄 PayUNI secret、hash key、token、完整敏感 payload

## 高風險

### 1. Meta env token fallback 仍可能跨 tenant 誤用

檔案位置：

- `src/lib/channels/meta.ts`
- `src/app/api/webhooks/meta/route.ts`
- `src/lib/instagram/comments-sync.ts`

問題：

- channel token 缺失時，仍可能 fallback 到全域 env token
- 在單租戶 demo 可容忍，在多租戶 SaaS 風險太高

影響：

- 錯發訊息
- 用錯 Page / IG Business Account
- tenant boundary 被弱化

必須立刻修：

- production 模式停用 env fallback
- 所有 Meta 操作都要求 channel-level token 與 account binding

### 2. 多租戶隔離仍以應用層為主，缺少更強的回歸保證

檔案位置：

- `src/lib/workspaces.ts`
- `src/app/api/**`
- `prisma/schema.prisma`

問題：

- 多數流程有 `workspaceId` 限制，但尚未形成完整的 tenant isolation regression suite
- 目前沒有足夠證據證明每個敏感 query 都被持續保護

必須立刻修：

- 補 tenant isolation tests
- 補 query helper / review checklist，避免 route 漏帶 `workspaceId`

## 中風險

### 1. Secret encryption 在 production 若未設 `TOKEN_ENCRYPTION_KEY` 會 fallback 到 `AUTH_SECRET`

檔案位置：

- `src/lib/secrets.ts`

建議：

- production 強制要求 `TOKEN_ENCRYPTION_KEY`

### 2. Audit log 仍是 best-effort

檔案位置：

- `src/lib/audit.ts`

問題：

- audit 失敗時不應阻斷主流程，這個策略合理
- 但目前缺少更完整的告警 / metrics 補位

建議：

- 對 auth / billing / webhook / admin failure audit 補 alert / dashboard

### 3. CSRF 主要靠 same-origin / origin 驗證

檔案位置：

- `src/lib/security.ts`
- `src/proxy.ts`

建議：

- 現況對內部表單 API 基本可接受
- 若後續增加第三方嵌入或更高風險後台操作，可再考慮 token-based CSRF

### 4. Billing completion 仍需持續觀察 idempotency 邊界

檔案位置：

- `src/lib/billing/payment-service.ts`
- `src/app/api/billing/payuni/checkout/route.ts`
- `src/lib/billing/payuni-callback.ts`

現況：

- paid callback 已有 idempotent short-circuit
- internal credit flow 以 `invoiceId + provider=internal_credit` 重用 payment order，再經 `order.status === "paid"` 避免重複啟用

建議：

- 後續再補更多整合測試，覆蓋 retry / return / notify 混合重入

## 低風險

### OAuth 安全審查

檔案位置：

- `src/app/api/oauth/[provider]/authorize/route.ts`
- `src/app/api/oauth/[provider]/callback/route.ts`
- `src/app/api/meta/oauth/start/route.ts`
- `src/app/api/meta/oauth/callback/route.ts`

結果：

- 有 `state`
- 有 callback failure audit
- 已避免在 audit 內記錄 token / secret / authorization code
- 但 Meta flow 仍是 generic + legacy 混合，維護風險較高

### Webhook 安全審查

檔案位置：

- `src/lib/webhook-security.ts`
- `src/app/api/webhooks/meta/route.ts`
- `src/app/api/webhooks/telegram/route.ts`
- `src/app/api/webhooks/whatsapp/route.ts`
- `src/app/api/automation-webhooks/[key]/route.ts`

結果：

- 已有 signature / shared secret 驗證
- 已有 rate limit
- 已有部分失敗 audit
- 仍建議補更完整 duplicate event / replay 測試

### Payment 安全審查

檔案位置：

- `src/lib/payuni.ts`
- `src/lib/billing/payuni-callback.ts`
- `src/app/api/billing/payuni/notify/route.ts`
- `src/app/api/billing/payuni/checkout/route.ts`

結果：

- `HashInfo` 驗證存在
- paid callback idempotency 存在
- 這一輪新增 internal credit completion flow 與安全 audit

### Admin 安全審查

檔案位置：

- `src/lib/admin-auth.ts`
- `src/lib/auth.ts`

結果：

- admin / operator 基礎角色存在
- 後續仍需更細的角色矩陣與審批流程

### Prisma / RLS 審查

檔案位置：

- `prisma/schema.prisma`
- `src/app/api/**`
- `src/lib/**`

結果：

- schema 結構完整，workspace / billing / audit / affiliate 主要表都有
- 目前主要依賴 Prisma server-side access，不是 Supabase RLS-first 架構
- 文件上不應誤導為「已完整依賴 RLS」

## 敏感資訊外洩風險

目前沒有看到明顯把以下資料打進前端 bundle 的證據：

- access token
- PayUNI hash key / iv
- app secret
- service role key

但仍需持續注意：

- console / audit / docs 不得落出完整付款敏感 payload
- `.env*` 與部署平台 env 權限需嚴格控管

## 必須立刻修的安全項

1. production 停用 Meta env token fallback
2. production 強制要求 `TOKEN_ENCRYPTION_KEY`
3. 補 tenant isolation regression tests
4. 補 billing / webhook / admin failure alerting
