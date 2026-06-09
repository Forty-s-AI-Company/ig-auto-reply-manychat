# ManyChat 化改版規格

建立日期：2026-05-21  
專案：`ig-auto-reply-manychat`  
目標：把目前「ManyChat-like backend MVP」改成「使用者第一眼就覺得像 ManyChat 的 IG 自動回覆軟體」。

## 1. 現況判斷

目前專案已經有不少後端能力與管理模組：

- Workspace / Channel / Contact / Conversation
- Inbox / Contacts / Tags / Segments
- Automations / AutomationStep / AutomationRun
- Broadcasts / Jobs
- Knowledge Base / AI Settings
- Mock / Telegram / Instagram / Messenger / WhatsApp channel adapters
- Meta OAuth / webhook integration points
- Billing / PayUni integration points

但產品體驗不像 ManyChat，主要原因是：

- UI 文案大量亂碼，第一眼就不像正式產品。
- Automations 是表單式設定，不是 ManyChat 核心的視覺化 Flow Builder。
- 缺少 `Instagram Default Reply` 這種「固定用途 automation 編輯頁」。
- 缺少右側 Preview / Test panel。
- 缺少 ManyChat 典型的 automation 狀態：Draft、Saved、Published、Stopped。
- 缺少 template / quick automation 的首頁引導。
- Dashboard 偏工程後台，不像社群自動化 SaaS。

比較準確的現況：

```text
目前是 ManyChat-like automation backend MVP
還不是 ManyChat-like product UI
```

## 2. 改版目標

第一階段不是複製 ManyChat 每個細節，而是先做到「操作心智像 ManyChat」：

- 使用者登入後看到 IG automation 工作台。
- 左側導覽與 ManyChat 類似：Home、Contacts、Automation、Inbox、Settings。
- Automation 頁面有流程清單、狀態、搜尋、資料夾或分類。
- 點進 automation 後看到畫布式 Flow Builder。
- Default Reply 有自己的專用入口與狀態。
- 可以在右側 Preview/Test 面板檢查回覆。
- 現有 automation engine 不重寫，先用 adapter 把節點資料轉回目前 `AutomationStep`。

## 3. 使用者心智模型

使用者不是來管理 JSON，也不是來看資料表。他要做的是：

1. 選一個 IG 帳號。
2. 建立或編輯一個自動化。
3. 設定觸發條件。
4. 設定要回什麼訊息。
5. 預覽。
6. 測試。
7. 發布或停止。
8. 回 Inbox 看實際訊息。

所以產品主線要從「資料 CRUD」改成「自動化流程」。

## 4. 導覽架構

建議第一階段導覽改成：

| ManyChat 對應 | 本專案路徑 | 說明 |
|---|---|---|
| Home | `/dashboard` | IG 帳號總覽、快速任務、狀態提醒 |
| Contacts | `/contacts` | 聯絡人、標籤、欄位、篩選 |
| Automation | `/automations` | 自動化清單與 Flow Builder |
| Inbox | `/inbox` | 對話列表與人工回覆 |
| AI | `/ai-settings`、`/knowledge-base` | AI 模型、FAQ、知識庫 |
| Settings | `/channels`、`/billing` | IG 連線、帳務、權限 |
| Test Tools | `/mock-tester` | 開發測試用，正式 UI 可藏到 Settings |

目前 `Tags`、`Segments`、`Broadcasts` 不一定要在第一層導覽露出，可以收到 Contacts 或 Automation 相關區域，避免資訊架構太工程味。

## 5. 頁面改版規格

### 5.1 Dashboard / Home

目標：像 ManyChat Home 一樣，讓使用者知道 IG 帳號狀態與下一步。

需要顯示：

- 目前 Workspace / IG 帳號切換器
- Plan 狀態與 contacts usage
- Connected channel 狀態
- 最近 7 天統計：新增 contacts、inbound messages、automation runs
- Quick Automation：
  - Set Up Default Reply
  - DM Keyword Reply
  - Comment Auto Reply
  - Story Mention Reply
- Next best moves：
  - 連接 Instagram
  - 設定 Default Reply
  - 建立第一個 keyword automation
  - 測試自動回覆

第一階段可先用現有資料：

- `Channel`
- `Contact`
- `Message`
- `Automation`
- `AutomationRun`

### 5.2 Automation List

目標：從現在的表單 builder 改成 ManyChat 的 automation workspace。

需要顯示：

- 搜尋
- 狀態 filter：All、Published、Draft、Stopped
- 類型 filter：Default Reply、Keyword、Comment、Manual、Webhook
- Automation row/card：
  - 名稱
  - Trigger 類型
  - 狀態
  - 最近修改時間
  - 最近執行結果
  - Preview / Test / Edit

建議新增固定入口：

- `Instagram Default Reply`
- `Keyword Automations`
- `Comment Reply Automations`

### 5.3 Flow Builder

目標：讓 Automations 看起來像 ManyChat，而不是 JSON 設定頁。

版面：

```text
┌─────────────────────────────────────────────────────────────┐
│ Header: automation name / status / Preview / Save / Publish │
├───────────────┬───────────────────────────────┬─────────────┤
│ Left Library  │ Canvas                         │ Right Panel │
│ Trigger       │ [Trigger] -> [Message]         │ Inspector   │
│ Message       │      -> [Condition] -> ...     │ Preview     │
│ Action        │                               │ Test        │
│ Condition     │                               │             │
└───────────────┴───────────────────────────────┴─────────────┘
```

第一階段不要做複雜拖拉，先做「視覺化垂直流程」：

```text
Trigger: Instagram DM contains "price"
  ↓
Send Message
  ↓
Add Tag: lead
  ↓
AI Reply 或 Condition
```

這樣已經會比目前像很多。

節點類型：

| 節點 | 對應現有 step |
|---|---|
| Send Message | `send_message` |
| Add Tag | `add_tag` |
| Remove Tag | `remove_tag` |
| Wait | `wait` |
| Condition | `condition` |
| AI Reply | `ai_reply` |
| Set Field | `set_field` |

Trigger 對應：

| Trigger | 現有 triggerType / config |
|---|---|
| Keyword | `triggerType = keyword` |
| New Contact | `triggerType = new_contact` |
| Webhook | `triggerType = webhook` |
| Manual Test | `triggerType = manual` |
| Instagram Default Reply | 建議新增 template/type 標記 |

### 5.4 Instagram Default Reply 專頁

目標：做出跟 ManyChat `Instagram Default Reply | Edit Content` 類似的頁面。

建議路徑：

```text
/automations/instagram-default-reply
```

頁面需要：

- Header：
  - `Instagram Default Reply`
  - 狀態 badge：Draft / Saved / Published / Stopped
  - Preview
  - Save
  - Publish / Stop
  - More Actions
- Canvas：
  - Default Reply trigger node
  - Message node
  - Add step
- Right panel：
  - Preview
  - Test
  - IG account info
  - Test keyword / test code

狀態對應：

| UI 狀態 | 建議資料欄位 |
|---|---|
| Draft | `publishedAt = null` 或 `draftJson != publishedJson` |
| Saved | draft 已保存 |
| Published | `publishedAt != null` 且 enabled |
| Stopped | `enabled = false` |

目前 `Automation.enabled` 只能表示啟用/停用，不足以完整表達 Draft/Published。第一階段可以先用 `enabled` + `updatedAt` 顯示簡化狀態，第二階段再補 schema。

### 5.5 Preview / Test Panel

Preview 要像 IG chat 模擬器：

- IG 帳號名稱
- Business chat 樣式
- 使用者訊息
- Bot 回覆訊息
- Restart

Test 要提供：

- 測試碼
- Open Instagram / Open on this device
- 測試步驟
- 最近測試結果

第一階段可先做本機 mock preview，不需要真的打 Instagram API。

### 5.6 Inbox

目標：更像 ManyChat Live Chat。

需要調整：

- 左側 conversation list
- 中間 message thread
- 右側 contact profile
- contact tags
- automation paused / active 狀態
- manual reply input

目前已有 `InboxClient`，第一階段先修文案與 layout，第二階段再加 assignment / pause automation。

## 6. 資料模型建議

目前 schema 可以支撐 MVP，但若要更像 ManyChat，建議第二階段新增：

### Automation

建議新增欄位：

```prisma
templateType String? // instagram_default_reply, keyword_reply, comment_reply
status String @default("draft") // draft, published, stopped, archived
draftJson Json?
publishedJson Json?
publishedAt DateTime?
lastTestedAt DateTime?
```

先不急著改 schema，第一階段可以用現有欄位模擬。

### AutomationStep

目前 `order + type + configJson` 可以保留。

若要支援畫布節點，後續可加：

```prisma
nodeId String?
positionJson Json?
```

### Channel

Instagram 健康狀態建議放進 `configJson`：

```json
{
  "instagramAccountId": "...",
  "username": "...",
  "connectionStatus": "connected",
  "permissionStatus": "ok",
  "lastWebhookAt": "...",
  "tokenExpiresAt": "..."
}
```

## 7. 第一階段實作清單

建議先做這 6 件事，最有感。

### P0-1 修中文亂碼

影響檔案：

- `src/components/AdminShell.tsx`
- `src/components/LoginForm.tsx`
- `src/components/AutomationBuilderClient.tsx`
- `src/components/JsonCrudClient.tsx`
- 其他所有 page/component 中的亂碼文案

驗收：

- 所有主要頁面無亂碼
- Button / heading / empty state 都是正常繁中或英文

### P0-2 重做 AdminShell 導覽

影響檔案：

- `src/components/AdminShell.tsx`

調整：

- 導覽改成 Home、Contacts、Automation、Inbox、AI、Settings
- Tags / Segments / Billing / Mock Tester 收進次層或 Settings
- IG 帳號切換器保留

### P0-3 重做 Dashboard 成 ManyChat Home

影響檔案：

- `src/app/dashboard/page.tsx`

調整：

- 加 Quick Automation cards
- 加 IG account health
- 加 contacts usage
- 加 next steps

### P0-4 重做 Automation List

影響檔案：

- `src/app/automations/page.tsx`
- `src/components/AutomationBuilderClient.tsx` 或拆成：
  - `AutomationListClient.tsx`
  - `FlowBuilderClient.tsx`
  - `PreviewPanel.tsx`

調整：

- 清單與 builder 分離
- 新增 `Instagram Default Reply` 固定入口
- 卡片顯示狀態與最近執行

### P0-5 做簡化版 Flow Builder

第一版不用拖拉，做垂直節點即可。

功能：

- Trigger card
- Message card
- Action card
- Condition card
- 右側 inspector
- Preview tab
- Test tab

驗收：

- 使用者可以新增 keyword automation
- 可以新增 message/add tag/wait/condition
- 可以預覽訊息
- 存回現有 `/api/automations`

### P0-6 做 Instagram Default Reply 專用頁

建議新增：

```text
src/app/automations/instagram-default-reply/page.tsx
src/components/InstagramDefaultReplyClient.tsx
```

驗收：

- 進入頁面看到 `Instagram Default Reply`
- 顯示目前狀態：Stopped / Saved
- 可以編輯預設回覆訊息
- Preview 可看到 IG chat mock
- Test 可看到測試步驟
- 不破壞現有 automation engine

## 8. 第二階段實作清單

第二階段再做比較像完整 ManyChat 的部分：

- 真正 canvas pan / zoom
- 節點連線
- Draft / Publish 分離
- Revert to published
- Duplicate / Share / Copy to another workspace
- Instagram comment keyword trigger
- Story mention trigger
- Conversation automation pause
- Channel health dashboard
- Delivery status
- 更完整的 Meta webhook 對接

## 9. 驗收標準

第一階段完成後，使用者應該能做到：

1. 登入後看到像社群自動化產品的 Home。
2. 一眼找到 Automation。
3. 一眼找到 Instagram Default Reply。
4. 進入編輯頁後知道目前是 Stopped / Saved / Published。
5. 不需要看 JSON 就能編輯回覆內容。
6. 可以 Preview。
7. 可以 Test。
8. 可以回 Inbox 查看對話。

如果這 8 件事成立，產品感就會從「工程後台」往「ManyChat 替代品」靠近很多。

## 10. 建議實作順序

我建議照這個順序做：

1. 修亂碼。
2. 改導覽與 Dashboard。
3. 拆 Automations 頁面。
4. 做簡化 Flow Builder。
5. 做 Instagram Default Reply 專頁。
6. 接 Preview/Test。
7. 補狀態與發布模型。

原因很簡單：先讓使用者看得懂、找得到、敢操作，再談更複雜的流程畫布。現在最大的問題不是 API 不夠，而是產品入口和操作感不對。

## 11. 風險

- ManyChat 是成熟產品，不應該第一階段追求 100% 複製。
- 若太早做複雜拖拉畫布，會拖慢進度。
- 現有亂碼若不先處理，任何 UI 改版都會被文字品質拖垮。
- Draft / Publish 若沒有資料模型支撐，後續會變難維護。
- Instagram 真實 API 有 Meta 權限與審核限制，Preview/Test 第一階段應該先用 mock。

## 12. 結論

目前專案不是方向錯，而是停在「系統能力 MVP」階段，還沒進入「ManyChat 產品體驗」階段。

下一步要做的不是推倒重來，而是把現有 backend 包上一層正確的產品 UI：

- Home 像 ManyChat
- Automation 像 ManyChat
- Default Reply 像 ManyChat
- Preview/Test 像 ManyChat

這樣才會符合一開始「做成 ManyChat 的軟體」這個目標。
