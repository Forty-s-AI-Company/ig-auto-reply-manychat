# Meta Business Login Sandbox Coding Kickoff Checklist

日期：2026-06-15  
狀態：Kickoff checklist only，尚未進入 sandbox coding  
範圍：Meta Business Login sandbox coding kickoff readiness

## 結論

目前仍不可進入 internal beta 或 production implementation。

若團隊接受 internal-only / dry-run-first / no-production-write 的限制，下一步可準備進入 **SBL-09 Sandbox Coding Test Suite scaffold planning**。  
SBL-01 internal-only route skeleton 必須等 SBL-09 的測試與 redaction 標準先確認後再開始。

## 1. 開始 SBL-09 前必須確認的文件與 Gate

SBL-09 目標：先建立 sandbox coding 的測試骨架與 redaction 搜尋標準，再開始 route 或 provider coding。

### 必讀文件

| 文件 | 必讀 | 用途 |
| --- | --- | --- |
| `docs/meta-business-login-sandbox-doc-index.md` | Yes | 確認文件路徑與決策順序 |
| `docs/meta-business-login-sandbox-final-readiness-review.md` | Yes | 確認目前 readiness 是 Hold |
| `docs/meta-business-login-sandbox-coding-task-breakdown.md` | Yes | 確認 SBL 任務拆解 |
| `docs/meta-business-login-sandbox-coding-risk-test-plan.md` | Yes | 確認最小測試清單 |
| `docs/meta-business-login-sandbox-go-no-go-checklist.md` | Yes | 確認只能進 sandbox coding，不是 beta / production |
| `docs/meta-business-login-sandbox-runbook-template.md` | Yes | 確認測試結果如何回填 |

### SBL-09 前置 Gate

| Gate | 必須確認 | 狀態 |
| --- | --- | --- |
| Go/no-go | 只允許標記 `Go to sandbox coding`，不得標記 beta / production |  |
| Scope | SBL-09 只建立測試骨架與 redaction 標準 |  |
| No production change | 不修改正式 OAuth / callback / button / env / schema |  |
| Test target | 測試目標包含 auth、allowlist、state、nonce、code exchange、redaction、dry-run、production write guard |  |
| Redaction | 禁止項目清單已確認 |  |
| Evidence | 測試結果要回填 runbook / report / go-no-go |  |

### SBL-09 最小產出

| 產出 | 要求 |
| --- | --- |
| 測試分類 | internal route、provider、state、nonce、code exchange、redaction、dry-run payload、allowlist、production write guard |
| safe fixture 標準 | fixture 不含 token、code、secret、raw state、raw nonce、full callback URL |
| redaction assertion 標準 | 可檢查禁止項目不得出現 |
| dry-run payload snapshot 標準 | payload 只能保存 redacted data |
| CI 驗證 | 至少維持 lint / build 通過 |

## 2. 開始 SBL-01 前必須確認的文件與 Gate

SBL-01 目標：建立 internal-only route skeleton。  
SBL-01 不應先於 SBL-09，除非已另行完成等效測試骨架與 redaction 標準。

### 必讀文件

| 文件 | 必讀 | 用途 |
| --- | --- | --- |
| `docs/meta-business-login-sandbox-coding-spec-draft.md` | Yes | route / helper / payload 規格 |
| `docs/meta-business-login-sandbox-coding-risk-test-plan.md` | Yes | route 風險與測試 |
| `docs/meta-business-login-sandbox-coding-task-breakdown.md` | Yes | SBL-01 任務要求 |
| `docs/meta-business-login-sandbox-go-no-go-checklist.md` | Yes | callback security / redaction gate |
| `docs/meta-business-login-sandbox-runbook-template.md` | Yes | route 測試結果回填 |

### SBL-01 前置 Gate

| Gate | 必須確認 | 狀態 |
| --- | --- | --- |
| SBL-09 | 測試骨架與 redaction 標準已準備 |  |
| Route scope | route 只能是 internal-only |  |
| Auth | 未登入使用者不得進入 authorize / callback dry-run |  |
| Workspace | 非 allowlist workspace 必須拒絕 |  |
| Provider | 非 sandbox provider id 必須拒絕 |  |
| State | 缺 state / invalid state 必須 safe fail |  |
| Response | route response 不得包含 token、code、raw state、raw nonce |  |
| UI isolation | route 不得掛到正式登入按鈕或正式 onboarding UI |  |
| Env isolation | 不得新增或修改 env |  |

### SBL-01 最小測試

| Test ID | 測試 | 預期 |
| --- | --- | --- |
| SBL01-001 | 未登入呼叫 authorize | 拒絕 |
| SBL01-002 | non-allowlist workspace 呼叫 authorize | `workspace_not_allowed` |
| SBL01-003 | 非 sandbox provider id | `unsupported_provider` 或 404 |
| SBL01-004 | callback 缺少 state | `invalid_state` |
| SBL01-005 | route response redaction | 不含 token / code / raw state / raw nonce |
| SBL01-006 | production route untouched | 現有 OAuth route 未修改 |

## 3. Internal-Only / Dry-Run-First / No-Production-Write 檢查項

### Internal-Only

| 檢查項 | 必須符合 |
| --- | --- |
| route 不出現在正式 UI | Yes |
| route 不被正式登入按鈕引用 | Yes |
| route 需要 user session | Yes |
| route 需要 workspace allowlist | Yes |
| route 只接受 sandbox provider id | Yes |
| route audit 必須 redacted | Yes |

### Dry-Run-First

| 檢查項 | 必須符合 |
| --- | --- |
| callback payload `mode=dry_run` | Yes |
| success payload `wouldCreateChannel=false` | Yes |
| 不寫 production token | Yes |
| 不建立 production ConnectedAccount | Yes |
| 不建立 production Channel | Yes |
| 不訂閱 production webhook | Yes |
| 不啟動 production token refresh | Yes |

### No-Production-Write

| 禁止動作 | 必須阻擋 |
| --- | --- |
| 建立 production Channel | Yes |
| 更新 production Channel | Yes |
| 建立 production ConnectedAccount | Yes |
| 更新 production ConnectedAccount token | Yes |
| 訂閱 production webhook | Yes |
| 修改 production env | Yes |
| 修改 production OAuth flow | Yes |

## 4. Redaction 搜尋標準

### 禁止項目

以下項目不得出現在 log、audit、console、response、network URL、snapshot、screenshot、recording、runbook、report 或 PR description：

- access token
- refresh token
- authorization code
- app secret
- client secret
- webhook verify token
- raw state
- raw nonce
- full callback URL
- reusable authorize URL
- Meta API raw error 中的敏感欄位

### 必查範圍

| 範圍 | 必查 | 備註 |
| --- | --- | --- |
| server log | Yes | 不得含禁止項目 |
| audit log | Yes | 只允許 redacted event |
| browser console | Yes | 不得含 code / token / raw state |
| response body | Yes | 只允許 dry-run redacted payload |
| network URL / query string | Yes | 不保存 full callback URL |
| test snapshot | Yes | fixture / snapshot 必須 redacted |
| screenshot / recording | Yes | 不得含可重放 URL |
| runbook / report | Yes | 只貼 redacted evidence |

### Redaction Pass 標準

```text
Redaction passes only if:
- No token is found.
- No authorization code is found.
- No app/client secret is found.
- No raw state or raw nonce is found.
- No full callback URL or reusable authorize URL is found.
- All selected Business / Page / IG ids are masked.
```

## 5. 每次 Coding 任務完成後必須回填哪些文件

| 任務 | 必須回填 |
| --- | --- |
| SBL-09 | `docs/meta-business-login-sandbox-runbook-template.md`、`docs/meta-business-login-sandbox-coding-risk-test-plan.md`、`docs/meta-business-login-sandbox-go-no-go-checklist.md` |
| SBL-01 | `docs/meta-business-login-sandbox-runbook-template.md`、`docs/meta-business-login-sandbox-experiment-report-template.md`、`docs/meta-business-login-sandbox-go-no-go-checklist.md` |
| SBL-02 | `docs/meta-business-login-sandbox-runbook-template.md`、`docs/meta-business-login-sandbox-experiment-report-template.md` |
| SBL-03 | `docs/meta-business-login-sandbox-runbook-template.md`、`docs/meta-business-login-sandbox-go-no-go-checklist.md` |
| SBL-04 | `docs/meta-business-login-sandbox-runbook-template.md`、`docs/meta-business-login-sandbox-experiment-report-template.md` |
| SBL-05 | `docs/meta-business-login-sandbox-runbook-template.md`、`docs/meta-business-login-sandbox-experiment-report-template.md`、`docs/security-review.md` |
| SBL-06 | `docs/meta-business-login-sandbox-runbook-template.md`、`docs/meta-business-login-sandbox-experiment-report-template.md` |
| SBL-07 | `docs/meta-business-login-sandbox-runbook-template.md`、`docs/meta-business-login-sandbox-go-no-go-checklist.md` |
| SBL-08 | `docs/meta-business-login-sandbox-runbook-template.md`、`docs/meta-business-login-sandbox-experiment-report-template.md`、`docs/meta-business-login-sandbox-go-no-go-checklist.md` |
| SBL-10 | `docs/meta-business-login-sandbox-experiment-report-template.md`、`docs/meta-business-login-sandbox-final-readiness-review.md` |

### 回填原則

- 不得貼 token、code、secret、raw state、raw nonce、full callback URL。
- 不得把 Hold 寫成 Go。
- 若有 redaction finding，go/no-go 必須維持 Hold 或 No-Go。
- 若有 production write 風險，go/no-go 必須維持 No-Go。
- 回填結果必須標明測試日期、run id、provider id、flow type、transport、workspace redacted id。

## 6. 仍不可進入 Internal Beta 或 Production Implementation

### Internal Beta 仍不可進入

原因：

- SBL-09 尚未開始。
- SBL-01 尚未開始。
- runbook 尚未有實測紀錄。
- experiment report 尚未有實測結果。
- App Review / UX / callback security / workspace linking / channel sync / redaction / rollback gate 均未通過。

Internal beta 最低條件：

1. sandbox coding 已完成 internal-only / dry-run-first。
2. runbook 已回填。
3. experiment report 已回填。
4. go/no-go checklist 達到 `Go to internal beta`。
5. allowlist workspace 已可控。
6. rollback 已演練。

### Production Implementation 仍不可進入

原因：

- App Review 未通過。
- ManyChat-like account selection UX 未實測通過。
- callback security 未實測通過。
- workspace linking / tenant isolation 未實測通過。
- channel sync 未實測通過。
- redaction 未實測通過。
- rollback 未演練通過。
- production implementation ADR / env migration plan / schema impact review / release rollback checklist 均不存在。

Production implementation 最低條件：

1. App Review required permissions 通過或有正式可用替代方案。
2. account selection UX 達到 P0，P1 缺口可接受。
3. callback security review 通過。
4. workspace linking / tenant isolation review 通過。
5. channel sync review 通過。
6. redaction 搜尋通過。
7. rollback 演練通過。
8. 另開 production implementation ADR。
9. 另開 env migration plan。
10. 另開 schema impact review。
11. 另開 release / rollback checklist。

## Kickoff Decision

```text
SBL-09 readiness: Ready to prepare, not yet executed
SBL-01 readiness: Hold until SBL-09 standards exist
Internal beta readiness: No-Go
Production implementation readiness: No-Go

Recommended first action:
- Start with SBL-09 Sandbox Coding Test Suite scaffold planning.
- Do not start SBL-01 route skeleton until redaction and dry-run test standards are defined.
```

## 下一個建議 Codex prompt

```text
請只新增 / 更新文件，不要修改產品功能程式碼，不要改 OAuth flow，不要改 callback route，不要改登入按鈕，不要改 env。

請根據 docs/meta-business-login-sandbox-coding-kickoff-checklist.md，建立 SBL-09 sandbox coding test suite scaffold 規格文件，檔案路徑為 docs/meta-business-login-sandbox-sbl09-test-suite-spec.md。

內容需包含：
1. 測試檔案命名草案
2. 測試 fixture redaction 規格
3. internal route auth / allowlist / provider guard 測試案例
4. state / nonce / code exchange 測試案例
5. redacted logging assertion 測試案例
6. dry-run payload schema 測試案例
7. production Channel write guard 測試案例
8. 明確列出這仍不是實作任務，不可改正式 OAuth / callback / button / env

完成後請執行 git status、npm run lint、npm run build。npm test 可視情況略過，但要說明原因。
```
