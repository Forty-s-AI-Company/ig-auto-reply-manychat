# InboxPilot Autopilot Code Review

Date: 2026-06-26

Scope:

- Reference implementation reviewed from `C:\Users\eden\Downloads\AI\replypilot-ai`.
- New InboxPilot unattended automation implementation:
  - `AUTOPILOT.md`
  - `run-autopilot.ps1`
  - `run-autopilot.cmd`
  - `scripts/autopilot-full.py`
  - `scripts/autopilot_full_start.py`
  - `package.json` `autopilot` script

## Review Findings From ReplyPilot Reference

### P1 - Production deploy guard was too permissive for InboxPilot

ReplyPilot allows production deployment when an environment flag is present. That can be acceptable for a smaller prelaunch app, but InboxPilot has more external blast radius: Meta OAuth, tenant data, Vercel aliases, Supabase production DB, and PayUNI.

InboxPilot adaptation:

- Production deploy remains disabled by default.
- `INBOXPILOT_AUTOPILOT_ALLOW_PRODUCTION=1` is required before the runner even treats production deployment as eligible.
- PayUNI production remains forbidden even if production deployment is later allowed.

### P1 - DB commands needed stronger project-specific guardrails

ReplyPilot allows safe Supabase migrations in the configured staging/sandbox project. InboxPilot has a Prisma baseline history and prior production alias/DB work, so unattended DB writes are too risky.

InboxPilot adaptation:

- The guard blocks `prisma db push`, `prisma migrate deploy`, `prisma migrate reset`, `DROP`, `TRUNCATE`, and broad `DELETE`.
- Supabase CLI usage is limited to auth/link/status/readiness checks by default.
- Missing DB/test env is written as `HUMAN_REQUIRED` instead of improvising with production credentials.

### P1 - Secret redaction needed to cover Meta and PayUNI surfaces

ReplyPilot already blocks `.env` commits and hardcoded secrets. InboxPilot also needs to protect OAuth callback values, service role keys, PayUNI signing values, cookies, and reviewer evidence.

InboxPilot adaptation:

- The runner prompt explicitly forbids printing/committing DB URLs, service role keys, OAuth codes, callback query strings, cookies, and PayUNI signing values.
- Reports are ignored under `reports/` because command output may include paths or tool metadata.

### P2 - Browser QA should not depend on a second CLI being installed

ReplyPilot uses an external Antigravity CLI for browser QA. InboxPilot can still use Codex plus local route smoke by default, because unattended automation should degrade gracefully when optional tools are unavailable.

InboxPilot adaptation:

- The runner performs local route smoke after build.
- QA review is performed through Codex based on tests, route smoke, Vercel/Supabase reports, and code diff.
- Playwright E2E remains opt-in with `INBOXPILOT_AUTOPILOT_E2E=1`.

### P2 - Reports should distinguish blockers from safe continuation

ReplyPilot has `reports/human-required.md`, which is the right pattern. InboxPilot keeps it and makes it explicit that missing Meta/PayUNI/Supabase/Vercel inputs should not block unrelated code/docs work.

InboxPilot adaptation:

- Missing login/secret/account approval is recorded as `HUMAN_REQUIRED`.
- The loop continues on safe work when possible.

## Security Review

### Security

- Good: production DB/schema writes are blocked by prompt guard and forbidden-pattern scan.
- Good: reports are ignored by git.
- Good: PayUNI production switch is explicitly blocked.
- Good: Meta Dashboard login/submission is explicitly blocked.
- Remaining risk: an AI subprocess can still propose unsafe commands in text. The runner scans generated reports for known forbidden patterns, but this is not a complete shell sandbox.

### Performance

- The runner streams command output and writes logs incrementally.
- Timeouts are applied to Codex, npm, build, Vercel, Supabase, and smoke steps.
- The dev server is started only after build and stopped before/after Codex steps to avoid hanging sessions.

### Readability

- The runner is intentionally explicit rather than abstracted heavily.
- Each phase writes a named report so the next morning review has a clear trail.
- Prompt blocks are long, but they carry the project-specific safety policy where the AI subprocess will actually read it.

### Maintainability

- Most project-specific knobs are environment variables.
- Reports are stable and ignored by git.
- The entry points are Windows-friendly and match the operator environment.
- Future improvement: split prompt text into templates if the script grows much larger.

## Safe Usage

Recommended first run:

```powershell
$env:AUTOPILOT_MAX_LOOPS="1"
$env:INBOXPILOT_AUTOPILOT_PREVIEW_DEPLOY="0"
npm run autopilot
```

Longer unattended run:

```powershell
$env:AUTOPILOT_MAX_LOOPS="8"
$env:INBOXPILOT_AUTOPILOT_PREVIEW_DEPLOY="1"
$env:INBOXPILOT_AUTOPILOT_E2E="0"
npm run autopilot
```

PayUNI must remain sandbox until the separate production go-live checklist is approved.
