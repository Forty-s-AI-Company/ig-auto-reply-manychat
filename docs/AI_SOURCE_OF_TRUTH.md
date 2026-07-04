# AI Source Of Truth

Last updated: 2026-07-04.

This file is the active project state for AI agents. Historical AI docs, runner logs, prompts, memory files, and old AI_TEAM queue state are archived and must not override this file.

## Product

InboxPilot is an Instagram-first SaaS workspace for small businesses to manage:

- Dashboard onboarding and status
- Instagram / Meta channel connection
- Inbox conversations
- Contacts and tags
- Automations / sequences / segments
- Analytics
- Billing, wallet, referrals, and PayUNI Sandbox checkout
- Public legal and support pages

The product goal is `BETA_READY_CANDIDATE`, not automatic public production launch.

## Tech Stack

Evidence:

- `package.json`
- `src/app`
- `src/lib`
- `prisma/schema.prisma`

Current stack:

- Next.js App Router `16.2.6`
- React `19.2.4`
- TypeScript
- Prisma `6.19.3`
- PostgreSQL / local Supabase
- Vercel hosting
- Vitest unit/integration tests
- Playwright E2E tests
- PayUNI Sandbox billing
- Meta / Instagram OAuth and Webhooks

## Main Routes And Modules

| Area | Evidence paths |
| --- | --- |
| Auth | `src/app/api/auth/login/route.ts`, auth helpers under `src/lib` |
| Dashboard | `src/app/dashboard` |
| Inbox | `src/app/inbox`, `src/components/InboxClient.tsx`, `src/app/api/conversations` |
| Contacts | `src/app/contacts`, `src/app/api/contacts`, `src/app/api/tags` |
| Channels / Instagram | `src/app/channels`, `src/app/channels/connect`, `src/app/api/instagram`, `src/app/api/meta`, `src/app/api/webhooks/meta` |
| Automations | `src/app/automations`, `src/app/sequences`, `src/app/segments` |
| Analytics | `src/app/analytics` |
| Billing / PayUNI | `src/app/billing`, `src/lib/billing`, `scripts/payuni-smoke-test.mjs` |
| Referrals / Wallet | `src/app/referrals`, `src/app/wallet`, `src/app/affiliate`, `src/app/admin/payouts` |
| Public legal | `src/app/privacy-policy`, `src/app/terms-of-service`, `src/app/data-deletion` |

## Environment Map

Do not print env values.

| Environment | Expected purpose | Notes |
| --- | --- | --- |
| Local dev | `http://localhost:3041` | `npm run dev`; local DB should use project-local Supabase port documented in `docs/installation.md`. |
| Local test | `TEST_DATABASE_URL` | Used by Vitest/Playwright fixtures; must not point to production. |
| Staging | `https://staging.carry-digital-nomad.in.net` | Reviewer-safe rehearsals only; production DB remains out of scope. |
| Production | `https://inboxpilot.carry-digital-nomad.in.net` | Read-only health / public URL checks unless explicitly authorized. |

## Integrations

### Meta / Instagram

Current observed dashboard state is documented in:

- `docs/meta-app-review-checklist.md`
- `docs/meta-app-review-final-recording-preflight.md`
- `docs/meta-app-review-submission-package.md`

Known state:

- Correct app: `InboxPilot`, App ID `924285843989683`
- Production webhook callback is persisted as `/api/webhooks/meta`
- Instagram Webhook object shows core comments/messages fields subscribed
- Required Instagram Business permissions remain `可供測試`; App Review / Advanced Access is not approved
- Do not submit App Review automatically

### PayUNI

Current policy:

- PayUNI remains Sandbox
- Production key / gateway switch requires a separate explicit approval
- Do not execute real production transactions

### Vercel

Current policy:

- Preview deployments have quota and should be batched
- Production deploy requires explicit task approval
- This AI cleanup does not deploy

## Active Constraints

- Do not touch production DB
- Do not run production migration / `db push`
- Do not deploy Production
- Do not send Meta App Review
- Do not switch PayUNI production
- Do not output secrets
- Do not commit runtime reports, logs, caches, `.env`, or raw credentials
- Prefer small scoped changes and focused tests

## Deprecated Constraints

These old constraints may appear in archived docs but are not active unless repeated in the canonical docs:

- “Autopilot must always stop after one report.” Deprecated; new autopilot may run multiple rounds when explicitly invoked.
- “AI_TEAM queue state is source of truth.” Deprecated; queue/runtime is archived and cannot override canonical docs.
- “Old Node AI_TEAM runner is canonical.” Deprecated; replaced by `scripts/ai_release_autopilot.py`.
- “Production launch can be inferred from local tests.” Deprecated; AI may only produce `BETA_READY_CANDIDATE`.

## Unknowns / Needs Human Confirmation

- Final Meta App Review submission timing
- Business Verification / Advanced Access approval status
- Reviewer-safe credential handoff
- PayUNI production merchant switch
- Production DB migration or data mutation
- Final production deploy window

