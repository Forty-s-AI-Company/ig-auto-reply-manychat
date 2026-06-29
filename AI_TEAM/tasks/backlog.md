# Backlog

## Runner Rules

backlog 第一個可執行項目，代表下一輪預設要接的任務。若第一項被外部條件阻塞，runner 應跳到下一個 `UNBLOCKED` 項目，並把阻塞原因寫進 `AI_TEAM/reports/final-report.md`。

## Completed

- `[DONE][AI_TEAM]` AI_TEAM delivery autonomy closeout：已補 queue lifecycle、worker replay、merge/deploy gate、launcher flags、smoke、docs。
- `[DONE][AI_TEAM]` AI_TEAM disposable branch real delivery validation：已完成真實 add / commit / push / draft PR，且 merge gate 對 draft PR 的阻擋已驗證。

## Priority 1

- `[UNBLOCKED][AI_TEAM]` runtime / tracked state 邊界整理：避免 `AI_TEAM/runtime/`、reports、queue/task docs 在交付時互相污染。

## Priority 2

- `[UNBLOCKED][INBOX]` Inbox visible-but-unusable audit 第四輪：優先檢查 contact panel、更多聯絡人操作與剩餘 bulk action UX。
- `[UNBLOCKED][CHANNELS]` Channels 次要控制項 audit：comments / media / token 類操作的最小可用或 disabled UX。
- `[UNBLOCKED][CONTACTS]` Contacts 篩選與批次操作 UX 收尾。

## Priority 3

- `[UNBLOCKED][AUTOMATIONS]` Automations scope 清楚化與誤導文案收斂。
- `[UNBLOCKED][ANALYTICS]` Analytics 讀取與資料一致性 audit。
- `[UNBLOCKED][BILLING]` Billing / PayUNI Sandbox SOP 收尾，不切 production。

## HUMAN_REQUIRED

- 第三方後台登入
- 正式金流
- production DB 寫入
- Production deploy
- Meta App Review 實際送審
