# Meta Business Login Sandbox Runbook Template

## 2026-06-15 - Authenticated Browser Evidence Run Record

Status: Partial Pass / Hold before account authorization.

| Field | Value |
| --- | --- |
| Run ID | `authenticated_browser_evidence_20260615_001` |
| Evidence file | `docs/meta-business-login-sandbox-authenticated-browser-evidence-run-2026-06-15.md` |
| Browser surface | In-app Browser |
| Meta Developers access | Pass |
| InboxPilot app id | `924285843989683` |
| Instagram app id | `1530009762118735` |
| Instagram Business Login URL | Observed with `force_reauth=true`, `response_type=code`, callback redacted |
| Business login settings | Redirect / deauth / data deletion fields configured; values redacted |
| Account selection UX | Partial Pass: two IG profiles plus "use another profile" shown |
| Callback evidence | Not captured |
| Credentials / OTP entered | No |
| Raw token / code / secret recorded | No |
| Internal beta | Hold |
| Production implementation | No-Go |

## 2026-06-15 - Browser Evidence Run Record

Status: Hold at Meta login.

| Field | Value |
| --- | --- |
| Run ID | `browser_evidence_20260615_001` |
| Evidence file | `docs/meta-business-login-sandbox-browser-evidence-run-2026-06-15.md` |
| Browser surface | In-app Browser |
| Chrome automation | Unavailable: missing Chrome plugin `scripts/browser-client.mjs` |
| Local dev server | `http://localhost:3041`, health check 200 |
| Local internal route result | 401 unauthorized without authenticated admin session |
| Meta Developers result | Redirected to Facebook login |
| Account selection evidence | Not captured |
| Credentials / OTP entered | No |
| Raw token / code / secret recorded | No |
| Internal beta | No-Go |
| Production implementation | No-Go |

## 2026-06-15 - SBL-06 To SBL-08 Helper Run Record

Status: completed for targeted helper tests.

| Field | Value |
| --- | --- |
| Run ID | `sbl06_08_run_20260615_001` |
| Scope | Dry-run payload, workspace allowlist, production write guard |
| Command | `npx vitest run tests/meta-business-login-sandbox-sbl06.test.ts tests/meta-business-login-sandbox-sbl07.test.ts tests/meta-business-login-sandbox-sbl08.test.ts` |
| Result | Passed: 6 tests |
| Existing OAuth changed | No |
| Existing callback changed | No |
| Login button changed | No |
| Env changed | No |
| Prisma schema changed | No |
| Production writes | No |

## 2026-06-15 - SBL-05 Redacted Logging Helper Run Record

Status: completed for targeted helper tests.

| Field | Value |
| --- | --- |
| Run ID | `sbl05_run_20260615_001` |
| Scope | Sandbox-only redacted logging helper |
| Command | `npx vitest run tests/meta-business-login-sandbox-sbl05.test.ts` |
| Helper | `src/lib/meta-business-sandbox-redaction.ts` |
| Test file | `tests/meta-business-login-sandbox-sbl05.test.ts` |
| Result | Passed: 4 tests |
| Production audit behavior changed | No |
| Production logging format changed | No |
| Existing OAuth changed | No |
| Existing callback changed | No |
| Env changed | No |

### SBL-05 Follow-Up

- SBL-06 dry-run callback payload builder can use this redaction helper.
- Internal beta and production implementation remain No-Go.

## 2026-06-15 - SBL-04 Code Exchange Helper Run Record

Status: completed for targeted helper tests.

| Field | Value |
| --- | --- |
| Run ID | `sbl04_run_20260615_001` |
| Scope | Sandbox-only code exchange helper |
| Command | `npx vitest run tests/meta-business-login-sandbox-sbl04.test.ts` |
| Helper | `src/lib/meta-business-sandbox-code-exchange.ts` |
| Test file | `tests/meta-business-login-sandbox-sbl04.test.ts` |
| Result | Passed: 5 tests |
| Meta token endpoint called by default | No |
| Env changed | No |
| Token stored | No |
| Existing OAuth changed | No |
| Existing callback changed | No |

### SBL-04 Follow-Up

- SBL-05 redacted logging helper should be implemented next.
- Any real Meta token exchange remains blocked until a later sandbox-only task explicitly enables it.

## 2026-06-15 - SBL-03 State / Nonce Helper Run Record

Status: completed for targeted helper tests.

| Field | Value |
| --- | --- |
| Run ID | `sbl03_run_20260615_001` |
| Scope | Sandbox-only state / nonce helpers |
| Command | `npx vitest run tests/meta-business-login-sandbox-sbl03.test.ts` |
| Helper | `src/lib/meta-business-sandbox-state.ts` |
| Test file | `tests/meta-business-login-sandbox-sbl03.test.ts` |
| Result | Passed: 4 tests |
| Existing OAuth state helper changed | No |
| Existing callback route changed | No |
| Cookie format changed | No |
| Env changed | No |
| Prisma schema changed | No |
| Raw state / nonce in audit | No |

### SBL-03 Follow-Up

- SBL-04 server-side code exchange helper should be implemented next as a safe stub / classifier.
- Internal beta and production implementation remain No-Go.

## 2026-06-15 - SBL-01 Internal Route Skeleton Run Record

Status: completed for targeted skeleton tests.

| Field | Value |
| --- | --- |
| Run ID | `sbl01_run_20260615_001` |
| Scope | Internal-only dry-run route skeleton |
| Helper test command | `npx vitest run tests/meta-business-login-sandbox-sbl01.test.ts` |
| Route test command | `npx vitest run tests/meta-business-login-sandbox-sbl01-route.test.ts` |
| Internal authorize route | `/api/internal/oauth/[provider]/authorize` |
| Internal callback route | `/api/internal/oauth/[provider]/callback` |
| Sandbox helper | `src/lib/meta-business-sandbox.ts` |
| Result | Passed: 10 SBL-01 tests |
| Product OAuth changed | No |
| Existing callback changed | No |
| Login button changed | No |
| Env changed | No |
| Prisma schema changed | No |
| Production ConnectedAccount / Channel write | No |
| Real Meta token exchange | No |

### SBL-01 Dry-Run Evidence Summary

```json
{
  "runId": "sbl01_run_20260615_001",
  "routes": [
    "/api/internal/oauth/[provider]/authorize",
    "/api/internal/oauth/[provider]/callback"
  ],
  "guards": [
    "production_disabled",
    "admin_only",
    "sandbox_header_required",
    "sandbox_provider_only",
    "workspace_allowlist"
  ],
  "rawSecretFindings": 0,
  "productionWrites": 0,
  "realMetaExchange": false,
  "status": "pass"
}
```

### SBL-01 Follow-Up

- SBL-03 state / nonce helpers should be implemented next.
- SBL-01 remains internal-only and dry-run-first.
- Internal beta and production implementation remain No-Go.

## 2026-06-15 - SBL-09 Test Scaffold Run Record

Status: completed for targeted scaffold tests.

| Field | Value |
| --- | --- |
| Run ID | `sbl09_run_20260615_001` |
| Scope | Sandbox test scaffold only |
| Command | `npx vitest run tests/meta-business-login-sandbox-sbl09.test.ts` |
| Fixture set | `tests/fixtures/sbl09` |
| Redaction helper | `tests/helpers/sbl09-redaction.ts` |
| Test file | `tests/meta-business-login-sandbox-sbl09.test.ts` |
| Result | Passed: 7 tests |
| Product code changed | No |
| OAuth flow changed | No |
| Callback route changed | No |
| Login button changed | No |
| Env changed | No |
| Prisma schema changed | No |
| Production ConnectedAccount / Channel write | No |
| Real Meta token exchange | No |

### SBL-09 Redacted Evidence Summary

```json
{
  "runId": "sbl09_run_20260615_001",
  "searchedTargets": [
    "fixtures",
    "dry_run_payload_snapshot",
    "test_output",
    "production_write_guard_fixture"
  ],
  "rawSecretFindings": 0,
  "unsafeFixtureFindings": 1,
  "expectedUnsafeFixtureFailures": 1,
  "status": "pass"
}
```

### SBL-09 Follow-Up

- SBL-09 scaffold exists and targeted tests pass.
- SBL-01 may proceed only as an internal-only route skeleton with dry-run-first and no-production-write constraints.
- Internal beta and production implementation remain No-Go.

日期：2026-06-15  
狀態：Template only，尚未執行實驗  
適用範圍：`meta-business-facebook-sandbox`、`meta-business-instagram-sandbox`  

## 使用原則

本模板用來記錄 sandbox-only Meta Business Login 實驗結果。填寫時只允許放 redacted 資料，不得貼上真實 token、authorization code、client secret、app secret、raw state、raw nonce、完整 callback URL 或可重放的 authorize URL。

本模板不代表可以修改正式產品流程。正式 `meta-instagram` OAuth flow、callback route、登入按鈕、env、Prisma schema、production ConnectedAccount / Channel 都不得因本 runbook 而變更。

## 1. 測試前檢查清單

### 基本資訊

| 欄位 | 紀錄 |
| --- | --- |
| Run ID | `YYYYMMDD-provider-session-transport-001` |
| 測試日期 |  |
| 測試人員 |  |
| Provider | `meta-business-facebook-sandbox` / `meta-business-instagram-sandbox` |
| Flow | Facebook Login for Business / Instagram Business Login |
| Transport | popup / redirect / mobile redirect / mobile in-app browser |
| Browser / Device |  |
| Workspace ID | redacted |
| Test Facebook Account | redacted |
| Test Instagram Account | redacted |
| Test Page | redacted |
| Test Business | redacted |

### 測試前必檢

| 項目 | Pass / Fail / N/A | 備註 |
| --- | --- | --- |
| 使用 sandbox Meta App，不使用 production app |  |  |
| 測試 workspace 在 allowlist 中 |  |  |
| 測試帳號具備 Business / Page / IG 權限 |  |  |
| IG account 是 Professional / Business account |  |  |
| Page 已連結 IG account |  |  |
| redirect URI 與 Meta App Dashboard 完全一致 |  |  |
| 測試前已清楚標示 browser session 狀態 |  |  |
| log / audit / console redaction 檢查工具已準備 |  |  |
| 不會建立 production ConnectedAccount / Channel |  |  |
| 已確認本次測試不修改正式登入按鈕或正式 OAuth flow |  |  |

### Session 狀態

| Session ID | 狀態 | 本次是否使用 | 備註 |
| --- | --- | --- | --- |
| S0 | 未登入 Meta / Facebook / Instagram |  |  |
| S1 | 已登入單一 Facebook 帳號 |  |  |
| S2 | 已登入單一 Instagram 帳號 |  |  |
| S3 | 已登入 Facebook + Instagram，且為同一組資產 |  |  |
| S4 | 曾登入多個 Facebook 帳號 |  |  |
| S5 | 曾登入多個 Instagram 帳號 |  |  |
| S6 | 已登入錯誤帳號或無可用資產帳號 |  |  |
| S7 | 已登入缺少 Business / Page / IG 權限的帳號 |  |  |

## 2. Meta App Dashboard 設定紀錄欄位

不得貼真實 secret。只記錄 redacted id、狀態與設定是否一致。

| 欄位 | 紀錄 |
| --- | --- |
| Meta App ID | `app_***1234` |
| App Mode | Development / Live |
| App Type | Business / Consumer / Other |
| Graph API Version |  |
| Facebook Login for Business enabled | Yes / No / N/A |
| Instagram Business Login enabled | Yes / No / N/A |
| Login Configuration ID | `cfg_***1234` / N/A |
| Instagram Login Configuration ID | `ig_cfg_***1234` / N/A |
| Valid OAuth Redirect URI | redacted host + path only |
| App Domains | redacted |
| Business Verification Status | Not started / Pending / Approved / Rejected / N/A |
| Advanced Access Status | Not requested / Pending / Approved / Rejected / N/A |
| App Review Submission ID | redacted / N/A |

### Permission 設定

| Permission | Requested | Advanced Access | Review Status | 本次測試用途 |
| --- | --- | --- | --- | --- |
| `pages_show_list` |  |  |  | Page selection / Page lookup |
| `pages_read_engagement` |  |  |  | Page-linked IG data validation |
| `pages_manage_metadata` |  |  |  | webhook / Page metadata validation |
| `pages_messaging` |  |  |  | Messenger / IG messaging related validation |
| `instagram_basic` |  |  |  | IG account identity |
| `instagram_manage_comments` |  |  |  | comment sync validation |
| `instagram_manage_messages` |  |  |  | inbox / messaging validation |
| `business_management` |  |  |  | Business / asset selection validation |
| `instagram_business_basic` |  |  |  | Instagram Business Login baseline |
| `instagram_business_manage_comments` |  |  |  | Instagram comment permission baseline |
| `instagram_business_manage_messages` |  |  |  | Instagram messaging permission baseline |

## 3. Authorize URL Redacted 紀錄格式

### Redacted authorize URL

```text
https://www.facebook.com/{graphApiVersion}/dialog/oauth
  ?client_id=app_***1234
  &redirect_uri=https://example.com/redacted/callback
  &state=[REDACTED]
  &response_type=code
  &scope=pages_show_list,pages_read_engagement,...
  &config_id=cfg_***1234
```

或：

```text
https://www.instagram.com/oauth/authorize
  ?client_id=app_***1234
  &redirect_uri=https://example.com/redacted/callback
  &state=[REDACTED]
  &response_type=code
  &scope=instagram_business_basic,...
```

### URL 檢查表

| 項目 | Pass / Fail / N/A | 備註 |
| --- | --- | --- |
| `client_id` 已 redacted |  |  |
| `redirect_uri` 不含 secret 或 user data |  |  |
| `state` 完全 redacted |  |  |
| `response_type=code` |  |  |
| scope 符合本次測試目的 |  |  |
| `config_id` 已 redacted 或不適用 |  |  |
| URL 未包含 token / code / secret |  |  |
| URL 未包含 workspace id raw value |  |  |
| URL 未包含 channel id raw value |  |  |

### 本次使用參數

| 參數 | 值 | 用途 | 是否影響 UX 判定 |
| --- | --- | --- | --- |
| `auth_type` |  | rerequest / reauthenticate / none |  |
| `display` |  | popup / page / none |  |
| `config_id` | redacted / N/A | Business Login configuration |  |
| `response_type` | code | code exchange |  |
| `scope` | redacted summary | permission set |  |

## 4. Callback Payload Redacted 紀錄格式

### 成功範例

```json
{
  "status": "success",
  "provider": "meta-business-facebook-sandbox",
  "flowType": "facebook_login_for_business",
  "transport": "popup",
  "workspaceId": "ws_***1234",
  "connectedAccountId": "ca_***1234",
  "channelId": "ch_***1234",
  "selectedBusinessId": "bus_***1234",
  "selectedPageId": "page_***5678",
  "selectedInstagramBusinessAccountId": "ig_***9012",
  "selectedAssetCount": 3,
  "requestId": "req_***abcd"
}
```

### 失敗範例

```json
{
  "status": "error",
  "provider": "meta-business-facebook-sandbox",
  "flowType": "facebook_login_for_business",
  "errorType": "invalid_state",
  "safeMessage": "OAuth state verification failed.",
  "requestId": "req_***abcd"
}
```

### Callback 檢查表

| 項目 | Pass / Fail / N/A | 備註 |
| --- | --- | --- |
| callback 沒有把 `code` 顯示到前端 |  |  |
| callback 沒有記錄完整 URL |  |  |
| callback 沒有記錄 raw state |  |  |
| state TTL 有效 |  |  |
| state single-use 有效 |  |  |
| nonce 驗證通過 |  |  |
| user session 與 state user 一致 |  |  |
| workspace 與 state workspace 一致 |  |  |
| provider id 與 state provider id 一致 |  |  |
| token exchange 只在 server-side 執行 |  |  |
| token / code / secret 已 redacted |  |  |

### Error 分類紀錄

| Error Type | 是否出現 | 觸發條件 | UI / Log 是否安全 |
| --- | --- | --- | --- |
| `user_cancel` |  |  |  |
| `invalid_state` |  |  |  |
| `nonce_mismatch` |  |  |  |
| `workspace_mismatch` |  |  |  |
| `workspace_not_allowed` |  |  |  |
| `wrong_account` |  |  |  |
| `no_eligible_asset` |  |  |  |
| `permission_denied` |  |  |  |
| `token_exchange_failed` |  |  |  |
| `channel_sync_failed` |  |  |  |

## 5. Account Selection UX 觀察表

### Dialog 畫面觀察

| 項目 | Yes / No / N/A | 備註 |
| --- | --- | --- |
| 未登入時顯示登入畫面 |  |  |
| 已登入單一帳號時仍顯示資產選擇 |  |  |
| 多帳號 session 時顯示帳號切換或選擇 |  |  |
| 顯示 Business selection |  |  |
| 顯示 Page selection |  |  |
| 顯示 IG account selection |  |  |
| 顯示權限說明 |  |  |
| 使用者能取消流程 |  |  |
| 使用者能返回或切換選擇 |  |  |
| 畫面語意接近 ManyChat account selection |  |  |

### UX 評分

| 評估項目 | 0 / 1 / 2 | 備註 |
| --- | --- | --- |
| 帳號選擇清楚度 |  | 0 = 不清楚，1 = 部分清楚，2 = 清楚 |
| Business / Page / IG 層級清楚度 |  |  |
| 錯誤帳號可修正性 |  |  |
| 多帳號情境可控性 |  |  |
| 手機瀏覽器可用性 |  |  |
| popup / redirect 一致性 |  |  |
| App Review demo 可重現性 |  |  |

### ManyChat 接近度判定

| 判定 | 條件 | 本次結果 |
| --- | --- | --- |
| P0 Pass | 能清楚選 Business / Page / IG account，callback 能確認選到的 IG asset |  |
| P1 Pass | 多帳號或已登入情境下仍可合理切換或修正 |  |
| Fail | 只顯示允許 / 取消，無法辨識或選擇 Business / Page / IG |  |

## 6. Workspace Linking / Channel Sync 驗證紀錄

### Workspace Linking

| 項目 | Pass / Fail / N/A | 備註 |
| --- | --- | --- |
| authenticated user 屬於目標 workspace |  |  |
| workspace 在 sandbox allowlist |  |  |
| callback query workspace 不被信任 |  |  |
| state workspace 與 session workspace 一致 |  |  |
| selected Business 與目標 workspace policy 相符 |  |  |
| selected Page 與目標 workspace policy 相符 |  |  |
| selected IG account 與目標 workspace policy 相符 |  |  |
| 同一 IG account 不會被錯連到其他 workspace |  |  |
| wrong account 可被拒絕並分類 |  |  |

### ConnectedAccount

| 項目 | Pass / Fail / N/A | 備註 |
| --- | --- | --- |
| provider id 使用 sandbox provider |  |  |
| providerAccountId 不使用 display name |  |  |
| IG professional account id 已 redacted |  |  |
| Business / Page / IG mapping 有紀錄 |  |  |
| token 加密儲存或 dry-run 不落庫 |  |  |
| metadata 不含 token / code / secret |  |  |

### Channel Sync

| 項目 | Pass / Fail / N/A | 備註 |
| --- | --- | --- |
| dry-run 不建立 production channel |  |  |
| 若建立測試 channel，限定測試 workspace |  |  |
| channel identity 使用 IG account id |  |  |
| channel display name 不作為唯一識別 |  |  |
| token scope 足夠支援目標 sync |  |  |
| permission missing 可安全失敗 |  |  |
| no asset 可安全失敗 |  |  |
| Meta API error 已 redacted |  |  |
| webhook subscription 不早於 account validation |  |  |

## 7. Redaction 搜尋結果紀錄

### 搜尋範圍

| 範圍 | 已檢查 | 結果 |
| --- | --- | --- |
| server log |  |  |
| audit log |  |  |
| browser console |  |  |
| error tracking |  |  |
| callback response body |  |  |
| network URL / query string |  |  |
| screenshot / screen recording |  |  |
| App Review demo document |  |  |
| runbook 本文件 |  |  |

### 禁止項目搜尋

| 禁止項目 | 搜尋結果 | Pass / Fail |
| --- | --- | --- |
| access token |  |  |
| refresh token |  |  |
| authorization code |  |  |
| app secret |  |  |
| client secret |  |  |
| webhook verify token |  |  |
| raw state |  |  |
| raw nonce |  |  |
| full callback URL |  |  |
| reusable authorize URL |  |  |

### Redaction 結論

```text
Redaction result:
- Pass / Fail:
- Finding summary:
- Required cleanup:
- Retest required: Yes / No
```

## 8. Go / No-Go 判定

### Gate Checklist

| Gate | Go 條件 | 結果 |
| --- | --- | --- |
| App Review readiness | demo script、permission table、測試資產、錄影腳本可重現 |  |
| Account selection UX | P0 通過，P1 有清楚結論 |  |
| Callback security | state / nonce / code exchange / redaction 通過 |  |
| Workspace linking | 無跨 workspace 風險 |  |
| Channel sync | 可建立正確 IG channel 或安全 dry-run |  |
| Redaction | 沒有 token / code / secret / raw state 外洩 |  |
| Rollback | 可回到現有 `meta-instagram` flow |  |
| Production isolation | 未影響正式 OAuth flow、callback、button、env |  |

### 判定選項

| 判定 | 說明 | 是否選用 |
| --- | --- | --- |
| Go to next sandbox step | 可進入內部 dry-run route / callback 規格設計 |  |
| Hold | 需要補測或補 App Review / Meta Dashboard 設定 |  |
| No-Go | UX、資安、App Review 或 workspace linking 不符合要求 |  |

### 最終結論

```text
Final decision:
- Go / Hold / No-Go:
- Main reason:
- Blocking issues:
- Follow-up owner:
- Next review date:
```

## 測試後清理

| 項目 | Done / N/A | 備註 |
| --- | --- | --- |
| sandbox dry-run state 已清除 |  |  |
| 測試 ConnectedAccount 清理完成 |  |  |
| 測試 Channel 清理完成 |  |  |
| 測試 log / audit 已確認 redacted |  |  |
| 測試錄影已確認不含敏感資料 |  |  |
| 不影響 production `meta-instagram` flow |  |  |

## 下一個建議 Codex prompt

```text
請只新增 / 更新文件，不要修改產品功能程式碼，不要改 OAuth flow，不要改 callback route，不要改登入按鈕，不要改 env。

請根據 docs/meta-business-login-sandbox-runbook-template.md，建立第一版 sandbox-only Meta Business Login 實驗結果報告空白範本，檔案路徑為 docs/meta-business-login-sandbox-experiment-report-template.md。

內容需包含：
1. 實驗摘要
2. 測試組合與環境
3. Meta dialog UX 結果
4. callback / workspace linking / channel sync 結果
5. redaction 搜尋結果
6. ManyChat UX 接近度判定
7. App Review 風險
8. go / hold / no-go 結論

完成後請執行 git status、npm run lint、npm run build。npm test 可視情況略過，但要說明原因。
```
