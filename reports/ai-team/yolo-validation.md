# YOLO Validation

## `npm run lint`
- exit: `0`
### stdout
```text

> inboxpilot@0.1.0 lint
> eslint


```
## `npm run build`
- exit: `0`
### stdout
```text
 /api/admin/payouts/batches/[id]/export
├ ƒ /api/admin/payouts/batches/[id]/mark-failed
├ ƒ /api/admin/payouts/batches/[id]/mark-paid
├ ƒ /api/affiliate/apply
├ ƒ /api/ai-model-test
├ ƒ /api/ai-models
├ ƒ /api/ai-models/refresh
├ ƒ /api/ai-settings
├ ƒ /api/analytics
├ ƒ /api/auth/google/callback
├ ƒ /api/auth/google/start
├ ƒ /api/auth/login
├ ƒ /api/auth/logout
├ ƒ /api/auth/signup
├ ƒ /api/automation-folders
├ ƒ /api/automation-folders/[id]
├ ƒ /api/automation-webhooks/[key]
├ ƒ /api/automations
├ ƒ /api/automations/[id]
├ ƒ /api/automations/[id]/run
├ ƒ /api/billing/payuni/checkout
├ ƒ /api/billing/payuni/notify
├ ƒ /api/billing/payuni/return
├ ƒ /api/billing/usage
├ ƒ /api/broadcasts
├ ƒ /api/broadcasts/[id]
├ ƒ /api/broadcasts/[id]/preview
├ ƒ /api/broadcasts/[id]/queue
├ ƒ /api/channels
├ ƒ /api/channels/[id]
├ ƒ /api/channels/[id]/instagram-profile/refresh
├ ƒ /api/contact-fields
├ ƒ /api/contact-fields/[id]
├ ƒ /api/contacts
├ ƒ /api/contacts/[id]
├ ƒ /api/contacts/[id]/fields
├ ƒ /api/contacts/[id]/tags
├ ƒ /api/contacts/batch-tags
├ ƒ /api/contacts/segments
├ ƒ /api/conversations
├ ƒ /api/conversations/[id]
├ ƒ /api/conversations/[id]/messages
├ ƒ /api/conversations/[id]/notes
├ ƒ /api/cron/refresh-ai-models
├ ƒ /api/cron/refresh-instagram-tokens
├ ƒ /api/cron/worker
├ ƒ /api/dashboard
├ ƒ /api/health
├ ƒ /api/instagram/comments/sync
├ ƒ /api/instagram/media
├ ƒ /api/instagram/oauth/callback
├ ƒ /api/instagram/token/refresh
├ ƒ /api/internal/oauth/[provider]/authorize
├ ƒ /api/internal/oauth/[provider]/callback
├ ƒ /api/knowledge-base
├ ƒ /api/knowledge-base/[id]
├ ƒ /api/meta/data-deletion
├ ƒ /api/meta/deauthorize
├ ƒ /api/meta/oauth/callback
├ ƒ /api/meta/oauth/start
├ ƒ /api/oauth/[provider]/authorize
├ ƒ /api/oauth/[provider]/callback
├ ƒ /api/oauth/[provider]/token
├ ƒ /api/oauth/accounts/[id]/sync
├ ƒ /api/segments
├ ƒ /api/segments/[id]
├ ƒ /api/sequences
├ ƒ /api/sequences/[id]
├ ƒ /api/sequences/[id]/subscribe
├ ƒ /api/tags
├ ƒ /api/tags/[id]
├ ƒ /api/webhooks/meta
├ ƒ /api/webhooks/mock
├ ƒ /api/webhooks/telegram
├ ƒ /api/webhooks/whatsapp
├ ƒ /api/workspace-scope
├ ƒ /automations
├ ƒ /automations/instagram-default-reply
├ ƒ /billing
├ ƒ /broadcasts
├ ƒ /channels
├ ƒ /channels/connect
├ ƒ /channels/connect/instagram
├ ƒ /channels/connect/instagram/switch-account
├ ƒ /channels/connect/messenger
├ ƒ /channels/connect/social
├ ƒ /channels/connect/success
├ ○ /contact
├ ƒ /contacts
├ ƒ /contacts/[id]
├ ƒ /dashboard
├ ○ /data-deletion
├ ○ /help-center
├ ƒ /inbox
├ ○ /inboxpilot
├ ƒ /knowledge-base
├ ƒ /login
├ ƒ /mock-tester
├ ƒ /oauth/popup/callback
├ ƒ /oauth/providers/mock
├ ƒ /oauth/providers/telegram
├ ○ /official
├ ○ /official/v2
├ ○ /official/v3
├ ○ /pricing
├ ○ /privacy-policy
├ ƒ /profile
├ ƒ /referrals
├ ƒ /segments
├ ƒ /sequences
├ ƒ /signup
├ ○ /status
├ ƒ /tags
├ ○ /templates
├ ○ /terms-of-service
└ ƒ /wallet


ƒ Proxy (Middleware)

○  (Static)   prerendered as static content
ƒ  (Dynamic)  server-rendered on demand


```
### stderr
```text
Loaded Prisma config from prisma.config.ts.

Prisma config detected, skipping environment variable loading.
Error: 
EPERM: operation not permitted, rename 'C:\Users\eden\Downloads\AI\ig-auto-reply-manychat\node_modules\.prisma\client\query_engine-windows.dll.node.tmp24484' -> 'C:\Users\eden\Downloads\AI\ig-auto-reply-manychat\node_modules\.prisma\client\query_engine-windows.dll.node'


[prisma-generate-safe] Prisma engine is locked by a local Node process; reusing existing generated client.

```
## `npm test`
- exit: `0`
### stdout
```text
[32m·[39m[33m[39m[32m·[39m[33m[39m[32m·[39m[33m[39m[32m·[39m[33m[39m[32m·[39m[33m[39m[32m·[39m[90mstdout[2m | tests/referral-credit-refund-lifecycle.test.ts
[22m[39m◇ injected env (58) from .env.local // tip: ⌘ enable debugging { debug: true }
◇ injected env (0) from .env // tip: ⌘ custom filepath { path: '/custom/path/.env' }

[33m[39m[32m·[39m[33m[39m[32m·[39m[90mstdout[2m | tests/referral-credit-wallet-lifecycle.test.ts
[22m[39m◇ injected env (58) from .env.local // tip: ⌁ auth for agents [www.vestauth.com]
◇ injected env (0) from .env // tip: ⌘ suppress logs { quiet: true }

[33m[39m[32m·[39m[33m[39m[32m·[39m[33m[39m[32m·[39m[33m[39m[32m·[39m[33m[39m[32m·[39m[33m[39m[32m·[39m[33m[39m[32m·[39m[33m[39m[32m·[39m[33m[39m[32m·[39m[33m[39m[32m·[39m[33m[39m[32m·[39m[33m[39m[32m·[39m[33m[39m[32m·[39m[33m[39m[32m·[39m[33m[39m[32m·[39m[33m[39m[32m·[39m[33m[39m[32m·[39m

[2m Test Files [22m [1m[32m6 passed[39m[22m[90m (6)[39m
[2m      Tests [22m [1m[32m27 passed[39m[22m[90m (27)[39m
[2m   Start at [22m 10:51:49
[2m   Duration [22m 3.26s[2m (transform 210ms, setup 0ms, import 771ms, tests 1.31s, environment 1ms)[22m

Running batch 15/16: tests\segments-empty-state.test.ts, tests\segments-light-theme.test.ts, tests\segments.test.ts, tests\sequences-form-state.test.ts, tests\sequences-jobs.test.ts, tests\signup-light-theme.test.ts

[1m[30m[46m RUN [49m[39m[22m [36mv4.1.7 [39m[90mC:/Users/eden/Downloads/AI/ig-auto-reply-manychat[39m

[33m[39m[32m·[39m[33m[39m[32m·[39m[33m[39m[32m·[39m[33m[39m[32m·[39m[33m[39m[32m·[39m[33m[39m[32m·[39m[33m[39m[32m·[39m[33m[39m[32m·[39m[33m[39m[32m·[39m[33m[39m[32m·[39m[33m[39m[32m·[39m

[2m Test Files [22m [1m[32m6 passed[39m[22m[90m (6)[39m
[2m      Tests [22m [1m[32m11 passed[39m[22m[90m (11)[39m
[2m   Start at [22m 10:51:53
[2m   Duration [22m 6.59s[2m (transform 327ms, setup 0ms, import 1.25s, tests 4.17s, environment 1ms)[22m

Running batch 16/16: tests\tenant-isolation-routes.test.ts, tests\wallet-light-theme.test.ts, tests\webhook-security.test.ts

[1m[30m[46m RUN [49m[39m[22m [36mv4.1.7 [39m[90mC:/Users/eden/Downloads/AI/ig-auto-reply-manychat[39m

[33m[39m[32m·[39m[33m[39m[32m·[39m[33m[39m[32m·[39m[33m[39m[32m·[39m[33m[39m[32m·[39m[33m[39m[32m·[39m[33m[39m[32m·[39m[33m[39m[32m·[39m[33m[39m[32m·[39m[33m[39m[32m·[39m[33m[39m[32m·[39m[33m[39m[32m·[39m[33m[39m[32m·[39m[33m[39m[32m·[39m[33m[39m[32m·[39m[33m[39m[32m·[39m[33m[39m[32m·[39m[33m[39m[32m·[39m[33m[39m[32m·[39m

[2m Test Files [22m [1m[32m3 passed[39m[22m[90m (3)[39m
[2m      Tests [22m [1m[32m19 passed[39m[22m[90m (19)[39m
[2m   Start at [22m 10:52:00
[2m   Duration [22m 1.04s[2m (transform 161ms, setup 0ms, import 424ms, tests 44ms, environment 0ms)[22m


```
### stderr
```text
Loaded Prisma config from prisma.config.ts.

Prisma config detected, skipping environment variable loading.
[90mstderr[2m | tests/meta-webhook.test.ts[2m > [22m[2mMeta webhook[2m > [22m[2mrejects Meta webhook requests with an invalid signature
[22m[39m[audit] failed to record event TypeError: Cannot read properties of undefined (reading 'create')
    at recordAuditEvent (C:/Users/eden/Downloads/AI/ig-auto-reply-manychat/src/lib/audit.ts:28:19)
    at Module.POST (C:/Users/eden/Downloads/AI/ig-auto-reply-manychat/src/app/api/webhooks/meta/route.ts:75:11)
[90m    at processTicksAndRejections (node:internal/process/task_queues:103:5)[39m
    at C:/Users/eden/Downloads/AI/ig-auto-reply-manychat/tests/meta-webhook.test.ts:99:22
    at [90mfile:///C:/Users/eden/Downloads/AI/ig-auto-reply-manychat/[39mnode_modules/[4m@vitest/runner[24m/dist/chunk-artifact.js:1903:20


```
## `npm run test:e2e:reviewer`
- exit: `0`
### stdout
```text

> inboxpilot@0.1.0 test:e2e:reviewer
> npm run e2e:reviewer:ensure && playwright test tests/e2e/meta-reviewer-rehearsal.spec.ts --workers=1


> inboxpilot@0.1.0 e2e:reviewer:ensure
> tsx scripts/ensure-reviewer-demo-data.ts

◇ injected env (58) from .env.local // tip: ◈ secrets for agents [www.dotenvx.com]
◇ injected env (0) from .env // tip: ◈ secrets for agents [www.dotenvx.com]
[ensure-reviewer-demo-data] reviewer-safe local demo data is ready.

Running 2 tests using 1 worker

  ok 1 [chromium] › tests\e2e\meta-reviewer-rehearsal.spec.ts:41:7 › meta reviewer-safe rehearsal smoke › walks reviewer-safe dashboard, channels, inbox, contacts, and automations flows (13.0s)
  ok 2 [mobile-chrome] › tests\e2e\meta-reviewer-rehearsal.spec.ts:41:7 › meta reviewer-safe rehearsal smoke › walks reviewer-safe dashboard, channels, inbox, contacts, and automations flows (5.8s)

  2 passed (21.9s)

To open last HTML report run:
[36m[39m
[36m  npx playwright show-report[39m
[36m[39m

```
