# Meta App Review Checklist

## 2026-06-16 - Meta Business Login sandbox SBL-12 callback capture gate

Status: helper Pass / route integration Hold.

- Added sandbox-only callback capture helper and tests.
- Callback evidence can now be represented as redacted evidence with hash-only code / state references and all production write flags blocked at helper level.
- Production callback route remains unchanged and real callback evidence is still missing.
- App Review remains Hold because reviewer demo, real callback, workspace linking, channel sync, and rollback evidence are not complete.

## 2026-06-16 - Meta Business Login sandbox controlled callback prompt

Status: documented next step.

- Added `docs/meta-business-login-sandbox-next-controlled-callback-prompt.md`.
- Callback evidence is still missing and must not be collected by blindly retrying the OAuth URL against the production callback.
- Before App Review readiness, callback capture must prove redaction, state / workspace validation, no raw code storage, no unintended token exchange, and no unintended ConnectedAccount / Channel writes.
- Internal beta remains Hold; production implementation remains No-Go.

## 2026-06-16 - Meta Business Login sandbox OAuth profile selection evidence

Status: Partial Pass / Hold.

- Evidence file: `docs/meta-business-login-sandbox-oauth-profile-selection-run-2026-06-16.md`.
- Instagram Business Login showed profile account selection after Facebook login.
- Available choices included `ling.yun.energy`, `carry.digital.nomad`, and `使用其他個人檔案`.
- `carry.digital.nomad` was selected, and Instagram loaded the selected profile's home page.
- Final OAuth consent, callback payload, workspace linking, channel sync, reviewer demo recording, and App Review submission evidence remain missing.
- Internal beta remains Hold; production implementation remains No-Go.

## 2026-06-15 - Meta Business Login sandbox authenticated browser evidence

Status: Partial Pass / Hold.

- Evidence file: `docs/meta-business-login-sandbox-authenticated-browser-evidence-run-2026-06-15.md`.
- Captured InboxPilot App Dashboard evidence, Instagram API setup evidence, Instagram Business Login URL evidence, business login settings, and permissions evidence.
- Meta-provided Instagram Business Login URL uses `force_reauth=true` and `response_type=code`.
- Instagram account selection UX was partially captured: two IG profiles and "use another profile" were shown after Facebook login.
- Callback evidence, workspace linking evidence, channel sync evidence, reviewer demo recording, and App Review submission evidence remain missing.
- Internal beta remains Hold; production implementation remains No-Go.

## 2026-06-15 - Meta Business Login sandbox browser evidence run

Status: Hold.

- Browser evidence file: `docs/meta-business-login-sandbox-browser-evidence-run-2026-06-15.md`.
- In-app Browser reached the Facebook login page for Meta Developers but did not have an authenticated Meta developer session.
- No Meta App Dashboard, Facebook Login for Business dialog, Instagram Business Login dialog, Business / Page / IG account selection UX, real callback evidence, or reviewer demo recording was captured.
- No credentials, OTP, token, authorization code, app secret, raw state, raw nonce, full callback URL, or browser storage was read or entered.
- Internal beta and production implementation remain blocked.

## 2026-06-15 - Meta Business Login sandbox external evidence handoff

Status: Hold.

- Chrome reached `https://developers.facebook.com/apps/` with page title `所有應用程式 - Meta for Developers`.
- Automation could not inspect the page DOM because another Chrome extension UI was blocking the page.
- This is not App Review evidence. Real Meta App Dashboard settings, Meta dialog UX, account selection UX, redacted callback evidence, and reviewer demo evidence are still missing.
- Internal beta and production implementation remain blocked.

## 2026-06-15 - Meta Business Login sandbox SBL-11 evidence packet review gate

Status: targeted local evidence packet test passed.

- Added local dry-run evidence packet generation for redacted authorize / callback payloads, production write guard evidence, and gate status output.
- This is still not App Review evidence because no real Meta dialog, account selection UX recording, Business / Page / IG asset evidence, callback evidence, reviewer demo, or redacted screen recording has been collected.
- Internal beta and production implementation remain blocked.

## 2026-06-15 - Meta Business Login sandbox production isolation review gate

Status: targeted production isolation test passed.

- Added an automated regression test confirming sandbox provider ids, sandbox helpers, and `/api/internal/oauth` are not referenced by existing production OAuth routes or UI entry points.
- This strengthens the sandbox boundary but still does not provide App Review evidence: no real Meta dialog, reviewer demo, account selection UX recording, Business / Page / IG evidence, callback evidence, or redacted screen recording has been collected yet.
- Internal beta and production implementation remain blocked.

## 2026-06-15 - Meta Business Login sandbox route integration review gate

Status: targeted route integration tests passed.

- Internal sandbox routes now produce richer dry-run evidence for state / nonce, code exchange classification, callback evidence, workspace spoofing guard, and production write guard.
- This remains internal dry-run scaffold evidence only; no real Meta dialog, account selection UX recording, Business / Page / IG evidence, real callback evidence, or redacted reviewer recording exists yet.
- Internal beta and production implementation remain blocked.

## 2026-06-15 - Meta Business Login sandbox SBL-06 to SBL-08 review gate

Status: targeted helper tests passed.

- SBL-06 to SBL-08 complete dry-run payload, workspace allowlist, and production write guard helper coverage.
- This still does not satisfy App Review because no real Meta dialog, reviewer demo, account selection UX recording, Business / Page / IG evidence, callback evidence, or redacted screen recording exists yet.
- Internal beta and production implementation remain blocked.

## 2026-06-15 - Meta Business Login sandbox SBL-05 redaction review gate

Status: targeted helper tests passed.

- SBL-05 adds sandbox-only redaction and audit helpers for future evidence collection.
- This still does not satisfy App Review because no real reviewer demo, Meta dialog evidence, account selection UX recording, Business / Page / IG evidence, callback evidence, or redacted screen recording exists yet.
- SBL-06 may start next; internal beta and production implementation remain blocked.

## 2026-06-15 - Meta Business Login sandbox SBL-04 code exchange review gate

Status: targeted helper tests passed.

- SBL-04 adds sandbox-only code exchange classification and redaction, but does not perform real Meta token exchange.
- This still does not provide App Review evidence because no real Meta dialog, account selection UX evidence, Business / Page / IG evidence, callback evidence, token evidence, or redacted recording exists yet.
- SBL-05 redacted logging helper may start next; internal beta and production implementation remain blocked.

## 2026-06-15 - Meta Business Login sandbox SBL-03 state nonce review gate

Status: targeted helper tests passed.

- SBL-03 adds sandbox-only state / nonce helpers for callback security preparation.
- This still does not provide App Review evidence because no real Meta dialog, account selection UX evidence, Business / Page / IG evidence, callback evidence, or redacted recording exists yet.
- SBL-04 may start next as a safe code exchange stub / classifier; internal beta and production implementation remain blocked.

## 2026-06-15 - Meta Business Login sandbox SBL-01 route skeleton review gate

Status: targeted skeleton tests passed.

- SBL-01 adds internal-only dry-run route skeletons but does not produce App Review evidence yet.
- No real Meta dialog, reviewer demo, account selection UX recording, Business / Page / IG asset evidence, callback evidence, or redacted screen recording exists yet.
- SBL-03 state / nonce helpers may start next; internal beta and production implementation remain blocked.
- Production fallback remains the existing `meta-instagram` flow.

## 2026-06-15 - Meta Business Login sandbox SBL-09 test scaffold review gate

Status: targeted scaffold tests passed.

- SBL-09 test scaffold now validates redacted fixtures, dry-run callback payload shape, unsafe fixture detection, raw callback / authorize URL rejection, and production write guard expectations.
- This is not App Review evidence yet because no real Meta dialog, reviewer demo, account selection UX recording, Business / Page / IG asset evidence, or sandbox callback evidence has been collected.
- SBL-01 may start only as an internal-only dry-run route skeleton; internal beta and production implementation remain blocked.
- Production fallback remains the existing `meta-instagram` flow.

## 2026-06-15 - Meta Business Login sandbox SBL-09 coding readiness review gate

Status: documented only.

- Added SBL-09 coding readiness checklist confirming only sandbox test scaffold coding may begin.
- This checklist does not satisfy App Review evidence because no real reviewer demo, account selection UX evidence, Business / Page / IG evidence, callback evidence, or redacted screen recording exists yet.
- SBL-01, internal beta, and production implementation remain blocked; production fallback remains the existing `meta-instagram` flow.

## 2026-06-15 - Meta Business Login sandbox SBL-09 fixture redaction review gate

Status: documented only.

- Added SBL-09 fixture and redaction assertion spec to keep future App Review evidence free of raw token, code, secret, state, nonce, callback URL, authorize URL, and unmasked Meta asset ids.
- This spec does not provide reviewer demo evidence, account selection UX evidence, Business / Page / IG test asset evidence, or redacted screen recording evidence.
- Internal beta and production implementation remain blocked until App Review, UX, callback security, workspace linking, channel sync, redaction, and rollback gates pass with execution evidence.
- Production fallback remains the existing `meta-instagram` flow.

## 2026-06-15 - Meta Business Login sandbox SBL-09 test suite review gate

Status: documented only.

- Added SBL-09 minimum test suite specification as a prerequisite before any SBL-01 internal-only route work.
- App Review remains Not passed because this spec does not provide reviewer demo evidence, Business / Page / IG test asset evidence, account selection UX evidence, or redacted recording evidence.
- Internal beta and production implementation remain blocked until App Review, UX, callback security, workspace linking, channel sync, redaction, and rollback gates pass with execution evidence.
- Production fallback remains the existing `meta-instagram` flow.

## 2026-06-15 - Meta Business Login sandbox coding kickoff review gate

Status: documented only.

- Added a sandbox coding kickoff checklist confirming SBL-09 may only prepare test scaffolding and SBL-01 remains blocked until redaction and dry-run standards exist.
- Internal beta and production implementation remain blocked until App Review evidence, UX evidence, callback security, workspace linking, channel sync, redaction, and rollback gates are passed with execution evidence.
- Production fallback remains the existing `meta-instagram` flow.

## 2026-06-15 - Meta Business Login sandbox final readiness review gate

Status: documented only.

- Added final readiness review confirming App Review remains Not passed.
- Reviewer demo flow, permission usage table, Business / Page / IG test assets, redacted screen recording, Business Verification / Advanced Access status, and actual sandbox evidence are still required before internal beta or production implementation.
- Production fallback remains the existing `meta-instagram` flow.

## 2026-06-15 - Meta Business Login sandbox coding task breakdown review gate

Status: documented only.

- Added a sandbox coding task breakdown that keeps App Review evidence as a prerequisite for internal beta and production implementation.
- Any future sandbox coding must backfill runbook / report / go-no-go evidence and cannot be treated as App Review readiness by itself.
- Production fallback remains the existing `meta-instagram` flow until App Review, UX, callback security, workspace linking, channel sync, redaction, and rollback gates pass.

## 2026-06-15 - Meta Business Login sandbox doc index review gate

Status: documented only.

- Added a sandbox document index and decision path that places App Review evidence before internal beta or production implementation.
- App Review remains unpassed: reviewer demo, permission usage table, test assets, screen recording, Business Verification / Advanced Access status, and redaction proof still require execution evidence.
- Production fallback remains the existing `meta-instagram` flow until the full sandbox decision path reaches a documented production go decision.

## 2026-06-15 - Meta Business Login sandbox coding risk test plan review gate

Status: documented only.

- Added a sandbox coding risk and test plan that keeps App Review evidence as a prerequisite before any internal beta or production implementation.
- App Review-related minimum checks include demo script, permission table, reviewer assets, redacted authorize URL evidence, redacted callback payload evidence, and no sensitive data in screenshots or recordings.
- Production fallback remains the existing `meta-instagram` flow; sandbox coding is still blocked unless the go/no-go checklist explicitly reaches `Go to sandbox coding`.

## 2026-06-15 - Meta Business Login sandbox coding spec review gate

Status: documented only.

- Added a pre-coding sandbox technical spec draft that keeps Facebook Login for Business / Instagram Business Login behind internal-only, dry-run-first constraints.
- App Review evidence remains required before internal beta or production implementation; sandbox coding may only proceed after demo script, permission table, redaction rules, and reviewer asset requirements are understood.
- Production fallback remains the existing `meta-instagram` flow. Any production implementation still requires a separate ADR and final App Review / security / rollback checklist.

## 2026-06-15 - Meta Business Login sandbox go/no-go review gate

Status: documented only.

- Added a go/no-go checklist that requires App Review readiness before internal beta or production implementation of Facebook Login for Business / Instagram Business Login.
- App Review go conditions include reviewer demo flow, permission usage table, test workspace, test Business / Page / IG assets, screen recording script, redaction proof, fallback explanation, Business Verification status, and Advanced Access status.
- Production fallback remains the existing `meta-instagram` flow until every go/no-go gate passes and a separate production implementation ADR is created.

## 2026-06-15 - Meta Business Login sandbox report review gate

Status: documented only.

- Added a sandbox experiment report template for summarizing App Review readiness, account selection UX evidence, callback safety, workspace linking, channel sync, redaction checks, and final go / hold / no-go decision.
- App Review readiness must include reviewer demo flow, permission usage table, test workspace, test Business / Page / IG assets, screen recording script, redaction proof, and fallback explanation.
- Production fallback remains the existing `meta-instagram` flow unless sandbox evidence proves reviewer-ready UX, safe callback handling, workspace isolation, channel sync correctness, and redaction success.

## 2026-06-15 - Meta Business Login sandbox runbook review gate

Status: documented only.

- Added a sandbox runbook template to capture reviewer-ready evidence without exposing token, code, secret, raw state, raw nonce, full callback URL, or reusable authorize URL.
- App Review preparation should use the runbook to record Meta App Dashboard configuration, permission status, account selection UX, redacted callback payload, and go / no-go decision.
- Production fallback remains the existing `meta-instagram` flow until sandbox runbook results show App Review readiness, acceptable account selection UX, safe callback handling, redaction success, workspace isolation, and channel sync correctness.

## 2026-06-15 - Meta Business Login sandbox plan review gate

Status: documented only.

- Added a sandbox-only implementation plan that keeps Facebook Login for Business / Instagram Business Login behind App Review and sandbox validation gates.
- App Review readiness now requires reviewer assets, redacted authorize URL / callback payload samples, permission usage proof, account selection UX observations, and rollback criteria before any beta rollout.
- Production fallback remains the existing `meta-instagram` flow until App Review, account selection matrix, redaction checks, workspace linking, and channel sync validation all pass.

## 2026-06-15 - Meta Business Login ADR review gate

Status: documented only.

- Added a pre-implementation ADR requiring sandbox-only validation before Facebook Login for Business or Instagram Business Login can replace the current Instagram OAuth flow.
- App Review readiness remains a required gate: reviewer demo flow, permission usage table, screen recording script, test workspace, test Business / Page / IG assets, and redaction proof must be ready before production rollout.
- If App Review fails or account selection UX is not materially better than the current flow, the production fallback remains the existing Instagram OAuth flow.

## 2026-06-15：Account Selection 測試矩陣

- 新增 `docs/meta-business-login-account-selection-test-matrix.md`，作為 App Review 前的 Business / Page / IG account selection 測試紀錄模板。
- 測試矩陣要求記錄 Meta dialog 是否只顯示「允許 / 取消」、是否可選 Business / Page / IG、callback 結果與 workspace linking 結果。
- 測試截圖與紀錄不得包含 token、authorization code、state raw value、secret 或未遮罩個資。

## 2026-06-15：Business Login Demo Script

- 新增 `docs/meta-business-login-app-review-demo-script.md`，整理 Facebook Login for Business / Instagram Business Login 的 reviewer demo 流程、permission usage table、資料使用位置與 redaction checklist。
- 尚未修改產品功能程式碼、OAuth flow、callback route、登入按鈕或 env。
- 送審前需以實際 Meta App Dashboard 設定再次核對 redirect URI、login configuration / `config_id`、Advanced Access 與 Business Verification 狀態。
- Demo 影片不得露出 token、authorization code、state raw value、app secret、client secret 或 webhook verify token。

## 2026-06-15：Business Login 研究規格補充

- 新增 `docs/meta-business-login-experiment-spec.md`，先以文件任務評估 Facebook Login for Business / Instagram Business Login 是否能取代或補強目前 Instagram OAuth。
- 尚未修改 OAuth flow、callback route、登入按鈕或 env。
- 後續 App Review 文件需補：reviewer demo script、permission usage table、Business / Page / IG account selection 錄影流程、token / code / secret redaction 檢查清單。
- 若導入 login configuration / `config_id`，需重新確認 Advanced Access、Business Verification、redirect URI 與測試帳號需求。

更新日期：2026-06-10

## 目前使用的 Meta / Instagram 登入流程

目前是 **混合流程**，不是單一路徑。

### Generic OAuth 入口

- `src/app/api/oauth/[provider]/authorize/route.ts`
- `src/app/api/oauth/[provider]/callback/route.ts`
- `src/app/api/oauth/[provider]/token/route.ts`

### Legacy Meta callback / sync 主流程

- `src/app/api/meta/oauth/start/route.ts`
- `src/app/api/meta/oauth/callback/route.ts`
- `src/app/api/instagram/oauth/callback/route.ts`
- `src/lib/oauth/meta-channel-sync.ts`

### Provider 定義

- `src/lib/oauth/providers/meta-facebook.ts`
- `src/lib/oauth/providers/meta-instagram.ts`

## 目前 OAuth route 與 callback route

### Facebook / Meta

- authorize：
  - `/api/oauth/meta-facebook/authorize`
  - `/api/meta/oauth/start?mode=facebook`
- callback：
  - `/api/oauth/meta-facebook/callback`
  - `/api/meta/oauth/callback`

### Instagram

- authorize：
  - `/api/oauth/meta-instagram/authorize`
  - `/api/meta/oauth/start?mode=instagram`
- callback：
  - `/api/oauth/meta-instagram/callback`
  - `/api/instagram/oauth/callback`
  - `src/app/api/instagram/oauth/callback/route.ts` 目前直接 re-export 到 Meta callback

## 目前使用 scopes

### `meta-instagram`

來源：

- `src/lib/oauth/providers/meta-instagram.ts`
- `src/app/api/meta/oauth/start/route.ts`

scopes：

- `instagram_business_basic`
- `instagram_business_manage_comments`
- `instagram_business_manage_messages`

### `meta-facebook`

來源：

- `src/lib/oauth/providers/meta-facebook.ts`
- `src/app/api/meta/oauth/start/route.ts`

scopes：

- `public_profile`
- `pages_show_list`
- `pages_read_engagement`
- `pages_manage_metadata`
- `pages_messaging`
- `instagram_basic`
- `instagram_manage_comments`
- `instagram_manage_messages`
- `business_management`

## 需要 App Review 的權限

實際商用大概率會碰到：

- `pages_show_list`
- `pages_read_engagement`
- `pages_manage_metadata`
- `pages_messaging`
- `instagram_basic`
- `instagram_manage_comments`
- `instagram_manage_messages`
- `business_management`
- `instagram_business_basic`
- `instagram_business_manage_comments`
- `instagram_business_manage_messages`

另外正式公開商用通常還會需要：

- Advanced Access
- Business Verification

## Demo video 要展示的流程

1. 使用者登入 InboxPilot
2. 前往社群連接頁
3. 點選 Facebook / Instagram 連接
4. 完成 OAuth
5. 成功後顯示實際綁定的 Page / IG 帳號資訊
6. 建立 channel
7. webhook 正常驗證
8. 收到留言 / 私訊事件
9. Inbox 能看到對話
10. Automation 能觸發回覆
11. 若綁錯帳號，展示解除綁定與重新連接

## 測試帳號需求

- Meta app admin / developer 帳號
- 至少 1 個 Facebook Page
- 至少 1 個 Instagram Professional / Business Account
- 建議再準備 1 組帳號用來測試切換帳號、錯綁、重新連接

## 目前卡住的 Meta 設定

1. 流程仍混合 generic OAuth 與 legacy callback
2. 正式可售仍依賴 App Review / Advanced Access / Business Verification
3. 多租戶正式環境不應再依賴 env token fallback
4. 使用者選擇 Page / IG Business Account 的 UX 還不夠明確

## 為什麼登入視窗可能直接顯示允許 / 取消，而不是 IG 帳密登入頁

原因通常是：

1. Meta / Instagram 會沿用目前瀏覽器 session
2. 若該 session 已登入某個帳號，provider 往往直接進授權畫面
3. `reauthenticate` 能增加重新驗證機率，但不保證一定出現完整帳號切換器
4. ManyChat 比較像有「選帳號」體驗，通常是 UX 包裝、重新登入路徑、引導設計比較完整，不是因為可以強制 Meta 每次顯示帳密頁

## 使用者綁錯帳號時的處理建議

目前已有部分 UX：

- Social connect 頁有切換帳號 / 重新連接提示
- channel 可刪除後重連

建議再補強：

1. 成功頁清楚顯示：
   - Facebook Page 名稱
   - Instagram 帳號名稱
   - 綁定來源是 Facebook Login 還是 Instagram Login
2. 若偵測到同 workspace 已有既有 IG 綁定，提醒使用者是否覆蓋 / 新增
3. 提供一鍵解除綁定與重新連接入口
4. production 模式禁用 env fallback，避免誤以為綁定成功其實用的是舊 token
## 2026-06-16 - Sandbox Callback Capture Evidence Status

Current sandbox evidence status:

- Account selection UX: observed in browser, multiple Instagram profile options were shown.
- Callback capture route guard: implemented as signed-state read-only guard.
- Real callback evidence: still Hold.
- Workspace linking: dry-run only.
- Channel sync: dry-run only.
- Internal beta: Hold.
- Production implementation: No-Go.

Reviewer demo safety requirement:

- Do not show raw authorization code, raw state, raw nonce, access token, app secret, client secret, or full callback URL in recording, logs, audit records, reports, screenshots, or documentation.
- If a callback evidence response is shown, only show the redacted JSON fields and hashed evidence markers.
- Do not present sandbox callback capture as a production user-facing feature.

## 2026-06-16 - Controlled Consent Run App Review Status

Evidence:

```text
docs/meta-business-login-sandbox-controlled-consent-run-2026-06-16.md
```

Reviewer demo readiness:

- Account/profile selection screen: observed.
- Consent screen with app name: observed.
- Privacy policy and terms links on consent screen: observed.
- Real callback evidence: not captured because Codex stopped before clicking allow.

App Review implication:

- The demo can show that Instagram Business Login can present a ManyChat-like account/profile selection step.
- The demo cannot yet claim the full authorization callback, workspace linking, or channel sync path is validated.
- Before submitting App Review, a user-authorized run must click allow and capture only redacted callback evidence.
