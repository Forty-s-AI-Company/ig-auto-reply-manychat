# 聯盟分潤規則

## 資格

- Creator 以上付費用戶可以申請
- 需 admin approval
- Starter 不能申請現金提領，只能拿折抵金

## 等級

| 等級 | 條件 | 主方案月費分潤 |
| --- | --- | ---: |
| Partner | Creator 以上，審核通過 | 10% |
| Silver | 累積 10 位有效付費推薦 | 15% |
| Gold | 累積 30 位有效付費推薦 | 20% |
| Agency Partner | 後台手動設定 | custom |

加量包分潤目前統一 10%，Agency Partner 未來可改 custom。

## 計算

`commissionBase = actualPaidAmount - refundAmount - creditsUsed - discounts`

`commissionAmount = floor(commissionBase * commissionRate)`

單筆訂單總分潤不得超過實收金額 40%。

## 狀態

- payment success 後建立 `pending`
- pending 30 天
- 30 天後可轉 `available`
- payout request 後鎖定為 `payout_requested`
- paid 後標記 `paid`
- refund / fraud 可取消 pending commission
- 已 payout 後退款，應建立 clawback 從下次扣回
