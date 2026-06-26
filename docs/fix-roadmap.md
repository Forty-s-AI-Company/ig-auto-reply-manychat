# InboxPilot Fix Roadmap

## Latest - 2026-06-26 Autopilot report cleanup closeout

Current status:

- `[x]` Autopilot runner exited cleanly.
- `[x]` Removed ignored transient report artifacts, including `reports/autopilot-live.log`.
- `[x]` Re-ran reports secret-pattern scan after cleanup.
- `[x]` Reports scan returned `NO_MATCHES`.
- `[x]` Confirmed report files are ignored and not tracked by git.
- `[ ]` QA remains blocked by missing authenticated route smoke / E2E for Dashboard, Inbox, Contacts, Instagram connect, Analytics, Automations, Referrals, and Billing.
- `[ ]` Public paid launch remains blocked by Meta App Review and PayUNI production go-live.

Next:

- Add authenticated route smoke / E2E evidence for the logged-in product surfaces.
- Keep Meta App Review submission and PayUNI production checkout outside unattended automation.

## Latest - 2026-06-26 Unattended safety reviewer refresh

Current safety status:

- `[x]` Reviewed source/docs/report/git diff for the requested unattended autopilot safety checklist.
- `[x]` Confirmed tracked diff is limited to docs and `package-lock.json`.
- `[x]` Confirmed no `.env*`, Prisma/Supabase schema, Vercel config, GitHub workflow, PayUNI production switch, Meta dashboard/App Review, or custom domain alias diff.
- `[x]` Removed writable sensitive report outputs: `reports/codex-output-loop-1.md` and `reports/qa-output-loop-1.md`.
- `[x]` Rewrote `reports/safety-report.md` with exactly one safety status line.
- `[x]` `npm run lint` passed.
- `[x]` `npm test` passed.
- `[x]` `npm run build` passed.
- `[ ]` Safety remains Fail because `reports/autopilot-live.log` is locked by another process and still has secret-pattern matches.

Next:

- Stop or let finish the active autopilot/logging process that owns `reports/autopilot-live.log`.
- Delete or redact `reports/autopilot-live.log`.
- Re-run the reports secret-pattern scan and regenerate `reports/safety-report.md`.
- Keep Meta App Review submission and PayUNI production checkout outside unattended automation.

## Latest - 2026-06-26 Unattended autopilot QA reviewer refresh

Current QA status:

- `[x]` Reviewed the requested autopilot evidence set for homepage, login, dashboard, inbox, contacts, Instagram connect, analytics, automations, referrals, pricing/billing, and docs readiness.
- `[x]` Rewrote `reports/qa-report.md` with exactly one QA status line.
- `[x]` Confirmed current evidence has passing lint, test, build, PayUNI sandbox smoke, Vercel/Supabase read-only readiness, selected route smoke, and remote health checks.
- `[ ]` QA remains Fail because authenticated route smoke / E2E evidence is still missing for Dashboard, Inbox, Contacts, Instagram connect, Analytics, Automations, Referrals, and Billing.
- `[ ]` QA remains Fail because `reports/autopilot-live.log` still needs cleanup and a clean reports secret-pattern scan before reports are safe.
- `[ ]` Public paid launch remains Hold because Meta App Review and PayUNI production go-live remain manual external gates.

Next:

- Stop or let finish the active runner, clean `reports/autopilot-live.log`, then regenerate safety evidence.
- Add authenticated smoke / E2E coverage for the core logged-in product pages.
- Keep Meta App Review submission and PayUNI production checkout outside unattended automation.

## Latest - 2026-06-26 Unattended loop 1 readiness refresh

Current status:

- `[x]` Rechecked Vercel CLI auth/link; local project link exists for InboxPilot.
- `[x]` Confirmed Vercel Production env names include `TOKEN_ENCRYPTION_KEY` without printing values.
- `[x]` Confirmed Vercel Preview env names include `TOKEN_ENCRYPTION_KEY` without printing values.
- `[x]` Confirmed Supabase CLI read-only project inspection works and local link points to the test project.
- `[x]` `npm install` passed.
- `[x]` `npm run lint` passed.
- `[x]` `npm test` passed against local non-production test DB.
- `[x]` `npm run build` passed.
- `[x]` `npm run payuni:smoke` passed against sandbox.
- `[x]` `npm audit --audit-level=high` passed.
- `[x]` Current `package-lock.json` delta is from safe npm install/audit-fix handling; no new dependency was added.
- `[x]` Removed stale raw output reports with sensitive-pattern hits.
- `[ ]` `reports/autopilot-live.log` is still locked by active autopilot runner processes and must be cleaned after they finish.
- `[ ]` Authenticated route smoke / E2E remains needed for Inbox, Contacts, Analytics, Automations, Referrals, and Billing.
- `[ ]` Meta App Review and PayUNI production go-live remain external/manual.

Next:

- Let the active autopilot runner finish, then delete or redact `reports/autopilot-live.log`.
- Re-run reports secret-pattern scan and regenerate `reports/safety-report.md`.
- Add authenticated route smoke or E2E evidence for the core app surfaces.
- Do not run production deployment or PayUNI production checkout in the unattended path.

## Latest - 2026-06-26 Final autopilot stop report

Current status:

- `[x]` Rewrote `reports/final-report.md` to summarize completed work, latest failing gate, QA issues, safety issues, Vercel/Supabase/PayUNI status, exact human-required items, and rerun command.
- `[x]` Consolidated `reports/human-required.md` into exact actionable `HUMAN_REQUIRED:` lines.
- `[ ]` Autopilot remains blocked by Safety Fail until `reports/autopilot-live.log` is deleted or redacted after the logging process releases it.
- `[ ]` QA remains blocked by missing isolated test DB, missing PayUNI sandbox env, unavailable Supabase CLI, and missing local Vercel project link.

Next:

- Clean or remove `reports/autopilot-live.log`.
- Provide isolated non-production test DB and PayUNI sandbox env.
- Link Vercel project and confirm env names without printing values.
- Install/auth/link Supabase CLI for read-only inspection.
- Re-run autopilot with Production disabled.

## Latest - 2026-06-26 Unattended safety reviewer

Current safety status:

- `[x]` Reviewed current source/docs/report/git diff for secret leakage, `.env*`, Prisma/schema, Supabase/Prisma destructive command, tenant isolation, auth/webhook/payment/Meta/Vercel/domain risks.
- `[x]` Confirmed tracked diff does not modify `.env*`, Prisma schema/migrations, Vercel workflow/config, custom domain alias logic, PayUNI production switch, or Meta dashboard/submission behavior.
- `[x]` Redacted writable report outputs where safe.
- `[x]` Wrote `reports/safety-report.md`.
- `[ ]` Safety remains Fail because `reports/autopilot-live.log` is locked by an active logging process and still has secret-pattern matches.

Next:

- Stop the active autopilot/logging process that owns `reports/autopilot-live.log`.
- Delete or redact `reports/autopilot-live.log`.
- Re-run the reports secret-pattern scan and regenerate `reports/safety-report.md`.
- Do not share, archive, upload, or mark reports safe until that scan is clean.

## Latest - 2026-06-26 Unattended loop 1 QA review

Current QA status:

- `[x]` Re-reviewed unattended loop 1 evidence and rewrote `reports/qa-report.md`.
- `[x]` Confirmed `npm run lint` and `npm run build` passed in the loop evidence.
- `[x]` Confirmed Production and staging health checks returned `status=ok`.
- `[x]` Confirmed route smoke covered `/`, `/login`, `/dashboard`, `/pricing`, and `/channels/connect/instagram`.
- `[ ]` QA remains Fail because full `npm test` needs isolated DB env.
- `[ ]` QA remains Fail because PayUNI sandbox smoke needs local sandbox env values.
- `[ ]` QA remains Fail because Supabase CLI is unavailable on PATH.
- `[ ]` QA remains Fail because local Vercel project link/env-name inspection is incomplete.

Next:

- Provide isolated `TEST_DATABASE_URL` and rerun `npm test`.
- Provide PayUNI sandbox env values and rerun `npm run payuni:smoke`.
- Link the Vercel project and verify env names without printing values.
- Add authenticated route smoke or E2E evidence for inbox, contacts, analytics, automations, referrals, and billing.

## Latest - 2026-06-26 Unattended loop 1 safety hardening

Current status:

- `[x]` Hardened production detection so `NODE_ENV=production` maps to production behavior when explicit deployment markers are absent.
- `[x]` Closed the production token encryption fallback from `TOKEN_ENCRYPTION_KEY` to `AUTH_SECRET`.
- `[x]` Added regression tests for the production deployment fallback and dedicated token encryption key requirement.
- `[x]` Ran non-force `npm audit fix`, reducing audit output from 6 findings including 1 high to 2 moderate force-only findings.
- `[x]` Production and staging health checks are ok.

Validation:

```text
npm install: passed.
npx vitest run tests/security.test.ts tests/unit/core-utils.test.ts tests/meta-channel-config.test.ts --reporter=dot: passed.
npm run lint: passed.
npm run build: passed.
npm audit --audit-level=high: passed.
npm test: blocked by missing TEST_DATABASE_URL or DATABASE_URL.
npm run payuni:smoke: blocked by missing PayUNI sandbox env values.
```

Remaining:

- `[ ]` Link the local Vercel project before env-name inspection or Preview deployment.
- `[ ]` Confirm Vercel Production and Preview include `TOKEN_ENCRYPTION_KEY`.
- `[ ]` Provide isolated DB env for DB-backed tenant isolation tests.
- `[ ]` Provide PayUNI sandbox env values for sandbox smoke.
- `[ ]` Do not run `npm audit fix --force` for the remaining Next/PostCSS moderate finding without a separate dependency-upgrade task.

## Latest - 2026-06-26 Unattended autopilot package

Current status:

- `[x]` Added InboxPilot Autopilot documentation and Windows entry points.
- `[x]` Added `scripts/autopilot-full.py` to run Codex development loops, quality gates, PayUNI sandbox smoke, Vercel/Supabase readiness, route smoke, QA, safety, and final reporting.
- `[x]` Added project-specific safety guards for Meta, PayUNI, Production DB/schema, Vercel Production deployment, and secret leakage.
- `[x]` Added `docs/autopilot-code-review.md` comparing the ReplyPilot reference approach with InboxPilot-specific hardening.

Next operational step:

```powershell
$env:AUTOPILOT_MAX_LOOPS="1"
$env:INBOXPILOT_AUTOPILOT_PREVIEW_DEPLOY="0"
npm run autopilot
```

Then review:

- `reports/final-report.md`
- `reports/human-required.md`
- `reports/safety-report.md`

Hard boundary:

- Keep PayUNI sandbox.
- Do not let unattended automation submit Meta App Review.
- Do not let unattended automation write production DB/schema.

## Latest - 2026-06-26 Meta / PayUNI launch package preparation

Current status:

- `[x]` Added `docs/meta-app-review-submission-package.md`.
- `[x]` Added `docs/meta-reviewer-recording-shot-list.md`.
- `[x]` Added `docs/meta-app-review-screenshot-redaction-checklist.md`.
- `[x]` Added `docs/meta-reviewer-test-asset-handoff-checklist.md`.
- `[x]` Added `docs/payuni-production-go-live-checklist.md`.
- `[x]` Meta submission package covers reviewer flow, screenshots, permission matrix, dashboard fields, redaction gate, draft text, and Go / Hold criteria.
- `[x]` PayUNI go-live checklist covers env names, PAYUNi dashboard checks, preflight, controlled enablement, callback verification, rollback, and Go / Hold criteria.
- `[x]` No Meta submission was performed.
- `[x]` No PayUNI live checkout was enabled or executed.

Remaining:

- `[ ]` Capture real Meta reviewer recording/screenshots with redaction.
- `[ ]` Fill exact Meta Dashboard permission names and complete Business Verification / Advanced Access evidence.
- `[ ]` Confirm PAYUNi production merchant approval and run operator-approved low-value live smoke.
- `[ ]` Run authenticated tenant-safe smoke using a test workspace.

## Latest - 2026-06-26 PR #2 production deployment delta

Current status:

- `[x]` PR #2 merged to `master` at `5d014be`.
- `[x]` PR #3 merged to `master` at `cf9e80c`.
- `[x]` Production deployment `dpl_2Ramd6D54Xn1qc7vxxsgXGXacUni` is Ready.
- `[x]` Controlled production deployment `dpl_GGk9zyF3r1F1hZ6ons3Fzfh6y5hL` is Ready and backs the production custom domain.
- `[x]` Production custom domain points to the PR #2 production deployment.
- `[x]` Production `/api/health` is ok.
- `[x]` Staging alias remains on Preview and `/api/health/staging` is ok.
- `[x]` Production Meta global fallback hardening is live on the formal production target.
- `[x]` Added route-level tenant isolation regression tests for channels, contacts, manual automation run, and PayUNI checkout scope.
- `[x]` Non-DB launch regression suite passed: 12 files, 43 tests.

Remaining:

- `[ ]` Run authenticated channel reconnect smoke for tenant-scoped Meta credentials.
- `[ ]` Complete Meta App Review / Advanced Access / Business Verification evidence.
- `[ ]` Complete PayUNI production merchant approval and first low-value production checkout smoke.
- `[ ]` Run DB-backed tenant isolation regression tests against staging/fresh test DB.

## Latest - 2026-06-26 Public paid launch gate cleanup

Current status:

- `[x]` Added deployment-env helper for production/staging/development/test runtime decisions.
- `[x]` Disabled production Meta global env fallback for token and Instagram business account id paths.
- `[x]` Production webhook channel config no longer adds `META_PAGE_ACCESS_TOKEN` fallback marker.
- `[x]` Instagram comment sync no longer falls back to global IG business account id in production.
- `[x]` Production execution of `scripts/refresh-meta-token.mjs` is blocked.
- `[x]` Added regression tests for production fallback disablement and non-production fallback behavior.
- `[x]` Added `docs/payuni-production-sop.md`.
- `[x]` Updated Billing, Terms, Privacy, and Data Deletion copy for controlled payments, PayUNI handling, refund/cancellation, workspace isolation, and audit retention.

Validation:

- `npx vitest run tests/meta-channel-config.test.ts tests/billing-checkout-route.test.ts`: passed.
- `npm run lint`: passed.
- `npm run build`: passed.
- `npm run payuni:smoke`: passed.
- `npm test`: blocked in the current local environment by unavailable DB-backed test connectivity.

Remaining:

- `[x]` Deploy this change through the controlled Production deployment process.
- `[x]` Re-run Production `/api/health` and public simple-release smoke after deployment.
- `[ ]` Run authenticated tenant-safe smoke after deployment.
- `[ ]` Expand tenant isolation regression tests beyond the first Meta fallback guard coverage.
- `[ ]` Complete Meta App Review / Advanced Access / Business Verification evidence.
- `[ ]` Complete PayUNI merchant review and first low-value production checkout smoke.

## Latest - 2026-06-24 Release mode implementation and smoke tests

Status: implemented locally; validated and preparing push to `master` and `staging`.

- `[x]` Add centralized release mode helper.
- `[x]` Default `inboxpilot.carry-digital-nomad.in.net` to simple release.
- `[x]` Default staging / preview / localhost to full release.
- `[x]` Allow `INBOXPILOT_RELEASE_CHANNEL` to force `simple` or `full`.
- `[x]` Hide full-only nav and connection options in simple release.
- `[x]` Block full-only routes and non-Instagram OAuth entry points in simple release proxy.
- `[x]` Add smoke tests for release detection and proxy behavior.
- `[x]` Validate with lint, build, full test suite, and Playwright e2e.
- `[ ]` Push the implementation to both `master` and `staging`.
- `[ ]` Verify Vercel deployments after both pushes complete.

Remaining risk:

- DB is still intentionally shared for now and must be split before onboarding real customers.
- Preview env completeness still needs explicit confirmation before staging is dependable for full end-to-end QA.

## Latest - 2026-06-24 Master / Staging pre-launch checklist

Status: documented; release-mode runtime implementation is now prepared for commit.

- Added `docs/master-staging-prelaunch-checklist.md`.
- Confirmed Vercel Production has `INBOXPILOT_RELEASE_CHANNEL` plus runtime secrets.
- Confirmed Vercel Preview currently lists only `INBOXPILOT_RELEASE_CHANNEL`.
- Prepared `src/lib/release-mode.ts`, proxy guards, simple-release UI filtering, and smoke tests for commit.
- Marked release-mode commit/deploy and Preview env completeness as P0 before real customer onboarding.
- DB remains temporarily shared by decision, but Vercel Preview env needs explicit confirmation before staging can be treated as production-like.

Follow-up:

1. Commit and push the release mode implementation to `master` and `staging`.
2. Decide whether Preview should temporarily share Production DB vars or receive a separate staging DB.
3. Split Production and Staging DBs before real customer onboarding.
4. Add simple/full release smoke tests for both custom domains.

## Latest - 2026-06-24 Staging alias branch guard

Status: implemented locally; needs push and first `staging` branch Preview verification.

- Updated `.github/workflows/update-staging-alias.yml` so automatic deployment-status runs only execute when `github.event.deployment.ref == 'staging'`.
- Added shell-level ref validation to reject non-manual deployment refs other than `staging`.
- Kept manual `workflow_dispatch` fallback for explicit operator-driven alias updates.
- Updated deployment, launch, readiness, security, roadmap, and session documents.
- No DB split, Prisma migration, app runtime change, OAuth, webhook, billing, or affiliate logic change was made.

Follow-up:

1. Push the workflow update to `master`.
2. Trigger a real `staging` branch Preview deployment and verify the workflow succeeds.
3. Confirm a non-staging Preview deployment no longer triggers `Update Staging Alias`.
4. Split production and staging databases before onboarding real customers.

## Latest - 2026-06-24 Staging alias workflow remote verification

Status: verified end-to-end.

- GitHub Secret `VERCEL_TOKEN` is configured.
- GitHub Secret `VERCEL_SCOPE=a25814740s-projects` is configured and required for alias ownership.
- `.github/workflows/update-staging-alias.yml` is pushed to `master`.
- A temporary `codex/staging-alias-check` branch triggered a Vercel Preview deployment and GitHub `deployment_status` event.
- `Update Staging Alias` completed successfully.
- `https://staging.carry-digital-nomad.in.net` now resolves to `https://inboxpilot-303lebjos-a25814740s-projects.vercel.app`.
- The temporary branch was deleted after verification.

Follow-up:

1. Keep `VERCEL_SCOPE` set unless the Vercel project/domain ownership changes.
2. Rotate the GitHub `VERCEL_TOKEN` before June 24, 2027, or earlier if access policy changes.
3. Review and delete the two unused project-scoped Vercel tokens created during troubleshooting from the Vercel Tokens page.
4. Split production and staging databases before onboarding real customers.

## Latest - 2026-06-24 Staging alias auto-update workflow

Status: workflow added; first remote GitHub Actions run still needs verification after push / Preview deployment.

- Added `.github/workflows/update-staging-alias.yml`.
- The workflow listens for successful non-production GitHub `deployment_status` events and updates `staging.carry-digital-nomad.in.net` to the reported Vercel Preview deployment URL.
- Added manual `workflow_dispatch` fallback for entering a Preview deployment URL directly.
- The workflow requires GitHub Secret `VERCEL_TOKEN`; `VERCEL_SCOPE` is optional for team-scoped Vercel projects.
- Source deployment host is restricted to `*.vercel.app` before running `vercel alias set`.
- No DB split, Prisma migration, app runtime change, OAuth, webhook, billing, or affiliate logic change was made.

Follow-up:

1. Add `VERCEL_TOKEN` to GitHub repository secrets before relying on the workflow.
2. Add `VERCEL_SCOPE` if the Vercel project requires a team scope.
3. Verify the first successful Preview deployment updates `https://staging.carry-digital-nomad.in.net`.
4. If staging should only follow the `staging` branch, add a branch/ref guard after inspecting the actual deployment payload.
5. Split production and staging databases before onboarding real customers.

## Latest - 2026-06-19 Production simple release / preview full release split

Status: implemented at UI / entry-point level; DB remains shared temporarily.

- Production custom domain now defaults to the simple release surface.
- Vercel Preview / localhost defaults to the full planned version.
- Added `INBOXPILOT_RELEASE_CHANNEL=simple|full` override for deployment control.
- Added Vercel Production env: `INBOXPILOT_RELEASE_CHANNEL=simple`.
- Added Vercel Preview env: `INBOXPILOT_RELEASE_CHANNEL=full`.
- Added staging alias: `https://staging.carry-digital-nomad.in.net` -> current Preview deployment.
- Simple release keeps: Home, Inbox, Contacts, Instagram platform connection, Analytics, Automations, and Referrals.
- Simple release hides or redirects: Broadcasts, Sequences, AI settings, Billing, Wallet, Affiliate, Admin payout/affiliate pages, Templates, Tags, Segments, Knowledge Base, and Mock tester.
- Simple release blocks non-Instagram OAuth entry points at the proxy layer.
- Referral remains a referral activity feature, not affiliate cash payout.
- No DB schema, OAuth callback, webhook, billing, affiliate payout, or token storage changes were made.

Follow-up:

1. Automate `staging.carry-digital-nomad.in.net` updates via branch domain or post-preview-deploy alias command.
2. Split production and staging databases before onboarding real customers.
3. Add a smoke test for simple-release route redirects and non-IG OAuth blocking.
4. Decide whether Billing should stay hidden in first launch or return as a manual-plan / contact-sales screen.
5. Fix existing Broadcast API integration test drift: `scheduledAt` mock type and malformed payload error text.

Validation:

```text
npm run lint: passed
npm run build: passed with existing Prisma Windows DLL lock fallback
npm run test:e2e: passed, 10 tests
npm test: timed out after 244 seconds
npx vitest run tests/unit tests/integration --reporter=dot: failed on existing Broadcast API integration tests
npx vercel alias set inboxpilot-ap79iimgd-a25814740s-projects.vercel.app staging.carry-digital-nomad.in.net: passed
npx vercel env add INBOXPILOT_RELEASE_CHANNEL production --value simple --yes --force --no-sensitive: passed
npx vercel env add INBOXPILOT_RELEASE_CHANNEL preview --value full --yes --force --no-sensitive: passed
```

## Latest - 2026-06-16 Meta Business Login final App Review package assembly checklist

Status: package assembly checklist documented / App Review readiness Hold / Internal beta Hold / Production implementation No-Go.

- Added `docs/meta-business-login-final-app-review-package-assembly-checklist.md`.
- Documented the final package checklist for reviewer recording, screenshots, permission proof, redaction report, test asset proof, scope reconciliation, redacted callback evidence, workspace linking dry-run, channel sync dry-run, and rollback / fallback proof.
- Documented per-file gates before App Review packaging, including redaction search, visual review, scope reconciliation, no secrets, no unmasked asset IDs, no real customer data, rollback readiness, and sign-off.
- Documented file types that must not be packaged, including raw recordings, unredacted screenshots, HAR/network exports, unsearched logs, env files, browser storage exports, database dumps, and raw Meta responses.
- Internal beta remains Hold until the actual package is assembled and all gates pass.
- Production implementation remains No-Go.

## Latest - 2026-06-16 Meta Business Login final redaction search execution report template

Status: redaction search execution report template documented / App Review readiness Hold / Internal beta Hold / Production implementation No-Go.

- Added `docs/meta-business-login-final-redaction-search-execution-report-template.md`.
- Documented the final search scope for App Review documents, reviewer recordings, screenshots, test output, server logs, audit records, browser console evidence, network exports, and final upload package.
- Documented required searches for token, authorization code, secret, raw state, raw nonce, full callback URL, and unmasked Meta asset IDs.
- Documented allowed false positive rules, finding records, cleanup and retest flow, and internal beta Hold release decision.
- Internal beta remains Hold until the template is executed against the real final package and all findings are resolved.
- Production implementation remains No-Go.

## Latest - 2026-06-16 Meta Business Login final reviewer recording shot list

Status: reviewer recording shot list documented / App Review readiness Hold / Internal beta Hold / Production implementation No-Go.

- Added `docs/meta-business-login-final-reviewer-recording-shot-list.md`.
- Mapped each current or candidate Meta / Instagram permission to required reviewer recording shots and product screens.
- Documented recording segments for workspace entry, social connection, account selection, consent, redacted callback evidence, workspace linking dry-run, channel sync dry-run, channel detail, Inbox/message proof, comment automation proof, and Business / Page / IG asset selection proof.
- Documented values that must be masked or excluded from the recording package.
- Internal beta remains Hold until final recording, redaction search, scope reconciliation, access controls, rollback proof, and product owner sign-off are complete.
- Production implementation remains No-Go.

## Latest - 2026-06-16 Meta Business Login final permission usage proof matrix

Status: permission matrix documented / App Review readiness Hold / Internal beta Hold / Production implementation No-Go.

- Added `docs/meta-business-login-final-permission-usage-proof-matrix.md`.
- Documented every current or candidate Meta / Instagram permission, product screen, user action, data read/write/store behavior, retention/deletion expectation, reviewer proof, evidence status, and recommendation.
- Recommended the minimum Instagram Business Login candidate scope set: `instagram_business_basic`, `instagram_business_manage_messages`, and `instagram_business_manage_comments`.
- Marked `instagram_business_content_publish` and `instagram_business_manage_insights` as defer/remove until real product proof and reviewer demo evidence exist.
- Kept Facebook Login for Business permissions on Hold until selected-flow reconciliation and Business / Page / IG asset proof are complete.
- Production implementation remains No-Go.

## Latest - 2026-06-16 Meta Business Login final App Review demo package checklist

Status: final demo package checklist documented / Internal beta still Hold / Production implementation No-Go.

- Added `docs/meta-business-login-final-app-review-demo-package-checklist.md`.
- Reviewer demo recording checklist is documented.
- Permission usage proof checklist is documented.
- Business / Page / IG test asset checklist is documented.
- Account selection UX, redacted callback, workspace linking dry-run, channel sync dry-run, redaction, and rollback/fallback evidence checklists are documented.
- Internal beta remains Hold until final reviewer recording, permission proof, test asset package, redaction search, beta access controls, rollback proof, and product owner sign-off are complete.
- Production implementation remains No-Go.

## Latest - 2026-06-16 Meta Business Login internal beta access rollback runbook

Status: access / rollback runbook documented / Internal beta still Hold / Production implementation No-Go.

- Added `docs/meta-business-login-sandbox-internal-beta-access-rollback-runbook.md`.
- Internal-only beta entry point conditions are documented.
- Workspace allowlist and user/admin permission conditions are documented.
- Redaction search flow is documented.
- Production write guard monitoring items are documented.
- Token exchange must-not-happen checks are documented.
- Fallback to existing Instagram OAuth flow is documented.
- Rollback / disable beta steps are documented.
- Internal beta remains Hold until access control, allowlist, final App Review package, redaction search, rollback disable path, and product owner sign-off are complete.
- Production implementation remains No-Go.

## Latest - 2026-06-16 Meta Business Login internal beta review

Status: Hold before internal beta / Production implementation No-Go.

- Added `docs/meta-business-login-sandbox-internal-beta-go-no-go-review.md`.
- Account selection UX, consent screen, callback evidence, workspace linking dry-run, channel sync dry-run, production write guard, and redaction are Pass.
- App Review readiness remains Hold until final reviewer demo materials and permission proof are complete.
- Rollback / fallback readiness is Partial Pass because production fallback remains intact, but beta rollback operations still need finalization.
- Internal beta remains Hold.
- Production implementation remains No-Go.

## Latest - 2026-06-16 Meta Business Login sandbox controlled callback captured

Status: callback evidence Pass / workspace linking and channel sync dry-run Pass.

- Production callback guard deployment: Pass.
- Instagram Business Login account selection UX: Pass.
- Consent screen reachability: Pass.
- User-authorized callback evidence: Pass.
- Redaction: Pass for callback response body.
- Token exchange attempted: false.
- Production writes all false: true.
- Workspace linking dry-run: Pass.
- Channel sync dry-run: Pass.
- Next step: manual sandbox go/no-go review for internal beta readiness and App Review evidence completeness.
- Internal beta remains Hold.
- Production implementation remains No-Go.

## 2026-06-16 - Meta Business Login sandbox SBL-12 callback capture helper

Status: targeted helper tests passed.

- Added `src/lib/meta-business-sandbox-callback-capture.ts`.
- Added `tests/meta-business-login-sandbox-sbl12-callback-capture.test.ts`.
- Added `docs/meta-business-login-sandbox-controlled-callback-capture-plan.md` and `docs/meta-business-login-sandbox-sbl12-callback-capture-test-command.md`.
- Production callback route remains unchanged; route integration and real callback evidence remain Hold.
- Next safe step is choosing Option A sandbox redirect URI or Option B narrow production callback read-only guard with tests.

## 2026-06-16 - Meta Business Login sandbox next controlled callback prompt

Status: documented next step.

- Added `docs/meta-business-login-sandbox-next-controlled-callback-prompt.md`.
- The next safe step is controlled callback capture preparation, not blindly reopening the Instagram Business Login OAuth URL.
- The prompt requires sandbox-only capture design, redaction, state / workspace validation, and production write guards before any callback evidence run.
- Internal beta remains Hold. Production implementation remains No-Go.

## 2026-06-16 - Meta Business Login sandbox OAuth profile selection evidence

Status: Partial Pass / Hold before callback.

- Added `docs/meta-business-login-sandbox-oauth-profile-selection-run-2026-06-16.md`.
- Continued the Instagram Business Login flow to profile selection and selected `carry.digital.nomad`.
- Account selection UX is now confirmed: two profiles plus "use another profile" were shown.
- Final OAuth consent and callback evidence remain missing because Instagram loaded the selected profile home page after selection.
- Next safe step is not a blind OAuth retry; it requires sandbox callback capture or explicit production-safe test callback controls.

## 2026-06-15 - Meta Business Login sandbox authenticated browser evidence

Status: Partial Pass / Hold.

- Added `docs/meta-business-login-sandbox-authenticated-browser-evidence-run-2026-06-15.md`.
- Captured InboxPilot Meta App Dashboard evidence, Instagram API setup evidence, Instagram Business Login authorize URL evidence, business login settings evidence, permissions evidence, and partial account selection UX evidence.
- Key finding: Meta-provided Instagram Business Login URL uses `force_reauth=true` and `response_type=code`.
- Key finding: account selection UX can appear with IG profiles plus "use another profile", but callback evidence was not captured because the run stopped before selecting a profile and final authorization.
- Internal beta remains Hold. Production implementation remains No-Go.

## 2026-06-15 - Meta Business Login sandbox browser evidence run

Status: Hold at Facebook login.

- Added `docs/meta-business-login-sandbox-browser-evidence-run-2026-06-15.md`.
- In-app Browser reached Facebook login for Meta Developers but did not have an authenticated Meta developer session.
- Local route guard evidence passed: unauthenticated internal sandbox route calls returned 401 dry-run errors.
- No credentials, OTP, token, authorization code, app secret, raw state, raw nonce, full callback URL, or browser storage was read or entered.
- Internal beta and production implementation remain No-Go until real Meta dialog, account selection, callback, and App Review evidence is collected.

## 2026-06-15 - Meta Business Login sandbox external evidence handoff

Status: Hold, Chrome extension UI blocker.

- Added `docs/meta-business-login-sandbox-external-evidence-handoff.md`.
- Chrome reached Meta Developers Apps, but another extension UI blocked automation before page DOM inspection.
- Next step after Chrome is unblocked: collect real Meta App Dashboard, Meta dialog, account selection UX, redacted callback, and reviewer demo evidence.
- Internal beta and production implementation remain No-Go.

## 2026-06-15 - Meta Business Login sandbox SBL-11 evidence packet

Status: targeted evidence packet tests passed.

- Added `src/lib/meta-business-sandbox-evidence.ts`.
- Added `tests/meta-business-login-sandbox-sbl11-evidence-packet.test.ts`.
- Added `docs/meta-business-login-sandbox-sbl11-evidence-packet-test-command.md`.
- The packet keeps local dry-run evidence redacted, requires production write guard evidence, and keeps internal beta / production implementation blocked until real Meta sandbox evidence and App Review gates pass.
- Existing production OAuth flow, callback routes, login buttons, env, Prisma schema, token storage, and production ConnectedAccount / Channel writes remain unchanged.

## 2026-06-15 - Meta Business Login sandbox production isolation regression

Status: targeted production isolation test passed.

- Added `tests/meta-business-login-sandbox-production-isolation.test.ts`.
- Added `docs/meta-business-login-sandbox-production-isolation-test-command.md`.
- The test checks that existing production OAuth routes, UI entry points, and Prisma schema remain free of sandbox provider ids, sandbox helper references, and `/api/internal/oauth` exposure.
- Existing production OAuth flow, callback routes, login buttons, env, Prisma schema, token storage, and production ConnectedAccount / Channel writes remain unchanged.

## 2026-06-15 - Meta Business Login sandbox route helper integration

Status: targeted route integration tests passed.

- Integrated internal sandbox routes with state / nonce redacted evidence, code exchange dry-run classifier, dry-run callback evidence, workspace allowlist spoofing guard, and production write guard metadata.
- Updated SBL-01 route tests to verify helper-chain evidence on authorize and callback responses.
- Existing production OAuth flow, existing callback routes, login buttons, env, Prisma schema, token storage, and production ConnectedAccount / Channel writes remain unchanged.

## 2026-06-15 - Meta Business Login sandbox implementation final report

Status: sandbox coding complete, production blocked.

- Added `docs/meta-business-login-sandbox-implementation-final-report.md`.
- Sandbox coding is complete for internal-only dry-run scaffold, including route skeleton, state / nonce helpers, code exchange safe stub, redaction helper, dry-run payload builder, workspace allowlist guard, production write guard, and targeted tests.
- Internal beta and production implementation remain No-Go until real Meta sandbox evidence and App Review gates pass.

## 2026-06-15 - Meta Business Login sandbox SBL-06 to SBL-08 helpers

Status: targeted helper tests passed.

- Added SBL-06 dry-run callback payload builder, SBL-07 workspace allowlist guard, and SBL-08 production write guard.
- Added targeted tests and `docs/meta-business-login-sandbox-sbl06-08-test-command.md`.
- Existing OAuth flow, callback routes, login buttons, env, Prisma schema, production ConnectedAccount, and production Channel records were intentionally not changed.
- Sandbox helper set is now ready for SBL-10 final runbook / report / go-no-go consolidation.

## 2026-06-15 - Meta Business Login sandbox SBL-05 redacted logging helper

Status: targeted helper tests passed.

- Added `src/lib/meta-business-sandbox-redaction.ts` with sandbox-only payload redaction, Meta asset id masking, audit event creation, and unsafe payload detection.
- Added `tests/meta-business-login-sandbox-sbl05.test.ts` and `docs/meta-business-login-sandbox-sbl05-test-command.md`.
- Production audit behavior, production logging format, existing OAuth routes, existing callback routes, env, and Prisma schema were intentionally not changed.
- Next step: SBL-06 dry-run callback payload builder.

## 2026-06-15 - Meta Business Login sandbox SBL-04 code exchange helper

Status: targeted helper tests passed.

- Added `src/lib/meta-business-sandbox-code-exchange.ts` with sandbox-only code exchange classification.
- The helper skips token exchange by default, redacts authorization code / token output, and classifies safe error types.
- Added `tests/meta-business-login-sandbox-sbl04.test.ts` and `docs/meta-business-login-sandbox-sbl04-test-command.md`.
- Real Meta token exchange, env changes, token storage, existing OAuth routes, existing callbacks, Prisma schema, and production writes remain blocked.
- Next step: SBL-05 redacted logging helper.

## 2026-06-15 - Meta Business Login sandbox SBL-03 state nonce helpers

Status: targeted helper tests passed.

- Added `src/lib/meta-business-sandbox-state.ts` with sandbox-only state / nonce creation, hash-only records, TTL validation, single-use replay protection, provider / workspace / user binding, and redacted audit output.
- Added `tests/meta-business-login-sandbox-sbl03.test.ts` and `docs/meta-business-login-sandbox-sbl03-test-command.md`.
- Existing OAuth state helpers, callback routes, cookies, env, Prisma schema, and production token handling were intentionally not changed.
- Next step: SBL-04 server-side code exchange helper as safe stub / classifier.

## 2026-06-15 - Meta Business Login sandbox SBL-01 internal route skeleton

Status: targeted skeleton tests passed.

- Added sandbox-only internal authorize and callback route skeletons under `/api/internal/oauth/[provider]`.
- Added `src/lib/meta-business-sandbox.ts` with internal-only guards, sandbox provider validation, workspace allowlist validation, redacted dry-run authorize payloads, redacted dry-run callback payloads, and production write guard checks.
- Added SBL-01 helper and route tests plus `docs/meta-business-login-sandbox-sbl01-test-command.md`.
- Existing OAuth routes, existing callback routes, login buttons, env, Prisma schema, and production ConnectedAccount / Channel writes were intentionally not changed.
- Next step: SBL-03 state / nonce helpers.

## 2026-06-15 - Meta Business Login sandbox SBL-09 test scaffold coding

Status: targeted scaffold tests passed.

- Added SBL-09 test scaffold under `tests/`, including fixtures, redaction assertion helper, dry-run callback payload validation, raw URL rejection, and production write guard tests.
- Added `docs/meta-business-login-sandbox-sbl09-test-command.md` and backfilled runbook, experiment report, go/no-go checklist, coding risk test plan, security review, Meta App Review checklist, and session log.
- Decision: SBL-01 internal-only route skeleton may start next under internal-only / dry-run-first / no-production-write constraints; internal beta and production implementation remain No-Go.
- Product code, OAuth routes, callback routes, login buttons, Prisma schema, and env were intentionally not changed.

## 2026-06-15 - Meta Business Login sandbox SBL-09 coding readiness checklist

Status: documented only.

- Added `docs/meta-business-login-sandbox-sbl09-coding-readiness-checklist.md` to decide whether SBL-09 sandbox test scaffold coding can begin.
- Decision: SBL-09 is Go for sandbox test scaffold coding only; SBL-01 remains Hold, and internal beta / production implementation remain No-Go.
- Product code, OAuth routes, callback routes, login buttons, Prisma schema, and env were intentionally not changed.

## 2026-06-15 - Meta Business Login sandbox SBL-09 fixture redaction spec

Status: documented only.

- Added `docs/meta-business-login-sandbox-sbl09-fixture-redaction-spec.md` to define fixture naming, safe / unsafe fixture boundaries, redaction assertions, dry-run callback snapshots, production write guard fixtures, and evidence search standards.
- SBL-09 remains pre-coding documentation until the fixture and redaction rules are accepted as the required scaffold boundary; SBL-01, internal beta, and production implementation remain blocked.
- Product code, OAuth routes, callback routes, login buttons, Prisma schema, and env were intentionally not changed.

## 2026-06-15 - Meta Business Login sandbox SBL-09 test suite spec

Status: documented only.

- Added `docs/meta-business-login-sandbox-sbl09-test-suite-spec.md` to define the minimum sandbox test suite before SBL-01 route work.
- The spec covers internal-only route tests, workspace allowlist tests, state / nonce / code exchange tests, redacted logging tests, dry-run callback payload tests, and production write guard tests.
- Product code, OAuth routes, callback routes, login buttons, Prisma schema, and env were intentionally not changed.

## 2026-06-15 - Meta Business Login sandbox coding kickoff checklist

Status: documented only.

- Added `docs/meta-business-login-sandbox-coding-kickoff-checklist.md` to define kickoff checks before SBL-09 and SBL-01.
- The checklist separates test-suite scaffold readiness from route skeleton readiness, defines internal-only / dry-run-first / no-production-write checks, redaction search standards, required document backfills, and current internal beta / production blocks.
- Product code, OAuth routes, callback routes, login buttons, Prisma schema, and env were intentionally not changed.

## 2026-06-15 - Meta Business Login sandbox final readiness review

Status: documented only.

- Added `docs/meta-business-login-sandbox-final-readiness-review.md` to assess whether the sandbox document set is ready for coding.
- Conclusion: documentation is mostly ready, sandbox coding remains Hold until go/no-go is explicitly marked, and internal beta / production implementation remain No-Go.
- Recommended first coding-prep task is SBL-09 test suite scaffold planning before SBL-01 internal-only route skeleton.
- Product code, OAuth routes, callback routes, login buttons, Prisma schema, and env were intentionally not changed.

## 2026-06-15 - Meta Business Login sandbox coding task breakdown

Status: documented only.

- Added `docs/meta-business-login-sandbox-coding-task-breakdown.md` to break future sandbox coding into internal-only / dry-run-first tasks.
- The breakdown lists each task's prerequisite gates, test requirements, files and flows that must not be modified, and how to backfill runbook / report / go-no-go checklist evidence.
- Product code, OAuth routes, callback routes, login buttons, Prisma schema, and env were intentionally not changed.

## 2026-06-15 - Meta Business Login sandbox document index

Status: documented only.

- Added `docs/meta-business-login-sandbox-doc-index.md` to index all Meta Business Login sandbox research, planning, template, go/no-go, coding draft, and risk test plan documents.
- The index defines reading order, document purpose, decision path, template / draft status, unpassed gates, and the current block on production implementation.
- Product code, OAuth routes, callback routes, login buttons, Prisma schema, and env were intentionally not changed.

## 2026-06-15 - Meta Business Login sandbox coding risk test plan

Status: documented only.

- Added `docs/meta-business-login-sandbox-coding-risk-test-plan.md` to define pre-coding risks and tests for internal-only routes, sandbox provider interface, state / nonce / code exchange, redacted logging, dry-run payloads, workspace allowlist, and production Channel write guards.
- The plan defines the minimum checklist required before sandbox coding can start and keeps the decision at Hold if any gate is incomplete.
- Product code, OAuth routes, callback routes, login buttons, Prisma schema, and env were intentionally not changed.

## 2026-06-15 - Meta Business Login sandbox coding spec draft

Status: documented only.

- Added `docs/meta-business-login-sandbox-coding-spec-draft.md` to define the pre-coding technical draft for an internal-only sandbox Meta Business Login prototype.
- The draft covers internal-only route behavior, sandbox provider interface, state / nonce / code exchange helpers, redacted logging, dry-run callback payloads, workspace allowlist rules, production Channel write guards, and the explicit boundary that production OAuth flow, callback, button, env, schema, ConnectedAccount, and Channel remain unchanged.
- Product code, OAuth routes, callback routes, login buttons, Prisma schema, and env were intentionally not changed.

## 2026-06-15 - Meta Business Login sandbox go/no-go checklist

Status: documented only.

- Added `docs/meta-business-login-sandbox-go-no-go-checklist.md` to define decision gates for sandbox coding, internal beta, and production implementation readiness.
- The checklist covers App Review, account selection UX, callback security, workspace linking, channel sync, redaction, rollback, and the differences between sandbox coding, internal beta, and production implementation gates.
- Product code, OAuth routes, callback routes, login buttons, Prisma schema, and env were intentionally not changed.

## 2026-06-15 - Meta Business Login sandbox experiment report template

Status: documented only.

- Added `docs/meta-business-login-sandbox-experiment-report-template.md` as the first blank report template for summarizing sandbox-only Meta Business Login experiment results.
- The template captures experiment summary, test matrix coverage, Meta dialog UX, callback / workspace linking / channel sync results, redaction search results, ManyChat UX proximity, App Review risk, and go / hold / no-go decision.
- Product code, OAuth routes, callback routes, login buttons, Prisma schema, and env were intentionally not changed.

## 2026-06-15 - Meta Business Login sandbox runbook template

Status: documented only.

- Added `docs/meta-business-login-sandbox-runbook-template.md` as the execution record template for sandbox-only Meta Business Login experiments.
- The template covers pre-test checks, Meta App Dashboard settings, redacted authorize URL / callback payload records, account selection UX observations, workspace linking / channel sync checks, redaction search results, and go / no-go decision gates.
- Product code, OAuth routes, callback routes, login buttons, Prisma schema, and env were intentionally not changed.

## 2026-06-15 - Meta Business Login sandbox implementation plan

Status: documented only.

- Added `docs/meta-business-login-sandbox-implementation-plan.md` to define a sandbox-only experiment plan before any product implementation.
- The plan keeps production `meta-instagram` unchanged and requires isolated sandbox provider ids, separate env planning, callback state / nonce / code exchange security, redacted logging, App Review gates, workspace linking validation, and rollback criteria.
- Product code, OAuth routes, callback routes, login buttons, Prisma schema, and env were intentionally not changed.

## 2026-06-15 - AI model cache refresh automation

- Operational check only: `npm run ai-models:refresh` passed on 2026-06-15.
- Remote provider cache result remained stable across all 6 workspaces: `chatgpt 10`, `gemini 7`, `deepseek 2`, `xai 2`.
- `codex_cli` and `antigravity_cli` were still absent from the refresh payload without throwing errors, matching the existing local CLI gating behavior noted in automation memory.

## 2026-06-15 - Meta Business Login ADR before implementation

Status: documented only.

- Added an ADR for evaluating Facebook Login for Business, Instagram Business Login, and keeping the current Instagram OAuth flow before any product implementation.
- Recommendation: proceed only with sandbox-only research / implementation planning, not production replacement.
- Required gates before production: App Review readiness, env isolation, callback state / nonce / code exchange review, ConnectedAccount / Channel mapping, workspace linking isolation, channel sync failure handling, and token / code / secret redaction verification.
- Product code, OAuth routes, callback routes, login buttons, and env were intentionally not changed.

## 2026-06-15：Meta Account Selection 測試矩陣

- 新增 `docs/meta-business-login-account-selection-test-matrix.md`，定義未登入、單一登入、多帳號 session、桌機 / 手機、popup / redirect transport 的測試矩陣。
- 後續建議先用矩陣測目前 `meta-instagram` baseline，再測 Facebook Login for Business / Instagram Business Login sandbox flow，最後再決定是否進入產品實作。

## 2026-06-15：Meta App Review Demo Script

- 新增 `docs/meta-business-login-app-review-demo-script.md`，補齊 Facebook Login for Business / Instagram Business Login 的 reviewer demo、permission usage table、資料使用方式與不通過 App Review 的備援方案。
- 下一步若繼續文件任務，建議建立 account selection 測試矩陣，記錄未登入、單一登入、多帳號 session 下 Meta dialog 畫面與 callback 結果。

## 2026-06-15：Business Login 實驗規格

- 新增 `docs/meta-business-login-experiment-spec.md`，定義 Facebook Login for Business / Instagram Business Login 的文件型研究任務與實驗範圍。
- 後續不應直接改正式 OAuth flow；應先用 sandbox-only provider 或文件化手動 URL 驗證 account selection、callback payload、workspace linking 與 App Review 需求。
- 下一步建議補 `docs/meta-business-login-app-review-demo-script.md`，把 reviewer demo、permission usage、資料使用位置與 redaction checklist 寫清楚。

## 2026-06-15：Meta Login 帳號選擇研究待辦

- 已新增 `docs/meta-login-account-selection-analysis.md`，記錄目前 Instagram OAuth、Facebook OAuth、legacy Meta Business Login 相容路徑與 ManyChat 差異。
- 後續建議：
  - 評估 Facebook Login for Business / Business Login for Instagram 是否可成為正式 account selection flow。
  - 在實驗分支測試 `force_reauth`、`force_authentication`、`enable_fb_login` 對不同瀏覽器 session 的實際效果。
  - 調整 UI 文案，避免承諾「一定能強制切換帳號」。
  - 若導入 login configuration / `config_id`，同步更新 Meta App Review 文件與 QA demo script。

更新日期：2026-06-10

## 目前驗證狀態

已執行：

```bash
git status
npm run lint
npm run build
npm test
npm run payuni:smoke
```

結果：

- `git status`：有本輪預期變更
- `npm run lint`：通過
- `npm run build`：通過
- `npm test`：第一次遇到既有 Vitest 子程序 crash，第二次完整通過
- `npm run payuni:smoke`：通過

補充：

- `npm run build` 仍有既有 Prisma engine DLL lock `EPERM` 噪音
- `scripts/prisma-generate-safe.mjs` 已 fallback 到既有 generated client，因此不構成 build failure

## Phase 0：正式販售前 blocker

### 任務 1：修正 billing interval 與 subscription correctness

狀態：`已完成`

檔案：

- `src/lib/billing/payment-service.ts`
- `src/app/api/billing/payuni/checkout/route.ts`
- `prisma/schema.prisma`
- `prisma/migrations/20260610113000_payment_order_interval/migration.sql`
- `tests/payuni-billing.test.ts`
- `tests/billing-checkout-route.test.ts`
- `src/lib/audit.ts`

完成內容：

- `PaymentOrder` 新增 `interval`
- checkout 建立 payment order 時保存實際 month / year
- completion 改用 `order.interval`
- zero-amount / credit-only checkout 改走 internal completion flow
- completion success / failure 補安全 audit
- 補 month / year / zero-amount / idempotency 測試

### 任務 2：production 移除 Meta env token fallback

狀態：`未完成`

檔案：

- `src/lib/channels/meta.ts`
- `src/app/api/webhooks/meta/route.ts`
- `src/lib/instagram/comments-sync.ts`
- `scripts/refresh-meta-token.mjs`

具體任務：

- production 停用 `META_*` env fallback
- 強制 channel token / account binding
- 補 tenant isolation regression tests

### 任務 3：收斂 Meta OAuth production 主流程

狀態：`未完成`

檔案：

- `src/app/api/meta/oauth/start/route.ts`
- `src/app/api/meta/oauth/callback/route.ts`
- `src/app/api/oauth/[provider]/authorize/route.ts`
- `src/app/api/oauth/[provider]/callback/route.ts`
- `src/lib/oauth/providers/meta-facebook.ts`
- `src/lib/oauth/providers/meta-instagram.ts`

具體任務：

- 收斂 generic / legacy callback 混線
- 明確定義 Page / IG Business Account 選擇與重連流程
- 補 reviewer / QA demo 支援文件

### 任務 4：整理 Billing / legal / README 亂碼與對外文案

狀態：`未完成`

檔案：

- `README.md`
- `docs/project-launch-checklist.md`
- `docs/environment-variables.md`
- `src/lib/billing/plans.ts`
- `src/app/billing/page.tsx`
- `src/app/privacy-policy/page.tsx`
- `src/app/terms-of-service/page.tsx`
- `src/app/data-deletion/page.tsx`

具體任務：

- 統一 UTF-8
- 補齊繁中對外文案
- 明確標示 sandbox / production / trial / refund / cancellation 說明

### Phase 0 驗證指令

```bash
npm run lint
npm run build
npm test
npm run payuni:smoke
```

## Phase 1：Beta 試賣必修

### 任務 1：補齊 plan enforcement

檔案：

- `src/lib/billing/entitlements.ts`
- `src/app/api/sequences/route.ts`
- `src/app/api/automations/route.ts`
- `src/app/api/broadcasts/route.ts`

具體任務：

- 補 `sequences`
- 補 `teamSeats`
- 補 `activeContacts`
- 補 usage summary 與 quota gate 一致性

### 任務 2：補 trial / expired / past_due / unpaid 產品行為

檔案：

- `src/lib/billing/usage-service.ts`
- `src/lib/billing/entitlements.ts`
- `src/app/billing/page.tsx`

### 任務 3：補 onboarding / reconnect UX

檔案：

- `src/app/channels/connect/social/page.tsx`
- `src/app/channels/connect/success/page.tsx`
- `src/app/channels/page.tsx`

### 任務 4：補 affiliate terms / refund policy / cookie policy

檔案：

- `src/app/**`
- `docs/**`

### Phase 1 驗證指令

```bash
npm run lint
npm run build
npm test
npm run test:e2e
```

## Phase 2：公開販售必修

### 任務 1：完成 Meta App Review / Advanced Access / Business Verification

檔案：

- `docs/meta-app-review-checklist.md`
- Meta Developer 後台設定

### 任務 2：完成 PayUNI production go-live

檔案：

- `src/app/api/billing/payuni/checkout/route.ts`
- deployment env / runbook

### 任務 3：補 affiliate anti-fraud / payout reconciliation

檔案：

- `src/lib/billing/referral-service.ts`
- `src/lib/billing/affiliate-service.ts`
- `src/app/api/admin/**`

### 任務 4：補 billing / webhook / admin observability

檔案：

- `src/lib/audit.ts`
- `src/app/api/**`
- `scripts/**`

### Phase 2 驗證指令

```bash
npm run lint
npm run build
npm test
npm run test:e2e
npm run payuni:smoke
```

## Phase 3：規模化優化

### 任務 1：高併發與 load test 收斂

檔案：

- `src/lib/queue.ts`
- `scripts/worker.ts`
- `src/lib/messages.ts`
- `src/lib/instagram/comments-sync.ts`
- `src/app/api/dashboard/route.ts`

### 任務 2：queue-first ingestion / durable processing

檔案：

- `src/lib/jobs.ts`
- `src/lib/queue.ts`
- `scripts/worker.ts`

### 任務 3：補齊正式 channel productization

檔案：

- `src/lib/channels/**`
- `src/app/channels/**`

### Phase 3 驗證指令

```bash
npm run lint
npm run build
npm test
npm run test:e2e
npm run load:test
```

## 下一個建議 Codex 任務

```text
請先閱讀 AGENTS.md、docs/product-readiness-review.md、docs/security-review.md、docs/meta-app-review-checklist.md、docs/billing-affiliate-readiness.md、docs/fix-roadmap.md，然後只修 Phase 0 任務 2：

1. 在 production 模式移除 Meta env token fallback
2. 保留 local / sandbox 開發可用性，但正式環境必須強制使用 channel token
3. 補 tenant isolation regression tests，覆蓋 webhook、comment sync、send message
4. 更新 docs/codex-session-log.md、docs/fix-roadmap.md、docs/security-review.md、docs/product-readiness-review.md

限制：
- 不要大重構
- 不要改 Meta OAuth 主流程
- 先列出風險
- 完成後跑 npm run lint、npm run build、npm test
```
## 2026-06-16 - Meta Business Login Sandbox SBL-12 Callback Capture Guard

Completed:

- Added signed-state sandbox callback capture marker support.
- Added read-only sandbox callback capture guard to the Meta OAuth callback route.
- Added route-level regression test proving non-sandbox invalid-state callbacks still use the existing redirect path.
- Added callback capture test command documentation.

Still blocked:

- Real callback evidence has not been captured yet.
- Workspace linking and channel sync remain dry-run only.
- Internal beta remains Hold.
- Production implementation remains No-Go.
- Production callback deployment was blocked by CI because GitHub Actions still used SQLite for `npm test`; CI has been updated to use PostgreSQL service credentials.

Next best step:

```text
Run sandbox-only workspace linking and channel sync dry-run validation using the captured redacted callback evidence. Do not create production ConnectedAccount / Channel.
```

Controlled consent run status:

- Production callback guard deployment: Pass.
- Account selection UX: Pass.
- Consent screen reachability: Pass.
- Real callback evidence: Pass after the user clicked allow.
- Workspace linking: Hold.
- Channel sync: Hold.

## 2026-06-16 - Daily AI model refresh automation status

Current refresh result:

- `npm run ai-models:refresh` passed.
- Refreshed provider counts stayed at `chatgpt=10`, `gemini=7`, `deepseek=2`, `xai=2` across all workspaces.
- `codex_cli` and `antigravity_cli` were not refreshed because `AI_ENABLE_LOCAL_CLI` is unset, so `canUseAiProvider()` skips local CLI providers.

Follow-up:

- Decide whether the daily automation should keep local CLI providers opt-in only, or enable them explicitly in the refresh environment.
## 2026-06-17 - Daily AI model refresh automation status

Current refresh result:

- `npm run ai-models:refresh` passed.
- Refreshed provider counts stayed at `chatgpt=10`, `gemini=7`, `deepseek=2`, `xai=2` across all 6 workspaces.
- `codex_cli` and `antigravity_cli` were not refreshed because `AI_ENABLE_LOCAL_CLI` is unset, so `canUseAiProvider()` still skips local CLI providers.

Follow-up:

- Decide whether the daily automation should keep local CLI providers opt-in only, or enable them explicitly in the refresh environment.
## 2026-06-18 - Daily AI model refresh automation status

Current refresh result:

- `npm run ai-models:refresh` passed.
- Refreshed provider counts stayed at `chatgpt=10`, `gemini=7`, `deepseek=2`, `xai=2` across all 6 workspaces.
- `codex_cli` and `antigravity_cli` were not refreshed because `refreshAllAiModels()` skips providers that fail `canUseAiProvider()`, and local CLI providers remain disabled while `AI_ENABLE_LOCAL_CLI` is unset outside local development.

Follow-up:

- Keep local CLI providers opt-in for now, or explicitly enable `AI_ENABLE_LOCAL_CLI` in the automation environment if stale CLI model caches become a problem.
## 2026-06-19 - Daily AI model refresh automation status

Current refresh result:

- `npm run ai-models:refresh` passed.
- Refreshed provider counts stayed at `chatgpt=10`, `gemini=7`, `deepseek=2`, `xai=2` across all 6 workspaces.
- `codex_cli` and `antigravity_cli` were not refreshed because `refreshAllAiModels()` only includes providers that pass `canUseAiProvider()`, and local CLI providers remain disabled while `AI_ENABLE_LOCAL_CLI` is unset outside local development.

Follow-up:

- If this automation must also refresh local CLI caches, enable `AI_ENABLE_LOCAL_CLI=true` in the automation environment first.

## 2026-06-19 - Daily AI model refresh automation status

Current refresh result:

- `npm run ai-models:refresh` passed.
- Refreshed provider counts stayed at `chatgpt=10`, `gemini=7`, `deepseek=2`, `xai=2` across all 6 workspaces.
- `codex_cli` and `antigravity_cli` were not refreshed because `refreshAllAiModels()` only includes providers that pass `canUseAiProvider()`, and local CLI providers remain disabled while `AI_ENABLE_LOCAL_CLI` is unset outside local development.

Follow-up:

- If this automation must also refresh local CLI caches, enable `AI_ENABLE_LOCAL_CLI=true` in the automation environment first.
## 2026-06-19 - AI local CLI refresh policy

Decision:

- Do not enable `AI_ENABLE_LOCAL_CLI=true` in the shared daily automation environment by default.
- Keep `codex_cli` and `antigravity_cli` as explicit opt-in providers for local development or a machine that is known to have the CLI installed and authenticated.

Reason:

- Daily shared cron should not depend on local CLI installation state, login state, or machine-specific PATH / cache files.
- API-backed providers already cover the stable shared refresh path.

Follow-up:

- If the team later wants CLI providers in automation, enable `AI_ENABLE_LOCAL_CLI=true` only in a runtime that also guarantees CLI installation and authentication.
- Keep docs and env examples explicit that local CLI refresh is opt-in.
## 2026-06-20 - Daily AI model refresh automation status

Current refresh result:

- `npm run ai-models:refresh` passed.
- Refreshed provider counts stayed at `chatgpt=10`, `gemini=7`, `deepseek=2`, `xai=2` across all 6 workspaces.
- `codex_cli` and `antigravity_cli` were not refreshed because `refreshAllAiModels()` only includes providers that pass `canUseAiProvider()`, and local CLI providers remain disabled while `AI_ENABLE_LOCAL_CLI` is unset outside local development.
- No provider failures were reported in this run.

Follow-up:

- Keep local CLI providers opt-in for shared automation unless the runtime explicitly guarantees CLI installation and authentication.

## 2026-06-26 - Alias workflow PR safety

- `[x]` Prepare alias workflow changes on a non-default branch instead of pushing directly to `master`.
- `[x]` Harden staging alias automation so Production deployments cannot update `staging.carry-digital-nomad.in.net`.
- `[x]` Add Production alias automation so only Ready Production deployments can update `inboxpilot.carry-digital-nomad.in.net`.
- `[x]` Document the Vercel `autoAssignCustomDomains=false` operating model and manual fallback commands.
- `[x]` Confirmed the draft PR branch created a Ready Vercel Preview deployment and no Production deployment.

## 2026-06-21 - Daily AI model refresh automation status

Current refresh result:

- `npm run ai-models:refresh` passed.
- Refreshed provider counts stayed at `chatgpt=10`, `gemini=7`, `deepseek=2`, `xai=2` across all 6 workspaces.
- `codex_cli` and `antigravity_cli` were not refreshed because `refreshAllAiModels()` only includes providers that pass `canUseAiProvider()`, and local CLI providers remain disabled while `AI_ENABLE_LOCAL_CLI` is unset outside local development.
- No provider failures were reported in this run.

Follow-up:

- Keep local CLI providers opt-in for shared automation unless the runtime explicitly guarantees CLI installation and authentication.

## 2026-06-22 - Daily AI model refresh automation status

Current refresh result:

- `npm run ai-models:refresh` passed.
- Refreshed provider counts stayed at `chatgpt=10`, `gemini=7`, `deepseek=2`, `xai=2` across all 6 workspaces.
- `codex_cli` and `antigravity_cli` were not refreshed because `canUseAiProvider()` only enables local CLI providers when `AI_ENABLE_LOCAL_CLI` is truthy, or when running local development outside Vercel.
- No provider failures were reported in this run.

Follow-up:

- Keep local CLI providers opt-in for shared automation unless the runtime explicitly guarantees CLI installation and authentication.
## 2026-06-23 - Daily AI model refresh automation status

Current refresh result:

- `npm run ai-models:refresh` passed.
- Refreshed provider counts stayed at `chatgpt=10`, `gemini=7`, `deepseek=2`, `xai=2` across all 6 workspaces.
- `codex_cli` and `antigravity_cli` were not refreshed because local CLI providers remain gated behind `AI_ENABLE_LOCAL_CLI` opt-in behavior.
- No provider failures were reported in this run.

Follow-up:

- Keep local CLI providers opt-in for shared automation unless the runtime explicitly guarantees CLI installation and authentication.
## 2026-06-24 - Daily AI model refresh automation status

Current refresh result:

- `npm run ai-models:refresh` passed.
- Refreshed provider counts stayed at `chatgpt=10`, `gemini=7`, `deepseek=2`, `xai=2` across all 6 workspaces.
- `codex_cli` and `antigravity_cli` were not refreshed because local CLI providers remain gated behind `AI_ENABLE_LOCAL_CLI` opt-in behavior.
- No provider failures were reported in this run.

Follow-up:

- Keep local CLI providers opt-in for shared automation unless the runtime explicitly guarantees CLI installation and authentication.

## 2026-06-26 - Public paid launch control room

Current status:

- `[x]` PR #5 is merged into `master`.
- `[x]` Master CI passed after merge.
- `[x]` Production and staging health checks are ok.
- `[x]` Production and staging aliases remain mutually isolated.
- `[x]` Meta App Review submission package and reviewer handoff documents are merged.
- `[x]` PayUNI production go-live checklist is merged.
- `[x]` Added `docs/public-paid-launch-control-room.md` as the final launch decision hub.

Remaining:

- `[ ]` Meta App Review / Advanced Access / Business Verification approval.
- `[ ]` Final reviewer recording, screenshot package, permission proof, and redaction sign-off.
- `[ ]` PAYUNi production merchant approval.
- `[ ]` Controlled `PAYUNI_ALLOW_PRODUCTION=true` enablement.
- `[ ]` First low-value production checkout smoke.
- `[ ]` Final billing/legal/support owner sign-off.

Decision:

- Private beta / whitelist remains Go.
- Public paid launch remains Hold until the external Meta and PayUNI gates are completed.

## 2026-06-26 - Meta App Review operator workbook

Current status:

- `[x]` Added `docs/meta-app-review-operator-submission-workbook.md`.
- `[x]` Consolidated the Meta App Review preparation flow into one operator-facing workbook.
- `[x]` Included recording steps, screenshot list, Meta Dashboard fields, permission mapping, redaction review, and upload manifest.
- `[x]` Added `docs/meta-app-review-day-of-recording-run-card.md` as a concise day-of checklist for the human operator.
- `[ ]` Capture final reviewer recording and screenshots.
- `[ ]` Prepare reviewer-safe credentials through secure handoff.
- `[ ]` Manually fill Meta Dashboard fields.
- `[ ]` Manually submit App Review.

Decision:

- Meta App Review package preparation is ready for human execution.
- Public paid launch remains Hold until Meta approval is actually granted.

## 2026-06-26 - Autopilot local readiness closeout

Current status:

- `[x]` Supabase CLI is installed and authenticated through a secure local token input flow.
- `[x]` Supabase CLI can read production ref `lmwvzskffzozuiamjxvc` and staging ref `ndhtwqtshselqwgjenjd`.
- `[x]` Local Supabase CLI context is linked to staging ref `ndhtwqtshselqwgjenjd`.
- `[x]` Vercel CLI is linked to the InboxPilot project.
- `[x]` Staging Preview env metadata can be pulled through Vercel CLI without printing values.
- `[x]` PayUNI sandbox env is available locally in ignored `.env.local`.
- `[x]` `npm run payuni:smoke` passes against sandbox.
- `[x]` Local test DB env uses local Supabase Postgres, not production.
- `[x]` `npm test`, `npm run lint`, and `npm run build` pass.
- `[x]` `npm audit --audit-level=high` passes.
- `[ ]` Two moderate dependency advisories remain; do not apply npm's force downgrade path automatically.
- `[ ]` Meta App Review approval remains external/manual.
- `[ ]` PayUNI production merchant approval and live low-value smoke remain external/manual.

Decision:

- Autopilot local execution readiness: Go for sandbox/test-safe unattended runs.
- Public paid launch: Hold until Meta and PayUNI external gates are complete.
