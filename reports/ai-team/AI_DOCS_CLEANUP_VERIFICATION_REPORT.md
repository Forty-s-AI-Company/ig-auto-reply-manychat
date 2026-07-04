# AI Docs Cleanup Verification Report

## 1. Executive Summary

- AI_DOCS_REORGANIZED=PASS
- OLD_AI_ARTIFACTS_CONTROLLED=PASS
- SINGLE_AUTOPILOT_ENTRYPOINT=PASS
- AI_TEAM_DOCTOR_READY=FAIL
- AI_TEAM_DRY_RUN_READY=FAIL
- YOLO_RELEASE_READY=FAIL

**Conclusion:**
AI_DOCS_VERIFICATION=PASS
AI_TEAM_VERIFICATION=FAIL
YOLO_RELEASE_READY=FAIL

## 2. Canonical files status

- **`AGENTS.md`**: 存在。已精簡為專案專屬入口，並明確指定 4 份唯一可信文件，也聲明 `docs/archive/` 內文件不可採信。
- **`docs/AI_SOURCE_OF_TRUTH.md`**: 存在。詳述了真實技術棧 (Next.js, Prisma, PostgreSQL, PayUNI Sandbox 等)、部署與 Staging 狀態。
- **`docs/AI_RELEASE_CONTROL.md`**: 存在。明確定義 P0/P1/P2/P3 嚴重度與 BETA_READY_CANDIDATE 的標準。
- **`docs/AI_TEAM_AUTOPILOT.md`**: 存在。描述了單一 Python entrypoint 以及角色分工 (Codex Lead, Antigravity QA 等)。
- **`docs/_audit/AI_ARTIFACT_AUDIT_2026-07-04.md`**: 存在。完整列出了舊檔案的處置清單 (ARCHIVE, MERGE_INTO_NEW, 等)。

這些文件都基於專案實際情況撰寫，不再是空泛的公版模板。

## 3. Active AI artifact inventory

在 Active 區域找到的主要 AI 相關檔案：
- `AGENTS.md` (CANONICAL_ACTIVE)
- `docs/AI_SOURCE_OF_TRUTH.md` (CANONICAL_ACTIVE)
- `docs/AI_RELEASE_CONTROL.md` (CANONICAL_ACTIVE)
- `docs/AI_TEAM_AUTOPILOT.md` (CANONICAL_ACTIVE)
- `docs/_audit/AI_ARTIFACT_AUDIT_2026-07-04.md` (SUPPORTING_ACTIVE)
- `scripts/ai_release_autopilot.py` (CANONICAL_ACTIVE)
- `scripts/ai_release_autopilot_config.example.json` (SUPPORTING_ACTIVE)
- `scripts/ai_cli_probe.py` (SUPPORTING_ACTIVE)
- `.ai-team/state.example.json` (SUPPORTING_ACTIVE)
- `.ai-team/ai_artifacts.detected.json` (SUPPORTING_ACTIVE)
- `.ai-team/cli_profiles.detected.json` (SUPPORTING_ACTIVE)
- `reports/ai-team/` 內的各式產出報告 (SUPPORTING_ACTIVE / GENERATED)

*其他發現的邊緣文件（非核心控制文件）：*
- `videos/inboxpilot-ig-vertical/AGENTS.md` (SHOULD_ARCHIVE / DUPLICATE)
- `videos/inboxpilot-youtube-horizontal/AGENTS.md` (SHOULD_ARCHIVE / DUPLICATE)
- `videos/inboxpilot-ig-vertical/CLAUDE.md` (SHOULD_ARCHIVE)
- `videos/inboxpilot-youtube-horizontal/CLAUDE.md` (SHOULD_ARCHIVE)

## 4. Archive / deprecated status

- 舊的 Node.js based Runner (例如 `AI_TEAM/scripts/*`) 已經完全被移除並封存。
- 舊的佇列狀態 (例如 `AI_TEAM/tasks/queue.json`) 和 Runtime Logs 皆已移至封存區。
- `docs/_audit/AI_ARTIFACT_AUDIT_2026-07-04.md` 中詳細記錄了所有檔案的 mapping。

## 5. Conflicts found

- **無互相競爭的 Autopilot Entrypoint**：Active 區域中只剩下 `scripts/ai_release_autopilot.py` 負責整個流程控制。
- **無舊限制干擾**：舊的「必須在產生 prompt 後停止」已被廢除，現在的文件明確允許 Autopilot 透過 `python scripts/ai_release_autopilot.py` 連續執行多個 round。
- **遺留的文件**：在 `videos/` 資料夾下還遺留有 `AGENTS.md` 與 `CLAUDE.md`，雖不影響根目錄的判讀，但建議清理以防混淆。

## 6. Autopilot readiness

`scripts/ai_release_autopilot.py` 是真實的 Python 程式腳本，內部實作了：
- 呼叫 `codex exec` 與 `agy` 等外部子程序的邏輯
- 包含 local checks, staging checks, state.json (resume) 狀態維護
- 偵測 failed command
- `yolo` mode 自動 Git Delivery 等能力
這**不是**單純的 prompt collection。

**執行驗證結果：**

1. `python scripts/ai_cli_probe.py`
   - **Exit Code**: 0
   - **結果**: 執行成功，輸出 `CLI discovery written to reports/ai-team/02_CLI_DISCOVERY.md`。

2. `python scripts/ai_release_autopilot.py --doctor`
   - **Exit Code**: 1
   - **錯誤訊息**:
     ```
     usage: ai_release_autopilot.py [-h] --mode {status,docs-check,inventory,run-once,run,qa-only,resume,yolo} ...
     ai_release_autopilot.py: error: the following arguments are required: --mode
     ```
   - **原因**: 腳本的 `argparse` 並未定義 `--doctor` 參數，且缺少必填參數 `--mode`。

3. `python scripts/ai_release_autopilot.py --dry-run --target sale-ready --max-rounds 1`
   - **Exit Code**: 1
   - **錯誤訊息**:
     ```
     usage: ai_release_autopilot.py [-h] --mode {status,docs-check,inventory,run-once,run,qa-only,resume,yolo} ...
     ai_release_autopilot.py: error: the following arguments are required: --mode
     ```
   - **原因**: 腳本的 `argparse` 並未定義 `--dry-run`（應為 `--profile dry-run`），且缺少必填參數 `--mode`。

## 7. Required Codex fixes

最小修復清單 (Minimal Fixes Required)：
1. 修改 `scripts/ai_release_autopilot.py`，補上或處理 `--doctor` 參數，或於文件中移除 `--doctor` 的測試要求。
2. 修改 `scripts/ai_release_autopilot.py`，補上或處理 `--dry-run` 參數的別名（使其映射到 `--mode run --profile dry-run` 或是新增 `--dry-run` flag），並提供預設 mode 以防崩潰。
3. 清除或封存 `videos/` 底下的 `AGENTS.md` 和 `CLAUDE.md`。
