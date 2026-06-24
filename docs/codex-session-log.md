# Codex Session Log

## 2026-06-24 - Staging DB split plan and health check

Task goal:

- Plan a production-ready staging DB split.
- Define Vercel Preview env values.
- Update docs and checklist.
- Do not touch production data.
- Add a staging health check.

Files changed:

- `.env.example`
- `src/lib/health.ts`
- `src/app/api/health/staging/route.ts`
- `tests/health.test.ts`
- `docs/staging-db-runbook.md`
- `docs/environment-variables.md`
- `docs/deployment.md`
- `docs/project-launch-checklist.md`
- `docs/product-readiness-review.md`
- `docs/security-review.md`
- `docs/fix-roadmap.md`
- `docs/codex-session-log.md`

Implementation notes:

- Added `INBOXPILOT_DEPLOYMENT_ENV`, `INBOXPILOT_DB_ENV`, and `STAGING_SUPABASE_PROJECT_REF` placeholders.
- Added `/api/health/staging`, which validates release channel, staging DB env, DB URL presence, and Supabase project ref matching.
- The staging health check only uses DB connectivity ping plus env guard checks. It does not query application tables or expose DB connection strings.
- Added a staging DB runbook for separate Supabase project setup, Vercel Preview env, migration flow, and post-deploy verification.

Validation:

```text
npx vitest run tests/health.test.ts
Result: passed. 1 test file passed, 5 tests passed.

npm run lint
Result: passed.

npm run build
Result: passed. Prisma generated-client fallback reused the existing client because the Windows query engine DLL was locked by a local Node process.

npm test
Result: failed because the configured Supabase pooler host was temporarily unreachable while DB-backed tests and final test-schema cleanup were running.
Error class: PrismaClientInitializationError.
Observed host: aws-1-ap-southeast-1.pooler.supabase.com:5432.
```

Launch impact:

- Production customer onboarding remains Hold until the Supabase staging project and Preview env are actually configured and `/api/health/staging` passes.
- No production data, schema, env, or deployment value was modified by this local change.

New risks:

- No new secret exposure.
- Staging health will fail until Preview has staging-only DB env values.

Next suggested Codex Prompt:

```text
請幫我在 Supabase 建好 staging project 後，把 staging 專案輸出的 env 值逐一加到 Vercel Preview，然後觸發 staging branch deployment 並驗證 `/api/health/staging`。
限制：不要輸出 secret 值，不要碰 production DB。
```

## 2026-06-24 - Staging Preview DB env and health verification

Task goal:

- Add available staging Preview environment markers to Vercel without exposing secrets.
- Trigger a staging branch Preview deployment.
- Verify `staging.carry-digital-nomad.in.net/api/health/staging`.
- Do not touch production DB.

Files changed:

- `docs/codex-session-log.md`
- `docs/fix-roadmap.md`

Implementation notes:

- Added non-secret Preview env keys in Vercel: `APP_URL`, `APP_DOMAIN`, `INBOXPILOT_DEPLOYMENT_ENV`, `INBOXPILOT_DB_ENV`.
- Confirmed Preview already has `INBOXPILOT_RELEASE_CHANNEL`.
- Did not add Supabase DB URLs, Supabase service role, anon key, or auth secrets because no staging Supabase output values were available in this workspace.
- Pushed staging commit `95c55b3` and triggered a Preview deployment.

Validation:

```text
gh run list --branch staging --limit 10
Result: CI success, Update Staging Alias success.

npx vercel inspect https://staging.carry-digital-nomad.in.net --scope a25814740s-projects
Result: staging alias points to Ready Preview deployment inboxpilot-90d03j3b3-a25814740s-projects.vercel.app.

curl.exe -i https://staging.carry-digital-nomad.in.net/api/health/staging
Result: HTTP 503 by design because staging DB secret env is still missing.
Reasons reported: database_url_missing, direct_url_missing, staging_supabase_project_ref_missing.
```

Launch impact:

- Staging deployment and alias automation are working.
- Production DB was not touched or reused.
- Staging DB split is not complete until real staging Supabase env values are added to Vercel Preview and `/api/health/staging` returns healthy.

New risks:

- No new production risk from this task.
- Current staging Preview intentionally fails the staging health check until `DATABASE_URL`, `DIRECT_URL`, and `STAGING_SUPABASE_PROJECT_REF` point to the independent staging Supabase project.

Next suggested Codex Prompt:

```text
我已經在 Supabase 建好 staging project，請用不輸出 secret 的方式把以下 staging env 加到 Vercel Preview：
- DATABASE_URL
- DIRECT_URL
- STAGING_SUPABASE_PROJECT_REF
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY
- AUTH_SECRET
- TOKEN_ENCRYPTION_KEY

加完後請 redeploy staging branch，並驗證 /api/health/staging 變成 healthy。
限制：不要碰 production DB，不要輸出 secret 值。
```

## 2026-06-24 - Release mode commit preparation

Task goal:

- Prepare the local release mode implementation as a committable change.
- Confirm `master` is the simple release path and `staging` is the full release path.
- Add smoke tests before pushing to both branches.

Files changed:

- `src/lib/release-mode.ts`
- `src/proxy.ts`
- `src/components/AdminShell.tsx`
- `src/components/AdminMobileNav.tsx`
- `src/app/dashboard/page.tsx`
- `src/app/channels/page.tsx`
- `src/app/channels/connect/page.tsx`
- `src/app/channels/connect/social/page.tsx`
- `src/app/referrals/page.tsx`
- `tests/release-mode.test.ts`
- `tests/release-proxy.test.ts`
- `docs/master-staging-prelaunch-checklist.md`
- `docs/project-launch-checklist.md`
- `docs/product-readiness-review.md`
- `docs/security-review.md`
- `docs/fix-roadmap.md`
- `docs/codex-session-log.md`

Implementation notes:

- Added a centralized release channel helper with host defaults and `INBOXPILOT_RELEASE_CHANNEL` override support.
- Simple release hides full-only navigation, non-Instagram channel connection options, and payout-oriented referral copy.
- Simple release proxy redirects full-only app pages and blocks non-Instagram OAuth entry points.
- Added smoke tests covering host/env release detection, full-only route classification, simple production redirects, staging full behavior, and Instagram-only OAuth allowance.

Validation:

```text
npx vitest run tests/release-mode.test.ts tests/release-proxy.test.ts
Result: passed. 2 test files passed, 9 tests passed.

npm run lint
Result: passed.

npm run build
Result: passed. Prisma generated-client fallback reused the existing client because the Windows query engine DLL was locked by a local Node process.

npm test
Result: passed.

npm run test:e2e
Result: passed. 10 tests passed.
```

Launch impact:

- Moves the simple/full release split from local implementation toward branch-ready deployment.
- Does not change database topology.

New risks:

- No new secret exposure.
- Proxy hiding is not a substitute for route-level authorization and tenant isolation.
- Shared DB remains accepted only while the product has no real customer traffic.

Next suggested Codex Prompt:

```text
請幫我在 Vercel 部署完成後，檢查 master production domain 與 staging alias 的 release mode 實際行為：
1. production full-only route 應導回 dashboard
2. staging full-only route 應可進入登入/頁面流程
3. production 非 IG OAuth entry 應回 404
4. staging alias 是否指向最新 staging Preview deployment
```

## 2026-06-13 - Staging preflight checklist

- Read `AGENTS.md`, `docs/staging-environment-runbook.md`, `docs/environment-variables.md`, `docs/security-review.md`, and `docs/fix-roadmap.md`.
- Performed read-only Vercel and workspace checks:
  - `.vercel/project.json` points to project `inboxpilot`.
  - `npx vercel env ls` listed Production env keys only; no Preview / staging env was observed.
  - `git status --short --branch` shows detached `HEAD`, so staging should be created from a real branch before deployment.
  - `vercel.json` has no staging-specific project split and can support Preview deployments.
- Created and switched to local branch `staging` with `git switch -c staging`.
- No push was performed, so no Vercel deployment was triggered.
- Push precheck:
  - local branch `staging` exists and is active.
  - branch commit is still `f1fa088`, the same base as `master`.
  - all recent changes are still uncommitted; pushing now would not send them to GitHub or Vercel.
  - Vercel Preview / staging env has not been configured yet.
- Change classification:
  - staging-required: staging runbook, env docs, security/fix/session docs, `playwright.config.ts`.
  - accumulated product work: PayUNI, Meta/OAuth, billing, admin audit/reconciliation, plan gating, legal/public copy, DB migration runbooks, and related tests.
- Recommendation: do not push yet as-is. Commit intentionally and configure Preview env + Supabase staging first.
- Recommendation: use existing `inboxpilot` Vercel project with a fixed `staging` branch, Preview env, and fixed staging domain. Use separate `inboxpilot-staging` project only if stronger operational isolation is required.
- Updated `docs/staging-environment-runbook.md` with staging env key checklist, Supabase staging keys, Meta / Google URL checklist, PayUNI sandbox checks, and manual setup order.
- Updated `docs/fix-roadmap.md`.
- No production env was changed, no deployment was triggered, and no database, PayUNI, Meta, Google, OpenAI, token, or payload secret was output.


## 2026-06-13 - Staging environment planning

- Read `AGENTS.md`, `README.md`, `docs/environment-variables.md`, `docs/product-readiness-review.md`, `docs/security-review.md`, `docs/fix-roadmap.md`, `docs/billing-affiliate-readiness.md`, and `docs/meta-app-review-checklist.md`.
- Used Vercel CLI guidance for non-sensitive project/env inspection.
- Checked local Vercel link: project name `inboxpilot`; no secret values were viewed or output.
- Ran `npx vercel env ls` and confirmed env variables are listed for Production; no Preview / staging env was observed in the listing.
- Reviewed `.env.example`, `vercel.json`, `prisma/seed.ts`, `scripts/run-tests.mjs`, and `playwright.config.ts`.
- Created `docs/staging-environment-runbook.md` with staging architecture, Vercel/Supabase/PayUNI/Meta/Google checklists, health checks, seed strategy, and E2E commands.
- Updated `docs/environment-variables.md`, `docs/security-review.md`, and `docs/fix-roadmap.md`.
- Updated `playwright.config.ts` so `PLAYWRIGHT_BASE_URL` can target a remote staging site without starting local dev server.
- No production env was changed and no PayUNI, Meta, Google, Supabase, OpenAI, database, token, or payload secret was output.

Verification:

- `npm run lint`: passed.
- `npm run build`: passed.
- `npm test`: blocked locally because neither `DATABASE_URL` nor `TEST_DATABASE_URL` is configured.

## 2026-06-13 - PayUNI production gate before invoice creation

- Read `AGENTS.md`, `docs/billing-affiliate-readiness.md`, `docs/fix-roadmap.md`, and `src/app/api/billing/payuni/checkout/route.ts`.
- Risk noted before editing:
  - moving the gate too broadly could affect zero-amount credit checkout or idempotency replay.
  - this task intentionally keeps return / notify / HashInfo / completion logic unchanged.
- Updated `src/app/api/billing/payuni/checkout/route.ts` so production gateway + `PAYUNI_ALLOW_PRODUCTION` is checked before workspace lookup, idempotency lookup, invoice creation, payment order creation, and PayUNI form generation.
- Added regression test in `tests/billing-checkout-route.test.ts` confirming production gate=false returns 503 without creating invoice, creating payment order, or rendering PayUNI checkout.
- Targeted verification:
  - `npx vitest run tests/billing-checkout-route.test.ts`: passed.
- Full verification:
  - `npm run lint`: passed.
  - `npm run build`: passed.
  - `npm test`: blocked locally because neither `DATABASE_URL` nor `TEST_DATABASE_URL` is configured.
- No production env was changed and no PayUNI secret or full payload was output.

## 2026-06-13 - PayUNI production auto-charge resume readiness review

- Read `AGENTS.md`, `docs/fix-roadmap.md`, `docs/product-readiness-review.md`, `docs/security-review.md`, and `docs/billing-affiliate-readiness.md`.
- Reviewed PayUNI checkout, preflight, billing page, and PayUNI helper code.
- Production `/billing` check:
  - opens without observed server error,
  - shows PayUNI production gateway,
  - shows gateway host `api.payuni.com.tw`,
  - shows `PAYUNI_ALLOW_PRODUCTION=false`,
  - shows Merchant ID, Hash Key / IV, Return URL, and Notify URL present without exposing values.
- Did not click payment because checkout currently creates invoice before production gate check; clicking would write production billing rows.
- Local preflight:
  - `npm run payuni:preflight` returned `NO-GO`,
  - local env resolved to sandbox and missing PayUNI credentials,
  - no PayUNI secrets or payloads were printed.
- Production checks:
  - `/api/health`: HTTP 200, `database.ok=true`, overall `degraded`.
  - `/admin/billing-reconciliation`: opened without observed server error and showed non-sensitive reconciliation data.
- Verification:
  - `npm run lint`: passed.
  - `npm run build`: passed.
  - `npm test`: blocked locally because neither `DATABASE_URL` nor `TEST_DATABASE_URL` is configured.
- No production env was changed and no PayUNI core transaction logic was changed.

## 2026-06-12 - Non-public schema cleanup preflight package

- Created `docs/non-public-schema-cleanup-preflight.md`.
- Prepared read-only preflight SQL for future duplicate schema cleanup review:
  - exact row count checks for `undefined` and `test_1779910095731_d847e1`
  - FK checks confirming `public` does not point into duplicate schemas
  - FK checks confirming duplicate schemas do not point into `public`
  - FK summary by schema pair
- Added Prisma runtime public-only code search checks.
- Added backup gate checklist requiring Supabase scheduled backups/PITR or encrypted restore-tested `pg_dump`.
- Added human review checklist and stop conditions.
- No production DB changes were made, no cleanup SQL was provided, and no DATABASE_URL, DIRECT_URL, PayUNI secret, token, credential, or full payload was output.

## 2026-06-12 - Production Supabase backup / PITR readiness diagnosis

- Read-only dashboard diagnosis completed for Supabase production project `IG Auto Reply ManyChat`.
- Organization plan is currently `Free`.
- Scheduled backups page states Free Plan does not include project backups and requires Pro Plan for scheduled backups.
- Point in Time Recovery page states PITR is a Pro Plan add-on; PITR is not enabled.
- No production DB changes were made. No SQL write operation was executed.
- Updated `docs/database-migration-runbook.md` with a minimum external `pg_dump` SOP and restore-test checklist.
- Updated `docs/fix-roadmap.md` and `docs/security-review.md` to keep backup/PITR as a launch and cleanup blocker.
- No DATABASE_URL, DIRECT_URL, PayUNI secret, token, credential, or full payload was output.

## 2026-06-12 - Production non-public schema inventory

- Read-only inventory completed for production Supabase project `IG Auto Reply ManyChat`.
- Checked non-`public` schemas: `undefined` and `test_1779910095731_d847e1`.
- No production DB modifications were made; only metadata and non-sensitive row counts were queried.
- `test_1779910095731_d847e1`: 42 tables, exact total rows `0`, 71 outgoing FKs, 71 incoming FKs, 135 indexes.
- `undefined`: 45 tables, exact total rows `0`, 76 outgoing FKs, 76 incoming FKs, 155 indexes.
- FK references stay inside each duplicate schema; no cross-reference to `public` was observed.
- Prisma runtime check found no `multiSchema`, `schemas = [...]`, or `@@schema`; application runtime is expected to use `public`.
- Created `docs/production-non-public-schema-inventory.md`.
- No DATABASE_URL, DIRECT_URL, PayUNI secret, token, credential, or full payload was output.

## 2026-06-12 - AuditEvent FK additive migration applied

- Production Supabase project confirmed: `IG Auto Reply ManyChat`.
- Preflight SQL passed:
  - `audit_workspace_orphans = 0`
  - `audit_user_orphans = 0`
- Applied guarded additive-only FK SQL to `public."AuditEvent"`:
  - `AuditEvent_workspaceId_fkey`
  - `AuditEvent_userId_fkey`
- Verification SQL confirmed 2 public FK rows:
  - `schema_name = public`
  - `table_name = AuditEvent`
  - `contype = f`
  - both constraints use `ON UPDATE CASCADE ON DELETE SET NULL`
- Production `/api/health` returned HTTP 200 with `database.ok=true`; status remains `degraded` because Redis is not configured.
- Production `/admin/audit` opened normally and no server error was observed.
- No product feature code was changed. No DATABASE_URL, DIRECT_URL, PayUNI secret, token, or full payload was output.

## 2026-06-12 - AuditEvent FK additive migration 前置準備

- 新增 `docs/auditevent-fk-additive-migration-prep.md`。
- 整理 `public."AuditEvent"` 缺少的 `workspaceId`、`userId` foreign key 修正 SQL。
- SQL 僅包含 schema-qualified、guarded、additive-only 的 `ALTER TABLE public."AuditEvent" ADD CONSTRAINT`。
- 補 read-only preflight SQL，用來檢查既有 audit rows 是否有 workspace / user orphan references。
- 補 read-only verification SQL，明確限制 `n.nspname = 'public'` 與 `t.relname = 'AuditEvent'`，避免被非 `public` duplicate schema 誤導。
- 本次未執行 SQL、未修改 production DB、未修改產品功能程式碼，未輸出任何 DATABASE_URL、DIRECT_URL、PayUNI secret 或完整 payload。

## 2026-06-12 - Production schema drift read-only 檢查

- 新增 `docs/production-schema-drift-report.md`，記錄 `prisma/schema.prisma` 與 production Supabase `public` schema 的 read-only drift 檢查結果。
- 檢查確認：`public` schema table / column / primary key / unique / index 無 drift；`public."AuditEvent"` 缺少 `workspaceId` 與 `userId` 兩個 FK。
- 發現 production DB 另有非 `public` duplicate schema：`undefined` 與 `test_1779910095731_d847e1`，可能造成只用 constraint name 的驗證 SQL 誤判。
- `/api/health` 回 HTTP 200 且 `database.ok=true`；整體仍為 `degraded`，原因是 Redis 未設定。
- `/admin/audit` 可正常開啟，未觀察到 server error。
- 本次只執行 read-only SQL，未修改 production DB，未修改產品功能程式碼，未輸出任何 DATABASE_URL、DIRECT_URL、PayUNI secret 或完整 payload。

## 2026-06-12 - Production DB migration runbook 收尾

- 更新 `docs/database-migration-runbook.md`，補齊 production migration 前置 checklist、read-only 驗證 SQL 原則、`/api/health` 與 `/admin/audit` 檢查流程。
- 明確記錄 production Supabase 目前沒有可回復 backup / PITR 的上線風險。
- 記錄 2026-06-12 `AuditEvent` 缺表事件的修復方式：只套用 additive-only table / index / foreign key SQL，不更新、刪除或插入既有資料。
- 本次未修改產品功能程式碼，未修改 PayUNI 核心交易邏輯，未輸出任何 DATABASE_URL、DIRECT_URL、PayUNI secret 或完整 payload。

## 2026-06-12 - Production AuditEvent schema readiness 修正

- 在 Supabase production project `IG Auto Reply ManyChat` 手動透過 SQL Editor 套用最小 `AuditEvent` schema 修正。
- SQL 只執行 `CREATE TABLE IF NOT EXISTS`、`CREATE INDEX IF NOT EXISTS` 與缺少時補 foreign key；未更新、刪除或插入既有資料。
- Supabase SQL 結果確認：`AuditEvent` table、4 個 index、2 個 foreign key 全部存在。
- Production `/admin/audit` 已可正常開啟，不再出現 Prisma P2021 `public.AuditEvent` 缺表錯誤。
- Production `/api/health` 回 HTTP 200，`database.ok=true`；整體 status 仍為 `degraded`，原因是 Redis 未設定。
- 未修改 PayUNI 核心交易邏輯，未輸出任何 database URL、PayUNI secret、Hash Key、Hash IV 或完整 payload。

更新日期：2026-06-10

## 2026-06-10：Phase 0 任務 2 - production 移除 Meta env token fallback

- Production 不再使用 `META_*` env token 作為 channel token fallback。
- Local / test 保留 sandbox fallback，避免開發環境完全不可用。
- 補 webhook / comment sync / send message tenant isolation regression tests。

## 2026-06-10：Phase 0 任務 3 - 收斂 Meta production OAuth 主流程

- Meta authorize URL 收斂到 generic callback。
- 保留既有 success redirect / session 行為。
- 補 Social Accounts 解除連接與重新連接的最小 UX。

## 2026-06-10：Phase 0 任務 4 - 公開文案與亂碼整理

- 整理 README、environment variables、Billing、Privacy Policy、Terms of Service、Data Deletion。
- 補 public copy smoke test。

## 2026-06-10：Phase 1 任務 1 - plan gating 測試與缺口

- `getWorkspaceEntitlement()` 僅採用有效的 `active` / `trialing` subscription。
- `past_due` / `unpaid` 不再當作付費 entitlement。
- Sequence 建立套用 automation quota。
- Knowledge Base / AI FAQ 建立套用 `knowledgeBaseItems` quota。
- inbound contact 建立前檢查 `activeContacts` quota。
- 補 route-level gating tests 與 DB-backed entitlement tests。

## 2026-06-10：Phase 1 任務 2 - Billing PayUNI sandbox / production 狀態

- Billing 頁新增 PayUNI 正式收款狀態區塊。
- 顯示目前 gateway host、sandbox / production 模式、`PAYUNI_ALLOW_PRODUCTION`、Return URL / Notify URL 是否設定。
- 不顯示 Merchant ID、Hash Key、Hash IV、EncryptInfo、HashInfo 或完整付款 payload。
- 新增 `docs/payuni-production-sop.md`。
- 更新 product readiness、billing readiness、fix roadmap 與 launch checklist。

## 2026-06-10：Phase 1 任務 3 - PayUNI production 小額交易驗證與對帳 runbook

- `npm run payuni:smoke` 新增 PayUNI env 前置檢查。
- 當 gateway 指向 production 時，必須同時設定 `PAYUNI_ALLOW_PRODUCTION=true` 與 `PAYUNI_SMOKE_ALLOW_PRODUCTION=true`。
- Production smoke 必須使用明確的 HTTPS `PAYUNI_RETURN_URL` 與 `PAYUNI_NOTIFY_URL`。
- 新增 `docs/payuni-production-reconciliation-runbook.md`，列出小額交易、notify 重送、付款失敗與對帳欄位。
- 未修改 PayUNI checkout / return / notify 核心交易邏輯。

## 本輪剩餘風險

- PayUNI production merchant review 與正式小額交易尚需在真實環境完成。
- `npm run payuni:smoke` 需要有效 PayUNI env；若本機 env 未設定，會失敗但不代表程式碼交易流程失效。
- Production smoke 仍只驗證可進入 PayUNI 支付頁；實際付款成功、notify、return 與對帳仍需人工照 runbook 執行。

## 2026-06-10：Phase 1 任務 4 - PayUNI production 對帳模板與 admin audit 檢查清單

- 新增 `docs/payuni-production-reconciliation-template.md`，提供 production 小額交易的非敏感對帳紀錄格式。
- 新增 `docs/admin-audit-payuni-checklist.md`，列出 `/admin/audit` 應檢查的 billing action、resource、狀態與 metadata。
- 文件明確禁止記錄 PayUNI secret、Hash Key、Hash IV、EncryptInfo、HashInfo、完整 return payload 或完整 notify payload。
- 未修改 PayUNI checkout / return / notify 核心交易邏輯。

## 2026-06-10：Phase 1 任務 5 - PayUNI return / notify 失敗分支安全 audit coverage

- 診斷結果：PayUNI payment failed 會更新 order / invoice，但缺少 audit；return / notify catch 只有 console log。
- 新增 `billing_payuni_payment_failed`，metadata 僅包含 invoiceId、planKey、interval、amount、MerTradeNo、TradeNo、status。
- 新增 `billing_payuni_return_failed` 與 `billing_payuni_notify_failed`，metadata 僅包含 endpoint、reason 與 payload/hash 是否存在的布林摘要。
- 測試確認 audit metadata 不包含 EncryptInfo / HashInfo 值或完整 payload。
- 未修改 PayUNI checkout、paid 判斷、completion、return redirect 或 notify response 的核心行為。

## 2026-06-10：Phase 1 任務 6 - Admin audit 付款稽核可讀性與 metadata 遮罩

- 診斷結果：`/admin/audit` 直接顯示 `JSON.stringify(metadataJson)`，缺少敏感 key 遮罩與 billing filter。
- 新增 Billing / PayUNI filter，可用 `/admin/audit?resource=billing` 只看付款相關 audit。
- 新增付款稽核摘要卡：Billing 事件、PayUNI 相關、付款失敗 / 異常。
- metadata 顯示前會遮罩 token、secret、Hash Key、Hash IV、EncryptInfo、HashInfo、payload、card number 等欄位。
- 未修改 audit 資料模型。

## 2026-06-10：Phase 1 任務 7 - PayUNI production 小額交易前 Go/No-Go preflight

- 新增 `npm run payuni:preflight`。
- CLI 只輸出非敏感狀態：gateway host、mode、Return URL / Notify URL 是否 production HTTPS、production gate 是否開啟。
- Production Go 條件包含 `PAYUNI_ALLOW_PRODUCTION=true` 與 `PAYUNI_SMOKE_ALLOW_PRODUCTION=true`。
- 測試確認報告不包含 Merchant ID、Hash Key、Hash IV 的實際值。
- 未修改 PayUNI checkout / return / notify / completion 核心交易邏輯。

## 2026-06-10：Phase 1 任務 8 - PayUNI production 人工對帳入口

- 新增 `/admin/billing-reconciliation`，讓 admin 用 MerTradeNo / TradeNo 找到 payment order、invoice、subscription 與 billing audit。
- 在 AdminShell 側欄加入「付款對帳」，並在 `/admin/audit` 加入對帳頁交叉連結。
- 更新 PayUNI production runbook、對帳模板、admin audit checklist、billing readiness、security review、product readiness、fix roadmap 與 launch checklist。
- 未修改 PayUNI checkout / return / notify / completion 核心交易邏輯。

## 2026-06-10：Phase 1 任務 9 - PayUNI admin 對帳頁 route-level smoke test

- 補強 `tests/admin-billing-reconciliation-page.test.ts`，用 route-level server component smoke test 驗證 admin 可載入 `/admin/billing-reconciliation`。
- 驗證搜尋參數會套用到 MerTradeNo / TradeNo 查詢，且 payment order、invoice、subscription、billing audit 都帶 workspace tenant 限制。
- 驗證頁面輸出包含 Billing Audit 交叉連結 `/admin/audit?resource=billing`。
- 驗證非 admin 使用者不會觸發 workspace 與 billing 資料查詢。
- 未修改 PayUNI checkout / return / notify / completion 核心交易邏輯。

## 2026-06-10：Phase 1 任務 10 - PayUNI admin 對帳頁 Playwright E2E

- 補 `tests/e2e/public-and-auth.spec.ts` 的 admin PayUNI reconciliation E2E。
- 測試會用 `ADMIN_EMAIL` / `ADMIN_PASSWORD` 登入，開啟 `/admin/billing-reconciliation`，搜尋 `PAYUNI_RECONCILIATION_E2E_MER_TRADE_NO` 或 `PAYUNI_RECONCILIATION_E2E_TRADE_NO`，再點擊 Billing Audit。
- 若缺少穩定 MerTradeNo / TradeNo 測試資料，該 E2E 會 skip，避免測試依賴不穩定 production 資料。
- 未修改 PayUNI checkout / return / notify / completion 核心交易邏輯。

## 2026-06-10：PayUNI 對帳 E2E 重跑紀錄

- 已確認目前環境有 `ADMIN_EMAIL` / `ADMIN_PASSWORD`，但缺少 `PAYUNI_RECONCILIATION_E2E_MER_TRADE_NO` 與 `PAYUNI_RECONCILIATION_E2E_TRADE_NO`。
- 重跑 `npm run test:e2e` 後結果為 10 passed / 2 skipped。
- skipped 的 2 個測試是 PayUNI admin reconciliation，原因是沒有穩定 MerTradeNo / TradeNo，尚不能視為完成真實 production 對帳驗證。
- 修正 mobile menu E2E selector，避免 `關閉導覽` 同時匹配背景遮罩 `關閉導覽背景`。

## 2026-06-13 - Production non-public duplicate schema cleanup

- Target project: Supabase production project `IG Auto Reply ManyChat`.
- Scope: cleaned only exact non-public schemas `undefined` and `test_1779910095731_d847e1`.
- Rollback gate: user confirmed rollback path existed and final preflight passed before execution.
- Executed the previously reviewed guarded cleanup SQL in Supabase SQL Editor.
- Supabase destructive-operation confirmation appeared and was accepted after user authorization.
- Guarded cleanup completed without observed SQL error or guard failure.
- Post-cleanup verification:
  - `test_1779910095731_d847e1.schema_exists=false`.
  - `undefined.schema_exists=false`.
  - FK verification returned `0 row`.
- Production checks:
  - `/api/health` returned HTTP 200 with `database.ok=true`; overall status remained `degraded`.
  - `/admin/audit` opened without observed server error.
  - `/admin/billing-reconciliation` opened without observed server error.
- No `DATABASE_URL`, `DIRECT_URL`, PayUNI secret, token, or full payload was output or recorded.

## 2026-06-13 - Production schema drift cleanup follow-up recheck

- Performed read-only schema drift recheck after duplicate schema cleanup.
- Confirmed production `public` schema still matches Prisma model/table/column surface:
  - Prisma models: 45.
  - Prisma scalar / enum columns: 439.
  - Production `public` tables: 45.
  - Production `public` columns: 439.
  - Missing / extra tables: 0 / 0.
  - Missing / extra columns: 0 / 0.
  - Production `public` FK count: 76.
- Confirmed duplicate schemas `undefined` and `test_1779910095731_d847e1` no longer exist.
- Confirmed `PaymentOrder.interval` and `Subscription.interval` exist as non-null `BillingInterval`.
- Confirmed `public."AuditEvent"` has both workspace/user FK constraints.
- Production checks:
  - `/api/health`: HTTP 200, `database.ok=true`, overall status `degraded`.
  - `/admin/audit`: opens without observed server error.
  - `/admin/billing-reconciliation`: opens without observed server error.
- No production DB change was made and no secret or full payload was output.
