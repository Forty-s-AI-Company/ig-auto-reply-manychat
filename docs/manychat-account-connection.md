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

## 標準 Popup Flow

1. 使用者點擊 `Connect Account`
2. 前端開啟 popup
3. 導向 `/api/oauth/:provider/authorize`
4. provider 完成登入或 token 驗證
5. callback 進入 `/api/oauth/:provider/callback`
6. 伺服器完成 token exchange 或 token validate
7. token 安全寫入 `ConnectedAccount`
8. callback 頁用 `postMessage` 把結果傳回主視窗
9. 主視窗關閉 popup，刷新已連接狀態

## 與 ManyChat 研究對照

ManyChat 的研究仍然有價值，但只保留成體驗參考，不再直接映射成舊路由。

| 研究結論 | 現在的本專案做法 |
| --- | --- |
| 需要明確的「新增帳號」入口 | 使用 `/channels/connect` 與 `/channels/connect/social` |
| 需要 popup 授權，不要整頁跳轉 | 全部 provider 統一走 popup |
| 成功後要回到原本管理畫面 | callback 用 `postMessage` 回主視窗 |
| 要看得到帳號是否真的同步成功 | `ConnectedAccount` 與 `Channel` 對應會顯示在 Social Accounts 頁 |

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
