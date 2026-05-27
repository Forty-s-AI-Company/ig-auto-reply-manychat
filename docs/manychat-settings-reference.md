# ManyChat Settings 排版與頁籤截圖

測試日期：2026-05-22

來源帳號：

```text
https://app.manychat.com/fb4356719/settings#instagram
```

本文件記錄 ManyChat Settings 的整體排版、左側頁籤分組與各頁內容截圖，作為本專案總設定頁與新增帳號流程的 UI 參考。

## 排版觀察

ManyChat 使用三層結構：

1. 最左側主導覽：Home、Contacts、Automation、Manychat AI、Inbox、Settings。
2. Settings 內側欄：依功能群組分成 Main、Billing、Inbox、Channels、Automation、Extensions。
3. 右側內容區：呈現目前頁籤的可操作設定、說明文字與 CTA。

這種設計的重點是：帳號連結、權限刷新、Inbox 行為、自動化資料、API / Integrations 都集中在 Settings，不需要使用者在多個頁面猜功能位置。

## 頁籤總覽

| 群組 | 頁籤 |
| --- | --- |
| Main | General、Notifications、Team Members、Logs、Display |
| Billing | Subscriptions、Invoices、Payment Details |
| Inbox | Inbox Behavior、Auto-Assignment |
| Channels | Instagram、TikTok、WhatsApp、Messenger、SMS、Email、Telegram |
| Automation | Fields、Tags、Conversion Events |
| Extensions | API、Apps、Integrations、Payments、Installed Templates、Pixel |

## 截圖索引

### Main

#### General

![General](manychat-settings-screenshots/01-general.png)

重點內容：Card URL Shortener、Account Time Zone、Clone to Another Account、Use as Template、Leave Account、Delete Account。

#### Notifications

![Notifications](manychat-settings-screenshots/02-notifications.png)

重點內容：通知與帳號層級提醒設定。

#### Team Members

![Team Members](manychat-settings-screenshots/03-team-members.png)

重點內容：團隊成員、角色與邀請管理。

#### Logs

![Logs](manychat-settings-screenshots/04-logs.png)

重點內容：帳號操作紀錄與事件追蹤。

#### Display

![Display](manychat-settings-screenshots/05-display.png)

重點內容：顯示語言、介面顯示偏好與品牌呈現相關設定。

### Billing

#### Subscriptions

![Subscriptions](manychat-settings-screenshots/06-subscriptions.png)

重點內容：方案訂閱與升級資訊。

#### Invoices

![Invoices](manychat-settings-screenshots/07-invoices.png)

重點內容：發票紀錄。

#### Payment Details

![Payment Details](manychat-settings-screenshots/08-payment-details.png)

重點內容：付款方式與帳務資料。

### Inbox

#### Inbox Behavior

![Inbox Behavior](manychat-settings-screenshots/09-inbox-behavior.png)

重點內容：收件匣行為、對話處理與客服流程設定。

#### Auto-Assignment

![Auto-Assignment](manychat-settings-screenshots/10-auto-assignment.png)

重點內容：客服指派與自動分派規則。

### Channels

#### Instagram

![Instagram](manychat-settings-screenshots/11-instagram.png)

重點內容：已連結帳號、Default Reply、Main Menu、Conversation Starters、Story Mention Reply、Ads Optimization、Refresh Instagram Permissions、Disable / Remove Instagram Channel。

#### TikTok

![TikTok](manychat-settings-screenshots/12-tiktok.png)

重點內容：TikTok channel 連結與自動化入口。

#### WhatsApp

![WhatsApp](manychat-settings-screenshots/13-whatsapp.png)

重點內容：WhatsApp channel 連結、電話號碼與訊息設定入口。

#### Messenger

![Messenger](manychat-settings-screenshots/14-messenger.png)

重點內容：Messenger channel 連結與粉專訊息設定。

#### SMS

![SMS](manychat-settings-screenshots/15-sms.png)

重點內容：SMS channel 與發送設定。

#### Email

![Email](manychat-settings-screenshots/16-email.png)

重點內容：Email channel 與寄信設定。

#### Telegram

![Telegram](manychat-settings-screenshots/17-telegram.png)

重點內容：Telegram channel 連結與 bot 設定。

### Automation

#### Fields

![Fields](manychat-settings-screenshots/18-fields.png)

重點內容：自訂欄位，用於儲存使用者輸入或自動化流程資料。

#### Tags

![Tags](manychat-settings-screenshots/19-tags.png)

重點內容：標籤管理，用於分眾、條件判斷與廣播篩選。

#### Conversion Events

![Conversion Events](manychat-settings-screenshots/20-conversion-events.png)

重點內容：轉換事件與追蹤設定。

### Extensions

#### API

![API](manychat-settings-screenshots/21-api.png)

重點內容：API / token / developer integration 入口。

#### Apps

![Apps](manychat-settings-screenshots/22-apps.png)

重點內容：已安裝或可安裝的應用程式。

#### Integrations

![Integrations](manychat-settings-screenshots/23-integrations.png)

重點內容：第三方整合。

#### Payments

![Payments](manychat-settings-screenshots/24-payments.png)

重點內容：付款與交易相關整合。

#### Installed Templates

![Installed Templates](manychat-settings-screenshots/25-installed-templates.png)

重點內容：已安裝模板。

#### Pixel

![Pixel](manychat-settings-screenshots/26-pixel.png)

重點內容：追蹤像素與網站事件。

## 對本專案的實作調整

已將本專案 `/channels` 改成 ManyChat-like Settings layout：

- 左側新增 Settings 分組側欄。
- `+ New Account` 放在設定頁頂部與帳號切換器中。
- 新增 `新增帳號` 區塊，提供 Instagram、Facebook Messenger 與預留頻道卡片。
- Channels 側欄已補齊 Instagram、TikTok、WhatsApp、Messenger、SMS、Email、Telegram。
- Extensions 側欄已補齊 API、Apps、Integrations、Payments、Installed Templates、Pixel。
- Instagram 設定集中顯示帳號、token、連結時間、到期時間、刷新權限、移除帳號。
- Inbox、Automation、Billing、Extensions 先以同樣資訊架構占位，後續功能可以逐步補上。

完成後本專案畫面：

![本專案 ManyChat-like Settings](assets/local-manychat-settings-page-updated.png)

相關檔案：

```text
src/app/channels/page.tsx
src/components/IgAccountSwitcher.tsx
```

原始截圖與 DOM 快照：

```text
docs/manychat-settings-screenshots/
```
