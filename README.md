# InboxPilot

InboxPilot 是一個以 Instagram 訊息營運為核心的 SaaS 後台，提供多帳號管理、收件匣、自動化流程、分眾、廣播、AI FAQ、PayUNI 帳務與推薦/聯盟分潤基礎能力。

專案使用官方 API、Webhook 與可測試的 Mock channel，不使用 unofficial scraping、cookie 抓取或瀏覽器自動登入繞過平台限制。

## 技術棧

- Next.js App Router 16
- React 19
- TypeScript
- Prisma 6
- PostgreSQL / Supabase Postgres
- Tailwind CSS 4
- Vitest / Playwright

## 核心功能

| 模組                       | 說明                                                                                            |
| -------------------------- | ----------------------------------------------------------------------------------------------- |
| Dashboard / Analytics      | 營運 KPI、訊息、聯絡人、自動化與廣播表現。                                                      |
| Inbox                      | 對話列表、訊息串、手動回覆、內部備註、標籤、自訂欄位與已讀狀態。                                |
| Contacts / Tags / Segments | 聯絡人、標籤與可用於廣播的分眾條件。                                                            |
| Automations                | keyword、new_contact、manual、webhook triggers；支援訊息、標籤、等待、條件、AI 回覆與欄位設定。 |
| Broadcasts                 | 依 tag 或 segment 建立廣播活動，支援預覽、排程與 worker 發送。                                  |
| Channels                   | Instagram 為正式優先通道；Mock、Telegram、Email 供測試或內部流程使用；其他通道需完成官方 API 設定後才開放。 |
| Billing                    | PayUNI checkout/return/notify、方案、用量、發票、折抵金、推薦與聯盟分潤服務。                   |
| Admin                      | 聯盟審核、提領審核、批次匯出與付款標記。                                                        |

## 快速開始

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

更完整的本機安裝步驟請看 [docs/installation.md](./docs/installation.md)。

## 文件

- [安裝文件](./docs/installation.md)
- [部署文件](./docs/deployment.md)
- [環境變數文件](./docs/environment-variables.md)
- [Codex Windows Setup](./docs/codex-windows-setup.md)
- [API 文件](./docs/api.md)
- [ERD](./docs/erd.md)
- [Project Launch Checklist](./docs/project-launch-checklist.md)
- [Automation Webhook](./docs/automation-webhooks.md)
- [PayUNI Billing Flow](./docs/payuni/BILLING_FLOW.md)
- [Supabase RLS 修正 SQL](./docs/security/supabase-rls-fix.sql)

## 常用指令

```bash
npm run dev              # Next.js dev server, port 3041
npm run build            # Prisma generate + Next build
npm run start            # production server
npm run worker           # background jobs
npm run lint             # ESLint
npm run test:unit        # unit tests
npm run test:e2e         # Playwright E2E
npm run test:coverage    # coverage gate
```

DB integration tests 需要 PostgreSQL：

```bash
TEST_DATABASE_URL="postgresql://..." npm run test:integration
```

## 目錄概要

```text
src/app        Next.js pages and API routes
src/components Shared UI/client components
src/lib        Domain logic, adapters, billing, auth, jobs
prisma         Prisma schema and migrations
scripts        Worker, seed/admin helpers, smoke tests
tests          Unit, integration, E2E tests
docs           Product, ops, security and API docs
```

## 安全與合規提醒

- Secret 只放 server-side env，不放前端 bundle。
- 廣播只發送給符合條件且 `consentStatus=opted_in` 的聯絡人。
- Webhook secret / HMAC 可透過環境變數啟用。
- Supabase RLS SQL 已整理於 [docs/security/supabase-rls-fix.sql](./docs/security/supabase-rls-fix.sql)。
