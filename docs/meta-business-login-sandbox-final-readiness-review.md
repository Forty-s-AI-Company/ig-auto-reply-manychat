# Meta Business Login Sandbox Final Readiness Review

日期：2026-06-15  
狀態：Final readiness review，documentation-only  
範圍：Meta Business Login sandbox coding 前檢查

## 結論

目前文件鏈已大致齊備，可以作為「是否準備進入 sandbox coding」的審查基礎。

但目前仍不可進入 internal beta 或 production implementation。

是否可進入 sandbox coding：**Hold，接近可進入，但仍需先做 go/no-go 明確決策與補齊最小實測準備證據。**

理由：

- 文件已涵蓋研究、ADR、實驗規格、App Review demo、account selection matrix、sandbox plan、runbook、report template、go/no-go checklist、coding spec、risk test plan、task breakdown。
- 但尚未有真實 sandbox OAuth dialog、callback payload、workspace linking、channel sync、redaction 搜尋或 rollback 演練結果。
- 因此最多只能準備 `Go to sandbox coding`，不能升級到 internal beta，更不能進 production implementation。

## 1. 目前所有 Sandbox 文件是否齊備

| 文件 | 狀態 | 是否齊備 | 備註 |
| --- | --- | --- | --- |
| `docs/meta-login-account-selection-analysis.md` | analysis | Yes | 現況與限制已整理 |
| `docs/adr-meta-business-login-before-implementation.md` | ADR / proposed | Yes | 建議 sandbox-only，不直接改正式產品 |
| `docs/meta-business-login-experiment-spec.md` | experiment spec | Yes | 已定義研究與實驗範圍 |
| `docs/meta-business-login-app-review-demo-script.md` | App Review script | Yes | 已有 reviewer demo 與 permission 用途框架 |
| `docs/meta-business-login-account-selection-test-matrix.md` | test matrix | Yes | 已有 account selection 測試矩陣 |
| `docs/meta-business-login-sandbox-implementation-plan.md` | planning only | Yes | 已有 sandbox-only 技術計畫 |
| `docs/meta-business-login-sandbox-runbook-template.md` | template | Yes | 已有實測紀錄模板 |
| `docs/meta-business-login-sandbox-experiment-report-template.md` | template | Yes | 已有結果報告模板 |
| `docs/meta-business-login-sandbox-go-no-go-checklist.md` | checklist | Yes | 已有階段 gate |
| `docs/meta-business-login-sandbox-coding-spec-draft.md` | draft | Yes | 已有 coding 前技術草案 |
| `docs/meta-business-login-sandbox-coding-risk-test-plan.md` | test plan | Yes | 已有風險與測試計畫 |
| `docs/meta-business-login-sandbox-doc-index.md` | index | Yes | 已有文件索引與決策路徑 |
| `docs/meta-business-login-sandbox-coding-task-breakdown.md` | task breakdown | Yes | 已有 coding 任務拆解 |

文件齊備度結論：

```text
Documentation readiness: Mostly ready
Execution evidence readiness: Not ready
Production readiness: Not ready
```

## 2. 是否可進入 Sandbox Coding

### 判定

| 判定項目 | 結果 | 說明 |
| --- | --- | --- |
| 可否進入 sandbox coding | Hold | 文件已齊，但尚未完成 go/no-go 正式確認 |
| 可否進入 internal beta | No | 尚未有實測結果與 gate 通過證據 |
| 可否進入 production implementation | No | App Review / UX / security / linking / sync / rollback gate 均未通過 |

### 進入 Sandbox Coding 前的最低條件

進入 sandbox coding 前，至少要完成：

1. 在 `docs/meta-business-login-sandbox-go-no-go-checklist.md` 明確標記 `Go to sandbox coding`。
2. 確認 sandbox coding 第一階段只允許 internal-only route skeleton。
3. 確認不新增、不修改 production OAuth flow。
4. 確認不新增、不修改正式登入按鈕。
5. 確認不修改 env。
6. 確認不建立 production ConnectedAccount / Channel。
7. 確認測試計畫至少覆蓋 auth、allowlist、state、nonce、code exchange、redaction、dry-run payload、production Channel write guard。

## 3. 仍缺哪些實測證據

| 類別 | 缺少證據 | 影響 |
| --- | --- | --- |
| Meta dialog UX | 未跑實際 Facebook Login for Business / Instagram Business Login dialog | 無法判斷是否接近 ManyChat |
| Account selection | 未測未登入、單帳號、多帳號、錯帳號、無資產情境 | UX gate 不可通過 |
| Callback payload | 未取得 redacted callback payload | callback security / mapping 無法確認 |
| State / nonce | 未實測 TTL、single-use、mismatch | callback security gate 不可通過 |
| Code exchange | 未實測 server-side exchange 成功 / 失敗 | token handling 風險未知 |
| Workspace linking | 未實測 workspace allowlist 與 spoofing | tenant isolation 風險未知 |
| Channel sync | 未實測 dry-run channel sync 與 write guard | 可能誤建 production Channel |
| Redaction | 未搜尋 log / audit / console / screenshot / recording | 無法證明無敏感資料外洩 |
| Rollback | 未演練停用 sandbox / 清理測試資料 | 不可進 beta / production |
| App Review | 未完成 reviewer-ready demo 與實測錄影 | 不可進 production |

## 4. Gate 狀態

### App Review Gate

狀態：**Not passed**

原因：

- reviewer demo script 有草案，但尚未用實際 sandbox flow 驗證。
- permission usage table 有框架，但尚未提交或取得實際 App Review 結果。
- Business / Page / IG test assets 尚未以 reviewer-ready 狀態驗收。
- redacted screen recording 尚未完成。

### Account Selection UX Gate

狀態：**Not passed**

原因：

- 未跑 account selection test matrix。
- 未確認未登入、已登入單帳號、多帳號情境的 Meta dialog 表現。
- 尚未證明 Business / Page / IG account selection 可穩定接近 ManyChat。

### Callback Security Gate

狀態：**Not passed**

原因：

- state / nonce / code exchange 仍是文件規格。
- 尚未有 sandbox callback payload。
- 尚未驗證 invalid state、nonce mismatch、token exchange failed 等錯誤分類。

### Workspace Linking Gate

狀態：**Not passed**

原因：

- workspace allowlist 尚未實作或測試。
- callback query workspace spoofing 尚未測試。
- selected Business / Page / IG 與 workspace policy 的 mapping 尚未實測。

### Channel Sync Gate

狀態：**Not passed**

原因：

- dry-run channel sync 尚未實作。
- production Channel write guard 尚未實測。
- token source、asset mapping、webhook timing 尚未驗證。

### Redaction Gate

狀態：**Not passed**

原因：

- 尚未跑 server log、audit log、browser console、network URL、screenshot、recording 搜尋。
- 尚未證明 token、authorization code、secret、raw state、raw nonce、full callback URL 不會外洩。

### Rollback Gate

狀態：**Not passed**

原因：

- sandbox feature flag / allowlist 停用流程尚未實作。
- 測試資料清理流程尚未演練。
- fallback 回現有 `meta-instagram` flow 尚未以 beta / production 情境驗證。

## 5. Sandbox Coding 若開始，第一個任務

建議第一個任務：**SBL-09 Sandbox Coding Test Suite scaffold planning**。

理由：

- 先建立測試骨架與 redaction 搜尋規格，可以防止後續 SBL-01 route skeleton 寫出來後才補安全測試。
- 這符合目前文件鏈的保守原則：先測試邊界，再建立 internal-only route。
- 可先確認 lint / build / test command、fixture 命名、safe payload snapshot、redaction assertion 的標準。

若使用者希望先做最小可見成果，第二順位才是：

```text
SBL-01 Internal-only route skeleton
```

但 SBL-01 開始前仍必須確認：

- `Go to sandbox coding` 已在 go/no-go checklist 標示。
- route 不掛正式 UI。
- route 不改正式 OAuth / callback。
- route 不改 env。
- route 預設 dry-run。
- route response 不含 token / code / raw state / raw nonce。

## 6. 仍不可進入 Internal Beta 或 Production Implementation

### 不可進入 Internal Beta

原因：

- 尚未有 sandbox coding 結果。
- 尚未有 runbook 實測紀錄。
- 尚未有 experiment report。
- account selection UX gate 尚未通過。
- callback security / workspace linking / channel sync / redaction / rollback gate 均未通過。

Internal beta 最低要求：

1. sandbox coding 完成 internal-only / dry-run-first。
2. runbook 已回填。
3. experiment report 已回填。
4. go/no-go checklist 達到 `Go to internal beta`。
5. allowlist workspace 已可控。
6. rollback 已演練。

### 不可進入 Production Implementation

原因：

- App Review 尚未通過。
- account selection UX 尚未證明可接受。
- production migration / env plan 尚未存在。
- schema impact review 尚未存在。
- release / rollback checklist 尚未存在。
- 目前所有 sandbox 文件都只是 planning / template / draft / checklist / review。

Production implementation 最低要求：

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

## Final Readiness Decision

```text
Documentation readiness: Mostly ready
Sandbox coding readiness: Hold
Internal beta readiness: No-Go
Production implementation readiness: No-Go

Recommended next action:
- Mark go/no-go checklist explicitly as Go to sandbox coding only if the team accepts internal-only / dry-run-first constraints.
- Start with SBL-09 Sandbox Coding Test Suite scaffold planning.
- Do not begin internal beta or production implementation.
```

## 下一個建議 Codex prompt

```text
請只新增 / 更新文件，不要修改產品功能程式碼，不要改 OAuth flow，不要改 callback route，不要改登入按鈕，不要改 env。

請根據 docs/meta-business-login-sandbox-final-readiness-review.md，建立 sandbox coding kickoff checklist，檔案路徑為 docs/meta-business-login-sandbox-coding-kickoff-checklist.md。

內容需包含：
1. 開始 SBL-09 前必須確認的文件與 gate
2. 開始 SBL-01 前必須確認的文件與 gate
3. internal-only / dry-run-first / no-production-write 的檢查項
4. redaction 搜尋標準
5. 每次 coding 任務完成後必須回填哪些文件
6. 明確列出仍不可進入 internal beta 或 production implementation

完成後請執行 git status、npm run lint、npm run build。npm test 可視情況略過，但要說明原因。
```
