# Meta Business Login Sandbox Go/No-Go Checklist

## Latest Current Status - 2026-06-16 Controlled Callback Captured

Status: account selection Pass / consent Pass / real callback evidence Pass / workspace and sync Hold.

Evidence:

```text
docs/meta-business-login-sandbox-controlled-consent-run-2026-06-16.md
```

Decision:

```text
Production callback guard deployment: Pass
Account selection UX: Pass
Consent screen reachability: Pass
Real callback evidence: Pass
Redaction: Pass
Token exchange attempted: false
Production writes all false: true
Workspace linking: Hold
Channel sync: Hold
Internal beta: Hold
Production implementation: No-Go
```

## 2026-06-16 - SBL-12 Controlled Callback Capture Update

Status: helper Pass / route integration Hold.

Evidence:

```text
docs/meta-business-login-sandbox-controlled-callback-capture-plan.md
tests/meta-business-login-sandbox-sbl12-callback-capture.test.ts
```

Decision:

```text
Callback capture helper: Pass
Production callback unchanged: Pass
Route integration: Hold
Real callback evidence: Hold
Internal beta: Hold
Production implementation: No-Go
```

## 2026-06-16 - Next Controlled Callback Prompt Update

Status: Hold until callback capture guard exists.

Prompt file:

```text
docs/meta-business-login-sandbox-next-controlled-callback-prompt.md
```

Decision:

```text
Do not blindly retry OAuth URL: Hold
Controlled callback capture design: Required
Sandbox-only callback guard: Required before final consent
Internal beta: Hold
Production implementation: No-Go
```

## 2026-06-16 - OAuth Profile Selection Go/No-Go Update

Status: Partial Pass / Hold before callback.

Evidence file:

```text
docs/meta-business-login-sandbox-oauth-profile-selection-run-2026-06-16.md
```

Observed:

- Instagram Business Login showed a forced login screen.
- Clicking `使用 Facebook 帳號登入` showed IG profile account selection.
- Available choices included `ling.yun.energy`, `carry.digital.nomad`, and `使用其他個人檔案`.
- `carry.digital.nomad` was selected.
- Instagram loaded the selected profile's home page.
- No final OAuth consent screen or callback URL with `code` was observed.

Decision:

```text
Profile account selection UX: Pass
Selected test profile evidence: Pass
Callback evidence: Hold
Workspace linking: Hold
Channel sync: Hold
Internal beta: Hold
Production implementation: No-Go
```

## 2026-06-15 - Authenticated Browser Evidence Go/No-Go Update

Status: Partial Pass / Hold.

Evidence file:

```text
docs/meta-business-login-sandbox-authenticated-browser-evidence-run-2026-06-15.md
```

Observed:

- InboxPilot Meta App Dashboard accessible.
- InboxPilot app id: `924285843989683`.
- Instagram app name: `manychat-auto-reply-IG`.
- Instagram app id: `1530009762118735`.
- Meta-provided Instagram Business Login URL uses `force_reauth=true` and `response_type=code`.
- Business login settings show configured redirect URI, deauthorize callback URL, and data deletion request URL; values are redacted in docs.
- Instagram profile account selection appeared after Facebook login with two profiles and "use another profile".
- Callback evidence was not captured because the run stopped before selecting a profile and before final OAuth authorization.

Decision:

```text
Meta Dashboard evidence: Pass
Instagram Business Login URL evidence: Pass
Account selection UX evidence: Partial Pass
Callback evidence: Hold
Internal beta: Hold
Production implementation: No-Go
```

## 2026-06-15 - Browser Evidence Run Go/No-Go Update

Status: Hold / No-Go for external evidence.

Evidence file:

```text
docs/meta-business-login-sandbox-browser-evidence-run-2026-06-15.md
```

Observed:

- Local dev server health check passed.
- Internal sandbox routes returned `401 unauthorized` without an authenticated admin session.
- In-app Browser reached Facebook login for Meta Developers.
- No Meta App Dashboard, Facebook Login for Business dialog, Instagram Business Login dialog, Business / Page / IG account selection UX, real callback payload, or reviewer demo evidence was captured.

Decision:

```text
Local route guard: Pass
External Meta evidence: Hold
Internal beta: No-Go
Production implementation: No-Go
```

## 2026-06-15 - SBL-06 To SBL-08 Go/No-Go Update

Status: targeted helper tests passed.

| Gate | Status | Evidence |
| --- | --- | --- |
| SBL-06 dry-run callback payload | Pass | Redacted success / error payloads |
| SBL-07 workspace allowlist | Pass | allowlist / required / spoofing cases |
| SBL-08 production write guard | Pass | all write operations blocked |

Decision:

```text
SBL-06 / SBL-07 / SBL-08: Go / completed for targeted helper tests
SBL-10 final consolidation: Go to start
Internal beta: No-Go
Production implementation: No-Go
```

## 2026-06-15 - SBL-05 Redacted Logging Helper Go/No-Go Update

Status: SBL-05 targeted helper tests passed.

| Gate | Status | Evidence |
| --- | --- | --- |
| Token redaction | Pass | `[REDACTED_TOKEN]` |
| Code redaction | Pass | `[REDACTED_CODE]` |
| Secret redaction | Pass | `[REDACTED_SECRET]` |
| State / nonce redaction | Pass | `[REDACTED_STATE]`, `[REDACTED_NONCE]` |
| OAuth URL redaction | Pass | callback / authorize URLs redacted |
| Meta asset id masking | Pass | hashed Business / Page / IG ids |
| Audit event redaction | Pass | no raw workspace / request / asset ids |
| Unsafe payload detection | Pass | raw token and callback URL detected |

Decision:

```text
SBL-05 helper: Go / completed for targeted helper tests
SBL-06 dry-run callback payload builder: Go to start
Internal beta: No-Go
Production implementation: No-Go
```

## 2026-06-15 - SBL-04 Code Exchange Helper Go/No-Go Update

Status: SBL-04 targeted helper tests passed.

| Gate | Status | Evidence |
| --- | --- | --- |
| Dry-run skip by default | Pass | No Meta token endpoint call |
| Missing code classification | Pass | `code_required` |
| Missing redirect URI classification | Pass | `redirect_uri_required` |
| Missing exchange client classification | Pass | `exchange_client_required` |
| Redacted success output | Pass | No raw code / token in result |
| Redacted failure output | Pass | Safe `errorType` only |

Decision:

```text
SBL-04 helper: Go / completed for targeted helper tests
SBL-05 redacted logging helper: Go to start
Internal beta: No-Go
Production implementation: No-Go
```

## 2026-06-15 - SBL-03 State / Nonce Helper Go/No-Go Update

Status: SBL-03 targeted helper tests passed.

| Gate | Status | Evidence |
| --- | --- | --- |
| Opaque state generation | Pass | `createSandboxOAuthState` |
| Opaque nonce generation | Pass | `createSandboxOAuthState` |
| Hash-only storage | Pass | No raw state / nonce in record |
| Redacted audit | Pass | `redactSandboxOAuthStateForAudit` |
| TTL expiration | Pass | `state_expired` |
| Replay protection | Pass | `state_replayed` |
| Provider mismatch | Pass | `invalid_state` |
| Workspace / user binding | Pass | `workspace_mismatch` |
| Nonce mismatch | Pass | `nonce_mismatch` |

Decision:

```text
SBL-03 helpers: Go / completed for targeted helper tests
SBL-04 server-side code exchange helper: Go to start as safe stub / classifier
Internal beta: No-Go
Production implementation: No-Go
```

## 2026-06-15 - SBL-01 Internal Route Skeleton Go/No-Go Update

Status: SBL-01 targeted skeleton tests passed.

| Gate | Status | Evidence |
| --- | --- | --- |
| Internal-only route skeleton | Pass | `/api/internal/oauth/[provider]/authorize`, `/api/internal/oauth/[provider]/callback` |
| Production disabled guard | Pass | `sandbox_disabled_in_production` |
| Admin-only guard | Pass | `internal_only` |
| Sandbox header guard | Pass | `sandbox_header_required` |
| Sandbox provider guard | Pass | `unsupported_provider` for production provider ids |
| Workspace allowlist guard | Pass | `workspace_not_allowed` |
| Dry-run authorize payload | Pass | Redacted authorize metadata only |
| Dry-run callback payload | Pass | No code exchange and no production writes |
| Existing OAuth untouched | Pass | No existing OAuth route changed |

Decision:

```text
SBL-01 route skeleton: Go / completed for targeted skeleton
SBL-03 state / nonce helpers: Go to start under sandbox-only constraints
Internal beta: No-Go
Production implementation: No-Go
```

## 2026-06-15 - SBL-09 Scaffold Go/No-Go Update

Status: SBL-09 targeted scaffold tests passed.

| Gate | Status | Evidence |
| --- | --- | --- |
| SBL-09 fixture directory | Pass | `tests/fixtures/sbl09` |
| SBL-09 safe fixture | Pass | Safe dry-run callback fixture added |
| SBL-09 unsafe fixture | Pass | Synthetic unsafe fixture is detected |
| SBL-09 redaction assertion helper | Pass | `tests/helpers/sbl09-redaction.ts` |
| SBL-09 dry-run callback payload snapshot | Pass | Validated by targeted test |
| SBL-09 production write guard | Pass | Channel create and guarded operation cases validated |
| Targeted test command | Pass | `npx vitest run tests/meta-business-login-sandbox-sbl09.test.ts` |
| Product code untouched | Pass | No `src/`, OAuth, callback, button, env, Prisma schema, ConnectedAccount, or Channel implementation changes |

Decision:

```text
SBL-09 scaffold: Go / completed for targeted scaffold
SBL-01 internal-only route skeleton: Go to start, limited to internal-only / dry-run-first / no-production-write
Internal beta: No-Go
Production implementation: No-Go
```

日期：2026-06-15  
狀態：Checklist only，尚未進入 sandbox coding  
適用範圍：`meta-business-facebook-sandbox`、`meta-business-instagram-sandbox`

## 使用原則

本清單用來判斷 Meta Business Login sandbox 研究是否能進入下一階段。它不授權修改正式產品。

明確限制：

- 不修改現有 `meta-instagram` OAuth flow。
- 不修改現有 callback route。
- 不修改登入按鈕。
- 不修改 env。
- 不修改 Prisma schema。
- 不建立 production ConnectedAccount / Channel。
- 不在文件、log、audit、URL、截圖或錄影中保存 token、authorization code、secret、raw state、raw nonce、完整 callback URL 或可重放 authorize URL。

## Decision Levels

| Level | 意義 | 可做事項 | 不可做事項 |
| --- | --- | --- | --- |
| No-Go | 此 flow 暫停 | 保留文件、補原因、回到現有 `meta-instagram` flow | 不得 coding、不進 beta、不進 production |
| Hold | 需要補資料或補測 | 補 App Review 文件、補測 matrix、補 redaction 證據 | 不得對正式使用者開放 |
| Go to sandbox coding | 可做隔離 sandbox prototype | 只做內部 dry-run route / provider 規格實作 | 不得掛正式 UI、不改 production env |
| Go to internal beta | 可對 allowlist workspace 試跑 | feature flag、workspace allowlist、dry-run 或測試 channel | 不得全面開放 |
| Go to production implementation | 可排正式實作計畫 | 建立正式 rollout ADR、migration plan、release checklist | 不得跳過 App Review / rollback / security gates |

## 1. App Review Gate

### Go 條件

| Gate | Go 標準 | 結果 | 備註 |
| --- | --- | --- | --- |
| Reviewer demo flow | reviewer 可從登入到連接 IG channel 完整重現 |  |  |
| Permission usage table | 每個 permission 都對應產品畫面與資料用途 |  |  |
| Test workspace | reviewer 可登入並看到測試 workspace |  |  |
| Test Business / Page / IG assets | 測試資產狀態完整且可重現 |  |  |
| Screen recording script | 錄影可展示 Business / Page / IG account selection |  |  |
| Redaction proof | 文件與錄影不含 token / code / secret |  |  |
| Fallback explanation | App Review 不通過時可回到現有 flow |  |  |
| Business verification | 狀態已確認，且不阻塞目標 permission |  |  |
| Advanced Access | 目標 permission 已申請或有明確替代方案 |  |  |

### No-Go 條件

任一項成立即 No-Go：

- reviewer 無法重現 Business / Page / IG selection。
- permission 用途無法對應真實產品畫面。
- demo account、Business、Page、IG asset 不完整。
- App Review 文件或錄影含敏感資料。
- 需要的 permission 被拒絕且沒有 fallback。

## 2. Account Selection UX Gate

### Go 條件

| Gate | Go 標準 | 結果 | 備註 |
| --- | --- | --- | --- |
| 未登入情境 | 能顯示合理登入或 account selection 畫面 |  |  |
| 單一帳號情境 | 不只顯示模糊的允許 / 取消，能看懂資產 |  |  |
| 多帳號情境 | 可切換或修正帳號 |  |  |
| Business selection | 使用者能辨識要選哪個 Business |  |  |
| Page selection | 使用者能辨識要選哪個 Page |  |  |
| IG account selection | 使用者能辨識要選哪個 IG professional account |  |  |
| Mobile redirect | 手機流程不明顯退化 |  |  |
| Popup / redirect | 兩種 transport 行為可接受且有紀錄 |  |  |
| ManyChat proximity | 至少達到 P0 Pass，P1 有明確結論 |  |  |

### 判定

| 結果 | 標準 |
| --- | --- |
| Go | Business / Page / IG selection 清楚，callback 可確認 selected IG asset |
| Hold | 部分情境可接受，但多帳號、手機或錯誤帳號仍需補測 |
| No-Go | 仍主要只顯示允許 / 取消，無法清楚選帳號或資產 |

## 3. Callback Security Gate

### Go 條件

| Gate | Go 標準 | 結果 | 備註 |
| --- | --- | --- | --- |
| `response_type=code` | 使用 authorization code flow |  |  |
| server-side code exchange | code 不進前端、不進 log、不進 audit |  |  |
| opaque state | query string 不暴露 workspace / user / channel raw id |  |  |
| state TTL | 建議 5 到 10 分鐘，過期即失效 |  |  |
| state single-use | 使用後不可重放 |  |  |
| nonce validation | nonce mismatch 可被拒絕 |  |  |
| provider binding | callback provider 與 state provider 一致 |  |  |
| user binding | callback user session 與 state user 一致 |  |  |
| error classification | error type 可分類且 safe message 不含敏感資料 |  |  |
| token storage | token 加密儲存或 dry-run 不落庫 |  |  |

### No-Go 條件

任一項成立即 No-Go：

- callback 暴露 authorization code。
- raw state、raw nonce 或完整 callback URL 被記錄。
- state 可重放。
- callback 信任 query string workspace。
- token exchange 在 client side 執行。

## 4. Workspace Linking Gate

### Go 條件

| Gate | Go 標準 | 結果 | 備註 |
| --- | --- | --- | --- |
| Authenticated user | 使用者屬於目標 workspace |  |  |
| Workspace allowlist | sandbox 僅允許測試 workspace |  |  |
| State workspace | state workspace 與 session workspace 一致 |  |  |
| Business mapping | selected Business 符合 workspace policy |  |  |
| Page mapping | selected Page 符合 workspace policy |  |  |
| IG mapping | selected IG account 符合 workspace policy |  |  |
| Wrong account handling | 錯帳號可被拒絕並分類 |  |  |
| Duplicate asset handling | 同一 IG account 跨 workspace 規則明確 |  |  |
| Tenant isolation | 無跨 workspace linking 風險 |  |  |

### No-Go 條件

任一項成立即 No-Go：

- 可透過 query string 指定別人的 workspace。
- selected IG account 可被連到錯誤 workspace。
- same IG account duplicate policy 不明。
- workspace allowlist 未生效。

## 5. Channel Sync Gate

### Go 條件

| Gate | Go 標準 | 結果 | 備註 |
| --- | --- | --- | --- |
| Dry-run safety | sandbox 預設不建立 production channel |  |  |
| Channel identity | 使用 IG account id，不用 display name 當唯一識別 |  |  |
| ConnectedAccount mapping | providerAccountId 穩定且可追溯 |  |  |
| Token source | user token / page token / IG token 來源清楚 |  |  |
| Permission missing | 權限不足可安全失敗 |  |  |
| No asset | 無可用資產可安全失敗 |  |  |
| Meta API error | error response 已 redacted |  |  |
| Webhook timing | account validation 前不訂閱 webhook |  |  |
| Production isolation | production Channel 不受影響 |  |  |

### No-Go 條件

任一項成立即 No-Go：

- 可能建立錯誤 IG channel。
- channel identity 只靠 display name。
- token scope 不足但仍標示 connected。
- Meta raw error 或 token 出現在 log / audit。

## 6. Redaction Gate

### Go 條件

| 禁止項目 | 不得出現於任何紀錄 | 結果 |
| --- | --- | --- |
| access token | log / audit / console / docs / screenshot / recording / URL |  |
| refresh token | log / audit / console / docs / screenshot / recording / URL |  |
| authorization code | log / audit / console / docs / screenshot / recording / URL |  |
| app secret | log / audit / console / docs / screenshot / recording / URL |  |
| client secret | log / audit / console / docs / screenshot / recording / URL |  |
| webhook verify token | log / audit / console / docs / screenshot / recording / URL |  |
| raw state | log / audit / console / docs / screenshot / recording / URL |  |
| raw nonce | log / audit / console / docs / screenshot / recording / URL |  |
| full callback URL | log / audit / console / docs / screenshot / recording / URL |  |
| reusable authorize URL | log / audit / console / docs / screenshot / recording / URL |  |

### 必查範圍

| 範圍 | Pass / Fail / N/A | 備註 |
| --- | --- | --- |
| server log |  |  |
| audit log |  |  |
| browser console |  |  |
| error tracking |  |  |
| network URL / query string |  |  |
| screenshot / screen recording |  |  |
| App Review docs |  |  |
| runbook / report |  |  |

任何 sensitive finding 都必須是 Hold 或 No-Go，清理並重測前不得前進。

## 7. Rollback Gate

### Go 條件

| Gate | Go 標準 | 結果 | 備註 |
| --- | --- | --- | --- |
| Feature flag | sandbox 可立即停用 |  |  |
| Workspace allowlist | 可移除 allowlist 立即停止測試 |  |  |
| Provider isolation | 停用 sandbox 不影響 `meta-instagram` |  |  |
| Data cleanup | 測試 ConnectedAccount / Channel 可清理 |  |  |
| Audit trail | rollback 有安全稽核紀錄 |  |  |
| User fallback | 使用者可回到現有 Instagram OAuth flow |  |  |
| App Review fallback | App Review 不通過時有替代方案 |  |  |

### No-Go 條件

任一項成立即 No-Go：

- sandbox 停用會影響正式 `meta-instagram`。
- 測試資料無法清理或辨識。
- fallback 必須修改 production env 才能恢復。
- rollback 過程會刪除 production ConnectedAccount / Channel。

## 8. 階段條件差異

### 進入 Sandbox Coding

可以進入 sandbox coding 的最低條件：

| Gate | 最低要求 |
| --- | --- |
| App Review | 文件與 demo script 草案完成，不要求已通過 |
| Account selection UX | 至少有 Meta Dashboard / 手動 URL 初步證據 |
| Callback security | state / nonce / code exchange 規格完成 |
| Workspace linking | allowlist 與 tenant isolation 規格完成 |
| Channel sync | dry-run mapping 規格完成 |
| Redaction | runbook / report 禁止項目明確 |
| Rollback | 停用 sandbox 不影響 production flow |

限制：

- 只能做 sandbox provider / dry-run route / internal-only prototype。
- 不得掛正式 UI。
- 不得更動 production env。
- 不得建立正式 Channel。

### 進入 Internal Beta

可以進入 internal beta 的最低條件：

| Gate | 最低要求 |
| --- | --- |
| App Review | 若需要正式 permission，狀態必須已確認；未通過則 beta 必須限測試資產 |
| Account selection UX | P0 Pass，P1 有明確缺口 |
| Callback security | state / nonce / code exchange / error classification 實測通過 |
| Workspace linking | allowlist workspace 實測無跨 tenant 風險 |
| Channel sync | dry-run 或測試 channel sync 正確 |
| Redaction | 實測 log / audit / console / docs 搜尋通過 |
| Rollback | 已演練停用 feature flag 與測試資料清理 |

限制：

- 只允許內部 workspace 或 allowlist workspace。
- 必須保留現有 `meta-instagram` fallback。
- 任一 redaction 或 tenant isolation 問題必須立即停用。

### 進入 Production Implementation

可以排入正式產品實作的最低條件：

| Gate | 最低要求 |
| --- | --- |
| App Review | required permissions 已通過或有明確正式可用替代方案 |
| Account selection UX | 多 session、多 transport 測試達標 |
| Callback security | 安全 review 通過且有測試覆蓋 |
| Workspace linking | tenant isolation review 通過且有 regression plan |
| Channel sync | token source、asset mapping、error handling 全部明確 |
| Redaction | 所有敏感資料搜尋通過並納入 release checklist |
| Rollback | production rollback plan、feature flag、monitoring 完成 |

正式實作前仍需另開：

- production implementation ADR。
- App Review final checklist。
- env migration plan。
- callback security implementation spec。
- ConnectedAccount / Channel schema impact review。
- release / rollback checklist。

## Final Decision Template

```text
Decision: Go to sandbox coding / Go to internal beta / Go to production implementation / Hold / No-Go

Required passed gates:
- App Review:
- Account selection UX:
- Callback security:
- Workspace linking:
- Channel sync:
- Redaction:
- Rollback:

Main reason:

Blocking issues:

Required follow-up:

Owner:

Target review date:
```

## 下一個建議 Codex prompt

```text
請只新增 / 更新文件，不要修改產品功能程式碼，不要改 OAuth flow，不要改 callback route，不要改登入按鈕，不要改 env。

請根據 docs/meta-business-login-sandbox-go-no-go-checklist.md，建立 Meta Business Login sandbox coding 前的技術規格草案，檔案路徑為 docs/meta-business-login-sandbox-coding-spec-draft.md。

內容需包含：
1. internal-only route 草案
2. sandbox provider interface 草案
3. state / nonce / code exchange helper 規格
4. redacted logging helper 規格
5. dry-run callback payload 格式
6. workspace allowlist 規格
7. 不建立 production Channel 的保護條件
8. 明確列出仍不修改正式 OAuth flow、callback、button、env

完成後請執行 git status、npm run lint、npm run build。npm test 可視情況略過，但要說明原因。
```
## 2026-06-16 - SBL-12 Callback Capture Guard Gate Update

| Gate | Status | Evidence |
| --- | --- | --- |
| Callback capture helper | Pass | `tests/meta-business-login-sandbox-sbl12-callback-capture.test.ts` |
| Signed-state route guard | Pass | `tests/meta-business-login-sandbox-sbl12-callback-route.test.ts` |
| Normal callback regression | Pass at invalid-state regression level | Non-sandbox callback still redirects through existing invalid-state path. |
| Real callback evidence | Hold | Browser has not yet produced a captured callback evidence packet. |
| Workspace linking | Hold | Dry-run only; no production ConnectedAccount / Channel write is allowed. |
| Channel sync | Hold | Dry-run only. |
| Redaction | Pass at unit / route-test level, Hold for real callback evidence | Raw code/state/full callback URL are not present in tested response bodies. |
| Internal beta | Hold | Requires real callback evidence and workspace/channel validation. |
| Production implementation | No-Go | Still blocked by App Review, env, callback, workspace linking, channel sync, redaction, and rollback gates. |

## 2026-06-16 - Controlled Consent Run Gate Update

Evidence:

```text
docs/meta-business-login-sandbox-controlled-consent-run-2026-06-16.md
```

| Gate | Status | Reason |
| --- | --- | --- |
| Production callback guard deployment | Pass | Signed-state probe returned redacted JSON evidence. |
| Account selection UX | Pass | Multiple Instagram profiles and use-another-profile were shown. |
| Consent reachability | Pass | Consent screen was shown without `force_reauth=true`. |
| `force_reauth=true` account selection | Partial Pass | It forces login/profile selection, but this browser run returned to Instagram home after profile choice. |
| Real callback evidence | Pass | User clicked allow; response body was redacted `sandbox_callback_capture` JSON. |
| Workspace linking | Hold | Not exercised. |
| Channel sync | Hold | Not exercised. |
| Redaction | Pass | Probe and real callback response body were redacted. |
| Internal beta | Hold | Still missing workspace linking and channel sync evidence. |
| Production implementation | No-Go | Still missing App Review and production rollout gates. |
