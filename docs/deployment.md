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
ADMIN_EMAIL
ADMIN_PASSWORD
ADMIN_NAME
REDIS_URL
```

完整列表請看 [environment-variables.md](./environment-variables.md)。

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
- Meta OAuth redirect URL 與 Meta App 後台一致。
- Worker 已部署且能連 DB。
- Worker 已設定 `REDIS_URL` 並能消費 BullMQ job。
- Cron 已設定。
- DB migration 已執行。
- Supabase RLS 已套用並測試。
- 壓測方案與結果請記錄在 [performance-load-test-plan.md](./performance-load-test-plan.md)。
