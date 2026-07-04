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
EPERM: operation not permitted, rename 'C:\Users\eden\Downloads\AI\ig-auto-reply-manychat\node_modules\.prisma\client\query_engine-windows.dll.node.tmp12600' -> 'C:\Users\eden\Downloads\AI\ig-auto-reply-manychat\node_modules\.prisma\client\query_engine-windows.dll.node'


[prisma-generate-safe] Prisma engine is locked by a local Node process; reusing existing generated client.

```
## `npm test`
- exit: `0`
### stdout
```text
ration  4.11s (transform 348ms, setup 0ms, import 821ms, tests 2.02s, environment 1ms)

Running batch 12/16: tests\mock-tester-light-theme.test.ts, tests\mock-webhook-flow.test.ts, tests\mock-webhook-route.test.ts, tests\oauth-popup-bridge.test.ts, tests\official-landing-channel-scope.test.ts, tests\official-v3-footer-links.test.ts

 RUN  v4.1.7 C:/Users/eden/Downloads/AI/ig-auto-reply-manychat

···········

 Test Files  6 passed (6)
      Tests  11 passed (11)
   Start at  09:29:36
   Duration  2.45s (transform 215ms, setup 0ms, import 656ms, tests 615ms, environment 1ms)

Running batch 13/16: tests\payuni-billing.test.ts, tests\pricing-page-polish.test.ts, tests\profile-menu-ia.test.ts, tests\rate-limit.test.ts, tests\referral-affiliate-docs.test.ts, tests\referral-affiliate-mvp-ui.test.ts

 RUN  v4.1.7 C:/Users/eden/Downloads/AI/ig-auto-reply-manychat

stdout | tests/payuni-billing.test.ts
◇ injected env (58) from .env.local // tip: ⌘ override existing { override: true }
◇ injected env (0) from .env // tip: ⌘ enable debugging { debug: true }

·························

 Test Files  6 passed (6)
      Tests  25 passed (25)
   Start at  09:29:38
   Duration  2.07s (transform 142ms, setup 0ms, import 382ms, tests 534ms, environment 1ms)

Running batch 14/16: tests\referral-credit-refund-lifecycle.test.ts, tests\referral-credit-wallet-lifecycle.test.ts, tests\release-mode.test.ts, tests\release-proxy.test.ts, tests\security.test.ts, tests\segments-empty-state.test.ts

 RUN  v4.1.7 C:/Users/eden/Downloads/AI/ig-auto-reply-manychat

········stdout | tests/referral-credit-refund-lifecycle.test.ts
◇ injected env (58) from .env.local // tip: ⌘ multiple files { path: ['.env.local', '.env'] }
◇ injected env (0) from .env // tip: ⌘ override existing { override: true }

··stdout | tests/referral-credit-wallet-lifecycle.test.ts
◇ injected env (58) from .env.local // tip: ⌘ multiple files { path: ['.env.local', '.env'] }
◇ injected env (0) from .env // tip: ⌘ suppress logs { quiet: true }

··············

 Test Files  6 passed (6)
      Tests  24 passed (24)
   Start at  09:29:41
   Duration  3.69s (transform 209ms, setup 0ms, import 797ms, tests 1.53s, environment 1ms)

Running batch 15/16: tests\segments-light-theme.test.ts, tests\segments.test.ts, tests\sequences-form-state.test.ts, tests\sequences-jobs.test.ts, tests\signup-light-theme.test.ts, tests\tenant-isolation-routes.test.ts

 RUN  v4.1.7 C:/Users/eden/Downloads/AI/ig-auto-reply-manychat

························

 Test Files  6 passed (6)
      Tests  24 passed (24)
   Start at  09:29:45
   Duration  7.23s (transform 336ms, setup 0ms, import 1.44s, tests 4.33s, environment 1ms)

Running batch 16/16: tests\wallet-light-theme.test.ts, tests\webhook-security.test.ts

 RUN  v4.1.7 C:/Users/eden/Downloads/AI/ig-auto-reply-manychat

·····

 Test Files  2 passed (2)
      Tests  5 passed (5)
   Start at  09:29:53
   Duration  840ms (transform 52ms, setup 0ms, import 102ms, tests 11ms, environment 0ms)


```
### stderr
```text
Loaded Prisma config from prisma.config.ts.

Prisma config detected, skipping environment variable loading.
stderr | tests/meta-webhook.test.ts > Meta webhook > rejects Meta webhook requests with an invalid signature
[audit] failed to record event TypeError: Cannot read properties of undefined (reading 'create')
    at recordAuditEvent (C:/Users/eden/Downloads/AI/ig-auto-reply-manychat/src/lib/audit.ts:28:19)
    at Module.POST (C:/Users/eden/Downloads/AI/ig-auto-reply-manychat/src/app/api/webhooks/meta/route.ts:75:11)
    at processTicksAndRejections (node:internal/process/task_queues:103:5)
    at C:/Users/eden/Downloads/AI/ig-auto-reply-manychat/tests/meta-webhook.test.ts:99:22
    at file:///C:/Users/eden/Downloads/AI/ig-auto-reply-manychat/node_modules/@vitest/runner/dist/chunk-artifact.js:1903:20


```
## `npm run test:e2e:reviewer`
- exit: `0`
### stdout
```text

> inboxpilot@0.1.0 test:e2e:reviewer
> npm run e2e:reviewer:ensure && playwright test tests/e2e/meta-reviewer-rehearsal.spec.ts --workers=1


> inboxpilot@0.1.0 e2e:reviewer:ensure
> tsx scripts/ensure-reviewer-demo-data.ts

◇ injected env (58) from .env.local // tip: ⌁ auth for agents [www.vestauth.com]
◇ injected env (0) from .env // tip: ⌘ override existing { override: true }
[ensure-reviewer-demo-data] reviewer-safe local demo data is ready.

Running 2 tests using 1 worker

  ok 1 [chromium] › tests\e2e\meta-reviewer-rehearsal.spec.ts:41:7 › meta reviewer-safe rehearsal smoke › walks reviewer-safe dashboard, channels, inbox, contacts, and automations flows (7.9s)
  ok 2 [mobile-chrome] › tests\e2e\meta-reviewer-rehearsal.spec.ts:41:7 › meta reviewer-safe rehearsal smoke › walks reviewer-safe dashboard, channels, inbox, contacts, and automations flows (6.2s)

  2 passed (17.2s)

```
### stderr
```text
(node:20560) Warning: The 'NO_COLOR' env is ignored due to the 'FORCE_COLOR' env being set.
(Use `node --trace-warnings ...` to show where the warning was created)
(node:20560) Warning: The 'NO_COLOR' env is ignored due to the 'FORCE_COLOR' env being set.
(Use `node --trace-warnings ...` to show where the warning was created)
(node:18644) Warning: The 'NO_COLOR' env is ignored due to the 'FORCE_COLOR' env being set.
(Use `node --trace-warnings ...` to show where the warning was created)
(node:18644) Warning: The 'NO_COLOR' env is ignored due to the 'FORCE_COLOR' env being set.
(Use `node --trace-warnings ...` to show where the warning was created)

```
