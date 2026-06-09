# InboxPilot Product Readiness Review

更新日期：2026-06-10

## 結論

- 產品成熟度總分：**66 / 100**
- 是否可以正式販售：**不建議現在就公開正式販售**
- 是否可以 Beta 試賣：**可以，限小規模、白名單、受控客戶**
- 最小可販售 MVP 範圍：**Instagram + Inbox + Automations + Broadcasts + Sequences + AI FAQ + PayUNI 測試/人工收費替代**

這次 review 以實際程式碼為主，不以 README 或既有 checklist 當作唯一依據。整體來看，這個專案已經有 SaaS 骨架，也有相當多正式產品才會出現的東西：workspace、subscription、usage ledger、affiliate、audit、worker、health check、Meta webhook、PayUNI callback、測試資料庫隔離。  
但離「可公開賣給一般用戶」還差幾個真正的 blocker，主要卡在 **Meta 正式權限 / PayUNI 正式收款 / 計費邏輯完整度 / 多渠道宣稱與實作落差 / 部分文案與法務頁亂碼**。

## 實際架構判讀

### 1. Meta / Instagram 登入流程

目前不是單一路線，而是 **混合流程**：

- 新的 generic OAuth 入口：
  - `src/app/api/oauth/[provider]/authorize/route.ts`
  - `src/app/api/oauth/[provider]/callback/route.ts`
  - `src/app/api/oauth/[provider]/token/route.ts`
- Meta legacy callback 仍在主流程裡：
  - `src/app/api/meta/oauth/start/route.ts`
  - `src/app/api/meta/oauth/callback/route.ts`
  - `src/app/api/instagram/oauth/callback/route.ts`
- provider 定義：
  - `src/lib/oauth/providers/meta-facebook.ts`
  - `src/lib/oauth/providers/meta-instagram.ts`

也就是說，目前不是單純的 Facebook Login，也不是單純 Instagram Login，而是：

- `meta-facebook`：Facebook OAuth / Meta Business Login 風格
- `meta-instagram`：Instagram Login 風格
- callback 與 channel 建立，仍大量依賴 legacy Meta callback 與 Meta channel sync

### 2. SaaS / 多租戶骨架

主要資料模型存在於：

- `prisma/schema.prisma`

關鍵模型包含：

- `Workspace`
- `WorkspaceUser`
- `User`
- `Channel`
- `ConnectedAccount`
- `Subscription`
- `PaymentOrder`
- `Invoice`
- `UsagePeriod`
- `MessageEventLedger`
- `Referral*`
- `Affiliate*`
- `AuditEvent`

多租戶主要靠：

- `src/lib/workspaces.ts`
- API route 內使用 `getCurrentWorkspaceId()`
- Prisma 查詢時以 `workspaceId` 篩選

這是可行做法，但仍偏向 **應用層隔離**，不是全面 DB policy first。

### 3. 計費與用量控制

計費核心：

- `src/lib/billing/plans.ts`
- `src/lib/billing/entitlements.ts`
- `src/lib/billing/usage-service.ts`
- `src/lib/billing/invoice-service.ts`
- `src/lib/billing/payment-service.ts`

目前真的有套用到的限制，主要是：

- `igAccounts`
- `automations`
- `broadcasts`
- `message events` 導致 automation / broadcast gate

但不是所有 plan 欄位都有落地 enforcement，例如：

- `teamSeats`
- `knowledgeBaseItems`
- `webhookTriggerLimit`
- `broadcastsLimit` 以外的 add-on / seats / retention
- `sequence` 建立沒有 quota gate

## P0 Blockers

### P0-1. PayUNI 正式收款仍被明確鎖住

檔案：

- `src/app/api/billing/payuni/checkout/route.ts`
- `src/lib/payuni.ts`
- `.env.example`
- `docs/environment-variables.md`

問題：

- `checkout` 會在 production gateway 且 `PAYUNI_ALLOW_PRODUCTION !== "true"` 時直接回 `503`
- 代表正式收款仍處於保守開關模式，不是可直接對外賣的完成態

修復建議：

- 完成 PayUNI merchant review
- 補 production env 與 runbook
- 在 Billing UI 明確顯示 sandbox / production 狀態
- 若短期無法正式開通，先設計人工請款 / 匯款 / 手動開通替代流程

### P0-2. 年繳 / 週期邏輯有實作缺口

檔案：

- `src/lib/billing/payment-service.ts`
- `src/lib/billing/invoice-service.ts`
- `src/app/api/billing/payuni/checkout/route.ts`

問題：

- `completePaidPaymentOrder()` 內把 `interval` 寫死成 `"month"`
- 代表使用者就算選年繳，付款完成後也可能被開成月繳 subscription
- 這個對正式收費是硬傷

修復建議：

- 在 `PaymentOrder` 或 `checkoutPayload` 之外，正式保存 checkout interval
- `completePaidPaymentOrder()` 改以實際 interval 建立 subscription
- 補年繳付款整合測試

### P0-3. 零元帳單流程可能不會真正啟用訂閱

檔案：

- `src/app/api/billing/payuni/checkout/route.ts`
- `src/lib/billing/invoice-service.ts`
- `src/lib/billing/payment-service.ts`

問題：

- 當 invoice 因 credit 折抵後 `totalAmount <= 0`，route 直接 redirect success
- 但沒有走 `completePaidPaymentOrder()`，也沒有明確啟動 subscription
- 代表全額折抵升級可能 UI 顯示成功，實際方案沒被啟用

修復建議：

- 零元訂單也應建立 internal payment completion flow
- 以 transaction 方式同步更新 invoice / subscription / wallet ledger / audit
- 補 credit-only 升級測試

### P0-4. Meta / Instagram 正式能力仍依賴平台審核與混合流程

檔案：

- `src/app/api/meta/oauth/start/route.ts`
- `src/app/api/meta/oauth/callback/route.ts`
- `src/app/api/oauth/[provider]/authorize/route.ts`
- `src/lib/oauth/providers/meta-facebook.ts`
- `src/lib/oauth/providers/meta-instagram.ts`

問題：

- 專案同時存在 generic OAuth 與 legacy Meta callback
- `meta-facebook` provider scope 和 `meta/oauth/start` 的 scope 不完全一致
- 正式商用仍依賴 Meta App Review / Advanced Access / Business Verification
- 流程能跑，不等於可賣

修復建議：

- 收斂成單一正式 Meta 連接策略
- 明確區分 `Instagram Login` 與 `Facebook/Meta Business Login`
- 補 Meta production matrix 與 reviewer demo 流程

### P0-5. 帳務與法務頁存在明顯亂碼，會直接傷害信任感

檔案：

- `README.md`
- `docs/project-launch-checklist.md`
- `docs/environment-variables.md`
- `src/lib/billing/plans.ts`
- `src/app/billing/page.tsx`
- `src/app/privacy-policy/page.tsx`
- `src/app/terms-of-service/page.tsx`
- `src/app/data-deletion/page.tsx`

問題：

- 目前有大量編碼亂碼，不只在文件，連 Billing 與法務頁 source 也有
- 這對正式 SaaS 來說不是小瑕疵，是直接降低付款信任感

修復建議：

- 先統一 UTF-8 與文字檔編碼
- 優先修 Billing / Terms / Privacy / Data Deletion / Pricing
- 補 smoke test，避免再次回歸亂碼

## P1 問題

### P1-1. Meta fallback token / fallback page id 會提高錯帳號與多租戶風險

檔案：

- `src/lib/channels/meta.ts`
- `src/app/api/webhooks/meta/route.ts`
- `src/lib/instagram/comments-sync.ts`
- `scripts/refresh-meta-token.mjs`

問題：

- channel config 若沒有 token，會 fallback 到：
  - `META_PAGE_ACCESS_TOKEN`
  - `META_INSTAGRAM_BUSINESS_ACCOUNT_ID`
  - `META_PAGE_ID`
- 這對單 workspace demo 很方便，但對正式多租戶 SaaS 風險偏高
- 可能導致誤把共享 env token 套到錯的 workspace/channel

修復建議：

- production 模式禁止 channel token fallback
- webhook / outbound / comment sync 都應要求 channel 級 token 與 account binding
- 只保留 local/dev fallback

### P1-2. 計費限制不是全面落地

檔案：

- `src/lib/billing/entitlements.ts`
- `src/app/api/automations/route.ts`
- `src/app/api/broadcasts/route.ts`
- `src/app/api/sequences/route.ts`

問題：

- 有些 quota 有 gate，有些沒有
- `teamSeats` 目前固定回 `1`
- `activeContacts` 直接等於 `contacts`
- `sequence` 建立沒有用量限制

修復建議：

- 把所有可售方案欄位對應到真實 enforcement
- 重新設計 usage summary 計算
- 補 subscription gate integration tests

### P1-3. 多租戶隔離仍需更嚴格驗證

檔案：

- `src/lib/workspaces.ts`
- `src/lib/messages.ts`
- `src/lib/channels/meta.ts`
- `src/app/api/**`

問題：

- 大部分 API 有 `workspaceId` 篩選，但主要靠應用層
- `getDefaultWorkspaceId()` 與一些 fallback 行為對 demo 很友善，對正式多租戶較危險

修復建議：

- 加強 tenant isolation 測試
- 明確禁止 production fallback 到 default workspace
- 重新檢查所有 webhook / cron / job processor 的 workspace 解析

### P1-4. Billing / affiliate 流程有骨架，但營運規格仍不完整

檔案：

- `src/lib/billing/affiliate-service.ts`
- `src/lib/billing/referral-service.ts`
- `prisma/schema.prisma`

問題：

- 推薦與聯盟資料模型完整，但沒有看到完整的 anti-fraud 規則落地
- `riskFlagsJson` 只有記錄 IP / UA，沒有真正阻擋策略
- 沒有正式 affiliate terms 頁
- 沒有明確 refund / clawback 後台流程 UI

修復建議：

- 增加 self-referral / duplicate attribution / suspicious workspace 規則
- 補聯盟條款、提領規則、退款 clawback SOP

## P2 問題

- `README.md`、`docs/project-launch-checklist.md`、`docs/environment-variables.md` 與程式碼不完全一致
- onboarding 已有「切換 IG 帳號 / 重新連接」提示，但仍不夠 self-serve
- `Billing` 頁與 legal 頁外觀成熟度不足
- 未看到獨立 refund policy / cookie policy 頁
- `npm run test:e2e` 本輪未重跑，coverage 本輪未重算，只能引用既有文件

## P3 問題

- README 與內部 docs 有不少歷史描述殘留
- UI 中文化整體不差，但局部頁面文字品質不穩
- Meta 流程的成功確認資訊還可以更強，例如更清楚顯示 Page / IG 帳號 / 綁定來源

## 文件與程式碼一致性

### 一致的部分

- 有 worker / queue / health / audit / PayUNI callback / Meta webhook / OAuth 基礎
- 測試結構存在，且 `lint/build/test` 本輪都成功
- `.env.example` 確實列出多數關鍵 env

### 不一致的部分

- README 把 OAuth 架構描述得比實際更單一
- launch checklist 有很多已勾選項，但程式碼仍有 production blocker
- environment docs 與實際頁面存在亂碼，文件可讀性本身就不可靠

## 最小可販售 MVP 範圍

建議第一階段只賣：

- Instagram 自動回覆
- Inbox
- Contacts / Tags / Segments
- Automations
- Broadcasts
- Sequences
- AI FAQ
- Telegram / Email 當附加渠道

不要在第一階段當成主賣點的：

- WhatsApp
- TikTok
- SMS
- LINE
- 多供應商正式 billing automation
- 大規模 affiliate payout automation

## 建議驗證

正式修復前至少要固定跑：

```bash
npm run lint
npm run build
npm test
```

另建議補：

```bash
npm run test:e2e
npm run test:coverage
```
