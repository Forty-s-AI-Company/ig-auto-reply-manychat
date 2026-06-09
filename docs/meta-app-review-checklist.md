# Meta App Review Checklist

更新日期：2026-06-10

## 目前實際使用的 Meta / Instagram 登入流程

不是單一流程，而是混合：

### A. Generic OAuth provider flow

- `src/app/api/oauth/[provider]/authorize/route.ts`
- `src/app/api/oauth/[provider]/callback/route.ts`
- `src/lib/oauth/providers/meta-facebook.ts`
- `src/lib/oauth/providers/meta-instagram.ts`

### B. Legacy Meta callback flow

- `src/app/api/meta/oauth/start/route.ts`
- `src/app/api/meta/oauth/callback/route.ts`
- `src/app/api/instagram/oauth/callback/route.ts`

### 結論

- `meta-facebook`：Facebook Login / Meta Business Login 風格
- `meta-instagram`：Instagram Login 風格
- 真正的 channel 建立、webhook 訂閱與 Meta asset 綁定，仍大量依賴 legacy Meta callback / meta-channel-sync

## OAuth URL 與體驗重點

### Facebook / Meta flow

來源：

- `src/lib/oauth/providers/meta-facebook.ts`
- `src/app/api/meta/oauth/start/route.ts`

會組成：

- `https://www.facebook.com/v25.0/dialog/oauth?...`
- 部分流程再包進 `business.facebook.com/business/loginpage/...`

參數重點：

- `client_id`
- `redirect_uri`
- `response_type=code`
- `state`
- `scope`
- 可能加上 `auth_type=reauthenticate`
- 可能加上 `auth_type=rerequest`

### Instagram flow

來源：

- `src/lib/oauth/providers/meta-instagram.ts`
- `src/app/api/meta/oauth/start/route.ts`

會組成：

- `https://api.instagram.com/oauth/authorize?...`
- 或先導到
  - `https://www.instagram.com/accounts/login/`
  - `https://www.instagram.com/accounts/logoutin/`

參數重點：

- `client_id`
- `redirect_uri`
- `response_type=code`
- `state`
- `scope`
- `force_authentication=1`
- `enable_fb_login=0`

## 為什麼登入視窗可能直接顯示「允許 / 取消」

原因不是 callback 壞掉，而是：

1. Meta / Instagram 會沿用目前瀏覽器已登入 session
2. 若該 session 已有可用帳號，provider 可能直接跳授權同意畫面
3. `reauthenticate` 也不保證一定出現完整帳號切換器
4. ManyChat 能做得比較像「選帳號」，通常也是因為它把 UX 提示、重新登入、登入入口導向做得更完整，不是因為可以強制 Meta 每次都顯示帳密頁

## 目前需要的 scopes

### Instagram Login flow

- `instagram_business_basic`
- `instagram_business_manage_comments`
- `instagram_business_manage_messages`

### Facebook / Meta flow

在不同實作中出現的 scopes 合併後，正式應以這組為準：

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

至少會碰到：

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

另外正式商用通常還會需要：

- Advanced Access
- Business Verification

## Demo video 要展示的流程

1. 使用者登入 InboxPilot
2. 前往 Social / Channels 連接頁
3. 點選 Instagram 或 Facebook 連接
4. 完成 OAuth
5. 顯示實際綁定的 IG / Page 資訊
6. 選到正確帳號後建立 channel
7. webhook 測試
8. 收到 IG 留言或私訊
9. 觸發自動回覆
10. 在 Inbox 看得到訊息與聯絡人資料
11. 如綁錯帳號，展示解除綁定與重新連接流程

## 測試帳號需求

- Meta app admin / developer 帳號
- 至少 1 個 Facebook Page
- 至少 1 個 Instagram Professional Account / Business Account
- 建議再準備 1 組測試用來模擬綁錯帳號、重連、切換帳號

## 目前卡住的 Meta 設定

1. 流程仍混合 generic OAuth 與 legacy callback
2. 正式對外賣仍需 Meta App Review / Advanced Access / Business Verification
3. 使用者選擇 Page / IG 資產的體驗仍不夠明確
4. production multi-tenant 下不宜繼續依賴 env token fallback

## 安全檢查結果

### 有做到的

- `state` cookie 驗證
- popup state 驗證
- callback 失敗 audit log
- 不把 token / secret / authorization code 寫進 audit

### 仍需收斂的

- 收斂成單一 Meta 連接主流程
- production 移除 env fallback token
- 補更多整合測試覆蓋錯帳號、重連、Page/IG 資產選擇
