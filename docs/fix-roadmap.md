# Fix Roadmap

## Latest - 2026-06-24 Staging DB split plan and health check

Status: planned and guarded; Supabase/Vercel secrets still need manual setup.

- `[x]` Add `docs/staging-db-runbook.md`.
- `[x]` Document Vercel Preview env values for staging-only DB.
- `[x]` Add staging DB env guard variables.
- `[x]` Add `/api/health/staging`.
- `[x]` Add tests for staging health pass/fail conditions.
- `[x]` Validate targeted health tests, lint, and build locally.
- `[ ]` Create a separate Supabase staging project.
- `[ ]` Set Vercel Preview `DATABASE_URL` / `DIRECT_URL` to staging DB URLs.
- `[ ]` Set Preview auth, Supabase, PayUNI sandbox, provider, Redis, and cron env values.
- `[ ]` Run migrations against staging DB only.
- `[ ]` Verify staging alias health check after deployment.

Hard boundary:

- Do not read, copy, migrate, or seed production data while preparing staging.

Validation note:

- Full `npm test` currently depends on the configured Supabase pooler and failed when that host was unreachable. Re-run after test DB connectivity is stable.

## Latest - 2026-06-24 Release mode implementation and smoke tests

Status: implemented locally; validated and preparing push to `master` and `staging`.

- `[x]` Add centralized release mode helper.
- `[x]` Default `inboxpilot.carry-digital-nomad.in.net` to simple release.
- `[x]` Default staging / preview / localhost to full release.
- `[x]` Allow `INBOXPILOT_RELEASE_CHANNEL` to force `simple` or `full`.
- `[x]` Hide full-only nav and connection options in simple release.
- `[x]` Block full-only routes and non-Instagram OAuth entry points in simple release proxy.
- `[x]` Add smoke tests for release detection and proxy behavior.
- `[x]` Validate with lint, build, full test suite, and Playwright e2e.
- `[ ]` Push the implementation to both `master` and `staging`.
- `[ ]` Verify Vercel deployments after both pushes complete.

Remaining risk:

- DB is still intentionally shared for now and must be split before onboarding real customers.
- Preview env completeness still needs explicit confirmation before staging is dependable for full end-to-end QA.

## 2026-06-13 Update - Staging preflight checklist

- Completed read-only staging preflight checklist.
- Recommendation: use existing Vercel project `inboxpilot` with a fixed `staging` branch, Preview env scoped to staging, and a fixed staging domain.
- Use separate Vercel project `inboxpilot-staging` only if stronger dashboard-level isolation is needed.
- Created and switched to local Git branch `staging`.
- No push was performed, so Vercel will not create a Preview deployment until the branch is pushed and Git integration sees it.
- Push precheck:
  - `staging` currently points at commit `f1fa088`, the same base as `master`.
  - all recent staging, PayUNI, Meta, billing, admin, legal, DB runbook, and test work is still uncommitted in the working tree.
  - pushing now without committing would not include these changes in Vercel Preview.
  - Vercel Preview / staging env is still missing, so even a committed push may not boot correctly until Preview env and staging DB are configured.
- Staging-required changes before first useful Preview:
  - `docs/staging-environment-runbook.md`
  - `docs/environment-variables.md`
  - `docs/security-review.md`
  - `docs/fix-roadmap.md`
  - `docs/codex-session-log.md`
  - `playwright.config.ts`
- Accumulated non-staging changes currently also present in the working tree:
  - PayUNI billing correctness, production gate, audit coverage, preflight, reconciliation docs and admin UI.
  - Meta OAuth / tenant isolation / reconnect UX changes.
  - plan gating and billing entitlement tests.
  - public copy / legal / README / launch checklist updates.
  - production DB migration and schema drift runbooks.
- Recommendation: do not push yet as-is. First create a deliberate commit plan, confirm Preview env + Supabase staging project, then push `staging`.
- Current findings:
  - `.vercel/project.json` is linked to `inboxpilot`.
  - Vercel env listing shows Production env only; Preview / staging env is still missing.
  - worktree was detached `HEAD` before this task and is now on local branch `staging`.
- Updated `docs/staging-environment-runbook.md` with:
  - required Vercel Preview / staging env key names,
  - Supabase staging output keys,
  - Meta / Google callback URL checklist,
  - PayUNI sandbox requirements,
  - manual setup order and stop conditions.
- No production env was changed and no secret values were viewed or output.


## 2026-06-13 Update - Staging environment planning

- Created `docs/staging-environment-runbook.md`.
- Current Vercel project is linked locally as `inboxpilot`.
- Vercel env inventory shows variables configured for Production, but no Preview / staging env was observed.
- Recommended staging approach:
  - fixed staging branch/domain,
  - Vercel Preview env scoped to staging,
  - separate Supabase staging project,
  - PayUNI sandbox only,
  - Meta / Google staging callback URLs.
- Updated `playwright.config.ts` to support:
  - `PLAYWRIGHT_BASE_URL=https://staging... npm run test:e2e`
  - no localhost web server startup when `PLAYWRIGHT_BASE_URL` is set.
- Next staging blocker:
  - manually create Vercel Preview / staging env with dedicated non-production credentials,
  - create Supabase staging project,
  - add Meta / Google staging callback URLs.

Verification:

- `npm run lint`: passed.
- `npm run build`: passed.
- `npm test`: blocked locally because neither `DATABASE_URL` nor `TEST_DATABASE_URL` is configured.

## 2026-06-13 Update - PayUNI production gate ordering fix

- Completed small checkout safety fix for PayUNI production gate ordering.
- `src/app/api/billing/payuni/checkout/route.ts` now checks production gateway / `PAYUNI_ALLOW_PRODUCTION` before:
  - workspace lookup,
  - idempotency replay lookup,
  - invoice creation,
  - payment order creation,
  - PayUNI checkout form generation.
- Added regression coverage in `tests/billing-checkout-route.test.ts`.
- Verified targeted test:
  - `npx vitest run tests/billing-checkout-route.test.ts`: passed.
- Full verification:
  - `npm run lint`: passed.
  - `npm run build`: passed.
  - `npm test`: blocked locally because neither `DATABASE_URL` nor `TEST_DATABASE_URL` is configured.
- PayUNI production automatic checkout remains intentionally paused until production env is manually switched and preflight is GO.

## 2026-06-13 Update - PayUNI production auto-charge resume readiness review

- Completed read-only readiness review for resuming PayUNI production automatic checkout.
- Production `/billing` shows:
  - PayUNI production gateway host is configured.
  - Merchant ID / Hash Key / Hash IV / Return URL / Notify URL are present but hidden.
  - `PAYUNI_ALLOW_PRODUCTION=false`.
  - Checkout is intentionally paused.
- Did not click `/billing` payment buttons because the checkout route creates an invoice before checking the production gate; clicking would write production data and violate read-only scope.
- `/api/health` returned HTTP 200 with `database.ok=true`.
- `/admin/billing-reconciliation` opened without observed server error.
- Local `npm run payuni:preflight` remains `NO-GO` due local sandbox/missing env; production page status is the source of truth for current production gate display.
- Verification:
  - `npm run lint`: passed.
  - `npm run build`: passed.
  - `npm test`: blocked locally because neither `DATABASE_URL` nor `TEST_DATABASE_URL` is configured.
- Next recommended small fix before public sale:
  - Move the production gateway / `PAYUNI_ALLOW_PRODUCTION` guard before invoice creation in checkout, so a paused production gate cannot create pending invoice noise.
- PayUNI production small-amount verification can proceed only after a human intentionally enables `PAYUNI_ALLOW_PRODUCTION=true`, temporarily enables smoke permission, redeploys, and confirms production preflight GO.

## 2026-06-12 Update - Non-public schema cleanup preflight package completed

- Created `docs/non-public-schema-cleanup-preflight.md`.
- The package contains read-only SQL only and intentionally does not include cleanup SQL.
- Preflight covers:
  - exact row count checks for `undefined` and `test_1779910095731_d847e1`
  - `public` FK references into duplicate schemas
  - duplicate schema FK references into `public`
  - FK summary by schema pair
  - Prisma runtime public-only checks
- Cleanup remains blocked until Supabase backup/PITR is enabled or an encrypted external `pg_dump` is restore-tested.
- Next milestone: establish rollback path, then run the preflight package and decide whether cleanup is operationally worth doing.

## 2026-06-12 Update - Production backup / PITR readiness diagnosis

- Read-only Supabase dashboard check confirmed production project `IG Auto Reply ManyChat` is still on a Free organization plan.
- Scheduled backups are not included on the current plan.
- PITR is not enabled and is shown as a Pro Plan add-on.
- Updated `docs/database-migration-runbook.md` with a minimum external `pg_dump` SOP and restore verification checklist.
- Before cleaning non-`public` duplicate schemas, complete one of:
  - enable Supabase Pro scheduled backups and confirm a backup exists,
  - enable PITR if second-level rollback is required,
  - or create and restore-test an encrypted external `pg_dump`.
- Do not prepare or execute duplicate schema cleanup SQL until a rollback path exists.

## 2026-06-12 Update - Production non-public schema inventory completed

- Created `docs/production-non-public-schema-inventory.md`.
- Read-only production DB inventory confirmed two duplicate non-`public` schemas:
  - `test_1779910095731_d847e1`: 42 tables, exact total rows `0`.
  - `undefined`: 45 tables, exact total rows `0`.
- Both schemas have full FK/index structure but no rows, so they look like test or accidental migration leftovers.
- Prisma runtime is expected to use `public` only; no `multiSchema`, `schemas = [...]`, or `@@schema` was found.
- Do not clean these schemas until production backup/PITR or an external dump exists.
- Future schema verification SQL must always be schema-qualified to avoid false positives from duplicate table/constraint names.

## 2026-06-12 Update - AuditEvent FK additive migration applied

- Completed guarded additive FK migration for `public."AuditEvent"`.
- Preflight orphan check passed with both counts at 0.
- Verification confirmed `AuditEvent_workspaceId_fkey` and `AuditEvent_userId_fkey` exist on `public."AuditEvent"`.
- `/api/health` returned HTTP 200 with `database.ok=true`; Redis remains not configured, so status is still `degraded`.
- `/admin/audit` opened normally without observed server error.
- Remaining DB readiness risk: production Supabase still needs PITR / backup or an external scheduled dump before public sale.

## 2026-06-12 Update - AuditEvent FK additive migration prep

- 已新增 `docs/auditevent-fk-additive-migration-prep.md`。
- 已準備 `public."AuditEvent"` 的 `workspaceId`、`userId` foreign key additive-only 修正 SQL。
- 尚未執行 SQL，尚未修改 production DB。
- 套用前必須先跑 read-only orphan preflight；若 violation count 大於 0，必須停下來人工檢查。
- 建議下一步：確認 Supabase backup / dump 後，由使用者明確確認是否套用 guarded FK SQL。

## 2026-06-12 Update - Production schema drift read-only check

- 已新增 `docs/production-schema-drift-report.md`。
- Read-only 檢查結果：production `public` schema 的 table / columns / PK / unique / indexes 與 Prisma schema 一致。
- 剩餘 schema drift：`public."AuditEvent"` 缺少 `workspaceId`、`userId` 兩個 foreign key；目前不阻擋 `/admin/audit` 讀取，但會削弱 audit referential integrity。
- 額外風險：production DB 存在非 `public` duplicate schema：`undefined`、`test_1779910095731_d847e1`。未備份前不建議清理。
- 下一步建議：先建立 Supabase backup / dump，再套用 guarded additive FK SQL，並盤點非 `public` schema 是否可清理。

## 2026-06-12 Update - Production DB migration runbook completed

- 已更新 `docs/database-migration-runbook.md`，建立 production migration 前 checklist 與驗證流程。
- Migration 前必檢項目已文件化：備份或 dump、SQL 影響範圍、read-only 驗證 SQL、`/api/health`、`/admin/audit`。
- 剩餘 blocker / risk：production Supabase 目前仍沒有可回復 backup / PITR；公開販售前應升級 Supabase 或建立外部 scheduled dump。
- 後續建議：補 production schema drift / missing table alert，避免 admin route 因 Prisma schema 漏套才由使用者發現。

## 2026-06-12 Update - Production AuditEvent schema blocker resolved

- 已在 production Supabase 套用最小 `AuditEvent` table / index / foreign key SQL。
- `/admin/audit` 已可正常開啟，P2021 `public.AuditEvent` 缺表 blocker 已解除。
- `/api/health` 回 HTTP 200 且 `database.ok=true`；Redis 未設定仍使整體 status 顯示 `degraded`。
- 剩餘 migration 風險：production DB 仍未建立完整可回復備份，後續 schema 變更應優先升級 Supabase backup / PITR 或建立外部 dump 流程。
- 下一步建議：補正式 DB migration runbook，避免 production schema 漏套時只能依賴手動 SQL Editor。

更新日期：2026-06-10

## Phase 0：正式販售前 blocker

| 狀態 | 任務 | 主要檔案 | 驗證 |
| --- | --- | --- | --- |
| 已完成 | Billing interval 與 subscription correctness | `src/lib/billing/payment-service.ts`, `src/app/api/billing/payuni/checkout/route.ts` | `npm run lint`, `npm run build`, `npm test` |
| 已完成 | 移除 production Meta env token fallback | `src/lib/meta/*`, webhook / send message tests | `npm run lint`, `npm run build`, `npm test` |
| 已完成 | 收斂 Meta production OAuth 主流程與 reconnect UX | `src/app/api/oauth/*`, social account UI | `npm run lint`, `npm run build`, `npm test` |
| 已完成 | README / env / Billing / legal pages 亂碼與中文文案 | `README.md`, `docs/environment-variables.md`, legal pages | `npm run lint`, `npm run build`, `npm test` |

## Phase 1：Beta 試賣必修

| 狀態 | 任務 | 主要檔案 | 驗證 |
| --- | --- | --- | --- |
| 已完成 | trial / expired / past_due / unpaid plan gating tests | `src/lib/billing/entitlements.ts`, route tests | `npm run lint`, `npm run build`, `npm test` |
| 已完成 | Billing 頁清楚顯示 PayUNI sandbox / production 狀態 | `src/app/billing/page.tsx`, `tests/public-copy-smoke.test.ts` | `npm run lint`, `npm run build`, `npm test` |
| 已完成 | Production 正式收款 SOP | `docs/payuni-production-sop.md` | 文件檢查與 smoke test |
| 已完成 | PayUNI production smoke 環境檢查與對帳 runbook | `scripts/payuni-smoke-test.mjs`, `docs/payuni-production-reconciliation-runbook.md` | `npm run lint`, `npm run build`, `npm test`，sandbox 時跑 `npm run payuni:smoke` |
| 已完成 | PayUNI production 對帳結果模板與 admin audit 檢查清單 | `docs/payuni-production-reconciliation-template.md`, `docs/admin-audit-payuni-checklist.md` | `npm run lint`, `npm run build`, `npm test` |
| 已完成 | PayUNI return / notify 失敗分支安全 audit coverage | `src/lib/billing/payuni-callback.ts`, `src/app/api/billing/payuni/return/route.ts`, `src/app/api/billing/payuni/notify/route.ts` | `npm run lint`, `npm run build`, `npm test` |
| 已完成 | `/admin/audit` 付款稽核可讀性與敏感 metadata 顯示防護 | `src/app/admin/audit/page.tsx`, `tests/admin-audit-page.test.ts` | `npm run lint`, `npm run build`, `npm test` |
| 已完成 | PayUNI production 小額交易前環境 Go/No-Go CLI 摘要 | `scripts/payuni-preflight.mjs`, `tests/payuni-preflight.test.ts` | `npm run lint`, `npm run build`, `npm test` |
| 待執行 | PayUNI production 小額真實交易驗證 | deployment env, PayUNI 後台 | `npm run payuni:smoke`，人工對帳 |
| 待執行 | Onboarding / reconnect E2E | `e2e/*`, channels pages | `npm run test:e2e` |

## Phase 2：公開販售必修

- 完成 Meta App Review、Advanced Access、Business Verification。
- 完成 PayUNI production merchant review、退費演練、notify 重送與對帳 runbook。
- 補正式退款政策、Cookie 說明、Affiliate 條款。
- 補 production observability：billing failure、webhook failure、queue lag、audit alerting。

## Phase 3：規模化優化

- Worker dead letter queue、批次重送與 queue dashboard。
- Affiliate payout dashboard 與反作弊規則。
- 多品牌白標設定與更完整的 workspace role permission。
- 大量用戶的 usage / revenue / churn 報表。

## 每個 phase 的驗證指令

```bash
npm run lint
npm run build
npm test
npm run test:e2e
npm run payuni:preflight
npm run payuni:smoke
npm run load:test
```

## 下一個 Codex 任務建議

請先閱讀 AGENTS.md、docs/payuni-production-sop.md、docs/payuni-production-reconciliation-runbook.md 與 docs/payuni-production-reconciliation-template.md，然後執行 Phase 1 任務 8：建立 production 小額交易後的人工對帳操作頁面或 admin runbook link。不要改 PayUNI 核心交易邏輯，只改善營運人員找到 invoice、payment order、subscription、audit 的路徑。完成後跑 npm run lint、npm run build、npm test。

## 2026-06-10 Update - Phase 1 Task 8 Completed

- 已建立 `/admin/billing-reconciliation`，作為 production 小額交易後的人工對帳入口。
- 已在 `/admin/audit` 增加「付款對帳」交叉連結。
- 已補靜態 smoke test：`tests/admin-billing-reconciliation-page.test.ts`。
- 下一步建議：補 Playwright admin 對帳頁 smoke test，確認 admin 使用者能開啟頁面、搜尋 MerTradeNo，並從頁面切到 Billing Audit。

## 2026-06-10 Update - Phase 1 Task 9 Completed

- 已補 `/admin/billing-reconciliation` route-level smoke test。
- 覆蓋 admin 可載入頁面、MerTradeNo / TradeNo 搜尋條件、Billing Audit 連結、workspace tenant isolation，以及非 admin 不查詢 billing records。
- 未修改 PayUNI 核心交易邏輯。
- 下一步建議：在可用測試帳密與穩定 seed data 後，再補 Playwright E2E，驗證真實瀏覽器可登入 admin、搜尋 MerTradeNo，並從對帳頁切到 Billing Audit。

## 2026-06-10 Update - Phase 1 Task 10 Completed

- 已補 `/admin/billing-reconciliation` Playwright E2E。
- E2E 需要 `ADMIN_EMAIL` / `ADMIN_PASSWORD`，以及 `PAYUNI_RECONCILIATION_E2E_MER_TRADE_NO` 或 `PAYUNI_RECONCILIATION_E2E_TRADE_NO` 作為穩定測試資料。
- 缺少穩定交易編號時會 skip，不會假裝驗證 production 對帳資料。
- 下一步建議：完成真實 production 小額交易後，把非敏感 MerTradeNo 設到測試環境，重新跑 `npm run test:e2e` 取得完整瀏覽器驗證結果。

## 2026-06-10 Update - PayUNI Reconciliation E2E Rerun

- 目前測試環境仍缺少 `PAYUNI_RECONCILIATION_E2E_MER_TRADE_NO` / `PAYUNI_RECONCILIATION_E2E_TRADE_NO`。
- `npm run test:e2e` 結果：10 passed / 2 skipped。
- 剩餘動作：完成 production 小額交易後，將非敏感 MerTradeNo 或 TradeNo 設入測試環境，再重跑 `npm run test:e2e`。

## 2026-06-13 Update - Production duplicate schema cleanup completed

- Completed guarded cleanup for non-public duplicate schemas:
  - `undefined`
  - `test_1779910095731_d847e1`
- The cleanup was limited to the exact schema names above and did not touch `public`.
- Post-cleanup verification confirmed both schemas no longer exist and FK verification returned `0 row`.
- Production route checks passed:
  - `/api/health`: HTTP 200, `database.ok=true`.
  - `/admin/audit`: opened without observed server error.
  - `/admin/billing-reconciliation`: opened without observed server error.
- Remaining Phase 1 / launch work:
  - Keep rollback/PITR or restore-tested dump as a mandatory gate for future destructive DB work.
  - Re-run production schema drift review before public sale.
  - Add automated schema drift or route smoke alerts for `/api/health`, `/admin/audit`, and billing admin pages.
  - PayUNI real production transaction verification remains pending because actual small-charge testing was paused.

## 2026-06-13 Update - Production schema drift recheck after cleanup

- Completed read-only post-cleanup schema drift recheck.
- `public` schema table/column surface matches Prisma:
  - missing tables: 0
  - extra tables: 0
  - missing columns: 0
  - extra columns: 0
- Duplicate schemas `undefined` and `test_1779910095731_d847e1` are no longer present.
- Billing/subscription/admin-audit schema blockers found in earlier reviews are resolved:
  - `PaymentOrder.interval` exists.
  - `Subscription.interval` exists.
  - `AuditEvent_workspaceId_fkey` and `AuditEvent_userId_fkey` exist on `public."AuditEvent"`.
- Production route checks passed for `/api/health`, `/admin/audit`, and `/admin/billing-reconciliation`.
- Remaining work moves away from schema drift and back to launch readiness:
  - PayUNI real production transaction verification.
  - Redis / worker / queue production readiness.
  - Observability and alerting.
  - Meta App Review and production permissions.

## 2026-06-24 - Staging DB env handoff status

Current status:

- Vercel Preview has the non-secret staging markers required by the health guard:
  - `APP_URL`
  - `APP_DOMAIN`
  - `INBOXPILOT_DEPLOYMENT_ENV`
  - `INBOXPILOT_DB_ENV`
  - existing `INBOXPILOT_RELEASE_CHANNEL`
- `staging` branch deployment succeeded at Preview deployment `inboxpilot-90d03j3b3-a25814740s-projects.vercel.app`.
- GitHub Actions `CI` and `Update Staging Alias` both passed for commit `95c55b3`.
- `staging.carry-digital-nomad.in.net` resolves to the latest staging Preview deployment.
- `/api/health/staging` is reachable and currently returns HTTP 503 by design because staging Supabase DB secrets have not been added yet.

Remaining work:

- Create or locate the independent Supabase staging project.
- Add these Preview-only values without printing secrets:
  - `DATABASE_URL`
  - `DIRECT_URL`
  - `STAGING_SUPABASE_PROJECT_REF`
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `AUTH_SECRET`
  - `TOKEN_ENCRYPTION_KEY`
- Redeploy `staging` branch and verify `/api/health/staging` returns healthy.

Risk note:

- Do not reuse production Supabase values for staging.
- Do not copy production data into staging unless a separate scrubbed-seed plan is approved.
