> DEPRECATED / ARCHIVED ON 2026-07-04
> Retained for historical context only. Do not treat as source of truth.
> Current AI source of truth: AGENTS.md, docs/AI_SOURCE_OF_TRUTH.md, docs/AI_RELEASE_CONTROL.md, docs/AI_TEAM_AUTOPILOT.md.

# START_AI_TEAM_YOLO_MODE.md

把這份文件放在專案根目錄，等 `CODEX_DESKTOP_AI_DOCS_AND_RELEASE_AUTOPILOT_V2_MINIMAL.md` 做完後，交給 Codex Desktop 執行。

---

# 目標

啟動新版 AI_TEAM，用 YOLO / unattended release mode，把目前產品收斂到可以上線販售的 beta / V1 狀態。

這不是繼續修小地方，而是：

1. 以新的 canonical AI 文件為唯一真相。
2. 啟動 Codex CLI + Antigravity CLI 的 AI 團隊流程。
3. 使用本機與 staging 測試站進行放膽修改、重構、測試、修復。
4. 直到 P0 / P1 release blockers 歸零。
5. 產出可販售報告與人工最終驗收清單。

---

# Codex Desktop 啟動 Prompt

請完整執行，不要只回覆計畫。

```text
請進入 NEW AI_TEAM YOLO RELEASE MODE。

前提：
- `CODEX_DESKTOP_AI_DOCS_AND_RELEASE_AUTOPILOT_V2_MINIMAL.md` 應該已經執行完成。
- 專案應該已經有新版 canonical AI 文件與新版 Python autopilot。
- 這個專案尚未公開，允許在本機與 staging 做大幅修改、重構、測試、刪除過期文件、整併舊 automation。

本輪總目標：
把產品做到可以上線販售的 beta / V1 狀態。

你要做的事情：

1. 先確認 V2 重整是否真的完成
請檢查：
- AGENTS.md
- docs/AI_SOURCE_OF_TRUTH.md
- docs/AI_RELEASE_CONTROL.md
- docs/AI_TEAM_AUTOPILOT.md
- docs/_audit/AI_ARTIFACT_AUDIT_2026-07-04.md
- scripts/ai_cli_probe.py
- scripts/ai_release_autopilot.py
- scripts/ai_release_autopilot_config.example.json
- .ai-team/prompts/
- reports/ai-team/

如果缺少，請先補齊。
如果內容仍是公版，請依照本專案真實程式碼、package.json、測試、路由、API、DB schema、staging 設定重新改寫。

2. 啟動前建立 release 分支或 worktree
請建立或切換到：
- ai-team-yolo-release

允許 commit。
允許 push 到非 main/master 的工作分支。
不要直接推 main/master。

3. 啟用 YOLO/unattended 模式
請讓新版 AI_TEAM autopilot 使用最放膽的本機與 staging 模式：
- Codex Lead 可以自動拆任務。
- Codex Executor 可以自動改 code。
- Antigravity QA 可以自動跑 browser/staging QA。
- Codex Arbitrator 可以自動仲裁 findings。
- 本機與 staging 測試允許自動執行。
- 允許修改 production source code。
- 允許大 diff。
- 允許重構。
- 允許刪除或封存過期 AI 文件。
- 允許新增、修改、刪除測試。
- 允許升級 package，但必須能 build/test 通過。
- 允許對 staging DB 做 migration / seed / reset，但必須記錄。
- 允許自動 commit 每一輪穩定成果。

仍然不要：
- 操作 production DB。
- deploy production。
- 直接推 main/master。
- 修改正式金流帳號設定。
- 把 secrets 寫進 repo。

4. 若 autopilot 腳本還沒有 YOLO 參數，請先補齊
`scripts/ai_release_autopilot.py` 至少要支援：
- --mode yolo
- --target sale-ready
- --env local
- --env staging
- --max-rounds
- --max-hours
- --allow-large-diffs
- --allow-refactor
- --allow-package-upgrades
- --allow-staging-db-migrations
- --auto-commit
- --auto-push-branch
- --stop-when-beta-ready
- --write-final-report

5. 先跑 CLI probe
請執行：
- python scripts/ai_cli_probe.py

確認：
- Codex CLI 可用
- Antigravity CLI 可用
- Codex YOLO / danger-full-access / non-interactive 參數可用
- Antigravity non-interactive / permission skip / sandbox 參數可用
- package manager 可用
- local test commands 可用
- staging URL / staging env 是否可用

如果偵測不到 Antigravity 的確切 CLI 參數，請讀取 agy/antigravity 的 --help 輸出，自動更新 config，不要猜。

6. 啟動 AI_TEAM autopilot
請執行新版 Python autopilot，目標是 sale-ready：

PowerShell 可用類似：
python scripts/ai_release_autopilot.py --mode yolo --target sale-ready --env local --env staging --max-rounds 30 --max-hours 12 --allow-large-diffs --allow-refactor --allow-package-upgrades --allow-staging-db-migrations --auto-commit --auto-push-branch --stop-when-beta-ready --write-final-report

macOS/Linux 可用類似：
python3 scripts/ai_release_autopilot.py --mode yolo --target sale-ready --env local --env staging --max-rounds 30 --max-hours 12 --allow-large-diffs --allow-refactor --allow-package-upgrades --allow-staging-db-migrations --auto-commit --auto-push-branch --stop-when-beta-ready --write-final-report

如果腳本實際參數不同，請依 `python scripts/ai_release_autopilot.py --help` 調整，或先補齊參數再啟動。

7. AI_TEAM 內部角色
請使用這個角色分工：

Codex Lead / Orchestrator：
- 讀 canonical AI docs。
- 決定下一個最高槓桿任務。
- 維護 release blocker board。
- 定義 done。
- 仲裁 Antigravity findings。
- 決定 close / continue。

Codex Executor：
- 實際改 code。
- 跑本機測試。
- 補測試。
- 產出 executor report。
- 不自己宣布產品可販售。

Antigravity QA / Reviewer：
- 只做 browser QA、staging QA、E2E、visual QA、edge case review。
- 可以非常 aggressive 地找問題。
- finding 需附 reproduction、expected、actual、evidence、severity。
- 不直接決定修復優先級。

Codex Arbitrator：
- 對 QA findings 做 TRUE_BLOCKER / TRUE_NON_BLOCKER / FALSE_POSITIVE / DUPLICATE / NEEDS_REPRO 分類。
- 只有 TRUE_BLOCKER / P0 / P1 會進下一輪修復。

Human：
- 最後只看 FINAL_SALE_READY_REPORT 與人工驗收清單。

8. Sale-ready 停止條件
只有符合以下條件才可以停止並宣告 BETA_READY：

- P0 = 0
- P1 = 0
- 本機 lint/typecheck/test/build 通過，或文件清楚說明專案沒有該指令
- 核心使用者流程可用
- staging smoke test 通過
- landing/pricing/signup/login/dashboard 主要流程可用
- 付費/方案/權限流程可用，若金流仍是 sandbox，必須清楚標示
- 核心產品功能可用
- 主要 mobile RWD 無明顯破版
- 主要錯誤狀態不會讓使用者卡死
- 沒有明顯資料外洩或權限錯亂
- 產出 reports/ai-team/FINAL_SALE_READY_REPORT.md
- 產出 reports/ai-team/HUMAN_ACCEPTANCE_CHECKLIST.md

9. 失敗停止條件
遇到以下狀況要停止並產出 BLOCKED_REPORT：
- 缺少必要 third-party credentials
- staging 無法連線且無法自行修復
- 外部平台審核或人工操作是必要阻塞
- production-only 設定才能驗證
- 連續 3 輪都修同一個 blocker 失敗
- 測試或 build 進入循環性破壞

10. 完成後輸出
請最後產出：
- reports/ai-team/FINAL_SALE_READY_REPORT.md
- reports/ai-team/HUMAN_ACCEPTANCE_CHECKLIST.md
- reports/ai-team/YOLO_RUN_SUMMARY.md
- docs/AI_RELEASE_CONTROL.md 更新到最新狀態
- git log summary
- next manual steps

最後請在回覆中明確輸出：
AI_TEAM_YOLO_STATUS=BETA_READY / CONTINUE / BLOCKED / FAILED
```

---

# 建議終端機啟動方式

先在專案根目錄執行：

```bash
git status
git checkout -b ai-team-yolo-release
python scripts/ai_cli_probe.py
python scripts/ai_release_autopilot.py --help
```

如果 V2 已經把參數建立好，直接跑：

```bash
python scripts/ai_release_autopilot.py \
  --mode yolo \
  --target sale-ready \
  --env local \
  --env staging \
  --max-rounds 30 \
  --max-hours 12 \
  --allow-large-diffs \
  --allow-refactor \
  --allow-package-upgrades \
  --allow-staging-db-migrations \
  --auto-commit \
  --auto-push-branch \
  --stop-when-beta-ready \
  --write-final-report
```

Windows PowerShell 單行版：

```powershell
python scripts/ai_release_autopilot.py --mode yolo --target sale-ready --env local --env staging --max-rounds 30 --max-hours 12 --allow-large-diffs --allow-refactor --allow-package-upgrades --allow-staging-db-migrations --auto-commit --auto-push-branch --stop-when-beta-ready --write-final-report
```

---

# YOLO 的意思

YOLO 不是沒有驗收。

YOLO 的意思是：

- 不要每一步都問人。
- 允許 agent 自動修改、測試、重構、commit。
- 本機與 staging 可以放膽跑。
- 但最後仍以 release criteria、測試、staging smoke、final report 作為停止條件。

