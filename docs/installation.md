# 安裝文件

本文說明如何在本機安裝與啟動 InboxPilot。

## 前置需求

- Node.js 20+
- npm
- PostgreSQL。建議使用 Supabase Postgres 或本機 Postgres。
- 可選：Playwright Chromium，供 E2E 測試使用。

## 安裝步驟

1. 安裝依賴：

```bash
npm install
```

2. 建立環境變數：

```bash
cp .env.example .env
```

Windows PowerShell：

```powershell
Copy-Item .env.example .env
```

3. 編輯 `.env`，至少填入：

```env
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."
AUTH_SECRET="use-a-strong-local-secret"
APP_URL="http://localhost:3041"
ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="change-this-password"
ADMIN_NAME="Admin"
```

4. 建立資料表：

```bash
npm run prisma:migrate
```

5. 建立初始資料：

```bash
npm run prisma:seed
```

如需重建管理員：

```bash
npm run admin:ensure
```

6. 啟動開發伺服器：

```bash
npm run dev
```

開啟：

```text
http://localhost:3041
```

7. 如需處理排程工作，另開 terminal：

```bash
npm run worker
```

## 測試

快速測試：

```bash
npm run lint
npm run test:unit
npm run test:coverage
```

E2E 測試：

```bash
npx playwright install chromium
npm run test:e2e
```

DB integration tests 需要 `TEST_DATABASE_URL` 或 `DATABASE_URL`：

```bash
TEST_DATABASE_URL="postgresql://..." npm run test:integration
```

`scripts/run-tests.mjs` 會為每次測試建立獨立 PostgreSQL schema，結束後自動刪除。

## 常見問題

### `DATABASE_URL or TEST_DATABASE_URL is required`

代表 DB integration test 沒有可用 PostgreSQL 連線。請設定 `.env` 或用 inline env 執行。

### Playwright 找不到 browser

執行：

```bash
npx playwright install chromium
```

### Prisma schema 變更後型別不一致

執行：

```bash
npm run prisma:generate
```
