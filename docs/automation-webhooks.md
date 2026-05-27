# Automation Webhook HMAC

`/api/automation-webhooks/[key]` 可以讓外部系統觸發 `triggerType=webhook` 的 automation。

若 `.env` 有設定 `AUTOMATION_WEBHOOK_SECRET`，每個請求都必須帶：

```http
x-inboxpilot-signature: sha256=<hex hmac>
```

簽名內容是「原始 request body」的 HMAC-SHA256。Node.js 範例：

```js
import { createHmac } from "crypto";

const body = JSON.stringify({ externalId: "user-1", text: "hello" });
const signature = createHmac("sha256", process.env.AUTOMATION_WEBHOOK_SECRET)
  .update(body)
  .digest("hex");

await fetch("https://your-domain.com/api/automation-webhooks/<key>", {
  method: "POST",
  headers: {
    "content-type": "application/json",
    "x-inboxpilot-signature": `sha256=${signature}`,
  },
  body,
});
```

若 `AUTOMATION_WEBHOOK_SECRET` 留空，系統會允許未簽名請求。正式環境建議一定要設定，避免外部 automation webhook 被任意觸發。
