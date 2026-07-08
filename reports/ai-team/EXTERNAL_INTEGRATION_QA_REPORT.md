# External Integration QA Report

Generated: 2026-07-06

## 1. Channels / Sidebar evidence

- **狀態檢查**：根據先前的驗證報告，目前的 Staging 帳號仍缺乏實體的 Instagram Channel 連接紀錄 (Connected Instagram channel evidence)。
- **決策**：無法透過 AI 自行連接未知或真實的 Instagram 資產。
- **結果**：`HUMAN_INPUT_REQUIRED`

## 2. Meta / Instagram reviewer-safe asset lane

- **狀態檢查**：系統需要一個 Reviewer-safe 的 Meta/Instagram 資產以完成 OAuth 與 Webhook 連接測試。
- **決策**：AI 無法也無權登入真人的 Meta 帳號去選取 Business/Page/IG 資產，這必須由人類操作並確保符合 App Review 規範。
- **結果**：`HUMAN_INPUT_REQUIRED`

## 3. PayUNI Sandbox authenticated checkout evidence

- **狀態檢查**：進入 Billing 頁面進行 Sandbox 訂閱與結帳測試。
- **決策**：需要填入測試用信用卡號與 3D 驗證等金流沙盒操作，且涉及外部金流測試環境的驗證。
- **結果**：`HUMAN_INPUT_REQUIRED`

## 4. Meta dashboard final screenshot / recording package

- **狀態檢查**：目前尚缺提交流程所需的截圖與螢幕錄影。
- **需要人類錄製或截圖的畫面清單**：
  1. Reviewer-safe 的 Instagram 連接過程錄影 (展現 OAuth 同意畫面與導回畫面)。
  2. 收件匣 (Inbox) 成功接收並回覆 Reviewer-safe 測試訊息的截圖與錄影。
  3. 聯絡人 (Contacts) 抓取到 Reviewer-safe 測試帳號的截圖。
  4. PayUNI Sandbox 結帳完成並開通付費方案的截圖 (供 App Review 附註參考)。
  5. Meta Developers App Dashboard 內的 Webhook 與權限勾選狀態截圖。
- **決策**：這些素材必須由人類實際錄製與截圖，嚴禁由 AI 自行送出審核。
- **結果**：`HUMAN_INPUT_REQUIRED`

## 5. Console / network

- **狀態檢查**：由於上述四大外部整合流程皆卡在需要人類輸入，故無法進行完整的外部串接 Network 與 Console 錯誤監聽。
- **決策**：目前未知的外部流程可能潛藏錯誤，必須與上述手動測試一併驗證。
- **結果**：`HUMAN_INPUT_REQUIRED`

---

## 結論與狀態輸出

```text
EXTERNAL_INTEGRATION_QA=HUMAN_INPUT_REQUIRED
CHANNELS_CONNECTED_EVIDENCE=HUMAN_INPUT_REQUIRED
META_REVIEWER_SAFE_ASSET_LANE=HUMAN_INPUT_REQUIRED
PAYUNI_SANDBOX_CHECKOUT_EVIDENCE=HUMAN_INPUT_REQUIRED
META_SCREENSHOT_RECORDING_PACKAGE=HUMAN_INPUT_REQUIRED
CONSOLE_NETWORK_QA=HUMAN_INPUT_REQUIRED
PRODUCT_P0_FOUND=0
PRODUCT_P1_FOUND=0
HUMAN_BLOCKERS=["需要人類操作綁定 Reviewer-safe 的 IG 帳號", "需要人類填寫 PayUNI Sandbox 測試信用卡進行結帳驗證", "需要人類錄製 Meta App Review 所需的 OAuth 授權與對話測試錄影"]
RELEASE_STATE_AFTER_QA=HUMAN_ACCEPTANCE_REQUIRED
```
