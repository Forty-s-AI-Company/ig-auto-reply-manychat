# 部署文件

InboxPilot 可部署到 Vercel 或任何支援 Node.js 的平台。正式環境需搭配 PostgreSQL 與背景 worker。

## 架構

```text
Browser
  |
  v
Next.js Web App
  |
  +-- PostgreSQL / Supabase Postgres
  +-- Redis / BullMQ queue
  +-- External APIs: Meta, Telegram, PayUNI, AI providers
  |
  v
Worker process
  |
  +-- BullMQ job dispatch
  +-- Job table: broadcast_send, automation_continue, inbound_automation, sequence_send
```

## Vercel 部署

1. 在 Vercel 建立專案並連接 repository。
   - 專案名必須是 `inboxpilot`。
2. 設定 Build Command：

```bash
npm run build
```

3. 設定環境變數。最少需要：

```env
DATABASE_URL
DIRECT_URL
AUTH_SECRET
APP_URL
INBOXPILOT_RELEASE_CHANNEL
ADMIN_EMAIL
ADMIN_PASSWORD
ADMIN_NAME
REDIS_URL
```

完整列表請看 [environment-variables.md](./environment-variables.md)。

## Production / Staging release channel

目前採用「正式站簡易版、測試站完整規劃版」：

```text
Production: https://inboxpilot.carry-digital-nomad.in.net
Staging:    https://staging.carry-digital-nomad.in.net
```

Vercel 環境變數設定：

```text
Production: INBOXPILOT_RELEASE_CHANNEL=simple
Preview:    INBOXPILOT_RELEASE_CHANNEL=full
Production: INBOXPILOT_DB_ENV=production
Preview:    INBOXPILOT_DB_ENV=staging
```

`staging.carry-digital-nomad.in.net` 是固定 staging alias，會由 GitHub Actions 在 Vercel Preview deployment 成功後自動更新到最新 Preview URL。

自動更新流程：

- Workflow: `.github/workflows/update-staging-alias.yml`
- Trigger: GitHub `deployment_status=success`、deployment environment 不是 `Production`，且 deployment ref 必須是 `staging`
- Manual fallback: GitHub Actions `Update Staging Alias` 的 `workflow_dispatch`
- Alias target: `staging.carry-digital-nomad.in.net`
- Allowed source: `*.vercel.app` Preview deployment URL

自動觸發只接受 `staging` branch 的 Preview deployment。其他 feature / codex / master Preview deployment 不會自動更新 staging alias；若真的需要臨時指定，可用 manual fallback 明確輸入 Preview URL。

GitHub Secrets 需求：

```text
VERCEL_TOKEN   必填，Vercel token，只放在 GitHub Secrets
VERCEL_SCOPE   選填，Vercel team / scope slug；個人專案可不填
```

手動補 alias 時可在 GitHub Actions 輸入 Preview deployment URL，或本機執行：

```bash
npx vercel alias set <preview-deployment-url> staging.carry-digital-nomad.in.net
```

注意：這個流程只更新 custom domain alias，不會部署、不會修改 DB、不會切換 release channel。開始導入真實客戶或真實金流前，必須拆成 production DB 與 staging DB。

## Staging DB isolation

正式上線架構需要獨立 staging Supabase project。不要讓 Preview 環境共用 Production `DATABASE_URL` / `DIRECT_URL`。

Preview 必填核心 env：

```text
INBOXPILOT_RELEASE_CHANNEL=full
INBOXPILOT_DEPLOYMENT_ENV=staging
INBOXPILOT_DB_ENV=staging
STAGING_SUPABASE_PROJECT_REF=<staging-project-ref>
APP_URL=https://staging.carry-digital-nomad.in.net
APP_DOMAIN=staging.carry-digital-nomad.in.net
AUTH_SECRET=<staging-only-secret>
TOKEN_ENCRYPTION_KEY=<staging-only-secret>
DATABASE_URL=<staging-supabase-pooler-url>
DIRECT_URL=<staging-supabase-direct-url>
NEXT_PUBLIC_SUPABASE_URL=<staging-supabase-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<staging-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<staging-service-role-key>
```

部署後驗證：

```bash
curl -i https://staging.carry-digital-nomad.in.net/api/health/staging
```

期待 `checks.staging.ok=true`、`environment.dbEnv=staging`、`environment.releaseChannel=full`。完整 runbook 請看 [staging-db-runbook.md](./staging-db-runbook.md)。

4. 部署後執行 DB migration：

```bash
npx prisma migrate deploy
```

依部署平台不同，可在 release job、CI pipeline 或本機指向 production DB 執行。
正式執行前請先照 [database-migration-runbook.md](./database-migration-runbook.md) 做 staging dry-run 與 rollback 準備。

## Worker 部署

Next.js web process 不會常駐處理 job。正式環境需另外部署 worker：

```bash
npm run worker
```

正式環境建議設定 `REDIS_URL`，worker 會啟用 BullMQ 並從 Redis 消費 job。每個 job 仍會先寫入 PostgreSQL `Job` table；Redis 只負責分發與延遲排程，所以 DB 仍保留審計與 fallback。未設定 `REDIS_URL` 時，worker 會退回 DB polling 模式。

Worker 會處理：

- 廣播發送
- automation wait continuation
- inbound automation
- sequence send
- reminder / periodic maintenance

建議 worker 環境變數：

```env
REDIS_URL="redis://..."
JOB_QUEUE_NAME="inboxpilot-jobs"
WORKER_CONCURRENCY="5"
WORKER_INTERVAL_MS="5000"
WORKER_DB_BATCH_SIZE="10"
```

若平台不支援長駐 worker，可用 `/api/cron/worker` 作為臨時 fallback，但正式高併發不應只依賴 Vercel API route 跑 worker。

## Cron

目前有 API route 可供平台 cron 呼叫：

```text
GET /api/cron/refresh-ai-models
GET /api/cron/refresh-instagram-tokens
GET /api/cron/worker
```

建議在 Vercel Cron 或外部 scheduler 設定。

AI model refresh note:

- `codex_cli` and `antigravity_cli` are local CLI providers and remain opt-in by design.
- Do not set `AI_ENABLE_LOCAL_CLI=true` in the shared Vercel / production cron environment unless that runtime actually has the corresponding CLI installed and authenticated.
- Current recommended production setting is to leave `AI_ENABLE_LOCAL_CLI` unset, so daily refresh only covers API-backed providers.

## Webhook URLs

正式環境必須使用公開 HTTPS URL：

```text
https://your-domain.com/api/webhooks/meta
https://your-domain.com/api/webhooks/telegram
https://your-domain.com/api/webhooks/whatsapp
https://your-domain.com/api/billing/payuni/return
https://your-domain.com/api/billing/payuni/notify
```

## Supabase

Supabase 專案名必須是 `IG Auto Reply ManyChat`。

建議使用 Supabase pooler 作為 Prisma `DATABASE_URL`，direct connection 作為 `DIRECT_URL`：

```env
DATABASE_URL="postgresql://postgres.<ref>:<password>@...pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=require"
DIRECT_URL="postgresql://postgres.<ref>:<password>@...pooler.supabase.com:5432/postgres?sslmode=require"
```

RLS SQL 參考：

```text
docs/security/supabase-rls-fix.sql
```

## Production checklist

- 操作 Chrome / Facebook / Meta / Vercel / Supabase 後台前，必須先確認是否需要使用 `@chrome`。
- Facebook Business 帳號名必須是 `林元`。
- Vercel 專案名必須是 `inboxpilot`。
- Supabase 專案名必須是 `IG Auto Reply ManyChat`。
- PayUNI 目前使用測試站；正式站仍在審核中，不得切換正式金流。
- `AUTH_SECRET` 至少 32 字元，且不可使用開發值。
- 所有 API key/token 只放 server env。
- `APP_URL` 設為正式 HTTPS domain。
- PayUNI return/notify URL 與商店後台一致。
- OAuth redirect URLs 與 Meta App 後台一致，建議使用 `/api/oauth/meta-instagram/callback` 與 `/api/oauth/meta-facebook/callback`。
- Worker 已部署且能連 DB。
- Worker 已設定 `REDIS_URL` 並能消費 BullMQ job。
- Cron 已設定。
- DB migration 已執行。
- Supabase RLS 已套用並測試。
- 壓測方案與結果請記錄在 [performance-load-test-plan.md](./performance-load-test-plan.md)。
