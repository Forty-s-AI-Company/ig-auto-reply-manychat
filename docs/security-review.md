# InboxPilot Security Review

## 2026-06-16 - Meta Business Login final permission proof matrix security note

Scope: documentation-only permission proof matrix.

- Added `docs/meta-business-login-final-permission-usage-proof-matrix.md`.
- The matrix separates current Instagram Business Login scopes, Facebook Login for Business / Page-linked candidate scopes, and Dashboard-generated candidate scopes.
- The matrix recommends keeping only the minimum proven Instagram Business Login candidate scopes before App Review and deferring / removing content publishing and insights until product proof exists.
- The matrix keeps token, authorization code, raw state, raw nonce, full callback URL, app secret, client secret, and webhook verify token out of docs, logs, audit records, screenshots, recordings, and browser-visible payloads.
- Existing production OAuth routes, callback routes, login buttons, env, Prisma schema, token storage, and production write paths were not changed.

## 2026-06-16 - Meta Business Login sandbox SBL-12 callback capture security note

Scope: sandbox-only callback capture helper and test.

- Added `src/lib/meta-business-sandbox-callback-capture.ts` and `tests/meta-business-login-sandbox-sbl12-callback-capture.test.ts`.
- The helper captures callback evidence with redacted code / state and hash-only references, requires explicit sandbox capture header, validates workspace allowlist and workspace match, and keeps token exchange / production writes disabled.
- Added `docs/meta-business-login-sandbox-controlled-callback-capture-plan.md` with production callback risk map and safe integration options.
- Existing production OAuth routes, callback routes, login buttons, env, Prisma schema, token storage, and production write paths were not changed.

## 2026-06-16 - Meta Business Login sandbox controlled callback prompt security note

Scope: next-step prompt for callback evidence safety.

- Added `docs/meta-business-login-sandbox-next-controlled-callback-prompt.md`.
- The prompt explicitly blocks blind OAuth retry before sandbox-only callback capture, redaction, state / workspace validation, and production write guards exist.
- It requires no raw token, authorization code, secret, raw state, raw nonce, full callback URL, cookie, localStorage, or sessionStorage in logs, docs, audit, response, or snapshots.
- Existing production OAuth routes, callback routes, login buttons, env, Prisma schema, token storage, and production write paths were not changed.

## 2026-06-16 - Meta Business Login sandbox OAuth profile selection security note

Scope: Instagram Business Login profile selection continuation.

- Added `docs/meta-business-login-sandbox-oauth-profile-selection-run-2026-06-16.md`.
- Selected `carry.digital.nomad` from the Instagram profile selection screen, then stopped after Instagram loaded the selected profile home page.
- No final OAuth consent, authorization code callback, token exchange, ConnectedAccount write, Channel write, webhook registration, or channel sync was intentionally triggered.
- No app secret, token, authorization code, raw state, raw nonce, full callback URL, password, OTP, cookie, local storage, or session storage was read or recorded.
- Existing production OAuth routes, callback routes, login buttons, env, Prisma schema, token storage, and production write paths were not changed.

## 2026-06-15 - Meta Business Login sandbox authenticated browser evidence security note

Scope: authenticated browser evidence collection.

- Added `docs/meta-business-login-sandbox-authenticated-browser-evidence-run-2026-06-15.md`.
- Captured Meta Dashboard and OAuth evidence without revealing app secret, token, authorization code, raw state, raw nonce, full callback URL, password, OTP, cookies, local storage, or session storage.
- Stopped before selecting an Instagram profile and before final OAuth authorization, so no production callback, ConnectedAccount write, Channel write, webhook registration, or channel sync occurred.
- Existing production OAuth routes, callback routes, login buttons, env, Prisma schema, token storage, and production write paths were not changed.

## 2026-06-15 - Meta Business Login sandbox browser evidence security note

Scope: browser-based external evidence attempt.

- Added `docs/meta-business-login-sandbox-browser-evidence-run-2026-06-15.md`.
- The in-app Browser reached Facebook login for Meta Developers but no credentials, OTP, token, authorization code, app secret, raw state, raw nonce, full callback URL, or browser storage was read or entered.
- Local internal sandbox routes returned 401 without an authenticated admin session, which confirms the internal route guard remains active.
- Existing production OAuth routes, callback routes, login buttons, env, Prisma schema, token storage, and production ConnectedAccount / Channel write paths were not changed.

## 2026-06-15 - Meta Business Login sandbox external evidence handoff security note

Scope: Chrome-based external evidence collection attempt.

- Chrome reached the Meta Developers Apps page, but automation was blocked by another Chrome extension UI before DOM inspection.
- No token, authorization code, secret, raw state, raw nonce, callback URL, app secret, or app dashboard secret was captured or written.
- Added `docs/meta-business-login-sandbox-external-evidence-handoff.md` to record the blocker and safe handoff steps.
- Existing production OAuth routes, callback routes, login buttons, env, Prisma schema, token storage, and production write paths were not changed.

## 2026-06-15 - Meta Business Login sandbox SBL-11 evidence packet security note

Scope: local dry-run evidence packet helper and tests.

- Added `src/lib/meta-business-sandbox-evidence.ts` to combine redacted internal authorize and callback dry-run payloads into a hash-only evidence packet.
- Added `tests/meta-business-login-sandbox-sbl11-evidence-packet.test.ts` to verify raw authorization code / state are not present, production write guard evidence is required, and production implementation remains No-Go.
- The helper does not call Meta, exchange real codes, store tokens, write audit records, register webhooks, sync channels, or create production ConnectedAccount / Channel records.
- Existing production OAuth routes, callback routes, login buttons, env, Prisma schema, token storage, and production write paths were not changed.

## 2026-06-15 - Meta Business Login sandbox production isolation security note

Scope: automated production isolation regression test.

- Added `tests/meta-business-login-sandbox-production-isolation.test.ts` to verify sandbox provider ids, sandbox helpers, and `/api/internal/oauth` are not referenced by existing production OAuth routes or UI entry points.
- The test verifies `prisma/schema.prisma` has no sandbox-specific Meta Business Login model or field additions.
- Existing production OAuth routes, callback routes, login buttons, env, Prisma schema, token storage, and production ConnectedAccount / Channel write paths were not changed.

## 2026-06-15 - Meta Business Login sandbox route integration security note

Scope: internal sandbox route helper-chain integration.

- Internal sandbox routes now include state / nonce redacted evidence, code exchange dry-run classification, dry-run callback evidence, workspace query spoofing rejection, and production write guard metadata.
- Route-level tests cover redacted authorize response, redacted callback response, sandbox header enforcement, unsupported provider blocking, and workspace spoofing rejection.
- Existing production OAuth routes, callback routes, login buttons, env, Prisma schema, token storage, and production write paths were not changed.

## 2026-06-15 - Meta Business Login sandbox SBL-06 to SBL-08 security note

Scope: SBL-06 dry-run payload, SBL-07 workspace allowlist, and SBL-08 production write guard.

- Added sandbox-only dry-run payload builder with redacted audit evidence and production write flags fixed to false.
- Added workspace allowlist guard that rejects missing workspace, non-allowlisted workspace, and query workspace spoofing.
- Added production write guard that blocks ConnectedAccount, Channel, webhook, sync, and token refresh operations.
- Existing production OAuth, callback routes, login buttons, env, Prisma schema, and production write paths were not changed.

## 2026-06-15 - Meta Business Login sandbox SBL-05 redaction security note

Scope: SBL-05 sandbox-only redacted logging helper.

- Added sandbox-only helper for redacting tokens, authorization codes, secrets, raw state, raw nonce, callback URLs, authorize URLs, and Meta asset ids.
- Added unsafe payload detection for raw sensitive fields and OAuth URLs.
- Production audit behavior, production logging format, existing OAuth routes, existing callback routes, env, Prisma schema, token storage, and production writes were not changed.

## 2026-06-15 - Meta Business Login sandbox SBL-04 code exchange security note

Scope: SBL-04 sandbox-only code exchange helper.

- Added sandbox-only code exchange helper that skips exchange by default and redacts code / token output.
- Targeted tests cover missing code, missing redirect URI, missing exchange client, redacted injected success output, and redacted injected failure output.
- Real Meta token exchange, env reads, token storage, existing OAuth flow, existing callback routes, Prisma schema, and production writes remain blocked.

## 2026-06-15 - Meta Business Login sandbox SBL-03 state nonce security note

Scope: SBL-03 sandbox-only state / nonce helpers.

- Added sandbox-only state / nonce helpers that store hash-only state and nonce references and provide redacted audit output.
- Targeted tests cover TTL expiration, single-use replay rejection, provider mismatch, workspace / user binding mismatch, state mismatch, and nonce mismatch.
- Existing production OAuth state helpers, callback routes, cookie format, env, Prisma schema, token handling, and production write paths were not changed.

## 2026-06-15 - Meta Business Login sandbox SBL-01 route skeleton security note

Scope: SBL-01 internal-only dry-run route skeleton.

- Added sandbox-only route skeletons under `/api/internal/oauth/[provider]/authorize` and `/api/internal/oauth/[provider]/callback`.
- Routes are blocked in production, require an authenticated admin user, require `x-inboxpilot-sandbox: sbl-01`, require sandbox provider ids, and require a hardcoded sandbox workspace allowlist.
- Authorize and callback responses are dry-run JSON only; they do not redirect to Meta, exchange authorization codes, store tokens, register webhooks, start sync, or create / update production ConnectedAccount or Channel records.
- Existing production OAuth routes, callback routes, login buttons, env, Prisma schema, and production write paths were not changed.

## 2026-06-15 - Meta Business Login sandbox SBL-09 test scaffold security note

Scope: SBL-09 targeted test scaffold only.

- Added test-only redaction assertions in `tests/helpers/sbl09-redaction.ts`; no production redaction helper or product runtime path was changed.
- Targeted tests validate safe fixture redaction, unsafe fixture detection, dry-run callback payload shape, raw callback / authorize URL rejection, and production write guard expectations.
- Production OAuth, callback routes, login buttons, env, Prisma schema, ConnectedAccount / Channel writes, webhook registration, channel sync, token refresh, and real Meta token exchange remain blocked.
- Targeted command passed: `npx vitest run tests/meta-business-login-sandbox-sbl09.test.ts`.

## 2026-06-15 - Meta Business Login sandbox SBL-09 coding readiness security note

Scope: documentation-only SBL-09 coding readiness checklist.

- The checklist allows only SBL-09 sandbox test scaffold coding and keeps SBL-01 route coding blocked until scaffold execution, redaction assertions, dry-run snapshots, production write guard tests, and runbook / report / go-no-go backfills exist.
- SBL-09 coding scope is constrained to test scaffold files, safe / unsafe fixtures, redaction assertions, dry-run callback payload snapshots, and production write guard tests.
- Existing production OAuth, callback routes, login buttons, env, Prisma schema, production ConnectedAccount / Channel writes, webhook registration, channel sync, token refresh, and real Meta token exchange remain blocked.
- No product code, OAuth route, callback route, login button, Prisma schema, or env change was made for this checklist.

## 2026-06-15 - Meta Business Login sandbox SBL-09 fixture redaction security note

Scope: documentation-only fixture and redaction assertion specification.

- The spec defines safe and unsafe fixture boundaries so negative redaction tests can exist without storing real Meta tokens, authorization codes, secrets, raw state, raw nonce, callback URLs, or reusable authorize URLs.
- Redaction assertions must inspect fixtures, snapshots, test output, logs, audit payloads, dry-run callback payloads, runbook entries, and report entries.
- Production write guard fixtures must prove sandbox dry-run paths cannot create or update production ConnectedAccount / Channel records, register production webhooks, start production sync, or schedule token refresh.
- No product code, OAuth route, callback route, login button, Prisma schema, or env change was made for this spec.

## 2026-06-15 - Meta Business Login sandbox SBL-09 test suite security note

Scope: documentation-only SBL-09 minimum test suite specification.

- The spec requires SBL-09 tests before SBL-01 route work, with coverage for auth, workspace allowlist, sandbox provider isolation, state / nonce, code exchange, redaction, dry-run payloads, and production write guards.
- Redaction requirements explicitly fail raw token, authorization code, secret, raw state, raw nonce, full callback URL, reusable authorize URL, and unmasked Meta asset ids.
- Production ConnectedAccount / Channel writes, production webhook registration, production token refresh, production OAuth changes, production callback changes, login button changes, and env changes remain blocked.
- No product code, OAuth route, callback route, login button, Prisma schema, or env change was made for this spec.

## 2026-06-15 - Meta Business Login sandbox coding kickoff security note

Scope: documentation-only kickoff checklist.

- The checklist requires SBL-09 test suite scaffold planning before SBL-01 route skeleton work, so redaction and dry-run test standards exist first.
- Internal-only, dry-run-first, and no-production-write checks remain mandatory; production ConnectedAccount / Channel writes, production env changes, and production OAuth changes remain blocked.
- Redaction search standards cover server log, audit log, browser console, response body, network URL, test snapshot, screenshot / recording, runbook, and report.
- No product code, OAuth route, callback route, login button, Prisma schema, or env change was made for this checklist.

## 2026-06-15 - Meta Business Login sandbox final readiness security note

Scope: documentation-only final readiness review.

- The readiness review keeps sandbox coding at Hold until go/no-go is explicitly marked and all coding constraints are accepted.
- Internal beta and production implementation remain No-Go because App Review, account selection UX, callback security, workspace linking, channel sync, redaction, and rollback gates lack execution evidence.
- Recommended first task is test suite scaffold planning to establish auth, allowlist, state / nonce, code exchange, redaction, dry-run payload, and production Channel write guard checks before route coding.
- No product code, OAuth route, callback route, login button, Prisma schema, or env change was made for this review.

## 2026-06-15 - Meta Business Login sandbox coding task breakdown security note

Scope: documentation-only coding task breakdown.

- Future coding tasks are constrained to internal-only, dry-run-first, sandbox provider only, workspace allowlist only, and production Channel write guard requirements.
- Each task includes explicit tests for auth, allowlist, state / nonce, server-side code exchange, redacted logging, dry-run payloads, workspace spoofing, and production Channel write blocking.
- The breakdown requires runbook / report / go-no-go backfill after each sandbox task and keeps production implementation blocked.
- No product code, OAuth route, callback route, login button, Prisma schema, or env change was made for this breakdown.

## 2026-06-15 - Meta Business Login sandbox doc index security note

Scope: documentation-only index and decision path.

- The index confirms production implementation remains blocked until App Review, account selection UX, callback security, workspace linking, channel sync, redaction, and rollback gates pass with evidence.
- Current allowed state remains documentation / planning only; any future coding must be internal-only, dry-run-first, sandbox provider only, workspace allowlist only, and must not create production Channel records.
- The index keeps token / code / secret / raw state / raw nonce / full callback URL redaction as an explicit gate before sandbox coding, internal beta, or production implementation.
- No product code, OAuth route, callback route, login button, Prisma schema, or env change was made for this index.

## 2026-06-15 - Meta Business Login sandbox coding risk test plan security note

Scope: documentation-only sandbox coding risk and test plan.

- The plan treats internal route exposure, provider id confusion, client-side code exchange, raw callback URL logging, workspace spoofing, and production Channel writes as high or critical risks.
- Minimum tests now cover state TTL / single-use, nonce mismatch, server-side code exchange, redacted logging, dry-run payload schema, workspace allowlist checks at authorize / callback / dry-run sync, and production Channel write guards.
- Any sensitive data finding or production Channel write risk keeps the project at Hold / No-Go before sandbox coding.
- No product code, OAuth route, callback route, login button, Prisma schema, or env change was made for this plan.

## 2026-06-15 - Meta Business Login sandbox coding spec security note

Scope: documentation-only pre-coding technical spec draft.

- The draft requires internal-only sandbox routes to validate user session, workspace allowlist, provider id, opaque state, nonce, and server-side code exchange before any dry-run result is produced.
- Redacted logging helpers must block access tokens, refresh tokens, authorization codes, app secrets, client secrets, webhook verify tokens, raw state, raw nonce, full callback URLs, reusable authorize URLs, and sensitive Meta API raw errors.
- Dry-run callback payloads must default to `wouldCreateChannel=false`, avoid production token storage, and block production ConnectedAccount / Channel writes.
- No product code, OAuth route, callback route, login button, Prisma schema, or env change was made for this draft.

## 2026-06-15 - Meta Business Login sandbox go/no-go security note

Scope: documentation-only go/no-go checklist.

- The checklist makes callback security, workspace linking isolation, channel sync safety, redaction, and rollback explicit gates before sandbox coding, internal beta, or production implementation.
- Any exposure of access token, refresh token, authorization code, app secret, client secret, webhook verify token, raw state, raw nonce, full callback URL, or reusable authorize URL is a Hold / No-Go condition until cleaned and retested.
- Production implementation remains blocked until App Review, account selection UX, callback security, tenant isolation, channel sync, redaction, and rollback gates all pass.
- No product code, OAuth route, callback route, login button, Prisma schema, or env change was made for this checklist.

## 2026-06-15 - Meta Business Login sandbox report security note

Scope: documentation-only experiment report template.

- The report template requires redacted evidence only and blocks raw token, authorization code, secret, raw state, raw nonce, full callback URL, and reusable authorize URL from being recorded.
- The go / hold / no-go decision requires callback security, workspace linking isolation, channel sync safety, production isolation, rollback readiness, and redaction search results.
- Any finding of sensitive data in logs, audit, browser console, network URLs, screenshots, screen recordings, App Review docs, runbook, or report must result in Hold or No-Go until cleaned and retested.
- No product code, OAuth route, callback route, login button, Prisma schema, or env change was made for this template.

## 2026-06-15 - Meta Business Login sandbox runbook security note

Scope: documentation-only runbook template.

- The runbook requires testers to record only redacted authorize URLs, redacted callback payloads, redacted asset ids, and safe error classifications.
- The runbook explicitly forbids storing access tokens, refresh tokens, authorization codes, client secrets, app secrets, raw state, raw nonce, full callback URLs, or reusable authorize URLs.
- Go / no-go gates require callback security, workspace linking isolation, channel sync safety, and redaction search results before any next sandbox step.
- No product code, OAuth route, callback route, login button, Prisma schema, or env change was made for this template.

## 2026-06-15 - Meta Business Login sandbox plan security note

Scope: documentation-only sandbox implementation plan.

- The sandbox plan requires opaque state, nonce validation, short TTL, single-use callback state, server-side code exchange, encrypted token storage, and workspace allowlist checks before any ConnectedAccount / Channel writes.
- Logs and audit entries must redact access tokens, refresh tokens, authorization codes, app secrets, client secrets, webhook verify tokens, raw state, raw nonce, and full callback URLs.
- Workspace linking remains a release gate: authenticated user, state workspace, provider id, selected Business / Page / IG account, and channel sync target must all match before beta or production rollout.
- No product code, OAuth route, callback route, login button, Prisma schema, or env change was made for this plan.

## 2026-06-15 - Meta Business Login ADR security note

Scope: documentation-only ADR for Facebook Login for Business / Instagram Business Login evaluation.

- Any sandbox-only experiment must redact access tokens, refresh tokens, authorization codes, client secrets, app secrets, and reusable callback URLs from console output, server logs, audit logs, screenshots, and documentation.
- Callback handling must validate state, nonce, expiry, authenticated user session, workspace ownership, and selected Business / Page / IG account before creating or updating ConnectedAccount / Channel records.
- Code exchange must remain server-side only; tokens must not be returned to the browser or persisted outside encrypted storage.
- No product code, OAuth route, callback route, login button, or env change was made for this ADR.

## 2026-06-15：Account Selection 測試矩陣安全補充

- 新增 `docs/meta-business-login-account-selection-test-matrix.md`，要求每個測試案例記錄 callback error classification、workspace isolation、channel sync 與 token redaction 檢查。
- 測試紀錄不得保存 raw token、authorization code、state raw value、client secret、app secret 或 webhook verify token。
- Workspace linking 驗證需確認 `workspaceId` 不來自 callback query，且 channel 建立 / 更新限制在目前 workspace。

## 2026-06-15：Meta Business Login App Review 安全補充

- 新增 `docs/meta-business-login-app-review-demo-script.md`，明確列出 token / authorization code / secret redaction checklist。
- Callback 安全要求：驗證 user、state、provider、workspace、flow type、TTL；成功與失敗都需清除 state；audit 僅記錄安全摘要。
- Workspace linking 安全要求：workspaceId 不得來自 callback query，channel 建立 / 更新必須限制 workspace，IG account identity 應以 `instagramBusinessAccountId` 或 `instagramOauthUserId` 判斷。
- 本次只更新文件，未修改 OAuth、callback、token 儲存、env 或產品功能程式碼。

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
## 2026-06-16 - Controlled Consent Run Security Result

Evidence file:

```text
docs/meta-business-login-sandbox-controlled-consent-run-2026-06-16.md
```

Security result:

- Production callback guard deployment probe returned redacted JSON evidence.
- Probe response did not include raw fake code, raw sandbox state marker, token, secret, or full callback URL.
- Instagram account selection and consent screens were observed.
- The user clicked allow on the Instagram consent screen.
- The callback response body returned `sandbox_callback_capture` redacted JSON.
- The callback response body did not include raw authorization code, raw state, token, secret, or full callback URL.
- `exchangeAttempted=false`.
- All production write flags were false.
- Workspace linking and channel sync remain unexercised.

Status:

```text
Callback guard: Pass
Account selection: Pass
Consent screen: Pass
Real callback evidence: Pass
Internal beta: Hold
Production implementation: No-Go
```

## 2026-06-16 - SBL-13 Workspace Linking / Channel Sync Dry-Run Security Result

Evidence file:

```text
docs/meta-business-login-sandbox-sbl13-workspace-linking-sync-dry-run.md
```

Security result:

- Redacted callback evidence maps only to sandbox workspace linking and channel sync drafts.
- ConnectedAccount draft keeps `wouldCreate=false` and `tokenStored=false`.
- Channel draft keeps `wouldCreate=false` and `syncMode=dry_run`.
- Channel sync dry-run keeps `wouldStart=false` and `tokenRequiredButNotPresent=true`.
- Production write guard blocks ConnectedAccount / Channel / webhook / sync / refresh operations.
- Tested payload does not contain raw authorization code, raw state, raw nonce, token, secret, full callback URL, or unmasked asset IDs.

Status:

```text
Workspace linking dry-run: Pass
Channel sync dry-run: Pass
Production write guard: Pass
Redaction: Pass
Internal beta: Hold
Production implementation: No-Go
```

## 2026-06-16 - Meta Business Login Sandbox Callback Capture Guard

Scope:

- Added a read-only sandbox capture guard to `src/app/api/meta/oauth/callback/route.ts`.
- The guard is only entered when `state` is a valid sandbox callback capture marker.
- Normal production OAuth callbacks keep the existing cookie-backed state validation and callback behavior.

Security properties:

- No Meta token exchange is attempted in sandbox capture mode.
- No app secret, client secret, access token, authorization code, raw state, or full callback URL is returned.
- No ConnectedAccount / Channel / webhook / channel sync / token refresh write is performed.
- The sandbox state marker is only a routing marker for redacted evidence, not a production OAuth trust boundary.

Validation:

```text
npx vitest run tests/meta-business-login-sandbox-sbl12-callback-capture.test.ts tests/meta-business-login-sandbox-sbl12-callback-route.test.ts
Result: 2 test files passed, 9 tests passed
```

Remaining hold:

- Real callback evidence is still missing.
- Workspace linking and channel sync remain dry-run only.
- Internal beta and production implementation remain blocked until App Review, UX, callback security, redaction, rollback, and workspace linking gates pass.
