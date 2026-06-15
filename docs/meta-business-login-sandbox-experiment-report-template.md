# Meta Business Login Sandbox Experiment Report Template

## 2026-06-16 - SBL-13 Workspace Linking / Channel Sync Dry-Run Result Summary

Status: dry-run workspace linking Pass / dry-run channel sync Pass / production implementation No-Go.

Evidence file:

```text
docs/meta-business-login-sandbox-sbl13-workspace-linking-sync-dry-run.md
```

| Area | Result | Evidence |
| --- | --- | --- |
| Callback evidence mapping | Pass | Redacted callback evidence maps into sandbox workspace linking draft. |
| Workspace linking draft | Pass | `ConnectedAccount.wouldCreate=false`, `tokenStored=false`. |
| Channel draft | Pass | `Channel.wouldCreate=false`, `syncMode=dry_run`. |
| Channel sync dry-run | Pass | `wouldStart=false`, token absent. |
| Production write guard | Pass | Guard blocks ConnectedAccount / Channel / webhook / sync / refresh writes. |
| Redaction | Pass | No raw code, raw state, token, secret, full callback URL, or unmasked asset IDs in tested draft. |
| Internal beta | Hold | Requires manual go/no-go and App Review readiness review. |
| Production implementation | No-Go | Still requires App Review and production rollout gates. |

## 2026-06-16 - Controlled Consent Run Result Summary

Status: Guard deployed / account selection Pass / consent reached / callback Pass / workspace and sync Hold.

Evidence file:

```text
docs/meta-business-login-sandbox-controlled-consent-run-2026-06-16.md
```

| Area | Result | Evidence |
| --- | --- | --- |
| Production callback guard deployment | Pass | Redacted JSON probe succeeded without raw fake code or raw state marker. |
| Account selection UX | Pass | `carry.digital.nomad`, `ling.yun.energy`, and use-another-profile shown. |
| `force_reauth=true` behavior | Partial Pass | Forces login/profile selection, but did not continue to callback in this browser run. |
| Consent screen reachability | Pass | Consent screen shown without `force_reauth=true`. |
| Real callback evidence | Pass | User clicked allow; callback returned `sandbox_callback_capture` redacted JSON. |
| Workspace linking | Hold | Not exercised. |
| Channel sync | Hold | Not exercised. |
| Production implementation | No-Go | Callback, App Review, linking, sync, and rollback gates still missing. |

## 2026-06-16 - SBL-12 Controlled Callback Capture Result Summary

Status: helper Pass / route integration Pass / real callback Pass.

| Area | Result | Evidence |
| --- | --- | --- |
| Redacted callback capture | Pass | `tests/meta-business-login-sandbox-sbl12-callback-capture.test.ts` |
| Missing capture header rejection | Pass | `sandbox_callback_capture_header_required` |
| State mismatch rejection | Pass | `invalid_state` |
| Workspace mismatch rejection | Pass | `workspace_mismatch` |
| Non-allowlisted workspace rejection | Pass | `workspace_not_allowed` |
| Token exchange | Pass | Not attempted |
| Production writes | Pass | All write flags false |
| Production callback behavior | Pass | Unchanged |
| Route integration | Pass | Signed-state callback guard deployed and probe returned redacted JSON evidence |
| Real callback evidence | Pass | User clicked allow; response body was redacted sandbox callback evidence |
| Production implementation | No-Go | App Review / callback / workspace / sync gates missing |

## 2026-06-16 - OAuth Profile Selection Result Summary

Status: Partial Pass / Hold before callback.

Evidence file:

```text
docs/meta-business-login-sandbox-oauth-profile-selection-run-2026-06-16.md
```

| Area | Result | Evidence |
| --- | --- | --- |
| Forced login | Pass | Instagram login shown with `force_authentication` |
| Account selection UX | Pass | `ling.yun.energy`, `carry.digital.nomad`, and "use another profile" shown |
| Selected profile | Pass | `carry.digital.nomad` |
| OAuth consent screen | Hold | Not shown after profile selection |
| Callback payload | Hold | No `code` callback observed |
| Workspace linking | Hold | Not exercised |
| Channel sync | Hold | Not exercised |
| Production implementation | No-Go | Callback and App Review gates still missing |

## 2026-06-15 - Authenticated Browser Evidence Result Summary

Status: Partial Pass / Hold.

Evidence file:

```text
docs/meta-business-login-sandbox-authenticated-browser-evidence-run-2026-06-15.md
```

| Area | Result | Evidence |
| --- | --- | --- |
| Meta App Dashboard access | Pass | InboxPilot app visible |
| Instagram API setup | Pass | Instagram app name / app id visible |
| Instagram Business Login URL | Pass | `force_reauth=true`, `response_type=code` |
| Business login settings | Pass | Redirect / deauth / data deletion configured, values redacted |
| Permissions | Partial Pass | Messaging permissions testable; content publish / insights addable |
| Account selection UX | Partial Pass | IG profiles and "use another profile" shown |
| Callback payload | Hold | Stopped before final OAuth authorization |
| Workspace linking | Hold | Not exercised |
| Channel sync | Hold | Not exercised |
| Production implementation | No-Go | App Review and callback evidence missing |

## 2026-06-15 - SBL-06 To SBL-08 Result Summary

Status: completed for targeted helper tests.

| Area | Result | Evidence |
| --- | --- | --- |
| Dry-run success payload | Pass | `tests/meta-business-login-sandbox-sbl06.test.ts` |
| Dry-run error payload | Pass | `tests/meta-business-login-sandbox-sbl06.test.ts` |
| Workspace allowlist pass | Pass | `tests/meta-business-login-sandbox-sbl07.test.ts` |
| Workspace allowlist fail | Pass | `workspace_required`, `workspace_not_allowed` |
| Workspace spoofing detection | Pass | `workspace_spoofing_detected` |
| Production write guard | Pass | `tests/meta-business-login-sandbox-sbl08.test.ts` |

```text
SBL-06: Passed
SBL-07: Passed
SBL-08: Passed
Internal beta: No-Go
Production implementation: No-Go
```

## 2026-06-15 - SBL-05 Redacted Logging Helper Result Summary

Status: completed for targeted helper tests.

| Area | Result | Evidence |
| --- | --- | --- |
| Token redaction | Pass | `[REDACTED_TOKEN]` |
| Authorization code redaction | Pass | `[REDACTED_CODE]` |
| Secret redaction | Pass | `[REDACTED_SECRET]` |
| State redaction | Pass | `[REDACTED_STATE]` |
| Nonce redaction | Pass | `[REDACTED_NONCE]` |
| Callback URL redaction | Pass | `[REDACTED_CALLBACK_URL]` |
| Authorize URL redaction | Pass | `[REDACTED_AUTHORIZE_URL]` |
| Meta asset id masking | Pass | `business_[HASH]`, `page_[HASH]`, `ig_[HASH]` |
| Audit event redaction | Pass | `createMetaBusinessSandboxAuditEvent` |

### SBL-05 Go / Hold Result

```text
SBL-05 redacted logging helper: Passed
SBL-06 dry-run callback payload builder: Next
Internal beta: No-Go
Production implementation: No-Go
```

## 2026-06-15 - SBL-04 Code Exchange Helper Result Summary

Status: completed for targeted helper tests.

| Area | Result | Evidence |
| --- | --- | --- |
| Dry-run skip by default | Pass | `exchangeAttempted=false` |
| Missing code safe error | Pass | `code_required` |
| Missing redirect URI safe error | Pass | `redirect_uri_required` |
| Missing exchange client safe error | Pass | `exchange_client_required` |
| Redacted injected success output | Pass | `[REDACTED_CODE]`, `[REDACTED_TOKEN]` |
| Redacted injected failure output | Pass | Safe `errorType` only |

### SBL-04 Go / Hold Result

```text
SBL-04 code exchange helper: Passed
SBL-05 redacted logging helper: Next
Internal beta: No-Go
Production implementation: No-Go
```

## 2026-06-15 - SBL-03 State / Nonce Helper Result Summary

Status: completed for targeted helper tests.

| Area | Result | Evidence |
| --- | --- | --- |
| Opaque state generation | Pass | `tests/meta-business-login-sandbox-sbl03.test.ts` |
| Opaque nonce generation | Pass | `tests/meta-business-login-sandbox-sbl03.test.ts` |
| Hash-only state / nonce record | Pass | `src/lib/meta-business-sandbox-state.ts` |
| Redacted audit output | Pass | `redactSandboxOAuthStateForAudit` |
| TTL expiration rejection | Pass | `state_expired` |
| Replay rejection | Pass | `state_replayed` |
| Provider mismatch rejection | Pass | `invalid_state` |
| Workspace / user mismatch rejection | Pass | `workspace_mismatch` |
| Nonce mismatch rejection | Pass | `nonce_mismatch` |

### SBL-03 Go / Hold Result

```text
SBL-03 state / nonce helpers: Passed
SBL-04 server-side code exchange helper: Next
Internal beta: No-Go
Production implementation: No-Go
```

## 2026-06-15 - SBL-01 Internal Route Skeleton Result Summary

Status: completed for targeted skeleton tests.

| Area | Result | Evidence |
| --- | --- | --- |
| Sandbox helper | Pass | `src/lib/meta-business-sandbox.ts` |
| Internal authorize route | Pass | `src/app/api/internal/oauth/[provider]/authorize/route.ts` |
| Internal callback route | Pass | `src/app/api/internal/oauth/[provider]/callback/route.ts` |
| Production disabled guard | Pass | Helper test |
| Admin-only guard | Pass | Helper test |
| Sandbox header guard | Pass | Helper and route tests |
| Provider guard | Pass | Helper and route tests |
| Workspace allowlist guard | Pass | Helper test |
| Dry-run authorize payload | Pass | Helper and route tests |
| Dry-run callback payload | Pass | Helper and route tests |
| Production write guard | Pass | Helper and route tests |

### SBL-01 Go / Hold Result

```text
SBL-01 internal-only route skeleton: Passed
SBL-03 state / nonce helpers: Next
Internal beta: No-Go
Production implementation: No-Go
```

## 2026-06-15 - SBL-09 Scaffold Result Summary

Status: completed for targeted scaffold tests.

| Area | Result | Evidence |
| --- | --- | --- |
| Fixture directory | Pass | `tests/fixtures/sbl09` |
| Safe fixture example | Pass | `tests/fixtures/sbl09/safe/sbl09.callback.valid-dry-run.expected-redacted.fixture.json` |
| Unsafe fixture example | Pass | `tests/fixtures/sbl09/unsafe/sbl09.redaction.raw-code.unsafe.fixture.json` |
| Redaction assertion helper | Pass | `tests/helpers/sbl09-redaction.ts` |
| Dry-run callback payload snapshot | Pass | `tests/meta-business-login-sandbox-sbl09.test.ts` |
| Production write guard fixture | Pass | `tests/fixtures/sbl09/safe/sbl09.write-guard.channel-create-blocked.safe.fixture.json` |
| Targeted tests | Pass | `npx vitest run tests/meta-business-login-sandbox-sbl09.test.ts` |

### Redaction Result

```text
Raw token findings: 0
Raw authorization code findings: 0
Raw secret findings: 0
Raw state findings: 0
Raw nonce findings: 0
Full callback URL findings in safe evidence: 0
Reusable authorize URL findings in safe evidence: 0
Expected unsafe fixture failures: 1
```

### Go / Hold Result

```text
SBL-09 scaffold: Passed
SBL-01 internal-only route skeleton: Eligible to start under dry-run-first / no-production-write limits
Internal beta: No-Go
Production implementation: No-Go
```

日期：2026-06-15  
狀態：Template only，尚未填寫實驗結果  
適用範圍：`meta-business-facebook-sandbox`、`meta-business-instagram-sandbox`

## 使用原則

本文件是 sandbox-only Meta Business Login 實驗結果報告空白範本。填寫時只能使用 redacted 資料，不得包含真實 token、authorization code、client secret、app secret、raw state、raw nonce、完整 callback URL、可重放 authorize URL 或任何可直接識別外部使用者的敏感資料。

本報告不代表正式產品實作核准。任何 go 結論都只代表可進入下一個 sandbox 階段；正式 `meta-instagram` OAuth flow、callback route、登入按鈕、env、Prisma schema、production ConnectedAccount / Channel 均不得因本報告自動變更。

## 1. 實驗摘要

| 欄位 | 紀錄 |
| --- | --- |
| Report ID | `YYYYMMDD-meta-business-login-sandbox-report-001` |
| 實驗日期 |  |
| 報告作者 |  |
| Review owner |  |
| Provider | `meta-business-facebook-sandbox` / `meta-business-instagram-sandbox` |
| Flow | Facebook Login for Business / Instagram Business Login |
| 測試 workspace | `ws_***1234` |
| 測試 Business | `bus_***1234` / N/A |
| 測試 Page | `page_***1234` / N/A |
| 測試 IG account | `ig_***1234` / N/A |
| App Review 狀態 | Not requested / Pending / Approved / Rejected / N/A |
| 最終判定 | Go / Hold / No-Go |

### Executive Summary

```text
本次實驗目的：

主要觀察：

主要阻塞：

是否接近 ManyChat account selection UX：

是否建議進入下一個 sandbox 階段：
```

### Scope

| 項目 | In Scope / Out of Scope | 備註 |
| --- | --- | --- |
| Meta dialog account selection UX | In Scope |  |
| Callback payload redaction | In Scope |  |
| Workspace linking validation | In Scope |  |
| Channel sync dry-run | In Scope |  |
| Production OAuth flow change | Out of Scope |  |
| Production callback route change | Out of Scope |  |
| Login button change | Out of Scope |  |
| Env change | Out of Scope |  |
| Prisma schema change | Out of Scope |  |

## 2. 測試組合與環境

### 測試環境

| 欄位 | 紀錄 |
| --- | --- |
| Environment | local / staging / sandbox |
| App URL | redacted |
| Meta App ID | `app_***1234` |
| Graph API Version |  |
| Login Configuration ID | `cfg_***1234` / N/A |
| Redirect URI | redacted host + path |
| Sandbox allowlist enabled | Yes / No |
| Dry-run mode enabled | Yes / No |
| Production flow isolated | Yes / No |

### 測試組合

| Test ID | Session | Transport | Provider | Flow | Result | 備註 |
| --- | --- | --- | --- | --- | --- | --- |
| D-001 | S0 | Desktop popup | `meta-business-facebook-sandbox` | Facebook Login for Business |  |  |
| D-002 | S1 | Desktop popup | `meta-business-facebook-sandbox` | Facebook Login for Business |  |  |
| D-003 | S4 | Desktop popup | `meta-business-facebook-sandbox` | Facebook Login for Business |  |  |
| M-001 | S0 | Mobile redirect | `meta-business-facebook-sandbox` | Facebook Login for Business |  |  |
| M-002 | S1 | Mobile redirect | `meta-business-facebook-sandbox` | Facebook Login for Business |  |  |
| I-001 | S2 | Desktop popup | `meta-business-instagram-sandbox` | Instagram Business Login |  |  |
| I-002 | S5 | Mobile redirect | `meta-business-instagram-sandbox` | Instagram Business Login |  |  |

### Session 定義摘要

| Session | 定義 | 本次覆蓋 |
| --- | --- | --- |
| S0 | 未登入 Meta / Facebook / Instagram |  |
| S1 | 已登入單一 Facebook 帳號 |  |
| S2 | 已登入單一 Instagram 帳號 |  |
| S3 | 已登入同一組 Facebook + Instagram 資產 |  |
| S4 | 曾登入多個 Facebook 帳號 |  |
| S5 | 曾登入多個 Instagram 帳號 |  |
| S6 | 已登入錯誤帳號或無可用資產帳號 |  |
| S7 | 已登入缺少 Business / Page / IG 權限的帳號 |  |

## 3. Meta Dialog UX 結果

### Dialog 結果摘要

| 項目 | Yes / No / Partial / N/A | 證據摘要 |
| --- | --- | --- |
| 未登入時顯示登入畫面 |  |  |
| 已登入單一帳號時仍顯示資產選擇 |  |  |
| 多帳號 session 時顯示帳號切換 |  |  |
| 顯示 Business selection |  |  |
| 顯示 Page selection |  |  |
| 顯示 IG account selection |  |  |
| 顯示 permission 說明 |  |  |
| 使用者能取消流程 |  |  |
| 使用者能修正錯誤帳號 |  |  |
| 手機 redirect 體驗可接受 |  |  |
| popup / redirect 行為一致 |  |  |

### UX 觀察紀錄

```text
Meta dialog 實際畫面描述：

與目前 Instagram OAuth flow 的差異：

與 ManyChat 類似處：

與 ManyChat 落差：

使用者可能困惑點：

需要補強的產品內說明：
```

### Dialog Evidence

| Evidence ID | 類型 | Redaction 狀態 | 備註 |
| --- | --- | --- | --- |
| IMG-001 | screenshot | Pass / Fail / N/A |  |
| VID-001 | screen recording | Pass / Fail / N/A |  |
| LOG-001 | safe event log | Pass / Fail / N/A |  |

不得附上未 redacted 截圖、錄影、callback URL、authorize URL 或含個資的帳號畫面。

## 4. Callback / Workspace Linking / Channel Sync 結果

### Callback 結果

| 項目 | Pass / Fail / N/A | 證據摘要 |
| --- | --- | --- |
| `response_type=code` |  |  |
| authorization code 僅 server-side 使用 |  |  |
| callback 不回傳 code 到前端 |  |  |
| callback 不記錄完整 URL |  |  |
| state 驗證通過 |  |  |
| state single-use 通過 |  |  |
| nonce 驗證通過 |  |  |
| error classification 正確 |  |  |
| token exchange 失敗時安全處理 |  |  |

### Callback Error 統計

| Error Type | 次數 | 是否預期 | 備註 |
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

### Workspace Linking 結果

| 項目 | Pass / Fail / N/A | 證據摘要 |
| --- | --- | --- |
| user session 與 state workspace 一致 |  |  |
| workspace allowlist 生效 |  |  |
| callback query workspace 不可信任 |  |  |
| Business id 與 workspace policy 相符 |  |  |
| Page id 與 workspace policy 相符 |  |  |
| IG account id 與 workspace policy 相符 |  |  |
| wrong account 被拒絕 |  |  |
| 無跨 workspace linking 風險 |  |  |

### ConnectedAccount / Channel Sync 結果

| 項目 | Pass / Fail / N/A | 證據摘要 |
| --- | --- | --- |
| sandbox provider id 正確 |  |  |
| providerAccountId 使用穩定外部 id |  |  |
| token 加密儲存或 dry-run 不落庫 |  |  |
| metadata 不含 token / code / secret |  |  |
| channel identity 使用 IG account id |  |  |
| channel display name 不作為唯一識別 |  |  |
| permission missing 可安全失敗 |  |  |
| no asset 可安全失敗 |  |  |
| Meta API error 已 redacted |  |  |
| production Channel 未被影響 |  |  |

## 5. Redaction 搜尋結果

### 搜尋摘要

| 搜尋範圍 | 結果 | 備註 |
| --- | --- | --- |
| server log | Pass / Fail / N/A |  |
| audit log | Pass / Fail / N/A |  |
| browser console | Pass / Fail / N/A |  |
| error tracking | Pass / Fail / N/A |  |
| callback response body | Pass / Fail / N/A |  |
| network URL / query string | Pass / Fail / N/A |  |
| screenshot / screen recording | Pass / Fail / N/A |  |
| App Review demo document | Pass / Fail / N/A |  |
| runbook / report 文件 | Pass / Fail / N/A |  |

### 禁止項目

| 禁止項目 | 是否發現 | 處理方式 |
| --- | --- | --- |
| access token | Yes / No |  |
| refresh token | Yes / No |  |
| authorization code | Yes / No |  |
| app secret | Yes / No |  |
| client secret | Yes / No |  |
| webhook verify token | Yes / No |  |
| raw state | Yes / No |  |
| raw nonce | Yes / No |  |
| full callback URL | Yes / No |  |
| reusable authorize URL | Yes / No |  |

### Redaction 結論

```text
Redaction status:
- Pass / Fail:
- Findings:
- Cleanup completed:
- Retest required:
```

## 6. ManyChat UX 接近度判定

### 判定標準

| Gate | Pass / Fail / Partial | 備註 |
| --- | --- | --- |
| 能清楚選 Business |  |  |
| 能清楚選 Page |  |  |
| 能清楚選 IG account |  |  |
| 多帳號情境可修正或切換 |  |  |
| callback 可確認選到的 IG asset |  |  |
| InboxPilot 可安全建立或 dry-run 正確 channel |  |  |
| 使用者不會只看到允許 / 取消而無法辨識帳號 |  |  |
| 手機流程不明顯退化 |  |  |

### 接近度結論

| 結論 | 條件 | 本次是否符合 |
| --- | --- | --- |
| Close to ManyChat | Business / Page / IG selection 清楚，callback asset mapping 穩定 |  |
| Partially close | 桌機或單一情境可接受，但多帳號 / 手機仍不足 |  |
| Not close | 仍主要只顯示允許 / 取消，無法清楚選帳號或資產 |  |

```text
ManyChat UX conclusion:

Reason:

Required improvements:
```

## 7. App Review 風險

### 風險清單

| 風險 | Severity | 狀態 | 備註 |
| --- | --- | --- | --- |
| permission 用途不夠清楚 | High / Medium / Low |  |  |
| reviewer 無法重現 Business / Page / IG selection | High / Medium / Low |  |  |
| demo account / test asset 不完整 | High / Medium / Low |  |  |
| screen recording 未涵蓋 callback 後狀態 | High / Medium / Low |  |  |
| 文件或錄影含敏感資料 | High / Medium / Low |  |  |
| Business verification 未完成 | High / Medium / Low |  |  |
| Advanced Access 未核准 | High / Medium / Low |  |  |
| 權限與產品畫面用途不一致 | High / Medium / Low |  |  |

### App Review Readiness

| 項目 | Ready / Not Ready / N/A | 備註 |
| --- | --- | --- |
| Reviewer demo flow |  |  |
| Permission usage table |  |  |
| Test workspace |  |  |
| Test Business / Page / IG assets |  |  |
| Screen recording script |  |  |
| Redaction proof |  |  |
| Fallback explanation |  |  |

## 8. Go / Hold / No-Go 結論

### Decision Matrix

| Gate | Go 條件 | 結果 |
| --- | --- | --- |
| Account selection UX | P0 通過，P1 有明確結論 |  |
| Callback security | state / nonce / code exchange / error classification 通過 |  |
| Workspace linking | 無跨 workspace 風險 |  |
| Channel sync | dry-run 或測試 channel 正確 |  |
| Redaction | 無敏感資料外洩 |  |
| App Review readiness | demo 與權限用途可重現 |  |
| Production isolation | 正式 flow、callback、button、env 未受影響 |  |
| Rollback | 可回到現有 `meta-instagram` flow |  |

### Final Decision

```text
Decision: Go / Hold / No-Go

Main reason:

Blocking issues:

Required follow-up:

Owner:

Target review date:
```

### Decision Meaning

| 判定 | 意義 |
| --- | --- |
| Go | 只代表可進入下一個 sandbox 階段，不代表正式產品實作 |
| Hold | 補測、補 App Review 文件或補安全驗證後再評估 |
| No-Go | 不建議繼續此 flow，維持現有 `meta-instagram` flow 或改走 UX 提示改善 |

## 附錄：不得進入正式產品實作的條件

以下任一項未通過，結論必須是 Hold 或 No-Go：

1. 無法清楚選 Business / Page / IG account。
2. 多帳號情境仍無法修正錯誤帳號。
3. callback 會暴露 code、token、raw state 或完整 URL。
4. workspace linking 有跨 tenant 風險。
5. channel sync 可能建立錯誤 IG channel。
6. App Review demo 無法重現。
7. permission 用途無法對應產品畫面。
8. rollback 無法安全回到現有 `meta-instagram` flow。

## 下一個建議 Codex prompt

```text
請只新增 / 更新文件，不要修改產品功能程式碼，不要改 OAuth flow，不要改 callback route，不要改登入按鈕，不要改 env。

請根據 docs/meta-business-login-sandbox-experiment-report-template.md，建立 Meta Business Login sandbox go/no-go 審查清單，檔案路徑為 docs/meta-business-login-sandbox-go-no-go-checklist.md。

內容需包含：
1. App Review gate
2. account selection UX gate
3. callback security gate
4. workspace linking gate
5. channel sync gate
6. redaction gate
7. rollback gate
8. 可進入 sandbox coding、internal beta、production implementation 的條件差異

完成後請執行 git status、npm run lint、npm run build。npm test 可視情況略過，但要說明原因。
```
## 2026-06-16 - SBL-12 Callback Evidence Report Slot

Use this slot only after the browser produces a sandbox callback capture response.

```text
Callback evidence status: Not captured / Captured / Error
Observed Meta dialog before callback:
Captured response status:
Captured error type:
Redaction result:
  raw code absent: Pass / Fail
  raw state absent: Pass / Fail
  full callback URL absent: Pass / Fail
  token / secret absent: Pass / Fail
Production write guard:
  connectedAccount: false
  channel: false
  webhook: false
  channelSync: false
  tokenRefresh: false
ManyChat UX proximity after callback: Close / Partially close / Not close / Unknown
Go / hold / no-go recommendation:
```

Current status before real callback capture:

```text
Callback evidence status: Not captured
Recommendation: Hold
Internal beta: Hold
Production implementation: No-Go
```
