# InboxPilot

InboxPilot 是一個以 Instagram / Meta 為核心的 SaaS 後台，使用 Next.js App Router、React、TypeScript、Prisma、PostgreSQL 與 Vercel 建置。

## 目前重點

- Social Login OAuth Popup 模組
- Meta Login（Facebook / Instagram）
- Telegram Bot token 流程
- Mock OAuth Provider（本機測試）
- ConnectedAccount 與 Instagram channel 同步
- Inbox / Contacts / Automations / Broadcasts / Sequences

## 新版 OAuth 架構

對外登入統一走這套流程：

1. 使用者點擊 `Connect Account`
2. 桌機開 popup；手機改成同頁導轉
3. 進入 `/api/oauth/:provider/authorize`
4. provider 完成登入後回到 callback
5. callback 完成 token exchange
6. 伺服器安全儲存 token
7. 桌機用 `postMessage` 回主視窗；手機直接 redirect 回 Social Accounts
8. UI 更新連線狀態

### 支援 provider

- `meta-instagram`
- `meta-facebook`
- `telegram-bot`
- `mock`

### 對外頁面

- `/channels/connect/social`
- `/api/oauth/:provider/authorize`
- `/api/oauth/:provider/callback`
- `/api/oauth/:provider/token`

## 安裝

```bash
npm install
cp .env.example .env.local
npm run prisma:migrate
npm run prisma:seed
npm run dev
```

開發站預設：

```text
http://localhost:3041
```

## 常用指令

```bash
npm run dev
npm run build
npm run start
npm run lint
npm test
npm run test:unit
npm run test:e2e
```

## AI_TEAM

舊的 root autopilot 入口已退場。現在請以 [AI_TEAM/README.md](./AI_TEAM/README.md) 作為無人值守開發與 QA 的總控文件。

AI_TEAM 的重點是：

- 文件先行，不把流程藏在單一 runner 裡
- 角色分工清楚
- 每輪都會留下報告與下一輪 prompt
- 高風險動作先停下來做人工作業確認

如果你只是想開始下一輪工作，先讀：

- [AI_TEAM/PROJECT_STATE.md](./AI_TEAM/PROJECT_STATE.md)
- [AI_TEAM/LAUNCH_CRITERIA.md](./AI_TEAM/LAUNCH_CRITERIA.md)
- [AI_TEAM/tasks/current-task.md](./AI_TEAM/tasks/current-task.md)
- [AI_TEAM/tasks/backlog.md](./AI_TEAM/tasks/backlog.md)

## 環境變數

最少需要：

```env
APP_URL="https://your-app.example.com"
AUTH_SECRET="replace-with-a-strong-secret"
TOKEN_ENCRYPTION_KEY="replace-with-a-second-strong-secret"
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."
META_APP_ID=""
META_APP_SECRET=""
META_INSTAGRAM_APP_ID=""
META_INSTAGRAM_APP_SECRET=""
TELEGRAM_BOT_TOKEN=""
```

## 開發說明

- `TOKEN_ENCRYPTION_KEY` 用來加密資料庫中的 access token。
- OAuth state 會用 httpOnly cookie 保存，callback 會驗證 state 與 provider。
- `mock` provider 只用於本機測試 popup 流程，不會取代真實 OAuth 安全流程。
- 舊的 Meta 相容 callback 只保留給後端相容，不建議再放進文件或 UI。

## 目錄概覽

```text
src/app        Next.js pages and API routes
src/components Shared UI/client components
src/lib        Domain logic, auth, providers, billing, jobs
prisma         Prisma schema and migrations
scripts        Worker, seed/admin helpers, smoke tests
tests          Unit, integration, E2E tests
docs           Product, ops, security and API docs
```

## 文件

- [安裝](./docs/installation.md)
- [部署](./docs/deployment.md)
- [環境變數](./docs/environment-variables.md)
- [API 文件](./docs/api.md)
- [ERD](./docs/erd.md)
- [PayUNI Production SOP](./docs/payuni-production-sop.md)
- [Codex Windows Setup](./docs/codex-windows-setup.md)

## AI Local CLI Opt-in

- `codex_cli` and `antigravity_cli` are local CLI providers.
- They are opt-in only and are not part of the default shared SaaS / cron refresh flow.
- Leave `AI_ENABLE_LOCAL_CLI` unset in shared environments unless the machine actually has the CLI installed and authenticated.
- `antigravity_cli` currently resolves through the local `agy.exe` binary when no explicit command override is set.
