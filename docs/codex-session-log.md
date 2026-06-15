# Codex Session Log

## 2026-06-16 - Meta Business Login Final App Review Package Assembly Checklist

Task:

- Create the final App Review package assembly checklist based on the final redaction search execution report template, reviewer recording shot list, and permission usage proof matrix.
- Only add / update documentation.
- Do not modify product code, OAuth flow, callback route, login button, env, Prisma schema, or Supabase migration state.

Files changed:

- `docs/meta-business-login-final-app-review-package-assembly-checklist.md`
- `docs/meta-business-login-final-app-review-demo-package-checklist.md`
- `docs/meta-business-login-sandbox-go-no-go-checklist.md`
- `docs/meta-app-review-checklist.md`
- `docs/security-review.md`
- `docs/fix-roadmap.md`
- `docs/codex-session-log.md`

Decision:

```text
Final App Review package assembly checklist: Draft complete
Actual App Review package assembled: Hold
Internal beta: Hold
Production implementation: No-Go
```

Validation:

```text
git status --short --branch
Result: master had docs-only working tree changes before commit.

git diff --check
Result: passed with Windows line-ending warnings only.

npx vitest run tests/meta-business-login-sandbox-sbl08.test.ts tests/meta-business-login-sandbox-sbl12-callback-capture.test.ts tests/meta-business-login-sandbox-sbl12-callback-route.test.ts tests/meta-business-login-sandbox-sbl13-workspace-linking-sync.test.ts
Result: 4 test files passed, 12 tests passed.

npm run lint
Result: passed.

npm run build
Result: passed. Existing Windows Prisma engine DLL lock fallback appeared and reused the existing generated client.

npm test
Result: not run locally because this task changed documentation only; targeted SBL tests plus lint/build passed.
```

Next suggested Codex Prompt:

```text
請根據 docs/meta-business-login-final-app-review-package-assembly-checklist.md、docs/meta-business-login-final-redaction-search-execution-report-template.md 與 docs/meta-business-login-final-reviewer-recording-shot-list.md，建立 Meta Business Login internal beta final preflight checklist。

請只新增 / 更新文件，不要改產品功能程式碼，不要改 OAuth flow，不要改 callback route，不要改登入按鈕，不要改 env，不要改 Prisma schema，不要執行 Supabase migration。

檔案路徑：
docs/meta-business-login-internal-beta-final-preflight-checklist.md

內容需包含：
1. App Review package assembly 是否完成
2. redaction report 是否 Pass
3. reviewer recording / screenshots / permission proof / test asset proof 是否 Pass
4. internal-only entry point / workspace allowlist / user admin role 是否 Pass
5. rollback / fallback 是否 Pass
6. 可以解除 internal beta Hold 的 go / hold 判定
7. production implementation 仍不可開始的原因

完成後執行 git status、targeted tests、npm run lint、npm run build，commit 並 push master。
```

## 2026-06-16 - Meta Business Login Final Redaction Search Execution Report Template

Task:

- Create the final redaction search execution report template based on the reviewer recording shot list, permission usage proof matrix, and final App Review demo package checklist.
- Only add / update documentation.
- Do not modify product code, OAuth flow, callback route, login button, env, or Prisma schema.

Files changed:

- `docs/meta-business-login-final-redaction-search-execution-report-template.md`
- `docs/meta-business-login-final-app-review-demo-package-checklist.md`
- `docs/meta-business-login-sandbox-go-no-go-checklist.md`
- `docs/meta-app-review-checklist.md`
- `docs/security-review.md`
- `docs/fix-roadmap.md`
- `docs/codex-session-log.md`

Decision:

```text
Final redaction search execution report template: Ready
Final redaction search executed: Hold
Internal beta: Hold
Production implementation: No-Go
```

Validation:

```text
git status --short --branch
Result: master had docs-only working tree changes before commit.

git diff --check
Result: passed with Windows line-ending warnings only.

npx vitest run tests/meta-business-login-sandbox-sbl08.test.ts tests/meta-business-login-sandbox-sbl12-callback-capture.test.ts tests/meta-business-login-sandbox-sbl12-callback-route.test.ts tests/meta-business-login-sandbox-sbl13-workspace-linking-sync.test.ts
Result: 4 test files passed, 12 tests passed.

npm run lint
Result: passed.

npm run build
Result: passed. Existing Windows Prisma engine DLL lock fallback appeared and reused the existing generated client.

npm test
Result: not run locally because this task changed documentation only; targeted SBL tests plus lint/build passed.
```

Next suggested Codex Prompt:

```text
請根據 docs/meta-business-login-final-redaction-search-execution-report-template.md、docs/meta-business-login-final-reviewer-recording-shot-list.md 與 docs/meta-business-login-final-permission-usage-proof-matrix.md，建立 Meta Business Login final App Review package assembly checklist。

請只新增 / 更新文件，不要改產品功能程式碼，不要改 OAuth flow，不要改 callback route，不要改登入按鈕，不要改 env，不要改 Prisma schema。

檔案路徑：
docs/meta-business-login-final-app-review-package-assembly-checklist.md

內容需包含：
1. final reviewer recording、screenshots、permission proof、redaction report、test asset proof 的打包清單
2. 每個檔案進 App Review package 前的 gate
3. 不可打包的檔案類型與敏感資料規則
4. Meta Dashboard scope reconciliation 檢查
5. internal beta 是否可解除 Hold 的條件
6. production implementation 仍不可開始的原因

完成後執行 git status、targeted tests、npm run lint、npm run build，commit 並 push master。
```

## 2026-06-16 - Meta Business Login Final Reviewer Recording Shot List

Task:

- Create the final reviewer recording shot list based on the permission usage proof matrix and final App Review demo package checklist.
- Only add / update documentation.
- Do not modify product code, OAuth flow, callback route, login button, env, or Prisma schema.

Files changed:

- `docs/meta-business-login-final-reviewer-recording-shot-list.md`
- `docs/meta-business-login-final-app-review-demo-package-checklist.md`
- `docs/meta-app-review-checklist.md`
- `docs/security-review.md`
- `docs/fix-roadmap.md`
- `docs/codex-session-log.md`

Decision:

```text
Final reviewer recording shot list: Draft complete
App Review readiness: Hold
Internal beta: Hold
Production implementation: No-Go
```

Validation:

```text
git status --short --branch
Result: master had docs-only working tree changes before commit.

git diff --check
Result: passed with Windows line-ending warnings only.

npx vitest run tests/meta-business-login-sandbox-sbl08.test.ts tests/meta-business-login-sandbox-sbl12-callback-capture.test.ts tests/meta-business-login-sandbox-sbl12-callback-route.test.ts tests/meta-business-login-sandbox-sbl13-workspace-linking-sync.test.ts
Result: 4 test files passed, 12 tests passed.

npm run lint
Result: passed.

npm run build
Result: passed. Existing Windows Prisma engine DLL lock fallback appeared and reused the existing generated client.

npm test
Result: not run locally because this task changed documentation only; targeted SBL tests plus lint/build passed.
```

Next suggested Codex Prompt:

```text
請根據 docs/meta-business-login-final-reviewer-recording-shot-list.md、docs/meta-business-login-final-permission-usage-proof-matrix.md 與 docs/meta-business-login-final-app-review-demo-package-checklist.md，建立 Meta Business Login final redaction search execution report template。

請只新增 / 更新文件，不要改產品功能程式碼，不要改 OAuth flow，不要改 callback route，不要改登入按鈕，不要改 env，不要改 Prisma schema。

檔案路徑：
docs/meta-business-login-final-redaction-search-execution-report-template.md

內容需包含：
1. App Review 文件、錄影、截圖、測試輸出、log、audit 的搜尋範圍
2. token / code / secret / raw state / raw nonce / full callback URL / unmasked asset ID 的搜尋指令
3. 允許的 false positive 規則
4. 每個 finding 的處理欄位
5. 清理後 retest 流程
6. internal beta 是否可解除 Hold 的判定
7. production implementation 仍不可開始的原因

完成後執行 git status、targeted tests、npm run lint、npm run build，commit 並 push master。
```

## 2026-06-16 - Meta Business Login Final Permission Usage Proof Matrix

任務目標：

- 根據 final App Review demo package checklist，建立 Meta Business Login final permission usage proof matrix。
- 只新增 / 更新文件，不修改產品功能程式碼、OAuth flow、callback route、登入按鈕、env 或 Prisma schema。

修改內容：

- 新增 `docs/meta-business-login-final-permission-usage-proof-matrix.md`。
- 回填 `docs/meta-business-login-final-app-review-demo-package-checklist.md`。
- 回填 `docs/meta-business-login-sandbox-go-no-go-checklist.md`。
- 回填 `docs/meta-app-review-checklist.md`。
- 回填 `docs/security-review.md`。
- 回填 `docs/fix-roadmap.md`。
- 回填 `docs/codex-session-log.md`。

目前結論：

```text
Permission usage proof matrix: Draft complete
Core Instagram Business Login scopes: candidate keep
instagram_business_content_publish: Defer / Remove
instagram_business_manage_insights: Defer / Remove
Facebook Login for Business scopes: Hold pending selected-flow reconciliation
App Review readiness: Hold
Internal beta: Hold
Production implementation: No-Go
```

驗證：

```text
git status --short --branch
Result: master had docs-only working tree changes before commit.

git diff --check
Result: passed with Windows line-ending warnings only.

npx vitest run tests/meta-business-login-sandbox-sbl08.test.ts tests/meta-business-login-sandbox-sbl12-callback-capture.test.ts tests/meta-business-login-sandbox-sbl12-callback-route.test.ts tests/meta-business-login-sandbox-sbl13-workspace-linking-sync.test.ts
Result: 4 test files passed, 12 tests passed.

npm run lint
Result: passed.

npm run build
Result: passed. Existing Windows Prisma engine DLL lock fallback appeared and reused the existing generated client.

npm test
Result: not run; this task changed documentation only and targeted SBL tests plus lint/build passed.
```

下一個建議 Codex Prompt：

```text
請根據 docs/meta-business-login-final-permission-usage-proof-matrix.md 與 docs/meta-business-login-final-app-review-demo-package-checklist.md，建立 Meta Business Login final reviewer recording shot list。

請只新增 / 更新文件，不要改產品功能程式碼，不要改 OAuth flow，不要改 callback route，不要改登入按鈕，不要改 env，不要改 Prisma schema。

檔案路徑：
docs/meta-business-login-final-reviewer-recording-shot-list.md

內容需包含：
1. 每個 permission 對應要錄到的畫面
2. 每段錄影的操作步驟
3. 必須遮蔽或不可出現的資訊
4. Business / Page / IG account selection 的畫面需求
5. Inbox / comment automation / channel detail 的畫面需求
6. redacted callback evidence 的呈現方式
7. workspace linking / channel sync dry-run evidence 的呈現方式
8. App Review 提交前的 final redaction search checklist
9. internal beta 是否可解除 Hold 的條件
10. production implementation 仍不可開始的原因

完成後執行 git status、targeted tests、npm run lint、npm run build，commit 並 push master。
```

## 2026-06-16 - Meta Business Login sandbox SBL-12 callback capture helper

Task:

- Inspect current production Instagram / Meta callback risk points.
- Add sandbox-only callback capture helper and tests.
- Do not modify production OAuth flow, callback routes, login buttons, env, Prisma schema, token storage, or production writes.

Files changed:

- `src/lib/meta-business-sandbox-callback-capture.ts`
- `tests/meta-business-login-sandbox-sbl12-callback-capture.test.ts`
- `docs/meta-business-login-sandbox-controlled-callback-capture-plan.md`
- `docs/meta-business-login-sandbox-sbl12-callback-capture-test-command.md`
- `docs/meta-business-login-sandbox-go-no-go-checklist.md`
- `docs/meta-business-login-sandbox-runbook-template.md`
- `docs/meta-business-login-sandbox-experiment-report-template.md`
- `docs/meta-app-review-checklist.md`
- `docs/security-review.md`
- `docs/fix-roadmap.md`
- `docs/codex-session-log.md`

Validation:

- `npx vitest run tests/meta-business-login-sandbox-sbl12-callback-capture.test.ts`: passed, 5 tests.
- `npx vitest run tests/meta-business-login-sandbox-production-isolation.test.ts tests/meta-business-login-sandbox-sbl01-route.test.ts tests/meta-business-login-sandbox-sbl01.test.ts tests/meta-business-login-sandbox-sbl03.test.ts tests/meta-business-login-sandbox-sbl04.test.ts tests/meta-business-login-sandbox-sbl05.test.ts tests/meta-business-login-sandbox-sbl06.test.ts tests/meta-business-login-sandbox-sbl07.test.ts tests/meta-business-login-sandbox-sbl08.test.ts tests/meta-business-login-sandbox-sbl09.test.ts tests/meta-business-login-sandbox-sbl11-evidence-packet.test.ts tests/meta-business-login-sandbox-sbl12-callback-capture.test.ts`: passed, 49 tests.
- `npm run lint`: passed.
- `npm run build`: passed with exit code 0. The existing Prisma engine DLL lock fallback message appeared and reused the generated client.

Decision:

- Callback capture helper: Pass.
- Production callback route integration: Hold.
- Real callback evidence: Hold.
- Internal beta: Hold.
- Production implementation: No-Go.

## 2026-06-16 - Meta Business Login sandbox next controlled callback prompt

Task:

- Answer why the next suggested prompt was missing.
- Add a copyable next-step prompt for controlled callback capture preparation.
- Keep the next step blocked from blindly retrying OAuth against the production callback.

Files changed:

- `docs/meta-business-login-sandbox-next-controlled-callback-prompt.md`
- `docs/fix-roadmap.md`
- `docs/meta-business-login-sandbox-go-no-go-checklist.md`
- `docs/meta-business-login-sandbox-implementation-final-report.md`
- `docs/meta-app-review-checklist.md`
- `docs/security-review.md`
- `docs/codex-session-log.md`

Decision:

- The next safe task is controlled callback capture design and guard preparation.
- Do not retry the Instagram Business Login OAuth URL until sandbox-only callback capture or equivalent production-safe controls exist.
- Internal beta remains Hold.
- Production implementation remains No-Go.

## 2026-06-16 - Meta Business Login sandbox OAuth profile selection

Task:

- Continue from the Instagram Business Login forced login page in the in-app Browser.
- Observe account selection behavior and stop before any production callback or final OAuth authorization.

Files changed:

- `docs/meta-business-login-sandbox-oauth-profile-selection-run-2026-06-16.md`
- `docs/meta-business-login-sandbox-go-no-go-checklist.md`
- `docs/meta-business-login-sandbox-runbook-template.md`
- `docs/meta-business-login-sandbox-experiment-report-template.md`
- `docs/meta-business-login-sandbox-implementation-final-report.md`
- `docs/meta-app-review-checklist.md`
- `docs/security-review.md`
- `docs/fix-roadmap.md`
- `docs/codex-session-log.md`

Validation / observations:

- Instagram Business Login forced login screen was visible.
- Clicking `使用 Facebook 帳號登入` showed IG profile selection with `ling.yun.energy`, `carry.digital.nomad`, and `使用其他個人檔案`.
- Selected `carry.digital.nomad`.
- Instagram loaded the selected profile's home page.
- No final OAuth consent screen, authorization code callback, production ConnectedAccount write, production Channel write, webhook registration, or channel sync was intentionally triggered.

## 2026-06-15 - Meta Business Login sandbox authenticated browser evidence

Task:

- Continue after the in-app Browser was authenticated into Meta Developers.
- Capture read-only evidence for InboxPilot App Dashboard, Instagram API setup, Instagram Business Login URL, business login settings, permissions, and account selection UX.
- Stop before selecting an Instagram profile and before final OAuth authorization.

Files changed:

- `docs/meta-business-login-sandbox-authenticated-browser-evidence-run-2026-06-15.md`
- `docs/meta-business-login-sandbox-browser-evidence-run-2026-06-15.md`
- `docs/meta-business-login-sandbox-implementation-final-report.md`
- `docs/meta-business-login-sandbox-go-no-go-checklist.md`
- `docs/meta-business-login-sandbox-runbook-template.md`
- `docs/fix-roadmap.md`
- `docs/security-review.md`
- `docs/meta-app-review-checklist.md`
- `docs/codex-session-log.md`

Validation / observations:

- Meta Apps page showed InboxPilot app id `924285843989683`, live mode, and business `零元兄弟`.
- InboxPilot Dashboard showed no required actions, rate limit 0% used, and Instagram / Pages / Messenger use cases.
- Instagram API setup showed Instagram app name `manychat-auto-reply-IG`, app id `1530009762118735`, and app secret masked by Meta UI.
- Meta-provided Instagram Business Login URL includes `force_reauth=true`, `response_type=code`, callback URL redacted, and Instagram Business scopes.
- Business login settings showed redirect, deauthorize callback, and data deletion request fields configured; values redacted.
- Permissions table showed required messaging permissions as testable, while content publish / insights were shown as addable.
- Instagram OAuth flow showed login form and then IG profile account selection after Facebook login.
- No final OAuth authorization or callback was completed.

## 2026-06-15 - Meta Business Login sandbox browser evidence run

Task:

- Continue into browser-based external evidence collection.
- Attempt to open Meta Developers and record whether Meta App Dashboard / account selection evidence can be collected.
- Do not enter credentials, OTP, token, authorization code, app secret, raw state, raw nonce, full callback URL, or inspect browser storage.

Files changed:

- `docs/meta-business-login-sandbox-browser-evidence-run-2026-06-15.md`
- `docs/meta-business-login-sandbox-implementation-final-report.md`
- `docs/meta-business-login-sandbox-go-no-go-checklist.md`
- `docs/meta-business-login-sandbox-runbook-template.md`
- `docs/fix-roadmap.md`
- `docs/security-review.md`
- `docs/meta-app-review-checklist.md`
- `docs/codex-session-log.md`

Validation / observations:

- Local dev server health check: passed, status 200.
- In-app Browser could not navigate directly to the internal API route due `net::ERR_BLOCKED_BY_CLIENT`.
- HTTP guard check for internal authorize route: 401 dry-run `unauthorized` without authenticated admin session.
- HTTP guard check for internal callback route with sandbox header: 401 dry-run `unauthorized` without authenticated admin session.
- Meta Developers redirected to Facebook login; no authenticated Meta developer session was available.
- No Meta dialog, account selection UX, real callback, reviewer demo, or App Dashboard evidence was captured.

## 2026-06-15 - Meta Business Login sandbox external evidence retry blocker

Task:

- Retry Chrome-based Meta Developers Apps evidence collection after the user asked Codex to continue.
- Keep the attempt read-only and do not treat blocked page access as App Review evidence.

Result:

- Chrome listed the Meta Developers Apps tab at `https://developers.facebook.com/apps/`.
- Claiming the latest Meta Developers Apps tab and reading the DOM was still blocked by another Chrome extension UI.
- No Meta App Dashboard, Meta dialog, account selection UX, callback, or App Review evidence was collected.
- Production implementation remains No-Go.

## 2026-06-15 - Meta Business Login sandbox external evidence handoff

Task:

- Attempt Chrome-based Meta Developers Apps evidence collection.
- Record blocker state without treating it as App Review evidence.
- Do not capture or store token, authorization code, secret, raw state, raw nonce, callback URL, app secret, or app dashboard secret.

Files changed:

- `docs/meta-business-login-sandbox-external-evidence-handoff.md`
- `docs/meta-business-login-sandbox-implementation-final-report.md`
- `docs/meta-app-review-checklist.md`
- `docs/security-review.md`
- `docs/fix-roadmap.md`
- `docs/codex-session-log.md`

Result:

- Chrome reached `https://developers.facebook.com/apps/`.
- Page title observed: `所有應用程式 - Meta for Developers`.
- Automation could not inspect the page DOM because another Chrome extension UI was blocking the page.
- No App Review evidence was collected.

Resume result:

- Chrome automation later could list and claim Meta-related tabs again.
- Safe metadata remained limited to `所有應用程式 - Meta for Developers` at `https://developers.facebook.com/apps/`.
- DOM snapshot, page evaluate, and screenshot attempts against the Meta Apps page timed out.
- Direct navigation to the Business Login settings URL redirected back to `https://developers.facebook.com/apps/`.
- No App Dashboard settings, Business Login settings, permission status, App Review status, Meta dialog UX, account selection UX, or callback evidence was collected.

## 2026-06-15 - Meta Business Login sandbox SBL-11 evidence packet

Task:

- Add a local dry-run evidence packet helper for sandbox execution preparation.
- Validate that redacted authorize / callback evidence can be packaged without raw code, raw state, production writes, or production implementation approval.
- Do not call Meta, exchange real codes, store tokens, modify production OAuth, modify callback routes, modify login buttons, modify env, modify Prisma schema, or write production ConnectedAccount / Channel records.

Files changed:

- `src/lib/meta-business-sandbox-evidence.ts`
- `tests/meta-business-login-sandbox-sbl11-evidence-packet.test.ts`
- `docs/meta-business-login-sandbox-sbl11-evidence-packet-test-command.md`
- `docs/meta-business-login-sandbox-implementation-final-report.md`
- `docs/fix-roadmap.md`
- `docs/security-review.md`
- `docs/meta-app-review-checklist.md`
- `docs/codex-session-log.md`

Validation:

- `npx vitest run tests/meta-business-login-sandbox-sbl11-evidence-packet.test.ts`: passed, 3 tests.
- `npx vitest run tests/meta-business-login-sandbox-production-isolation.test.ts tests/meta-business-login-sandbox-sbl01-route.test.ts tests/meta-business-login-sandbox-sbl01.test.ts tests/meta-business-login-sandbox-sbl03.test.ts tests/meta-business-login-sandbox-sbl04.test.ts tests/meta-business-login-sandbox-sbl05.test.ts tests/meta-business-login-sandbox-sbl06.test.ts tests/meta-business-login-sandbox-sbl07.test.ts tests/meta-business-login-sandbox-sbl08.test.ts tests/meta-business-login-sandbox-sbl09.test.ts tests/meta-business-login-sandbox-sbl11-evidence-packet.test.ts`: passed, 44 tests.
- `npm run lint`: passed.
- `npm run build`: passed with exit code 0. The existing Prisma engine DLL lock fallback message appeared and reused the generated client.

## 2026-06-15 - Meta Business Login sandbox production isolation regression

Task:

- Add an automated regression test that proves sandbox-only Meta Business Login code remains isolated from production OAuth, UI entry points, and Prisma schema.
- Do not modify production OAuth flow, existing callback routes, login buttons, env, Prisma schema, token storage, or production write paths.

Files changed:

- `tests/meta-business-login-sandbox-production-isolation.test.ts`
- `docs/meta-business-login-sandbox-production-isolation-test-command.md`
- `docs/meta-business-login-sandbox-implementation-final-report.md`
- `docs/fix-roadmap.md`
- `docs/security-review.md`
- `docs/meta-app-review-checklist.md`
- `docs/codex-session-log.md`

Validation:

- `npx vitest run tests/meta-business-login-sandbox-production-isolation.test.ts`: passed, 4 tests.
- `npx vitest run tests/meta-business-login-sandbox-production-isolation.test.ts tests/meta-business-login-sandbox-sbl01-route.test.ts tests/meta-business-login-sandbox-sbl01.test.ts tests/meta-business-login-sandbox-sbl03.test.ts tests/meta-business-login-sandbox-sbl04.test.ts tests/meta-business-login-sandbox-sbl05.test.ts tests/meta-business-login-sandbox-sbl06.test.ts tests/meta-business-login-sandbox-sbl07.test.ts tests/meta-business-login-sandbox-sbl08.test.ts tests/meta-business-login-sandbox-sbl09.test.ts`: passed, 41 tests.
- `npm run lint`: passed.
- `npm run build`: passed with exit code 0. The existing Prisma engine DLL lock fallback message appeared and reused the generated client.
- `git diff --check`: passed with Windows line ending warnings only.
- `npm test`: timed out after 244 seconds; targeted SBL tests passed and no targeted SBL failure was observed before timeout.

## 2026-06-15 - Meta Business Login sandbox route helper integration

Task:

- Integrate internal sandbox routes with the SBL-03 to SBL-08 helper chain.
- Add route-level assertions for state / nonce evidence, code exchange dry-run evidence, workspace spoofing rejection, and production write guard metadata.
- Do not modify production OAuth flow, existing callback routes, login buttons, env, Prisma schema, token storage, or production write paths.

Files changed:

- `src/lib/meta-business-sandbox.ts`
- `src/app/api/internal/oauth/[provider]/authorize/route.ts`
- `src/app/api/internal/oauth/[provider]/callback/route.ts`
- `tests/meta-business-login-sandbox-sbl01-route.test.ts`
- `docs/meta-business-login-sandbox-implementation-final-report.md`
- `docs/fix-roadmap.md`
- `docs/security-review.md`
- `docs/meta-app-review-checklist.md`
- `docs/codex-session-log.md`

Validation:

- `npx vitest run tests/meta-business-login-sandbox-sbl01-route.test.ts`: passed, 5 tests.
- `npx vitest run tests/meta-business-login-sandbox-sbl01.test.ts tests/meta-business-login-sandbox-sbl03.test.ts tests/meta-business-login-sandbox-sbl04.test.ts tests/meta-business-login-sandbox-sbl05.test.ts tests/meta-business-login-sandbox-sbl06.test.ts tests/meta-business-login-sandbox-sbl07.test.ts tests/meta-business-login-sandbox-sbl08.test.ts tests/meta-business-login-sandbox-sbl09.test.ts`: passed, 32 tests.
- `git diff --check`: passed with Windows line ending warnings only.
- `npm run lint`: passed.
- `npm run build`: passed with exit code 0. The existing Prisma engine DLL lock fallback message appeared and reused the generated client.
- `npm test`: not run; targeted SBL route integration tests were executed successfully.

## 2026-06-15 - Meta Business Login sandbox implementation final report

Task:

- Create SBL-10 final consolidation report.
- Confirm sandbox coding is complete for internal-only dry-run scaffold.
- Keep internal beta and production implementation blocked.

Files changed:

- `docs/meta-business-login-sandbox-implementation-final-report.md`
- `docs/fix-roadmap.md`
- `docs/codex-session-log.md`

Validation:

- `npx vitest run tests/meta-business-login-sandbox-sbl06.test.ts tests/meta-business-login-sandbox-sbl07.test.ts tests/meta-business-login-sandbox-sbl08.test.ts tests/meta-business-login-sandbox-sbl05.test.ts tests/meta-business-login-sandbox-sbl04.test.ts tests/meta-business-login-sandbox-sbl03.test.ts tests/meta-business-login-sandbox-sbl01.test.ts tests/meta-business-login-sandbox-sbl01-route.test.ts tests/meta-business-login-sandbox-sbl09.test.ts`: passed, 36 tests.
- `git diff --check`: passed with Windows line ending warnings only.
- `npm run lint`: passed.
- `npm run build`: passed with exit code 0. The existing Prisma engine DLL lock fallback message appeared and reused the generated client.
- `npm test`: not run; targeted SBL tests cover the sandbox implementation scaffold.

## 2026-06-15 - Meta Business Login sandbox SBL-06 to SBL-08 helpers

Task:

- Create SBL-06 dry-run callback payload builder, SBL-07 workspace allowlist guard, and SBL-08 production write guard.
- Add targeted tests and test command documentation.
- Do not modify existing OAuth flow, callback routes, login buttons, env, Prisma schema, production ConnectedAccount, or production Channel records.

Files changed:

- `src/lib/meta-business-sandbox-dry-run.ts`
- `src/lib/meta-business-sandbox-allowlist.ts`
- `src/lib/meta-business-sandbox-write-guard.ts`
- `tests/meta-business-login-sandbox-sbl06.test.ts`
- `tests/meta-business-login-sandbox-sbl07.test.ts`
- `tests/meta-business-login-sandbox-sbl08.test.ts`
- `docs/meta-business-login-sandbox-sbl06-08-test-command.md`
- `docs/meta-business-login-sandbox-runbook-template.md`
- `docs/meta-business-login-sandbox-experiment-report-template.md`
- `docs/meta-business-login-sandbox-go-no-go-checklist.md`
- `docs/meta-business-login-sandbox-coding-risk-test-plan.md`
- `docs/security-review.md`
- `docs/fix-roadmap.md`
- `docs/meta-app-review-checklist.md`
- `docs/codex-session-log.md`

Validation:

- `npx vitest run tests/meta-business-login-sandbox-sbl06.test.ts tests/meta-business-login-sandbox-sbl07.test.ts tests/meta-business-login-sandbox-sbl08.test.ts`: passed, 6 tests.
- `npx vitest run tests/meta-business-login-sandbox-sbl05.test.ts tests/meta-business-login-sandbox-sbl04.test.ts tests/meta-business-login-sandbox-sbl03.test.ts tests/meta-business-login-sandbox-sbl01.test.ts tests/meta-business-login-sandbox-sbl01-route.test.ts tests/meta-business-login-sandbox-sbl09.test.ts`: passed, 30 tests.
- `git diff --check`: passed with Windows line ending warnings only.
- `npm run lint`: passed.
- `npm run build`: passed with exit code 0. The existing Prisma engine DLL lock fallback message appeared and reused the generated client.
- `npm test`: not run; targeted SBL tests were executed successfully.

## 2026-06-15 - Meta Business Login sandbox SBL-05 redacted logging helper

Task:

- Create SBL-05 sandbox-only redacted logging helper.
- Add helper tests and test command documentation.
- Do not change production audit behavior, production logging format, existing OAuth flow, existing callback routes, env, Prisma schema, token storage, or production write paths.

Files changed:

- `src/lib/meta-business-sandbox-redaction.ts`
- `tests/meta-business-login-sandbox-sbl05.test.ts`
- `docs/meta-business-login-sandbox-sbl05-test-command.md`
- `docs/meta-business-login-sandbox-runbook-template.md`
- `docs/meta-business-login-sandbox-experiment-report-template.md`
- `docs/meta-business-login-sandbox-go-no-go-checklist.md`
- `docs/meta-business-login-sandbox-coding-risk-test-plan.md`
- `docs/security-review.md`
- `docs/fix-roadmap.md`
- `docs/meta-app-review-checklist.md`
- `docs/codex-session-log.md`

Validation:

- `npx vitest run tests/meta-business-login-sandbox-sbl05.test.ts`: passed, 4 tests.
- `npx vitest run tests/meta-business-login-sandbox-sbl04.test.ts tests/meta-business-login-sandbox-sbl03.test.ts tests/meta-business-login-sandbox-sbl01.test.ts tests/meta-business-login-sandbox-sbl01-route.test.ts tests/meta-business-login-sandbox-sbl09.test.ts`: passed, 26 tests.
- `git diff --check`: passed with Windows line ending warnings only.
- `npm run lint`: passed.
- `npm run build`: passed with exit code 0. The existing Prisma engine DLL lock fallback message appeared and reused the generated client.
- `npm test`: not run yet; targeted SBL tests were executed first.

## 2026-06-15 - Meta Business Login sandbox SBL-04 code exchange helper

Task:

- Create SBL-04 sandbox-only code exchange helper.
- Add helper tests and test command documentation.
- Do not call Meta token endpoint by default, read env, store tokens, modify existing OAuth, modify existing callback routes, modify Prisma schema, or write production records.

Files changed:

- `src/lib/meta-business-sandbox-code-exchange.ts`
- `tests/meta-business-login-sandbox-sbl04.test.ts`
- `docs/meta-business-login-sandbox-sbl04-test-command.md`
- `docs/meta-business-login-sandbox-runbook-template.md`
- `docs/meta-business-login-sandbox-experiment-report-template.md`
- `docs/meta-business-login-sandbox-go-no-go-checklist.md`
- `docs/meta-business-login-sandbox-coding-risk-test-plan.md`
- `docs/security-review.md`
- `docs/fix-roadmap.md`
- `docs/meta-app-review-checklist.md`
- `docs/codex-session-log.md`

Validation:

- `npx vitest run tests/meta-business-login-sandbox-sbl04.test.ts`: passed, 5 tests.
- `npx vitest run tests/meta-business-login-sandbox-sbl03.test.ts tests/meta-business-login-sandbox-sbl01.test.ts tests/meta-business-login-sandbox-sbl01-route.test.ts tests/meta-business-login-sandbox-sbl09.test.ts`: passed, 21 tests.
- `git diff --check`: passed with Windows line ending warnings only.
- `npm run lint`: passed.
- `npm run build`: passed with exit code 0. The existing Prisma engine DLL lock fallback message appeared and reused the generated client.
- `npm test`: not run; targeted SBL tests were executed successfully.

## 2026-06-15 - Meta Business Login sandbox SBL-03 state nonce helpers

Task:

- Create SBL-03 sandbox-only state / nonce helpers.
- Add helper tests and test command documentation.
- Do not modify existing OAuth state helpers, callback routes, cookies, env, Prisma schema, token handling, or production write paths.

Files changed:

- `src/lib/meta-business-sandbox-state.ts`
- `tests/meta-business-login-sandbox-sbl03.test.ts`
- `docs/meta-business-login-sandbox-sbl03-test-command.md`
- `docs/meta-business-login-sandbox-runbook-template.md`
- `docs/meta-business-login-sandbox-experiment-report-template.md`
- `docs/meta-business-login-sandbox-go-no-go-checklist.md`
- `docs/meta-business-login-sandbox-coding-risk-test-plan.md`
- `docs/security-review.md`
- `docs/fix-roadmap.md`
- `docs/meta-app-review-checklist.md`
- `docs/codex-session-log.md`

Validation:

- `npx vitest run tests/meta-business-login-sandbox-sbl03.test.ts`: passed, 4 tests.
- `npx vitest run tests/meta-business-login-sandbox-sbl01.test.ts tests/meta-business-login-sandbox-sbl01-route.test.ts`: passed, 10 tests.
- `npx vitest run tests/meta-business-login-sandbox-sbl09.test.ts`: passed, 7 tests.
- `git diff --check`: passed with Windows line ending warnings only.
- `npm run lint`: passed.
- `npm run build`: passed with exit code 0. The existing Prisma engine DLL lock fallback message appeared and reused the generated client.
- `npm test`: not run; targeted SBL-03 / SBL-01 / SBL-09 tests were executed successfully.

## 2026-06-15 - Meta Business Login sandbox SBL-01 internal route skeleton

Task:

- Create SBL-01 internal-only dry-run route skeleton.
- Add sandbox helper, internal authorize route, internal callback route, SBL-01 helper tests, SBL-01 route tests, and SBL-01 test command documentation.
- Do not modify existing OAuth flow, existing callback routes, login buttons, Prisma schema, env, or production ConnectedAccount / Channel writes.

Files changed:

- `src/lib/meta-business-sandbox.ts`
- `src/app/api/internal/oauth/[provider]/authorize/route.ts`
- `src/app/api/internal/oauth/[provider]/callback/route.ts`
- `tests/meta-business-login-sandbox-sbl01.test.ts`
- `tests/meta-business-login-sandbox-sbl01-route.test.ts`
- `docs/meta-business-login-sandbox-sbl01-test-command.md`
- `docs/meta-business-login-sandbox-runbook-template.md`
- `docs/meta-business-login-sandbox-experiment-report-template.md`
- `docs/meta-business-login-sandbox-go-no-go-checklist.md`
- `docs/meta-business-login-sandbox-coding-risk-test-plan.md`
- `docs/security-review.md`
- `docs/fix-roadmap.md`
- `docs/meta-app-review-checklist.md`
- `docs/codex-session-log.md`

Validation:

- `npx vitest run tests/meta-business-login-sandbox-sbl01.test.ts`: passed, 6 tests.
- `npx vitest run tests/meta-business-login-sandbox-sbl01-route.test.ts`: passed, 4 tests.
- `npx vitest run tests/meta-business-login-sandbox-sbl09.test.ts`: passed, 7 tests.
- `git diff --check`: passed with Windows line ending warnings only.
- `npm run lint`: passed.
- `npm run build`: passed with exit code 0. The existing Prisma engine DLL lock fallback message appeared and reused the generated client.
- `npm test`: not run; targeted SBL-01 and SBL-09 tests were executed successfully.

## 2026-06-15 - Meta Business Login sandbox SBL-09 test scaffold coding

Task:

- Create SBL-09 sandbox test scaffold only.
- Add fixture directory, safe and unsafe fixture examples, redaction assertion helper, dry-run callback payload snapshot tests, production write guard tests, and test command documentation.
- Backfill runbook, experiment report, go/no-go checklist, coding risk test plan, security review, fix roadmap, Meta App Review checklist, and session log.
- Do not modify product code, OAuth flow, callback routes, login buttons, Prisma schema, or env.

Files changed:

- `tests/helpers/sbl09-redaction.ts`
- `tests/fixtures/sbl09/safe/sbl09.callback.valid-dry-run.expected-redacted.fixture.json`
- `tests/fixtures/sbl09/safe/sbl09.write-guard.channel-create-blocked.safe.fixture.json`
- `tests/fixtures/sbl09/unsafe/sbl09.redaction.raw-code.unsafe.fixture.json`
- `tests/meta-business-login-sandbox-sbl09.test.ts`
- `docs/meta-business-login-sandbox-sbl09-test-command.md`
- `docs/meta-business-login-sandbox-runbook-template.md`
- `docs/meta-business-login-sandbox-experiment-report-template.md`
- `docs/meta-business-login-sandbox-go-no-go-checklist.md`
- `docs/meta-business-login-sandbox-coding-risk-test-plan.md`
- `docs/security-review.md`
- `docs/fix-roadmap.md`
- `docs/meta-app-review-checklist.md`
- `docs/codex-session-log.md`

Validation:

- `npx vitest run tests/meta-business-login-sandbox-sbl09.test.ts`: passed, 7 tests.
- `git status`: docs plus SBL-09 test scaffold files changed; no product code changed.
- `npm run lint`: passed.
- `npm run build`: passed with exit code 0. The existing Prisma engine DLL lock fallback message appeared and reused the generated client.
- `npm test`: not run; this SBL-09 task added targeted scaffold tests, and the targeted Vitest command was executed successfully.

## 2026-06-15 - Meta Business Login sandbox SBL-09 coding readiness checklist

Task:

- Create a documentation-only SBL-09 sandbox coding readiness checklist.
- Include required documents, test suite readiness, fixture / redaction readiness, dry-run callback snapshot readiness, production write guard fixture readiness, redaction search readiness, SBL-09 go / hold decision, and explicit SBL-01 / internal beta / production blocks.
- Do not modify product code, OAuth flow, callback routes, login buttons, Prisma schema, or env.

Files changed:

- `docs/meta-business-login-sandbox-sbl09-coding-readiness-checklist.md`
- `docs/fix-roadmap.md`
- `docs/security-review.md`
- `docs/meta-app-review-checklist.md`
- `docs/codex-session-log.md`

Validation:

- `git status`: only documentation files changed.
- `npm run lint`: passed.
- `npm run build`: passed with exit code 0. The existing Prisma engine DLL lock fallback message appeared and reused the generated client.
- `npm test`: not run; documentation-only task covered by lint/build verification.

## 2026-06-15 - Meta Business Login sandbox SBL-09 fixture redaction spec

Task:

- Create a documentation-only SBL-09 sandbox test fixture and redaction assertion specification.
- Include fixture naming, safe and unsafe fixture examples, forbidden raw token / code / secret / state / nonce / callback URL rules, redaction assertions, dry-run callback payload snapshots, production write guard fixtures, search standards, and required runbook / report / go-no-go backfills.
- Do not modify product code, OAuth flow, callback routes, login buttons, Prisma schema, or env.

Files changed:

- `docs/meta-business-login-sandbox-sbl09-fixture-redaction-spec.md`
- `docs/fix-roadmap.md`
- `docs/security-review.md`
- `docs/meta-app-review-checklist.md`
- `docs/codex-session-log.md`

Validation:

- `git status`: only documentation files changed.
- `npm run lint`: passed.
- `npm run build`: passed with exit code 0. The existing Prisma engine DLL lock fallback message appeared and reused the generated client.
- `npm test`: not run; documentation-only task covered by lint/build verification.

## 2026-06-15 - Meta Business Login sandbox SBL-09 test suite spec

Task:

- Create a documentation-only SBL-09 sandbox coding minimum test suite specification.
- Include test goals and production boundaries, internal-only route tests, workspace allowlist tests, state / nonce / code exchange tests, redacted logging tests, dry-run callback payload tests, production write guard tests, and required runbook / report / go-no-go backfills.
- Do not modify product code, OAuth flow, callback routes, login buttons, Prisma schema, or env.

Files changed:

- `docs/meta-business-login-sandbox-sbl09-test-suite-spec.md`
- `docs/fix-roadmap.md`
- `docs/security-review.md`
- `docs/meta-app-review-checklist.md`
- `docs/codex-session-log.md`

Validation:

- `git status`: only documentation files changed.
- `npm run lint`: passed.
- `npm run build`: passed with exit code 0. The existing Prisma engine DLL lock fallback message appeared and reused the generated client.
- `npm test`: not run; documentation-only task covered by lint/build verification.

## 2026-06-15 - Meta Business Login sandbox coding kickoff checklist

Task:

- Create a documentation-only sandbox coding kickoff checklist.
- Include SBL-09 and SBL-01 prerequisite documents and gates, internal-only / dry-run-first / no-production-write checks, redaction search standards, required document backfills, and internal beta / production blocks.
- Do not modify product code, OAuth flow, callback routes, login buttons, Prisma schema, or env.

Files changed:

- `docs/meta-business-login-sandbox-coding-kickoff-checklist.md`
- `docs/fix-roadmap.md`
- `docs/security-review.md`
- `docs/meta-app-review-checklist.md`
- `docs/codex-session-log.md`

Validation:

- `git status`: only documentation files changed.
- `npm run lint`: passed.
- `npm run build`: passed with exit code 0. The existing Prisma engine DLL lock fallback message appeared and reused the generated client.
- `npm test`: not run; documentation-only task covered by lint/build verification.

## 2026-06-15 - Meta Business Login sandbox final readiness review

Task:

- Create a documentation-only final readiness review before Meta Business Login sandbox coding.
- Include sandbox document completeness, sandbox coding readiness, missing execution evidence, gate status, recommended first coding task, and internal beta / production implementation blocks.
- Do not modify product code, OAuth flow, callback routes, login buttons, Prisma schema, or env.

Files changed:

- `docs/meta-business-login-sandbox-final-readiness-review.md`
- `docs/fix-roadmap.md`
- `docs/security-review.md`
- `docs/meta-app-review-checklist.md`
- `docs/codex-session-log.md`

Validation:

- `git status`: only documentation files changed.
- `npm run lint`: passed.
- `npm run build`: passed with exit code 0. The existing Prisma engine DLL lock fallback message appeared and reused the generated client.
- `npm test`: not run; documentation-only task covered by lint/build verification.

## 2026-06-15 - Meta Business Login sandbox coding task breakdown

Task:

- Create a documentation-only task breakdown for future Meta Business Login sandbox coding.
- Include internal-only / dry-run-first task breakdown, prerequisite gates, test requirements, prohibited files / flows, evidence backfill requirements, and production implementation block.
- Do not modify product code, OAuth flow, callback routes, login buttons, Prisma schema, or env.

Files changed:

- `docs/meta-business-login-sandbox-coding-task-breakdown.md`
- `docs/fix-roadmap.md`
- `docs/security-review.md`
- `docs/meta-app-review-checklist.md`
- `docs/codex-session-log.md`

Validation:

- `git status`: only documentation files changed.
- `npm run lint`: passed.
- `npm run build`: passed with exit code 0. The existing Prisma engine DLL lock fallback message appeared and reused the generated client.
- `npm test`: not run; documentation-only task covered by lint/build verification.

## 2026-06-15 - Meta Business Login sandbox document index

Task:

- Create a documentation-only index and decision path for all Meta Business Login sandbox documents.
- Include document purpose, reading order, research-to-coding decision path, template / draft status, unpassed gates, and current production implementation block.
- Do not modify product code, OAuth flow, callback routes, login buttons, Prisma schema, or env.

Files changed:

- `docs/meta-business-login-sandbox-doc-index.md`
- `docs/fix-roadmap.md`
- `docs/security-review.md`
- `docs/meta-app-review-checklist.md`
- `docs/codex-session-log.md`

Validation:

- `git status`: only documentation files changed.
- `npm run lint`: passed.
- `npm run build`: passed with exit code 0. The existing Prisma engine DLL lock fallback message appeared and reused the generated client.
- `npm test`: not run; documentation-only task covered by lint/build verification.

## 2026-06-15 - Meta Business Login sandbox coding risk test plan

Task:

- Create a documentation-only sandbox coding risk assessment and test plan.
- Include internal-only route risks, sandbox provider interface risks, state / nonce / code exchange tests, redacted logging tests, dry-run callback payload tests, workspace allowlist tests, production Channel write guard tests, and the minimum checklist before sandbox coding can start.
- Do not modify product code, OAuth flow, callback routes, login buttons, Prisma schema, or env.

Files changed:

- `docs/meta-business-login-sandbox-coding-risk-test-plan.md`
- `docs/fix-roadmap.md`
- `docs/security-review.md`
- `docs/meta-app-review-checklist.md`
- `docs/codex-session-log.md`

Validation:

- `git status`: only documentation files changed.
- `npm run lint`: passed.
- `npm run build`: passed with exit code 0. The existing Prisma engine DLL lock fallback message appeared and reused the generated client.
- `npm test`: not run; documentation-only task covered by lint/build verification.

## 2026-06-15 - Meta Business Login sandbox coding spec draft

Task:

- Create a documentation-only pre-coding technical spec draft for Meta Business Login sandbox.
- Include internal-only route draft, sandbox provider interface, state / nonce / code exchange helpers, redacted logging, dry-run callback payload, workspace allowlist, production Channel write guards, and unchanged production OAuth / callback / button / env boundaries.
- Do not modify product code, OAuth flow, callback routes, login buttons, Prisma schema, or env.

Files changed:

- `docs/meta-business-login-sandbox-coding-spec-draft.md`
- `docs/fix-roadmap.md`
- `docs/security-review.md`
- `docs/meta-app-review-checklist.md`
- `docs/codex-session-log.md`

Validation:

- `git status`: only documentation files changed.
- `npm run lint`: passed.
- `npm run build`: passed with exit code 0. The existing Prisma engine DLL lock fallback message appeared and reused the generated client.
- `npm test`: not run; documentation-only task covered by lint/build verification.

## 2026-06-15 - Meta Business Login sandbox go/no-go checklist

Task:

- Create a documentation-only Meta Business Login sandbox go/no-go checklist.
- Include App Review, account selection UX, callback security, workspace linking, channel sync, redaction, rollback, and stage differences for sandbox coding, internal beta, and production implementation.
- Do not modify product code, OAuth flow, callback routes, login buttons, Prisma schema, or env.

Files changed:

- `docs/meta-business-login-sandbox-go-no-go-checklist.md`
- `docs/fix-roadmap.md`
- `docs/security-review.md`
- `docs/meta-app-review-checklist.md`
- `docs/codex-session-log.md`

Validation:

- `git status`: only documentation files changed.
- `npm run lint`: passed.
- `npm run build`: passed with exit code 0. The existing Prisma engine DLL lock fallback message appeared and reused the generated client.
- `npm test`: not run; documentation-only task covered by lint/build verification.

## 2026-06-15 - Meta Business Login sandbox experiment report template

Task:

- Create a documentation-only blank experiment report template for sandbox-only Meta Business Login results.
- Include experiment summary, test combinations, Meta dialog UX, callback / workspace linking / channel sync, redaction search, ManyChat UX proximity, App Review risks, and go / hold / no-go decision.
- Do not modify product code, OAuth flow, callback routes, login buttons, Prisma schema, or env.

Files changed:

- `docs/meta-business-login-sandbox-experiment-report-template.md`
- `docs/fix-roadmap.md`
- `docs/security-review.md`
- `docs/meta-app-review-checklist.md`
- `docs/codex-session-log.md`

Validation:

- `git status`: only documentation files changed.
- `npm run lint`: passed.
- `npm run build`: passed with exit code 0. The existing Prisma engine DLL lock fallback message appeared and reused the generated client.
- `npm test`: not run; documentation-only task covered by lint/build verification.

## 2026-06-15 - Meta Business Login sandbox runbook template

Task:

- Report current progress.
- Create a documentation-only runbook template for sandbox-only Meta Business Login experiments.
- Do not modify product code, OAuth flow, callback routes, login buttons, Prisma schema, or env.

Files changed:

- `docs/meta-business-login-sandbox-runbook-template.md`
- `docs/fix-roadmap.md`
- `docs/security-review.md`
- `docs/meta-app-review-checklist.md`
- `docs/codex-session-log.md`

Validation:

- `git status`: only documentation files changed.
- `npm run lint`: passed.
- `npm run build`: passed with exit code 0. The existing Prisma engine DLL lock fallback message appeared and reused the generated client.
- `npm test`: not run; documentation-only task covered by lint/build verification.

## 2026-06-15 - Meta Business Login sandbox implementation plan

Task:

- Create a documentation-only sandbox implementation plan for Facebook Login for Business / Instagram Business Login.
- Define provider naming, env planning, authorize URL, callback state / nonce / code exchange, ConnectedAccount / Channel mapping, App Review gates, redaction checks, rollback, and production boundaries.
- Do not modify product code, OAuth flow, callback routes, login buttons, Prisma schema, or env.

Files changed:

- `docs/meta-business-login-sandbox-implementation-plan.md`
- `docs/fix-roadmap.md`
- `docs/security-review.md`
- `docs/meta-app-review-checklist.md`
- `docs/codex-session-log.md`

Validation:

- `git status`: only documentation files changed.
- `npm run lint`: passed.
- `npm run build`: passed with exit code 0. The existing Prisma engine DLL lock fallback message appeared and reused the generated client.
- `npm test`: not run; documentation-only task covered by lint/build verification.

## 2026-06-15 - AI model cache refresh automation

Task:

- Run `npm run ai-models:refresh` in the workspace.
- Report refreshed model counts for ChatGPT, Gemini, DeepSeek, xAI, Codex CLI, and Antigravity CLI.

Files changed:

- `docs/codex-session-log.md`
- `docs/fix-roadmap.md`

Validation:

- `npm run ai-models:refresh`: passed.

Notes:

- All 6 workspaces refreshed the same remote provider counts: `chatgpt 10`, `gemini 7`, `deepseek 2`, `xai 2`.
- `codex_cli` and `antigravity_cli` did not appear in the refresh result and did not throw errors, consistent with prior runs where local CLI providers were skipped by provider-availability guards.
- No product code, schema, env, or OAuth / billing / webhook flow was changed.

## 2026-06-15 - Meta Business Login pre-implementation ADR

Task:

- Read the project and Meta login research docs.
- Create a documentation-only ADR for evaluating Facebook Login for Business, Instagram Business Login, and keeping the current Instagram OAuth flow.
- Do not modify product code, OAuth flow, callback routes, login buttons, or env.

Files changed:

- `docs/adr-meta-business-login-before-implementation.md`
- `docs/fix-roadmap.md`
- `docs/security-review.md`
- `docs/meta-app-review-checklist.md`
- `docs/codex-session-log.md`

Validation:

- `git status`: only documentation files changed.
- `npm run lint`: passed.
- `npm run build`: passed with exit code 0. The existing Prisma engine DLL lock fallback message appeared and reused the generated client.
- `npm test`: not run; documentation-only task covered by lint/build verification.

## 2026-06-15：Meta Account Selection 測試矩陣

- 本次任務目標：只新增 / 更新文件，建立 `docs/meta-business-login-account-selection-test-matrix.md`，定義未登入、單一登入、多帳號 session、桌機 / 手機、popup / redirect transport、callback 結果、workspace linking / channel sync 與 ManyChat UX 判定標準。
- 修改檔案：
  - `docs/meta-business-login-account-selection-test-matrix.md`
  - `docs/fix-roadmap.md`
  - `docs/meta-app-review-checklist.md`
  - `docs/security-review.md`
  - `docs/codex-session-log.md`
- 驗證：
  - `git status`：僅有文件變更。
  - `npm run lint`：通過。
  - `npm run build`：通過；出現既有 Prisma engine DLL lock fallback 訊息，但指令 exit code 為 0。
  - `npm test`：未執行；本次為純文件任務，已完成 lint / build 驗證。
- 限制：
  - 未修改產品功能程式碼。
  - 未修改 OAuth flow、callback route、登入按鈕或 env。

## 2026-06-15：Meta Business Login App Review Demo Script

- 本次任務目標：只新增 / 更新文件，產出 `docs/meta-business-login-app-review-demo-script.md`，補齊 reviewer demo、permission usage table、資料使用位置、redaction checklist、callback / workspace linking / channel sync 安全重點與 App Review 備援方案。
- 修改檔案：
  - `docs/meta-business-login-app-review-demo-script.md`
  - `docs/meta-app-review-checklist.md`
  - `docs/security-review.md`
  - `docs/fix-roadmap.md`
  - `docs/codex-session-log.md`
- 驗證：
  - `git status`：僅有文件變更。
  - `npm run lint`：通過。
  - `npm run build`：通過；出現既有 Prisma engine DLL lock fallback 訊息，但指令 exit code 為 0。
  - `npm test`：未執行；本次為純文件任務，已完成 lint / build 驗證。
- 限制：
  - 未修改產品功能程式碼。
  - 未修改 OAuth flow、callback route、登入按鈕或 env。

## 2026-06-15：Business Login 研究規格文件

- 本次任務目標：依 `docs/meta-login-account-selection-analysis.md` 建立只做文件與實驗規格的研究任務，評估 Facebook Login for Business / Instagram Business Login 是否能取代目前 Instagram OAuth。
- 修改檔案：
  - `docs/meta-business-login-experiment-spec.md`
  - `docs/meta-app-review-checklist.md`
  - `docs/fix-roadmap.md`
  - `docs/codex-session-log.md`
- 驗證：
  - `git status`：僅有文件變更。
  - `npm run lint`：通過。
  - `npm run build`：通過；出現既有 Prisma engine DLL lock fallback 訊息，但指令 exit code 為 0。
  - `npm test`：未執行；本次為純文件與研究規格任務，已完成 lint / build 驗證。
- 限制：
  - 未修改產品功能程式碼。
  - 未修改 OAuth flow、callback route、登入按鈕或 env。

## 2026-06-15：Meta / Instagram 帳號選擇分析

- 本次任務目標：只做文件分析，不修改產品功能程式碼；確認 InboxPilot 目前 Meta / Instagram OAuth 帳號連接流程、authorize URL、帳號切換限制與 ManyChat 差異。
- 修改檔案：
  - `docs/meta-login-account-selection-analysis.md`
  - `docs/codex-session-log.md`
  - `docs/fix-roadmap.md`
- 驗證：
  - `git status`：僅有文件變更。
  - `npm run lint`：通過。
  - `npm run build`：通過。
  - `npm test`：未執行；本次為純文件分析任務，且已完成 lint / build 驗證。
- 風險記錄：
  - 目前無功能程式碼變更。
  - 分析指出帳號切換不能由 `auth_type=reauthenticate` 或 `auth_type=rerequest` 穩定保證。
  - 若要接近 ManyChat UX，後續需評估 Facebook Login for Business / Business Login for Instagram。

更新日期：2026-06-10

## 用途

這份文件用來記錄每一輪 Codex 任務實際做了什麼、驗證到哪裡、還剩什麼風險，避免下一輪接手的人只看到 commit，卻不知道那些坑是填平了還是只是蓋上地毯。

## 建議格式

每一筆記錄至少包含：

- 本次任務目標
- 修改檔案
- 驗證結果
- 仍存風險
- 下一個建議任務

## Session 記錄

### 2026-06-10：建立 Codex 工作規則與交接文件

- 本次任務目標：
  - 建立 `AGENTS.md`
  - 建立 `docs/codex-session-log.md`
- 修改檔案：
  - `AGENTS.md`
  - `docs/codex-session-log.md`
- 驗證結果：
  - 文件建立成功
- 仍存風險：
  - 若之後任務不持續更新 session log，文件會再次過期
- 下一個建議任務：
  - 建立正式 product / security / Meta / billing review 文件

### 2026-06-10：完成 code-level readiness review 文件

- 本次任務目標：
  - 以實際程式碼為主做可販售 SaaS 等級 review
  - 建立 readiness review 文件
- 修改檔案：
  - `docs/product-readiness-review.md`
  - `docs/security-review.md`
  - `docs/meta-app-review-checklist.md`
  - `docs/billing-affiliate-readiness.md`
  - `docs/fix-roadmap.md`
  - `docs/codex-session-log.md`
- 驗證結果：
  - `git status` 已檢查
  - `npm run lint` 通過
  - `npm run build` 通過
- 仍存風險：
  - billing interval、zero-amount subscription、Meta env token fallback、對外頁面亂碼仍未修
- 下一個建議任務：
  - 進入 Phase 0，先修 billing correctness

### 2026-06-10：完成 Phase 0 任務 1 - billing interval 與 subscription correctness

- 本次任務目標：
  - 修正 `completePaidPaymentOrder()` 將 interval 寫死為 `month`
  - 讓 zero-amount / credit-only checkout 走正式 completion flow
  - 補齊 month / year / zero-amount / idempotency 測試
- 修改檔案：
  - `prisma/schema.prisma`
  - `prisma/migrations/20260610113000_payment_order_interval/migration.sql`
  - `src/lib/audit.ts`
  - `src/lib/billing/payment-service.ts`
  - `src/app/api/billing/payuni/checkout/route.ts`
  - `tests/payuni-billing.test.ts`
  - `tests/billing-checkout-route.test.ts`
  - `docs/product-readiness-review.md`
  - `docs/security-review.md`
  - `docs/billing-affiliate-readiness.md`
  - `docs/fix-roadmap.md`
  - `docs/codex-session-log.md`
- 驗證結果：
  - `npm run lint` 通過
  - `npm run build` 通過
  - `npm test` 第一次遇到既有 Vitest 子程序 crash，第二次完整通過
  - `npm run payuni:smoke` 通過
- 仍存風險：
  - PayUNI production 開關與 merchant review 仍未完成
  - Meta env token fallback 仍未移除
  - Billing / legal / README 亂碼與對外文案仍未整理
- 下一個建議任務：
  - 進入 Phase 0 任務 2，production 模式移除 Meta env token fallback
## 2026-06-16 - Meta Business Login Sandbox SBL-12 Callback Capture Guard

任務目標：

- 在不進行真實 Meta token exchange、不寫入 production ConnectedAccount / Channel、不改登入按鈕、不改 env、不改 Prisma schema 的前提下，讓目前已註冊的 Instagram callback 可以安全捕捉 redacted callback evidence。

修改內容：

- 新增 signed sandbox callback capture state marker。
- 在 production Meta callback route 加入極窄的 read-only sandbox guard；只有 state 是 sandbox capture marker 時才會早退回 redacted JSON。
- 一般 production OAuth callback 沒有 sandbox marker 時，仍走原本 callback 邏輯。
- 新增 helper 與 route targeted tests。
- 更新 SBL-12、security、App Review、runbook、report、go/no-go、roadmap 文件。

驗證：

```text
npx vitest run tests/meta-business-login-sandbox-sbl12-callback-capture.test.ts tests/meta-business-login-sandbox-sbl12-callback-route.test.ts
Result: 2 test files passed, 9 tests passed

npx vitest run tests/meta-business-login-sandbox-production-isolation.test.ts tests/meta-business-login-sandbox-sbl01-route.test.ts tests/meta-business-login-sandbox-sbl01.test.ts tests/meta-business-login-sandbox-sbl03.test.ts tests/meta-business-login-sandbox-sbl04.test.ts tests/meta-business-login-sandbox-sbl05.test.ts tests/meta-business-login-sandbox-sbl06.test.ts tests/meta-business-login-sandbox-sbl07.test.ts tests/meta-business-login-sandbox-sbl08.test.ts tests/meta-business-login-sandbox-sbl09.test.ts tests/meta-business-login-sandbox-sbl11-evidence-packet.test.ts tests/meta-business-login-sandbox-sbl12-callback-capture.test.ts tests/meta-business-login-sandbox-sbl12-callback-route.test.ts
Result: 13 test files passed, 53 tests passed

npm run lint
Result: passed

npm run build
Result: passed; Prisma generate reported a local Windows DLL lock and reused the existing generated client.

npm test
Result: timed out after 184 seconds before a complete result was returned.
```

Gate：

- Callback capture helper: Pass
- Signed-state route guard: Pass
- Real callback evidence: Hold
- Workspace linking: Hold
- Channel sync: Hold
- Internal beta: Hold
- Production implementation: No-Go

CI follow-up:

- GitHub Actions CI failed because workflow still used `DATABASE_URL=file:./dev.db`.
- `scripts/run-tests.mjs` now requires PostgreSQL for `npm test`.
- Updated `.github/workflows/ci.yml` to run a PostgreSQL service and provide `TEST_DATABASE_URL` / `TEST_DIRECT_URL`.

Production deploy / browser follow-up:

- CI passed after PostgreSQL service update.
- Production deploy completed with Vercel.
- Production callback probe returned redacted JSON evidence and did not expose fake code or raw sandbox state marker.
- Controlled Instagram OAuth browser run observed account/profile selection with `carry.digital.nomad`, `ling.yun.energy`, and use-another-profile.
- Controlled browser run reached Instagram consent screen without `force_reauth=true`.
- Codex stopped before clicking allow because that action grants app permissions to the Instagram account.
- User clicked allow on the Instagram consent screen.
- Codex verified the callback response body as `sandbox_callback_capture` redacted JSON.
- Callback response body had redacted code/state/callback URL markers, hash markers present, `errorType=null`, `exchangeAttempted=false`, and all production write flags false.
- Raw leak check on the response body passed for authorization code, state marker, token, secret, and full callback URL patterns.
- Real callback evidence: Pass.
- Workspace linking and channel sync: Hold.

下一步建議 Codex Prompt：

```text
請繼續執行 Meta Business Login sandbox SBL-12 controlled browser callback capture。

限制：
1. 不要改 OAuth flow。
2. 不要改登入按鈕。
3. 不要改 env。
4. 不要改 Prisma schema。
5. 不要建立或更新 production ConnectedAccount / Channel。
6. 不要做真實 Meta token exchange。
7. 只能使用 signed sandbox callback capture marker 取得 redacted evidence。

請根據：
- docs/meta-business-login-sandbox-controlled-callback-capture-plan.md
- docs/meta-business-login-sandbox-sbl12-callback-capture-test-command.md
- docs/meta-business-login-sandbox-runbook-template.md
- docs/meta-business-login-sandbox-experiment-report-template.md
- docs/meta-business-login-sandbox-go-no-go-checklist.md

執行一次受控瀏覽器 OAuth callback capture，僅記錄 redacted JSON evidence，不得記錄 raw code、raw state、raw nonce、full callback URL、token、secret。

完成後請回填 runbook / report / go-no-go checklist / security-review / fix-roadmap / codex-session-log，並執行 git status、targeted tests、npm run lint、npm run build。
```
## 2026-06-16 - Latest Meta Business Login Sandbox Next Prompt

```text
請繼續執行 Meta Business Login sandbox workspace linking / channel sync dry-run validation。

目前狀態：
1. production callback guard 已部署。
2. Instagram Business Login account selection 已通過。
3. consent screen 已到達。
4. 使用者已手動按 allow。
5. callback response 已確認為 sandbox_callback_capture redacted JSON。
6. exchangeAttempted=false。
7. productionWrites 全部為 false。

請只做 sandbox-only / dry-run-first 驗證，不要改正式登入按鈕，不要改 env，不要改 Prisma schema，不要做真實 Meta token exchange，不要建立或更新 production ConnectedAccount / Channel。

請完成：
1. 建立或使用既有 dry-run workspace linking evidence 格式。
2. 驗證 callback evidence 如何映射到 sandbox provider / workspace / channel draft。
3. 驗證 channel sync dry-run payload 不含 token / code / secret / raw state / full callback URL。
4. 驗證 production write guard 仍阻擋 ConnectedAccount / Channel 寫入。
5. 回填 runbook / experiment report / go-no-go checklist / security-review / fix-roadmap / codex-session-log。
6. 執行 targeted tests、npm run lint、npm run build。
7. commit 並 push master。
```

## 2026-06-16 - Meta Business Login Sandbox SBL-13 Workspace Linking / Channel Sync Dry-Run

任務目標：

- 使用已 redacted 的 `sandbox_callback_capture` evidence，驗證 workspace linking / channel sync 只能形成 sandbox dry-run draft，不建立或更新 production ConnectedAccount / Channel。

修改內容：

- 新增 `src/lib/meta-business-sandbox-workspace-linking.ts`。
- 新增 `tests/meta-business-login-sandbox-sbl13-workspace-linking-sync.test.ts`。
- 新增 `docs/meta-business-login-sandbox-sbl13-workspace-linking-sync-dry-run.md`。
- 回填 runbook / experiment report / go-no-go checklist / security-review / fix-roadmap / codex-session-log。

驗證結果：

```text
npx vitest run tests/meta-business-login-sandbox-sbl13-workspace-linking-sync.test.ts
Result: 1 test file passed, 2 tests passed
```

Gate：

- Callback evidence mapping: Pass
- Workspace linking dry-run: Pass
- Channel sync dry-run: Pass
- Production write guard: Pass
- Redaction: Pass
- Internal beta: Hold
- Production implementation: No-Go

下一步建議 Codex Prompt：

```text
請根據目前 Meta Business Login sandbox 文件與 SBL-13 dry-run evidence，建立 internal beta 前 go/no-go review。

目前狀態：
1. account selection UX: Pass
2. consent screen: Pass
3. redacted callback evidence: Pass
4. workspace linking dry-run: Pass
5. channel sync dry-run: Pass
6. production write guard: Pass
7. redaction: Pass
8. internal beta: Hold
9. production implementation: No-Go

請只新增 / 更新文件，不要改產品功能程式碼，不要改 OAuth flow，不要改 callback route，不要改登入按鈕，不要改 env，不要改 Prisma schema。

請建立 docs/meta-business-login-sandbox-internal-beta-go-no-go-review.md，內容包含：
1. App Review readiness
2. account selection UX evidence
3. callback evidence
4. workspace linking dry-run evidence
5. channel sync dry-run evidence
6. redaction evidence
7. production write guard evidence
8. rollback / fallback readiness
9. 是否可進 internal beta
10. 仍不可進 production implementation 的原因

完成後執行 git status、targeted tests、npm run lint、npm run build，commit 並 push master。
```
## 2026-06-16 - Meta Business Login Sandbox Internal Beta Go/No-Go Review

任務目標：

- 根據目前 Meta Business Login sandbox 文件與 SBL-13 dry-run evidence，建立 internal beta 前 go/no-go review。

修改內容：

- 新增 `docs/meta-business-login-sandbox-internal-beta-go-no-go-review.md`。
- 回填 `docs/fix-roadmap.md`。
- 回填 `docs/meta-business-login-sandbox-go-no-go-checklist.md`。
- 回填 `docs/meta-app-review-checklist.md`。

結論：

```text
Account selection UX: Pass
Consent screen: Pass
Redacted callback evidence: Pass
Workspace linking dry-run: Pass
Channel sync dry-run: Pass
Production write guard: Pass
Redaction: Pass
App Review readiness: Hold
Rollback / fallback readiness: Partial Pass
Internal beta: Hold
Production implementation: No-Go
```

下一步建議 Codex Prompt：

```text
請根據 docs/meta-business-login-sandbox-internal-beta-go-no-go-review.md，建立 Meta Business Login internal beta access / rollback runbook。

請只新增 / 更新文件，不要改產品功能程式碼，不要改 OAuth flow，不要改 callback route，不要改登入按鈕，不要改 env，不要改 Prisma schema。

檔案路徑：
docs/meta-business-login-sandbox-internal-beta-access-rollback-runbook.md

內容需包含：
1. internal-only beta entry point 條件
2. workspace allowlist 條件
3. 使用者 / admin 權限條件
4. redaction 搜尋流程
5. production write guard 監控項目
6. token exchange 不得發生的檢查項
7. fallback 到既有 Instagram OAuth flow 的方式
8. rollback / disable beta 的步驟
9. internal beta 可以開始前的最終 checklist
10. production implementation 仍不可開始的原因

完成後執行 git status、targeted tests、npm run lint、npm run build，commit 並 push master。
```
## 2026-06-16 - Meta Business Login Sandbox Internal Beta Access / Rollback Runbook

任務目標：

- 根據 internal beta go/no-go review，建立 internal beta access / rollback runbook。

修改內容：

- 新增 `docs/meta-business-login-sandbox-internal-beta-access-rollback-runbook.md`。
- 回填 `docs/fix-roadmap.md`。
- 回填 `docs/meta-business-login-sandbox-go-no-go-checklist.md`。
- 回填 `docs/meta-app-review-checklist.md`。

結論：

```text
Internal-only beta entry point: Hold
Workspace allowlist: Hold
User / admin permissions: Hold
Redaction search process: Partial Pass
Production write guard monitoring: Pass for dry-run
Token exchange prevention: Pass for dry-run / Hold for beta implementation
Fallback to existing Instagram OAuth: Pass
Rollback / disable beta: Partial Pass
Internal beta: Hold
Production implementation: No-Go
```

下一步建議 Codex Prompt：

```text
請根據 docs/meta-business-login-sandbox-internal-beta-access-rollback-runbook.md 與 docs/meta-business-login-app-review-demo-script.md，建立 Meta Business Login final App Review demo package checklist。

請只新增 / 更新文件，不要改產品功能程式碼，不要改 OAuth flow，不要改 callback route，不要改登入按鈕，不要改 env，不要改 Prisma schema。

檔案路徑：
docs/meta-business-login-final-app-review-demo-package-checklist.md

內容需包含：
1. reviewer demo recording checklist
2. permission usage proof checklist
3. Business / Page / IG test asset checklist
4. account selection UX evidence checklist
5. redacted callback evidence checklist
6. workspace linking / channel sync dry-run evidence checklist
7. redaction search checklist
8. rollback / fallback evidence checklist
9. internal beta 是否可解除 Hold 的條件
10. production implementation 仍不可開始的原因

完成後執行 git status、targeted tests、npm run lint、npm run build，commit 並 push master。
```
## 2026-06-16 - Meta Business Login Final App Review Demo Package Checklist

任務目標：

- 根據 internal beta access / rollback runbook 與 App Review demo script，建立 final App Review demo package checklist。

修改內容：

- 新增 `docs/meta-business-login-final-app-review-demo-package-checklist.md`。
- 回填 `docs/fix-roadmap.md`。
- 回填 `docs/meta-business-login-sandbox-go-no-go-checklist.md`。
- 回填 `docs/meta-app-review-checklist.md`。

結論：

```text
Final App Review demo package: Hold
Reviewer demo recording: Hold
Permission usage proof: Hold
Business / Page / IG test assets: Hold
Account selection UX evidence: Pass
Redacted callback evidence: Pass
Workspace linking / channel sync dry-run evidence: Pass
Redaction search against final package: Hold
Rollback / fallback evidence: Partial Pass
Internal beta: Hold
Production implementation: No-Go
```

下一步建議 Codex Prompt：

```text
請根據 docs/meta-business-login-final-app-review-demo-package-checklist.md，建立 Meta Business Login final permission usage proof matrix。

請只新增 / 更新文件，不要改產品功能程式碼，不要改 OAuth flow，不要改 callback route，不要改登入按鈕，不要改 env，不要改 Prisma schema。

檔案路徑：
docs/meta-business-login-final-permission-usage-proof-matrix.md

內容需包含：
1. 每個目前請求或候選 permission / scope
2. 對應產品畫面
3. 使用者操作
4. 讀取資料
5. 寫入資料
6. 儲存資料
7. retention / deletion 說明
8. reviewer demo proof
9. 是否已具備證據
10. 若證據不足，建議移除、延後或補證據

完成後執行 git status、targeted tests、npm run lint、npm run build，commit 並 push master。
```
