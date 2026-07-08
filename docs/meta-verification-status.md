# Meta Verification Status

- `CURRENT_RELEASE_STATE=HUMAN_BLOCKED`
- `BUSINESS_VERIFICATION=BLOCKED_NO_FORMAL_DOCS`
- `CURRENT_STRATEGY=PREPARE_APP_REVIEW_PACKAGE_FIRST`

## Current Position

InboxPilot 的產品品牌維持為 `InboxPilot`，但目前法定主體不是公司、有限公司、股份有限公司或其他正式商業登記主體。

- Legal subject: `Luo Shih Lin`
- 中文姓名：`羅仕林`
- Product brand: `InboxPilot`
- Contact email: `zeroyuanbrothers@gmail.com`
- Website: `https://inboxpilot.carry-digital-nomad.in.net/`

## Required Consistency Rule

在正式商業登記文件可提供之前：

- 不要把 `InboxPilot` 當成法定商業名稱使用
- 不要提交與實際主體不一致的商家驗證資料
- 不要嘗試用不存在的公司名稱、統編或法人身份完成 Meta Business Verification

建議對外一致表述：

- `InboxPilot is a software product operated by Luo Shih Lin.`
- `InboxPilot 為羅仕林個人開發與營運之自動化行銷工具。`

## Current Strategy

目前策略是先完成 App Review package 與 reviewer-safe evidence：

1. 準備 staging reviewer flow
2. 準備 OAuth、connected channel、Inbox、Contacts、Automations 證據
3. 準備 Privacy Policy、Terms、Data Deletion 的 reviewer-safe 對照頁
4. 暫不提交與真實主體不一致的 Business Verification 文件

## Why Business Verification Is Blocked

目前缺少可安全提交的正式商業證明，例如：

- 公司登記文件
- 商業登記文件
- 可對應法定主體與品牌關係的正式證明

在這些文件不存在前，直接提交驗證容易造成：

- 主體名稱不一致
- 品牌與法定文件不一致
- 後續 App Review / Advanced Access 風險升高

## Recommended Decision

- App Review package：可以持續整理與補齊
- Business Verification：暫不建議送出
- 若未來要提交 Business Verification，應先補齊正式主體文件，再更新站內 legal / business info 與 Meta 後台資料
