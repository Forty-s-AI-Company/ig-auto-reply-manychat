# InboxPilot Security Review

更新日期：2026-06-10

## 結論

- 敏感資訊外洩風險：**中**
- 多租戶資料外洩風險：**中**
- 必須立刻修的安全項：**Meta token fallback、production tenant fallback、計費與訂閱週期漏洞**

## 高風險

### 1. Meta channel token / account fallback 對多租戶有風險

檔案：

- `src/lib/channels/meta.ts`
- `src/app/api/webhooks/meta/route.ts`
- `src/lib/instagram/comments-sync.ts`

說明：

- channel 若未完整綁定 token，程式會 fallback 到全域 env：
  - `META_PAGE_ACCESS_TOKEN`
  - `META_INSTAGRAM_BUSINESS_ACCOUNT_ID`
  - `META_PAGE_ID`
- 這在 demo / 單租戶很方便，但在正式 SaaS 容易讓錯的 workspace 吃到共享 token

建議：

- production 下禁用這些 fallback
- webhook / outbound / comment sync 都要要求 channel-level binding

### 2. 多租戶隔離主要靠應用層，不是全面 DB policy first

檔案：

- `src/lib/workspaces.ts`
- `src/app/api/**`
- `prisma/schema.prisma`

說明：

- 大多數 API 有 `workspaceId` 過濾
- 但沒有證據顯示所有 Prisma server-side 存取都被 DB policy 強制保護
- 一旦後續加 route 遺漏 `workspaceId`，就有橫向資料外洩風險

建議：

- 補 tenant isolation tests
- 對高風險表導入更嚴格的 query helper 或 policy 檢查

### 3. 計費漏洞會影響授權與產品邊界

檔案：

- `src/lib/billing/payment-service.ts`
- `src/app/api/billing/payuni/checkout/route.ts`

說明：

- 年繳被寫成月繳
- 零元折抵成功未必真正啟動 subscription
- 這不只是產品問題，也會造成權限與服務授權錯配

建議：

- 修正 interval persistence
- 零元交易也走正式 completion flow

## 中風險

### 1. Secret encryption fallback 仍可退回 `AUTH_SECRET`

檔案：

- `src/lib/secrets.ts`

說明：

- 若沒設 `TOKEN_ENCRYPTION_KEY`，會退回 `AUTH_SECRET`
- 再沒有才用 local dev constant

建議：

- production 強制要求 `TOKEN_ENCRYPTION_KEY`

### 2. Audit log 為 best-effort，失敗只 `console.warn`

檔案：

- `src/lib/audit.ts`

說明：

- 安全事件有記錄，但資料庫寫入失敗時只警告，不會阻止流程

建議：

- 至少把 auth / billing / admin / webhook failure 類事件升級成可觀測告警

### 3. CSRF 主要靠 same-origin，不是 token-based CSRF

檔案：

- `src/lib/security.ts`
- `src/proxy.ts`

說明：

- 對內部 app API 來說算合理
- 但若後續有跨子網域、嵌入式 flow、第三方 form return，邊界要更小心

### 4. PayUNI callback 失敗只做簡單 console error

檔案：

- `src/app/api/billing/payuni/notify/route.ts`

說明：

- 驗證本身靠 `parsePayuniResult()` 做 Hash 驗證，這部分是好的
- 但 callback 失敗觀測性不足

建議：

- 補 audit / alert / structured log

## 低風險

- `AUTH_SECRET` 在 production 有強度檢查：`src/lib/auth.ts`
- session cookie 有 `httpOnly` / `sameSite=lax` / production `secure`
- webhook HMAC / shared secret 基礎已存在：
  - `src/lib/webhook-security.ts`
  - `src/app/api/webhooks/meta/route.ts`
  - `src/app/api/webhooks/telegram/route.ts`
  - `src/app/api/automation-webhooks/[key]/route.ts`
- rate limit 基礎存在，且可用 Redis 或 in-memory

## 敏感資訊外洩風險

### 目前沒看到明顯前端 bundle 洩漏

已檢查：

- `.env.example`
- `docs/environment-variables.md`
- `src/lib/**`
- `src/app/api/**`

目前沒有看到：

- access token / app secret / PayUNI key 被放進 `NEXT_PUBLIC_*`
- OAuth callback 把 token 直接送到前端

### 但仍有注意點

- callback / webhook / billing 失敗訊息仍可能回傳過多 provider error wording
- README / docs 有亂碼，人工檢查 secret 洩漏時可讀性偏差

## 多租戶資料外洩風險

目前判定：**中風險**

原因不是已經看到明確外洩，而是：

- 有 default workspace fallback
- 有全域 Meta token fallback
- 多租戶邊界主要靠 route 層而非一致性的 DB policy enforcement

## 必須立刻修的安全項

1. production 禁止 Meta env token fallback 服務多租戶 channel
2. production 禁止 default workspace fallback 參與 webhook / billing / message ingestion
3. 強制設定獨立 `TOKEN_ENCRYPTION_KEY`
4. 修正 billing interval / zero-amount subscription 漏洞
5. 補 tenant isolation 測試，尤其是 webhook / jobs / oauth sync
