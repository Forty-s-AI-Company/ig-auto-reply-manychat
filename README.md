# InboxPilot

InboxPilot 是 Instagram 多帳號訊息管理與自動回覆平台。專案目前以官方 API、Webhook 與可測試的 Mock channel 為主，不使用 unofficial scraping、cookie 抓取或瀏覽器自動登入去繞過平台限制。

## 目前功能

| 狀態 | 功能 | 說明 |
| --- | --- | --- |
| ✅ | 登入與工作區 | Admin login、Workspace scope、帳號切換基礎結構。 |
| ✅ | Dashboard | 顯示 contacts、messages、open conversations、automations 與最近訊息。 |
| ✅ | Inbox | 對話列表、訊息串、手動回覆、標記已讀、內部備註、聯絡人標籤與自訂欄位。 |
| ✅ | Contacts / Tags | 聯絡人與標籤 CRUD。 |
| ✅ | Segments | 可建立受眾分群，供廣播使用。 |
| ✅ | Automations | keyword、new_contact、manual、webhook triggers；支援 send_message、add_tag、remove_tag、wait、ai_reply、set_field。 |
| ✅ | Automation Webhooks | 支援外部 webhook 觸發 automation，可用 HMAC 簽名保護。 |
| ✅ | Sequences | 可建立、編輯、刪除序列，並將聯絡人加入延遲訊息流程。 |
| ✅ | Broadcasts | 可用 tag 或 segment 指定受眾；預覽候選人、收件人與略過人數後加入佇列。 |
| ✅ | Worker | 處理 broadcast send、wait continuation、sequence send。 |
| ✅ | AI FAQ | 支援 OpenAI-compatible、Gemini API、Codex CLI、Antigravity CLI；沒有可用模型時使用 deterministic fallback。 |
| ❗ | Channels | Mock 可完整本機測試；Telegram 走官方 Bot API；Email 支援 SMTP outbound；Meta / WhatsApp / TikTok / SMS 仍是 adapter scaffold 或待正式串接。 |
| ❗ | Billing | PayUNI scaffold 與 smoke test 已有，正式商用流程仍需完整驗證。 |

## 安裝

```bash
npm install
copy .env.example .env
npm run prisma:migrate
npm run prisma:seed
```

Windows PowerShell 可使用：

```powershell
Copy-Item .env.example .env
```

## 環境變數

必要：

```env
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."
AUTH_SECRET="change-me-in-local-dev"
APP_URL="http://localhost:3041"
ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="admin123456"
ADMIN_NAME="Admin"
```

常用選填：

```env
OPENAI_API_KEY=""
GEMINI_API_KEY=""
XAI_API_KEY=""
DEEPSEEK_API_KEY=""
AI_DEFAULT_PROVIDER=""
AI_DEFAULT_MODEL=""

TELEGRAM_BOT_TOKEN=""
TELEGRAM_WEBHOOK_SECRET=""
EMAIL_SMTP_HOST=""
EMAIL_SMTP_PORT="587"
EMAIL_SMTP_SECURE="false"
EMAIL_SMTP_USER=""
EMAIL_SMTP_PASSWORD=""
EMAIL_FROM=""
EMAIL_FROM_NAME="InboxPilot"
EMAIL_DEFAULT_SUBJECT="InboxPilot message"
MOCK_WEBHOOK_SECRET=""
AUTOMATION_WEBHOOK_SECRET=""

META_VERIFY_TOKEN=""
META_APP_ID=""
META_APP_SECRET=""
META_PAGE_ACCESS_TOKEN=""
WHATSAPP_VERIFY_TOKEN=""
WHATSAPP_ACCESS_TOKEN=""
WHATSAPP_PHONE_NUMBER_ID=""
```

完整範例請看 [.env.example](./.env.example)。

## 開發

Web：

```bash
npm run dev
```

預設網址：

```text
http://localhost:3041/login
```

登入：

```text
Email: admin@example.com
Password: admin123456
```

若本機 admin 密碼不一致，可重建預設管理員：

```bash
npm run admin:ensure
```

Worker 請另開一個 terminal：

```bash
npm run worker
```

## Mock Webhook 測試

Mock channel 是目前最完整的本機測試通道。

```bash
curl -X POST http://localhost:3041/api/webhooks/mock ^
  -H "content-type: application/json" ^
  -d "{\"externalId\":\"mock-user-1\",\"displayName\":\"測試使用者\",\"text\":\"我要領取資料\",\"consentStatus\":\"opted_in\"}"
```

送出後可到 Inbox 查看 inbound message、自動回覆、標籤與 AI FAQ fallback。

## Automation Webhook

外部系統可呼叫：

```text
POST /api/automation-webhooks/[key]
```

若有設定 `AUTOMATION_WEBHOOK_SECRET`，請帶：

```http
x-inboxpilot-signature: sha256=<hex hmac>
```

詳細簽名範例請看 [docs/automation-webhooks.md](./docs/automation-webhooks.md)。

## Broadcast 合規提醒

- 只會 queue 給符合 tag 或 segment 條件，且 `consentStatus=opted_in` 的 contact。
- 廣播頁可先按「預覽」，確認候選聯絡人、實際收件人與略過人數。
- 不做無限制群發。
- 正式商用前建議補齊 rate limit、退訂流程、審核紀錄與發送紀錄留存。

## Telegram

1. 到 Telegram 找 BotFather 建立 bot，取得 token。
2. 在 `.env` 設定 `TELEGRAM_BOT_TOKEN`。
3. 將 Telegram channel 設為 enabled。
4. 將 webhook 指到公開 HTTPS URL：

```bash
curl "https://api.telegram.org/bot<TELEGRAM_BOT_TOKEN>/setWebhook?url=https://your-domain.com/api/webhooks/telegram"
```

本機測試 Telegram webhook 需要 ngrok、Cloudflare Tunnel 或部署到公開 HTTPS 網址。

## Email SMTP

Email channel 目前支援 outbound SMTP。建立 `type=email` 的 channel 後，contact 的 `externalId` 需是收件 email。

可用 `.env` 設定預設 SMTP：

```env
EMAIL_SMTP_HOST="smtp.example.com"
EMAIL_SMTP_PORT="587"
EMAIL_SMTP_SECURE="false"
EMAIL_SMTP_USER="smtp-user"
EMAIL_SMTP_PASSWORD="smtp-password"
EMAIL_FROM="noreply@example.com"
EMAIL_FROM_NAME="InboxPilot"
EMAIL_DEFAULT_SUBJECT="InboxPilot message"
```

也可以在 channel `configJson` 覆蓋：

```json
{
  "smtpHost": "smtp.example.com",
  "smtpPort": 587,
  "smtpSecure": false,
  "smtpUser": "smtp-user",
  "smtpPassword": "smtp-password",
  "fromEmail": "noreply@example.com",
  "fromName": "InboxPilot",
  "subject": "InboxPilot message"
}
```

## Meta / WhatsApp

- `/api/webhooks/meta` 提供 Meta webhook verification scaffold。
- `/api/webhooks/whatsapp` 提供 WhatsApp webhook verification scaffold。
- `src/lib/channels/meta.ts` 與相關 channel adapter 保留官方 API 串接位置。
- 專案不提供繞過登入、cookie scraping、browser automation 或 unofficial API。

## 測試

```bash
npm run lint
npm test
npm run build
```

目前測試包含：

- automation trigger 與條件判斷
- broadcast compliance 與 preview
- contact fields
- sequence jobs
- inbox notes / read state
- AI provider fallback
- Meta OAuth / webhook scaffold
- PayUNI billing scaffold

## 部署

自用 MVP 可部署到 Vercel 或其他 Node.js host。

1. 設定正式環境變數。
2. 使用 Postgres，不建議正式環境使用 SQLite。
3. Web process 跑 `npm run start`。
4. Worker 需要獨立 process 跑 `npm run worker`，或改接正式 queue / cron。
5. Telegram、Meta、WhatsApp webhook URL 必須是公開 HTTPS。

## Roadmap

- Meta / WhatsApp 官方 endpoint mapping 完整化。
- TikTok / SMS adapter 串接正式服務商。
- Broadcast rate limit、退訂流程與審核流程。
- Conversation assignment、搜尋、分頁與客服協作權限。
- 測試速度優化與正式 queue provider。
