# Social Accounts 連接流程參考

這份文件保留 ManyChat 體驗研究的結論，但本專案目前已經收斂成單一的 Social Login OAuth Popup 模組，不再沿用舊的 Instagram / Messenger 分散入口。

## 目前正式流程

使用者從以下入口開始：

```text
/channels/connect/social
```

頁面提供四種 provider：

- `Instagram OAuth`
- `Facebook / Meta Login`
- `Telegram Bot Token`
- `Mock OAuth Provider`

## 標準 Flow

桌機與手機會分兩條路徑，但 provider、callback 與 token exchange 邏輯相同。

桌機：

1. 使用者點擊 `Connect Account`
2. 前端開啟 popup
3. 導向 `/api/oauth/:provider/authorize?transport=popup`
4. provider 完成登入
5. callback 進入 `/api/oauth/:provider/callback`
6. callback bridge 用 `postMessage` 回主視窗
7. 主視窗關閉 popup，刷新已連接狀態

手機：

1. 使用者點擊 `Connect Account`
2. 前端改用同頁導轉，不開 popup
3. 導向 `/api/oauth/:provider/authorize?transport=redirect`
4. Instagram 先顯示網頁登入頁，再進入授權
5. callback 完成後直接 redirect 回 `/channels/connect/social`
6. Social Accounts 頁顯示成功或失敗結果

## 與 ManyChat 研究對照

ManyChat 的研究仍然有價值，但只保留成體驗參考，不再直接映射成舊路由。

| 研究結論 | 現在的本專案做法 |
| --- | --- |
| 需要明確的「新增帳號」入口 | 使用 `/channels/connect` 與 `/channels/connect/social` |
| 桌機要有 popup，手機不能硬套 popup | 桌機走 popup，手機走同頁 redirect |
| 成功後要回到原本管理畫面 | callback 用 `postMessage` 回主視窗 |
| 要看得到帳號是否真的同步成功 | `ConnectedAccount` 與 `Channel` 對應會顯示在 Social Accounts 頁 |

## 為什麼手機不能照桌機做

手機瀏覽器遇到 Instagram 這類登入流程時，`window.open()` 很容易被系統接手，直接丟進 IG App。Manychat 的手感比較像「留在瀏覽器裡完成登入」，所以本專案現在在手機上改成 same-tab redirect，避免把使用者送進原生 App。

## 檔案位置

```text
src/app/channels/connect/page.tsx
src/app/channels/connect/social/page.tsx
src/app/api/oauth/[provider]/authorize/route.ts
src/app/api/oauth/[provider]/callback/route.ts
src/app/api/oauth/[provider]/token/route.ts
src/lib/oauth/
```

## 補充

- 舊的 Instagram / Messenger 頁面現在只保留相容轉址，不再當成主要文件流程。
- 舊的 Meta callback 路由仍保留在後端作相容用途，但新的文件與 UI 一律以 `/api/oauth/:provider/...` 為準。
