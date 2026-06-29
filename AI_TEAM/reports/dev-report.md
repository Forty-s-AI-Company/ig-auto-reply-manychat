# Dev Report

## Latest - 2026-06-30 Channels / Connect visible-but-unusable sweep

Current status:

- `[x]` Channels / Connect 入口已改成可連線 / 規劃中 / 暫停中的分流，較少把未開放平台包裝成可直接授權的主入口。
- `[x]` `InstagramChannelActions` 在授權不足時會直接顯示 inline disabled 說明，不再只靠 title 提示。
- `[x]` `tests/channels-connect-visibility.test.ts` 與 `tests/e2e/simple-release.spec.ts` 已補上 Channels / Connect 的 visibility smoke。
- `[x]` `npm run lint`、`npm run build`、`npm test`、`npm run test:e2e:simple` 都已通過。

What changed:

- `src/app/channels/connect/page.tsx`
  - 把可連線平台與規劃中 / 暫停中平台分成兩個區塊，避免卡片看起來像同一種即將可用的入口。
  - 為 connectable / disabled cards 補上狀態 badge，讓使用者一眼看懂哪些是可直接進授權流程，哪些只是保留入口。
- `src/app/channels/page.tsx`
  - 在 Channels 設定頁的連線卡片上補上狀態 badge，並讓 disabled card 的按鈕文案更貼近真實狀態。
- `src/components/InstagramChannelActions.tsx`
  - 當 Instagram 動作會被授權限制時，頂部訊息與底部說明會直接顯示 inline disabled 文案。
  - 避免使用者只看到一排 disabled 按鈕，卻不知道問題是授權狀態或平台限制。
- `src/lib/channels/channel-connect-visibility.ts`
  - 補上 `statusLabel` 以統一表達可連線 / 本機 QA / 尚未開放 / 已停用。
- `tests/channels-connect-visibility.test.ts`
  - 針對 TikTok / WhatsApp / Mock 狀態補齊 statusLabel 斷言。
- `tests/e2e/simple-release.spec.ts`
  - 驗證 simple release 的 Channels connect 只保留 Instagram 可見，並持續隱藏未開放入口。
- `.gitignore`
  - 讓 `test-results/` 保持可用但不提交測試輸出，避免 clean tree lint 時掃不到目錄。
- `test-results/.gitkeep`
  - 保留空目錄，讓 `npm run lint` 在乾淨工作樹不會因目錄不存在而失敗。

Validation:

```text
npx eslint src/lib/channels/channel-connect-visibility.ts src/app/channels/page.tsx src/app/channels/connect/page.tsx src/components/InstagramChannelActions.tsx tests/channels-connect-visibility.test.ts tests/e2e/simple-release.spec.ts
Result: passed.

npx vitest run tests/channels-connect-visibility.test.ts --reporter=dot
Result: passed. 1 file, 4 tests.

npm run lint
Result: passed.

npm run build
Result: passed.

npm test
Result: passed.

INBOXPILOT_RELEASE_CHANNEL=simple npm run test:e2e:simple
Result: passed for Chromium and mobile Chrome.
```

Launch impact:

- 提升 Channels / Connect 的可讀性與 beta operator trust。
- No production DB mutation, migration, Production deployment, Meta App Review submission, or PayUNI production change was performed.

## Latest - 2026-06-30 Inbox visible-but-unusable follow-up

Current status:

- `[x]` Inbox contact actions menu 的匯出 / 封鎖項目已改成真正 disabled UX，並補上更直接的原因說明。
- `[x]` simple-release Inbox 的序列訂閱入口已改成真正 disabled UX，不再像可直接訂閱的入口。
- `[x]` `tests/e2e/inbox-auth.spec.ts` 與 `tests/e2e/simple-release.spec.ts` 已補上對應 smoke。
- `[x]` `npm run lint`、`npm test`、`npm run build`、`npm run test:e2e:inbox`、`npm run test:e2e:simple` 都已通過。

What changed:

- `src/components/InboxClient.tsx`
  - 將 contact actions menu 的匯出 / 封鎖項目改成真正 disabled button，並補上簡短說明，避免使用者誤以為可以操作。
  - 將 sequence subscribe 在 full release 外的入口改成真正 disabled UX，保留明確說明但不再可點。
- `tests/e2e/inbox-auth.spec.ts`
  - 驗證 contact actions menu 的 disabled 狀態與說明文案。
- `tests/e2e/simple-release.spec.ts`
  - 驗證 simple release 的 Inbox sequence subscribe control 真的被停用。
- `AI_TEAM/tasks/current-task.md`
  - 將本輪 task 標記完成並補上 completion result。
- `AI_TEAM/tasks/backlog.md`
  - 將 Inbox visible-but-unusable product sweep 標記完成。
- `AI_TEAM/tasks/queue.json`
  - 將 current product task 標記 completed，並補上完成摘要 / 驗證。
- `docs/codex-session-log.md`
  - 追加本輪 Inbox visible-but-unusable follow-up 的實作與驗證紀錄。
- `docs/fix-roadmap.md`
  - 追加本輪 current status / remaining。
- `docs/project-launch-checklist.md`
  - 追加本輪 release surface disabled UX 收斂紀錄。
- `docs/product-readiness-review.md`
  - 追加本輪 beta operator trust 改善紀錄。

Validation:

```text
npx eslint src/components/InboxClient.tsx tests/e2e/inbox-auth.spec.ts tests/e2e/simple-release.spec.ts
Result: passed.

npm run test:e2e:inbox
Result: passed for Chromium and mobile Chrome.

npm run test:e2e:simple
Result: passed for Chromium and mobile Chrome with INBOXPILOT_RELEASE_CHANNEL=simple.

npm run lint
Result: passed.

npm test
Result: passed.

npm run build
Result: passed.
```

Launch impact:

- Inbox visible-but-unusable 的殘留假入口再少一批。
- No production DB mutation, migration, Production deployment, Meta App Review action, or PayUNI production action was performed.

## Latest - 2026-06-30 AI_TEAM product autofill loop

Current status:

- `[x]` Planner 現在會在 `queue.json` 沒有 pending / running task 時，自動補入下一個安全產品任務。
- `[x]` 已補入 `Inbox visible-but-unusable product sweep`，讓一般模式可以直接接回產品主線。
- `[x]` `AI_TEAM/reports/next-codex-prompt.md` 已改成完全自動閉環提示詞，不再停在上一輪 Contacts 任務。
- `[x]` `npm run ai-team:loop:smoke` 已通過，完整 worker pipeline 仍可走完。

What changed:

- `AI_TEAM/scripts/ai-team-runner.mjs`
  - 新增產品主線 autofill task seeds。
  - planner 在 queue 空掉時會自動補入下一個尚未完成的產品任務。
  - planner 補題後會重新讀 queue，確保後續 worker 拿到正確 task。
- `AI_TEAM/README.md`
  - 補上 queue 空時的自動補題行為。
- `AI_TEAM/RUNNER_DESIGN.md`
  - 補上產品任務自動補題順序與 hard stop。

Validation:

```text
npx eslint AI_TEAM/scripts/ai-team-runner.mjs
Result: passed.

node AI_TEAM/scripts/ai-team-runner.mjs --once --mode=general --only-worker=planner
Result: passed. Queue auto-filled Inbox visible-but-unusable product sweep.

npm run ai-team:loop:smoke
Result: passed.
```

Launch impact:

- 這是 AI_TEAM 自動化能力修正，不直接改產品 runtime。
- No production DB mutation, migration, Production deployment, Meta App Review action, or PayUNI production action was performed.

## Latest - 2026-06-30 Contacts filtered empty-state guidance

Current status:

- `[x]` Contacts filtered empty-state 現在會清楚列出目前套用的搜尋 / 狀態 / 標籤條件。
- `[x]` 空狀態提供真正可點的 `清除篩選並重新查看`，會回到完整 Contacts 列表。
- `[x]` `tests/e2e/contacts-auth.spec.ts` 已補上 filtered empty-state guidance smoke，Chromium / mobile Chrome 都通過。
- `[x]` `npm run lint`、`npm run test:e2e:contacts`、`npm test`、`npm run build` 已通過。

What changed:

- `src/components/ContactsListClient.tsx`
  - 將 filtered empty-state 由單一句提示改成完整 guidance panel，會列出目前套用的搜尋、訂閱狀態與標籤條件。
  - 新增 `清除篩選並重新查看` 入口，直接回到乾淨 Contacts 列表。
  - 頂部 active chip 也補上搜尋條件，讓空集合時更容易看出到底套用了什麼。
- `tests/e2e/contacts-auth.spec.ts`
  - 新增 filtered empty-state guidance smoke，驗證空狀態條件摘要與清除篩選入口。
- `AI_TEAM/tasks/current-task.md`
  - 將本輪 task 標記完成，並寫入完成摘要。
- `AI_TEAM/tasks/backlog.md`
  - 將 Contacts 任務標記完成。
- `AI_TEAM/tasks/queue.json`
  - 將 current product task 標記 completed，並補上 completedAt。
- `docs/codex-session-log.md`
  - 追加本輪 Contacts filtered empty-state guidance 的實作與驗證紀錄。
- `docs/fix-roadmap.md`
  - 追加本輪 current status / remaining。

Validation:

```text
npx eslint src/components/ContactsListClient.tsx tests/e2e/contacts-auth.spec.ts
Result: passed.

npm run test:e2e:contacts
Result: passed for Chromium and mobile Chrome.

npm run lint
Result: passed.

npm test
Result: passed.

npm run build
Result: passed.
```

Launch impact:

- 降低 Contacts 在套用篩選後空白時的誤解成本。
- No production DB mutation, migration, Production deployment, Meta App Review action, or PayUNI production action was performed.

## Latest - 2026-06-30 Inbox / Channels visible-but-unusable closeout

Current status:

- `[x]` Inbox header `視訊通話` 與 `更多對話操作` 已收斂成真正 disabled UX，不再像只會吐通知的假入口。
- `[x]` `清除提醒` 會正確關閉 reminder menu，避免後續操作被浮層擋住。
- `[x]` `npm run lint`、`npm run build`、`npm run test:e2e:inbox`、focused vitest 都已通過。
- `[x]` Channels connect visibility / IG partial metadata work 仍維持前一輪的清楚分流與 badge 提示。

What changed:

- `src/components/InboxClient.tsx`
  - 將 header 的 `視訊通話` 與 `更多對話操作` 改成真正 disabled button，並補上可讀的原因說明。
  - 為 disabled controls 加上單一清楚的 hint 文案，避免使用者把它們看成壞掉的按鈕。
  - 新增 `clearReminder()`，讓 `清除提醒` 會關閉 reminder menu 再送出更新。
- `tests/e2e/inbox-auth.spec.ts`
  - 改成驗證 header disabled UX。
  - 補上 reminder menu 收合後再做後續操作的等待，避免 smoke 被浮層擋住。
- `AI_TEAM/tasks/current-task.md`
  - 標記本輪 task 完成，並寫入下一個建議產品任務。
- `AI_TEAM/tasks/backlog.md`
  - 將 Inbox / Channels closeout 標記完成，接上下一個 Contacts 安全任務。
- `AI_TEAM/tasks/queue.json`
  - 將 current product task 標記 completed，並新增下一個 pending product task。

Validation:

```text
npx eslint src/components/InboxClient.tsx tests/e2e/inbox-auth.spec.ts
Result: passed.

npx vitest run tests/channels-connect-visibility.test.ts tests/account-channel-list.test.ts --reporter=dot
Result: passed. 2 files, 4 tests.

npm run lint
Result: passed.

npm run build
Result: passed.

npm run test:e2e:inbox
Result: passed for Chromium and mobile Chrome.

npm test
Result: failed in an existing Windows Vitest batch-level crash at batch 8/9, after rerunning individual files successfully.
```

- What changed:
  - `AI_TEAM/tasks/queue.json`
    - 正式作為 AI_TEAM 任務來源，runner 會同步寫回 task lifecycle，不再只是靜態待辦清單。
  - `AI_TEAM/tasks/current-task.md`
    - 改寫成這輪 AI_TEAM delivery autonomy 主題的完整缺口、DoD、驗證與 hard stop。
  - `AI_TEAM/tasks/backlog.md`
    - 重新整理成 AI_TEAM delivery autonomy 優先、產品功能次之的主題級 backlog。
  - `AI_TEAM/scripts/ai-team-runner.mjs`
    - 補上 queue lifecycle 寫回、`--only-worker` 單工 replay、`merge-delivery`、`deploy`、`delivery-state.json` 與 finalize task 流程。
    - `git-delivery` 現在會把 commit / PR 結果寫進 delivery state，後段 worker 直接接續判斷。
  - `AI_TEAM/scripts/lib/ai-team-paths.mjs`
    - 補 `delivery-state.json` runtime path。
  - `AI_TEAM/scripts/local-ai-team.ps1`
    - 補 delivery / merge / deploy 相關旗標，讓可視 PowerShell 7 啟動器能直接帶 unattended delivery 設定。
  - `AI_TEAM/README.md`
    - 補 queue lifecycle、完整 worker 順序、delivery flags、單工 replay 與可視啟動範例。
  - `AI_TEAM/RUNNER_DESIGN.md`
    - 補 delivery 後半段設計、queue lifecycle 與 replay 說明。
  - `docs/codex-session-log.md`
    - 追加這輪 delivery autonomy 主題的實作與驗證紀錄。
  - `docs/fix-roadmap.md`
    - 追加 AI_TEAM delivery autonomy closeout 的 current status / remaining。
  - `AI_TEAM/scripts/codex-dev.mjs`
    - 補成真正的 Codex CLI 開發入口，會依目前 task / backlog / runtime 報告組 prompt，讓 Codex 直接做本輪實作，而不是只吐建議。
  - `AI_TEAM/scripts/ai-team-runner.mjs`
    - runner 主流程改成 `codex-dev -> local-qa -> local-models`。
    - 新增 runner lock，避免多個 loop 互撞。
    - 一般模式預設使用 `lite QA`，睡覺模式預設使用 `full QA`。
  - `AI_TEAM/scripts/local-qa.mjs`
    - 新增 `--level=lite|full`。
    - 新增 QA lock，避免背景 loop 跟手動 QA 打架。
    - lint / test / build 失敗時，現在會把 exit code 與 stdout / stderr tail 寫進 QA 報告，不再只剩一句 `失敗`。
  - `AI_TEAM/README.md`
    - 改寫成 AI_TEAM 開發閉環使用說明。
  - `AI_TEAM/MODEL_ASSIGNMENT.md`
    - 明確把 Codex CLI 定義成主開發引擎，本地模型改成輔助層。
  - `AI_TEAM/RUNNER_DESIGN.md`
    - 明確定義一般模式 / 睡覺模式、QA 分級、lock 與 runtime 設計。
  - `package.json`
    - 補 `ai-team:dev`、`ai-team:qa:lite`、`ai-team:qa:full`。
- Why it changed:
  - 之前的 AI_TEAM 雖然已經有 worker pipeline，但交付段還停在半套：
    - queue 不會真正完成 lifecycle
    - 沒有安全 replay delivery worker 的入口
    - merge / deploy 還沒有實作成 worker
    - launcher 也不能直接帶交付旗標
  - 這輪先把同一主題的 runner / state / docs / smoke / delivery 一次補齊，避免又回到單點補洞。
  - 之前的 AI_TEAM 比較像 QA + 報告鏈，還不是會持續往下做的閉環。
  - 這輪把責任重新切清楚：Codex CLI 做主實作，本地模型做摘要，QA 做 gate，runner 負責接力。
  - 也順手修掉同時跑多個 loop / QA 時容易互撞的問題。
- Files:
  - `AI_TEAM/tasks/queue.json`
  - `AI_TEAM/tasks/current-task.md`
  - `AI_TEAM/tasks/backlog.md`
  - `AI_TEAM/scripts/codex-dev.mjs`
  - `AI_TEAM/scripts/ai-team-runner.mjs`
  - `AI_TEAM/scripts/local-qa.mjs`
  - `AI_TEAM/scripts/ai-team.mjs`
  - `AI_TEAM/scripts/lib/ai-team-paths.mjs`
  - `AI_TEAM/scripts/lib/process-lock.mjs`
  - `AI_TEAM/scripts/local-ai-team.ps1`
  - `AI_TEAM/README.md`
  - `AI_TEAM/MODEL_ASSIGNMENT.md`
  - `AI_TEAM/RUNNER_DESIGN.md`
  - `package.json`
  - `docs/codex-session-log.md`
  - `docs/fix-roadmap.md`

## Latest - 2026-06-30 Inbox / Channels visible-but-unusable closeout

Current status:

- `[x]` Inbox contact panel 的 `自動化暫停` 改成明確 disabled UX，不再像可直接操作的假按鈕。
- `[x]` IG account dropdown 的 partial metadata 目前會顯示更清楚的 `資料未完整` badge。
- `[x]` 這輪已補上對應的 focused unit test 與 authenticated Inbox smoke。
- `[x]` `npm run lint`、`npm run build`、`npm test`、`npm run test:e2e:inbox` 都已通過。

Launch impact:

- 產品可見入口的誤導性再少一點，但仍保留下一輪的 Inbox / Channels 收尾空間。
- No production DB mutation, migration, Production deployment, Meta App Review action, or PayUNI production action was performed.

Remaining risk:

- Inbox 其餘 header / composer 的暫停型控制項、Channels 次要控制項，仍可再做一輪更一致的 disabled UX 收尾。

## Latest - 2026-06-30 AI_TEAM disposable branch real delivery validation

Current status:

- `[x]` 已在 disposable branch `codex/ai-team-disposable-delivery-002` 真實完成 `git add` / `git commit` / `git push` / draft PR。
- `[x]` PR metadata 已生成，PR URL：`https://github.com/Forty-s-AI-Company/ig-auto-reply-manychat/pull/38`
- `[x]` `merge-delivery` 已真實驗證 draft PR gate，並且正確被 blocked。
- `[x]` `git-delivery` 已改成只交付 queue task scope，不會把整個髒工作樹一起帶上去。
- `[x]` queue / current-task / backlog / reports / docs 已同步完成這個主題的驗證結果。

Validation:

- `npx eslint AI_TEAM/scripts/ai-team-runner.mjs`: passed.
- `node AI_TEAM/scripts/ai-team-runner.mjs --once --mode=general --only-worker=git-delivery`: passed, commit / push / draft PR success.
- `node AI_TEAM/scripts/ai-team-runner.mjs --once --mode=general --only-worker=merge-delivery`: passed, draft PR gate blocked as expected.

Launch impact:

- Runner infrastructure only. No production DB, migration, Production deployment, Meta App Review, or PayUNI production change was performed.

## Previous Round

- What changed:
  - `src/components/InboxClient.tsx`
    - 新增 `resetFilters()`，讓 Inbox 空狀態與篩選面板的重設邏輯一致。
    - 修正空狀態 `清除篩選並重新查看`，現在會真正清掉搜尋、標籤、指派、分類、未讀條件。
    - 對話更新改成支援更精準的成功訊息，指派、提醒、已讀不再共用模糊提示。
    - 提醒選單把 `選擇日期與時間` 改成明確 disabled UX，避免假入口。
    - 新增 assignment / reminder 相關 `data-testid`，方便 smoke 穩定驗證。
  - `tests/e2e/inbox-auth.spec.ts`
    - 補上 assignment 更新驗證。
    - 補上固定提醒、disabled 自訂提醒、清除提醒驗證。
    - 補上空狀態 reset filter 驗證。
    - 補強 mobile 版 pane 切換，避免在 contact pane 直接操作 detail 控制項。
    - 把 channel-scope 與主對話斷言改成依穩定聯絡人名稱判斷，避免受最新訊息內容漂移影響。
- Why it changed:
  - 這輪目標是把 Inbox 第三輪還像半成品的互動收斂掉，而不是再做部署或測試基礎設施。
  - 原本最明顯的兩個問題是：
    - 使用者以為自己已經清除篩選，但其實 tag / assignee 還殘留。
    - 提醒選單把未完成功能包裝成可用入口，體感像壞掉。
  - 另外，既有 Inbox smoke 沒有真的守住 assignment / reminder / empty-state reset，補上之後比較不會回歸。
- Files:
  - `src/components/InboxClient.tsx`
  - `tests/e2e/inbox-auth.spec.ts`
  - `AI_TEAM/tasks/current-task.md`
  - `AI_TEAM/tasks/backlog.md`
  - `AI_TEAM/reports/dev-report.md`
  - `AI_TEAM/reports/final-report.md`
  - `docs/project-launch-checklist.md`
  - `docs/product-readiness-review.md`
  - `docs/fix-roadmap.md`
  - `docs/codex-session-log.md`
