# InboxPilot Security Review

## 2026-06-24 - Release mode proxy guard

Scope:

- Added release-channel based filtering for the simple production surface.
- Added proxy checks that redirect full-only app pages away from simple production.
- Added proxy checks that block non-Instagram OAuth entry points on simple production with a 404 JSON response.

Security notes:

- The proxy guard reduces accidental exposure of unfinished product areas, but it is not an authorization boundary by itself.
- Existing route handlers must still enforce authentication, workspace / tenant isolation, rate limits, CSRF / Origin checks where applicable, and webhook / payment signature validation.
- No tokens, secrets, authorization codes, or API keys were added to code, logs, docs, or tests in this change.
- Shared production/staging DB remains a launch risk until split before real customer onboarding.

## 2026-06-13 Update - Staging environment isolation

- Staging is required before more Meta OAuth, PayUNI callback, webhook, and E2E validation.
- Current Vercel env inventory shows env variables are configured for Production, but no Preview / staging env was observed in the CLI listing.
- Staging must use separate Supabase DB resources and must not reuse production `DATABASE_URL`, `DIRECT_URL`, service role key, PayUNI Hash Key / IV, Meta App Secret, Google Client Secret, OpenAI key, or tokens.
- Staging PayUNI must point to sandbox and keep `PAYUNI_ALLOW_PRODUCTION=false`.
- Added `docs/staging-environment-runbook.md` with manual setup checklist and non-sensitive env examples.
- Updated Playwright config to support `PLAYWRIGHT_BASE_URL`, so E2E can target a remote staging URL without starting localhost.
- Security blocker before staging GO: create Preview / staging env in Vercel with dedicated staging credentials and verify `/api/health` against the staging URL.

## 2026-06-12 Update - Non-public schema cleanup preflight package

- Created `docs/non-public-schema-cleanup-preflight.md` as a read-only review package for future duplicate schema cleanup.
- No cleanup SQL was provided and no production DB change was made.
- The package requires proof that duplicate schemas are empty, isolated from `public`, and unused by Prisma runtime before cleanup can even be drafted.
- The backup gate remains mandatory: Supabase scheduled backups/PITR or encrypted restore-tested external `pg_dump`.
- This lowers process risk, but does not remove the operational risk from the current lack of managed backup/PITR.

## 2026-06-12 Update - Production backup / PITR readiness

- Read-only Supabase dashboard check confirmed production is still on a Free organization plan.
- Scheduled backups are not available on the current plan.
- PITR is not enabled and is presented as a Pro Plan add-on.
- This remains a high operational security risk because mistaken schema changes, destructive cleanup, or application/data corruption cannot be rolled back through Supabase-managed recovery.
- Before cleaning non-`public` duplicate schemas or running any non-additive migration, require Supabase backup/PITR or a restore-tested encrypted external `pg_dump`.
- No production DB change was made and no DATABASE_URL, DIRECT_URL, PayUNI secret, token, or full payload was output.

## 2026-06-12 Update - Production non-public schema inventory

- Read-only inventory confirmed two duplicate non-`public` schemas in production: `undefined` and `test_1779910095731_d847e1`.
- Both schemas have exact total rows `0`, so no tenant/user/payment data was found in those duplicate schemas during this check.
- Both schemas still contain FK and index structures, which can confuse migration verification if checks are not schema-qualified.
- FK references stay inside each duplicate schema; no observed FK reference from those schemas into `public`.
- Prisma runtime check found no `multiSchema`, `schemas = [...]`, or `@@schema`, so application runtime is expected to use `public`.
- No cleanup was performed because production Supabase still lacks recoverable backup/PITR.
- Security requirement remains: all future DB verification SQL must qualify `public` explicitly and must not rely on `conname` or `relname` alone.

## 2026-06-12 Update - AuditEvent FK additive migration applied

- `public."AuditEvent"` now has the expected Prisma foreign keys:
  - `AuditEvent_workspaceId_fkey`
  - `AuditEvent_userId_fkey`
- Preflight orphan check passed before applying the migration:
  - `audit_workspace_orphans = 0`
  - `audit_user_orphans = 0`
- Verification confirmed both FK constraints are on `schema_name = public`, `table_name = AuditEvent`, `contype = f`, with `ON DELETE SET NULL`.
- This reduces orphan audit reference risk and resolves the remaining `AuditEvent` referential integrity drift found in `docs/production-schema-drift-report.md`.
- No product feature code was changed and no DATABASE_URL, DIRECT_URL, PayUNI secret, token, or full payload was output.
- Remaining security/ops risk: production Supabase still has no recoverable PITR / backup, and non-public duplicate schemas should be inventoried later before cleanup.

## 2026-06-12 Update - Production schema drift read-only check

- 已完成 production Supabase `public` schema read-only drift 檢查，結果記錄於 `docs/production-schema-drift-report.md`。
- `public` schema table / column / primary key / unique / index 與 Prisma schema 一致。
- 安全與資料完整性風險：`public."AuditEvent"` 缺少 `workspaceId` 與 `userId` 兩個 foreign key；目前不影響 `/admin/audit` 讀取，但可能允許 orphan audit references。
- 驗證風險：production DB 存在非 `public` duplicate schema（`undefined`、`test_1779910095731_d847e1`），未來 migration verification 不可只用 constraint name，必須加上 schema-qualified checks。
- 本次未修改 production DB，未輸出 DATABASE_URL、DIRECT_URL、PayUNI secret 或完整 payload。

## 2026-06-12 Update - Production AuditEvent schema 安全修正

- 已補齊 production `AuditEvent` table、index、foreign key，讓安全稽核頁 `/admin/audit` 可正常讀取 audit log。
- 本次 SQL 未更新、刪除或插入既有資料，也未修改 PayUNI 交易邏輯。
- 本次操作未輸出 DATABASE_URL、DIRECT_URL、PayUNI Hash Key、Hash IV、EncryptInfo、HashInfo 或任何完整 payload。
- 剩餘安全風險：Supabase production 目前沒有可回復備份/PITR，後續任何 schema 或資料修正前應先補正式備份策略。
- `AuditEvent` 未啟用 RLS，這符合目前 Prisma server-side 存取模式；但若未來開放 Supabase client 直連 audit table，必須補 RLS policy 或明確封鎖 client-side 存取。

更新日期：2026-06-10

## 結論

- 高風險：`仍有，但已比前一輪少`
- 中風險：`有`
- 低風險：`有`
- 敏感資訊外洩風險：`目前沒看到明顯前端外洩，但仍需持續防守`
- 多租戶資料外洩風險：`已補強，但不能宣稱完全零風險`

本輪已完成的重要修正：

1. production 模式不再允許 Meta env token fallback
2. Meta webhook / comment sync / send message 都遵守同一套 tenant 邊界
3. Meta OAuth 新主流程改為 generic callback，且保持 callback failure audit
4. Connected account 已可安全解除綁定，不需要直接刪 channel

## 高風險

### 1. 多租戶隔離仍主要依賴應用層 where 條件

檔案位置：

- `src/lib/workspaces.ts`
- `src/app/api/**`
- `prisma/schema.prisma`

說明：

- 目前 Prisma 查詢大致有 `workspaceId` 限制
- 但還不是每個資料讀寫都透過統一的 tenant-safe repository layer

建議：

- 持續補 route-level regression tests
- 對高風險資料模型建立更一致的 workspace scoping helper

### 2. Meta legacy callback 仍存在，正式環境需維持雙路徑觀察

檔案位置：

- `src/app/api/meta/oauth/callback/route.ts`
- `src/app/api/instagram/oauth/callback/route.ts`
- `src/app/api/oauth/[provider]/callback/route.ts`

說明：

- 這不是立即漏洞，但它會增加 production 設定與 reviewer 說明複雜度
- 若 Meta 後台 redirect URI 沒同步，可能造成使用者走到舊流程或誤判為 callback 失敗

建議：

- 先補齊 Meta 後台設定
- 觀察 generic callback 穩定度後，再規劃 legacy callback 退場

## 中風險

### 1. `TOKEN_ENCRYPTION_KEY` 在 production 仍應強制獨立設定

檔案位置：

- `src/lib/secrets.ts`

說明：

- 若未設定，系統可能退回使用 `AUTH_SECRET`

建議：

- production 強制要求 `TOKEN_ENCRYPTION_KEY`

### 2. Audit log 仍是 best-effort

檔案位置：

- `src/lib/audit.ts`

說明：

- 目前 audit 失敗不會中止主流程
- 這是合理取捨，但正式營運應補 alert / metrics

### 3. Connected account disconnect 不會自動刪除 channel

檔案位置：

- `src/app/api/oauth/accounts/[id]/route.ts`

說明：

- 這是刻意設計，避免誤刪歷史 channel 與訊息資料
- 但營運上要讓使用者知道：解除綁定後還需要到 Channels 檢查舊綁定

## 低風險

### OAuth

- 有 `state` 驗證
- callback failure 會寫 audit
- callback audit 不寫 token、secret、authorization code

### Webhook

- 有 signature 驗證
- 有 rate limit
- production 不再把 `META_*` env 值灌回 channel config

### Payment

- PayUNI notify 有簽章驗證與 idempotency
- zero-amount internal completion 已改走正式 completion flow

### Admin / Prisma / RLS

- admin / operator 邊界有基本保護
- Prisma 為主，沒有看到明顯 raw SQL 注入點
- Supabase RLS 不是這個專案的主要 enforcement layer，安全邊界仍以 server-side Prisma 為主

## OAuth / Webhook / Payment / Admin / Prisma / RLS 審查結果

### OAuth

- 新的 Meta authorize URL 已改為 generic callback
- legacy callback 暫時保留，避免一次切太兇
- 最小 reconnect / disconnect UX 已補

### Webhook

- Meta webhook 可以根據 channel config 尋找正確 workspace / channel
- production fallback 已移除，tenant isolation 比之前安全

### Payment

- Billing interval / zero-amount subscription correctness 已修正
- 正式收款 readiness 仍取決於 PayUNI production go-live

### Admin

- `/admin/audit` 已存在
- 稽核事件涵蓋 OAuth / webhook / billing / 基本管理流程，但 alerting 還不夠

### Prisma

- 多數查詢有 workspace scoping
- 仍建議持續補整合測試，不靠人工相信自己

### RLS

- 沒有把 Supabase RLS 當主要授權層
- 這代表 server code 必須持續維持 tenant discipline

## 是否有敏感資訊外洩風險

目前沒有看到明顯把下列敏感資訊直接送進前端 bundle：

- access token
- Meta app secret
- PayUNI hash key / iv
- service role key

但仍需持續防守：

- console / audit / docs 不要寫完整 payload
- `.env*` 不得誤提交
- 新增 OAuth / payment / webhook 功能時，先檢查 log 與 error message

## 是否有多租戶資料外洩風險

有降低，但不能說完全沒有。

本輪改善：

- production Meta env fallback 已移除
- webhook / comment sync / send message 已補 tenant isolation regression tests

仍需持續觀察：

- billing、admin、reporting、search 類 API 是否都有完整 workspace 限制

## 必須立刻修的安全項

1. production 強制要求 `TOKEN_ENCRYPTION_KEY`
2. 繼續補 billing / admin / reporting 的 tenant isolation tests
3. 完成 Meta 後台 generic callback URI 設定與 reviewer 流程收斂
# Security Review Update - PayUNI Audit Coverage

更新日期：2026-06-10

## 本輪 PayUNI 安全補強

- PayUNI 付款失敗會寫入 `billing_payuni_payment_failed` audit event。
- PayUNI return callback 例外會寫入 `billing_payuni_return_failed` audit event。
- PayUNI notify callback 例外會寫入 `billing_payuni_notify_failed` audit event。
- Audit metadata 僅記錄非敏感摘要，不記錄 PayUNI secret、Hash Key、Hash IV、EncryptInfo、HashInfo、完整 return payload 或完整 notify payload。
- `/admin/audit` 顯示 metadata 前會遮罩敏感 key，降低既有或未來 audit metadata 誤含敏感欄位時的前端外洩風險。
- `npm run payuni:preflight` 只輸出非敏感 Go/No-Go 摘要，不列印 Merchant ID、Hash Key、Hash IV、EncryptInfo、HashInfo 或付款 payload。

## 2026-06-10 Update - Admin Billing Reconciliation

- `/admin/billing-reconciliation` 為 admin-only、read-only 對帳入口，查詢條件限 MerTradeNo / TradeNo，資料仍依目前 workspace 查詢。
- 頁面刻意只顯示非敏感營運欄位；不得在 audit、文件、客服紀錄或 issue 貼上 PayUNI secret、Hash Key、Hash IV、EncryptInfo、HashInfo 或完整 payload。
- 剩餘風險：仍需 production 環境實測確認真實 return / notify 與 PayUNI 後台紀錄一致。

## 2026-06-13 Update - Production non-public schema cleanup

- Removed production non-public duplicate schemas `undefined` and `test_1779910095731_d847e1` after user-confirmed rollback path and final preflight.
- Cleanup used guarded SQL that stopped if:
  - `public` schema was missing.
  - any FK crossed between `public` and the duplicate schemas.
  - any table in the duplicate schemas contained rows.
- Post-cleanup verification confirmed:
  - both duplicate schemas no longer exist,
  - no FK remains involving either duplicate schema.
- Security impact:
  - reduces schema drift and accidental cross-schema confusion risk,
  - does not change application auth, tenant isolation, OAuth, webhook, billing, or PayUNI transaction logic.
- Remaining security risks:
  - continue requiring Supabase backup/PITR or restore-tested encrypted dump before future destructive DB operations,
  - add automated monitoring for Prisma missing-table/schema errors,
  - continue broader tenant isolation and PayUNI production verification work.

## 2026-06-13 Update - Post-cleanup schema drift security recheck

- Read-only recheck confirmed production duplicate schemas `undefined` and `test_1779910095731_d847e1` no longer exist.
- `public` schema table and column surface matches Prisma with 0 missing and 0 extra tables/columns.
- `public."AuditEvent"` retains both expected FK constraints:
  - `AuditEvent_workspaceId_fkey`
  - `AuditEvent_userId_fkey`
- Billing-critical schema surface is present:
  - `PaymentOrder.interval` exists as non-null `BillingInterval`.
  - `Subscription.interval` exists as non-null `BillingInterval`.
  - billing core tables are present.
- No current metadata-level schema drift was found that would block billing, subscription, PayUNI notify schema access, or admin audit rendering.
- Remaining security/ops risk is not schema drift in this check; it is operational readiness:
  - PayUNI real production transaction verification is still pending.
  - Redis/worker and monitoring readiness still need completion.
  - future destructive DB work still requires backup/PITR or restore-tested encrypted dump.
