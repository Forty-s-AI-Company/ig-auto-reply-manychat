# Current Task

## Active Lane

- `LANE`: product
- `STATUS`: Completed
- `OWNER`: AI_TEAM runner
- `PRIMARY_TARGET`: Automations scope clarity and disabled UX sweep
- `SECONDARY_TARGET`: src/app/automations, src/app/api/automations, tests, docs/codex-session-log.md, docs/fix-roadmap.md, docs/project-launch-checklist.md, docs/product-readiness-review.md, AI_TEAM/tasks/current-task.md, AI_TEAM/tasks/backlog.md, AI_TEAM/tasks/queue.json, AI_TEAM/reports/dev-report.md, AI_TEAM/reports/final-report.md

## Current Execution Goal

- task id: `automations-scope-clarity-autofill`
- scope: src/app/automations, src/app/api/automations, tests, docs/codex-session-log.md, docs/fix-roadmap.md, docs/project-launch-checklist.md, docs/product-readiness-review.md, AI_TEAM/tasks/current-task.md, AI_TEAM/tasks/backlog.md, AI_TEAM/tasks/queue.json, AI_TEAM/reports/dev-report.md, AI_TEAM/reports/final-report.md
- priority: 4

## Hard Stops

- 不碰 production DB。
- 不跑 migration / `db push`。
- 不部署 Production。
- 不送 Meta App Review。
- 不切 PayUNI production。

## Completion

- `status`: `completed`
- `summary`: Automations 頁面已補上工作區共用 scope 說明、selected IG 帳號名稱提示，以及 simple release 下的序列 disabled UX。
- `validation`: `npx eslint src/app/automations/page.tsx src/app/automations/instagram-default-reply/page.tsx src/components/AutomationScopeBanner.tsx src/components/AutomationBuilderClient.tsx src/lib/automation-scope-policy.ts tests/automation-scope-policy.test.ts tests/e2e/public-and-auth.spec.ts tests/e2e/simple-release.spec.ts`, `npx vitest run tests/automation-scope-policy.test.ts --reporter=dot`, `npm run test:e2e:auth`, `$env:INBOXPILOT_RELEASE_CHANNEL='simple'; npm run test:e2e:simple`, `npm run lint`, `npm run build`, `npm test`
