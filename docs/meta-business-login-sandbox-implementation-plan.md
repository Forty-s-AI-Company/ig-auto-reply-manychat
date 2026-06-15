# Meta Business Login Sandbox-Only 技術實驗計畫

日期：2026-06-15  
狀態：Planning only，尚未進入產品實作  
範圍：Facebook Login for Business / Instagram Business Login sandbox provider、authorize URL、callback、workspace linking、channel sync、App Review gates  

## 原則與邊界

本文件只定義 sandbox-only 技術實驗計畫，不修改正式產品流程。

明確限制：

- 不改現有 `meta-instagram` 正式 OAuth flow。
- 不改現有 callback route。
- 不改登入按鈕或正式 onboarding UI。
- 不改 production env。
- 不新增正式可用 provider。
- 不建立或修改 Prisma schema。
- 不將任何 token、authorization code、client secret、app secret 寫入 log、URL、audit、文件或截圖。

實驗目標不是保證「每次開啟未登入視窗」。第三方服務無法清除使用者瀏覽器內的 Meta / Instagram session。實驗目標是確認 Meta 官方 business login flow 是否能提供更接近 ManyChat 的 Business / Page / IG account selection UX，並確認 callback 後能否安全完成 workspace linking 與 channel sync。

## 1. Sandbox provider 命名與隔離策略

### 建議 provider 命名

只在 sandbox 規格中使用以下 provider id，正式產品暫不掛載：

| Provider ID | Flow | 用途 |
| --- | --- | --- |
| `meta-business-facebook-sandbox` | Facebook Login for Business | 優先驗證 Business / Page / IG asset selection |
| `meta-business-instagram-sandbox` | Instagram Business Login | 驗證 IG account selection 與 Instagram professional account 授權 |

不建議使用：

- `meta-business`
- `meta-instagram-v2`
- `meta-facebook-v2`

原因是名稱太接近正式 provider，容易在 route、log、audit、App Review 文件或 env 中混淆。

### 不影響正式產品的隔離策略

正式產品隔離要求：

1. sandbox provider 不出現在正式登入按鈕清單。
2. sandbox provider 不被現有 `/channels/connect/social` 頁面直接引用。
3. sandbox provider 不覆蓋 `meta-instagram` 或 `meta-facebook` 的 provider 設定。
4. sandbox provider 只能透過內部測試 URL 或未公開 feature flag 觸發。
5. sandbox callback 成功後，預設只寫入測試 workspace 或 dry-run audit，不建立正式 Channel。
6. sandbox 實驗資料必須有可辨識 metadata，例如 `flowType=sandbox_meta_business_login`。
7. sandbox 實驗若要建立 ConnectedAccount / Channel，必須限定測試 workspace allowlist。

建議內部觸發方式：

```text
/internal/oauth/meta-business-facebook-sandbox/authorize
/internal/oauth/meta-business-instagram-sandbox/authorize
```

上方只是規格草案，不代表本任務要新增 route。

## 2. 需要新增但暫不套用的 env 清單與用途

以下 env 只列為 sandbox 實驗需要，暫不新增、不套用、不提交任何真實值。

```env
META_BUSINESS_SANDBOX_APP_ID=
META_BUSINESS_SANDBOX_APP_SECRET=
META_BUSINESS_SANDBOX_GRAPH_API_VERSION=
META_BUSINESS_SANDBOX_FACEBOOK_REDIRECT_URI=
META_BUSINESS_SANDBOX_INSTAGRAM_REDIRECT_URI=
META_BUSINESS_SANDBOX_LOGIN_CONFIG_ID=
META_BUSINESS_SANDBOX_INSTAGRAM_LOGIN_CONFIG_ID=
META_BUSINESS_SANDBOX_WORKSPACE_ALLOWLIST=
META_BUSINESS_SANDBOX_ENABLED=
```

用途表：

| Env | 用途 | 是否可進前端 |
| --- | --- | --- |
| `META_BUSINESS_SANDBOX_APP_ID` | sandbox Meta App id | 可，但建議只由 server 組 URL |
| `META_BUSINESS_SANDBOX_APP_SECRET` | server-side code exchange | 不可 |
| `META_BUSINESS_SANDBOX_GRAPH_API_VERSION` | Graph API 版本鎖定 | 可，但建議 server 使用 |
| `META_BUSINESS_SANDBOX_FACEBOOK_REDIRECT_URI` | Facebook Login for Business callback | 不可由前端任意覆寫 |
| `META_BUSINESS_SANDBOX_INSTAGRAM_REDIRECT_URI` | Instagram Business Login callback | 不可由前端任意覆寫 |
| `META_BUSINESS_SANDBOX_LOGIN_CONFIG_ID` | Facebook Login for Business configuration | 不可在正式 UI 曝露 |
| `META_BUSINESS_SANDBOX_INSTAGRAM_LOGIN_CONFIG_ID` | Instagram Business Login configuration | 不可在正式 UI 曝露 |
| `META_BUSINESS_SANDBOX_WORKSPACE_ALLOWLIST` | 限制可測試 workspace | 不可 |
| `META_BUSINESS_SANDBOX_ENABLED` | sandbox 開關 | 不可只靠前端判斷 |

env 驗收要求：

- production app id / secret 不得與 sandbox app id / secret 混用。
- secret 不得出現在 `.env.example` 以外的真實值文件中。
- callback URL 必須與 Meta App Dashboard 完全一致。
- sandbox 開關必須由 server-side 判斷，前端不可自行啟用。

## 3. authorize URL、callback、state、nonce、code exchange 安全規格

### Facebook Login for Business authorize URL 草案

```text
https://www.facebook.com/{graphApiVersion}/dialog/oauth
  ?client_id={META_BUSINESS_SANDBOX_APP_ID}
  &redirect_uri={META_BUSINESS_SANDBOX_FACEBOOK_REDIRECT_URI}
  &state={opaque_state}
  &response_type=code
  &scope={reviewed_scopes}
  &config_id={META_BUSINESS_SANDBOX_LOGIN_CONFIG_ID}
```

可實驗參數：

- `auth_type=rerequest`：只在缺少權限或 reviewer 測試 rerequest 時使用。
- `display=popup`：只在 popup transport 測試使用。

不建議作為 UX 保證的參數：

- `auth_type=reauthenticate`
- `prompt`
- `login_hint`
- `force_reauth`

原因：這些參數即使存在或在部分 flow 生效，也不能保證 Meta 每次都顯示全新未登入畫面，且可能與 business login configuration 行為不一致。

### Instagram Business Login authorize URL 草案

```text
https://www.instagram.com/oauth/authorize
  ?client_id={META_BUSINESS_SANDBOX_APP_ID}
  &redirect_uri={META_BUSINESS_SANDBOX_INSTAGRAM_REDIRECT_URI}
  &state={opaque_state}
  &response_type=code
  &scope={reviewed_instagram_scopes}
```

若 Meta 官方文件要求不同 host、path 或 business login 參數，實驗前必須以 Meta App Dashboard 產出的正式 configuration 為準。

### state 規格

`state` 必須是不透明字串，不可把 workspace id、user id、channel id 直接裸露在 query string。

server-side state payload 建議欄位：

```json
{
  "workspaceId": "internal",
  "userId": "internal",
  "providerId": "meta-business-facebook-sandbox",
  "flowType": "facebook_login_for_business",
  "transport": "popup_or_redirect",
  "returnTo": "/channels/connect/social",
  "nonceHash": "server_generated",
  "createdAt": "iso_time",
  "expiresAt": "iso_time"
}
```

state 驗收：

- TTL 建議 5 到 10 分鐘。
- 使用後立即失效。
- 必須綁定 authenticated user session。
- 必須綁定 workspace allowlist。
- callback query 中的 workspace id 不可信。
- raw state 不得寫入 audit 或 log。

### nonce 規格

nonce 用來降低重放風險：

- authorize 前 server 產生 nonce。
- state 中只保存 nonce hash 或 server-side reference。
- callback 時比對 nonce。
- nonce 使用後即失效。
- nonce mismatch 回傳 `invalid_state` 或 `nonce_mismatch`。

### code exchange 規格

authorization code 只能在 server-side exchange。

要求：

1. 不在 client console 印出 code。
2. 不把 code 傳給前端頁面。
3. 不把 code 寫入 audit。
4. 不把完整 callback URL 寫入 log。
5. exchange 失敗只記錄 `token_exchange_failed` 與 redacted request id。
6. token exchange 後立即以加密儲存 token，或在 dry-run 模式中不落庫。

## 4. ConnectedAccount / Channel / workspace linking 資料映射草案

### ConnectedAccount 映射草案

正式 schema 暫不修改。實驗階段先以 mapping spec 或 dry-run output 驗證欄位。

建議欄位：

| 欄位 | 來源 | 用途 |
| --- | --- | --- |
| `workspaceId` | server-side state | tenant isolation |
| `provider` | sandbox provider id | 分辨正式與 sandbox flow |
| `providerAccountId` | IG professional account id 優先 | 避免用 display name 當唯一識別 |
| `accessToken` | token exchange | 加密儲存，不回前端 |
| `refreshToken` | Meta flow 若提供 | 加密儲存，不回前端 |
| `expiresAt` | token response | token refresh 判斷 |
| `metadataJson.flowType` | server-side flow | audit / debug |
| `metadataJson.businessId` | Meta asset | Business 對應 |
| `metadataJson.pageId` | Meta asset | Page 對應 |
| `metadataJson.instagramBusinessAccountId` | Meta asset | Channel 對應 |
| `metadataJson.loginConfigurationId` | Meta dashboard | App Review / debug |

### Channel 映射草案

Channel 建立條件：

1. 已通過 state / nonce / user / workspace 驗證。
2. 已取得可用 IG professional account id。
3. IG account 與 Page / Business 關聯可被 Meta API 驗證。
4. workspace policy 允許連接該資產。
5. token scope 滿足 channel sync 所需權限。

建議 channel 狀態：

| 狀態 | 說明 |
| --- | --- |
| `sandbox_dry_run` | 只驗證 payload，不建立正式 channel |
| `pending_asset_validation` | 等待 Business / Page / IG asset 驗證 |
| `permission_missing` | scope 不足 |
| `sync_failed` | channel sync 失敗 |
| `connected` | 驗證與 sync 均成功 |

正式實作前不建議新增狀態欄位；先用文件與實驗報告確認是否需要 schema 變更。

### workspace linking 驗證草案

必須驗證：

- authenticated user 屬於 state 中 workspace。
- workspace 在 sandbox allowlist。
- callback provider id 等於 state provider id。
- selected Business / Page / IG account 可被目前 token 查到。
- 同一 IG account 不會被錯誤連到其他 workspace。
- 若同一 IG account 已存在於其他 workspace，必須依產品策略回傳明確錯誤或要求 owner 確認。

錯誤分類：

| Error Type | 觸發條件 |
| --- | --- |
| `invalid_state` | state 缺失、過期、重放或不匹配 |
| `workspace_mismatch` | user session 與 state workspace 不一致 |
| `workspace_not_allowed` | workspace 不在 sandbox allowlist |
| `wrong_account` | 回傳資產不屬於預期 workspace / user |
| `no_eligible_asset` | 找不到可用 Page / IG account |
| `permission_denied` | 使用者拒絕或 scope 不足 |
| `token_exchange_failed` | code exchange 失敗 |
| `channel_sync_failed` | channel 建立或同步失敗 |

## 5. App Review 前後的切換條件

### App Review 前

只能做：

- 文件規格。
- sandbox app 設定盤點。
- reviewer demo script 準備。
- test workspace / test Page / test IG account 準備。
- dry-run authorize URL 與 callback payload 分析。
- account selection test matrix 執行。

不能做：

- 對正式使用者開放新 flow。
- 把 sandbox provider 掛到正式登入按鈕。
- 用 production app secret 測 sandbox。
- 在正式 Channel 寫入未驗收資料。

### App Review 通過後

仍不可直接替換正式 flow。必須先完成：

1. sandbox matrix 全部 P0 case 通過。
2. callback security review 通過。
3. workspace linking review 通過。
4. token / code / secret redaction review 通過。
5. rollback strategy 已演練。
6. feature flag 與 workspace allowlist 已完成。
7. 產品文案與錯誤分類已定稿。

### 可進入有限 beta 的條件

可考慮僅對內部 workspace 或 allowlist workspace 開放 beta，條件是：

- 不影響既有 `meta-instagram` flow。
- beta flow 有獨立 provider id。
- 任一錯誤可 fallback 至現有 Instagram OAuth。
- 所有 audit 均 redacted。
- 使用者能清楚辨識正在連接 Business / Page / IG account。

## 6. log / audit redaction 驗收清單

不得記錄：

- access token
- refresh token
- authorization code
- app secret
- client secret
- webhook verify token
- raw state
- raw nonce
- 完整 callback URL
- Meta API raw error payload 中的敏感欄位

允許記錄：

- provider id
- flow type
- request id
- workspace id
- connected account id
- channel id
- redacted Business / Page / IG account id
- selected asset count
- error type
- App Review / sandbox flag

建議 redaction 格式：

```text
businessId=bus_***1234
pageId=page_***5678
instagramBusinessAccountId=ig_***9012
authorizationCode=[REDACTED]
accessToken=[REDACTED]
state=[REDACTED]
```

驗收方式：

1. 執行成功 callback。
2. 執行 user cancel callback。
3. 執行 invalid state callback。
4. 執行 token exchange failed callback。
5. 搜尋 server log、audit log、browser console、error tracking、錄影文件。
6. 確認沒有 token、code、secret、raw state、完整 callback URL。

## 7. rollback / fallback 策略

### Rollback 條件

任一條件成立即停止 sandbox rollout：

- App Review 未通過或權限被移除。
- Meta dialog 無法提供可接受的 Business / Page / IG selection。
- callback redaction 發現敏感資料外洩。
- workspace linking 出現跨 workspace 連接風險。
- channel sync 會建立錯誤 IG channel。
- token scope 不穩定，無法支援核心功能。

### Fallback 策略

fallback 順序：

1. 停用 sandbox feature flag。
2. 移除內部測試入口。
3. 保留現有 `meta-instagram` 正式 flow。
4. 在文件中標註失敗情境與原因。
5. 若 UX 未達 ManyChat 標準，改做產品內提示與錯誤分類優化，不強行切換 OAuth flow。

資料處理：

- sandbox dry-run 資料可刪除。
- 若曾建立測試 ConnectedAccount / Channel，需列出清理清單。
- 不刪除 production ConnectedAccount / Channel。
- 不修改 production OAuth provider。

## 8. 不進入正式產品實作的明確邊界

以下任一項未完成前，不得進入正式產品實作：

1. Meta App Review 權限與 Business verification 狀態未確認。
2. env 隔離與 secret 管理規格未通過 review。
3. sandbox callback state / nonce / code exchange 未通過安全驗收。
4. account selection test matrix 未完成 P0 / P1 判定。
5. ConnectedAccount / Channel mapping 未確認不需要 schema 變更，或 schema 變更計畫未完成。
6. workspace linking 未證明不會跨 tenant。
7. channel sync 未證明能正確處理 Page token、user token、IG asset id。
8. redaction 搜尋未通過。
9. rollback 演練未完成。
10. 使用者無法清楚理解正在選 Business、Page 或 IG account。

## 建議實驗順序

1. 建立文件版 sandbox checklist，不寫程式。
2. 在 Meta App Dashboard 建立或確認 sandbox app / login configuration。
3. 準備 reviewer demo workspace、Page、IG professional account。
4. 用手動 authorize URL 驗證 dialog 行為。
5. 記錄 callback payload 結構，只保存 redacted 結果。
6. 跑 account selection test matrix。
7. 撰寫 sandbox 實驗報告。
8. 若 P0 通過，再開下一階段：只允許內部測試 route / dry-run callback 的產品程式碼規格。

## 最終建議

建議進入下一步「sandbox-only 規格驗證」，但仍不要開始正式產品實作。

最合理的路線是：

1. 優先驗證 `meta-business-facebook-sandbox`。
2. 同步保留 `meta-business-instagram-sandbox` 作比較。
3. 以 ManyChat account selection UX 作為結果判定，不以「是否強制未登入」作為唯一成功標準。
4. 正式 flow 維持現有 `meta-instagram`，直到 App Review、redaction、workspace linking、channel sync 全部通過。

## 下一個建議 Codex prompt

```text
請只新增 / 更新文件，不要修改產品功能程式碼，不要改 OAuth flow，不要改 callback route，不要改登入按鈕，不要改 env。

請根據 docs/meta-business-login-sandbox-implementation-plan.md，建立 sandbox-only Meta Business Login 實驗執行紀錄模板，檔案路徑為 docs/meta-business-login-sandbox-runbook-template.md。

內容需包含：
1. 測試前檢查清單
2. Meta App Dashboard 設定紀錄欄位
3. authorize URL redacted 紀錄格式
4. callback payload redacted 紀錄格式
5. account selection UX 觀察表
6. workspace linking / channel sync 驗證紀錄
7. redaction 搜尋結果紀錄
8. 是否可進入下一階段的 go / no-go 判定

完成後請執行 git status、npm run lint、npm run build。npm test 可視情況略過，但要說明原因。
```
