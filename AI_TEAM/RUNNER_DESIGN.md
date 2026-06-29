# AI_TEAM Runner Design

AI_TEAM runner 現在不是單純的 QA 報告機。
它是本機可視長跑用的開發閉環控制器。

## 核心目標

在不碰 production DB、不部署 Production 的前提下，持續做這幾件事：

1. 讀目前任務與狀態
2. 呼叫 Codex CLI 做本輪實作
3. 跑適合這一輪的 QA
4. 用本地模型整理結果
5. 直接進下一輪，而不是停在「下一步建議」

## 目前閉環順序

每一輪 runner 從 `AI_TEAM/tasks/queue.json` 取第一個可執行 task，接著依序做：

1. `planner`
   - 讀 `queue.json`
   - 選定 pending / running task
   - 若 queue 沒有 pending / running task，會依產品優先序自動補入下一個安全產品任務
   - 寫入 `loop-state.json`
2. `codex-dev`
   - 呼叫 `codex exec`
   - 依 `current-task` / `backlog` / runtime QA 報告，直接做本輪實作
3. `local-model-review`
   - 用本地模型做錯誤摘要、靜態 QA、code review
4. `qa`
   - 一般模式預設 `lite`
   - 睡覺模式預設 `full`
5. `browser-qa`
   - 一般模式預設略過，睡覺模式或 full QA 才跑
6. `reporter`
   - 產出 final report、next prompt
7. `git-delivery`
   - 預設 skipped
   - 啟用 `AI_TEAM_ENABLE_GIT_DELIVERY=1` 後才會進入交付 gate
   - branch safety：`master` / `main` / `staging` / `production` / `prod` / `release` 一律 blocked
   - 只有 QA PASS、沒有 failed/blocked worker、沒有 reports/runtime/env/cache 混入，才會進入 ready
   - 預設只交付目前 queue task 的 scope，不會把整個 dirty tree 一起送出
   - 真的 commit / push / PR 還需要：
     - `AI_TEAM_GIT_COMMIT=1`
     - `AI_TEAM_GIT_PUSH=1`
     - `AI_TEAM_GIT_PR=1`
   - PR 預設：
     - base branch = `master`
     - draft = `true`
     - title = `AI_TEAM: <task title>`
8. `merge-delivery`
   - 預設 skipped
   - 啟用 `AI_TEAM_GIT_MERGE=1` 後才會進入 merge gate
   - 需要：
     - 已有 PR
     - PR 非 draft
     - merge state 可用
     - checks 全綠，或明確開 `AI_TEAM_GIT_ALLOW_MERGE_WITHOUT_CHECKS=1`
9. `deploy`
   - 預設 skipped
   - 啟用 `AI_TEAM_DEPLOY=1` 後才會進入 deploy gate
   - 預設 target = `preview`
   - merge 沒完成就不允許 deploy
   - Production deploy 仍需 `AI_TEAM_ENABLE_PRODUCTION_DEPLOY=1`

每個 worker 都會寫入 `AI_TEAM/runtime/worker-result.json`，runner 依照 `status` / `next` 決定下一步，而不是只靠 process 是否 timeout。

queue 狀態會同步回 `AI_TEAM/tasks/queue.json`，目前 lifecycle 為：

- `pending`
- `running`
- `completed`
- `blocked`
- `failed`

## 產品任務自動補題

完全自動閉環模式下，`planner` 不會因為 `queue.json` 暫時沒有 pending task 就直接停住。

當 queue 空掉時，runner 會依固定產品主線自動補入下一個尚未完成的安全任務：

1. Inbox visible-but-unusable product sweep
2. Channels / Connect visible-but-unusable product sweep
3. Contacts product completeness sweep
4. Automations scope clarity and disabled UX sweep
5. Analytics readability and data-state sweep
6. Billing / PayUNI Sandbox product readiness sweep
7. Launch readiness product sweep

這些任務仍遵守 hard stop：

- 不碰 production DB
- 不跑 migration / db push
- 不部署 Production
- 不送 Meta App Review
- 不切 PayUNI production

若這些產品主線任務都已完成，planner 才會回報 `autofill exhausted`，表示目前自動化範圍內沒有下一個安全任務。

## Worker Result Schema

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

## Timeout 的定位

timeout 仍保留，但只當作異常保護。

正常流程應該由 worker result 推進：

1. worker 開始時寫入 `current-worker.json` / `heartbeat.json`
2. worker 完成時寫入 `worker-result.json`
3. runner 讀 result 決定下一個 worker

如果 Codex CLI、Ollama、Playwright 這類外部 process 卡死，timeout 才會把 worker 標記為 `failed`，再交回 planner 決定下一步。

## Delivery Replay

delivery 後段如果需要單獨重跑，不需要整輪從頭開始：

```powershell
node AI_TEAM/scripts/ai-team-runner.mjs --once --mode=general --only-worker=git-delivery
node AI_TEAM/scripts/ai-team-runner.mjs --once --mode=general --only-worker=merge-delivery
node AI_TEAM/scripts/ai-team-runner.mjs --once --mode=general --only-worker=deploy
```

這條路徑會優先讀目前 queue task，若 queue 不可用，才 fallback 到 `loop-state.json`。

## QA 分級

### lite QA

給一般模式用。

用途：

- 小功能
- 連續修補
- 先解 blocker
- 不想每一輪都跑完整 build / browser / db tests

預設內容：

- `ai-team:check`
- `npm run lint`
- 其他完整 gate 以 `SKIP` 記錄，不當成失敗

### full QA

給睡覺模式或整批功能收尾時用。

預設內容：

- `ai-team:check`
- `npm run lint`
- `npm test`（只有非 production `TEST_DATABASE_URL` 可用時）
- `npm run build`
- Playwright browser QA
- 必要時 fallback 到 `agy`

## 為什麼要分級

如果每修一個小按鈕都跑完整 QA，整個 loop 只會卡在驗證。

所以現在規則是：

- 小修先 lite QA
- 一組功能完成再 full QA
- 睡覺模式偏向 full QA

這比較符合真實開發節奏。

## 並行鎖

runner 現在有三層 lock：

- `runner.lock.json`
- `qa.lock.json`
- `codex.lock.json`

作用：

- 避免同時開兩個 AI_TEAM loop 互撞
- 避免背景 runner 跟手動 `ai-team:qa` 同時跑
- 避免 Codex CLI 被同類流程重複呼叫

若遇到 lock，不直接當成失敗，而是寫明確 `SKIP` / `LOCKED` 原因。

## 失敗報告

`local-qa` 現在不只寫 PASS / FAIL。
失敗時會把這些資訊寫進 runtime 報告：

- exit code
- stdout tail
- stderr tail
- Supabase / Docker 診斷

這樣下一輪 Codex CLI 跟本地模型才有東西可讀，不會只看到一句「失敗」。

## runtime 輸出

所有執行期資料都寫到 `AI_TEAM/runtime/`：

- `qa-report.md`
- `browser-qa.md`
- `error-summary.md`
- `static-qa.md`
- `code-review.md`
- `final-report.md`
- `next-codex-prompt.md`
- `codex-exec-prompt.md`
- `codex-last-message.md`
- `health-summary.md`
- `runner-log.md`
- `loop-state.json`
- `current-worker.json`
- `worker-result.json`
- `heartbeat.json`
- `delivery-state.json`

這些檔案是 loop 的工作記憶，不提交 git。

## 一般模式 vs 睡覺模式

### 一般模式

- Codex CLI 主開發
- lite QA
- 快模型整理摘要
- 適合白天快速連跑

### 睡覺模式

- Codex CLI 主開發
- full QA
- 深模型做較完整 review
- 適合長時間 unattended 跑到下一個穩定點

## 明確不做

- 不修改 production DB
- 不跑 production migration
- 不送 Meta App Review
- 不切 PayUNI production
- 不輸出 secret

## 目前的自動交付邊界

AI_TEAM 現在是「完整開發閉環 runner」，在沒有人工阻塞時，可以一路做完：

- 持續改碼
- 持續驗證
- 持續 QA
- 持續更新 runtime 報告
- commit / push / PR / merge
- deployment

如果你要暫停，直接關掉 PowerShell 7 或手動停 runner 就可以。

需要第三方後台登入的人工作業還是要保留人工 gate，其他能安全自動完成的就往前推，不要停在半套。
