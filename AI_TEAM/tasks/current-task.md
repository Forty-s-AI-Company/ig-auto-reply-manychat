# Current Task

## Active Lane

- `LANE`: product
- `STATUS`: Completed
- `OWNER`: AI_TEAM runner
- `PRIMARY_TARGET`: Inbox / Channels visible-but-unusable closeout
- `SECONDARY_TARGET`: src/components/InboxClient.tsx, src/components/InboxPilotAccountDropdown.tsx, src/lib/account-channel-list.ts, src/app/channels/page.tsx, src/app/channels/connect/page.tsx, src/app/channels/connect/social/page.tsx, tests/account-channel-list.test.ts, tests/e2e/inbox-auth.spec.ts, tests/e2e/simple-release.spec.ts, docs/codex-session-log.md, docs/fix-roadmap.md, docs/project-launch-checklist.md, docs/product-readiness-review.md

## Current Execution Goal

- task id: `inbox-channels-visible-but-unusable-003`
- scope: src/components/InboxClient.tsx, src/components/InboxPilotAccountDropdown.tsx, src/lib/account-channel-list.ts, src/app/channels/page.tsx, src/app/channels/connect/page.tsx, src/app/channels/connect/social/page.tsx, tests/account-channel-list.test.ts, tests/e2e/inbox-auth.spec.ts, tests/e2e/simple-release.spec.ts, docs/codex-session-log.md, docs/fix-roadmap.md, docs/project-launch-checklist.md, docs/product-readiness-review.md
- priority: 2

## Hard Stops

- 不碰 production DB。
- 不跑 migration / `db push`。
- 不部署 Production。
- 不送 Meta App Review。
- 不切 PayUNI production。

## Outcome

- Inbox header 的 `視訊通話` 與 `更多對話操作` 已收斂成真正 disabled UX，並補上清楚的原因說明。
- `清除提醒` 現在會正確關閉 reminder menu，不再讓後續操作被浮層擋住。
- IG dropdown partial metadata badge 與 Channels connect visibility 維持清楚分流。
- 這輪驗證通過 `npm run lint`、`npm run build`、`npm run test:e2e:inbox`，以及 focused vitest。
- `npm test` 仍有既有 Windows batch-level Vitest crash，和本輪產品修補無直接關聯。
- 下一個建議產品任務：`Contacts filtered empty-state guidance`。
