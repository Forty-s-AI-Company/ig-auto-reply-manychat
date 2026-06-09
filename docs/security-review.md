# InboxPilot Security Review

更新日期：2026-06-10

## 總結

- 敏感資訊外洩風險：**中**
- 多租戶資料外洩風險：**中**
- OAuth / Webhook / Payment / Admin / Prisma / RLS：**有基礎，但還沒到完全放心**
- 必須立刻修的安全項：**Meta env token fallback、billing subscription correctness、production tenant fallback 邊界**

## 高風險

### 1. Meta env token fallback 對正式多租戶有風險

檔案：

- `src/lib/channels/meta.ts`
- `src/app/api/webhooks/meta/route.ts`
- `src/lib/instagram/comments-sync.ts`

說明：

- 若 channel config 沒有完整 token，程式會 fallback 到全域 env：
  - `META_PAGE_ACCESS_TOKEN`
  - `META_INSTAGRAM_BUSINESS_ACCOUNT_ID`
  - `META_PAGE_ID`
- 在單 workspace demo 方便，但在正式 SaaS 下可能把錯的 token 套到錯的 workspace / channel

結論：

- 這是目前最值得先修的 multi-tenant 安全問題之一

### 2. 多租戶隔離主要靠應用層，而不是 DB-first

檔案：

- `src/lib/workspaces.ts`
- `src/app/api/**`
- `prisma/schema.prisma`

說明：

- 大部分 API 有 `workspaceId` 篩選
- 但目前查不到一個可以保證「所有敏感資料都由 DB policy 強制隔離」的單一安全邊界
- 未來只要有新 route 少寫一個 `workspaceId`，就可能開洞

### 3. Billing correctness 會反過來影響授權安全

檔案：

- `src/lib/billing/payment-service.ts`
- `src/app/api/billing/payuni/checkout/route.ts`

說明：

- 年繳被寫死 month
- 0 元折抵成功不一定真正啟用 subscription
- 這不只是產品問題，也會造成錯誤授權與權限邊界錯配

## 中風險

### 1. Secret encryption 在 production 仍可能退回 `AUTH_SECRET`

檔案：

- `src/lib/secrets.ts`

說明：

- 若沒設 `TOKEN_ENCRYPTION_KEY`，會退回 `AUTH_SECRET`
- 再沒有才用 local dev constant

建議：

- production 強制要求 `TOKEN_ENCRYPTION_KEY`

### 2. Audit log 為 best-effort

檔案：

- `src/lib/audit.ts`

說明：

- 稽核是好的
- 但寫入失敗只 `console.warn`
- 對 auth / billing / admin / webhook 類高風險事件來說，可觀測性還不夠

### 3. CSRF 主要靠 same-origin / origin 驗證

檔案：

- `src/lib/security.ts`
- `src/proxy.ts`

說明：

- 對目前內部 app API 架構算合理
- 但不是 token-based CSRF

### 4. Admin 操作依賴 app auth + role，而非更細緻權限系統

檔案：

- `src/lib/admin-auth.ts`
- `src/lib/auth.ts`

說明：

- 目前 admin / operator 兩層夠 MVP
- 但正式 SaaS 若要多客服 / 財務 / 夥伴角色，還不夠

## 低風險

### OAuth 安全審查結果

檔案：

- `src/app/api/oauth/[provider]/authorize/route.ts`
- `src/app/api/oauth/[provider]/callback/route.ts`
- `src/app/api/meta/oauth/start/route.ts`
- `src/app/api/meta/oauth/callback/route.ts`

結果：

- 有 `state`
- 有 popup state 驗證
- callback failure 有 audit
- 沒看到把 token / secret 寫進前端

但：

- Meta flow 仍混合 generic 與 legacy callback

### Webhook 安全審查結果

檔案：

- `src/lib/webhook-security.ts`
- `src/app/api/webhooks/meta/route.ts`
- `src/app/api/webhooks/telegram/route.ts`
- `src/app/api/webhooks/whatsapp/route.ts`
- `src/app/api/automation-webhooks/[key]/route.ts`

結果：

- 有 signature / shared secret 驗證基礎
- 有 rate limit
- 有 duplicate event 部分處理

但：

- Meta / messaging 流程還需要更完整的 production idempotency audit

### Payment 安全審查結果

檔案：

- `src/lib/payuni.ts`
- `src/lib/billing/payuni-callback.ts`
- `src/app/api/billing/payuni/notify/route.ts`

結果：

- `HashInfo` 驗證有做
- paid callback 有 idempotent short-circuit

但：

- callback 失敗觀測與 audit 還可以更強

### Prisma 安全審查結果

檔案：

- `prisma/schema.prisma`
- `src/app/api/**`
- `src/lib/**`

結果：

- schema 有 workspace / user / payment / audit / affiliate 完整骨架
- route 層大多有 workspace filter

但：

- 不是所有邊界都能從 DB 層直接證明安全

### RLS 安全審查結果

檔案：

- `docs/project-launch-checklist.md`
- `docs/security/*`

結果：

- 文件宣稱 Supabase RLS 曾處理
- 但目前 runtime 主體仍是 Prisma server-side access
- 我這輪沒有直接遠端驗證 Supabase policy 現況，只能判定 **文件有提到，程式碼層無法單獨證明**

## 是否有敏感資訊外洩風險

### 前端 bundle

目前沒看到明確把以下內容放到前端：

- access token
- app secret
- PayUNI hash key / iv
- service role key

### 仍需注意

- provider error 字串可能過度原樣外露
- 亂碼文件降低人工審查 secret 洩漏的可讀性

## 是否有多租戶資料外洩風險

判定：**中風險**

原因：

- app 層多租戶隔離做得不差
- 但仍有 default workspace fallback 與 Meta env token fallback
- 對正式 SaaS 來說，這兩個不能長期並存

## 必須立刻修的安全項

1. production 禁止 Meta env token fallback
2. 修正 billing interval / 0 元 invoice subscription correctness
3. production 強制 `TOKEN_ENCRYPTION_KEY`
4. 增加 tenant isolation tests
5. 對 billing / webhook / admin failures 補更正式 audit / alert
