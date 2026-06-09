<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes -- APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# InboxPilot Codex Working Rules

本專案是 InboxPilot，一個類似 ManyChat 的中文化 Instagram 訊息營運 SaaS 工具。所有開發都必須以「可上線、可維運、可收費、可通過平台審核」為標準。

## 每次任務開始前必讀

請先閱讀：

- `AGENTS.md`
- `README.md`
- `docs/project-launch-checklist.md`
- `docs/product-readiness-review.md`
- `docs/security-review.md`
- `docs/meta-app-review-checklist.md`
- `docs/billing-affiliate-readiness.md`
- `docs/fix-roadmap.md`
- `docs/codex-session-log.md`

如果文件不存在，先建立基本版本，不要忽略。

## 每次修改原則

1. 優先小範圍修改。
2. 不要大重構，除非任務明確要求。
3. 不要破壞既有成功流程。
4. 涉及 OAuth、Webhook、Payment、Subscription、Affiliate、Database schema、Security 的修改，必須先列出風險。
5. 不得把 token、secret、authorization code、API key 寫入前端、URL、console、log、audit 或文件。
6. 所有高風險 API 必須考慮 auth、tenant isolation、rate limit、CSRF / Origin 驗證。
7. 所有 Prisma query 必須檢查 workspace / tenant 限制。
8. 所有 Webhook 必須檢查 signature、idempotency、重送保護。
9. 所有付款通知必須檢查簽章與 idempotency。
10. 涉及 Meta / Instagram 權限時，必須說明是否需要 App Review。

## 每次任務完成後必更新

- `docs/codex-session-log.md`
- `docs/fix-roadmap.md`

如果有改 Meta / Instagram：

- `docs/meta-app-review-checklist.md`

如果有改 Billing / Affiliate：

- `docs/billing-affiliate-readiness.md`

如果有改 Security：

- `docs/security-review.md`

如果有改產品狀態：

- `docs/product-readiness-review.md`
- `docs/project-launch-checklist.md`

## 每次回報格式

請用以下格式回報：

1. 本次任務目標
2. 修改檔案
3. 修改內容
4. 驗證指令與結果
5. 是否影響上線狀態
6. 是否新增風險
7. 文件更新清單
8. 下一個建議 Codex Prompt

## 驗證標準

一般修改至少執行：

- `npm run lint`
- `npm run build`
- `npm test`

涉及 UI / onboarding：

- `npm run test:e2e`

涉及付款：

- `npm run payuni:smoke`

涉及高併發 / worker：

- `npm run load:test`

如果無法執行，必須說明原因。
