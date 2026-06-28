# AI_TEAM 總控

AI_TEAM 是 InboxPilot 的新無人值守開發總控系統。它的設計重點不是一個會自己亂跑的 autopilot，而是一套文件先行、角色分工清楚、可回顧、可停下、可交接的工作方式。

## 使用順序

1. 先讀 `PROJECT_STATE.md`，確認目前專案階段。
2. 再讀 `LAUNCH_CRITERIA.md`，知道什麼叫做真的可以上線。
3. 讀 `tasks/current-task.md` 與 `tasks/backlog.md`，決定這一輪要做什麼。
4. 依工作類型選對 `roles/` 與 `skills/` 文件。
5. 每一輪都寫 `reports/`，不要把報告當成臨時垃圾桶。

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

## 目前狀態

- 專案階段：`PRE_LAUNCH`
- 主要目標：先把看得到但不能用的功能修好，再收斂 launch gate
- 舊 root autopilot 入口：已退場，後續以 `AI_TEAM/` 為主
