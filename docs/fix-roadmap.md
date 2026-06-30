# Latest - 2026-07-01 Analytics broadcast gate clarity

Current status:

- `[x]` Analytics simple release no longer shows a clickable full-only `/broadcasts` CTA.
- `[x]` Simple release now shows a disabled `廣播活動受控開通` control with clear title copy.
- `[x]` Added simple-release smoke coverage for this gate.

Remaining:

- `[ ]` Run branch validation and PR CI before merge.
- `[ ]` Continue product-completeness sweeps only for safe UI / UX ambiguity.

# Latest - 2026-07-01 Referrals light theme polish

Current status:

- `[x]` Referrals page no longer uses the old dark panel styling inside the light admin shell.
- `[x]` Simple release referral positioning remains explicit: invite tracking and trial bonuses are available, affiliate cash rewards are not.
- `[x]` Added authenticated route smoke coverage for the Referrals hero, URL, and records surfaces.

Remaining:

- `[ ]` Run branch validation and PR CI before merge.
- `[ ]` Continue safe product-completeness sweeps only if new UI ambiguity is found.

# Latest - 2026-07-01 Channels planned settings disabled UX

Current status:

- `[x]` Channels planned settings now expose explicit disabled controls for operation logs, sequence settings, and conversion events.
- `[x]` Added authenticated route smoke coverage for the planned settings disabled controls.
- `[x]` `npm run lint`、`npm run build`、`npm test` passed.
- `[x]` Local focused authenticated smoke skipped by guard; CI should run it with seeded test DB.

Remaining:

- `[ ]` Continue safe product-completeness sweeps only if new UI ambiguity is found.
- `[ ]` Keep Meta App Review, PayUNI production, production DB, and production deployment as human gates.

# Latest - 2026-07-01 Contacts no-filter empty-state guidance

Current status:

- `[x]` Contacts filtered empty-state guidance was already covered; this pass closes the no-filter / zero-contact state.
- `[x]` New workspaces now get clear next steps from Contacts: connect Instagram, check Inbox, and understand CSV import is intentionally disabled.
- `[x]` Added focused unit coverage for the empty-state model.
- `[x]` `npx vitest run tests/contacts-empty-state.test.ts --reporter=dot`、`npm run lint`、`npm test`、`npm run build` passed.

Remaining:

- `[ ]` Continue safe product-completeness sweeps only if new UI ambiguity is found.
- `[ ]` Keep Meta App Review, PayUNI production, production DB, and production deployment as human gates.

# Latest - 2026-07-01 PR #43 billing smoke and Windows test runner unblock

Current status:

- `[x]` PR #43 `full-release-auth-smoke` root cause identified: `/billing` rendered 500 when PayUNI merchant/hash secrets were intentionally absent in CI.
- `[x]` PayUNI gateway status display no longer requires checkout secrets; checkout creation still requires secrets.
- `[x]` Windows `npm test` runner now treats `3221225477` as batch-level instability only when every diagnostic single-file rerun passes.
- `[x]` `npm run lint`、`npm test`、`npm run build` passed locally.

Remaining:

- `[ ]` Push PR #43 updates and re-check GitHub CI `full-release-auth-smoke`.
- `[ ]` Keep PayUNI production enablement as a manual launch gate.

# Latest - 2026-06-30 Launch readiness product sweep

Current status:

- `[x]` 產品 launch readiness 的安全缺口已整理完畢，沒有再新增需要自動 queue 的產品任務。
- `[x]` 私測可用區塊已經夠清楚；目前的公開 paid launch 差距都屬於人工 gate，而不是產品邏輯缺口。

Remaining:

- `[HUMAN_REQUIRED]` Meta App Review / Advanced Access / Business Verification。
- `[HUMAN_REQUIRED]` PayUNI production merchant approval、controlled enablement、第一筆低額 production smoke。
- `[HUMAN_REQUIRED]` 最終 Billing / Terms / Privacy / Data Deletion read-through。

# Latest - 2026-06-30 Billing checkout gate clarity

Current status:

- `[x]` Billing 頁現在會在 PayUNI 仍停留在正式站且 `PAYUNI_ALLOW_PRODUCTION` 尚未開啟時，先把付款按鈕停用並說明原因。
- `[x]` sandbox 仍可直接驗證付款流程，正式站 gate 不會再像可直接送出的假按鈕。
- `[x]` `tests/payuni-billing.test.ts`、`npm run lint`、`npm test`、`npm run build` 已通過。
- `[ ]` `npm run test:e2e:auth` 本機目前卡在既有 e2e admin / DB 狀態，等環境修好後再補一次 billing smoke。

Remaining:

- `[ ]` 先保留 PayUNI sandbox / controlled production gate 的文件與 UI 說明，不要提前開正式金流。
- `[ ]` 保持 production DB、migration、Meta App Review、PayUNI production 都在人工 gate 外。

# Latest - 2026-06-30 Analytics readability and data-state sweep

Current status:

- `[x]` Analytics 現在會明確標出資料範圍：工作區全域 / 單一 IG 帳號，避免 0 值看起來像壞掉。
- `[x]` 空資料、載入失敗、沒有 IG 連線、以及本來就沒有發送 / 啟用紀錄的數值，都有對應說明或 CTA。
- `[x]` 新增只讀 `/api/analytics`，回傳 analytics summary 與 state，方便前端或未來自動刷新共用。
- `[x]` `tests/analytics-state.test.ts`、`tests/integration/api-routes.test.ts`、`tests/e2e/public-and-auth.spec.ts` 都已補 coverage。
- `[x]` `npm run lint`、`npm test`、`npm run build`、`npm run test:e2e:auth` 都已通過。

Remaining:

- `[ ]` 若後續要做真正的時間序列圖表，先定義資料來源、刷新策略與更細的聚合 API。
- `[ ]` 保持 production DB、migration、Meta App Review、PayUNI production 都在人工 gate 外。

# InboxPilot Fix Roadmap

## Latest - 2026-06-30 Automations scope clarity and disabled UX sweep

Current status:

- `[x]` Automations 頁面現在會清楚說明目前是工作區共用 scope，不會因左側 IG 帳號切換就看起來像分成不同 automation data model。
- `[x]` 頁面與 builder 都補上 scope banner，並帶出目前選擇的 IG 帳號名稱與 release note。
- `[x]` 回收桶、幾個尚未支援的 basic automations，以及 simple release 的序列入口都改成清楚 disabled UX。
- `[x]` `tests/e2e/public-and-auth.spec.ts`、`tests/e2e/simple-release.spec.ts`、`tests/automation-scope-policy.test.ts` 都已補 smoke / unit coverage。
- `[x]` `npm run lint`、`npm run build`、`npm test`、`npm run test:e2e:auth`、`npm run test:e2e:simple` 都已通過。

Remaining:

- `[ ]` 如果後續要真的做 per-channel automation scope，先補資料模型與 migration，再談 UI 切分。
- `[ ]` 保持 production DB、migration、Meta App Review、PayUNI production 都在人工 gate 外。

## Latest - 2026-06-30 Contacts product completeness sweep

Current status:

- `[x]` Contacts segment 建立前現在會顯示目前條件會套用到多少聯絡人，避免使用者盲建分群。
- `[x]` Batch tag 操作在沒有標籤時會直接提示先建立標籤，不再留下半套操作區。
- `[x]` `PUT /api/contacts/[id]/fields` 已補 same-origin 驗證，Contacts custom field 寫入路徑不再少一層既有防線。
- `[x]` `tests/e2e/contacts-auth.spec.ts` 與 `tests/tenant-isolation-routes.test.ts` 都已補對應 smoke。
- `[x]` `npm run lint`、`npm run build`、`npm test`、`npm run test:e2e:contacts` 都已通過。

Remaining:

- `[ ]` 若後續還有 Contacts 其他看得到但不夠清楚的控制項，再接下一輪安全收斂。
- `[ ]` 保持 production DB、migration、Meta App Review、PayUNI production 都在人工 gate 外。

## Latest - 2026-06-30 Channels / Connect visible-but-unusable sweep

Current status:

- `[x]` Channels / Connect 入口已改成可連線 / 規劃中 / 暫停中的分流。
- `[x]` `InstagramChannelActions` 在授權不足時會顯示 inline disabled 說明，不再只靠 title。
- `[x]` `tests/channels-connect-visibility.test.ts` 與 `tests/e2e/simple-release.spec.ts` 都已補 smoke。
- `[x]` `npm run lint`、`npm run build`、`npm test`、`INBOXPILOT_RELEASE_CHANNEL=simple npm run test:e2e:simple` 都已通過。

Remaining:

- `[ ]` 如果後續還有其他 Channels / Connect visible-but-unusable 控制項，再接下一輪安全收斂。
- `[ ]` 保持 Production deploy、production DB 寫入、Meta App Review、PayUNI production 都在人工 gate 外。

## Latest - 2026-06-30 Inbox visible-but-unusable follow-up

Current status:

- `[x]` Inbox contact actions menu 的匯出 / 封鎖項目已改成真正 disabled UX。
- `[x]` simple-release Inbox 的序列訂閱入口已改成真正 disabled UX。
- `[x]` `tests/e2e/inbox-auth.spec.ts` 與 `tests/e2e/simple-release.spec.ts` 都已補 smoke。
- `[x]` `npm run lint`、`npm test`、`npm run build`、`npm run test:e2e:inbox`、`npm run test:e2e:simple` 都已通過。

Remaining:

- `[ ]` 如果還有其他 Inbox visible-but-unusable 控制項，再接下一輪安全收斂。
- `[ ]` 保持 Production deploy、production DB 寫入、Meta App Review、PayUNI production 都在人工 gate 外。

# Latest - 2026-06-30 AI_TEAM product autofill loop

Current status:

- `[x]` AI_TEAM planner now auto-fills the next safe product task when `queue.json` has no pending / running task.
- `[x]` The first auto-filled task is `Inbox visible-but-unusable product sweep`.
- `[x]` `AI_TEAM/reports/next-codex-prompt.md` now describes the complete product closed-loop mode.
- `[x]` `npm run ai-team:loop:smoke` passed after the runner change.

Remaining:

- `[ ]` Let the visible PowerShell 7 general-mode runner continue the new Inbox task.
- `[ ]` Keep Production deploy, production DB writes, Meta App Review, and PayUNI production outside unattended automation unless explicitly approved.

# Latest - 2026-06-30 Daily AI model cache refresh

Current status:

- `[x]` Ran `npm run ai-models:refresh`.
- `[x]` Refresh completed for `default-workspace`.
- `[x]` Current provider counts are `chatgpt=10`, `gemini=7`, `deepseek=2`, and `xai=2`.
- `[x]` No provider failure was reported.
- `[x]` `codex_cli` and `antigravity_cli` stayed outside the shared refresh payload, matching the documented local CLI opt-in behavior.

Remaining:

- `[ ]` Keep `AI_ENABLE_LOCAL_CLI` disabled in shared SaaS / cron environments unless the machine has authenticated local CLI tools.

# Latest - 2026-06-30 Contacts filtered empty-state guidance

Current status:

- `[x]` Contacts filtered empty-state 已改成完整 guidance panel，會清楚列出搜尋 / 狀態 / 標籤條件。
- `[x]` `清除篩選並重新查看` 現在是可直接點擊的返回完整列表入口。
- `[x]` `tests/e2e/contacts-auth.spec.ts` 已補上 filtered empty-state guidance smoke。
- `[x]` `npm run lint`、`npm run build`、`npm run test:e2e:contacts`、`npm test` 都已通過。

Remaining:

- `[ ]` 如果之後還想再打磨 Contacts，可補 no-filter empty state 的建立 / 匯入引導。
- `[ ]` 下一輪回到 backlog 再挑其他安全的產品完整性任務。

# Latest - 2026-06-30 Inbox / Channels visible-but-unusable closeout

Current status:

- `[x]` Inbox contact panel `自動化暫停` 已改成真正 disabled UX，並附上原因說明。
- `[x]` Inbox header `視訊通話` 與 `更多對話操作` 也已改成真正 disabled UX，避免後續操作被誤導。
- `[x]` `清除提醒` 現在會正確關閉 reminder menu，不會再讓浮層卡住後續操作。
- `[x]` IG dropdown 的 partial metadata badge、Channels connect visibility，以及對應的 focused tests / smoke 都已通過。

Remaining:

- `[ ]` 下一輪先接 `Contacts filtered empty-state guidance`，把篩選後的空狀態引導補清楚。
- `[ ]` 若之後要把更多暫停型入口統一收斂，先共用一組 disabled UX pattern。

# Latest - 2026-06-29 Inbox audit round 3 follow-up

Current status:

- `[x]` Inbox 空狀態的 `清除篩選並重新查看` 現在會真正清掉搜尋、標籤、指派、分類與未讀條件。
- `[x]` Inbox 提醒選單的 `選擇日期與時間` 已改成清楚 disabled UX，不再假裝是可用功能。
- `[x]` Inbox 指派、提醒、已讀等對話更新，現在會顯示更精準的成功訊息。
- `[x]` `tests/e2e/inbox-auth.spec.ts` 已擴充 assignment / reminder / empty-state reset 覆蓋。
- `[x]` `npm run test:e2e:inbox` 已通過 Chromium 與 mobile Chrome。

Remaining:

- `[ ]` 繼續 Inbox 第四輪 visible-but-unusable audit，優先檢查 contact panel 的 `自動化暫停`、序列 CTA、更多聯絡人操作與剩餘 bulk action。
- `[ ]` 把同等標準擴到 Channels 次要控制項 audit。

# Latest - 2026-06-29 Local test infra stabilization

Current status:

- `[x]` 確認本專案 local Supabase 對應 `supabase_db_ig-auto-reply-manychat`，測試資料庫使用 `127.0.0.1:55322`。
- `[x]` 確認另一套 `54322` Supabase stack 是別的專案，與本專案分離。
- `[x]` `npm test` 已可在 Windows 本機完整跑完 9 個 batch，這輪未再出現 `3221225477`。
- `[x]` `tests/email-channel.test.ts` 在目前 runner 下通過，未再造成測試環境清理問題。
- `[x]` `AI_TEAM/scripts/playwright-browser-qa.mjs` 已改成直接呼叫既有 Playwright smoke spec。
- `[x]` Browser QA 會先確認 `/login` HTTP readiness，不再只用 port listen 當成功條件。
- `[x]` Browser QA 會清掉自己拉起的 Windows `next dev` 子程序樹，避免殘留假活著的 `3041`。
- `[x]` `tests/e2e/ai-team-browser-smoke.spec.ts` 已修正 full release / simple release 斷言分支。
- `[x]` `npm run ai-team:qa` 現在可完整 PASS。
- `[x]` `AI_TEAM/scripts/local-ai-team.ps1` 已改成先強制 UTF-8、關閉 ANSI 色碼，再以 UTF-8 寫 log，避免可視 PowerShell 視窗中文亂碼。

Remaining:

- `[ ]` 用已穩定的本機測試基礎設施，回到 Inbox / Channels 的產品功能完整性修補。
- `[ ]` 擴大 authenticated smoke 覆蓋更多真實可點擊控制項。

# Latest - 2026-06-29 AI_TEAM orchestration MVP

Current status:

- `[x]` Expanded `AI_TEAM/MODEL_ASSIGNMENT.md` to match the local-model / Codex / Antigravity role split from the control document.
- `[x]` `npm run ai-team:qa` now runs `ai-team:check`, local lint/test/build gates, and attempts real `agy` Browser QA.
- `[x]` Added `npm run ai-team:models` to orchestrate local Ollama models for error summary, static QA, code review, final report, and next prompt.
- `[x]` `npm run ai-team:loop` now runs a real pipeline instead of only printing health summary.
- `[x]` Runtime outputs now go to ignored `AI_TEAM/runtime/` instead of dirtying tracked report files.
- `[x]` Added focused unit coverage for local model list parsing.

Remaining:

- `[ ]` Improve `agy` Browser QA reliability; current print-mode runs may still end with no output and produce a WARN report.
- `[ ]` Decide later whether local-model patch generation should stop at suggestions or produce gated patch artifacts for Codex review.
- `[x]` Resume product completeness work for Channels / Social connect after this tooling round.
- `[ ]` Add authenticated Channels smoke once a non-production `TEST_DATABASE_URL` and test login path are available in the active worktree.
- `[ ]` Continue Channels audit for lower-priority comments/media/token-related controls.

# Latest - 2026-06-29 Channels / Social connect round 2

Current status:

- `[x]` Added a shared visibility helper for Channels connect cards and OAuth providers.
- `[x]` Mock OAuth is no longer presented like a normal live connect option on deployed environments.
- `[x]` `/channels`, `/channels/connect`, and `/channels/connect/social` now use consistent visible / enabled / disabled rules.
- `[x]` Improved the connected-account-without-synced-channel state with a clearer next-step notice and direct link back to `Channels`.
- `[x]` Added focused unit coverage for simple-release filtering and deployed-env Mock visibility behavior.

Remaining:

- `[ ]` Add authenticated Channels smoke once a non-production `TEST_DATABASE_URL` and test login path are available in the active worktree.
- `[ ]` Audit comments/media/token-related controls and decide which should become minimal viable actions vs. explicit disabled UX.
- `[ ]` Continue product completeness audits for Inbox, Automations, and Analytics after this Channels pass.

# Latest - 2026-06-29 AI_TEAM general/sleep mode split

Current status:

- `[x]` Split AI_TEAM local-model orchestration into `general` and `sleep` modes.
- `[x]` Kept Codex CLI and Antigravity CLI roles unchanged across both modes.
- `[x]` Added mode-aware `ai-team:models*` and `ai-team:loop*` npm entrypoints.
- `[x]` Updated runner health summary to show the active local-model mode.
- `[x]` Added unit coverage for mode-specific default model assignment.

Remaining:

- `[ ]` Re-run unattended loop with the new mode split and tune timeout values separately for `general` vs `sleep`.
- `[ ]` Decide whether `sleep` mode should also use a longer default local-model timeout than `general`.

# Latest - 2026-06-28 Inbox mobile scope and filter pass

Current status:

- `[x]` Added real mobile Inbox pane switching for conversation list, message detail, and contact panel.
- `[x]` Restored real custom-tag and team-member filtering in Inbox instead of partial sidebar stubs.
- `[x]` Expanded the Inbox filter panel to control tag and assignee scope.
- `[x]` Replaced the fake `已訂閱 (取消訂閱)` contact summary copy with an honest read-only consent status summary.
- `[x]` In simple release, Inbox sequence subscription now explains that sequences are full-release-only instead of silently linking users into a gated route.
- `[x]` Added same-origin + rate-limit guards for conversation updates and internal note writes.
- `[x]` Added focused route regression coverage and extended authenticated Inbox smoke.

Remaining:

- `[ ]` Authenticated Inbox Playwright smoke still needs a non-production `TEST_DATABASE_URL` plus admin credentials in this clean worktree to run fully instead of skipping.
- `[ ]` Continue the Inbox audit for richer bulk actions, export governance, and unsubscribe/block workflow design.
- `[ ]` Continue product completeness audits for Channels, Automations, and Analytics.

# Latest - 2026-06-28 AI_TEAM docs baseline and autopilot retirement

Current status:

- `[x]` Created the new `AI_TEAM/` document skeleton from the attached control document.
- `[x]` Removed the root `npm run autopilot` entry and the old runner entrypoints.
- `[x]` Updated `README.md` to point to `AI_TEAM/README.md`.
- `[x]` Kept product AI bridge code untouched.

Remaining:

- `[ ]` Start the first product audit using the new AI_TEAM workflow.
- `[ ]` Continue the next product completeness audit after bootstrap.

## Latest - 2026-06-28 Inbox contact panel actions UX pass

Current status:

- `[x]` Replaced the Inbox contact panel `更多聯絡人操作` fake notice with a small action menu.
- `[x]` Added a real `開啟聯絡人詳情` link for the selected contact.
- `[x]` Converted higher-risk export and block/unsubscribe actions into explicit temporarily-disabled guidance.
- `[x]` Extended authenticated Inbox Playwright smoke coverage for the desktop contact actions menu.

Remaining:

- `[ ]` Implement contact export only after permission, masking, and audit requirements are designed.
- `[ ]` Implement block/unsubscribe only after Instagram sync and support-review rules are designed.
- `[ ]` Continue product completeness audits for Channels, Automations, and Analytics.

## Latest - 2026-06-28 Inbox header disabled UX pass

Current status:

- `[x]` Replaced Inbox conversation header `視訊通話` and `更多操作` coming-soon behavior with explicit temporarily-disabled UX.
- `[x]` The controls now use disabled visual styling, accessible labels, and an in-page explanation that they are intentionally unavailable until the related product flow is implemented.
- `[x]` Kept the Inbox filter panel close action visible on desktop and mobile after E2E found the desktop panel could block conversation header controls.
- `[x]` Added authenticated Inbox Playwright smoke coverage so both controls no longer report `尚未開放` or feel like broken buttons.

Remaining:

- `[ ]` Implement real video calling after the product/API, permission, and delivery design is ready.
- `[ ]` Implement richer conversation actions after the product/API surface is designed.
- `[ ]` Continue product completeness audits for Channels, Automations, and Analytics.

## Latest - 2026-06-28 Inbox media composer disabled UX pass

Current status:

- `[x]` Replaced Inbox composer `圖片上傳` and `語音訊息` coming-soon behavior with explicit temporarily-disabled UX.
- `[x]` The controls now use disabled visual styling, accessible labels, and an in-page explanation that they are intentionally unavailable until media storage / scanning / attachment delivery and audio processing are implemented.
- `[x]` Added authenticated Inbox Playwright smoke coverage so image and voice controls no longer report `尚未開放` or feel like broken buttons.

Remaining:

- `[ ]` Implement real media attachment support after storage, virus scanning, size limits, channel delivery, and audit/error handling are designed.
- `[ ]` Implement real voice message support after upload, transcoding, retention, channel delivery, and App Review implications are designed.
- `[ ]` Continue product completeness audits for Channels, Automations, and Analytics.

## Latest - 2026-06-28 Inbox emoji composer product pass

Current status:

- `[x]` Fixed Inbox composer `表情符號` so it no longer behaves like a visible coming-soon button.
- `[x]` Clicking the emoji button now inserts a safe default emoji into the current composer text and shows a success notice.
- `[x]` Added authenticated Inbox Playwright smoke coverage for the emoji button, verifying composer text changes and the UI no longer reports `尚未開放`.

Remaining:

- `[ ]` A full emoji picker can be added later if operators need more choices.
- `[x]` Media attachment and voice message buttons now have clearer disabled UX.
- `[ ]` Continue product completeness audits for Channels, Automations, and Analytics.

## Latest - 2026-06-28 Inbox AI reply suggestion product pass

Current status:

- `[x]` Fixed Inbox composer `AI 回覆建議` so it no longer behaves like a visible coming-soon button.
- `[x]` Added a safe local reply-draft generator based on the latest inbound message, without requiring external AI provider secrets.
- `[x]` The generated text is inserted into the composer as a draft only; the operator still reviews and manually sends it.
- `[x]` Added authenticated Inbox Playwright smoke coverage for clicking `AI 回覆建議`, verifying draft text, and confirming the UI no longer reports `尚未開放`.

Remaining:

- `[ ]` True provider-backed AI reply generation still needs product/API design, user API-key configuration, cost controls, and error handling.
- `[ ]` Media attachment and voice message buttons still need either scoped implementation or clearer disabled UX.
- `[ ]` Continue product completeness audits for Channels, Automations, and Analytics.

## Latest - 2026-06-28 Inbox mobile RWD search/filter repair

Current status:

- `[x]` PR #21 Inbox functionality repair has been merged into `master`.
- `[!]` Post-merge master CI exposed a Contacts smoke race where desktop/mobile workers could create the same segment name and report `同名分眾已存在`.
- `[x]` Fixed the Contacts smoke race by making the segment name project/worker specific.
- `[x]` Fixed mobile Inbox search discoverability by adding a mobile search row above the conversation layout.
- `[x]` Fixed mobile Inbox filter usability by exposing a mobile filter button and mobile-safe fixed filter panel.
- `[x]` Restored `npm run test:e2e:inbox` to run both desktop Chromium and mobile Chrome projects.
- `[x]` Verified Inbox authenticated smoke passes against local Docker PostgreSQL `TEST_DATABASE_URL` for both desktop and mobile.

Remaining:

- `[ ]` Continue Inbox product audit for true media attachment, voice message, AI reply suggestion, automation pause, and sequence subscription product/API work.
- `[ ]` Continue product completeness audits for Channels, Automations, and Analytics.

## Latest - 2026-06-28 Inbox functionality repair round 1

Current Inbox audit:

- `[x]` Completed: Inbox page loads authenticated conversations, renders messages, assignment select, reminder, favorite, mark-read, reply/note composer, contact tags, custom fields, and category counters.
- `[x]` Completed: Search keyword filtering exists through the header search event.
- `[x]` Completed: Status, unread, sort, category, favorite, reminder, and tag classification filters are wired.
- `[x]` Fixed: Sidebar IG account switch now immediately refreshes Inbox conversations by selected Instagram channel through `/api/conversations?channelId=...`.
- `[x]` Fixed: Visible no-op controls now provide real action or explicit in-page feedback, including label `+`, select-all, composer media/AI icons, video/more icons, contact history, automation pause, and sequence subscribe entry.
- `[x]` Fixed: Send/reply failures now show a clear in-page status instead of only `alert()`.
- `[x]` Fixed: `POST /api/conversations/[id]/notes` now uses same-origin protection.
- `[x]` Added: desktop authenticated Inbox Playwright smoke for load, IG scope switching, conversation selection, search/filter, internal note, and Instagram reply success/failure feedback.
- `[ ]` Remaining P2: mobile Inbox header search is hidden in the current mobile layout; handle in a dedicated RWD pass.
- `[ ]` Remaining P2: true media attachment, voice message, AI reply suggestion, automation pause, and sequence subscription still require product-level design/API work.

Validation:

- `[x]` `npm run lint` passed.
- `[x]` `npm run build` passed.
- `[x]` `npm run test:e2e:inbox` passed against a local Docker PostgreSQL `TEST_DATABASE_URL`.
- `[!]` `npm test` hit the known Windows Vitest batch exit `3221225477`; diagnostic reruns showed every file in the crashed batch passed individually.

Next:

- Merge the Inbox repair PR after CI confirms Linux test stability.
- Schedule a separate mobile Inbox RWD pass for search/filter discoverability.
- Continue product completeness audits for Contacts, Channels, Automations, and Analytics.

## Latest - 2026-06-27 Daily AI model refresh automation

Current refresh result:

- `[x]` `npm run ai-models:refresh` passed.
- `[x]` `default-workspace` refreshed with `chatgpt=10`, `gemini=7`, `deepseek=2`, and `xai=2`.
- `[x]` No provider failures were reported.
- `[x]` `codex_cli` and `antigravity_cli` were not included in the refresh payload, matching the existing `AI_ENABLE_LOCAL_CLI` opt-in policy.

Follow-up:

- Keep local CLI providers opt-in for shared automation unless the runtime explicitly guarantees CLI installation and authentication.

## Latest - 2026-06-26 Autopilot report cleanup closeout

Current status:

- `[x]` Autopilot runner exited cleanly.
- `[x]` Removed ignored transient report artifacts, including `reports/autopilot-live.log`.
- `[x]` Re-ran reports secret-pattern scan after cleanup.
- `[x]` Reports scan returned `NO_MATCHES`.
- `[x]` Confirmed report files are ignored and not tracked by git.
- `[ ]` QA remains blocked by missing authenticated route smoke / E2E for Dashboard, Inbox, Contacts, Instagram connect, Analytics, Automations, Referrals, and Billing.
- `[ ]` Public paid launch remains blocked by Meta App Review and PayUNI production go-live.

Next:

- Add authenticated route smoke / E2E evidence for the logged-in product surfaces.
- Keep Meta App Review submission and PayUNI production checkout outside unattended automation.

## Latest - 2026-06-26 Unattended safety reviewer refresh

Current safety status:

- `[x]` Reviewed source/docs/report/git diff for the requested unattended autopilot safety checklist.
- `[x]` Confirmed tracked diff is limited to docs and `package-lock.json`.
- `[x]` Confirmed no `.env*`, Prisma/Supabase schema, Vercel config, GitHub workflow, PayUNI production switch, Meta dashboard/App Review, or custom domain alias diff.
- `[x]` Removed writable sensitive report outputs: `reports/codex-output-loop-1.md` and `reports/qa-output-loop-1.md`.
- `[x]` Rewrote `reports/safety-report.md` with exactly one safety status line.
- `[x]` `npm run lint` passed.
- `[x]` `npm test` passed.
- `[x]` `npm run build` passed.
- `[ ]` Safety remains Fail because `reports/autopilot-live.log` is locked by another process and still has secret-pattern matches.

Next:

- Stop or let finish the active autopilot/logging process that owns `reports/autopilot-live.log`.
- Delete or redact `reports/autopilot-live.log`.
- Re-run the reports secret-pattern scan and regenerate `reports/safety-report.md`.
- Keep Meta App Review submission and PayUNI production checkout outside unattended automation.

## Latest - 2026-06-26 Unattended autopilot QA reviewer refresh

Current QA status:

- `[x]` Reviewed the requested autopilot evidence set for homepage, login, dashboard, inbox, contacts, Instagram connect, analytics, automations, referrals, pricing/billing, and docs readiness.
- `[x]` Rewrote `reports/qa-report.md` with exactly one QA status line.
- `[x]` Confirmed current evidence has passing lint, test, build, PayUNI sandbox smoke, Vercel/Supabase read-only readiness, selected route smoke, and remote health checks.
- `[ ]` QA remains Fail because authenticated route smoke / E2E evidence is still missing for Dashboard, Inbox, Contacts, Instagram connect, Analytics, Automations, Referrals, and Billing.
- `[ ]` QA remains Fail because `reports/autopilot-live.log` still needs cleanup and a clean reports secret-pattern scan before reports are safe.
- `[ ]` Public paid launch remains Hold because Meta App Review and PayUNI production go-live remain manual external gates.

Next:

- Stop or let finish the active runner, clean `reports/autopilot-live.log`, then regenerate safety evidence.
- Add authenticated smoke / E2E coverage for the core logged-in product pages.
- Keep Meta App Review submission and PayUNI production checkout outside unattended automation.

## Latest - 2026-06-26 Unattended loop 1 readiness refresh

Current status:

- `[x]` Rechecked Vercel CLI auth/link; local project link exists for InboxPilot.
- `[x]` Confirmed Vercel Production env names include `TOKEN_ENCRYPTION_KEY` without printing values.
- `[x]` Confirmed Vercel Preview env names include `TOKEN_ENCRYPTION_KEY` without printing values.
- `[x]` Confirmed Supabase CLI read-only project inspection works and local link points to the test project.
- `[x]` `npm install` passed.
- `[x]` `npm run lint` passed.
- `[x]` `npm test` passed against local non-production test DB.
- `[x]` `npm run build` passed.
- `[x]` `npm run payuni:smoke` passed against sandbox.
- `[x]` `npm audit --audit-level=high` passed.
- `[x]` Current `package-lock.json` delta is from safe npm install/audit-fix handling; no new dependency was added.
- `[x]` Removed stale raw output reports with sensitive-pattern hits.
- `[ ]` `reports/autopilot-live.log` is still locked by active autopilot runner processes and must be cleaned after they finish.
- `[ ]` Authenticated route smoke / E2E remains needed for Inbox, Contacts, Analytics, Automations, Referrals, and Billing.
- `[ ]` Meta App Review and PayUNI production go-live remain external/manual.

Next:

- Let the active autopilot runner finish, then delete or redact `reports/autopilot-live.log`.
- Re-run reports secret-pattern scan and regenerate `reports/safety-report.md`.
- Add authenticated route smoke or E2E evidence for the core app surfaces.
- Do not run production deployment or PayUNI production checkout in the unattended path.

## Latest - 2026-06-26 Final autopilot stop report

Current status:

- `[x]` Rewrote `reports/final-report.md` to summarize completed work, latest failing gate, QA issues, safety issues, Vercel/Supabase/PayUNI status, exact human-required items, and rerun command.
- `[x]` Consolidated `reports/human-required.md` into exact actionable `HUMAN_REQUIRED:` lines.
- `[ ]` Autopilot remains blocked by Safety Fail until `reports/autopilot-live.log` is deleted or redacted after the logging process releases it.
- `[ ]` QA remains blocked by missing isolated test DB, missing PayUNI sandbox env, unavailable Supabase CLI, and missing local Vercel project link.

Next:

- Clean or remove `reports/autopilot-live.log`.
- Provide isolated non-production test DB and PayUNI sandbox env.
- Link Vercel project and confirm env names without printing values.
- Install/auth/link Supabase CLI for read-only inspection.
- Re-run autopilot with Production disabled.

## Latest - 2026-06-26 Unattended safety reviewer

Current safety status:

- `[x]` Reviewed current source/docs/report/git diff for secret leakage, `.env*`, Prisma/schema, Supabase/Prisma destructive command, tenant isolation, auth/webhook/payment/Meta/Vercel/domain risks.
- `[x]` Confirmed tracked diff does not modify `.env*`, Prisma schema/migrations, Vercel workflow/config, custom domain alias logic, PayUNI production switch, or Meta dashboard/submission behavior.
- `[x]` Redacted writable report outputs where safe.
- `[x]` Wrote `reports/safety-report.md`.
- `[ ]` Safety remains Fail because `reports/autopilot-live.log` is locked by an active logging process and still has secret-pattern matches.

Next:

- Stop the active autopilot/logging process that owns `reports/autopilot-live.log`.
- Delete or redact `reports/autopilot-live.log`.
- Re-run the reports secret-pattern scan and regenerate `reports/safety-report.md`.
- Do not share, archive, upload, or mark reports safe until that scan is clean.

## Latest - 2026-06-26 Unattended loop 1 QA review

Current QA status:

- `[x]` Re-reviewed unattended loop 1 evidence and rewrote `reports/qa-report.md`.
- `[x]` Confirmed `npm run lint` and `npm run build` passed in the loop evidence.
- `[x]` Confirmed Production and staging health checks returned `status=ok`.
- `[x]` Confirmed route smoke covered `/`, `/login`, `/dashboard`, `/pricing`, and `/channels/connect/instagram`.
- `[ ]` QA remains Fail because full `npm test` needs isolated DB env.
- `[ ]` QA remains Fail because PayUNI sandbox smoke needs local sandbox env values.
- `[ ]` QA remains Fail because Supabase CLI is unavailable on PATH.
- `[ ]` QA remains Fail because local Vercel project link/env-name inspection is incomplete.

Next:

- Provide isolated `TEST_DATABASE_URL` and rerun `npm test`.
- Provide PayUNI sandbox env values and rerun `npm run payuni:smoke`.
- Link the Vercel project and verify env names without printing values.
- Add authenticated route smoke or E2E evidence for inbox, contacts, analytics, automations, referrals, and billing.

## Latest - 2026-06-26 Unattended loop 1 safety hardening

Current status:

- `[x]` Hardened production detection so `NODE_ENV=production` maps to production behavior when explicit deployment markers are absent.
- `[x]` Closed the production token encryption fallback from `TOKEN_ENCRYPTION_KEY` to `AUTH_SECRET`.
- `[x]` Added regression tests for the production deployment fallback and dedicated token encryption key requirement.
- `[x]` Ran non-force `npm audit fix`, reducing audit output from 6 findings including 1 high to 2 moderate force-only findings.
- `[x]` Production and staging health checks are ok.

Validation:

```text
npm install: passed.
npx vitest run tests/security.test.ts tests/unit/core-utils.test.ts tests/meta-channel-config.test.ts --reporter=dot: passed.
npm run lint: passed.
npm run build: passed.
npm audit --audit-level=high: passed.
npm test: blocked by missing TEST_DATABASE_URL or DATABASE_URL.
npm run payuni:smoke: blocked by missing PayUNI sandbox env values.
```

Remaining:

- `[ ]` Link the local Vercel project before env-name inspection or Preview deployment.
- `[ ]` Confirm Vercel Production and Preview include `TOKEN_ENCRYPTION_KEY`.
- `[ ]` Provide isolated DB env for DB-backed tenant isolation tests.
- `[ ]` Provide PayUNI sandbox env values for sandbox smoke.
- `[ ]` Do not run `npm audit fix --force` for the remaining Next/PostCSS moderate finding without a separate dependency-upgrade task.

## Latest - 2026-06-26 Unattended autopilot package

Current status:

- `[x]` Added InboxPilot Autopilot documentation and Windows entry points.
- `[x]` Added `scripts/autopilot-full.py` to run Codex development loops, quality gates, PayUNI sandbox smoke, Vercel/Supabase readiness, route smoke, QA, safety, and final reporting.
- `[x]` Added project-specific safety guards for Meta, PayUNI, Production DB/schema, Vercel Production deployment, and secret leakage.
- `[x]` Added `docs/autopilot-code-review.md` comparing the ReplyPilot reference approach with InboxPilot-specific hardening.

Next operational step:

```powershell
$env:AUTOPILOT_MAX_LOOPS="1"
$env:INBOXPILOT_AUTOPILOT_PREVIEW_DEPLOY="0"
npm run autopilot
```

Then review:

- `reports/final-report.md`
- `reports/human-required.md`
- `reports/safety-report.md`

Hard boundary:

- Keep PayUNI sandbox.
- Do not let unattended automation submit Meta App Review.
- Do not let unattended automation write production DB/schema.
## Latest - 2026-06-26 CI / nightly authenticated route smoke

Current status:

- `[x]` Added authenticated Playwright smoke coverage for Dashboard, Inbox, Contacts, Instagram connect, Analytics, Automations, Referrals, and Billing.
- `[x]` Added CI and nightly schedule execution with a PostgreSQL service `TEST_DATABASE_URL`.
- `[x]` Added a guarded E2E admin seed script that refuses production DB and missing `TEST_DATABASE_URL`.
- `[x]` Added unit tests for missing `TEST_DATABASE_URL`, production Supabase project ref, explicit production marker, and safe local DB.

Hard boundary:

- Keep authenticated route smoke on `TEST_DATABASE_URL`; do not run it against Production DB.

## Latest - 2026-06-26 Meta / PayUNI launch package preparation

Current status:

- `[x]` Added `docs/meta-app-review-submission-package.md`.
- `[x]` Added `docs/meta-reviewer-recording-shot-list.md`.
- `[x]` Added `docs/meta-app-review-screenshot-redaction-checklist.md`.
- `[x]` Added `docs/meta-reviewer-test-asset-handoff-checklist.md`.
- `[x]` Added `docs/payuni-production-go-live-checklist.md`.
- `[x]` Meta submission package covers reviewer flow, screenshots, permission matrix, dashboard fields, redaction gate, draft text, and Go / Hold criteria.
- `[x]` PayUNI go-live checklist covers env names, PAYUNi dashboard checks, preflight, controlled enablement, callback verification, rollback, and Go / Hold criteria.
- `[x]` No Meta submission was performed.
- `[x]` No PayUNI live checkout was enabled or executed.

Remaining:

- `[ ]` Capture real Meta reviewer recording/screenshots with redaction.
- `[ ]` Fill exact Meta Dashboard permission names and complete Business Verification / Advanced Access evidence.
- `[ ]` Confirm PAYUNi production merchant approval and run operator-approved low-value live smoke.
- `[ ]` Run authenticated tenant-safe smoke using a test workspace.

## Latest - 2026-06-26 PR #2 production deployment delta

Current status:

- `[x]` PR #2 merged to `master` at `5d014be`.
- `[x]` PR #3 merged to `master` at `cf9e80c`.
- `[x]` Production deployment `dpl_2Ramd6D54Xn1qc7vxxsgXGXacUni` is Ready.
- `[x]` Controlled production deployment `dpl_GGk9zyF3r1F1hZ6ons3Fzfh6y5hL` is Ready and backs the production custom domain.
- `[x]` Production custom domain points to the PR #2 production deployment.
- `[x]` Production `/api/health` is ok.
- `[x]` Staging alias remains on Preview and `/api/health/staging` is ok.
- `[x]` Production Meta global fallback hardening is live on the formal production target.
- `[x]` Added route-level tenant isolation regression tests for channels, contacts, manual automation run, and PayUNI checkout scope.
- `[x]` Non-DB launch regression suite passed: 12 files, 43 tests.

Remaining:

- `[ ]` Run authenticated channel reconnect smoke for tenant-scoped Meta credentials.
- `[ ]` Complete Meta App Review / Advanced Access / Business Verification evidence.
- `[ ]` Complete PayUNI production merchant approval and first low-value production checkout smoke.
- `[ ]` Run DB-backed tenant isolation regression tests against staging/fresh test DB.

## Latest - 2026-06-26 Public paid launch gate cleanup

Current status:

- `[x]` Added deployment-env helper for production/staging/development/test runtime decisions.
- `[x]` Disabled production Meta global env fallback for token and Instagram business account id paths.
- `[x]` Production webhook channel config no longer adds `META_PAGE_ACCESS_TOKEN` fallback marker.
- `[x]` Instagram comment sync no longer falls back to global IG business account id in production.
- `[x]` Production execution of `scripts/refresh-meta-token.mjs` is blocked.
- `[x]` Added regression tests for production fallback disablement and non-production fallback behavior.
- `[x]` Added `docs/payuni-production-sop.md`.
- `[x]` Updated Billing, Terms, Privacy, and Data Deletion copy for controlled payments, PayUNI handling, refund/cancellation, workspace isolation, and audit retention.

Validation:

- `npx vitest run tests/meta-channel-config.test.ts tests/billing-checkout-route.test.ts`: passed.
- `npm run lint`: passed.
- `npm run build`: passed.
- `npm run payuni:smoke`: passed.
- `npm test`: blocked in the current local environment by unavailable DB-backed test connectivity.

Remaining:

- `[x]` Deploy this change through the controlled Production deployment process.
- `[x]` Re-run Production `/api/health` and public simple-release smoke after deployment.
- `[ ]` Run authenticated tenant-safe smoke after deployment.
- `[ ]` Expand tenant isolation regression tests beyond the first Meta fallback guard coverage.
- `[ ]` Complete Meta App Review / Advanced Access / Business Verification evidence.
- `[ ]` Complete PayUNI merchant review and first low-value production checkout smoke.

## Latest - 2026-06-24 Release mode implementation and smoke tests

Status: implemented locally; validated and preparing push to `master` and `staging`.

- `[x]` Add centralized release mode helper.
- `[x]` Default `inboxpilot.carry-digital-nomad.in.net` to simple release.
- `[x]` Default staging / preview / localhost to full release.
- `[x]` Allow `INBOXPILOT_RELEASE_CHANNEL` to force `simple` or `full`.
- `[x]` Hide full-only nav and connection options in simple release.
- `[x]` Block full-only routes and non-Instagram OAuth entry points in simple release proxy.
- `[x]` Add smoke tests for release detection and proxy behavior.
- `[x]` Validate with lint, build, full test suite, and Playwright e2e.
- `[ ]` Push the implementation to both `master` and `staging`.
- `[ ]` Verify Vercel deployments after both pushes complete.

Remaining risk:

- DB is still intentionally shared for now and must be split before onboarding real customers.
- Preview env completeness still needs explicit confirmation before staging is dependable for full end-to-end QA.

## Latest - 2026-06-24 Master / Staging pre-launch checklist

Status: documented; release-mode runtime implementation is now prepared for commit.

- Added `docs/master-staging-prelaunch-checklist.md`.
- Confirmed Vercel Production has `INBOXPILOT_RELEASE_CHANNEL` plus runtime secrets.
- Confirmed Vercel Preview currently lists only `INBOXPILOT_RELEASE_CHANNEL`.
- Prepared `src/lib/release-mode.ts`, proxy guards, simple-release UI filtering, and smoke tests for commit.
- Marked release-mode commit/deploy and Preview env completeness as P0 before real customer onboarding.
- DB remains temporarily shared by decision, but Vercel Preview env needs explicit confirmation before staging can be treated as production-like.

Follow-up:

1. Commit and push the release mode implementation to `master` and `staging`.
2. Decide whether Preview should temporarily share Production DB vars or receive a separate staging DB.
3. Split Production and Staging DBs before real customer onboarding.
4. Add simple/full release smoke tests for both custom domains.

## Latest - 2026-06-24 Staging alias branch guard

Status: implemented locally; needs push and first `staging` branch Preview verification.

- Updated `.github/workflows/update-staging-alias.yml` so automatic deployment-status runs only execute when `github.event.deployment.ref == 'staging'`.
- Added shell-level ref validation to reject non-manual deployment refs other than `staging`.
- Kept manual `workflow_dispatch` fallback for explicit operator-driven alias updates.
- Updated deployment, launch, readiness, security, roadmap, and session documents.
- No DB split, Prisma migration, app runtime change, OAuth, webhook, billing, or affiliate logic change was made.

Follow-up:

1. Push the workflow update to `master`.
2. Trigger a real `staging` branch Preview deployment and verify the workflow succeeds.
3. Confirm a non-staging Preview deployment no longer triggers `Update Staging Alias`.
4. Split production and staging databases before onboarding real customers.

## Latest - 2026-06-24 Staging alias workflow remote verification

Status: verified end-to-end.

- GitHub Secret `VERCEL_TOKEN` is configured.
- GitHub Secret `VERCEL_SCOPE=a25814740s-projects` is configured and required for alias ownership.
- `.github/workflows/update-staging-alias.yml` is pushed to `master`.
- A temporary `codex/staging-alias-check` branch triggered a Vercel Preview deployment and GitHub `deployment_status` event.
- `Update Staging Alias` completed successfully.
- `https://staging.carry-digital-nomad.in.net` now resolves to `https://inboxpilot-303lebjos-a25814740s-projects.vercel.app`.
- The temporary branch was deleted after verification.

Follow-up:

1. Keep `VERCEL_SCOPE` set unless the Vercel project/domain ownership changes.
2. Rotate the GitHub `VERCEL_TOKEN` before June 24, 2027, or earlier if access policy changes.
3. Review and delete the two unused project-scoped Vercel tokens created during troubleshooting from the Vercel Tokens page.
4. Split production and staging databases before onboarding real customers.

## Latest - 2026-06-24 Staging alias auto-update workflow

Status: workflow added; first remote GitHub Actions run still needs verification after push / Preview deployment.

- Added `.github/workflows/update-staging-alias.yml`.
- The workflow listens for successful non-production GitHub `deployment_status` events and updates `staging.carry-digital-nomad.in.net` to the reported Vercel Preview deployment URL.
- Added manual `workflow_dispatch` fallback for entering a Preview deployment URL directly.
- The workflow requires GitHub Secret `VERCEL_TOKEN`; `VERCEL_SCOPE` is optional for team-scoped Vercel projects.
- Source deployment host is restricted to `*.vercel.app` before running `vercel alias set`.
- No DB split, Prisma migration, app runtime change, OAuth, webhook, billing, or affiliate logic change was made.

Follow-up:

1. Add `VERCEL_TOKEN` to GitHub repository secrets before relying on the workflow.
2. Add `VERCEL_SCOPE` if the Vercel project requires a team scope.
3. Verify the first successful Preview deployment updates `https://staging.carry-digital-nomad.in.net`.
4. If staging should only follow the `staging` branch, add a branch/ref guard after inspecting the actual deployment payload.
5. Split production and staging databases before onboarding real customers.

## Latest - 2026-06-19 Production simple release / preview full release split

Status: implemented at UI / entry-point level; DB remains shared temporarily.

- Production custom domain now defaults to the simple release surface.
- Vercel Preview / localhost defaults to the full planned version.
- Added `INBOXPILOT_RELEASE_CHANNEL=simple|full` override for deployment control.
- Added Vercel Production env: `INBOXPILOT_RELEASE_CHANNEL=simple`.
- Added Vercel Preview env: `INBOXPILOT_RELEASE_CHANNEL=full`.
- Added staging alias: `https://staging.carry-digital-nomad.in.net` -> current Preview deployment.
- Simple release keeps: Home, Inbox, Contacts, Instagram platform connection, Analytics, Automations, and Referrals.
- Simple release hides or redirects: Broadcasts, Sequences, AI settings, Billing, Wallet, Affiliate, Admin payout/affiliate pages, Templates, Tags, Segments, Knowledge Base, and Mock tester.
- Simple release blocks non-Instagram OAuth entry points at the proxy layer.
- Referral remains a referral activity feature, not affiliate cash payout.
- No DB schema, OAuth callback, webhook, billing, affiliate payout, or token storage changes were made.

Follow-up:

1. Automate `staging.carry-digital-nomad.in.net` updates via branch domain or post-preview-deploy alias command.
2. Split production and staging databases before onboarding real customers.
3. Add a smoke test for simple-release route redirects and non-IG OAuth blocking.
4. Decide whether Billing should stay hidden in first launch or return as a manual-plan / contact-sales screen.
5. Fix existing Broadcast API integration test drift: `scheduledAt` mock type and malformed payload error text.

Validation:

```text
npm run lint: passed
npm run build: passed with existing Prisma Windows DLL lock fallback
npm run test:e2e: passed, 10 tests
npm test: timed out after 244 seconds
npx vitest run tests/unit tests/integration --reporter=dot: failed on existing Broadcast API integration tests
npx vercel alias set inboxpilot-ap79iimgd-a25814740s-projects.vercel.app staging.carry-digital-nomad.in.net: passed
npx vercel env add INBOXPILOT_RELEASE_CHANNEL production --value simple --yes --force --no-sensitive: passed
npx vercel env add INBOXPILOT_RELEASE_CHANNEL preview --value full --yes --force --no-sensitive: passed
```

## Latest - 2026-06-16 Meta Business Login final App Review package assembly checklist

Status: package assembly checklist documented / App Review readiness Hold / Internal beta Hold / Production implementation No-Go.

- Added `docs/meta-business-login-final-app-review-package-assembly-checklist.md`.
- Documented the final package checklist for reviewer recording, screenshots, permission proof, redaction report, test asset proof, scope reconciliation, redacted callback evidence, workspace linking dry-run, channel sync dry-run, and rollback / fallback proof.
- Documented per-file gates before App Review packaging, including redaction search, visual review, scope reconciliation, no secrets, no unmasked asset IDs, no real customer data, rollback readiness, and sign-off.
- Documented file types that must not be packaged, including raw recordings, unredacted screenshots, HAR/network exports, unsearched logs, env files, browser storage exports, database dumps, and raw Meta responses.
- Internal beta remains Hold until the actual package is assembled and all gates pass.
- Production implementation remains No-Go.

## Latest - 2026-06-16 Meta Business Login final redaction search execution report template

Status: redaction search execution report template documented / App Review readiness Hold / Internal beta Hold / Production implementation No-Go.

- Added `docs/meta-business-login-final-redaction-search-execution-report-template.md`.
- Documented the final search scope for App Review documents, reviewer recordings, screenshots, test output, server logs, audit records, browser console evidence, network exports, and final upload package.
- Documented required searches for token, authorization code, secret, raw state, raw nonce, full callback URL, and unmasked Meta asset IDs.
- Documented allowed false positive rules, finding records, cleanup and retest flow, and internal beta Hold release decision.
- Internal beta remains Hold until the template is executed against the real final package and all findings are resolved.
- Production implementation remains No-Go.

## Latest - 2026-06-16 Meta Business Login final reviewer recording shot list

Status: reviewer recording shot list documented / App Review readiness Hold / Internal beta Hold / Production implementation No-Go.

- Added `docs/meta-business-login-final-reviewer-recording-shot-list.md`.
- Mapped each current or candidate Meta / Instagram permission to required reviewer recording shots and product screens.
- Documented recording segments for workspace entry, social connection, account selection, consent, redacted callback evidence, workspace linking dry-run, channel sync dry-run, channel detail, Inbox/message proof, comment automation proof, and Business / Page / IG asset selection proof.
- Documented values that must be masked or excluded from the recording package.
- Internal beta remains Hold until final recording, redaction search, scope reconciliation, access controls, rollback proof, and product owner sign-off are complete.
- Production implementation remains No-Go.

## Latest - 2026-06-16 Meta Business Login final permission usage proof matrix

Status: permission matrix documented / App Review readiness Hold / Internal beta Hold / Production implementation No-Go.

- Added `docs/meta-business-login-final-permission-usage-proof-matrix.md`.
- Documented every current or candidate Meta / Instagram permission, product screen, user action, data read/write/store behavior, retention/deletion expectation, reviewer proof, evidence status, and recommendation.
- Recommended the minimum Instagram Business Login candidate scope set: `instagram_business_basic`, `instagram_business_manage_messages`, and `instagram_business_manage_comments`.
- Marked `instagram_business_content_publish` and `instagram_business_manage_insights` as defer/remove until real product proof and reviewer demo evidence exist.
- Kept Facebook Login for Business permissions on Hold until selected-flow reconciliation and Business / Page / IG asset proof are complete.
- Production implementation remains No-Go.

## Latest - 2026-06-16 Meta Business Login final App Review demo package checklist

Status: final demo package checklist documented / Internal beta still Hold / Production implementation No-Go.

- Added `docs/meta-business-login-final-app-review-demo-package-checklist.md`.
- Reviewer demo recording checklist is documented.
- Permission usage proof checklist is documented.
- Business / Page / IG test asset checklist is documented.
- Account selection UX, redacted callback, workspace linking dry-run, channel sync dry-run, redaction, and rollback/fallback evidence checklists are documented.
- Internal beta remains Hold until final reviewer recording, permission proof, test asset package, redaction search, beta access controls, rollback proof, and product owner sign-off are complete.
- Production implementation remains No-Go.

## Latest - 2026-06-16 Meta Business Login internal beta access rollback runbook

Status: access / rollback runbook documented / Internal beta still Hold / Production implementation No-Go.

- Added `docs/meta-business-login-sandbox-internal-beta-access-rollback-runbook.md`.
- Internal-only beta entry point conditions are documented.
- Workspace allowlist and user/admin permission conditions are documented.
- Redaction search flow is documented.
- Production write guard monitoring items are documented.
- Token exchange must-not-happen checks are documented.
- Fallback to existing Instagram OAuth flow is documented.
- Rollback / disable beta steps are documented.
- Internal beta remains Hold until access control, allowlist, final App Review package, redaction search, rollback disable path, and product owner sign-off are complete.
- Production implementation remains No-Go.

## Latest - 2026-06-16 Meta Business Login internal beta review

Status: Hold before internal beta / Production implementation No-Go.

- Added `docs/meta-business-login-sandbox-internal-beta-go-no-go-review.md`.
- Account selection UX, consent screen, callback evidence, workspace linking dry-run, channel sync dry-run, production write guard, and redaction are Pass.
- App Review readiness remains Hold until final reviewer demo materials and permission proof are complete.
- Rollback / fallback readiness is Partial Pass because production fallback remains intact, but beta rollback operations still need finalization.
- Internal beta remains Hold.
- Production implementation remains No-Go.

## Latest - 2026-06-16 Meta Business Login sandbox controlled callback captured

Status: callback evidence Pass / workspace linking and channel sync dry-run Pass.

- Production callback guard deployment: Pass.
- Instagram Business Login account selection UX: Pass.
- Consent screen reachability: Pass.
- User-authorized callback evidence: Pass.
- Redaction: Pass for callback response body.
- Token exchange attempted: false.
- Production writes all false: true.
- Workspace linking dry-run: Pass.
- Channel sync dry-run: Pass.
- Next step: manual sandbox go/no-go review for internal beta readiness and App Review evidence completeness.
- Internal beta remains Hold.
- Production implementation remains No-Go.

## 2026-06-16 - Meta Business Login sandbox SBL-12 callback capture helper

Status: targeted helper tests passed.

- Added `src/lib/meta-business-sandbox-callback-capture.ts`.
- Added `tests/meta-business-login-sandbox-sbl12-callback-capture.test.ts`.
- Added `docs/meta-business-login-sandbox-controlled-callback-capture-plan.md` and `docs/meta-business-login-sandbox-sbl12-callback-capture-test-command.md`.
- Production callback route remains unchanged; route integration and real callback evidence remain Hold.
- Next safe step is choosing Option A sandbox redirect URI or Option B narrow production callback read-only guard with tests.

## 2026-06-16 - Meta Business Login sandbox next controlled callback prompt

Status: documented next step.

- Added `docs/meta-business-login-sandbox-next-controlled-callback-prompt.md`.
- The next safe step is controlled callback capture preparation, not blindly reopening the Instagram Business Login OAuth URL.
- The prompt requires sandbox-only capture design, redaction, state / workspace validation, and production write guards before any callback evidence run.
- Internal beta remains Hold. Production implementation remains No-Go.

## 2026-06-16 - Meta Business Login sandbox OAuth profile selection evidence

Status: Partial Pass / Hold before callback.

- Added `docs/meta-business-login-sandbox-oauth-profile-selection-run-2026-06-16.md`.
- Continued the Instagram Business Login flow to profile selection and selected `carry.digital.nomad`.
- Account selection UX is now confirmed: two profiles plus "use another profile" were shown.
- Final OAuth consent and callback evidence remain missing because Instagram loaded the selected profile home page after selection.
- Next safe step is not a blind OAuth retry; it requires sandbox callback capture or explicit production-safe test callback controls.

## 2026-06-15 - Meta Business Login sandbox authenticated browser evidence

Status: Partial Pass / Hold.

- Added `docs/meta-business-login-sandbox-authenticated-browser-evidence-run-2026-06-15.md`.
- Captured InboxPilot Meta App Dashboard evidence, Instagram API setup evidence, Instagram Business Login authorize URL evidence, business login settings evidence, permissions evidence, and partial account selection UX evidence.
- Key finding: Meta-provided Instagram Business Login URL uses `force_reauth=true` and `response_type=code`.
- Key finding: account selection UX can appear with IG profiles plus "use another profile", but callback evidence was not captured because the run stopped before selecting a profile and final authorization.
- Internal beta remains Hold. Production implementation remains No-Go.

## 2026-06-15 - Meta Business Login sandbox browser evidence run

Status: Hold at Facebook login.

- Added `docs/meta-business-login-sandbox-browser-evidence-run-2026-06-15.md`.
- In-app Browser reached Facebook login for Meta Developers but did not have an authenticated Meta developer session.
- Local route guard evidence passed: unauthenticated internal sandbox route calls returned 401 dry-run errors.
- No credentials, OTP, token, authorization code, app secret, raw state, raw nonce, full callback URL, or browser storage was read or entered.
- Internal beta and production implementation remain No-Go until real Meta dialog, account selection, callback, and App Review evidence is collected.

## 2026-06-15 - Meta Business Login sandbox external evidence handoff

Status: Hold, Chrome extension UI blocker.

- Added `docs/meta-business-login-sandbox-external-evidence-handoff.md`.
- Chrome reached Meta Developers Apps, but another extension UI blocked automation before page DOM inspection.
- Next step after Chrome is unblocked: collect real Meta App Dashboard, Meta dialog, account selection UX, redacted callback, and reviewer demo evidence.
- Internal beta and production implementation remain No-Go.

## 2026-06-15 - Meta Business Login sandbox SBL-11 evidence packet

Status: targeted evidence packet tests passed.

- Added `src/lib/meta-business-sandbox-evidence.ts`.
- Added `tests/meta-business-login-sandbox-sbl11-evidence-packet.test.ts`.
- Added `docs/meta-business-login-sandbox-sbl11-evidence-packet-test-command.md`.
- The packet keeps local dry-run evidence redacted, requires production write guard evidence, and keeps internal beta / production implementation blocked until real Meta sandbox evidence and App Review gates pass.
- Existing production OAuth flow, callback routes, login buttons, env, Prisma schema, token storage, and production ConnectedAccount / Channel writes remain unchanged.

## 2026-06-15 - Meta Business Login sandbox production isolation regression

Status: targeted production isolation test passed.

- Added `tests/meta-business-login-sandbox-production-isolation.test.ts`.
- Added `docs/meta-business-login-sandbox-production-isolation-test-command.md`.
- The test checks that existing production OAuth routes, UI entry points, and Prisma schema remain free of sandbox provider ids, sandbox helper references, and `/api/internal/oauth` exposure.
- Existing production OAuth flow, callback routes, login buttons, env, Prisma schema, token storage, and production ConnectedAccount / Channel writes remain unchanged.

## 2026-06-15 - Meta Business Login sandbox route helper integration

Status: targeted route integration tests passed.

- Integrated internal sandbox routes with state / nonce redacted evidence, code exchange dry-run classifier, dry-run callback evidence, workspace allowlist spoofing guard, and production write guard metadata.
- Updated SBL-01 route tests to verify helper-chain evidence on authorize and callback responses.
- Existing production OAuth flow, existing callback routes, login buttons, env, Prisma schema, token storage, and production ConnectedAccount / Channel writes remain unchanged.

## 2026-06-15 - Meta Business Login sandbox implementation final report

Status: sandbox coding complete, production blocked.

- Added `docs/meta-business-login-sandbox-implementation-final-report.md`.
- Sandbox coding is complete for internal-only dry-run scaffold, including route skeleton, state / nonce helpers, code exchange safe stub, redaction helper, dry-run payload builder, workspace allowlist guard, production write guard, and targeted tests.
- Internal beta and production implementation remain No-Go until real Meta sandbox evidence and App Review gates pass.

## 2026-06-15 - Meta Business Login sandbox SBL-06 to SBL-08 helpers

Status: targeted helper tests passed.

- Added SBL-06 dry-run callback payload builder, SBL-07 workspace allowlist guard, and SBL-08 production write guard.
- Added targeted tests and `docs/meta-business-login-sandbox-sbl06-08-test-command.md`.
- Existing OAuth flow, callback routes, login buttons, env, Prisma schema, production ConnectedAccount, and production Channel records were intentionally not changed.
- Sandbox helper set is now ready for SBL-10 final runbook / report / go-no-go consolidation.

## 2026-06-15 - Meta Business Login sandbox SBL-05 redacted logging helper

Status: targeted helper tests passed.

- Added `src/lib/meta-business-sandbox-redaction.ts` with sandbox-only payload redaction, Meta asset id masking, audit event creation, and unsafe payload detection.
- Added `tests/meta-business-login-sandbox-sbl05.test.ts` and `docs/meta-business-login-sandbox-sbl05-test-command.md`.
- Production audit behavior, production logging format, existing OAuth routes, existing callback routes, env, and Prisma schema were intentionally not changed.
- Next step: SBL-06 dry-run callback payload builder.

## 2026-06-15 - Meta Business Login sandbox SBL-04 code exchange helper

Status: targeted helper tests passed.

- Added `src/lib/meta-business-sandbox-code-exchange.ts` with sandbox-only code exchange classification.
- The helper skips token exchange by default, redacts authorization code / token output, and classifies safe error types.
- Added `tests/meta-business-login-sandbox-sbl04.test.ts` and `docs/meta-business-login-sandbox-sbl04-test-command.md`.
- Real Meta token exchange, env changes, token storage, existing OAuth routes, existing callbacks, Prisma schema, and production writes remain blocked.
- Next step: SBL-05 redacted logging helper.

## 2026-06-15 - Meta Business Login sandbox SBL-03 state nonce helpers

Status: targeted helper tests passed.

- Added `src/lib/meta-business-sandbox-state.ts` with sandbox-only state / nonce creation, hash-only records, TTL validation, single-use replay protection, provider / workspace / user binding, and redacted audit output.
- Added `tests/meta-business-login-sandbox-sbl03.test.ts` and `docs/meta-business-login-sandbox-sbl03-test-command.md`.
- Existing OAuth state helpers, callback routes, cookies, env, Prisma schema, and production token handling were intentionally not changed.
- Next step: SBL-04 server-side code exchange helper as safe stub / classifier.

## 2026-06-15 - Meta Business Login sandbox SBL-01 internal route skeleton

Status: targeted skeleton tests passed.

- Added sandbox-only internal authorize and callback route skeletons under `/api/internal/oauth/[provider]`.
- Added `src/lib/meta-business-sandbox.ts` with internal-only guards, sandbox provider validation, workspace allowlist validation, redacted dry-run authorize payloads, redacted dry-run callback payloads, and production write guard checks.
- Added SBL-01 helper and route tests plus `docs/meta-business-login-sandbox-sbl01-test-command.md`.
- Existing OAuth routes, existing callback routes, login buttons, env, Prisma schema, and production ConnectedAccount / Channel writes were intentionally not changed.
- Next step: SBL-03 state / nonce helpers.

## 2026-06-15 - Meta Business Login sandbox SBL-09 test scaffold coding

Status: targeted scaffold tests passed.

- Added SBL-09 test scaffold under `tests/`, including fixtures, redaction assertion helper, dry-run callback payload validation, raw URL rejection, and production write guard tests.
- Added `docs/meta-business-login-sandbox-sbl09-test-command.md` and backfilled runbook, experiment report, go/no-go checklist, coding risk test plan, security review, Meta App Review checklist, and session log.
- Decision: SBL-01 internal-only route skeleton may start next under internal-only / dry-run-first / no-production-write constraints; internal beta and production implementation remain No-Go.
- Product code, OAuth routes, callback routes, login buttons, Prisma schema, and env were intentionally not changed.

## 2026-06-15 - Meta Business Login sandbox SBL-09 coding readiness checklist

Status: documented only.

- Added `docs/meta-business-login-sandbox-sbl09-coding-readiness-checklist.md` to decide whether SBL-09 sandbox test scaffold coding can begin.
- Decision: SBL-09 is Go for sandbox test scaffold coding only; SBL-01 remains Hold, and internal beta / production implementation remain No-Go.
- Product code, OAuth routes, callback routes, login buttons, Prisma schema, and env were intentionally not changed.

## 2026-06-15 - Meta Business Login sandbox SBL-09 fixture redaction spec

Status: documented only.

- Added `docs/meta-business-login-sandbox-sbl09-fixture-redaction-spec.md` to define fixture naming, safe / unsafe fixture boundaries, redaction assertions, dry-run callback snapshots, production write guard fixtures, and evidence search standards.
- SBL-09 remains pre-coding documentation until the fixture and redaction rules are accepted as the required scaffold boundary; SBL-01, internal beta, and production implementation remain blocked.
- Product code, OAuth routes, callback routes, login buttons, Prisma schema, and env were intentionally not changed.

## 2026-06-15 - Meta Business Login sandbox SBL-09 test suite spec

Status: documented only.

- Added `docs/meta-business-login-sandbox-sbl09-test-suite-spec.md` to define the minimum sandbox test suite before SBL-01 route work.
- The spec covers internal-only route tests, workspace allowlist tests, state / nonce / code exchange tests, redacted logging tests, dry-run callback payload tests, and production write guard tests.
- Product code, OAuth routes, callback routes, login buttons, Prisma schema, and env were intentionally not changed.

## 2026-06-15 - Meta Business Login sandbox coding kickoff checklist

Status: documented only.

- Added `docs/meta-business-login-sandbox-coding-kickoff-checklist.md` to define kickoff checks before SBL-09 and SBL-01.
- The checklist separates test-suite scaffold readiness from route skeleton readiness, defines internal-only / dry-run-first / no-production-write checks, redaction search standards, required document backfills, and current internal beta / production blocks.
- Product code, OAuth routes, callback routes, login buttons, Prisma schema, and env were intentionally not changed.

## 2026-06-15 - Meta Business Login sandbox final readiness review

Status: documented only.

- Added `docs/meta-business-login-sandbox-final-readiness-review.md` to assess whether the sandbox document set is ready for coding.
- Conclusion: documentation is mostly ready, sandbox coding remains Hold until go/no-go is explicitly marked, and internal beta / production implementation remain No-Go.
- Recommended first coding-prep task is SBL-09 test suite scaffold planning before SBL-01 internal-only route skeleton.
- Product code, OAuth routes, callback routes, login buttons, Prisma schema, and env were intentionally not changed.

## 2026-06-15 - Meta Business Login sandbox coding task breakdown

Status: documented only.

- Added `docs/meta-business-login-sandbox-coding-task-breakdown.md` to break future sandbox coding into internal-only / dry-run-first tasks.
- The breakdown lists each task's prerequisite gates, test requirements, files and flows that must not be modified, and how to backfill runbook / report / go-no-go checklist evidence.
- Product code, OAuth routes, callback routes, login buttons, Prisma schema, and env were intentionally not changed.

## 2026-06-15 - Meta Business Login sandbox document index

Status: documented only.

- Added `docs/meta-business-login-sandbox-doc-index.md` to index all Meta Business Login sandbox research, planning, template, go/no-go, coding draft, and risk test plan documents.
- The index defines reading order, document purpose, decision path, template / draft status, unpassed gates, and the current block on production implementation.
- Product code, OAuth routes, callback routes, login buttons, Prisma schema, and env were intentionally not changed.

## 2026-06-15 - Meta Business Login sandbox coding risk test plan

Status: documented only.

- Added `docs/meta-business-login-sandbox-coding-risk-test-plan.md` to define pre-coding risks and tests for internal-only routes, sandbox provider interface, state / nonce / code exchange, redacted logging, dry-run payloads, workspace allowlist, and production Channel write guards.
- The plan defines the minimum checklist required before sandbox coding can start and keeps the decision at Hold if any gate is incomplete.
- Product code, OAuth routes, callback routes, login buttons, Prisma schema, and env were intentionally not changed.

## 2026-06-15 - Meta Business Login sandbox coding spec draft

Status: documented only.

- Added `docs/meta-business-login-sandbox-coding-spec-draft.md` to define the pre-coding technical draft for an internal-only sandbox Meta Business Login prototype.
- The draft covers internal-only route behavior, sandbox provider interface, state / nonce / code exchange helpers, redacted logging, dry-run callback payloads, workspace allowlist rules, production Channel write guards, and the explicit boundary that production OAuth flow, callback, button, env, schema, ConnectedAccount, and Channel remain unchanged.
- Product code, OAuth routes, callback routes, login buttons, Prisma schema, and env were intentionally not changed.

## 2026-06-15 - Meta Business Login sandbox go/no-go checklist

Status: documented only.

- Added `docs/meta-business-login-sandbox-go-no-go-checklist.md` to define decision gates for sandbox coding, internal beta, and production implementation readiness.
- The checklist covers App Review, account selection UX, callback security, workspace linking, channel sync, redaction, rollback, and the differences between sandbox coding, internal beta, and production implementation gates.
- Product code, OAuth routes, callback routes, login buttons, Prisma schema, and env were intentionally not changed.

## 2026-06-15 - Meta Business Login sandbox experiment report template

Status: documented only.

- Added `docs/meta-business-login-sandbox-experiment-report-template.md` as the first blank report template for summarizing sandbox-only Meta Business Login experiment results.
- The template captures experiment summary, test matrix coverage, Meta dialog UX, callback / workspace linking / channel sync results, redaction search results, ManyChat UX proximity, App Review risk, and go / hold / no-go decision.
- Product code, OAuth routes, callback routes, login buttons, Prisma schema, and env were intentionally not changed.

## 2026-06-15 - Meta Business Login sandbox runbook template

Status: documented only.

- Added `docs/meta-business-login-sandbox-runbook-template.md` as the execution record template for sandbox-only Meta Business Login experiments.
- The template covers pre-test checks, Meta App Dashboard settings, redacted authorize URL / callback payload records, account selection UX observations, workspace linking / channel sync checks, redaction search results, and go / no-go decision gates.
- Product code, OAuth routes, callback routes, login buttons, Prisma schema, and env were intentionally not changed.

## 2026-06-15 - Meta Business Login sandbox implementation plan

Status: documented only.

- Added `docs/meta-business-login-sandbox-implementation-plan.md` to define a sandbox-only experiment plan before any product implementation.
- The plan keeps production `meta-instagram` unchanged and requires isolated sandbox provider ids, separate env planning, callback state / nonce / code exchange security, redacted logging, App Review gates, workspace linking validation, and rollback criteria.
- Product code, OAuth routes, callback routes, login buttons, Prisma schema, and env were intentionally not changed.

## 2026-06-15 - AI model cache refresh automation

- Operational check only: `npm run ai-models:refresh` passed on 2026-06-15.
- Remote provider cache result remained stable across all 6 workspaces: `chatgpt 10`, `gemini 7`, `deepseek 2`, `xai 2`.
- `codex_cli` and `antigravity_cli` were still absent from the refresh payload without throwing errors, matching the existing local CLI gating behavior noted in automation memory.

## 2026-06-15 - Meta Business Login ADR before implementation

Status: documented only.

- Added an ADR for evaluating Facebook Login for Business, Instagram Business Login, and keeping the current Instagram OAuth flow before any product implementation.
- Recommendation: proceed only with sandbox-only research / implementation planning, not production replacement.
- Required gates before production: App Review readiness, env isolation, callback state / nonce / code exchange review, ConnectedAccount / Channel mapping, workspace linking isolation, channel sync failure handling, and token / code / secret redaction verification.
- Product code, OAuth routes, callback routes, login buttons, and env were intentionally not changed.

## 2026-06-15：Meta Account Selection 測試矩陣

- 新增 `docs/meta-business-login-account-selection-test-matrix.md`，定義未登入、單一登入、多帳號 session、桌機 / 手機、popup / redirect transport 的測試矩陣。
- 後續建議先用矩陣測目前 `meta-instagram` baseline，再測 Facebook Login for Business / Instagram Business Login sandbox flow，最後再決定是否進入產品實作。

## 2026-06-15：Meta App Review Demo Script

- 新增 `docs/meta-business-login-app-review-demo-script.md`，補齊 Facebook Login for Business / Instagram Business Login 的 reviewer demo、permission usage table、資料使用方式與不通過 App Review 的備援方案。
- 下一步若繼續文件任務，建議建立 account selection 測試矩陣，記錄未登入、單一登入、多帳號 session 下 Meta dialog 畫面與 callback 結果。

## 2026-06-15：Business Login 實驗規格

- 新增 `docs/meta-business-login-experiment-spec.md`，定義 Facebook Login for Business / Instagram Business Login 的文件型研究任務與實驗範圍。
- 後續不應直接改正式 OAuth flow；應先用 sandbox-only provider 或文件化手動 URL 驗證 account selection、callback payload、workspace linking 與 App Review 需求。
- 下一步建議補 `docs/meta-business-login-app-review-demo-script.md`，把 reviewer demo、permission usage、資料使用位置與 redaction checklist 寫清楚。

## 2026-06-15：Meta Login 帳號選擇研究待辦

- 已新增 `docs/meta-login-account-selection-analysis.md`，記錄目前 Instagram OAuth、Facebook OAuth、legacy Meta Business Login 相容路徑與 ManyChat 差異。
- 後續建議：
  - 評估 Facebook Login for Business / Business Login for Instagram 是否可成為正式 account selection flow。
  - 在實驗分支測試 `force_reauth`、`force_authentication`、`enable_fb_login` 對不同瀏覽器 session 的實際效果。
  - 調整 UI 文案，避免承諾「一定能強制切換帳號」。
  - 若導入 login configuration / `config_id`，同步更新 Meta App Review 文件與 QA demo script。

更新日期：2026-06-10

## 目前驗證狀態

已執行：

```bash
git status
npm run lint
npm run build
npm test
npm run payuni:smoke
```

結果：

- `git status`：有本輪預期變更
- `npm run lint`：通過
- `npm run build`：通過
- `npm test`：第一次遇到既有 Vitest 子程序 crash，第二次完整通過
- `npm run payuni:smoke`：通過

補充：

- `npm run build` 仍有既有 Prisma engine DLL lock `EPERM` 噪音
- `scripts/prisma-generate-safe.mjs` 已 fallback 到既有 generated client，因此不構成 build failure

## Phase 0：正式販售前 blocker

### 任務 1：修正 billing interval 與 subscription correctness

狀態：`已完成`

檔案：

- `src/lib/billing/payment-service.ts`
- `src/app/api/billing/payuni/checkout/route.ts`
- `prisma/schema.prisma`
- `prisma/migrations/20260610113000_payment_order_interval/migration.sql`
- `tests/payuni-billing.test.ts`
- `tests/billing-checkout-route.test.ts`
- `src/lib/audit.ts`

完成內容：

- `PaymentOrder` 新增 `interval`
- checkout 建立 payment order 時保存實際 month / year
- completion 改用 `order.interval`
- zero-amount / credit-only checkout 改走 internal completion flow
- completion success / failure 補安全 audit
- 補 month / year / zero-amount / idempotency 測試

### 任務 2：production 移除 Meta env token fallback

狀態：`未完成`

檔案：

- `src/lib/channels/meta.ts`
- `src/app/api/webhooks/meta/route.ts`
- `src/lib/instagram/comments-sync.ts`
- `scripts/refresh-meta-token.mjs`

具體任務：

- production 停用 `META_*` env fallback
- 強制 channel token / account binding
- 補 tenant isolation regression tests

### 任務 3：收斂 Meta OAuth production 主流程

狀態：`未完成`

檔案：

- `src/app/api/meta/oauth/start/route.ts`
- `src/app/api/meta/oauth/callback/route.ts`
- `src/app/api/oauth/[provider]/authorize/route.ts`
- `src/app/api/oauth/[provider]/callback/route.ts`
- `src/lib/oauth/providers/meta-facebook.ts`
- `src/lib/oauth/providers/meta-instagram.ts`

具體任務：

- 收斂 generic / legacy callback 混線
- 明確定義 Page / IG Business Account 選擇與重連流程
- 補 reviewer / QA demo 支援文件

### 任務 4：整理 Billing / legal / README 亂碼與對外文案

狀態：`未完成`

檔案：

- `README.md`
- `docs/project-launch-checklist.md`
- `docs/environment-variables.md`
- `src/lib/billing/plans.ts`
- `src/app/billing/page.tsx`
- `src/app/privacy-policy/page.tsx`
- `src/app/terms-of-service/page.tsx`
- `src/app/data-deletion/page.tsx`

具體任務：

- 統一 UTF-8
- 補齊繁中對外文案
- 明確標示 sandbox / production / trial / refund / cancellation 說明

### Phase 0 驗證指令

```bash
npm run lint
npm run build
npm test
npm run payuni:smoke
```

## Phase 1：Beta 試賣必修

### 任務 1：補齊 plan enforcement

檔案：

- `src/lib/billing/entitlements.ts`
- `src/app/api/sequences/route.ts`
- `src/app/api/automations/route.ts`
- `src/app/api/broadcasts/route.ts`

具體任務：

- 補 `sequences`
- 補 `teamSeats`
- 補 `activeContacts`
- 補 usage summary 與 quota gate 一致性

### 任務 2：補 trial / expired / past_due / unpaid 產品行為

檔案：

- `src/lib/billing/usage-service.ts`
- `src/lib/billing/entitlements.ts`
- `src/app/billing/page.tsx`

### 任務 3：補 onboarding / reconnect UX

檔案：

- `src/app/channels/connect/social/page.tsx`
- `src/app/channels/connect/success/page.tsx`
- `src/app/channels/page.tsx`

### 任務 4：補 affiliate terms / refund policy / cookie policy

檔案：

- `src/app/**`
- `docs/**`

### Phase 1 驗證指令

```bash
npm run lint
npm run build
npm test
npm run test:e2e
```

## Phase 2：公開販售必修

### 任務 1：完成 Meta App Review / Advanced Access / Business Verification

檔案：

- `docs/meta-app-review-checklist.md`
- Meta Developer 後台設定

### 任務 2：完成 PayUNI production go-live

檔案：

- `src/app/api/billing/payuni/checkout/route.ts`
- deployment env / runbook

### 任務 3：補 affiliate anti-fraud / payout reconciliation

檔案：

- `src/lib/billing/referral-service.ts`
- `src/lib/billing/affiliate-service.ts`
- `src/app/api/admin/**`

### 任務 4：補 billing / webhook / admin observability

檔案：

- `src/lib/audit.ts`
- `src/app/api/**`
- `scripts/**`

### Phase 2 驗證指令

```bash
npm run lint
npm run build
npm test
npm run test:e2e
npm run payuni:smoke
```

## Phase 3：規模化優化

### 任務 1：高併發與 load test 收斂

檔案：

- `src/lib/queue.ts`
- `scripts/worker.ts`
- `src/lib/messages.ts`
- `src/lib/instagram/comments-sync.ts`
- `src/app/api/dashboard/route.ts`

### 任務 2：queue-first ingestion / durable processing

檔案：

- `src/lib/jobs.ts`
- `src/lib/queue.ts`
- `scripts/worker.ts`

### 任務 3：補齊正式 channel productization

檔案：

- `src/lib/channels/**`
- `src/app/channels/**`

### Phase 3 驗證指令

```bash
npm run lint
npm run build
npm test
npm run test:e2e
npm run load:test
```

## 下一個建議 Codex 任務

```text
請先閱讀 AGENTS.md、docs/product-readiness-review.md、docs/security-review.md、docs/meta-app-review-checklist.md、docs/billing-affiliate-readiness.md、docs/fix-roadmap.md，然後只修 Phase 0 任務 2：

1. 在 production 模式移除 Meta env token fallback
2. 保留 local / sandbox 開發可用性，但正式環境必須強制使用 channel token
3. 補 tenant isolation regression tests，覆蓋 webhook、comment sync、send message
4. 更新 docs/codex-session-log.md、docs/fix-roadmap.md、docs/security-review.md、docs/product-readiness-review.md

限制：
- 不要大重構
- 不要改 Meta OAuth 主流程
- 先列出風險
- 完成後跑 npm run lint、npm run build、npm test
```
## 2026-06-16 - Meta Business Login Sandbox SBL-12 Callback Capture Guard

Completed:

- Added signed-state sandbox callback capture marker support.
- Added read-only sandbox callback capture guard to the Meta OAuth callback route.
- Added route-level regression test proving non-sandbox invalid-state callbacks still use the existing redirect path.
- Added callback capture test command documentation.

Still blocked:

- Real callback evidence has not been captured yet.
- Workspace linking and channel sync remain dry-run only.
- Internal beta remains Hold.
- Production implementation remains No-Go.
- Production callback deployment was blocked by CI because GitHub Actions still used SQLite for `npm test`; CI has been updated to use PostgreSQL service credentials.

Next best step:

```text
Run sandbox-only workspace linking and channel sync dry-run validation using the captured redacted callback evidence. Do not create production ConnectedAccount / Channel.
```

Controlled consent run status:

- Production callback guard deployment: Pass.
- Account selection UX: Pass.
- Consent screen reachability: Pass.
- Real callback evidence: Pass after the user clicked allow.
- Workspace linking: Hold.
- Channel sync: Hold.

## 2026-06-16 - Daily AI model refresh automation status

Current refresh result:

- `npm run ai-models:refresh` passed.
- Refreshed provider counts stayed at `chatgpt=10`, `gemini=7`, `deepseek=2`, `xai=2` across all workspaces.
- `codex_cli` and `antigravity_cli` were not refreshed because `AI_ENABLE_LOCAL_CLI` is unset, so `canUseAiProvider()` skips local CLI providers.

Follow-up:

- Decide whether the daily automation should keep local CLI providers opt-in only, or enable them explicitly in the refresh environment.
## 2026-06-17 - Daily AI model refresh automation status

Current refresh result:

- `npm run ai-models:refresh` passed.
- Refreshed provider counts stayed at `chatgpt=10`, `gemini=7`, `deepseek=2`, `xai=2` across all 6 workspaces.
- `codex_cli` and `antigravity_cli` were not refreshed because `AI_ENABLE_LOCAL_CLI` is unset, so `canUseAiProvider()` still skips local CLI providers.

Follow-up:

- Decide whether the daily automation should keep local CLI providers opt-in only, or enable them explicitly in the refresh environment.
## 2026-06-18 - Daily AI model refresh automation status

Current refresh result:

- `npm run ai-models:refresh` passed.
- Refreshed provider counts stayed at `chatgpt=10`, `gemini=7`, `deepseek=2`, `xai=2` across all 6 workspaces.
- `codex_cli` and `antigravity_cli` were not refreshed because `refreshAllAiModels()` skips providers that fail `canUseAiProvider()`, and local CLI providers remain disabled while `AI_ENABLE_LOCAL_CLI` is unset outside local development.

Follow-up:

- Keep local CLI providers opt-in for now, or explicitly enable `AI_ENABLE_LOCAL_CLI` in the automation environment if stale CLI model caches become a problem.
## 2026-06-19 - Daily AI model refresh automation status

Current refresh result:

- `npm run ai-models:refresh` passed.
- Refreshed provider counts stayed at `chatgpt=10`, `gemini=7`, `deepseek=2`, `xai=2` across all 6 workspaces.
- `codex_cli` and `antigravity_cli` were not refreshed because `refreshAllAiModels()` only includes providers that pass `canUseAiProvider()`, and local CLI providers remain disabled while `AI_ENABLE_LOCAL_CLI` is unset outside local development.

Follow-up:

- If this automation must also refresh local CLI caches, enable `AI_ENABLE_LOCAL_CLI=true` in the automation environment first.

## 2026-06-19 - Daily AI model refresh automation status

Current refresh result:

- `npm run ai-models:refresh` passed.
- Refreshed provider counts stayed at `chatgpt=10`, `gemini=7`, `deepseek=2`, `xai=2` across all 6 workspaces.
- `codex_cli` and `antigravity_cli` were not refreshed because `refreshAllAiModels()` only includes providers that pass `canUseAiProvider()`, and local CLI providers remain disabled while `AI_ENABLE_LOCAL_CLI` is unset outside local development.

Follow-up:

- If this automation must also refresh local CLI caches, enable `AI_ENABLE_LOCAL_CLI=true` in the automation environment first.
## 2026-06-19 - AI local CLI refresh policy

Decision:

- Do not enable `AI_ENABLE_LOCAL_CLI=true` in the shared daily automation environment by default.
- Keep `codex_cli` and `antigravity_cli` as explicit opt-in providers for local development or a machine that is known to have the CLI installed and authenticated.

Reason:

- Daily shared cron should not depend on local CLI installation state, login state, or machine-specific PATH / cache files.
- API-backed providers already cover the stable shared refresh path.

Follow-up:

- If the team later wants CLI providers in automation, enable `AI_ENABLE_LOCAL_CLI=true` only in a runtime that also guarantees CLI installation and authentication.
- Keep docs and env examples explicit that local CLI refresh is opt-in.
## 2026-06-20 - Daily AI model refresh automation status

Current refresh result:

- `npm run ai-models:refresh` passed.
- Refreshed provider counts stayed at `chatgpt=10`, `gemini=7`, `deepseek=2`, `xai=2` across all 6 workspaces.
- `codex_cli` and `antigravity_cli` were not refreshed because `refreshAllAiModels()` only includes providers that pass `canUseAiProvider()`, and local CLI providers remain disabled while `AI_ENABLE_LOCAL_CLI` is unset outside local development.
- No provider failures were reported in this run.

Follow-up:

- Keep local CLI providers opt-in for shared automation unless the runtime explicitly guarantees CLI installation and authentication.

## 2026-06-26 - Alias workflow PR safety

- `[x]` Prepare alias workflow changes on a non-default branch instead of pushing directly to `master`.
- `[x]` Harden staging alias automation so Production deployments cannot update `staging.carry-digital-nomad.in.net`.
- `[x]` Add Production alias automation so only Ready Production deployments can update `inboxpilot.carry-digital-nomad.in.net`.
- `[x]` Document the Vercel `autoAssignCustomDomains=false` operating model and manual fallback commands.
- `[x]` Confirmed the draft PR branch created a Ready Vercel Preview deployment and no Production deployment.

## 2026-06-21 - Daily AI model refresh automation status

Current refresh result:

- `npm run ai-models:refresh` passed.
- Refreshed provider counts stayed at `chatgpt=10`, `gemini=7`, `deepseek=2`, `xai=2` across all 6 workspaces.
- `codex_cli` and `antigravity_cli` were not refreshed because `refreshAllAiModels()` only includes providers that pass `canUseAiProvider()`, and local CLI providers remain disabled while `AI_ENABLE_LOCAL_CLI` is unset outside local development.
- No provider failures were reported in this run.

Follow-up:

- Keep local CLI providers opt-in for shared automation unless the runtime explicitly guarantees CLI installation and authentication.

## 2026-06-22 - Daily AI model refresh automation status

Current refresh result:

- `npm run ai-models:refresh` passed.
- Refreshed provider counts stayed at `chatgpt=10`, `gemini=7`, `deepseek=2`, `xai=2` across all 6 workspaces.
- `codex_cli` and `antigravity_cli` were not refreshed because `canUseAiProvider()` only enables local CLI providers when `AI_ENABLE_LOCAL_CLI` is truthy, or when running local development outside Vercel.
- No provider failures were reported in this run.

Follow-up:

- Keep local CLI providers opt-in for shared automation unless the runtime explicitly guarantees CLI installation and authentication.
## 2026-06-23 - Daily AI model refresh automation status

Current refresh result:

- `npm run ai-models:refresh` passed.
- Refreshed provider counts stayed at `chatgpt=10`, `gemini=7`, `deepseek=2`, `xai=2` across all 6 workspaces.
- `codex_cli` and `antigravity_cli` were not refreshed because local CLI providers remain gated behind `AI_ENABLE_LOCAL_CLI` opt-in behavior.
- No provider failures were reported in this run.

Follow-up:

- Keep local CLI providers opt-in for shared automation unless the runtime explicitly guarantees CLI installation and authentication.
## 2026-06-24 - Daily AI model refresh automation status

Current refresh result:

- `npm run ai-models:refresh` passed.
- Refreshed provider counts stayed at `chatgpt=10`, `gemini=7`, `deepseek=2`, `xai=2` across all 6 workspaces.
- `codex_cli` and `antigravity_cli` were not refreshed because local CLI providers remain gated behind `AI_ENABLE_LOCAL_CLI` opt-in behavior.
- No provider failures were reported in this run.

Follow-up:

- Keep local CLI providers opt-in for shared automation unless the runtime explicitly guarantees CLI installation and authentication.

## 2026-06-26 - Public paid launch control room

Current status:

- `[x]` PR #5 is merged into `master`.
- `[x]` Master CI passed after merge.
- `[x]` Production and staging health checks are ok.
- `[x]` Production and staging aliases remain mutually isolated.
- `[x]` Meta App Review submission package and reviewer handoff documents are merged.
- `[x]` PayUNI production go-live checklist is merged.
- `[x]` Added `docs/public-paid-launch-control-room.md` as the final launch decision hub.

Remaining:

- `[ ]` Meta App Review / Advanced Access / Business Verification approval.
- `[ ]` Final reviewer recording, screenshot package, permission proof, and redaction sign-off.
- `[ ]` PAYUNi production merchant approval.
- `[ ]` Controlled `PAYUNI_ALLOW_PRODUCTION=true` enablement.
- `[ ]` First low-value production checkout smoke.
- `[ ]` Final billing/legal/support owner sign-off.

Decision:

- Private beta / whitelist remains Go.
- Public paid launch remains Hold until the external Meta and PayUNI gates are completed.

## 2026-06-26 - Meta App Review operator workbook

Current status:

- `[x]` Added `docs/meta-app-review-operator-submission-workbook.md`.
- `[x]` Consolidated the Meta App Review preparation flow into one operator-facing workbook.
- `[x]` Included recording steps, screenshot list, Meta Dashboard fields, permission mapping, redaction review, and upload manifest.
- `[x]` Added `docs/meta-app-review-day-of-recording-run-card.md` as a concise day-of checklist for the human operator.
- `[ ]` Capture final reviewer recording and screenshots.
- `[ ]` Prepare reviewer-safe credentials through secure handoff.
- `[ ]` Manually fill Meta Dashboard fields.
- `[ ]` Manually submit App Review.

Decision:

- Meta App Review package preparation is ready for human execution.
- Public paid launch remains Hold until Meta approval is actually granted.

## 2026-06-26 - Autopilot local readiness closeout

Current status:

- `[x]` Supabase CLI is installed and authenticated through a secure local token input flow.
- `[x]` Supabase CLI can read production ref `lmwvzskffzozuiamjxvc` and staging ref `ndhtwqtshselqwgjenjd`.
- `[x]` Local Supabase CLI context is linked to staging ref `ndhtwqtshselqwgjenjd`.
- `[x]` Vercel CLI is linked to the InboxPilot project.
- `[x]` Staging Preview env metadata can be pulled through Vercel CLI without printing values.
- `[x]` PayUNI sandbox env is available locally in ignored `.env.local`.
- `[x]` `npm run payuni:smoke` passes against sandbox.
- `[x]` Local test DB env uses local Supabase Postgres, not production.
- `[x]` `npm test`, `npm run lint`, and `npm run build` pass.
- `[x]` `npm audit --audit-level=high` passes.
- `[ ]` Two moderate dependency advisories remain; do not apply npm's force downgrade path automatically.
- `[ ]` Meta App Review approval remains external/manual.
- `[ ]` PayUNI production merchant approval and live low-value smoke remain external/manual.

Decision:

- Autopilot local execution readiness: Go for sandbox/test-safe unattended runs.
- Public paid launch: Hold until Meta and PayUNI external gates are complete.

## 2026-06-27 - Contacts sidebar tag creation

Current status:

- `[x]` Converted the Contacts sidebar tag Plus icon from a static Lucide icon into an accessible button.
- `[x]` Added a lightweight create-tag dialog with tag name input, color picker, and preset color swatches.
- `[x]` Reused the existing `/api/tags` POST route for auth, same-origin validation, workspace scoping, and database writes.
- `[x]` Refreshes the Contacts Server Component after successful creation so the new tag appears in the sidebar.

Validation:

- `npm run lint`: passed.
- `npx vitest run tests/integration/api-routes.test.ts -t tags --reporter=dot`: passed.
- `npm run build`: passed.
- `npm test`: passed.
- `npm run test:e2e`: passed with existing authenticated smoke skips.

Remaining:

- `[ ]` Implement the Contacts filter button behavior.
- `[ ]` Implement sidebar tag filtering.
- `[ ]` Implement contact selection batch actions, including batch add/remove tag.

## 2026-06-27 - Contact detail edit and tag management

Current status:

- `[x]` Reworked Contact detail from dark zinc panels to the bright Contacts page theme.
- `[x]` Added editable username, email, and phone fields with save/cancel controls.
- `[x]` Added contact-level tag assignment and removal.
- `[x]` Added `PATCH /api/contacts/[id]` for contact updates and optional custom field upserts.
- `[x]` Hardened contact tag writes with same-origin and workspace-scoped tag validation.

Validation:

- `npm run lint`: passed.
- `npx vitest run tests/tenant-isolation-routes.test.ts --reporter=dot`: passed.
- `npx vitest run tests/integration/api-routes.test.ts -t tags --reporter=dot`: passed.
- `npm run build`: passed.
- `npm run test:e2e`: passed with existing authenticated smoke skips.
- `npm test`: blocked by intermittent Windows/Vitest child-process crash code `3221225477`; focused tests passed.

Remaining:

- `[ ]` Add authenticated Playwright smoke for Contact detail edit/save/cancel and tag add/remove.
- `[ ]` Continue Contacts page feature completion: filter button, sidebar tag filter, and batch actions.

## 2026-06-27 - Meta OAuth error UX

Current status:

- `[x]` Legacy `/api/meta/oauth/start` now defaults to Instagram instead of Facebook.
- `[x]` Simple release proxy allows `/api/meta/oauth/start` with no mode and still blocks explicit `mode=facebook`.
- `[x]` Meta OAuth callback maps invalid state, cancelled authorization, missing permissions, no usable IG channel, and Meta config failures to safe Chinese messages.
- `[x]` `/channels/connect/social` renders `meta_error` in a prominent red alert with `meta_error_code`.
- `[x]` Focused tests cover error mapping, invalid-state redirect, and simple proxy behavior.

Remaining:

- `[ ]` Add browser smoke for visible `meta_error` alert rendering.
- `[ ]` Add browser smoke confirming simple release does not show `meta-facebook` or Facebook MBS entry points.
- `[ ]` Complete Meta App Review / Advanced Access / Business Verification before public paid launch.

## 2026-06-27 - Simple release gated feature notice

Current status:

- `[x]` Full-only simple-release redirects now preserve intent through `alert=feature_gated`.
- `[x]` Redirects include a route-derived `feature` key such as `billing`, `broadcasts`, or `ai-settings`.
- `[x]` Dashboard renders a warning toast that explains controlled production enablement and links to the Staging full release.
- `[x]` Release proxy test coverage was updated.

Remaining:

- `[ ]` Add Playwright smoke for the `/billing` to Dashboard gated-feature toast flow.
- `[ ]` Continue reducing hidden/disabled simple-release paths so users do not need to discover gated routes by trial and error.

## 2026-06-27 - Contacts filters and batch tagging

Current status:

- `[x]` Converted the Contacts filter button into a real filter panel.
- `[x]` Added query-backed status and tag filtering on the Contacts page.
- `[x]` Converted sidebar contact status and tag items into real filter navigation.
- `[x]` Added contact row selection and selected-contact batch add tag.
- `[x]` Added `POST /api/contacts/batch-tags` with same-origin, auth, workspace tag validation, and workspace / selected-IG contact scoping.
- `[x]` Extended authenticated Playwright smoke to cover filter, tag filter, and batch add tag.

Validation:

- `npx vitest run tests/tenant-isolation-routes.test.ts --reporter=dot`: passed.
- `npm run lint`: passed.
- `npm run build`: passed.
- `npm test`: passed.
- `npm run test:e2e:auth`: passed with local/test `TEST_DATABASE_URL`.

Remaining:

- `[ ]` Add batch remove tag.
- `[ ]` Add "create Segment from current filter" if operators need reusable filtered audiences.
- `[ ]` Add empty-state guidance for filtered Contacts so users know how to clear filters.

## 2026-06-27 - Authenticated Playwright smoke closeout

Current status:

- `[x]` Contact detail edit/cancel/save success toast is covered by authenticated Playwright smoke.
- `[x]` Contact detail tag add/remove is covered by authenticated Playwright smoke.
- `[x]` Meta OAuth failure alert rendering is covered by simple-release Playwright smoke.
- `[x]` Simple release provider visibility is covered by Playwright smoke; Facebook / Meta Login and `meta-facebook` are hidden.
- `[x]` Simple release `/billing` gate redirect and Dashboard feature notice are covered by Playwright smoke.
- `[x]` Single-contact tag add is duplicate-safe under parallel tests through `createMany({ skipDuplicates: true })`.

Remaining:

- `[x]` Split full-release and simple-release Playwright smoke into separate CI jobs.
- `[ ]` Keep Meta App Review and PayUNI production go-live as manual external gates.

## 2026-06-27 - Playwright smoke CI split

Current status:

- `[x]` Moved Contacts browser smoke into `tests/e2e/contacts-auth.spec.ts`.
- `[x]` Moved simple-release browser smoke into `tests/e2e/simple-release.spec.ts`.
- `[x]` Kept public/auth general route smoke in `tests/e2e/public-and-auth.spec.ts`.
- `[x]` Added `npm run test:e2e:contacts`.
- `[x]` Added `npm run test:e2e:simple`.
- `[x]` Added CI `full-release-auth-smoke` job with `INBOXPILOT_RELEASE_CHANNEL=full`.
- `[x]` Added CI `simple-release-smoke` job with `INBOXPILOT_RELEASE_CHANNEL=simple`.
- `[x]` Both CI smoke jobs use `TEST_DATABASE_URL` and the existing production DB guard.

Remaining:

- `[ ]` Push/open a PR for the CI split changes so GitHub Actions can run `full-release-auth-smoke` and `simple-release-smoke` remotely.
- `[ ]` Monitor the first remote GitHub Actions run that actually contains the two split smoke jobs.

Remote check:

- 2026-06-27 checked GitHub Actions run `28264282091`.
- Result was success, but the run only contained the older `lint-test` job on commit `541f9ae47991cca35890b6757c1314903e6e7fed`.
- No remote flakes were available to fix yet because the split CI workflow is still local.

## 2026-06-27 - Contacts batch remove and segment-from-filter

Current status:

- `[x]` Added selected-contact batch remove tag through `DELETE /api/contacts/batch-tags`.
- `[x]` Added Contacts "建立分眾" dialog.
- `[x]` Added `POST /api/contacts/segments` to persist current Contacts filters as Segment filters.
- `[x]` Segment filters now support `q` search conditions.
- `[x]` Batch remove and segment creation enforce auth, same-origin, workspace tag validation, and selected Instagram channel / workspace scoping.
- `[x]` Authenticated Playwright smoke covers batch add, batch remove, create segment, contact detail edit, and contact detail tag management.
- `[x]` Smoke fixtures are project-isolated to avoid desktop/mobile parallel contamination.

Validation:

- `npm run lint`: passed.
- `npx vitest run tests/tenant-isolation-routes.test.ts --reporter=dot`: passed.
- `npm run build`: passed.
- `npm test`: passed.
- `npm run test:e2e:contacts`: passed.
- `npm run test:e2e`: passed with 18 passed and 4 expected simple-release skips.

Remaining:

- `[ ]` Add filtered empty-state guidance so operators know how to clear `q`, status, or tag filters.
- `[ ]` Consider saved-segment preview counts inside the Contacts create-segment dialog if operators need confidence before saving.

## 2026-06-27 - Instagram metadata fallback and safe refresh errors

Current status:

- `[x]` ID-only Instagram channels remain visible in the sidebar account switcher.
- `[x]` ID-only channels use a clearer display name, fallback avatar, explanatory subtitle, and partial metadata marker.
- `[x]` Instagram Login profile refresh uses the Instagram Graph profile endpoint before Facebook object reads.
- `[x]` Meta raw refresh failures are mapped to safe Chinese messages without leaking `fbtrace_id`.
- `[x]` Automations explicitly remains workspace-scoped until a channel-scope schema exists.

Remaining:

- `[ ]` After merge and controlled Production deployment, verify the sidebar shows both ID-only and username-backed channels.
- `[ ]` Decide later whether Automations needs a channel-scoped data model and migration.

## Latest - 2026-06-28 Antigravity CLI command resolution

Current status:

- `[x]` Confirmed `agy` is available on PATH in the current PowerShell session.
- `[x]` Updated `antigravity_cli` command resolution to prefer explicit env overrides, then `agy`, then legacy `gemini` / `antigravity` command names.
- `[x]` Added focused unit coverage for CLI command candidate ordering.
- `[x]` Stabilized the authenticated route overflow smoke helper to avoid CI timeouts from long-lived dashboard network activity.
- `[x]` Documented the local CLI default in README.
- `[x]` `npm run lint`, `npx vitest run tests/unit/gemini-cli.test.ts --reporter=dot`, `npm run test:e2e:auth`, and `npm run build` passed.

Remaining:

- `[ ]` If another machine or session needs Antigravity support, ensure `agy` is on PATH or set `ANTIGRAVITY_CLI_COMMAND` explicitly.

## Latest - 2026-06-28 Windows test runner crash diagnostics

Current status:

- `[x]` Added reusable test batching helpers for `scripts/run-tests.mjs`.
- `[x]` `npm test` now prints the active Vitest batch before each run.
- `[x]` If a multi-file batch exits with the known Windows access violation code `3221225477`, the runner re-runs each file in that batch individually to identify whether the crash is file-specific or batch-level.
- `[x]` Added unit coverage for batching, batch labels, and Windows crash-diagnostic gating.
- `[x]` Hardened authenticated Playwright smoke login setup with a bounded retry for transient CI `ECONNRESET` failures.

Remaining:

- `[ ]` Re-run full `npm test` in the affected Windows environment and use the new diagnostic output if `3221225477` appears again.
- `[ ]` Keep production DB, Production deploy, Meta App Review, and PayUNI production outside this diagnostic path.

## Latest - 2026-06-29 Daily AI model cache refresh

Current status:

- `[x]` Ran `npm run ai-models:refresh`.
- `[x]` Refresh completed for `default-workspace`.
- `[x]` Current provider counts are `chatgpt=10`, `gemini=7`, `deepseek=2`, and `xai=2`.
- `[x]` No provider failure was reported.
- `[x]` `codex_cli` and `antigravity_cli` stayed outside the shared refresh payload, matching the documented local CLI opt-in behavior.

Remaining:

- `[ ]` Keep `AI_ENABLE_LOCAL_CLI` disabled in shared SaaS / cron environments unless the machine has authenticated local CLI tools.

## Latest - 2026-06-29 AI_TEAM queue restructure

Current status:

- `[x]` Reworked `AI_TEAM/tasks/current-task.md` into a runner-friendly state-machine format with `PRIMARY_TARGET`, done criteria, and hard stops.
- `[x]` Reworked `AI_TEAM/tasks/backlog.md` into `UNBLOCKED` / `BLOCKED_*` queue items so the next loop can skip blocked work instead of re-reading stale summaries.
- `[x]` Documented the queue reading order and maintenance rules in `AI_TEAM/README.md`.
- `[x]` Recorded `HUMAN_REQUIRED` items for DB-backed authenticated smoke rather than pretending those flows are ready.
- `[x]` Added AI_TEAM continuous runner mode so each loop can continue immediately without the old wait interval.

Remaining:

- `[ ]` Use the new queue order to continue Inbox P0/P1 product-completeness work before returning to lower-priority process cleanup.
- `[ ]` After a safe non-production `TEST_DATABASE_URL` is available, convert Channels / Inbox authenticated smoke from `WARN` to real execution.

## Latest - 2026-06-29 Local Supabase test DB bootstrap

Current status:

- `[x]` Added repo-local `supabase/config.toml` and `supabase/seed.sql`.
- `[x]` Moved the repo's local Supabase ports away from the already occupied `54321-54327` range.
- `[x]` `supabase start` now succeeds for this repo instead of colliding with another project's local stack.
- `[x]` Repo-local Postgres is now available on port `55322` for `TEST_DATABASE_URL`.

Remaining:

- `[ ]` Add `TEST_DATABASE_URL` and `TEST_DIRECT_URL` to local env before rerunning authenticated DB-backed smoke.
- `[ ]` Optionally replace deprecated `[inbucket]` config with the new `[local_smtp]` section later; it is only a warning, not a blocker.

## Latest - 2026-06-29 AI_TEAM closed-loop refactor

Current status:

- `[x]` Added a real Codex CLI execution stage (`ai-team:dev`) so AI_TEAM can directly implement code changes instead of stopping at next-prompt generation.
- `[x]` Rewired the runner pipeline to `codex-dev -> local-qa -> local-models`.
- `[x]` Added runner / QA / Codex lock files to prevent overlapping unattended loops.
- `[x]` Added `lite` vs `full` QA levels so small fixes stop paying the cost of full build + browser QA every round.
- `[x]` Upgraded QA failure reporting to include exit code plus stdout / stderr tail, making the next loop actionable.
- `[x]` Rewrote AI_TEAM docs so Codex CLI is clearly the primary implementer and local models are supporting roles only.

Remaining:

- `[ ]` Run the new general-mode loop against live product backlog items instead of process-only work.
- `[ ]` Clean up ANSI / spinner noise in local model reports so `code-review.md` and related runtime artifacts stay readable.
- `[ ]` Decide the next safe boundary for commit / push / PR automation, without skipping human gates for Production.

## Latest - 2026-06-30 AI_TEAM Codex CLI long-run reliability

Current status:

- `[x]` Confirmed Codex CLI itself is available on this machine as `codex-cli 0.134.0`.
- `[x]` Kept the Windows shell launch path for `codex-dev`, avoiding the earlier `spawn codex ENOENT` failure.
- `[x]` Set default `AI_TEAM_CODEX_TIMEOUT_MS` by mode: general = 30 minutes, sleep = 2 hours.
- `[x]` Added timeout / failure summaries for `AI_TEAM/runtime/codex-last-message.md`, including bounded stdout / stderr excerpts.
- `[x]` Confirmed `AI_TEAM_CODEX_SMOKE=1 npm run ai-team:loop:once` completes `codex-dev -> qa -> local-models` with all PASS.
- `[x]` Confirmed a visible PowerShell 7 launch creates the expected `pwsh -> npm -> cmd -> node ai-team-runner` process chain.

Remaining:

- `[ ]` Run non-smoke general mode against the product backlog after the user explicitly starts unattended mode.
- `[ ]` Continue improving local model progress / timeout reporting so long Ollama calls do not look frozen.
- `[ ]` Keep production DB, migration, Production deploy, Meta App Review, and PayUNI production outside runner automation unless separately approved.

## Latest - 2026-06-30 AI_TEAM worker pipeline / task queue

Current status:

- `[x]` Added `AI_TEAM/tasks/queue.json` as the structured task queue.
- `[x]` Rebuilt `AI_TEAM/scripts/ai-team-runner.mjs` around workers: planner, codex-dev, local-model-review, qa, browser-qa, reporter, git-delivery.
- `[x]` Added runtime JSON outputs for `loop-state.json`, `current-worker.json`, `worker-result.json`, and `heartbeat.json`.
- `[x]` Runner now advances from worker result status instead of treating timeout as the main control flow.
- `[x]` Timeout remains in each external CLI worker as a safety fuse only.
- `[x]` Added `npm run ai-team:loop:smoke` and confirmed a fake task can walk the full worker pipeline.

Remaining:

- `[ ]` Wire `git-delivery` to a real repository policy gate before enabling automatic commit / push / PR / merge.
- `[ ]` Run non-smoke `ai-team:loop:general` only when ready to let Codex CLI modify product files again.
- `[ ]` Continue improving local model progress reporting for long Ollama calls.

## Latest - 2026-06-30 AI_TEAM git-delivery policy gate

Current status:

- `[x]` `git-delivery` now reads `worker-result.json`, `loop-state.json`, and `git status --porcelain`.
- `[x]` Commits are blocked when QA is not PASS, when any worker is `failed` / `blocked`, or when dirty files include runtime / reports / env / cache / log artifacts.
- `[x]` Dirty files are now classified into committable files vs excluded files.
- `[x]` Added staged delivery switches: `AI_TEAM_ENABLE_GIT_DELIVERY`, `AI_TEAM_GIT_COMMIT`, `AI_TEAM_GIT_PUSH`, `AI_TEAM_GIT_PR`.
- `[x]` `npm run ai-team:loop:smoke` now covers `git-delivery` skipped / blocked / ready states.

Remaining:

- `[ ]` Add real PR metadata / branch policy defaults before turning on unattended commit + push + PR in normal loops.
- `[ ]` Decide whether browser QA should become a hard gate for git delivery in sleep mode.
- `[ ]` Keep Production deploy disabled by default even after git delivery is enabled.

## Latest - 2026-06-30 AI_TEAM branch safety / PR policy

Current status:

- `[x]` Added branch safety rules so `master` / `main` / `staging` / `production` / `prod` / `release` are blocked for unattended git delivery.
- `[x]` Added default PR metadata: base=`master`, draft=`true`, title=`AI_TEAM: <task title>`, templated body with validation details.
- `[x]` Added a hard block for `AI_TEAM_ENABLE_PRODUCTION_DEPLOY=1`; Production deploy remains disabled in `git-delivery`.
- `[x]` Added a guard that blocks PR creation when push is not enabled.
- `[x]` Extended smoke coverage for `branch unsafe`, `ready but commit disabled`, `commit enabled but push disabled`, and `push enabled but gh missing`.

Remaining:

- `[ ]` Decide whether `master` should remain the default PR base or follow repository default branch detection.
- `[ ]` Add richer branch naming policy if AI_TEAM starts auto-creating topic branches.
- `[ ]` Keep git delivery behind explicit env flags until the branch / PR policy has been exercised in real non-smoke loops.

## Latest - 2026-06-30 AI_TEAM auto-branch / dry-run delivery

Current status:

- `[x]` Added a safe branch plan that maps unsafe branches to `codex/<task-id>`.
- `[x]` Added `AI_TEAM_GIT_DRY_RUN` and made delivery planning explicit before real git mutation.
- `[x]` Added `AI_TEAM_GIT_AUTO_BRANCH` support so safe branch creation/switch can be automated outside dry-run.
- `[x]` Kept Production deploy blocked even when git delivery is otherwise ready.

Remaining:

- `[ ]` Run a real non-smoke delivery on a disposable topic branch before enabling unattended push / PR in long-running loops.
- `[ ]` Decide whether `AI_TEAM_GIT_DRY_RUN` should stay default-on permanently or only for general mode.

## Latest - 2026-06-30 AI_TEAM delivery autonomy closeout

Current status:

- `[x]` Runner now writes real queue lifecycle back into `AI_TEAM/tasks/queue.json` (`pending` / `running` / `completed` / `blocked` / `failed`).
- `[x]` Added `--only-worker=<name>` and `AI_TEAM_ONLY_WORKER` so delivery workers can be replayed safely without rerunning the whole loop.
- `[x]` Extended the worker pipeline to include `merge-delivery` and `deploy`.
- `[x]` Added `AI_TEAM/runtime/delivery-state.json` so `git-delivery` / `merge-delivery` / `deploy` share one tracked state object.
- `[x]` Extended the visible PowerShell 7 launcher with `-EnableGitDelivery` / `-EnableMerge` / `-EnableDeploy` / `-DisableDryRun` / `-DisableAutoBranch`.
- `[x]` `npm run ai-team:loop:smoke` now covers `git-delivery`, `merge-delivery`, and `deploy`.
- `[x]` README / runner design / reports now match the actual runner behavior instead of stopping at the pre-delivery half.

Remaining:

- `[ ]` Run one disposable-branch non-smoke delivery to validate real add / commit / push / draft PR / merge gate behavior.
- `[ ]` Decide whether preview deploy should ever be auto-enabled in general mode, or remain sleep-mode/manual only.
- `[ ]` Reconnect the now-complete delivery runner back to product work instead of staying on infrastructure-only tasks.

## Latest - 2026-06-30 AI_TEAM disposable branch real delivery validation

Current status:

- `[x]` disposable branch `codex/ai-team-disposable-delivery-002` 已真實建立。
- `[x]` 真實 `git add` / `git commit` / `git push` / draft PR 已完成。
- `[x]` PR metadata 已建立，PR URL：`https://github.com/Forty-s-AI-Company/ig-auto-reply-manychat/pull/38`
- `[x]` `merge-delivery` 已真實驗證 draft PR gate，且確實 blocked。
- `[x]` `git-delivery` 已改成只交付 queue task scope，避免整個髒工作樹一起送上去。
- `[x]` queue / current-task / backlog / reports / docs 已同步完成這個主題的驗證結果。

Remaining:

- `[ ]` 將這套 delivery validation 接回下一個產品主題，而不是再跑流程本身。
- `[ ]` 評估 `merge-delivery` 在一般模式是否要維持 draft gate 鎖定。

## Latest - 2026-06-30 AI_TEAM high mode wiring

Current status:

- `[x]` Added `advanced` as a real AI_TEAM runner mode.
- `[x]` Advanced mode uses Codex-first fallback, local-model assist, full QA, and Browser QA.
- `[x]` Added advanced npm scripts and visible PowerShell launcher support.
- `[x]` Documented Codex CLI model recommendations and Antigravity CLI model policy.

Remaining:

- `[ ]` Restart visible PowerShell 7 in advanced mode and let it continue product completeness tasks.
- `[ ]` Watch whether Browser QA / agy can complete in the local CLI environment; if not, keep Playwright as the primary browser QA gate and record the agy failure reason.

## Latest - 2026-06-30 AI_TEAM three-mode autonomy

Current status:

- `[x]` General / sleep / advanced modes remain selectable.
- `[x]` Queue-empty behavior now reads backlog, current task, readiness docs, fix roadmap, QA report, browser QA report, and final report before generating the next task.
- `[x]` Product autofill no longer stops after the first fixed list is exhausted; it can generate cycle tasks.
- `[x]` QA / browser QA failures now create follow-up fix tasks.
- `[x]` Added an explicit IG metadata / profile refresh / error clarity product lane.
- `[x]` Auto-generated tasks now include `mode`, `generatedFrom`, `safetyConstraints`, and `suggestedTests`.

Remaining:

- `[ ]` Let the next non-smoke loop continue from `IG metadata / profile refresh / error clarity sweep`.
- `[ ]` Watch whether Codex CLI capacity issues still interrupt long product tasks; if they do, deferred queue should capture the failed work for retry.
