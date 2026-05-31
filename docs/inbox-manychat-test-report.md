# Inbox ManyChat 版型與功能測試報告

測試日期：2026-05-22  
測試頁面：`http://localhost:3041/inbox`  
測試帳號：由 `ADMIN_EMAIL` / `ADMIN_PASSWORD` 提供
測試方式：使用 Playwright 啟動本機 Google Chrome，登入後實際操作 Inbox 頁面。

## 截圖

- 初始版型截圖：[manychat-inbox-zh-layout.png](assets/manychat-inbox-zh-layout.png)
- 互動測試截圖：[manychat-inbox-zh-interactions.png](assets/manychat-inbox-zh-interactions.png)
- 自動化測試結果：[manychat-inbox-zh-test-results.json](assets/manychat-inbox-zh-test-results.json)

## 測試結果

| 功能區 | 測試內容 | 結果 |
| --- | --- | --- |
| 頁面框架 | 頁面標題顯示「收件匣」 | 通過 |
| 頁面框架 | 頂部搜尋欄顯示「搜尋收件匣對話」 | 通過 |
| 左側分類 | `全部對話` 可顯示與切換 | 通過 |
| 左側分類 | `未指派` 可依 `assignedToId` 篩選未指派對話 | 通過 |
| 左側分類 | `指派給我` 可依目前登入者篩選已指派對話 | 通過 |
| 左側分類 | `提醒` 可依資料庫 `reminderAt` 篩選 | 通過 |
| 左側標籤 | `收藏` 可寫入 `isFavorite` 並篩選 | 通過 |
| 左側標籤 | `熱門名單` 可透過系統標籤加入/移除並篩選 | 通過 |
| 左側標籤 | `合作夥伴` 可透過系統標籤加入/移除並篩選 | 通過 |
| 團隊 | 團隊成員可顯示，並可將對話指派給成員 | 通過 |
| 主要工具列 | `開啟對話` 可切換為全部狀態 | 通過 |
| 主要工具列 | `未讀` 可啟用未讀篩選 | 通過 |
| 主要工具列 | `最新排序` 可切換為最舊排序 | 通過 |
| 主要工具列 | `所有渠道` 可切換為 Instagram 篩選 | 通過 |
| 主要工具列 | `篩選` 可開啟說明浮層 | 通過 |
| 對話區 | 對話列表可選取對話 | 通過 |
| 對話區 | 訊息氣泡、時間與 Instagram 分頁可顯示 | 通過 |
| 指派操作 | 對話可從未指派改為指定團隊成員 | 通過 |
| 提醒操作 | 點擊提醒圖示可開啟提醒選單 | 通過 |
| 提醒操作 | 可建立 20 分鐘提醒，提醒時間會保存到資料庫 | 通過 |
| 編輯器 | `回覆` 分頁輸入文字後可啟用傳送按鈕 | 通過 |
| 編輯器 | `備註` 分頁會停用 Instagram 傳送，避免誤送給客戶 | 通過 |
| 右側資訊 | 自動化、聯絡人標籤、訂閱來源、系統欄位可顯示 | 通過 |
| 中文化 | 指定的 ManyChat Inbox 英文文案已改為繁體中文 | 通過 |
| Console | 測試期間沒有瀏覽器 console error | 通過 |

本次自動化測試共 35 項，全部通過。

## 已完成的專案優化

1. Inbox 版型調整為接近 ManyChat：左側主選單、頁面 header、`main` 內側分類 aside、對話列表、聊天內容、右側聯絡人資訊四段式排列。
2. `全部對話 / 未指派 / 指派給我 / 提醒` 已放入 `main` 左側 aside。
3. `開啟對話 / 未讀 / 最新排序 / 所有渠道 / 篩選` 已移到 `main` 內部 header。
4. Inbox 主要介面已中文化，避免中英混雜。
5. 左上角工作區下拉選單已中文化，`Default Workspace` 顯示為「預設工作區」。
6. 補上可操作的前端狀態：分類篩選、未讀篩選、排序切換、渠道切換、提醒建立、回覆/備註切換。
7. 補上資料庫欄位 `Conversation.reminderAt` 與 `Conversation.isFavorite`。
8. 接上既有 `Conversation.assignedToId`，支援未指派、指派給我與團隊指派。
9. 建立系統標籤 `熱門名單`、`合作夥伴`，右側面板可快速加入/移除。

## 目前限制

這次已把 Inbox 做成可操作的 ManyChat 風格介面，但有幾個地方仍是前端層級或既有資料限制：

1. `未讀` 目前以最新訊息是否為 inbound 判斷，尚未有完整 read/unread DB 狀態。
2. `所有人` 團隊分類目前顯示團隊與指派數量；若要做到 ManyChat 多客服權限，需要再擴充角色權限與可見範圍。
3. Instagram 真實送訊息仍依賴 Meta token、權限與 channel 狀態；UI 已可送出，但實際 API 成功與否仍要看 Meta 連線。

## 驗證指令

```bash
npm run lint
npm run build
node scripts/test-inbox-ui.mjs
```
