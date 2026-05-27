# 功能測試報告

測試日期：2026-05-21  
測試環境：Windows / PowerShell / Node.js / Next.js 16.2.6  
測試目標：`Personal Chat Automation Hub` 本機網站與核心 API  
測試網址：`http://localhost:3041`

## 測試範圍

這次測試主要覆蓋本機專案可直接驗證的功能：

- 管理員登入
- 後台主要頁面載入
- 主要資料 API 讀取
- Mock inbound webhook
- ESLint
- 單元測試
- Production build

目前 Chrome 中的外部頁籤標題為 `Instagram Default Reply | Edit Content`，但該 Chrome 程序沒有啟用 `--remote-debugging-port`，目前環境也沒有可直接接管既有分頁的 `chrome` plugin。因此本次沒有直接點按已登入的 ManyChat 外部頁面，只把它列為「需人工或重新啟用可接管瀏覽器」的 E2E 範圍。

## 測試帳號

本機預設管理員帳號：

```text
Email: admin@example.com
Password: admin123456
```

## 功能測試結果

| 功能 | 方法 | 路徑 | 結果 | 備註 |
|---|---:|---|---:|---|
| 登入 API | POST | `/api/auth/login` | 200 | 預設管理員帳密登入成功 |
| 首頁 | GET | `/` | 200 | 可載入 |
| Dashboard | GET | `/dashboard` | 200 | 可載入 |
| Inbox | GET | `/inbox` | 200 | 可載入 |
| Contacts | GET | `/contacts` | 200 | 可載入 |
| Tags | GET | `/tags` | 200 | 可載入 |
| Segments | GET | `/segments` | 200 | 可載入 |
| Automations | GET | `/automations` | 200 | 可載入 |
| Broadcasts | GET | `/broadcasts` | 200 | 可載入 |
| Knowledge Base | GET | `/knowledge-base` | 200 | 可載入 |
| AI Settings | GET | `/ai-settings` | 200 | 可載入 |
| Channels | GET | `/channels` | 200 | 可載入 |
| Billing | GET | `/billing` | 200 | 可載入 |
| Mock Tester | GET | `/mock-tester` | 200 | 可載入 |
| Dashboard API | GET | `/api/dashboard` | 200 | 可讀取 |
| Conversations API | GET | `/api/conversations` | 200 | 可讀取 |
| Contacts API | GET | `/api/contacts` | 200 | 可讀取 |
| Tags API | GET | `/api/tags` | 200 | 可讀取 |
| Segments API | GET | `/api/segments` | 200 | 可讀取 |
| Automations API | GET | `/api/automations` | 200 | 可讀取 |
| Broadcasts API | GET | `/api/broadcasts` | 200 | 可讀取 |
| Knowledge Base API | GET | `/api/knowledge-base` | 200 | 可讀取 |
| AI Settings API | GET | `/api/ai-settings` | 200 | 可讀取 |
| Channels API | GET | `/api/channels` | 200 | 可讀取 |
| Mock inbound webhook | POST | `/api/webhooks/mock` | 200 | 成功建立 conversation |

Mock inbound webhook 回應：

```json
{
  "ok": true,
  "conversationId": "cmpf717kn0005vdl879lr0p26"
}
```

## 自動化檢查結果

| 檢查 | 指令 | 結果 |
|---|---|---|
| ESLint | `npm run lint` | 通過 |
| 單元測試 | `npm test` | 通過，11 個測試檔、23 個測試案例 |
| Production build | `npm run build` | 通過 |

單元測試摘要：

```text
Test Files  11 passed
Tests       23 passed
```

Build 摘要：

```text
Next.js 16.2.6 (Turbopack)
Compiled successfully
Generating static pages: 51/51
```

## 已發現風險與限制

### 1. ManyChat 外部頁面實測結果

補測日期：2026-05-21  
補測方式：新開 Chrome profile，使用 `--remote-debugging-port=9222` 透過 CDP 接管頁面。  
測試頁面：

```text
https://app.manychat.com/fb4356719/cms/files/ig_default/edit
```

頁面標題：

```text
(2) Instagram Default Reply | Edit Content
```

已確認項目：

| 項目 | 結果 | 備註 |
|---|---|---|
| ManyChat 登入狀態 | 通過 | 可進入帳號 `Amson安生｜數位行銷 x IG變現` |
| 帳號 Home | 通過 | URL 為 `/fb4356719/dashboard` |
| Default Reply 編輯頁 | 通過 | URL 為 `/fb4356719/cms/files/ig_default/edit` |
| Automation 名稱 | 通過 | 顯示 `Instagram Default Reply` |
| Automation 狀態 | 需注意 | 顯示 `STOPPED`，代表服務目前沒有啟動 |
| 儲存狀態 | 通過 | 顯示 `Saved`，儲存按鈕為 disabled，表示目前沒有未儲存變更 |
| Preview | 通過 | 可切換預覽，顯示 Instagram business chat 模擬畫面與 `Restart` |
| Test | 通過 | 可切換測試分頁，顯示 QR code 測試流程 |
| 測試帳號 | 通過 | 顯示 `@carry.digital.nomad` |
| 測試入口 | 通過 | 顯示 `Open on this device` |
| 測試碼 | 通過 | 當下顯示測試碼 `326` |
| More Actions | 通過 | 可開啟選單 |

More Actions 選單可見項目：

- `Duplicate`
- `Convert channels`
- `Copy to another page`
- `Share this Automation`
- `Delete`
- `Revert to published`

這次沒有執行的操作：

- 沒有按 `Delete`
- 沒有按 `Revert to published`
- 沒有修改訊息內容
- 沒有儲存或發布
- 沒有啟動目前顯示為 `STOPPED` 的 automation
- 沒有刷新測試碼，避免影響你正在看的測試狀態

補測結論：

ManyChat 的 `Instagram Default Reply` 編輯頁可以正常開啟，Preview 與 Test 功能都可載入。主要需要注意的是 automation 目前顯示 `STOPPED`，若預期 Instagram Default Reply 要實際自動回覆，後續要確認是否需要啟用/發布該 automation。

### 2. 原本既有 Chrome 分頁無法直接接管

目前 Chrome 沒有啟用遠端除錯參數：

```text
--remote-debugging-port
```

因此無法從測試工具直接操作目前已登入的 `Instagram Default Reply | Edit Content` 頁籤。若要測外部 ManyChat 實際操作流程，建議改用以下方式之一：

- 以可接管的測試瀏覽器重新登入 ManyChat。
- 啟用 Chrome remote debugging 後，再用 Playwright 或 CDP 連線。
- 由人工操作外部頁面，並依本文件的測試項目做手動驗收。

### 3. Build 有 Turbopack NFT tracing warning

`npm run build` 雖然成功，但出現 5 個 warning，集中在以下 import trace：

```text
./next.config.ts
./src/lib/ai/gemini-cli.ts
./src/lib/ai/faq.ts
./src/app/api/ai-model-test/route.ts
```

警告內容指出 Turbopack 追蹤到過於動態的檔案路徑或 require，可能造成部署 artifact 把不必要的專案檔案一起追蹤進去。

建議後續檢查：

- `src/lib/ai/gemini-cli.ts` 是否使用 `process.cwd()` 搭配動態路徑。
- 是否可把檔案存取限制在固定子資料夾。
- 開發用 CLI 邏輯是否可避免進入 production route bundle。

### 4. 外部 Instagram 實際收發尚未完整 E2E

本次已確認 ManyChat 外部頁面的 Default Reply 編輯頁、Preview、Test 載入狀態，但尚未實測：

- Instagram inbound DM 實際觸發
- `@carry.digital.nomad` 收到測試碼後是否觸發完整對話
- 外部平台 webhook 到本機系統的完整閉環

這部分需要使用 Instagram 測試帳號實際送出 DM，並確認 ManyChat / 本機系統是否收到對應事件。

## 建議手動驗收清單

若要補齊外部 ManyChat 頁面驗收，可以照這個順序測：

1. 開啟 ManyChat 的 `Instagram Default Reply | Edit Content`。
2. 修改 Default Reply 內容。
3. 儲存草稿或發布。
4. 用測試 Instagram 帳號發送一則未命中其他 keyword 的 DM。
5. 確認 ManyChat 有送出 Default Reply。
6. 確認本機系統是否收到對應 webhook 或 mock 事件。
7. 到 `/inbox` 查看 conversation 與 message 是否新增。
8. 到 `/contacts` 查看 contact 是否建立或更新。
9. 若有 automation/tag 規則，確認 tag、segment、automation action 是否符合預期。

## 重測指令

啟動本機服務：

```powershell
npm run dev
```

登入與主要 API smoke test 可使用 PowerShell：

```powershell
$base = "http://localhost:3041"
$session = New-Object Microsoft.PowerShell.Commands.WebRequestSession

Invoke-WebRequest `
  -UseBasicParsing `
  -Uri "$base/api/auth/login" `
  -Method Post `
  -WebSession $session `
  -ContentType "application/json" `
  -Body '{"email":"admin@example.com","password":"admin123456"}'

Invoke-WebRequest -UseBasicParsing -Uri "$base/dashboard" -WebSession $session
Invoke-WebRequest -UseBasicParsing -Uri "$base/api/conversations" -WebSession $session
Invoke-WebRequest -UseBasicParsing -Uri "$base/api/contacts" -WebSession $session

$body = @{
  externalId = "mock-doc-test-user"
  displayName = "文件測試使用者"
  text = "請問價格"
  consentStatus = "opted_in"
} | ConvertTo-Json -Compress

Invoke-WebRequest `
  -UseBasicParsing `
  -Uri "$base/api/webhooks/mock" `
  -Method Post `
  -ContentType "application/json" `
  -Body $body
```

品質檢查：

```powershell
npm run lint
npm test
npm run build
```

## 結論

本機網站與核心 API 的 smoke test 通過，Mock inbound webhook 可正常建立 conversation，`lint`、單元測試與 production build 也都通過。

下一步如果要把測試做到更完整，重點會是接管可登入的瀏覽器，補上 ManyChat 外部 Default Reply 編輯與 Instagram 實際訊息觸發的端到端驗證。
