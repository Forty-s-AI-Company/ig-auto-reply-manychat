# ADR: Meta Business Login 實作前技術決策

狀態：Proposed，僅供文件決策與 sandbox-only 實驗使用  
日期：2026-06-15  
範圍：Meta / Instagram 帳號連接流程、App Review、OAuth callback、workspace linking、channel sync

## 背景

InboxPilot 目前新增 Instagram 平台帳號時，會開啟 OAuth 視窗。實際體感上，Meta dialog 會沿用目前瀏覽器已登入的 Meta / Instagram session，因此使用者常只看到授權的「允許 / 取消」，而不是 ManyChat 類似的登入或帳號選擇畫面。

本 ADR 只做實作前決策紀錄，不修改產品功能程式碼、不改 OAuth flow、不改 callback route、不改登入按鈕、不改 env。

## 目前 Instagram OAuth flow 的限制

目前 `meta-instagram` 主要走 Instagram OAuth 授權流程，並依 provider 建構 authorize URL。既有研究文件已確認目前流程仍高度依賴瀏覽器端 Meta / Instagram session。

主要限制：

1. 第三方 SaaS 無法清除使用者瀏覽器中的 Meta / Instagram cookie。
2. OAuth dialog 是否出現登入頁，主要由 Meta 當下 session 狀態決定。
3. `force_authentication` 類參數可以提高重新驗證機率，但不能保證每次都像全新未登入視窗。
4. 目前流程偏向授權既有 session，不是完整的 Business / Page / IG account selection onboarding。
5. 若使用者已登入錯誤 Meta 帳號，系統只能在 callback 後檢查資產歸屬並拒絕錯誤連結，無法在瀏覽器層強制切換帳號。
6. 若要接近 ManyChat 體驗，需要評估 Meta 官方的 business login / business asset selection 機制，而不是只靠現有 Instagram OAuth URL 參數。

## 決策選項

### 選項 A：維持現狀

維持目前 Instagram OAuth flow，不導入 Facebook Login for Business 或 Instagram Business Login。

優點：

- 對現有產品風險最低。
- 不需要立即新增 Meta App Review 範圍。
- 不需要調整 env、callback、ConnectedAccount、Channel、workspace linking。
- 可繼續使用既有 callback 與 channel sync 驗證邏輯。

缺點：

- 無法穩定做到 ManyChat 類似的帳號選擇 UX。
- 使用者若瀏覽器已登入錯誤帳號，仍可能直接進入授權 dialog。
- Business / Page / IG account selection 不是 onboarding 主流程的一部分。
- 後續若要做多品牌、多客戶代理商情境，使用者教育成本較高。

### 選項 B：Facebook Login for Business

建立 sandbox-only provider，評估 Facebook Login for Business 是否可取代或補強目前 Instagram OAuth flow，讓使用者在 Meta 官方 dialog 中選 Business、Page 與已連結的 IG account。

優點：

- 最可能接近 ManyChat 的 Business / Page / IG asset selection 體驗。
- 適合代理商、多粉專、多 IG 帳號的 workspace onboarding。
- 可把 Page、Business、Instagram professional account 的資產選擇前移到 Meta dialog。
- App Review demo 可以清楚展示權限用途與資料使用方式。

缺點：

- 需要重新確認 App Review 權限、Business verification、測試帳號與錄影腳本。
- 可能需要新增 env key、redirect URI、provider id 與 callback 分流。
- callback 需要更嚴格處理 code exchange、state、workspace 綁定與錯誤分類。
- 若 App Review 不通過，不能作為正式產品主流程。

### 選項 C：Instagram Business Login

評估 Meta 官方 Instagram Business Login 是否可作為新的 Instagram account onboarding 流程，重點放在 IG professional account 授權與帳號選擇。

優點：

- 名義上最貼近「新增 Instagram 帳號」的產品語意。
- 若 Meta dialog 能提供 IG account selection，使用者理解成本較低。
- 可降低使用者誤以為是在連 Facebook 個人帳號的疑慮。

缺點：

- 仍需實測 account selection 行為是否真的優於現況。
- 可能仍受瀏覽器 session 影響，未必保證每次顯示登入頁。
- 與 Page / Business asset 的關係、可取得欄位、權限名稱與 App Review 要求需重新確認。
- 若 callback 回傳資料不足以支援 workspace linking / channel sync，仍需 fallback 到 Facebook Login for Business 或維持現狀。

## 方案比較

| 面向 | 維持現狀 | Facebook Login for Business | Instagram Business Login |
| --- | --- | --- | --- |
| 是否改正式產品 | 不改 | 不建議直接改，先 sandbox-only | 不建議直接改，先 sandbox-only |
| 接近 ManyChat UX | 低 | 高，需實測確認 | 中到高，需實測確認 |
| 強制每次未登入 | 不能保證 | 不能保證，但可能有更好的 account selection | 不能保證，需實測 |
| 強制切換帳號 | 不能由第三方保證 | 不能保證，但可透過官方資產選擇降低誤連 | 不能保證，需實測 |
| Business / Page 選擇 | 主要靠 callback 後判斷 | 可望前移到 Meta dialog | 視 Meta flow 支援程度 |
| App Review 影響 | 低 | 高 | 高 |
| env 影響 | 無 | 可能新增 sandbox app id / secret / redirect URI | 可能新增 sandbox app id / secret / redirect URI |
| callback 影響 | 無 | 需 sandbox callback 分流與 state 驗證 | 需 sandbox callback 分流與 state 驗證 |
| workspace linking 影響 | 無 | 需驗證 business/page/ig 對應 workspace | 需驗證 ig/page 對應 workspace |
| 上線風險 | 低 | 中到高 | 中到高 |

## 影響範圍

### App Review

若採 Facebook Login for Business 或 Instagram Business Login，需要重新準備 App Review：

- reviewer demo account 與測試 workspace。
- 清楚的 Business / Page / IG account 選擇流程。
- 每個 permission 的用途、畫面位置、資料儲存方式。
- callback 後如何顯示 connected channel 與 sync 狀態。
- 不記錄 token、authorization code、app secret、client secret 的證明。
- 若使用進階權限，需要提供可重現的錄影與測試步驟。

正式產品切換前，App Review 必須通過或至少取得可用於該功能的權限範圍。

### env

sandbox-only 實驗可能需要新增獨立 env，但本 ADR 不修改 env：

- sandbox Meta app id。
- sandbox app secret 或 client secret。
- sandbox redirect URI。
- sandbox OAuth provider id。
- 可選的 feature flag，用來避免正式使用者看到未通過驗收的 flow。

正式產品實作前，必須確認 env 不會混用 production app 與 sandbox app，且 secret 不會出現在前端 bundle、URL、console、log、audit 或文件中。

### callback

sandbox-only callback 需要確認：

- `state` 必須綁定 workspace、nonce、return target 與過期時間。
- `code` 僅能在 server side exchange，不能出現在 client log 或 audit。
- callback error 要分類，例如 `access_denied`、`wrong_account`、`missing_permission`、`no_eligible_asset`、`workspace_mismatch`、`token_exchange_failed`。
- callback 成功後，必須再次驗證 Business / Page / IG account 與 workspace 的歸屬關係。
- callback 不應直接信任 query string 中的 workspace id 或 channel id。

### ConnectedAccount

若導入新 business login flow，ConnectedAccount 可能需要記錄或映射：

- Meta user id。
- Business id。
- Page id。
- Instagram professional account id。
- token scope 與過期資訊。
- provider type，例如 `meta-instagram`、`facebook-business-login-sandbox` 或 `instagram-business-login-sandbox`。
- token 儲存仍必須維持加密與 redaction。

此階段不建議直接改 schema；應先用實驗文件列出必要欄位與資料映射。

### Channel

Channel 仍應代表 InboxPilot 內可操作的 IG channel。新 flow 不應讓 Channel 在未完成資產驗證前建立正式可用狀態。

正式實作前要確認：

- 一個 workspace 是否允許連多個 IG channel。
- 同一 IG account 是否能被多 workspace 重複連接。
- channel 狀態是否需要 `pending_review`、`connected`、`sync_failed`、`permission_missing` 等更細分類。
- channel sync 失敗時不應暴露 token 或完整 Meta API response。

### workspace linking

workspace linking 是高風險邊界。新的 business login flow 必須確保：

- 使用者只能把資產連到自己有權限的 workspace。
- callback state 內的 workspace id 必須與登入使用者 session 一致。
- 不能用前端傳入的 workspace id 直接建立 ConnectedAccount 或 Channel。
- 若 Meta 回傳的 Business / Page / IG account 不符合目前 workspace policy，必須拒絕連接並回傳可理解的錯誤。

## 安全風險與 redaction 要求

所有實驗與正式實作都必須遵守：

1. token、authorization code、client secret、app secret 不得寫入 console、server log、audit log、URL、文件或截圖。
2. OAuth callback log 只能保留事件類型、provider、workspace id、channel id、redacted account id、錯誤分類與 request id。
3. Meta API error response 需要清理後再存入 audit 或顯示給使用者。
4. code exchange 只能在 server side 執行。
5. access token / refresh token 必須加密儲存，且不得回傳到前端。
6. state、nonce、PKCE 或等效防護機制需要有過期時間與重放防護。
7. workspace / tenant isolation 必須在 callback、account linking、channel sync 三段重複驗證。
8. demo script、App Review 文件與測試矩陣不得包含真實 token、secret、authorization code 或可重放 URL。

## 決策：建議進入 sandbox-only 實作

建議進入 sandbox-only 實作與實驗，但不建議直接進入正式產品實作。

理由：

- 目前 flow 無法保證 ManyChat 類似的 account selection UX。
- Facebook Login for Business 最有機會提供 Business / Page / IG asset selection，但需要實測 Meta dialog 行為。
- Instagram Business Login 是否能完整取代現有 Instagram OAuth flow，目前仍需要以實際 callback payload、scope、App Review 要求來驗證。
- 在未確認 App Review、env 隔離、callback 安全、workspace linking 與 channel sync 前，直接切正式產品風險太高。

## 不進入正式產品實作前的必要驗收條件

正式產品實作前，至少需要滿足以下條件：

1. sandbox flow 能在未登入、單一帳號、多帳號、錯誤帳號、無資產、拒絕權限等情境下完成測試。
2. 桌機 Chrome、手機瀏覽器、popup、redirect transport 的 account selection matrix 有明確結果。
3. Meta dialog 可穩定提供可接受的 Business / Page / IG account selection UX，或文件明確列出無法達成處。
4. App Review 權限用途、demo script、錄影腳本與測試帳號已準備完成。
5. env 隔離設計完成，sandbox app 與 production app 不混用。
6. callback state、nonce、code exchange、error classification、redaction 規格通過安全 review。
7. ConnectedAccount / Channel / workspace linking 的資料映射與 tenant isolation 規格完成。
8. channel sync 能在 token scope 不足、資產不匹配、Meta API error 時安全失敗。
9. 所有 log、audit、文件、截圖均確認不包含 token、code、secret。
10. 有明確 fallback：App Review 不通過或 UX 未達標時，正式產品維持現有 Instagram OAuth flow。

## 最終建議與理由

最終建議：

1. 不要直接取代目前正式 Instagram OAuth flow。
2. 建立 sandbox-only 的 Facebook Login for Business 實驗規格與測試分支。
3. 同步評估 Instagram Business Login，但優先以 Facebook Login for Business 驗證 Business / Page / IG asset selection。
4. 在 App Review、env、callback、ConnectedAccount、Channel、workspace linking 全部完成驗收前，不開放給正式使用者。
5. 若 sandbox 測試證明仍無法穩定達成 ManyChat 類似 UX，則維持現狀並改進產品內提示、錯誤分類與重新連接引導。

核心理由是：ManyChat 類似體驗的關鍵不只是「強制重新登入」，而是 Meta 官方 dialog 是否能提供足夠清楚的 business asset selection。第三方產品不能保證每次開啟未登入視窗，也不能任意清除使用者瀏覽器 session；因此應把目標改成「使用官方可審核流程，最大化帳號選擇清楚度，並在 callback 後嚴格驗證資產歸屬」。

## 後續建議文件任務

可複製下一個 Codex prompt：

```text
請只新增 / 更新文件，不要修改產品功能程式碼，不要改 OAuth flow，不要改 callback route，不要改登入按鈕，不要改 env。

請根據 docs/adr-meta-business-login-before-implementation.md、docs/meta-business-login-experiment-spec.md、docs/meta-business-login-account-selection-test-matrix.md，建立 sandbox-only Meta Business Login 技術實驗計畫，檔案路徑為 docs/meta-business-login-sandbox-implementation-plan.md。

內容需包含：
1. sandbox provider 命名與不影響正式產品的隔離策略
2. 需要新增但暫不套用的 env 清單與用途
3. authorize URL、callback、state、nonce、code exchange 的安全規格
4. ConnectedAccount / Channel / workspace linking 的資料映射草案
5. App Review 前後的切換條件
6. log / audit redaction 驗收清單
7. rollback / fallback 策略
8. 不進入正式產品實作的明確邊界

完成後請執行 git status、npm run lint、npm run build。npm test 可視情況略過，但要說明原因。
```
