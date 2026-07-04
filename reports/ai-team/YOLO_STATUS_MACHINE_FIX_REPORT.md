# YOLO Status Machine Fix Report

- Date: 2026-07-04
- Mode: AI_TEAM YOLO RESULT FIX MODE
- Scope: Fix YOLO status classification, prompts, report generation, and report-only commit semantics.

## 1. 為什麼上一輪沒有修改產品程式碼

上一輪 YOLO runner 的 local validation 已經通過：

- `npm run lint` exit 0
- `npm run build` exit 0
- `npm test` exit 0
- `npm run test:e2e:reviewer` exit 0

因此沒有明確產品 P0/P1 bug 需要 Codex Executor 修改產品程式碼。剩餘問題主要是 staging / third-party / human acceptance evidence，而不是 product source bug。

## 2. 哪些報告判斷錯誤

`reports/ai-team/yolo-codex-lead.md` / `reports/ai-team/yolo-external-ai.md` 將「尚未看到 local validation evidence」列為 P0，但同一輪 `reports/ai-team/yolo-validation.md` 已經明確記錄 local validation exit 0。

這是證據讀取順序與分類邏輯錯誤：

- external AI review 在 runner 內早於 local validation 執行。
- prompt 沒有強制 Lead / QA 優先讀 `yolo-validation.md`。
- 狀態機只有 `CONTINUE` / `BLOCKED`，無法分辨 product blocker、evidence gap、human blocker。

## 3. 如何修正 local validation evidence 的讀取

已修正 `scripts/ai_release_autopilot.py`：

- YOLO 流程現在先跑 local validation，再呼叫 external AI review。
- 新增 `validation_summary()` 與 `validation_prompt_context()`。
- Codex Lead / Antigravity prompt 會收到 local validation command exit code 摘要。
- 如果 validation 已通過，prompt 明確禁止再宣稱：
  - 尚未看到 local validation evidence
  - 尚未跑 lint / build / test
  - 尚未跑 reviewer e2e

## 4. 如何區分 product blockers / evidence gaps / human blockers

已新增 / 調整分類：

- `PRODUCT_FIX_REQUIRED`: local validation 失敗或有明確產品 P0/P1 bug。
- `STAGING_EVIDENCE_REQUIRED`: local validation 通過，但仍缺 staging / third-party / reviewer-safe evidence。
- `HUMAN_ACCEPTANCE_REQUIRED`: local validation 通過，但剩餘 Meta App Review、Business Verification、PayUNI production、production deploy 等人工 gate。
- `HUMAN_BLOCKED`: 保留給必須真人補資料或授權的硬阻塞。
- `SALE_READY_CANDIDATE`: local validation 通過，未發現 product blocker，等待人工 beta acceptance。
- `CONTINUE`: 安全續跑狀態。
- `FAIL`: runner / 非 sandbox 型外部錯誤。

Antigravity / subprocess sandbox 限制現在會被歸類為 `EXTERNAL_QA_LIMITED`，在 local validation 已通過時不會阻塞整個 release autopilot。

## 5. 修正後下一輪應該如何判斷

若下一輪仍使用：

```powershell
python scripts/ai_release_autopilot.py --mode yolo --target sale-ready --env local --env staging --max-rounds 1 --max-hours 1 --auto-commit --write-final-report
```

預期行為：

- 先產生並讀取 `reports/ai-team/yolo-validation.md`。
- 若 lint / build / test / reviewer e2e 全部 exit 0，狀態不得因「缺 local validation evidence」而變成 product P0。
- 若只剩 staging / reviewer-safe / Meta / PayUNI / Production gate，應輸出 `STAGING_EVIDENCE_REQUIRED` 或 `HUMAN_ACCEPTANCE_REQUIRED`。
- 若只有 reports / `.ai-team` state 變更且 `--write-final-report` 開啟，commit message 應為：
  - `release: collect ai team yolo evidence`

## 6. 建議下一個指令

先交給 Antigravity / Codex 外部 QA 做一次短複驗，不啟動長時間 YOLO：

```powershell
python scripts/ai_release_autopilot.py --doctor
python scripts/ai_release_autopilot.py --dry-run --target sale-ready --max-rounds 1
```

通過後，再由使用者決定是否跑單輪 YOLO certification。

## 7. 驗證結果

| Command | Exit code | Result |
|---|---:|---|
| `python -m py_compile scripts/ai_release_autopilot.py` | 0 | PASS |
| `python scripts/ai_release_autopilot.py --doctor` | 0 | PASS |
| `python scripts/ai_release_autopilot.py --dry-run --target sale-ready --max-rounds 1` | 0 | PASS |

YOLO_STATUS_MACHINE_FIX=PASS
LOCAL_VALIDATION_EVIDENCE_RECOGNIZED=PASS
PRODUCT_CODE_CHANGED=NO
READY_FOR_ONE_MORE_CERTIFICATION=PASS
