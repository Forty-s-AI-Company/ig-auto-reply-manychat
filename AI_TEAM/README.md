# AI_TEAM 總控

AI_TEAM 是 InboxPilot 的新無人值守開發總控系統。它的設計重點不是一個會自己亂跑的 autopilot，而是一套文件先行、角色分工清楚、可回顧、可停下、可交接的工作方式。

## 使用順序

1. 先讀 `PROJECT_STATE.md`，確認目前專案階段。
2. 再讀 `LAUNCH_CRITERIA.md`，知道什麼叫做真的可以上線。
3. 讀 `tasks/current-task.md` 與 `tasks/backlog.md`，決定這一輪要做什麼。
4. 依工作類型選對 `roles/` 與 `skills/` 文件。
5. 每一輪都把執行期輸出寫到 `runtime/`，不要把報告當成臨時垃圾桶，也不要把 runtime 輸出提交到 git。

## 當前原則

- 先做安全、可驗證、可回溯的事。
- 不碰 production DB，不做 production migration，不送 Meta App Review，不切 PayUNI production。
- 如果需要 secret、第三方登入、外部後台、正式金流或 production 寫入，就先停下來標記人工作業。
- 產品功能與開發流程分開看，`src/lib/ai/*` 這種產品功能橋接不要跟舊 autopilot runner 混在一起。

## 目錄

- `roles/`: 每個 AI 角色的責任與輸出
- `skills/`: 專案技能說明
- `tasks/`: 當前任務與待辦
- `reports/`: 每輪報告與交接
- `scripts/`: 安全的本機檢查與 QA 提示詞

## 常用指令

- `npm run ai-team`: 顯示目前 AI_TEAM 狀態
- `npm run ai-team:next`: 產生下一輪 Codex prompt
- `npm run ai-team:check`: 檢查 AI_TEAM 骨架是否完整
- `npm run ai-team:qa`: 執行本機 QA，包含 lint / test / build 與 `agy` Browser QA
- `npm run ai-team:qa:strict`: 測試 DB 不可用時直接失敗
- `npm run ai-team:models`: 呼叫本地 Ollama 模型產出報告與 next prompt
- `npm run ai-team:loop`: 持續執行 QA + 本地模型編排
- `npm run ai-team:loop:once`: 只跑一輪 runner

## 長跑 runner

- runner 每輪會依序做：
  1. `ai-team:check`
  2. `lint / test / build`
  3. `agy` Browser QA
  4. 本地 Ollama 模型產出 error summary / static QA / code review / final report / next prompt
- runner 會輸出 branch、dirty file 數、worktree 數與最近 QA 狀態。
- runner 的執行期輸出都寫到 `AI_TEAM/runtime/`，例如：
  - `AI_TEAM/runtime/qa-report.md`
  - `AI_TEAM/runtime/browser-qa.md`
  - `AI_TEAM/runtime/error-summary.md`
  - `AI_TEAM/runtime/static-qa.md`
  - `AI_TEAM/runtime/code-review.md`
  - `AI_TEAM/runtime/final-report.md`
  - `AI_TEAM/runtime/next-codex-prompt.md`
  - `AI_TEAM/runtime/runner-log.md`
- 完整設計見 `AI_TEAM/RUNNER_DESIGN.md`。

## Worktree 原則

- branch 是主體，worktree 只是短期隔離工具。
- 一個主題只保留一個 worktree。
- 合併後就清理，不把 worktree 當成長期資料夾。
- 完整規則見 `AI_TEAM/WORKTREE_POLICY.md`。

## 目前狀態

- 專案階段：`PRE_LAUNCH`
- 主要目標：先把看得到但不能用的功能修好，再收斂 launch gate
- 舊 root autopilot 入口：已退場，後續以 `AI_TEAM/` 為主

## 本地模型前提

- 預設使用 `ollama`
- 目前最小可用支援：
  - `qwen2.5-coder:7b`
  - `qwen3:8b`
  - `deepseek-coder-v2:lite`
  - `qwen2.5-coder:1.5b`
- Browser QA 預設使用 `agy`

若要先確認環境：

```bash
npm run ai-team:check
where.exe agy
ollama list
```
