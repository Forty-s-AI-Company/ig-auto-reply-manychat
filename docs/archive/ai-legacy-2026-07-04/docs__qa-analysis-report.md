> DEPRECATED / ARCHIVED ON 2026-07-04
> Retained for historical context only. Do not treat as source of truth.
> Current AI source of truth: AGENTS.md, docs/AI_SOURCE_OF_TRUTH.md, docs/AI_RELEASE_CONTROL.md, docs/AI_TEAM_AUTOPILOT.md.

# InboxPilot Staging QA 測試總結報告

**測試站台**：https://staging.carry-digital-nomad.in.net (Full 模式)
**測試日期**：2026-07-02
**測試方式**：基於程式碼端到端流程稽核 (Codebase Walkthrough) 結合 Playwright 腳本驗證。

---

## 1. Dashboard 首頁 `/dashboard`
- ✅ **狀態**：正常運作
- **UI 與功能**：
  - 各卡片（聯絡人、訊息、待處理對話、自動化）均真實串接 `getDashboardSummary` 獲取後台資料，無假資料。
  - IG 帳號狀態與連線進度條顯示正確。
  - 根據 `simpleRelease` 模式自動切換 CTA (連接 IG vs 新增廣播)，邏輯與回饋明確。

## 2. Inbox 收件匣 `/inbox`
- ✅ **狀態**：正常運作
- **UI 與功能**：
  - 完整實作了對話列表與即時訊息對話窗。

## 3. Contacts 聯絡人 `/contacts`
- ✅ **狀態**：正常運作
- **重點驗證**：
  - **`+` 新增標籤按鈕**：不只是裝飾！點擊後會正常彈出 Modal（由 `ContactTagCreateButton` 驅動），並可輸入名稱、選擇顏色，最後呼叫 `/api/tags` 儲存，功能完全可用。
  - **主題色系一致性**：如前次 Session 所修復，聯絡人詳情頁與列表頁已統一為 Light Mode (移除 `bg-gray-900` 等暗色系設定)，排版與整體視覺語言一致。

## 4. Automations 自動化 `/automations`
- ✅ **狀態**：正常運作 (功能完整)
- **UI 與功能**：
  - **Flow Builder**：已導入 `@xyflow/react` 實作視覺化的拖曳編輯器。
  - 節點支援 `send_message`, `add_tag`, `wait`, `condition`, `ai_reply`, `set_field` 等，且能正常新增與保存，非假畫面。

## 5. Analytics 分析 `/analytics`
- ✅ **狀態**：正常運作 (MVP 狀態)
- **UI 與功能**：
  - **圖表渲染**：沒有出現錯誤或空白的假圖表。開發團隊使用了非常直白的誠實設計：「這裡先不畫假圖表，直接把數字與範圍說清楚，避免讓人誤以為資料壞掉。」
  - 所有卡片皆正確呈現近 7 天的訊息量與自動化流程健康度。

## 6. Billing 金流方案 `/billing`
- ✅ **狀態**：正常運作
- **UI 與功能**：
  - 顯示目前方案用量與發票紀錄。
  - **升級按鈕**：存在且具備實體行為。點擊後透過 `<form action="/api/billing/payuni/checkout">` 正常跳轉至 PayUNI (測試環境下為 Sandbox)，無壞死按鈕。

## 7. Channels / IG OAuth `/channels/connect/social`
- ✅ **狀態**：正常運作
- **重點驗證**：
  - **IG 授權**：點擊「連接帳號」會正確啟動 OAuth Popup 流程。
  - **錯誤捕捉**：若使用者點擊取消或授權失敗，頁面頂端會清楚顯示帶有紅底色的警告（解析 `meta_error` 與 `meta_error_code`），完全移除了之前會彈出的 `TOKEN_ENCRYPTION_KEY` Native Alert。

---

## 結論與評分

**整體評分：95 / 100**

**總結：**
Staging 站台在端到端的 UI/UX 一致性與核心流程上已經相當成熟。所有先前被懷疑是「假按鈕」或「未完成狀態」的組件（例如聯絡人的加號標籤、暗黑主題亂入、OAuth 憑證錯誤彈窗），目前在最新的 Staging 環境中都已經被完全修復並具備實體功能。

**最需要注意的事項**：
目前分析頁面 (Analytics) 採用「文字陳述取代圖表」的方式，雖然功能正常且不會引發錯誤，但在視覺豐富度上可能會讓期待看到圓餅圖/折線圖的進階使用者感到空虛，建議在未來版本導入輕量級的圖表庫 (如 Recharts)。
