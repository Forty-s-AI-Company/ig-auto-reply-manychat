# Current Task

## Active Lane

- `LANE`: product
- `STATUS`: Completed
- `OWNER`: AI_TEAM runner
- `PRIMARY_TARGET`: Inbox visible-but-unusable product sweep
- `SECONDARY_TARGET`: src/app/inbox/page.tsx, src/components/InboxClient.tsx, src/app/api/conversations, tests/e2e/inbox-auth.spec.ts, docs/codex-session-log.md, docs/fix-roadmap.md, docs/project-launch-checklist.md, docs/product-readiness-review.md, AI_TEAM/tasks/current-task.md, AI_TEAM/tasks/backlog.md, AI_TEAM/tasks/queue.json, AI_TEAM/reports/dev-report.md, AI_TEAM/reports/final-report.md

## Current Execution Goal

- task id: `inbox-visible-but-unusable-autofill`
- scope: src/app/inbox/page.tsx, src/components/InboxClient.tsx, src/app/api/conversations, tests/e2e/inbox-auth.spec.ts, docs/codex-session-log.md, docs/fix-roadmap.md, docs/project-launch-checklist.md, docs/product-readiness-review.md, AI_TEAM/tasks/current-task.md, AI_TEAM/tasks/backlog.md, AI_TEAM/tasks/queue.json, AI_TEAM/reports/dev-report.md, AI_TEAM/reports/final-report.md
- priority: 1

## Hard Stops

- 不碰 production DB。
- 不跑 migration / `db push`。
- 不部署 Production。
- 不送 Meta App Review。
- 不切 PayUNI production。

## Completion Result

- `Inbox` contact actions 選單中的匯出 / 封鎖項目已改成真正 disabled UX，並補上清楚說明。
- simple-release `Inbox` 的序列訂閱入口已改成真正 disabled UX，不再像可直接訂閱的假入口。
- 驗證已通過：`npm run lint`、`npm test`、`npm run build`、`npm run test:e2e:inbox`、`npm run test:e2e:simple`。
