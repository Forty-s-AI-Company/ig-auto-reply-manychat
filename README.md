# Personal Chat Automation Hub

自用版 Manychat 類訊息自動化工具 MVP。這個版本刻意不使用 unofficial scraping、瀏覽器自動化登入或繞過 Instagram/Facebook/WhatsApp 限制；可完整測試的通道是 Mock channel，Telegram 走官方 Bot API，Meta/WhatsApp 先保留官方 webhook/adapter scaffold。

## 功能

- Admin login，密碼以 bcrypt hash 存進 SQLite。
- Dashboard：contacts、messages、open conversations、automations 統計與最近訊息。
- Inbox：conversation list、message thread、手動回覆、狀態切換、contact tag 加/移除。
- Contacts / Tags CRUD。
- Automations：keyword trigger，支援 `send_message`、`add_tag`、`remove_tag`、`wait`、`ai_reply`、`set_field`。
- AI FAQ：Knowledge Base CRUD；有 `OPENAI_API_KEY` 時呼叫 OpenAI，沒有時使用 deterministic fallback。
- Broadcast queue：只對指定 tag 且 `consentStatus=opted_in` 的 contact 建 job。
- Worker：處理 broadcast send 與 wait step continuation。
- Channels：Mock 可本機完整測試；Telegram 可用官方 Bot API；Instagram / Messenger / WhatsApp 僅 scaffold。

## 安裝

```bash
npm install
copy .env.example .env
npm run prisma:migrate
npm run prisma:seed
```

Windows PowerShell 若沒有 `copy` alias，也可用：

```powershell
Copy-Item .env.example .env
```

## .env

必要：

```env
DATABASE_URL="file:./dev.db"
AUTH_SECRET="change-me-in-local-dev"
ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="admin123456"
ADMIN_NAME="Admin"
DEMO_LINK="https://example.com/demo-download"
```

選用：

```env
OPENAI_API_KEY=""
OPENAI_MODEL="gpt-4o-mini"
TELEGRAM_BOT_TOKEN=""
TELEGRAM_WEBHOOK_SECRET=""
META_VERIFY_TOKEN=""
META_PAGE_ACCESS_TOKEN=""
WHATSAPP_VERIFY_TOKEN=""
WHATSAPP_ACCESS_TOKEN=""
WHATSAPP_PHONE_NUMBER_ID=""
```

## 啟動

Web：

```bash
npm run dev
```

Worker 另開一個 terminal：

```bash
npm run worker
```

登入：

- URL: `http://localhost:3000/login`
- Email: `admin@example.com`
- Password: `admin123456`

## Mock Tester

1. 啟動 web。
2. 登入後開 `http://localhost:3000/mock-tester`。
3. 使用預設訊息「我要領取資料」送出。
4. 到 Inbox 應可看到 inbound message、自動回覆、`lead` tag 與 AI FAQ fallback。

也可直接打 webhook：

```bash
curl -X POST http://localhost:3000/api/webhooks/mock ^
  -H "content-type: application/json" ^
  -d "{\"externalId\":\"mock-user-1\",\"displayName\":\"測試使用者\",\"text\":\"我要領取資料\",\"consentStatus\":\"opted_in\"}"
```

## Telegram Bot

1. 到 Telegram 找 BotFather 建立 bot，取得 token。
2. 在 `.env` 設定 `TELEGRAM_BOT_TOKEN`。
3. 將 DB 內 Telegram channel 設為 enabled。可先登入後用 API：

```bash
curl http://localhost:3000/api/channels
```

找到 Telegram channel id 後：

```bash
curl -X PATCH http://localhost:3000/api/channels/<channel-id> ^
  -H "content-type: application/json" ^
  -d "{\"enabled\":true}"
```

4. 將 webhook 指到你的公開 URL：

```bash
curl "https://api.telegram.org/bot<TELEGRAM_BOT_TOKEN>/setWebhook?url=https://your-domain.com/api/webhooks/telegram"
```

本機測試 webhook 需要 ngrok、Cloudflare Tunnel 或部署到公開 HTTPS 網址。Telegram outbound 使用官方 `sendMessage`，只能發給已與 bot 互動過的 chat。

## Instagram / Messenger / WhatsApp

- `/api/webhooks/meta` 提供 Meta webhook verification scaffold。
- `/api/webhooks/whatsapp` 提供 WhatsApp webhook verification scaffold。
- `src/lib/channels/meta.ts` 與 `src/lib/channels/whatsapp.ts` 已放 adapter interface，但沒有 token 或未完成官方 endpoint mapping 時會回明確錯誤，不會 fake success。
- 請使用官方 Meta Graph API / WhatsApp Business Cloud API。此專案不提供繞過登入、cookie scraping、browser automation 或 unofficial API。

## Broadcast 合規提醒

- 只會 queue 給指定 tag 且 `consentStatus=opted_in` 的 contact。
- 不做無限制群發。
- IG / Messenger / WhatsApp 預設不實際發送，必須完成官方 API token、channel enabled 與平台規則設定。
- 24 小時客服窗口、template message、使用者同意與退訂規則，需要你依平台政策自行設定與遵守。

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
npm test
npm run prisma:migrate
npm run prisma:generate
npm run prisma:seed
npm run worker
npm run reset-db
```

## 測試

```bash
npm run lint
npm test
npm run build
```

目前測試涵蓋：

- automation keyword matching
- broadcast compliance filter
- AI FAQ fallback retrieval
- mock inbound webhook flow

## 部署

自用 MVP 可部署到 Vercel 或其他 Node.js host。

1. 設定環境變數。
2. 換成正式 DB 前，建議把 SQLite 換成 Postgres。
3. Web process 跑 `npm run start`。
4. Worker 需要獨立 process 跑 `npm run worker`，或改接平台 queue/cron。
5. Telegram webhook URL 必須是公開 HTTPS。

## Roadmap

- Channel 設定 UI 編輯 token 狀態與 enabled。
- Automation form builder，取代 JSON editor。
- Broadcast preview、節流、退訂欄位與審核流程。
- Meta / WhatsApp 官方 API endpoint mapping。
- Conversation assignment、internal notes、搜尋與分頁。
- Postgres migration 與正式 queue provider。
