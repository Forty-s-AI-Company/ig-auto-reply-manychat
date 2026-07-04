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
EPERM: operation not permitted, rename 'C:\Users\eden\Downloads\AI\ig-auto-reply-manychat\node_modules\.prisma\client\query_engine-windows.dll.node.tmp6160' -> 'C:\Users\eden\Downloads\AI\ig-auto-reply-manychat\node_modules\.prisma\client\query_engine-windows.dll.node'


[prisma-generate-safe] Prisma engine is locked by a local Node process; reusing existing generated client.

```
## `npm test`
- exit: `0`
### stdout
```text
ms, tests 534ms, environment 1ms)

Running batch 14/16: tests\referral-credit-refund-lifecycle.test.ts, tests\referral-credit-wallet-lifecycle.test.ts, tests\release-mode.test.ts, tests\release-proxy.test.ts, tests\security.test.ts, tests\segments-empty-state.test.ts

 RUN  v4.1.7 C:/Users/eden/Downloads/AI/ig-auto-reply-manychat

········stdout | tests/referral-credit-refund-lifecycle.test.ts
◇ injected env (58) from .env.local // tip: ⌘ multiple files { path: ['.env.local', '.env'] }
◇ injected env (0) from .env // tip: ⌘ enable debugging { debug: true }

··stdout | tests/referral-credit-wallet-lifecycle.test.ts
◇ injected env (58) from .env.local // tip: ⌘ multiple files { path: ['.env.local', '.env'] }
◇ injected env (0) from .env // tip: ⌘ enable debugging { debug: true }

··············

 Test Files  6 passed (6)
      Tests  24 passed (24)
   Start at  09:37:45
   Duration  3.69s (transform 240ms, setup 0ms, import 859ms, tests 1.39s, environment 1ms)

Running batch 15/16: tests\segments-light-theme.test.ts, tests\segments.test.ts, tests\sequences-form-state.test.ts, tests\sequences-jobs.test.ts, tests\signup-light-theme.test.ts, tests\tenant-isolation-routes.test.ts

 RUN  v4.1.7 C:/Users/eden/Downloads/AI/ig-auto-reply-manychat

····
 RUN  v4.1.7 C:/Users/eden/Downloads/AI/ig-auto-reply-manychat

··

 Test Files  1 passed (1)
      Tests  2 passed (2)
   Start at  09:37:55
   Duration  257ms (transform 19ms, setup 0ms, import 36ms, tests 4ms, environment 0ms)


 RUN  v4.1.7 C:/Users/eden/Downloads/AI/ig-auto-reply-manychat

··

 Test Files  1 passed (1)
      Tests  2 passed (2)
   Start at  09:37:56
   Duration  2.69s (transform 230ms, setup 0ms, import 617ms, tests 1.84s, environment 0ms)


 RUN  v4.1.7 C:/Users/eden/Downloads/AI/ig-auto-reply-manychat

·

 Test Files  1 passed (1)
      Tests  1 passed (1)
   Start at  09:37:59
   Duration  259ms (transform 21ms, setup 0ms, import 38ms, tests 5ms, environment 0ms)


 RUN  v4.1.7 C:/Users/eden/Downloads/AI/ig-auto-reply-manychat

··

 Test Files  1 passed (1)
      Tests  2 passed (2)
   Start at  09:38:00
   Duration  3.55s (transform 273ms, setup 0ms, import 709ms, tests 2.63s, environment 0ms)


 RUN  v4.1.7 C:/Users/eden/Downloads/AI/ig-auto-reply-manychat

···

 Test Files  1 passed (1)
      Tests  3 passed (3)
   Start at  09:38:04
   Duration  281ms (transform 21ms, setup 0ms, import 38ms, tests 5ms, environment 0ms)


 RUN  v4.1.7 C:/Users/eden/Downloads/AI/ig-auto-reply-manychat

··············

 Test Files  1 passed (1)
      Tests  14 passed (14)
   Start at  09:38:05
   Duration  661ms (transform 150ms, setup 0ms, import 423ms, tests 29ms, environment 0ms)

Running batch 16/16: tests\wallet-light-theme.test.ts, tests\webhook-security.test.ts

 RUN  v4.1.7 C:/Users/eden/Downloads/AI/ig-auto-reply-manychat

·····

 Test Files  2 passed (2)
      Tests  5 passed (5)
   Start at  09:38:06
   Duration  454ms (transform 30ms, setup 0ms, import 67ms, tests 9ms, environment 0ms)


```
### stderr
```text
Loaded Prisma config from prisma.config.ts.

Prisma config detected, skipping environment variable loading.
Vitest crashed while running a multi-file batch with exit 3221225477. Re-running files one by one to isolate the trigger.
Diagnostic rerun: tests\automation-triggers.test.ts
Diagnostic rerun: tests\automation.test.ts
Diagnostic rerun: tests\billing-calculations.test.ts
Diagnostic rerun: tests\billing-checkout-route.test.ts
Diagnostic rerun: tests\billing-entitlements.test.ts
Diagnostic rerun: tests\billing-page-status-copy.test.ts
Vitest batch crashed with Windows access violation exit 3221225477, but every file passed when rerun individually. Continuing after confirming this is batch-level runner instability: tests\automation-triggers.test.ts, tests\automation.test.ts, tests\billing-calculations.test.ts, tests\billing-checkout-route.test.ts, tests\billing-entitlements.test.ts, tests\billing-page-status-copy.test.ts
stderr | tests/meta-webhook.test.ts > Meta webhook > rejects Meta webhook requests with an invalid signature
[audit] failed to record event TypeError: Cannot read properties of undefined (reading 'create')
    at recordAuditEvent (C:/Users/eden/Downloads/AI/ig-auto-reply-manychat/src/lib/audit.ts:28:19)
    at Module.POST (C:/Users/eden/Downloads/AI/ig-auto-reply-manychat/src/app/api/webhooks/meta/route.ts:75:11)
    at processTicksAndRejections (node:internal/process/task_queues:103:5)
    at C:/Users/eden/Downloads/AI/ig-auto-reply-manychat/tests/meta-webhook.test.ts:99:22
    at file:///C:/Users/eden/Downloads/AI/ig-auto-reply-manychat/node_modules/@vitest/runner/dist/chunk-artifact.js:1903:20

Vitest crashed while running a multi-file batch with exit 3221225477. Re-running files one by one to isolate the trigger.
Diagnostic rerun: tests\segments-light-theme.test.ts
Diagnostic rerun: tests\segments.test.ts
Diagnostic rerun: tests\sequences-form-state.test.ts
Diagnostic rerun: tests\sequences-jobs.test.ts
Diagnostic rerun: tests\signup-light-theme.test.ts
Diagnostic rerun: tests\tenant-isolation-routes.test.ts
Vitest batch crashed with Windows access violation exit 3221225477, but every file passed when rerun individually. Continuing after confirming this is batch-level runner instability: tests\segments-light-theme.test.ts, tests\segments.test.ts, tests\sequences-form-state.test.ts, tests\sequences-jobs.test.ts, tests\signup-light-theme.test.ts, tests\tenant-isolation-routes.test.ts

```
## `npm run test:e2e:reviewer`
- exit: `0`
### stdout
```text

> inboxpilot@0.1.0 test:e2e:reviewer
> npm run e2e:reviewer:ensure && playwright test tests/e2e/meta-reviewer-rehearsal.spec.ts --workers=1


> inboxpilot@0.1.0 e2e:reviewer:ensure
> tsx scripts/ensure-reviewer-demo-data.ts

◇ injected env (58) from .env.local // tip: ⌘ override existing { override: true }
◇ injected env (0) from .env // tip: ◈ encrypted .env [www.dotenvx.com]
[ensure-reviewer-demo-data] reviewer-safe local demo data is ready.

Running 2 tests using 1 worker

  ok 1 [chromium] › tests\e2e\meta-reviewer-rehearsal.spec.ts:41:7 › meta reviewer-safe rehearsal smoke › walks reviewer-safe dashboard, channels, inbox, contacts, and automations flows (6.0s)
  ok 2 [mobile-chrome] › tests\e2e\meta-reviewer-rehearsal.spec.ts:41:7 › meta reviewer-safe rehearsal smoke › walks reviewer-safe dashboard, channels, inbox, contacts, and automations flows (5.5s)

  2 passed (13.8s)

```
### stderr
```text
(node:7816) Warning: The 'NO_COLOR' env is ignored due to the 'FORCE_COLOR' env being set.
(Use `node --trace-warnings ...` to show where the warning was created)
(node:7816) Warning: The 'NO_COLOR' env is ignored due to the 'FORCE_COLOR' env being set.
(Use `node --trace-warnings ...` to show where the warning was created)
(node:23064) Warning: The 'NO_COLOR' env is ignored due to the 'FORCE_COLOR' env being set.
(Use `node --trace-warnings ...` to show where the warning was created)
(node:23064) Warning: The 'NO_COLOR' env is ignored due to the 'FORCE_COLOR' env being set.
(Use `node --trace-warnings ...` to show where the warning was created)

```
