# Meta Business Login Account Selection 測試矩陣

更新日期：2026-06-15

## 文件目的

本文件定義 Facebook Login for Business / Instagram Business Login 的 account selection 測試矩陣，用來判斷新登入方案是否能比目前 Instagram OAuth 更接近 ManyChat 的帳號選擇體驗。

本文件只做測試規格與驗收標準，不修改產品功能程式碼，不修改 OAuth flow，不修改 callback route，不修改登入按鈕，不修改 env。

## 測試目標

1. 驗證不同 Meta / Instagram session 狀態下，授權視窗是否顯示 account selection。
2. 驗證 popup 與 redirect transport 的差異。
3. 驗證桌機 Chrome 與手機瀏覽器的差異。
4. 驗證 callback 成功、取消、錯誤與部分授權結果。
5. 驗證 workspace linking / channel sync 是否能明確連到使用者選擇的 IG account。
6. 判斷是否足以接近 ManyChat 的 Business / Page / IG account selection UX。

## 測試前提

測試前需準備：

- Meta test app。
- Facebook Login for Business 或 Instagram Business Login 設定。
- 測試用 HTTPS callback domain。
- 測試用 InboxPilot workspace。
- 測試用 Facebook 帳號 A。
- 測試用 Facebook 帳號 B。
- 測試用 Instagram Professional / Business 帳號 A。
- 測試用 Instagram Professional / Business 帳號 B。
- 至少一個 Facebook Page 與 IG account 正確連結。
- 測試紀錄表需保存截圖，但不得保存 token、authorization code、state raw value、secret。

## 測試維度

### Session 狀態

| 編號 | Session 狀態 | 說明 |
| --- | --- | --- |
| S0 | 未登入 Meta / Facebook / Instagram | 瀏覽器無相關 session 或使用乾淨 profile。 |
| S1 | 已登入單一 Facebook 帳號 | 僅登入 Facebook 帳號 A。 |
| S2 | 已登入單一 Instagram 帳號 | 僅登入 IG 帳號 A。 |
| S3 | 已登入 Facebook + Instagram，同一人資產 | Facebook A 與 IG A 均為同一測試使用者管理。 |
| S4 | 曾登入多個 Facebook 帳號 | 瀏覽器曾登入 Facebook A / B，可能有 account switcher。 |
| S5 | 曾登入多個 Instagram 帳號 | 瀏覽器曾登入 IG A / B，可能有 account switcher。 |
| S6 | 已登入不具 Page / IG 權限的帳號 | Facebook B 或 IG B 沒有目標資產權限。 |
| S7 | 已登入錯誤 Business 的帳號 | 帳號有 Business，但不是測試目標 Business。 |

### Transport

| 編號 | Transport | 說明 |
| --- | --- | --- |
| T1 | Desktop popup | 桌機 Chrome，使用 popup。 |
| T2 | Desktop redirect | 桌機 Chrome，強制同頁 redirect。 |
| T3 | Mobile redirect | 手機瀏覽器，預期使用 redirect。 |
| T4 | Mobile in-app browser | Instagram / Facebook 內建瀏覽器，若可測則記錄。 |

### Flow

| 編號 | Flow | 說明 |
| --- | --- | --- |
| F1 | 目前 Instagram OAuth | 現有 `meta-instagram` baseline。 |
| F2 | Facebook Login for Business | 目標候選方案。 |
| F3 | Instagram Business Login | 目標候選方案。 |
| F4 | Instagram API with Facebook Login | 目前 `meta-facebook` 近似方案。 |

## 桌機 Chrome 測試矩陣

| 測試 ID | Session | Transport | Flow | 預期 Meta Dialog | Callback 預期 | UX 判定 |
| --- | --- | --- | --- | --- | --- | --- |
| D-001 | S0 | T1 | F2 | 顯示 Facebook 登入，登入後顯示 Business / Page / IG 選擇。 | success，回傳 selected Business / Page / IG。 | 接近 ManyChat。 |
| D-002 | S1 | T1 | F2 | 直接顯示 Business / Page / IG 選擇，不應只顯示允許 / 取消。 | success，資產明確。 | 接近 ManyChat。 |
| D-003 | S4 | T1 | F2 | 顯示帳號切換或 Business / Page / IG 選擇。 | success 或 user_cancel。 | 若可切帳號則接近。 |
| D-004 | S6 | T1 | F2 | 顯示無可用資產或要求切換帳號。 | no_asset 或 permission_denied。 | 可接受，但需清楚錯誤。 |
| D-005 | S0 | T2 | F2 | 同頁登入後顯示 Business / Page / IG 選擇。 | success。 | 接近 ManyChat。 |
| D-006 | S1 | T2 | F2 | 同頁顯示 Business / Page / IG 選擇。 | success。 | 接近 ManyChat。 |
| D-007 | S2 | T1 | F3 | 顯示 Instagram 登入或 IG account 選擇。 | success，回傳 IG id。 | 部分接近。 |
| D-008 | S5 | T1 | F3 | 顯示 IG account switcher 或登入畫面。 | success 或 user_cancel。 | 若可切 IG 則接近。 |
| D-009 | S3 | T1 | F4 | 可能直接顯示 Facebook OAuth 權限確認。 | success，需掃 Page / IG。 | 不完全接近 ManyChat。 |
| D-010 | S4 | T1 | F4 | 可能顯示 Facebook account switcher 或只顯示允許 / 取消。 | success 或 wrong_account。 | 需記錄差距。 |

## 手機瀏覽器測試矩陣

| 測試 ID | Session | Transport | Flow | 預期 Meta Dialog | Callback 預期 | UX 判定 |
| --- | --- | --- | --- | --- | --- | --- |
| M-001 | S0 | T3 | F2 | 手機登入後進入 Business / Page / IG 選擇。 | success。 | 接近 ManyChat。 |
| M-002 | S1 | T3 | F2 | 顯示 Business / Page / IG 選擇。 | success。 | 接近 ManyChat。 |
| M-003 | S4 | T3 | F2 | 顯示切換帳號或資產選擇。 | success / user_cancel。 | 視切換能力判定。 |
| M-004 | S2 | T3 | F3 | 顯示 IG 登入或 IG account selection。 | success。 | 部分接近。 |
| M-005 | S5 | T3 | F3 | 應測試 `force_reauth` 是否改善多帳號切換。 | success / wrong_account。 | 關鍵測項。 |
| M-006 | S6 | T3 | F2 | 顯示無資產或切換帳號提示。 | no_asset。 | 可接受。 |
| M-007 | S3 | T4 | F2 | 內建瀏覽器可能沿用 app session。 | success / wrong_account。 | 需特別記錄。 |
| M-008 | S5 | T4 | F3 | 內建瀏覽器可能直接使用 IG app session。 | success / wrong_account。 | 若無法選帳號則不接近。 |

## Baseline：目前 Instagram OAuth 測試矩陣

| 測試 ID | Session | Transport | Flow | 預期畫面 | Callback 預期 | 結論用途 |
| --- | --- | --- | --- | --- | --- | --- |
| B-001 | S0 | T1 | F1 | 顯示 Instagram 登入畫面。 | success。 | baseline。 |
| B-002 | S2 | T1 | F1 | 可能直接顯示允許 / 取消。 | success。 | 對照目前問題。 |
| B-003 | S5 | T1 | F1 | `logoutin` 可能嘗試登出再登入，但不保證。 | success / wrong_account。 | 驗證 workaround 不穩定。 |
| B-004 | S2 | T3 | F1 | 手機可能直接使用既有 IG session。 | success。 | 對照 mobile 問題。 |
| B-005 | S5 | T3 | F1 | 多帳號下可能無法明確選帳號。 | wrong_account / success。 | 對照 ManyChat 差距。 |

## 每個情境應記錄的畫面

每個測試案例需記錄：

- 是否出現登入畫面。
- 是否出現 Facebook account switcher。
- 是否出現 Instagram account switcher。
- 是否出現 Business 選擇。
- 是否出現 Page 選擇。
- 是否出現 IG account 選擇。
- 是否只出現「允許 / 取消」。
- 是否有「編輯先前設定」或類似 asset management 入口。
- 使用者取消時畫面與 callback 結果。
- 授權部分 asset 時畫面與 callback 結果。

截圖注意：

- 不截 token。
- 不截 authorization code。
- 不截 raw state。
- 可遮罩 email、個人帳號名稱與 external id。

## Callback 預期結果

### 成功

```json
{
  "status": "success",
  "provider": "meta-business-instagram",
  "flowType": "facebook_login_for_business",
  "selectedBusinessId": "masked",
  "selectedPageId": "masked",
  "selectedInstagramBusinessAccountId": "masked",
  "channelCount": 1
}
```

### 使用者取消

```json
{
  "status": "error",
  "errorType": "user_cancel",
  "safeMessage": "User cancelled Meta authorization."
}
```

### State 驗證失敗

```json
{
  "status": "error",
  "errorType": "invalid_state",
  "safeMessage": "OAuth state verification failed."
}
```

### 沒有可用資產

```json
{
  "status": "error",
  "errorType": "no_asset",
  "safeMessage": "No usable Instagram professional account was returned."
}
```

### 權限不足

```json
{
  "status": "error",
  "errorType": "permission_denied",
  "safeMessage": "Required permissions were not granted."
}
```

### 錯誤帳號

```json
{
  "status": "error",
  "errorType": "wrong_account",
  "safeMessage": "The authorized account does not include the selected workspace target asset."
}
```

## 錯誤分類

| Error Type | 定義 | UI 建議 | 是否可重試 |
| --- | --- | --- | --- |
| `user_cancel` | 使用者按取消或關閉視窗。 | 顯示「尚未完成連線」。 | 是 |
| `invalid_state` | state 不存在、過期或不相符。 | 顯示「連線逾時，請重新開始」。 | 是 |
| `permission_denied` | 使用者拒絕必要權限。 | 顯示缺少哪些權限與原因。 | 是 |
| `no_asset` | Meta 沒回傳可用 IG / Page。 | 提示確認 IG 是否為 Professional 並連結 Page。 | 是 |
| `wrong_account` | 授權的是非預期帳號或資產。 | 提示切換 Meta / IG 帳號後重試。 | 是 |
| `token_exchange_failed` | server-side token exchange 失敗。 | 顯示安全摘要，勿露出 code。 | 是 |
| `callback_provider_error` | Meta callback 帶回 error。 | 顯示 Meta 安全錯誤摘要。 | 視情況 |
| `channel_sync_failed` | token 成功但 channel 建立失敗。 | 顯示「授權成功但同步失敗」。 | 是 |

## Workspace Linking 驗證項目

每個成功案例都要驗證：

- `workspaceId` 來自 server-side state 或 authenticated user，不來自 query。
- `ConnectedAccount` 建立或更新在正確 workspace。
- `Channel` 建立或更新在正確 workspace。
- 同一 workspace 同一 IG account 不建立重複 channel。
- 同一 IG account 在不同 workspace 的政策明確。
- `configJson.loginProvider` 正確標記來源。
- `instagramBusinessAccountId` 或 `instagramOauthUserId` 有被保存。
- channel display name 可改，但 identity 不依賴 display name。
- mock channel 若需停用，僅停用同 workspace 的 mock channel。

## Channel Sync 驗證項目

每個成功案例都要驗證：

- 只同步使用者授權 / 選擇的 assets。
- 若使用 fallback `/me/accounts` 或 `/me/businesses`，需標記 fallback source。
- 不自動建立未被選擇的其他 IG channel。
- Page token、user token、IG token 來源與用途清楚。
- token 只加密保存，不在 UI / log / audit 顯示。
- webhook subscription 若失敗，不影響 account linking，但需留下安全錯誤摘要。
- comment sync / media sync / inbox query 都限制 workspace + channel。

## 是否接近 ManyChat UX 的判定標準

### P0 必須達成

- 使用者能在 Meta dialog 中明確選擇 Business。
- 使用者能在 Meta dialog 中明確選擇 Page。
- 使用者能在 Meta dialog 中明確選擇 Instagram Professional / Business Account。
- callback 能知道實際被選取的 IG account。
- InboxPilot 只建立被選取的 IG channel。
- 使用者授權錯帳號時，有可理解的錯誤與重試路徑。

### P1 建議達成

- 已登入單一帳號時，不只顯示「允許 / 取消」，仍可檢視或調整 asset selection。
- 曾登入多個帳號時，有官方帳號切換或重新登入入口。
- 手機 redirect flow 不會比桌機 popup flow 少關鍵選擇步驟。
- App Review demo 能穩定重現選 Business / Page / IG 的流程。

### 不足以接近 ManyChat 的判定

若出現以下任一情況，視為不夠接近 ManyChat：

- 大多數已登入 session 只顯示「允許 / 取消」。
- 無法在授權流程中選 Business / Page / IG。
- callback 無法知道使用者選了哪個 IG。
- 系統必須在 callback 後掃描全部 `/me/accounts` 才猜測目標 IG。
- 多 IG 情境下容易連錯帳號。
- 手機 flow 直接使用既有 app session，且沒有切換入口。

## 測試紀錄模板

```text
測試 ID：
日期：
測試人員：
Flow：
Transport：
瀏覽器 / 裝置：
Session 狀態：
Meta dialog 實際畫面：
是否可選 Facebook account：
是否可選 Business：
是否可選 Page：
是否可選 IG account：
是否只顯示允許 / 取消：
Callback 結果：
錯誤分類：
ConnectedAccount 結果：
Channel sync 結果：
Workspace isolation 檢查：
Token redaction 檢查：
是否接近 ManyChat：
備註：
```

## 建議下一步

1. 先用本矩陣測目前 `meta-instagram` flow，建立 baseline。
2. 再用同一組情境測 Facebook Login for Business sandbox flow。
3. 最後測 Instagram Business Login sandbox flow。
4. 將三組結果整理成比較表，再決定是否進入產品實作。
