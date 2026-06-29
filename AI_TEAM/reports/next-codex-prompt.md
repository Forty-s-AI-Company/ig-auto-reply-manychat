請接續 InboxPilot / ReplyPilot 專案，直接進入下一個安全產品任務：`Contacts filtered empty-state guidance`。

專案路徑：
C:\Users\eden\Downloads\AI\ig-auto-reply-manychat

背景狀態：
- Inbox / Channels visible-but-unusable closeout 已完成
- AI_TEAM delivery pipeline 已完成，不要再做 runner / delivery 機器本身
- 下一輪要回到產品功能
- 不碰 production DB
- 不部署 Production
- 不跑 migration / db push
- 不送 Meta App Review
- 不切 PayUNI production

本輪目標：
1. 先盤點 Contacts 套用篩選後還有哪些讓使用者誤會資料消失、條件不明、沒有返回入口的空狀態
2. 先定義這個主題的完整缺口清單與 Definition of Done
3. 再把同一主題的規劃 / 實作 / 驗證 / 交付做完
4. 能安全支援的功能，補成最小可用版本
5. 暫時不能安全支援的功能，改成清楚 disabled UX，不要只留假按鈕
6. 補 focused tests / smoke，讓下一輪 runner 可以直接接續
7. 最後更新 AI_TEAM 文件與產品 readiness 文件

開始前先讀：
- AI_TEAM/tasks/current-task.md
- AI_TEAM/tasks/backlog.md
- AI_TEAM/tasks/queue.json
- AI_TEAM/reports/dev-report.md
- AI_TEAM/reports/final-report.md
- docs/codex-session-log.md
- docs/fix-roadmap.md
- docs/project-launch-checklist.md
- docs/product-readiness-review.md
- src/components/ContactsListClient.tsx
- tests/e2e/contacts-auth.spec.ts

要求：
1. 先做主題級規劃，不要先寫 code。
2. 先列出完整缺口清單。
3. 先定義完成標準（Definition of Done）。
4. 再一次做完同主題的規劃 / 實作 / 驗證 / 交付，不要做到一半停在下一步建議。
5. 本輪只修產品功能，不碰 deployment / migration / Vercel / CI 優化。
6. 如果某功能暫時不能安全支援：
   - 改成 disabled button / badge / notice
   - 說明原因要讓使用者看得懂
   - 不要只留純文字
7. 如果某功能可以安全支援：
   - 補最小可用版本
   - 不做大重構
   - 不改資料模型 / migration，除非真的必要且你能說清楚風險
8. 補最小驗證：
   - `npm run lint`
   - `npm run build`
   - focused tests
   - 相關 Playwright smoke
9. 完成後更新：
   - AI_TEAM/tasks/current-task.md
   - AI_TEAM/tasks/backlog.md
   - AI_TEAM/reports/dev-report.md
   - AI_TEAM/reports/final-report.md
   - docs/codex-session-log.md
   - docs/fix-roadmap.md
   - docs/project-launch-checklist.md
   - docs/product-readiness-review.md

最後只回報：
1. 完整缺口
2. 實作項目
3. 驗證結果
4. 殘留風險
