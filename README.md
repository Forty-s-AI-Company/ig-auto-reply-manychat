# InboxPilot

InboxPilot 是一個以 Instagram / Meta 為核心的訊息自動化與 Inbox 工作台，技術棧以 Next.js App Router、React、TypeScript、Prisma 與 Vercel 為主。

## 主要功能

- Dashboard / Analytics
- Inbox / Contacts / Tags / Segments
- Automations / Broadcasts / Sequences
- Meta / Instagram / Telegram 等渠道連接
- Google 登入、Email 登入
- PayUNI 訂閱與計費

## 技術棧

- Next.js 16
- React 19
- TypeScript
- Prisma 6
- PostgreSQL / Supabase
- Tailwind CSS 4
- Vitest / Playwright

## 本機開發

```bash
npm install
cp .env.example .env
npm run prisma:migrate
npm run prisma:seed
npm run dev
```

預設開發網址：

```text
http://localhost:3041
```

## 常用指令

```bash
npm run dev
npm run build
npm run start
npm run worker
npm run lint
npm test
npm run test:unit
npm run test:e2e
```

## 專案結構

```text
src/app        Next.js pages and API routes
src/components Shared UI/client components
src/lib        Domain logic, auth, providers, billing, jobs
prisma         Prisma schema and migrations
scripts        Worker, seed/admin helpers, smoke tests
tests          Unit, integration, E2E tests
docs           Product, ops, security and API docs
```

## Social Login OAuth Popup 模組

專案現在提供一套可重用的社群帳號連接模組，入口如下：

- `/channels/connect/social`
- `/api/oauth/:provider/authorize`
- `/api/oauth/:provider/callback`
- `/api/oauth/:provider/token`

目前支援的 provider：

- `meta-instagram`
- `meta-facebook`
- `telegram-bot`
- `mock`

### 流程

1. 主視窗點 `Connect Account`
2. 開 popup 視窗
3. popup 導向 OAuth provider 或 token 表單
4. callback 完成 code exchange / token validate
5. server 將 token 加密後寫入 `ConnectedAccount`
6. Meta provider 會同步建立 / 更新既有 `instagram` channel
7. callback bridge 用 `postMessage` 把結果傳回主視窗
8. 主視窗 refresh 顯示 connected state

### 必要環境變數

```env
APP_URL="https://your-app.example.com"
AUTH_SECRET="replace-with-a-strong-secret"
TOKEN_ENCRYPTION_KEY="replace-with-a-second-strong-secret"

META_APP_ID=""
META_APP_SECRET=""
META_INSTAGRAM_APP_ID=""
META_INSTAGRAM_APP_SECRET=""
```

### OAuth Callback URL

如果你使用新的 generic OAuth popup 模組，provider 後台要加這些 callback URL：

```text
https://your-app.example.com/api/oauth/meta-instagram/callback
https://your-app.example.com/api/oauth/meta-facebook/callback
```

### 開發建議

- 本機測試 popup 流程時，優先用 `mock` provider。
- Telegram Bot provider 不是 redirect OAuth，而是 token provider。popup 內貼上 BotFather token 後，server 會先打 `getMe` 驗證，再儲存。
- 正式環境請務必設定 `TOKEN_ENCRYPTION_KEY`，不要只靠預設 local secret。
- `/channels/connect/social` 提供 `重新同步 Channel` 按鈕，可用既有 `ConnectedAccount` 的 token 再跑一次 Meta channel 同步，不必重新登入。

## 安全注意事項

- 所有 access token / refresh token 都只存 server 端，並以加密字串落資料庫。
- OAuth state 使用 httpOnly cookie 保護，callback 會檢查 state 與 provider 是否一致。
- `.env`、`.env.local`、個人 `.codex/` 狀態不得提交進 Git。

## 文件

- [安裝說明](./docs/installation.md)
- [部署說明](./docs/deployment.md)
- [環境變數](./docs/environment-variables.md)
- [API 文件](./docs/api.md)
- [ERD](./docs/erd.md)
- [Codex Windows Setup](./docs/codex-windows-setup.md)
