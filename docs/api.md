# API 文件

這份文件整理 InboxPilot 目前對外可用的核心路由。

## Auth

| Method | Path | 說明 |
| --- | --- | --- |
| `POST` | `/api/auth/login` | Email / password 登入 |
| `POST` | `/api/auth/logout` | 登出 |
| `POST` | `/api/auth/signup` | 建立帳號 |
| `GET` | `/api/auth/google/start` | Google OAuth start |
| `GET` | `/api/auth/google/callback` | Google OAuth callback |

## Social Login OAuth Popup

| Method | Path | 說明 |
| --- | --- | --- |
| `GET` | `/api/oauth/meta-instagram/authorize` | Meta Instagram popup start。主 UI 會帶 `fresh_login=1`，先要求 Instagram 重新登入 |
| `GET` | `/api/oauth/meta-instagram/callback` | Meta Instagram callback |
| `GET` | `/api/oauth/meta-facebook/authorize` | Meta Facebook popup start |
| `GET` | `/api/oauth/meta-facebook/callback` | Meta Facebook callback |
| `GET` | `/api/oauth/telegram-bot/authorize` | Telegram Bot token popup start |
| `GET` | `/api/oauth/telegram-bot/callback` | Telegram Bot token callback |
| `GET` | `/api/oauth/mock/authorize` | Mock provider popup start |
| `GET` | `/api/oauth/mock/callback` | Mock provider callback |
| `POST` | `/api/oauth/:provider/token` | token exchange / 儲存 |

## Channels / Contacts / Automations

| Method | Path | 說明 |
| --- | --- | --- |
| `GET` | `/api/channels` | 列出 channels |
| `PATCH` | `/api/channels/[id]` | 更新 channel |
| `DELETE` | `/api/channels/[id]` | 刪除 channel |
| `POST` | `/api/channels/[id]/instagram-profile/refresh` | 刷新 Instagram profile |
| `GET` | `/api/contacts` | 搜尋聯絡人 |
| `GET` | `/api/conversations` | 列出對話 |
| `GET` / `POST` | `/api/tags` | 標籤管理 |
| `GET` / `POST` | `/api/segments` | 分眾管理 |
| `GET` / `POST` | `/api/automations` | 自動化管理 |
| `GET` / `POST` | `/api/sequences` | 序列管理 |
| `GET` / `POST` | `/api/broadcasts` | 廣播管理 |

## Webhooks / Billing / AI

| Method | Path | 說明 |
| --- | --- | --- |
| `GET` / `POST` | `/api/webhooks/meta` | Meta webhook |
| `POST` | `/api/webhooks/telegram` | Telegram webhook |
| `GET` / `POST` | `/api/webhooks/whatsapp` | WhatsApp webhook |
| `POST` | `/api/billing/payuni/checkout` | PayUNI checkout |
| `GET` / `POST` | `/api/billing/payuni/return` | PayUNI return |
| `POST` | `/api/billing/payuni/notify` | PayUNI notify |
| `GET` / `PUT` / `POST` | `/api/ai-settings` | AI 設定 |
| `GET` | `/api/ai-models` | 可用模型 |
| `POST` | `/api/ai-models/refresh` | 刷新模型快取 |

## 回應格式

一般錯誤回應：

```json
{ "error": "錯誤訊息" }
```

常見狀態碼：

- `400`：請求格式錯誤
- `401`：未登入
- `403`：無權限
- `404`：找不到資源
- `500`：伺服器錯誤
