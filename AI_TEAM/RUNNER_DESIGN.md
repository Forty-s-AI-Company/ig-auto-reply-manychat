# AI_TEAM Runner Design

AI_TEAM runner 是本機長跑控制台，不是會自動操作 production 的背景機器人。

## 目前能力

- 讀取 AI_TEAM source of truth。
- 支援兩種本地模型模式：
  - `general`：平常一般模式，優先快
  - `sleep`：睡覺模式，優先品質與深度
- 先跑本機 QA：
  - `ai-team:check`
  - `npm run lint`
  - `npm test`（只有非 production `TEST_DATABASE_URL` 可用時）
  - `npm run build`
  - `agy` Browser QA
- 再跑本地模型編排：
  - Error Summarizer
  - Static QA / Bug Fixer
  - Code Reviewer
  - Final Report Writer
  - Prompt Engineer
- 輸出 health summary。
- 顯示基本健康狀態：
  - current branch
  - dirty file count
  - worktree count
  - latest QA status

## 執行期輸出

runner 不再改動 tracked 的 `AI_TEAM/reports/*.md`，而是把每輪輸出都寫到 `AI_TEAM/runtime/`：

- `AI_TEAM/runtime/qa-report.md`
- `AI_TEAM/runtime/browser-qa.md`
- `AI_TEAM/runtime/error-summary.md`
- `AI_TEAM/runtime/static-qa.md`
- `AI_TEAM/runtime/code-review.md`
- `AI_TEAM/runtime/final-report.md`
- `AI_TEAM/runtime/next-codex-prompt.md`
- `AI_TEAM/runtime/health-summary.md`
- `AI_TEAM/runtime/runner-log.md`

這樣長跑過程不會一直把 git 工作區弄髒。

## 明確不做

- 不修改 production DB。
- 不部署 Production。
- 不送 Meta App Review。
- 不切 PayUNI production。
- 不讀取或輸出 secret。
- 不自動 commit / push / merge。
- 不讓本地模型直接主導高風險產品程式碼修改。

## 使用情境

- 平常使用 `npm run ai-team:loop:general`，讓它用快一點的本地模型持續跑 QA + 報告。
- 睡前使用 `npm run ai-team:loop:sleep`，讓它用比較慢但品質較高的本地模型長跑。
- 若只想跑一輪，用 `npm run ai-team:loop:once` 或 `npm run ai-team:loop:once:sleep`。
- Codex 接手時，優先讀：
  - `AI_TEAM/runtime/qa-report.md`
  - `AI_TEAM/runtime/browser-qa.md`
  - `AI_TEAM/runtime/final-report.md`
  - `AI_TEAM/runtime/next-codex-prompt.md`
- 若 runtime 還沒有輸出，再退回讀 `AI_TEAM/reports/*.md` 基線文件。

## 後續可擴充

- 接 git safety checker，產生「可提交 / 不可提交」檔案分類。
- 接 PR status reader，但仍不自動 production deploy。
- 讓本地模型針對低風險文件 / UI 文案產出 patch 建議，但仍由 Codex 決定是否套用。
