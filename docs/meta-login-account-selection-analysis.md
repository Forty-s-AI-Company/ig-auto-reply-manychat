# Meta / Instagram 登入帳號選擇分析

更新日期：2026-06-15

## 本次結論

目前 InboxPilot 新增 IG 平台帳號時，主要使用 `meta-instagram` 的 Instagram OAuth 流程，入口是 `/api/oauth/meta-instagram/authorize?fresh_login=1`。程式會轉到 Instagram OAuth authorize URL，並固定帶上 `force_authentication=1` 與 `enable_fb_login=0`。

這不是 ManyChat 常見的 Meta Business onboarding / Facebook Login for Business 多步驟帳號選擇體驗，也不是單純的 Facebook Login。專案內仍保留 Facebook / Meta Login 與舊版 Meta Business Login 相容路徑，但目前連線頁的 Instagram 主按鈕走的是 Instagram Login 類型流程。

以目前 Meta 官方公開參數來看，可以提高重新驗證或重新要求權限的機率，但不能穩定保證「每次都開一個完全未登入視窗」，也不能由第三方網站強制清掉使用者在 `facebook.com`、`instagram.com`、`business.facebook.com` 的瀏覽器 session。這點有點像我們以為多加一個參數就能控制全世界，結果瀏覽器 cookie 很冷靜地說：不，你不能。

## 目前實際使用的登入流程

### 主要 UI 入口

檔案：`src/app/channels/connect/social/page.tsx`

- Instagram 主按鈕：`/api/oauth/meta-instagram/authorize?fresh_login=1`
- Instagram 次要切換按鈕：`/api/oauth/meta-instagram/authorize?switch_account=1`
- Facebook / Meta 主按鈕：`/api/oauth/meta-facebook/authorize`
- Facebook / Meta 次要切換按鈕：`/api/oauth/meta-facebook/authorize?switch_account=1&reauth=1&rerequest=1`

### 判斷

| Provider | 目前流程判斷 | 理由 |
| --- | --- | --- |
| `meta-instagram` | Instagram Business Login / Instagram Login 類型 OAuth | 使用 `https://www.instagram.com/oauth/authorize`，scope 為 `instagram_business_*`，token endpoint 使用 `https://api.instagram.com/oauth/access_token`。 |
| `meta-facebook` | Facebook Login / Graph OAuth | 使用 `https://www.facebook.com/v25.0/dialog/oauth`，scope 包含 Pages、Messenger、Instagram Graph 權限。 |
| `/api/meta/oauth/start?mode=facebook` | Legacy / 相容用 Meta Business Login 包裝流程 | 會先組 Facebook dialog URL，再包進 `https://business.facebook.com/business/loginpage/`。目前不是連線頁主按鈕。 |
| `/api/meta/oauth/start?mode=instagram` | Legacy / 相容用 Instagram OAuth | 使用 `https://api.instagram.com/oauth/authorize`，可帶 `prompt=login` 與 `auth_type=reauthenticate`，但目前不是連線頁主按鈕。 |

## 目前流程圖

```text
使用者在 /channels/connect/social 點擊 Instagram OAuth
  |
  v
OAuthPopupConnectButton 開 popup，手機改同頁 redirect
  |
  v
/api/oauth/meta-instagram/authorize?fresh_login=1&transport=popup
  |
  v
寫入 popup state cookie、Meta 相容 cookie、workspace cookie
  |
  v
metaInstagramProvider.getAuthUrl()
  |
  v
fresh_login=1 時導向：
https://www.instagram.com/accounts/logoutin/?force_classic_login=&next=/oauth/authorize?...
  |
  v
Instagram OAuth authorize / allow / cancel
  |
  v
/api/instagram/oauth/callback
  |
  v
src/app/api/meta/oauth/callback/route.ts
  |
  v
驗證 state、交換 token、讀取 Instagram profile
  |
  v
upsert ConnectedAccount
  |
  v
syncConnectedAccountToChannel()
  |
  v
upsert workspace 內的 Instagram Channel
  |
  v
popup bridge postMessage 回 /channels/connect/social
```

## OAuth authorize URL 完整內容

以下用變數表示敏感值與環境值，避免把 app id、state、domain 寫進文件。

### 目前 UI Instagram 主按鈕實際產生

第一段由 InboxPilot 導向：

```text
/api/oauth/meta-instagram/authorize?fresh_login=1&transport=popup
```

Provider 最終組成：

```text
https://www.instagram.com/accounts/logoutin/
  ?force_classic_login=
  &next=/oauth/authorize
    ?client_id={META_INSTAGRAM_APP_ID 或 META_APP_ID}
    &redirect_uri={APP_URL}/api/instagram/oauth/callback
    &response_type=code
    &state={random_state}
    &force_authentication=1
    &enable_fb_login=0
    &scope=instagram_business_basic,instagram_business_manage_comments,instagram_business_manage_messages
```

如果沒有 `fresh_login=1` / `switch_account=1`，會直接導向：

```text
https://www.instagram.com/oauth/authorize
  ?client_id={META_INSTAGRAM_APP_ID 或 META_APP_ID}
  &redirect_uri={APP_URL}/api/instagram/oauth/callback
  &response_type=code
  &state={random_state}
  &force_authentication=1
  &enable_fb_login=0
  &scope=instagram_business_basic,instagram_business_manage_comments,instagram_business_manage_messages
```

### 目前 UI Facebook / Meta 主按鈕實際產生

```text
https://www.facebook.com/v25.0/dialog/oauth
  ?client_id={META_APP_ID}
  &redirect_uri={APP_URL}/api/meta/oauth/callback
  &response_type=code
  &state={random_state}
  &scope=public_profile,pages_show_list,pages_read_engagement,pages_manage_metadata,pages_messaging,instagram_basic,instagram_manage_comments,instagram_manage_messages,business_management
```

次要切換按鈕會額外帶：

```text
auth_type=reauthenticate
```

注意：`switch_account=1&reauth=1&rerequest=1` 同時存在時，目前程式因 `if / else if` 只會輸出 `auth_type=reauthenticate`，不會同時輸出 `auth_type=rerequest`。

### Legacy Meta Business Login 相容路徑

`/api/meta/oauth/start?mode=facebook` 會組：

```text
https://www.facebook.com/{META_GRAPH_API_VERSION 或 v25.0}/dialog/oauth
  ?client_id={META_APP_ID}
  &redirect_uri={APP_URL}/api/meta/oauth/callback
  &response_type=code
  &state={random_state}
  &scope=pages_show_list,pages_read_engagement,pages_manage_metadata,pages_messaging,instagram_basic,instagram_manage_messages,business_management
```

再包進：

```text
https://business.facebook.com/business/loginpage/
  ?next={encoded_facebook_dialog_url}
  &login_options[0]=FB
  &login_options[1]=IG
  &login_options[2]=SSO
  &config_ref=biz_login_tool_flavor_mbs
```

如果 `login=instagram`，會改用：

```text
https://business.facebook.com/business/loginpage/new/
  ?next={encoded_facebook_dialog_url}
  &login_options[0]=IG
  &config_ref=biz_login_tool_flavor_mbs
```

## 參數檢查

| 參數 | 目前是否使用 | 使用位置 | 備註 |
| --- | --- | --- | --- |
| `auth_type=reauthenticate` | 有，Facebook 次要按鈕；legacy Instagram `switch_account=1` 也會帶 | `meta-facebook.ts`、`api/meta/oauth/start` | Facebook 官方支援 re-authentication；Instagram 是否穩定生效需實測。 |
| `auth_type=rerequest` | 有條件支援，但目前 Facebook 次要按鈕同時帶 `reauth` 時不會輸出 | `meta-facebook.ts` | 官方用於重新要求被拒絕權限；不是帳號切換。 |
| `prompt` | legacy Instagram `switch_account=1` 會輸出 `prompt=login` | `api/meta/oauth/start` | generic `meta-instagram` 目前沒有輸出。 |
| `login_hint` | 沒有 | 無 | 未看到程式使用。 |
| `force_reauth` | 沒有 | 無 | 官方 changelog 曾建議 Business Login for Instagram 使用，但目前程式沒有帶。 |
| `force_authentication` | 有 | `meta-instagram.ts`、`api/meta/oauth/start` | Instagram OAuth authorize 固定帶 `force_authentication=1`。 |
| `display` | legacy Facebook + `login=instagram` 時帶 `display=page` | `api/meta/oauth/start` | generic provider 沒有使用。 |
| `response_type=code` | 有 | 全部 OAuth authorize URL | 目前都是 Authorization Code Flow。 |
| `enable_fb_login=0` | 有 | Instagram OAuth | 禁用 Instagram OAuth 頁面的 Facebook Login 選項。 |

## 與 ManyChat 的差異

目前 InboxPilot 的主流程偏向「直接連單一 Instagram professional account」：

- 用 Instagram OAuth endpoint。
- 依賴目前瀏覽器內的 Instagram / Meta session。
- 用 `logoutin`、`force_authentication` 嘗試讓使用者重新登入或切換。
- 成功後直接 upsert `ConnectedAccount`，再同步成 workspace 內的 Instagram channel。

ManyChat 看到的體驗比較像「Meta Business / Account Selection onboarding」：

- 可能使用 Facebook Login for Business 或 Business Login for Instagram。
- 可能使用 Meta App Dashboard 內建立的 login configuration / `config_id` 類型流程。
- 可能讓使用者選 Business、Page、IG account、權限與資產。
- 可能透過 `business.facebook.com/business/loginpage` 或 Meta Business Extension 類型入口包住 OAuth。
- 可能使用較完整的瀏覽器 session handling，例如新視窗、不同網域入口、或引導使用者先切換 Meta session。

以上 ManyChat 部分是基於目前程式與 Meta 官方機制做的推測，沒有 ManyChat 內部實作可直接驗證。

## 是否能做到強制重新登入

部分可以，但不能保證等同「未登入視窗」。

可行的官方或半官方方式：

- Facebook Login：使用 `auth_type=reauthenticate` 讓使用者重新確認身分。
- Facebook Login：使用 `auth_type=rerequest` 重新要求曾被拒絕的權限。
- Instagram OAuth：目前已使用 `force_authentication=1`。
- Business Login for Instagram：Meta changelog 提到 `force_authentication`、`enable_fb_login`，也有資料提到 `force_reauth` 建議用於 mobile flow。

限制：

- re-authentication 通常是確認同一個已登入者，不等於帳號選擇器。
- `rerequest` 是權限重新要求，不是切換帳號。
- 第三方網站不能清除 Meta / Instagram 網域 cookie。
- 如果瀏覽器已登入 Meta 帳號，Meta 可能直接顯示「允許 / 取消」，而不是帳密登入畫面。

## 是否能做到強制切換帳號

不能穩定保證。

目前 `meta-instagram` 透過 `https://www.instagram.com/accounts/logoutin/` 搭配 `next=/oauth/authorize?...` 嘗試讓 Instagram 走登出再登入路徑；這比較像瀏覽器 session workaround，不是明確的 OAuth 標準帳號選擇參數。

目前 `meta-facebook` 透過 `auth_type=reauthenticate` 嘗試重新驗證，但官方語意是重新確認身分，不是強制開帳號選擇器。

如果要接近 ManyChat，需要改成更完整的 Meta Business onboarding / Facebook Login for Business / Instagram Business Login account selection flow，而不是只在既有 URL 上加參數。

## 可行方案

1. 短期：保留目前 Instagram OAuth 主流程，文件與 UI 說明「若要切換帳號，請先在 Instagram / Facebook / Meta Business 登出或切換帳號後再重新連接」。
2. 短期：評估在 `meta-instagram` generic provider 補上官方建議的 `force_reauth`，但需先在測試 app 實測，且這會是功能程式碼改動，本任務不處理。
3. 中期：整理 `fresh_login`、`switch_account`、`reauth`、`rerequest` 的語意，避免 UI 文案暗示一定能切帳號。
4. 中期：建立 Facebook Login for Business / Instagram Business Login 的正式設定研究，確認是否要導入 `config_id` 或 Meta App Dashboard 的 login configuration。
5. 中長期：若目標是 ManyChat 類似 UX，新增一條 Meta Business onboarding flow，讓使用者選 Business / Page / IG asset，再回寫 channel。

## 不可行方案

1. 只靠 `auth_type=reauthenticate` 保證帳號切換：不可行，這是重新驗證，不是帳號選擇。
2. 只靠 `auth_type=rerequest` 保證帳號切換：不可行，這是重新要求權限。
3. 由 InboxPilot 清除 `facebook.com` / `instagram.com` cookie：不可行，瀏覽器同源政策不允許。
4. 在 popup 使用 incognito / private session：一般網站無法程式化開啟使用者瀏覽器的無痕視窗。
5. 在 callback 階段才決定帳號選擇：太晚了，callback 已經是 Meta 決定授權者後回來。

## 建議實作方案

建議分兩階段處理。

第一階段先不改 OAuth flow，只做產品與文件修正：

- 將 UI 文案調整為「重新連接 / 嘗試切換帳號」，不要承諾一定能強制切換。
- 在連線頁提供明確操作提示：若 Meta 直接顯示允許，請先到 Instagram / Facebook / Business Manager 登出或切換帳號。
- 在 App Review 文件中補上目前使用 Instagram OAuth 與 Facebook Graph OAuth 的差異。

第二階段再做技術方案評估：

- 建一支實驗分支測試 Facebook Login for Business / Instagram Business Login。
- 檢查 Meta App Dashboard 是否能建立 login configuration，並取得必要的 `config_id`。
- 比較三種 flow：
  - Instagram OAuth：快速、單帳號、但帳號選擇控制弱。
  - Facebook Login：可取得 Page / IG asset，但 UX 可能偏傳統權限授權。
  - Facebook Login for Business / Business Login for Instagram：最接近 ManyChat，但需要 App Review、Business Verification、login configuration 與更完整 QA。

## 高風險觀察

本任務不修改功能程式碼，只記錄風險：

- 目前 generic `meta-instagram` 實際 callback 使用 legacy `/api/instagram/oauth/callback`，而不是 `/api/oauth/meta-instagram/callback`，兩套 callback 並存，長期維護風險較高。
- `meta-facebook` 次要切換按鈕同時帶 `reauth=1&rerequest=1`，但程式只輸出 `auth_type=reauthenticate`，UI 語意可能比實際效果強。
- `logoutin` 是 session handling workaround，不應當被視為 Meta 官方帳號選擇保證。
- `ConnectedAccount` 與 `Channel` 都有 workspace 限制與 unique key，帳號 upsert 邏輯看起來有 tenant 邊界，但 Meta OAuth flow 並存會增加 QA 與 App Review 說明成本。

## 官方資料參考

- Meta for Developers：Facebook Login manual flow，說明 OAuth dialog 與 `auth_type=rerequest`。
  - `https://developers.facebook.com/documentation/facebook-login/guides/advanced/manual-flow`
- Meta for Developers：Facebook Login re-authentication，說明 `auth_type=reauthenticate` 用於重新確認身分。
  - `https://developers.facebook.com/documentation/facebook-login/guides/advanced/re-authentication`
- Meta for Developers：Facebook Login for Business，說明這是 tech providers 建置 Meta business tools integrations 的建議登入授權方案。
  - `https://developers.facebook.com/documentation/facebook-login/facebook-login-for-business`
- Meta for Developers：Business Login for Instagram。
  - `https://developers.facebook.com/docs/instagram-platform/instagram-api-with-instagram-login/business-login/`
- Meta for Developers：Instagram Platform changelog，提到 Instagram OAuth authorization request 支援 `enable_fb_login`，並列出 Business Login for Instagram 的 `enable_fb_login`、`force_authentication` 等參數。
  - `https://developers.facebook.com/docs/instagram-platform/changelog/`
