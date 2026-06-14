# Meta App Review Checklist

## 2026-06-15：Business Login Demo Script

- 新增 `docs/meta-business-login-app-review-demo-script.md`，整理 Facebook Login for Business / Instagram Business Login 的 reviewer demo 流程、permission usage table、資料使用位置與 redaction checklist。
- 尚未修改產品功能程式碼、OAuth flow、callback route、登入按鈕或 env。
- 送審前需以實際 Meta App Dashboard 設定再次核對 redirect URI、login configuration / `config_id`、Advanced Access 與 Business Verification 狀態。
- Demo 影片不得露出 token、authorization code、state raw value、app secret、client secret 或 webhook verify token。

## 2026-06-15：Business Login 研究規格補充

- 新增 `docs/meta-business-login-experiment-spec.md`，先以文件任務評估 Facebook Login for Business / Instagram Business Login 是否能取代或補強目前 Instagram OAuth。
- 尚未修改 OAuth flow、callback route、登入按鈕或 env。
- 後續 App Review 文件需補：reviewer demo script、permission usage table、Business / Page / IG account selection 錄影流程、token / code / secret redaction 檢查清單。
- 若導入 login configuration / `config_id`，需重新確認 Advanced Access、Business Verification、redirect URI 與測試帳號需求。

更新日期：2026-06-10

## 目前使用的 Meta / Instagram 登入流程

目前是 **混合流程**，不是單一路徑。

### Generic OAuth 入口

- `src/app/api/oauth/[provider]/authorize/route.ts`
- `src/app/api/oauth/[provider]/callback/route.ts`
- `src/app/api/oauth/[provider]/token/route.ts`

### Legacy Meta callback / sync 主流程

- `src/app/api/meta/oauth/start/route.ts`
- `src/app/api/meta/oauth/callback/route.ts`
- `src/app/api/instagram/oauth/callback/route.ts`
- `src/lib/oauth/meta-channel-sync.ts`

### Provider 定義

- `src/lib/oauth/providers/meta-facebook.ts`
- `src/lib/oauth/providers/meta-instagram.ts`

## 目前 OAuth route 與 callback route

### Facebook / Meta

- authorize：
  - `/api/oauth/meta-facebook/authorize`
  - `/api/meta/oauth/start?mode=facebook`
- callback：
  - `/api/oauth/meta-facebook/callback`
  - `/api/meta/oauth/callback`

### Instagram

- authorize：
  - `/api/oauth/meta-instagram/authorize`
  - `/api/meta/oauth/start?mode=instagram`
- callback：
  - `/api/oauth/meta-instagram/callback`
  - `/api/instagram/oauth/callback`
  - `src/app/api/instagram/oauth/callback/route.ts` 目前直接 re-export 到 Meta callback

## 目前使用 scopes

### `meta-instagram`

來源：

- `src/lib/oauth/providers/meta-instagram.ts`
- `src/app/api/meta/oauth/start/route.ts`

scopes：

- `instagram_business_basic`
- `instagram_business_manage_comments`
- `instagram_business_manage_messages`

### `meta-facebook`

來源：

- `src/lib/oauth/providers/meta-facebook.ts`
- `src/app/api/meta/oauth/start/route.ts`

scopes：

- `public_profile`
- `pages_show_list`
- `pages_read_engagement`
- `pages_manage_metadata`
- `pages_messaging`
- `instagram_basic`
- `instagram_manage_comments`
- `instagram_manage_messages`
- `business_management`

## 需要 App Review 的權限

實際商用大概率會碰到：

- `pages_show_list`
- `pages_read_engagement`
- `pages_manage_metadata`
- `pages_messaging`
- `instagram_basic`
- `instagram_manage_comments`
- `instagram_manage_messages`
- `business_management`
- `instagram_business_basic`
- `instagram_business_manage_comments`
- `instagram_business_manage_messages`

另外正式公開商用通常還會需要：

- Advanced Access
- Business Verification

## Demo video 要展示的流程

1. 使用者登入 InboxPilot
2. 前往社群連接頁
3. 點選 Facebook / Instagram 連接
4. 完成 OAuth
5. 成功後顯示實際綁定的 Page / IG 帳號資訊
6. 建立 channel
7. webhook 正常驗證
8. 收到留言 / 私訊事件
9. Inbox 能看到對話
10. Automation 能觸發回覆
11. 若綁錯帳號，展示解除綁定與重新連接

## 測試帳號需求

- Meta app admin / developer 帳號
- 至少 1 個 Facebook Page
- 至少 1 個 Instagram Professional / Business Account
- 建議再準備 1 組帳號用來測試切換帳號、錯綁、重新連接

## 目前卡住的 Meta 設定

1. 流程仍混合 generic OAuth 與 legacy callback
2. 正式可售仍依賴 App Review / Advanced Access / Business Verification
3. 多租戶正式環境不應再依賴 env token fallback
4. 使用者選擇 Page / IG Business Account 的 UX 還不夠明確

## 為什麼登入視窗可能直接顯示允許 / 取消，而不是 IG 帳密登入頁

原因通常是：

1. Meta / Instagram 會沿用目前瀏覽器 session
2. 若該 session 已登入某個帳號，provider 往往直接進授權畫面
3. `reauthenticate` 能增加重新驗證機率，但不保證一定出現完整帳號切換器
4. ManyChat 比較像有「選帳號」體驗，通常是 UX 包裝、重新登入路徑、引導設計比較完整，不是因為可以強制 Meta 每次顯示帳密頁

## 使用者綁錯帳號時的處理建議

目前已有部分 UX：

- Social connect 頁有切換帳號 / 重新連接提示
- channel 可刪除後重連

建議再補強：

1. 成功頁清楚顯示：
   - Facebook Page 名稱
   - Instagram 帳號名稱
   - 綁定來源是 Facebook Login 還是 Instagram Login
2. 若偵測到同 workspace 已有既有 IG 綁定，提醒使用者是否覆蓋 / 新增
3. 提供一鍵解除綁定與重新連接入口
4. production 模式禁用 env fallback，避免誤以為綁定成功其實用的是舊 token
