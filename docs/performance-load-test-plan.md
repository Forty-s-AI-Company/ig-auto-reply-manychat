# Performance Load Test Plan

This plan simulates 1000 users against InboxPilot and records bottlenecks, high-frequency APIs, cache opportunities, and rate-limit rules.

## Run

Use a staging deployment or local production server:

```bash
LOAD_TEST_BASE_URL="https://staging.example.com" npm run load:test
```

Optional tuning:

```bash
LOAD_TEST_USERS=1000 LOAD_TEST_CONCURRENCY=50 LOAD_TEST_DURATION_MS=60000 npm run load:test
```

## Coverage

The default profile exercises unauthenticated and safely repeatable endpoints:

- `/`
- `/login`
- `/signup`
- `/pricing`
- `/api/ai-models`
- `/api/webhooks/meta` verification without valid token
- `/api/billing/payuni/return` invalid callback shape

Authenticated flows should be added once staging test accounts and provider sandbox credentials are available:

- `/api/dashboard`
- `/api/conversations`
- `/api/conversations/:id/messages`
- `/api/broadcasts`
- `/api/broadcasts/:id/queue`
- `/api/automations`
- `/api/instagram/media`

## Current Bottleneck Assessment

Critical:

- Supabase RLS is not yet applied in production project. Fix before any real load test using anon/authenticated Supabase clients.
- Full DB-backed integration tests require `DATABASE_URL` or `TEST_DATABASE_URL`.

High:

- Broadcast fan-out can spike `Job` writes and provider sends. The queue now uses transaction cleanup and atomic job claim, but production needs worker concurrency caps.
- Message timeline APIs are high-frequency. Indexes now exist for `(conversationId, createdAt)` and `(contactId, createdAt)`.
- Webhooks can burst during Instagram campaigns. Rate limits exist, but provider retry behavior should be monitored.

Medium:

- AI model tests and provider calls need short TTL caching for model lists and explicit rate limits per workspace.
- Analytics/dashboard queries should aggregate by workspace and cache short-lived summaries.

## Cache Plan

- Cache AI model catalog by provider for 15-60 minutes.
- Cache dashboard summary per workspace for 30-120 seconds.
- Cache analytics report slices by workspace/date range for 5 minutes.
- Do not cache inbox message writes, payment callbacks, webhook verification, or auth responses.

## Rate Limit Plan

- Auth login/signup: per IP and per email.
- AI test/model refresh: per user/workspace.
- Broadcast queue: per workspace and per broadcast id.
- Webhooks: per provider/channel plus signature validation.
- PayUNI callbacks: idempotent by merchant trade number/trade number; rate-limit malformed requests by IP.

## Pass Criteria

- p95 HTML page latency below 800 ms on staging.
- p95 API latency below 500 ms for cached/read endpoints.
- Error rate below 1%.
- No duplicate broadcast jobs.
- No cross-workspace data exposure in authenticated API tests.

## 2026-05-31 Local Smoke Result

Command:

```bash
LOAD_TEST_BASE_URL=http://127.0.0.1:3041 LOAD_TEST_USERS=1000 LOAD_TEST_CONCURRENCY=50 LOAD_TEST_DURATION_MS=10000 npm run load:test
```

Result:

- Total requests: 616
- Total 5xx/network errors: 0
- `/`: 230 requests, average 1109 ms, max 3379 ms
- `/login`: 68 requests, average 1321 ms, max 3321 ms
- `/signup`: 14 requests, average 2196 ms, max 3326 ms
- `/pricing`: 7 requests, average 2658 ms, max 3316 ms
- `/api/ai-models`: 14 requests, average 746 ms, all 401 as expected without auth
- `/api/webhooks/meta`: 71 requests, average 453 ms, all 403 as expected with invalid verify token
- `/api/billing/payuni/return`: 212 requests, average 320 ms, 120 redirects and 92 rate-limited responses

Interpretation:

- The local dev server survived the 1000-user smoke profile without 5xx errors.
- PayUNI callback rate limiting triggered under repeated malformed callbacks.
- Public page latency on dev server is too high to use as a production capacity signal. Repeat this on Vercel staging or production-like infrastructure before launch.
