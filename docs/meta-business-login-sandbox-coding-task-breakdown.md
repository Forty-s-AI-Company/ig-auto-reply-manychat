# Meta Business Login Sandbox Coding Task Breakdown

日期：2026-06-15  
狀態：Task breakdown only，尚未進入 sandbox coding  
範圍：Meta Business Login sandbox internal-only / dry-run-first coding planning

## 文件目的

本文件把未來可能的 Meta Business Login sandbox coding 拆成小任務。這不是實作任務，仍然只允許新增 / 更新文件。

所有 coding 任務都必須遵守：

- internal-only。
- dry-run-first。
- sandbox provider only。
- workspace allowlist only。
- 不掛正式 UI。
- 不改 production env。
- 不建立 production Channel。
- 不取代 `meta-instagram`。

## 仍不可進入 Production Implementation

目前仍不可進入 production implementation。

原因：

1. App Review gate 尚未通過。
2. account selection UX gate 尚未通過。
3. callback security gate 尚未通過。
4. workspace linking gate 尚未通過。
5. channel sync gate 尚未通過。
6. redaction gate 尚未通過。
7. rollback gate 尚未通過。
8. sandbox runbook 尚未執行。
9. experiment report 尚未填寫。
10. go/no-go checklist 尚未達到 `Go to production implementation`。

## Coding 任務總覽

| Task ID | 任務 | 允許階段 | 產出 | 是否可碰正式 flow |
| --- | --- | --- | --- | --- |
| SBL-01 | 建立 internal-only route skeleton | sandbox coding | internal route 草案實作 | No |
| SBL-02 | 建立 sandbox provider interface | sandbox coding | provider contract / registry guard | No |
| SBL-03 | 建立 state / nonce helpers | sandbox coding | state TTL / single-use / nonce validation | No |
| SBL-04 | 建立 server-side code exchange helper | sandbox coding | code exchange wrapper / safe errors | No |
| SBL-05 | 建立 redacted logging helper | sandbox coding | redaction / audit helper | No |
| SBL-06 | 建立 dry-run callback payload builder | sandbox coding | success / error dry-run payload | No |
| SBL-07 | 建立 workspace allowlist guard | sandbox coding | allowlist validation | No |
| SBL-08 | 建立 production Channel write guard | sandbox coding | channel write blocking / dry-run guard | No |
| SBL-09 | 建立 sandbox coding test suite | sandbox coding | unit / integration style tests | No |
| SBL-10 | 回填 runbook / report / go-no-go | documentation | 實測紀錄與 decision update | No |

## SBL-01：Internal-Only Route Skeleton

### 任務內容

建立 internal-only route skeleton，用於 sandbox authorize / callback dry-run。route 不得掛到正式登入按鈕。

建議 route：

```text
/api/internal/oauth/meta-business-facebook-sandbox/authorize
/api/internal/oauth/meta-business-facebook-sandbox/callback
/api/internal/oauth/meta-business-instagram-sandbox/authorize
/api/internal/oauth/meta-business-instagram-sandbox/callback
```

### 前置 Gate

| Gate | 要求 |
| --- | --- |
| Go/no-go | 必須是 `Go to sandbox coding` |
| App Review | demo script / permission table 草案已存在 |
| Security | internal-only route risk 已 review |
| Workspace | allowlist 策略已確認 |
| Redaction | route 不記錄 full URL 的規格已確認 |

### 測試要求

- 未登入使用者呼叫 route 必須被拒絕。
- 非 allowlist workspace 必須被拒絕。
- 非 sandbox provider id 必須被拒絕。
- callback 缺少 state 必須回 `invalid_state`。
- route response 不得包含 token、code、raw state、raw nonce。

### 不得修改

- `/api/oauth/[provider]/authorize`
- `/api/oauth/[provider]/callback`
- `/api/meta/oauth/start`
- `/api/meta/oauth/callback`
- `/api/instagram/oauth/callback`
- 正式登入按鈕
- env

### 回填文件

- runbook：記錄 route access 測試。
- report：記錄 callback security 初步結果。
- go/no-go checklist：更新 callback security gate。

## SBL-02：Sandbox Provider Interface

### 任務內容

建立 sandbox provider interface 與 provider id guard。此 interface 不得取代既有 `meta-instagram` 或 `meta-facebook` provider。

### 前置 Gate

| Gate | 要求 |
| --- | --- |
| Provider naming | `meta-business-facebook-sandbox` / `meta-business-instagram-sandbox` 已確認 |
| Production isolation | 不會進入正式 provider registry |
| App Review | flowType 與 permission scope 目的已對齊文件 |

### 測試要求

- 非 sandbox provider id 必須被拒絕。
- build authorize URL 不含 raw state、token、secret。
- provider output 必須有 `flowType`。
- selected assets 必須 normalized + redacted。
- dry-run payload 必須 `wouldCreateChannel=false`。

### 不得修改

- `meta-instagram` provider
- `meta-facebook` provider
- production provider registry
- 正式 UI provider list

### 回填文件

- runbook：記錄 provider id / flowType。
- report：記錄 selected asset mapping。
- go/no-go checklist：更新 account selection UX / callback security gate。

## SBL-03：State / Nonce Helpers

### 任務內容

建立 sandbox-only state / nonce helpers。state 必須 opaque、短 TTL、single-use，nonce 必須 hash 或 server-side reference。

### 前置 Gate

| Gate | 要求 |
| --- | --- |
| Callback security | state / nonce 規格已 review |
| Redaction | raw state / raw nonce 禁止記錄 |
| Workspace linking | workspace 只信 server-side state |

### 測試要求

- state 對外是不透明字串。
- state 過期回 `invalid_state`。
- state 重放回 `invalid_state`。
- provider mismatch 回 `invalid_state`。
- workspace mismatch 回 `workspace_mismatch`。
- nonce mismatch 回 `nonce_mismatch`。
- log / audit / docs 不含 raw state / raw nonce。

### 不得修改

- 現有 production OAuth state helper。
- 現有 callback route。
- 現有 cookies / state format。
- env。

### 回填文件

- runbook：記錄 state / nonce 測試結果。
- report：記錄 callback security 結論。
- go/no-go checklist：更新 callback security gate。

## SBL-04：Server-Side Code Exchange Helper

### 任務內容

建立 sandbox-only code exchange helper。authorization code 只能在 server-side 使用，不得回前端、不進 log、不進 audit。

### 前置 Gate

| Gate | 要求 |
| --- | --- |
| Callback security | code exchange 規格已確認 |
| Redaction | code / token redaction test 已列出 |
| App Review | target scopes 已確認 |

### 測試要求

- code 不出現在 browser console。
- code 不出現在 response body。
- code 不出現在 server log / audit。
- token 不出現在 server log / audit / payload。
- exchange failure 回 `token_exchange_failed`。

### 不得修改

- production token exchange flow。
- production token storage。
- env。
- Prisma schema。

### 回填文件

- runbook：記錄 token exchange redaction。
- report：記錄 callback / redaction 結果。
- go/no-go checklist：更新 callback security / redaction gate。

## SBL-05：Redacted Logging Helper

### 任務內容

建立 sandbox-only redaction / audit helper。所有 audit event 必須 redacted。

### 前置 Gate

| Gate | 要求 |
| --- | --- |
| Redaction | 禁止欄位清單已確認 |
| Security | audit event schema 已 review |
| App Review | demo / recording 不含敏感資料 |

### 測試要求

- access token 不得記錄。
- refresh token 不得記錄。
- authorization code 不得記錄。
- app secret / client secret 不得記錄。
- raw state / raw nonce 不得記錄。
- full callback URL 不得記錄。
- Meta API raw error 必須清理。

### 不得修改

- production audit behavior。
- production logging format。
- env。

### 回填文件

- runbook：記錄 redaction 搜尋。
- report：記錄 redaction 結論。
- go/no-go checklist：更新 redaction gate。

## SBL-06：Dry-Run Callback Payload Builder

### 任務內容

建立 dry-run callback payload builder。payload 只能描述 would-create 結果，不得建立 production ConnectedAccount / Channel。

### 前置 Gate

| Gate | 要求 |
| --- | --- |
| Callback security | state / nonce / code exchange 已通過基本測試 |
| Workspace linking | allowlist 已確認 |
| Channel sync | production write guard 已設計 |

### 測試要求

- success payload `mode=dry_run`。
- success payload `wouldCreateChannel=false`。
- error payload 使用 safe error type。
- payload 不含 token、code、secret、raw state。
- payload asset ids 已 redacted。

### 不得修改

- production ConnectedAccount write path。
- production Channel write path。
- production channel sync。

### 回填文件

- runbook：記錄 callback payload。
- report：記錄 dry-run callback 結果。
- go/no-go checklist：更新 callback security / channel sync gate。

## SBL-07：Workspace Allowlist Guard

### 任務內容

建立 sandbox-only workspace allowlist guard。authorize、callback、dry-run sync 三段都必須檢查。

### 前置 Gate

| Gate | 要求 |
| --- | --- |
| Workspace linking | allowlist 來源已決定 |
| Security | query workspace spoofing 測試已列出 |
| Rollback | allowlist 可快速停用 |

### 測試要求

- allowlist workspace 可進入 authorize。
- non-allowlist workspace 被拒絕。
- callback 時移出 allowlist 會被拒絕。
- dry-run sync 前再次檢查 allowlist。
- query / postMessage / return URL workspace spoofing 不被信任。

### 不得修改

- production workspace membership logic。
- production env。
- Prisma schema。

### 回填文件

- runbook：記錄 workspace allowlist 測試。
- report：記錄 workspace linking 結論。
- go/no-go checklist：更新 workspace linking gate。

## SBL-08：Production Channel Write Guard

### 任務內容

建立 production Channel write guard，確保 sandbox flow 不建立、不更新、不訂閱 production Channel / webhook。

### 前置 Gate

| Gate | 要求 |
| --- | --- |
| Channel sync | dry-run scope 已確認 |
| Security | production write risk 已 review |
| Rollback | 測試資料清理策略已確認 |

### 測試要求

- dry-run success 不建立 production Channel。
- dry-run error 不建立 production Channel。
- sandbox provider 不能進 production sync path。
- non-allowlist sync attempt 被拒絕。
- token 不寫 production account。
- webhook 不訂閱 production target。
- 測試前後 production Channel count 不變。

### 不得修改

- production Channel schema。
- production channel sync path。
- production webhook subscription。
- production token refresh job。

### 回填文件

- runbook：記錄 production Channel guard 測試。
- report：記錄 channel sync 結論。
- go/no-go checklist：更新 channel sync / rollback gate。

## SBL-09：Sandbox Coding Test Suite

### 任務內容

建立 sandbox coding 的最小測試。若未來真的進入 coding，此 task 必須與 SBL-01 到 SBL-08 同步或先行。

### 前置 Gate

| Gate | 要求 |
| --- | --- |
| Risk test plan | 最小測試清單已確認 |
| Redaction | 禁止項目搜尋方式已確認 |
| CI | lint / build 維持通過 |

### 測試要求

- internal route auth / allowlist / provider guard。
- state TTL / single-use / mismatch。
- nonce mismatch。
- code exchange safe failure。
- redacted logging。
- dry-run payload schema。
- production Channel write guard。

### 不得修改

- production OAuth tests 的成功行為。
- production route behavior。
- env。

### 回填文件

- runbook：記錄測試 command 與結果。
- report：整理測試摘要。
- go/no-go checklist：更新所有 relevant gates。

## SBL-10：Runbook / Report / Go-No-Go 回填

### 任務內容

每完成一個 sandbox coding task，都必須回填文件，避免 coding 進度和審查證據脫節。

### 前置 Gate

| Gate | 要求 |
| --- | --- |
| Runbook | 有對應測試紀錄欄位 |
| Report | 有對應結果摘要欄位 |
| Go/no-go | 有對應 gate |

### 回填要求

| 文件 | 回填內容 |
| --- | --- |
| `docs/meta-business-login-sandbox-runbook-template.md` | 實測 run id、redacted URL、callback payload、UX / callback / redaction 結果 |
| `docs/meta-business-login-sandbox-experiment-report-template.md` | 實驗摘要、測試組合、UX 結論、安全結論 |
| `docs/meta-business-login-sandbox-go-no-go-checklist.md` | gate pass / hold / no-go 狀態 |
| `docs/meta-business-login-sandbox-coding-risk-test-plan.md` | 測試是否已完成與剩餘風險 |

### 不得修改

- 不得用回填文件取代必要測試。
- 不得在文件中貼 token、code、secret、raw state、raw nonce、full callback URL。
- 不得把 Hold 寫成 Go。

## 任務執行順序建議

```text
SBL-09 Test Suite scaffold planning
  |
  v
SBL-01 Internal-only route skeleton
  |
  v
SBL-03 State / nonce helpers
  |
  v
SBL-04 Server-side code exchange helper
  |
  v
SBL-05 Redacted logging helper
  |
  v
SBL-02 Sandbox provider interface
  |
  v
SBL-07 Workspace allowlist guard
  |
  v
SBL-06 Dry-run callback payload builder
  |
  v
SBL-08 Production Channel write guard
  |
  v
SBL-10 Runbook / report / go-no-go update
```

## 最小完成條件

未來若開 sandbox coding 任務，至少要達成：

1. 所有 sandbox route 只允許 internal-only access。
2. 所有 sandbox callback 都是 dry-run-first。
3. 所有 state / nonce / code exchange 測試通過。
4. 所有 redaction 搜尋通過。
5. workspace allowlist 在 authorize / callback / dry-run sync 三段生效。
6. production Channel write guard 通過。
7. 現有 `meta-instagram` flow 不受影響。
8. `npm run lint`、`npm run build` 通過。
9. runbook、report、go/no-go checklist 已回填。
10. 結論仍不得自動升級到 production implementation。

## 下一個建議 Codex prompt

```text
請只新增 / 更新文件，不要修改產品功能程式碼，不要改 OAuth flow，不要改 callback route，不要改登入按鈕，不要改 env。

請根據 docs/meta-business-login-sandbox-coding-task-breakdown.md，建立 sandbox coding 前的 final readiness review，檔案路徑為 docs/meta-business-login-sandbox-final-readiness-review.md。

內容需包含：
1. 目前所有 sandbox 文件是否齊備
2. 是否可進入 sandbox coding
3. 仍缺哪些實測證據
4. App Review / UX / callback security / workspace linking / channel sync / redaction / rollback gate 狀態
5. sandbox coding 若開始，第一個任務應該是哪一個
6. 明確列出仍不可進入 internal beta 或 production implementation

完成後請執行 git status、npm run lint、npm run build。npm test 可視情況略過，但要說明原因。
```
