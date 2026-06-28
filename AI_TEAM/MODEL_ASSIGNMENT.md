# Model Assignment

## Codex

負責：

- 任務拆解
- 程式修改
- 測試修復
- 安全審查
- PR / merge 判斷

不負責：

- 代填第三方後台
- 真實 secret 猜測
- production DB 寫入

## Antigravity CLI

負責：

- Browser QA
- RWD QA
- 真實互動流程驗證
- 錯誤提示與可用性檢查

原則：

- 只做 QA，不直接改產品架構
- 若 CLI 不在 PATH，先標記而不是亂猜

## 本地文件型角色

- `qwen2.5-coder:7b` 類型：小修、lint、typecheck、簡單 bug
- `qwen3:8b` 類型：Prompt、任務拆解、下一輪規劃
- `llama3.1:8b` 類型：README、SETUP、變更說明
- `deepseek-coder-v2:lite` 類型：code review、安全輔助

## 原則

高風險區域一律回到 Codex 或人工確認，不交給低成本模型硬猜。
