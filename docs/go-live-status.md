# InboxPilot 上線狀態表

以下是目前專案依程式、測試與文件整理出的實際狀態。

判定說明：

- `✅` 已完成，且目前可正常使用
- `⚠️` 已做出來，但正式上線前還需要補強或人工確認
- `❌` 目前不建議納入第一階段上線承諾

## 核心功能

| 狀態 | 項目 | 判定 |
|---|---|---|
| ✅ | 登入 / 工作區 / 角色基礎 | 已有登入流程、workspace scope、admin/operator 權限基礎。 |
| ✅ | Inbox | 可看對話、發訊息、標記已讀、內部備註。 |
| ✅ | Contacts / Tags | 聯絡人與標籤 CRUD 已可用。 |
| ✅ | 自訂欄位 | 已可建立欄位定義並儲存聯絡人欄位值。 |
| ✅ | Automations | keyword / new_contact / manual / webhook triggers 已有。 |
| ✅ | Sequences | 已可建立、編輯、訂閱、排程序列。 |
| ✅ | Broadcasts | 已可建立、排程、預覽收件人。 |
| ✅ | Email SMTP | 已接好 outbound SMTP。 |
| ✅ | Telegram | 已接好 outbound Bot API。 |
| ✅ | Worker / queue | 有 DB fallback 與 Redis/BullMQ 基礎。 |
| ✅ | AI FAQ | 已有多 provider 與 fallback。 |

## Instagram / Messenger

| 狀態 | 項目 | 判定 |
|---|---|---|
| ✅ | OAuth / webhook / comment / DM 主流程 | 程式面已存在。 |
| ⚠️ | 正式可用權限 | 需要 Meta App Review / Advanced Access / 實際授權。 |
| ⚠️ | Business Verification | 不一定每個測試情境都要，但正式商用很常需要。 |
| ⚠️ | Reviewer demo | 還需要正式網址、乾淨測試帳號與完整 demo。 |

## 安全與營運

| 狀態 | 項目 | 判定 |
|---|---|---|
| ✅ | `AUTH_SECRET` / server-only env 分層 | 已有。 |
| ✅ | Webhook HMAC / secret | 已做出 `AUTOMATION_WEBHOOK_SECRET` 與 Meta webhook signature 檢查。 |
| ✅ | Privacy Policy / Terms / Data Deletion 路由 | 已有頁面與 callback。 |
| ⚠️ | 正式內容確認 | 需要你到正式 domain 再檢查一次內容與連結。 |
| ⚠️ | 監控 / 告警 | 目前只有 console / log 基礎，正式上線前建議加 Sentry 或等效方案。 |
| ⚠️ | Redis / worker 正式部署 | 代碼準備好了，但正式環境還要實際部署與驗證。 |
| ⚠️ | 備份 / rollback | 文件有 runbook，但正式環境仍要落地執行。 |

## 效能與容量

| 狀態 | 項目 | 判定 |
|---|---|---|
| ✅ | 小量流量功能驗證 | 已通過 lint / test / build。 |
| ⚠️ | 1000-user 壓測結論 | 文件已明確指出目前不能宣稱可承受 1000 人同時在線。 |
| ❌ | 大規模公開商用承諾 | 目前不建議直接宣稱已可支撐大流量公開 SaaS。 |

## 適合延後的功能

| 狀態 | 項目 | 判定 |
|---|---|---|
| ❌ | WhatsApp 正式 template / session policy mapping | 可留到第二階段。 |
| ❌ | TikTok 正式 provider | 可留到第二階段。 |
| ❌ | SMS provider | 可留到第二階段。 |
| ❌ | Broadcast 退訂中心 / 審核流程 / 節流 UI | 可留到第二階段。 |
| ❌ | Conversation assignment / 搜尋 / 分頁 / team roles | 可留到第二階段。 |
| ❌ | 更完整 billing / affiliate / payout | 可留到第二階段。 |
| ❌ | 更完整 observability 與大流量優化 | 可留到第二階段。 |

## 結論

目前狀態比較像：

- `可以做 private beta / 小規模正式客戶上線`
- `不適合直接宣稱成可公開大規模商用 SaaS`

如果你現在要推進，第一階段只需要補齊：

1. 正式網址與環境變數
2. Redis / worker 的正式部署
3. Meta App Review / 授權與 reviewer demo
4. 正式監控與 rollback 流程

