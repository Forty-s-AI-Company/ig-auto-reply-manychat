你是資深 full-stack 工程師、產品工程師與 DevOps 工程師。請在目前空白 repo 內，直接建立一套「自用版 Manychat 類訊息自動化工具」MVP。不要只產生計畫；請直接建立專案、安裝依賴、寫程式、建立資料庫 schema、寫 README、跑測試、修 bug，直到本機可以啟動使用。

重要執行原則：
1. 不要反問我問題。遇到不明確處，請自行採用合理假設並寫進 README。
2. 請直接做到可以跑的 MVP。
3. 不要使用 unofficial scraping、browser automation、爬蟲登入 Instagram/Facebook/WhatsApp，也不要繞過平台限制。
4. 所有平台整合都必須使用官方 API / webhook 架構。沒有 token 時，用 mock channel 與 Telegram channel 先讓產品可完整測試。
5. 不要把任何 API key 寫死在程式碼中。使用 .env.example。
6. 自用為主，先求可跑、可維護、可擴充，不追求大型 SaaS 架構。
7. 完成後請輸出：如何啟動、如何登入、如何測試 webhook、目前功能、尚未完成項目。

產品名稱：
Personal Chat Automation Hub

目標：
做一個像 Manychat 的自用訊息自動化工具，第一版支援：
- 聯絡人管理
- 對話收件匣
- 關鍵字自動回覆
- tag 標籤
- automation flow
- AI FAQ 回覆
- Telegram Bot 實際可用整合
- Mock channel 方便本機測試
- Instagram / Messenger / WhatsApp 的 adapter scaffold 與 webhook endpoint，但不偽造或繞過平台權限
- broadcast queue，但必須有合規保護，不做無限制垃圾訊息群發

技術選型：
請使用以下技術，除非有重大理由才改：
- Next.js App Router
- TypeScript
- Tailwind CSS
- Prisma ORM
- SQLite 作為本機預設資料庫
- Zod 做輸入驗證
- Vitest 或 Jest 做基本測試
- ESLint / Prettier
- Node.js worker script 處理 queue / delayed jobs
- OpenAI API optional，用 env 控制；沒有 OPENAI_API_KEY 時要 fallback 到 rule-based 回覆，不可讓系統壞掉

資料庫需求：
建立 Prisma schema，至少包含以下 model：

User:
- id
- email
- passwordHash
- name
- role
- createdAt
- updatedAt

Channel:
- id
- type: mock | telegram | instagram | messenger | whatsapp
- name
- enabled
- configJson
- createdAt
- updatedAt

Contact:
- id
- channelId
- externalId
- displayName
- username
- email
- phone
- locale
- timezone
- lastInboundAt
- lastOutboundAt
- consentStatus
- metadataJson
- createdAt
- updatedAt

Conversation:
- id
- contactId
- channelId
- status: open | pending | closed
- assignedToId optional
- lastMessageAt
- createdAt
- updatedAt

Message:
- id
- conversationId
- contactId
- channelId
- direction: inbound | outbound
- messageType: text | image | button | system
- text
- payloadJson
- providerMessageId
- createdAt

Tag:
- id
- name
- color
- createdAt

ContactTag:
- contactId
- tagId
- createdAt

Automation:
- id
- name
- enabled
- triggerType: keyword | new_contact | manual | webhook
- triggerConfigJson
- createdAt
- updatedAt

AutomationStep:
- id
- automationId
- order
- type: send_message | add_tag | remove_tag | wait | condition | ai_reply | set_field
- configJson
- createdAt
- updatedAt

AutomationRun:
- id
- automationId
- contactId
- conversationId
- status: running | completed | failed
- currentStep
- logsJson
- createdAt
- updatedAt

Broadcast:
- id
- name
- status: draft | queued | sending | sent | failed
- targetConfigJson
- messageJson
- scheduledAt
- sentCount
- failedCount
- createdAt
- updatedAt

Job:
- id
- type
- status: queued | running | completed | failed
- payloadJson
- runAt
- attempts
- lastError
- createdAt
- updatedAt

KnowledgeBaseItem:
- id
- title
- content
- enabled
- createdAt
- updatedAt

功能需求：

A. 後台登入
- 建立簡單 admin login
- 第一次啟動時可以 seed admin user
- 預設帳密寫在 README 與 .env.example
- 密碼必須 hash，不可明文存 DB

B. Dashboard
- 顯示 contacts 數量
- messages 數量
- open conversations 數量
- automations 數量
- 最近訊息列表

C. Inbox
- 左側 conversation list
- 右側 message thread
- 可以手動送出訊息
- 可以將 conversation 設為 open / pending / closed
- 可以替 contact 加 tag / 移除 tag
- mock channel 的 outbound message 直接存進 DB
- Telegram channel 的 outbound message 透過 Telegram Bot API 發送

D. Contacts
- 列表、搜尋、查看 detail
- 顯示 tags、基本資料、最後互動時間、對話紀錄

E. Tags
- 建立、編輯、刪除 tag

F. Automations
- 列表、建立、編輯、啟用/停用
- 第一版不需要拖拉式 flow builder，用表單 / JSON editor 即可
- 支援 keyword trigger
- 支援步驟：
  1. send_message
  2. add_tag
  3. remove_tag
  4. wait
  5. ai_reply
  6. set_field
- 當 inbound message 進來時，自動檢查 keyword automation 並執行
- automation run 要留下 logs

G. AI FAQ
- Knowledge base CRUD
- ai_reply step 使用 knowledge base 做簡單檢索
- 若有 OPENAI_API_KEY，呼叫 OpenAI 產生回覆
- 若沒有 OPENAI_API_KEY，使用 deterministic fallback：回傳最相關 knowledge base item 的摘要
- 不可因為沒有 API key 導致 automation 崩潰

H. Broadcast
- 建立 broadcast draft
- 選擇 tag 作為目標
- 設定訊息內容
- queue 發送
- 必須加入合規保護：
  - 只允許 consentStatus 為 opted_in 的 contact
  - 不允許任意無限制發送
  - WhatsApp / IG / Messenger adapter 預設不實際發送，除非使用者已填官方 API token 且 channel enabled
  - README 說明平台 24 小時窗口與 template 限制由使用者自行設定與遵守
- mock channel 可完整測試 broadcast
- Telegram channel 可實際發送給已互動過的 Telegram contact

I. Channels
- Mock channel：
  - 提供本機測試頁面，可以輸入 externalId、displayName、message text
  - 送出後模擬 inbound webhook
- Telegram channel：
  - /api/webhooks/telegram endpoint
  - 驗證 TELEGRAM_BOT_TOKEN 是否存在
  - 處理 inbound text message
  - 建立或更新 contact / conversation / message
  - 執行 automations
  - outbound 使用 sendMessage
  - 提供 README 教學如何設定 Telegram webhook
- Instagram / Messenger / WhatsApp：
  - 建立 adapter interface
  - 建立 webhook verification endpoint scaffold
  - 建立 sendMessage function scaffold
  - 沒有 env token 時回傳明確錯誤，不可 fake success
  - README 說明需使用官方 Meta / WhatsApp Business API，不提供繞過方案

J. API routes
請建立乾淨的 API route：
- /api/auth/login
- /api/auth/logout
- /api/dashboard
- /api/conversations
- /api/conversations/[id]
- /api/conversations/[id]/messages
- /api/contacts
- /api/contacts/[id]
- /api/tags
- /api/automations
- /api/automations/[id]
- /api/knowledge-base
- /api/broadcasts
- /api/webhooks/mock
- /api/webhooks/telegram
- /api/webhooks/meta
- /api/webhooks/whatsapp

K. Service layer
請避免把所有邏輯塞在 route handler。建立：
- src/lib/db.ts
- src/lib/auth.ts
- src/lib/channels/index.ts
- src/lib/channels/mock.ts
- src/lib/channels/telegram.ts
- src/lib/channels/meta.ts
- src/lib/channels/whatsapp.ts
- src/lib/automation/engine.ts
- src/lib/automation/triggers.ts
- src/lib/ai/faq.ts
- src/lib/jobs.ts
- src/lib/compliance.ts

L. Worker
建立 worker script：
- scripts/worker.ts
- 每隔數秒抓取 due jobs
- 處理 broadcast send
- 處理 wait step continuation
- 有錯誤要記錄 attempts / lastError
- README 說明如何同時跑 web 與 worker

M. Seed data
建立 seed：
- admin user
- mock channel
- telegram channel disabled
- demo tags：lead、customer、needs-followup
- demo knowledge base
- demo automation：
  - keyword: 領取
  - send_message: 你好，這是你要領取的資料連結：{{demo_link}}
  - add_tag: lead
  - ai_reply or send_message fallback

N. UI
請建立簡潔可用的 UI：
- Login page
- Dashboard page
- Inbox page
- Contacts page
- Automations page
- Knowledge Base page
- Broadcasts page
- Channels page
- Mock Tester page
- 使用 Tailwind 做基本 layout
- 不需要追求完美設計，但要能操作

O. 測試
請建立基本測試：
- automation keyword matching
- compliance broadcast filter
- fallback AI FAQ retrieval
- mock inbound webhook flow
- 至少跑一次 test 並修到通過

P. README
README 必須包含：
1. 專案功能
2. 安裝方式
3. .env 設定
4. 如何 migrate / seed
5. 如何啟動 web
6. 如何啟動 worker
7. 預設登入帳密
8. 如何用 Mock Tester 測試
9. 如何設定 Telegram Bot
10. Instagram / Messenger / WhatsApp 的官方 API 注意事項
11. 合規提醒：不要無同意群發、不要繞過平台、遵守 24 小時窗口與 template 規則
12. 如何部署
13. 後續 roadmap

Q. package scripts
請在 package.json 建立：
- dev
- build
- start
- lint
- test
- prisma:migrate
- prisma:generate
- prisma:seed
- worker
- reset-db

R. 完成標準
你必須做到：
1. repo 中有完整可執行程式碼
2. npm install 完成
3. Prisma schema 建好
4. migration / db push 可跑
5. seed 可跑
6. dev server 可啟動
7. test 通過
8. README 完整
9. 最後輸出一份 summary，包含：
   - 已完成項目
   - 如何啟動
   - 測試結果
   - 重要檔案位置
   - 下一步建議

請現在開始直接執行，不要停在規劃階段。