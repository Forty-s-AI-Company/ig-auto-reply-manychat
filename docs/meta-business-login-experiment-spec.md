# Facebook Login for Business / Instagram Business Login 研究任務規格

更新日期：2026-06-15

## 任務目的

本文件定義一個「只做文件與實驗規格」的後續研究任務，用來評估 InboxPilot 是否應以 Facebook Login for Business 或 Instagram Business Login 取代、補強目前的 Instagram OAuth 連線流程。

本任務不修改產品功能程式碼，不改 OAuth flow，不改 callback route，不改登入按鈕，也不改 env。這份文件只列出要驗證的方向、預期實驗、影響範圍、風險與後續決策門檻。

## 背景

目前 `docs/meta-login-account-selection-analysis.md` 的結論是：

- InboxPilot 目前新增 IG 帳號主要走 `meta-instagram` provider。
- UI 入口是 `/api/oauth/meta-instagram/authorize?fresh_login=1`。
- 實際 provider 會導向 Instagram OAuth，並帶上 `force_authentication=1`、`enable_fb_login=0`。
- Facebook / Meta 入口走 `https://www.facebook.com/v25.0/dialog/oauth`。
- 專案內另保留 legacy `/api/meta/oauth/start` 與 `/api/meta/oauth/callback` 相容路徑。
- 目前不能穩定做到 ManyChat 那種每次都像未登入視窗或強制帳號選擇的 UX。

Meta 官方文件方向上，目前可評估三條路：

1. 保留 Instagram API with Instagram Login。
2. 改採或補上 Instagram API with Facebook Login / Facebook Login for Business。
3. 導入 Business Login for Instagram 作為新的帳號選擇 / 授權入口。

## 官方資料依據

本次研究應以 Meta 官方文件為準：

- Instagram API with Instagram Login  
  `https://developers.facebook.com/docs/instagram-platform/instagram-api-with-instagram-login/`
- Business Login for Instagram  
  `https://developers.facebook.com/docs/instagram-platform/instagram-api-with-instagram-login/business-login/`
- Instagram Platform App Review  
  `https://developers.facebook.com/docs/instagram-platform/app-review/`
- Instagram Platform Changelog  
  `https://developers.facebook.com/docs/instagram-platform/changelog/`
- Facebook Login for Business  
  `https://developers.facebook.com/documentation/facebook-login/facebook-login-for-business`
- Instagram API with Facebook Login / Business Login for Instagram  
  `https://developers.facebook.com/docs/instagram-platform/instagram-api-with-facebook-login/business-login-for-instagram/`

備註：Meta 官方文件頁面在瀏覽器工具開啟時偶爾回 429，但搜尋摘要與文件 URL 可確認上述文件存在。正式實作前仍需由工程人員在瀏覽器或 Meta App Dashboard 中再次開啟官方頁逐項核對。

## 目前程式碼盤點

### 登入按鈕

檔案：`src/app/channels/connect/social/page.tsx`

目前行為：

- `meta-instagram` 主按鈕：`/api/oauth/meta-instagram/authorize?fresh_login=1`
- `meta-instagram` 次按鈕：`/api/oauth/meta-instagram/authorize?switch_account=1`
- `meta-facebook` 主按鈕：`/api/oauth/meta-facebook/authorize`
- `meta-facebook` 次按鈕：`/api/oauth/meta-facebook/authorize?switch_account=1&reauth=1&rerequest=1`

若導入新 flow，可能需要新增或替換：

- `meta-business-instagram`
- `meta-business-facebook`
- 或保留既有 provider id，但在 provider 內切換 implementation。

建議先不要替換既有按鈕，實驗階段應使用隱藏測試入口或文件化手動 URL。

### OAuth authorize route

檔案：`src/app/api/oauth/[provider]/authorize/route.ts`

目前職責：

- 驗證 API 使用者。
- 依 provider 建立 popup state。
- 寫入 `meta_oauth_state`、`meta_oauth_workspace`、`meta_oauth_mode` cookie。
- 呼叫 provider `getAuthUrl()`。
- redirect 到 Meta / Instagram 授權頁。

研究問題：

- 若新 flow 需要 `config_id`、Business Login configuration、或額外 setup metadata，應該放在 provider 邏輯中，還是建立新的 route？
- 是否要沿用現有 popup cookie 與 Meta 相容 cookie？
- 新 flow 的 `state` 是否需要綁定 workspace、provider、transport、nonce 與 flow version？

### Callback route

檔案：

- `src/app/api/oauth/[provider]/callback/route.ts`
- `src/app/api/meta/oauth/callback/route.ts`
- `src/app/api/instagram/oauth/callback/route.ts`

目前有兩套 callback：

- Generic callback：provider callback -> `saveConnectedAccount()` -> `syncConnectedAccountToChannel()`。
- Legacy Meta callback：處理 Facebook / Instagram mode，直接 upsert channel，並支援 popup bridge。

研究問題：

- 新 flow 應統一回 generic callback，還是延續 legacy Meta callback？
- 如果 Facebook Login for Business 回傳 Page / Business / IG assets，應該先存 `ConnectedAccount`，再同步 channel，還是直接建立 channel？
- Callback failure audit 是否需要新增 `flowVersion`、`loginConfigurationId`、`businessId`、`selectedAssetCount` 等 metadata？
- 是否要在 callback 階段建立 explicit account selection result，避免使用者授權多個 IG 後無法知道哪個被連上？

### Account linking

檔案：

- `src/lib/oauth/store.ts`
- `prisma/schema.prisma` 的 `ConnectedAccount`

目前 unique key：

```text
workspaceId + provider + providerAccountId
```

研究問題：

- 新 flow 的 `providerAccountId` 應該使用 Facebook user id、Business id、Page id、IG business account id，還是 Login configuration 回傳主體？
- 如果同一個 Facebook user 管理多個 IG，單一 `ConnectedAccount` 是否足以代表多個 channel？
- 是否需要在 `metadataJson` 中明確保留：
  - `flowType`
  - `businessId`
  - `pageId`
  - `instagramBusinessAccountId`
  - `selectedAssetIds`
  - `loginConfigurationId`

### Workspace linking

檔案：

- `src/lib/workspaces.ts`
- `src/lib/oauth/meta-channel-sync.ts`
- `src/lib/channels/meta.ts`
- `prisma/schema.prisma` 的 `Channel`

目前 channel unique key：

```text
workspaceId + type + name
```

目前 `meta-channel-sync.ts` 會：

- `meta-instagram`：以 IG profile 建立 / 更新單一 Instagram channel。
- `meta-facebook`：讀 `/me/accounts` 與 `/me/businesses`，找 Page / IG business account，再建立多個 Instagram channel。

研究問題：

- 如果新 flow 已經提供明確 selected assets，是否要停止 fallback 掃描 `/me/accounts` / `/me/businesses`？
- 是否需要改成以 `instagramBusinessAccountId` 做主要 upsert 判斷，而不是先用 name？
- 是否要保留 user token、page token、IG token 三者的來源差異？
- 多 workspace 連同一個 IG 帳號時，token refresh、webhook subscription、audit 應如何隔離？

## 實驗方案

### 方案 A：保留 Instagram Login，只補 Business Login for Instagram 參數

目的：確認目前 Instagram OAuth 是否能透過官方建議參數改善帳號選擇體驗。

實驗項目：

- 在測試 app 中比較：
  - `force_authentication=1`
  - `enable_fb_login=0`
  - `force_reauth=true` 或 Meta 官方文件目前建議值
- 測試桌機 Chrome、手機瀏覽器、已登入 IG、已登入 FB、同時登入多帳號等情境。
- 確認是否仍只顯示「允許 / 取消」。

預期：

- 可能改善手機或部分 session 情境。
- 不應期待穩定做到 ManyChat 那種完整 account selection。

適用條件：

- 想維持目前 graph.instagram.com / Instagram Login 的簡單架構。
- 不急著導入 Facebook Page / Business asset selection。

### 方案 B：建立 Facebook Login for Business 實驗入口

目的：評估是否能取得更接近 ManyChat 的 Business / Page / IG asset 選擇體驗。

實驗項目：

- 在 Meta App Dashboard 建立 Facebook Login for Business 相關設定。
- 確認是否需要 login configuration / `config_id`。
- 測試 OAuth dialog 是否可要求選擇 Business、Page、Instagram professional account。
- 測試是否能取得 Page access token 與 IG business account id。
- 比較回傳資料是否可直接餵給 `syncConnectedAccountToChannel()`。

預期：

- UX 可能比目前 Instagram OAuth 更接近 ManyChat。
- 可能需要更完整 App Review、Business Verification、Advanced Access。
- callback 與 channel sync 需要更嚴謹的 selected asset 處理。

適用條件：

- 目標是營運型 SaaS，使用者需要管理多個 Page / IG。
- 需要與 Messenger / Instagram Messaging / comments webhook 長期整合。

### 方案 C：導入 Instagram API with Facebook Login

目的：評估舊式 Page-linked Instagram Graph flow 是否比 Instagram Login 更適合 InboxPilot。

實驗項目：

- 驗證 Facebook Login scope 是否仍符合目前需要：
  - `pages_show_list`
  - `pages_read_engagement`
  - `pages_manage_metadata`
  - `pages_messaging`
  - `instagram_basic`
  - `instagram_manage_comments`
  - `instagram_manage_messages`
  - `business_management`
- 以 user token 讀取 `/me/accounts`。
- 以 Page access token 建立 webhook subscription。
- 以 Page linked IG business account 建立 channel。

預期：

- 與目前 `meta-facebook` provider 最接近。
- 對 Page-linked IG Business Account 支援較完整。
- 使用者需要理解 Facebook Page 與 IG 的關聯，UX 成本較高。

適用條件：

- 需要 Page token、Messenger API、Page webhook 這類傳統 Meta Graph 能力。
- 使用者多數 IG 已綁 Facebook Page。

## Meta App Review 影響範圍

若導入 Facebook Login for Business / Instagram Business Login，App Review 文件與 demo 至少要補：

- 新登入流程名稱與畫面錄影。
- 使用者如何選 Business / Page / IG account。
- 為什麼需要每個 permission。
- 如何在 InboxPilot 內使用該資料：
  - 讀取 IG profile。
  - 讀取貼文 / media。
  - 同步留言。
  - 收發 IG messaging。
  - 設定 webhook。
- 權限被拒絕或只授權部分 asset 時的處理。
- 使用者如何解除連接與資料刪除。

可能仍需要：

- Advanced Access。
- Business Verification。
- Reviewer demo account。
- 測試用 Facebook Page。
- 測試用 Instagram Professional / Business Account。
- Meta App Dashboard 的 login configuration 截圖或設定說明。

## Env 影響範圍

本任務不新增 env，只列出未來可能需要評估的 env：

```env
META_APP_ID=
META_APP_SECRET=
META_INSTAGRAM_APP_ID=
META_INSTAGRAM_APP_SECRET=
META_GRAPH_API_VERSION=
META_FACEBOOK_REDIRECT_URI=
META_INSTAGRAM_REDIRECT_URI=
META_BUSINESS_LOGIN_CONFIG_ID=
META_INSTAGRAM_BUSINESS_LOGIN_CONFIG_ID=
META_WEBHOOK_VERIFY_TOKEN=
```

注意：

- 不要把 app secret、token、authorization code 寫進前端、URL query、console、audit 或文件。
- `config_id` 是否敏感需依 Meta 官方文件確認；即使不敏感，也建議由 env 管理，避免硬編在前端。
- redirect URI 必須與 Meta App Dashboard 設定完全一致。

## Callback 影響範圍

未來若實作，callback 至少要補以下設計：

- `state` 需包含或對應：
  - workspace id
  - provider id
  - flow type
  - transport
  - nonce
  - return path
- token exchange 不得記錄 authorization code。
- callback error audit 必須 redaction。
- 部分授權 / 部分 asset selection 需要明確 UI 回饋。
- callback success 應記錄：
  - provider
  - flow type
  - connected account id
  - channel count
  - selected asset ids 的安全摘要
- 不應在 callback 裡直接相信 query 回傳的 workspace，必須以 httpOnly state cookie 或 server-side state 驗證。

## Workspace Linking 影響範圍

未來若實作，workspace linking 需明確定義：

- 同一個 IG account 是否允許連到多個 workspace。
- 同一個 workspace 是否允許同時存在 Instagram Login 與 Facebook Login 來源的同一 IG。
- Channel upsert 優先鍵應改以 `instagramBusinessAccountId` 或 `instagramOauthUserId` 為主，name 僅作 display。
- token source 要清楚標記：
  - `loginProvider=instagram`
  - `loginProvider=facebook`
  - `loginProvider=facebook_business`
  - `loginProvider=instagram_business_login`
- webhook subscription 是否由 Page token 或 app token 建立。
- token refresh job 如何依 provider 分流。

## 安全與維運風險

1. 多 flow 並存會增加 callback 誤接、state 驗證錯誤與 App Review 說明成本。
2. 授權多個 asset 時，如果沒有明確 selected asset mapping，可能把錯的 IG 連到 workspace。
3. 若沿用 channel name upsert，改名或同名帳號可能造成更新錯誤。
4. Facebook Login for Business 可能帶來更多權限與審核需求，不一定比 Instagram Login 更快上線。
5. 若 demo / audit / docs 不慎記錄 token、code、secret，會形成高風險資安問題。

## 決策門檻

建議完成以下驗證後再決定是否進入實作：

- Meta App Dashboard 可建立並穩定使用對應 login configuration。
- 至少 3 種瀏覽器 session 情境測試完成：
  - 未登入 Meta / Instagram。
  - 已登入單一 Meta 帳號。
  - 已登入或曾登入多個 IG / Facebook 帳號。
- 可穩定拿到目標 IG business account id。
- 可判斷使用者選了哪個 Page / Business / IG。
- 可在不破壞現有 `meta-instagram` flow 的前提下做灰度或實驗入口。
- App Review 所需 demo script 可清楚展示資料用途。

## 建議後續工作拆分

1. 文件任務：補完整 Meta App Review demo script 與權限用途表。
2. 實驗任務：建立 sandbox-only provider，不掛正式 UI，只輸出 authorize URL 與 callback payload 摘要。
3. 測試任務：建立 account selection 測試矩陣，記錄不同 session 下的畫面與回傳結果。
4. 架構任務：設計 `ConnectedAccount` -> `Channel` 的 selected asset mapping，不先動 schema。
5. 產品任務：設計「嘗試切換帳號」與「選擇 Business / IG」的 UI 文案，不承諾強制清除 Meta session。

## 下一個可複製 Codex Prompt

```text
請先閱讀 AGENTS.md、README.md、docs/meta-login-account-selection-analysis.md、docs/meta-business-login-experiment-spec.md、docs/meta-app-review-checklist.md、docs/security-review.md、docs/fix-roadmap.md。

請不要修改產品功能程式碼，不要改 OAuth flow，不要改 callback route，不要改登入按鈕，不要改 env。

請只新增 / 更新文件，產出一份 Meta App Review demo script 與權限用途表，檔案路徑為 docs/meta-business-login-app-review-demo-script.md。

內容需包含：
1. Facebook Login for Business / Instagram Business Login 的 reviewer demo 流程
2. 每個 permission 的用途、畫面位置、資料使用方式
3. 使用者如何選 Business / Page / IG account
4. token / authorization code / secret 不得出現在 log、URL、audit、文件的檢查清單
5. callback、workspace linking、channel sync 的安全驗證重點
6. App Review 錄影腳本
7. 不通過 App Review 時的備援方案

完成後請執行 git status、npm run lint、npm run build。npm test 可視情況略過，但要說明原因。
```
