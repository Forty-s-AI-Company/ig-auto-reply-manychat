# 推薦、試用與折抵金規則

## 免費試用

- 新帳號預設 Trial 7 天
- 每個 user 會自動建立 referral code
- referral URL：`/signup?ref=CODE`
- 每成功推薦 1 人，推薦人與被推薦人各 +1 天試用
- 最多 20 天
- 推薦人每成功推薦 1 人額外 +300 trial events
- trial events 最高 7,000

## 有效推薦條件

必須完成：

- Email verified：目前先保留 `User.emailVerifiedAt`，UI 可顯示 pending
- 成功連接 1 個 IG 帳號
- 建立至少 1 條 automation

## 防濫用

- 不可自推
- 同 workspace 不可互推
- attribution 一旦建立不會被後續 ref 覆蓋
- IP / user agent 先記錄在 `riskFlagsJson`

## 折抵金

- 被推薦者首次付費成功後，推薦人拿實付金額 30% 折抵金
- Starter 只能拿折抵金，不能現金提領
- 折抵金有效期限 180 天
- 可折抵月費、年費、加量包
- invoice 最低為 0，剩餘折抵金留到下月
