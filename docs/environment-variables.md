# 環境變數文件

完整範例請看專案根目錄 [.env.example](../.env.example)。本文件依用途整理每個環境變數。

## 必填

| 變數             | 說明                                                       | 範例                      |
| ---------------- | ---------------------------------------------------------- | ------------------------- |
| `DATABASE_URL`   | Prisma runtime DB 連線。正式環境建議使用 Supabase pooler。 | `postgresql://...`        |
| `DIRECT_URL`     | Prisma migration/direct DB 連線。                          | `postgresql://...`        |
| `AUTH_SECRET`    | session JWT 簽章 secret。production 至少 32 字元。         | `openssl rand -base64 32` |
| `APP_URL`        | 正式 app URL，用於 OAuth、PayUNI、Email 連結。             | `https://example.com`     |
| `ADMIN_EMAIL`    | seed/admin helper 的管理員 email。                         | `admin@example.com`       |
| `ADMIN_PASSWORD` | seed/admin helper 的管理員密碼。                           | `change-me`               |
| `ADMIN_NAME`     | seed/admin helper 的管理員名稱。                           | `Admin`                   |

## App URL

| 變數         | 說明                                 |
| ------------ | ------------------------------------ |
| `APP_DOMAIN` | 部署 domain，主要作為文件/設定輔助。 |
| `APP_URL`    | 伺服器產生 callback URL 時使用。     |
| `DEMO_LINK`  | 行銷或 demo 下載連結。               |

## Google Login

| 變數                   | 說明                         |
| ---------------------- | ---------------------------- |
| `GOOGLE_CLIENT_ID`     | Google OAuth client id。     |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret。 |

Redirect URI：

```text
https://your-domain.com/api/auth/google/callback
```

## AI Providers

| 變數                   | 說明                                                  |
| ---------------------- | ----------------------------------------------------- |
| `AI_PROVIDER`          | 預設 AI provider。空值時使用 deterministic fallback。 |
| `AI_DEFAULT_PROVIDER`  | 工作區尚未設定時的預設 provider。                     |
| `AI_DEFAULT_MODEL`     | 工作區尚未設定時的預設 model。                        |
| `OPENAI_API_KEY`       | OpenAI-compatible provider key。                      |
| `GEMINI_API_KEY`       | Gemini API key。                                      |
| `XAI_API_KEY`          | xAI API key。                                         |
| `DEEPSEEK_API_KEY`     | DeepSeek API key。                                    |
| `CODEX_CLI_COMMAND`    | 本機 Codex CLI command。                              |
| `CODEX_CLI_TIMEOUT_MS` | Codex CLI timeout。                                   |

## Channels

### Mock / Automation Webhook

| 變數                        | 說明                                                      |
| --------------------------- | --------------------------------------------------------- |
| `MOCK_WEBHOOK_SECRET`       | 若設定，`/api/webhooks/mock` 需帶 shared secret。         |
| `AUTOMATION_WEBHOOK_SECRET` | 若設定，`/api/automation-webhooks/[key]` 需帶 HMAC 簽名。 |

### Telegram

| 變數                      | 說明                       |
| ------------------------- | -------------------------- |
| `TELEGRAM_BOT_TOKEN`      | Telegram BotFather token。 |
| `TELEGRAM_WEBHOOK_SECRET` | Telegram webhook secret。  |

### Email SMTP

| 變數                    | 說明                                        |
| ----------------------- | ------------------------------------------- |
| `EMAIL_SMTP_HOST`       | SMTP host。                                 |
| `EMAIL_SMTP_PORT`       | SMTP port，預設常用 `587`。                 |
| `EMAIL_SMTP_SECURE`     | `true` 通常代表 465；`false` 通常代表 587。 |
| `EMAIL_SMTP_USER`       | SMTP username。                             |
| `EMAIL_SMTP_PASSWORD`   | SMTP password。                             |
| `EMAIL_FROM`            | 寄件 email。                                |
| `EMAIL_FROM_NAME`       | 寄件名稱。                                  |
| `EMAIL_DEFAULT_SUBJECT` | 預設信件主旨。                              |

## Meta / Instagram / WhatsApp

| 變數                                 | 說明                                  |
| ------------------------------------ | ------------------------------------- |
| `META_VERIFY_TOKEN`                  | Meta webhook verification token。     |
| `META_GRAPH_API_VERSION`             | Graph API version，預設 `v25.0`。     |
| `META_APP_ID`                        | Meta App ID。                         |
| `META_APP_SECRET`                    | Meta App Secret。                     |
| `META_FACEBOOK_REDIRECT_URI`         | Facebook Login redirect URI。         |
| `META_INSTAGRAM_REDIRECT_URI`        | Instagram Login redirect URI。        |
| `META_USER_ACCESS_TOKEN`             | User token fallback。                 |
| `META_USER_ACCESS_TOKEN_EXPIRES_AT`  | User token 到期時間。                 |
| `META_PAGE_ID`                       | Facebook Page ID fallback。           |
| `META_INSTAGRAM_BUSINESS_ACCOUNT_ID` | IG business account fallback。        |
| `META_TOKEN_RENEWAL_WINDOW_DAYS`     | token 到期前幾天刷新。                |
| `META_PAGE_ACCESS_TOKEN`             | Page token fallback。                 |
| `WHATSAPP_VERIFY_TOKEN`              | WhatsApp webhook verification token。 |
| `WHATSAPP_ACCESS_TOKEN`              | WhatsApp Cloud API access token。     |
| `WHATSAPP_PHONE_NUMBER_ID`           | WhatsApp phone number id。            |

## PayUNI

目前 PayUNI 必須使用測試站；正式站仍在審核中，不得把 production env 切到正式金流 gateway。

| 變數                 | 說明                 |
| -------------------- | -------------------- |
| `PAYUNI_MERCHANT_ID` | PayUNI 商店代號。    |
| `PAYUNI_HASH_KEY`    | PayUNI Hash Key。    |
| `PAYUNI_HASH_IV`     | PayUNI Hash IV。     |
| `PAYUNI_VERSION`     | PayUNI API version。 |
| `PAYUNI_GATEWAY_URL` | PayUNI gateway。     |
| `PAYUNI_RETURN_URL`  | 前景付款回傳 URL。   |
| `PAYUNI_NOTIFY_URL`  | 背景付款通知 URL。   |

## Supabase

Supabase 專案名必須是 `IG Auto Reply ManyChat`。

| 變數                            | 說明                                                      |
| ------------------------------- | --------------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | Supabase public URL。前端可見。                           |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key。前端可見。                             |
| `SUPABASE_SERVICE_ROLE_KEY`     | Service role key。只能 server-side 使用，不可放前端。     |
| `TEST_DATABASE_URL`             | 測試 DB 連線。`scripts/run-tests.mjs` 會建立獨立 schema。 |

## Secret handling

- 不要 commit `.env` 或 `.env.local`。
- 可 commit `.env.example`，但只能放 placeholder。
- `NEXT_PUBLIC_*` 會進前端 bundle，不要放 service role、API key、token、secret。
- `SUPABASE_SERVICE_ROLE_KEY`、PayUNI key、Meta token、OpenAI key 都必須只存在 server env。
