# InboxPilot Product Readiness Review

更新日期：2026-06-10

## 總結

- 目前產品成熟度總分：**66 / 100**
- 是否可以正式販售：**否**
- 是否可以 Beta 試賣：**可以，但只建議白名單 / 小規模 / 受控客戶**
- 最大 P0 阻礙：**金流與訂閱授權閉環還不夠安全完整，Meta 正式權限與多租戶 token 邊界也還沒收乾淨**

這份 review 不是只看 README 或 checklist。  
我有實際檢查：

- `README.md`
- `docs/project-launch-checklist.md`
- `docs/environment-variables.md`
- `.env.example`
- `package.json`
- `prisma/schema.prisma`
- `src/app/api/**`
- `src/lib/**`
- `scripts/**`
- `tests/**`

實際判讀結果是：  
這個專案已經不是玩具，SaaS 骨架、worker、health、audit、billing、affiliate、Meta webhook、OAuth、usage ledger 都有。  
但如果你要「正式公開販售」，現在還不夠穩，會卡在 **PayUNI production readiness、billing subscription correctness、Meta production review、tenant safety 邊界、文案與法務可讀性**。

## 為什麼現在不能正式販售，只能 Beta

1. **PayUNI 正式站還被保守開關擋住**
   - `src/app/api/billing/payuni/checkout/route.ts`
2. **訂閱啟用邏輯有硬傷**
   - `src/lib/billing/payment-service.ts`
3. **0 元折抵成功未必真的啟用訂閱**
   - `src/app/api/billing/payuni/checkout/route.ts`
4. **Meta / Instagram 還是混合流程，且正式可用性取決於 App Review**
   - `src/app/api/meta/oauth/start/route.ts`
   - `src/app/api/meta/oauth/callback/route.ts`
   - `src/app/api/oauth/[provider]/authorize/route.ts`
5. **多租戶下仍有全域 Meta env token fallback 風險**
   - `src/lib/channels/meta.ts`
   - `src/app/api/webhooks/meta/route.ts`
6. **Billing / Terms / Privacy / Data Deletion / 部分文件有亂碼**
   - `src/app/billing/page.tsx`
   - `src/app/terms-of-service/page.tsx`
   - `src/app/privacy-policy/page.tsx`
   - `src/app/data-deletion/page.tsx`
   - `README.md`
   - `docs/project-launch-checklist.md`
   - `docs/environment-variables.md`

## 最小可販售 MVP 範圍

建議第一階段只賣這些：

- Instagram 留言關鍵字自動私訊
- Instagram 私訊自動回覆
- Inbox / Contacts / Tags / Segments
- Automations
- Broadcasts
- Sequences
- AI FAQ
- Email / Telegram 當附加渠道

第一階段不要當主賣點的：

- WhatsApp
- TikTok
- SMS
- LINE
- 大規模 affiliate payout automation
- 完整公開自助式 billing

## P0 問題清單

### P0-1. PayUNI production gateway 仍未進入可放心正式收款狀態

檔案位置：

- `src/app/api/billing/payuni/checkout/route.ts`
- `src/lib/payuni.ts`
- `.env.example`

問題：

- checkout 會在正式 gateway 且 `PAYUNI_ALLOW_PRODUCTION !== "true"` 時直接拒絕
- 這代表正式 merchant review / production go-live 還沒真正完成

修復建議：

- 完成 PayUNI production merchant review
- 補 production env 與 runbook
- 在 Billing 頁清楚顯示 sandbox / production 狀態
- 若短期無法完成，先做人工請款替代流程

### P0-2. Subscription interval 被寫死成 month

檔案位置：

- `src/lib/billing/payment-service.ts`

問題：

- `completePaidPaymentOrder()` 內 `const interval = "month"`
- 代表年繳、月繳在付款完成後可能都被當成月繳 subscription

修復建議：

- 在 checkout 時保存實際 interval
- completion 時用實際 interval 建 subscription
- 補 month / year integration tests

### P0-3. Credit-only / zero-amount checkout 成功後未必真的啟用訂閱

檔案位置：

- `src/app/api/billing/payuni/checkout/route.ts`
- `src/lib/billing/payment-service.ts`

問題：

- invoice `totalAmount <= 0` 時會直接 redirect success
- 沒有走完整 payment completion subscription flow

修復建議：

- 0 元訂單也應走正式 internal completion flow
- 同步更新 invoice / subscription / wallet / audit

### P0-4. Meta / Instagram production flow 還沒真正收斂

檔案位置：

- `src/app/api/meta/oauth/start/route.ts`
- `src/app/api/meta/oauth/callback/route.ts`
- `src/app/api/oauth/[provider]/authorize/route.ts`
- `src/app/api/oauth/[provider]/callback/route.ts`
- `src/lib/oauth/providers/meta-facebook.ts`
- `src/lib/oauth/providers/meta-instagram.ts`

問題：

- generic OAuth 與 legacy Meta callback 並存
- 不同 flow 的 scopes 與 UX 不完全一致
- 正式可售仍依賴 Meta App Review / Advanced Access / Business Verification

修復建議：

- 收斂單一正式 Meta 連接主流程
- 明確定義 Facebook Login 與 Instagram Login 各自適用場景
- 補 reviewer / support / QA 可重現的流程文檔

### P0-5. 多租戶下仍存在 Meta env token fallback 風險

檔案位置：

- `src/lib/channels/meta.ts`
- `src/app/api/webhooks/meta/route.ts`
- `src/lib/instagram/comments-sync.ts`
- `scripts/refresh-meta-token.mjs`

問題：

- 缺少 channel token 時會 fallback 到：
  - `META_PAGE_ACCESS_TOKEN`
  - `META_INSTAGRAM_BUSINESS_ACCOUNT_ID`
  - `META_PAGE_ID`
- 對單租戶 demo 很方便，對正式 SaaS 很危險

修復建議：

- production 模式禁用 env fallback
- 強制 channel-level token 與 account binding

### P0-6. 對外展示與法務頁面存在亂碼

檔案位置：

- `README.md`
- `docs/project-launch-checklist.md`
- `docs/environment-variables.md`
- `src/lib/billing/plans.ts`
- `src/app/billing/page.tsx`
- `src/app/privacy-policy/page.tsx`
- `src/app/terms-of-service/page.tsx`
- `src/app/data-deletion/page.tsx`

問題：

- 不只是 docs，連產品頁與法務頁 source 都有亂碼
- 對正式收費 SaaS 會直接傷害信任感

修復建議：

- 全面整理 UTF-8 / 編碼
- 優先修 Billing、Pricing、Terms、Privacy、Data Deletion

## P1 問題清單

### P1-1. 計費限制不是全面落地

檔案位置：

- `src/lib/billing/entitlements.ts`
- `src/app/api/automations/route.ts`
- `src/app/api/broadcasts/route.ts`
- `src/app/api/sequences/route.ts`

問題：

- `automations`、`broadcasts`、`igAccounts` 有 gate
- `sequences` 沒 quota gate
- `teamSeats` 固定 `1`
- `activeContacts` 直接等於 `contacts`

修復建議：

- 補齊 plan 對應的實際 enforcement
- 重做 usage summary 計算

### P1-2. 試用與訂閱過期後的產品行為還不夠完整

檔案位置：

- `prisma/schema.prisma`
- `src/lib/billing/entitlements.ts`
- `src/lib/billing/usage-service.ts`

問題：

- `trialing / active / past_due / canceled / unpaid` schema 有
- 但產品層限制主要只看到 message event gate
- 沒看到完整的 plan downgrade / subscription expiry 行為矩陣

修復建議：

- 明確定義 trial、expired、past_due、unpaid 的 UI / API 行為

### P1-3. Affiliate / referral 有骨架，但營運規則還不夠成熟

檔案位置：

- `src/lib/billing/referral-service.ts`
- `src/lib/billing/affiliate-service.ts`
- `prisma/schema.prisma`

問題：

- 有 referral code、trial bonus、credit、commission、payout schema
- 但 anti-fraud 邏輯偏弱
- 沒有完整 affiliate terms
- 沒看到完整 refund / clawback 閉環 UI

修復建議：

- 補 self-referral / suspicious attribution 規則
- 補聯盟條款與 payout SOP

### P1-4. 多租戶隔離主要靠應用層

檔案位置：

- `src/lib/workspaces.ts`
- `src/app/api/**`
- `prisma/schema.prisma`

問題：

- 多數 query 有 `workspaceId`
- 但沒有全面證據顯示所有敏感表都有 DB 層一致性保護

修復建議：

- 補 tenant isolation tests
- 收斂高風險 query helper

## P2 問題清單

- onboarding 已改善，但仍未完全 self-serve
- UI 中文化整體可用，但部分關鍵頁面文案品質不穩
- Billing 頁沒有足夠清楚說明 sandbox / production 差異
- README 與 checklist 和實作有落差
- 沒看到獨立 refund policy / cookie policy 頁

## P3 問題清單

- 內部 docs 有歷史殘留
- 一些 placeholder 渠道仍容易造成預期誤差
- Meta 成功頁與綁定確認資訊還能更強

## 產品成熟度細項判斷

- Meta / Instagram 核心能力：**中**
- SaaS 多租戶 / 角色 / workspace：**中上**
- Billing / PayUNI：**中下**
- Affiliate / Referral：**中**
- Security：**中**
- Stability / Ops：**中上**
- UI / UX：**中**
- Tests：**中上**

## 結論

### 目前能不能 Beta 試賣

**可以。**

前提：

- 白名單客戶
- 少量 workspace
- 先賣 Instagram 主流程
- PayUNI 若還沒 production review，先採人工收費替代

### 目前能不能正式公開販售

**不建議。**

主要是：

- 金流與訂閱授權閉環還不夠安全
- Meta production 風險還沒完全收斂
- 多租戶 token fallback 需要先清掉
- 對外可讀性與法務頁品質還不夠
