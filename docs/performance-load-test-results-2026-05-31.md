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

## Optimization Pass 1

已完成：

- `PRISMA_CONNECTION_LIMIT` 預設由 1 調整為 dev 10 / production 5，仍可用 env 覆寫。
- `mock.inbound` 與 `automation.webhook` 改為 queue-first，request 只建立 inbound/event/job，automation 由 worker 執行。
- `broadcast.queue` 改為快速建立 `broadcast_expand` job，再由 worker 以 batch 展開 recipients，不再於 request 中同步建立大量 `broadcast_send` jobs。
- `contacts` / `conversations` API 加上 limit，預設 50、最高 100。
- Contacts page 初始只取 100 筆；Inbox page 初始只取 50 個 conversations 與每個 conversation 最近 30 則 messages。
- Authenticated user / workspace lookup 加入短 TTL server-side cache，降低同一波 request 對 DB 的重複讀取。

20-user smoke retest:

```bash
LOAD_TEST_USERS=20 LOAD_TEST_DURATION_MS=10000 LOAD_TEST_SEED_CONTACTS=100 LOAD_TEST_THINK_MIN_MS=100 LOAD_TEST_THINK_MAX_MS=400 LOAD_TEST_REQUEST_TIMEOUT_MS=30000 node scripts/load-test.mjs
```

Result:

- Total requests: 50
- Total errors/timeouts: 0
- Error rate: 0%
- RPS: 3.5
- `api.contacts` p95: 3624 ms
- `api.conversations` p95: 3625 ms
- `page.dashboard` p95: 6447 ms
- `mock.inbound` p95: 10937 ms
- `automation.webhook` p95: 10769 ms

1000-user retest after the first queue/pool pass still failed under local dev + remote Supabase:

- Total requests: 1452
- Total errors/timeouts: 891
- Error rate: 61.36%
- RPS: 33.1

Interpretation: 第一波優化已解掉小流量 timeout，並提高吞吐，但 1000 simultaneous single-wave 仍會讓 local Next dev + remote Supabase connection pool 飽和。下一步需把 worker 移出 request runtime、加 Redis/queue backend，並將 dashboard/inbox/analytics summary 改為 materialized/cache-first。

## Optimization Pass 2

已完成：

- Dashboard / Analytics summary 改為 5 秒 server-side promise cache，同一波請求共用同一個 DB loader。
- AdminShell 的 workspace list / Instagram channel list 改為 5 秒 server-side cache，降低每頁共用殼層的重複查詢。
- Dashboard 最近自動化改用 `_count.steps`，不再載入完整 steps。
- Inbox 預設 tags 的 `upsert` 改為每 workspace 每小時最多執行一次。
- Inbox 初始 payload 從 50 個 conversations x 30 則 messages 降為 25 個 conversations x 10 則 messages。
- Contacts / Conversations API 在無搜尋條件時加入 5 秒 short cache。
- Broadcasts page 的 broadcasts/tags/segments 加入 5 秒 short cache，broadcasts 初始列表限制 100 筆。
- Load test script 修正：只有 HTTP 2xx/3xx 算成功；production mock webhook 可用 `MOCK_WEBHOOK_SECRET` 測試，避免 401 被誤判為成功。

Local dev 20-user retest after pass 2:

- Total requests: 89
- Total errors/timeouts: 0
- Error rate: 0%
- RPS: 6.6
- `page.dashboard` p95: 4328 ms
- `page.analytics` p95: 4321 ms
- `api.contacts` p95: 3433 ms
- `api.conversations` p95: 3085 ms
- `mock.inbound` p95: 8707 ms
- `automation.webhook` p95: 9917 ms

Local dev 1000-user retest after pass 2:

- Total requests: 1465
- Total errors/timeouts: 1016
- Error rate: 69.35%
- RPS: 33.4
- Runtime: 43.8 s

Interpretation: dev mode 下 pass 2 沒有改善 1000 simultaneous single-wave，因為 server request queue / DB pool 已在第一波首請求被打滿；多數請求在 client 30s timeout 後 server 仍繼續處理。

## Production-Mode Local Retest

為了避免 Next dev server / Turbopack logging 影響判讀，已用 `next build` + `next start -p 3041` 重跑。Production mode 需要正式安全設定；本機測試用臨時 `AUTH_SECRET`、`APP_URL=http://localhost:3041`、`CRON_SECRET`、`MOCK_WEBHOOK_SECRET` 啟動，未寫入檔案。

20-user production smoke:

```bash
LOAD_TEST_BASE_URL=http://localhost:3041 CRON_SECRET=... MOCK_WEBHOOK_SECRET=... LOAD_TEST_USERS=20 LOAD_TEST_DURATION_MS=10000 LOAD_TEST_SEED_CONTACTS=100 LOAD_TEST_THINK_MIN_MS=100 LOAD_TEST_THINK_MAX_MS=400 LOAD_TEST_REQUEST_TIMEOUT_MS=30000 node scripts/load-test.mjs
```

Result:

- Total requests: 58
- Total errors/timeouts: 0
- Error rate: 0%
- RPS: 3.0
- `page.inbox` p95: 2875 ms
- `api.conversations` p95: 4241 ms
- `api.contacts` p95: 4258 ms
- `page.dashboard` p95: 5269 ms
- `broadcast.queue`: 7017 ms
- `mock.inbound` p95: 13490 ms
- `automation.webhook` p95: 14001 ms
- `cron.worker`: 11609 ms

1000-user production single-wave:

```bash
LOAD_TEST_BASE_URL=http://localhost:3041 CRON_SECRET=... MOCK_WEBHOOK_SECRET=... LOAD_TEST_USERS=1000 LOAD_TEST_DURATION_MS=15000 LOAD_TEST_SEED_CONTACTS=1000 LOAD_TEST_THINK_MIN_MS=1000 LOAD_TEST_THINK_MAX_MS=3000 LOAD_TEST_REQUEST_TIMEOUT_MS=30000 LOAD_TEST_WORKER_INTERVAL_MS=1000 LOAD_TEST_WORKER_LIMIT=100 node scripts/load-test.mjs
```

Result:

- Total requests: 1106
- Total errors/timeouts: 554
- Error rate: 50.09%
- RPS: 25.0
- Runtime: 44.3 s
- `page.dashboard`: 136 requests / 0 errors / p95 30306 ms
- `page.inbox`: 152 requests / 0 errors / p95 30306 ms
- `page.broadcasts`: 137 requests / 0 errors / p95 30306 ms
- `page.analytics`: 127 requests / 0 errors / p95 30304 ms
- `api.contacts`: 143 requests / 143 timeouts / p95 30305 ms
- `api.conversations`: 137 requests / 137 timeouts / p95 30305 ms
- `mock.inbound`: 131 requests / 131 timeouts / p95 30187 ms
- `automation.webhook`: 142 requests / 142 timeouts / p95 30177 ms
- `broadcast.queue`: 1 request / 1 timeout / 30006 ms

Updated verdict: production mode is better than local dev by error rate, but still cannot safely claim 1000 simultaneous users. Read pages can eventually return 200, but they sit at the 30s timeout boundary; write-heavy webhook/API/broadcast paths still fail under single-wave load.

## Remaining Architecture Work

1. Move webhook ingest, automation execution, broadcast expansion, and worker processing out of the Next request runtime into a dedicated queue worker.
2. Add Redis/BullMQ, pg-boss, Supabase Queue, or another durable queue with workspace-level concurrency limits and retries.
3. Replace hot dashboard/inbox/analytics read queries with persisted summary tables or materialized views updated by jobs/webhooks.
4. Add production observability before any public launch: request duration histogram, DB pool wait, slow query log, queue depth, worker lag, and timeout rate by route.
5. Run staging load tests on Vercel preview/staging with staging Supabase metrics enabled; local single-process results are a blocker signal, not a final capacity number.
