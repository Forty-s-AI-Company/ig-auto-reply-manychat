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
EPERM: operation not permitted, rename 'C:\Users\eden\Downloads\AI\ig-auto-reply-manychat\node_modules\.prisma\client\query_engine-windows.dll.node.tmp12036' -> 'C:\Users\eden\Downloads\AI\ig-auto-reply-manychat\node_modules\.prisma\client\query_engine-windows.dll.node'


[prisma-generate-safe] Prisma engine is locked by a local Node process; reusing existing generated client.

```
## `npm test`
- exit: `0`
### stdout
```text
333ms, tests 294ms, environment 3ms)

Running batch 12/16: tests\meta-webhook.test.ts, tests\mock-tester-light-theme.test.ts, tests\mock-webhook-flow.test.ts, tests\mock-webhook-route.test.ts, tests\oauth-popup-bridge.test.ts, tests\official-landing-channel-scope.test.ts

 RUN  v4.1.7 C:/Users/eden/Downloads/AI/ig-auto-reply-manychat

················

 Test Files  6 passed (6)
      Tests  16 passed (16)
   Start at  11:26:20
   Duration  4.55s (transform 301ms, setup 0ms, import 1.26s, tests 1.70s, environment 3ms)

Running batch 13/16: tests\official-v3-footer-links.test.ts, tests\payuni-billing.test.ts, tests\pricing-page-polish.test.ts, tests\profile-menu-ia.test.ts, tests\rate-limit.test.ts, tests\referral-affiliate-docs.test.ts

 RUN  v4.1.7 C:/Users/eden/Downloads/AI/ig-auto-reply-manychat

stdout | tests/payuni-billing.test.ts
◇ injected env (58) from .env.local // tip: ⌘ multiple files { path: ['.env.local', '.env'] }
◇ injected env (0) from .env // tip: ⌘ enable debugging { debug: true }

·······················

 Test Files  6 passed (6)
      Tests  23 passed (23)
   Start at  11:26:25
   Duration  2.31s (transform 160ms, setup 0ms, import 414ms, tests 628ms, environment 1ms)

Running batch 14/16: tests\referral-affiliate-mvp-ui.test.ts, tests\referral-credit-refund-lifecycle.test.ts, tests\referral-credit-wallet-lifecycle.test.ts, tests\release-mode.test.ts, tests\release-proxy.test.ts, tests\security.test.ts

 RUN  v4.1.7 C:/Users/eden/Downloads/AI/ig-auto-reply-manychat

········stdout | tests/referral-credit-refund-lifecycle.test.ts
◇ injected env (58) from .env.local // tip: ⌘ multiple files { path: ['.env.local', '.env'] }
◇ injected env (0) from .env // tip: ⌘ custom filepath { path: '/custom/path/.env' }

··stdout | tests/referral-credit-wallet-lifecycle.test.ts
◇ injected env (58) from .env.local // tip: ◈ secrets for agents [www.dotenvx.com]
◇ injected env (0) from .env // tip: ⌘ enable debugging { debug: true }

·················

 Test Files  6 passed (6)
      Tests  27 passed (27)
   Start at  11:26:28
   Duration  3.77s (transform 263ms, setup 0ms, import 980ms, tests 1.38s, environment 1ms)

Running batch 15/16: tests\segments-empty-state.test.ts, tests\segments-light-theme.test.ts, tests\segments.test.ts, tests\sequences-form-state.test.ts, tests\sequences-jobs.test.ts, tests\signup-light-theme.test.ts

 RUN  v4.1.7 C:/Users/eden/Downloads/AI/ig-auto-reply-manychat

···········

 Test Files  6 passed (6)
      Tests  11 passed (11)
   Start at  11:26:32
   Duration  7.18s (transform 300ms, setup 0ms, import 1.30s, tests 4.24s, environment 1ms)

Running batch 16/16: tests\tenant-isolation-routes.test.ts, tests\wallet-light-theme.test.ts, tests\webhook-security.test.ts

 RUN  v4.1.7 C:/Users/eden/Downloads/AI/ig-auto-reply-manychat

···················

 Test Files  3 passed (3)
      Tests  19 passed (19)
   Start at  11:26:40
   Duration  1.52s (transform 216ms, setup 0ms, import 617ms, tests 49ms, environment 1ms)


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
- exit: `1`
### stdout
```text
= await page.request.post("/api/auth/login", {
         |                                       ^
      16 |     data: { email: reviewerEmail, password: reviewerPassword },
      17 |     headers: {
      18 |       origin: "http://127.0.0.1:3041",
        at loginAsReviewer (C:\Users\eden\Downloads\AI\ig-auto-reply-manychat\tests\e2e\meta-reviewer-rehearsal.spec.ts:15:39)
        at C:\Users\eden\Downloads\AI\ig-auto-reply-manychat\tests\e2e\meta-reviewer-rehearsal.spec.ts:38:11

    Error Context: test-results\meta-reviewer-rehearsal-me-cdd51-tacts-and-automations-flows-chromium\error-context.md

  2) [mobile-chrome] › tests\e2e\meta-reviewer-rehearsal.spec.ts:41:7 › meta reviewer-safe rehearsal smoke › walks reviewer-safe dashboard, channels, inbox, contacts, and automations flows 

    [31mTest timeout of 60000ms exceeded while running "beforeEach" hook.[39m

      35 |   test.skip(guard.shouldSkip, guard.reason);
      36 |
    > 37 |   test.beforeEach(async ({ page }, testInfo) => {
         |        ^
      38 |     await loginAsReviewer(page, testInfo);
      39 |   });
      40 |
        at C:\Users\eden\Downloads\AI\ig-auto-reply-manychat\tests\e2e\meta-reviewer-rehearsal.spec.ts:37:8

    Error: apiRequestContext.post: Target page, context or browser has been closed
    Call log:
    [2m  - → POST http://127.0.0.1:3041/api/auth/login[22m
    [2m    - user-agent: Mozilla/5.0 (Linux; Android 11; Pixel 5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.7778.96 Mobile Safari/537.36[22m
    [2m    - accept: */*[22m
    [2m    - accept-encoding: gzip,deflate,br[22m
    [2m    - origin: http://127.0.0.1:3041[22m
    [2m    - x-forwarded-for: reviewer-rehearsal-1783135667176-jjr7xpjz1y-mobile-chrome-1-0-734619e04167d4895d13-0f64ab1ff3a19497b489[22m
    [2m    - content-type: application/json[22m
    [2m    - content-length: 67[22m


      13 |
      14 | async function loginAsReviewer(page: Page, testInfo: TestInfo) {
    > 15 |   const response = await page.request.post("/api/auth/login", {
         |                                       ^
      16 |     data: { email: reviewerEmail, password: reviewerPassword },
      17 |     headers: {
      18 |       origin: "http://127.0.0.1:3041",
        at loginAsReviewer (C:\Users\eden\Downloads\AI\ig-auto-reply-manychat\tests\e2e\meta-reviewer-rehearsal.spec.ts:15:39)
        at C:\Users\eden\Downloads\AI\ig-auto-reply-manychat\tests\e2e\meta-reviewer-rehearsal.spec.ts:38:11

    Error Context: test-results\meta-reviewer-rehearsal-me-cdd51-tacts-and-automations-flows-mobile-chrome\error-context.md

  2 failed
    [chromium] › tests\e2e\meta-reviewer-rehearsal.spec.ts:41:7 › meta reviewer-safe rehearsal smoke › walks reviewer-safe dashboard, channels, inbox, contacts, and automations flows 
    [mobile-chrome] › tests\e2e\meta-reviewer-rehearsal.spec.ts:41:7 › meta reviewer-safe rehearsal smoke › walks reviewer-safe dashboard, channels, inbox, contacts, and automations flows 

```
### stderr
```text
(node:2324) Warning: The 'NO_COLOR' env is ignored due to the 'FORCE_COLOR' env being set.
(Use `node --trace-warnings ...` to show where the warning was created)
(node:2324) Warning: The 'NO_COLOR' env is ignored due to the 'FORCE_COLOR' env being set.
(Use `node --trace-warnings ...` to show where the warning was created)
(node:22300) Warning: The 'NO_COLOR' env is ignored due to the 'FORCE_COLOR' env being set.
(Use `node --trace-warnings ...` to show where the warning was created)
(node:22300) Warning: The 'NO_COLOR' env is ignored due to the 'FORCE_COLOR' env being set.
(Use `node --trace-warnings ...` to show where the warning was created)

```
