# InboxPilot Security Review

## 2026-06-26 - Autopilot report cleanup closeout

Scope:

- Cleaned transient autopilot reports after the runner exited.
- Re-ran a no-value reports secret-pattern scan.
- Confirmed no production deployment, production DB/schema write, Meta action, or PayUNI production action occurred during cleanup.

Security decision:

- Report handling blocker is closed: `reports/autopilot-live.log` and other raw output artifacts with secret-pattern matches were removed.
- Reports secret-pattern scan now returns `NO_MATCHES`.
- Report files remain ignored by git.
- Tracked diff remains documentation plus `package-lock.json`; no `.env*`, Prisma/Supabase schema, Vercel config, GitHub workflow, Meta App Review, PayUNI production, or custom domain alias changes were detected.

Residual risk:

- Meta App Review and PayUNI production remain human-only external gates.
- Authenticated route smoke / E2E is still required before preview readiness can be marked complete.

## 2026-06-26 - Unattended safety reviewer refresh

Scope:

- Reviewed current source/docs/report/git diff for unattended autopilot safety.
- Checked secret leakage, `.env*` modifications, Prisma/Supabase schema risk, destructive DB command risk, tenant/auth/webhook/payment boundaries, Meta App Review boundaries, PayUNI sandbox/prod separation, Vercel Production deployment risk, and custom domain alias crossing.

Security decision:

- Safety remains Fail because `reports/autopilot-live.log` is locked by another process and still has secret-pattern matches.
- Git diff itself is clean for the configured secret-pattern scan.
- Tracked diff is limited to docs plus `package-lock.json`; no `.env*`, Prisma/Supabase schema, Vercel config, GitHub workflow, Meta App Review, PayUNI production, or custom domain alias changes were detected.
- Removed writable sensitive report outputs: `reports/codex-output-loop-1.md` and `reports/qa-output-loop-1.md`.

Residual risk:

- Do not share, archive, upload, or treat `reports/` as safe until `reports/autopilot-live.log` is released by the active runner and deleted or redacted.
- Meta App Review and PayUNI production remain human-only external gates.

## 2026-06-26 - Unattended loop 1 readiness refresh

Scope:

- Refreshed QA/safety evidence after local environment readiness improved.
- Verified Vercel/Supabase/PayUNI state without printing secret values.
- Cleaned stale generated output reports that had sensitive-pattern hits.

Security decision:

- Safety remains Fail only because `reports/autopilot-live.log` is locked by active autopilot runner processes.
- Other generated reports were cleaned: after removing stale raw output files, the reports scan excluding the locked live log no longer found DB URL, OpenAI key, private key, or Slack token patterns.
- No `.env*`, Prisma schema/migration, Vercel config, Meta dashboard/App Review, PayUNI production setting, or production DB change was made.

Validation:

```text
npm install: passed.
npm run lint: passed.
npm test: passed.
npm run build: passed.
npm run payuni:smoke: passed against sandbox.
npm audit --audit-level=high: passed.
Vercel Production / Preview env-name inspection: TOKEN_ENCRYPTION_KEY present, values not printed.
Supabase project inspection: read-only pass, local link points to test project.
```

Residual risk:

- Do not share, archive, or upload `reports/` until the active runner releases `reports/autopilot-live.log` and that file is deleted or redacted.
- PayUNI production and Meta App Review remain human-only external gates.

## 2026-06-26 - Unattended safety reviewer report

Scope:

- Reviewed current source/docs/report/git diff after unattended loop 1.
- Checked `.env*`, Prisma/schema risk, destructive DB command risk, tenant/auth/webhook/payment/Meta/Vercel/domain boundaries, and report leakage risk.

Security decision:

- Safety review is Fail because `reports/autopilot-live.log` is locked by an active logging process and still has secret-pattern matches.
- Tracked source/docs diff did not modify `.env*`, Prisma schema/migrations, Vercel workflow/config, custom domain alias logic, PayUNI production switching, or Meta dashboard/submission behavior.
- `src/lib/deployment-env.ts` and `src/lib/secrets.ts` changes remain security-positive: plain `NODE_ENV=production` now maps to production behavior, and production token encryption requires a dedicated `TOKEN_ENCRYPTION_KEY`.

Action taken:

- Redacted writable report outputs where safe.
- Wrote `reports/safety-report.md` with Fail status.
- Added a `HUMAN_REQUIRED` item for deleting or redacting the locked live log after the runner releases it.

Residual risk:

- Do not share, archive, upload, or treat `reports/` as safe until the locked live log is removed or redacted and the secret-pattern scan is clean.

## 2026-06-26 - Unattended loop 1 production encryption hardening

Scope:

- Hardened deployment environment detection.
- Hardened secret encryption key selection.
- Ran a non-force npm audit fix for supply-chain risk reduction.

Security changes:

- `src/lib/deployment-env.ts` now treats `NODE_ENV=production` as production if no explicit InboxPilot/Vercel deployment marker is present.
- `src/lib/secrets.ts` now requires `TOKEN_ENCRYPTION_KEY` in production and rejects using the same value as `AUTH_SECRET`.
- `tests/security.test.ts` covers both behaviors.
- `package-lock.json` was updated by non-force `npm audit fix`, removing the high-severity audit finding.

Validation:

```text
npx vitest run tests/security.test.ts tests/unit/core-utils.test.ts tests/meta-channel-config.test.ts --reporter=dot
Result: passed. 3 files, 19 tests.

npm run lint
Result: passed.

npm run build
Result: passed.

npm audit --audit-level=high
Result: passed. Remaining audit findings are 2 moderate Next/PostCSS force-only findings.
```

Residual risk:

- Vercel Production and Preview env names must be checked for `TOKEN_ENCRYPTION_KEY` before deploying this change.
- Full DB-backed tests remain blocked locally until an isolated test DB URL is provided.
- PayUNI sandbox smoke remains blocked locally until sandbox env values are provided.

## 2026-06-26 - Unattended autopilot security review

Scope:

- Added InboxPilot unattended automation package.
- Reviewed ReplyPilot reference autopilot and adapted it to InboxPilot's production, Meta, Supabase, Vercel, and PayUNI risk model.

Security properties:

- Reports are gitignored under `reports/`.
- `.env*` files remain ignored except `.env.example`.
- Autopilot prompts forbid printing or committing secrets, DB URLs, service role keys, OAuth codes, callback query strings, cookies, and PayUNI signing values.
- Production DB/schema writes are blocked by policy: no `prisma db push`, `prisma migrate deploy`, `prisma migrate reset`, destructive SQL, or production Supabase writes.
- Meta Dashboard login and App Review submission are blocked.
- PayUNI production switch and live payment are blocked; sandbox smoke remains the allowed path.
- Vercel Preview deployment is allowed when authenticated; Production deployment remains disabled by default and requires `INBOXPILOT_AUTOPILOT_ALLOW_PRODUCTION=1`.

Residual risk:

- The runner coordinates AI subprocesses and shell commands, so it is a policy guard, not a hard OS sandbox.
- Generated reports are scanned for known forbidden command patterns, but a human should still review `reports/safety-report.md` and `reports/final-report.md` after overnight runs.

Decision:

- Acceptable for unattended preview/staging readiness work.
- Not approved for unattended Meta submission, PayUNI production go-live, production DB/schema changes, or production customer launch.
## 2026-06-26 - Authenticated route smoke CI guard

Scope:

- Added CI and nightly authenticated Playwright smoke for launch-critical authenticated pages.
- Added a `TEST_DATABASE_URL`-only guard and a guarded E2E admin seed script.

Security properties:

- Authenticated route smoke refuses to run without `TEST_DATABASE_URL`.
- Authenticated route smoke refuses production project ref `lmwvzskffzozuiamjxvc`.
- Authenticated route smoke refuses `INBOXPILOT_DB_ENV=production`.
- The E2E admin seed script uses `TEST_DATABASE_URL` and refuses production DB markers before writing.
- Instagram connect smoke renders the internal connect page only and does not click OAuth.
- Billing smoke renders the billing page only and does not submit checkout.

Decision:

- CI/nightly authenticated route smoke is safe to run against the GitHub Actions PostgreSQL service.
- No Production DB, Production deployment, Meta App Review submission, or PayUNI production transaction is involved.

## 2026-06-26 - PR #2 production deployment security delta

Scope:

- Confirmed PR #2 is deployed to the production target at deployment `dpl_2Ramd6D54Xn1qc7vxxsgXGXacUni`.
- Confirmed PR #3 is merged and deployed through controlled production deployment `dpl_GGk9zyF3r1F1hZ6ons3Fzfh6y5hL`.
- Confirmed production custom domain resolves to the PR #2 production deployment.
- Confirmed production `/api/health` is ok.
- Confirmed staging remains on a Preview deployment and `/api/health/staging` is ok.
- Added route-level tenant isolation regression tests for channel update, contact read/tagging, manual automation run, and PayUNI checkout idempotency/invoice scope.
- Confirmed the non-DB launch regression suite passes.
- No DB commands, Prisma commands, SQL, migrations, schema changes, or secret output were used for this delta.

Security decision:

- Production Meta global fallback hardening is live on the formal production runtime.
- Production must now rely on tenant/workspace channel credentials for Meta token and Instagram business account id resolution.
- This closes the main global Meta fallback risk, but it does not replace authenticated tenant isolation testing.
- The first route-level tenant isolation regression layer is now covered without DB access.

Residual risk:

- Workspaces that previously relied on global Meta fallback need channel reconnect before production use.
- Authenticated tenant isolation smoke and DB-backed tests still need coverage across channels, inbox, contacts, automations, billing, and webhook/callback paths.
- Meta App Review and PayUNI production approval remain external launch gates.

## 2026-06-26 - Production Meta fallback hardening

Scope:

- Added a deployment-env helper so security-sensitive runtime behavior can distinguish `production`, `staging`, `development`, and `test`.
- Disabled global Meta env fallback in production deployment envs.
- Blocked production use of `META_PAGE_ACCESS_TOKEN`, `META_PAGE_ID`, and `META_INSTAGRAM_BUSINESS_ACCOUNT_ID` as substitutes for workspace/channel credentials.
- Blocked production execution of `scripts/refresh-meta-token.mjs`.
- Added regression tests for production fallback disablement and non-production smoke fallback behavior.

Security decision:

- The main production Meta global fallback path is closed locally.
- No secret values, DB URLs, tokens, connection strings, DB commands, Prisma commands, SQL, schema changes, or migrations were introduced.
- Public paid launch still requires broader tenant isolation regression tests and final Meta App Review evidence.

## 2026-06-24 - Release mode proxy guard

Scope:

- Added release-channel based filtering for the simple production surface.
- Added proxy checks that redirect full-only app pages away from simple production.
- Added proxy checks that block non-Instagram OAuth entry points on simple production with a 404 JSON response.

Security notes:

- The proxy guard reduces accidental exposure of unfinished product areas, but it is not an authorization boundary by itself.
- Existing route handlers must still enforce authentication, workspace / tenant isolation, rate limits, CSRF / Origin checks where applicable, and webhook / payment signature validation.
- No tokens, secrets, authorization codes, or API keys were added to code, logs, docs, or tests in this change.
- Shared production/staging DB remains a launch risk until split before real customer onboarding.

## 2026-06-24 - Master / staging pre-launch env and DB risk note

Scope:

- Documented current release mode, Vercel env, and DB sharing risk in `docs/master-staging-prelaunch-checklist.md`.
- Release-mode application code is now prepared for commit; no OAuth token exchange flow, webhook flow, payment flow, Prisma schema, token storage, or DB settings were changed.

Security findings:

- Production Vercel env contains runtime secrets and `INBOXPILOT_RELEASE_CHANNEL`.
- Preview Vercel env currently lists only `INBOXPILOT_RELEASE_CHANNEL`.
- If staging should temporarily share DB, required Preview env vars must be added intentionally rather than assumed.
- If staging should be production-like, it needs a separate DB before real customer onboarding.
- The local release-mode implementation and smoke tests are prepared for commit to `master` and `staging`.

Residual risk:

- Shared DB can let staging tests mutate production-visible data.
- Missing Preview runtime env can make staging look deployed while failing on DB-backed routes.
- Meta env token fallback remains a production tenant-isolation risk until removed.

## 2026-06-24 - Staging alias branch guard security note

Scope:

- Restricted the automatic staging alias workflow to successful `staging` branch Preview deployments only.
- Kept manual `workflow_dispatch` fallback for explicit operator-driven alias updates.
- No application code, OAuth flow, webhook flow, payment flow, Prisma schema, or database separation was changed.

Security properties:

- Feature / codex / master Preview deployments no longer move `staging.carry-digital-nomad.in.net` automatically.
- The workflow job condition requires `github.event.deployment.ref == 'staging'` for automatic deployment-status runs.
- The shell validation step also rejects non-manual deployment refs other than `staging`.
- Existing `*.vercel.app` host validation and Production deployment exclusion remain in place.

Residual risk:

- Manual workflow dispatch can still update staging alias when an operator explicitly enters a Preview deployment URL.
- Staging and production still share a database temporarily. Preview deployments can still operate on shared data until DBs are separated.

## 2026-06-24 - Staging alias automation security note

Scope:

- Added GitHub Actions workflow to update `staging.carry-digital-nomad.in.net` after successful non-production Vercel deployment status events.
- Added manual `workflow_dispatch` fallback that accepts a Preview deployment URL.
- No application code, OAuth flow, webhook flow, payment flow, Prisma schema, or database separation was changed.

Security properties:

- `VERCEL_TOKEN` is required as a GitHub Secret and is not stored in repository files.
- `VERCEL_SCOPE` is optional and is also read only from GitHub Secrets.
- The workflow only accepts deployment hosts ending in `.vercel.app` before running `vercel alias set`.
- Production deployment events are excluded from the automatic trigger condition.

Residual risk:

- Staging and production still share a database temporarily. Preview deployments can still operate on shared data until DBs are separated.
- Automatic alias updates are now branch-guarded to the `staging` deployment ref.

## 2026-06-19 - Simple production release entry-point security note

Scope:

- Added release-channel detection for production simple release vs preview full release.
- Added proxy-level blocking for full-only app routes on the simple production host.
- Added proxy-level blocking for non-Instagram OAuth entry points on the simple production host.
- Updated navigation and channel connection UI to expose Instagram-only connection on the simple production host.
- Configured Vercel env split: Production `INBOXPILOT_RELEASE_CHANNEL=simple`, Preview `INBOXPILOT_RELEASE_CHANNEL=full`.
- Added `staging.carry-digital-nomad.in.net` as a Vercel alias to the current Preview deployment.

Security properties:

- No token, secret, authorization code, API key, raw callback URL, webhook secret, or payment secret was added to frontend code, URLs, logs, docs, or audit payloads.
- No OAuth callback storage, webhook processing, payment notification processing, Prisma schema, or tenant query logic was changed.
- Non-Instagram providers remain available on preview / full release only.

Residual risk:

- Production and preview still share the same database temporarily. This is acceptable only while there are no real customer operations; split DBs before real launch.
- Feature hiding is not a substitute for authorization. Existing route-level auth and tenant checks remain required.
- The current staging alias points to one Preview deployment. Automate branch-domain alias updates before treating it as always-current staging.

Validation:

```text
npm run lint
Result: passed
```

## 2026-06-16 - Meta Business Login internal beta real evidence execution plan security note

Scope: documentation-only real evidence execution plan.

- Added `docs/meta-business-login-internal-beta-real-evidence-execution-plan.md`.
- The plan defines real artifact collection, artifact owner/version/redaction gates, reviewer recording and screenshot order, permission proof and test asset proof collection, redaction report execution, access-control tests, rollback/fallback tests, production write guard tests, token exchange guard tests, and required template backfill.
- The plan keeps internal beta at Hold until all real evidence gates are Pass and all sign-offs are recorded.
- The plan explicitly blocks Supabase migration / `db push`, production OAuth flow changes, callback changes, login button changes, env changes, Prisma schema changes, production ConnectedAccount / Channel writes, and real Meta token exchange.
- Existing production OAuth routes, callback routes, login buttons, env, Prisma schema, token storage, and production write paths were not changed.

## 2026-06-16 - Meta Business Login internal beta document index security note

Scope: documentation-only internal beta document index.

- Added `docs/meta-business-login-internal-beta-doc-index.md`.
- The index lists each internal beta document, reading order, evidence-to-closeout path, template / draft status, open gates, internal beta Hold reasons, App Review submission preparation status, and production No-Go reasons.
- The index explicitly blocks Supabase migration / `db push`, production OAuth flow changes, callback changes, login button changes, env changes, Prisma schema changes, production ConnectedAccount / Channel writes, and real Meta token exchange during this documentation phase.
- The index repeats the prohibition on writing raw token, authorization code, raw state, raw nonce, full callback URL, secret, browser storage, unmasked asset ID, or real customer data into docs, logs, audit, test output, screenshots, or recordings.
- Existing production OAuth routes, callback routes, login buttons, env, Prisma schema, token storage, and production write paths were not changed.

## 2026-06-16 - Meta Business Login internal beta closeout report template security note

Scope: documentation-only internal beta closeout report template.

- Added `docs/meta-business-login-internal-beta-closeout-report-template.md`.
- The template summarizes beta monitoring, access control, redaction, guard, UX, fallback, issues, pause triggers, remediation, final beta conclusion, App Review submission preparation readiness, and missing production evidence.
- The template keeps production implementation at No-Go even after a successful beta closeout until App Review approval, Business Verification / Advanced Access confirmation, production token lifecycle review, callback security review, tenant isolation review, rollback plan, and any required Supabase project confirmation are complete.
- The template forbids copying raw token, authorization code, secret, raw state, raw nonce, full callback URL, credential, OTP, cookie, browser storage, unmasked asset ID, or real customer data into the report.
- Supabase migration / `db push` is explicitly out of scope; future Supabase migration work must first show project_id, linked project, and Supabase account email, then wait for confirmation.
- Existing production OAuth routes, callback routes, login buttons, env, Prisma schema, token storage, and production write paths were not changed.

## 2026-06-16 - Meta Business Login internal beta monitoring report template security note

Scope: documentation-only internal beta monitoring report template.

- Added `docs/meta-business-login-internal-beta-monitoring-report-template.md`.
- The template monitors workspace allowlist, user role, internal-only access, redaction, logging, audit, evidence artifacts, production write guard, token exchange guard, account selection UX, consent, callback evidence, rollback / fallback health, and beta pause triggers.
- The template requires immediate beta pause for raw token, authorization code, raw state, raw nonce, full callback URL, secret, browser storage, unmasked asset ID, real customer data, token exchange, production writes, unauthorized access, fallback outage, scope drift, unresolved findings, or broken rollback.
- Supabase migration / `db push` is explicitly out of scope; future Supabase migration work must first show project_id, linked project, and Supabase account email, then wait for confirmation.
- Existing production OAuth routes, callback routes, login buttons, env, Prisma schema, token storage, and production write paths were not changed.

## 2026-06-16 - Meta Business Login internal beta launch checklist security note

Scope: documentation-only internal beta launch checklist.

- Added `docs/meta-business-login-internal-beta-launch-checklist.md`.
- The checklist blocks internal beta launch unless release decision memo sign-off, launch preconditions, internal-only entry point, workspace allowlist, user role, redaction, logging, audit, evidence artifact, production write guard, token exchange guard, rollback, and fallback checks pass.
- The checklist defines immediate pause conditions for raw token, authorization code, raw state, raw nonce, full callback URL, secret, browser storage, unmasked asset ID, real customer data, token exchange, production writes, unauthorized access, fallback outage, scope drift, unresolved findings, or broken rollback.
- Supabase migration / `db push` is explicitly out of scope; future Supabase migration work must first show project_id, linked project, and Supabase account email, then wait for confirmation.
- Existing production OAuth routes, callback routes, login buttons, env, Prisma schema, token storage, and production write paths were not changed.

## 2026-06-16 - Meta Business Login internal beta release decision memo security note

Scope: documentation-only internal beta release decision memo template.

- Added `docs/meta-business-login-internal-beta-release-decision-memo-template.md`.
- The memo requires evidence execution, package assembly, redaction, reviewer recording, screenshots, permission proof, test asset proof, internal-only access, rollback / fallback, production write guard, token exchange guard, and sign-off before internal beta can become Go.
- If internal beta becomes Go, the memo keeps restrictions on workspace allowlist, approved user roles, redacted evidence, no production writes, no token exchange, and existing Instagram OAuth fallback.
- Supabase migration / `db push` is explicitly out of scope; future Supabase migration work must first show project_id, linked project, and Supabase account email, then wait for confirmation.
- Existing production OAuth routes, callback routes, login buttons, env, Prisma schema, token storage, and production write paths were not changed.

## 2026-06-16 - Meta Business Login internal beta evidence execution report template security note

Scope: documentation-only internal beta evidence execution report template.

- Added `docs/meta-business-login-internal-beta-evidence-execution-report-template.md`.
- The report template records package assembly, redaction report, reviewer recording, screenshots, permission proof, test asset proof, internal-only access controls, rollback / fallback, production write guard, token exchange guard, and final internal beta go / hold decisions.
- The template forbids copying raw token, authorization code, secret, raw state, raw nonce, full callback URL, credential, OTP, cookie, browser storage, or real customer data into the report.
- Supabase migration / `db push` is explicitly out of scope; future Supabase migration work must first show project_id, linked project, and Supabase account email, then wait for confirmation.
- Existing production OAuth routes, callback routes, login buttons, env, Prisma schema, token storage, and production write paths were not changed.

## 2026-06-16 - Meta Business Login internal beta evidence collection security note

Scope: documentation-only internal beta evidence collection runbook.

- Added `docs/meta-business-login-internal-beta-evidence-collection-runbook.md`.
- The runbook defines safe evidence collection for package assembly, redaction report execution, reviewer recording, screenshots, permission proof, test asset proof, internal-only access controls, rollback / fallback, production write guard, and token exchange guard.
- The runbook requires redacted markers only and blocks raw authorization code, raw state, raw nonce, full callback URL, token, secret, browser storage, unmasked asset IDs, and real customer data from evidence artifacts.
- Supabase migration / `db push` is explicitly out of scope; future Supabase migration work must first show project_id, linked project, and Supabase account email, then wait for confirmation.
- Existing production OAuth routes, callback routes, login buttons, env, Prisma schema, token storage, and production write paths were not changed.

## 2026-06-16 - Meta Business Login internal beta final preflight security note

Scope: documentation-only internal beta final preflight checklist.

- Added `docs/meta-business-login-internal-beta-final-preflight-checklist.md`.
- The checklist keeps internal beta on Hold until package assembly, redaction report, reviewer recording, screenshots, permission proof, test asset proof, access controls, rollback / fallback, production write guard, token exchange guard, and sign-off are Pass.
- The checklist requires redacted evidence only and blocks raw authorization code, raw state, raw nonce, full callback URL, token, secret, browser storage, unmasked asset IDs, and real customer data from beta evidence.
- Supabase migration / `db push` is explicitly out of scope; future Supabase migration work must first show project_id, linked project, and Supabase account email, then wait for confirmation.
- Existing production OAuth routes, callback routes, login buttons, env, Prisma schema, token storage, and production write paths were not changed.

## 2026-06-16 - Meta Business Login final App Review package assembly security note

Scope: documentation-only final App Review package assembly checklist.

- Added `docs/meta-business-login-final-app-review-package-assembly-checklist.md`.
- The checklist blocks raw reviewer recordings, unredacted screenshots, HAR/network exports, unsearched logs, env files, dashboard secrets, browser storage exports, database dumps, raw Meta responses, and real customer data from App Review packaging.
- The package gate requires redaction search and visual review for token, authorization code, secret, raw state, raw nonce, full callback URL, unmasked asset ID, and real customer data exposure.
- Supabase migration / `db push` is explicitly out of scope; future Supabase migration work must first show project_id, linked project, and Supabase account email, then wait for confirmation.
- Existing production OAuth routes, callback routes, login buttons, env, Prisma schema, token storage, and production write paths were not changed.

## 2026-06-16 - Meta Business Login final redaction search execution report template security note

Scope: documentation-only final redaction search execution report template.

- Added `docs/meta-business-login-final-redaction-search-execution-report-template.md`.
- The template defines final searches across App Review documents, recordings, screenshots, test output, logs, audit records, browser console evidence, network exports, and the final upload package.
- Required searches cover token, authorization code, secret, raw state, raw nonce, full callback URL, unmasked Meta asset ID, and real customer data exposure.
- The template explicitly forbids copying raw sensitive values into the report and keeps internal beta at Hold until all findings are cleaned, excluded, or accepted as allowed false positives.
- Existing production OAuth routes, callback routes, login buttons, env, Prisma schema, token storage, and production write paths were not changed.

## 2026-06-16 - Meta Business Login final reviewer recording security note

Scope: documentation-only reviewer recording shot list.

- Added `docs/meta-business-login-final-reviewer-recording-shot-list.md`.
- The shot list defines exactly which screens may be recorded for permission proof and which sensitive values must be masked or excluded.
- The recording plan requires redacted callback evidence only, dry-run workspace linking / channel sync evidence only, and no raw authorization code, raw state, raw nonce, full callback URL, token, secret, browser storage, or unmasked Meta asset IDs.
- Existing production OAuth routes, callback routes, login buttons, env, Prisma schema, token storage, and production write paths were not changed.

## 2026-06-16 - Meta Business Login final permission proof matrix security note

Scope: documentation-only permission proof matrix.

- Added `docs/meta-business-login-final-permission-usage-proof-matrix.md`.
- The matrix separates current Instagram Business Login scopes, Facebook Login for Business / Page-linked candidate scopes, and Dashboard-generated candidate scopes.
- The matrix recommends keeping only the minimum proven Instagram Business Login candidate scopes before App Review and deferring / removing content publishing and insights until product proof exists.
- The matrix keeps token, authorization code, raw state, raw nonce, full callback URL, app secret, client secret, and webhook verify token out of docs, logs, audit records, screenshots, recordings, and browser-visible payloads.
- Existing production OAuth routes, callback routes, login buttons, env, Prisma schema, token storage, and production write paths were not changed.

## 2026-06-16 - Meta Business Login sandbox SBL-12 callback capture security note

Scope: sandbox-only callback capture helper and test.

- Added `src/lib/meta-business-sandbox-callback-capture.ts` and `tests/meta-business-login-sandbox-sbl12-callback-capture.test.ts`.
- The helper captures callback evidence with redacted code / state and hash-only references, requires explicit sandbox capture header, validates workspace allowlist and workspace match, and keeps token exchange / production writes disabled.
- Added `docs/meta-business-login-sandbox-controlled-callback-capture-plan.md` with production callback risk map and safe integration options.
- Existing production OAuth routes, callback routes, login buttons, env, Prisma schema, token storage, and production write paths were not changed.

## 2026-06-16 - Meta Business Login sandbox controlled callback prompt security note

Scope: next-step prompt for callback evidence safety.

- Added `docs/meta-business-login-sandbox-next-controlled-callback-prompt.md`.
- The prompt explicitly blocks blind OAuth retry before sandbox-only callback capture, redaction, state / workspace validation, and production write guards exist.
- It requires no raw token, authorization code, secret, raw state, raw nonce, full callback URL, cookie, localStorage, or sessionStorage in logs, docs, audit, response, or snapshots.
- Existing production OAuth routes, callback routes, login buttons, env, Prisma schema, token storage, and production write paths were not changed.

## 2026-06-16 - Meta Business Login sandbox OAuth profile selection security note

Scope: Instagram Business Login profile selection continuation.

- Added `docs/meta-business-login-sandbox-oauth-profile-selection-run-2026-06-16.md`.
- Selected `carry.digital.nomad` from the Instagram profile selection screen, then stopped after Instagram loaded the selected profile home page.
- No final OAuth consent, authorization code callback, token exchange, ConnectedAccount write, Channel write, webhook registration, or channel sync was intentionally triggered.
- No app secret, token, authorization code, raw state, raw nonce, full callback URL, password, OTP, cookie, local storage, or session storage was read or recorded.
- Existing production OAuth routes, callback routes, login buttons, env, Prisma schema, token storage, and production write paths were not changed.

## 2026-06-15 - Meta Business Login sandbox authenticated browser evidence security note

Scope: authenticated browser evidence collection.

- Added `docs/meta-business-login-sandbox-authenticated-browser-evidence-run-2026-06-15.md`.
- Captured Meta Dashboard and OAuth evidence without revealing app secret, token, authorization code, raw state, raw nonce, full callback URL, password, OTP, cookies, local storage, or session storage.
- Stopped before selecting an Instagram profile and before final OAuth authorization, so no production callback, ConnectedAccount write, Channel write, webhook registration, or channel sync occurred.
- Existing production OAuth routes, callback routes, login buttons, env, Prisma schema, token storage, and production write paths were not changed.

## 2026-06-15 - Meta Business Login sandbox browser evidence security note

Scope: browser-based external evidence attempt.

- Added `docs/meta-business-login-sandbox-browser-evidence-run-2026-06-15.md`.
- The in-app Browser reached Facebook login for Meta Developers but no credentials, OTP, token, authorization code, app secret, raw state, raw nonce, full callback URL, or browser storage was read or entered.
- Local internal sandbox routes returned 401 without an authenticated admin session, which confirms the internal route guard remains active.
- Existing production OAuth routes, callback routes, login buttons, env, Prisma schema, token storage, and production ConnectedAccount / Channel write paths were not changed.

## 2026-06-15 - Meta Business Login sandbox external evidence handoff security note

Scope: Chrome-based external evidence collection attempt.

- Chrome reached the Meta Developers Apps page, but automation was blocked by another Chrome extension UI before DOM inspection.
- No token, authorization code, secret, raw state, raw nonce, callback URL, app secret, or app dashboard secret was captured or written.
- Added `docs/meta-business-login-sandbox-external-evidence-handoff.md` to record the blocker and safe handoff steps.
- Existing production OAuth routes, callback routes, login buttons, env, Prisma schema, token storage, and production write paths were not changed.

## 2026-06-15 - Meta Business Login sandbox SBL-11 evidence packet security note

Scope: local dry-run evidence packet helper and tests.

- Added `src/lib/meta-business-sandbox-evidence.ts` to combine redacted internal authorize and callback dry-run payloads into a hash-only evidence packet.
- Added `tests/meta-business-login-sandbox-sbl11-evidence-packet.test.ts` to verify raw authorization code / state are not present, production write guard evidence is required, and production implementation remains No-Go.
- The helper does not call Meta, exchange real codes, store tokens, write audit records, register webhooks, sync channels, or create production ConnectedAccount / Channel records.
- Existing production OAuth routes, callback routes, login buttons, env, Prisma schema, token storage, and production write paths were not changed.

## 2026-06-15 - Meta Business Login sandbox production isolation security note

Scope: automated production isolation regression test.

- Added `tests/meta-business-login-sandbox-production-isolation.test.ts` to verify sandbox provider ids, sandbox helpers, and `/api/internal/oauth` are not referenced by existing production OAuth routes or UI entry points.
- The test verifies `prisma/schema.prisma` has no sandbox-specific Meta Business Login model or field additions.
- Existing production OAuth routes, callback routes, login buttons, env, Prisma schema, token storage, and production ConnectedAccount / Channel write paths were not changed.

## 2026-06-15 - Meta Business Login sandbox route integration security note

Scope: internal sandbox route helper-chain integration.

- Internal sandbox routes now include state / nonce redacted evidence, code exchange dry-run classification, dry-run callback evidence, workspace query spoofing rejection, and production write guard metadata.
- Route-level tests cover redacted authorize response, redacted callback response, sandbox header enforcement, unsupported provider blocking, and workspace spoofing rejection.
- Existing production OAuth routes, callback routes, login buttons, env, Prisma schema, token storage, and production write paths were not changed.

## 2026-06-15 - Meta Business Login sandbox SBL-06 to SBL-08 security note

Scope: SBL-06 dry-run payload, SBL-07 workspace allowlist, and SBL-08 production write guard.

- Added sandbox-only dry-run payload builder with redacted audit evidence and production write flags fixed to false.
- Added workspace allowlist guard that rejects missing workspace, non-allowlisted workspace, and query workspace spoofing.
- Added production write guard that blocks ConnectedAccount, Channel, webhook, sync, and token refresh operations.
- Existing production OAuth, callback routes, login buttons, env, Prisma schema, and production write paths were not changed.

## 2026-06-15 - Meta Business Login sandbox SBL-05 redaction security note

Scope: SBL-05 sandbox-only redacted logging helper.

- Added sandbox-only helper for redacting tokens, authorization codes, secrets, raw state, raw nonce, callback URLs, authorize URLs, and Meta asset ids.
- Added unsafe payload detection for raw sensitive fields and OAuth URLs.
- Production audit behavior, production logging format, existing OAuth routes, existing callback routes, env, Prisma schema, token storage, and production writes were not changed.

## 2026-06-15 - Meta Business Login sandbox SBL-04 code exchange security note

Scope: SBL-04 sandbox-only code exchange helper.

- Added sandbox-only code exchange helper that skips exchange by default and redacts code / token output.
- Targeted tests cover missing code, missing redirect URI, missing exchange client, redacted injected success output, and redacted injected failure output.
- Real Meta token exchange, env reads, token storage, existing OAuth flow, existing callback routes, Prisma schema, and production writes remain blocked.

## 2026-06-15 - Meta Business Login sandbox SBL-03 state nonce security note

Scope: SBL-03 sandbox-only state / nonce helpers.

- Added sandbox-only state / nonce helpers that store hash-only state and nonce references and provide redacted audit output.
- Targeted tests cover TTL expiration, single-use replay rejection, provider mismatch, workspace / user binding mismatch, state mismatch, and nonce mismatch.
- Existing production OAuth state helpers, callback routes, cookie format, env, Prisma schema, token handling, and production write paths were not changed.

## 2026-06-15 - Meta Business Login sandbox SBL-01 route skeleton security note

Scope: SBL-01 internal-only dry-run route skeleton.

- Added sandbox-only route skeletons under `/api/internal/oauth/[provider]/authorize` and `/api/internal/oauth/[provider]/callback`.
- Routes are blocked in production, require an authenticated admin user, require `x-inboxpilot-sandbox: sbl-01`, require sandbox provider ids, and require a hardcoded sandbox workspace allowlist.
- Authorize and callback responses are dry-run JSON only; they do not redirect to Meta, exchange authorization codes, store tokens, register webhooks, start sync, or create / update production ConnectedAccount or Channel records.
- Existing production OAuth routes, callback routes, login buttons, env, Prisma schema, and production write paths were not changed.

## 2026-06-15 - Meta Business Login sandbox SBL-09 test scaffold security note

Scope: SBL-09 targeted test scaffold only.

- Added test-only redaction assertions in `tests/helpers/sbl09-redaction.ts`; no production redaction helper or product runtime path was changed.
- Targeted tests validate safe fixture redaction, unsafe fixture detection, dry-run callback payload shape, raw callback / authorize URL rejection, and production write guard expectations.
- Production OAuth, callback routes, login buttons, env, Prisma schema, ConnectedAccount / Channel writes, webhook registration, channel sync, token refresh, and real Meta token exchange remain blocked.
- Targeted command passed: `npx vitest run tests/meta-business-login-sandbox-sbl09.test.ts`.

## 2026-06-15 - Meta Business Login sandbox SBL-09 coding readiness security note

Scope: documentation-only SBL-09 coding readiness checklist.

- The checklist allows only SBL-09 sandbox test scaffold coding and keeps SBL-01 route coding blocked until scaffold execution, redaction assertions, dry-run snapshots, production write guard tests, and runbook / report / go-no-go backfills exist.
- SBL-09 coding scope is constrained to test scaffold files, safe / unsafe fixtures, redaction assertions, dry-run callback payload snapshots, and production write guard tests.
- Existing production OAuth, callback routes, login buttons, env, Prisma schema, production ConnectedAccount / Channel writes, webhook registration, channel sync, token refresh, and real Meta token exchange remain blocked.
- No product code, OAuth route, callback route, login button, Prisma schema, or env change was made for this checklist.

## 2026-06-15 - Meta Business Login sandbox SBL-09 fixture redaction security note

Scope: documentation-only fixture and redaction assertion specification.

- The spec defines safe and unsafe fixture boundaries so negative redaction tests can exist without storing real Meta tokens, authorization codes, secrets, raw state, raw nonce, callback URLs, or reusable authorize URLs.
- Redaction assertions must inspect fixtures, snapshots, test output, logs, audit payloads, dry-run callback payloads, runbook entries, and report entries.
- Production write guard fixtures must prove sandbox dry-run paths cannot create or update production ConnectedAccount / Channel records, register production webhooks, start production sync, or schedule token refresh.
- No product code, OAuth route, callback route, login button, Prisma schema, or env change was made for this spec.

## 2026-06-15 - Meta Business Login sandbox SBL-09 test suite security note

Scope: documentation-only SBL-09 minimum test suite specification.

- The spec requires SBL-09 tests before SBL-01 route work, with coverage for auth, workspace allowlist, sandbox provider isolation, state / nonce, code exchange, redaction, dry-run payloads, and production write guards.
- Redaction requirements explicitly fail raw token, authorization code, secret, raw state, raw nonce, full callback URL, reusable authorize URL, and unmasked Meta asset ids.
- Production ConnectedAccount / Channel writes, production webhook registration, production token refresh, production OAuth changes, production callback changes, login button changes, and env changes remain blocked.
- No product code, OAuth route, callback route, login button, Prisma schema, or env change was made for this spec.

## 2026-06-15 - Meta Business Login sandbox coding kickoff security note

Scope: documentation-only kickoff checklist.

- The checklist requires SBL-09 test suite scaffold planning before SBL-01 route skeleton work, so redaction and dry-run test standards exist first.
- Internal-only, dry-run-first, and no-production-write checks remain mandatory; production ConnectedAccount / Channel writes, production env changes, and production OAuth changes remain blocked.
- Redaction search standards cover server log, audit log, browser console, response body, network URL, test snapshot, screenshot / recording, runbook, and report.
- No product code, OAuth route, callback route, login button, Prisma schema, or env change was made for this checklist.

## 2026-06-15 - Meta Business Login sandbox final readiness security note

Scope: documentation-only final readiness review.

- The readiness review keeps sandbox coding at Hold until go/no-go is explicitly marked and all coding constraints are accepted.
- Internal beta and production implementation remain No-Go because App Review, account selection UX, callback security, workspace linking, channel sync, redaction, and rollback gates lack execution evidence.
- Recommended first task is test suite scaffold planning to establish auth, allowlist, state / nonce, code exchange, redaction, dry-run payload, and production Channel write guard checks before route coding.
- No product code, OAuth route, callback route, login button, Prisma schema, or env change was made for this review.

## 2026-06-15 - Meta Business Login sandbox coding task breakdown security note

Scope: documentation-only coding task breakdown.

- Future coding tasks are constrained to internal-only, dry-run-first, sandbox provider only, workspace allowlist only, and production Channel write guard requirements.
- Each task includes explicit tests for auth, allowlist, state / nonce, server-side code exchange, redacted logging, dry-run payloads, workspace spoofing, and production Channel write blocking.
- The breakdown requires runbook / report / go-no-go backfill after each sandbox task and keeps production implementation blocked.
- No product code, OAuth route, callback route, login button, Prisma schema, or env change was made for this breakdown.

## 2026-06-15 - Meta Business Login sandbox doc index security note

Scope: documentation-only index and decision path.

- The index confirms production implementation remains blocked until App Review, account selection UX, callback security, workspace linking, channel sync, redaction, and rollback gates pass with evidence.
- Current allowed state remains documentation / planning only; any future coding must be internal-only, dry-run-first, sandbox provider only, workspace allowlist only, and must not create production Channel records.
- The index keeps token / code / secret / raw state / raw nonce / full callback URL redaction as an explicit gate before sandbox coding, internal beta, or production implementation.
- No product code, OAuth route, callback route, login button, Prisma schema, or env change was made for this index.

## 2026-06-15 - Meta Business Login sandbox coding risk test plan security note

Scope: documentation-only sandbox coding risk and test plan.

- The plan treats internal route exposure, provider id confusion, client-side code exchange, raw callback URL logging, workspace spoofing, and production Channel writes as high or critical risks.
- Minimum tests now cover state TTL / single-use, nonce mismatch, server-side code exchange, redacted logging, dry-run payload schema, workspace allowlist checks at authorize / callback / dry-run sync, and production Channel write guards.
- Any sensitive data finding or production Channel write risk keeps the project at Hold / No-Go before sandbox coding.
- No product code, OAuth route, callback route, login button, Prisma schema, or env change was made for this plan.

## 2026-06-15 - Meta Business Login sandbox coding spec security note

Scope: documentation-only pre-coding technical spec draft.

- The draft requires internal-only sandbox routes to validate user session, workspace allowlist, provider id, opaque state, nonce, and server-side code exchange before any dry-run result is produced.
- Redacted logging helpers must block access tokens, refresh tokens, authorization codes, app secrets, client secrets, webhook verify tokens, raw state, raw nonce, full callback URLs, reusable authorize URLs, and sensitive Meta API raw errors.
- Dry-run callback payloads must default to `wouldCreateChannel=false`, avoid production token storage, and block production ConnectedAccount / Channel writes.
- No product code, OAuth route, callback route, login button, Prisma schema, or env change was made for this draft.

## 2026-06-15 - Meta Business Login sandbox go/no-go security note

Scope: documentation-only go/no-go checklist.

- The checklist makes callback security, workspace linking isolation, channel sync safety, redaction, and rollback explicit gates before sandbox coding, internal beta, or production implementation.
- Any exposure of access token, refresh token, authorization code, app secret, client secret, webhook verify token, raw state, raw nonce, full callback URL, or reusable authorize URL is a Hold / No-Go condition until cleaned and retested.
- Production implementation remains blocked until App Review, account selection UX, callback security, tenant isolation, channel sync, redaction, and rollback gates all pass.
- No product code, OAuth route, callback route, login button, Prisma schema, or env change was made for this checklist.

## 2026-06-15 - Meta Business Login sandbox report security note

Scope: documentation-only experiment report template.

- The report template requires redacted evidence only and blocks raw token, authorization code, secret, raw state, raw nonce, full callback URL, and reusable authorize URL from being recorded.
- The go / hold / no-go decision requires callback security, workspace linking isolation, channel sync safety, production isolation, rollback readiness, and redaction search results.
- Any finding of sensitive data in logs, audit, browser console, network URLs, screenshots, screen recordings, App Review docs, runbook, or report must result in Hold or No-Go until cleaned and retested.
- No product code, OAuth route, callback route, login button, Prisma schema, or env change was made for this template.

## 2026-06-15 - Meta Business Login sandbox runbook security note

Scope: documentation-only runbook template.

- The runbook requires testers to record only redacted authorize URLs, redacted callback payloads, redacted asset ids, and safe error classifications.
- The runbook explicitly forbids storing access tokens, refresh tokens, authorization codes, client secrets, app secrets, raw state, raw nonce, full callback URLs, or reusable authorize URLs.
- Go / no-go gates require callback security, workspace linking isolation, channel sync safety, and redaction search results before any next sandbox step.
- No product code, OAuth route, callback route, login button, Prisma schema, or env change was made for this template.

## 2026-06-15 - Meta Business Login sandbox plan security note

Scope: documentation-only sandbox implementation plan.

- The sandbox plan requires opaque state, nonce validation, short TTL, single-use callback state, server-side code exchange, encrypted token storage, and workspace allowlist checks before any ConnectedAccount / Channel writes.
- Logs and audit entries must redact access tokens, refresh tokens, authorization codes, app secrets, client secrets, webhook verify tokens, raw state, raw nonce, and full callback URLs.
- Workspace linking remains a release gate: authenticated user, state workspace, provider id, selected Business / Page / IG account, and channel sync target must all match before beta or production rollout.
- No product code, OAuth route, callback route, login button, Prisma schema, or env change was made for this plan.

## 2026-06-15 - Meta Business Login ADR security note

Scope: documentation-only ADR for Facebook Login for Business / Instagram Business Login evaluation.

- Any sandbox-only experiment must redact access tokens, refresh tokens, authorization codes, client secrets, app secrets, and reusable callback URLs from console output, server logs, audit logs, screenshots, and documentation.
- Callback handling must validate state, nonce, expiry, authenticated user session, workspace ownership, and selected Business / Page / IG account before creating or updating ConnectedAccount / Channel records.
- Code exchange must remain server-side only; tokens must not be returned to the browser or persisted outside encrypted storage.
- No product code, OAuth route, callback route, login button, or env change was made for this ADR.

## 2026-06-15：Account Selection 測試矩陣安全補充

- 新增 `docs/meta-business-login-account-selection-test-matrix.md`，要求每個測試案例記錄 callback error classification、workspace isolation、channel sync 與 token redaction 檢查。
- 測試紀錄不得保存 raw token、authorization code、state raw value、client secret、app secret 或 webhook verify token。
- Workspace linking 驗證需確認 `workspaceId` 不來自 callback query，且 channel 建立 / 更新限制在目前 workspace。

## 2026-06-15：Meta Business Login App Review 安全補充

- 新增 `docs/meta-business-login-app-review-demo-script.md`，明確列出 token / authorization code / secret redaction checklist。
- Callback 安全要求：驗證 user、state、provider、workspace、flow type、TTL；成功與失敗都需清除 state；audit 僅記錄安全摘要。
- Workspace linking 安全要求：workspaceId 不得來自 callback query，channel 建立 / 更新必須限制 workspace，IG account identity 應以 `instagramBusinessAccountId` 或 `instagramOauthUserId` 判斷。
- 本次只更新文件，未修改 OAuth、callback、token 儲存、env 或產品功能程式碼。

更新日期：2026-06-10

## 總結

- 高風險：`仍有`
- 中風險：`仍有`
- 低風險：`有`
- 是否有敏感資訊外洩風險：`目前未看到明顯前端外洩，但 production 仍需持續防守`
- 是否有多租戶資料外洩風險：`有中高風險，主因是 Meta env token fallback 尚未移除`

這一輪已完成的安全改善：

- billing completion 現在用 `PaymentOrder.interval` 驅動，不再因 hardcoded month 造成 plan / entitlement 錯配
- zero-amount / credit-only checkout 已走正式 internal completion flow
- billing completion success / failure 已補安全 audit，未記錄 PayUNI secret、hash key、token、完整敏感 payload

## 高風險

### 1. Meta env token fallback 仍可能跨 tenant 誤用

檔案位置：

- `src/lib/channels/meta.ts`
- `src/app/api/webhooks/meta/route.ts`
- `src/lib/instagram/comments-sync.ts`

問題：

- channel token 缺失時，仍可能 fallback 到全域 env token
- 在單租戶 demo 可容忍，在多租戶 SaaS 風險太高

影響：

- 錯發訊息
- 用錯 Page / IG Business Account
- tenant boundary 被弱化

必須立刻修：

- production 模式停用 env fallback
- 所有 Meta 操作都要求 channel-level token 與 account binding

### 2. 多租戶隔離仍以應用層為主，缺少更強的回歸保證

檔案位置：

- `src/lib/workspaces.ts`
- `src/app/api/**`
- `prisma/schema.prisma`

問題：

- 多數流程有 `workspaceId` 限制，但尚未形成完整的 tenant isolation regression suite
- 目前沒有足夠證據證明每個敏感 query 都被持續保護

必須立刻修：

- 補 tenant isolation tests
- 補 query helper / review checklist，避免 route 漏帶 `workspaceId`

## 中風險

### 1. Secret encryption 在 production 若未設 `TOKEN_ENCRYPTION_KEY` 會 fallback 到 `AUTH_SECRET`

檔案位置：

- `src/lib/secrets.ts`

建議：

- production 強制要求 `TOKEN_ENCRYPTION_KEY`

### 2. Audit log 仍是 best-effort

檔案位置：

- `src/lib/audit.ts`

問題：

- audit 失敗時不應阻斷主流程，這個策略合理
- 但目前缺少更完整的告警 / metrics 補位

建議：

- 對 auth / billing / webhook / admin failure audit 補 alert / dashboard

### 3. CSRF 主要靠 same-origin / origin 驗證

檔案位置：

- `src/lib/security.ts`
- `src/proxy.ts`

建議：

- 現況對內部表單 API 基本可接受
- 若後續增加第三方嵌入或更高風險後台操作，可再考慮 token-based CSRF

### 4. Billing completion 仍需持續觀察 idempotency 邊界

檔案位置：

- `src/lib/billing/payment-service.ts`
- `src/app/api/billing/payuni/checkout/route.ts`
- `src/lib/billing/payuni-callback.ts`

現況：

- paid callback 已有 idempotent short-circuit
- internal credit flow 以 `invoiceId + provider=internal_credit` 重用 payment order，再經 `order.status === "paid"` 避免重複啟用

建議：

- 後續再補更多整合測試，覆蓋 retry / return / notify 混合重入

## 低風險

### OAuth 安全審查

檔案位置：

- `src/app/api/oauth/[provider]/authorize/route.ts`
- `src/app/api/oauth/[provider]/callback/route.ts`
- `src/app/api/meta/oauth/start/route.ts`
- `src/app/api/meta/oauth/callback/route.ts`

結果：

- 有 `state`
- 有 callback failure audit
- 已避免在 audit 內記錄 token / secret / authorization code
- 但 Meta flow 仍是 generic + legacy 混合，維護風險較高

### Webhook 安全審查

檔案位置：

- `src/lib/webhook-security.ts`
- `src/app/api/webhooks/meta/route.ts`
- `src/app/api/webhooks/telegram/route.ts`
- `src/app/api/webhooks/whatsapp/route.ts`
- `src/app/api/automation-webhooks/[key]/route.ts`

結果：

- 已有 signature / shared secret 驗證
- 已有 rate limit
- 已有部分失敗 audit
- 仍建議補更完整 duplicate event / replay 測試

### Payment 安全審查

檔案位置：

- `src/lib/payuni.ts`
- `src/lib/billing/payuni-callback.ts`
- `src/app/api/billing/payuni/notify/route.ts`
- `src/app/api/billing/payuni/checkout/route.ts`

結果：

- `HashInfo` 驗證存在
- paid callback idempotency 存在
- 這一輪新增 internal credit completion flow 與安全 audit

### Admin 安全審查

檔案位置：

- `src/lib/admin-auth.ts`
- `src/lib/auth.ts`

結果：

- admin / operator 基礎角色存在
- 後續仍需更細的角色矩陣與審批流程

### Prisma / RLS 審查

檔案位置：

- `prisma/schema.prisma`
- `src/app/api/**`
- `src/lib/**`

結果：

- schema 結構完整，workspace / billing / audit / affiliate 主要表都有
- 目前主要依賴 Prisma server-side access，不是 Supabase RLS-first 架構
- 文件上不應誤導為「已完整依賴 RLS」

## 敏感資訊外洩風險

目前沒有看到明顯把以下資料打進前端 bundle 的證據：

- access token
- PayUNI hash key / iv
- app secret
- service role key

但仍需持續注意：

- console / audit / docs 不得落出完整付款敏感 payload
- `.env*` 與部署平台 env 權限需嚴格控管

## 必須立刻修的安全項

1. production 停用 Meta env token fallback
2. production 強制要求 `TOKEN_ENCRYPTION_KEY`
3. 補 tenant isolation regression tests
4. 補 billing / webhook / admin failure alerting
## 2026-06-16 - Controlled Consent Run Security Result

Evidence file:

```text
docs/meta-business-login-sandbox-controlled-consent-run-2026-06-16.md
```

Security result:

- Production callback guard deployment probe returned redacted JSON evidence.
- Probe response did not include raw fake code, raw sandbox state marker, token, secret, or full callback URL.
- Instagram account selection and consent screens were observed.
- The user clicked allow on the Instagram consent screen.
- The callback response body returned `sandbox_callback_capture` redacted JSON.
- The callback response body did not include raw authorization code, raw state, token, secret, or full callback URL.
- `exchangeAttempted=false`.
- All production write flags were false.
- Workspace linking and channel sync remain unexercised.

Status:

```text
Callback guard: Pass
Account selection: Pass
Consent screen: Pass
Real callback evidence: Pass
Internal beta: Hold
Production implementation: No-Go
```

## 2026-06-16 - SBL-13 Workspace Linking / Channel Sync Dry-Run Security Result

Evidence file:

```text
docs/meta-business-login-sandbox-sbl13-workspace-linking-sync-dry-run.md
```

Security result:

- Redacted callback evidence maps only to sandbox workspace linking and channel sync drafts.
- ConnectedAccount draft keeps `wouldCreate=false` and `tokenStored=false`.
- Channel draft keeps `wouldCreate=false` and `syncMode=dry_run`.
- Channel sync dry-run keeps `wouldStart=false` and `tokenRequiredButNotPresent=true`.
- Production write guard blocks ConnectedAccount / Channel / webhook / sync / refresh operations.
- Tested payload does not contain raw authorization code, raw state, raw nonce, token, secret, full callback URL, or unmasked asset IDs.

Status:

```text
Workspace linking dry-run: Pass
Channel sync dry-run: Pass
Production write guard: Pass
Redaction: Pass
Internal beta: Hold
Production implementation: No-Go
```

## 2026-06-16 - Meta Business Login Sandbox Callback Capture Guard

Scope:

- Added a read-only sandbox capture guard to `src/app/api/meta/oauth/callback/route.ts`.
- The guard is only entered when `state` is a valid sandbox callback capture marker.
- Normal production OAuth callbacks keep the existing cookie-backed state validation and callback behavior.

Security properties:

- No Meta token exchange is attempted in sandbox capture mode.
- No app secret, client secret, access token, authorization code, raw state, or full callback URL is returned.
- No ConnectedAccount / Channel / webhook / channel sync / token refresh write is performed.
- The sandbox state marker is only a routing marker for redacted evidence, not a production OAuth trust boundary.

Validation:

```text
npx vitest run tests/meta-business-login-sandbox-sbl12-callback-capture.test.ts tests/meta-business-login-sandbox-sbl12-callback-route.test.ts
Result: 2 test files passed, 9 tests passed
```

Remaining hold:

- Real callback evidence is still missing.
- Workspace linking and channel sync remain dry-run only.
- Internal beta and production implementation remain blocked until App Review, UX, callback security, redaction, rollback, and workspace linking gates pass.

## 2026-06-26 - Autopilot local secret and environment handling

Scope:

- Continued autopilot setup after the operator provided a Supabase access token through a secure local input page.
- Linked local CLIs without printing token, DB URL, PayUNI signing values, or Supabase keys.

Security properties:

- Supabase access token was used only for `supabase login` and then removed from the temporary local capture file.
- Supabase production project ref was verified read-only, but the local Supabase link was set to staging ref `ndhtwqtshselqwgjenjd`.
- Vercel Preview staging env metadata was pulled without printing values.
- PayUNI values copied into ignored `.env.local` are sandbox/test values only.
- Local tests use local Supabase Postgres, not production DB.
- `supabase/.temp/` is ignored to avoid committing local link state.
- `reports/autopilot-live.log` was removed after a prior safety scan flagged secret-like text in the transient live log.

Validation:

```text
npm run payuni:smoke
Result: passed against sandbox configuration.

npm test
Result: passed with local Supabase test DB.

npm run lint
Result: passed.

npm run build
Result: passed.

npm audit --audit-level=high
Result: passed; two moderate findings remain for separate dependency review.
```

Remaining hold:

- Do not use production DB credentials for unattended tests.
- Do not let autopilot submit Meta App Review or access reviewer credentials.
- Do not let autopilot enable PayUNI production or execute live card transactions.
