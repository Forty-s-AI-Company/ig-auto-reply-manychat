# 受控聯盟現金流程規則

> 目前公開產品主線是「推薦折抵制度 v1」，不是現金分潤。
> 本文件只保留後續受控聯盟現金流程的內部規劃，不代表已對使用者開放提領。

## 受控開通資格

- Creator 以上付費用戶可以申請
- 需 admin approval
- Starter 只能使用推薦折抵制度，不開放現金流程
- 正式開放前必須完成法務、稅務、反作弊、退款 / clawback、對帳與營運付款 SOP

## 等級

| 等級 | 條件 | 主方案月費分潤 |
| --- | --- | ---: |
| Partner | Creator 以上，審核通過 | 10% |
| Silver | 累積 10 位有效付費推薦 | 15% |
| Gold | 累積 30 位有效付費推薦 | 20% |
| Agency Partner | 後台手動設定 | custom |

加量包分潤目前不作為公開銷售承諾；若後續重啟，需要重新確認成本、退款與對帳規則。

## 計算

`commissionBase = actualPaidAmount - refundAmount - creditsUsed - discounts`

`commissionAmount = floor(commissionBase * commissionRate)`

單筆訂單總分潤不得超過實收金額 40%。現金流程仍維持 Hold，公開產品只使用非現金折抵。

## 狀態

- payment success 後建立 `pending`
- pending 需等待退款 / 爭議觀察期
- 觀察期後可轉 `available`，但仍只代表內部可審核，不代表使用者可自助提領
- payout request 後鎖定為 `payout_requested`，僅供內部營運對帳
- paid 後標記 `paid`，只代表內部結案紀錄
- refund / fraud 可取消 pending commission
- 已 payout 後退款，應建立 clawback 從下次扣回
