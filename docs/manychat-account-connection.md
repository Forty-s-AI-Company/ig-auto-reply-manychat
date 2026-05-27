# ManyChat 新增 Instagram 帳號流程

本文件記錄 ManyChat 後台「左上角帳號下拉選單 -> New Account -> Instagram -> Connect via Meta -> 使用 Instagram 帳號繼續」的實際操作流程，作為本專案帳號連結體驗的參考。

測試日期：2026-05-22

## 實測結果

這次已成功接上有 remote debugging 的 Codex Chrome，並且使用既有登入狀態進入 ManyChat。

入口頁：

```text
https://app.manychat.com/fb4356719/dashboard
```

### 1. ManyChat Dashboard

成功進入 ManyChat Dashboard，左側可以看到目前帳號：

```text
Amson安生｜數位行銷 x IG變現
```

截圖：

![ManyChat Dashboard](manychat-account-connection/02-connected-chrome-dashboard.png)

### 2. 左上角帳號下拉選單

點擊左上角帳號名稱後，ManyChat 會打開已連結帳號清單，底部有：

```text
New account
```

截圖：

![Account Dropdown](manychat-account-connection/03-account-dropdown.png)

### 3. New Account / Channel Connection

點擊 `New account` 後，進入：

```text
https://app.manychat.com/registration/channelConnection
```

頁面會詢問：

```text
Where would you like to start?
```

可選頻道包含：

- Instagram
- TikTok
- WhatsApp
- Facebook Messenger
- Telegram

截圖：

![Channel Connection](manychat-account-connection/04-new-account-channel-connection.png)

### 4. Instagram 連結頁

點擊 Instagram 後，進入：

```text
https://app.manychat.com/registration/channelConnection/instagram
```

主要按鈕是：

```text
Connect via Meta
```

頁面說明 ManyChat 會帶使用者到 Meta 設定權限，完成後 Instagram 帳號會連結到 ManyChat。

截圖：

![Instagram Channel Page](manychat-account-connection/05-instagram-channel-page.png)

### 5. Meta 登入視窗

點擊 `Connect via Meta` 後，開啟 Meta Business 登入 / OAuth 視窗。

畫面按鈕文字：

```text
使用 Instagram 帳號繼續
```

截圖：

![Meta Popup](manychat-account-connection/06-meta-popup-before-instagram-login.png)

### 6. Instagram 登入頁

點擊「使用 Instagram 帳號繼續」後，進入 Instagram OAuth / Login 頁面。

畫面顯示可選 Instagram 個人檔案：

```text
carry.digital.nomad
ling.yun.energy
使用其他個人檔案
```

截圖：

![Instagram Login](manychat-account-connection/07-after-click-instagram-login.png)

這一步已達成使用者要求的「點用 Instagram 登入」。後續若繼續點選具體 IG 個人檔案，會進入實際授權與帳號連結流程，可能會改動 ManyChat 帳號狀態，因此本次停在這裡。

## 對本專案的產品參考

ManyChat 的流程可以對應到本專案這樣設計：

| ManyChat 行為 | 本專案對應 |
| --- | --- |
| 左上角帳號下拉選單 | `IgAccountSwitcher` |
| 已連結帳號清單 | IG 帳號切換器 |
| `New account` | `+ New Account` |
| Channel Connection | `/channels` 或未來 `/channels/connect` |
| Instagram 卡片 | Instagram 連結選項 |
| `Connect via Meta` | `/api/meta/oauth/start` |
| Meta OAuth 視窗 | Meta / Instagram Login OAuth |
| 使用 Instagram 帳號繼續 | Instagram Login for Business |
| OAuth callback | `/api/meta/oauth/callback` |
| 連結後回到後台 | `/channels?connected=1` |

## 本專案已更新

左上角 IG 帳號切換器已改成對照 ManyChat 截圖的流程與樣式：

- 左上角帳號按鈕使用灰底 rounded 狀態、IG avatar、PRO badge、下拉箭頭。
- 下拉選單顯示已連結帳號卡片、PRO badge、pin icon。
- 下拉選單底部顯示 `New Account` 按鈕。
- 點擊 `New Account` 進入 `/channels/connect`。
- `/channels/connect` 對照 ManyChat `Where would you like to start?` 選平台頁。
- `/channels/connect/instagram` 對照 ManyChat `Connect Instagram` 頁，包含 `Connect Via Meta`、Meta Business Partner 區塊、`See More Options`。
- 展開更多選項後顯示 `Connect Via Instagram` 與 `Meta Business Suite`。
- OAuth 成功後回到 `/channels/connect/success`，顯示 `already connected` 與 `Go To Account`。

相關檔案：

```text
src/components/ManyChatAccountDropdown.tsx
src/components/ChannelConnectionShell.tsx
src/app/channels/connect/page.tsx
src/app/channels/connect/instagram/page.tsx
src/app/channels/connect/success/page.tsx
scripts/test-account-connection-flow.mjs
```

本機驗證截圖：

```text
docs/assets/account-connection-flow/01-account-dropdown.png
docs/assets/account-connection-flow/02-channel-connection.png
docs/assets/account-connection-flow/03-instagram-connect.png
docs/assets/account-connection-flow/04-instagram-more-options.png
docs/assets/account-connection-flow/05-connected-success.png
```

## 原始輔助資料

本次操作也保存了 Playwright / DOM snapshot，方便之後比對 ManyChat UI 文案或元素：

```text
docs/manychat-account-connection/02-page-snapshot.json
docs/manychat-account-connection/03-account-dropdown-snapshot.json
docs/manychat-account-connection/04-new-account-channel-connection-snapshot.json
docs/manychat-account-connection/05-instagram-channel-page-snapshot.json
docs/manychat-account-connection/06-meta-popup-before-instagram-login-snapshot.json
docs/manychat-account-connection/07-after-click-instagram-login-snapshot.json
```

## 2026-05-22 Redirect URI 錯誤與修正

使用者在 Instagram 登入頁選擇 `carry.digital.nomad` 後，第一條 `Connect via Meta` 流程進入錯誤頁：

```text
要求無效: 重新導向 URI 無效。
```

錯誤截圖：

![Instagram Redirect URI Error](manychat-account-connection/08-instagram-redirect-uri-error.png)

實際修正方式：

1. 回到 ManyChat Instagram 連結頁：

```text
https://app.manychat.com/registration/channelConnection/instagram
```

2. 點擊 `See more options`。

3. 改點展開後的：

```text
Connect via Instagram
```

展開更多選項截圖：

![ManyChat More Options](manychat-account-connection/09b-manychat-see-more-options-expanded.png)

4. ManyChat 開啟 Instagram OAuth consent 頁：

```text
Manychat-IG 要求以下用戶的存取權限：carry.digital.nomad
```

權限包含：

- 查看個人檔案和使用影音素材（必要）
- 存取和管理留言
- 存取和管理訊息
- 存取和管理洞察報告

截圖：

![Instagram Consent](manychat-account-connection/11-instagram-consent-page.png)

5. 點擊 `允許`。

6. ManyChat 回到 Instagram 連結頁，顯示：

```text
Carry凱睿｜IG x AI x 不露臉起號 already connected to Amson安生｜數位行銷 x IG變現
```

截圖：

![ManyChat Already Connected](manychat-account-connection/12-after-allow-manychat-ig.png)

7. 點擊 `Go To Account` 後，進入：

```text
https://app.manychat.com/fb4356719/settings#instagram
```

畫面顯示已連結帳號：

```text
@carry.digital.nomad
```

並出現 Instagram channel 設定，例如：

- Default Reply
- Main Menu
- Conversation Starters
- Story Mention Reply
- Refresh Instagram Permissions
- Disable Instagram Channel
- Remove Instagram Account from Manychat

截圖：

![ManyChat Instagram Settings](manychat-account-connection/13-go-to-connected-account.png)

### 結論

`Connect via Meta` 這條路徑在本次測試會導向 Instagram OIDC `redirect_uri` 錯誤；可行修正是使用 ManyChat 頁面中的：

```text
See more options -> Connect via Instagram -> 允許
```

未來如果本專案要參考 ManyChat 的連結體驗，建議在 UI 上保留「主要 Meta 連結」與「Instagram 直接連結」兩條路徑，並在 Meta 路徑失敗時提示使用者改走 Instagram 直接授權。
