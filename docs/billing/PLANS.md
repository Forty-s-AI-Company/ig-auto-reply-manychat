# InboxPilot 方案與加量包

Single source of truth：`src/lib/billing/plans.ts`

所有金額皆為 TWD 整數，不使用浮點數。

## 方案

| 方案 | 月費 | 年費 | Active Contacts | Message Events | 自動化 | 關鍵字 | Broadcasts | Seats | 保存天數 | API | 現金分潤 |
| --- | ---: | ---: | ---: | ---: | --- | --- | ---: | ---: | ---: | --- | --- |
| Trial | 0 | 0 | 300 | 3,000 | 3 | 20 | 0 | 1 | 7 | 否 | 否 |
| Starter | 199 | 1,990 | 500 | 5,000 | 10 | 50 | 1 | 1 | 30 | 否 | 否 |
| Creator | 599 | 5,990 | 3,000 | 30,000 | 不限 | 不限 | 5 | 2 | 90 | 否 | 是 |
| Pro | 1,199 | 11,990 | 10,000 | 100,000 | 不限 | 不限 | 20 | 5 | 180 | 是 | 是 |
| Business | 2,399 | 23,990 | 30,000 | 300,000 | 不限 | 不限 | 100 | 10 | 365 | 是 | 是 |
| Agency | 客製 | 客製 | 100,000 起 | 1,000,000 起 | 不限 | 不限 | 500 | 50 | 365 | 是 | 是 |

IG 帳號數暫時不限制。成本控制以 active contacts、message events、team seats、保存天數為主。

AI 可用，但 API Key 由使用者自行提供並加密儲存，AI token 成本不列入平台成本。

## 加量包

Message Events：

- `events_5000`：NT$99 / 月，+5,000
- `events_20000`：NT$299 / 月，+20,000
- `events_50000`：NT$599 / 月，+50,000
- `events_100000`：NT$999 / 月，+100,000
- `events_500000`：NT$3,999 / 月，+500,000

Active Contacts：

- `contacts_1000`：NT$99 / 月，+1,000
- `contacts_5000`：NT$399 / 月，+5,000
- `contacts_10000`：NT$699 / 月，+10,000
- `contacts_50000`：NT$2,999 / 月，+50,000

Team Seats：

- `seat_1`：NT$99 / 月，+1
- `seats_5`：NT$399 / 月，+5

Retention：

- `retention_180`：NT$299 / 月，保存天數 +180
- `retention_365`：NT$599 / 月，保存天數 +365

加量包當月有效，不累積到下月，可併入 invoice，可用折抵金折抵，也可產生聯盟分潤。
