# Current Task

## Active Lane

- `LANE`: product
- `STATUS`: Completed
- `OWNER`: AI_TEAM runner
- `PRIMARY_TARGET`: Channels / Connect visible-but-unusable product sweep
- `SECONDARY_TARGET`: src/app/channels/page.tsx, src/app/channels/connect/page.tsx, src/app/channels/connect/social/page.tsx, src/components/InstagramChannelActions.tsx, src/components/RefreshInstagramProfileButton.tsx, src/components/InboxPilotAccountDropdown.tsx, tests/channels-connect-visibility.test.ts, tests/instagram-profile-refresh-route.test.ts, tests/account-channel-list.test.ts, docs/codex-session-log.md, docs/fix-roadmap.md, docs/project-launch-checklist.md, docs/product-readiness-review.md, AI_TEAM/tasks/current-task.md, AI_TEAM/tasks/backlog.md, AI_TEAM/tasks/queue.json, AI_TEAM/reports/dev-report.md, AI_TEAM/reports/final-report.md

## Current Execution Goal

- task id: `channels-connect-visible-but-unusable-autofill`
- scope: src/app/channels/page.tsx, src/app/channels/connect/page.tsx, src/app/channels/connect/social/page.tsx, src/components/InstagramChannelActions.tsx, src/components/RefreshInstagramProfileButton.tsx, src/components/InboxPilotAccountDropdown.tsx, tests/channels-connect-visibility.test.ts, tests/instagram-profile-refresh-route.test.ts, tests/account-channel-list.test.ts, docs/codex-session-log.md, docs/fix-roadmap.md, docs/project-launch-checklist.md, docs/product-readiness-review.md, AI_TEAM/tasks/current-task.md, AI_TEAM/tasks/backlog.md, AI_TEAM/tasks/queue.json, AI_TEAM/reports/dev-report.md, AI_TEAM/reports/final-report.md
- priority: 2

## Hard Stops

- 不碰 production DB。
- 不跑 migration / `db push`。
- 不部署 Production。
- 不送 Meta App Review。
- 不切 PayUNI production。

## Completion Note

- `[x]` `Channels / Connect` 連線入口已改成更清楚的可連線 / 規劃中 / 暫停中分流。
- `[x]` Instagram 動作區在授權不足時會直接顯示 inline disabled 說明，不再只靠 title。
- `[x]` simple-release smoke 已補 Channels / Connect visibility 覆蓋。
