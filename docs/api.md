# API 文件

本文件依目前 `src/app/api` route handlers 產生。除 webhook、OAuth callback、PayUNI callback、cron 等外部入口外，多數 API 都需要登入 session。

## Auth

| Method | Path                        | 說明                                            |
| ------ | --------------------------- | ----------------------------------------------- |
| `POST` | `/api/auth/login`           | 使用 email/password 登入並設定 session cookie。 |
| `POST` | `/api/auth/logout`          | 清除 session cookie。                           |
| `POST` | `/api/auth/signup`          | 建立使用者與工作區。                            |
| `GET`  | `/api/auth/google/start`    | 開始 Google OAuth。                             |
| `GET`  | `/api/auth/google/callback` | Google OAuth callback。                         |

## Workspace / Account Scope

| Method | Path                   | 說明                               |
| ------ | ---------------------- | ---------------------------------- |
| `POST` | `/api/workspace-scope` | 切換目前 workspace。               |
| `POST` | `/api/account-scope`   | 切換目前 Instagram account scope。 |

## Dashboard

| Method | Path             | 說明                            |
| ------ | ---------------- | ------------------------------- |
| `GET`  | `/api/dashboard` | 取得 dashboard KPI 與最近訊息。 |

## Channels

| Method   | Path                                           | 說明                         |
| -------- | ---------------------------------------------- | ---------------------------- |
| `GET`    | `/api/channels`                                | 列出 channels。              |
| `PATCH`  | `/api/channels/[id]`                           | 更新 channel。               |
| `DELETE` | `/api/channels/[id]`                           | 刪除/斷開 channel。          |
| `POST`   | `/api/channels/[id]/instagram-profile/refresh` | 重新讀取 Instagram profile。 |

## Contacts / Conversations

| Method            | Path                               | 說明                                        |
| ----------------- | ---------------------------------- | ------------------------------------------- |
| `GET`             | `/api/contacts`                    | 查詢聯絡人，可用 `q` 搜尋。                 |
| `GET`             | `/api/contacts/[id]`               | 取得單一聯絡人。                            |
| `GET` / `PUT`     | `/api/contacts/[id]/fields`        | 讀取/更新聯絡人自訂欄位。                   |
| `POST` / `DELETE` | `/api/contacts/[id]/tags`          | 新增/移除聯絡人標籤。                       |
| `GET`             | `/api/conversations`               | 列出對話。                                  |
| `GET` / `PATCH`   | `/api/conversations/[id]`          | 讀取/更新對話狀態、指派、提醒、收藏、已讀。 |
| `POST`            | `/api/conversations/[id]/messages` | 手動送出訊息。                              |
| `POST`            | `/api/conversations/[id]/notes`    | 新增內部備註。                              |

## Tags / Segments / Custom Fields

| Method             | Path                       | 說明                                 |
| ------------------ | -------------------------- | ------------------------------------ |
| `GET` / `POST`     | `/api/tags`                | 列出/建立 tag。                      |
| `PATCH` / `DELETE` | `/api/tags/[id]`           | 更新/刪除 tag。                      |
| `GET` / `POST`     | `/api/segments`            | 列出/建立 segment。                  |
| `PUT` / `DELETE`   | `/api/segments/[id]`       | 更新/刪除 segment。                  |
| `GET` / `POST`     | `/api/contact-fields`      | 列出/建立 contact field definition。 |
| `PUT` / `DELETE`   | `/api/contact-fields/[id]` | 更新/刪除 contact field definition。 |

## Automations

| Method                   | Path                             | 說明                                           |
| ------------------------ | -------------------------------- | ---------------------------------------------- |
| `GET` / `POST`           | `/api/automations`               | 列出/建立 automation。                         |
| `GET` / `PUT` / `DELETE` | `/api/automations/[id]`          | 讀取/更新/刪除 automation。                    |
| `POST`                   | `/api/automations/[id]/run`      | 手動執行 automation。                          |
| `GET` / `POST`           | `/api/automation-folders`        | 列出/建立 automation folder。                  |
| `PUT` / `DELETE`         | `/api/automation-folders/[id]`   | 更新/刪除 automation folder。                  |
| `POST`                   | `/api/automation-webhooks/[key]` | 外部 webhook 觸發 automation。可用 HMAC 保護。 |

## Sequences

| Method           | Path                            | 說明                       |
| ---------------- | ------------------------------- | -------------------------- |
| `GET` / `POST`   | `/api/sequences`                | 列出/建立 sequence。       |
| `PUT` / `DELETE` | `/api/sequences/[id]`           | 更新/刪除 sequence。       |
| `POST`           | `/api/sequences/[id]/subscribe` | 將 contact 加入 sequence。 |

## Broadcasts

| Method             | Path                           | 說明                                |
| ------------------ | ------------------------------ | ----------------------------------- |
| `GET` / `POST`     | `/api/broadcasts`              | 列出/建立 broadcast。               |
| `PATCH` / `DELETE` | `/api/broadcasts/[id]`         | 更新/刪除 broadcast。               |
| `GET`              | `/api/broadcasts/[id]/preview` | 預覽候選人、可發送人數與略過人數。  |
| `POST`             | `/api/broadcasts/[id]/queue`   | 將 broadcast 收件人寫入 job queue。 |

## AI

| Method                 | Path                     | 說明                              |
| ---------------------- | ------------------------ | --------------------------------- |
| `GET` / `PUT` / `POST` | `/api/ai-settings`       | 讀取/更新 AI 設定與 credentials。 |
| `GET`                  | `/api/ai-models`         | 查詢 provider 可用 models。       |
| `POST`                 | `/api/ai-models/refresh` | 刷新 model cache。                |
| `POST`                 | `/api/ai-model-test`     | 測試指定 provider/model。         |

## Knowledge Base

| Method             | Path                       | 說明                  |
| ------------------ | -------------------------- | --------------------- |
| `GET` / `POST`     | `/api/knowledge-base`      | 列出/建立知識庫項目。 |
| `PATCH` / `DELETE` | `/api/knowledge-base/[id]` | 更新/刪除知識庫項目。 |

## Billing / PayUNI / Usage

| Method         | Path                           | 說明                        |
| -------------- | ------------------------------ | --------------------------- |
| `POST`         | `/api/billing/payuni/checkout` | 建立 PayUNI checkout form。 |
| `GET` / `POST` | `/api/billing/payuni/return`   | PayUNI 前景回傳。           |
| `POST`         | `/api/billing/payuni/notify`   | PayUNI 背景通知。           |
| `GET`          | `/api/billing/usage`           | 查詢目前用量。              |

## Referral / Affiliate Admin

| Method         | Path                                          | 說明                     |
| -------------- | --------------------------------------------- | ------------------------ |
| `POST`         | `/api/affiliate/apply`                        | 申請聯盟夥伴。           |
| `GET`          | `/api/admin/affiliates`                       | Admin 列出聯盟申請。     |
| `POST`         | `/api/admin/affiliates/[id]/approve`          | Admin 核准聯盟夥伴。     |
| `POST`         | `/api/admin/affiliates/[id]/reject`           | Admin 拒絕聯盟夥伴。     |
| `POST`         | `/api/admin/affiliates/[id]/suspend`          | Admin 停權聯盟夥伴。     |
| `GET`          | `/api/admin/payouts`                          | Admin 列出提領申請。     |
| `POST`         | `/api/admin/payouts/[id]/approve`             | Admin 核准提領。         |
| `POST`         | `/api/admin/payouts/[id]/reject`              | Admin 拒絕提領。         |
| `GET` / `POST` | `/api/admin/payouts/batches`                  | 列出/建立 payout batch。 |
| `GET`          | `/api/admin/payouts/batches/[id]/export`      | 匯出 payout batch CSV。  |
| `POST`         | `/api/admin/payouts/batches/[id]/mark-paid`   | 標記 batch 已付款。      |
| `POST`         | `/api/admin/payouts/batches/[id]/mark-failed` | 標記 batch 失敗。        |

## External Webhooks / OAuth / Cron

| Method         | Path                                 | 說明                                               |
| -------------- | ------------------------------------ | -------------------------------------------------- |
| `GET` / `POST` | `/api/webhooks/meta`                 | Meta webhook verification 與 event ingestion。     |
| `POST`         | `/api/webhooks/mock`                 | 本機 mock inbound message。                        |
| `POST`         | `/api/webhooks/telegram`             | Telegram webhook。                                 |
| `GET` / `POST` | `/api/webhooks/whatsapp`             | WhatsApp webhook verification 與 event ingestion。 |
| `GET`          | `/api/meta/oauth/start`              | Meta OAuth start。                                 |
| `GET`          | `/api/meta/oauth/callback`           | Meta OAuth callback。                              |
| `GET`          | `/api/instagram/oauth/callback`      | Instagram OAuth callback 相容路徑。                |
| `GET` / `POST` | `/api/meta/data-deletion`            | Meta data deletion callback。                      |
| `GET` / `POST` | `/api/meta/deauthorize`              | Meta deauthorize callback。                        |
| `POST`         | `/api/instagram/comments/sync`       | 同步 Instagram comments。                          |
| `GET`          | `/api/instagram/media`               | 取得 Instagram media。                             |
| `POST`         | `/api/instagram/token/refresh`       | 刷新 Instagram token。                             |
| `GET`          | `/api/cron/refresh-ai-models`        | Cron: refresh AI model cache。                     |
| `GET`          | `/api/cron/refresh-instagram-tokens` | Cron: refresh expiring Instagram tokens。          |

## 錯誤格式

多數 route 使用：

```json
{ "error": "錯誤訊息" }
```

常見 status：

- `400`: request body 或 query 不合法。
- `401`: 未登入。
- `402`: 方案限制或用量限制。
- `403`: 權限不足。
- `404`: 找不到資源或資源不屬於目前 workspace。
