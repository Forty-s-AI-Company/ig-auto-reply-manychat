# Meta Business Login Sandbox Document Index

日期：2026-06-15  
狀態：Index only，文件索引與決策路徑圖  
範圍：Meta Business Login sandbox research / ADR / experiment / App Review / go-no-go / coding readiness documents

## 目前結論

目前仍不可進入 production implementation。

原因：

1. Facebook Login for Business / Instagram Business Login 尚未完成 sandbox 實測。
2. App Review 尚未以最終 reviewer demo、permission usage table、測試資產與錄影證據完成驗收。
3. Account selection UX 尚未證明能穩定接近 ManyChat。
4. Callback security、workspace linking、channel sync、redaction、rollback gate 尚未以實測結果通過。
5. 目前文件多數仍是 `template`、`draft` 或 `planning only`，不是已執行結果。
6. production OAuth flow、callback、button、env、schema、ConnectedAccount、Channel 仍不得修改。

## 文件閱讀順序

建議順序：

1. `docs/meta-login-account-selection-analysis.md`
2. `docs/adr-meta-business-login-before-implementation.md`
3. `docs/meta-business-login-experiment-spec.md`
4. `docs/meta-business-login-app-review-demo-script.md`
5. `docs/meta-business-login-account-selection-test-matrix.md`
6. `docs/meta-business-login-sandbox-implementation-plan.md`
7. `docs/meta-business-login-sandbox-runbook-template.md`
8. `docs/meta-business-login-sandbox-experiment-report-template.md`
9. `docs/meta-business-login-sandbox-go-no-go-checklist.md`
10. `docs/meta-business-login-sandbox-coding-spec-draft.md`
11. `docs/meta-business-login-sandbox-coding-risk-test-plan.md`
12. `docs/meta-business-login-sandbox-doc-index.md`

## 每份文件用途

| 文件 | 狀態 | 用途 | 目前可用來做什麼 |
| --- | --- | --- | --- |
| `docs/meta-login-account-selection-analysis.md` | analysis | 說明現有 Instagram / Meta OAuth flow、OAuth URL、ManyChat 差異與強制選帳號限制 | 作為問題背景與現況基準 |
| `docs/adr-meta-business-login-before-implementation.md` | ADR / proposed | 比較維持現狀、Facebook Login for Business、Instagram Business Login 三種方案 | 作為是否進 sandbox-only 的決策依據 |
| `docs/meta-business-login-experiment-spec.md` | experiment spec | 定義 Facebook Login for Business / Instagram Business Login 是否能取代現有流程的研究範圍 | 作為實驗設計起點 |
| `docs/meta-business-login-app-review-demo-script.md` | App Review script | 定義 reviewer demo、permission 用途、錄影腳本與備援方案 | 作為 App Review 準備材料 |
| `docs/meta-business-login-account-selection-test-matrix.md` | test matrix | 定義未登入、單帳號、多帳號、popup / redirect / mobile 等測試矩陣 | 作為 UX 實測清單 |
| `docs/meta-business-login-sandbox-implementation-plan.md` | planning only | 定義 sandbox provider、env 草案、authorize / callback / state / nonce / code exchange 邊界 | 作為 sandbox-only 技術計畫 |
| `docs/meta-business-login-sandbox-runbook-template.md` | template | 定義每次 sandbox 實驗要如何記錄 redacted URL、callback payload、UX 觀察與 redaction 結果 | 作為實測紀錄表 |
| `docs/meta-business-login-sandbox-experiment-report-template.md` | template | 定義如何把 runbook 結果整理成實驗報告 | 作為實驗後報告範本 |
| `docs/meta-business-login-sandbox-go-no-go-checklist.md` | checklist | 定義 sandbox coding、internal beta、production implementation 的 gate 差異 | 作為階段決策清單 |
| `docs/meta-business-login-sandbox-coding-spec-draft.md` | draft | 定義 internal-only route、sandbox provider interface、helper、dry-run payload、allowlist 與 production guard | 作為 coding 前技術草案 |
| `docs/meta-business-login-sandbox-coding-risk-test-plan.md` | test plan | 定義 sandbox coding 前的風險與最小測試清單 | 作為 coding readiness 檢查 |
| `docs/meta-business-login-sandbox-doc-index.md` | index | 整理所有文件用途、順序、決策路徑與未通過 gate | 作為入口索引 |

## 決策路徑圖

```text
現況研究
  |
  v
docs/meta-login-account-selection-analysis.md
  |
  v
ADR：是否值得進 sandbox-only
  |
  v
docs/adr-meta-business-login-before-implementation.md
  |
  v
實驗規格：比較 Facebook Login for Business / Instagram Business Login / 維持現狀
  |
  v
docs/meta-business-login-experiment-spec.md
  |
  +--> App Review 準備
  |      |
  |      v
  |   docs/meta-business-login-app-review-demo-script.md
  |
  +--> Account selection 測試矩陣
         |
         v
      docs/meta-business-login-account-selection-test-matrix.md
         |
         v
Sandbox-only 技術計畫
  |
  v
docs/meta-business-login-sandbox-implementation-plan.md
  |
  v
Runbook 實測紀錄模板
  |
  v
docs/meta-business-login-sandbox-runbook-template.md
  |
  v
Experiment report 結果報告模板
  |
  v
docs/meta-business-login-sandbox-experiment-report-template.md
  |
  v
Go / No-Go 階段審查
  |
  v
docs/meta-business-login-sandbox-go-no-go-checklist.md
  |
  +--> Hold / No-Go
  |      |
  |      v
  |   維持現有 meta-instagram flow，補測或補 App Review / UX / security evidence
  |
  +--> Go to sandbox coding
         |
         v
      docs/meta-business-login-sandbox-coding-spec-draft.md
         |
         v
      docs/meta-business-login-sandbox-coding-risk-test-plan.md
         |
         v
      仍需另開 coding 任務，且只能 internal-only / dry-run-first
```

## Template / Draft 狀態

| 文件 | 狀態 | 是否已有實測結果 |
| --- | --- | --- |
| `docs/meta-business-login-sandbox-implementation-plan.md` | planning only | No |
| `docs/meta-business-login-sandbox-runbook-template.md` | template | No |
| `docs/meta-business-login-sandbox-experiment-report-template.md` | template | No |
| `docs/meta-business-login-sandbox-go-no-go-checklist.md` | checklist | No |
| `docs/meta-business-login-sandbox-coding-spec-draft.md` | draft | No |
| `docs/meta-business-login-sandbox-coding-risk-test-plan.md` | test plan | No |

## 尚未通過的 Gate

### App Review Gate

尚未通過：

- reviewer demo flow 尚未以真實 sandbox 測試完成。
- permission usage table 尚未提交或取得最終核准。
- Business / Page / IG test assets 尚未完成 reviewer-ready 驗收。
- screen recording 尚未以 redacted 版本完成。
- Business Verification / Advanced Access 狀態尚未作為 go condition 實測確認。

### Account Selection UX Gate

尚未通過：

- 未登入 Meta / Instagram 情境尚未實測。
- 已登入單一 Facebook / IG 帳號情境尚未實測。
- 曾登入多個 Facebook / IG 帳號情境尚未實測。
- desktop Chrome、mobile browser、popup、redirect transport 尚未跑完矩陣。
- 尚未證明能穩定接近 ManyChat account selection UX。

### Callback Security Gate

尚未通過：

- opaque state、TTL、single-use、provider binding、workspace binding 尚未實作或實測。
- nonce mismatch handling 尚未實作或實測。
- server-side code exchange 尚未以 sandbox route 實測。
- callback error classification 尚未以實際 callback payload 驗證。

### Workspace Linking Gate

尚未通過：

- workspace allowlist 尚未實作或驗證。
- callback query workspace spoofing 尚未測試。
- selected Business / Page / IG account 與 workspace policy 的 mapping 尚未實測。
- duplicate IG account across workspace policy 尚未定稿。

### Channel Sync Gate

尚未通過：

- dry-run channel sync 尚未實作或實測。
- production Channel write guard 尚未實作或實測。
- Page token / user token / IG token source 尚未以 sandbox payload 確認。
- webhook subscription timing 尚未驗證。

### Redaction Gate

尚未通過：

- server log、audit log、browser console、network URL、screenshot、recording 尚未跑 redaction 搜尋。
- 尚未證明 token、authorization code、secret、raw state、raw nonce、full callback URL 不會外洩。

### Rollback Gate

尚未通過：

- sandbox feature flag / allowlist 停用流程尚未實作或演練。
- 測試 ConnectedAccount / Channel 清理流程尚未演練。
- fallback 回現有 `meta-instagram` flow 的 internal beta / production rollback 流程尚未驗證。

## 目前仍不可進入 Production Implementation

目前只可停留在 documentation / planning 階段。即使下一步進入 sandbox coding，也仍只能是：

- internal-only。
- dry-run-first。
- sandbox provider only。
- workspace allowlist only。
- 不掛正式 UI。
- 不改 production env。
- 不建立 production Channel。
- 不取代 `meta-instagram`。

要進入 production implementation，至少還需要：

1. sandbox runbook 實測完成。
2. experiment report 填寫完成。
3. go/no-go checklist 明確達到 `Go to production implementation`。
4. App Review required permissions 通過或有正式可用替代方案。
5. account selection UX 達到 P0，且 P1 缺口可接受。
6. callback security review 通過。
7. workspace linking / tenant isolation review 通過。
8. channel sync review 通過。
9. redaction 搜尋通過。
10. rollback 演練通過。
11. 另開 production implementation ADR。
12. 另開 env migration plan、schema impact review、release / rollback checklist。

## 下一個建議 Codex prompt

```text
請只新增 / 更新文件，不要修改產品功能程式碼，不要改 OAuth flow，不要改 callback route，不要改登入按鈕，不要改 env。

請根據 docs/meta-business-login-sandbox-doc-index.md，建立一份 Meta Business Login sandbox coding 任務拆解文件，檔案路徑為 docs/meta-business-login-sandbox-coding-task-breakdown.md。

內容需包含：
1. 只允許 internal-only / dry-run-first 的 coding 任務拆解
2. 每個任務的前置 gate
3. 每個任務的測試要求
4. 每個任務不得修改的檔案或流程
5. 任務完成後如何回填 runbook / report / go-no-go checklist
6. 明確列出仍不可進入 production implementation

完成後請執行 git status、npm run lint、npm run build。npm test 可視情況略過，但要說明原因。
```
