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

## Autopilot

本專案提供無人值守自動化入口，用來在睡覺或離開電腦時自動推進 preview / staging readiness：

```bash
npm run autopilot
```

Windows 也可以直接執行：

```powershell
.\run-autopilot.ps1
```

Autopilot 會跑 Codex 修復迴圈、lint / test / build、PayUNI sandbox smoke、Vercel Preview readiness、Supabase readiness、route smoke、QA / safety report。缺少登入、secret、OTP、外部 dashboard 權限時會寫到 `reports/human-required.md`，不會把 secret 輸出到報告。

安全邊界：

- PayUNI 維持 sandbox，不會切 production。
- 不登入 Meta、不送 App Review。
- 不碰 production DB/schema。
- Production deploy 預設禁用。

詳細規則見 [AUTOPILOT.md](./AUTOPILOT.md) 與 [docs/autopilot-code-review.md](./docs/autopilot-code-review.md)。

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
