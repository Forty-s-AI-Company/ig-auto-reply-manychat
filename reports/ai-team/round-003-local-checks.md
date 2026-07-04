# Round 003 Local Checks

## `npm run lint`
- exit: `0`
## `npm run build`
- exit: `0`
```text
Loaded Prisma config from prisma.config.ts.

Prisma config detected, skipping environment variable loading.
Error: 
EPERM: operation not permitted, rename 'C:\Users\eden\Downloads\AI\ig-auto-reply-manychat\node_modules\.prisma\client\query_engine-windows.dll.node.tmp19240' -> 'C:\Users\eden\Downloads\AI\ig-auto-reply-manychat\node_modules\.prisma\client\query_engine-windows.dll.node'


[prisma-generate-safe] Prisma engine is locked by a local Node process; reusing existing generated client.

```
## `npm test`
- exit: `0`
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
