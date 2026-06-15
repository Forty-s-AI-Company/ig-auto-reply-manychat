# InboxPilot Fix Roadmap

## 2026-06-16 - Meta Business Login sandbox SBL-12 callback capture helper

Status: targeted helper tests passed.

- Added `src/lib/meta-business-sandbox-callback-capture.ts`.
- Added `tests/meta-business-login-sandbox-sbl12-callback-capture.test.ts`.
- Added `docs/meta-business-login-sandbox-controlled-callback-capture-plan.md` and `docs/meta-business-login-sandbox-sbl12-callback-capture-test-command.md`.
- Production callback route remains unchanged; route integration and real callback evidence remain Hold.
- Next safe step is choosing Option A sandbox redirect URI or Option B narrow production callback read-only guard with tests.

## 2026-06-16 - Meta Business Login sandbox next controlled callback prompt

Status: documented next step.

- Added `docs/meta-business-login-sandbox-next-controlled-callback-prompt.md`.
- The next safe step is controlled callback capture preparation, not blindly reopening the Instagram Business Login OAuth URL.
- The prompt requires sandbox-only capture design, redaction, state / workspace validation, and production write guards before any callback evidence run.
- Internal beta remains Hold. Production implementation remains No-Go.

## 2026-06-16 - Meta Business Login sandbox OAuth profile selection evidence

Status: Partial Pass / Hold before callback.

- Added `docs/meta-business-login-sandbox-oauth-profile-selection-run-2026-06-16.md`.
- Continued the Instagram Business Login flow to profile selection and selected `carry.digital.nomad`.
- Account selection UX is now confirmed: two profiles plus "use another profile" were shown.
- Final OAuth consent and callback evidence remain missing because Instagram loaded the selected profile home page after selection.
- Next safe step is not a blind OAuth retry; it requires sandbox callback capture or explicit production-safe test callback controls.

## 2026-06-15 - Meta Business Login sandbox authenticated browser evidence

Status: Partial Pass / Hold.

- Added `docs/meta-business-login-sandbox-authenticated-browser-evidence-run-2026-06-15.md`.
- Captured InboxPilot Meta App Dashboard evidence, Instagram API setup evidence, Instagram Business Login authorize URL evidence, business login settings evidence, permissions evidence, and partial account selection UX evidence.
- Key finding: Meta-provided Instagram Business Login URL uses `force_reauth=true` and `response_type=code`.
- Key finding: account selection UX can appear with IG profiles plus "use another profile", but callback evidence was not captured because the run stopped before selecting a profile and final authorization.
- Internal beta remains Hold. Production implementation remains No-Go.

## 2026-06-15 - Meta Business Login sandbox browser evidence run

Status: Hold at Facebook login.

- Added `docs/meta-business-login-sandbox-browser-evidence-run-2026-06-15.md`.
- In-app Browser reached Facebook login for Meta Developers but did not have an authenticated Meta developer session.
- Local route guard evidence passed: unauthenticated internal sandbox route calls returned 401 dry-run errors.
- No credentials, OTP, token, authorization code, app secret, raw state, raw nonce, full callback URL, or browser storage was read or entered.
- Internal beta and production implementation remain No-Go until real Meta dialog, account selection, callback, and App Review evidence is collected.

## 2026-06-15 - Meta Business Login sandbox external evidence handoff

Status: Hold, Chrome extension UI blocker.

- Added `docs/meta-business-login-sandbox-external-evidence-handoff.md`.
- Chrome reached Meta Developers Apps, but another extension UI blocked automation before page DOM inspection.
- Next step after Chrome is unblocked: collect real Meta App Dashboard, Meta dialog, account selection UX, redacted callback, and reviewer demo evidence.
- Internal beta and production implementation remain No-Go.

## 2026-06-15 - Meta Business Login sandbox SBL-11 evidence packet

Status: targeted evidence packet tests passed.

- Added `src/lib/meta-business-sandbox-evidence.ts`.
- Added `tests/meta-business-login-sandbox-sbl11-evidence-packet.test.ts`.
- Added `docs/meta-business-login-sandbox-sbl11-evidence-packet-test-command.md`.
- The packet keeps local dry-run evidence redacted, requires production write guard evidence, and keeps internal beta / production implementation blocked until real Meta sandbox evidence and App Review gates pass.
- Existing production OAuth flow, callback routes, login buttons, env, Prisma schema, token storage, and production ConnectedAccount / Channel writes remain unchanged.

## 2026-06-15 - Meta Business Login sandbox production isolation regression

Status: targeted production isolation test passed.

- Added `tests/meta-business-login-sandbox-production-isolation.test.ts`.
- Added `docs/meta-business-login-sandbox-production-isolation-test-command.md`.
- The test checks that existing production OAuth routes, UI entry points, and Prisma schema remain free of sandbox provider ids, sandbox helper references, and `/api/internal/oauth` exposure.
- Existing production OAuth flow, callback routes, login buttons, env, Prisma schema, token storage, and production ConnectedAccount / Channel writes remain unchanged.

## 2026-06-15 - Meta Business Login sandbox route helper integration

Status: targeted route integration tests passed.

- Integrated internal sandbox routes with state / nonce redacted evidence, code exchange dry-run classifier, dry-run callback evidence, workspace allowlist spoofing guard, and production write guard metadata.
- Updated SBL-01 route tests to verify helper-chain evidence on authorize and callback responses.
- Existing production OAuth flow, existing callback routes, login buttons, env, Prisma schema, token storage, and production ConnectedAccount / Channel writes remain unchanged.

## 2026-06-15 - Meta Business Login sandbox implementation final report

Status: sandbox coding complete, production blocked.

- Added `docs/meta-business-login-sandbox-implementation-final-report.md`.
- Sandbox coding is complete for internal-only dry-run scaffold, including route skeleton, state / nonce helpers, code exchange safe stub, redaction helper, dry-run payload builder, workspace allowlist guard, production write guard, and targeted tests.
- Internal beta and production implementation remain No-Go until real Meta sandbox evidence and App Review gates pass.

## 2026-06-15 - Meta Business Login sandbox SBL-06 to SBL-08 helpers

Status: targeted helper tests passed.

- Added SBL-06 dry-run callback payload builder, SBL-07 workspace allowlist guard, and SBL-08 production write guard.
- Added targeted tests and `docs/meta-business-login-sandbox-sbl06-08-test-command.md`.
- Existing OAuth flow, callback routes, login buttons, env, Prisma schema, production ConnectedAccount, and production Channel records were intentionally not changed.
- Sandbox helper set is now ready for SBL-10 final runbook / report / go-no-go consolidation.

## 2026-06-15 - Meta Business Login sandbox SBL-05 redacted logging helper

Status: targeted helper tests passed.

- Added `src/lib/meta-business-sandbox-redaction.ts` with sandbox-only payload redaction, Meta asset id masking, audit event creation, and unsafe payload detection.
- Added `tests/meta-business-login-sandbox-sbl05.test.ts` and `docs/meta-business-login-sandbox-sbl05-test-command.md`.
- Production audit behavior, production logging format, existing OAuth routes, existing callback routes, env, and Prisma schema were intentionally not changed.
- Next step: SBL-06 dry-run callback payload builder.

## 2026-06-15 - Meta Business Login sandbox SBL-04 code exchange helper

Status: targeted helper tests passed.

- Added `src/lib/meta-business-sandbox-code-exchange.ts` with sandbox-only code exchange classification.
- The helper skips token exchange by default, redacts authorization code / token output, and classifies safe error types.
- Added `tests/meta-business-login-sandbox-sbl04.test.ts` and `docs/meta-business-login-sandbox-sbl04-test-command.md`.
- Real Meta token exchange, env changes, token storage, existing OAuth routes, existing callbacks, Prisma schema, and production writes remain blocked.
- Next step: SBL-05 redacted logging helper.

## 2026-06-15 - Meta Business Login sandbox SBL-03 state nonce helpers

Status: targeted helper tests passed.

- Added `src/lib/meta-business-sandbox-state.ts` with sandbox-only state / nonce creation, hash-only records, TTL validation, single-use replay protection, provider / workspace / user binding, and redacted audit output.
- Added `tests/meta-business-login-sandbox-sbl03.test.ts` and `docs/meta-business-login-sandbox-sbl03-test-command.md`.
- Existing OAuth state helpers, callback routes, cookies, env, Prisma schema, and production token handling were intentionally not changed.
- Next step: SBL-04 server-side code exchange helper as safe stub / classifier.

## 2026-06-15 - Meta Business Login sandbox SBL-01 internal route skeleton

Status: targeted skeleton tests passed.

- Added sandbox-only internal authorize and callback route skeletons under `/api/internal/oauth/[provider]`.
- Added `src/lib/meta-business-sandbox.ts` with internal-only guards, sandbox provider validation, workspace allowlist validation, redacted dry-run authorize payloads, redacted dry-run callback payloads, and production write guard checks.
- Added SBL-01 helper and route tests plus `docs/meta-business-login-sandbox-sbl01-test-command.md`.
- Existing OAuth routes, existing callback routes, login buttons, env, Prisma schema, and production ConnectedAccount / Channel writes were intentionally not changed.
- Next step: SBL-03 state / nonce helpers.

## 2026-06-15 - Meta Business Login sandbox SBL-09 test scaffold coding

Status: targeted scaffold tests passed.

- Added SBL-09 test scaffold under `tests/`, including fixtures, redaction assertion helper, dry-run callback payload validation, raw URL rejection, and production write guard tests.
- Added `docs/meta-business-login-sandbox-sbl09-test-command.md` and backfilled runbook, experiment report, go/no-go checklist, coding risk test plan, security review, Meta App Review checklist, and session log.
- Decision: SBL-01 internal-only route skeleton may start next under internal-only / dry-run-first / no-production-write constraints; internal beta and production implementation remain No-Go.
- Product code, OAuth routes, callback routes, login buttons, Prisma schema, and env were intentionally not changed.

## 2026-06-15 - Meta Business Login sandbox SBL-09 coding readiness checklist

Status: documented only.

- Added `docs/meta-business-login-sandbox-sbl09-coding-readiness-checklist.md` to decide whether SBL-09 sandbox test scaffold coding can begin.
- Decision: SBL-09 is Go for sandbox test scaffold coding only; SBL-01 remains Hold, and internal beta / production implementation remain No-Go.
- Product code, OAuth routes, callback routes, login buttons, Prisma schema, and env were intentionally not changed.

## 2026-06-15 - Meta Business Login sandbox SBL-09 fixture redaction spec

Status: documented only.

- Added `docs/meta-business-login-sandbox-sbl09-fixture-redaction-spec.md` to define fixture naming, safe / unsafe fixture boundaries, redaction assertions, dry-run callback snapshots, production write guard fixtures, and evidence search standards.
- SBL-09 remains pre-coding documentation until the fixture and redaction rules are accepted as the required scaffold boundary; SBL-01, internal beta, and production implementation remain blocked.
- Product code, OAuth routes, callback routes, login buttons, Prisma schema, and env were intentionally not changed.

## 2026-06-15 - Meta Business Login sandbox SBL-09 test suite spec

Status: documented only.

- Added `docs/meta-business-login-sandbox-sbl09-test-suite-spec.md` to define the minimum sandbox test suite before SBL-01 route work.
- The spec covers internal-only route tests, workspace allowlist tests, state / nonce / code exchange tests, redacted logging tests, dry-run callback payload tests, and production write guard tests.
- Product code, OAuth routes, callback routes, login buttons, Prisma schema, and env were intentionally not changed.

## 2026-06-15 - Meta Business Login sandbox coding kickoff checklist

Status: documented only.

- Added `docs/meta-business-login-sandbox-coding-kickoff-checklist.md` to define kickoff checks before SBL-09 and SBL-01.
- The checklist separates test-suite scaffold readiness from route skeleton readiness, defines internal-only / dry-run-first / no-production-write checks, redaction search standards, required document backfills, and current internal beta / production blocks.
- Product code, OAuth routes, callback routes, login buttons, Prisma schema, and env were intentionally not changed.

## 2026-06-15 - Meta Business Login sandbox final readiness review

Status: documented only.

- Added `docs/meta-business-login-sandbox-final-readiness-review.md` to assess whether the sandbox document set is ready for coding.
- Conclusion: documentation is mostly ready, sandbox coding remains Hold until go/no-go is explicitly marked, and internal beta / production implementation remain No-Go.
- Recommended first coding-prep task is SBL-09 test suite scaffold planning before SBL-01 internal-only route skeleton.
- Product code, OAuth routes, callback routes, login buttons, Prisma schema, and env were intentionally not changed.

## 2026-06-15 - Meta Business Login sandbox coding task breakdown

Status: documented only.

- Added `docs/meta-business-login-sandbox-coding-task-breakdown.md` to break future sandbox coding into internal-only / dry-run-first tasks.
- The breakdown lists each task's prerequisite gates, test requirements, files and flows that must not be modified, and how to backfill runbook / report / go-no-go checklist evidence.
- Product code, OAuth routes, callback routes, login buttons, Prisma schema, and env were intentionally not changed.

## 2026-06-15 - Meta Business Login sandbox document index

Status: documented only.

- Added `docs/meta-business-login-sandbox-doc-index.md` to index all Meta Business Login sandbox research, planning, template, go/no-go, coding draft, and risk test plan documents.
- The index defines reading order, document purpose, decision path, template / draft status, unpassed gates, and the current block on production implementation.
- Product code, OAuth routes, callback routes, login buttons, Prisma schema, and env were intentionally not changed.

## 2026-06-15 - Meta Business Login sandbox coding risk test plan

Status: documented only.

- Added `docs/meta-business-login-sandbox-coding-risk-test-plan.md` to define pre-coding risks and tests for internal-only routes, sandbox provider interface, state / nonce / code exchange, redacted logging, dry-run payloads, workspace allowlist, and production Channel write guards.
- The plan defines the minimum checklist required before sandbox coding can start and keeps the decision at Hold if any gate is incomplete.
- Product code, OAuth routes, callback routes, login buttons, Prisma schema, and env were intentionally not changed.

## 2026-06-15 - Meta Business Login sandbox coding spec draft

Status: documented only.

- Added `docs/meta-business-login-sandbox-coding-spec-draft.md` to define the pre-coding technical draft for an internal-only sandbox Meta Business Login prototype.
- The draft covers internal-only route behavior, sandbox provider interface, state / nonce / code exchange helpers, redacted logging, dry-run callback payloads, workspace allowlist rules, production Channel write guards, and the explicit boundary that production OAuth flow, callback, button, env, schema, ConnectedAccount, and Channel remain unchanged.
- Product code, OAuth routes, callback routes, login buttons, Prisma schema, and env were intentionally not changed.

## 2026-06-15 - Meta Business Login sandbox go/no-go checklist

Status: documented only.

- Added `docs/meta-business-login-sandbox-go-no-go-checklist.md` to define decision gates for sandbox coding, internal beta, and production implementation readiness.
- The checklist covers App Review, account selection UX, callback security, workspace linking, channel sync, redaction, rollback, and the differences between sandbox coding, internal beta, and production implementation gates.
- Product code, OAuth routes, callback routes, login buttons, Prisma schema, and env were intentionally not changed.

## 2026-06-15 - Meta Business Login sandbox experiment report template

Status: documented only.

- Added `docs/meta-business-login-sandbox-experiment-report-template.md` as the first blank report template for summarizing sandbox-only Meta Business Login experiment results.
- The template captures experiment summary, test matrix coverage, Meta dialog UX, callback / workspace linking / channel sync results, redaction search results, ManyChat UX proximity, App Review risk, and go / hold / no-go decision.
- Product code, OAuth routes, callback routes, login buttons, Prisma schema, and env were intentionally not changed.

## 2026-06-15 - Meta Business Login sandbox runbook template

Status: documented only.

- Added `docs/meta-business-login-sandbox-runbook-template.md` as the execution record template for sandbox-only Meta Business Login experiments.
- The template covers pre-test checks, Meta App Dashboard settings, redacted authorize URL / callback payload records, account selection UX observations, workspace linking / channel sync checks, redaction search results, and go / no-go decision gates.
- Product code, OAuth routes, callback routes, login buttons, Prisma schema, and env were intentionally not changed.

## 2026-06-15 - Meta Business Login sandbox implementation plan

Status: documented only.

- Added `docs/meta-business-login-sandbox-implementation-plan.md` to define a sandbox-only experiment plan before any product implementation.
- The plan keeps production `meta-instagram` unchanged and requires isolated sandbox provider ids, separate env planning, callback state / nonce / code exchange security, redacted logging, App Review gates, workspace linking validation, and rollback criteria.
- Product code, OAuth routes, callback routes, login buttons, Prisma schema, and env were intentionally not changed.

## 2026-06-15 - AI model cache refresh automation

- Operational check only: `npm run ai-models:refresh` passed on 2026-06-15.
- Remote provider cache result remained stable across all 6 workspaces: `chatgpt 10`, `gemini 7`, `deepseek 2`, `xai 2`.
- `codex_cli` and `antigravity_cli` were still absent from the refresh payload without throwing errors, matching the existing local CLI gating behavior noted in automation memory.

## 2026-06-15 - Meta Business Login ADR before implementation

Status: documented only.

- Added an ADR for evaluating Facebook Login for Business, Instagram Business Login, and keeping the current Instagram OAuth flow before any product implementation.
- Recommendation: proceed only with sandbox-only research / implementation planning, not production replacement.
- Required gates before production: App Review readiness, env isolation, callback state / nonce / code exchange review, ConnectedAccount / Channel mapping, workspace linking isolation, channel sync failure handling, and token / code / secret redaction verification.
- Product code, OAuth routes, callback routes, login buttons, and env were intentionally not changed.

## 2026-06-15：Meta Account Selection 測試矩陣

- 新增 `docs/meta-business-login-account-selection-test-matrix.md`，定義未登入、單一登入、多帳號 session、桌機 / 手機、popup / redirect transport 的測試矩陣。
- 後續建議先用矩陣測目前 `meta-instagram` baseline，再測 Facebook Login for Business / Instagram Business Login sandbox flow，最後再決定是否進入產品實作。

## 2026-06-15：Meta App Review Demo Script

- 新增 `docs/meta-business-login-app-review-demo-script.md`，補齊 Facebook Login for Business / Instagram Business Login 的 reviewer demo、permission usage table、資料使用方式與不通過 App Review 的備援方案。
- 下一步若繼續文件任務，建議建立 account selection 測試矩陣，記錄未登入、單一登入、多帳號 session 下 Meta dialog 畫面與 callback 結果。

## 2026-06-15：Business Login 實驗規格

- 新增 `docs/meta-business-login-experiment-spec.md`，定義 Facebook Login for Business / Instagram Business Login 的文件型研究任務與實驗範圍。
- 後續不應直接改正式 OAuth flow；應先用 sandbox-only provider 或文件化手動 URL 驗證 account selection、callback payload、workspace linking 與 App Review 需求。
- 下一步建議補 `docs/meta-business-login-app-review-demo-script.md`，把 reviewer demo、permission usage、資料使用位置與 redaction checklist 寫清楚。

## 2026-06-15：Meta Login 帳號選擇研究待辦

- 已新增 `docs/meta-login-account-selection-analysis.md`，記錄目前 Instagram OAuth、Facebook OAuth、legacy Meta Business Login 相容路徑與 ManyChat 差異。
- 後續建議：
  - 評估 Facebook Login for Business / Business Login for Instagram 是否可成為正式 account selection flow。
  - 在實驗分支測試 `force_reauth`、`force_authentication`、`enable_fb_login` 對不同瀏覽器 session 的實際效果。
  - 調整 UI 文案，避免承諾「一定能強制切換帳號」。
  - 若導入 login configuration / `config_id`，同步更新 Meta App Review 文件與 QA demo script。

更新日期：2026-06-10

## 目前驗證狀態

已執行：

```bash
git status
npm run lint
npm run build
npm test
npm run payuni:smoke
```

結果：

- `git status`：有本輪預期變更
- `npm run lint`：通過
- `npm run build`：通過
- `npm test`：第一次遇到既有 Vitest 子程序 crash，第二次完整通過
- `npm run payuni:smoke`：通過

補充：

- `npm run build` 仍有既有 Prisma engine DLL lock `EPERM` 噪音
- `scripts/prisma-generate-safe.mjs` 已 fallback 到既有 generated client，因此不構成 build failure

## Phase 0：正式販售前 blocker

### 任務 1：修正 billing interval 與 subscription correctness

狀態：`已完成`

檔案：

- `src/lib/billing/payment-service.ts`
- `src/app/api/billing/payuni/checkout/route.ts`
- `prisma/schema.prisma`
- `prisma/migrations/20260610113000_payment_order_interval/migration.sql`
- `tests/payuni-billing.test.ts`
- `tests/billing-checkout-route.test.ts`
- `src/lib/audit.ts`

完成內容：

- `PaymentOrder` 新增 `interval`
- checkout 建立 payment order 時保存實際 month / year
- completion 改用 `order.interval`
- zero-amount / credit-only checkout 改走 internal completion flow
- completion success / failure 補安全 audit
- 補 month / year / zero-amount / idempotency 測試

### 任務 2：production 移除 Meta env token fallback

狀態：`未完成`

檔案：

- `src/lib/channels/meta.ts`
- `src/app/api/webhooks/meta/route.ts`
- `src/lib/instagram/comments-sync.ts`
- `scripts/refresh-meta-token.mjs`

具體任務：

- production 停用 `META_*` env fallback
- 強制 channel token / account binding
- 補 tenant isolation regression tests

### 任務 3：收斂 Meta OAuth production 主流程

狀態：`未完成`

檔案：

- `src/app/api/meta/oauth/start/route.ts`
- `src/app/api/meta/oauth/callback/route.ts`
- `src/app/api/oauth/[provider]/authorize/route.ts`
- `src/app/api/oauth/[provider]/callback/route.ts`
- `src/lib/oauth/providers/meta-facebook.ts`
- `src/lib/oauth/providers/meta-instagram.ts`

具體任務：

- 收斂 generic / legacy callback 混線
- 明確定義 Page / IG Business Account 選擇與重連流程
- 補 reviewer / QA demo 支援文件

### 任務 4：整理 Billing / legal / README 亂碼與對外文案

狀態：`未完成`

檔案：

- `README.md`
- `docs/project-launch-checklist.md`
- `docs/environment-variables.md`
- `src/lib/billing/plans.ts`
- `src/app/billing/page.tsx`
- `src/app/privacy-policy/page.tsx`
- `src/app/terms-of-service/page.tsx`
- `src/app/data-deletion/page.tsx`

具體任務：

- 統一 UTF-8
- 補齊繁中對外文案
- 明確標示 sandbox / production / trial / refund / cancellation 說明

### Phase 0 驗證指令

```bash
npm run lint
npm run build
npm test
npm run payuni:smoke
```

## Phase 1：Beta 試賣必修

### 任務 1：補齊 plan enforcement

檔案：

- `src/lib/billing/entitlements.ts`
- `src/app/api/sequences/route.ts`
- `src/app/api/automations/route.ts`
- `src/app/api/broadcasts/route.ts`

具體任務：

- 補 `sequences`
- 補 `teamSeats`
- 補 `activeContacts`
- 補 usage summary 與 quota gate 一致性

### 任務 2：補 trial / expired / past_due / unpaid 產品行為

檔案：

- `src/lib/billing/usage-service.ts`
- `src/lib/billing/entitlements.ts`
- `src/app/billing/page.tsx`

### 任務 3：補 onboarding / reconnect UX

檔案：

- `src/app/channels/connect/social/page.tsx`
- `src/app/channels/connect/success/page.tsx`
- `src/app/channels/page.tsx`

### 任務 4：補 affiliate terms / refund policy / cookie policy

檔案：

- `src/app/**`
- `docs/**`

### Phase 1 驗證指令

```bash
npm run lint
npm run build
npm test
npm run test:e2e
```

## Phase 2：公開販售必修

### 任務 1：完成 Meta App Review / Advanced Access / Business Verification

檔案：

- `docs/meta-app-review-checklist.md`
- Meta Developer 後台設定

### 任務 2：完成 PayUNI production go-live

檔案：

- `src/app/api/billing/payuni/checkout/route.ts`
- deployment env / runbook

### 任務 3：補 affiliate anti-fraud / payout reconciliation

檔案：

- `src/lib/billing/referral-service.ts`
- `src/lib/billing/affiliate-service.ts`
- `src/app/api/admin/**`

### 任務 4：補 billing / webhook / admin observability

檔案：

- `src/lib/audit.ts`
- `src/app/api/**`
- `scripts/**`

### Phase 2 驗證指令

```bash
npm run lint
npm run build
npm test
npm run test:e2e
npm run payuni:smoke
```

## Phase 3：規模化優化

### 任務 1：高併發與 load test 收斂

檔案：

- `src/lib/queue.ts`
- `scripts/worker.ts`
- `src/lib/messages.ts`
- `src/lib/instagram/comments-sync.ts`
- `src/app/api/dashboard/route.ts`

### 任務 2：queue-first ingestion / durable processing

檔案：

- `src/lib/jobs.ts`
- `src/lib/queue.ts`
- `scripts/worker.ts`

### 任務 3：補齊正式 channel productization

檔案：

- `src/lib/channels/**`
- `src/app/channels/**`

### Phase 3 驗證指令

```bash
npm run lint
npm run build
npm test
npm run test:e2e
npm run load:test
```

## 下一個建議 Codex 任務

```text
請先閱讀 AGENTS.md、docs/product-readiness-review.md、docs/security-review.md、docs/meta-app-review-checklist.md、docs/billing-affiliate-readiness.md、docs/fix-roadmap.md，然後只修 Phase 0 任務 2：

1. 在 production 模式移除 Meta env token fallback
2. 保留 local / sandbox 開發可用性，但正式環境必須強制使用 channel token
3. 補 tenant isolation regression tests，覆蓋 webhook、comment sync、send message
4. 更新 docs/codex-session-log.md、docs/fix-roadmap.md、docs/security-review.md、docs/product-readiness-review.md

限制：
- 不要大重構
- 不要改 Meta OAuth 主流程
- 先列出風險
- 完成後跑 npm run lint、npm run build、npm test
```
