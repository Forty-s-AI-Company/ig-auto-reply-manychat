# 2026-05-31 Load Test Results

## Scope

目標：模擬同時 1000 名使用者在線，包含登入後頁面/API、多人同時傳送訊息、automation webhook、mock inbound webhook、broadcast queue 與 worker 壓力。

環境：local Next dev server `http://127.0.0.1:3041` + Supabase remote database。這不是 production-like Vercel runtime，因此結果主要用來找瓶頸，不代表正式站 CDN / serverless / edge 行為。

壓測資料：使用 `loadtest-*` prefix 建立測試 contacts、automations、broadcast，測後已清理 contacts / automations / broadcasts / jobs。為避免 abort 後仍在 server 端處理的請求發生 FK race，壓測腳本預設保留 `loadtest@example.com` 測試 user；可用 `LOAD_TEST_DELETE_USER=1` 強制刪除。

## Pre-Test Finding

壓測前發現實際 public DB 缺少 launch hardening migration 的 `Job.lockedAt` 欄位，automation wait / worker 會報錯：

`The column Job.lockedAt does not exist in the current database.`

已直接補上 migration 中的 missing column / indexes：

- `Job.lockedAt`
- `Message_conversationId_createdAt_idx`
- `Message_contactId_createdAt_idx`
- `Message_channelId_providerMessageId_idx`
- `AutomationRun_automationId_status_idx`
- `AutomationRun_contactId_status_idx`
- `AutomationRun_conversationId_createdAt_idx`
- `Broadcast_workspaceId_status_scheduledAt_idx`
- `Job_workspaceId_type_status_runAt_idx`

## 20-User Smoke

Command:

```bash
LOAD_TEST_USERS=20 LOAD_TEST_DURATION_MS=10000 LOAD_TEST_SEED_CONTACTS=100 LOAD_TEST_THINK_MIN_MS=100 LOAD_TEST_THINK_MAX_MS=400 LOAD_TEST_REQUEST_TIMEOUT_MS=30000 node scripts/load-test.mjs
```

Result:

- Total requests: 21
- Total errors/timeouts: 3
- Error rate: 14.29%
- RPS: 0.5
- Worst endpoints:
  - `mock.inbound`: p95 30004 ms, 2/2 timeout
  - `automation.webhook`: p95 30002 ms, 1/1 timeout
  - `broadcast.queue`: 24934 ms
  - `api.contacts`: p95 22991 ms
  - `page.inbox`: p95 22387 ms

## 1000-User Single-Wave Test

Command:

```bash
LOAD_TEST_USERS=1000 LOAD_TEST_DURATION_MS=15000 LOAD_TEST_SEED_CONTACTS=1000 LOAD_TEST_THINK_MIN_MS=1000 LOAD_TEST_THINK_MAX_MS=3000 LOAD_TEST_REQUEST_TIMEOUT_MS=30000 LOAD_TEST_WORKER_INTERVAL_MS=1000 LOAD_TEST_WORKER_LIMIT=100 node scripts/load-test.mjs
```

Result:

- Total requests: 1001
- Total errors/timeouts: 673
- Error rate: 67.23%
- RPS: 23.2
- Runtime: 43.2 s
- Test data cleanup: completed

Endpoint summary:

| Endpoint | Count | Avg | P50 | P95 | P99 | Errors |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| `page.inbox` | 111 | 23449 ms | 30044 ms | 30062 ms | 30063 ms | 33 |
| `page.dashboard` | 129 | 22305 ms | 30031 ms | 30057 ms | 30062 ms | 45 |
| `page.analytics` | 128 | 21729 ms | 30042 ms | 30057 ms | 30063 ms | 48 |
| `api.contacts` | 113 | 21213 ms | 30040 ms | 30057 ms | 30062 ms | 113 |
| `api.conversations` | 127 | 23408 ms | 30043 ms | 30057 ms | 30063 ms | 127 |
| `page.broadcasts` | 126 | 23003 ms | 30042 ms | 30056 ms | 30057 ms | 40 |
| `mock.inbound` | 136 | 18624 ms | 7933 ms | 30054 ms | 30064 ms | 136 |
| `automation.webhook` | 130 | 18607 ms | 7939 ms | 30053 ms | 30054 ms | 130 |
| `broadcast.queue` | 1 | 30005 ms | 30005 ms | 30005 ms | 30005 ms | 1 |

## Verdict

目前不能承受 1000 名同時在線使用者。瓶頸不是單一頁面，而是共用的 database / Prisma query path 在 concurrent load 下全面飽和；automation / inbound webhook / broadcast queue 會把寫入與 worker queue 壓力放大。

## Priority Fixes

1. 將 message ingest / automation execution 拆成 queue-first：webhook 只寫入 lightweight event ledger 並快速回 202，automation 由 worker 批次處理。
2. Broadcast queue 不應同步建立大量 job；改成分頁批次 enqueue，例如每批 100-500 contacts，並以 background worker 執行。
3. Dashboard / Inbox / Contacts / Analytics 加 cache 或 materialized summary，避免每次頁面 render 直接打多個高成本 count/list query。
4. API list endpoints 必須強制 pagination、select 精簡欄位、避免 include 大型關聯。
5. Worker 應獨立於 Next request runtime，使用 dedicated process / queue backend，例如 BullMQ + Redis 或 Supabase Queue / pg-boss。
6. Prisma pool 設定需依 runtime 調整；目前 Supabase pooler + local dev 在高 concurrency 下會快速排隊。
7. 對 webhook / inbound API 做 backpressure：per workspace queue depth limit、429/202 retry-after、idempotency key。
8. 建立 production-like staging 壓測：Vercel preview/staging + staging Supabase + pgbouncer pool metrics + DB slow query log。
