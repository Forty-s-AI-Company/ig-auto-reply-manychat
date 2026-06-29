請接續 InboxPilot / ReplyPilot 專案，進入 AI_TEAM 完全自動閉環模式。

專案路徑：
C:\Users\eden\Downloads\AI\ig-auto-reply-manychat

目前狀態：
- AI_TEAM runner 已支援 queue 空時自動補產品任務。
- 目前 queue 已自動補入 `Inbox visible-but-unusable product sweep`。
- 請以產品完成為目標，先處理 Inbox，再依序處理 Channels、Contacts、Automations、Analytics、Billing / PayUNI Sandbox。
- 不要再優先處理 runner / delivery 機器本身，除非它阻止產品閉環繼續。

本輪規則：
1. 先讀 `AI_TEAM/tasks/current-task.md`、`AI_TEAM/tasks/backlog.md`、`AI_TEAM/tasks/queue.json`。
2. 依 current task 做主題級規劃，列出完整缺口與 Definition of Done。
3. 直接修可安全處理的產品缺口。
4. 能安全支援的功能補成最小可用版本。
5. 暫時不能安全支援的功能改成清楚 disabled UX，不要留下假按鈕。
6. 補 focused tests / smoke。
7. 驗證失敗就修，修完再測。
8. 通過後更新 AI_TEAM 文件與 docs。
9. 若安全可提交，就 commit / push / PR。
10. 若 CI / merge gate 通過且沒有風險，就 merge。
11. 一個主題完成後，不要停在報告；planner 會自動補下一個產品主題。

安全限制：
- 不碰 production DB
- 不跑 migration / db push
- 不部署 Production，除非另外明確開啟 production deploy
- 不送 Meta App Review
- 不切 PayUNI production
- 不輸出 secret / token / password / cookie
- 不提交 reports / logs / cache / .env
- 不做無關的大重構

優先順序：
1. Inbox visible-but-unusable audit
2. Channels / Connect / Social connect audit
3. IG 多帳號顯示 / metadata refresh / 錯誤訊息清楚化
4. Contacts 篩選 / 批次操作 / 空狀態與清楚 disabled UX
5. Automations scope 清楚化
6. Analytics 讀取與資料一致性
7. Billing / PayUNI Sandbox SOP
8. Launch readiness product sweep

每輪驗證至少：
- `npm run lint`
- `npm run build`
- focused tests
- 相關 Playwright smoke

完成後回報：
1. 本輪完成項目
2. 完整缺口
3. 實作項目
4. 驗證結果
5. commit / push / PR / merge 狀態
6. 是否影響上線狀態
7. 是否新增風險
8. 剩餘未完成項目
9. 下一個自動主題
10. 下一個建議 Codex Prompt
