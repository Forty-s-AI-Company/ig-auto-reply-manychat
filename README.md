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

## AI Release Autopilot

AI 文件與舊 AI_TEAM runner 已重整成最小 source of truth。

Active AI 文件：

- [AGENTS.md](./AGENTS.md)
- [AI Source Of Truth](./docs/AI_SOURCE_OF_TRUTH.md)
- [AI Release Control](./docs/AI_RELEASE_CONTROL.md)
- [AI Team Autopilot](./docs/AI_TEAM_AUTOPILOT.md)

唯一 autopilot 入口：

```bash
python scripts/ai_release_autopilot.py --mode status
python scripts/ai_release_autopilot.py --mode inventory
python scripts/ai_release_autopilot.py --mode docs-check
python scripts/ai_release_autopilot.py --mode run-once --profile local-aggressive
```

舊 AI_TEAM 文件與 runner 已封存：

- `docs/archive/ai-legacy-2026-07-04/`
- `.ai-team/archive/automation-legacy-2026-07-04/`

舊 runtime / report / queue / prompt 只能當歷史參考，不再是 source of truth。

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
