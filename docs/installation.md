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

## 本機 dev DB 與 test DB 分工

本機開發伺服器 `npm run dev` 固定讀取 `DATABASE_URL` / `DIRECT_URL`。
測試流程優先讀取 `TEST_DATABASE_URL` / `TEST_DIRECT_URL`，缺少時才會退回 `DATABASE_URL`。

使用 Supabase CLI local development 時，請先確認 `supabase/config.toml` 的 `[db].port`。本專案目前 local Supabase DB port 是 `55322`；如果 `.env.local` 指到其他 port，Next.js dev app 會連到另一個本機 Supabase 專案。

建議本機 `.env.local` 至少維持這個分工：

```env
APP_URL="http://localhost:3041"
DATABASE_URL="postgresql://postgres:postgres@127.0.0.1:<dev-db-port>/postgres"
DIRECT_URL="postgresql://postgres:postgres@127.0.0.1:<dev-db-port>/postgres"
TEST_DATABASE_URL="postgresql://postgres:postgres@127.0.0.1:<test-db-port>/postgres"
TEST_DIRECT_URL="postgresql://postgres:postgres@127.0.0.1:<test-db-port>/postgres"
```

如果 `localhost:3041` 登入失敗，先確認：

1. `DATABASE_URL` 指向的 DB 是否就是目前開發用 DB。
2. `ADMIN_EMAIL` / `ADMIN_PASSWORD` 是否已透過 `npm run admin:ensure` 建立到該 DB。
3. `APP_URL` 是否為 `http://localhost:3041`，避免本機 callback / same-origin 行為混用正式站 URL。

## 本機 DB 正規化 SOP

### 目前狀態

- `54322`：另一個 local Supabase project。不要作為本專案預設 dev / test DB。
- `55322`：本專案 `supabase/config.toml` 指定的 local Supabase DB port，已完成 schema 初始化、admin seed 與 demo seed。

### 本專案標準 local 設定

1. `.env.local` 的 `DATABASE_URL` / `DIRECT_URL` 指向 `127.0.0.1:55322`。
2. `.env.local` 的 `TEST_DATABASE_URL` / `TEST_DIRECT_URL` 也指向 `127.0.0.1:55322`，讓本機 test runner 不再退回其他 DB。
3. `APP_URL` 保持 `http://localhost:3041`。
4. 修改 DB env 後要重啟 `npm run dev`，避免 Next.js / Prisma 沿用舊連線。

### 哪些步驟會建立 schema

- `npm run prisma:migrate`
- `npm run prisma:push`
- `npm test`

原因：

- `package.json` 目前把 `prisma:migrate` 指到 `node scripts/prisma-env.mjs db push`。
- `scripts/run-tests.mjs` 會先執行 `prisma db push --skip-generate`，再跑測試。

### 哪些步驟會 seed admin

- `npm run prisma:seed`：建立完整初始資料，包含 admin、workspace、channel、tag、automation 等 demo seed。
- `npm run admin:ensure`：只補 admin、default workspace 與 workspace membership，適合 schema 已存在但帳號缺失的情況。
- `npm run e2e:admin:ensure`：只針對 `TEST_DATABASE_URL`，並會建立 E2E 專用 channel / contact / conversation fixtures。

注意：`prisma/seed.ts` 使用 `dotenv/config`，預設只讀 `.env`。如果本機主要設定放在 `.env.local`，請用 PowerShell 指定 dotenv path：

```powershell
$env:DOTENV_CONFIG_PATH=".env.local"; npm run prisma:seed
```

### 哪些步驟會影響 Playwright / `TEST_DATABASE_URL`

- `npm run test:e2e*` 依賴登入帳號、seeded workspace 與對應的 channel / conversation fixtures。
- `npm test` / `npm run test:integration` 會優先使用 `TEST_DATABASE_URL`，並在該 DB 建立臨時 schema。
- 如果 `TEST_DATABASE_URL` 缺失，測試 runner 會退回 `DATABASE_URL`，這會讓 dev DB 與 test DB 邊界再次混掉。

### 建議切換順序

1. 先把 `.env.local` 的 dev / test URL 全部改成目標 DB。
2. 若目標 DB 是空的，先允許 schema 初始化：
   - `npm run prisma:migrate` 或 `npm test`
3. schema 建好後，執行：
   - `npm run admin:ensure`
   - 如需完整 demo / fixture，再跑 `npm run prisma:seed` 或 `npm run e2e:admin:ensure`
4. 最後驗證：
   - `http://localhost:3041/login`
   - `POST /api/auth/login`
   - 需要時再驗證 Playwright / integration tests

### 主要風險

- `npm test` 不是純測試，它會先對目標 DB 做 `prisma db push`。如果你把 `TEST_DATABASE_URL` 指到不該寫入的 DB，測試會直接動 schema。
- 只改 `DATABASE_URL` 而不改 `TEST_DATABASE_URL`，會導致 dev app 與 test runner 繼續各自連不同 DB。
- 如果重新啟動或重建 Supabase local project，請先確認 `supabase/config.toml` 的 `[db].port` 仍是 `55322`。

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
