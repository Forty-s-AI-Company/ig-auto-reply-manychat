# InboxPilot Autopilot

## Purpose

InboxPilot Autopilot is an unattended local AI engineering loop for moving the project toward staging / preview launch readiness while the operator is away.

It is allowed to inspect, fix, test, build, document, and prepare preview/staging deployment evidence. It must leave anything that needs a human account, secret, OTP, captcha, external approval, Meta App Review submission, production DB action, or PayUNI production switch in `reports/human-required.md`.

## Entry Point

Windows:

```powershell
.\run-autopilot.ps1
```

or:

```cmd
run-autopilot.cmd
```

The main loop is:

```text
scripts/autopilot-full.py
```

## Default Policy

Autopilot runs in conservative unattended mode.

Allowed by default:

- Read project docs and source code.
- Run `npm install`, `npm run lint`, `npm test`, `npm run build`, focused tests, and `npm run payuni:smoke`.
- Start and stop a local dev server for short browser / route checks.
- Use Vercel CLI to inspect project/deployments/env names without printing values.
- Create Vercel Preview deployments when the project is already linked and the CLI is authenticated.
- Use Supabase CLI for read-only inspection and local/staging-safe checks when already authenticated.
- Update documentation and reports.
- Open a branch or PR only if the Codex step chooses that route and all safety rules remain satisfied.

Forbidden by default:

- Do not print or commit secrets, tokens, DB URLs, service role keys, cookies, OAuth codes, or full callback URLs.
- Do not commit `.env*` files.
- Do not run `prisma db push`, `prisma migrate deploy`, `prisma migrate reset`, raw write SQL, `DROP`, `TRUNCATE`, or broad `DELETE` against production.
- Do not touch production DB data or production Supabase schema.
- Do not submit Meta App Review, log in to Meta Dashboard, or upload reviewer assets.
- Do not switch PayUNI to production.
- Do not run PayUNI production checkout or real payment.
- Do not deploy Production unless `INBOXPILOT_AUTOPILOT_ALLOW_PRODUCTION=1` is set and the run has passed all quality and safety gates. Even then, PayUNI must stay sandbox until a separate production go-live task changes it.

## Environment Variables

```powershell
$env:AUTOPILOT_MAX_LOOPS="8"
$env:CODEX_TIMEOUT_SECONDS="1200"
$env:INBOXPILOT_AUTOPILOT_PREVIEW_DEPLOY="1"
$env:INBOXPILOT_AUTOPILOT_E2E="0"
$env:INBOXPILOT_AUTOPILOT_ALLOW_PRODUCTION="0"
```

Defaults:

- `AUTOPILOT_MAX_LOOPS=8`
- `CODEX_TIMEOUT_SECONDS=1200`
- `INBOXPILOT_AUTOPILOT_PREVIEW_DEPLOY=1`
- `INBOXPILOT_AUTOPILOT_E2E=0`
- `INBOXPILOT_AUTOPILOT_ALLOW_PRODUCTION=0`

## Loop

Each loop:

1. Codex developer pass reviews current launch docs, previous reports, and code.
2. Autopilot runs install / lint / test / build.
3. Autopilot runs PayUNI sandbox smoke.
4. Autopilot optionally starts the local dev server and performs route smoke checks.
5. Codex QA pass reviews browser/route/test evidence.
6. Codex safety pass checks secrets, tenant isolation, production risk, Meta, PayUNI, Vercel, Supabase, and dangerous commands.
7. If gates pass, final report is written.
8. If gates fail, the next loop fixes blocker / critical / major issues.

## Human Required File

Autopilot writes actionable blockers here:

```text
reports/human-required.md
```

Format:

```text
HUMAN_REQUIRED: <exact missing item>
```

Examples:

- `HUMAN_REQUIRED: Vercel CLI is not authenticated. Run npx vercel login.`
- `HUMAN_REQUIRED: Supabase CLI is not authenticated or project is not linked.`
- `HUMAN_REQUIRED: Meta reviewer test account credentials must be prepared manually.`
- `HUMAN_REQUIRED: PayUNI sandbox merchant/signing credentials are missing from staging env.`

Autopilot should keep working on other safe tasks whenever possible.

## Reports

Generated files are ignored by git under `reports/`:

- `reports/autopilot-live.log`
- `reports/codex-output-loop-*.md`
- `reports/lint-loop-*.log`
- `reports/test-loop-*.log`
- `reports/build-loop-*.log`
- `reports/payuni-smoke-loop-*.log`
- `reports/vercel-report.md`
- `reports/supabase-report.md`
- `reports/qa-report.md`
- `reports/safety-report.md`
- `reports/final-report.md`
- `reports/human-required.md`

## Completion Criteria

Autopilot may only report `PREVIEW_READY` or `LAUNCH_READY` when:

- `npm run lint` passes.
- `npm test` passes or is explicitly classified as `HUMAN_REQUIRED` because a non-production DB/test env is missing.
- `npm run build` passes.
- `npm run payuni:smoke` passes using sandbox behavior or is explicitly blocked by missing sandbox env.
- Vercel Preview readiness is checked.
- Production and staging aliases are not accidentally crossed.
- `reports/safety-report.md` contains `SAFETY_STATUS=PASS`.
- `reports/final-report.md` is written.

`LAUNCH_READY` still does not mean Meta App Review is submitted or PayUNI production is enabled. Those remain manual / separate controlled launch tasks.
