# AI_TEAM Runner Design

AI_TEAM runner 是本機長跑控制台，不是會自動操作 production 的背景機器人。

## 目前能力

- 讀取 AI_TEAM source of truth。
- 彙整目前任務、backlog、final report 與 QA report。
- 輸出下一輪 Codex prompt。
- 寫入 `AI_TEAM/reports/next-codex-prompt.md`。
- 追加本機 runner log 到 `AI_TEAM/reports/runner-log.md`。
- 顯示基本健康狀態：
  - current branch
  - dirty file count
  - worktree count
  - latest QA status

## 明確不做

- 不修改 production DB。
- 不部署 Production。
- 不送 Meta App Review。
- 不切 PayUNI production。
- 不讀取或輸出 secret。
- 不自動 commit / push / merge。

## 使用情境

- 使用者睡前開著 `npm run ai-team:loop`，讓它持續整理下一輪工作提示。
- Codex 接手時讀 `AI_TEAM/reports/next-codex-prompt.md`，直接進入下一輪任務。
- QA 或 build 狀態改變時，runner 會把新狀態追加到 runner log。

## 後續可擴充

- 接 Antigravity CLI，讓 runner 可觸發 browser QA。
- 接 git safety checker，產生「可提交 / 不可提交」檔案分類。
- 接 PR status reader，但仍不自動 production deploy。
