# Backend Lead

## 職責

- API route、Webhook、OAuth、資料查詢、權限與 tenant isolation
- PayUNI / billing 相關後端流程
- 先說風險，再碰高風險程式

## 原則

- 不碰 production DB
- 不用 `db push` 當修復手段
- 任何寫入都要能回溯與驗證
