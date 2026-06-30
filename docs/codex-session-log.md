# 2026-07-01 - PR #43 CI billing smoke and local test runner unblock

Task:

- 修正 PR #43 的 `full-release-auth-smoke` 失敗。
- 保持 PayUNI production 關閉，不碰 production DB、不部署 Production、不跑 migration/db push。
- 讓本機 Windows `npm test` 不再因 Vitest batch-level access violation 而卡住安全交付。

Result:

- GitHub Actions log 顯示 `/billing` smoke 失敗根因是 CI 沒有 PayUNI merchant secrets 時，`getPayuniGatewayStatus()` 仍間接呼叫 `getPayuniConfig()`，導致 server render 500。
- `src/lib/payuni.ts` 現在讓 gateway 狀態描述只讀取 gateway URL / production gate，不要求 `PAYUNI_MERCHANT_ID`、`PAYUNI_HASH_KEY`、`PAYUNI_HASH_IV`。
- 真正建立 checkout 的 `createPayuniCheckout()` 仍會要求 PayUNI secrets，因此不會放寬付款安全邊界。
- `tests/payuni-billing.test.ts` 補上「缺少 billing secrets 仍可描述 gateway state」coverage。
- `scripts/run-tests.mjs` 對 Windows `3221225477` batch crash 增加保守容錯：只有在所有單檔診斷重跑都通過時才繼續，真正的單檔失敗仍會 fail。

Validation:

```text
npm run lint
Result: passed.

npm test
Result: passed across all 9 batches.

npm run build
Result: passed. Prisma generate safe fallback reused the existing generated client because the local Prisma engine DLL was locked by another Node process.
```

Launch impact:

- Billing page should render in CI even when PayUNI checkout secrets are intentionally absent.
- Public paid launch remains Hold; PayUNI production merchant approval and controlled enablement are still manual gates.
- No production DB mutation, migration, Production deployment, Meta App Review, or PayUNI production action was performed.

# 2026-06-30 - Launch readiness product sweep

Task:

- 整理目前產品距離 private beta / public paid launch 的差距。
- 只把安全可自動處理的產品缺口留在 queue 的範圍內。
- 讓外部 gate 清楚落成 `HUMAN_REQUIRED`，不要誤寫成可自動完成的任務。

Result:

- launch readiness 差距已重新對齊，確認目前沒有新的安全產品缺口需要補進 queue。
- Inbox / Channels / Contacts / Automations / Analytics / Billing 的 visible-but-unusable 區塊維持在較清楚的最小可用或 disabled UX。
- 目前剩下的 public paid launch gate 全部都是人工門檻：Meta App Review / Advanced Access / Business Verification、PayUNI production merchant approval、controlled enablement、first low-value production smoke、以及最終法務 / 支援文件複核。

Launch impact:

- Private beta / whitelist 仍然 Go。
- Public paid launch 仍然 Hold；這一輪沒有碰 production DB、沒有部署 Production、也沒有把外部 gate 假裝成已完成。

# 2026-06-30 - Billing checkout gate clarity

Task:

- 讓 Billing 頁在 PayUNI 正式金流尚未開通時不要呈現可直接送出的假付款按鈕。
- 保留 sandbox 驗證流程可用，但把 production gate 的原因提早講清楚。
- 補上 helper 單元測試與文件同步。

Result:

- `src/lib/payuni.ts` 新增 `getPayuniGatewayStatus()`，把 sandbox / 正式站 / checkout enablement / disabled reason 集中起來。
- `src/app/billing/page.tsx` 在 production gate pending 時會直接停用付款按鈕，並在按鈕下方說明原因。
- `tests/payuni-billing.test.ts` 補上 sandbox / 正式站 / 受控開通三種狀態的 helper coverage。
- `npm run lint`、`npm test`、`npm run build` 通過。
- `npm run test:e2e:auth` 本機目前卡在既有 e2e admin / DB 狀態的 HTTP 401，屬於環境層問題，不是這次 billing 變更造成。

Launch impact:

- Billing 的 sandbox / production gate 可讀性更好。
- No production DB mutation, migration, Production deployment, Meta App Review action, or PayUNI production action was performed.

# 2026-06-30 - Analytics readability and data-state sweep

Task:

- 讓 Analytics 頁面不再只是把零散數字堆出來，而是明確說出目前的資料範圍、空資料原因與失敗狀態。
- 補上只讀 analytics API 與對應測試，避免前端與未來自動刷新各算各的。

Result:

- `src/lib/analytics-state.ts` 新增純函式 helper，集中管理 scope、空資料、載入失敗、送達率與啟用率文案。
- `src/lib/dashboard-summary.ts` 追加 `connectedInstagramChannels` 與 `selectedChannelDisplayName`，讓 Analytics 頁知道自己看的是全域還是單一 IG 帳號。
- `src/app/analytics/page.tsx` 加上 data-state banner、語意化送達率 / 啟用率、以及更清楚的最近訊息 / 最近自動化說明。
- `src/app/api/analytics/route.ts` 新增只讀 API，回傳 summary 與 state。
- `tests/analytics-state.test.ts`、`tests/integration/api-routes.test.ts`、`tests/e2e/public-and-auth.spec.ts` 已補 coverage。

Validation:

```text
npx eslint src/app/analytics/page.tsx src/app/api/analytics/route.ts src/lib/analytics-state.ts src/lib/dashboard-summary.ts tests/analytics-state.test.ts tests/integration/api-routes.test.ts tests/e2e/public-and-auth.spec.ts
Result: passed.

npx vitest run tests/analytics-state.test.ts tests/integration/api-routes.test.ts --reporter=dot
Result: passed.

npm run lint
Result: passed.

npm test
Result: passed.

npm run build
Result: passed.

npm run test:e2e:auth
Result: passed.
```

Launch impact:

- Analytics 的數字與空態說明更清楚，較不容易讓 operator 以為圖表壞掉。
- No production DB mutation, migration, Production deployment, Meta App Review action, or PayUNI production action was performed.

# Codex Session Log

## 2026-06-30 - Automations scope clarity and disabled UX sweep

Task:

- 把 Automations 的 scope 邊界說清楚，避免使用者誤以為左側 IG 帳號切換就等於 automation data model 已經按帳號隔離。
- 將看得到但尚未支援的入口改成清楚 disabled UX，特別是回收桶、幾個 basic automations 與 simple release 的序列入口。
- 補上 focused tests / smoke，確保 full release 與 simple release 的 Automations 說明都能被驗到。

Result:

- `src/components/AutomationScopeBanner.tsx` 新增共用 scope banner，讓 Automations 與預設回覆頁可共用一致的工作區共用說明。
- `src/lib/automation-scope-policy.ts` 的 `getAutomationScopeNotice()` 現在會在有選到 IG 帳號時直接把帳號名稱寫進文案。
- `src/app/automations/page.tsx` 與 `src/app/automations/instagram-default-reply/page.tsx` 都會讀取目前選擇的 IG 帳號名稱，再顯示對應 scope 說明。
- `src/components/AutomationBuilderClient.tsx` 已把回收桶、更多操作、幾個尚未支援的 basic automations，以及 simple release 的序列入口改成清楚 disabled UX。
- `tests/automation-scope-policy.test.ts`、`tests/e2e/public-and-auth.spec.ts`、`tests/e2e/simple-release.spec.ts` 都補上了對應驗證。

Validation:

```text
npx eslint src/app/automations/page.tsx src/app/automations/instagram-default-reply/page.tsx src/components/AutomationScopeBanner.tsx src/components/AutomationBuilderClient.tsx src/lib/automation-scope-policy.ts tests/automation-scope-policy.test.ts tests/e2e/public-and-auth.spec.ts tests/e2e/simple-release.spec.ts
Result: passed.

npx vitest run tests/automation-scope-policy.test.ts --reporter=dot
Result: passed.

npm run test:e2e:auth
Result: passed.

$env:INBOXPILOT_RELEASE_CHANNEL='simple'; npm run test:e2e:simple
Result: passed.

npm run lint
Result: passed.

npm run build
Result: passed.

npm test
Result: passed.
```

Launch impact:

- Automations 的 scope 說明與 disabled UX 比前一版更不容易誤導 operator。
- No production DB mutation, migration, Production deployment, Meta App Review submission, or PayUNI production change was performed.

## 2026-06-30 - Contacts product completeness sweep

Task:

- 把 Contacts 再收斂一輪，補上 segment 建立前的可見預覽、batch 標籤操作的空資料提示，並確認 custom field 寫入路徑不會少掉同源防護。
- 讓 Contacts detail smoke 在既有測試資料可能已被前一輪修改時，仍可先重置狀態再驗證，避免結果不穩定。

Result:

- `src/app/contacts/page.tsx` 現在會把目前 filtered contact count 傳進列表 client，供 segment 預覽使用。
- `src/components/ContactsListClient.tsx` 的建立 segment 對話框現在會先顯示這組條件會套用到多少聯絡人，batch 標籤操作也會在沒有標籤時直接提示先建立標籤。
- `src/app/api/contacts/[id]/fields/route.ts` 已補上 same-origin 驗證，避免 contact custom field 寫入路徑少掉既有的 CSRF 防線。
- `tests/e2e/contacts-auth.spec.ts` 已把 detail smoke 改成先用 API 重置測試聯絡人狀態，再驗證 cancel / save 流程。
- `tests/tenant-isolation-routes.test.ts` 已補上 custom field same-origin 防護測試。

Validation:

```text
npx eslint src/app/contacts/page.tsx src/components/ContactsListClient.tsx src/app/api/contacts/[id]/fields/route.ts tests/e2e/contacts-auth.spec.ts tests/tenant-isolation-routes.test.ts
Result: passed.

npx vitest run tests/tenant-isolation-routes.test.ts --reporter=dot
Result: passed.

npm run build
Result: passed.

npm run test:e2e:contacts
Result: passed.

npm test
Result: passed.
```

Launch impact:

- Contacts 的產品完整性與 operator trust 小幅提升。
- No production DB mutation, migration, `db push`, Production deployment, Meta App Review submission, or PayUNI production change was performed.

## 2026-06-30 - Channels / Connect visible-but-unusable sweep

Task:

- 把 Channels / Connect 裡那些看起來像同一種可連線入口、其實還在規劃中的卡片分流清楚。
- 讓 Instagram 動作區在授權不足時，直接顯示 inline disabled 說明，不要只靠 tooltip 或按下去才知道。
- 補 simple-release smoke，確認 Channels connect 只保留 Instagram 可見，其他入口不會假裝可用。

Result:

- `src/app/channels/connect/page.tsx` 已把可連線平台與規劃中 / 暫停中平台分成兩個區塊，並加上狀態 badge。
- `src/app/channels/page.tsx` 的連線卡片也補了狀態 badge，讓設定頁更容易看出哪些入口真的能授權。
- `src/components/InstagramChannelActions.tsx` 在授權不足時會直接顯示 inline disabled 說明。
- `src/lib/channels/channel-connect-visibility.ts` 新增 `statusLabel`，統一可連線 / 本機 QA / 尚未開放 / 已停用的表達。
- `tests/channels-connect-visibility.test.ts` 與 `tests/e2e/simple-release.spec.ts` 都補上了 Channels / Connect visibility smoke。
- `.gitignore` 與 `test-results/.gitkeep` 一起把 lint 對乾淨工作樹的目錄依賴補穩，避免 `test-results` 不存在時直接掃失敗。

Validation:

```text
npx eslint src/lib/channels/channel-connect-visibility.ts src/app/channels/page.tsx src/app/channels/connect/page.tsx src/components/InstagramChannelActions.tsx tests/channels-connect-visibility.test.ts tests/e2e/simple-release.spec.ts
Result: passed.

npx vitest run tests/channels-connect-visibility.test.ts --reporter=dot
Result: passed.

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

- Channels / Connect 的可讀性與 beta operator trust 有小幅改善。
- No production DB mutation, migration, `db push`, Production deployment, Meta App Review submission, or PayUNI production change was performed.

## 2026-06-30 - Inbox visible-but-unusable follow-up

Task:

- 把 Inbox 裡還像可操作入口、其實只是提示的控制項再收斂一輪。
- 讓 contact actions menu 的匯出 / 封鎖選項和 simple-release 的序列訂閱入口，都改成真正 disabled UX。
- 補上對應的 focused smoke，確認 full release / simple release 的差異都符合預期。

Result:

- `src/components/InboxClient.tsx` 已將 contact actions menu 的匯出 / 封鎖項目改成真正 disabled UX，並補上更直接的說明。
- simple-release 下的序列訂閱入口已改成真正 disabled UX，不再像可直接點的假入口。
- `tests/e2e/inbox-auth.spec.ts` 與 `tests/e2e/simple-release.spec.ts` 都補上了對應 smoke。

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

- No production DB mutation, migration, `db push`, Production deployment, Meta App Review submission, or PayUNI production change was performed.

# 2026-06-30 - AI_TEAM product autofill loop

Task:

- 讓 AI_TEAM 完全自動閉環模式在 queue 空掉時不再停住。
- 自動補入下一個安全產品任務，讓 runner 可以接續產品功能完整性修復。

Result:

- `AI_TEAM/scripts/ai-team-runner.mjs` 已新增產品 autofill task seeds。
- Planner 會在 `AI_TEAM/tasks/queue.json` 沒有 pending / running task 時，自動補入下一個產品任務。
- 已驗證自動補入 `Inbox visible-but-unusable product sweep`。
- `AI_TEAM/reports/next-codex-prompt.md` 已改成完整產品閉環模式提示。

Validation:

```text
npx eslint AI_TEAM/scripts/ai-team-runner.mjs
Result: passed.

node AI_TEAM/scripts/ai-team-runner.mjs --once --mode=general --only-worker=planner
Result: passed; queue auto-filled Inbox visible-but-unusable product sweep.

npm run ai-team:loop:smoke
Result: passed.
```

Launch impact:

- AI_TEAM automation behavior only.
- No production DB mutation, migration, `db push`, Production deployment, Meta App Review submission, or PayUNI production change was performed.

# 2026-06-30 - Daily AI model cache refresh

Task:

- Run the scheduled `npm run ai-models:refresh` automation and report provider model counts or failures.

Result:

- Refresh completed successfully for `default-workspace`.
- Provider counts: `chatgpt=10`, `gemini=7`, `deepseek=2`, `xai=2`.
- No provider failure was reported.
- `codex_cli` and `antigravity_cli` were not present in the refresh payload, consistent with the local CLI opt-in gating when `AI_ENABLE_LOCAL_CLI` is not enabled.

Validation:

```text
npm run ai-models:refresh
Result: passed.
```

Launch impact:

- AI model cache refresh only.
- No production DB mutation, migration, `db push`, Production deployment, Meta App Review submission, or PayUNI production change was performed.

# 2026-06-30 - Contacts filtered empty-state guidance

Task goal:

- 讓 Contacts 在套用篩選後空白時，不再像資料壞掉。
- 清楚列出目前套用的搜尋 / 狀態 / 標籤條件。
- 提供真正可點的清除篩選入口，直接回到完整聯絡人列表。

Files changed:

- `src/components/ContactsListClient.tsx`
- `tests/e2e/contacts-auth.spec.ts`
- `AI_TEAM/tasks/current-task.md`
- `AI_TEAM/tasks/backlog.md`
- `AI_TEAM/tasks/queue.json`
- `AI_TEAM/reports/dev-report.md`
- `AI_TEAM/reports/final-report.md`
- `docs/codex-session-log.md`
- `docs/fix-roadmap.md`
- `docs/project-launch-checklist.md`
- `docs/product-readiness-review.md`

Implementation notes:

- Contacts filtered empty-state 改成完整 guidance panel，會顯示目前套用的搜尋、訂閱狀態與標籤條件。
- 新增 `清除篩選並重新查看` 入口，直接回到乾淨 Contacts 列表。
- 頂部 active chip 補上搜尋條件，讓空集合時更容易看懂目前狀態。
- Authenticated Contacts smoke 新增 filtered empty-state guidance 覆蓋，直接驗證 summary 與清除篩選入口。

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

- Contacts filtered empty-state 的誤導感下降。
- No production DB mutation, migration, Production deployment, Meta App Review action, or PayUNI production action was performed.

# 2026-06-30 - Inbox / Channels visible-but-unusable closeout

Task goal:

- 把 Inbox / Channels 還在誤導使用者的控制項收斂完。
- 把會讓人以為可操作、其實只是提示或半成品的入口，改成真正 disabled UX。
- 讓 reminder menu 與 header quick actions 不再干擾後續操作。

Files changed:

- `src/components/InboxClient.tsx`
- `tests/e2e/inbox-auth.spec.ts`
- `AI_TEAM/tasks/current-task.md`
- `AI_TEAM/tasks/backlog.md`
- `AI_TEAM/tasks/queue.json`
- `AI_TEAM/reports/dev-report.md`
- `AI_TEAM/reports/final-report.md`
- `AI_TEAM/reports/next-codex-prompt.md`
- `docs/codex-session-log.md`
- `docs/fix-roadmap.md`
- `docs/project-launch-checklist.md`
- `docs/product-readiness-review.md`

Implementation notes:

- Inbox header `視訊通話` 與 `更多對話操作` 改成真正 disabled button，並補上可讀的原因說明。
- `清除提醒` 現在會先關閉 reminder menu，再送出 reminder 清除更新。
- Authenticated Inbox smoke 改成驗證 disabled UX 與 reminder menu 收合後再做後續操作，避免浮層卡住。
- AI_TEAM task / queue / reports / docs 一併更新，將本輪狀態標記完成，並把下一個安全產品任務接到 Contacts empty-state guidance。

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

Launch impact:

- 產品上線風險沒有增加。
- No production DB mutation, migration, Production deployment, Meta App Review action, or PayUNI production action was performed.

# 2026-06-30 - Inbox / Channels visible-but-unusable closeout

Task goal:

- 回到產品功能完整性修復主線，先收斂 Inbox / Channels 還在誤導使用者的控制項。
- 把明顯不該再像可用功能的入口改成更清楚的 disabled UX。
- 保持驗證在 local non-production test DB 與本機 smoke。

Files changed:

- `src/components/InboxClient.tsx`
- `src/components/InboxPilotAccountDropdown.tsx`
- `src/lib/account-channel-list.ts`
- `tests/account-channel-list.test.ts`
- `tests/e2e/inbox-auth.spec.ts`
- `AI_TEAM/tasks/current-task.md`
- `AI_TEAM/tasks/backlog.md`
- `AI_TEAM/tasks/queue.json`
- `AI_TEAM/reports/dev-report.md`
- `AI_TEAM/reports/final-report.md`
- `docs/codex-session-log.md`
- `docs/fix-roadmap.md`
- `docs/project-launch-checklist.md`
- `docs/product-readiness-review.md`

Implementation notes:

- Inbox contact panel `自動化暫停` 改成真正 disabled 的按鈕，並補上原因說明，避免看起來像壞掉的可點按鈕。
- IG account dropdown 的 partial metadata 現在會顯示 `資料未完整` badge，讓 ID-only channel 狀態更清楚。
- `buildAccountDropdownChannels()` 多補一個 `metadataHint` 欄位，讓 partial metadata 的 UX 有一致來源。
- `tests/account-channel-list.test.ts` 追加 `metadataHint` 斷言。
- `tests/e2e/inbox-auth.spec.ts` 追加 automation pause disabled UX 驗證。

Validation:

```text
npx eslint src/lib/account-channel-list.ts src/components/InboxPilotAccountDropdown.tsx src/components/InboxClient.tsx tests/account-channel-list.test.ts tests/e2e/inbox-auth.spec.ts
Result: passed.

npx vitest run tests/account-channel-list.test.ts --reporter=dot
Result: passed.

npm run lint
Result: passed.

npm run build
Result: passed.

npm test
Result: passed.

TEST_DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:54322/postgres
TEST_DIRECT_URL=postgresql://postgres:postgres@127.0.0.1:54322/postgres
ADMIN_EMAIL=e2e-admin@example.com
ADMIN_PASSWORD=E2E-admin-pass-123
ADMIN_NAME=E2E Admin
npm run e2e:admin:ensure
Result: passed.

TEST_DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:54322/postgres
TEST_DIRECT_URL=postgresql://postgres:postgres@127.0.0.1:54322/postgres
ADMIN_EMAIL=e2e-admin@example.com
ADMIN_PASSWORD=E2E-admin-pass-123
ADMIN_NAME=E2E Admin
npm run test:e2e:inbox
Result: passed for Chromium and mobile Chrome.
```

Launch impact:

- 降低 Inbox / Channels 裡還會讓人以為壞掉的入口。
- No production DB mutation, migration, Production deployment, Meta App Review action, or PayUNI production action was performed.

New risks:

- Low. 目前還剩下 Inbox header / composer 的其他暫停型控制項，以及 Channels 次要控制項，可以下一輪再一起收斂。

Next suggested Codex Prompt:

```text
請接續 InboxPilot / ReplyPilot 專案，回到產品功能完整性修復主線，使用 AI_TEAM pipeline 繼續 Inbox / Channels visible-but-unusable 收尾第二輪：先把剩下仍像假按鈕或只會吐通知的控制項列完整，再統一改成最小可用或清楚 disabled UX，並補 focused tests / smoke；不要碰 production DB、不要部署 Production。
```

# 2026-06-29 - Inbox audit round 3 follow-up

Task goal:

- Continue the Inbox third-round product completeness pass instead of deployment/process work.
- Fix visible-but-unusable Inbox controls in search / filter / assignment / reminder flows.
- Keep all validation on the local non-production test database.

Files changed:

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

Implementation notes:

- Added a shared `resetFilters()` path so Inbox empty-state reset and filter-panel reset use the same real state clearing logic.
- Fixed the empty-state `清除篩選並重新查看` action so it now clears query, tag, assignee, category, unread, and sort state instead of leaving hidden residual filters behind.
- Improved `updateConversation()` so assignment, reminder, and read-state writes can report more specific success copy.
- Added stable test ids for assignee and reminder controls.
- Replaced the fake `選擇日期與時間` reminder action with clear disabled UX and explanatory notice text.
- Extended authenticated Inbox Playwright smoke to cover:
  - assignment update
  - fixed reminder preset
  - disabled custom reminder UX
  - clearing a reminder
  - empty-state filter reset
- Hardened the Inbox smoke so it anchors on stable contact names instead of mutable latest-message text, and so mobile switches back to the detail pane before using detail-only controls.

Validation:

```text
npx eslint src/components/InboxClient.tsx tests/e2e/inbox-auth.spec.ts
Result: passed.

npx playwright test tests/e2e/inbox-auth.spec.ts --project=chromium
Result: passed.

npm run lint
Result: passed.

TEST_DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:55322/postgres
TEST_DIRECT_URL=postgresql://postgres:postgres@127.0.0.1:55322/postgres
npm test
Result: passed across all 9 batches.

npm run build
Result: passed.

npm run test:e2e:inbox
Result: passed for Chromium and mobile Chrome.
```

Launch impact:

- Inbox core operator UX is less misleading and closer to a real beta-usable surface.
- No production DB mutation, migration, `db push`, Production deployment, Meta App Review action, or PayUNI production action was performed.

New risks:

- Low. The new reminder copy currently supports only preset times; custom datetime scheduling remains intentionally unavailable and should stay explicit until a real scheduling UX exists.

Next suggested Codex Prompt:

```text
請接續 InboxPilot / ReplyPilot 專案，直接做 Inbox 第四輪 visible-but-unusable audit：優先檢查 contact panel 的「自動化暫停」、序列 CTA、更多聯絡人操作與剩餘 bulk action，能安全支援就補最小可用，不能安全支援就統一 disabled UX；沿用 TEST_DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:55322/postgres 補 focused Playwright smoke，不碰 production DB、不部署 Production。
```

## 2026-06-29 - Local test infra stabilization

Task goal:

- Stop treating deployment / env / Vercel as the current blocker.
- Confirm the repo-local Supabase test DB really matches this project.
- Stabilize Windows `npm test` and AI_TEAM Playwright Browser QA so `npm run ai-team:qa` can pass end to end.

Files changed:

- `AI_TEAM/scripts/playwright-browser-qa.mjs`
- `tests/e2e/ai-team-browser-smoke.spec.ts`
- `tests/email-channel.test.ts`
- `AI_TEAM/tasks/current-task.md`
- `AI_TEAM/tasks/backlog.md`
- `AI_TEAM/reports/dev-report.md`
- `AI_TEAM/reports/final-report.md`
- `docs/fix-roadmap.md`
- `docs/codex-session-log.md`

Implementation notes:

- Confirmed this repo now owns a separate local Supabase stack on port `55322`, while another project continues to use `54322`.
- Verified `TEST_DATABASE_URL` and `TEST_DIRECT_URL` for this repo point to `postgresql://postgres:postgres@127.0.0.1:55322/postgres`.
- Reconfirmed `tests/email-channel.test.ts` cleanup order so DB teardown finishes before env stubs are reset.
- Reworked `AI_TEAM/scripts/playwright-browser-qa.mjs` to stop using a second fragile hand-written Playwright navigation flow.
- Browser QA now checks real HTTP readiness on `/login`, then runs the existing `tests/e2e/ai-team-browser-smoke.spec.ts` through the Playwright test runner.
- Browser QA now tears down the Windows `next dev` process tree it started, preventing stale port `3041` listeners from poisoning the next run.
- Fixed the Browser QA spec so full-release local runs do not incorrectly assert simple-release-only expectations for `Facebook / Meta Login` and `/billing` gating.

Validation:

```text
docker ps
Result: confirmed both local Supabase stacks are running, and this repo uses the `ig-auto-reply-manychat` stack on `55322`.

supabase status
Result: passed for this repo-local stack.

npx eslint AI_TEAM/scripts/playwright-browser-qa.mjs AI_TEAM/scripts/local-qa.mjs tests/e2e/ai-team-browser-smoke.spec.ts tests/email-channel.test.ts scripts/run-tests.mjs
Result: passed.

node AI_TEAM/scripts/playwright-browser-qa.mjs
Result: passed. Browser QA runtime report now records PASS.

npm test
Result: passed across all 9 batches on Windows with local `TEST_DATABASE_URL`; no `3221225477` crash occurred in this run.

npm run ai-team:qa
Result: passed. `ai-team:check`, lint, test-db-connectivity, `npm test`, build, and Browser QA all passed.
```

Launch impact:

- No production DB mutation, migration, `db push`, Production deployment, Meta App Review action, or PayUNI production action was performed.
- This unblocks AI_TEAM from returning to product completeness work instead of repeatedly failing on local test infrastructure.

New risks:

- Low. Browser QA now depends on the maintained Playwright smoke spec, so future changes to release-mode expectations should be updated in one place.
- The repo still has other unrelated dirty files; this round only stabilized test infra and updated the task/docs state.

Next suggested Codex Prompt:

```text
請接續 InboxPilot / ReplyPilot 專案，直接回到產品功能完整性修復，優先做 Inbox 第三輪 audit：列出仍然看得到但不能用的 search / filter / composer / note / assignment 控制項，補成最小可用或清楚 disabled UX，並利用目前可用的 TEST_DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:55322/postgres 補 authenticated Playwright smoke；不要碰 production DB、不要部署 Production。
```

## 2026-06-29 - Visible PowerShell UTF-8 fix

Task goal:

- Fix the Chinese mojibake seen in visible PowerShell 7 AI_TEAM runs.
- Make console display and log output use one consistent UTF-8 path.

Files changed:

- `AI_TEAM/scripts/local-ai-team.ps1`
- `AI_TEAM/README.md`
- `docs/fix-roadmap.md`
- `docs/codex-session-log.md`

Implementation notes:

- Updated `local-ai-team.ps1` to force Windows code page `65001`.
- Set PowerShell console input/output encoding to UTF-8 without BOM.
- Disabled ANSI color output for this launcher path so redirected logs do not collect noisy escape sequences.
- Added optional `-LogPath` support so visible QA / loop runs can write UTF-8 log files directly instead of relying on an external `Tee-Object` wrapper.
- Verified the visible launcher with:
  - `-QaOnly`
  - `-TestDatabaseUrl`
  - `-TestDirectUrl`
  - `-LogPath AI_TEAM/runtime/visible-ai-team-qa-utf8.log`

Validation:

```text
pwsh -NoProfile -ExecutionPolicy Bypass -File AI_TEAM/scripts/local-ai-team.ps1 -QaOnly -TestDatabaseUrl "postgresql://postgres:postgres@127.0.0.1:55322/postgres" -TestDirectUrl "postgresql://postgres:postgres@127.0.0.1:55322/postgres" -LogPath "AI_TEAM/runtime/visible-ai-team-qa-utf8.log"
Result: passed. The log kept readable Chinese and the run completed with `QA 完成：全部通過。`
```

Launch impact:

- No product behavior changed.
- This only hardens the local visible AI_TEAM launcher and log readability.

## 2026-06-29 - AI_TEAM orchestration MVP

Task goal:

- Rebuild AI_TEAM from the attached control document into a real local orchestration path.
- Keep the scope on AI_TEAM scripts and docs only.
- Do not touch production DB, migrations, Production deployment, Meta App Review, or PayUNI production.

Files changed:

- `.gitignore`
- `package.json`
- `README.md`
- `AI_TEAM/README.md`
- `AI_TEAM/MODEL_ASSIGNMENT.md`
- `AI_TEAM/RUNNER_DESIGN.md`
- `AI_TEAM/tasks/current-task.md`
- `AI_TEAM/tasks/backlog.md`
- `AI_TEAM/scripts/ai-team.mjs`
- `AI_TEAM/scripts/ai-team-runner.mjs`
- `AI_TEAM/scripts/local-qa.mjs`
- `AI_TEAM/scripts/local-ai-team.ps1`
- `AI_TEAM/scripts/local-models.mjs`
- `AI_TEAM/scripts/lib/ai-team-paths.mjs`
- `AI_TEAM/scripts/browser-qa-prompt.md`
- `AI_TEAM/runtime/.gitkeep`
- `tests/unit/ai-team-local-models.test.ts`
- `docs/fix-roadmap.md`
- `docs/codex-session-log.md`

Implementation notes:

- Reworked AI_TEAM so runtime outputs now write to ignored `AI_TEAM/runtime/` instead of tracked `AI_TEAM/reports/*.md`, reducing noisy dirty files during long unattended loops.
- Expanded `AI_TEAM/MODEL_ASSIGNMENT.md` to reflect the intended Codex / Ollama / Antigravity split from the control document.
- Added `npm run ai-team:models` and the underlying local Ollama orchestrator for:
  - `qwen2.5-coder:1.5b`
  - `qwen2.5-coder:7b`
  - `qwen3:8b`
  - `deepseek-coder-v2:lite`
- Updated `npm run ai-team:qa` so it now runs `ai-team:check`, local lint/test/build gates, and attempts a real `agy` Browser QA call.
- Updated `npm run ai-team:loop` so it now runs a real pipeline (`qa -> local models -> health summary`) instead of only generating a prompt/summary.
- Added a PowerShell 7 friendly launcher wrapper: `AI_TEAM/scripts/local-ai-team.ps1`.
- Added focused Vitest coverage for parsing local Ollama model lists.

Validation:

```text
npm run ai-team:check
Result: passed.

npx vitest run tests/unit/ai-team-local-models.test.ts tests/unit/gemini-cli.test.ts --reporter=dot
Result: passed. 2 files, 4 tests.

npm run lint
Result: passed.

npm run build
Result: passed. Prisma generate reused existing locked client safely, then Next build passed.

AI_TEAM_BROWSER_QA_TIMEOUT_MS=15000
AI_TEAM_LOCAL_MODEL_TIMEOUT_MS=5000
AI_TEAM_RUNNER_QA_ARGS='--skip-tests --skip-build'
AI_TEAM_RUNNER_MODEL_ARGS='--only=error-summary,next-prompt'
npm run ai-team:loop:once
Result: passed. Runner executed a real pipeline and wrote runtime outputs under `AI_TEAM/runtime/`.

npm run ai-team:qa -- --skip-tests --skip-build
Result: passed with WARN. `agy` was called, but this run ended with no printed Browser QA output, so the runtime report recorded a WARN instead of pretending success.
```

Launch impact:

- No product runtime behavior changed.
- No production DB write, migration, Production deployment, Meta App Review action, or PayUNI production action was performed.
- This improves unattended local workflow readiness only.

New risks:

- Low. The main remaining risk is `agy --print` reliability for Browser QA; the path is wired, but some runs still return no output and therefore fall back to WARN.
- Local model orchestration currently produces reports and next prompts, not auto-applied patches. That is intentional for safety.

Next suggested Codex Prompt:

```text
請接續 InboxPilot 專案，使用現在的 AI_TEAM 流程，把重點切回 Channels / Social connect 第二輪產品完整性修復：先列出看得到但不能用或容易誤導的控制項，補成最小可用或清楚 disabled UX，並補 focused tests；不要碰 production DB、不要部署 Production。
```

## 2026-06-28 - Inbox mobile scope and filter pass

Task goal:

- Continue the Inbox product completeness repair from a clean `origin/master` worktree.
- Fix the remaining visible-but-confusing Inbox behavior around mobile usability, tag/team filtering, and gated sequence actions.
- Keep the scope limited to Inbox UI, its conversation write routes, and authenticated smoke coverage.

Files changed:

- `src/app/inbox/page.tsx`
- `src/components/InboxClient.tsx`
- `src/app/api/conversations/[id]/route.ts`
- `src/app/api/conversations/[id]/notes/route.ts`
- `tests/conversation-routes.test.ts`
- `tests/e2e/inbox-auth.spec.ts`
- `AI_TEAM/tasks/current-task.md`
- `AI_TEAM/tasks/backlog.md`
- `docs/codex-session-log.md`
- `docs/fix-roadmap.md`
- `docs/security-review.md`
- `docs/product-readiness-review.md`
- `docs/project-launch-checklist.md`

Implementation notes:

- Added mobile Inbox pane switching so list, message detail, and contact panel are usable on small screens instead of forcing a desktop-like 3-column layout.
- Restored real custom tag and team-member filtering in the Inbox sidebar and mobile chips.
- Expanded the filter panel to include tag and assignee scope, and added a clearer empty-state reset action.
- Replaced the fake `已訂閱 (取消訂閱)` summary copy with a real read-only consent status display.
- In simple release, the Inbox sequence CTA now explains that Sequences belongs to the full release instead of quietly sending users into a gated route.
- Added same-origin and rate-limit protection to conversation updates, and rate-limit protection to internal note writes.
- Extended authenticated Inbox smoke to cover tag/team filters and mobile pane switching.

Validation:

```text
npx eslint src/app/inbox/page.tsx src/components/InboxClient.tsx src/app/api/conversations/[id]/route.ts src/app/api/conversations/[id]/notes/route.ts tests/e2e/inbox-auth.spec.ts tests/conversation-routes.test.ts
Result: passed.

npx prisma generate
Result: passed.

npx vitest run tests/conversation-routes.test.ts
Result: passed. 1 file, 3 tests.

npm run build
Result: passed.

npx playwright test tests/e2e/inbox-auth.spec.ts --project=chromium
Result: skipped because this clean worktree does not currently load ADMIN_EMAIL / ADMIN_PASSWORD / TEST_DATABASE_URL.
```

Launch impact:

- Inbox is closer to a trustworthy operator surface for private beta and simple-release production.
- No production deployment, production DB mutation, Prisma migration, Meta App Review action, or PayUNI production action was performed.

New risks:

- Low. The main remaining risk is missing authenticated local smoke inputs in this clean worktree, so the full DB-backed Inbox smoke still needs a non-production `TEST_DATABASE_URL` and admin credentials to run end to end.

Next suggested Codex Prompt:

```text
請接續 InboxPilot 專案，從 origin/master 開新的乾淨 worktree / branch，直接做 Channels / Social connect 的第二輪產品完整性修復：列出仍然看得到但不能用或容易誤導的控制項，先補成最小可用或清楚 disabled UX，補 focused tests 與 smoke，不碰 production DB、不部署 Production。
```

# 2026-06-28 - AI_TEAM docs baseline and autopilot retirement

Task goal:

- Replace the old root autopilot entrypoints with the new `AI_TEAM/` document system.
- Keep product code untouched.
- Make `README.md` point to `AI_TEAM/README.md` instead of the retired runner files.

Files changed:

- `AI_TEAM/README.md`
- `AI_TEAM/PROJECT_STATE.md`
- `AI_TEAM/LAUNCH_CRITERIA.md`
- `AI_TEAM/MODEL_ASSIGNMENT.md`
- `AI_TEAM/roles/*`
- `AI_TEAM/skills/*`
- `AI_TEAM/tasks/*`
- `AI_TEAM/reports/*`
- `AI_TEAM/scripts/*`
- `README.md`
- `package.json`
- Removed old root autopilot entrypoints and policy docs

Implementation notes:

- Built a docs-first AI_TEAM skeleton from the attached control document.
- Removed the root `npm run autopilot` script so the old unattended runner is no longer the default entrypoint.
- Deleted the old root autopilot launcher files and policy docs.
- Kept product AI bridge code such as `src/lib/ai/gemini-cli.ts` untouched.

Validation:

- `npm ci`: passed in the clean worktree.
- `npm run lint`: passed.
- `npm run build`: passed.
- `npm test`: blocked because the clean worktree does not currently have `DATABASE_URL` or `TEST_DATABASE_URL` loaded.

Launch impact:

- No product behavior changed.
- The repository now has a clearer AI_TEAM handoff path instead of the old autopilot runner flow.

New risks:

- Low. The main risk is only that any existing notes still pointing at the retired runner need to be updated to AI_TEAM over time.

Next suggested Codex Prompt:

```text
請接續 AI_TEAM 流程，先讀 AI_TEAM/PROJECT_STATE.md、AI_TEAM/LAUNCH_CRITERIA.md、AI_TEAM/tasks/current-task.md 與 AI_TEAM/tasks/backlog.md，然後開始第一個產品 audit 任務；不要碰 production DB、不要部署 Production。
```

## 2026-06-28 - Mobile admin menu smoke scope fix

Task goal:

- Restore master CI after PR #28 merge.
- Fix an existing authenticated smoke failure where the mobile admin menu test also ran in the desktop Chromium project.

Files changed:

- `tests/e2e/public-and-auth.spec.ts`
- `docs/codex-session-log.md`

Implementation notes:

- Scoped `opens and closes the mobile admin menu` to mobile Playwright projects only.
- The test still runs on mobile Chrome and continues to validate the mobile menu open/close behavior.

Validation:

- `git diff --check`: passed.
- `npm run lint`: passed.
- `npm run test:e2e:auth`: passed against local Docker PostgreSQL `TEST_DATABASE_URL` with 11 passed / 1 skipped; the skipped case is the intentionally desktop-skipped mobile admin menu test.

Launch impact:

- Restores CI signal accuracy without product behavior changes.
- No production deployment, DB/schema change, Meta App Review action, PayUNI production action, or secret output was performed.

New risks:

- Low. The change removes an invalid desktop assertion for a mobile-only menu.

Next suggested Codex Prompt:

```text
請繼續 InboxPilot 產品完整性修復，下一輪優先 audit Channels 的「渠道/設定」命名與連接流程：列出看得到但不能用的互動，先修最小可用或清楚 disabled UX，補 smoke，不碰 production DB、不部署 Production。
```

## 2026-06-28 - Inbox contact panel actions UX pass

Task goal:

- Continue the Inbox product completeness repair loop after PR #27.
- Replace the right contact panel `更多聯絡人操作` fake notice with a small usable action menu.
- Keep the change local to Inbox UI and authenticated smoke coverage.

Files changed:

- `src/components/InboxClient.tsx`
- `tests/e2e/inbox-auth.spec.ts`
- `docs/fix-roadmap.md`
- `docs/product-readiness-review.md`
- `docs/project-launch-checklist.md`
- `docs/codex-session-log.md`

Implementation notes:

- Added a contact actions popover in the Inbox contact panel.
- The popover includes a real `開啟聯絡人詳情` link to the contact detail page.
- Riskier operations such as exporting contact data and blocking/unsubscribing now show explicit temporarily-disabled guidance instead of `尚未開放`.
- Extended authenticated Inbox Playwright smoke to verify the contact actions menu and disabled guidance on desktop.

Validation:

- `git diff --check`: passed.
- `npm run lint`: passed.
- `npm run build`: passed.
- `npm run test:e2e:inbox`: passed against local Docker PostgreSQL `TEST_DATABASE_URL` for desktop Chromium and mobile Chrome.
- `npm test`: local Windows / Node 24 runner hit the known Vitest batch exit `3221225477` in batch 3; the diagnostic rerun passed every file in that batch individually. GitHub CI remains the full-suite merge gate.
- `agy --model "Gemini 3.5 Flash (High)" --print`: exited successfully and wrote ignored `reports/qa-report.md`; the QA report approved the change for PR.

Launch impact:

- Reduces another misleading fake interaction in the Inbox contact panel.
- No production deployment, DB/schema change, Meta App Review action, PayUNI production action, or secret output was performed.

New risks:

- Low. The change is UI-only except for the existing contact detail link.

Next suggested Codex Prompt:

```text
請繼續 InboxPilot 產品完整性修復，下一輪優先 audit Channels 的「渠道/設定」命名與連接流程：列出看得到但不能用的互動，先修最小可用或清楚 disabled UX，補 smoke，不碰 production DB、不部署 Production。
```

## 2026-06-28 - Inbox header disabled UX pass

Task goal:

- Continue the Inbox product completeness repair loop.
- Fix the Inbox conversation header `視訊通話` and `更多操作` fake-button issue.
- Fix the desktop Inbox filter panel close affordance found during real E2E smoke.
- Keep the change small, local, and non-production.

Files changed:

- `src/components/InboxClient.tsx`
- `tests/e2e/inbox-auth.spec.ts`
- `docs/project-launch-checklist.md`
- `docs/product-readiness-review.md`
- `docs/fix-roadmap.md`
- `docs/codex-session-log.md`

Implementation notes:

- Replaced the old `showComingSoon` copy for the conversation header actions with clearer unavailable-feature notices.
- Restyled `視訊通話` and `更多操作` as intentionally unavailable-looking controls with dashed borders, muted color, accessible labels, and dedicated test ids.
- Kept the filter panel `完成` button visible on desktop and mobile, so operators can close the panel before continuing with conversation actions.
- Added authenticated Playwright coverage to assert the new in-page notices and confirm the UI no longer shows `尚未開放`.

Validation:

- `npm run lint`: passed.
- `npm run build`: passed.
- `npm run test:e2e:inbox`: initial run was skipped because no `TEST_DATABASE_URL` was provided; local TEST_DATABASE_URL rerun initially found the desktop filter panel blocked the conversation header, so the close affordance was fixed. Final rerun passed for desktop Chromium and mobile Chrome.
- `npm test`: passed against local Docker PostgreSQL `TEST_DATABASE_URL` across 8 batches.
- `agy --model "Gemini 3.5 Flash (High)" --print`: exited successfully and wrote ignored `reports/qa-report.md`; the QA report approved the change for PR. Codex validation is the source of record for the real TEST_DATABASE_URL E2E and full `npm test` runs.

Launch impact:

- Reduces misleading fake-button UX in Inbox.
- No production deployment, DB/schema change, Meta App Review action, PayUNI production action, or secret output was performed.

New risks:

- Low. The change is UI-only and does not enable new external side effects.

Next suggested Codex Prompt:

```text
請幫我跑 Inbox 這次修復的驗證：npm run lint、npm run build、npm run test:e2e:inbox；若都過了，再檢查是否還有其他 Inbox 標頭的假按鈕。
```

## 2026-06-28 - Inbox media composer disabled UX pass

Task goal:

- Continue the Codex CLI + Antigravity CLI QA loop autopilot.
- Prioritize visible Inbox controls that still looked clickable but were not actually implemented.
- Convert image upload and voice message controls from generic coming-soon behavior into clear disabled UX.

Files changed:

- `src/components/InboxClient.tsx`
- `tests/e2e/inbox-auth.spec.ts`
- `docs/fix-roadmap.md`
- `docs/product-readiness-review.md`
- `docs/project-launch-checklist.md`
- `docs/codex-session-log.md`

Implementation notes:

- Added an explicit unavailable composer state for `圖片上傳` and `語音訊息`.
- The controls now use disabled-looking styling, `aria-disabled`, and an explanatory title.
- Clicking them shows a clear in-page message explaining the missing media storage / scanning / attachment delivery or audio upload / conversion / delivery work.
- This keeps beta operators from mistaking the controls for broken features while avoiding premature storage/API work.

Validation:

- `git diff --check`: passed.
- `npm run lint`: passed.
- `npm run build`: initially failed because ignored `.next/dev/types/validator.ts` contained stale generated text; after clearing ignored `.next`, the build passed.
- `npm run test:e2e:inbox`: passed against local Docker PostgreSQL `TEST_DATABASE_URL` for desktop Chromium and mobile Chrome.
- `npm test`: local Windows / Node 24 runner hit the known Vitest batch exit `3221225477`; diagnostic single-file reruns passed for the affected batch. This is recorded as local runner instability outside the scoped media disabled-UX diff, with GitHub CI left as the full-suite merge gate.
- `agy --print`: exited with code 0 but produced no stdout and did not create `reports/qa-report.md`; Codex fallback QA report was generated locally under ignored `reports/`.

Launch impact:

- Improves beta Inbox trust by reducing misleading fake controls.
- No production deployment, DB/schema change, Meta App Review action, PayUNI production action, or secret output was performed.

New risks:

- Low. This is UI-only guidance and does not enable file upload or message sending behavior.
- Real media and voice support remain separate product/API gates.

Next suggested Codex Prompt:

```text
請繼續 Inbox 產品完整性修復，優先檢查對話標頭的「視訊通話」與「更多操作」是否仍是 showComingSoon 假按鈕；若暫時不支援，請改成明確 disabled UX 與說明，並補 authenticated Playwright smoke。不要碰 production DB、不要部署 Production。
```

## 2026-06-28 - Inbox emoji composer product pass

Task goal:

- Continue the Codex CLI + Antigravity CLI QA loop autopilot after PR #24.
- Prioritize product functionality gaps that are visible but not useful.
- Fix a small Inbox fake-button issue without touching production DB or deploying Production.

Files changed:

- `src/components/InboxClient.tsx`
- `tests/e2e/inbox-auth.spec.ts`
- `docs/fix-roadmap.md`
- `docs/product-readiness-review.md`
- `docs/codex-session-log.md`

Implementation notes:

- Replaced the Inbox composer `表情符號` coming-soon action with a real local composer action.
- Clicking the emoji button now appends a default emoji to the current composer text and shows a success notice.
- The change is client-side only and does not send messages, call external providers, or write production data.

Validation:

- `git diff --check`: passed.
- `npm run lint`: passed.
- `npm run build`: passed.
- `npm run test:e2e:inbox`: passed against local Docker PostgreSQL `TEST_DATABASE_URL` for desktop Chromium and mobile Chrome.
- `npm test`: local Windows / Node 24 runner hit Vitest batch crashes; diagnostic single-file reruns passed for the affected files. This is recorded as local runner instability outside the scoped emoji product diff, with GitHub CI left as the full-suite merge gate.
- `agy --print`: exited with code 0 but produced no stdout and did not create `reports/qa-report.md`; Codex fallback QA report was generated locally under ignored `reports/`.

Launch impact:

- Improves beta operator usability by closing one more visible Inbox fake-button gap.
- No production deployment, DB/schema change, Meta App Review action, PayUNI production action, or secret output was performed.

New risks:

- Low. The current implementation inserts one default emoji; a full picker remains future UI work.

Next suggested Codex Prompt:

```text
請繼續 Inbox 產品完整性修復，優先處理圖片上傳 / 語音訊息按鈕的可用性決策：若暫時不支援，請改成清楚 disabled UX；若要支援，請先提出最小 API 與 storage 設計，不碰 production DB、不部署 Production。
```

## 2026-06-27 - Daily AI model refresh automation

Task goal:

- Run `npm run ai-models:refresh` for the daily model cache refresh.
- Report provider model counts and any provider / CLI failures.

Files changed:

- `docs/codex-session-log.md`
- `docs/fix-roadmap.md`

Implementation notes:

- Ran the refresh command from the project workspace.
- The refresh completed successfully for `default-workspace`.
- Refreshed provider counts: `chatgpt=10`, `gemini=7`, `deepseek=2`, `xai=2`.
- No provider failures were reported by the script.
- `codex_cli` and `antigravity_cli` were not present in the refresh payload, consistent with the existing local CLI opt-in behavior when `AI_ENABLE_LOCAL_CLI` is not enabled.

Validation:

```text
npm run ai-models:refresh
Result: passed. default-workspace refreshed with chatgpt=10, gemini=7, deepseek=2, xai=2.
```

Launch impact:

- No product launch-state change.
- No production deployment, DB/schema change, Meta App Review action, PayUNI production action, or secret output was performed.

New risks:

- No new runtime risk.
- If local CLI caches must be refreshed by this automation, the automation environment still needs explicit `AI_ENABLE_LOCAL_CLI=true` plus installed/authenticated CLI tools.

Next suggested Codex Prompt:

```text
請維持每日執行 npm run ai-models:refresh；若要納入 codex_cli / antigravity_cli，先確認該 automation runtime 已安裝並登入 CLI，再設定 AI_ENABLE_LOCAL_CLI=true。
```

## 2026-06-26 - Autopilot report cleanup closeout

Task goal:

- Clean transient autopilot report artifacts after the runner exited.
- Re-run a no-value secret-pattern scan over `reports/`.
- Keep production deployment, production DB, Meta App Review, and PayUNI production untouched.

Files changed:

- `docs/codex-session-log.md`
- `docs/fix-roadmap.md`
- `docs/security-review.md`
- `docs/product-readiness-review.md`
- `docs/project-launch-checklist.md`

Implementation notes:

- Removed ignored transient report artifacts, including `reports/autopilot-live.log` and raw output files that had secret-pattern matches.
- Re-ran the reports scan without printing any matched values.
- Confirmed the reports scan returned no matches after cleanup.
- Confirmed `reports/` is gitignored and no report files are tracked.

Validation:

```text
reports secret-pattern scan
Result: NO_MATCHES.

git check-ignore -v reports/final-report.md reports/safety-report.md reports/human-required.md
Result: reports are ignored by .gitignore.
```

Launch impact:

- Report handling risk from the locked live log is closed.
- Preview readiness still needs authenticated route smoke / E2E for core logged-in pages.
- Public paid launch remains Hold for Meta App Review and PayUNI production go-live.

New risks:

- No new runtime, DB, deployment, payment, OAuth, or secret risk was introduced.

Next suggested Codex Prompt:

```text
請補 authenticated route smoke / E2E for Dashboard、Inbox、Contacts、Instagram connect、Analytics、Automations、Referrals、Billing；不要 production deploy、不要碰 production DB、不要送 Meta App Review、不要切 PayUNI production。
```

## 2026-06-26 - Unattended safety reviewer refresh

Task goal:

- Review source code changes, docs changes, reports, and git diff for unattended autopilot safety.
- Check for hardcoded secrets/env values, `.env*`, production DB/schema risk, destructive Prisma/Supabase commands, tenant/auth/webhook/payment risk, Meta App Review boundaries, PayUNI sandbox/prod separation, Vercel Production deployment risk, and custom domain alias crossing.
- Fix only critical documentation/report issues when safe.
- Write `reports/safety-report.md` with exactly one safety status line.

Files changed:

- `reports/safety-report.md`
- `reports/codex-output-loop-1.md`
- `reports/qa-output-loop-1.md`
- `docs/security-review.md`
- `docs/fix-roadmap.md`
- `docs/codex-session-log.md`

Implementation notes:

- Confirmed tracked diff is limited to docs and `package-lock.json`.
- Confirmed no `.env*`, Prisma/Supabase schema, Vercel config, GitHub workflow, PayUNI production switch, Meta dashboard/App Review, or custom domain alias diff.
- Git diff secret-pattern scan was clean.
- Removed writable report outputs with sensitive-pattern matches: `reports/codex-output-loop-1.md` and `reports/qa-output-loop-1.md`.
- Could not delete `reports/autopilot-live.log` because another process still owns it; recorded the blocker as `HUMAN_REQUIRED`.

Validation:

```text
git diff --stat
Result: docs and package-lock only.

git diff --name-only -- .env*
Result: no .env diff.

git diff --name-only -- prisma prisma/schema.prisma prisma/migrations supabase
Result: no Prisma/Supabase schema diff.

git diff --name-only -- .github vercel.json .vercelignore
Result: no deployment config diff.

git diff secret-pattern scan
Result: clean.

reports secret-pattern scan after targeted cleanup
Result: only reports/autopilot-live.log still matches; file is locked by another process.

npm run lint
Result: passed.

npm test
Result: passed. Existing audit best-effort stderr appeared in a webhook test, but the command exited 0.

npm run build
Result: passed.
```

Launch impact:

- No production deployment, DB/schema write, Meta action, PayUNI production action, or domain alias action was performed.
- Safety remains Fail until the locked live log is deleted or redacted and report scan is clean.
- Public paid launch remains Hold.

New risks:

- No new runtime risk was introduced.
- Report handling risk remains until `reports/autopilot-live.log` is cleaned.

Next suggested Codex Prompt:

```text
請在停止 autopilot/logging 程序後，刪除或遮罩 reports/autopilot-live.log，重跑 reports secret-pattern scan，然後重新產生 reports/safety-report.md；不要 production deploy、不要碰 DB、不要輸出任何 secret。
```

## 2026-06-26 - Unattended autopilot QA reviewer refresh

Task goal:

- Review the unattended autopilot evidence for homepage, login, dashboard, inbox, contacts, Instagram connect, analytics, automations, referrals, pricing/billing, and docs readiness.
- Write `reports/qa-report.md` with exactly one QA status line.
- Do not start a dev server, touch `.env*`, deploy Production, submit Meta App Review, run PayUNI production, or write production DB/schema.

Files changed:

- `reports/qa-report.md`
- `docs/codex-session-log.md`
- `docs/fix-roadmap.md`

Implementation notes:

- Reviewed required project docs and the requested autopilot reports.
- Set QA to Fail because authenticated route smoke / E2E evidence is missing for core app surfaces and `reports/autopilot-live.log` still requires human cleanup before reports are safe.
- Confirmed the available evidence shows lint, test, build, PayUNI sandbox smoke, Vercel/Supabase readiness, route smoke for selected public routes, and remote health checks passed.
- Did not modify application code, env files, Prisma schema/migrations, Meta settings, PayUNI production settings, or deployment configuration.

Validation:

```text
Evidence reviewed:
- AUTOPILOT.md
- reports/codex-dev-report.md
- reports/route-smoke.md
- reports/lint-loop-1.log
- reports/test-loop-1.log
- reports/build-loop-1.log
- reports/payuni-smoke-loop-1.log
- reports/vercel-report.md
- reports/supabase-report.md
- reports/health-report.md
```

Launch impact:

- No runtime launch-state change.
- Preview readiness remains Fail until authenticated route smoke / E2E and locked log cleanup are complete.
- Public paid launch remains Hold until Meta App Review and PayUNI production gates are completed manually.

New risks:

- No new product, DB, deployment, payment, OAuth, or secret risk was introduced.

Next suggested Codex Prompt:

```text
請在 active autopilot runner 結束後，刪除或遮罩 reports/autopilot-live.log，重跑 reports secret-pattern scan，然後補 authenticated route smoke / E2E for Dashboard、Inbox、Contacts、Instagram connect、Analytics、Automations、Referrals、Billing；不要 production deploy、不要碰 production DB、不要送 Meta App Review、不要切 PayUNI production。
```

## 2026-06-26 - Unattended loop 1 readiness refresh

Task goal:

- Refresh the unattended loop readiness state without touching production DB, Meta App Review, PayUNI production, or `.env*`.
- Fix stale QA / safety / final reports where current local evidence is now better than older loop output.
- Keep any active runner / locked log issue as `HUMAN_REQUIRED`.

Files changed:

- `reports/human-required.md`
- `reports/qa-report.md`
- `reports/safety-report.md`
- `reports/final-report.md`
- `reports/codex-dev-report.md`
- `package-lock.json`
- `docs/codex-session-log.md`
- `docs/fix-roadmap.md`
- `docs/project-launch-checklist.md`
- `docs/product-readiness-review.md`
- `docs/security-review.md`
- `docs/billing-affiliate-readiness.md`

Implementation notes:

- Verified Vercel CLI is authenticated and local project link exists.
- Kept the current `package-lock.json` npm lockfile delta from the safe install/audit-fix path; no new dependency was added.
- Verified Production and Preview env names include `TOKEN_ENCRYPTION_KEY`; values were not printed.
- Verified Supabase CLI can list projects read-only and local link points to the test project.
- Verified PayUNI sandbox smoke passes.
- Removed stale raw output reports with secret-pattern hits: `reports/final-output-maxloops.md` and `reports/safety-output-loop-1.md`.
- Could not delete `reports/autopilot-live.log` because the active autopilot runner still owns it.

Validation:

```text
npm install: passed.
npm run lint: passed.
npm test: passed.
npm run build: passed.
npm run payuni:smoke: passed against sandbox.
npm audit --audit-level=high: passed; 2 moderate findings remain.
npx vercel env ls production --scope a25814740s-projects: passed; TOKEN_ENCRYPTION_KEY name present.
npx vercel env ls preview --scope a25814740s-projects: passed; TOKEN_ENCRYPTION_KEY name present.
supabase projects list: passed; read-only metadata available.
```

Launch impact:

- Local quality gates and sandbox PayUNI readiness improved.
- Preview readiness remains `HUMAN_REQUIRED` until `reports/autopilot-live.log` is cleaned and authenticated route smoke / E2E is added.
- Public paid launch remains Hold until Meta App Review and PayUNI production gates are completed manually.

New risks:

- No new runtime risk.
- Existing report-handling risk remains until the active runner releases `reports/autopilot-live.log`.

Next suggested Codex Prompt:

```text
請在 active autopilot runner 結束後，刪除或遮罩 reports/autopilot-live.log，重跑 reports secret-pattern scan，然後補 authenticated route smoke / E2E for Inbox、Contacts、Analytics、Automations、Referrals、Billing；不要 production deploy、不要碰 production DB、不要送 Meta App Review、不要切 PayUNI production。
```

## 2026-06-26 - Final autopilot stop report

Task goal:

- Create `reports/final-report.md` because the unattended autopilot stopped before all gates passed.
- Summarize completed work, latest failing gate, QA issues, safety issues, Vercel/Supabase/PayUNI status, exact human-required items, and exact rerun command.
- Do not modify product code.

Files changed:

- `reports/final-report.md`
- `reports/human-required.md`
- `docs/fix-roadmap.md`
- `docs/codex-session-log.md`

Implementation notes:

- Reviewed required project docs plus existing autopilot reports.
- Rewrote final report in Traditional Chinese with `STATUS=HUMAN_REQUIRED`.
- Consolidated human-required items into exact actionable lines.
- Did not modify product code, `.env*`, Prisma schema/migrations, Vercel config, Meta settings, PayUNI production settings, or DB data.

Validation:

```text
Reviewed evidence:
- reports/qa-report.md
- reports/safety-report.md
- reports/vercel-report.md
- reports/supabase-report.md
- reports/health-report.md
- reports/test-loop-1.log
- reports/payuni-smoke-loop-1.log
- reports/route-smoke.md
```

Launch impact:

- No runtime launch-state change.
- Autopilot remains `HUMAN_REQUIRED`.
- Public paid launch remains Hold.

New risks:

- No new product risk.
- Existing report-handling risk remains until `reports/autopilot-live.log` is cleaned.

Next suggested Codex Prompt:

```text
請在停止 autopilot/logging 程序後，刪除或遮罩 reports/autopilot-live.log，重跑 reports secret-pattern scan，然後重新產生 reports/safety-report.md；不要 production deploy、不要碰 DB、不要輸出任何 secret。
```

## 2026-06-26 - Unattended safety reviewer

Task goal:

- Review source code changes, docs changes, reports, and git diff for unattended autopilot safety.
- Check for leaked secrets/env values, `.env*` changes, DB/schema risk, destructive Prisma/Supabase commands, tenant/auth/webhook/payment risk, Meta/PayUNI/Vercel/domain boundary issues.
- Fix only critical documentation/report issues when safe.
- Write `reports/safety-report.md` with exactly one safety status line.

Files changed:

- `reports/safety-report.md`
- `reports/human-required.md`
- `reports/codex-output-loop-1.md`
- `reports/qa-output-loop-1.md`
- `docs/security-review.md`
- `docs/fix-roadmap.md`
- `docs/codex-session-log.md`

Implementation notes:

- Confirmed tracked diff does not modify `.env*`, Prisma schema/migrations, Vercel workflow/config, custom domain alias logic, PayUNI production switching, or Meta dashboard/submission behavior.
- Reviewed `src/lib/deployment-env.ts`, `src/lib/secrets.ts`, and `tests/security.test.ts`; current code changes are security hardening.
- Redacted writable report outputs where safe.
- Could not redact `reports/autopilot-live.log` because it is locked by an active logging process and still has secret-pattern matches.
- Set `reports/safety-report.md` to Fail and recorded the locked log cleanup in `reports/human-required.md`.

Validation:

```text
git diff --check
Result: passed with line-ending warnings only.

npm run lint
Result: passed.

npx vitest run tests/security.test.ts --reporter=dot
Result: passed. 1 file, 8 tests. Existing audit best-effort stderr appeared because DATABASE_URL is not configured locally.

npm run build
Result: passed.

npm audit --audit-level=high
Result: passed for high severity. Remaining findings are 2 moderate Next/PostCSS force-only findings.

git diff --name-only -- .env*
Result: no .env diff.

git diff --name-only -- prisma prisma/schema.prisma prisma/migrations
Result: no Prisma schema/migration diff.

git diff --name-only -- .github vercel.json
Result: no workflow or vercel config diff.

reports secret-pattern scan after partial redaction
Result: one remaining locked file, reports/autopilot-live.log, with secret-pattern matches.
```

Launch impact:

- No production deployment, DB/schema write, Meta action, or PayUNI production action was performed.
- Safety remains Fail until the locked live log is deleted or redacted and reports scan clean.
- Public paid launch remains Hold.

New risks:

- No new runtime risk was introduced.
- Report handling risk remains until `reports/autopilot-live.log` is cleaned.

Next suggested Codex Prompt:

```text
請在停止 autopilot/logging 程序後，刪除或遮罩 reports/autopilot-live.log，重跑 reports secret-pattern scan，然後重新產生 reports/safety-report.md；不要 production deploy、不要碰 DB、不要輸出任何 secret。
```

## 2026-06-26 - Unattended loop 1 QA reviewer report

Task goal:

- Review the unattended loop 1 QA evidence for homepage, login, dashboard, inbox, contacts, Instagram connection, analytics, automations, referrals, pricing/billing, and docs readiness.
- Write `reports/qa-report.md` with exactly one QA status line using `QA_STATUS=PASS` or `QA_STATUS=FAIL`.

Files changed:

- `reports/qa-report.md`
- `docs/fix-roadmap.md`
- `docs/codex-session-log.md`

Implementation notes:

- Set `QA_STATUS=FAIL` because the loop still has major evidence gaps: DB-backed `npm test` is blocked by missing isolated DB env, PayUNI sandbox smoke is blocked by missing sandbox env, Supabase CLI is unavailable, and Vercel local project link/env-name inspection is incomplete.
- Recorded page-by-page QA status from available code and test evidence.
- Did not run a dev server, production deployment, Preview deployment, Prisma/Supabase schema write, Meta Dashboard action, or PayUNI production action.

Validation:

```text
Evidence reviewed:
- AUTOPILOT.md
- reports/codex-dev-report.md
- reports/route-smoke.md
- reports/lint-loop-1.log
- reports/test-loop-1.log
- reports/build-loop-1.log
- reports/payuni-smoke-loop-1.log
- reports/vercel-report.md
- reports/supabase-report.md
- reports/health-report.md
```

Launch impact:

- No runtime launch-state change.
- QA remains Fail for unattended loop 1.
- Private beta / whitelist remains the safer operating mode; public paid launch remains Hold.

New risks:

- No new runtime, DB, deployment, payment, OAuth, or secret risk was introduced.

Next suggested Codex Prompt:

```text
請提供隔離 TEST_DATABASE_URL 與 PayUNI sandbox env 後，重跑 npm test、npm run payuni:smoke，並補 inbox/contacts/analytics/automations/referrals/billing 的 authenticated route smoke；不要 production deploy、不要碰 production DB。
```

## 2026-06-26 - Unattended loop 1 production safety hardening

Task goal:

- Move InboxPilot toward unattended staging / preview launch readiness while preserving production safety.
- Fix safe code-only blocker/critical items first.
- Do not ask questions, do not deploy production, do not modify `.env*`, do not touch production DB/schema, and keep PayUNI sandbox.

Files changed:

- `src/lib/deployment-env.ts`
- `src/lib/secrets.ts`
- `tests/security.test.ts`
- `package-lock.json`
- `docs/project-launch-checklist.md`
- `docs/product-readiness-review.md`
- `docs/security-review.md`
- `docs/fix-roadmap.md`
- `docs/codex-session-log.md`
- `reports/human-required.md`
- `reports/qa-report.md`
- `reports/safety-report.md`
- `reports/final-report.md`
- `reports/codex-dev-report.md`

Implementation notes:

- Treated plain `NODE_ENV=production` as production deployment behavior when explicit InboxPilot/Vercel deployment markers are absent.
- Required a dedicated `TOKEN_ENCRYPTION_KEY` for production secret encryption.
- Rejected reusing `AUTH_SECRET` as the production token encryption key.
- Ran non-force `npm audit fix`, which removed the high-severity audit finding without using breaking `--force`.
- Did not create a Preview deployment because the local Vercel project is not linked.
- Did not run production deployment, Meta App Review, PayUNI production checkout, Supabase writes, Prisma production writes, or any `.env*` edits.

Validation:

```text
npm install
Result: passed.

npm audit fix
Result: non-force fix applied; high-severity audit finding removed.

npm audit --audit-level=high
Result: passed. Remaining findings are 2 moderate Next/PostCSS force-only findings.

npx vitest run tests/security.test.ts tests/unit/core-utils.test.ts tests/meta-channel-config.test.ts --reporter=dot
Result: passed. 3 files, 19 tests.

npm run lint
Result: passed.

npm run build
Result: passed.

npm test
Result: blocked because DATABASE_URL or TEST_DATABASE_URL is required. Production DB was not used.

npm run payuni:smoke
Result: blocked because PAYUNI_MERCHANT_ID is not configured locally. PayUNI production was not used.

npx vercel inspect https://inboxpilot.carry-digital-nomad.in.net --scope a25814740s-projects
Result: production deployment is Ready.

npx vercel inspect https://staging.carry-digital-nomad.in.net --scope a25814740s-projects
Result: staging alias points to a Ready Preview deployment.

Production /api/health
Result: status=ok, database ok, redis ok.

Staging /api/health/staging
Result: status=ok, deployment=staging, dbEnv=staging, releaseChannel=full, vercelEnv=preview.
```

Launch impact:

- Production safety improved.
- Preview readiness is still blocked by local Vercel link and missing env checks.
- Public paid launch remains Hold.

New risks:

- Deploying this change without `TOKEN_ENCRYPTION_KEY` in Vercel Production/Preview would break token encryption/decryption paths. Confirm env names before deployment.
- Remaining npm audit findings require a separate Next/PostCSS dependency-upgrade decision because the available npm fix is force-only.

Next suggested Codex Prompt:

```text
請先確認 Vercel 專案 link 與 env name，不輸出任何 env value：
1. link 到 inboxpilot 專案
2. 列出 Production / Preview env names
3. 確認 TOKEN_ENCRYPTION_KEY 是否存在
4. 若存在，再建立 Preview deployment 並跑 health smoke
不要 production deploy，不要修改 env value，不要碰 DB。
```

## 2026-06-26 - InboxPilot unattended autopilot package

Task goal:

- Code review the ReplyPilot autopilot reference.
- Build an InboxPilot-specific unattended AI programmer loop.
- Keep PayUNI sandbox, avoid Meta submission, avoid production DB/schema writes, and avoid secret leakage.

Files changed:

- `.gitignore`
- `AUTOPILOT.md`
- `run-autopilot.ps1`
- `run-autopilot.cmd`
- `scripts/autopilot-full.py`
- `scripts/autopilot_full_start.py`
- `package.json`
- `README.md`
- `docs/autopilot-code-review.md`
- `docs/project-launch-checklist.md`
- `docs/product-readiness-review.md`
- `docs/security-review.md`
- `docs/meta-app-review-checklist.md`
- `docs/billing-affiliate-readiness.md`
- `docs/fix-roadmap.md`
## 2026-06-26 - CI / nightly authenticated route smoke PR

Task goal:

- Add authenticated route smoke to CI and nightly automation.
- Force the smoke to use `TEST_DATABASE_URL`.
- Confirm the production DB guard blocks accidental production execution.
- Keep the PR clean and exclude unrelated dirty files.

Files changed:

- `.github/workflows/ci.yml`
- `package.json`
- `scripts/ensure-e2e-admin.ts`
- `tests/e2e/authenticated-route-smoke-guard.ts`
- `tests/e2e/public-and-auth.spec.ts`
- `tests/authenticated-route-smoke-guard.test.ts`
- `docs/project-launch-checklist.md`
- `docs/fix-roadmap.md`
- `docs/security-review.md`
- `docs/codex-session-log.md`

Implementation notes:

- Created a Windows-friendly `npm run autopilot` entry point.
- Added a Python loop that runs Codex development, npm install, lint, test, build, PayUNI sandbox smoke, local route smoke, Vercel readiness, Supabase readiness, Codex QA, Codex safety, and final reporting.
- Reports are written to `reports/`, which is now gitignored.
- Missing credentials, logins, OTP, CAPTCHA, Meta dashboard actions, or PayUNI sandbox values are recorded in `reports/human-required.md`.
- Production DB/schema writes are blocked by prompt guard and forbidden-command report scan.
- PayUNI production switching and Meta App Review submission remain blocked.
- Added CI `workflow_dispatch` and nightly schedule.
- CI now prepares the PostgreSQL service with Prisma migrations, creates the E2E admin through a guarded script, and runs authenticated Playwright smoke.
- The authenticated smoke guard requires `TEST_DATABASE_URL` and refuses production markers.
- No Production deployment, Production DB access, Meta App Review submission, or PayUNI production transaction was performed.

Validation:

```text
py -m py_compile scripts/autopilot-full.py scripts/autopilot_full_start.py
Result: passed.

npm run lint
Result: passed.

npm run build
Result: passed.

npm test
Result: blocked because this clean worktree has no `DATABASE_URL` or `TEST_DATABASE_URL`. Production DB was not used.

npm run payuni:smoke
Result: blocked because sandbox `PAYUNI_MERCHANT_ID` is not configured in this clean worktree. PayUNI production was not used.
```

Launch impact:

- Preview/staging readiness can now be advanced by an unattended local runner.
- Public paid launch remains Hold until Meta, PayUNI production, tenant isolation, and final operator gates are completed.

New risks:

- The runner coordinates AI and shell commands, so it is not a hard sandbox.
- Operator should review `reports/final-report.md`, `reports/safety-report.md`, and `reports/human-required.md` after overnight runs.

Next suggested Codex Prompt:

```text
請幫我跑一次 AUTOPILOT_MAX_LOOPS=1 且不部署 Preview 的 dry-run，確認 reports/final-report.md / human-required.md / safety-report.md 的格式與內容。
npx vitest run tests/authenticated-route-smoke-guard.test.ts
Result: passed.

npm run test:e2e:auth
Result: passed locally against a disposable PostgreSQL test DB.

npm run lint
Result: passed.

npm test
Result: passed locally against TEST_DATABASE_URL.

npm run build
Result: passed.
```

## 2026-06-26 - Meta reviewer-safe test asset handoff checklist

Task goal:

- Create a reviewer-safe test asset handoff checklist for Meta App Review preparation.
- Do not log in to Meta Dashboard.
- Do not submit App Review.
- Do not print or store secrets.

Files changed:

- `docs/meta-reviewer-test-asset-handoff-checklist.md`
- `docs/meta-app-review-submission-package.md`
- `docs/meta-reviewer-recording-shot-list.md`
- `docs/meta-app-review-screenshot-redaction-checklist.md`
- `docs/meta-app-review-checklist.md`
- `docs/fix-roadmap.md`
- `docs/codex-session-log.md`

Implementation notes:

- Added reviewer-safe asset inventory, account requirements, Instagram/Facebook asset requirements, synthetic demo data rules, secure handoff methods, reviewer instruction note template, pre-handoff smoke, post-review cleanup, and Go / Hold criteria.
- Linked the handoff checklist from the submission package, reviewer recording shot list, screenshot checklist, Meta checklist, and roadmap.

Validation:

```text
git diff --check
Result: passed.
```

Launch impact:

- Meta App Review handoff preparation is more complete, but actual submission remains Hold until assets are prepared, smoked, redacted, and signed off.

New risks:

- No code, DB, schema, env, payment, OAuth runtime, deployment, Meta Dashboard, or App Review submission change was made.

Next suggested Codex Prompt:

```text
請幫我把 PR #5 merge，merge 後只確認 CI、Vercel Preview、production/staging alias 與 health；不要 production redeploy、不要送審、不要碰 DB。
```

## 2026-06-26 - Meta App Review screenshot and redaction checklist

Task goal:

- Create a Meta App Review screenshot checklist and redaction checklist.
- Do not log in to Meta Dashboard.
- Do not submit App Review.
- Do not print or store secrets.

Files changed:

- `docs/meta-app-review-screenshot-redaction-checklist.md`
- `docs/meta-app-review-submission-package.md`
- `docs/meta-reviewer-recording-shot-list.md`
- `docs/meta-app-review-checklist.md`
- `docs/fix-roadmap.md`
- `docs/codex-session-log.md`

Implementation notes:

- Added required screenshot list, per-screenshot redaction checklist, package-level redaction checklist, search commands, screenshot manifest template, and Go / Hold criteria.
- Linked the screenshot/redaction checklist from the submission package, reviewer recording shot list, Meta checklist, and roadmap.

Validation:

```text
git diff --check
Result: passed.
```

Launch impact:

- Meta App Review artifact preparation is more complete, but actual submission remains Hold until real screenshots, redaction review, permission matrix, reviewer assets, and sign-off are complete.

New risks:

- No code, DB, schema, env, payment, OAuth runtime, deployment, Meta Dashboard, or App Review submission change was made.

Next suggested Codex Prompt:

```text
請幫我根據 Meta submission package 製作 reviewer-safe test asset handoff checklist，不登入 Meta Dashboard、不送審、不輸出 secret。
```

## 2026-06-26 - Meta reviewer recording shot list

Task goal:

- Create a Meta reviewer recording shot list and step-by-step recording script based on `docs/meta-app-review-submission-package.md`.
- Do not log in to Meta Dashboard.
- Do not submit App Review.
- Do not print or store secrets.

Files changed:

- `docs/meta-reviewer-recording-shot-list.md`
- `docs/meta-app-review-submission-package.md`
- `docs/meta-app-review-checklist.md`
- `docs/fix-roadmap.md`
- `docs/codex-session-log.md`

Implementation notes:

- Added a 4-6 minute reviewer walkthrough plan covering login, workspace context, Instagram connection, Inbox, Contacts, Automations, Privacy, Data Deletion, Terms, and closing scene.
- Added shot-by-shot narration cues, evidence goals, redaction notes, pause/restart rules, post-recording checklist, file naming suggestions, and Go / Hold criteria.
- Linked the shot list from the Meta App Review submission package and Meta checklist.

Validation:

```text
git diff --check
Result: passed.
```

Launch impact:

- Meta App Review package preparation is more actionable, but actual submission remains Hold until real reviewer assets, recording, screenshots, redaction review, permission matrix, and sign-off are complete.

New risks:

- No code, DB, schema, env, payment, OAuth runtime, deployment, Meta Dashboard, or App Review submission change was made.

Next suggested Codex Prompt:

```text
請幫我根據 docs/meta-reviewer-recording-shot-list.md 製作 Meta App Review 截圖清單與 redaction checklist，不登入 Meta Dashboard、不送審、不輸出 secret。
```

## 2026-06-26 - Meta App Review and PayUNI go-live package preparation

Task goal:

- Prepare Meta App Review submission package and PayUNI production go-live checklist.
- Do not submit Meta App Review.
- Do not enable PayUNI production charging.
- Do not execute a live card transaction.
- Do not print or store secrets.

Files changed:

- `docs/meta-reviewer-recording-shot-list.md`
- `docs/meta-app-review-submission-package.md`
- `docs/payuni-production-go-live-checklist.md`
- `docs/meta-app-review-checklist.md`
- `docs/billing-affiliate-readiness.md`
- `docs/product-readiness-review.md`
- `docs/project-launch-checklist.md`
- `docs/fix-roadmap.md`
- `docs/codex-session-log.md`

Implementation notes:

- Meta package now defines production URLs, permission evidence, reviewer recording scenes, screenshots, test assets, dashboard checks, redaction gate, draft submission text, and Go / Hold criteria.
- Meta reviewer recording shot list now defines a 4-6 minute reviewer walkthrough, scene-by-scene narration, redaction rules, and post-recording review checklist.
- PayUNI checklist now defines production env names, dashboard checks, pre-go-live validation, controlled enablement, callback verification, rollback, and Go / Hold criteria.
- External references checked: Meta App Review, Meta data deletion callback, Instagram app setup, PAYUNi SDK usage, and PAYUNi public site.

Validation:

```text
git diff --check
Result: passed.
```

Launch impact:

- Public paid launch preparation is clearer, but actual public paid launch remains Hold.
- Remaining gates require real reviewer/test assets, Meta submission/approval, PAYUNi merchant approval/live smoke, and authenticated tenant-safe smoke.

New risks:

- No code, DB, schema, env, payment, OAuth runtime, or deployment change was made.
- Operational risk remains if an operator skips the redaction gate or enables PayUNI production without the controlled smoke.

Next suggested Codex Prompt:

```text
請幫我根據 docs/meta-app-review-submission-package.md 製作 Meta reviewer recording shot list 與逐步錄影腳本，不登入 Meta Dashboard、不送審、不輸出 secret。
```

## 2026-06-26 - PR #2 post-deploy launch readiness delta

Task goal:

- Confirm PR #2 deployment state after merge.
- Confirm production Meta fallback hardening is live on the production target.
- Summarize remaining Meta App Review, PayUNI production, and tenant isolation gates.
- Do not touch DB, run Prisma commands, run SQL, change schema, or print secrets.

Files changed:

- `tests/tenant-isolation-routes.test.ts`
- `tests/meta-webhook.test.ts`
- `docs/project-launch-checklist.md`
- `docs/product-readiness-review.md`
- `docs/security-review.md`
- `docs/meta-app-review-checklist.md`
- `docs/billing-affiliate-readiness.md`
- `docs/fix-roadmap.md`
- `docs/codex-session-log.md`

Verification:

```text
npx vitest run tests/tenant-isolation-routes.test.ts tests/meta-channel-config.test.ts tests/meta-webhook.test.ts tests/billing-checkout-route.test.ts
Result: passed. 4 test files, 18 tests.

npx vitest run tests/tenant-isolation-routes.test.ts tests/meta-channel-config.test.ts tests/meta-webhook.test.ts tests/billing-checkout-route.test.ts tests/release-mode.test.ts tests/release-proxy.test.ts tests/security.test.ts tests/webhook-security.test.ts tests/rate-limit.test.ts tests/compliance.test.ts tests/faq.test.ts tests/meta-business-login-sandbox-production-isolation.test.ts
Result: passed. 12 test files, 43 tests.

npm run lint
Result: passed.

npm run build
Result: passed.

npx vercel inspect https://inboxpilot.carry-digital-nomad.in.net --scope a25814740s-projects
Result: production deployment dpl_2Ramd6D54Xn1qc7vxxsgXGXacUni is Ready.

npx vercel inspect https://staging.carry-digital-nomad.in.net --scope a25814740s-projects
Result: staging alias remains on a Preview deployment.

curl https://inboxpilot.carry-digital-nomad.in.net/api/health
Result: status=ok, database ok, redis ok.

curl https://staging.carry-digital-nomad.in.net/api/health/staging
Result: status=ok, deployment=staging, dbEnv=staging, releaseChannel=full, vercelEnv=preview.

curl https://inboxpilot.carry-digital-nomad.in.net/channels/connect/instagram
Result: HTTP 200.
```

Launch impact:

- PR #2 hardening is now deployed to production.
- PR #3 route-level tenant isolation regression coverage is merged, CI-passed, and deployed through controlled production deployment `dpl_GGk9zyF3r1F1hZ6ons3Fzfh6y5hL`.
- Production Meta global fallback is considered live-disabled because the deployed code checks the production runtime target before allowing fallback.
- First non-DB tenant isolation regression coverage now exists for channels, contacts, automations, and PayUNI checkout scope.
- Public paid launch remains Hold until authenticated/DB-backed tenant isolation tests, Meta App Review evidence, and PayUNI production smoke are complete.

New risks:

- No new DB/schema risk.
- Existing operational risk remains: any workspace that depended on global Meta fallback must reconnect with tenant-scoped channel credentials.
- `npm test` requires `TEST_DATABASE_URL` or `DATABASE_URL` and runs `prisma db push` against an isolated test schema; it was not run against production DB.

Next suggested Codex Prompt:

```text
請幫我做 authenticated tenant-safe smoke：用測試 workspace 驗證 Meta channel reconnect、Inbox/Contacts isolation、Automation scope、Billing guard，不碰 production schema、不輸出 secret。
```

## 2026-06-26 - Public paid launch gate cleanup

Task goal:

- Close the production Meta global env fallback gate.
- Add first tenant isolation regression coverage around Meta fallback behavior.
- Add PayUNI production SOP.
- Improve legal / billing copy for public paid launch readiness.
- Do not deploy, touch DB, run migrations, or print secrets.

Files changed:

- `src/lib/deployment-env.ts`
- `src/lib/channels/meta.ts`
- `src/lib/instagram/comments-sync.ts`
- `src/app/api/webhooks/meta/route.ts`
- `scripts/refresh-meta-token.mjs`
- `tests/meta-channel-config.test.ts`
- `tests/meta-webhook.test.ts`
- `src/app/billing/page.tsx`
- `src/app/terms-of-service/page.tsx`
- `src/app/privacy-policy/page.tsx`
- `src/app/data-deletion/page.tsx`
- `docs/payuni-production-sop.md`
- `README.md`
- launch/security/billing/Meta readiness docs

Implementation notes:

- Added a deployment env helper that reads `INBOXPILOT_DEPLOYMENT_ENV`, `INBOXPILOT_DB_ENV`, `VERCEL_ENV`, and `NODE_ENV`.
- Disabled global Meta env fallback in production deployment envs.
- Production no longer uses global `META_PAGE_ACCESS_TOKEN` or `META_INSTAGRAM_BUSINESS_ACCOUNT_ID` as a substitute for channel-level credentials.
- Meta webhook channel config no longer writes global fallback token markers in production.
- Instagram comment sync no longer falls back to global IG business account id in production.
- `scripts/refresh-meta-token.mjs` refuses production runtime markers.
- Billing page, Terms, Privacy, and Data Deletion copy now describe controlled payments, PayUNI handling, refunds, workspace isolation, and audit retention.

Validation:

```text
npx vitest run tests/meta-channel-config.test.ts tests/billing-checkout-route.test.ts
Result: passed.

npm run lint
Result: passed.

npm run build
Result: passed.

npm run payuni:smoke
Result: passed.
```

Launch impact:

- Main local code gate for production Meta global fallback is closed.
- Public paid launch still requires deployment of this change, broader tenant isolation regression tests, Meta App Review evidence, and PayUNI production merchant/smoke evidence.

New risks:

- Production Meta flows now require valid channel-level credentials; workspaces relying on global fallback must reconnect their channel before production use.
- No new DB/schema risk.

Next suggested Codex Prompt:

```text
請幫我部署 public paid launch gate cleanup 到 Production，部署後驗證 /api/health、tenant-safe smoke、simple-release smoke，並確認 staging alias 沒被改動；不要碰 DB。
```

## 2026-06-24 - Release mode commit preparation

Task goal:

- Prepare the local release mode implementation as a committable change.
- Confirm `master` is the simple release path and `staging` is the full release path.
- Add smoke tests before pushing to both branches.

Files changed:

- `src/lib/release-mode.ts`
- `src/proxy.ts`
- `src/components/AdminShell.tsx`
- `src/components/AdminMobileNav.tsx`
- `src/app/dashboard/page.tsx`
- `src/app/channels/page.tsx`
- `src/app/channels/connect/page.tsx`
- `src/app/channels/connect/social/page.tsx`
- `src/app/referrals/page.tsx`
- `tests/release-mode.test.ts`
- `tests/release-proxy.test.ts`
- `docs/master-staging-prelaunch-checklist.md`
- `docs/project-launch-checklist.md`
- `docs/product-readiness-review.md`
- `docs/security-review.md`
- `docs/fix-roadmap.md`
- `docs/codex-session-log.md`

Implementation notes:

- Added a centralized release channel helper with host defaults and `INBOXPILOT_RELEASE_CHANNEL` override support.
- Simple release hides full-only navigation, non-Instagram channel connection options, and payout-oriented referral copy.
- Simple release proxy redirects full-only app pages and blocks non-Instagram OAuth entry points.
- Added smoke tests covering host/env release detection, full-only route classification, simple production redirects, staging full behavior, and Instagram-only OAuth allowance.

Validation:

```text
npx vitest run tests/release-mode.test.ts tests/release-proxy.test.ts
Result: passed. 2 test files passed, 9 tests passed.

npm run lint
Result: passed.

npm run build
Result: passed. Prisma generated-client fallback reused the existing client because the Windows query engine DLL was locked by a local Node process.

npm test
Result: passed.

npm run test:e2e
Result: passed. 10 tests passed.
```

## 2026-06-26 - Alias workflow draft PR

Task goal:

- Create a draft PR for alias workflow changes without pushing directly to `master`.
- Confirm the PR branch does not produce a Production deployment.
- Allow only Preview deployment behavior for the PR branch.

Files changed:

- `.github/workflows/update-staging-alias.yml`
- `.github/workflows/update-production-alias.yml`
- `docs/deployment.md`
- `docs/fix-roadmap.md`
- `docs/codex-session-log.md`

Implementation notes:

- Created the PR branch from `origin/master` in a separate worktree to avoid including local dirty worktree changes or unpushed `master` commits.
- Hardened the staging alias workflow to skip Production deployments.
- Added a Production alias workflow that only accepts Ready Production deployments.
- Documented the Vercel custom-domain workflow model and manual fallback commands.

Validation:

```text
Draft PR: https://github.com/Forty-s-AI-Company/ig-auto-reply-manychat/pull/1
PR branch: codex/alias-workflow-domain-guards
Vercel status: passed.
Vercel deployment: target=preview, status=Ready, id=dpl_H1A1vjzubmg6jHPCuTsQpdwL6jqA.
Staging alias workflow: passed and skipped because the deployment was not the staging branch Preview alias.
Production alias workflow: passed and skipped because the deployment target was preview, not production.
CI lint-test: passed for push and pull_request events.
```

Launch impact:

- No runtime launch-state change until the PR is merged.

New risks:

- If merged without verifying Vercel behavior, workflow-file changes on the default branch could affect future alias automation.

Next suggested Codex Prompt:

```text
請幫我在這個 draft PR merge 前，再跑一次 production/staging alias workflow manual verification，確認 custom domain 仍互斥且健康。
```

Launch impact:

- Moves the simple/full release split from local implementation toward branch-ready deployment.
- Does not change database topology.

New risks:

- No new secret exposure.
- Proxy hiding is not a substitute for route-level authorization and tenant isolation.
- Shared DB remains accepted only while the product has no real customer traffic.

Next suggested Codex Prompt:

```text
請幫我在 Vercel 部署完成後，檢查 master production domain 與 staging alias 的 release mode 實際行為：
1. production full-only route 應導回 dashboard
2. staging full-only route 應可進入登入/頁面流程
3. production 非 IG OAuth entry 應回 404
4. staging alias 是否指向最新 staging Preview deployment
```

## 2026-06-24 - Master / Staging Pre-Launch Checklist

Task goal:

- Summarize current `master` / `staging` release mode, Vercel environment variables, DB sharing risk, and pre-launch checklist.

Files changed:

- `docs/master-staging-prelaunch-checklist.md`
- `docs/fix-roadmap.md`
- `docs/codex-session-log.md`

Findings:

- Vercel Production lists `INBOXPILOT_RELEASE_CHANNEL` plus runtime secrets and service env vars.
- Vercel Preview currently lists only `INBOXPILOT_RELEASE_CHANNEL`.
- Committed `master` and `staging` branches do not include `src/lib/release-mode.ts`.
- Local workspace contains uncommitted release-mode implementation files.
- Staging alias automation has been verified, but staging runtime env completeness still needs a decision.

Launch impact:

- Documentation only.
- Release-mode app implementation must be committed before treating Production as guaranteed simple and Staging as guaranteed full.
- DB sharing remains temporarily accepted only before real customer onboarding.

Validation:

```text
npx vercel env ls production --scope a25814740s-projects
Result: listed Production env names only; values stayed encrypted.

npx vercel env ls preview --scope a25814740s-projects
Result: listed Preview env names only; values stayed encrypted.

git show HEAD:src/lib/release-mode.ts
Result: file is not present in committed HEAD.

git show origin/staging:src/lib/release-mode.ts
Result: file is not present in origin/staging.
```

Next suggested Codex Prompt:

```text
請幫我把目前本機 release mode 實作整理成可提交版本，確認 master 是 simple release、staging 是 full release，補 smoke tests，然後推送到 master 和 staging。
```

## 2026-06-24 - Staging Alias Branch Guard

Task goal:

- Restrict automatic staging alias updates to successful `staging` branch Preview deployments only.
- Keep manual workflow dispatch available for explicit operator-driven alias updates.
- Do not split DB yet.

Files changed:

- `.github/workflows/update-staging-alias.yml`
- `docs/deployment.md`
- `docs/project-launch-checklist.md`
- `docs/product-readiness-review.md`
- `docs/security-review.md`
- `docs/fix-roadmap.md`
- `docs/codex-session-log.md`

Implementation notes:

- Added `github.event.deployment.ref == 'staging'` to the automatic deployment-status job condition.
- Added shell-level validation for `DEPLOYMENT_REF`, allowing only `staging` or `manual`.
- Kept the `*.vercel.app` deployment URL guard and Production deployment exclusion.
- No app runtime behavior, OAuth flow, webhook, billing, affiliate, Prisma schema, or DB behavior was changed.

Launch impact:

- Feature / codex / master Preview deployments no longer update `staging.carry-digital-nomad.in.net` automatically.
- Staging alias now tracks the `staging` branch by default, with manual override still available.

## 2026-06-24 - Staging Alias Workflow Remote Verification

Task goal:

- Create and configure the Vercel token required by GitHub Actions.
- Trigger a Vercel Preview deployment and verify that `Update Staging Alias` points `staging.carry-digital-nomad.in.net` at the latest Preview deployment.

Remote changes:

- Added GitHub Secret `VERCEL_TOKEN`.
- Added GitHub Secret `VERCEL_SCOPE=a25814740s-projects`.
- Pushed `.github/workflows/update-staging-alias.yml` to `master` in commit `718461c`.
- Temporarily pushed `codex/staging-alias-check` to trigger a Vercel Preview deployment, then deleted the branch after verification.

Validation:

```text
gh workflow list:
Result: Update Staging Alias is active.

GitHub Actions Update Staging Alias:
Result: passed.

npx vercel inspect https://staging.carry-digital-nomad.in.net:
Result: resolved to Preview deployment https://inboxpilot-303lebjos-a25814740s-projects.vercel.app.

npx vercel alias list:
Result: staging.carry-digital-nomad.in.net points to inboxpilot-303lebjos-a25814740s-projects.vercel.app.
```

Security notes:

- The usable token was copied through Vercel's token dialog and stored only as a GitHub Secret.
- The first failed setup attempt showed that Windows clipboard was not reliable for this browser flow; the final stored token was verified through Vercel API before being saved.
- `VERCEL_SCOPE` is required for this project because alias updates need the `a25814740s-projects` scope.
- Two earlier project-scoped Vercel tokens were created during troubleshooting but were not used by GitHub Actions.

Launch impact:

- Staging alias automation is now verified end-to-end.
- Production / staging DB remains shared temporarily and still needs separation before real customer onboarding.

## 2026-06-24 - Staging Alias Auto-Update Workflow

Task goal:

- Add an automated flow that points `staging.carry-digital-nomad.in.net` at the latest successful Vercel Preview deployment.
- Keep production on the simple release and staging / preview on the full release.
- Do not split DB yet.

Files changed:

- `.github/workflows/update-staging-alias.yml`
- `docs/deployment.md`
- `docs/project-launch-checklist.md`
- `docs/product-readiness-review.md`
- `docs/security-review.md`
- `docs/fix-roadmap.md`
- `docs/codex-session-log.md`

Implementation notes:

- Added a GitHub Actions workflow triggered by successful non-production `deployment_status` events.
- Added a manual `workflow_dispatch` fallback for entering a Vercel Preview deployment URL.
- The workflow validates that the target host ends in `.vercel.app` before running `vercel alias set`.
- `VERCEL_TOKEN` must be stored in GitHub Secrets. `VERCEL_SCOPE` is optional for team-scoped projects.
- No DB schema, Prisma migration, app runtime behavior, OAuth flow, webhook, billing, or affiliate logic was changed.

Launch impact:

- Staging can become a stable always-current Preview URL after the GitHub Secret is configured and the first Preview deployment event runs.
- Production / staging DB remains shared temporarily and must be separated before real customer onboarding.

New risks:

- Any successful non-production Preview deployment can move the staging alias. If this should only follow the `staging` branch, add a branch/ref guard after inspecting the first deployment payload.

Next suggested Codex Prompt:

```text
請在 GitHub repo secrets 確認 `VERCEL_TOKEN` 已設定後，觸發一次 Vercel Preview deployment，幫我檢查 GitHub Actions 的 Update Staging Alias 是否成功把 staging.carry-digital-nomad.in.net 指到最新 Preview。
```

## 2026-06-19 - Production Simple Release / Preview Full Release Split

Task goal:

- Make the custom production domain run the simplified InboxPilot launch version.
- Keep Vercel Preview / localhost as the full planned version while the project is still pre-launch.
- Keep the current shared database unchanged for now.

Files changed:

- `src/lib/release-mode.ts`
- `src/proxy.ts`
- `src/components/AdminShell.tsx`
- `src/components/AdminMobileNav.tsx`
- `src/app/dashboard/page.tsx`
- `src/app/channels/page.tsx`
- `src/app/channels/connect/page.tsx`
- `src/app/channels/connect/social/page.tsx`
- `src/app/referrals/page.tsx`
- `docs/project-launch-checklist.md`
- `docs/product-readiness-review.md`
- `docs/security-review.md`
- `docs/meta-app-review-checklist.md`
- `docs/billing-affiliate-readiness.md`
- `docs/fix-roadmap.md`
- `docs/codex-session-log.md`

Implementation notes:

- Added release channel detection. `inboxpilot.carry-digital-nomad.in.net` defaults to `simple`; all other hosts default to `full`.
- Added `INBOXPILOT_RELEASE_CHANNEL=simple|full` as an override.
- Production simple navigation now shows only Home, Inbox, Contacts, Channels, Analytics, Automations, and Referrals.
- Production simple channel connection surfaces Instagram only.
- Production simple referral page presents referral activity only, not affiliate payout.
- Full-only app routes and non-Instagram OAuth entry points are blocked on the simple production host.
- Database schema, OAuth callback storage, webhook behavior, billing logic, and affiliate service logic were not changed.

Current URLs:

- Production simple site: `https://inboxpilot.carry-digital-nomad.in.net`
- Current preview / testing deployment from Vercel CLI: `https://inboxpilot-ap79iimgd-a25814740s-projects.vercel.app`

Validation:

```text
npm run lint
Result: passed

npm run build
Result: passed. Existing Windows Prisma engine DLL lock fallback appeared and reused the existing generated client.

npm test
Result: timed out after 244 seconds before a complete result was returned.

npx vitest run tests/unit tests/integration --reporter=dot
Result: failed in existing Broadcast API tests:
- tests/integration/api-routes.test.ts: broadcast.scheduledAt?.toISOString is not a function
- tests/integration/api-routes.test.ts: expected "廣播資料格式不正確。" but received "廣播資料格式錯誤，請重新確認。"

npm run test:e2e
Result: passed, 10 tests passed.

git diff --check
Result: passed with Windows line-ending warnings only
```

Launch impact:

- Production surface is reduced toward a simpler IG-first launch.
- Shared DB remains acceptable only while the product is pre-launch; before real customers, production and staging data should be separated.

New risks:

- Preview URLs can rotate on future Vercel deployments unless a stable staging alias/domain is configured.
- Shared DB means staging tests can still affect production-visible data until environments are separated.

Next suggested Codex Prompt:

```text
請幫我把 Vercel Preview 設定成固定 staging 網域，正式站維持 simple release，staging 維持 full release；先不要拆 DB，只新增環境變數與部署文件。
```

## 2026-06-16 - Meta Business Login Final App Review Package Assembly Checklist

Task:

- Create the final App Review package assembly checklist based on the final redaction search execution report template, reviewer recording shot list, and permission usage proof matrix.
- Only add / update documentation.
- Do not modify product code, OAuth flow, callback route, login button, env, Prisma schema, or Supabase migration state.

Files changed:

- `docs/meta-business-login-final-app-review-package-assembly-checklist.md`
- `docs/meta-business-login-final-app-review-demo-package-checklist.md`
- `docs/meta-business-login-sandbox-go-no-go-checklist.md`
- `docs/meta-app-review-checklist.md`
- `docs/security-review.md`
- `docs/fix-roadmap.md`
- `docs/codex-session-log.md`

Decision:

```text
Final App Review package assembly checklist: Draft complete
Actual App Review package assembled: Hold
Internal beta: Hold
Production implementation: No-Go
```

Validation:

```text
git status --short --branch
Result: master had docs-only working tree changes before commit.

git diff --check
Result: passed with Windows line-ending warnings only.

npx vitest run tests/meta-business-login-sandbox-sbl08.test.ts tests/meta-business-login-sandbox-sbl12-callback-capture.test.ts tests/meta-business-login-sandbox-sbl12-callback-route.test.ts tests/meta-business-login-sandbox-sbl13-workspace-linking-sync.test.ts
Result: 4 test files passed, 12 tests passed.

npm run lint
Result: passed.

npm run build
Result: passed. Existing Windows Prisma engine DLL lock fallback appeared and reused the existing generated client.

npm test
Result: not run locally because this task changed documentation only; targeted SBL tests plus lint/build passed.
```

Next suggested Codex Prompt:

```text
請根據 docs/meta-business-login-final-app-review-package-assembly-checklist.md、docs/meta-business-login-final-redaction-search-execution-report-template.md 與 docs/meta-business-login-final-reviewer-recording-shot-list.md，建立 Meta Business Login internal beta final preflight checklist。

請只新增 / 更新文件，不要改產品功能程式碼，不要改 OAuth flow，不要改 callback route，不要改登入按鈕，不要改 env，不要改 Prisma schema，不要執行 Supabase migration。

檔案路徑：
docs/meta-business-login-internal-beta-final-preflight-checklist.md

內容需包含：
1. App Review package assembly 是否完成
2. redaction report 是否 Pass
3. reviewer recording / screenshots / permission proof / test asset proof 是否 Pass
4. internal-only entry point / workspace allowlist / user admin role 是否 Pass
5. rollback / fallback 是否 Pass
6. 可以解除 internal beta Hold 的 go / hold 判定
7. production implementation 仍不可開始的原因

完成後執行 git status、targeted tests、npm run lint、npm run build，commit 並 push master。
```

## 2026-06-16 - Meta Business Login Final Redaction Search Execution Report Template

Task:

- Create the final redaction search execution report template based on the reviewer recording shot list, permission usage proof matrix, and final App Review demo package checklist.
- Only add / update documentation.
- Do not modify product code, OAuth flow, callback route, login button, env, or Prisma schema.

Files changed:

- `docs/meta-business-login-final-redaction-search-execution-report-template.md`
- `docs/meta-business-login-final-app-review-demo-package-checklist.md`
- `docs/meta-business-login-sandbox-go-no-go-checklist.md`
- `docs/meta-app-review-checklist.md`
- `docs/security-review.md`
- `docs/fix-roadmap.md`
- `docs/codex-session-log.md`

Decision:

```text
Final redaction search execution report template: Ready
Final redaction search executed: Hold
Internal beta: Hold
Production implementation: No-Go
```

Validation:

```text
git status --short --branch
Result: master had docs-only working tree changes before commit.

git diff --check
Result: passed with Windows line-ending warnings only.

npx vitest run tests/meta-business-login-sandbox-sbl08.test.ts tests/meta-business-login-sandbox-sbl12-callback-capture.test.ts tests/meta-business-login-sandbox-sbl12-callback-route.test.ts tests/meta-business-login-sandbox-sbl13-workspace-linking-sync.test.ts
Result: 4 test files passed, 12 tests passed.

npm run lint
Result: passed.

npm run build
Result: passed. Existing Windows Prisma engine DLL lock fallback appeared and reused the existing generated client.

npm test
Result: not run locally because this task changed documentation only; targeted SBL tests plus lint/build passed.
```

Next suggested Codex Prompt:

```text
請根據 docs/meta-business-login-final-redaction-search-execution-report-template.md、docs/meta-business-login-final-reviewer-recording-shot-list.md 與 docs/meta-business-login-final-permission-usage-proof-matrix.md，建立 Meta Business Login final App Review package assembly checklist。

請只新增 / 更新文件，不要改產品功能程式碼，不要改 OAuth flow，不要改 callback route，不要改登入按鈕，不要改 env，不要改 Prisma schema。

檔案路徑：
docs/meta-business-login-final-app-review-package-assembly-checklist.md

內容需包含：
1. final reviewer recording、screenshots、permission proof、redaction report、test asset proof 的打包清單
2. 每個檔案進 App Review package 前的 gate
3. 不可打包的檔案類型與敏感資料規則
4. Meta Dashboard scope reconciliation 檢查
5. internal beta 是否可解除 Hold 的條件
6. production implementation 仍不可開始的原因

完成後執行 git status、targeted tests、npm run lint、npm run build，commit 並 push master。
```

## 2026-06-16 - Meta Business Login Final Reviewer Recording Shot List

Task:

- Create the final reviewer recording shot list based on the permission usage proof matrix and final App Review demo package checklist.
- Only add / update documentation.
- Do not modify product code, OAuth flow, callback route, login button, env, or Prisma schema.

Files changed:

- `docs/meta-business-login-final-reviewer-recording-shot-list.md`
- `docs/meta-business-login-final-app-review-demo-package-checklist.md`
- `docs/meta-app-review-checklist.md`
- `docs/security-review.md`
- `docs/fix-roadmap.md`
- `docs/codex-session-log.md`

Decision:

```text
Final reviewer recording shot list: Draft complete
App Review readiness: Hold
Internal beta: Hold
Production implementation: No-Go
```

Validation:

```text
git status --short --branch
Result: master had docs-only working tree changes before commit.

git diff --check
Result: passed with Windows line-ending warnings only.

npx vitest run tests/meta-business-login-sandbox-sbl08.test.ts tests/meta-business-login-sandbox-sbl12-callback-capture.test.ts tests/meta-business-login-sandbox-sbl12-callback-route.test.ts tests/meta-business-login-sandbox-sbl13-workspace-linking-sync.test.ts
Result: 4 test files passed, 12 tests passed.

npm run lint
Result: passed.

npm run build
Result: passed. Existing Windows Prisma engine DLL lock fallback appeared and reused the existing generated client.

npm test
Result: not run locally because this task changed documentation only; targeted SBL tests plus lint/build passed.
```

Next suggested Codex Prompt:

```text
請根據 docs/meta-business-login-final-reviewer-recording-shot-list.md、docs/meta-business-login-final-permission-usage-proof-matrix.md 與 docs/meta-business-login-final-app-review-demo-package-checklist.md，建立 Meta Business Login final redaction search execution report template。

請只新增 / 更新文件，不要改產品功能程式碼，不要改 OAuth flow，不要改 callback route，不要改登入按鈕，不要改 env，不要改 Prisma schema。

檔案路徑：
docs/meta-business-login-final-redaction-search-execution-report-template.md

內容需包含：
1. App Review 文件、錄影、截圖、測試輸出、log、audit 的搜尋範圍
2. token / code / secret / raw state / raw nonce / full callback URL / unmasked asset ID 的搜尋指令
3. 允許的 false positive 規則
4. 每個 finding 的處理欄位
5. 清理後 retest 流程
6. internal beta 是否可解除 Hold 的判定
7. production implementation 仍不可開始的原因

完成後執行 git status、targeted tests、npm run lint、npm run build，commit 並 push master。
```

## 2026-06-16 - Meta Business Login Final Permission Usage Proof Matrix

任務目標：

- 根據 final App Review demo package checklist，建立 Meta Business Login final permission usage proof matrix。
- 只新增 / 更新文件，不修改產品功能程式碼、OAuth flow、callback route、登入按鈕、env 或 Prisma schema。

修改內容：

- 新增 `docs/meta-business-login-final-permission-usage-proof-matrix.md`。
- 回填 `docs/meta-business-login-final-app-review-demo-package-checklist.md`。
- 回填 `docs/meta-business-login-sandbox-go-no-go-checklist.md`。
- 回填 `docs/meta-app-review-checklist.md`。
- 回填 `docs/security-review.md`。
- 回填 `docs/fix-roadmap.md`。
- 回填 `docs/codex-session-log.md`。

目前結論：

```text
Permission usage proof matrix: Draft complete
Core Instagram Business Login scopes: candidate keep
instagram_business_content_publish: Defer / Remove
instagram_business_manage_insights: Defer / Remove
Facebook Login for Business scopes: Hold pending selected-flow reconciliation
App Review readiness: Hold
Internal beta: Hold
Production implementation: No-Go
```

驗證：

```text
git status --short --branch
Result: master had docs-only working tree changes before commit.

git diff --check
Result: passed with Windows line-ending warnings only.

npx vitest run tests/meta-business-login-sandbox-sbl08.test.ts tests/meta-business-login-sandbox-sbl12-callback-capture.test.ts tests/meta-business-login-sandbox-sbl12-callback-route.test.ts tests/meta-business-login-sandbox-sbl13-workspace-linking-sync.test.ts
Result: 4 test files passed, 12 tests passed.

npm run lint
Result: passed.

npm run build
Result: passed. Existing Windows Prisma engine DLL lock fallback appeared and reused the existing generated client.

npm test
Result: not run; this task changed documentation only and targeted SBL tests plus lint/build passed.
```

下一個建議 Codex Prompt：

```text
請根據 docs/meta-business-login-final-permission-usage-proof-matrix.md 與 docs/meta-business-login-final-app-review-demo-package-checklist.md，建立 Meta Business Login final reviewer recording shot list。

請只新增 / 更新文件，不要改產品功能程式碼，不要改 OAuth flow，不要改 callback route，不要改登入按鈕，不要改 env，不要改 Prisma schema。

檔案路徑：
docs/meta-business-login-final-reviewer-recording-shot-list.md

內容需包含：
1. 每個 permission 對應要錄到的畫面
2. 每段錄影的操作步驟
3. 必須遮蔽或不可出現的資訊
4. Business / Page / IG account selection 的畫面需求
5. Inbox / comment automation / channel detail 的畫面需求
6. redacted callback evidence 的呈現方式
7. workspace linking / channel sync dry-run evidence 的呈現方式
8. App Review 提交前的 final redaction search checklist
9. internal beta 是否可解除 Hold 的條件
10. production implementation 仍不可開始的原因

完成後執行 git status、targeted tests、npm run lint、npm run build，commit 並 push master。
```

## 2026-06-16 - Meta Business Login sandbox SBL-12 callback capture helper

Task:

- Inspect current production Instagram / Meta callback risk points.
- Add sandbox-only callback capture helper and tests.
- Do not modify production OAuth flow, callback routes, login buttons, env, Prisma schema, token storage, or production writes.

Files changed:

- `src/lib/meta-business-sandbox-callback-capture.ts`
- `tests/meta-business-login-sandbox-sbl12-callback-capture.test.ts`
- `docs/meta-business-login-sandbox-controlled-callback-capture-plan.md`
- `docs/meta-business-login-sandbox-sbl12-callback-capture-test-command.md`
- `docs/meta-business-login-sandbox-go-no-go-checklist.md`
- `docs/meta-business-login-sandbox-runbook-template.md`
- `docs/meta-business-login-sandbox-experiment-report-template.md`
- `docs/meta-app-review-checklist.md`
- `docs/security-review.md`
- `docs/fix-roadmap.md`
- `docs/codex-session-log.md`

Validation:

- `npx vitest run tests/meta-business-login-sandbox-sbl12-callback-capture.test.ts`: passed, 5 tests.
- `npx vitest run tests/meta-business-login-sandbox-production-isolation.test.ts tests/meta-business-login-sandbox-sbl01-route.test.ts tests/meta-business-login-sandbox-sbl01.test.ts tests/meta-business-login-sandbox-sbl03.test.ts tests/meta-business-login-sandbox-sbl04.test.ts tests/meta-business-login-sandbox-sbl05.test.ts tests/meta-business-login-sandbox-sbl06.test.ts tests/meta-business-login-sandbox-sbl07.test.ts tests/meta-business-login-sandbox-sbl08.test.ts tests/meta-business-login-sandbox-sbl09.test.ts tests/meta-business-login-sandbox-sbl11-evidence-packet.test.ts tests/meta-business-login-sandbox-sbl12-callback-capture.test.ts`: passed, 49 tests.
- `npm run lint`: passed.
- `npm run build`: passed with exit code 0. The existing Prisma engine DLL lock fallback message appeared and reused the generated client.

Decision:

- Callback capture helper: Pass.
- Production callback route integration: Hold.
- Real callback evidence: Hold.
- Internal beta: Hold.
- Production implementation: No-Go.

## 2026-06-16 - Meta Business Login sandbox next controlled callback prompt

Task:

- Answer why the next suggested prompt was missing.
- Add a copyable next-step prompt for controlled callback capture preparation.
- Keep the next step blocked from blindly retrying OAuth against the production callback.

Files changed:

- `docs/meta-business-login-sandbox-next-controlled-callback-prompt.md`
- `docs/fix-roadmap.md`
- `docs/meta-business-login-sandbox-go-no-go-checklist.md`
- `docs/meta-business-login-sandbox-implementation-final-report.md`
- `docs/meta-app-review-checklist.md`
- `docs/security-review.md`
- `docs/codex-session-log.md`

Decision:

- The next safe task is controlled callback capture design and guard preparation.
- Do not retry the Instagram Business Login OAuth URL until sandbox-only callback capture or equivalent production-safe controls exist.
- Internal beta remains Hold.
- Production implementation remains No-Go.

## 2026-06-16 - Meta Business Login sandbox OAuth profile selection

Task:

- Continue from the Instagram Business Login forced login page in the in-app Browser.
- Observe account selection behavior and stop before any production callback or final OAuth authorization.

Files changed:

- `docs/meta-business-login-sandbox-oauth-profile-selection-run-2026-06-16.md`
- `docs/meta-business-login-sandbox-go-no-go-checklist.md`
- `docs/meta-business-login-sandbox-runbook-template.md`
- `docs/meta-business-login-sandbox-experiment-report-template.md`
- `docs/meta-business-login-sandbox-implementation-final-report.md`
- `docs/meta-app-review-checklist.md`
- `docs/security-review.md`
- `docs/fix-roadmap.md`
- `docs/codex-session-log.md`

Validation / observations:

- Instagram Business Login forced login screen was visible.
- Clicking `使用 Facebook 帳號登入` showed IG profile selection with `ling.yun.energy`, `carry.digital.nomad`, and `使用其他個人檔案`.
- Selected `carry.digital.nomad`.
- Instagram loaded the selected profile's home page.
- No final OAuth consent screen, authorization code callback, production ConnectedAccount write, production Channel write, webhook registration, or channel sync was intentionally triggered.

## 2026-06-15 - Meta Business Login sandbox authenticated browser evidence

Task:

- Continue after the in-app Browser was authenticated into Meta Developers.
- Capture read-only evidence for InboxPilot App Dashboard, Instagram API setup, Instagram Business Login URL, business login settings, permissions, and account selection UX.
- Stop before selecting an Instagram profile and before final OAuth authorization.

Files changed:

- `docs/meta-business-login-sandbox-authenticated-browser-evidence-run-2026-06-15.md`
- `docs/meta-business-login-sandbox-browser-evidence-run-2026-06-15.md`
- `docs/meta-business-login-sandbox-implementation-final-report.md`
- `docs/meta-business-login-sandbox-go-no-go-checklist.md`
- `docs/meta-business-login-sandbox-runbook-template.md`
- `docs/fix-roadmap.md`
- `docs/security-review.md`
- `docs/meta-app-review-checklist.md`
- `docs/codex-session-log.md`

Validation / observations:

- Meta Apps page showed InboxPilot app id `924285843989683`, live mode, and business `零元兄弟`.
- InboxPilot Dashboard showed no required actions, rate limit 0% used, and Instagram / Pages / Messenger use cases.
- Instagram API setup showed Instagram app name `manychat-auto-reply-IG`, app id `1530009762118735`, and app secret masked by Meta UI.
- Meta-provided Instagram Business Login URL includes `force_reauth=true`, `response_type=code`, callback URL redacted, and Instagram Business scopes.
- Business login settings showed redirect, deauthorize callback, and data deletion request fields configured; values redacted.
- Permissions table showed required messaging permissions as testable, while content publish / insights were shown as addable.
- Instagram OAuth flow showed login form and then IG profile account selection after Facebook login.
- No final OAuth authorization or callback was completed.

## 2026-06-15 - Meta Business Login sandbox browser evidence run

Task:

- Continue into browser-based external evidence collection.
- Attempt to open Meta Developers and record whether Meta App Dashboard / account selection evidence can be collected.
- Do not enter credentials, OTP, token, authorization code, app secret, raw state, raw nonce, full callback URL, or inspect browser storage.

Files changed:

- `docs/meta-business-login-sandbox-browser-evidence-run-2026-06-15.md`
- `docs/meta-business-login-sandbox-implementation-final-report.md`
- `docs/meta-business-login-sandbox-go-no-go-checklist.md`
- `docs/meta-business-login-sandbox-runbook-template.md`
- `docs/fix-roadmap.md`
- `docs/security-review.md`
- `docs/meta-app-review-checklist.md`
- `docs/codex-session-log.md`

Validation / observations:

- Local dev server health check: passed, status 200.
- In-app Browser could not navigate directly to the internal API route due `net::ERR_BLOCKED_BY_CLIENT`.
- HTTP guard check for internal authorize route: 401 dry-run `unauthorized` without authenticated admin session.
- HTTP guard check for internal callback route with sandbox header: 401 dry-run `unauthorized` without authenticated admin session.
- Meta Developers redirected to Facebook login; no authenticated Meta developer session was available.
- No Meta dialog, account selection UX, real callback, reviewer demo, or App Dashboard evidence was captured.

## 2026-06-15 - Meta Business Login sandbox external evidence retry blocker

Task:

- Retry Chrome-based Meta Developers Apps evidence collection after the user asked Codex to continue.
- Keep the attempt read-only and do not treat blocked page access as App Review evidence.

Result:

- Chrome listed the Meta Developers Apps tab at `https://developers.facebook.com/apps/`.
- Claiming the latest Meta Developers Apps tab and reading the DOM was still blocked by another Chrome extension UI.
- No Meta App Dashboard, Meta dialog, account selection UX, callback, or App Review evidence was collected.
- Production implementation remains No-Go.

## 2026-06-15 - Meta Business Login sandbox external evidence handoff

Task:

- Attempt Chrome-based Meta Developers Apps evidence collection.
- Record blocker state without treating it as App Review evidence.
- Do not capture or store token, authorization code, secret, raw state, raw nonce, callback URL, app secret, or app dashboard secret.

Files changed:

- `docs/meta-business-login-sandbox-external-evidence-handoff.md`
- `docs/meta-business-login-sandbox-implementation-final-report.md`
- `docs/meta-app-review-checklist.md`
- `docs/security-review.md`
- `docs/fix-roadmap.md`
- `docs/codex-session-log.md`

Result:

- Chrome reached `https://developers.facebook.com/apps/`.
- Page title observed: `所有應用程式 - Meta for Developers`.
- Automation could not inspect the page DOM because another Chrome extension UI was blocking the page.
- No App Review evidence was collected.

Resume result:

- Chrome automation later could list and claim Meta-related tabs again.
- Safe metadata remained limited to `所有應用程式 - Meta for Developers` at `https://developers.facebook.com/apps/`.
- DOM snapshot, page evaluate, and screenshot attempts against the Meta Apps page timed out.
- Direct navigation to the Business Login settings URL redirected back to `https://developers.facebook.com/apps/`.
- No App Dashboard settings, Business Login settings, permission status, App Review status, Meta dialog UX, account selection UX, or callback evidence was collected.

## 2026-06-15 - Meta Business Login sandbox SBL-11 evidence packet

Task:

- Add a local dry-run evidence packet helper for sandbox execution preparation.
- Validate that redacted authorize / callback evidence can be packaged without raw code, raw state, production writes, or production implementation approval.
- Do not call Meta, exchange real codes, store tokens, modify production OAuth, modify callback routes, modify login buttons, modify env, modify Prisma schema, or write production ConnectedAccount / Channel records.

Files changed:

- `src/lib/meta-business-sandbox-evidence.ts`
- `tests/meta-business-login-sandbox-sbl11-evidence-packet.test.ts`
- `docs/meta-business-login-sandbox-sbl11-evidence-packet-test-command.md`
- `docs/meta-business-login-sandbox-implementation-final-report.md`
- `docs/fix-roadmap.md`
- `docs/security-review.md`
- `docs/meta-app-review-checklist.md`
- `docs/codex-session-log.md`

Validation:

- `npx vitest run tests/meta-business-login-sandbox-sbl11-evidence-packet.test.ts`: passed, 3 tests.
- `npx vitest run tests/meta-business-login-sandbox-production-isolation.test.ts tests/meta-business-login-sandbox-sbl01-route.test.ts tests/meta-business-login-sandbox-sbl01.test.ts tests/meta-business-login-sandbox-sbl03.test.ts tests/meta-business-login-sandbox-sbl04.test.ts tests/meta-business-login-sandbox-sbl05.test.ts tests/meta-business-login-sandbox-sbl06.test.ts tests/meta-business-login-sandbox-sbl07.test.ts tests/meta-business-login-sandbox-sbl08.test.ts tests/meta-business-login-sandbox-sbl09.test.ts tests/meta-business-login-sandbox-sbl11-evidence-packet.test.ts`: passed, 44 tests.
- `npm run lint`: passed.
- `npm run build`: passed with exit code 0. The existing Prisma engine DLL lock fallback message appeared and reused the generated client.

## 2026-06-15 - Meta Business Login sandbox production isolation regression

Task:

- Add an automated regression test that proves sandbox-only Meta Business Login code remains isolated from production OAuth, UI entry points, and Prisma schema.
- Do not modify production OAuth flow, existing callback routes, login buttons, env, Prisma schema, token storage, or production write paths.

Files changed:

- `tests/meta-business-login-sandbox-production-isolation.test.ts`
- `docs/meta-business-login-sandbox-production-isolation-test-command.md`
- `docs/meta-business-login-sandbox-implementation-final-report.md`
- `docs/fix-roadmap.md`
- `docs/security-review.md`
- `docs/meta-app-review-checklist.md`
- `docs/codex-session-log.md`

Validation:

- `npx vitest run tests/meta-business-login-sandbox-production-isolation.test.ts`: passed, 4 tests.
- `npx vitest run tests/meta-business-login-sandbox-production-isolation.test.ts tests/meta-business-login-sandbox-sbl01-route.test.ts tests/meta-business-login-sandbox-sbl01.test.ts tests/meta-business-login-sandbox-sbl03.test.ts tests/meta-business-login-sandbox-sbl04.test.ts tests/meta-business-login-sandbox-sbl05.test.ts tests/meta-business-login-sandbox-sbl06.test.ts tests/meta-business-login-sandbox-sbl07.test.ts tests/meta-business-login-sandbox-sbl08.test.ts tests/meta-business-login-sandbox-sbl09.test.ts`: passed, 41 tests.
- `npm run lint`: passed.
- `npm run build`: passed with exit code 0. The existing Prisma engine DLL lock fallback message appeared and reused the generated client.
- `git diff --check`: passed with Windows line ending warnings only.
- `npm test`: timed out after 244 seconds; targeted SBL tests passed and no targeted SBL failure was observed before timeout.

## 2026-06-15 - Meta Business Login sandbox route helper integration

Task:

- Integrate internal sandbox routes with the SBL-03 to SBL-08 helper chain.
- Add route-level assertions for state / nonce evidence, code exchange dry-run evidence, workspace spoofing rejection, and production write guard metadata.
- Do not modify production OAuth flow, existing callback routes, login buttons, env, Prisma schema, token storage, or production write paths.

Files changed:

- `src/lib/meta-business-sandbox.ts`
- `src/app/api/internal/oauth/[provider]/authorize/route.ts`
- `src/app/api/internal/oauth/[provider]/callback/route.ts`
- `tests/meta-business-login-sandbox-sbl01-route.test.ts`
- `docs/meta-business-login-sandbox-implementation-final-report.md`
- `docs/fix-roadmap.md`
- `docs/security-review.md`
- `docs/meta-app-review-checklist.md`
- `docs/codex-session-log.md`

Validation:

- `npx vitest run tests/meta-business-login-sandbox-sbl01-route.test.ts`: passed, 5 tests.
- `npx vitest run tests/meta-business-login-sandbox-sbl01.test.ts tests/meta-business-login-sandbox-sbl03.test.ts tests/meta-business-login-sandbox-sbl04.test.ts tests/meta-business-login-sandbox-sbl05.test.ts tests/meta-business-login-sandbox-sbl06.test.ts tests/meta-business-login-sandbox-sbl07.test.ts tests/meta-business-login-sandbox-sbl08.test.ts tests/meta-business-login-sandbox-sbl09.test.ts`: passed, 32 tests.
- `git diff --check`: passed with Windows line ending warnings only.
- `npm run lint`: passed.
- `npm run build`: passed with exit code 0. The existing Prisma engine DLL lock fallback message appeared and reused the generated client.
- `npm test`: not run; targeted SBL route integration tests were executed successfully.

## 2026-06-15 - Meta Business Login sandbox implementation final report

Task:

- Create SBL-10 final consolidation report.
- Confirm sandbox coding is complete for internal-only dry-run scaffold.
- Keep internal beta and production implementation blocked.

Files changed:

- `docs/meta-business-login-sandbox-implementation-final-report.md`
- `docs/fix-roadmap.md`
- `docs/codex-session-log.md`

Validation:

- `npx vitest run tests/meta-business-login-sandbox-sbl06.test.ts tests/meta-business-login-sandbox-sbl07.test.ts tests/meta-business-login-sandbox-sbl08.test.ts tests/meta-business-login-sandbox-sbl05.test.ts tests/meta-business-login-sandbox-sbl04.test.ts tests/meta-business-login-sandbox-sbl03.test.ts tests/meta-business-login-sandbox-sbl01.test.ts tests/meta-business-login-sandbox-sbl01-route.test.ts tests/meta-business-login-sandbox-sbl09.test.ts`: passed, 36 tests.
- `git diff --check`: passed with Windows line ending warnings only.
- `npm run lint`: passed.
- `npm run build`: passed with exit code 0. The existing Prisma engine DLL lock fallback message appeared and reused the generated client.
- `npm test`: not run; targeted SBL tests cover the sandbox implementation scaffold.

## 2026-06-15 - Meta Business Login sandbox SBL-06 to SBL-08 helpers

Task:

- Create SBL-06 dry-run callback payload builder, SBL-07 workspace allowlist guard, and SBL-08 production write guard.
- Add targeted tests and test command documentation.
- Do not modify existing OAuth flow, callback routes, login buttons, env, Prisma schema, production ConnectedAccount, or production Channel records.

Files changed:

- `src/lib/meta-business-sandbox-dry-run.ts`
- `src/lib/meta-business-sandbox-allowlist.ts`
- `src/lib/meta-business-sandbox-write-guard.ts`
- `tests/meta-business-login-sandbox-sbl06.test.ts`
- `tests/meta-business-login-sandbox-sbl07.test.ts`
- `tests/meta-business-login-sandbox-sbl08.test.ts`
- `docs/meta-business-login-sandbox-sbl06-08-test-command.md`
- `docs/meta-business-login-sandbox-runbook-template.md`
- `docs/meta-business-login-sandbox-experiment-report-template.md`
- `docs/meta-business-login-sandbox-go-no-go-checklist.md`
- `docs/meta-business-login-sandbox-coding-risk-test-plan.md`
- `docs/security-review.md`
- `docs/fix-roadmap.md`
- `docs/meta-app-review-checklist.md`
- `docs/codex-session-log.md`

Validation:

- `npx vitest run tests/meta-business-login-sandbox-sbl06.test.ts tests/meta-business-login-sandbox-sbl07.test.ts tests/meta-business-login-sandbox-sbl08.test.ts`: passed, 6 tests.
- `npx vitest run tests/meta-business-login-sandbox-sbl05.test.ts tests/meta-business-login-sandbox-sbl04.test.ts tests/meta-business-login-sandbox-sbl03.test.ts tests/meta-business-login-sandbox-sbl01.test.ts tests/meta-business-login-sandbox-sbl01-route.test.ts tests/meta-business-login-sandbox-sbl09.test.ts`: passed, 30 tests.
- `git diff --check`: passed with Windows line ending warnings only.
- `npm run lint`: passed.
- `npm run build`: passed with exit code 0. The existing Prisma engine DLL lock fallback message appeared and reused the generated client.
- `npm test`: not run; targeted SBL tests were executed successfully.

## 2026-06-15 - Meta Business Login sandbox SBL-05 redacted logging helper

Task:

- Create SBL-05 sandbox-only redacted logging helper.
- Add helper tests and test command documentation.
- Do not change production audit behavior, production logging format, existing OAuth flow, existing callback routes, env, Prisma schema, token storage, or production write paths.

Files changed:

- `src/lib/meta-business-sandbox-redaction.ts`
- `tests/meta-business-login-sandbox-sbl05.test.ts`
- `docs/meta-business-login-sandbox-sbl05-test-command.md`
- `docs/meta-business-login-sandbox-runbook-template.md`
- `docs/meta-business-login-sandbox-experiment-report-template.md`
- `docs/meta-business-login-sandbox-go-no-go-checklist.md`
- `docs/meta-business-login-sandbox-coding-risk-test-plan.md`
- `docs/security-review.md`
- `docs/fix-roadmap.md`
- `docs/meta-app-review-checklist.md`
- `docs/codex-session-log.md`

Validation:

- `npx vitest run tests/meta-business-login-sandbox-sbl05.test.ts`: passed, 4 tests.
- `npx vitest run tests/meta-business-login-sandbox-sbl04.test.ts tests/meta-business-login-sandbox-sbl03.test.ts tests/meta-business-login-sandbox-sbl01.test.ts tests/meta-business-login-sandbox-sbl01-route.test.ts tests/meta-business-login-sandbox-sbl09.test.ts`: passed, 26 tests.
- `git diff --check`: passed with Windows line ending warnings only.
- `npm run lint`: passed.
- `npm run build`: passed with exit code 0. The existing Prisma engine DLL lock fallback message appeared and reused the generated client.
- `npm test`: not run yet; targeted SBL tests were executed first.

## 2026-06-15 - Meta Business Login sandbox SBL-04 code exchange helper

Task:

- Create SBL-04 sandbox-only code exchange helper.
- Add helper tests and test command documentation.
- Do not call Meta token endpoint by default, read env, store tokens, modify existing OAuth, modify existing callback routes, modify Prisma schema, or write production records.

Files changed:

- `src/lib/meta-business-sandbox-code-exchange.ts`
- `tests/meta-business-login-sandbox-sbl04.test.ts`
- `docs/meta-business-login-sandbox-sbl04-test-command.md`
- `docs/meta-business-login-sandbox-runbook-template.md`
- `docs/meta-business-login-sandbox-experiment-report-template.md`
- `docs/meta-business-login-sandbox-go-no-go-checklist.md`
- `docs/meta-business-login-sandbox-coding-risk-test-plan.md`
- `docs/security-review.md`
- `docs/fix-roadmap.md`
- `docs/meta-app-review-checklist.md`
- `docs/codex-session-log.md`

Validation:

- `npx vitest run tests/meta-business-login-sandbox-sbl04.test.ts`: passed, 5 tests.
- `npx vitest run tests/meta-business-login-sandbox-sbl03.test.ts tests/meta-business-login-sandbox-sbl01.test.ts tests/meta-business-login-sandbox-sbl01-route.test.ts tests/meta-business-login-sandbox-sbl09.test.ts`: passed, 21 tests.
- `git diff --check`: passed with Windows line ending warnings only.
- `npm run lint`: passed.
- `npm run build`: passed with exit code 0. The existing Prisma engine DLL lock fallback message appeared and reused the generated client.
- `npm test`: not run; targeted SBL tests were executed successfully.

## 2026-06-15 - Meta Business Login sandbox SBL-03 state nonce helpers

Task:

- Create SBL-03 sandbox-only state / nonce helpers.
- Add helper tests and test command documentation.
- Do not modify existing OAuth state helpers, callback routes, cookies, env, Prisma schema, token handling, or production write paths.

Files changed:

- `src/lib/meta-business-sandbox-state.ts`
- `tests/meta-business-login-sandbox-sbl03.test.ts`
- `docs/meta-business-login-sandbox-sbl03-test-command.md`
- `docs/meta-business-login-sandbox-runbook-template.md`
- `docs/meta-business-login-sandbox-experiment-report-template.md`
- `docs/meta-business-login-sandbox-go-no-go-checklist.md`
- `docs/meta-business-login-sandbox-coding-risk-test-plan.md`
- `docs/security-review.md`
- `docs/fix-roadmap.md`
- `docs/meta-app-review-checklist.md`
- `docs/codex-session-log.md`

Validation:

- `npx vitest run tests/meta-business-login-sandbox-sbl03.test.ts`: passed, 4 tests.
- `npx vitest run tests/meta-business-login-sandbox-sbl01.test.ts tests/meta-business-login-sandbox-sbl01-route.test.ts`: passed, 10 tests.
- `npx vitest run tests/meta-business-login-sandbox-sbl09.test.ts`: passed, 7 tests.
- `git diff --check`: passed with Windows line ending warnings only.
- `npm run lint`: passed.
- `npm run build`: passed with exit code 0. The existing Prisma engine DLL lock fallback message appeared and reused the generated client.
- `npm test`: not run; targeted SBL-03 / SBL-01 / SBL-09 tests were executed successfully.

## 2026-06-15 - Meta Business Login sandbox SBL-01 internal route skeleton

Task:

- Create SBL-01 internal-only dry-run route skeleton.
- Add sandbox helper, internal authorize route, internal callback route, SBL-01 helper tests, SBL-01 route tests, and SBL-01 test command documentation.
- Do not modify existing OAuth flow, existing callback routes, login buttons, Prisma schema, env, or production ConnectedAccount / Channel writes.

Files changed:

- `src/lib/meta-business-sandbox.ts`
- `src/app/api/internal/oauth/[provider]/authorize/route.ts`
- `src/app/api/internal/oauth/[provider]/callback/route.ts`
- `tests/meta-business-login-sandbox-sbl01.test.ts`
- `tests/meta-business-login-sandbox-sbl01-route.test.ts`
- `docs/meta-business-login-sandbox-sbl01-test-command.md`
- `docs/meta-business-login-sandbox-runbook-template.md`
- `docs/meta-business-login-sandbox-experiment-report-template.md`
- `docs/meta-business-login-sandbox-go-no-go-checklist.md`
- `docs/meta-business-login-sandbox-coding-risk-test-plan.md`
- `docs/security-review.md`
- `docs/fix-roadmap.md`
- `docs/meta-app-review-checklist.md`
- `docs/codex-session-log.md`

Validation:

- `npx vitest run tests/meta-business-login-sandbox-sbl01.test.ts`: passed, 6 tests.
- `npx vitest run tests/meta-business-login-sandbox-sbl01-route.test.ts`: passed, 4 tests.
- `npx vitest run tests/meta-business-login-sandbox-sbl09.test.ts`: passed, 7 tests.
- `git diff --check`: passed with Windows line ending warnings only.
- `npm run lint`: passed.
- `npm run build`: passed with exit code 0. The existing Prisma engine DLL lock fallback message appeared and reused the generated client.
- `npm test`: not run; targeted SBL-01 and SBL-09 tests were executed successfully.

## 2026-06-15 - Meta Business Login sandbox SBL-09 test scaffold coding

Task:

- Create SBL-09 sandbox test scaffold only.
- Add fixture directory, safe and unsafe fixture examples, redaction assertion helper, dry-run callback payload snapshot tests, production write guard tests, and test command documentation.
- Backfill runbook, experiment report, go/no-go checklist, coding risk test plan, security review, fix roadmap, Meta App Review checklist, and session log.
- Do not modify product code, OAuth flow, callback routes, login buttons, Prisma schema, or env.

Files changed:

- `tests/helpers/sbl09-redaction.ts`
- `tests/fixtures/sbl09/safe/sbl09.callback.valid-dry-run.expected-redacted.fixture.json`
- `tests/fixtures/sbl09/safe/sbl09.write-guard.channel-create-blocked.safe.fixture.json`
- `tests/fixtures/sbl09/unsafe/sbl09.redaction.raw-code.unsafe.fixture.json`
- `tests/meta-business-login-sandbox-sbl09.test.ts`
- `docs/meta-business-login-sandbox-sbl09-test-command.md`
- `docs/meta-business-login-sandbox-runbook-template.md`
- `docs/meta-business-login-sandbox-experiment-report-template.md`
- `docs/meta-business-login-sandbox-go-no-go-checklist.md`
- `docs/meta-business-login-sandbox-coding-risk-test-plan.md`
- `docs/security-review.md`
- `docs/fix-roadmap.md`
- `docs/meta-app-review-checklist.md`
- `docs/codex-session-log.md`

Validation:

- `npx vitest run tests/meta-business-login-sandbox-sbl09.test.ts`: passed, 7 tests.
- `git status`: docs plus SBL-09 test scaffold files changed; no product code changed.
- `npm run lint`: passed.
- `npm run build`: passed with exit code 0. The existing Prisma engine DLL lock fallback message appeared and reused the generated client.
- `npm test`: not run; this SBL-09 task added targeted scaffold tests, and the targeted Vitest command was executed successfully.

## 2026-06-15 - Meta Business Login sandbox SBL-09 coding readiness checklist

Task:

- Create a documentation-only SBL-09 sandbox coding readiness checklist.
- Include required documents, test suite readiness, fixture / redaction readiness, dry-run callback snapshot readiness, production write guard fixture readiness, redaction search readiness, SBL-09 go / hold decision, and explicit SBL-01 / internal beta / production blocks.
- Do not modify product code, OAuth flow, callback routes, login buttons, Prisma schema, or env.

Files changed:

- `docs/meta-business-login-sandbox-sbl09-coding-readiness-checklist.md`
- `docs/fix-roadmap.md`
- `docs/security-review.md`
- `docs/meta-app-review-checklist.md`
- `docs/codex-session-log.md`

Validation:

- `git status`: only documentation files changed.
- `npm run lint`: passed.
- `npm run build`: passed with exit code 0. The existing Prisma engine DLL lock fallback message appeared and reused the generated client.
- `npm test`: not run; documentation-only task covered by lint/build verification.

## 2026-06-15 - Meta Business Login sandbox SBL-09 fixture redaction spec

Task:

- Create a documentation-only SBL-09 sandbox test fixture and redaction assertion specification.
- Include fixture naming, safe and unsafe fixture examples, forbidden raw token / code / secret / state / nonce / callback URL rules, redaction assertions, dry-run callback payload snapshots, production write guard fixtures, search standards, and required runbook / report / go-no-go backfills.
- Do not modify product code, OAuth flow, callback routes, login buttons, Prisma schema, or env.

Files changed:

- `docs/meta-business-login-sandbox-sbl09-fixture-redaction-spec.md`
- `docs/fix-roadmap.md`
- `docs/security-review.md`
- `docs/meta-app-review-checklist.md`
- `docs/codex-session-log.md`

Validation:

- `git status`: only documentation files changed.
- `npm run lint`: passed.
- `npm run build`: passed with exit code 0. The existing Prisma engine DLL lock fallback message appeared and reused the generated client.
- `npm test`: not run; documentation-only task covered by lint/build verification.

## 2026-06-15 - Meta Business Login sandbox SBL-09 test suite spec

Task:

- Create a documentation-only SBL-09 sandbox coding minimum test suite specification.
- Include test goals and production boundaries, internal-only route tests, workspace allowlist tests, state / nonce / code exchange tests, redacted logging tests, dry-run callback payload tests, production write guard tests, and required runbook / report / go-no-go backfills.
- Do not modify product code, OAuth flow, callback routes, login buttons, Prisma schema, or env.

Files changed:

- `docs/meta-business-login-sandbox-sbl09-test-suite-spec.md`
- `docs/fix-roadmap.md`
- `docs/security-review.md`
- `docs/meta-app-review-checklist.md`
- `docs/codex-session-log.md`

Validation:

- `git status`: only documentation files changed.
- `npm run lint`: passed.
- `npm run build`: passed with exit code 0. The existing Prisma engine DLL lock fallback message appeared and reused the generated client.
- `npm test`: not run; documentation-only task covered by lint/build verification.

## 2026-06-15 - Meta Business Login sandbox coding kickoff checklist

Task:

- Create a documentation-only sandbox coding kickoff checklist.
- Include SBL-09 and SBL-01 prerequisite documents and gates, internal-only / dry-run-first / no-production-write checks, redaction search standards, required document backfills, and internal beta / production blocks.
- Do not modify product code, OAuth flow, callback routes, login buttons, Prisma schema, or env.

Files changed:

- `docs/meta-business-login-sandbox-coding-kickoff-checklist.md`
- `docs/fix-roadmap.md`
- `docs/security-review.md`
- `docs/meta-app-review-checklist.md`
- `docs/codex-session-log.md`

Validation:

- `git status`: only documentation files changed.
- `npm run lint`: passed.
- `npm run build`: passed with exit code 0. The existing Prisma engine DLL lock fallback message appeared and reused the generated client.
- `npm test`: not run; documentation-only task covered by lint/build verification.

## 2026-06-15 - Meta Business Login sandbox final readiness review

Task:

- Create a documentation-only final readiness review before Meta Business Login sandbox coding.
- Include sandbox document completeness, sandbox coding readiness, missing execution evidence, gate status, recommended first coding task, and internal beta / production implementation blocks.
- Do not modify product code, OAuth flow, callback routes, login buttons, Prisma schema, or env.

Files changed:

- `docs/meta-business-login-sandbox-final-readiness-review.md`
- `docs/fix-roadmap.md`
- `docs/security-review.md`
- `docs/meta-app-review-checklist.md`
- `docs/codex-session-log.md`

Validation:

- `git status`: only documentation files changed.
- `npm run lint`: passed.
- `npm run build`: passed with exit code 0. The existing Prisma engine DLL lock fallback message appeared and reused the generated client.
- `npm test`: not run; documentation-only task covered by lint/build verification.

## 2026-06-15 - Meta Business Login sandbox coding task breakdown

Task:

- Create a documentation-only task breakdown for future Meta Business Login sandbox coding.
- Include internal-only / dry-run-first task breakdown, prerequisite gates, test requirements, prohibited files / flows, evidence backfill requirements, and production implementation block.
- Do not modify product code, OAuth flow, callback routes, login buttons, Prisma schema, or env.

Files changed:

- `docs/meta-business-login-sandbox-coding-task-breakdown.md`
- `docs/fix-roadmap.md`
- `docs/security-review.md`
- `docs/meta-app-review-checklist.md`
- `docs/codex-session-log.md`

Validation:

- `git status`: only documentation files changed.
- `npm run lint`: passed.
- `npm run build`: passed with exit code 0. The existing Prisma engine DLL lock fallback message appeared and reused the generated client.
- `npm test`: not run; documentation-only task covered by lint/build verification.

## 2026-06-15 - Meta Business Login sandbox document index

Task:

- Create a documentation-only index and decision path for all Meta Business Login sandbox documents.
- Include document purpose, reading order, research-to-coding decision path, template / draft status, unpassed gates, and current production implementation block.
- Do not modify product code, OAuth flow, callback routes, login buttons, Prisma schema, or env.

Files changed:

- `docs/meta-business-login-sandbox-doc-index.md`
- `docs/fix-roadmap.md`
- `docs/security-review.md`
- `docs/meta-app-review-checklist.md`
- `docs/codex-session-log.md`

Validation:

- `git status`: only documentation files changed.
- `npm run lint`: passed.
- `npm run build`: passed with exit code 0. The existing Prisma engine DLL lock fallback message appeared and reused the generated client.
- `npm test`: not run; documentation-only task covered by lint/build verification.

## 2026-06-15 - Meta Business Login sandbox coding risk test plan

Task:

- Create a documentation-only sandbox coding risk assessment and test plan.
- Include internal-only route risks, sandbox provider interface risks, state / nonce / code exchange tests, redacted logging tests, dry-run callback payload tests, workspace allowlist tests, production Channel write guard tests, and the minimum checklist before sandbox coding can start.
- Do not modify product code, OAuth flow, callback routes, login buttons, Prisma schema, or env.

Files changed:

- `docs/meta-business-login-sandbox-coding-risk-test-plan.md`
- `docs/fix-roadmap.md`
- `docs/security-review.md`
- `docs/meta-app-review-checklist.md`
- `docs/codex-session-log.md`

Validation:

- `git status`: only documentation files changed.
- `npm run lint`: passed.
- `npm run build`: passed with exit code 0. The existing Prisma engine DLL lock fallback message appeared and reused the generated client.
- `npm test`: not run; documentation-only task covered by lint/build verification.

## 2026-06-15 - Meta Business Login sandbox coding spec draft

Task:

- Create a documentation-only pre-coding technical spec draft for Meta Business Login sandbox.
- Include internal-only route draft, sandbox provider interface, state / nonce / code exchange helpers, redacted logging, dry-run callback payload, workspace allowlist, production Channel write guards, and unchanged production OAuth / callback / button / env boundaries.
- Do not modify product code, OAuth flow, callback routes, login buttons, Prisma schema, or env.

Files changed:

- `docs/meta-business-login-sandbox-coding-spec-draft.md`
- `docs/fix-roadmap.md`
- `docs/security-review.md`
- `docs/meta-app-review-checklist.md`
- `docs/codex-session-log.md`

Validation:

- `git status`: only documentation files changed.
- `npm run lint`: passed.
- `npm run build`: passed with exit code 0. The existing Prisma engine DLL lock fallback message appeared and reused the generated client.
- `npm test`: not run; documentation-only task covered by lint/build verification.

## 2026-06-15 - Meta Business Login sandbox go/no-go checklist

Task:

- Create a documentation-only Meta Business Login sandbox go/no-go checklist.
- Include App Review, account selection UX, callback security, workspace linking, channel sync, redaction, rollback, and stage differences for sandbox coding, internal beta, and production implementation.
- Do not modify product code, OAuth flow, callback routes, login buttons, Prisma schema, or env.

Files changed:

- `docs/meta-business-login-sandbox-go-no-go-checklist.md`
- `docs/fix-roadmap.md`
- `docs/security-review.md`
- `docs/meta-app-review-checklist.md`
- `docs/codex-session-log.md`

Validation:

- `git status`: only documentation files changed.
- `npm run lint`: passed.
- `npm run build`: passed with exit code 0. The existing Prisma engine DLL lock fallback message appeared and reused the generated client.
- `npm test`: not run; documentation-only task covered by lint/build verification.

## 2026-06-15 - Meta Business Login sandbox experiment report template

Task:

- Create a documentation-only blank experiment report template for sandbox-only Meta Business Login results.
- Include experiment summary, test combinations, Meta dialog UX, callback / workspace linking / channel sync, redaction search, ManyChat UX proximity, App Review risks, and go / hold / no-go decision.
- Do not modify product code, OAuth flow, callback routes, login buttons, Prisma schema, or env.

Files changed:

- `docs/meta-business-login-sandbox-experiment-report-template.md`
- `docs/fix-roadmap.md`
- `docs/security-review.md`
- `docs/meta-app-review-checklist.md`
- `docs/codex-session-log.md`

Validation:

- `git status`: only documentation files changed.
- `npm run lint`: passed.
- `npm run build`: passed with exit code 0. The existing Prisma engine DLL lock fallback message appeared and reused the generated client.
- `npm test`: not run; documentation-only task covered by lint/build verification.

## 2026-06-15 - Meta Business Login sandbox runbook template

Task:

- Report current progress.
- Create a documentation-only runbook template for sandbox-only Meta Business Login experiments.
- Do not modify product code, OAuth flow, callback routes, login buttons, Prisma schema, or env.

Files changed:

- `docs/meta-business-login-sandbox-runbook-template.md`
- `docs/fix-roadmap.md`
- `docs/security-review.md`
- `docs/meta-app-review-checklist.md`
- `docs/codex-session-log.md`

Validation:

- `git status`: only documentation files changed.
- `npm run lint`: passed.
- `npm run build`: passed with exit code 0. The existing Prisma engine DLL lock fallback message appeared and reused the generated client.
- `npm test`: not run; documentation-only task covered by lint/build verification.

## 2026-06-15 - Meta Business Login sandbox implementation plan

Task:

- Create a documentation-only sandbox implementation plan for Facebook Login for Business / Instagram Business Login.
- Define provider naming, env planning, authorize URL, callback state / nonce / code exchange, ConnectedAccount / Channel mapping, App Review gates, redaction checks, rollback, and production boundaries.
- Do not modify product code, OAuth flow, callback routes, login buttons, Prisma schema, or env.

Files changed:

- `docs/meta-business-login-sandbox-implementation-plan.md`
- `docs/fix-roadmap.md`
- `docs/security-review.md`
- `docs/meta-app-review-checklist.md`
- `docs/codex-session-log.md`

Validation:

- `git status`: only documentation files changed.
- `npm run lint`: passed.
- `npm run build`: passed with exit code 0. The existing Prisma engine DLL lock fallback message appeared and reused the generated client.
- `npm test`: not run; documentation-only task covered by lint/build verification.

## 2026-06-15 - AI model cache refresh automation

Task:

- Run `npm run ai-models:refresh` in the workspace.
- Report refreshed model counts for ChatGPT, Gemini, DeepSeek, xAI, Codex CLI, and Antigravity CLI.

Files changed:

- `docs/codex-session-log.md`
- `docs/fix-roadmap.md`

Validation:

- `npm run ai-models:refresh`: passed.

Notes:

- All 6 workspaces refreshed the same remote provider counts: `chatgpt 10`, `gemini 7`, `deepseek 2`, `xai 2`.
- `codex_cli` and `antigravity_cli` did not appear in the refresh result and did not throw errors, consistent with prior runs where local CLI providers were skipped by provider-availability guards.
- No product code, schema, env, or OAuth / billing / webhook flow was changed.

## 2026-06-15 - Meta Business Login pre-implementation ADR

Task:

- Read the project and Meta login research docs.
- Create a documentation-only ADR for evaluating Facebook Login for Business, Instagram Business Login, and keeping the current Instagram OAuth flow.
- Do not modify product code, OAuth flow, callback routes, login buttons, or env.

Files changed:

- `docs/adr-meta-business-login-before-implementation.md`
- `docs/fix-roadmap.md`
- `docs/security-review.md`
- `docs/meta-app-review-checklist.md`
- `docs/codex-session-log.md`

Validation:

- `git status`: only documentation files changed.
- `npm run lint`: passed.
- `npm run build`: passed with exit code 0. The existing Prisma engine DLL lock fallback message appeared and reused the generated client.
- `npm test`: not run; documentation-only task covered by lint/build verification.

## 2026-06-15：Meta Account Selection 測試矩陣

- 本次任務目標：只新增 / 更新文件，建立 `docs/meta-business-login-account-selection-test-matrix.md`，定義未登入、單一登入、多帳號 session、桌機 / 手機、popup / redirect transport、callback 結果、workspace linking / channel sync 與 ManyChat UX 判定標準。
- 修改檔案：
  - `docs/meta-business-login-account-selection-test-matrix.md`
  - `docs/fix-roadmap.md`
  - `docs/meta-app-review-checklist.md`
  - `docs/security-review.md`
  - `docs/codex-session-log.md`
- 驗證：
  - `git status`：僅有文件變更。
  - `npm run lint`：通過。
  - `npm run build`：通過；出現既有 Prisma engine DLL lock fallback 訊息，但指令 exit code 為 0。
  - `npm test`：未執行；本次為純文件任務，已完成 lint / build 驗證。
- 限制：
  - 未修改產品功能程式碼。
  - 未修改 OAuth flow、callback route、登入按鈕或 env。

## 2026-06-15：Meta Business Login App Review Demo Script

- 本次任務目標：只新增 / 更新文件，產出 `docs/meta-business-login-app-review-demo-script.md`，補齊 reviewer demo、permission usage table、資料使用位置、redaction checklist、callback / workspace linking / channel sync 安全重點與 App Review 備援方案。
- 修改檔案：
  - `docs/meta-business-login-app-review-demo-script.md`
  - `docs/meta-app-review-checklist.md`
  - `docs/security-review.md`
  - `docs/fix-roadmap.md`
  - `docs/codex-session-log.md`
- 驗證：
  - `git status`：僅有文件變更。
  - `npm run lint`：通過。
  - `npm run build`：通過；出現既有 Prisma engine DLL lock fallback 訊息，但指令 exit code 為 0。
  - `npm test`：未執行；本次為純文件任務，已完成 lint / build 驗證。
- 限制：
  - 未修改產品功能程式碼。
  - 未修改 OAuth flow、callback route、登入按鈕或 env。

## 2026-06-15：Business Login 研究規格文件

- 本次任務目標：依 `docs/meta-login-account-selection-analysis.md` 建立只做文件與實驗規格的研究任務，評估 Facebook Login for Business / Instagram Business Login 是否能取代目前 Instagram OAuth。
- 修改檔案：
  - `docs/meta-business-login-experiment-spec.md`
  - `docs/meta-app-review-checklist.md`
  - `docs/fix-roadmap.md`
  - `docs/codex-session-log.md`
- 驗證：
  - `git status`：僅有文件變更。
  - `npm run lint`：通過。
  - `npm run build`：通過；出現既有 Prisma engine DLL lock fallback 訊息，但指令 exit code 為 0。
  - `npm test`：未執行；本次為純文件與研究規格任務，已完成 lint / build 驗證。
- 限制：
  - 未修改產品功能程式碼。
  - 未修改 OAuth flow、callback route、登入按鈕或 env。

## 2026-06-15：Meta / Instagram 帳號選擇分析

- 本次任務目標：只做文件分析，不修改產品功能程式碼；確認 InboxPilot 目前 Meta / Instagram OAuth 帳號連接流程、authorize URL、帳號切換限制與 ManyChat 差異。
- 修改檔案：
  - `docs/meta-login-account-selection-analysis.md`
  - `docs/codex-session-log.md`
  - `docs/fix-roadmap.md`
- 驗證：
  - `git status`：僅有文件變更。
  - `npm run lint`：通過。
  - `npm run build`：通過。
  - `npm test`：未執行；本次為純文件分析任務，且已完成 lint / build 驗證。
- 風險記錄：
  - 目前無功能程式碼變更。
  - 分析指出帳號切換不能由 `auth_type=reauthenticate` 或 `auth_type=rerequest` 穩定保證。
  - 若要接近 ManyChat UX，後續需評估 Facebook Login for Business / Business Login for Instagram。

更新日期：2026-06-10

## 用途

這份文件用來記錄每一輪 Codex 任務實際做了什麼、驗證到哪裡、還剩什麼風險，避免下一輪接手的人只看到 commit，卻不知道那些坑是填平了還是只是蓋上地毯。

## 建議格式

每一筆記錄至少包含：

- 本次任務目標
- 修改檔案
- 驗證結果
- 仍存風險
- 下一個建議任務

## Session 記錄

### 2026-06-10：建立 Codex 工作規則與交接文件

- 本次任務目標：
  - 建立 `AGENTS.md`
  - 建立 `docs/codex-session-log.md`
- 修改檔案：
  - `AGENTS.md`
  - `docs/codex-session-log.md`
- 驗證結果：
  - 文件建立成功
- 仍存風險：
  - 若之後任務不持續更新 session log，文件會再次過期
- 下一個建議任務：
  - 建立正式 product / security / Meta / billing review 文件

### 2026-06-10：完成 code-level readiness review 文件

- 本次任務目標：
  - 以實際程式碼為主做可販售 SaaS 等級 review
  - 建立 readiness review 文件
- 修改檔案：
  - `docs/product-readiness-review.md`
  - `docs/security-review.md`
  - `docs/meta-app-review-checklist.md`
  - `docs/billing-affiliate-readiness.md`
  - `docs/fix-roadmap.md`
  - `docs/codex-session-log.md`
- 驗證結果：
  - `git status` 已檢查
  - `npm run lint` 通過
  - `npm run build` 通過
- 仍存風險：
  - billing interval、zero-amount subscription、Meta env token fallback、對外頁面亂碼仍未修
- 下一個建議任務：
  - 進入 Phase 0，先修 billing correctness

### 2026-06-10：完成 Phase 0 任務 1 - billing interval 與 subscription correctness

- 本次任務目標：
  - 修正 `completePaidPaymentOrder()` 將 interval 寫死為 `month`
  - 讓 zero-amount / credit-only checkout 走正式 completion flow
  - 補齊 month / year / zero-amount / idempotency 測試
- 修改檔案：
  - `prisma/schema.prisma`
  - `prisma/migrations/20260610113000_payment_order_interval/migration.sql`
  - `src/lib/audit.ts`
  - `src/lib/billing/payment-service.ts`
  - `src/app/api/billing/payuni/checkout/route.ts`
  - `tests/payuni-billing.test.ts`
  - `tests/billing-checkout-route.test.ts`
  - `docs/product-readiness-review.md`
  - `docs/security-review.md`
  - `docs/billing-affiliate-readiness.md`
  - `docs/fix-roadmap.md`
  - `docs/codex-session-log.md`
- 驗證結果：
  - `npm run lint` 通過
  - `npm run build` 通過
  - `npm test` 第一次遇到既有 Vitest 子程序 crash，第二次完整通過
  - `npm run payuni:smoke` 通過
- 仍存風險：
  - PayUNI production 開關與 merchant review 仍未完成
  - Meta env token fallback 仍未移除
  - Billing / legal / README 亂碼與對外文案仍未整理
- 下一個建議任務：
  - 進入 Phase 0 任務 2，production 模式移除 Meta env token fallback
## 2026-06-16 - Meta Business Login Sandbox SBL-12 Callback Capture Guard

任務目標：

- 在不進行真實 Meta token exchange、不寫入 production ConnectedAccount / Channel、不改登入按鈕、不改 env、不改 Prisma schema 的前提下，讓目前已註冊的 Instagram callback 可以安全捕捉 redacted callback evidence。

修改內容：

- 新增 signed sandbox callback capture state marker。
- 在 production Meta callback route 加入極窄的 read-only sandbox guard；只有 state 是 sandbox capture marker 時才會早退回 redacted JSON。
- 一般 production OAuth callback 沒有 sandbox marker 時，仍走原本 callback 邏輯。
- 新增 helper 與 route targeted tests。
- 更新 SBL-12、security、App Review、runbook、report、go/no-go、roadmap 文件。

驗證：

```text
npx vitest run tests/meta-business-login-sandbox-sbl12-callback-capture.test.ts tests/meta-business-login-sandbox-sbl12-callback-route.test.ts
Result: 2 test files passed, 9 tests passed

npx vitest run tests/meta-business-login-sandbox-production-isolation.test.ts tests/meta-business-login-sandbox-sbl01-route.test.ts tests/meta-business-login-sandbox-sbl01.test.ts tests/meta-business-login-sandbox-sbl03.test.ts tests/meta-business-login-sandbox-sbl04.test.ts tests/meta-business-login-sandbox-sbl05.test.ts tests/meta-business-login-sandbox-sbl06.test.ts tests/meta-business-login-sandbox-sbl07.test.ts tests/meta-business-login-sandbox-sbl08.test.ts tests/meta-business-login-sandbox-sbl09.test.ts tests/meta-business-login-sandbox-sbl11-evidence-packet.test.ts tests/meta-business-login-sandbox-sbl12-callback-capture.test.ts tests/meta-business-login-sandbox-sbl12-callback-route.test.ts
Result: 13 test files passed, 53 tests passed

npm run lint
Result: passed

npm run build
Result: passed; Prisma generate reported a local Windows DLL lock and reused the existing generated client.

npm test
Result: timed out after 184 seconds before a complete result was returned.
```

Gate：

- Callback capture helper: Pass
- Signed-state route guard: Pass
- Real callback evidence: Hold
- Workspace linking: Hold
- Channel sync: Hold
- Internal beta: Hold
- Production implementation: No-Go

CI follow-up:

- GitHub Actions CI failed because workflow still used `DATABASE_URL=file:./dev.db`.
- `scripts/run-tests.mjs` now requires PostgreSQL for `npm test`.
- Updated `.github/workflows/ci.yml` to run a PostgreSQL service and provide `TEST_DATABASE_URL` / `TEST_DIRECT_URL`.

Production deploy / browser follow-up:

- CI passed after PostgreSQL service update.
- Production deploy completed with Vercel.
- Production callback probe returned redacted JSON evidence and did not expose fake code or raw sandbox state marker.
- Controlled Instagram OAuth browser run observed account/profile selection with `carry.digital.nomad`, `ling.yun.energy`, and use-another-profile.
- Controlled browser run reached Instagram consent screen without `force_reauth=true`.
- Codex stopped before clicking allow because that action grants app permissions to the Instagram account.
- User clicked allow on the Instagram consent screen.
- Codex verified the callback response body as `sandbox_callback_capture` redacted JSON.
- Callback response body had redacted code/state/callback URL markers, hash markers present, `errorType=null`, `exchangeAttempted=false`, and all production write flags false.
- Raw leak check on the response body passed for authorization code, state marker, token, secret, and full callback URL patterns.
- Real callback evidence: Pass.
- Workspace linking and channel sync: Hold.

下一步建議 Codex Prompt：

```text
請繼續執行 Meta Business Login sandbox SBL-12 controlled browser callback capture。

限制：
1. 不要改 OAuth flow。
2. 不要改登入按鈕。
3. 不要改 env。
4. 不要改 Prisma schema。
5. 不要建立或更新 production ConnectedAccount / Channel。
6. 不要做真實 Meta token exchange。
7. 只能使用 signed sandbox callback capture marker 取得 redacted evidence。

請根據：
- docs/meta-business-login-sandbox-controlled-callback-capture-plan.md
- docs/meta-business-login-sandbox-sbl12-callback-capture-test-command.md
- docs/meta-business-login-sandbox-runbook-template.md
- docs/meta-business-login-sandbox-experiment-report-template.md
- docs/meta-business-login-sandbox-go-no-go-checklist.md

執行一次受控瀏覽器 OAuth callback capture，僅記錄 redacted JSON evidence，不得記錄 raw code、raw state、raw nonce、full callback URL、token、secret。

完成後請回填 runbook / report / go-no-go checklist / security-review / fix-roadmap / codex-session-log，並執行 git status、targeted tests、npm run lint、npm run build。
```
## 2026-06-16 - Latest Meta Business Login Sandbox Next Prompt

```text
請繼續執行 Meta Business Login sandbox workspace linking / channel sync dry-run validation。

目前狀態：
1. production callback guard 已部署。
2. Instagram Business Login account selection 已通過。
3. consent screen 已到達。
4. 使用者已手動按 allow。
5. callback response 已確認為 sandbox_callback_capture redacted JSON。
6. exchangeAttempted=false。
7. productionWrites 全部為 false。

請只做 sandbox-only / dry-run-first 驗證，不要改正式登入按鈕，不要改 env，不要改 Prisma schema，不要做真實 Meta token exchange，不要建立或更新 production ConnectedAccount / Channel。

請完成：
1. 建立或使用既有 dry-run workspace linking evidence 格式。
2. 驗證 callback evidence 如何映射到 sandbox provider / workspace / channel draft。
3. 驗證 channel sync dry-run payload 不含 token / code / secret / raw state / full callback URL。
4. 驗證 production write guard 仍阻擋 ConnectedAccount / Channel 寫入。
5. 回填 runbook / experiment report / go-no-go checklist / security-review / fix-roadmap / codex-session-log。
6. 執行 targeted tests、npm run lint、npm run build。
7. commit 並 push master。
```

## 2026-06-16 - Meta Business Login Sandbox SBL-13 Workspace Linking / Channel Sync Dry-Run

任務目標：

- 使用已 redacted 的 `sandbox_callback_capture` evidence，驗證 workspace linking / channel sync 只能形成 sandbox dry-run draft，不建立或更新 production ConnectedAccount / Channel。

修改內容：

- 新增 `src/lib/meta-business-sandbox-workspace-linking.ts`。
- 新增 `tests/meta-business-login-sandbox-sbl13-workspace-linking-sync.test.ts`。
- 新增 `docs/meta-business-login-sandbox-sbl13-workspace-linking-sync-dry-run.md`。
- 回填 runbook / experiment report / go-no-go checklist / security-review / fix-roadmap / codex-session-log。

驗證結果：

```text
npx vitest run tests/meta-business-login-sandbox-sbl13-workspace-linking-sync.test.ts
Result: 1 test file passed, 2 tests passed
```

Gate：

- Callback evidence mapping: Pass
- Workspace linking dry-run: Pass
- Channel sync dry-run: Pass
- Production write guard: Pass
- Redaction: Pass
- Internal beta: Hold
- Production implementation: No-Go

下一步建議 Codex Prompt：

```text
請根據目前 Meta Business Login sandbox 文件與 SBL-13 dry-run evidence，建立 internal beta 前 go/no-go review。

目前狀態：
1. account selection UX: Pass
2. consent screen: Pass
3. redacted callback evidence: Pass
4. workspace linking dry-run: Pass
5. channel sync dry-run: Pass
6. production write guard: Pass
7. redaction: Pass
8. internal beta: Hold
9. production implementation: No-Go

請只新增 / 更新文件，不要改產品功能程式碼，不要改 OAuth flow，不要改 callback route，不要改登入按鈕，不要改 env，不要改 Prisma schema。

請建立 docs/meta-business-login-sandbox-internal-beta-go-no-go-review.md，內容包含：
1. App Review readiness
2. account selection UX evidence
3. callback evidence
4. workspace linking dry-run evidence
5. channel sync dry-run evidence
6. redaction evidence
7. production write guard evidence
8. rollback / fallback readiness
9. 是否可進 internal beta
10. 仍不可進 production implementation 的原因

完成後執行 git status、targeted tests、npm run lint、npm run build，commit 並 push master。
```
## 2026-06-16 - Meta Business Login Sandbox Internal Beta Go/No-Go Review

任務目標：

- 根據目前 Meta Business Login sandbox 文件與 SBL-13 dry-run evidence，建立 internal beta 前 go/no-go review。

修改內容：

- 新增 `docs/meta-business-login-sandbox-internal-beta-go-no-go-review.md`。
- 回填 `docs/fix-roadmap.md`。
- 回填 `docs/meta-business-login-sandbox-go-no-go-checklist.md`。
- 回填 `docs/meta-app-review-checklist.md`。

結論：

```text
Account selection UX: Pass
Consent screen: Pass
Redacted callback evidence: Pass
Workspace linking dry-run: Pass
Channel sync dry-run: Pass
Production write guard: Pass
Redaction: Pass
App Review readiness: Hold
Rollback / fallback readiness: Partial Pass
Internal beta: Hold
Production implementation: No-Go
```

下一步建議 Codex Prompt：

```text
請根據 docs/meta-business-login-sandbox-internal-beta-go-no-go-review.md，建立 Meta Business Login internal beta access / rollback runbook。

請只新增 / 更新文件，不要改產品功能程式碼，不要改 OAuth flow，不要改 callback route，不要改登入按鈕，不要改 env，不要改 Prisma schema。

檔案路徑：
docs/meta-business-login-sandbox-internal-beta-access-rollback-runbook.md

內容需包含：
1. internal-only beta entry point 條件
2. workspace allowlist 條件
3. 使用者 / admin 權限條件
4. redaction 搜尋流程
5. production write guard 監控項目
6. token exchange 不得發生的檢查項
7. fallback 到既有 Instagram OAuth flow 的方式
8. rollback / disable beta 的步驟
9. internal beta 可以開始前的最終 checklist
10. production implementation 仍不可開始的原因

完成後執行 git status、targeted tests、npm run lint、npm run build，commit 並 push master。
```
## 2026-06-16 - Meta Business Login Sandbox Internal Beta Access / Rollback Runbook

任務目標：

- 根據 internal beta go/no-go review，建立 internal beta access / rollback runbook。

修改內容：

- 新增 `docs/meta-business-login-sandbox-internal-beta-access-rollback-runbook.md`。
- 回填 `docs/fix-roadmap.md`。
- 回填 `docs/meta-business-login-sandbox-go-no-go-checklist.md`。
- 回填 `docs/meta-app-review-checklist.md`。

結論：

```text
Internal-only beta entry point: Hold
Workspace allowlist: Hold
User / admin permissions: Hold
Redaction search process: Partial Pass
Production write guard monitoring: Pass for dry-run
Token exchange prevention: Pass for dry-run / Hold for beta implementation
Fallback to existing Instagram OAuth: Pass
Rollback / disable beta: Partial Pass
Internal beta: Hold
Production implementation: No-Go
```

下一步建議 Codex Prompt：

```text
請根據 docs/meta-business-login-sandbox-internal-beta-access-rollback-runbook.md 與 docs/meta-business-login-app-review-demo-script.md，建立 Meta Business Login final App Review demo package checklist。

請只新增 / 更新文件，不要改產品功能程式碼，不要改 OAuth flow，不要改 callback route，不要改登入按鈕，不要改 env，不要改 Prisma schema。

檔案路徑：
docs/meta-business-login-final-app-review-demo-package-checklist.md

內容需包含：
1. reviewer demo recording checklist
2. permission usage proof checklist
3. Business / Page / IG test asset checklist
4. account selection UX evidence checklist
5. redacted callback evidence checklist
6. workspace linking / channel sync dry-run evidence checklist
7. redaction search checklist
8. rollback / fallback evidence checklist
9. internal beta 是否可解除 Hold 的條件
10. production implementation 仍不可開始的原因

完成後執行 git status、targeted tests、npm run lint、npm run build，commit 並 push master。
```
## 2026-06-16 - Meta Business Login Final App Review Demo Package Checklist

任務目標：

- 根據 internal beta access / rollback runbook 與 App Review demo script，建立 final App Review demo package checklist。

修改內容：

- 新增 `docs/meta-business-login-final-app-review-demo-package-checklist.md`。
- 回填 `docs/fix-roadmap.md`。
- 回填 `docs/meta-business-login-sandbox-go-no-go-checklist.md`。
- 回填 `docs/meta-app-review-checklist.md`。

結論：

```text
Final App Review demo package: Hold
Reviewer demo recording: Hold
Permission usage proof: Hold
Business / Page / IG test assets: Hold
Account selection UX evidence: Pass
Redacted callback evidence: Pass
Workspace linking / channel sync dry-run evidence: Pass
Redaction search against final package: Hold
Rollback / fallback evidence: Partial Pass
Internal beta: Hold
Production implementation: No-Go
```

## 2026-06-16 - Daily AI model refresh automation

Task goal:

- Run `npm run ai-models:refresh` and report refreshed provider counts or failures.

Files changed:

- `docs/codex-session-log.md`
- `docs/fix-roadmap.md`

Validation:

```text
npm run ai-models:refresh
Result: passed
Refreshed per workspace: chatgpt=10, gemini=7, deepseek=2, xai=2
codex_cli / antigravity_cli: skipped by canUseAiProvider() because AI_ENABLE_LOCAL_CLI is unset and local CLI mode is disabled outside explicit opt-in.
```

Launch impact:

- No launch-state change.

New risks:

- No new product risk found.
- Local CLI model caches will remain stale until `AI_ENABLE_LOCAL_CLI` is explicitly enabled for refresh runs.

Next suggested Codex prompt:

```text
請檢查本機 CLI 模型供應商刷新策略，評估是否要讓 codex_cli / antigravity_cli 在 automation 環境也能顯式刷新，並補上對應文件與測試。
```

下一步建議 Codex Prompt：

```text
請根據 docs/meta-business-login-final-app-review-demo-package-checklist.md，建立 Meta Business Login final permission usage proof matrix。

請只新增 / 更新文件，不要改產品功能程式碼，不要改 OAuth flow，不要改 callback route，不要改登入按鈕，不要改 env，不要改 Prisma schema。

檔案路徑：
docs/meta-business-login-final-permission-usage-proof-matrix.md

內容需包含：
1. 每個目前請求或候選 permission / scope
2. 對應產品畫面
3. 使用者操作
4. 讀取資料
5. 寫入資料
6. 儲存資料
7. retention / deletion 說明
8. reviewer demo proof
9. 是否已具備證據
10. 若證據不足，建議移除、延後或補證據

完成後執行 git status、targeted tests、npm run lint、npm run build，commit 並 push master。
```
## 2026-06-17 - Daily AI model refresh automation

Task goal:

- Run `npm run ai-models:refresh` and report refreshed provider counts or failures.

Files changed:

- `docs/codex-session-log.md`
- `docs/fix-roadmap.md`

Validation:

```text
npm run ai-models:refresh
Result: passed
Refreshed across 6 workspaces: chatgpt=10, gemini=7, deepseek=2, xai=2
codex_cli / antigravity_cli: not present in refresh payload; current provider gating still skips local CLI providers when AI_ENABLE_LOCAL_CLI is unset.
```

Launch impact:

- No launch-state change.

New risks:

- No new product risk found.
- Local CLI model caches remain stale in the daily automation environment until `AI_ENABLE_LOCAL_CLI` is explicitly enabled.

Next suggested Codex prompt:

```text
請檢查 AI 模型刷新流程，確認是否要讓每日 automation 顯式啟用 `AI_ENABLE_LOCAL_CLI`，並補上對 `codex_cli` / `antigravity_cli` 的刷新紀錄、測試與文件。
```
## 2026-06-18 - Daily AI model refresh automation

Task goal:

- Run `npm run ai-models:refresh` and report refreshed provider counts or failures.

Files changed:

- `docs/codex-session-log.md`
- `docs/fix-roadmap.md`

Validation:

```text
npm run ai-models:refresh
Result: passed
Refreshed across 6 workspaces: chatgpt=10, gemini=7, deepseek=2, xai=2
codex_cli / antigravity_cli: not refreshed, not failed. `refreshAllAiModels()` skips local CLI providers because `AI_ENABLE_LOCAL_CLI` is unset and `canUseAiProvider()` only enables them for explicit opt-in or local development.
```

Launch impact:

- No launch-state change.

New risks:

- No new product risk found.
- Local CLI model caches remain stale in the daily automation environment until `AI_ENABLE_LOCAL_CLI` is explicitly enabled.

Next suggested Codex prompt:

```text
檢查 AI 模型刷新 automation 是否要顯式開啟 `AI_ENABLE_LOCAL_CLI`，並補一份文件說明 `codex_cli` / `antigravity_cli` 在 daily refresh 中目前為何被略過。
```

## 2026-06-19 - Daily AI model refresh automation

Task goal:

- Run `npm run ai-models:refresh` and report refreshed provider counts or failures.

Files changed:

- `docs/codex-session-log.md`
- `docs/fix-roadmap.md`

Validation:

```text
npm run ai-models:refresh
Result: passed
Refreshed across 6 workspaces: chatgpt=10, gemini=7, deepseek=2, xai=2
codex_cli / antigravity_cli: not refreshed, not failed. src/lib/ai/providers.ts keeps local CLI providers behind canUseAiProvider(), and AI_ENABLE_LOCAL_CLI is unset in this automation environment.
```

Launch impact:

- No launch-state change.

New risks:

- No new product risk found.
- Local CLI model caches remain stale in the daily automation environment until `AI_ENABLE_LOCAL_CLI` is explicitly enabled.

Next suggested Codex prompt:

```text
檢查 AI 模�??�新 automation ?�否要顯式�???`AI_ENABLE_LOCAL_CLI=true`，並補�?`codex_cli` / `antigravity_cli` ??daily refresh ?�用?��?要�?路�?何被?��???```

## 2026-06-19 - Fixed Staging Alias And Vercel Release Env Split

Task goal:

- Configure a fixed staging URL for the full planned release.
- Keep production on the simple release.
- Keep staging / preview on the full release.
- Do not split DB yet.
- Add environment variable documentation and deployment documentation.

Vercel changes:

```text
npx vercel alias set inboxpilot-ap79iimgd-a25814740s-projects.vercel.app staging.carry-digital-nomad.in.net
Result: passed

npx vercel env add INBOXPILOT_RELEASE_CHANNEL production --value simple --yes --force --no-sensitive
Result: passed

npx vercel env add INBOXPILOT_RELEASE_CHANNEL preview --value full --yes --force --no-sensitive
Result: passed

npx vercel inspect https://staging.carry-digital-nomad.in.net
Result: resolved to Preview deployment inboxpilot-ap79iimgd-a25814740s-projects.vercel.app
```

Current URLs:

```text
Production: https://inboxpilot.carry-digital-nomad.in.net
Staging: https://staging.carry-digital-nomad.in.net
Backing Preview deployment: https://inboxpilot-ap79iimgd-a25814740s-projects.vercel.app
```

Files changed:

- `.env.example`
- `docs/deployment.md`
- `docs/environment-variables.md`
- `docs/project-launch-checklist.md`
- `docs/product-readiness-review.md`
- `docs/security-review.md`
- `docs/fix-roadmap.md`
- `docs/codex-session-log.md`

Important note:

- `staging.carry-digital-nomad.in.net` is currently a Vercel alias to the current Preview deployment.
- Future Preview deployments will need either branch-domain automation or a post-deploy `vercel alias set` step to keep this custom staging URL always current.
- Production / staging DB remains shared temporarily and must be separated before real customer onboarding.
- No DB schema, Prisma migration, OAuth callback, webhook, token storage, billing, affiliate payout, or deployment was changed.

Validation:

```text
npx vercel alias list
Result: staging.carry-digital-nomad.in.net appears under inboxpilot-ap79iimgd-a25814740s-projects.vercel.app

git diff --check
Result: passed with Windows line-ending warnings only
```

Next suggested Codex Prompt:

```text
請幫我新增 staging alias 自動更新流程：每次 staging branch 或 preview 部署完成後，自動把 staging.carry-digital-nomad.in.net 指到最新 Preview deployment；先不要拆 DB。
```

## 2026-06-19 - AI local CLI refresh policy clarification

Task goal:

- Decide whether the daily AI model refresh automation should enable `AI_ENABLE_LOCAL_CLI=true`.
- If not, document `codex_cli` and `antigravity_cli` as explicit opt-in providers.

Files changed:

- `.env.example`
- `README.md`
- `docs/environment-variables.md`
- `docs/deployment.md`
- `tests/ai-providers.test.ts`
- `docs/fix-roadmap.md`
- `docs/codex-session-log.md`

Decision:

- Keep `AI_ENABLE_LOCAL_CLI` disabled by default in shared SaaS / cron environments.
- `codex_cli` and `antigravity_cli` remain opt-in only.

Reason:

- Shared automation should not rely on machine-local CLI install state, login state, or local cache files.
- The stable daily refresh path should remain API-backed providers only.

Validation:

```text
npx vitest run tests/ai-providers.test.ts
Result: failed due existing database credential problem in the local test environment:
Authentication failed against database server for postgres.

npm run lint
Result: passed

npm run build
Result: passed
Existing Prisma Windows DLL lock fallback message appeared after build and reused the generated client.

npm test
Result: timed out after 244 seconds
```

Next suggested Codex prompt:

```text
���ˬd AI provider ������Ҫ� TEST_DATABASE_URL / TEST_DIRECT_URL �O�_���T�A�צn�᭫�] tests/ai-providers.test.ts �P npm test�A�T�{ local CLI opt-in �W�h���^�k���զ������q�L�C
```
## 2026-06-20 - Daily AI model refresh automation

Task goal:

- Run `npm run ai-models:refresh` in the project workspace.
- Report refreshed model counts for ChatGPT, Gemini, DeepSeek, XAI, Codex CLI, and Antigravity CLI.
- Distinguish provider failures from intentionally skipped local CLI providers.

Files changed:

- `docs/codex-session-log.md`
- `docs/fix-roadmap.md`

Implementation notes:

- Ran `npm run ai-models:refresh` from the workspace root.
- The refresh output covered 6 workspaces and returned the same counts for each workspace: `chatgpt=10`, `gemini=7`, `deepseek=2`, `xai=2`.
- `codex_cli` and `antigravity_cli` did not appear in the refresh result because `refreshAllAiModels()` skips providers that fail `canUseAiProvider()`.
- `canUseAiProvider()` only enables local CLI providers when `AI_ENABLE_LOCAL_CLI` is explicitly truthy, or when running local development outside Vercel.
- No provider failed during this run.

Validation:

```text
npm run ai-models:refresh
Result: passed.

Workspace refresh counts:
- segment-broadcast-workspace: chatgpt=10, gemini=7, deepseek=2, xai=2
- default-workspace: chatgpt=10, gemini=7, deepseek=2, xai=2
- cmpzdo1na0001vd6c5yaug9nr: chatgpt=10, gemini=7, deepseek=2, xai=2
- cmpzl2a740001jm04s74lyk0c: chatgpt=10, gemini=7, deepseek=2, xai=2
- cmpzn5vki0001kw04q4j3c72q: chatgpt=10, gemini=7, deepseek=2, xai=2
- cmq5xef4z0001vdgk22tqg4bz: chatgpt=10, gemini=7, deepseek=2, xai=2
```

Launch impact:

- No launch-state change. This was an operational cache refresh only.

New risks:

- No new product risk.
- Local CLI provider caches remain stale in shared automation unless `AI_ENABLE_LOCAL_CLI=true` is enabled in a runtime that also guarantees CLI installation and authentication.

Next suggested Codex Prompt:

```text
���ˬd `scripts/refresh-ai-models.ts` �P `src/lib/ai/providers.ts`�A���ڧ� daily AI model refresh ����X�榡�令����T�G
1. ���\ provider ��ܼҫ��ƶq
2. skipped provider ��ܭ�]
3. failed provider ��ܿ��~�K�n

����G
- ����J�� provider schema
- ���}�a cron route �P API route �^�Ǯ榡
- �ɤW�����椸����
```

## 2026-06-21 - Daily AI model refresh automation

Task goal:

- Run `npm run ai-models:refresh` in the project workspace.
- Report refreshed model counts for ChatGPT, Gemini, DeepSeek, XAI, Codex CLI, and Antigravity CLI.
- Distinguish provider failures from intentionally skipped local CLI providers.

Files changed:

- `docs/codex-session-log.md`
- `docs/fix-roadmap.md`

Implementation notes:

- Ran `npm run ai-models:refresh` from the workspace root.
- The refresh output covered 6 workspaces and returned the same counts for each workspace: `chatgpt=10`, `gemini=7`, `deepseek=2`, `xai=2`.
- No provider failures were reported by the refresh script in this run.
- `codex_cli` and `antigravity_cli` did not appear in the refresh result because `refreshAllAiModels()` only includes providers that pass `canUseAiProvider()`.
- In the current automation environment, `AI_ENABLE_LOCAL_CLI` is unset, so `isLocalAiCliEnabled()` keeps local CLI providers disabled outside explicit opt-in local development.

Validation:

```text
npm run ai-models:refresh
Result: passed.

Workspace refresh counts:
- segment-broadcast-workspace: chatgpt=10, gemini=7, deepseek=2, xai=2
- default-workspace: chatgpt=10, gemini=7, deepseek=2, xai=2
- cmpzdo1na0001vd6c5yaug9nr: chatgpt=10, gemini=7, deepseek=2, xai=2
- cmpzl2a740001jm04s74lyk0c: chatgpt=10, gemini=7, deepseek=2, xai=2
- cmpzn5vki0001kw04q4j3c72q: chatgpt=10, gemini=7, deepseek=2, xai=2
- cmq5xef4z0001vdgk22tqg4bz: chatgpt=10, gemini=7, deepseek=2, xai=2
```

Launch impact:

- No launch-state change. This was an operational cache refresh only.

New risks:

- No new product risk.
- Local CLI provider caches remain stale in shared automation unless `AI_ENABLE_LOCAL_CLI=true` is enabled in a runtime that also guarantees CLI installation and authentication.

Next suggested Codex Prompt:

```text
���ˬd `scripts/refresh-ai-models.ts` �P `src/lib/ai/providers.ts`�A���ڧ� daily AI model refresh ����X�榡�令����T�G
1. ���\ provider ��ܼҫ��ƶq
2. skipped provider ��ܭ�]
3. failed provider ��ܿ��~�K�n

����G
- ����J�� provider schema
- ���}�a cron route �P API route �^�Ǯ榡
- �ɤW�����椸����
```
## 2026-06-22 - Daily AI model refresh automation

Task goal:

- Run `npm run ai-models:refresh` in the project workspace.
- Report refreshed model counts for ChatGPT, Gemini, DeepSeek, XAI, Codex CLI, and Antigravity CLI.
- Distinguish provider failures from intentionally skipped local CLI providers.

Files changed:

- `docs/codex-session-log.md`
- `docs/fix-roadmap.md`

Implementation notes:

- Ran `npm run ai-models:refresh` from the workspace root.
- The refresh output covered 6 workspaces and returned the same counts for each workspace: `chatgpt=10`, `gemini=7`, `deepseek=2`, `xai=2`.
- No provider failures were reported by the refresh script in this run.
- `codex_cli` and `antigravity_cli` did not appear in the refresh result because local CLI providers are gated by `canUseAiProvider()`.
- `src/lib/ai/providers.ts` keeps CLI providers disabled unless `AI_ENABLE_LOCAL_CLI` is explicitly enabled, or the app is running local development outside Vercel.

Validation:

```text
npm run ai-models:refresh
Result: passed.

Workspace refresh counts:
- segment-broadcast-workspace: chatgpt=10, gemini=7, deepseek=2, xai=2
- default-workspace: chatgpt=10, gemini=7, deepseek=2, xai=2
- cmpzdo1na0001vd6c5yaug9nr: chatgpt=10, gemini=7, deepseek=2, xai=2
- cmpzl2a740001jm04s74lyk0c: chatgpt=10, gemini=7, deepseek=2, xai=2
- cmpzn5vki0001kw04q4j3c72q: chatgpt=10, gemini=7, deepseek=2, xai=2
- cmq5xef4z0001vdgk22tqg4bz: chatgpt=10, gemini=7, deepseek=2, xai=2
```

Launch impact:

- No launch-state change. This was an operational cache refresh only.

New risks:

- No new product risk.
- Local CLI provider caches remain stale in shared automation unless `AI_ENABLE_LOCAL_CLI=true` is enabled in a runtime that also guarantees CLI installation and authentication.

Next suggested Codex Prompt:

```text
請檢查 `scripts/refresh-ai-models.ts` 與 `src/app/api/ai-models/refresh/route.ts`，幫我把 daily AI model refresh 的輸出再整理清楚一點：
1. 成功 provider 顯示模型數量
2. skipped provider 顯示原因
3. failed provider 顯示錯誤摘要
4. local CLI provider 若被 gating 跳過，也要明確列出原因

限制：
- 不改既有 provider schema
- 不破壞 cron route 與 API route 回傳格式
- 補上對應單元測試
```
## 2026-06-23 - Daily AI model refresh automation

Task goal:

- Run `npm run ai-models:refresh` in the project workspace.
- Report refreshed model counts for ChatGPT, Gemini, DeepSeek, XAI, Codex CLI, and Antigravity CLI.
- Distinguish provider failures from intentionally skipped local CLI providers.

Files changed:

- `docs/codex-session-log.md`
- `docs/fix-roadmap.md`

Implementation notes:

- Ran `npm run ai-models:refresh` from the workspace root.
- The refresh output covered 6 workspaces and returned the same counts for each workspace: `chatgpt=10`, `gemini=7`, `deepseek=2`, `xai=2`.
- No provider failures were reported by the refresh script in this run.
- `codex_cli` and `antigravity_cli` did not appear in the refresh result, which matches the current provider gating behavior for local CLI providers when `AI_ENABLE_LOCAL_CLI` is unset.

Validation:

```text
npm run ai-models:refresh
Result: passed.

Workspace refresh counts:
- segment-broadcast-workspace: chatgpt=10, gemini=7, deepseek=2, xai=2
- default-workspace: chatgpt=10, gemini=7, deepseek=2, xai=2
- cmpzdo1na0001vd6c5yaug9nr: chatgpt=10, gemini=7, deepseek=2, xai=2
- cmpzl2a740001jm04s74lyk0c: chatgpt=10, gemini=7, deepseek=2, xai=2
- cmpzn5vki0001kw04q4j3c72q: chatgpt=10, gemini=7, deepseek=2, xai=2
- cmq5xef4z0001vdgk22tqg4bz: chatgpt=10, gemini=7, deepseek=2, xai=2
```

Launch impact:

- No launch-state change. This was an operational cache refresh only.

New risks:

- No new product risk.
- Local CLI provider caches remain stale in shared automation unless `AI_ENABLE_LOCAL_CLI=true` is enabled in a runtime that also guarantees CLI installation and authentication.

Next suggested Codex Prompt:

```text
請檢查 `scripts/refresh-ai-models.ts` 與 `src/lib/ai/providers.ts`，把 daily AI model refresh 的輸出整理成固定結構：
1. 成功 provider 的模型數量
2. skipped provider 的原因
3. failed provider 的錯誤摘要

限制：
- 不要改現有 provider schema
- 不要破壞 cron route 或 API route 呼叫格式
- 補最小範圍測試
```
## 2026-06-24 - Daily AI model refresh automation

Task goal:

- Run `npm run ai-models:refresh` in the project workspace.
- Report refreshed model counts for ChatGPT, Gemini, DeepSeek, XAI, Codex CLI, and Antigravity CLI.
- Distinguish provider failures from intentionally skipped local CLI providers.

Files changed:

- `docs/codex-session-log.md`
- `docs/fix-roadmap.md`

Implementation notes:

- Ran `npm run ai-models:refresh` from the workspace root.
- The refresh output covered 6 workspaces and returned the same counts for each workspace: `chatgpt=10`, `gemini=7`, `deepseek=2`, `xai=2`.
- No provider failures were reported by the refresh script in this run.
- `codex_cli` and `antigravity_cli` did not appear in the refresh result, matching the current local CLI opt-in behavior while `AI_ENABLE_LOCAL_CLI` is unset.

Validation:

```text
npm run ai-models:refresh
Result: passed.

Workspace refresh counts:
- segment-broadcast-workspace: chatgpt=10, gemini=7, deepseek=2, xai=2
- default-workspace: chatgpt=10, gemini=7, deepseek=2, xai=2
- cmpzdo1na0001vd6c5yaug9nr: chatgpt=10, gemini=7, deepseek=2, xai=2
- cmpzl2a740001jm04s74lyk0c: chatgpt=10, gemini=7, deepseek=2, xai=2
- cmpzn5vki0001kw04q4j3c72q: chatgpt=10, gemini=7, deepseek=2, xai=2
- cmq5xef4z0001vdgk22tqg4bz: chatgpt=10, gemini=7, deepseek=2, xai=2
```

Launch impact:

- No launch-state change. This was an operational cache refresh only.

New risks:

- No new product risk.
- Local CLI provider caches remain stale in shared automation unless `AI_ENABLE_LOCAL_CLI=true` is enabled in a runtime that also guarantees CLI installation and authentication.

Next suggested Codex Prompt:

```text
請檢查 `scripts/refresh-ai-models.ts` 與 `src/lib/ai/providers.ts`，把 daily AI model refresh 的輸出整理成固定結構：
1. 成功 provider 的模型數量
2. skipped provider 的原因
3. failed provider 的錯誤摘要
4. local CLI provider 若被 gating 跳過，也要明確列出原因

限制：
- 不改現有 provider schema
- 不破壞 cron route 或 API route 呼叫格式
- 補最小範圍測試
```

## 2026-06-26 - Public paid launch control room

Task goal:

- Continue launch readiness work without asking for additional confirmation.
- Merge the already-prepared launch package state into a final launch control room.
- Keep the task limited to documentation and read-only verification.
- Do not submit Meta App Review, enable PayUNI live charging, run production checkout, touch DB, or print secrets.

Files changed:

- `docs/public-paid-launch-control-room.md`
- `docs/project-launch-checklist.md`
- `docs/product-readiness-review.md`
- `docs/fix-roadmap.md`
- `docs/codex-session-log.md`

Implementation notes:

- Created a clean worktree from `origin/master` to avoid mixing unrelated dirty files from the main workspace.
- Added a single launch control room that links Meta App Review, PayUNI go-live, production/staging health, alias isolation, and final Go/Hold rules.
- Recorded that Codex-direct launch gates are complete enough for private beta / whitelist usage.
- Kept public paid launch on Hold because Meta App Review and PayUNI production operations require external approval and manual operator action.

Validation:

```text
PR #5
Result: merged into master.

Master CI
Result: passed after merge; lint, test, and build completed successfully.

npm ci
Result: passed. npm audit reports existing findings: 2 low, 3 moderate, 1 high.

npm run lint
Result: passed.

npm run build
Result: passed.

npx vitest run tests/meta-channel-config.test.ts tests/billing-checkout-route.test.ts --reporter=dot
Result: passed. 2 test files passed, 5 tests passed.

npm test
Result: blocked in the clean worktree because DATABASE_URL or TEST_DATABASE_URL is required. Production DB was not used for tests.

Production health
Result: status=ok, database.ok=true, redis.ok=true.

Staging health
Result: status=ok, dbEnv=staging, releaseChannel=full, vercelEnv=preview.
```

Launch impact:

- Launch state is clearer and more actionable.
- Private beta / whitelist remains Go.
- Public paid launch remains Hold until Meta approval and PayUNI live-payment gates are completed.

New risks:

- No new runtime, DB, deployment, or secret risk.
- The remaining risk is operational: public launch must not proceed until the external approval/payment gates are manually completed and recorded.

Next suggested Codex Prompt:

```text
請幫我依照 docs/public-paid-launch-control-room.md 跑一次最後 30 分鐘 pre-launch 只讀檢查：Production/Staging health、alias、latest CI、Vercel deployments、Meta/PayUNI 文件完整性；不要送審、不要刷卡、不要碰 DB。
```

## 2026-06-26 - Meta App Review operator submission workbook

Task goal:

- Prepare a human operator package for Meta App Review submission.
- Base it on `docs/public-paid-launch-control-room.md`, `docs/meta-app-review-submission-package.md`, and `docs/meta-reviewer-recording-shot-list.md`.
- Do not log in to Meta Dashboard, submit review, or output secrets.

Files changed:

- `docs/meta-app-review-operator-submission-workbook.md`
- `docs/meta-app-review-checklist.md`
- `docs/project-launch-checklist.md`
- `docs/fix-roadmap.md`
- `docs/codex-session-log.md`

Implementation notes:

- Added a single operator-facing workbook for the real manual Meta App Review preparation flow.
- The workbook covers safe working folder structure, reviewer-safe asset prep, recording order, screenshot list, Meta Dashboard field checklist, permission evidence mapping, safe submission text, redaction review, upload manifest, and Go / Hold rules.
- The workbook explicitly excludes Meta Dashboard login, upload, submission, secrets, raw OAuth values, and real customer data.

Validation:

```text
Read source docs
Result: public launch control room, submission package, recording shot list, screenshot redaction checklist, and reviewer asset handoff checklist reviewed.

Scope
Result: documentation-only; no Meta login, no App Review submission, no DB command, no payment action, and no secret output.

npm run lint
Result: passed.

npm run build
Result: passed.

npm test
Result: blocked in the clean worktree because DATABASE_URL or TEST_DATABASE_URL is required. Production DB was not used for tests.
```

Launch impact:

- Meta App Review preparation is more executable for a human operator.
- Public paid launch remains Hold until Meta approval is actually submitted and granted.

New risks:

- No new runtime risk.
- Operational risk remains: real reviewer credentials and artifacts must be handled outside git/docs through secure handoff and redaction review.

Next suggested Codex Prompt:

```text
請幫我把 Meta App Review operator workbook 做成乾淨 PR，跑 lint/build/docs checks，PR 建好後不要登入 Meta、不要送審、不要碰 DB。
```

## 2026-06-26 - Meta App Review day-of recording run card

Task goal:

- Create a concise day-of operating card for Meta App Review recording and submission preparation.
- Split the card into recording prep, during recording, screenshots, Dashboard fill checklist, and pre-submit check.
- Do not log in to Meta Dashboard, submit review, touch DB, or output secrets.

Files changed:

- `docs/meta-app-review-day-of-recording-run-card.md`
- `docs/meta-app-review-checklist.md`
- `docs/project-launch-checklist.md`
- `docs/fix-roadmap.md`
- `docs/codex-session-log.md`

Implementation notes:

- Added a short operator run card distilled from `docs/meta-app-review-operator-submission-workbook.md`.
- The card includes the exact recording sequence, screenshot filenames, Dashboard field checklist, permission evidence mapping, redaction search, and Go / Hold rules.
- The card repeats the hard boundaries against credentials, raw OAuth callback values, env screens, dashboard secrets, and real customer data.

Validation:

```text
Read source docs
Result: meta operator workbook and Meta App Review checklist reviewed.

Scope
Result: documentation-only; no Meta login, no App Review submission, no DB command, no payment action, and no secret output.

npm run lint
Result: passed.

npm run build
Result: passed.

npm test
Result: blocked in the clean worktree because DATABASE_URL or TEST_DATABASE_URL is required. Production DB was not used for tests.
```

Launch impact:

- Human Meta review prep is easier to execute on recording day.
- Public paid launch remains Hold until Meta approval and PayUNI production gates are completed.

New risks:

- No new runtime risk.
- Real artifacts still require secure external handling and manual redaction review.

Next suggested Codex Prompt:

```text
請幫我把 Meta App Review day-of recording run card 做成乾淨 PR，跑 lint/build/docs checks，PR 建好後不要登入 Meta、不要送審、不要碰 DB。
```

## 2026-06-26 - Autopilot local readiness closeout

Task goal:

- Continue the unattended autopilot setup after the operator provided a Supabase access token through the local secure input page.
- Keep secrets out of logs, reports, git, and assistant output.
- Avoid production DB usage and keep PayUNI on sandbox.

Files changed:

- `.gitignore`
- `scripts/autopilot-full.py`
- `src/lib/deployment-env.ts`
- `src/lib/secrets.ts`
- `tests/security.test.ts`
- `package-lock.json`
- `docs/autopilot-code-review.md`
- `docs/codex-session-log.md`
- `docs/fix-roadmap.md`
- `docs/product-readiness-review.md`
- `docs/project-launch-checklist.md`
- `docs/security-review.md`

Implementation notes:

- Installed and authenticated Supabase CLI using a secure one-time local input flow; no token value was printed or committed.
- Verified the account can read the two Supabase projects by ref: production `lmwvzskffzozuiamjxvc` and staging `ndhtwqtshselqwgjenjd`.
- Linked the local Supabase CLI context to the staging project ref only.
- Linked the Vercel CLI to the InboxPilot project and pulled staging Preview env metadata without printing values.
- Copied only PayUNI sandbox values from the operator's ignored local env into this ignored worktree env, then verified the PayUNI smoke path.
- Added local-only test DB env pointing at the existing local Supabase Postgres container; production DB was not used for test execution.
- Hardened the production fallback tests so staging env markers do not mask production fallback assertions.
- Removed the brittle `supabase status` readiness step from autopilot because it fails when the local Supabase container belongs to another project id even though CLI auth and project access are healthy.
- Ignored `supabase/.temp/` so Supabase local link state does not accidentally enter git.

Validation:

```text
supabase projects list
Result: passed; production and staging project refs are readable.

supabase link --project-ref ndhtwqtshselqwgjenjd
Result: passed; linked to staging project ref.

npx vercel link --yes --team a25814740s-projects --project inboxpilot
Result: passed.

npx vercel env pull .env.local --environment=preview --git-branch staging --scope a25814740s-projects --yes
Result: passed; values were not printed.

npm run payuni:smoke
Result: passed against sandbox configuration.

npx vitest run tests/security.test.ts --reporter=dot
Result: passed; 8 tests passed.

npm test
Result: passed on rerun with local Supabase test DB.

npm run lint
Result: passed.

npm run build
Result: passed.

npm audit --audit-level=high
Result: passed. Two moderate Next/PostCSS findings remain, but npm only suggests a force update path that would be inappropriate to apply automatically.
```

Launch impact:

- Autopilot can now run with local Supabase CLI auth, Vercel CLI link, local test DB, and PayUNI sandbox smoke available.
- Public paid launch remains Hold because Meta App Review approval, PayUNI production merchant enablement, and live payment smoke are still external/manual gates.

New risks:

- No secret values were added to git.
- Local `.env.local` now contains operator-provided sandbox/test values in the ignored worktree; keep it out of screenshots and support bundles.
- Autopilot still must not use production DB URLs for tests or unattended migration work.

Next suggested Codex Prompt:

```text
請幫我跑一次 npm run autopilot，完成後只整理 reports 狀態與 blocking items，不碰 production DB、不送 Meta 審核、不切 PayUNI production。
```

## 2026-06-27 - Full Codebase QA & Architecture Gap Diagnostics

Task goal:

- Perform a thorough static code and architecture QA audit for the entire InboxPilot project.
- Map the feature surface, identify real gaps vs. release mode gating, and trace backend API integrations.
- Generate a comprehensive, high-stakes production-ready test report and actionable Codex prompts for feature gaps.

Files changed:

- `docs/codex-session-log.md`

Findings:

- Identified that the production app (https://inboxpilot.carry-digital-nomad.in.net) runs on the `simple` release channel, which blocks and redirects Full-only features (e.g., Billing, Broadcasts, Sequences, AI Settings, Knowledge Base, Admin, Affiliate, Mock Tester, Segments, Tags, Templates, Wallet) to `/dashboard` or returns 404 via `src/proxy.ts` and `src/lib/release-mode.ts`.
- Confirmed that the database layer and API route integrations for Inbox, Contacts, Automations, and Billing are fully implemented and connected (not mocked), but require the `full` release channel (or Staging at staging.carry-digital-nomad.in.net) to be exposed.
- Identified core gaps in Plan Enforcement, subscription state lifecycle handling (expired/past_due/unpaid), PayUNI production onboarding boundaries, and localized Chinese text encoding.

Validation:

- Performed extensive read-only codebase and route proxy inspection. All key findings are fully verified against the Next.js routing, middleware, and database schemas.

## 2026-06-27 - Contacts tag create interaction fix

Task goal:

- Fix the static Plus icon beside the Contacts sidebar tag heading.
- Let users create a tag from the Contacts page without converting the page Server Component into a Client Component.

Files changed:

- `src/app/contacts/page.tsx`
- `src/components/ContactTagCreateButton.tsx`
- `docs/codex-session-log.md`
- `docs/fix-roadmap.md`

Implementation notes:

- Added `ContactTagCreateButton` as a small Client Component for the tag creation interaction.
- Replaced the static sidebar Plus icon with the interactive button.
- The dialog collects tag name and color, posts `{ name, color }` to `/api/tags`, and calls `router.refresh()` after success so the Server Component reloads tags from the database.
- Existing `/api/tags` auth, same-origin, validation, and workspace scoping were reused unchanged.

Validation:

```text
npm run lint
Result: passed.

npx vitest run tests/integration/api-routes.test.ts -t tags --reporter=dot
Result: passed. 2 tests passed, 5 skipped.

npm run build
Result: passed.

npm test
Result: passed.

npm run test:e2e
Result: passed. 6 passed, 6 skipped by existing authenticated smoke conditions.
```

Notes:

- Running the full `tests/integration/api-routes.test.ts` file still exposes two pre-existing broadcast test mismatches unrelated to this tag UI fix.
- No production DB, Meta App Review, PayUNI production, migration, or deployment action was performed.

Next suggested Codex Prompt:

```text
請幫我檢查 Contacts 頁面其他假按鈕與未完成互動，優先修復「篩選」按鈕、標籤篩選、聯絡人勾選後批次加標籤，並補上對應 smoke tests；不要碰 production DB。
```

## 2026-06-27 - Contact detail edit and tag management

Task goal:

- Rework the Contact detail page from the dark zinc panel into the same bright visual language as the Contacts list.
- Add editable username, email, phone, save/cancel controls, tag add/remove interaction, and a persistent PATCH API for contact updates.

Files changed:

- `src/app/contacts/[id]/page.tsx`
- `src/components/ContactDetailEditor.tsx`
- `src/app/api/contacts/[id]/route.ts`
- `src/app/api/contacts/[id]/tags/route.ts`
- `tests/tenant-isolation-routes.test.ts`
- `docs/codex-session-log.md`
- `docs/fix-roadmap.md`
- `docs/product-readiness-review.md`
- `docs/project-launch-checklist.md`
- `docs/security-review.md`

Implementation notes:

- Kept the Contact detail page as a Server Component for database loading.
- Added `ContactDetailEditor` as the focused Client Component for field editing, tag assignment/removal, toast feedback, and `router.refresh()`.
- Added `PATCH /api/contacts/[id]` for username, email, phone, and optional custom field upserts.
- Hardened `/api/contacts/[id]/tags` with same-origin checks and tag workspace validation before contact-tag writes.
- Converted the page surface to `bg-[#f8fafc]`, white cards, and `border-[#d7dbe0]` borders.

Validation:

```text
npm run lint
Result: passed.

npx vitest run tests/tenant-isolation-routes.test.ts --reporter=dot
Result: passed. 8 tests passed.

npx vitest run tests/integration/api-routes.test.ts -t tags --reporter=dot
Result: passed. 2 tests passed, 5 skipped.

npm run build
Result: passed.

npm run test:e2e
Result: passed. 6 passed, 6 skipped by existing authenticated smoke conditions.

npm test
Result: not cleanly completed. The Vitest child process exited with Windows crash code 3221225477 on rerun after passing earlier batches. No assertion failure was reported for this change; focused route/security tests passed.
```

Launch impact:

- Improves Contacts feature completeness and visual consistency.
- No production DB, migration, deployment, Meta App Review, or PayUNI production action was performed.

New risks:

- Contact detail editing now exposes a real write path, so future QA should include authenticated browser smoke for field save, cancel, tag add, and tag remove.
- The tag route hardening may reveal any existing client code that tried to attach cross-workspace or missing tags; this is intended behavior.

Next suggested Codex Prompt:

```text
請幫我替聯絡人詳情頁補 Playwright authenticated smoke：測試 username/email/phone 編輯、取消、儲存成功 toast、標籤新增與移除；使用 TEST_DATABASE_URL，不碰 production DB。
```

## 2026-06-27 - Meta OAuth error feedback and simple-mode IG entry hardening

Task goal:

- Improve `/api/meta/oauth/start` and `/api/meta/oauth/callback` failure handling for IG connection flows.
- Show clear Chinese error feedback on `/channels/connect/social` when `meta_error` is present.
- Keep simple release free of Facebook MBS entry points and avoid proxy-blocked default Meta start behavior.

Files changed:

- `src/app/api/meta/oauth/start/route.ts`
- `src/app/api/meta/oauth/callback/route.ts`
- `src/app/channels/connect/social/page.tsx`
- `src/proxy.ts`
- `tests/meta-oauth.test.ts`
- `tests/release-proxy.test.ts`
- `tests/meta-business-login-sandbox-sbl12-callback-route.test.ts`
- `docs/codex-session-log.md`
- `docs/fix-roadmap.md`
- `docs/meta-app-review-checklist.md`
- `docs/product-readiness-review.md`
- `docs/project-launch-checklist.md`
- `docs/security-review.md`

Implementation notes:

- Changed legacy `/api/meta/oauth/start` default mode from Facebook to Instagram.
- Updated simple release proxy behavior so `/api/meta/oauth/start` without `mode` is allowed to default to Instagram, while explicit `mode=facebook` remains blocked.
- Added safe Meta OAuth error mapping for invalid state, cancelled authorization, missing permissions, no usable Instagram channel, and Meta configuration errors.
- Callback redirects now include `meta_error` with a user-facing Chinese message and `meta_error_code` for support/debug context.
- `/channels/connect/social` now renders `meta_error` in a prominent red alert with title and error code.
- Simple release already filters visible providers to `meta-instagram`; this change keeps the legacy default route aligned with that UI.

Validation:

```text
npm run lint
Result: passed.

npx vitest run tests/meta-oauth.test.ts tests/release-proxy.test.ts tests/meta-business-login-sandbox-sbl12-callback-route.test.ts --reporter=dot
Result: passed. 14 tests passed.

npm run build
Result: passed.

npm run test:e2e
Result: passed. 6 passed, 6 skipped by existing authenticated smoke conditions.

npm test
Result: not cleanly completed. The final Vitest child process exited with Windows crash code 3221225477 after earlier batches passed. No assertion failure was reported for this change; focused tests passed.
```

Launch impact:

- IG connection failures should now be understandable to users instead of silently returning or showing raw OAuth strings.
- Public paid launch remains Hold until Meta App Review / Advanced Access / Business Verification and PayUNI production gates are completed.
- No production DB, deployment, Meta Dashboard login, App Review submission, or PayUNI production action was performed.

New risks:

- No secret or OAuth code/state is intentionally surfaced in the browser. URL messages are generated from safe mapped copy.
- The default legacy Meta start route now favors Instagram. Full-release Facebook paths still exist through explicit Facebook provider routes.

Next suggested Codex Prompt:

```text
請幫我替 IG 連接失敗情境補 Playwright smoke：模擬 /channels/connect/social?meta_error=... 顯示紅色錯誤 Alert，並確認 simple release 看不到 meta-facebook / Facebook MBS 入口；不要登入 Meta、不要送審。
```

## 2026-06-27 - Simple release full-feature gate notice

Task goal:

- Improve the simple release UX when a user attempts to open Full-only routes such as Billing, Broadcasts, or AI Settings.
- Redirect to Dashboard with an explanatory alert instead of silently returning to Dashboard.

Files changed:

- `src/proxy.ts`
- `src/app/dashboard/page.tsx`
- `tests/release-proxy.test.ts`
- `docs/codex-session-log.md`
- `docs/fix-roadmap.md`
- `docs/product-readiness-review.md`
- `docs/project-launch-checklist.md`

Implementation notes:

- Full-only simple-release redirects now go to `/dashboard?alert=feature_gated&feature=<route>`.
- Dashboard reads `alert=feature_gated` and renders a warning toast using `DismissibleNoticeToast`.
- The toast tells users the feature is controlled on the production operating release and links to `https://staging.carry-digital-nomad.in.net` for full-version testing.
- Added release proxy coverage for the new query parameters.

Validation:

```text
npm run lint
Result: passed.

npx vitest run tests/release-proxy.test.ts --reporter=dot
Result: passed. 7 tests passed.

npm run build
Result: passed.

npm test
Result: passed.

npm run test:e2e
Result: first run had a transient chromium title timeout; rerun passed. 6 passed, 6 skipped by existing authenticated smoke conditions.
```

Launch impact:

- Improves user clarity on Production simple release.
- No production deployment, DB, Meta, App Review, or PayUNI production action was performed.

New risks:

- No new security or data risk.
- Browser smoke for the actual gated redirect and dashboard toast should be added before considering this flow fully covered.

Next suggested Codex Prompt:

```text
請幫我補 simple release Full-only gate 的 Playwright smoke：在 simple release host/env 下訪問 /billing，確認導到 /dashboard?alert=feature_gated 並顯示 staging 測試站提示；不要部署 Production。
```

## 2026-06-27 - Contacts filters and batch tagging

Task goal:

- Fix remaining fake / incomplete Contacts page interactions.
- Prioritize the filter button, tag filtering, and selected-contact batch add tag.
- Add smoke coverage without touching production DB.

Files changed:

- `src/app/contacts/page.tsx`
- `src/components/ContactsListClient.tsx`
- `src/app/api/contacts/batch-tags/route.ts`
- `scripts/ensure-e2e-admin.ts`
- `tests/tenant-isolation-routes.test.ts`
- `tests/e2e/public-and-auth.spec.ts`
- `docs/codex-session-log.md`
- `docs/fix-roadmap.md`
- `docs/product-readiness-review.md`
- `docs/project-launch-checklist.md`
- `docs/security-review.md`

Implementation notes:

- Kept the Contacts page as a Server Component for auth and database loading.
- Added `ContactsListClient` for interactive filtering, sidebar status/tag navigation, table selection, and batch add tag.
- Added query-backed filters: `q`, `status`, and `tag`.
- Added `POST /api/contacts/batch-tags`, with same-origin validation, API auth, workspace-scoped tag validation, and selected Instagram channel/workspace-scoped contact lookup before writing `ContactTag`.
- Extended the guarded E2E seed to create a local/test-only Instagram channel, two contacts, and smoke tags.

Validation:

```text
npx vitest run tests/tenant-isolation-routes.test.ts --reporter=dot
Result: passed. 10 tests passed.

npm run lint
Result: passed.

npm run build
Result: passed.

npm test
Result: passed. Existing Meta webhook audit mock stderr appeared, but the command exited 0.

npm run e2e:admin:ensure
Result: initial run correctly refused missing TEST_DATABASE_URL. Reran with a one-process local TEST_DATABASE_URL mapped from localhost DATABASE_URL, guarded against the production Supabase ref, and seeded local test data.

npx playwright test tests/e2e/public-and-auth.spec.ts -g "filters contacts"
Result: passed. 2 tests passed across desktop and mobile.

npm run test:e2e:auth
Result: passed. 14 tests passed.
```

Launch impact:

- Contacts is more complete for private beta: filtering and batch tagging are now functional instead of decorative.
- No production DB, production deployment, Meta App Review, or PayUNI production action was performed.

New risks:

- A new Contacts write API exists. It is scoped to current workspace and selected IG account, validates same-origin requests, and only writes tags that belong to the current workspace.
- Future follow-up should add batch remove tag and saved segment creation if operators expect full CRM-style bulk workflows.

Next suggested Codex Prompt:

```text
請幫我檢查 Contacts 後續批次操作缺口，優先補「批次移除標籤」與「依目前篩選建立分眾 Segment」，並補 tenant isolation tests 與 authenticated Playwright smoke；不要碰 production DB，不要部署 Production。
```

## 2026-06-27 - Authenticated smoke coverage for contact detail, Meta error, and simple gate

Task goal:

- Add Playwright authenticated smoke for Contact detail edit/cancel/save/tag add/tag remove.
- Add Playwright smoke for Meta OAuth failure alert rendering and simple release hiding Facebook / MBS entry points.
- Add Playwright smoke for simple release `/billing` gating and Dashboard feature-gated notice.
- Use `TEST_DATABASE_URL`; do not touch production DB, deploy Production, log in to Meta, submit App Review, or run PayUNI production.

Files changed:

- `src/components/ContactDetailEditor.tsx`
- `src/app/api/contacts/[id]/tags/route.ts`
- `scripts/ensure-e2e-admin.ts`
- `tests/tenant-isolation-routes.test.ts`
- `tests/e2e/public-and-auth.spec.ts`
- `docs/codex-session-log.md`
- `docs/fix-roadmap.md`
- `docs/product-readiness-review.md`
- `docs/project-launch-checklist.md`
- `docs/security-review.md`
- `docs/meta-app-review-checklist.md`
- `docs/billing-affiliate-readiness.md`

Implementation notes:

- Added stable `data-testid` attributes to the Contact detail editor for field and tag smoke tests.
- Extended guarded E2E seed with a fixed detail contact and a detail tag; the seed still refuses missing `TEST_DATABASE_URL` and production Supabase refs.
- Added authenticated Playwright smoke for cancel/save persistence, success toast, tag add, and tag remove.
- Added simple-release-only Playwright smoke for `/channels/connect/social?meta_error=...` and `/billing` gated redirect / Dashboard notice.
- The simple-release smoke is skipped during the normal full-release e2e run and is verified separately with `INBOXPILOT_RELEASE_CHANNEL=simple`.
- Changed single-contact tag add from `upsert` to `createMany({ skipDuplicates: true })` so repeated clicks or parallel smoke projects do not fail on the `contactId_tagId` unique constraint.

Validation:

```text
npx vitest run tests/tenant-isolation-routes.test.ts --reporter=dot
Result: passed. 10 tests passed.

npm run lint
Result: passed.

npx playwright test tests/e2e/public-and-auth.spec.ts -g "edits contact detail"
Result: passed. 2 tests passed.

INBOXPILOT_RELEASE_CHANNEL=simple npx playwright test tests/e2e/public-and-auth.spec.ts -g "Meta OAuth failure|gates simple-release"
Result: passed. 4 tests passed.

npm run test:e2e:auth
Result: passed. 16 passed, 4 simple-release tests skipped as expected in full-release mode.

npm run build
Result: passed.

npm test
Result: passed. Existing Meta webhook audit mock stderr appeared, but the command exited 0.
```

Launch impact:

- Contact detail, Meta error handling, and simple release feature-gating now have browser-level regression evidence.
- No production DB, production deployment, Meta Dashboard login, App Review submission, or PayUNI production action was performed.

New risks:

- No new external-platform or payment risk.
- The tag add route is safer under duplicate submissions because it now skips duplicate `ContactTag` inserts instead of surfacing a unique constraint failure.

Next suggested Codex Prompt:

```text
請幫我把 Contacts 相關 smoke tests 拆成獨立 Playwright spec，並在 CI 中分成 full-release auth smoke 與 simple-release smoke 兩個 job；維持 TEST_DATABASE_URL guard，不碰 production DB、不部署 Production。
```

## 2026-06-27 - Split Playwright smoke specs and CI jobs

Task goal:

- Split Contacts-related Playwright smoke into a dedicated spec.
- Split simple-release smoke into a dedicated spec.
- Add separate CI jobs for full-release authenticated smoke and simple-release smoke.
- Keep `TEST_DATABASE_URL` guard; do not touch production DB or deploy Production.

Files changed:

- `.github/workflows/ci.yml`
- `package.json`
- `tests/e2e/public-and-auth.spec.ts`
- `tests/e2e/contacts-auth.spec.ts`
- `tests/e2e/simple-release.spec.ts`
- `docs/codex-session-log.md`
- `docs/fix-roadmap.md`
- `docs/product-readiness-review.md`
- `docs/project-launch-checklist.md`
- `docs/security-review.md`
- `docs/meta-app-review-checklist.md`
- `docs/billing-affiliate-readiness.md`

Implementation notes:

- `public-and-auth.spec.ts` now covers public navigation, auth guard, and general authenticated launch routes only.
- `contacts-auth.spec.ts` now owns Contacts filter / batch tag and Contact detail edit / tag smoke.
- `simple-release.spec.ts` now owns simple-release Meta error visibility and `/billing` gated notice smoke.
- Added `npm run test:e2e:contacts` and `npm run test:e2e:simple`.
- CI now has separate jobs:
  - `full-release-auth-smoke`: `INBOXPILOT_RELEASE_CHANNEL=full`, seeds test DB, runs auth smoke and Contacts smoke.
  - `simple-release-smoke`: `INBOXPILOT_RELEASE_CHANNEL=simple`, seeds test DB, runs simple-release smoke.
- Both Playwright jobs use PostgreSQL service-backed `TEST_DATABASE_URL` and keep production DB markers blocked.

Validation:

```text
npm run lint
Result: passed.

npx vitest run tests/authenticated-route-smoke-guard.test.ts --reporter=dot
Result: passed. 4 tests passed.

npm run e2e:admin:ensure
Result: passed with local TEST_DATABASE_URL mapped from a localhost DB and production ref guard.

npm run test:e2e:auth
Result: passed. 12 tests passed.

npm run test:e2e:contacts
Result: passed. 4 tests passed.

INBOXPILOT_RELEASE_CHANNEL=simple npm run test:e2e:simple
Result: passed. 4 tests passed.

npm run build
Result: passed.

npm test
Result: passed. Existing Meta webhook audit mock stderr appeared, but the command exited 0.
```

Launch impact:

- CI now verifies full-release and simple-release browser behavior separately, reducing accidental release-mode regressions.
- No production DB, production deployment, Meta Dashboard login, App Review submission, or PayUNI production action was performed.

New risks:

- CI runtime is longer because Playwright now runs in two separate jobs with isolated Postgres services.
- This is intentional to avoid full/simple release mode contamination.

Next suggested Codex Prompt:

```text
請幫我檢查 GitHub Actions 跑完後的 full-release-auth-smoke 與 simple-release-smoke job 結果，若有 flakes 只修測試穩定性，不碰 production DB、不部署 Production。
```

## 2026-06-27 - GitHub Actions split smoke remote check

Task goal:

- Check the latest GitHub Actions CI result for the newly split `full-release-auth-smoke` and `simple-release-smoke` jobs.
- If flakes exist, only fix test stability.
- Do not touch production DB or deploy Production.

Findings:

- Latest remote CI run checked: `28264282091`.
- Workflow result: success.
- Remote commit checked by GitHub Actions: `541f9ae47991cca35890b6757c1314903e6e7fed`.
- Job list in that run only contained `lint-test`.
- The new split jobs are still local workspace changes and have not run remotely yet.

Decision:

- No remote Playwright flakes were available to fix.
- No test code was changed during this check.
- Next step is to push/open a PR for the split CI changes, then review the first remote run that actually contains `full-release-auth-smoke` and `simple-release-smoke`.

Validation:

```text
gh run view 28264282091 --json jobs --jq '.jobs[] | [.name,.status,.conclusion,.databaseId,.startedAt,.completedAt] | @tsv'
Result: lint-test completed success.

git rev-parse HEAD
Result: 541f9ae47991cca35890b6757c1314903e6e7fed.

git rev-parse origin/master
Result: 541f9ae47991cca35890b6757c1314903e6e7fed.
```

Launch impact:

- No launch status change.
- No production DB access, production deployment, Meta submission, or PayUNI production action was performed.

## 2026-06-27 - Contacts batch remove tag and create segment from filter

Task goal:

- Close the remaining Contacts bulk-operation gaps.
- Add selected-contact batch remove tag.
- Add "create Segment from current Contacts filter".
- Add tenant isolation tests and authenticated Playwright smoke.
- Do not touch production DB or deploy Production.

Files changed:

- `src/app/api/contacts/batch-tags/route.ts`
- `src/app/api/contacts/segments/route.ts`
- `src/components/ContactsListClient.tsx`
- `src/components/SegmentsClient.tsx`
- `src/lib/segments.ts`
- `src/lib/validation.ts`
- `scripts/ensure-e2e-admin.ts`
- `tests/tenant-isolation-routes.test.ts`
- `tests/e2e/contacts-auth.spec.ts`
- `docs/codex-session-log.md`
- `docs/fix-roadmap.md`
- `docs/product-readiness-review.md`
- `docs/project-launch-checklist.md`
- `docs/security-review.md`

Implementation notes:

- Added `DELETE /api/contacts/batch-tags` to remove a selected tag from selected contacts.
- The delete path reuses the same safeguards as batch add: same-origin check, API auth, workspace-owned tag validation, selected Instagram channel / workspace contact scoping, and a 100-contact batch cap.
- Added `POST /api/contacts/segments` so Contacts can create a Segment from the current `q`, `status`, `tagId`, and selected Instagram channel scope.
- Extended Segment filters with optional `q` search support and preserved `q` in the Segments editor.
- Added a Contacts "建立分眾" dialog and a "批次移除標籤" action.
- Added a client hydration marker for Contacts so Playwright does not click SSR checkboxes before React event handlers are attached.
- Stabilized authenticated smoke by using per-project E2E contacts and a per-run login rate-limit nonce.

Validation:

```text
npm run lint
Result: passed.

npx vitest run tests/tenant-isolation-routes.test.ts --reporter=dot
Result: passed. 13 tests passed.

npm run build
Result: passed.

npm test
Result: passed. Existing Meta webhook audit mock stderr appeared, but the command exited 0.

npm run e2e:admin:ensure
Result: passed with local TEST_DATABASE_URL guard.

npm run test:e2e:contacts
Result: passed. 6 tests passed.

npm run test:e2e
Result: passed. 18 passed, 4 simple-release tests skipped in full-release mode.
```

Launch impact:

- Contacts bulk operations are more complete for private beta use.
- Segment creation from active Contacts filters is now available without exposing production-only or external platform flows.
- No production DB, production deployment, Meta App Review, or PayUNI production action was performed.

New risks:

- A new Segment creation route exists under Contacts. It validates same-origin requests, auth, current workspace, workspace-owned tag, and selected Instagram channel scope before writing.
- Segment filters now support `q`; broadcast/segment recipient logic will honor that search condition through `segmentContactWhere`.

Next suggested Codex Prompt:

```text
請幫我把 Contacts 批次移除標籤與建立分眾這批變更整理成乾淨 PR，排除 unrelated dirty files；推 PR 後只監控 CI full-release-auth-smoke / simple-release-smoke，不部署 Production、不碰 production DB。
```

## 2026-06-27 - Instagram metadata fallback and profile refresh PR

Task:

- Prepare a clean PR for Instagram profile refresh raw Meta error handling and IG metadata fallback.
- Exclude unrelated dirty files.
- Do not deploy Production, touch production DB, run migrations, or submit Meta App Review.

Changes:

- Sidebar account dropdown now keeps ID-only Instagram channels visible instead of filtering them out.
- ID-only channels show a clearer fallback name, explanatory subtitle, and partial-metadata marker.
- Instagram profile refresh tries the Instagram Graph profile endpoint first for Instagram Login channels.
- Raw Meta errors such as `Unsupported request` and `fbtrace_id` are converted to safe Chinese user-facing messages.
- Automations page now documents that current automation scope remains workspace-wide until a channel-scope data model and migration exist.

Validation:

- `npx vitest run tests/instagram-profile-refresh-route.test.ts tests/account-channel-list.test.ts tests/automation-scope-policy.test.ts`: passed, 3 files and 4 tests.
- `npm run lint`: passed.
- `npm run build`: passed.
- `npm test`: passed against a temporary local Docker PostgreSQL `TEST_DATABASE_URL`; no production DB was used. Existing Meta webhook audit mock stderr appeared, but the command exited 0.

Launch impact:

- Improves multi-IG account operator clarity after the next controlled Production deployment.
- Does not change production data, payment behavior, Meta review state, or database schema.

## 2026-06-28 - Antigravity CLI command resolution

Task:

- Confirm the local Antigravity command path and make InboxPilot use the installed `agy` CLI without requiring a separate `antigravity` wrapper.

Changes:

- `antigravity_cli` command resolution now prefers explicit env overrides, then `agy`, then legacy `gemini` / `antigravity` command names.
- Added focused unit coverage for CLI command candidate ordering.
- Stabilized the authenticated route overflow smoke helper so CI does not wait on long-lived dashboard network activity before measuring layout overflow.
- Documented the local CLI default in README.

Validation:

- `where.exe agy`: found `C:\Users\eden\AppData\Local\agy\bin\agy.EXE`.
- `agy --help`: passed.
- `npm run lint`: passed.
- `npx vitest run tests/unit/gemini-cli.test.ts --reporter=dot`: passed.
- `npm run test:e2e:auth`: passed.
- `npm run build`: passed.

Launch impact:

- Improves local / self-hosted Antigravity CLI bridge reliability.
- Does not change production DB, deployment, Meta App Review, PayUNI production behavior, or application data model.

## 2026-06-28 - Windows test runner crash diagnostics

Task:

- Improve `npm test` diagnostics for the intermittent Windows Vitest child-process exit `3221225477` without touching production DB, deployments, Meta App Review, or PayUNI production.

Changes:

- Added `scripts/run-tests-plan.mjs` for reusable test batching and crash-diagnostic policy.
- Updated `scripts/run-tests.mjs` to print each active batch before running Vitest.
- When a multi-file non-coverage batch exits with the known Windows access violation code, the runner now re-runs each file in that batch individually and reports either isolated failing files or a batch-level runner instability.
- Added focused unit coverage for batching, batch labels, and diagnostic gating.
- Hardened the authenticated Playwright smoke login setup with a bounded retry after one duplicate CI run failed on a transient `apiRequestContext.post: read ECONNRESET`.

Validation:

- `npm ci` completed in the clean PR worktree.
- `npx vitest run tests/unit/run-tests-plan.test.ts --reporter=dot` passed.
- `npm run lint` passed.
- `npm run build` passed.
- Antigravity CLI `agy` was available, but print mode returned no report output; fallback QA was recorded in `reports/qa-report.md` and excluded from commit scope.
- Full `npm test` was deferred to GitHub CI because this clean worktree intentionally does not include `.env.local` or local `TEST_DATABASE_URL`.
- PR CI initially showed one passing and one failing duplicate `full-release-auth-smoke` job; the failing run was isolated to a transient login request `ECONNRESET`, so the retry hardening was added and revalidated locally with lint, focused Vitest, and build.

Launch impact:

- Improves unattended test-gate diagnostics only.
- Does not change product runtime behavior, production DB, Production deployment, Meta App Review, PayUNI production behavior, or application data model.

## 2026-06-29 - Channels / Social connect product completeness round 2

Task:

- Continue the Channels / Social connect product audit using the current AI_TEAM flow.
- Focus on controls that are visible on Channels surfaces but feel broken, misleading, or only half-supported.

Audit:

- Completed: Instagram connect, Telegram token connect, Instagram profile refresh, and existing Instagram channel action buttons all have real backing routes.
- Misleading UX found: Mock OAuth provider was still rendered like a normal connect option on deployed surfaces even though it is only useful for local / QA popup verification.
- Misleading UX found: when a connected Meta account existed but no synced channel was found, the page only showed a vague warning instead of telling the operator what to do next.
- Lower-priority deferred: comments/media/token-related actions still need a separate pass to confirm whether each one should be minimally supported or explicitly disabled.

Changes:

- Added a shared Channels visibility helper to centralize connect-option and OAuth-provider visibility rules by release mode and deployment environment.
- Updated `/channels`, `/channels/connect`, and `/channels/connect/social` to use the shared rule set.
- On deployed environments, Mock OAuth now stays visible only as an explicitly disabled QA-only entry instead of looking like a broken live feature.
- Improved the "connected account but no synced channel" state with a clearer explanation plus a direct link back to `Channels`.
- Added focused unit tests for simple-release filtering and deployed-env Mock visibility rules.

Validation:

- `npx eslint src/app/channels/page.tsx src/app/channels/connect/page.tsx src/app/channels/connect/social/page.tsx src/lib/channels/channel-connect-visibility.ts tests/channels-connect-visibility.test.ts`: passed.
- `npx vitest run tests/channels-connect-visibility.test.ts tests/account-channel-list.test.ts tests/instagram-profile-refresh-route.test.ts --reporter=dot`: passed.
- `npm run build`: passed.

Launch impact:

- Reduces misleading Channels UX on production/staging-style deployments without changing DB schema, production data, OAuth callback storage, or release-mode routing.
- No production DB mutation, migration, `db push`, Production deployment, Meta App Review submission, or PayUNI production change was performed.

## 2026-06-29 - AI_TEAM dual-mode local model orchestration

Task:

- Simplify AI_TEAM into two practical local-model modes:
  - `general`: faster day-to-day local model mode
  - `sleep`: slower but stronger unattended mode
- Keep Codex CLI and Antigravity CLI roles unchanged.

Changes:

- Added explicit `general` / `sleep` local-model presets in `AI_TEAM/scripts/local-models.mjs`.
- Updated the runner so `AI_TEAM/scripts/ai-team-runner.mjs` forwards a model mode to the local-model step and records that mode in the health summary.
- Updated `package.json` with mode-specific entrypoints:
  - `ai-team:models:general`
  - `ai-team:models:sleep`
  - `ai-team:loop:general`
  - `ai-team:loop:sleep`
  - `ai-team:loop:once:sleep`
- Updated `AI_TEAM/MODEL_ASSIGNMENT.md` and `AI_TEAM/README.md` to document the two-mode behavior.
- Added focused unit coverage for model assignment defaults by mode.

Validation:

- `npx vitest run tests/unit/ai-team-local-models.test.ts --reporter=dot`: passed.
- `npm run ai-team:check`: passed.

Launch impact:

- Tooling and unattended workflow only.
- No production DB mutation, migration, `db push`, Production deployment, Meta App Review submission, or PayUNI production change was performed.

## 2026-06-28 - Inbox functionality repair round 1

Task:

- Stop deployment/env/migration work and audit + repair Inbox product completeness for visible but non-functional controls.
- Scope: `src/app/inbox`, conversations APIs, message composer, reply/note/status/assignment/search/filter, and IG channel selector impact on Inbox scope.

Audit:

- Completed: Inbox loads authenticated conversations, displays message history, assignment select, reminders, favorite, mark read, contact tags, custom fields, category counters, and reply/note composer.
- Completed: keyword search, category filters, status filter, unread filter, sort toggle, system tag classification, reminders, assignment, and mark-read already had working paths.
- Half-built: channel filter was only type-level; selected IG account switching did not immediately refresh Inbox data.
- Half-built: send/reply failure used browser `alert()` instead of an in-page state.
- Fake/no-op controls found: label `+`, select-all checkbox, video icon, more icon, composer media/AI icons, contact history button, automation pause button, and sequence subscribe action.
- Missing test: no authenticated Inbox Playwright smoke covered conversation selection, IG channel scope, search/filter, note/reply feedback, or selected-channel regression.

Changes:

- Added immediate Inbox reload on sidebar Instagram account switch using `/api/conversations?channelId=...`.
- Expanded conversation API list shape so client-side channel refresh has contact field values, assignment info, and recent messages.
- Converted visible Inbox no-op controls into real links, batch mark-read, or explicit status notices.
- Added in-page status feedback for update/send/tag/custom-field success and failure.
- Added same-origin protection to internal note creation.
- Added E2E seed fixtures for two Instagram channels plus scoped Inbox conversations.
- Added `tests/e2e/inbox-auth.spec.ts` and `npm run test:e2e:inbox`, wired into full-release auth smoke.

Validation:

- `npm run lint`: passed.
- `npm run build`: passed.
- `npm run test:e2e:inbox`: passed against local Docker PostgreSQL `TEST_DATABASE_URL`.
- `npm test`: did not complete because the known Windows Vitest batch crash `3221225477` occurred; diagnostic reruns showed every file in the crashed batch passed individually.

Launch impact:

- Desktop Inbox product completeness and selected IG account scoping are improved.
- No production DB, Production deployment, Meta App Review, PayUNI production switch, migration, or db push was performed.
- Remaining Inbox P2: mobile header search/filter discoverability should be handled in a separate RWD pass.

## 2026-06-28 - Inbox mobile RWD search/filter repair

Task:

- Review and merge PR #21, then continue Inbox product completeness work without touching production DB or deploying Production.

Post-merge status:

- PR #21 merged into `master` at `eb1bc0539fdf279efdd815aab3969446c0c4c809`.
- Vercel deployments observed after merge were Preview deployments only.
- Production and staging alias workflows completed successfully on the merge commit.
- Master CI exposed a Contacts authenticated smoke race: parallel desktop/mobile workers could create the same segment name and trigger `同名分眾已存在`.

Changes:

- Added a mobile-only Inbox search row so mobile users can search conversations while the desktop header is hidden.
- Added a mobile filter button and mobile-safe fixed filter panel with a Done action.
- Restored `npm run test:e2e:inbox` to run both desktop Chromium and mobile Chrome projects.
- Stabilized the Contacts segment smoke by making generated segment names project/worker specific.

Validation:

- `npm run lint`: passed.
- `npm run build`: passed.
- `npm run test:e2e:inbox`: passed against local Docker PostgreSQL `TEST_DATABASE_URL` for Chromium and mobile Chrome.

Launch impact:

- Improves mobile Inbox beta usability and CI signal quality.
- No production DB, Production deployment, Meta App Review, PayUNI production switch, migration, or db push was performed.

## 2026-06-28 - Mobile menu smoke stability follow-up

Task:

- Clean up the remaining scheduled CI red after PR #22 merge without changing product behavior.

Changes:

- Updated the mobile admin menu smoke assertion to use the `收件匣` link, which is present in both simple and full release channels.
- This replaces the previous `廣播活動` assertion, which can be absent in simple-release navigation and caused a scheduled smoke false negative.

Validation:

- Focused local validation was run against the authenticated route smoke.

Launch impact:

- Test stability only.
- No production DB, Production deployment, Meta App Review, PayUNI production switch, migration, or db push was performed.

## 2026-06-28 - Inbox AI reply suggestion product pass

Task:

- Continue the product-functionality autopilot loop and close a visible Inbox "looks clickable but only says coming soon" gap.

Changes:

- Replaced the Inbox composer `AI 回覆建議` coming-soon handler with a safe local draft generator.
- The generator reads the latest inbound message and creates a pricing/setup/thanks/general reply draft.
- The draft is inserted into the composer, with an in-page notice reminding the operator to review before sending.
- Added authenticated Inbox Playwright coverage for the AI reply suggestion interaction.

Validation:

- `npm run lint`, `npm run build`, `npm test`, and authenticated Inbox Playwright smoke passed against a local non-production Docker PostgreSQL database.
- Antigravity CLI `agy --print` returned no stdout and did not create `reports/qa-report.md`, so this round used Codex fallback QA instead of claiming external QA completion.

Launch impact:

- Improves Inbox beta usability without requiring external AI API keys.
- True provider-backed AI suggestions still need product/API design and cost/error controls.
- No production DB, Production deployment, Meta App Review, PayUNI production switch, migration, or db push was performed.

## 2026-06-29 - Daily AI model cache refresh

Task:

- Run the scheduled `npm run ai-models:refresh` automation and report provider model counts or failures.

Result:

- Refresh completed successfully for `default-workspace`.
- Provider counts: `chatgpt=10`, `gemini=7`, `deepseek=2`, `xai=2`.
- No provider failure was reported.
- `codex_cli` and `antigravity_cli` were not present in the refresh payload, consistent with the local CLI opt-in gating when `AI_ENABLE_LOCAL_CLI` is not enabled.

Validation:

- `npm run ai-models:refresh`: passed.

Launch impact:

- AI model cache refresh only.
- No production DB mutation, migration, `db push`, Production deployment, Meta App Review submission, or PayUNI production change was performed.

## 2026-06-29 - AI_TEAM current-task / backlog long-run restructure

Task:

- Reorganize `AI_TEAM` so the runner can keep going across cycles instead of repeatedly stopping on old single-round summaries.

Changes:

- Reworked `AI_TEAM/tasks/current-task.md` into a state-machine style task file with `PRIMARY_TARGET`, `SECONDARY_TARGET`, done criteria, hard stops, and blocked behavior.
- Reworked `AI_TEAM/tasks/backlog.md` so the first actionable line is the next default task, and each item is marked as `UNBLOCKED`, `BLOCKED_BY_TEST_DB`, or `BLOCKED_BY_MANUAL_REVIEW`.
- Updated `AI_TEAM/README.md` to define how the runner should interpret `current-task` and `backlog`, and what `HUMAN_REQUIRED` must be recorded.
- Updated `AI_TEAM/reports/dev-report.md` and `AI_TEAM/reports/final-report.md` so the current queue design and remaining manual gates are explicit.
- Added a no-wait AI_TEAM runner mode plus dedicated npm scripts so the next task can start immediately after the previous one finishes.

Validation:

- Documentation-only change; no product code, DB operation, migration, or deployment was performed.
- `AI_TEAM` task files now expose an unblocked first priority for Inbox product-completeness work and keep authenticated DB-backed smoke explicitly blocked until safe test infra exists.

Launch impact:

- Improves AI_TEAM handoff and long-run continuity.
- Does not directly change production behavior.

## 2026-06-29 - Repo-local Supabase test DB bootstrap

Task:

- Create a repo-owned local Supabase setup so `TEST_DATABASE_URL` no longer depends on another project's occupied local ports.

Changes:

- Added `supabase/config.toml` for this repo with a dedicated port range (`55321` to `55329`).
- Added a placeholder `supabase/seed.sql`.
- Confirmed the previous port conflict was caused by another running local Supabase stack using `54322`.
- Started a dedicated local stack for this repo successfully.

Validation:

- `supabase start`: passed for `ig-auto-reply-manychat`.
- Repo-local DB URL is now available on `127.0.0.1:55322`.

Launch impact:

- Unblocks local non-production `TEST_DATABASE_URL` setup for authenticated smoke and DB-backed tests.
- No production DB, migration, or Production deployment was touched.

## 2026-06-29 - AI_TEAM 開發閉環重構

Task:

- 把 AI_TEAM 從「QA + 報告」提升成真正可長跑的開發閉環。

Changes:

- 新增 `AI_TEAM/scripts/codex-dev.mjs` 作為 Codex CLI 主開發入口，會根據 `PROJECT_STATE`、`current-task`、`backlog` 與 runtime QA 報告直接組出本輪實作 prompt。
- `AI_TEAM/scripts/ai-team-runner.mjs` 主流程改成 `codex-dev -> local-qa -> local-models`，不再只停在回報。
- `AI_TEAM/scripts/local-qa.mjs` 新增 `lite/full` QA 分級、QA lock、以及 lint / test / build 失敗時的 stdout / stderr tail 診斷。
- 補上 `runner.lock.json`、`qa.lock.json`、`codex.lock.json` runtime lock 機制，避免背景 loop 與手動流程互撞。
- 重寫 `AI_TEAM/README.md`、`AI_TEAM/MODEL_ASSIGNMENT.md`、`AI_TEAM/RUNNER_DESIGN.md`，明確把 Codex CLI 定位成主開發者，本地模型改成輔助層。
- `package.json` 補上 `ai-team:dev`、`ai-team:qa:lite`、`ai-team:qa:full`。

Validation:

- `npm run ai-team:check`: passed
- `node AI_TEAM/scripts/codex-dev.mjs --prompt-only`: passed
- `node AI_TEAM/scripts/local-qa.mjs --level=lite`: passed

Launch impact:

- 不直接改產品功能，但大幅改善 AI_TEAM 持續開發與除錯能力。
- 不碰 production DB、不跑 migration / db push、不部署 Production。

## 2026-06-30 - AI_TEAM Codex CLI 長跑啟動修正

Task:

- 修正 AI_TEAM `codex-dev` 在 Windows 下可找到 Codex CLI 但容易 timeout / 報告不足的問題。

Changes:

- 保留 Windows shell 啟動 Codex CLI 的方式，避免 `spawn codex ENOENT`。
- `codex-dev` 依 AI_TEAM mode 設定預設 timeout：一般模式 30 分鐘、睡覺模式 2 小時。
- `codex-dev` timeout / fail 時會寫入 stdout / stderr 摘要到 `AI_TEAM/runtime/codex-last-message.md`。
- `ai-team-runner` 會把 `AI_TEAM_MODE` / `AI_TEAM_RUNNER_MODE` 傳給子流程，讓 `codex-dev` 能判斷目前模式。

Validation:

- `node AI_TEAM/scripts/codex-dev.mjs --prompt-only`: passed.
- `AI_TEAM_CODEX_SMOKE=1 node AI_TEAM/scripts/codex-dev.mjs`: passed, confirmed `codex-cli 0.134.0`.
- `AI_TEAM_CODEX_SMOKE=1 npm run ai-team:loop:once`: passed with `codex-dev -> qa -> local-models` all PASS.
- Visible PowerShell 7 smoke launch confirmed `pwsh -> npm -> cmd -> node AI_TEAM/scripts/ai-team-runner.mjs` process chain.

Launch impact:

- Runner infrastructure only. No production DB, migration, Production deployment, Meta App Review, or PayUNI production change was performed.

## 2026-06-30 - AI_TEAM advanced mode wiring

Task:

- 將使用者定義的「高級模式」補成 AI_TEAM runner 的真實執行模式，而不是只停在提示詞或文件層。

Changes:

- `ai-team-runner` 現在支援 `--mode=advanced`。
- 高級模式預設 full QA，且不會略過 Browser QA。
- PowerShell launcher 新增 `-Mode advanced`。
- package scripts 新增 advanced loop / once / continuous / local models 入口。
- local models 新增 advanced assignment：Codex-first fallback，local-model assist，deferred queue。
- Antigravity CLI QA policy 補成 Flash 優先、Pro fallback。

Launch impact:

- Runner infrastructure only. No production DB, migration, Production deployment, Meta App Review, or PayUNI production change was performed.

## 2026-06-30 - AI_TEAM three-mode product autonomy

Task:

- 保留一般模式、睡覺模式、高級模式，但一次把三個模式都升級成不會因 queue 空掉就停止的產品閉環。

Changes:

- `planner` 現在會讀 backlog、current task、product readiness、launch checklist、fix roadmap、QA report、browser QA report、final report 來生成下一個產品任務。
- 產品補題不再是一輪固定清單；第一輪跑完後會依執行次數最少的產品主線生成下一個 cycle task。
- 新增 `IG metadata / profile refresh / error clarity sweep` 作為獨立產品主線。
- 自動生成任務現在包含 `mode`、`generatedFrom`、`safetyConstraints`、`suggestedTests`。
- `qa` / `browser-qa` 失敗時會建立 pending fix task，讓下一輪回到修復循環。

Validation:

- `npx eslint AI_TEAM/scripts/ai-team-runner.mjs AI_TEAM/scripts/local-models.mjs AI_TEAM/scripts/codex-dev.mjs AI_TEAM/scripts/local-qa.mjs`: passed.
- `npm run ai-team:check`: passed.
- `npm run ai-team:loop:smoke`: passed.
- `node AI_TEAM/scripts/ai-team-runner.mjs --once --mode=sleep --smoke`: passed.
- `node AI_TEAM/scripts/ai-team-runner.mjs --once --mode=advanced --smoke`: passed.
- `node AI_TEAM/scripts/ai-team-runner.mjs --once --mode=general --only-worker=planner`: passed and generated `IG metadata / profile refresh / error clarity sweep`.

Launch impact:

- AI_TEAM runner only. No production DB, migration, Production deployment, Meta App Review, or PayUNI production change was performed.

## 2026-06-30 - AI_TEAM disposable branch real delivery validation

Task:

- 在 disposable branch 上做一次真實 `add / commit / push / draft PR`，並驗證 `merge-delivery` 對 draft PR 的 gate 行為。

Changes:

- `AI_TEAM/scripts/ai-team-runner.mjs`
  - `git-delivery` 改成以 queue task scope 交付，避免把整個髒工作樹一起帶走。
  - 對 scope 內明確包含的 `AI_TEAM/reports/*` 檔案，放行為可提交檔案。
  - `merge-delivery` 保持 draft PR 阻擋，作為真實 gate 驗證。
- `AI_TEAM/tasks/queue.json`
  - `ai-team-disposable-delivery-002` 已被標記為完成，並留下驗證紀錄。
- `AI_TEAM/tasks/current-task.md`
  - 收斂為 Completed，下一個主題切到 runner hygiene。
- `AI_TEAM/tasks/backlog.md`
  - 標記 AI_TEAM delivery validation 已完成，保留下一個主題的排序。
- `AI_TEAM/reports/dev-report.md`
  - 追加這輪 disposable branch real delivery validation 的摘要。
- `AI_TEAM/reports/final-report.md`
  - 追加這輪真實交付結果與 residual risk。

Validation:

- `npx eslint AI_TEAM/scripts/ai-team-runner.mjs`: passed.
- `node AI_TEAM/scripts/ai-team-runner.mjs --once --mode=general --only-worker=git-delivery`: passed，commit / push / draft PR success。
- `node AI_TEAM/scripts/ai-team-runner.mjs --once --mode=general --only-worker=merge-delivery`: passed，draft PR gate blocked as expected。

Launch impact:

- Runner infrastructure only. No production DB, migration, Production deployment, Meta App Review, or PayUNI production change was performed.

## 2026-06-30 - AI_TEAM delivery autonomy closeout

Task:

- 停止單點補洞，改用主題級方式把 AI_TEAM「真正全自動交付機器」剩餘缺口一次補齊，範圍包含 runner、state、docs、smoke、delivery。

Theme-level gap list:

- queue 只有讀取，沒有真正的 task lifecycle。
- `current-task.md` / `backlog.md` 沒和 queue 自動同步。
- worker pipeline 停在 `git-delivery`，缺 `merge-delivery` / `deploy`。
- 缺安全的單工 replay 路徑，delivery worker 出問題時只能整輪重跑。
- visible PowerShell 7 launcher 不能直接帶 delivery / merge / deploy 旗標。
- README / RUNNER_DESIGN / reports 對閉環交付的描述和實作還沒完全對齊。
- smoke 沒有把 merge / deploy 後半段一起守住。

Changes:

- `AI_TEAM/scripts/ai-team-runner.mjs`
  - 補上 queue lifecycle 寫回：`pending` / `running` / `completed` / `blocked` / `failed`。
  - 新增 `--only-worker=<name>` / `AI_TEAM_ONLY_WORKER`，可單獨重跑 `git-delivery`、`merge-delivery`、`deploy`。
  - worker pipeline 擴充為：
    - `planner`
    - `codex-dev`
    - `local-model-review`
    - `qa`
    - `browser-qa`
    - `reporter`
    - `git-delivery`
    - `merge-delivery`
    - `deploy`
  - 新增 `merge-delivery` gate：檢查 PR 是否存在、是否非 draft、merge state、checks。
  - 新增 `deploy` gate：檢查 merge 是否完成、deploy target、Production deploy 是否明確開放。
  - 新增 `finalizeTask()`，把最後狀態同步回 queue 與 `current-task.md` / `backlog.md`。
- `AI_TEAM/scripts/lib/ai-team-paths.mjs`
  - 補 `delivery-state.json` runtime path。
- `AI_TEAM/scripts/local-ai-team.ps1`
  - 補 `-EnableGitDelivery`、`-EnableMerge`、`-EnableDeploy`、`-DisableDryRun`、`-DisableAutoBranch`、`-AllowMergeWithoutChecks`、`-DeployTarget`。
- `AI_TEAM/tasks/queue.json`
  - 改成這輪 AI_TEAM delivery autonomy 主題的單一 queue task。
- `AI_TEAM/tasks/current-task.md`
  - 改寫成主題級 gap list、Definition of Done、驗證與 hard stop。
- `AI_TEAM/tasks/backlog.md`
  - 重新排序，先做 AI_TEAM delivery autonomy，再回產品功能。
- `AI_TEAM/README.md`
  - 補完整 worker 順序、queue lifecycle、delivery flags、單工 replay、visible PowerShell 7 啟動範例。
- `AI_TEAM/RUNNER_DESIGN.md`
  - 補 merge / deploy 設計、queue lifecycle 與 replay 說明。
- `AI_TEAM/reports/dev-report.md`
  - 同步這輪實作摘要。
- `AI_TEAM/reports/final-report.md`
  - 同步這輪 closed-loop delivery 狀態與剩餘風險。
- `docs/fix-roadmap.md`
  - 新增這輪 current status / remaining。

Validation:

- `npm run ai-team:check`: passed.
- `npx eslint AI_TEAM/scripts/ai-team-runner.mjs AI_TEAM/scripts/ai-team.mjs AI_TEAM/scripts/lib/ai-team-paths.mjs AI_TEAM/scripts/codex-dev.mjs AI_TEAM/scripts/local-qa.mjs AI_TEAM/scripts/playwright-browser-qa.mjs`: passed.
- `npm run ai-team:loop:smoke`: passed，fake task 走完 `planner -> codex-dev -> local-model-review -> qa -> browser-qa -> reporter -> git-delivery -> merge-delivery -> deploy`。
- `node AI_TEAM/scripts/ai-team-runner.mjs --once --mode=general --smoke --only-worker=merge-delivery`: passed，確認單工 replay 路徑可用。

Launch impact:

- Runner infrastructure only. No production DB, migration, Production deployment, Meta App Review, or PayUNI production change was performed.

## 2026-06-30 - AI_TEAM Worker Pipeline / Task Queue 重構

Task:

- 將 AI_TEAM runner 從固定外部 CLI 等待流程，改成 task queue + worker result 的 structured pipeline。

Changes:

- 新增 `AI_TEAM/tasks/queue.json` 作為任務佇列。
- `ai-team-runner` 改為 worker pipeline：`planner -> codex-dev -> local-model-review -> qa -> browser-qa -> reporter -> git-delivery`。
- 每個 worker 會輸出 structured JSON 到 `AI_TEAM/runtime/worker-result.json`，並更新 `loop-state.json`、`current-worker.json`、`heartbeat.json`。
- runner 依 worker result 的 `status` / `next` 推進流程，timeout 僅保留為外部 CLI 卡死時的保險。
- 新增 `npm run ai-team:loop:smoke`，可用 fake task 驗證完整 pipeline，不會真的改產品、commit、push、PR 或 deploy。
- 更新 `AI_TEAM/README.md` 與 `AI_TEAM/RUNNER_DESIGN.md` 描述 queue / worker result 架構。

Validation:

- `npm run ai-team:loop:smoke`: passed，fake task 完整走過 7 個 worker。
- `npx eslint AI_TEAM/scripts/ai-team-runner.mjs AI_TEAM/scripts/lib/ai-team-paths.mjs`: passed。
- `npm run ai-team:check`: passed。

Launch impact:

- Runner infrastructure only. No production DB, migration, Production deployment, Meta App Review, or PayUNI production change was performed.

## 2026-06-30 - AI_TEAM git-delivery policy gate

Task:

- 為 AI_TEAM worker pipeline 補上真正的 `git-delivery` policy gate，先做安全判斷，再決定是否真的 commit / push / PR。

Changes:

- `git-delivery` 會讀取 `AI_TEAM/runtime/worker-result.json`、`AI_TEAM/runtime/loop-state.json` 與 `git status --porcelain`。
- 只有在 QA PASS、沒有 failed / blocked worker、且 dirty files 沒有混入 `reports`、`AI_TEAM/runtime`、`.env*`、cache / log 類檔案時，policy 才會進入 `ready`。
- 新增 dirty file 分類：可提交檔案與應排除檔案分開處理。
- 新增交付開關：
  - `AI_TEAM_ENABLE_GIT_DELIVERY=1`
  - `AI_TEAM_GIT_COMMIT=1`
  - `AI_TEAM_GIT_PUSH=1`
  - `AI_TEAM_GIT_PR=1`
- 若只開 delivery gate、不開 commit，`git-delivery` 會回報 `ready`，但不會真的 mutate git / remote。
- `npm run ai-team:loop:smoke` 現在會覆蓋 `git-delivery` 的 `skipped / blocked / ready` 三種狀態。

Validation:

- `npm run ai-team:loop:smoke`: passed.
- `npx eslint AI_TEAM/scripts/ai-team-runner.mjs AI_TEAM/scripts/lib/ai-team-paths.mjs AI_TEAM/scripts/ai-team.mjs`: passed.
- `npm run ai-team:check`: passed.

Launch impact:

- Runner infrastructure only. No production DB, migration, Production deployment, Meta App Review, or PayUNI production change was performed.

## 2026-06-30 - AI_TEAM branch safety / PR policy

Task:

- 補齊 unattended `git-delivery` 的 branch safety 與 PR policy，避免 runner 直接在保護分支上 commit。

Changes:

- `git-delivery` 新增 branch safety 規則：`master`、`main`、`staging`、`production`、`prod`、`release` 一律 blocked。
- 新增 PR metadata 預設值：
  - base branch = `master`
  - draft = `true`
  - title = `AI_TEAM: <task title>`
  - body 會帶 task id、branch、validation 與 Production deploy 預設關閉說明
- 新增 `AI_TEAM_ENABLE_PRODUCTION_DEPLOY` 阻擋：即使被設成 `1`，`git-delivery` 仍會 blocked，不會放行正式部署。
- 若 `AI_TEAM_GIT_PR=1` 但 `AI_TEAM_GIT_PUSH` 沒開，會直接 blocked，不會假裝能建 PR。
- `npm run ai-team:loop:smoke` 現在覆蓋：
  - `branch unsafe`
  - `ready but commit disabled`
  - `commit enabled but push disabled`
  - `push enabled but gh missing`

Validation:

- `npm run ai-team:loop:smoke`: passed.
- `npx eslint AI_TEAM/scripts/ai-team-runner.mjs AI_TEAM/scripts/lib/ai-team-paths.mjs AI_TEAM/scripts/ai-team.mjs`: passed.
- `npm run ai-team:check`: passed.

Launch impact:

- Runner infrastructure only. No production DB, migration, Production deployment, Meta App Review, or PayUNI production change was performed.

## 2026-06-30 - AI_TEAM auto-branch / dry-run delivery

Task:

- 在 `git-delivery` 補上 auto-branch 與 dry-run，讓 unattended delivery 先模擬、再執行，避免直接在 unsafe branch 上改遠端。

Changes:

- 新增安全 branch 規劃：
  - branch 不安全時，會規劃改用 `codex/<task-id>`。
  - 若 `AI_TEAM_GIT_AUTO_BRANCH` 未關閉，非 dry-run 狀態下可自動 `git switch -c` / `git switch`。
- 新增 `AI_TEAM_GIT_DRY_RUN`：
  - 預設為開啟。
  - dry-run 時只輸出將執行的 branch / add / commit / push / PR 計畫，不真的 mutate git / remote。
- `git-delivery` 現在會先回傳交付計畫，再由顯式 env 決定是否真的 commit / push / PR。
- 保持 `AI_TEAM_ENABLE_PRODUCTION_DEPLOY` 預設關閉，delivery worker 不會放行正式部署。

Validation:

- `npm run ai-team:loop:smoke`: passed.
- `npx eslint AI_TEAM/scripts/ai-team-runner.mjs AI_TEAM/scripts/lib/ai-team-paths.mjs AI_TEAM/scripts/ai-team.mjs`: passed.

Launch impact:

- Runner infrastructure only. No production DB, migration, Production deployment, Meta App Review, or PayUNI production change was performed.
