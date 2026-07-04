# Repo Discovery - AI Team Minimalization

- Generated: 2026-07-04
- Git root: `C:/Users/eden/Downloads/AI/ig-auto-reply-manychat`
- Branch: `codex/ai-release-autopilot-minimal`
```text
M docs/codex-session-log.md
 M docs/fix-roadmap.md
?? .ai-team/
?? AI_TEAM/scripts/qa-staging.js
?? CODEX_DESKTOP_AI_DOCS_AND_RELEASE_AUTOPILOT_V2_MINIMAL.md
?? docs/qa-analysis-report.md
?? qa-results.txt
```
- OS: `Windows-10-10.0.19045-SP0`
- Shell: PowerShell (Codex Desktop context)
- Package manager: npm (`package-lock.json` present: True)
- Framework/runtime: Next.js 16.2.6, React 19.2.4, TypeScript, Prisma, PostgreSQL

## Package Scripts

- `dev`: `next dev -p 3041`
- `dev:ngrok`: `powershell -NoProfile -ExecutionPolicy Bypass -File scripts/start-dev-ngrok.ps1`
- `build`: `node scripts/prisma-generate-safe.mjs && next build`
- `start`: `next start`
- `lint`: `eslint`
- `test`: `node scripts/run-tests.mjs`
- `test:unit`: `vitest run tests/unit`
- `test:integration`: `node scripts/run-tests.mjs`
- `test:e2e`: `playwright test`
- `test:e2e:auth`: `npm run e2e:admin:ensure && playwright test tests/e2e/public-and-auth.spec.ts`
- `test:e2e:contacts`: `npm run e2e:admin:ensure && playwright test tests/e2e/contacts-auth.spec.ts`
- `test:e2e:empty`: `npm run e2e:empty:ensure && playwright test tests/e2e/empty-workspace-activation.spec.ts --workers=1`
- `test:e2e:inbox`: `npm run e2e:admin:ensure && playwright test tests/e2e/inbox-auth.spec.ts --workers=1`
- `test:e2e:reviewer`: `npm run e2e:reviewer:ensure && playwright test tests/e2e/meta-reviewer-rehearsal.spec.ts --workers=1`
- `test:e2e:simple`: `node scripts/run-simple-release-e2e.mjs`
- `test:coverage`: `vitest run tests/unit tests/integration --coverage`
- `test:coverage:db`: `node scripts/run-tests.mjs --coverage`
- `load:test`: `node scripts/load-test.mjs`
- `prisma:migrate`: `node scripts/prisma-env.mjs db push`
- `prisma:push`: `node scripts/prisma-env.mjs db push`
- `prisma:generate`: `node scripts/prisma-env.mjs generate`
- `prisma:seed`: `tsx prisma/seed.ts`
- `admin:ensure`: `tsx scripts/ensure-admin.ts`
- `e2e:admin:ensure`: `tsx scripts/ensure-e2e-admin.ts`
- `e2e:empty:ensure`: `tsx scripts/ensure-empty-e2e-admin.ts`
- `e2e:reviewer:ensure`: `tsx scripts/ensure-reviewer-demo-data.ts`
- `data:import-legacy`: `node scripts/import-legacy-sqlite.mjs`
- `payuni:smoke`: `tsx scripts/payuni-smoke-test.mjs`
- `ai-models:refresh`: `tsx scripts/refresh-ai-models.ts`
- `meta:refresh-token`: `node scripts/refresh-meta-token.mjs`
- `worker`: `tsx scripts/worker.ts`
- `ai-team`: `node AI_TEAM/scripts/ai-team.mjs status`
- `ai-team:status`: `node AI_TEAM/scripts/ai-team.mjs status`
- `ai-team:next`: `node AI_TEAM/scripts/ai-team.mjs next`
- `ai-team:check`: `node AI_TEAM/scripts/ai-team.mjs check`
- `ai-team:dev`: `node AI_TEAM/scripts/codex-dev.mjs`
- `ai-team:qa`: `node AI_TEAM/scripts/local-qa.mjs`
- `ai-team:qa:lite`: `node AI_TEAM/scripts/local-qa.mjs --level=lite`
- `ai-team:qa:full`: `node AI_TEAM/scripts/local-qa.mjs --level=full`
- `ai-team:qa:strict`: `node AI_TEAM/scripts/local-qa.mjs --strict-tests`
- `ai-team:browser-qa`: `node AI_TEAM/scripts/playwright-browser-qa.mjs`
- `ai-team:models`: `node AI_TEAM/scripts/local-models.mjs --mode=general`
- `ai-team:models:general`: `node AI_TEAM/scripts/local-models.mjs --mode=general`
- `ai-team:models:advanced`: `node AI_TEAM/scripts/local-models.mjs --mode=advanced`
- `ai-team:models:sleep`: `node AI_TEAM/scripts/local-models.mjs --mode=sleep`
- `ai-team:loop`: `node AI_TEAM/scripts/ai-team-runner.mjs --mode=general`
- `ai-team:loop:general`: `node AI_TEAM/scripts/ai-team-runner.mjs --mode=general`
- `ai-team:loop:advanced`: `node AI_TEAM/scripts/ai-team-runner.mjs --mode=advanced`
- `ai-team:loop:sleep`: `node AI_TEAM/scripts/ai-team-runner.mjs --mode=sleep`
- `ai-team:loop:continuous`: `node AI_TEAM/scripts/ai-team-runner.mjs --mode=general --always-run --no-wait`
- `ai-team:loop:continuous:advanced`: `node AI_TEAM/scripts/ai-team-runner.mjs --mode=advanced --always-run --no-wait`
- `ai-team:loop:continuous:sleep`: `node AI_TEAM/scripts/ai-team-runner.mjs --mode=sleep --always-run --no-wait`
- `ai-team:loop:once`: `node AI_TEAM/scripts/ai-team-runner.mjs --once --mode=general`
- `ai-team:loop:once:advanced`: `node AI_TEAM/scripts/ai-team-runner.mjs --once --mode=advanced`
- `ai-team:loop:once:sleep`: `node AI_TEAM/scripts/ai-team-runner.mjs --once --mode=sleep`
- `ai-team:loop:smoke`: `node AI_TEAM/scripts/ai-team-runner.mjs --once --mode=general --smoke`
- `autopilot`: `node AI_TEAM/scripts/ai-team.mjs autopilot`
- `reset-db`: `prisma migrate reset --force`

## Main Commands

- lint: `eslint`
- build: `node scripts/prisma-generate-safe.mjs && next build`
- test: `node scripts/run-tests.mjs`
- test:e2e: `playwright test`
- test:e2e:reviewer: `npm run e2e:reviewer:ensure && playwright test tests/e2e/meta-reviewer-rehearsal.spec.ts --workers=1`
- payuni:smoke: `tsx scripts/payuni-smoke-test.mjs`
- prisma:migrate: `node scripts/prisma-env.mjs db push`
- prisma:seed: `tsx prisma/seed.ts`
- dev: `next dev -p 3041`

## Integrations

- Auth: custom app auth routes/cookies; verify with `src/app/api/auth/login/route.ts`.
- Database: Prisma + PostgreSQL / local Supabase; migrations/schema in `prisma/`.
- Meta/Instagram: OAuth, webhook callback `/api/webhooks/meta`, Instagram reviewer docs in `docs/meta-*`.
- Billing: PayUNI, currently Sandbox until production go-live approval.
- Deploy: Vercel; Production deploy is not part of this cleanup task.
- QA: Vitest, Playwright, local reviewer rehearsal scripts.

## Product Flows
- Dashboard, Channels/Instagram connect, Inbox, Contacts, Automations, Analytics, Billing/Referrals/Wallet, public legal pages.

## Initial AI Artifacts
Detected `387` AI/release/autopilot related artifacts. See `.ai-team/ai_artifacts.detected.json` and `reports/ai-team/01_AI_ARTIFACT_DISCOVERY.md`.
