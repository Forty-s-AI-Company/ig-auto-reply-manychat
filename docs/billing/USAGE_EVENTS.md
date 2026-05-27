# Message Events 與用量限制

## Message Event 定義

會計入 1 event：

- 收到 IG 留言或私訊
- 留言 / 私訊關鍵字判斷
- 發送自動私訊
- 自動回覆私訊
- AI FAQ 執行一次
- Broadcast 發送給 1 個 contact
- Webhook 成功觸發一次

不計入：

- 新增 / 移除標籤
- 設定自訂欄位
- 內部備註
- 人工 Inbox 回覆不會被 100% 限制阻擋，但目前仍會記錄 message ledger 方便觀察營運量

## 實作位置

- Usage period：`UsagePeriod`
- Message event ledger：`MessageEventLedger`
- Service：`src/lib/billing/usage-service.ts`
- API：`GET /api/billing/usage`

## 規則

- 80%：標記 warning，不阻擋
- 100%：阻擋新的 automation send / broadcast queue
- 人工 Inbox 回覆不阻擋
- 管理員 override schema 已保留：`WorkspaceUsageOverride`
