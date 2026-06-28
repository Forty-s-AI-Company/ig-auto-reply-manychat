# Worktree / Dirty Files Audit

Date: 2026-06-29

## Scope

This report uses `npm run ai-team:loop:once`, `git status --short`, `git worktree list --porcelain`, and `git branch --merged origin/master`.

No files were deleted. No commits were created. No production DB, deployment, migration, Meta App Review, or PayUNI production action was performed.

## Health Summary

- Current branch: `codex/contacts-bulk-segments`
- Dirty files in main worktree: 56
- Total worktrees: 22
- Latest AI_TEAM QA status: WARN
- WARN reason: `TEST_DATABASE_URL` is not configured, so DB-backed tests are skipped.

## Dirty Files Classification

### A. 可提交功能變更

These are product or test changes that look like real feature work and should be split into focused PRs before submission.

- Inbox / product UI:
  - `src/components/InboxClient.tsx`
  - `src/components/InboxHeaderSearch.tsx`
  - `tests/e2e/inbox-auth.spec.ts`
- Channels / Instagram metadata and action UX:
  - `src/app/api/channels/[id]/instagram-profile/refresh/route.ts`
  - `src/app/channels/connect/page.tsx`
  - `src/app/channels/page.tsx`
  - `src/components/InstagramChannelActions.tsx`
  - `src/components/RefreshInstagramProfileButton.tsx`
  - `src/lib/account-channel-list.ts`
  - `src/lib/channels/channel-action-feedback.ts`
  - `tests/account-channel-list.test.ts`
  - `tests/channel-action-feedback.test.ts`
  - `tests/instagram-profile-refresh-route.test.ts`
- Admin shell / mobile navigation / account dropdown:
  - `src/components/AdminMobileNav.tsx`
  - `src/components/AdminShell.tsx`
  - `src/components/InboxPilotAccountDropdown.tsx`
- Automations scope policy:
  - `src/app/automations/page.tsx`
  - `src/lib/automation-scope-policy.ts`
  - `tests/automation-scope-policy.test.ts`
- AI provider / local CLI opt-in:
  - `src/lib/ai/gemini-cli.ts`
  - `tests/ai-providers.test.ts`
  - `tests/unit/gemini-cli.test.ts`
- Shared authenticated route smoke:
  - `tests/e2e/public-and-auth.spec.ts`

Recommended split:

1. `Inbox UX hardening`: Inbox client, header search, inbox auth smoke.
2. `Channels IG safe error / metadata UX`: channel pages, refresh/action components, channel helper, related tests.
3. `Automation channel scope notice`: automation page, scope policy helper, related test.
4. `AI local CLI opt-in`: gemini CLI helper and provider tests.

### B. 文件 / 流程變更

These are docs, runbooks, or workflow files. They should not be mixed with product UI PRs.

- AI_TEAM foundation:
  - `AI_TEAM/**`
  - `.gitignore`
  - `package.json`
  - `package-lock.json`
  - `README.md`
- Old autopilot / AI team transition:
  - `scripts/autopilot-full.py`
  - `scripts/autopilot_full.py`
  - `README_AUTOPILOT.md`
  - `AUTOPILOT_STATE.md`
  - `docs/UNATTENDED_AUTOPILOT_POLICY.md`
- Launch / readiness docs:
  - `docs/codex-session-log.md`
  - `docs/fix-roadmap.md`
  - `docs/meta-app-review-checklist.md`
  - `docs/product-readiness-review.md`
  - `docs/project-launch-checklist.md`
  - `docs/security-review.md`
  - `docs/staging-preview-env-gap-checklist.md`
- Prisma / production baseline runbooks:
  - `docs/prisma-production-migration-runbook.md`
  - `docs/production-baseline-backup-checkpoint-sop.md`
  - `docs/production-prisma-baseline-maintenance-runbook.md`
  - `scripts/prisma-baseline-verify.ps1`
- Top-level planning docs that need review before PR:
  - `ACCEPTANCE.md`
  - `DESIGN.md`
  - `LAUNCH_PLAN.md`
  - `PRODUCT.md`
  - `PROJECT.md`
  - `QA.md`
  - `TASKS.md`

Recommended split:

1. `AI_TEAM runner foundation`: `AI_TEAM/**`, `package.json`, `package-lock.json`, `.gitignore`, README entry.
2. `Autopilot deprecation docs`: old autopilot scripts/docs only, if still useful.
3. `Prisma baseline ops runbooks`: Prisma docs and verify script only.
4. `Launch/readiness docs refresh`: checklist and readiness docs only.

### C. 應排除的暫存 reports / logs / cache

These should not be committed without explicit review.

- `scripts/__pycache__/`
- `docs/qa-analysis-report.md`
- `docs/production-launch-readiness-delta.md`
- `docs/pr-1-safe-merge-checklist.md`
- `AI_TEAM/reports/runner-log.md` is now ignored and should remain local-only.

Notes:

- `.env.example` is modified and may be safe to commit, but it must be reviewed separately to ensure no real secret values were copied into the template.
- No `.env`, token, password, or DB connection string should be included in any PR.

## Worktree Classification

### A. 仍需保留

These worktrees are active, dirty, or not clearly merged into `origin/master`.

- `C:/Users/eden/Downloads/AI/ig-auto-reply-manychat`
  - branch: `codex/contacts-bulk-segments`
  - dirty files: 56
  - reason: current active workspace; must not clean without PR split.
- `C:/Users/eden/.codex/worktrees/8340/ig-auto-reply-manychat`
  - branch: `staging`
  - dirty files: 59
  - reason: dirty staging worktree; needs separate audit before cleanup.
- `C:/Users/eden/Downloads/AI/ig-auto-reply-manychat-pr19-antigravity-agy`
  - branch: `codex/antigravity-agy-command`
  - dirty files: 0
  - reason: not listed as merged into `origin/master`.
- `C:/Users/eden/Downloads/AI/ig-auto-reply-manychat-pr20-test-runner`
  - branch: `codex/test-runner-crash-diagnostics`
  - dirty files: 0
  - reason: not listed as merged into `origin/master`.
- `C:/Users/eden/Downloads/AI/ig-auto-reply-manychat-pr33-inbox`
  - branch: `codex/inbox-minimal-ux`
  - dirty files: 0
  - reason: not listed as merged into `origin/master`.

### B. 已 merge，可安排清理

These branches are listed by `git branch --merged origin/master` and have dirty count 0.

- `C:/Users/eden/Downloads/AI/ig-auto-reply-manychat-ai-team`
  - branch: `codex/ai-team-foundation`
- `C:/Users/eden/Downloads/AI/ig-auto-reply-manychat-alias-pr`
  - branch: `codex/alias-workflow-domain-guards`
- `C:/Users/eden/Downloads/AI/ig-auto-reply-manychat-autopilot`
  - branch: `codex/inboxpilot-autopilot`
- `C:/Users/eden/Downloads/AI/ig-auto-reply-manychat-autopilot-product`
  - branch: `codex/mobile-admin-menu-smoke-scope`
- `C:/Users/eden/Downloads/AI/ig-auto-reply-manychat-ci-auth-smoke-pr`
  - branch: `codex/ci-auth-smoke`
- `C:/Users/eden/Downloads/AI/ig-auto-reply-manychat-launch-final-gates`
  - branch: `codex/meta-app-review-day-of-run-card`
- `C:/Users/eden/Downloads/AI/ig-auto-reply-manychat-meta-analysis`
  - branch: `docs/meta-login-account-selection-analysis`
- `C:/Users/eden/Downloads/AI/ig-auto-reply-manychat-pr1-ai-local-cli`
  - branch: `codex/ai-local-cli-optin`
- `C:/Users/eden/Downloads/AI/ig-auto-reply-manychat-pr2-autopilot`
  - branch: `codex/autopilot-runner-hardening`
- `C:/Users/eden/Downloads/AI/ig-auto-reply-manychat-pr21-inbox`
  - branch: `codex/inbox-functionality-repair`
- `C:/Users/eden/Downloads/AI/ig-auto-reply-manychat-pr22-inbox-mobile`
  - branch: `codex/mobile-menu-smoke-stability`
- `C:/Users/eden/Downloads/AI/ig-auto-reply-manychat-pr3-autopilot-docs`
  - branch: `codex/autopilot-docs-baseline`
- `C:/Users/eden/Downloads/AI/ig-auto-reply-manychat-pr4-prisma-runbooks`
  - branch: `codex/prisma-baseline-runbooks`
- `C:/Users/eden/Downloads/AI/ig-auto-reply-manychat-pr5-ig-badge`
  - branch: `codex/ig-dropdown-badge-polish`
- `C:/Users/eden/Downloads/AI/ig-auto-reply-manychat-pr9-merge`
  - branch: `codex/pr9-merge-conflict-resolution`
- `C:/Users/eden/Downloads/AI/ig-auto-reply-manychat-public-paid-launch-pr`
  - branch: `codex/meta-payuni-launch-package`

### C. 需人工確認

- `C:/Users/eden/Downloads/AI/ig-auto-reply-manychat-ig-metadata-pr`
  - branch: `master`
  - dirty files: 0
  - reason: clean, but it is a separate `master` worktree. Keep only if it is intentionally used as a clean reference checkout.

## Suggested Cleanup Order

1. Do not delete anything yet.
2. First split the 56 dirty files in the current worktree into PR-sized groups.
3. Audit the dirty staging worktree separately because it has 59 dirty files.
4. Remove clean merged worktrees only after confirming no local-only files are needed.
5. Keep or remove the duplicate clean `master` worktree by policy decision.
6. Re-run `npm run ai-team:loop:once` after each cleanup pass to confirm dirty/worktree counts decrease.
