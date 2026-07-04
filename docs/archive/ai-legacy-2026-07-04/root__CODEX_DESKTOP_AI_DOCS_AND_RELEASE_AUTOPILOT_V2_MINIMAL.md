> DEPRECATED / ARCHIVED ON 2026-07-04
> Retained for historical context only. Do not treat as source of truth.
> Current AI source of truth: AGENTS.md, docs/AI_SOURCE_OF_TRUTH.md, docs/AI_RELEASE_CONTROL.md, docs/AI_TEAM_AUTOPILOT.md.

# Codex Desktop Master Task V2 — AI 文件去重重整 + 既有無人值守系統整併 + 最小化 Release Autopilot

> 使用方式：把本文件放到專案根目錄，使用 **Codex Desktop** 開啟該專案後，要求 Codex 讀取並完整執行。  
> 本文件的重點不是套公版模板，而是讓 Codex **自動找出此 repo 裡所有 AI 文件、歷史紀錄、舊限制、舊 autopilot 腳本、舊無人值守自動化檔案**，再依照此專案的真實狀態重整成最小、清楚、可持續使用的一套 AI 團隊與 release autopilot。

---

## 0. 任務總目標

你是此專案的 **AI Release Engineering Lead + Documentation Surgeon**。

目前專案裡可能已經存在大量 AI 相關文件、handoff、memory、report、task、QA 文件，以及之前規劃過的 AI 無人值守自動化 Python / shell / PowerShell / JS / TS 腳本。這些東西可能互相矛盾、過時、重複、讓 AI 被舊限制綁住，導致 Codex / Antigravity 一直修小地方，無法收斂到可販售版本。

你的任務不是新增更多混亂，而是：

1. **自動找出所有 AI 相關檔案與既有 autopilot / automation 檔案。**
2. **判斷哪些仍有價值、哪些過時、哪些互相衝突、哪些應封存。**
3. **把整個 AI 文件系統重整成最小可維護版本。**
4. **把既有無人值守自動化規劃 / 腳本整併成一套新的、單一入口的 Python autopilot。**
5. **讓後續專案進入尾聲時，可以用 Codex CLI + Antigravity CLI 在 local / staging 放肆測試、修復、review、仲裁、commit，直到接近可販售 beta / V1。**

本輪請實際修改 repo，不要只回覆計畫。

---

## 1. 重要原則

### 1.1 內容必須專案專屬

所有新文件內容必須根據此 repo 的真實狀態撰寫，包括：

- 實際技術棧
- 實際 package scripts
- 實際 database / migration / schema
- 實際 auth / billing / OAuth / webhook / API / dashboard / worker / cron
- 實際 local / staging runbook
- 實際測試工具與測試指令
- 實際產品流程
- 實際舊文件與舊自動化腳本

不可把本文當作公版模板照抄。本文只定義工作方法與交付要求。

### 1.2 以最小化為優先

這次不是再生出十幾份新 AI 文檔，而是要**減少 AI 文檔數量**。

預設採用「Compact Canonical Docs」：

```text
AGENTS.md
  AI 最高入口，短而清楚，只指向唯一真相文件。

docs/AI_SOURCE_OF_TRUTH.md
  合併：PROJECT_STATE + PRODUCT_SPEC_CURRENT + ENVIRONMENT_MAP + CONSTRAINT_REGISTRY。

docs/AI_RELEASE_CONTROL.md
  合併：RELEASE_CRITERIA + RELEASE_BUG_BOARD + QA_MATRIX + STAGING_RUNBOOK。

docs/AI_TEAM_AUTOPILOT.md
  合併：AI_TEAM_WORKFLOW + autopilot 使用方式 + CLI profile + prompt/report contract。

docs/_audit/AI_ARTIFACT_AUDIT_2026-07-04.md
  本輪稽核結果，保留供追溯。
```

只有在此 repo 複雜到單一文件過長或不利維護時，才可以拆出額外文件；若拆分，必須在 `AGENTS.md` 與 final handoff 明確說明原因。最終 source of truth 應盡量少。

### 1.3 既有 autopilot 不可忽略

如果 repo 以前已經有 AI 無人值守自動化相關檔案，例如：

- Python autopilot
- Bash / PowerShell runner
- Codex automation script
- Antigravity / AGY automation script
- Claude / Gemini / OpenAI orchestration script
- old prompt templates
- old state file
- old report format
- old release bot
- old QA bot
- old workflow docs

你必須先找出、讀取、稽核，再決定：

```text
KEEP_AS_IS / REUSE_PART / MERGE_INTO_NEW / ARCHIVE / REWRITE
```

不可在完全不了解舊系統的情況下直接新增另一套平行系統。

### 1.4 本專案尚未公開，可採 aggressive local / staging 模式

允許：

- 大幅整理 AI 文件。
- 封存舊 AI 文件與舊 automation 檔案。
- 建立新的 AI team workflow。
- 建立 aggressive local / staging autopilot。
- 修改測試、QA scripts、release scripts。
- 建立 staging smoke / E2E / browser QA。
- 在 local / staging 做大量測試與修復。
- 在明確 staging guard 下執行 staging migration / seed / reset。
- 自動 commit 到 release stabilization branch。

仍然不要：

- 不要輸出或寫入 secret value。
- 不要操作 production DB。
- 不要觸發真實金流 capture。
- 不要 push main / master / production。
- 不要正式公開 deploy。
- 不要刪除舊文件；先封存。

---

## 2. Phase 0 — 工作分支與安全快照

1. 確認 git root。
2. 確認目前 branch。
3. 如果不在 release / staging / ai cleanup branch，建立或建議建立：

```bash
git checkout -b release-stabilization-ai-team
```

4. 建立：

```text
reports/ai-team/00_REPO_DISCOVERY.md
```

內容至少包含：

- branch / dirty status
- OS / shell
- package manager
- framework
- runtime
- package scripts
- test / lint / typecheck / build / e2e commands
- database / migration tool
- auth / billing / OAuth / webhook / external integrations
- staging URL / local URL 偵測結果，不可輸出 secret
- 主要產品流程
- repo 內已知 AI docs / automation 初步清單

不確定就標 `UNKNOWN`，不要猜。

---

## 3. Phase 1 — 全 repo AI Artifact Discovery

建立：

```text
reports/ai-team/01_AI_ARTIFACT_DISCOVERY.md
.ai-team/ai_artifacts.detected.json
```

你必須使用路徑與內容雙重方式搜尋，不要只靠檔名。

### 3.1 優先搜尋路徑

請掃描但不限於：

```text
AGENTS.md
CLAUDE.md
GEMINI.md
CODEX*.md
ANTIGRAVITY*.md
README*.md
docs/**/*
reports/**/*
memory/**/*
.ai/**/*
.ai-team/**/*
.codex/**/*
.claude/**/*
.gemini/**/*
.cursor/**/*
.windsurf/**/*
.continue/**/*
scripts/**/*
tools/**/*
automation/**/*
bin/**/*
.github/**/*
```

### 3.2 優先搜尋檔名關鍵字

包含但不限於：

```text
ai
agent
agents
subagent
codex
antigravity
agy
gemini
claude
openai
anthropic
autopilot
auto-pilot
automation
unattended
orchestrator
executor
reviewer
arbitrator
qa
handoff
memory
report
task
plan
release
stabilization
workflow
```

### 3.3 優先搜尋內容關鍵字

若有 `rg` 就用 `rg`，否則用 Python / grep。搜尋內容包含但不限於：

```text
Codex CLI
codex exec
Antigravity
agy -p
Gemini
Claude
OpenAI
Anthropic
orchestrator
executor
reviewer
arbitrator
subagent
unattended
autopilot
yolo
sandbox
approval
release stabilization
P0
P1
handoff
memory
agent workflow
```

### 3.4 偵測既有自動化腳本

特別標記所有疑似 AI 無人值守 / release autopilot / QA automation 相關腳本：

```text
*.py
*.ps1
*.sh
*.bash
*.zsh
*.js
*.mjs
*.cjs
*.ts
*.tsx
*.json
*.yaml
*.yml
```

每個檔案要判斷：

```text
kind: DOC / REPORT / MEMORY / TASK / PROMPT / SCRIPT / CONFIG / WORKFLOW / UNKNOWN
purpose: 推測用途
currentness: CURRENT / PARTIAL / STALE / CONFLICTING / UNKNOWN
risk: 是否會讓 AI 被舊限制綁住
reuse_decision: KEEP_AS_IS / REUSE_PART / MERGE_INTO_NEW / ARCHIVE / REWRITE
reason: 理由
```

---

## 4. Phase 2 — AI Artifact Audit + Simplification Plan

建立：

```text
docs/_audit/AI_ARTIFACT_AUDIT_2026-07-04.md
```

這份 audit 必須回答：

1. 現在 repo 裡到底有多少 AI 相關文件？
2. 有多少歷史紀錄 / handoff / memory / report？
3. 有多少既有 autopilot / automation script？
4. 哪些文件互相衝突？
5. 哪些舊限制正在綁住 AI？
6. 哪些 script 仍可重用？
7. 哪些 script 應被封存？
8. 最終應保留的最小 source-of-truth 是哪些？
9. 最終應保留的唯一 autopilot 入口是哪個？
10. 舊檔案到新檔案的 mapping 是什麼？

請建立 mapping 表：

```markdown
| Old path | Type | Decision | New location / replacement | Reason |
|---|---|---|---|---|
```

### 4.1 舊限制稽核

找出所有可能造成 AI 綁手綁腳的限制，例如：

- 不准改 billing
- 不准改 auth
- 不准改 schema
- 不准改 deployment
- 不准新增測試
- 不准碰某些 route / API / service
- 舊 pricing / plan / entitlement 規則
- 舊 OAuth / webhook / payment provider 流程
- 舊 staging URL
- 舊 QA 流程
- 舊 release 條件

每條限制判定：

```text
ACTIVE / DEPRECATED / NEEDS_REVIEW
```

如果限制已過期，必須進入新文件的 `Deprecated Constraints` 區塊，避免之後 AI 又採信。

### 4.2 最小化決策規則

請依照下列規則整理：

- 同一用途只能有一份 canonical 文件。
- 同一用途只能有一個 canonical Python autopilot 入口。
- 舊 report / memory / handoff 預設封存，不當 source of truth。
- 舊 prompt template 若仍有價值，只抽取可用規則，不保留多份平行 prompt。
- 舊 script 若已被新 autopilot 取代，移到 archive，不留在 active scripts 路徑中造成混淆。
- 若 package.json / README / CI 引用舊 script，必須更新引用或留下 wrapper。
- wrapper 必須很薄，只呼叫新的 canonical Python script。

---

## 5. Phase 3 — 建立最小化 Canonical AI 文件

請建立或重寫以下最小文件。

### 5.1 `AGENTS.md`

這是 AI 入口文件，必須短，不要塞太多歷史內容。

必須包含：

- 本專案一句話簡介，依實際 repo。
- 所有 AI agent 先讀哪些 canonical 文件。
- 舊文件在哪裡，只能當歷史參考。
- 舊 AI reports / handoffs / memories 不可直接採信。
- Codex / Antigravity 分工。
- release stabilization 模式。
- local / staging aggressive 模式。
- 最重要測試指令。
- 完成任何任務都要有 diff summary / test evidence / report。
- 不可自行宣布 production ready；只能輸出 `BETA_READY_CANDIDATE`，最後由人類決定。

### 5.2 `docs/AI_SOURCE_OF_TRUTH.md`

合併並取代分散文件：

- project state
- current product spec
- module map
- current user flows
- environment map
- integrations
- active constraints
- deprecated constraints
- unknowns

內容必須有依據，例如檔案路徑、script、route、schema、config。不要用理想狀態冒充現況。

### 5.3 `docs/AI_RELEASE_CONTROL.md`

合併並取代分散文件：

- release criteria
- P0 / P1 / P2 / P3 定義
- current release bug board
- QA matrix
- local runbook
- staging runbook
- staging safety guard
- human acceptance checklist

如果目前沒有測試證據，不要宣稱沒 bug；標記 `NEEDS_VERIFICATION`。

### 5.4 `docs/AI_TEAM_AUTOPILOT.md`

合併並取代分散文件：

- AI team roles
- Codex Lead / Executor / Arbitrator responsibilities
- Antigravity QA responsibilities
- handoff artifacts
- report naming
- autopilot commands
- config file
- CLI profile detection
- resume / status / dry-run / local-aggressive / staging-aggressive
- how to archive or update prompts

### 5.5 若需要額外文件

只有在真的必要時才新增額外 canonical docs。例如：

```text
docs/API_CONTRACTS_CURRENT.md
docs/BILLING_AND_ENTITLEMENT_CURRENT.md
docs/META_OAUTH_AND_WEBHOOK_CURRENT.md
```

如果新增，必須說明為什麼不能放進 `AI_SOURCE_OF_TRUTH.md`。

---

## 6. Phase 4 — 封存舊 AI 文件與舊 Automation

建立封存目錄：

```text
docs/archive/ai-legacy-2026-07-04/
```

如有舊 automation scripts，建立：

```text
.ai-team/archive/automation-legacy-2026-07-04/
```

處理規則：

1. 舊 AI docs / report / handoff / memory / task：移到 `docs/archive/ai-legacy-2026-07-04/`。
2. 舊 prompt templates：若被新 prompt 取代，移到 `.ai-team/archive/automation-legacy-2026-07-04/prompts/`。
3. 舊 autopilot / automation scripts：若被新 `scripts/ai_release_autopilot.py` 取代，移到 `.ai-team/archive/automation-legacy-2026-07-04/scripts/`。
4. 若舊 script 被 package.json / CI 引用，請更新引用；必要時留下薄 wrapper，但 wrapper 只能呼叫新 Python 入口。
5. 不要刪除檔案。

每個封存 markdown 檔案開頭加：

```markdown
> DEPRECATED / ARCHIVED ON 2026-07-04  
> Retained for historical context only. Do not treat as source of truth.  
> Current AI source of truth: AGENTS.md, docs/AI_SOURCE_OF_TRUTH.md, docs/AI_RELEASE_CONTROL.md, docs/AI_TEAM_AUTOPILOT.md.
```

每個封存 script 旁邊建立或更新 archive index：

```text
.ai-team/archive/automation-legacy-2026-07-04/README.md
```

列出：

- 原路徑
- 為何封存
- 哪些邏輯被新 script 吸收
- 新替代入口

---

## 7. Phase 5 — CLI Capability Discovery

建立或重寫：

```text
scripts/ai_cli_probe.py
```

要求：

- Python 3.11+。
- 儘量只用 standard library。
- Windows / macOS / Linux 可用。
- 偵測：
  - `codex`
  - `codex exec`
  - `codex --help`
  - `codex exec --help`
  - `antigravity`
  - `agy`
  - `gemini`
  - repo 內任何既有 Antigravity 入口
- 偵測 package manager / test commands / build commands。
- redacts secrets。
- 輸出：

```text
reports/ai-team/02_CLI_DISCOVERY.md
.ai-team/cli_profiles.detected.json
```

不要硬寫死 flags；以本機實際偵測結果為準。

---

## 8. Phase 6 — 建立單一入口 AI Release Autopilot

建立或重寫：

```text
scripts/ai_release_autopilot.py
scripts/ai_release_autopilot_config.example.json
.ai-team/prompts/codex_lead.md
.ai-team/prompts/codex_executor.md
.ai-team/prompts/antigravity_qa.md
.ai-team/prompts/codex_arbitrator.md
.ai-team/prompts/release_reporter.md
.ai-team/state.example.json
reports/ai-team/README.md
```

如果 repo 已有舊的 AI autopilot，請先從中抽取有用邏輯，再整併進新 script；不要保留多套 active autopilot。

### 8.1 Python autopilot 必須支援

```bash
python scripts/ai_release_autopilot.py --mode status
python scripts/ai_release_autopilot.py --mode docs-check
python scripts/ai_release_autopilot.py --mode inventory
python scripts/ai_release_autopilot.py --mode run-once --profile local-aggressive
python scripts/ai_release_autopilot.py --mode run --profile local-aggressive --max-rounds 10
python scripts/ai_release_autopilot.py --mode run --profile staging-aggressive --max-rounds 10
python scripts/ai_release_autopilot.py --mode qa-only --profile staging-aggressive
python scripts/ai_release_autopilot.py --mode resume
```

### 8.2 Autopilot round 流程

每輪固定：

```text
Codex Lead
  讀 AGENTS.md + canonical docs
  產出最小 P0/P1 任務
  reports/ai-team/round-XXX-task.md

Codex Executor
  只修該任務
  可以 aggressive 改 code / test / docs
  產出 executor report
  reports/ai-team/round-XXX-executor.md

Local checks
  install / lint / typecheck / test / build / e2e
  依 repo 實際 commands
  reports/ai-team/round-XXX-local-checks.md

Staging checks
  profile 允許才跑
  deploy / seed / smoke / e2e / browser checks
  必須確認 staging，不可 production
  reports/ai-team/round-XXX-staging-checks.md

Antigravity QA
  不直接修 code
  做 QA / browser / staging / visual / integration review
  reports/ai-team/round-XXX-qa.md

Codex Arbitrator
  不盲信 QA
  將 findings 分為 TRUE_BLOCKER / TRUE_NON_BLOCKER / FALSE_POSITIVE / DUPLICATE / NEEDS_REPRO
  更新 docs/AI_RELEASE_CONTROL.md
  reports/ai-team/round-XXX-decision.md

Commit
  有實質修改且 checks 可接受才 commit
  commit message: release: ai stabilization round XXX

Stop / continue
  P0/P1 歸零 -> BETA_READY_CANDIDATE_REPORT
  到 max rounds -> AUTOPILOT_STOPPED_MAX_ROUNDS
```

### 8.3 Config example 必須專案化

`scripts/ai_release_autopilot_config.example.json` 必須根據實際 repo 填入預設 command。不能確定才留空並標註原因。

至少包含：

- reports_dir
- state_file
- cli_profiles_file
- branch_allow_patterns
- local-aggressive profile
- staging-aggressive profile
- dry-run profile
- commands: install / lint / typecheck / test / build / e2e / local_dev / staging_deploy / staging_smoke / staging_seed / staging_db_reset
- release max rounds
- max attempts per blocker
- secret redaction patterns
- production guard patterns

---

## 9. Phase 7 — Prompt Templates

Prompt 不要硬寫在 Python 裡。建立在 `.ai-team/prompts/`。

### 9.1 `codex_lead.md`

要求：

- 不寫 code。
- 只開一張最小 P0/P1 任務。
- 基於 canonical docs 與實際 repo，不採信舊 archive。
- 明確 allowed files / forbidden files。
- 明確 acceptance criteria。
- 明確 required commands。

輸出 marker：

```text
LEAD_STATUS=PASS
NEXT_TASK_READY=true
```

### 9.2 `codex_executor.md`

要求：

- 只執行 task。
- 可以 aggressive 修，但不可 scope creep。
- 修改後跑 required commands。
- 輸出 diff summary / tests / risks。

輸出 marker：

```text
EXECUTOR_STATUS=PASS 或 FAIL
```

### 9.3 `antigravity_qa.md`

要求：

- 不直接修 code。
- 做 browser / staging / visual / integration QA。
- finding 必須有 repro steps / expected / actual / evidence / severity。
- P2/P3 不當 blocker。

輸出 marker：

```text
QA_STATUS=PASS 或 FAIL
BLOCKING_FINDINGS_COUNT=數字
```

### 9.4 `codex_arbitrator.md`

要求：

- 不盲信 QA。
- 逐條分類 findings。
- 只把 TRUE_BLOCKER 放回 P0/P1。
- false positive 必須寫理由。
- 更新 `docs/AI_RELEASE_CONTROL.md`。

輸出 marker：

```text
RELEASE_DECISION=CONTINUE 或 BETA_READY_CANDIDATE 或 FAIL
```

### 9.5 `release_reporter.md`

產出：

- 修改摘要
- 剩餘 P0/P1/P2/P3
- 測試證據
- staging 狀態
- human acceptance checklist
- 上線前仍需人工確認事項

---

## 10. Phase 8 — 驗證與最終交付

完成後至少執行：

```bash
python scripts/ai_cli_probe.py
python scripts/ai_release_autopilot.py --mode status
python scripts/ai_release_autopilot.py --mode inventory
python scripts/ai_release_autopilot.py --mode docs-check
```

如果環境允許，執行一次：

```bash
python scripts/ai_release_autopilot.py --mode run-once --profile local-aggressive
```

不要在本輪自動長跑 `--mode run --max-rounds 10`，除非使用者另外明確要求。

建立：

```text
reports/ai-team/FINAL_HANDOFF_2026-07-04.md
```

內容包含：

1. 本輪完成了什麼。
2. 新增 / 修改 / 封存檔案清單。
3. 舊 AI 文件如何處理。
4. 舊 autopilot / automation scripts 如何處理。
5. 新 canonical source of truth 文件位置。
6. 新唯一 autopilot 入口。
7. Codex CLI / Antigravity CLI 偵測結果。
8. 已跑 validation commands。
9. 尚未跑的項目與原因。
10. 目前 P0/P1/P2/P3 狀態。
11. 如何啟動 local aggressive autopilot。
12. 如何啟動 staging aggressive autopilot。
13. 人類需要準備的 test account / staging env / sandbox payment / OAuth callback。

最後輸出 markers：

```text
AI_ARTIFACT_DISCOVERY_STATUS=PASS 或 FAIL
AI_DOCS_MINIMIZATION_STATUS=PASS 或 FAIL
LEGACY_AUTOMATION_CONSOLIDATION_STATUS=PASS 或 FAIL
AUTOPILOT_BUILD_STATUS=PASS 或 FAIL
AUTOPILOT_VALIDATION_STATUS=PASS 或 FAIL
FINAL_STATUS=READY_FOR_LOCAL_AUTOPILOT 或 READY_FOR_STAGING_AUTOPILOT 或 BLOCKED
```

---

## 11. 對 Codex Desktop 的直接執行指令

請不要只回覆計畫。請照以下順序實作：

1. 讀 repo，建立安全快照與 discovery report。
2. 搜尋所有 AI docs / reports / memories / handoffs / tasks / prompts / automation scripts。
3. 建立 AI artifact inventory 與 audit。
4. 找出所有既有無人值守自動化相關檔案。
5. 判斷哪些舊邏輯可重用，哪些要封存。
6. 將 source of truth 最小化成 compact canonical docs。
7. 封存舊 AI 文件與舊 automation。
8. 建立或重寫 CLI probe。
9. 建立或重寫唯一 Python autopilot。
10. 建立 prompt templates。
11. 執行 validation。
12. 建立 final handoff。
13. 顯示最終 summary 與啟動指令。

遇到不確定事項時：

- 不要停住等人。
- 標記 `UNKNOWN` / `NEEDS_USER_INPUT`。
- 能以 repo 實際狀態推導就繼續。
- 只有遇到 secret / production DB / real payment / irreversible external action 時停止該步，改做 local/staging 替代。

---

## 12. 完成後使用者理想上可執行

```bash
python scripts/ai_cli_probe.py
python scripts/ai_release_autopilot.py --mode status
python scripts/ai_release_autopilot.py --mode inventory
python scripts/ai_release_autopilot.py --mode docs-check
python scripts/ai_release_autopilot.py --mode run-once --profile local-aggressive
python scripts/ai_release_autopilot.py --mode run --profile local-aggressive --max-rounds 10
python scripts/ai_release_autopilot.py --mode run --profile staging-aggressive --max-rounds 10
```

如果實際專案需要不同命令，以你產出的 `reports/ai-team/FINAL_HANDOFF_2026-07-04.md` 為準。

---

## 13. 最終目標

把此專案從：

```text
大量 AI 文件 + 舊限制 + 多套舊 autopilot + 一直修小 bug
```

收斂成：

```text
少數 canonical AI 文件
+ 一個唯一 Python autopilot 入口
+ Codex Lead / Executor / Arbitrator
+ Antigravity QA
+ local / staging aggressive release loop
+ P0/P1 清零導向
+ BETA_READY_CANDIDATE 報告
```

不要增加混亂。請刪繁就簡，封存舊系統，保留可追溯性，讓 AI 團隊之後能照唯一真相工作。
