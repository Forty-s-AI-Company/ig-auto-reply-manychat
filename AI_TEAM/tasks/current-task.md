# Current Task

## Active Lane

- `LANE`: product
- `STATUS`: Completed
- `OWNER`: AI_TEAM runner
- `PRIMARY_TARGET`: Contacts product completeness sweep
- `SECONDARY_TARGET`: src/app/contacts, src/components/ContactsListClient.tsx, src/app/api/contacts, tests/e2e/contacts-auth.spec.ts, docs/codex-session-log.md, docs/fix-roadmap.md, docs/project-launch-checklist.md, docs/product-readiness-review.md, AI_TEAM/tasks/current-task.md, AI_TEAM/tasks/backlog.md, AI_TEAM/tasks/queue.json, AI_TEAM/reports/dev-report.md, AI_TEAM/reports/final-report.md

## Current Execution Goal

- task id: `contacts-product-completeness-autofill`
- scope: src/app/contacts, src/components/ContactsListClient.tsx, src/app/api/contacts, tests/e2e/contacts-auth.spec.ts, docs/codex-session-log.md, docs/fix-roadmap.md, docs/project-launch-checklist.md, docs/product-readiness-review.md, AI_TEAM/tasks/current-task.md, AI_TEAM/tasks/backlog.md, AI_TEAM/tasks/queue.json, AI_TEAM/reports/dev-report.md, AI_TEAM/reports/final-report.md
- priority: 3

## Completion Note

- `Contacts product completeness sweep` 已完成，這輪補了 segment 預覽、batch 標籤提示、custom field same-origin 防護，以及更穩定的 Contacts detail smoke。
- `npm run lint`、`npm run build`、`npm test`、`npm run test:e2e:contacts` 都已通過。
- 後續若要繼續打磨 Contacts，建議下一輪改接未覆蓋的空狀態、匯入或更深的 tenant 邊界檢查。

## Hard Stops

- 不碰 production DB。
- 不跑 migration / `db push`。
- 不部署 Production。
- 不送 Meta App Review。
- 不切 PayUNI production。
