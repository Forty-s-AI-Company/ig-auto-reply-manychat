# Unattended Autopilot Policy

Autopilot 的目標不是只跑 lint/test/build，而是在使用者休息時持續推進產品。

## Loop Contract

每輪必須包含：

- Read：讀 AUTOPILOT.md、AUTOPILOT_STATE.md、TASKS.md、LAUNCH_PLAN.md、PROJECT.md、QA.md、ACCEPTANCE.md、reports、git status / diff。
- Build：由 Codex 直接修改代碼、測試、文件或 CI。
- Verify：跑可用 gates，例如 secrets/env/lint/typecheck/test/build/browser QA。
- Repair：失敗時下一輪優先修錯。
- Report：更新 reports/final-report.md、AUTOPILOT_STATE.md、TASKS.md 與下一輪 prompt。

## Repeated Error Strategy

- 第 1 次：直接修。
- 第 2 次：換角度修，補更多診斷。
- 第 3 次：標記 deferred blocker，先做其他可完成任務。
- 其他任務完成後：回頭集中處理 deferred blocker。
- 回頭後仍超過限制：才真正停下，產出 HUMAN_REQUIRED / DEFERRED_BLOCKER 報告。

## Stop Conditions

只有以下情況可以停：

- 所有可自動完成的產品、測試、文件、部署前準備都完成。
- 需要使用者登入、2FA、CAPTCHA、外部平台後台操作。
- 需要真實 secret、正式帳號、Production deploy、Production DB migration、真實金流。
- 同一 blocker 在 deferred 後回頭處理仍超過限制。
- Codex / Antigravity / 本地工具額度用完或 CLI 不可用。

## Must Not Do

- 不修改 .env / .env.local。
- 不輸出 secret。
- 不 production deploy。
- 不 production DB migration。
- 不切 PayUni production。
- 不回滾使用者既有未提交變更。
