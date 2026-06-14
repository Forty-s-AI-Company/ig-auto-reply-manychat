# Meta Business Login App Review Demo Script 與權限用途表

更新日期：2026-06-15

## 文件目的

本文件用於準備 Meta App Review，說明 InboxPilot 若導入 Facebook Login for Business / Instagram Business Login 時，reviewer 應如何完成 demo、每個 permission 的使用目的、資料在產品中的顯示位置，以及 callback / workspace linking / channel sync 的安全驗證重點。

本文件只描述審核腳本與安全規格，不代表目前產品已導入新的 Business Login flow。目前正式程式仍以既有 `meta-instagram` / `meta-facebook` OAuth provider 為主。

## 審核前提

Reviewer demo 需要準備：

- 一個 Meta reviewer 測試帳號。
- 一個 Facebook Page。
- 一個已轉為 Professional / Business 的 Instagram account。
- 該 Instagram account 已正確連結到 Facebook Page 或可被 Business Login for Instagram 授權。
- InboxPilot 測試 workspace。
- 可公開存取的 HTTPS callback domain。
- Meta App Dashboard 已設定正確 redirect URI。
- App Review 影片中不得露出 secret、token、authorization code、app secret、client secret 或 webhook verify token。

## Reviewer Demo 流程

### 流程 A：Facebook Login for Business

1. Reviewer 開啟 InboxPilot 測試站。
2. 使用測試帳號登入 InboxPilot。
3. 進入 `Channels / Social Accounts` 或未來對應的 Meta Business Login 測試入口。
4. 點擊「Connect with Facebook Login for Business」。
5. Meta 視窗開啟。
6. Reviewer 選擇 Facebook 帳號。
7. Reviewer 選擇 Business。
8. Reviewer 選擇 Facebook Page。
9. Reviewer 選擇與 Page 連結的 Instagram Professional / Business Account。
10. Reviewer 確認授權 permissions。
11. Meta callback 回到 InboxPilot。
12. InboxPilot 顯示連線成功。
13. Reviewer 在 Social Accounts 中看到 connected account。
14. Reviewer 在 Channels 中看到已建立的 Instagram channel。
15. Reviewer 開啟 channel 詳細資訊，確認顯示 Page name、IG username、連線時間與 token 狀態，但不顯示 token。
16. Reviewer 測試讀取 IG profile / media 或留言同步入口。
17. Reviewer 進入解除連接或資料刪除說明頁，確認可撤銷授權與要求刪除資料。

### 流程 B：Instagram Business Login

1. Reviewer 開啟 InboxPilot 測試站。
2. 使用測試帳號登入 InboxPilot。
3. 進入 `Channels / Social Accounts` 或未來對應的 Instagram Business Login 測試入口。
4. 點擊「Connect with Instagram Business Login」。
5. Meta / Instagram 授權視窗開啟。
6. Reviewer 選擇或登入 Instagram Professional / Business Account。
7. Reviewer 確認授權 requested permissions。
8. Meta callback 回到 InboxPilot。
9. InboxPilot 顯示連線成功。
10. Reviewer 在 Channels 中看到 Instagram channel。
11. Reviewer 進入 channel 詳細資訊，確認顯示 IG username、account id 安全摘要、連線時間與 token 狀態，但不顯示 token。
12. Reviewer 測試讀取 IG profile / media、留言管理或 messaging 入口。
13. Reviewer 進入解除連接或資料刪除說明頁，確認可撤銷授權與要求刪除資料。

## 使用者如何選 Business / Page / IG Account

預期選擇流程：

```text
InboxPilot Connect button
  |
  v
Meta Business Login dialog
  |
  v
選擇 Facebook / Meta 使用者
  |
  v
選擇 Business
  |
  v
選擇 Facebook Page
  |
  v
選擇 Instagram Professional / Business Account
  |
  v
確認 permissions
  |
  v
Callback 回 InboxPilot
```

產品上應明確顯示：

- 使用者授權的是哪個 Business。
- 使用者選擇的是哪個 Page。
- 使用者連接的是哪個 Instagram account。
- 如果 Meta 只回傳部分 asset，InboxPilot 應顯示「部分授權」或「未選到可用 IG 帳號」。
- 若同一 workspace 已存在相同 IG account，應更新既有 channel，而不是建立重複 channel。

## Permission 用途表

| Permission / Scope | Flow | 使用目的 | 產品畫面位置 | 資料使用方式 | Reviewer 操作 |
| --- | --- | --- | --- | --- | --- |
| `public_profile` | Facebook Login / Facebook Login for Business | 辨識授權的 Facebook 使用者。 | Social Accounts connected account 列表。 | 儲存 Facebook user id、display name、avatar 安全資料；不顯示 token。 | 連線後確認 Social Accounts 顯示授權者名稱。 |
| `pages_show_list` | Facebook Login / Facebook Login for Business | 取得使用者可管理的 Page 清單。 | Channel 建立流程 / Social Accounts sync 結果。 | 找出可用 Page，並與 IG business account 關聯。 | 在 Meta dialog 選 Page，回 InboxPilot 確認 channel 建立。 |
| `pages_read_engagement` | Facebook Login / Facebook Login for Business | 讀取 Page engagement 相關資料，支援 Page-linked IG 資料查詢與 webhook 場景。 | Channel detail / media sync / webhook setup 狀態。 | 用於確認 Page 與 IG 關聯、讀取必要 metadata。 | 連線後進入 channel detail 確認 Page / IG 資訊。 |
| `pages_manage_metadata` | Facebook Login / Facebook Login for Business | 設定 Page webhook subscription。 | Channel webhook 狀態、系統設定。 | 訂閱 comments、messages、message reactions 等 webhook fields。 | 連線後觸發 webhook 設定檢查。 |
| `pages_messaging` | Facebook Login / Facebook Login for Business | 支援 Page / Messenger 或 IG messaging 相關訊息處理。 | Inbox / message automation。 | 接收與回覆使用者訊息，依 workspace channel 隔離。 | 送測試訊息後確認 Inbox 收到事件。 |
| `instagram_basic` | Instagram API with Facebook Login | 讀取 IG Business Account 基本資料。 | Channel detail、profile refresh。 | 讀取 IG id、username、profile metadata。 | 連線後確認 IG username 顯示。 |
| `instagram_manage_comments` | Instagram API with Facebook Login | 同步與管理 IG 留言。 | Automations comment trigger、comment sync。 | 讀取 comments，依自動化規則觸發回覆或標籤。 | 在測試貼文留言後同步留言。 |
| `instagram_manage_messages` | Instagram API with Facebook Login | 處理 Instagram Direct Messages。 | Inbox、automation reply。 | 接收與回覆 IG 私訊，依 workspace 與 channel 隔離。 | 發送 IG 私訊後確認 Inbox 顯示。 |
| `business_management` | Facebook Login for Business | 讀取 Business asset 關係與管理授權資產選擇。 | Business / Page / IG account selection 結果。 | 確認 Business 下可用 IG asset，建立 selected asset mapping。 | 在 Meta dialog 選 Business 後確認可選 IG。 |
| `instagram_business_basic` | Instagram Business Login | 讀取 Instagram professional account 基本資料。 | Channel detail、profile refresh。 | 讀取 IG user id、username、name、account type。 | 連線後確認 IG username 與 account type。 |
| `instagram_business_manage_comments` | Instagram Business Login | 同步與管理 IG 留言。 | Automations comment trigger、comment sync。 | 讀取 comments，建立留言觸發自動化。 | 在測試貼文留言後確認同步。 |
| `instagram_business_manage_messages` | Instagram Business Login | 處理 Instagram professional account 訊息。 | Inbox、automation reply。 | 接收與回覆 IG 私訊，依 workspace channel 隔離。 | 發送 IG 私訊後確認 Inbox 顯示。 |

## 資料使用位置

### Social Accounts

用途：

- 顯示 connected account。
- 顯示 provider、display name、username、connected time。
- 提供重新同步或解除連接入口。

不得顯示：

- access token
- refresh token
- authorization code
- app secret
- client secret
- raw callback query

### Channels

用途：

- 顯示 Instagram channel。
- 顯示 IG username、Page name、Business name、連線狀態。
- 顯示 token 是否存在與是否即將過期，但不顯示 token 值。

不得顯示：

- Page access token
- user access token
- IG access token
- webhook verify token

### Inbox

用途：

- 顯示 IG messaging event。
- 顯示 conversation、message、contact。
- 讓使用者回覆已授權 channel 的訊息。

安全要求：

- 每個 query 必須限制 workspace / channel。
- 不得跨 workspace 讀取 contact 或 message。
- 不得在 UI 顯示 raw webhook payload 中的 secret-like 欄位。

### Automations / Comment Sync

用途：

- 讀取 IG comments。
- 依留言關鍵字觸發自動化。
- 支援私訊回覆或公開回覆。

安全要求：

- 只處理目前 workspace 已連接 channel 的 media / comments。
- webhook event 必須驗簽。
- 重送 event 必須 idempotent。

## Token / Code / Secret Redaction 檢查清單

所有 App Review demo、系統 log、audit、文件、截圖都不得包含：

- `access_token`
- `refresh_token`
- `authorization code`
- `client_secret`
- `app_secret`
- `META_APP_SECRET`
- `META_INSTAGRAM_APP_SECRET`
- `TOKEN_ENCRYPTION_KEY`
- `AUTH_SECRET`
- `META_WEBHOOK_VERIFY_TOKEN`
- `code=` query value
- `state=` raw value
- Page access token
- user access token
- IG access token

允許顯示：

- provider 名稱。
- connected account id。
- channel id。
- IG username。
- Page name。
- Business name。
- token 狀態，例如 `encrypted`、`missing`、`expires_at`。
- 經過遮罩的 id，例如 `1784...5177`。

建議遮罩規則：

```text
完整 token：禁止輸出
authorization code：禁止輸出
state：只可顯示 hash 或長度
external id：只顯示前 4 碼與後 4 碼
錯誤訊息：移除 code/state/token/client_secret/app_secret query
```

## Callback 安全驗證重點

Callback 必須驗證：

- 使用者已登入 InboxPilot。
- `state` 存在。
- `state` 與 httpOnly cookie 或 server-side state 相符。
- `state` 綁定 provider。
- `state` 綁定 workspace。
- `state` 綁定 flow type，例如 `instagram_login`、`facebook_business_login`。
- `state` 有 TTL。
- callback error 不記錄 raw query。
- token exchange 不記錄 authorization code。
- 成功後清除 state cookie。
- 失敗後清除 state cookie。
- audit metadata 只能記錄安全摘要。

Callback 成功 audit 建議欄位：

```json
{
  "provider": "meta-business-instagram",
  "flowType": "facebook_login_for_business",
  "connectedAccountId": "safe-id",
  "channelCount": 1,
  "selectedAssetCount": 1
}
```

Callback 失敗 audit 建議欄位：

```json
{
  "provider": "meta-business-instagram",
  "flowType": "facebook_login_for_business",
  "phase": "state_validation",
  "reason": "redacted error summary"
}
```

## Workspace Linking 安全驗證重點

Workspace linking 必須驗證：

- `workspaceId` 來自 authenticated user / server-side state，不來自 callback query。
- `ConnectedAccount` unique key 不會跨 workspace 衝突。
- `Channel` 建立或更新前必須確認 workspace。
- 以 `instagramBusinessAccountId` 或 `instagramOauthUserId` 判斷是否為同一 IG account。
- channel name 只作 display，不應作唯一業務識別。
- 同一 IG account 若已存在於同 workspace，應更新既有 channel。
- 同一 IG account 若存在於不同 workspace，必須確認產品政策是否允許。
- token refresh job 必須依 workspace + channel 查詢，不可使用全域 env token fallback 作為 production 主要來源。

建議 selected asset metadata：

```json
{
  "flowType": "facebook_login_for_business",
  "businessId": "masked-business-id",
  "pageId": "masked-page-id",
  "instagramBusinessAccountId": "masked-ig-id",
  "loginConfigurationId": "masked-config-id",
  "selectedAt": "2026-06-15T00:00:00.000Z"
}
```

## Channel Sync 安全驗證重點

Channel sync 必須確認：

- 只同步 callback 授權回來的 selected assets。
- 如果 fallback 掃描 `/me/accounts` 或 `/me/businesses`，需明確標記來源是 fallback。
- 不得把未被使用者選取的 IG asset 自動建立為 channel，除非 Meta flow 明確表示使用者授權全部。
- 每個 channel 的 `configJson` 需標記 `loginProvider`。
- Page token、user token、IG token 的用途要分開，不混用。
- webhook subscription 失敗不能吞掉所有可觀測資訊；但 log 仍不得包含 token。

## App Review 錄影腳本

### 影片段落 1：登入與進入連線頁

旁白：

```text
This is InboxPilot, a SaaS tool for managing Instagram messages, comments, and automations. I am logging in as a test workspace owner and navigating to the social account connection page.
```

畫面：

- 登入 InboxPilot。
- 進入 Channels / Social Accounts。
- 顯示目前尚未連接或準備連接的狀態。

### 影片段落 2：啟動 Business Login

旁白：

```text
I click Connect with Facebook Login for Business. This opens Meta's authorization dialog where the reviewer can choose the Business, Facebook Page, and Instagram professional account to connect.
```

畫面：

- 點擊 Business Login 測試入口。
- Meta dialog 開啟。
- 選擇 Business / Page / IG account。
- 確認 permissions。

### 影片段落 3：Callback 與連線成功

旁白：

```text
After authorization, Meta redirects back to InboxPilot. InboxPilot verifies the OAuth state, exchanges the code server-side, stores encrypted tokens, and creates an Instagram channel in the current workspace.
```

畫面：

- 回到 InboxPilot。
- 顯示連線成功。
- 顯示 Social Accounts / Channels 列表。

### 影片段落 4：展示資料用途

旁白：

```text
The connected Instagram account is used to read profile information, sync comments, receive Instagram messages, and power workspace automations. Tokens are encrypted and never shown in the UI.
```

畫面：

- Channel detail 顯示 IG username / Page name。
- Media 或 comments sync 入口。
- Inbox 顯示測試訊息。
- Automation 顯示留言關鍵字觸發設定。

### 影片段落 5：解除連接與資料刪除

旁白：

```text
The user can disconnect the account and request data deletion. InboxPilot also provides privacy policy, terms, and data deletion pages for Meta review.
```

畫面：

- 顯示解除連接入口。
- 顯示 Privacy Policy。
- 顯示 Data Deletion 頁。

## 不通過 App Review 時的備援方案

如果 Facebook Login for Business / Instagram Business Login 未通過 App Review：

1. 保留目前 Instagram Login flow 作為主要連線方式。
2. 移除或隱藏 Business Login 實驗入口。
3. 將 UI 文案改為「嘗試切換帳號」，避免承諾強制帳號選擇。
4. 使用測試帳號與測試 workspace 繼續補齊 reviewer demo。
5. 將被拒原因整理到 `docs/meta-app-review-checklist.md`。
6. 若拒絕原因是 permission usage 不清楚，補影片與畫面對照。
7. 若拒絕原因是 Business Verification / Advanced Access，先完成 Meta 商業驗證再重送。
8. 若拒絕原因是功能尚未上線，先以 sandbox-only 實驗入口與清楚 demo script 補證據。

## 審核送出前 Checklist

- [ ] Demo 影片沒有露出 token、code、secret。
- [ ] OAuth callback 沒有把 raw query 印到 console 或 audit。
- [ ] Permission 用途與畫面位置一一對應。
- [ ] Reviewer 可以完成 Business / Page / IG account selection。
- [ ] Reviewer 可以看到連線後的 channel。
- [ ] Reviewer 可以看到資料用途：profile、comments、messages、automation。
- [ ] Reviewer 可以找到解除連接與資料刪除入口。
- [ ] Redirect URI 與 Meta App Dashboard 完全一致。
- [ ] 測試 workspace 不含真實客戶資料。
- [ ] 文件與影片中的 id 已遮罩。
