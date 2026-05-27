# Payout 批次匯款 Runbook

目前不串銀行 API，使用後台產生 CSV。

## 每月流程

1. 每月 15 日檢查 `available` 佣金。
2. 使用者申請 payout，最低 NT$1,000。
3. Admin 審核 payout request。
4. Admin 建立 payout batch。
5. 匯出 generic CSV。
6. 到銀行後台匯入或人工處理。
7. 回 InboxPilot 手動標記 paid / failed。

## CSV 欄位

- payoutItemId
- affiliateUserId
- legalName
- bankCode
- bankBranchCode
- bankAccount
- amount
- memo
- periodStart
- periodEnd

銀行帳號與身分證 / 統編在 DB 以 `encryptSecret` 加密保存。UI 只顯示後四碼。

## Failed payout

若匯款失敗：

- batch item 標記 failed
- payout request 標記 failed
- locked wallet ledger 標記 failed
- commission 回到 available
