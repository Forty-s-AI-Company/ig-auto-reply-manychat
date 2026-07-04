# AI Release Control

Last updated: 2026-07-04.

This file controls release stabilization, bug severity, QA evidence, and human acceptance. It replaces scattered AI_TEAM backlog / queue / runtime reports as the active release control reference.

## Release State

```text
Current release decision: CONTINUE
Candidate target: BETA_READY_CANDIDATE
Production ready: Not self-declarable by AI
Production deploy: Off by default
PayUNI: Sandbox only
Meta App Review: Hold
```

## Severity Definitions

| Severity | Meaning | Examples |
| --- | --- | --- |
| P0 | Blocks beta usage or can leak / mutate unsafe data | Auth broken, tenant isolation bug, production DB risk, secret exposure, payment capture risk |
| P1 | Core paid product flow broken or highly misleading | Inbox cannot read/reply, IG connect unusable, Billing CTA misleading, major mobile blocker |
| P2 | Important polish or lower-frequency feature issue | Admin UX rough, copy ambiguity, non-critical RWD issue |
| P3 | Nice-to-have | Minor copy, layout polish, low-use internal report |

Only P0/P1 can block `BETA_READY_CANDIDATE`.

## Current Bug Board

| Item | Severity | Status | Evidence |
| --- | --- | --- | --- |
| Meta permissions remain `可供測試` | P0 external | Hold | `docs/meta-app-review-final-recording-preflight.md` |
| Meta reviewer-safe recording / redaction | P0 external | Hold | `docs/meta-reviewer-recording-shot-list.md` |
| App icon in Meta Basic Settings | P2/P1 package polish | Needs manual/asset decision | `docs/meta-app-review-final-recording-preflight.md` |
| PayUNI production switch | P0 external | Hold | `docs/billing-affiliate-readiness.md` |
| Production deploy | P0 release gate | Hold | user must explicitly authorize |
| Old AI_TEAM docs / runners | P1 process | Being archived | `docs/_audit/AI_ARTIFACT_AUDIT_2026-07-04.md` |

## QA Matrix

| Area | Minimum local command | Optional / focused command |
| --- | --- | --- |
| Lint | `npm run lint` | path-scoped ESLint if faster |
| Build | `npm run build` | none |
| Unit/integration | `npm test` | `npx vitest run <files>` |
| E2E all | `npm run test:e2e` | route-specific Playwright specs |
| Inbox | `npm run test:e2e:inbox` | `tests/e2e/inbox-auth.spec.ts` |
| Contacts | `npm run test:e2e:contacts` | `tests/e2e/contacts-auth.spec.ts` |
| Empty workspace | `npm run test:e2e:empty` | `tests/e2e/empty-workspace-activation.spec.ts` |
| Meta reviewer rehearsal | `npm run test:e2e:reviewer` | `scripts/ensure-reviewer-demo-data.ts` |
| PayUNI Sandbox | `npm run payuni:smoke` | only with sandbox env |

If a command cannot run, record `NEEDS_VERIFICATION` and the concrete reason.

## Local Runbook

```bash
npm install
cp .env.example .env.local
npm run prisma:generate
npm run dev
npm run lint
npm run build
npm test
```

Local app default:

```text
http://localhost:3041
```

## Staging Runbook

Staging checks are allowed only when the task explicitly enables staging profile:

- Use `https://staging.carry-digital-nomad.in.net`
- Use reviewer-safe / synthetic data only
- Do not use production DB credentials
- Do not use production PayUNI
- Do not submit Meta App Review
- Do not record secrets

## Staging Safety Guard

Before any staging write:

- Confirm environment URL contains `staging`
- Confirm credentials are reviewer-safe
- Confirm data is synthetic-only
- Confirm no production DB URL is printed or used
- Confirm task does not require production migration

If uncertain, mark `NEEDS_USER_INPUT`.

## Human Acceptance Checklist

Human must approve:

- Production deployment
- Production DB mutation / migration
- Meta App Review final submit
- PayUNI production switch
- Real payment smoke
- Reviewer credential handoff
- Final `BETA_READY_CANDIDATE` acceptance

