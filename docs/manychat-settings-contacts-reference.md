# ManyChat Settings / Automation / Contacts 參考與本專案實作紀錄

日期：2026-05-22  
來源：已保存的 ManyChat Settings 截圖與本機頁面驗證。  
限制：目前本回合沒有可接管使用者已登入 Chrome 的 `chrome` connector，所以外部 ManyChat Contacts 沒有重新截圖；Settings 截圖使用先前已成功保存的資料。

## ManyChat Settings 截圖

完整截圖位置：`docs/manychat-settings-screenshots/`

| 區塊 | ManyChat 頁籤 | 截圖 |
| --- | --- | --- |
| Main | General | `01-general.png` |
| Main | Notifications | `02-notifications.png` |
| Main | Team Members | `03-team-members.png` |
| Main | Logs | `04-logs.png` |
| Main | Display | `05-display.png` |
| Billing | Subscriptions | `06-subscriptions.png` |
| Billing | Invoices | `07-invoices.png` |
| Billing | Payment Details | `08-payment-details.png` |
| Inbox | Inbox Behavior | `09-inbox-behavior.png` |
| Inbox | Auto-Assignment | `10-auto-assignment.png` |
| Channels | Instagram | `11-instagram.png` |
| Channels | TikTok / WhatsApp / Messenger / SMS / Email / Telegram | `12` 到 `17` |
| Automation | Fields | `18-fields.png` |
| Automation | Tags | `19-tags.png` |
| Automation | Conversion Events | `20-conversion-events.png` |
| Extensions | API / Apps / Integrations / Payments / Installed Templates / Pixel | `21` 到 `26` |

## Automation Settings 參考

使用者要求的 `My Automations / Basic / Sequences` 已在本專案設定頁建立對應區塊：

| ManyChat 頁籤 | 本專案位置 | 狀態 |
| --- | --- | --- |
| My Automations | `/channels#automation-settings` | 顯示平台帳號的自動化資訊，實際編輯在 `/automations` |
| Basic | `/channels#automation-settings` | 已接預設回覆、關鍵字、留言觸發、延遲、公開回覆、按讚設定 |
| Sequences | `/channels#automation-settings` | [開發中] |

## Contacts 參考

本專案已把 Contacts 改成接近 ManyChat 的聯絡人管理版型：

- 左側分類：全部聯絡人、已訂閱、未知狀態、標籤
- 主要 header：搜尋、篩選、新增標籤
- 表格欄位：聯絡人、渠道、訂閱狀態、標籤、對話數、最後互動
- 點擊聯絡人可進入聯絡人詳細頁

本機截圖：

- `docs/assets/local-contacts-manychat.png`
- `docs/assets/local-settings-manychat.png`
- `docs/assets/local-settings-automation.png`
- `docs/assets/local-profile-manychat.png`

## 本專案已完成調整

1. 左側主導覽移除低頻工具入口，只保留 ManyChat 核心主選單：首頁、聯絡人、自動化、AI、收件匣、設定。
2. 原本的工具頁面沒有刪除，改成放在設定頁的對應區塊或保留為 [開發中] 入口。
3. 個人檔案下拉選單已中文化，並新增 `/profile` 個人檔案頁。
4. 語系選單預設為繁體中文，English 標示為 [開發中]。
5. 設定頁已改成 ManyChat Settings 的分組版型。
6. Contacts 頁已改成 ManyChat 風格的分類側欄 + 搜尋工具列 + 聯絡人表格。
7. 左上角帳號區已取消「工作區」切換，改成平台帳號選單。
8. 新增帳號流程改成「選擇平台 > 前往平台登入授權 > 成功後回到設定頁顯示已連結帳號」。

## 平台登入與新增帳號流程

目前本專案以平台登入為主，不在 UI 上呈現工作區切換。

| 流程步驟 | 本專案位置 | 狀態 |
| --- | --- | --- |
| 左上角帳號下拉 | 全站左側欄 | 顯示已連結 Instagram 帳號、全部 IG 帳號、新增平台帳號 |
| 平台選擇頁 | `/channels#platform-connect` | Instagram / Facebook Messenger 可進入登入；其他平台顯示 [開發中] |
| Instagram 登入 | `/api/meta/oauth/start?mode=instagram` | 已接 Meta OAuth / Instagram Login |
| Facebook Messenger 登入 | `/api/meta/oauth/start?mode=facebook` | 已接 Meta OAuth 入口 |
| 新增成功 | `/channels?connected=...` | 成功後顯示已連結帳號與 token 狀態 |

## 本機測試紀錄

本輪新增全站 UI smoke 測試與平台帳號流程測試：

- `scripts/test-main-pages-ui.mjs`
- 測試結果：`docs/assets/main-ui-smoke-results.json`
- 主要截圖：`docs/assets/fullsite-platform-account-dropdown.png`
- Inbox 專項互動測試：`scripts/test-inbox-ui.mjs`

## 工具入口處理原則

左側原本的 `工具、知識庫、群發訊息、標籤、分眾、帳務方案、測試工具` 並不是完全沒用，但它們不該放在主選單第一層。

目前定位如下：

| 原入口 | 新定位 |
| --- | --- |
| 知識庫 | AI / 設定內資料來源，低頻維護 |
| 群發訊息 | 廣播功能，後續可放 Automation 或 Settings |
| 標籤 | Contacts / Inbox / Settings 的輔助管理 |
| 分眾 | Contacts 的篩選能力，後續可做成 Contacts 內頁籤 |
| 帳務方案 | Settings > Billing |
| 測試工具 | 開發/除錯用，不放日常主選單 |

## 尚未完成

1. ManyChat 外部 Contacts 頁尚未重新截圖，原因是本回合沒有可接管已登入 Chrome 的工具。
2. Sequences 尚未正式實作資料庫與排程。
3. Logs、Display、API、Apps、Integrations、Pixel 目前是設定頁入口與 [開發中] 狀態。
