# Staging Environment Runbook

## 2026-06-13 Read-only preflight checklist

Decision:

- Recommended path: use the existing Vercel project `inboxpilot` with a fixed `staging` branch, Preview environment variables scoped to staging, and a fixed staging domain.
- Create a separate `inboxpilot-staging` Vercel project only if you want stronger dashboard-level isolation or separate GitHub deployment permissions.
- Reason: the current project already links to `inboxpilot`; Vercel Preview deployments are enough if staging has its own domain, Supabase project, sandbox PayUNI credentials, and Preview-only env values.

Current read-only findings:

- `.vercel/project.json` points to Vercel project `inboxpilot`.
- `npx vercel env ls` shows configured variables for `Production`; no Preview / staging env was observed.
- Current worktree is detached `HEAD`, so create or switch to a real `staging` branch before relying on branch-scoped preview deployments.
- `vercel.json` has no staging-specific routes or project split; it can support Preview deployments as-is.
- No production env was modified, no deployment was triggered, and no secret values were viewed or recorded.

## Vercel Preview / Staging Env Keys

Add these to Vercel Preview / staging only. Do not reveal or copy production values into staging.

Core app:

- `APP_URL`
- `APP_DOMAIN`
- `NEXT_PUBLIC_APP_URL`
- `AUTH_SECRET`
- `TOKEN_ENCRYPTION_KEY`
- `PRISMA_CONNECTION_LIMIT`
- `CRON_SECRET`

Database / Supabase:

- `DATABASE_URL`
- `DIRECT_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

Admin / seed:

- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`
- `ADMIN_NAME`

Google OAuth:

- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`

Meta / Instagram:

- `META_APP_ID`
- `META_APP_SECRET`
- `META_INSTAGRAM_APP_ID`
- `META_INSTAGRAM_APP_SECRET`
- `META_VERIFY_TOKEN`
- `META_GRAPH_API_VERSION`
- `META_TOKEN_RENEWAL_WINDOW_DAYS`
- `META_FACEBOOK_REDIRECT_URI`
- `META_INSTAGRAM_REDIRECT_URI`

PayUNI sandbox:

- `PAYUNI_MERCHANT_ID`
- `PAYUNI_HASH_KEY`
- `PAYUNI_HASH_IV`
- `PAYUNI_VERSION`
- `PAYUNI_GATEWAY_URL`
- `PAYUNI_RETURN_URL`
- `PAYUNI_NOTIFY_URL`
- `PAYUNI_ALLOW_PRODUCTION`
- `PAYUNI_SMOKE_ALLOW_PRODUCTION`

Optional integrations:

- `OPENAI_API_KEY`
- `AI_PROVIDER`
- `AI_DEFAULT_PROVIDER`
- `AI_DEFAULT_MODEL`
- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_WEBHOOK_SECRET`
- `REDIS_URL`
- `JOB_QUEUE_NAME`
- `WORKER_CONCURRENCY`
- `WORKER_INTERVAL_MS`
- `WORKER_DB_BATCH_SIZE`

## Supabase Staging Project Output

After creating the Supabase staging project, set these Vercel Preview / staging env keys:

- `DATABASE_URL`
- `DIRECT_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

Rules:

- Use a separate Supabase project or separate database, not production.
- Do not use production pooler URL, direct URL, anon key, service role key, or database password.
- Run migrations against staging only after confirming the selected Vercel / local env points to staging.

## Third-party Staging URLs

Replace `https://staging.inboxpilot.example.com` with the final staging domain.

Meta Developer:

```text
https://staging.inboxpilot.example.com/api/oauth/meta-facebook/callback
https://staging.inboxpilot.example.com/api/oauth/meta-instagram/callback
https://staging.inboxpilot.example.com/api/meta/oauth/callback
https://staging.inboxpilot.example.com/api/instagram/oauth/callback
https://staging.inboxpilot.example.com/api/webhooks/meta
https://staging.inboxpilot.example.com/api/meta/deauthorize
https://staging.inboxpilot.example.com/api/meta/data-deletion
```

Google Cloud:

```text
https://staging.inboxpilot.example.com/api/auth/google/callback
```

PayUNI sandbox:

```text
PAYUNI_GATEWAY_URL=https://sandbox-api.payuni.com.tw/api
PAYUNI_RETURN_URL=https://staging.inboxpilot.example.com/api/billing/payuni/return
PAYUNI_NOTIFY_URL=https://staging.inboxpilot.example.com/api/billing/payuni/notify
PAYUNI_ALLOW_PRODUCTION=false
PAYUNI_SMOKE_ALLOW_PRODUCTION=false
```

PayUNI staging must not use:

- production gateway `https://api.payuni.com.tw/api`
- production Merchant ID
- production Hash Key / Hash IV
- production smoke allow flag

## Manual Setup Order

1. Decide staging topology:
   - recommended: existing `inboxpilot` Vercel project + fixed `staging` branch + Preview env + fixed staging domain.
   - stronger isolation: separate `inboxpilot-staging` Vercel project.
2. Create or switch to a real Git branch named `staging`; avoid detached `HEAD` for staging deployment.
3. Create Supabase project `InboxPilot Staging`.
4. In Supabase staging, copy only the staging project connection/key values into a private password manager item.
5. Add Vercel Preview / staging env keys listed above. Keep production env untouched.
6. Add or bind a fixed staging domain in Vercel, for example `staging.inboxpilot.<domain>`.
7. Set `APP_URL`, `APP_DOMAIN`, `NEXT_PUBLIC_APP_URL`, PayUNI return URL, and PayUNI notify URL to the fixed staging domain.
8. Add Meta Developer staging redirect URI, webhook URL, deauthorize URL, and data deletion URL.
9. Add Google Cloud staging redirect URI.
10. Configure PayUNI sandbox merchant settings with staging return / notify URLs.
11. Deploy staging from the `staging` branch or preview deployment flow.
12. Run staging health check:

```bash
curl https://staging.inboxpilot.example.com/api/health
```

13. Apply staging DB migrations only after verifying env points to staging.
14. Seed staging admin / demo data.
15. Run staging smoke / E2E:

```bash
npm run payuni:preflight
npm run payuni:smoke
PLAYWRIGHT_BASE_URL=https://staging.inboxpilot.example.com npm run test:e2e
```

Go condition:

- `/api/health` has `checks.database.ok=true`.
- `/billing` shows PayUNI sandbox.
- OAuth callbacks use staging domain.
- E2E can run with `PLAYWRIGHT_BASE_URL`.

Stop condition:

- Any staging env points to production DB or PayUNI production gateway.
- Any third-party callback still points to production.
- Any secret value appears in docs, chat, logs, screenshots, or audit metadata.

更新日期：2026-06-13

本文件定義 InboxPilot 線上測試站 staging 的建議架構、環境變數、第三方 callback 設定與驗證流程。staging 的目標是測 Meta OAuth、PayUNI return / notify、webhook、Google OAuth、E2E 等 localhost 無法完整覆蓋的流程。

本文件不記錄 `DATABASE_URL`、`DIRECT_URL`、PayUNI Hash Key、Hash IV、Meta App Secret、Google Client Secret、OpenAI key、token、EncryptInfo、HashInfo 或完整 payload。

## 建議架構

| 項目 | 建議 |
| --- | --- |
| Vercel project | 可沿用目前 `inboxpilot` project 的 Preview / branch deployment，或建立獨立 `inboxpilot-staging` project |
| Staging URL | 建議固定 `https://staging.inboxpilot.<domain>`，不要只依賴一次性的 preview URL |
| DB | 建議建立獨立 Supabase staging project，不使用 production DB、不使用 production schema |
| PayUNI | 預設只使用 sandbox gateway，`PAYUNI_ALLOW_PRODUCTION=false` |
| Meta | 建議使用 Meta App 的 development / testing app，或同 App 的 staging redirect URI 與 webhook URL |
| Google OAuth | 同一 OAuth client 可加入 staging redirect URI，或建立獨立 staging OAuth client |
| E2E | 使用 `PLAYWRIGHT_BASE_URL=https://staging... npm run test:e2e` |

## 目前檢查結果

- 本機 `.vercel/project.json` 已 link 到 Vercel project `inboxpilot`。
- `vercel.json` 使用 Next.js，region 為 `sin1`，已設定 cron routes。
- `npx vercel env ls` 顯示目前 env 主要只在 `Production` 環境，尚未看到 Preview / staging 專用 env。
- `.env.example` 目前混有 production-like domain 與 sandbox PayUNI 範例，尚未完整區分 local / staging / production。
- `prisma/seed.ts` 可用 `ADMIN_EMAIL`、`ADMIN_PASSWORD`、`ADMIN_NAME` 建立 admin 與 default workspace，但 seed 內容含 demo 資料，staging 可用，production 不應隨意重跑。
- `scripts/run-tests.mjs` 支援 `TEST_DATABASE_URL`，會建立暫時 test schema 並於結束時 drop schema。
- `playwright.config.ts` 已支援 `PLAYWRIGHT_BASE_URL`；有設定時不會啟動 localhost dev server。

## Vercel Staging Checklist

建議採用「固定 staging branch + Preview env + staging domain」：

1. 在 GitHub 建立固定分支，例如 `staging`。
2. 在 Vercel project `inboxpilot` 加入 Preview 環境變數。
3. 若 Vercel 支援 branch-specific env，將 staging secrets 限定到 Preview + `staging` branch。
4. 綁定固定 staging domain，例如 `staging.inboxpilot.<domain>`。
5. 確認該 domain 指向 staging branch deployment，而不是 production deployment。
6. 不把 production secrets 複製到 Preview / staging。

如果要更乾淨隔離，建議建立獨立 Vercel project：

- project name：`inboxpilot-staging`
- domain：`staging.inboxpilot.<domain>`
- env：全部使用 staging / sandbox / test credentials
- 優點：降低誤用 production env 的風險
- 缺點：部署與 GitHub integration 多一份維護

## Staging Env Example

以下是 key checklist，不是可直接貼上的 secret 檔。

```env
APP_URL="https://staging.inboxpilot.example.com"
APP_DOMAIN="staging.inboxpilot.example.com"
AUTH_SECRET="<new-staging-secret>"
TOKEN_ENCRYPTION_KEY="<new-staging-token-encryption-key>"

DATABASE_URL="<staging-supabase-pooler-url>"
DIRECT_URL="<staging-supabase-direct-url>"
PRISMA_CONNECTION_LIMIT="5"

ADMIN_EMAIL="<staging-admin-email>"
ADMIN_PASSWORD="<staging-admin-password>"
ADMIN_NAME="InboxPilot Staging Admin"

GOOGLE_CLIENT_ID="<staging-or-shared-google-client-id>"
GOOGLE_CLIENT_SECRET="<staging-or-shared-google-client-secret>"

META_APP_ID="<staging-meta-app-id>"
META_APP_SECRET="<staging-meta-app-secret>"
META_INSTAGRAM_APP_ID="<staging-instagram-app-id>"
META_INSTAGRAM_APP_SECRET="<staging-instagram-app-secret>"
META_VERIFY_TOKEN="<staging-webhook-verify-token>"
META_GRAPH_API_VERSION="v25.0"
META_TOKEN_RENEWAL_WINDOW_DAYS="14"

PAYUNI_MERCHANT_ID="<payuni-sandbox-merchant-id>"
PAYUNI_HASH_KEY="<payuni-sandbox-hash-key>"
PAYUNI_HASH_IV="<payuni-sandbox-hash-iv>"
PAYUNI_VERSION="1.0"
PAYUNI_GATEWAY_URL="https://sandbox-api.payuni.com.tw/api"
PAYUNI_RETURN_URL="https://staging.inboxpilot.example.com/api/billing/payuni/return"
PAYUNI_NOTIFY_URL="https://staging.inboxpilot.example.com/api/billing/payuni/notify"
PAYUNI_ALLOW_PRODUCTION="false"
PAYUNI_SMOKE_ALLOW_PRODUCTION="false"

NEXT_PUBLIC_SUPABASE_URL="<staging-supabase-url>"
NEXT_PUBLIC_SUPABASE_ANON_KEY="<staging-supabase-anon-key>"
SUPABASE_SERVICE_ROLE_KEY="<staging-service-role-key>"

REDIS_URL="<staging-redis-url-or-empty>"
JOB_QUEUE_NAME="inboxpilot-staging-jobs"
```

## Supabase Staging Checklist

建議建立獨立 Supabase project，例如 `InboxPilot Staging`。

1. 建立新的 Supabase project。
2. 建立 staging database password，不沿用 production。
3. 複製 staging pooler URL 到 Vercel Preview `DATABASE_URL`。
4. 複製 staging direct URL 到 Vercel Preview `DIRECT_URL`。
5. 設定 `NEXT_PUBLIC_SUPABASE_URL`、`NEXT_PUBLIC_SUPABASE_ANON_KEY`、`SUPABASE_SERVICE_ROLE_KEY` 為 staging project 的值。
6. 套用 migration：

```bash
npx prisma migrate deploy
```

7. 建立 staging admin / demo data：

```bash
npm run prisma:seed
```

8. 檢查：

```bash
curl https://staging.inboxpilot.example.com/api/health
```

成功條件：

- `checks.database.ok=true`
- Redis 若未設定，整體 status 可能為 `degraded`，但 database 必須為 true

## PayUNI Sandbox Checklist

Staging 預設只能使用 sandbox：

- `PAYUNI_GATEWAY_URL=https://sandbox-api.payuni.com.tw/api`
- `PAYUNI_ALLOW_PRODUCTION=false`
- `PAYUNI_SMOKE_ALLOW_PRODUCTION=false`
- `PAYUNI_RETURN_URL=https://staging.../api/billing/payuni/return`
- `PAYUNI_NOTIFY_URL=https://staging.../api/billing/payuni/notify`

驗證：

```bash
npm run payuni:preflight
npm run payuni:smoke
```

注意：

- staging 不應使用 production Merchant ID / Hash Key / Hash IV。
- staging 不應打到 `https://api.payuni.com.tw/api`。

## Meta / Instagram Staging URLs

Meta Developer 後台需要加入：

```text
https://staging.inboxpilot.example.com/api/oauth/meta-facebook/callback
https://staging.inboxpilot.example.com/api/oauth/meta-instagram/callback
https://staging.inboxpilot.example.com/api/meta/oauth/callback
https://staging.inboxpilot.example.com/api/instagram/oauth/callback
https://staging.inboxpilot.example.com/api/webhooks/meta
https://staging.inboxpilot.example.com/api/meta/deauthorize
https://staging.inboxpilot.example.com/api/meta/data-deletion
```

Webhook verify token 必須使用 staging 專用 token，不可沿用 production。

## Google OAuth Staging URLs

Google Cloud OAuth Client 需要加入：

```text
https://staging.inboxpilot.example.com/api/auth/google/callback
```

若建立獨立 staging OAuth client，請將 staging client id / secret 只設定到 Vercel Preview / staging，不放 production。

## Staging Smoke Test

```bash
npm run lint
npm run build
PLAYWRIGHT_BASE_URL=https://staging.inboxpilot.example.com npm run test:e2e
```

Windows PowerShell：

```powershell
$env:PLAYWRIGHT_BASE_URL="https://staging.inboxpilot.example.com"
npm run test:e2e
Remove-Item Env:\PLAYWRIGHT_BASE_URL
```

## Go / No-Go

GO 條件：

- staging URL 是固定 HTTPS。
- staging DB 與 production DB 完全分離。
- Vercel Preview / staging env 已設定必要 key，且不混用 production secret。
- PayUNI 指向 sandbox gateway。
- Meta / Google callback URLs 已加入第三方後台。
- `/api/health` database ok。
- E2E 可用 `PLAYWRIGHT_BASE_URL` 打 staging。

NO-GO 條件：

- staging 使用 production DB。
- staging 使用 PayUNI production gateway 或 production Hash Key / IV。
- staging callback URL 尚未加入 Meta / Google 後台。
- Vercel env 只有 Production，沒有 Preview / staging env。
- 沒有固定 staging URL，只能靠臨時 preview URL 測第三方 callback。
