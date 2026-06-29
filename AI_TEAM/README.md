# AI_TEAM 總控

AI_TEAM 是 InboxPilot 的本機無人值守開發控制層。
現在的版本已經改成「開發閉環」：

- `Codex CLI` 主導實作
- `QA runner` 做驗證
- `本地模型` 做摘要 / review / 報告 / 下一輪提示詞
- `Playwright` 做 browser QA
- 整輪做完會直接進下一輪，不再只停在回報

## 先讀哪些檔案

1. `AI_TEAM/PROJECT_STATE.md`
2. `AI_TEAM/LAUNCH_CRITERIA.md`
3. `AI_TEAM/tasks/current-task.md`
4. `AI_TEAM/tasks/backlog.md`
5. `AI_TEAM/RUNNER_DESIGN.md`
6. `AI_TEAM/MODEL_ASSIGNMENT.md`

## 核心原則

- 不碰 production DB
- 不跑 migration / db push
- 不部署 Production
- 不送 Meta App Review
- 不切 PayUNI production
- 不輸出 secret
- runtime 輸出不提交 git

## 指令總表

### 狀態 / 基本檢查

- `npm run ai-team`
- `npm run ai-team:status`
- `npm run ai-team:check`
- `npm run ai-team:next`

### 開發 / QA

- `npm run ai-team:dev`
  - 只跑 Codex CLI 本輪實作
- `npm run ai-team:qa`
  - full QA
- `npm run ai-team:qa:lite`
  - lite QA
- `npm run ai-team:qa:full`
  - full QA 明確入口
- `npm run ai-team:browser-qa`
  - 只跑 Playwright browser QA

### 本地模型

- `npm run ai-team:models`
- `npm run ai-team:models:general`
- `npm run ai-team:models:sleep`

### 閉環 runner

- `npm run ai-team:loop:once`
- `npm run ai-team:loop:once:sleep`
- `npm run ai-team:loop:smoke`
- `npm run ai-team:loop:general`
- `npm run ai-team:loop:sleep`
- `npm run ai-team:loop:continuous`
- `npm run ai-team:loop:continuous:sleep`

## runner 真正會做什麼

AI_TEAM runner 現在使用 task queue + worker result 推進，不再只是單純等外部 CLI process 結束。

每一輪順序：

1. `planner`
2. `codex-dev`
3. `local-model-review`
4. `qa`
5. `browser-qa`
6. `reporter`
7. `git-delivery`
8. `merge-delivery`
9. `deploy`
10. 寫入 runtime 報告
11. 若設定為 continuous / always-run，就直接進下一輪

任務來源是 `AI_TEAM/tasks/queue.json`。每個 worker 都會輸出 structured JSON result，runner 依照 `status` / `next` 決定下一步。timeout 仍保留，但只作為外部工具卡死時的保險絲。

當 `queue.json` 沒有 pending / running task 時，planner 會自動依產品主線補入下一個安全任務，不會只因 queue 空掉就停住。預設補題順序是 Inbox、Channels、Contacts、Automations、Analytics、Billing / PayUNI Sandbox、Launch readiness sweep。

queue 狀態現在會由 runner 真正維護：

- `pending`
- `running`
- `completed`
- `blocked`
- `failed`

### Worker result schema

```json
{
  "status": "done",
  "worker": "qa",
  "summary": "QA worker 完成。",
  "changedFiles": [],
  "validation": ["exit=0"],
  "next": "browser-qa"
}
```

`status` 可用值：

- `done`
- `failed`
- `blocked`
- `skipped`

### Git Delivery Gate

- `AI_TEAM_ENABLE_GIT_DELIVERY=1`
  作用：開啟交付 gate 判斷
- branch safety
  規則：`master`、`main`、`staging`、`production`、`prod`、`release` 一律視為 unsafe，不允許 unattended commit
- `AI_TEAM_GIT_COMMIT=1`
  作用：gate 通過後真的執行 `git commit`
- `AI_TEAM_GIT_PUSH=1`
  作用：commit 後執行 `git push`
- `AI_TEAM_GIT_PR=1`
  作用：push 後用 `gh pr create` 建 PR
- `git-delivery` 預設只交付目前 queue task 的 `scope` 範圍，不會把整個髒工作樹一起送上去
- `AI_TEAM_GIT_PR_BASE`
  預設：`master`
- `AI_TEAM_GIT_PR_DRAFT`
  預設：`1`，也就是 draft PR
- `AI_TEAM_GIT_MERGE=1`
  作用：允許 `merge-delivery` 真的執行 `gh pr merge`
- `AI_TEAM_GIT_ALLOW_MERGE_WITHOUT_CHECKS=1`
  作用：只有在明確需要時才允許沒有 checks 的 PR merge，預設不開
- `AI_TEAM_DEPLOY=1`
  作用：允許 `deploy` worker 真正執行部署
- `AI_TEAM_DEPLOY_TARGET`
  預設：`preview`
- `AI_TEAM_ENABLE_PRODUCTION_DEPLOY=1`
  作用：明確開放 Production deploy；預設關閉

沒有開這些 env 時，delivery workers 只會回報 `skipped`、`blocked` 或 `ready`，不會真的改遠端。

### 單工補跑

若某一段 delivery worker 需要安全重跑，可以直接指定：

```powershell
node AI_TEAM/scripts/ai-team-runner.mjs --once --mode=general --only-worker=git-delivery
node AI_TEAM/scripts/ai-team-runner.mjs --once --mode=general --only-worker=merge-delivery
node AI_TEAM/scripts/ai-team-runner.mjs --once --mode=general --only-worker=deploy
```

也可改用 env：

```powershell
$env:AI_TEAM_ONLY_WORKER="merge-delivery"
node AI_TEAM/scripts/ai-team-runner.mjs --once --mode=general
```

### 一般模式

- 主開發：Codex CLI
- QA：lite
- 本地模型：快模型
- 目的：先把 blocker 解掉、快速迭代

### 睡覺模式

- 主開發：Codex CLI
- QA：full
- 本地模型：較慢但較完整
- 目的：長跑、整批驗證、收斂穩定度

## 可視 PowerShell 7 啟動

### 一般模式長跑

```powershell
pwsh -NoProfile -ExecutionPolicy Bypass -File AI_TEAM/scripts/local-ai-team.ps1 -Mode general -AlwaysRun -Interval 0 -TestDatabaseUrl "postgresql://postgres:postgres@127.0.0.1:55322/postgres" -TestDirectUrl "postgresql://postgres:postgres@127.0.0.1:55322/postgres"
```

### 睡覺模式長跑

```powershell
pwsh -NoProfile -ExecutionPolicy Bypass -File AI_TEAM/scripts/local-ai-team.ps1 -Mode sleep -AlwaysRun -Interval 0 -TestDatabaseUrl "postgresql://postgres:postgres@127.0.0.1:55322/postgres" -TestDirectUrl "postgresql://postgres:postgres@127.0.0.1:55322/postgres"
```

### 只跑 QA

```powershell
pwsh -NoProfile -ExecutionPolicy Bypass -File AI_TEAM/scripts/local-ai-team.ps1 -QaOnly -TestDatabaseUrl "postgresql://postgres:postgres@127.0.0.1:55322/postgres" -TestDirectUrl "postgresql://postgres:postgres@127.0.0.1:55322/postgres"
```

### 一般模式開啟真實交付

```powershell
pwsh -NoProfile -ExecutionPolicy Bypass -File AI_TEAM/scripts/local-ai-team.ps1 -Mode general -AlwaysRun -Interval 0 -EnableGitDelivery -DisableDryRun -EnableMerge -TestDatabaseUrl "postgresql://postgres:postgres@127.0.0.1:55322/postgres" -TestDirectUrl "postgresql://postgres:postgres@127.0.0.1:55322/postgres"
```

預設仍不開 `-EnableDeploy`。要部署時再明確加上，且 Production deploy 仍需另外開 `AI_TEAM_ENABLE_PRODUCTION_DEPLOY=1`。

## runtime 檔案

AI_TEAM 長跑輸出都寫到 `AI_TEAM/runtime/`：

- `health-summary.md`
- `qa-report.md`
- `browser-qa.md`
- `error-summary.md`
- `static-qa.md`
- `code-review.md`
- `final-report.md`
- `next-codex-prompt.md`
- `codex-exec-prompt.md`
- `codex-last-message.md`
- `runner-log.md`
- `loop-state.json`
- `current-worker.json`
- `worker-result.json`
- `heartbeat.json`
- `delivery-state.json`
- `*.lock.json`

這些都不應該提交 git。

## Smoke 測試

```powershell
npm run ai-team:loop:smoke
```

Smoke 會使用 fake task 走完整個 worker pipeline，但不會真的讓 Codex 修改產品，也不會 commit / push / PR / deploy。

## 目前的邊界

AI_TEAM 現在已經是完整開發閉環，而且在沒有人工阻塞時，可以一路走到：

- 改碼
- 驗證
- commit / push
- PR
- merge
- deployment

如果你要暫停，直接關掉 PowerShell 7，或手動停 runner 就可以。

這版的原則比較直接：能安全自動完成的就往前推，不要卡在半套。
