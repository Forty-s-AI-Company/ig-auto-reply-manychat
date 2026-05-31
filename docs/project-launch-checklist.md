# Project Launch Checklist

本文件記錄 InboxPilot 上線前不可違反的專案設定與審查 checklist。完成的項目以 `[x]` 標示；需要實作或外部審核的項目保留 `[ ]`。

## 固定專案設定

- [x] 需要操作 Chrome / Facebook / Meta / Vercel / Supabase 後台時，必須先使用 `@chrome` 並在操作前確認。
- [x] Facebook Business 帳號名必須是 `林元`。
- [x] Vercel 專案名必須是 `inboxpilot`。
- [x] PayUNI 目前必須使用測試站；正式站仍在審核中，不得切到正式金流。
- [x] Supabase 專案名必須是 `IG Auto Reply ManyChat`。

## 上線阻斷項目

- [x] 移除 seed、admin helper、登入頁中的預設 admin 帳密。
- [x] Meta webhook 找不到已綁定 channel 時，不得 fallback 到 default workspace。
- [x] Worker / cron 必須能處理 broadcast、automation wait、sequence、reminder job。
- [x] Job 處理需加入 atomic claim、lock timeout、idempotency，避免重複發送。
- [x] 所有高風險 POST/PATCH/DELETE API 需加入 CSRF 或 Origin 驗證。
- [x] 登入、付款、AI 測試、群發、Webhook 需加入 rate limit。
- [x] PayUNI checkout / notify / return 需保留測試站設定，並加上付款 idempotency 與重送保護。

## Security Checklist

- [x] `.env`、`.env.local` 不得 commit。
- [x] `.env.example` 只能放 placeholder。
- [x] `NEXT_PUBLIC_*` 不得包含 service role、API key、access token、secret。
- [x] `SUPABASE_SERVICE_ROLE_KEY` 只能 server-side 使用。
- [x] OpenAI key、Meta token、PayUNI Hash Key / IV 不得出現在前端 bundle。
- [x] Login API 需有暴力破解防護。
- [x] OAuth callback URL 必須使用可信任的 `APP_URL`，不得直接信任 request Host header。

## Database Checklist

- [x] Supabase RLS policy 已套用並測試。2026-05-31 已確認前次 SQL Editor 只貼到前 100 行；完整貼入並執行 `docs/security/supabase-rls-fix.sql` 後，public schema `rowsecurity = false` audit 為 0 rows，direct `pg_policy` audit 為 0 rows，且 Supabase Security Advisor 顯示 `Errors = 0`、`Warnings = 0`。
- [x] 多租戶核心資料表的 `workspaceId` 不得 nullable。
- [x] Message / Conversation / Broadcast / AutomationRun 已補高頻查詢 index。
- [x] 群發 queue 有唯一鍵或 transaction 去重。
- [x] 已跑 migration dry-run 與 rollback plan。已建立 runbook；2026-05-31 已將舊 SQLite migration 修正為 PostgreSQL 相容，並在 Supabase temporary schema 跑 `prisma migrate deploy` dry-run，6 個 migrations 全部成功套用後已刪除 temporary schema。Production `public` schema 若要納入 Prisma migration history，仍需按 runbook 做 baseline，不可直接對既有非空 schema 跑 deploy。

## UX / Product Checklist

- [x] 移除正式產品頁面中的 `[開發中]` 或 scaffold 文案。
- [x] Dashboard、Campaign / Broadcast、Analytics、Settings、Mobile 已完成逐頁 UX 原始碼審查並直接修改。2026-05-31 修正付款頁視覺一致性、Messenger 連線頁中文化、Webhook 測試工具標題、設定頁佔位文案與 E2E 穩定性。
- [x] 付款、Instagram 連線、Webhook 設定、錯誤狀態有清楚可恢復的 UI。付款頁已標示 PayUNI 測試站，Meta / Instagram callback 錯誤與付款成功/失敗狀態已保留可關閉提示。
- [x] Mobile layout 已通過主流程測試。2026-05-31 `ADMIN_PASSWORD` 補齊後，已新增 authenticated mobile E2E smoke；Dashboard / Broadcast / Analytics / Settings / Billing 與 mobile admin menu 皆通過，完整 `npm run test:e2e` 為 10/10 passed。

## Operations Checklist

- [x] Vercel project 確認為 `inboxpilot`。
- [x] Supabase project 確認為 `IG Auto Reply ManyChat`。
- [x] Facebook Business 已登入並確認可見帳號為 `林元 林（你）`。
- [x] PayUNI gateway 確認仍為測試站。
- [x] `npm run lint` 通過。
- [x] `npm run build` 通過。
- [x] Unit / integration / E2E tests 通過。2026-05-31 `npm test` DB-backed tests 通過；`npm run test:coverage` 通過，覆蓋率 statements 93.93%、branches 85.71%；新增 authenticated smoke 後，完整 `npm run test:e2e` 10/10 通過。
- [x] Coverage 達 80% 以上。
- [x] 1000 user load test 已執行並產出瓶頸、快取、rate limit 方案。本次為 local dev smoke；正式上線前仍需 staging/production-like URL 重跑。
- [x] Git diff 已 review，release branch/tag 已建立。2026-05-31 已跑 `git diff --check` 通過、diff stat / name-status 已檢視、staged secret pattern scan 無真實 key 命中；release branch `release/2026-05-31-launch-hardening` 已建立，release tag 指向本 checklist 所在的 release commit。
