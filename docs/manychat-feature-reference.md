# ManyChat 功能參考與專案對照文件

更新日期：2026-05-21  
測試目標：https://app.manychat.com/fb4356719/dashboard

## 測試狀態

這次實際開啟 ManyChat 後，系統被導向登入頁：

```text
https://app.manychat.com/signin?return=%2Ffb4356719%2Fdashboard
```

因為目前沒有登入帳號授權，所以沒有進入 Dashboard 內部，也沒有操作任何會修改帳號資料的功能，例如建立 automation、發送 broadcast、改 tag、改 contact 或串接 OAuth。

目前已實測可見的登入頁功能：

- 支援 Facebook 登入。
- 支援 Google 登入。
- 支援 Telegram 登入。
- 支援 Apple 登入。
- 有 `Get started free` 與 `Sign up` 入口。
- 有語言切換入口。
- 有 Privacy / Cookie 彈窗，包含 Privacy Policy、More Information、OK。

後台功能部分以下方官方 Help Center 文件交叉整理，並標註成「功能參考」。之後如果有登入權限，可以再依照本文最後的驗證清單補齊真實畫面與流程差異。

## 產品定位

ManyChat 是一個多渠道聊天自動化平台，核心不是單純的聊天室，而是把「聯絡人、對話、觸發條件、自動化流程、分眾、廣播、AI 輔助」串成同一個營運後台。

對本專案來說，最值得參考的不是完全照抄 UI，而是這幾個產品骨架：

- Workspace / Account 作為最上層容器。
- Channel 作為訊息來源，例如 Instagram、Messenger、WhatsApp、Telegram、SMS、Email。
- Contact 是跨功能核心資料。
- Conversation / Inbox 是客服與人工接手中心。
- Automation / Flow Builder 是自動回覆與流程設計中心。
- Broadcast 是大量推播與分眾再行銷中心。
- Tags、Segments、Custom Fields 是 CRM 與自動化判斷基礎。

## 1. Automation / Flow Builder

ManyChat 的 Automation 是最核心功能。官方文件把流程建立分成 Flow Builder 與 Basic Builder，並提供預覽、發布、undo / redo、流程自動排列、縮放、區塊工具列與 AI Flow Builder Assistant。

主要概念：

- Trigger：流程起點，例如關鍵字、QR code、使用者互動、特定事件。
- Message block：發送文字、圖片、按鈕、quick reply 等訊息。
- Condition block：根據 tag、欄位、渠道、使用者狀態分流。
- Action block：改 tag、改 custom field、訂閱 sequence、開啟 conversation、通知管理員、發 external request。
- Preview / Publish：流程上線前可預覽，發布後才會正式觸發。

本專案可參考設計：

- Automation 資料結構應拆成 `trigger -> nodes -> edges -> actions`。
- 每個 node 需要明確紀錄 channel，避免 Instagram trigger 接到 WhatsApp message 這種不會觸發的錯配。
- UI 上可以先做 Basic Builder，再逐步升級成視覺化 Flow Builder。
- 每個 automation 要有 draft / active / paused / archived 狀態。
- Publish 前應做 validation，例如 trigger 是否存在、message 是否空白、channel 是否啟用。

官方來源：

- https://help.manychat.com/hc/en-us/articles/14281166306332-How-to-build-a-Manychat-automation
- https://help.manychat.com/hc/en-us/articles/14281111044124-Automation-tab-Overview

## 2. Triggers / Rules

ManyChat 除了流程內的 trigger，也有全域 rules。Rules 會在聯絡人發生某些事件時執行，例如新增聯絡人、tag 變更、custom field 變更、sequence 訂閱狀態變更。

適合本專案拆成兩層：

- Flow Trigger：啟動某一條 automation。
- Global Rule：跨 automation 的事件監聽器。

建議先支援的 trigger：

- Keyword received。
- New contact。
- Tag added。
- Custom field changed。
- Manual test trigger。
- Meta / Instagram webhook event trigger。

後續可加：

- Comment keyword。
- Story mention。
- Live comment。
- Payment success。
- Form submitted。
- External webhook。

官方來源：

- https://help.manychat.com/hc/en-us/articles/14281170185628-How-to-set-custom-rules-with-Triggers-Conditions-and-Actions
- https://help.manychat.com/hc/en-us/articles/14281275933724-Instagram-Live-Comments-Trigger

## 3. Inbox / Live Chat

ManyChat Inbox 是多渠道人工客服中心。官方文件提到，如果 contact 正在 automation 裡，人工接手時自動訊息仍可能繼續送，直到流程結束或遇到 Delay / Smart Delay 等 breakpoint。這點很重要，因為人工對話和自動化流程會同時存在。

本專案可參考設計：

- Conversation 要有 open / closed 狀態。
- 訊息要區分 inbound、automation outbound、agent outbound、system event。
- 支援人工接手時暫停 automation，或設定 pause duration。
- Conversation 可指派 agent / team。
- Contact 側邊欄顯示 tags、custom fields、last interaction、channel opt-in。

建議資料欄位：

- `conversation.status`
- `conversation.assigneeId`
- `conversation.automationPausedUntil`
- `message.source = user | automation | agent | system`
- `message.channel`
- `message.deliveryStatus`

官方來源：

- https://help.manychat.com/hc/en-us/articles/14281070478748-Manychat-Inbox

## 4. Contacts / Tags / Segments / Fields

ManyChat 的 Contacts tab 可做搜尋、篩選、批次操作、segment、tag、contact profile 與匯入。Tag 是最輕量的分群方式，Segment 則是儲存後的篩選條件。Custom User Fields 用來保存每個 contact 的個別資料，Bot Fields 則是整個 bot 共用的全域資料。

本專案可參考設計：

- Contact 不只是姓名與外部 ID，應該承載「可被 automation 判斷」的狀態。
- Tag 適合做廣播名單、興趣分類、流程節點紀錄。
- Segment 應該是 filter definition，不是固定名單。
- Custom Field 需支援型別，例如 text、number、boolean、date、email、phone。
- System Field 應與 Custom Field 分開，避免使用者刪到關鍵欄位。

優先功能：

- Contact list 搜尋。
- Contact detail。
- Add / remove tag。
- Custom field 顯示與更新。
- 依 tag / channel / last interaction 篩選。
- 儲存 segment。

官方來源：

- https://help.manychat.com/hc/en-us/articles/14281110746012-Contacts-tab-Overview
- https://help.manychat.com/hc/en-us/articles/14281167138588-User-Input-and-Custom-Fields
- https://help.manychat.com/hc/en-us/articles/14281292522652-System-Fields

## 5. Broadcast

ManyChat Broadcast 用來對大量聯絡人發送訊息。官方文件提到可以從零建立 broadcast，也可以從既有 automation 生成一份 broadcast copy，不會影響原本 automation。Broadcast 設定分成 Content 與 Target Audience，也可以立即發送或排程。

本專案可參考設計：

- Broadcast content 可以復用 automation node schema。
- 從 automation 建 broadcast 時要 copy 一份 snapshot，避免原 automation 被修改。
- Target Audience 應支援 tag、segment、channel、語言、互動時間、opt-in 狀態等條件。
- 排程發送時，收件人名單應在送出當下重新計算，才符合動態 segment 的直覺。
- 發送前要做 messaging window / consent 檢查。

建議狀態：

- draft
- scheduled
- queued
- sending
- sent
- failed
- cancelled

訊息層級狀態：

- queued
- sent
- delivered
- read
- failed
- skipped_by_policy

官方來源：

- https://help.manychat.com/hc/en-us/articles/14281228205212-Broadcasting-content
- https://help.manychat.com/hc/en-us/articles/23358636027932-Understanding-messaging-windows

## 6. Messaging Window / 合規限制

ManyChat 官方文件提到，Facebook Messenger、Instagram、WhatsApp 都有 24 小時 messaging window；Instagram / Messenger 另有 7 天延伸情境。WhatsApp 超過 24 小時後通常必須使用 Message Template。

這對本專案很關鍵，因為自動化平台最容易出問題的地方不是 UI，而是「可以送」與「不該送」的邊界。

本專案建議：

- Contact 要記錄各 channel 的 last interaction time。
- 發送前統一跑 policy guard。
- 若超出窗口，不能假裝送成功，要回傳 `skipped_by_policy` 或要求 template。
- Broadcast / Automation / Agent manual reply 都應共用同一套合規檢查。

官方來源：

- https://help.manychat.com/hc/en-us/articles/23358636027932-Understanding-messaging-windows

## 7. AI 功能

ManyChat 有 AI Flow Builder Assistant，可在 Flow Builder 中用聊天方式生成 automation 建議。官方文件指出目前可用於 Instagram、Messenger、WhatsApp、Telegram channels。

本專案可參考方向：

- AI 不是直接取代 automation builder，而是輔助建立草稿。
- AI 產生的流程應先是 draft，必須人工確認後才 publish。
- AI reply 應吃 Knowledge Base、品牌語氣、禁止回答範圍與 channel 限制。
- AI 產生的 message node 要經過長度、敏感詞、link、平台限制檢查。

優先功能：

- FAQ / Knowledge Base。
- AI reply action。
- AI draft automation。
- AI 回覆預覽與人工覆核。

官方來源：

- https://help.manychat.com/hc/en-us/articles/14281200017948-Manychat-AI-Flow-Builder-assistant

## 8. API / Dynamic Response / Integrations

ManyChat 的 response reference 顯示 Instagram、WhatsApp、Telegram automation 可回傳 structured response，例如 text、image、cards、buttons、quick replies、actions。不同 channel 支援能力不同，例如 video / audio / file 主要偏 Telegram，gallery cards 不支援 WhatsApp 與 Telegram。

本專案可參考設計：

- Message schema 要有 channel capability validation。
- Button 類型至少支援 url、flow、node。
- Dynamic block / external request 的 response 要驗證版本與 content type。
- Integrations 可以先抽象成 action provider，例如 webhook、CRM、Google Sheets、PayUNI。

官方來源：

- https://help.manychat.com/hc/en-us/articles/26673580447900-Response-Reference-for-Instagram-WhatsApp-and-Telegram-Automation
- https://help.manychat.com/hc/en-us/articles/17636378650268-Actions

## 9. Instagram 連線與常見問題

ManyChat 的 Instagram automation 依賴 Meta / Instagram 權限。官方 troubleshooting 提到需要確認 Instagram 是 Professional account、允許 connected tools 存取訊息、必要時刷新權限；若 Facebook Business page 重新指派給 Instagram，舊版連線可能需要聯絡 support 重新連接。

本專案如果要做 Instagram / Meta channel，應該保留：

- Channel connection status。
- Permission health check。
- Webhook subscription status。
- Token expiry / refresh 狀態。
- 最近一次 webhook received at。
- 最近一次 outbound error。

後台 UI 建議不要只顯示「已連線」，而要拆成：

- token 有效
- webhook 有效
- page / ig account mapping 有效
- message access permission 有效

官方來源：

- https://help.manychat.com/hc/en-us/articles/14281308423452-Instagram-automation-troubleshooting

## 對本專案的功能優先級建議

### P0：先補齊核心骨架

- Workspace / Channel / Contact / Conversation 的資料關係。
- Inbox 可以看 inbound 與 automation outbound。
- Keyword trigger automation。
- Send message、add tag、remove tag、set field、condition。
- Contact tags / custom fields。
- Messaging window guard。
- 基礎 broadcast draft 與 tag audience。

### P1：做出接近 ManyChat 的營運手感

- Automation draft / publish validation。
- Segment builder。
- Conversation assignment。
- Broadcast scheduling。
- Message delivery status。
- Channel connection health dashboard。
- AI FAQ reply。

### P2：進階能力

- Visual Flow Builder。
- AI Flow Builder draft generation。
- Rules engine。
- Dynamic response / external request。
- Conversion event / analytics。
- Team roles。
- Import / export contacts。

## 之後登入後的實測清單

有 ManyChat 後台登入權限後，建議依序測：

1. Dashboard：有哪些指標卡、圖表、帳號切換與快捷入口。
2. Inbox：訊息列表、搜尋、tag、指派、關閉對話、人工接手。
3. Contacts：filter、segment、tag、custom field、bulk action。
4. Automations：建立新 automation、trigger、message、condition、action、preview、publish。
5. Instagram trigger：DM keyword、comment keyword、live comment、story mention。
6. Broadcast：從零建立、從 automation 建立、audience filter、schedule、statistics。
7. Settings：channels、fields、API settings、team roles、billing entitlement。
8. Error states：權限失效、token 過期、channel 未連線、超出 messaging window。

## 小結

這份文件目前是「登入頁實測 + 官方文件整理」版本。後台細節還需要登入後補一次真實操作記錄，但已經足夠作為本專案功能參考的第一版。

最重要的產品方向是：不要只做自動回覆，而是把 contact data、conversation、automation、broadcast、policy guard 接成一套。這樣後面接 Instagram / Messenger / WhatsApp 時，功能才不會一邊長一邊歪掉。
