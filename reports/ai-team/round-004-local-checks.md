# Round 004 Local Checks

## `npm run lint`
- exit: `0`
## `npm run build`
- exit: `0`
```text
Loaded Prisma config from prisma.config.ts.

Prisma config detected, skipping environment variable loading.
Error: 
EPERM: operation not permitted, rename 'C:\Users\eden\Downloads\AI\ig-auto-reply-manychat\node_modules\.prisma\client\query_engine-windows.dll.node.tmp5052' -> 'C:\Users\eden\Downloads\AI\ig-auto-reply-manychat\node_modules\.prisma\client\query_engine-windows.dll.node'


[prisma-generate-safe] Prisma engine is locked by a local Node process; reusing existing generated client.

```
## `npm test`
- exit: `0`
```text
Loaded Prisma config from prisma.config.ts.

Prisma config detected, skipping environment variable loading.
Vitest crashed while running a multi-file batch with exit 3221225477. Re-running files one by one to isolate the trigger.
Diagnostic rerun: tests\analytics-message-trend.test.ts
Diagnostic rerun: tests\analytics-state.test.ts
Diagnostic rerun: tests\authenticated-route-smoke-guard.test.ts
Diagnostic rerun: tests\automation-comment-condition.test.ts
Diagnostic rerun: tests\automation-condition.test.ts
Diagnostic rerun: tests\automation-disabled-ux.test.ts
Vitest batch crashed with Windows access violation exit 3221225477, but every file passed when rerun individually. Continuing after confirming this is batch-level runner instability: tests\analytics-message-trend.test.ts, tests\analytics-state.test.ts, tests\authenticated-route-smoke-guard.test.ts, tests\automation-comment-condition.test.ts, tests\automation-condition.test.ts, tests\automation-disabled-ux.test.ts
stderr | tests/meta-webhook.test.ts > Meta webhook > rejects Meta webhook requests with an invalid signature
[audit] failed to record event TypeError: Cannot read properties of undefined (reading 'create')
    at recordAuditEvent (C:/Users/eden/Downloads/AI/ig-auto-reply-manychat/src/lib/audit.ts:28:19)
    at Module.POST (C:/Users/eden/Downloads/AI/ig-auto-reply-manychat/src/app/api/webhooks/meta/route.ts:75:11)
    at processTicksAndRejections (node:internal/process/task_queues:103:5)
    at C:/Users/eden/Downloads/AI/ig-auto-reply-manychat/tests/meta-webhook.test.ts:99:22
    at file:///C:/Users/eden/Downloads/AI/ig-auto-reply-manychat/node_modules/@vitest/runner/dist/chunk-artifact.js:1903:20


```
