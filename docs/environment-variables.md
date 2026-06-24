# Environment Variables


## 2026-06-13 Update - Staging environment guidance

InboxPilot now requires a separated staging environment for Meta OAuth, PayUNI return / notify, webhooks, Google OAuth, and E2E flows that cannot be validated reliably on localhost.

Staging rules:

- Staging must use a dedicated HTTPS `APP_URL`, for example `https://staging.inboxpilot.example.com`.
- Staging must use a separate Supabase project or database from production.
- Staging must not reuse production `DATABASE_URL`, `DIRECT_URL`, PayUNI Hash Key / IV, Meta App Secret, Google Client Secret, OpenAI key, or token values.
- Staging PayUNI must default to sandbox:
  - `PAYUNI_GATEWAY_URL=https://sandbox-api.payuni.com.tw/api`
  - `PAYUNI_ALLOW_PRODUCTION=false`
  - `PAYUNI_SMOKE_ALLOW_PRODUCTION=false`
- Staging E2E can run against the remote URL with:

```bash
PLAYWRIGHT_BASE_URL=https://staging.inboxpilot.example.com npm run test:e2e
```

See [Staging Environment Runbook](./staging-environment-runbook.md) for the full checklist.

更新日期：2026-06-10

這份文件說明 InboxPilot 常用環境變數。請以 [.env.example](../.env.example) 作為範本，再依照 local、staging、production 分別設定。

## 基礎設定

| 變數 | 說明 | 範例 |
| --- | --- | --- |
| `APP_URL` | 正式 App URL。OAuth、Webhook、PayUNI、Email link 都會用到。 | `https://app.example.com` |
| `APP_DOMAIN` | 正式網域，通常用於文件與部署檢查。 | `app.example.com` |
| `AUTH_SECRET` | Session / JWT secret。production 至少 32 bytes。 | `openssl rand -base64 32` |
| `TOKEN_ENCRYPTION_KEY` | 加密 access token / refresh token 的獨立 key。production 必填。 | `openssl rand -base64 32` |
| `DATABASE_URL` | Prisma runtime database URL。 | `postgresql://...` |
| `DIRECT_URL` | Prisma migration / direct connection URL。 | `postgresql://...` |
| `ADMIN_EMAIL` | seed / admin helper 建立管理員帳號使用。 | `admin@example.com` |
| `ADMIN_PASSWORD` | seed / admin helper 建立管理員密碼使用。 | `change-me` |
| `ADMIN_NAME` | 預設管理員名稱。 | `Admin` |

## Release Channel

| 變數                         | 說明                                                                 |
| ---------------------------- | -------------------------------------------------------------------- |
| `INBOXPILOT_RELEASE_CHANNEL` | `simple` 顯示正式站簡易版；`full` 顯示完整規劃版。此變數不是 secret。 |

目前 Vercel 建議設定：

```text
Production: INBOXPILOT_RELEASE_CHANNEL=simple
Preview:    INBOXPILOT_RELEASE_CHANNEL=full
```

若未設定，程式會依 host fallback：

- `inboxpilot.carry-digital-nomad.in.net` 預設為 `simple`
- 其他 host，例如 localhost / Vercel Preview，預設為 `full`

## Deployment / DB Guard

| 變數                           | 說明                                                                 |
| ------------------------------ | -------------------------------------------------------------------- |
| `INBOXPILOT_DEPLOYMENT_ENV`    | 部署環境標記：`production`、`staging`、`development` 或 `test`。       |
| `INBOXPILOT_DB_ENV`            | DB 環境標記。Production 用 `production`，staging Preview 用 `staging`。 |
| `STAGING_SUPABASE_PROJECT_REF` | staging Supabase project ref，用於 `/api/health/staging` 比對 DB URL。 |

建議 Vercel 設定：

```text
Production:
INBOXPILOT_DEPLOYMENT_ENV=production
INBOXPILOT_DB_ENV=production

Preview / staging branch:
INBOXPILOT_DEPLOYMENT_ENV=staging
INBOXPILOT_DB_ENV=staging
STAGING_SUPABASE_PROJECT_REF=<staging-project-ref>
```

`/api/health/staging` 會使用這些值確認 staging 沒有誤接 production DB。此 endpoint 不會輸出 DB URL 或密碼。

## Google Login

| 變數 | 說明 |
| --- | --- |
| `GOOGLE_CLIENT_ID` | Google OAuth client id |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |

Redirect URI：

```text
https://your-domain.com/api/auth/google/callback
```

## AI Providers

| 變數 | 說明 |
| --- | --- |
| `AI_PROVIDER` | 預設 AI provider。未設定時使用 deterministic fallback。 |
| `AI_DEFAULT_PROVIDER` | 後台尚未設定時使用的 provider。 |
| `AI_DEFAULT_MODEL` | 後台尚未設定時使用的 model。 |
| `OPENAI_API_KEY` | OpenAI-compatible provider key。 |
| `GEMINI_API_KEY` | Gemini API key。 |
| `XAI_API_KEY` | xAI API key。 |
| `DEEPSEEK_API_KEY` | DeepSeek API key。 |
| `CODEX_CLI_COMMAND` | Codex CLI command。 |
| `CODEX_CLI_TIMEOUT_MS` | Codex CLI timeout。 |

## AI Local CLI Opt-in

- `AI_ENABLE_LOCAL_CLI` 是 local CLI provider 的顯式開關。
- `codex_cli` 與 `antigravity_cli` 預設不納入 production / shared cron refresh。
- 每日 `/api/cron/refresh-ai-models` 與 `npm run ai-models:refresh` 只有在 `AI_ENABLE_LOCAL_CLI=true` 時才會納入這兩個 provider。
- 若 automation 環境沒有安裝或登入對應 CLI，建議維持關閉，避免 daily refresh 依賴機器狀態。

## OAuth / Meta / Instagram

| 變數 | 說明 |
| --- | --- |
| `META_APP_ID` | Facebook / Meta App ID。 |
| `META_APP_SECRET` | Facebook / Meta App Secret。 |
| `META_INSTAGRAM_APP_ID` | Instagram Login App ID。若與 `META_APP_ID` 不同，必須搭配專用 secret。 |
| `META_INSTAGRAM_APP_SECRET` | Instagram Login App Secret。 |
| `META_VERIFY_TOKEN` | Meta webhook verify token。 |
| `META_GRAPH_API_VERSION` | Graph API version，預設 `v25.0`。 |
| `META_TOKEN_RENEWAL_WINDOW_DAYS` | token 到期前幾天提醒或刷新。 |

目前新的主流程使用 generic callback：

```text
https://your-domain.com/api/oauth/meta-facebook/callback
https://your-domain.com/api/oauth/meta-instagram/callback
```

legacy callback 仍保留作 fallback：

```text
https://your-domain.com/api/meta/oauth/callback
https://your-domain.com/api/instagram/oauth/callback
```

Production 注意：

- production 不可依賴 `META_PAGE_ACCESS_TOKEN`、`META_PAGE_ID`、`META_INSTAGRAM_BUSINESS_ACCOUNT_ID` 作為 runtime fallback。
- 正式發送與 webhook matching 必須使用 channel 自己保存的 token / id。

## Webhook / Channel

| 變數 | 說明 |
| --- | --- |
| `MOCK_WEBHOOK_SECRET` | `/api/webhooks/mock` shared secret。 |
| `AUTOMATION_WEBHOOK_SECRET` | `/api/automation-webhooks/[key]` HMAC secret。 |
| `TELEGRAM_BOT_TOKEN` | Telegram BotFather token。 |
| `TELEGRAM_WEBHOOK_SECRET` | Telegram webhook secret。 |
| `WHATSAPP_VERIFY_TOKEN` | WhatsApp webhook verification token。 |
| `WHATSAPP_ACCESS_TOKEN` | WhatsApp Cloud API access token。 |
| `WHATSAPP_PHONE_NUMBER_ID` | WhatsApp phone number id。 |

## Email SMTP

| 變數 | 說明 |
| --- | --- |
| `EMAIL_SMTP_HOST` | SMTP host。 |
| `EMAIL_SMTP_PORT` | SMTP port，常見為 `587` 或 `465`。 |
| `EMAIL_SMTP_SECURE` | `true` 通常搭配 465，`false` 通常搭配 587。 |
| `EMAIL_SMTP_USER` | SMTP username。 |
| `EMAIL_SMTP_PASSWORD` | SMTP password。 |
| `EMAIL_FROM` | 寄件 email。 |
| `EMAIL_FROM_NAME` | 寄件名稱。 |
| `EMAIL_DEFAULT_SUBJECT` | 預設 email subject。 |

## Queue / Worker

正式環境建議一定要設定 Redis，並以獨立 worker 消費 job。

| 變數 | 說明 |
| --- | --- |
| `REDIS_URL` | Redis connection URL。設定後使用 BullMQ。 |
| `JOB_QUEUE_NAME` | BullMQ queue 名稱，預設 `inboxpilot-jobs`。 |
| `WORKER_CONCURRENCY` | BullMQ worker concurrency，預設 `5`。 |
| `WORKER_INTERVAL_MS` | DB polling fallback interval，預設 `5000` ms。 |
| `WORKER_DB_BATCH_SIZE` | DB polling fallback 每批處理數量，預設 `10`。 |

## PayUNI

| 變數 | 說明 |
| --- | --- |
| `PAYUNI_MERCHANT_ID` | PayUNI Merchant ID。 |
| `PAYUNI_HASH_KEY` | PayUNI Hash Key。server-only。 |
| `PAYUNI_HASH_IV` | PayUNI Hash IV。server-only。 |
| `PAYUNI_VERSION` | PayUNI API version。 |
| `PAYUNI_GATEWAY_URL` | PayUNI gateway URL。sandbox / production 需分清楚。 |
| `PAYUNI_RETURN_URL` | 使用者付款後導回 URL。 |
| `PAYUNI_NOTIFY_URL` | PayUNI server notify URL。 |
| `PAYUNI_ALLOW_PRODUCTION` | 只有明確設為 `true` 時才允許非 sandbox gateway。 |

## Supabase

Production Supabase 專案名必須是 `IG Auto Reply ManyChat`。Staging 必須使用獨立 Supabase project，不可共用 production DB。

| 變數 | 說明 |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase public URL。可以進前端。 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key。可以進前端，但仍需搭配權限規則。 |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key。只能放 server env。 |
| `TEST_DATABASE_URL` | 測試資料庫 URL，`scripts/run-tests.mjs` 會建立獨立 test schema。 |

Staging DB 拆分流程請看 [staging-db-runbook.md](./staging-db-runbook.md)。

## Secret Handling

- 不要 commit `.env` 或 `.env.local`。
- 可 commit `.env.example`，但只能放 placeholder。
- `NEXT_PUBLIC_*` 會進前端 bundle，不要放 service role、API key、token、secret。
- `SUPABASE_SERVICE_ROLE_KEY`、PayUNI key、Meta token、OpenAI key 都必須只存在 server env。
- audit、console、文件、URL 不可記錄完整 token、secret、authorization code 或付款敏感 payload。
