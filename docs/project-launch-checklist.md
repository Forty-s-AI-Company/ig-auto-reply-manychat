# Project Launch Checklist

更新日期：2026-06-10

## 目前判定

- `[x]` 可以作為 private beta / 少量付費客戶上線
- `[ ]` 尚未達到可公開大規模販售 SaaS 標準

## 已完成

- `[x]` Workspace / membership / role 基礎結構
- `[x]` Inbox / Contacts / Tags / Segments
- `[x]` Automation / Broadcast / Sequence
- `[x]` IG / Meta webhook 基礎串接
- `[x]` Audit log / health check / worker / queue 骨架
- `[x]` PayUNI checkout / notify / return 基礎流程
- `[x]` Billing interval correctness
- `[x]` Zero-amount / credit-only checkout 正式 completion flow
- `[x]` `npm run lint`
- `[x]` `npm run build`
- `[x]` `npm test`
- `[x]` `npm run payuni:smoke`

## 上線前必做

- `[ ]` 完成 PayUNI production merchant review
- `[ ]` 建立 production 正式收款 SOP
- `[ ]` production 停用 Meta env token fallback
- `[ ]` 收斂 Meta OAuth production 主流程
- `[ ]` 整理 Billing / Terms / Privacy / Data Deletion / README 亂碼與對外文案

## 建議 Beta 前完成

- `[ ]` 補完整 plan enforcement
- `[ ]` 補 trial / expired / past_due / unpaid 產品限制
- `[ ]` 補 onboarding / reconnect UX
- `[ ]` 補 affiliate terms / refund policy / cookie policy

## 規模化前再做

- `[ ]` 高併發 load test 收斂
- `[ ]` queue-first ingestion / durable processing
- `[ ]` 補齊 WhatsApp / TikTok / SMS / LINE 正式產品化
