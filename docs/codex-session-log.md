# Codex Session Log

## 2026-06-26 - InboxPilot unattended autopilot package

Task goal:

- Code review the ReplyPilot autopilot reference.
- Build an InboxPilot-specific unattended AI programmer loop.
- Keep PayUNI sandbox, avoid Meta submission, avoid production DB/schema writes, and avoid secret leakage.

Files changed:

- `.gitignore`
- `AUTOPILOT.md`
- `run-autopilot.ps1`
- `run-autopilot.cmd`
- `scripts/autopilot-full.py`
- `scripts/autopilot_full_start.py`
- `package.json`
- `README.md`
- `docs/autopilot-code-review.md`
- `docs/project-launch-checklist.md`
- `docs/product-readiness-review.md`
- `docs/security-review.md`
- `docs/meta-app-review-checklist.md`
- `docs/billing-affiliate-readiness.md`
- `docs/fix-roadmap.md`
- `docs/codex-session-log.md`

Implementation notes:

- Created a Windows-friendly `npm run autopilot` entry point.
- Added a Python loop that runs Codex development, npm install, lint, test, build, PayUNI sandbox smoke, local route smoke, Vercel readiness, Supabase readiness, Codex QA, Codex safety, and final reporting.
- Reports are written to `reports/`, which is now gitignored.
- Missing credentials, logins, OTP, CAPTCHA, Meta dashboard actions, or PayUNI sandbox values are recorded in `reports/human-required.md`.
- Production DB/schema writes are blocked by prompt guard and forbidden-command report scan.
- PayUNI production switching and Meta App Review submission remain blocked.

Validation:

```text
py -m py_compile scripts/autopilot-full.py scripts/autopilot_full_start.py
Result: passed.

npm run lint
Result: passed.

npm run build
Result: passed.

npm test
Result: blocked because this clean worktree has no `DATABASE_URL` or `TEST_DATABASE_URL`. Production DB was not used.

npm run payuni:smoke
Result: blocked because sandbox `PAYUNI_MERCHANT_ID` is not configured in this clean worktree. PayUNI production was not used.
```

Launch impact:

- Preview/staging readiness can now be advanced by an unattended local runner.
- Public paid launch remains Hold until Meta, PayUNI production, tenant isolation, and final operator gates are completed.

New risks:

- The runner coordinates AI and shell commands, so it is not a hard sandbox.
- Operator should review `reports/final-report.md`, `reports/safety-report.md`, and `reports/human-required.md` after overnight runs.

Next suggested Codex Prompt:

```text
請幫我跑一次 AUTOPILOT_MAX_LOOPS=1 且不部署 Preview 的 dry-run，確認 reports/final-report.md / human-required.md / safety-report.md 的格式與內容。
```

## 2026-06-26 - Meta reviewer-safe test asset handoff checklist

Task goal:

- Create a reviewer-safe test asset handoff checklist for Meta App Review preparation.
- Do not log in to Meta Dashboard.
- Do not submit App Review.
- Do not print or store secrets.

Files changed:

- `docs/meta-reviewer-test-asset-handoff-checklist.md`
- `docs/meta-app-review-submission-package.md`
- `docs/meta-reviewer-recording-shot-list.md`
- `docs/meta-app-review-screenshot-redaction-checklist.md`
- `docs/meta-app-review-checklist.md`
- `docs/fix-roadmap.md`
- `docs/codex-session-log.md`

Implementation notes:

- Added reviewer-safe asset inventory, account requirements, Instagram/Facebook asset requirements, synthetic demo data rules, secure handoff methods, reviewer instruction note template, pre-handoff smoke, post-review cleanup, and Go / Hold criteria.
- Linked the handoff checklist from the submission package, reviewer recording shot list, screenshot checklist, Meta checklist, and roadmap.

Validation:

```text
git diff --check
Result: passed.
```

Launch impact:

- Meta App Review handoff preparation is more complete, but actual submission remains Hold until assets are prepared, smoked, redacted, and signed off.

New risks:

- No code, DB, schema, env, payment, OAuth runtime, deployment, Meta Dashboard, or App Review submission change was made.

Next suggested Codex Prompt:

```text
請幫我把 PR #5 merge，merge 後只確認 CI、Vercel Preview、production/staging alias 與 health；不要 production redeploy、不要送審、不要碰 DB。
```

## 2026-06-26 - Meta App Review screenshot and redaction checklist

Task goal:

- Create a Meta App Review screenshot checklist and redaction checklist.
- Do not log in to Meta Dashboard.
- Do not submit App Review.
- Do not print or store secrets.

Files changed:

- `docs/meta-app-review-screenshot-redaction-checklist.md`
- `docs/meta-app-review-submission-package.md`
- `docs/meta-reviewer-recording-shot-list.md`
- `docs/meta-app-review-checklist.md`
- `docs/fix-roadmap.md`
- `docs/codex-session-log.md`

Implementation notes:

- Added required screenshot list, per-screenshot redaction checklist, package-level redaction checklist, search commands, screenshot manifest template, and Go / Hold criteria.
- Linked the screenshot/redaction checklist from the submission package, reviewer recording shot list, Meta checklist, and roadmap.

Validation:

```text
git diff --check
Result: passed.
```

Launch impact:

- Meta App Review artifact preparation is more complete, but actual submission remains Hold until real screenshots, redaction review, permission matrix, reviewer assets, and sign-off are complete.

New risks:

- No code, DB, schema, env, payment, OAuth runtime, deployment, Meta Dashboard, or App Review submission change was made.

Next suggested Codex Prompt:

```text
請幫我根據 Meta submission package 製作 reviewer-safe test asset handoff checklist，不登入 Meta Dashboard、不送審、不輸出 secret。
```

## 2026-06-26 - Meta reviewer recording shot list

Task goal:

- Create a Meta reviewer recording shot list and step-by-step recording script based on `docs/meta-app-review-submission-package.md`.
- Do not log in to Meta Dashboard.
- Do not submit App Review.
- Do not print or store secrets.

Files changed:

- `docs/meta-reviewer-recording-shot-list.md`
- `docs/meta-app-review-submission-package.md`
- `docs/meta-app-review-checklist.md`
- `docs/fix-roadmap.md`
- `docs/codex-session-log.md`

Implementation notes:

- Added a 4-6 minute reviewer walkthrough plan covering login, workspace context, Instagram connection, Inbox, Contacts, Automations, Privacy, Data Deletion, Terms, and closing scene.
- Added shot-by-shot narration cues, evidence goals, redaction notes, pause/restart rules, post-recording checklist, file naming suggestions, and Go / Hold criteria.
- Linked the shot list from the Meta App Review submission package and Meta checklist.

Validation:

```text
git diff --check
Result: passed.
```

Launch impact:

- Meta App Review package preparation is more actionable, but actual submission remains Hold until real reviewer assets, recording, screenshots, redaction review, permission matrix, and sign-off are complete.

New risks:

- No code, DB, schema, env, payment, OAuth runtime, deployment, Meta Dashboard, or App Review submission change was made.

Next suggested Codex Prompt:

```text
請幫我根據 docs/meta-reviewer-recording-shot-list.md 製作 Meta App Review 截圖清單與 redaction checklist，不登入 Meta Dashboard、不送審、不輸出 secret。
```

## 2026-06-26 - Meta App Review and PayUNI go-live package preparation

Task goal:

- Prepare Meta App Review submission package and PayUNI production go-live checklist.
- Do not submit Meta App Review.
- Do not enable PayUNI production charging.
- Do not execute a live card transaction.
- Do not print or store secrets.

Files changed:

- `docs/meta-reviewer-recording-shot-list.md`
- `docs/meta-app-review-submission-package.md`
- `docs/payuni-production-go-live-checklist.md`
- `docs/meta-app-review-checklist.md`
- `docs/billing-affiliate-readiness.md`
- `docs/product-readiness-review.md`
- `docs/project-launch-checklist.md`
- `docs/fix-roadmap.md`
- `docs/codex-session-log.md`

Implementation notes:

- Meta package now defines production URLs, permission evidence, reviewer recording scenes, screenshots, test assets, dashboard checks, redaction gate, draft submission text, and Go / Hold criteria.
- Meta reviewer recording shot list now defines a 4-6 minute reviewer walkthrough, scene-by-scene narration, redaction rules, and post-recording review checklist.
- PayUNI checklist now defines production env names, dashboard checks, pre-go-live validation, controlled enablement, callback verification, rollback, and Go / Hold criteria.
- External references checked: Meta App Review, Meta data deletion callback, Instagram app setup, PAYUNi SDK usage, and PAYUNi public site.

Validation:

```text
git diff --check
Result: passed.
```

Launch impact:

- Public paid launch preparation is clearer, but actual public paid launch remains Hold.
- Remaining gates require real reviewer/test assets, Meta submission/approval, PAYUNi merchant approval/live smoke, and authenticated tenant-safe smoke.

New risks:

- No code, DB, schema, env, payment, OAuth runtime, or deployment change was made.
- Operational risk remains if an operator skips the redaction gate or enables PayUNI production without the controlled smoke.

Next suggested Codex Prompt:

```text
請幫我根據 docs/meta-app-review-submission-package.md 製作 Meta reviewer recording shot list 與逐步錄影腳本，不登入 Meta Dashboard、不送審、不輸出 secret。
```

## 2026-06-26 - PR #2 post-deploy launch readiness delta

Task goal:

- Confirm PR #2 deployment state after merge.
- Confirm production Meta fallback hardening is live on the production target.
- Summarize remaining Meta App Review, PayUNI production, and tenant isolation gates.
- Do not touch DB, run Prisma commands, run SQL, change schema, or print secrets.

Files changed:

- `tests/tenant-isolation-routes.test.ts`
- `tests/meta-webhook.test.ts`
- `docs/project-launch-checklist.md`
- `docs/product-readiness-review.md`
- `docs/security-review.md`
- `docs/meta-app-review-checklist.md`
- `docs/billing-affiliate-readiness.md`
- `docs/fix-roadmap.md`
- `docs/codex-session-log.md`

Verification:

```text
npx vitest run tests/tenant-isolation-routes.test.ts tests/meta-channel-config.test.ts tests/meta-webhook.test.ts tests/billing-checkout-route.test.ts
Result: passed. 4 test files, 18 tests.

npx vitest run tests/tenant-isolation-routes.test.ts tests/meta-channel-config.test.ts tests/meta-webhook.test.ts tests/billing-checkout-route.test.ts tests/release-mode.test.ts tests/release-proxy.test.ts tests/security.test.ts tests/webhook-security.test.ts tests/rate-limit.test.ts tests/compliance.test.ts tests/faq.test.ts tests/meta-business-login-sandbox-production-isolation.test.ts
Result: passed. 12 test files, 43 tests.

npm run lint
Result: passed.

npm run build
Result: passed.

npx vercel inspect https://inboxpilot.carry-digital-nomad.in.net --scope a25814740s-projects
Result: production deployment dpl_2Ramd6D54Xn1qc7vxxsgXGXacUni is Ready.

npx vercel inspect https://staging.carry-digital-nomad.in.net --scope a25814740s-projects
Result: staging alias remains on a Preview deployment.

curl https://inboxpilot.carry-digital-nomad.in.net/api/health
Result: status=ok, database ok, redis ok.

curl https://staging.carry-digital-nomad.in.net/api/health/staging
Result: status=ok, deployment=staging, dbEnv=staging, releaseChannel=full, vercelEnv=preview.

curl https://inboxpilot.carry-digital-nomad.in.net/channels/connect/instagram
Result: HTTP 200.
```

Launch impact:

- PR #2 hardening is now deployed to production.
- PR #3 route-level tenant isolation regression coverage is merged, CI-passed, and deployed through controlled production deployment `dpl_GGk9zyF3r1F1hZ6ons3Fzfh6y5hL`.
- Production Meta global fallback is considered live-disabled because the deployed code checks the production runtime target before allowing fallback.
- First non-DB tenant isolation regression coverage now exists for channels, contacts, automations, and PayUNI checkout scope.
- Public paid launch remains Hold until authenticated/DB-backed tenant isolation tests, Meta App Review evidence, and PayUNI production smoke are complete.

New risks:

- No new DB/schema risk.
- Existing operational risk remains: any workspace that depended on global Meta fallback must reconnect with tenant-scoped channel credentials.
- `npm test` requires `TEST_DATABASE_URL` or `DATABASE_URL` and runs `prisma db push` against an isolated test schema; it was not run against production DB.

Next suggested Codex Prompt:

```text
請幫我做 authenticated tenant-safe smoke：用測試 workspace 驗證 Meta channel reconnect、Inbox/Contacts isolation、Automation scope、Billing guard，不碰 production schema、不輸出 secret。
```

## 2026-06-26 - Public paid launch gate cleanup

Task goal:

- Close the production Meta global env fallback gate.
- Add first tenant isolation regression coverage around Meta fallback behavior.
- Add PayUNI production SOP.
- Improve legal / billing copy for public paid launch readiness.
- Do not deploy, touch DB, run migrations, or print secrets.

Files changed:

- `src/lib/deployment-env.ts`
- `src/lib/channels/meta.ts`
- `src/lib/instagram/comments-sync.ts`
- `src/app/api/webhooks/meta/route.ts`
- `scripts/refresh-meta-token.mjs`
- `tests/meta-channel-config.test.ts`
- `tests/meta-webhook.test.ts`
- `src/app/billing/page.tsx`
- `src/app/terms-of-service/page.tsx`
- `src/app/privacy-policy/page.tsx`
- `src/app/data-deletion/page.tsx`
- `docs/payuni-production-sop.md`
- `README.md`
- launch/security/billing/Meta readiness docs

Implementation notes:

- Added a deployment env helper that reads `INBOXPILOT_DEPLOYMENT_ENV`, `INBOXPILOT_DB_ENV`, `VERCEL_ENV`, and `NODE_ENV`.
- Disabled global Meta env fallback in production deployment envs.
- Production no longer uses global `META_PAGE_ACCESS_TOKEN` or `META_INSTAGRAM_BUSINESS_ACCOUNT_ID` as a substitute for channel-level credentials.
- Meta webhook channel config no longer writes global fallback token markers in production.
- Instagram comment sync no longer falls back to global IG business account id in production.
- `scripts/refresh-meta-token.mjs` refuses production runtime markers.
- Billing page, Terms, Privacy, and Data Deletion copy now describe controlled payments, PayUNI handling, refunds, workspace isolation, and audit retention.

Validation:

```text
npx vitest run tests/meta-channel-config.test.ts tests/billing-checkout-route.test.ts
Result: passed.

npm run lint
Result: passed.

npm run build
Result: passed.

npm run payuni:smoke
Result: passed.
```

Launch impact:

- Main local code gate for production Meta global fallback is closed.
- Public paid launch still requires deployment of this change, broader tenant isolation regression tests, Meta App Review evidence, and PayUNI production merchant/smoke evidence.

New risks:

- Production Meta flows now require valid channel-level credentials; workspaces relying on global fallback must reconnect their channel before production use.
- No new DB/schema risk.

Next suggested Codex Prompt:

```text
請幫我部署 public paid launch gate cleanup 到 Production，部署後驗證 /api/health、tenant-safe smoke、simple-release smoke，並確認 staging alias 沒被改動；不要碰 DB。
```

## 2026-06-24 - Release mode commit preparation

Task goal:

- Prepare the local release mode implementation as a committable change.
- Confirm `master` is the simple release path and `staging` is the full release path.
- Add smoke tests before pushing to both branches.

Files changed:

- `src/lib/release-mode.ts`
- `src/proxy.ts`
- `src/components/AdminShell.tsx`
- `src/components/AdminMobileNav.tsx`
- `src/app/dashboard/page.tsx`
- `src/app/channels/page.tsx`
- `src/app/channels/connect/page.tsx`
- `src/app/channels/connect/social/page.tsx`
- `src/app/referrals/page.tsx`
- `tests/release-mode.test.ts`
- `tests/release-proxy.test.ts`
- `docs/master-staging-prelaunch-checklist.md`
- `docs/project-launch-checklist.md`
- `docs/product-readiness-review.md`
- `docs/security-review.md`
- `docs/fix-roadmap.md`
- `docs/codex-session-log.md`

Implementation notes:

- Added a centralized release channel helper with host defaults and `INBOXPILOT_RELEASE_CHANNEL` override support.
- Simple release hides full-only navigation, non-Instagram channel connection options, and payout-oriented referral copy.
- Simple release proxy redirects full-only app pages and blocks non-Instagram OAuth entry points.
- Added smoke tests covering host/env release detection, full-only route classification, simple production redirects, staging full behavior, and Instagram-only OAuth allowance.

Validation:

```text
npx vitest run tests/release-mode.test.ts tests/release-proxy.test.ts
Result: passed. 2 test files passed, 9 tests passed.

npm run lint
Result: passed.

npm run build
Result: passed. Prisma generated-client fallback reused the existing client because the Windows query engine DLL was locked by a local Node process.

npm test
Result: passed.

npm run test:e2e
Result: passed. 10 tests passed.
```

## 2026-06-26 - Alias workflow draft PR

Task goal:

- Create a draft PR for alias workflow changes without pushing directly to `master`.
- Confirm the PR branch does not produce a Production deployment.
- Allow only Preview deployment behavior for the PR branch.

Files changed:

- `.github/workflows/update-staging-alias.yml`
- `.github/workflows/update-production-alias.yml`
- `docs/deployment.md`
- `docs/fix-roadmap.md`
- `docs/codex-session-log.md`

Implementation notes:

- Created the PR branch from `origin/master` in a separate worktree to avoid including local dirty worktree changes or unpushed `master` commits.
- Hardened the staging alias workflow to skip Production deployments.
- Added a Production alias workflow that only accepts Ready Production deployments.
- Documented the Vercel custom-domain workflow model and manual fallback commands.

Validation:

```text
Draft PR: https://github.com/Forty-s-AI-Company/ig-auto-reply-manychat/pull/1
PR branch: codex/alias-workflow-domain-guards
Vercel status: passed.
Vercel deployment: target=preview, status=Ready, id=dpl_H1A1vjzubmg6jHPCuTsQpdwL6jqA.
Staging alias workflow: passed and skipped because the deployment was not the staging branch Preview alias.
Production alias workflow: passed and skipped because the deployment target was preview, not production.
CI lint-test: passed for push and pull_request events.
```

Launch impact:

- No runtime launch-state change until the PR is merged.

New risks:

- If merged without verifying Vercel behavior, workflow-file changes on the default branch could affect future alias automation.

Next suggested Codex Prompt:

```text
請幫我在這個 draft PR merge 前，再跑一次 production/staging alias workflow manual verification，確認 custom domain 仍互斥且健康。
```

Launch impact:

- Moves the simple/full release split from local implementation toward branch-ready deployment.
- Does not change database topology.

New risks:

- No new secret exposure.
- Proxy hiding is not a substitute for route-level authorization and tenant isolation.
- Shared DB remains accepted only while the product has no real customer traffic.

Next suggested Codex Prompt:

```text
請幫我在 Vercel 部署完成後，檢查 master production domain 與 staging alias 的 release mode 實際行為：
1. production full-only route 應導回 dashboard
2. staging full-only route 應可進入登入/頁面流程
3. production 非 IG OAuth entry 應回 404
4. staging alias 是否指向最新 staging Preview deployment
```

## 2026-06-24 - Master / Staging Pre-Launch Checklist

Task goal:

- Summarize current `master` / `staging` release mode, Vercel environment variables, DB sharing risk, and pre-launch checklist.

Files changed:

- `docs/master-staging-prelaunch-checklist.md`
- `docs/fix-roadmap.md`
- `docs/codex-session-log.md`

Findings:

- Vercel Production lists `INBOXPILOT_RELEASE_CHANNEL` plus runtime secrets and service env vars.
- Vercel Preview currently lists only `INBOXPILOT_RELEASE_CHANNEL`.
- Committed `master` and `staging` branches do not include `src/lib/release-mode.ts`.
- Local workspace contains uncommitted release-mode implementation files.
- Staging alias automation has been verified, but staging runtime env completeness still needs a decision.

Launch impact:

- Documentation only.
- Release-mode app implementation must be committed before treating Production as guaranteed simple and Staging as guaranteed full.
- DB sharing remains temporarily accepted only before real customer onboarding.

Validation:

```text
npx vercel env ls production --scope a25814740s-projects
Result: listed Production env names only; values stayed encrypted.

npx vercel env ls preview --scope a25814740s-projects
Result: listed Preview env names only; values stayed encrypted.

git show HEAD:src/lib/release-mode.ts
Result: file is not present in committed HEAD.

git show origin/staging:src/lib/release-mode.ts
Result: file is not present in origin/staging.
```

Next suggested Codex Prompt:

```text
請幫我把目前本機 release mode 實作整理成可提交版本，確認 master 是 simple release、staging 是 full release，補 smoke tests，然後推送到 master 和 staging。
```

## 2026-06-24 - Staging Alias Branch Guard

Task goal:

- Restrict automatic staging alias updates to successful `staging` branch Preview deployments only.
- Keep manual workflow dispatch available for explicit operator-driven alias updates.
- Do not split DB yet.

Files changed:

- `.github/workflows/update-staging-alias.yml`
- `docs/deployment.md`
- `docs/project-launch-checklist.md`
- `docs/product-readiness-review.md`
- `docs/security-review.md`
- `docs/fix-roadmap.md`
- `docs/codex-session-log.md`

Implementation notes:

- Added `github.event.deployment.ref == 'staging'` to the automatic deployment-status job condition.
- Added shell-level validation for `DEPLOYMENT_REF`, allowing only `staging` or `manual`.
- Kept the `*.vercel.app` deployment URL guard and Production deployment exclusion.
- No app runtime behavior, OAuth flow, webhook, billing, affiliate, Prisma schema, or DB behavior was changed.

Launch impact:

- Feature / codex / master Preview deployments no longer update `staging.carry-digital-nomad.in.net` automatically.
- Staging alias now tracks the `staging` branch by default, with manual override still available.

## 2026-06-24 - Staging Alias Workflow Remote Verification

Task goal:

- Create and configure the Vercel token required by GitHub Actions.
- Trigger a Vercel Preview deployment and verify that `Update Staging Alias` points `staging.carry-digital-nomad.in.net` at the latest Preview deployment.

Remote changes:

- Added GitHub Secret `VERCEL_TOKEN`.
- Added GitHub Secret `VERCEL_SCOPE=a25814740s-projects`.
- Pushed `.github/workflows/update-staging-alias.yml` to `master` in commit `718461c`.
- Temporarily pushed `codex/staging-alias-check` to trigger a Vercel Preview deployment, then deleted the branch after verification.

Validation:

```text
gh workflow list:
Result: Update Staging Alias is active.

GitHub Actions Update Staging Alias:
Result: passed.

npx vercel inspect https://staging.carry-digital-nomad.in.net:
Result: resolved to Preview deployment https://inboxpilot-303lebjos-a25814740s-projects.vercel.app.

npx vercel alias list:
Result: staging.carry-digital-nomad.in.net points to inboxpilot-303lebjos-a25814740s-projects.vercel.app.
```

Security notes:

- The usable token was copied through Vercel's token dialog and stored only as a GitHub Secret.
- The first failed setup attempt showed that Windows clipboard was not reliable for this browser flow; the final stored token was verified through Vercel API before being saved.
- `VERCEL_SCOPE` is required for this project because alias updates need the `a25814740s-projects` scope.
- Two earlier project-scoped Vercel tokens were created during troubleshooting but were not used by GitHub Actions.

Launch impact:

- Staging alias automation is now verified end-to-end.
- Production / staging DB remains shared temporarily and still needs separation before real customer onboarding.

## 2026-06-24 - Staging Alias Auto-Update Workflow

Task goal:

- Add an automated flow that points `staging.carry-digital-nomad.in.net` at the latest successful Vercel Preview deployment.
- Keep production on the simple release and staging / preview on the full release.
- Do not split DB yet.

Files changed:

- `.github/workflows/update-staging-alias.yml`
- `docs/deployment.md`
- `docs/project-launch-checklist.md`
- `docs/product-readiness-review.md`
- `docs/security-review.md`
- `docs/fix-roadmap.md`
- `docs/codex-session-log.md`

Implementation notes:

- Added a GitHub Actions workflow triggered by successful non-production `deployment_status` events.
- Added a manual `workflow_dispatch` fallback for entering a Vercel Preview deployment URL.
- The workflow validates that the target host ends in `.vercel.app` before running `vercel alias set`.
- `VERCEL_TOKEN` must be stored in GitHub Secrets. `VERCEL_SCOPE` is optional for team-scoped projects.
- No DB schema, Prisma migration, app runtime behavior, OAuth flow, webhook, billing, or affiliate logic was changed.

Launch impact:

- Staging can become a stable always-current Preview URL after the GitHub Secret is configured and the first Preview deployment event runs.
- Production / staging DB remains shared temporarily and must be separated before real customer onboarding.

New risks:

- Any successful non-production Preview deployment can move the staging alias. If this should only follow the `staging` branch, add a branch/ref guard after inspecting the first deployment payload.

Next suggested Codex Prompt:

```text
請在 GitHub repo secrets 確認 `VERCEL_TOKEN` 已設定後，觸發一次 Vercel Preview deployment，幫我檢查 GitHub Actions 的 Update Staging Alias 是否成功把 staging.carry-digital-nomad.in.net 指到最新 Preview。
```

## 2026-06-19 - Production Simple Release / Preview Full Release Split

Task goal:

- Make the custom production domain run the simplified InboxPilot launch version.
- Keep Vercel Preview / localhost as the full planned version while the project is still pre-launch.
- Keep the current shared database unchanged for now.

Files changed:

- `src/lib/release-mode.ts`
- `src/proxy.ts`
- `src/components/AdminShell.tsx`
- `src/components/AdminMobileNav.tsx`
- `src/app/dashboard/page.tsx`
- `src/app/channels/page.tsx`
- `src/app/channels/connect/page.tsx`
- `src/app/channels/connect/social/page.tsx`
- `src/app/referrals/page.tsx`
- `docs/project-launch-checklist.md`
- `docs/product-readiness-review.md`
- `docs/security-review.md`
- `docs/meta-app-review-checklist.md`
- `docs/billing-affiliate-readiness.md`
- `docs/fix-roadmap.md`
- `docs/codex-session-log.md`

Implementation notes:

- Added release channel detection. `inboxpilot.carry-digital-nomad.in.net` defaults to `simple`; all other hosts default to `full`.
- Added `INBOXPILOT_RELEASE_CHANNEL=simple|full` as an override.
- Production simple navigation now shows only Home, Inbox, Contacts, Channels, Analytics, Automations, and Referrals.
- Production simple channel connection surfaces Instagram only.
- Production simple referral page presents referral activity only, not affiliate payout.
- Full-only app routes and non-Instagram OAuth entry points are blocked on the simple production host.
- Database schema, OAuth callback storage, webhook behavior, billing logic, and affiliate service logic were not changed.

Current URLs:

- Production simple site: `https://inboxpilot.carry-digital-nomad.in.net`
- Current preview / testing deployment from Vercel CLI: `https://inboxpilot-ap79iimgd-a25814740s-projects.vercel.app`

Validation:

```text
npm run lint
Result: passed

npm run build
Result: passed. Existing Windows Prisma engine DLL lock fallback appeared and reused the existing generated client.

npm test
Result: timed out after 244 seconds before a complete result was returned.

npx vitest run tests/unit tests/integration --reporter=dot
Result: failed in existing Broadcast API tests:
- tests/integration/api-routes.test.ts: broadcast.scheduledAt?.toISOString is not a function
- tests/integration/api-routes.test.ts: expected "廣播資料格式不正確。" but received "廣播資料格式錯誤，請重新確認。"

npm run test:e2e
Result: passed, 10 tests passed.

git diff --check
Result: passed with Windows line-ending warnings only
```

Launch impact:

- Production surface is reduced toward a simpler IG-first launch.
- Shared DB remains acceptable only while the product is pre-launch; before real customers, production and staging data should be separated.

New risks:

- Preview URLs can rotate on future Vercel deployments unless a stable staging alias/domain is configured.
- Shared DB means staging tests can still affect production-visible data until environments are separated.

Next suggested Codex Prompt:

```text
請幫我把 Vercel Preview 設定成固定 staging 網域，正式站維持 simple release，staging 維持 full release；先不要拆 DB，只新增環境變數與部署文件。
```

## 2026-06-16 - Meta Business Login Final App Review Package Assembly Checklist

Task:

- Create the final App Review package assembly checklist based on the final redaction search execution report template, reviewer recording shot list, and permission usage proof matrix.
- Only add / update documentation.
- Do not modify product code, OAuth flow, callback route, login button, env, Prisma schema, or Supabase migration state.

Files changed:

- `docs/meta-business-login-final-app-review-package-assembly-checklist.md`
- `docs/meta-business-login-final-app-review-demo-package-checklist.md`
- `docs/meta-business-login-sandbox-go-no-go-checklist.md`
- `docs/meta-app-review-checklist.md`
- `docs/security-review.md`
- `docs/fix-roadmap.md`
- `docs/codex-session-log.md`

Decision:

```text
Final App Review package assembly checklist: Draft complete
Actual App Review package assembled: Hold
Internal beta: Hold
Production implementation: No-Go
```

Validation:

```text
git status --short --branch
Result: master had docs-only working tree changes before commit.

git diff --check
Result: passed with Windows line-ending warnings only.

npx vitest run tests/meta-business-login-sandbox-sbl08.test.ts tests/meta-business-login-sandbox-sbl12-callback-capture.test.ts tests/meta-business-login-sandbox-sbl12-callback-route.test.ts tests/meta-business-login-sandbox-sbl13-workspace-linking-sync.test.ts
Result: 4 test files passed, 12 tests passed.

npm run lint
Result: passed.

npm run build
Result: passed. Existing Windows Prisma engine DLL lock fallback appeared and reused the existing generated client.

npm test
Result: not run locally because this task changed documentation only; targeted SBL tests plus lint/build passed.
```

Next suggested Codex Prompt:

```text
請根據 docs/meta-business-login-final-app-review-package-assembly-checklist.md、docs/meta-business-login-final-redaction-search-execution-report-template.md 與 docs/meta-business-login-final-reviewer-recording-shot-list.md，建立 Meta Business Login internal beta final preflight checklist。

請只新增 / 更新文件，不要改產品功能程式碼，不要改 OAuth flow，不要改 callback route，不要改登入按鈕，不要改 env，不要改 Prisma schema，不要執行 Supabase migration。

檔案路徑：
docs/meta-business-login-internal-beta-final-preflight-checklist.md

內容需包含：
1. App Review package assembly 是否完成
2. redaction report 是否 Pass
3. reviewer recording / screenshots / permission proof / test asset proof 是否 Pass
4. internal-only entry point / workspace allowlist / user admin role 是否 Pass
5. rollback / fallback 是否 Pass
6. 可以解除 internal beta Hold 的 go / hold 判定
7. production implementation 仍不可開始的原因

完成後執行 git status、targeted tests、npm run lint、npm run build，commit 並 push master。
```

## 2026-06-16 - Meta Business Login Final Redaction Search Execution Report Template

Task:

- Create the final redaction search execution report template based on the reviewer recording shot list, permission usage proof matrix, and final App Review demo package checklist.
- Only add / update documentation.
- Do not modify product code, OAuth flow, callback route, login button, env, or Prisma schema.

Files changed:

- `docs/meta-business-login-final-redaction-search-execution-report-template.md`
- `docs/meta-business-login-final-app-review-demo-package-checklist.md`
- `docs/meta-business-login-sandbox-go-no-go-checklist.md`
- `docs/meta-app-review-checklist.md`
- `docs/security-review.md`
- `docs/fix-roadmap.md`
- `docs/codex-session-log.md`

Decision:

```text
Final redaction search execution report template: Ready
Final redaction search executed: Hold
Internal beta: Hold
Production implementation: No-Go
```

Validation:

```text
git status --short --branch
Result: master had docs-only working tree changes before commit.

git diff --check
Result: passed with Windows line-ending warnings only.

npx vitest run tests/meta-business-login-sandbox-sbl08.test.ts tests/meta-business-login-sandbox-sbl12-callback-capture.test.ts tests/meta-business-login-sandbox-sbl12-callback-route.test.ts tests/meta-business-login-sandbox-sbl13-workspace-linking-sync.test.ts
Result: 4 test files passed, 12 tests passed.

npm run lint
Result: passed.

npm run build
Result: passed. Existing Windows Prisma engine DLL lock fallback appeared and reused the existing generated client.

npm test
Result: not run locally because this task changed documentation only; targeted SBL tests plus lint/build passed.
```

Next suggested Codex Prompt:

```text
請根據 docs/meta-business-login-final-redaction-search-execution-report-template.md、docs/meta-business-login-final-reviewer-recording-shot-list.md 與 docs/meta-business-login-final-permission-usage-proof-matrix.md，建立 Meta Business Login final App Review package assembly checklist。

請只新增 / 更新文件，不要改產品功能程式碼，不要改 OAuth flow，不要改 callback route，不要改登入按鈕，不要改 env，不要改 Prisma schema。

檔案路徑：
docs/meta-business-login-final-app-review-package-assembly-checklist.md

內容需包含：
1. final reviewer recording、screenshots、permission proof、redaction report、test asset proof 的打包清單
2. 每個檔案進 App Review package 前的 gate
3. 不可打包的檔案類型與敏感資料規則
4. Meta Dashboard scope reconciliation 檢查
5. internal beta 是否可解除 Hold 的條件
6. production implementation 仍不可開始的原因

完成後執行 git status、targeted tests、npm run lint、npm run build，commit 並 push master。
```

## 2026-06-16 - Meta Business Login Final Reviewer Recording Shot List

Task:

- Create the final reviewer recording shot list based on the permission usage proof matrix and final App Review demo package checklist.
- Only add / update documentation.
- Do not modify product code, OAuth flow, callback route, login button, env, or Prisma schema.

Files changed:

- `docs/meta-business-login-final-reviewer-recording-shot-list.md`
- `docs/meta-business-login-final-app-review-demo-package-checklist.md`
- `docs/meta-app-review-checklist.md`
- `docs/security-review.md`
- `docs/fix-roadmap.md`
- `docs/codex-session-log.md`

Decision:

```text
Final reviewer recording shot list: Draft complete
App Review readiness: Hold
Internal beta: Hold
Production implementation: No-Go
```

Validation:

```text
git status --short --branch
Result: master had docs-only working tree changes before commit.

git diff --check
Result: passed with Windows line-ending warnings only.

npx vitest run tests/meta-business-login-sandbox-sbl08.test.ts tests/meta-business-login-sandbox-sbl12-callback-capture.test.ts tests/meta-business-login-sandbox-sbl12-callback-route.test.ts tests/meta-business-login-sandbox-sbl13-workspace-linking-sync.test.ts
Result: 4 test files passed, 12 tests passed.

npm run lint
Result: passed.

npm run build
Result: passed. Existing Windows Prisma engine DLL lock fallback appeared and reused the existing generated client.

npm test
Result: not run locally because this task changed documentation only; targeted SBL tests plus lint/build passed.
```

Next suggested Codex Prompt:

```text
請根據 docs/meta-business-login-final-reviewer-recording-shot-list.md、docs/meta-business-login-final-permission-usage-proof-matrix.md 與 docs/meta-business-login-final-app-review-demo-package-checklist.md，建立 Meta Business Login final redaction search execution report template。

請只新增 / 更新文件，不要改產品功能程式碼，不要改 OAuth flow，不要改 callback route，不要改登入按鈕，不要改 env，不要改 Prisma schema。

檔案路徑：
docs/meta-business-login-final-redaction-search-execution-report-template.md

內容需包含：
1. App Review 文件、錄影、截圖、測試輸出、log、audit 的搜尋範圍
2. token / code / secret / raw state / raw nonce / full callback URL / unmasked asset ID 的搜尋指令
3. 允許的 false positive 規則
4. 每個 finding 的處理欄位
5. 清理後 retest 流程
6. internal beta 是否可解除 Hold 的判定
7. production implementation 仍不可開始的原因

完成後執行 git status、targeted tests、npm run lint、npm run build，commit 並 push master。
```

## 2026-06-16 - Meta Business Login Final Permission Usage Proof Matrix

任務目標：

- 根據 final App Review demo package checklist，建立 Meta Business Login final permission usage proof matrix。
- 只新增 / 更新文件，不修改產品功能程式碼、OAuth flow、callback route、登入按鈕、env 或 Prisma schema。

修改內容：

- 新增 `docs/meta-business-login-final-permission-usage-proof-matrix.md`。
- 回填 `docs/meta-business-login-final-app-review-demo-package-checklist.md`。
- 回填 `docs/meta-business-login-sandbox-go-no-go-checklist.md`。
- 回填 `docs/meta-app-review-checklist.md`。
- 回填 `docs/security-review.md`。
- 回填 `docs/fix-roadmap.md`。
- 回填 `docs/codex-session-log.md`。

目前結論：

```text
Permission usage proof matrix: Draft complete
Core Instagram Business Login scopes: candidate keep
instagram_business_content_publish: Defer / Remove
instagram_business_manage_insights: Defer / Remove
Facebook Login for Business scopes: Hold pending selected-flow reconciliation
App Review readiness: Hold
Internal beta: Hold
Production implementation: No-Go
```

驗證：

```text
git status --short --branch
Result: master had docs-only working tree changes before commit.

git diff --check
Result: passed with Windows line-ending warnings only.

npx vitest run tests/meta-business-login-sandbox-sbl08.test.ts tests/meta-business-login-sandbox-sbl12-callback-capture.test.ts tests/meta-business-login-sandbox-sbl12-callback-route.test.ts tests/meta-business-login-sandbox-sbl13-workspace-linking-sync.test.ts
Result: 4 test files passed, 12 tests passed.

npm run lint
Result: passed.

npm run build
Result: passed. Existing Windows Prisma engine DLL lock fallback appeared and reused the existing generated client.

npm test
Result: not run; this task changed documentation only and targeted SBL tests plus lint/build passed.
```

下一個建議 Codex Prompt：

```text
請根據 docs/meta-business-login-final-permission-usage-proof-matrix.md 與 docs/meta-business-login-final-app-review-demo-package-checklist.md，建立 Meta Business Login final reviewer recording shot list。

請只新增 / 更新文件，不要改產品功能程式碼，不要改 OAuth flow，不要改 callback route，不要改登入按鈕，不要改 env，不要改 Prisma schema。

檔案路徑：
docs/meta-business-login-final-reviewer-recording-shot-list.md

內容需包含：
1. 每個 permission 對應要錄到的畫面
2. 每段錄影的操作步驟
3. 必須遮蔽或不可出現的資訊
4. Business / Page / IG account selection 的畫面需求
5. Inbox / comment automation / channel detail 的畫面需求
6. redacted callback evidence 的呈現方式
7. workspace linking / channel sync dry-run evidence 的呈現方式
8. App Review 提交前的 final redaction search checklist
9. internal beta 是否可解除 Hold 的條件
10. production implementation 仍不可開始的原因

完成後執行 git status、targeted tests、npm run lint、npm run build，commit 並 push master。
```

## 2026-06-16 - Meta Business Login sandbox SBL-12 callback capture helper

Task:

- Inspect current production Instagram / Meta callback risk points.
- Add sandbox-only callback capture helper and tests.
- Do not modify production OAuth flow, callback routes, login buttons, env, Prisma schema, token storage, or production writes.

Files changed:

- `src/lib/meta-business-sandbox-callback-capture.ts`
- `tests/meta-business-login-sandbox-sbl12-callback-capture.test.ts`
- `docs/meta-business-login-sandbox-controlled-callback-capture-plan.md`
- `docs/meta-business-login-sandbox-sbl12-callback-capture-test-command.md`
- `docs/meta-business-login-sandbox-go-no-go-checklist.md`
- `docs/meta-business-login-sandbox-runbook-template.md`
- `docs/meta-business-login-sandbox-experiment-report-template.md`
- `docs/meta-app-review-checklist.md`
- `docs/security-review.md`
- `docs/fix-roadmap.md`
- `docs/codex-session-log.md`

Validation:

- `npx vitest run tests/meta-business-login-sandbox-sbl12-callback-capture.test.ts`: passed, 5 tests.
- `npx vitest run tests/meta-business-login-sandbox-production-isolation.test.ts tests/meta-business-login-sandbox-sbl01-route.test.ts tests/meta-business-login-sandbox-sbl01.test.ts tests/meta-business-login-sandbox-sbl03.test.ts tests/meta-business-login-sandbox-sbl04.test.ts tests/meta-business-login-sandbox-sbl05.test.ts tests/meta-business-login-sandbox-sbl06.test.ts tests/meta-business-login-sandbox-sbl07.test.ts tests/meta-business-login-sandbox-sbl08.test.ts tests/meta-business-login-sandbox-sbl09.test.ts tests/meta-business-login-sandbox-sbl11-evidence-packet.test.ts tests/meta-business-login-sandbox-sbl12-callback-capture.test.ts`: passed, 49 tests.
- `npm run lint`: passed.
- `npm run build`: passed with exit code 0. The existing Prisma engine DLL lock fallback message appeared and reused the generated client.

Decision:

- Callback capture helper: Pass.
- Production callback route integration: Hold.
- Real callback evidence: Hold.
- Internal beta: Hold.
- Production implementation: No-Go.

## 2026-06-16 - Meta Business Login sandbox next controlled callback prompt

Task:

- Answer why the next suggested prompt was missing.
- Add a copyable next-step prompt for controlled callback capture preparation.
- Keep the next step blocked from blindly retrying OAuth against the production callback.

Files changed:

- `docs/meta-business-login-sandbox-next-controlled-callback-prompt.md`
- `docs/fix-roadmap.md`
- `docs/meta-business-login-sandbox-go-no-go-checklist.md`
- `docs/meta-business-login-sandbox-implementation-final-report.md`
- `docs/meta-app-review-checklist.md`
- `docs/security-review.md`
- `docs/codex-session-log.md`

Decision:

- The next safe task is controlled callback capture design and guard preparation.
- Do not retry the Instagram Business Login OAuth URL until sandbox-only callback capture or equivalent production-safe controls exist.
- Internal beta remains Hold.
- Production implementation remains No-Go.

## 2026-06-16 - Meta Business Login sandbox OAuth profile selection

Task:

- Continue from the Instagram Business Login forced login page in the in-app Browser.
- Observe account selection behavior and stop before any production callback or final OAuth authorization.

Files changed:

- `docs/meta-business-login-sandbox-oauth-profile-selection-run-2026-06-16.md`
- `docs/meta-business-login-sandbox-go-no-go-checklist.md`
- `docs/meta-business-login-sandbox-runbook-template.md`
- `docs/meta-business-login-sandbox-experiment-report-template.md`
- `docs/meta-business-login-sandbox-implementation-final-report.md`
- `docs/meta-app-review-checklist.md`
- `docs/security-review.md`
- `docs/fix-roadmap.md`
- `docs/codex-session-log.md`

Validation / observations:

- Instagram Business Login forced login screen was visible.
- Clicking `使用 Facebook 帳號登入` showed IG profile selection with `ling.yun.energy`, `carry.digital.nomad`, and `使用其他個人檔案`.
- Selected `carry.digital.nomad`.
- Instagram loaded the selected profile's home page.
- No final OAuth consent screen, authorization code callback, production ConnectedAccount write, production Channel write, webhook registration, or channel sync was intentionally triggered.

## 2026-06-15 - Meta Business Login sandbox authenticated browser evidence

Task:

- Continue after the in-app Browser was authenticated into Meta Developers.
- Capture read-only evidence for InboxPilot App Dashboard, Instagram API setup, Instagram Business Login URL, business login settings, permissions, and account selection UX.
- Stop before selecting an Instagram profile and before final OAuth authorization.

Files changed:

- `docs/meta-business-login-sandbox-authenticated-browser-evidence-run-2026-06-15.md`
- `docs/meta-business-login-sandbox-browser-evidence-run-2026-06-15.md`
- `docs/meta-business-login-sandbox-implementation-final-report.md`
- `docs/meta-business-login-sandbox-go-no-go-checklist.md`
- `docs/meta-business-login-sandbox-runbook-template.md`
- `docs/fix-roadmap.md`
- `docs/security-review.md`
- `docs/meta-app-review-checklist.md`
- `docs/codex-session-log.md`

Validation / observations:

- Meta Apps page showed InboxPilot app id `924285843989683`, live mode, and business `零元兄弟`.
- InboxPilot Dashboard showed no required actions, rate limit 0% used, and Instagram / Pages / Messenger use cases.
- Instagram API setup showed Instagram app name `manychat-auto-reply-IG`, app id `1530009762118735`, and app secret masked by Meta UI.
- Meta-provided Instagram Business Login URL includes `force_reauth=true`, `response_type=code`, callback URL redacted, and Instagram Business scopes.
- Business login settings showed redirect, deauthorize callback, and data deletion request fields configured; values redacted.
- Permissions table showed required messaging permissions as testable, while content publish / insights were shown as addable.
- Instagram OAuth flow showed login form and then IG profile account selection after Facebook login.
- No final OAuth authorization or callback was completed.

## 2026-06-15 - Meta Business Login sandbox browser evidence run

Task:

- Continue into browser-based external evidence collection.
- Attempt to open Meta Developers and record whether Meta App Dashboard / account selection evidence can be collected.
- Do not enter credentials, OTP, token, authorization code, app secret, raw state, raw nonce, full callback URL, or inspect browser storage.

Files changed:

- `docs/meta-business-login-sandbox-browser-evidence-run-2026-06-15.md`
- `docs/meta-business-login-sandbox-implementation-final-report.md`
- `docs/meta-business-login-sandbox-go-no-go-checklist.md`
- `docs/meta-business-login-sandbox-runbook-template.md`
- `docs/fix-roadmap.md`
- `docs/security-review.md`
- `docs/meta-app-review-checklist.md`
- `docs/codex-session-log.md`

Validation / observations:

- Local dev server health check: passed, status 200.
- In-app Browser could not navigate directly to the internal API route due `net::ERR_BLOCKED_BY_CLIENT`.
- HTTP guard check for internal authorize route: 401 dry-run `unauthorized` without authenticated admin session.
- HTTP guard check for internal callback route with sandbox header: 401 dry-run `unauthorized` without authenticated admin session.
- Meta Developers redirected to Facebook login; no authenticated Meta developer session was available.
- No Meta dialog, account selection UX, real callback, reviewer demo, or App Dashboard evidence was captured.

## 2026-06-15 - Meta Business Login sandbox external evidence retry blocker

Task:

- Retry Chrome-based Meta Developers Apps evidence collection after the user asked Codex to continue.
- Keep the attempt read-only and do not treat blocked page access as App Review evidence.

Result:

- Chrome listed the Meta Developers Apps tab at `https://developers.facebook.com/apps/`.
- Claiming the latest Meta Developers Apps tab and reading the DOM was still blocked by another Chrome extension UI.
- No Meta App Dashboard, Meta dialog, account selection UX, callback, or App Review evidence was collected.
- Production implementation remains No-Go.

## 2026-06-15 - Meta Business Login sandbox external evidence handoff

Task:

- Attempt Chrome-based Meta Developers Apps evidence collection.
- Record blocker state without treating it as App Review evidence.
- Do not capture or store token, authorization code, secret, raw state, raw nonce, callback URL, app secret, or app dashboard secret.

Files changed:

- `docs/meta-business-login-sandbox-external-evidence-handoff.md`
- `docs/meta-business-login-sandbox-implementation-final-report.md`
- `docs/meta-app-review-checklist.md`
- `docs/security-review.md`
- `docs/fix-roadmap.md`
- `docs/codex-session-log.md`

Result:

- Chrome reached `https://developers.facebook.com/apps/`.
- Page title observed: `所有應用程式 - Meta for Developers`.
- Automation could not inspect the page DOM because another Chrome extension UI was blocking the page.
- No App Review evidence was collected.

Resume result:

- Chrome automation later could list and claim Meta-related tabs again.
- Safe metadata remained limited to `所有應用程式 - Meta for Developers` at `https://developers.facebook.com/apps/`.
- DOM snapshot, page evaluate, and screenshot attempts against the Meta Apps page timed out.
- Direct navigation to the Business Login settings URL redirected back to `https://developers.facebook.com/apps/`.
- No App Dashboard settings, Business Login settings, permission status, App Review status, Meta dialog UX, account selection UX, or callback evidence was collected.

## 2026-06-15 - Meta Business Login sandbox SBL-11 evidence packet

Task:

- Add a local dry-run evidence packet helper for sandbox execution preparation.
- Validate that redacted authorize / callback evidence can be packaged without raw code, raw state, production writes, or production implementation approval.
- Do not call Meta, exchange real codes, store tokens, modify production OAuth, modify callback routes, modify login buttons, modify env, modify Prisma schema, or write production ConnectedAccount / Channel records.

Files changed:

- `src/lib/meta-business-sandbox-evidence.ts`
- `tests/meta-business-login-sandbox-sbl11-evidence-packet.test.ts`
- `docs/meta-business-login-sandbox-sbl11-evidence-packet-test-command.md`
- `docs/meta-business-login-sandbox-implementation-final-report.md`
- `docs/fix-roadmap.md`
- `docs/security-review.md`
- `docs/meta-app-review-checklist.md`
- `docs/codex-session-log.md`

Validation:

- `npx vitest run tests/meta-business-login-sandbox-sbl11-evidence-packet.test.ts`: passed, 3 tests.
- `npx vitest run tests/meta-business-login-sandbox-production-isolation.test.ts tests/meta-business-login-sandbox-sbl01-route.test.ts tests/meta-business-login-sandbox-sbl01.test.ts tests/meta-business-login-sandbox-sbl03.test.ts tests/meta-business-login-sandbox-sbl04.test.ts tests/meta-business-login-sandbox-sbl05.test.ts tests/meta-business-login-sandbox-sbl06.test.ts tests/meta-business-login-sandbox-sbl07.test.ts tests/meta-business-login-sandbox-sbl08.test.ts tests/meta-business-login-sandbox-sbl09.test.ts tests/meta-business-login-sandbox-sbl11-evidence-packet.test.ts`: passed, 44 tests.
- `npm run lint`: passed.
- `npm run build`: passed with exit code 0. The existing Prisma engine DLL lock fallback message appeared and reused the generated client.

## 2026-06-15 - Meta Business Login sandbox production isolation regression

Task:

- Add an automated regression test that proves sandbox-only Meta Business Login code remains isolated from production OAuth, UI entry points, and Prisma schema.
- Do not modify production OAuth flow, existing callback routes, login buttons, env, Prisma schema, token storage, or production write paths.

Files changed:

- `tests/meta-business-login-sandbox-production-isolation.test.ts`
- `docs/meta-business-login-sandbox-production-isolation-test-command.md`
- `docs/meta-business-login-sandbox-implementation-final-report.md`
- `docs/fix-roadmap.md`
- `docs/security-review.md`
- `docs/meta-app-review-checklist.md`
- `docs/codex-session-log.md`

Validation:

- `npx vitest run tests/meta-business-login-sandbox-production-isolation.test.ts`: passed, 4 tests.
- `npx vitest run tests/meta-business-login-sandbox-production-isolation.test.ts tests/meta-business-login-sandbox-sbl01-route.test.ts tests/meta-business-login-sandbox-sbl01.test.ts tests/meta-business-login-sandbox-sbl03.test.ts tests/meta-business-login-sandbox-sbl04.test.ts tests/meta-business-login-sandbox-sbl05.test.ts tests/meta-business-login-sandbox-sbl06.test.ts tests/meta-business-login-sandbox-sbl07.test.ts tests/meta-business-login-sandbox-sbl08.test.ts tests/meta-business-login-sandbox-sbl09.test.ts`: passed, 41 tests.
- `npm run lint`: passed.
- `npm run build`: passed with exit code 0. The existing Prisma engine DLL lock fallback message appeared and reused the generated client.
- `git diff --check`: passed with Windows line ending warnings only.
- `npm test`: timed out after 244 seconds; targeted SBL tests passed and no targeted SBL failure was observed before timeout.

## 2026-06-15 - Meta Business Login sandbox route helper integration

Task:

- Integrate internal sandbox routes with the SBL-03 to SBL-08 helper chain.
- Add route-level assertions for state / nonce evidence, code exchange dry-run evidence, workspace spoofing rejection, and production write guard metadata.
- Do not modify production OAuth flow, existing callback routes, login buttons, env, Prisma schema, token storage, or production write paths.

Files changed:

- `src/lib/meta-business-sandbox.ts`
- `src/app/api/internal/oauth/[provider]/authorize/route.ts`
- `src/app/api/internal/oauth/[provider]/callback/route.ts`
- `tests/meta-business-login-sandbox-sbl01-route.test.ts`
- `docs/meta-business-login-sandbox-implementation-final-report.md`
- `docs/fix-roadmap.md`
- `docs/security-review.md`
- `docs/meta-app-review-checklist.md`
- `docs/codex-session-log.md`

Validation:

- `npx vitest run tests/meta-business-login-sandbox-sbl01-route.test.ts`: passed, 5 tests.
- `npx vitest run tests/meta-business-login-sandbox-sbl01.test.ts tests/meta-business-login-sandbox-sbl03.test.ts tests/meta-business-login-sandbox-sbl04.test.ts tests/meta-business-login-sandbox-sbl05.test.ts tests/meta-business-login-sandbox-sbl06.test.ts tests/meta-business-login-sandbox-sbl07.test.ts tests/meta-business-login-sandbox-sbl08.test.ts tests/meta-business-login-sandbox-sbl09.test.ts`: passed, 32 tests.
- `git diff --check`: passed with Windows line ending warnings only.
- `npm run lint`: passed.
- `npm run build`: passed with exit code 0. The existing Prisma engine DLL lock fallback message appeared and reused the generated client.
- `npm test`: not run; targeted SBL route integration tests were executed successfully.

## 2026-06-15 - Meta Business Login sandbox implementation final report

Task:

- Create SBL-10 final consolidation report.
- Confirm sandbox coding is complete for internal-only dry-run scaffold.
- Keep internal beta and production implementation blocked.

Files changed:

- `docs/meta-business-login-sandbox-implementation-final-report.md`
- `docs/fix-roadmap.md`
- `docs/codex-session-log.md`

Validation:

- `npx vitest run tests/meta-business-login-sandbox-sbl06.test.ts tests/meta-business-login-sandbox-sbl07.test.ts tests/meta-business-login-sandbox-sbl08.test.ts tests/meta-business-login-sandbox-sbl05.test.ts tests/meta-business-login-sandbox-sbl04.test.ts tests/meta-business-login-sandbox-sbl03.test.ts tests/meta-business-login-sandbox-sbl01.test.ts tests/meta-business-login-sandbox-sbl01-route.test.ts tests/meta-business-login-sandbox-sbl09.test.ts`: passed, 36 tests.
- `git diff --check`: passed with Windows line ending warnings only.
- `npm run lint`: passed.
- `npm run build`: passed with exit code 0. The existing Prisma engine DLL lock fallback message appeared and reused the generated client.
- `npm test`: not run; targeted SBL tests cover the sandbox implementation scaffold.

## 2026-06-15 - Meta Business Login sandbox SBL-06 to SBL-08 helpers

Task:

- Create SBL-06 dry-run callback payload builder, SBL-07 workspace allowlist guard, and SBL-08 production write guard.
- Add targeted tests and test command documentation.
- Do not modify existing OAuth flow, callback routes, login buttons, env, Prisma schema, production ConnectedAccount, or production Channel records.

Files changed:

- `src/lib/meta-business-sandbox-dry-run.ts`
- `src/lib/meta-business-sandbox-allowlist.ts`
- `src/lib/meta-business-sandbox-write-guard.ts`
- `tests/meta-business-login-sandbox-sbl06.test.ts`
- `tests/meta-business-login-sandbox-sbl07.test.ts`
- `tests/meta-business-login-sandbox-sbl08.test.ts`
- `docs/meta-business-login-sandbox-sbl06-08-test-command.md`
- `docs/meta-business-login-sandbox-runbook-template.md`
- `docs/meta-business-login-sandbox-experiment-report-template.md`
- `docs/meta-business-login-sandbox-go-no-go-checklist.md`
- `docs/meta-business-login-sandbox-coding-risk-test-plan.md`
- `docs/security-review.md`
- `docs/fix-roadmap.md`
- `docs/meta-app-review-checklist.md`
- `docs/codex-session-log.md`

Validation:

- `npx vitest run tests/meta-business-login-sandbox-sbl06.test.ts tests/meta-business-login-sandbox-sbl07.test.ts tests/meta-business-login-sandbox-sbl08.test.ts`: passed, 6 tests.
- `npx vitest run tests/meta-business-login-sandbox-sbl05.test.ts tests/meta-business-login-sandbox-sbl04.test.ts tests/meta-business-login-sandbox-sbl03.test.ts tests/meta-business-login-sandbox-sbl01.test.ts tests/meta-business-login-sandbox-sbl01-route.test.ts tests/meta-business-login-sandbox-sbl09.test.ts`: passed, 30 tests.
- `git diff --check`: passed with Windows line ending warnings only.
- `npm run lint`: passed.
- `npm run build`: passed with exit code 0. The existing Prisma engine DLL lock fallback message appeared and reused the generated client.
- `npm test`: not run; targeted SBL tests were executed successfully.

## 2026-06-15 - Meta Business Login sandbox SBL-05 redacted logging helper

Task:

- Create SBL-05 sandbox-only redacted logging helper.
- Add helper tests and test command documentation.
- Do not change production audit behavior, production logging format, existing OAuth flow, existing callback routes, env, Prisma schema, token storage, or production write paths.

Files changed:

- `src/lib/meta-business-sandbox-redaction.ts`
- `tests/meta-business-login-sandbox-sbl05.test.ts`
- `docs/meta-business-login-sandbox-sbl05-test-command.md`
- `docs/meta-business-login-sandbox-runbook-template.md`
- `docs/meta-business-login-sandbox-experiment-report-template.md`
- `docs/meta-business-login-sandbox-go-no-go-checklist.md`
- `docs/meta-business-login-sandbox-coding-risk-test-plan.md`
- `docs/security-review.md`
- `docs/fix-roadmap.md`
- `docs/meta-app-review-checklist.md`
- `docs/codex-session-log.md`

Validation:

- `npx vitest run tests/meta-business-login-sandbox-sbl05.test.ts`: passed, 4 tests.
- `npx vitest run tests/meta-business-login-sandbox-sbl04.test.ts tests/meta-business-login-sandbox-sbl03.test.ts tests/meta-business-login-sandbox-sbl01.test.ts tests/meta-business-login-sandbox-sbl01-route.test.ts tests/meta-business-login-sandbox-sbl09.test.ts`: passed, 26 tests.
- `git diff --check`: passed with Windows line ending warnings only.
- `npm run lint`: passed.
- `npm run build`: passed with exit code 0. The existing Prisma engine DLL lock fallback message appeared and reused the generated client.
- `npm test`: not run yet; targeted SBL tests were executed first.

## 2026-06-15 - Meta Business Login sandbox SBL-04 code exchange helper

Task:

- Create SBL-04 sandbox-only code exchange helper.
- Add helper tests and test command documentation.
- Do not call Meta token endpoint by default, read env, store tokens, modify existing OAuth, modify existing callback routes, modify Prisma schema, or write production records.

Files changed:

- `src/lib/meta-business-sandbox-code-exchange.ts`
- `tests/meta-business-login-sandbox-sbl04.test.ts`
- `docs/meta-business-login-sandbox-sbl04-test-command.md`
- `docs/meta-business-login-sandbox-runbook-template.md`
- `docs/meta-business-login-sandbox-experiment-report-template.md`
- `docs/meta-business-login-sandbox-go-no-go-checklist.md`
- `docs/meta-business-login-sandbox-coding-risk-test-plan.md`
- `docs/security-review.md`
- `docs/fix-roadmap.md`
- `docs/meta-app-review-checklist.md`
- `docs/codex-session-log.md`

Validation:

- `npx vitest run tests/meta-business-login-sandbox-sbl04.test.ts`: passed, 5 tests.
- `npx vitest run tests/meta-business-login-sandbox-sbl03.test.ts tests/meta-business-login-sandbox-sbl01.test.ts tests/meta-business-login-sandbox-sbl01-route.test.ts tests/meta-business-login-sandbox-sbl09.test.ts`: passed, 21 tests.
- `git diff --check`: passed with Windows line ending warnings only.
- `npm run lint`: passed.
- `npm run build`: passed with exit code 0. The existing Prisma engine DLL lock fallback message appeared and reused the generated client.
- `npm test`: not run; targeted SBL tests were executed successfully.

## 2026-06-15 - Meta Business Login sandbox SBL-03 state nonce helpers

Task:

- Create SBL-03 sandbox-only state / nonce helpers.
- Add helper tests and test command documentation.
- Do not modify existing OAuth state helpers, callback routes, cookies, env, Prisma schema, token handling, or production write paths.

Files changed:

- `src/lib/meta-business-sandbox-state.ts`
- `tests/meta-business-login-sandbox-sbl03.test.ts`
- `docs/meta-business-login-sandbox-sbl03-test-command.md`
- `docs/meta-business-login-sandbox-runbook-template.md`
- `docs/meta-business-login-sandbox-experiment-report-template.md`
- `docs/meta-business-login-sandbox-go-no-go-checklist.md`
- `docs/meta-business-login-sandbox-coding-risk-test-plan.md`
- `docs/security-review.md`
- `docs/fix-roadmap.md`
- `docs/meta-app-review-checklist.md`
- `docs/codex-session-log.md`

Validation:

- `npx vitest run tests/meta-business-login-sandbox-sbl03.test.ts`: passed, 4 tests.
- `npx vitest run tests/meta-business-login-sandbox-sbl01.test.ts tests/meta-business-login-sandbox-sbl01-route.test.ts`: passed, 10 tests.
- `npx vitest run tests/meta-business-login-sandbox-sbl09.test.ts`: passed, 7 tests.
- `git diff --check`: passed with Windows line ending warnings only.
- `npm run lint`: passed.
- `npm run build`: passed with exit code 0. The existing Prisma engine DLL lock fallback message appeared and reused the generated client.
- `npm test`: not run; targeted SBL-03 / SBL-01 / SBL-09 tests were executed successfully.

## 2026-06-15 - Meta Business Login sandbox SBL-01 internal route skeleton

Task:

- Create SBL-01 internal-only dry-run route skeleton.
- Add sandbox helper, internal authorize route, internal callback route, SBL-01 helper tests, SBL-01 route tests, and SBL-01 test command documentation.
- Do not modify existing OAuth flow, existing callback routes, login buttons, Prisma schema, env, or production ConnectedAccount / Channel writes.

Files changed:

- `src/lib/meta-business-sandbox.ts`
- `src/app/api/internal/oauth/[provider]/authorize/route.ts`
- `src/app/api/internal/oauth/[provider]/callback/route.ts`
- `tests/meta-business-login-sandbox-sbl01.test.ts`
- `tests/meta-business-login-sandbox-sbl01-route.test.ts`
- `docs/meta-business-login-sandbox-sbl01-test-command.md`
- `docs/meta-business-login-sandbox-runbook-template.md`
- `docs/meta-business-login-sandbox-experiment-report-template.md`
- `docs/meta-business-login-sandbox-go-no-go-checklist.md`
- `docs/meta-business-login-sandbox-coding-risk-test-plan.md`
- `docs/security-review.md`
- `docs/fix-roadmap.md`
- `docs/meta-app-review-checklist.md`
- `docs/codex-session-log.md`

Validation:

- `npx vitest run tests/meta-business-login-sandbox-sbl01.test.ts`: passed, 6 tests.
- `npx vitest run tests/meta-business-login-sandbox-sbl01-route.test.ts`: passed, 4 tests.
- `npx vitest run tests/meta-business-login-sandbox-sbl09.test.ts`: passed, 7 tests.
- `git diff --check`: passed with Windows line ending warnings only.
- `npm run lint`: passed.
- `npm run build`: passed with exit code 0. The existing Prisma engine DLL lock fallback message appeared and reused the generated client.
- `npm test`: not run; targeted SBL-01 and SBL-09 tests were executed successfully.

## 2026-06-15 - Meta Business Login sandbox SBL-09 test scaffold coding

Task:

- Create SBL-09 sandbox test scaffold only.
- Add fixture directory, safe and unsafe fixture examples, redaction assertion helper, dry-run callback payload snapshot tests, production write guard tests, and test command documentation.
- Backfill runbook, experiment report, go/no-go checklist, coding risk test plan, security review, fix roadmap, Meta App Review checklist, and session log.
- Do not modify product code, OAuth flow, callback routes, login buttons, Prisma schema, or env.

Files changed:

- `tests/helpers/sbl09-redaction.ts`
- `tests/fixtures/sbl09/safe/sbl09.callback.valid-dry-run.expected-redacted.fixture.json`
- `tests/fixtures/sbl09/safe/sbl09.write-guard.channel-create-blocked.safe.fixture.json`
- `tests/fixtures/sbl09/unsafe/sbl09.redaction.raw-code.unsafe.fixture.json`
- `tests/meta-business-login-sandbox-sbl09.test.ts`
- `docs/meta-business-login-sandbox-sbl09-test-command.md`
- `docs/meta-business-login-sandbox-runbook-template.md`
- `docs/meta-business-login-sandbox-experiment-report-template.md`
- `docs/meta-business-login-sandbox-go-no-go-checklist.md`
- `docs/meta-business-login-sandbox-coding-risk-test-plan.md`
- `docs/security-review.md`
- `docs/fix-roadmap.md`
- `docs/meta-app-review-checklist.md`
- `docs/codex-session-log.md`

Validation:

- `npx vitest run tests/meta-business-login-sandbox-sbl09.test.ts`: passed, 7 tests.
- `git status`: docs plus SBL-09 test scaffold files changed; no product code changed.
- `npm run lint`: passed.
- `npm run build`: passed with exit code 0. The existing Prisma engine DLL lock fallback message appeared and reused the generated client.
- `npm test`: not run; this SBL-09 task added targeted scaffold tests, and the targeted Vitest command was executed successfully.

## 2026-06-15 - Meta Business Login sandbox SBL-09 coding readiness checklist

Task:

- Create a documentation-only SBL-09 sandbox coding readiness checklist.
- Include required documents, test suite readiness, fixture / redaction readiness, dry-run callback snapshot readiness, production write guard fixture readiness, redaction search readiness, SBL-09 go / hold decision, and explicit SBL-01 / internal beta / production blocks.
- Do not modify product code, OAuth flow, callback routes, login buttons, Prisma schema, or env.

Files changed:

- `docs/meta-business-login-sandbox-sbl09-coding-readiness-checklist.md`
- `docs/fix-roadmap.md`
- `docs/security-review.md`
- `docs/meta-app-review-checklist.md`
- `docs/codex-session-log.md`

Validation:

- `git status`: only documentation files changed.
- `npm run lint`: passed.
- `npm run build`: passed with exit code 0. The existing Prisma engine DLL lock fallback message appeared and reused the generated client.
- `npm test`: not run; documentation-only task covered by lint/build verification.

## 2026-06-15 - Meta Business Login sandbox SBL-09 fixture redaction spec

Task:

- Create a documentation-only SBL-09 sandbox test fixture and redaction assertion specification.
- Include fixture naming, safe and unsafe fixture examples, forbidden raw token / code / secret / state / nonce / callback URL rules, redaction assertions, dry-run callback payload snapshots, production write guard fixtures, search standards, and required runbook / report / go-no-go backfills.
- Do not modify product code, OAuth flow, callback routes, login buttons, Prisma schema, or env.

Files changed:

- `docs/meta-business-login-sandbox-sbl09-fixture-redaction-spec.md`
- `docs/fix-roadmap.md`
- `docs/security-review.md`
- `docs/meta-app-review-checklist.md`
- `docs/codex-session-log.md`

Validation:

- `git status`: only documentation files changed.
- `npm run lint`: passed.
- `npm run build`: passed with exit code 0. The existing Prisma engine DLL lock fallback message appeared and reused the generated client.
- `npm test`: not run; documentation-only task covered by lint/build verification.

## 2026-06-15 - Meta Business Login sandbox SBL-09 test suite spec

Task:

- Create a documentation-only SBL-09 sandbox coding minimum test suite specification.
- Include test goals and production boundaries, internal-only route tests, workspace allowlist tests, state / nonce / code exchange tests, redacted logging tests, dry-run callback payload tests, production write guard tests, and required runbook / report / go-no-go backfills.
- Do not modify product code, OAuth flow, callback routes, login buttons, Prisma schema, or env.

Files changed:

- `docs/meta-business-login-sandbox-sbl09-test-suite-spec.md`
- `docs/fix-roadmap.md`
- `docs/security-review.md`
- `docs/meta-app-review-checklist.md`
- `docs/codex-session-log.md`

Validation:

- `git status`: only documentation files changed.
- `npm run lint`: passed.
- `npm run build`: passed with exit code 0. The existing Prisma engine DLL lock fallback message appeared and reused the generated client.
- `npm test`: not run; documentation-only task covered by lint/build verification.

## 2026-06-15 - Meta Business Login sandbox coding kickoff checklist

Task:

- Create a documentation-only sandbox coding kickoff checklist.
- Include SBL-09 and SBL-01 prerequisite documents and gates, internal-only / dry-run-first / no-production-write checks, redaction search standards, required document backfills, and internal beta / production blocks.
- Do not modify product code, OAuth flow, callback routes, login buttons, Prisma schema, or env.

Files changed:

- `docs/meta-business-login-sandbox-coding-kickoff-checklist.md`
- `docs/fix-roadmap.md`
- `docs/security-review.md`
- `docs/meta-app-review-checklist.md`
- `docs/codex-session-log.md`

Validation:

- `git status`: only documentation files changed.
- `npm run lint`: passed.
- `npm run build`: passed with exit code 0. The existing Prisma engine DLL lock fallback message appeared and reused the generated client.
- `npm test`: not run; documentation-only task covered by lint/build verification.

## 2026-06-15 - Meta Business Login sandbox final readiness review

Task:

- Create a documentation-only final readiness review before Meta Business Login sandbox coding.
- Include sandbox document completeness, sandbox coding readiness, missing execution evidence, gate status, recommended first coding task, and internal beta / production implementation blocks.
- Do not modify product code, OAuth flow, callback routes, login buttons, Prisma schema, or env.

Files changed:

- `docs/meta-business-login-sandbox-final-readiness-review.md`
- `docs/fix-roadmap.md`
- `docs/security-review.md`
- `docs/meta-app-review-checklist.md`
- `docs/codex-session-log.md`

Validation:

- `git status`: only documentation files changed.
- `npm run lint`: passed.
- `npm run build`: passed with exit code 0. The existing Prisma engine DLL lock fallback message appeared and reused the generated client.
- `npm test`: not run; documentation-only task covered by lint/build verification.

## 2026-06-15 - Meta Business Login sandbox coding task breakdown

Task:

- Create a documentation-only task breakdown for future Meta Business Login sandbox coding.
- Include internal-only / dry-run-first task breakdown, prerequisite gates, test requirements, prohibited files / flows, evidence backfill requirements, and production implementation block.
- Do not modify product code, OAuth flow, callback routes, login buttons, Prisma schema, or env.

Files changed:

- `docs/meta-business-login-sandbox-coding-task-breakdown.md`
- `docs/fix-roadmap.md`
- `docs/security-review.md`
- `docs/meta-app-review-checklist.md`
- `docs/codex-session-log.md`

Validation:

- `git status`: only documentation files changed.
- `npm run lint`: passed.
- `npm run build`: passed with exit code 0. The existing Prisma engine DLL lock fallback message appeared and reused the generated client.
- `npm test`: not run; documentation-only task covered by lint/build verification.

## 2026-06-15 - Meta Business Login sandbox document index

Task:

- Create a documentation-only index and decision path for all Meta Business Login sandbox documents.
- Include document purpose, reading order, research-to-coding decision path, template / draft status, unpassed gates, and current production implementation block.
- Do not modify product code, OAuth flow, callback routes, login buttons, Prisma schema, or env.

Files changed:

- `docs/meta-business-login-sandbox-doc-index.md`
- `docs/fix-roadmap.md`
- `docs/security-review.md`
- `docs/meta-app-review-checklist.md`
- `docs/codex-session-log.md`

Validation:

- `git status`: only documentation files changed.
- `npm run lint`: passed.
- `npm run build`: passed with exit code 0. The existing Prisma engine DLL lock fallback message appeared and reused the generated client.
- `npm test`: not run; documentation-only task covered by lint/build verification.

## 2026-06-15 - Meta Business Login sandbox coding risk test plan

Task:

- Create a documentation-only sandbox coding risk assessment and test plan.
- Include internal-only route risks, sandbox provider interface risks, state / nonce / code exchange tests, redacted logging tests, dry-run callback payload tests, workspace allowlist tests, production Channel write guard tests, and the minimum checklist before sandbox coding can start.
- Do not modify product code, OAuth flow, callback routes, login buttons, Prisma schema, or env.

Files changed:

- `docs/meta-business-login-sandbox-coding-risk-test-plan.md`
- `docs/fix-roadmap.md`
- `docs/security-review.md`
- `docs/meta-app-review-checklist.md`
- `docs/codex-session-log.md`

Validation:

- `git status`: only documentation files changed.
- `npm run lint`: passed.
- `npm run build`: passed with exit code 0. The existing Prisma engine DLL lock fallback message appeared and reused the generated client.
- `npm test`: not run; documentation-only task covered by lint/build verification.

## 2026-06-15 - Meta Business Login sandbox coding spec draft

Task:

- Create a documentation-only pre-coding technical spec draft for Meta Business Login sandbox.
- Include internal-only route draft, sandbox provider interface, state / nonce / code exchange helpers, redacted logging, dry-run callback payload, workspace allowlist, production Channel write guards, and unchanged production OAuth / callback / button / env boundaries.
- Do not modify product code, OAuth flow, callback routes, login buttons, Prisma schema, or env.

Files changed:

- `docs/meta-business-login-sandbox-coding-spec-draft.md`
- `docs/fix-roadmap.md`
- `docs/security-review.md`
- `docs/meta-app-review-checklist.md`
- `docs/codex-session-log.md`

Validation:

- `git status`: only documentation files changed.
- `npm run lint`: passed.
- `npm run build`: passed with exit code 0. The existing Prisma engine DLL lock fallback message appeared and reused the generated client.
- `npm test`: not run; documentation-only task covered by lint/build verification.

## 2026-06-15 - Meta Business Login sandbox go/no-go checklist

Task:

- Create a documentation-only Meta Business Login sandbox go/no-go checklist.
- Include App Review, account selection UX, callback security, workspace linking, channel sync, redaction, rollback, and stage differences for sandbox coding, internal beta, and production implementation.
- Do not modify product code, OAuth flow, callback routes, login buttons, Prisma schema, or env.

Files changed:

- `docs/meta-business-login-sandbox-go-no-go-checklist.md`
- `docs/fix-roadmap.md`
- `docs/security-review.md`
- `docs/meta-app-review-checklist.md`
- `docs/codex-session-log.md`

Validation:

- `git status`: only documentation files changed.
- `npm run lint`: passed.
- `npm run build`: passed with exit code 0. The existing Prisma engine DLL lock fallback message appeared and reused the generated client.
- `npm test`: not run; documentation-only task covered by lint/build verification.

## 2026-06-15 - Meta Business Login sandbox experiment report template

Task:

- Create a documentation-only blank experiment report template for sandbox-only Meta Business Login results.
- Include experiment summary, test combinations, Meta dialog UX, callback / workspace linking / channel sync, redaction search, ManyChat UX proximity, App Review risks, and go / hold / no-go decision.
- Do not modify product code, OAuth flow, callback routes, login buttons, Prisma schema, or env.

Files changed:

- `docs/meta-business-login-sandbox-experiment-report-template.md`
- `docs/fix-roadmap.md`
- `docs/security-review.md`
- `docs/meta-app-review-checklist.md`
- `docs/codex-session-log.md`

Validation:

- `git status`: only documentation files changed.
- `npm run lint`: passed.
- `npm run build`: passed with exit code 0. The existing Prisma engine DLL lock fallback message appeared and reused the generated client.
- `npm test`: not run; documentation-only task covered by lint/build verification.

## 2026-06-15 - Meta Business Login sandbox runbook template

Task:

- Report current progress.
- Create a documentation-only runbook template for sandbox-only Meta Business Login experiments.
- Do not modify product code, OAuth flow, callback routes, login buttons, Prisma schema, or env.

Files changed:

- `docs/meta-business-login-sandbox-runbook-template.md`
- `docs/fix-roadmap.md`
- `docs/security-review.md`
- `docs/meta-app-review-checklist.md`
- `docs/codex-session-log.md`

Validation:

- `git status`: only documentation files changed.
- `npm run lint`: passed.
- `npm run build`: passed with exit code 0. The existing Prisma engine DLL lock fallback message appeared and reused the generated client.
- `npm test`: not run; documentation-only task covered by lint/build verification.

## 2026-06-15 - Meta Business Login sandbox implementation plan

Task:

- Create a documentation-only sandbox implementation plan for Facebook Login for Business / Instagram Business Login.
- Define provider naming, env planning, authorize URL, callback state / nonce / code exchange, ConnectedAccount / Channel mapping, App Review gates, redaction checks, rollback, and production boundaries.
- Do not modify product code, OAuth flow, callback routes, login buttons, Prisma schema, or env.

Files changed:

- `docs/meta-business-login-sandbox-implementation-plan.md`
- `docs/fix-roadmap.md`
- `docs/security-review.md`
- `docs/meta-app-review-checklist.md`
- `docs/codex-session-log.md`

Validation:

- `git status`: only documentation files changed.
- `npm run lint`: passed.
- `npm run build`: passed with exit code 0. The existing Prisma engine DLL lock fallback message appeared and reused the generated client.
- `npm test`: not run; documentation-only task covered by lint/build verification.

## 2026-06-15 - AI model cache refresh automation

Task:

- Run `npm run ai-models:refresh` in the workspace.
- Report refreshed model counts for ChatGPT, Gemini, DeepSeek, xAI, Codex CLI, and Antigravity CLI.

Files changed:

- `docs/codex-session-log.md`
- `docs/fix-roadmap.md`

Validation:

- `npm run ai-models:refresh`: passed.

Notes:

- All 6 workspaces refreshed the same remote provider counts: `chatgpt 10`, `gemini 7`, `deepseek 2`, `xai 2`.
- `codex_cli` and `antigravity_cli` did not appear in the refresh result and did not throw errors, consistent with prior runs where local CLI providers were skipped by provider-availability guards.
- No product code, schema, env, or OAuth / billing / webhook flow was changed.

## 2026-06-15 - Meta Business Login pre-implementation ADR

Task:

- Read the project and Meta login research docs.
- Create a documentation-only ADR for evaluating Facebook Login for Business, Instagram Business Login, and keeping the current Instagram OAuth flow.
- Do not modify product code, OAuth flow, callback routes, login buttons, or env.

Files changed:

- `docs/adr-meta-business-login-before-implementation.md`
- `docs/fix-roadmap.md`
- `docs/security-review.md`
- `docs/meta-app-review-checklist.md`
- `docs/codex-session-log.md`

Validation:

- `git status`: only documentation files changed.
- `npm run lint`: passed.
- `npm run build`: passed with exit code 0. The existing Prisma engine DLL lock fallback message appeared and reused the generated client.
- `npm test`: not run; documentation-only task covered by lint/build verification.

## 2026-06-15：Meta Account Selection 測試矩陣

- 本次任務目標：只新增 / 更新文件，建立 `docs/meta-business-login-account-selection-test-matrix.md`，定義未登入、單一登入、多帳號 session、桌機 / 手機、popup / redirect transport、callback 結果、workspace linking / channel sync 與 ManyChat UX 判定標準。
- 修改檔案：
  - `docs/meta-business-login-account-selection-test-matrix.md`
  - `docs/fix-roadmap.md`
  - `docs/meta-app-review-checklist.md`
  - `docs/security-review.md`
  - `docs/codex-session-log.md`
- 驗證：
  - `git status`：僅有文件變更。
  - `npm run lint`：通過。
  - `npm run build`：通過；出現既有 Prisma engine DLL lock fallback 訊息，但指令 exit code 為 0。
  - `npm test`：未執行；本次為純文件任務，已完成 lint / build 驗證。
- 限制：
  - 未修改產品功能程式碼。
  - 未修改 OAuth flow、callback route、登入按鈕或 env。

## 2026-06-15：Meta Business Login App Review Demo Script

- 本次任務目標：只新增 / 更新文件，產出 `docs/meta-business-login-app-review-demo-script.md`，補齊 reviewer demo、permission usage table、資料使用位置、redaction checklist、callback / workspace linking / channel sync 安全重點與 App Review 備援方案。
- 修改檔案：
  - `docs/meta-business-login-app-review-demo-script.md`
  - `docs/meta-app-review-checklist.md`
  - `docs/security-review.md`
  - `docs/fix-roadmap.md`
  - `docs/codex-session-log.md`
- 驗證：
  - `git status`：僅有文件變更。
  - `npm run lint`：通過。
  - `npm run build`：通過；出現既有 Prisma engine DLL lock fallback 訊息，但指令 exit code 為 0。
  - `npm test`：未執行；本次為純文件任務，已完成 lint / build 驗證。
- 限制：
  - 未修改產品功能程式碼。
  - 未修改 OAuth flow、callback route、登入按鈕或 env。

## 2026-06-15：Business Login 研究規格文件

- 本次任務目標：依 `docs/meta-login-account-selection-analysis.md` 建立只做文件與實驗規格的研究任務，評估 Facebook Login for Business / Instagram Business Login 是否能取代目前 Instagram OAuth。
- 修改檔案：
  - `docs/meta-business-login-experiment-spec.md`
  - `docs/meta-app-review-checklist.md`
  - `docs/fix-roadmap.md`
  - `docs/codex-session-log.md`
- 驗證：
  - `git status`：僅有文件變更。
  - `npm run lint`：通過。
  - `npm run build`：通過；出現既有 Prisma engine DLL lock fallback 訊息，但指令 exit code 為 0。
  - `npm test`：未執行；本次為純文件與研究規格任務，已完成 lint / build 驗證。
- 限制：
  - 未修改產品功能程式碼。
  - 未修改 OAuth flow、callback route、登入按鈕或 env。

## 2026-06-15：Meta / Instagram 帳號選擇分析

- 本次任務目標：只做文件分析，不修改產品功能程式碼；確認 InboxPilot 目前 Meta / Instagram OAuth 帳號連接流程、authorize URL、帳號切換限制與 ManyChat 差異。
- 修改檔案：
  - `docs/meta-login-account-selection-analysis.md`
  - `docs/codex-session-log.md`
  - `docs/fix-roadmap.md`
- 驗證：
  - `git status`：僅有文件變更。
  - `npm run lint`：通過。
  - `npm run build`：通過。
  - `npm test`：未執行；本次為純文件分析任務，且已完成 lint / build 驗證。
- 風險記錄：
  - 目前無功能程式碼變更。
  - 分析指出帳號切換不能由 `auth_type=reauthenticate` 或 `auth_type=rerequest` 穩定保證。
  - 若要接近 ManyChat UX，後續需評估 Facebook Login for Business / Business Login for Instagram。

更新日期：2026-06-10

## 用途

這份文件用來記錄每一輪 Codex 任務實際做了什麼、驗證到哪裡、還剩什麼風險，避免下一輪接手的人只看到 commit，卻不知道那些坑是填平了還是只是蓋上地毯。

## 建議格式

每一筆記錄至少包含：

- 本次任務目標
- 修改檔案
- 驗證結果
- 仍存風險
- 下一個建議任務

## Session 記錄

### 2026-06-10：建立 Codex 工作規則與交接文件

- 本次任務目標：
  - 建立 `AGENTS.md`
  - 建立 `docs/codex-session-log.md`
- 修改檔案：
  - `AGENTS.md`
  - `docs/codex-session-log.md`
- 驗證結果：
  - 文件建立成功
- 仍存風險：
  - 若之後任務不持續更新 session log，文件會再次過期
- 下一個建議任務：
  - 建立正式 product / security / Meta / billing review 文件

### 2026-06-10：完成 code-level readiness review 文件

- 本次任務目標：
  - 以實際程式碼為主做可販售 SaaS 等級 review
  - 建立 readiness review 文件
- 修改檔案：
  - `docs/product-readiness-review.md`
  - `docs/security-review.md`
  - `docs/meta-app-review-checklist.md`
  - `docs/billing-affiliate-readiness.md`
  - `docs/fix-roadmap.md`
  - `docs/codex-session-log.md`
- 驗證結果：
  - `git status` 已檢查
  - `npm run lint` 通過
  - `npm run build` 通過
- 仍存風險：
  - billing interval、zero-amount subscription、Meta env token fallback、對外頁面亂碼仍未修
- 下一個建議任務：
  - 進入 Phase 0，先修 billing correctness

### 2026-06-10：完成 Phase 0 任務 1 - billing interval 與 subscription correctness

- 本次任務目標：
  - 修正 `completePaidPaymentOrder()` 將 interval 寫死為 `month`
  - 讓 zero-amount / credit-only checkout 走正式 completion flow
  - 補齊 month / year / zero-amount / idempotency 測試
- 修改檔案：
  - `prisma/schema.prisma`
  - `prisma/migrations/20260610113000_payment_order_interval/migration.sql`
  - `src/lib/audit.ts`
  - `src/lib/billing/payment-service.ts`
  - `src/app/api/billing/payuni/checkout/route.ts`
  - `tests/payuni-billing.test.ts`
  - `tests/billing-checkout-route.test.ts`
  - `docs/product-readiness-review.md`
  - `docs/security-review.md`
  - `docs/billing-affiliate-readiness.md`
  - `docs/fix-roadmap.md`
  - `docs/codex-session-log.md`
- 驗證結果：
  - `npm run lint` 通過
  - `npm run build` 通過
  - `npm test` 第一次遇到既有 Vitest 子程序 crash，第二次完整通過
  - `npm run payuni:smoke` 通過
- 仍存風險：
  - PayUNI production 開關與 merchant review 仍未完成
  - Meta env token fallback 仍未移除
  - Billing / legal / README 亂碼與對外文案仍未整理
- 下一個建議任務：
  - 進入 Phase 0 任務 2，production 模式移除 Meta env token fallback
## 2026-06-16 - Meta Business Login Sandbox SBL-12 Callback Capture Guard

任務目標：

- 在不進行真實 Meta token exchange、不寫入 production ConnectedAccount / Channel、不改登入按鈕、不改 env、不改 Prisma schema 的前提下，讓目前已註冊的 Instagram callback 可以安全捕捉 redacted callback evidence。

修改內容：

- 新增 signed sandbox callback capture state marker。
- 在 production Meta callback route 加入極窄的 read-only sandbox guard；只有 state 是 sandbox capture marker 時才會早退回 redacted JSON。
- 一般 production OAuth callback 沒有 sandbox marker 時，仍走原本 callback 邏輯。
- 新增 helper 與 route targeted tests。
- 更新 SBL-12、security、App Review、runbook、report、go/no-go、roadmap 文件。

驗證：

```text
npx vitest run tests/meta-business-login-sandbox-sbl12-callback-capture.test.ts tests/meta-business-login-sandbox-sbl12-callback-route.test.ts
Result: 2 test files passed, 9 tests passed

npx vitest run tests/meta-business-login-sandbox-production-isolation.test.ts tests/meta-business-login-sandbox-sbl01-route.test.ts tests/meta-business-login-sandbox-sbl01.test.ts tests/meta-business-login-sandbox-sbl03.test.ts tests/meta-business-login-sandbox-sbl04.test.ts tests/meta-business-login-sandbox-sbl05.test.ts tests/meta-business-login-sandbox-sbl06.test.ts tests/meta-business-login-sandbox-sbl07.test.ts tests/meta-business-login-sandbox-sbl08.test.ts tests/meta-business-login-sandbox-sbl09.test.ts tests/meta-business-login-sandbox-sbl11-evidence-packet.test.ts tests/meta-business-login-sandbox-sbl12-callback-capture.test.ts tests/meta-business-login-sandbox-sbl12-callback-route.test.ts
Result: 13 test files passed, 53 tests passed

npm run lint
Result: passed

npm run build
Result: passed; Prisma generate reported a local Windows DLL lock and reused the existing generated client.

npm test
Result: timed out after 184 seconds before a complete result was returned.
```

Gate：

- Callback capture helper: Pass
- Signed-state route guard: Pass
- Real callback evidence: Hold
- Workspace linking: Hold
- Channel sync: Hold
- Internal beta: Hold
- Production implementation: No-Go

CI follow-up:

- GitHub Actions CI failed because workflow still used `DATABASE_URL=file:./dev.db`.
- `scripts/run-tests.mjs` now requires PostgreSQL for `npm test`.
- Updated `.github/workflows/ci.yml` to run a PostgreSQL service and provide `TEST_DATABASE_URL` / `TEST_DIRECT_URL`.

Production deploy / browser follow-up:

- CI passed after PostgreSQL service update.
- Production deploy completed with Vercel.
- Production callback probe returned redacted JSON evidence and did not expose fake code or raw sandbox state marker.
- Controlled Instagram OAuth browser run observed account/profile selection with `carry.digital.nomad`, `ling.yun.energy`, and use-another-profile.
- Controlled browser run reached Instagram consent screen without `force_reauth=true`.
- Codex stopped before clicking allow because that action grants app permissions to the Instagram account.
- User clicked allow on the Instagram consent screen.
- Codex verified the callback response body as `sandbox_callback_capture` redacted JSON.
- Callback response body had redacted code/state/callback URL markers, hash markers present, `errorType=null`, `exchangeAttempted=false`, and all production write flags false.
- Raw leak check on the response body passed for authorization code, state marker, token, secret, and full callback URL patterns.
- Real callback evidence: Pass.
- Workspace linking and channel sync: Hold.

下一步建議 Codex Prompt：

```text
請繼續執行 Meta Business Login sandbox SBL-12 controlled browser callback capture。

限制：
1. 不要改 OAuth flow。
2. 不要改登入按鈕。
3. 不要改 env。
4. 不要改 Prisma schema。
5. 不要建立或更新 production ConnectedAccount / Channel。
6. 不要做真實 Meta token exchange。
7. 只能使用 signed sandbox callback capture marker 取得 redacted evidence。

請根據：
- docs/meta-business-login-sandbox-controlled-callback-capture-plan.md
- docs/meta-business-login-sandbox-sbl12-callback-capture-test-command.md
- docs/meta-business-login-sandbox-runbook-template.md
- docs/meta-business-login-sandbox-experiment-report-template.md
- docs/meta-business-login-sandbox-go-no-go-checklist.md

執行一次受控瀏覽器 OAuth callback capture，僅記錄 redacted JSON evidence，不得記錄 raw code、raw state、raw nonce、full callback URL、token、secret。

完成後請回填 runbook / report / go-no-go checklist / security-review / fix-roadmap / codex-session-log，並執行 git status、targeted tests、npm run lint、npm run build。
```
## 2026-06-16 - Latest Meta Business Login Sandbox Next Prompt

```text
請繼續執行 Meta Business Login sandbox workspace linking / channel sync dry-run validation。

目前狀態：
1. production callback guard 已部署。
2. Instagram Business Login account selection 已通過。
3. consent screen 已到達。
4. 使用者已手動按 allow。
5. callback response 已確認為 sandbox_callback_capture redacted JSON。
6. exchangeAttempted=false。
7. productionWrites 全部為 false。

請只做 sandbox-only / dry-run-first 驗證，不要改正式登入按鈕，不要改 env，不要改 Prisma schema，不要做真實 Meta token exchange，不要建立或更新 production ConnectedAccount / Channel。

請完成：
1. 建立或使用既有 dry-run workspace linking evidence 格式。
2. 驗證 callback evidence 如何映射到 sandbox provider / workspace / channel draft。
3. 驗證 channel sync dry-run payload 不含 token / code / secret / raw state / full callback URL。
4. 驗證 production write guard 仍阻擋 ConnectedAccount / Channel 寫入。
5. 回填 runbook / experiment report / go-no-go checklist / security-review / fix-roadmap / codex-session-log。
6. 執行 targeted tests、npm run lint、npm run build。
7. commit 並 push master。
```

## 2026-06-16 - Meta Business Login Sandbox SBL-13 Workspace Linking / Channel Sync Dry-Run

任務目標：

- 使用已 redacted 的 `sandbox_callback_capture` evidence，驗證 workspace linking / channel sync 只能形成 sandbox dry-run draft，不建立或更新 production ConnectedAccount / Channel。

修改內容：

- 新增 `src/lib/meta-business-sandbox-workspace-linking.ts`。
- 新增 `tests/meta-business-login-sandbox-sbl13-workspace-linking-sync.test.ts`。
- 新增 `docs/meta-business-login-sandbox-sbl13-workspace-linking-sync-dry-run.md`。
- 回填 runbook / experiment report / go-no-go checklist / security-review / fix-roadmap / codex-session-log。

驗證結果：

```text
npx vitest run tests/meta-business-login-sandbox-sbl13-workspace-linking-sync.test.ts
Result: 1 test file passed, 2 tests passed
```

Gate：

- Callback evidence mapping: Pass
- Workspace linking dry-run: Pass
- Channel sync dry-run: Pass
- Production write guard: Pass
- Redaction: Pass
- Internal beta: Hold
- Production implementation: No-Go

下一步建議 Codex Prompt：

```text
請根據目前 Meta Business Login sandbox 文件與 SBL-13 dry-run evidence，建立 internal beta 前 go/no-go review。

目前狀態：
1. account selection UX: Pass
2. consent screen: Pass
3. redacted callback evidence: Pass
4. workspace linking dry-run: Pass
5. channel sync dry-run: Pass
6. production write guard: Pass
7. redaction: Pass
8. internal beta: Hold
9. production implementation: No-Go

請只新增 / 更新文件，不要改產品功能程式碼，不要改 OAuth flow，不要改 callback route，不要改登入按鈕，不要改 env，不要改 Prisma schema。

請建立 docs/meta-business-login-sandbox-internal-beta-go-no-go-review.md，內容包含：
1. App Review readiness
2. account selection UX evidence
3. callback evidence
4. workspace linking dry-run evidence
5. channel sync dry-run evidence
6. redaction evidence
7. production write guard evidence
8. rollback / fallback readiness
9. 是否可進 internal beta
10. 仍不可進 production implementation 的原因

完成後執行 git status、targeted tests、npm run lint、npm run build，commit 並 push master。
```
## 2026-06-16 - Meta Business Login Sandbox Internal Beta Go/No-Go Review

任務目標：

- 根據目前 Meta Business Login sandbox 文件與 SBL-13 dry-run evidence，建立 internal beta 前 go/no-go review。

修改內容：

- 新增 `docs/meta-business-login-sandbox-internal-beta-go-no-go-review.md`。
- 回填 `docs/fix-roadmap.md`。
- 回填 `docs/meta-business-login-sandbox-go-no-go-checklist.md`。
- 回填 `docs/meta-app-review-checklist.md`。

結論：

```text
Account selection UX: Pass
Consent screen: Pass
Redacted callback evidence: Pass
Workspace linking dry-run: Pass
Channel sync dry-run: Pass
Production write guard: Pass
Redaction: Pass
App Review readiness: Hold
Rollback / fallback readiness: Partial Pass
Internal beta: Hold
Production implementation: No-Go
```

下一步建議 Codex Prompt：

```text
請根據 docs/meta-business-login-sandbox-internal-beta-go-no-go-review.md，建立 Meta Business Login internal beta access / rollback runbook。

請只新增 / 更新文件，不要改產品功能程式碼，不要改 OAuth flow，不要改 callback route，不要改登入按鈕，不要改 env，不要改 Prisma schema。

檔案路徑：
docs/meta-business-login-sandbox-internal-beta-access-rollback-runbook.md

內容需包含：
1. internal-only beta entry point 條件
2. workspace allowlist 條件
3. 使用者 / admin 權限條件
4. redaction 搜尋流程
5. production write guard 監控項目
6. token exchange 不得發生的檢查項
7. fallback 到既有 Instagram OAuth flow 的方式
8. rollback / disable beta 的步驟
9. internal beta 可以開始前的最終 checklist
10. production implementation 仍不可開始的原因

完成後執行 git status、targeted tests、npm run lint、npm run build，commit 並 push master。
```
## 2026-06-16 - Meta Business Login Sandbox Internal Beta Access / Rollback Runbook

任務目標：

- 根據 internal beta go/no-go review，建立 internal beta access / rollback runbook。

修改內容：

- 新增 `docs/meta-business-login-sandbox-internal-beta-access-rollback-runbook.md`。
- 回填 `docs/fix-roadmap.md`。
- 回填 `docs/meta-business-login-sandbox-go-no-go-checklist.md`。
- 回填 `docs/meta-app-review-checklist.md`。

結論：

```text
Internal-only beta entry point: Hold
Workspace allowlist: Hold
User / admin permissions: Hold
Redaction search process: Partial Pass
Production write guard monitoring: Pass for dry-run
Token exchange prevention: Pass for dry-run / Hold for beta implementation
Fallback to existing Instagram OAuth: Pass
Rollback / disable beta: Partial Pass
Internal beta: Hold
Production implementation: No-Go
```

下一步建議 Codex Prompt：

```text
請根據 docs/meta-business-login-sandbox-internal-beta-access-rollback-runbook.md 與 docs/meta-business-login-app-review-demo-script.md，建立 Meta Business Login final App Review demo package checklist。

請只新增 / 更新文件，不要改產品功能程式碼，不要改 OAuth flow，不要改 callback route，不要改登入按鈕，不要改 env，不要改 Prisma schema。

檔案路徑：
docs/meta-business-login-final-app-review-demo-package-checklist.md

內容需包含：
1. reviewer demo recording checklist
2. permission usage proof checklist
3. Business / Page / IG test asset checklist
4. account selection UX evidence checklist
5. redacted callback evidence checklist
6. workspace linking / channel sync dry-run evidence checklist
7. redaction search checklist
8. rollback / fallback evidence checklist
9. internal beta 是否可解除 Hold 的條件
10. production implementation 仍不可開始的原因

完成後執行 git status、targeted tests、npm run lint、npm run build，commit 並 push master。
```
## 2026-06-16 - Meta Business Login Final App Review Demo Package Checklist

任務目標：

- 根據 internal beta access / rollback runbook 與 App Review demo script，建立 final App Review demo package checklist。

修改內容：

- 新增 `docs/meta-business-login-final-app-review-demo-package-checklist.md`。
- 回填 `docs/fix-roadmap.md`。
- 回填 `docs/meta-business-login-sandbox-go-no-go-checklist.md`。
- 回填 `docs/meta-app-review-checklist.md`。

結論：

```text
Final App Review demo package: Hold
Reviewer demo recording: Hold
Permission usage proof: Hold
Business / Page / IG test assets: Hold
Account selection UX evidence: Pass
Redacted callback evidence: Pass
Workspace linking / channel sync dry-run evidence: Pass
Redaction search against final package: Hold
Rollback / fallback evidence: Partial Pass
Internal beta: Hold
Production implementation: No-Go
```

## 2026-06-16 - Daily AI model refresh automation

Task goal:

- Run `npm run ai-models:refresh` and report refreshed provider counts or failures.

Files changed:

- `docs/codex-session-log.md`
- `docs/fix-roadmap.md`

Validation:

```text
npm run ai-models:refresh
Result: passed
Refreshed per workspace: chatgpt=10, gemini=7, deepseek=2, xai=2
codex_cli / antigravity_cli: skipped by canUseAiProvider() because AI_ENABLE_LOCAL_CLI is unset and local CLI mode is disabled outside explicit opt-in.
```

Launch impact:

- No launch-state change.

New risks:

- No new product risk found.
- Local CLI model caches will remain stale until `AI_ENABLE_LOCAL_CLI` is explicitly enabled for refresh runs.

Next suggested Codex prompt:

```text
請檢查本機 CLI 模型供應商刷新策略，評估是否要讓 codex_cli / antigravity_cli 在 automation 環境也能顯式刷新，並補上對應文件與測試。
```

下一步建議 Codex Prompt：

```text
請根據 docs/meta-business-login-final-app-review-demo-package-checklist.md，建立 Meta Business Login final permission usage proof matrix。

請只新增 / 更新文件，不要改產品功能程式碼，不要改 OAuth flow，不要改 callback route，不要改登入按鈕，不要改 env，不要改 Prisma schema。

檔案路徑：
docs/meta-business-login-final-permission-usage-proof-matrix.md

內容需包含：
1. 每個目前請求或候選 permission / scope
2. 對應產品畫面
3. 使用者操作
4. 讀取資料
5. 寫入資料
6. 儲存資料
7. retention / deletion 說明
8. reviewer demo proof
9. 是否已具備證據
10. 若證據不足，建議移除、延後或補證據

完成後執行 git status、targeted tests、npm run lint、npm run build，commit 並 push master。
```
## 2026-06-17 - Daily AI model refresh automation

Task goal:

- Run `npm run ai-models:refresh` and report refreshed provider counts or failures.

Files changed:

- `docs/codex-session-log.md`
- `docs/fix-roadmap.md`

Validation:

```text
npm run ai-models:refresh
Result: passed
Refreshed across 6 workspaces: chatgpt=10, gemini=7, deepseek=2, xai=2
codex_cli / antigravity_cli: not present in refresh payload; current provider gating still skips local CLI providers when AI_ENABLE_LOCAL_CLI is unset.
```

Launch impact:

- No launch-state change.

New risks:

- No new product risk found.
- Local CLI model caches remain stale in the daily automation environment until `AI_ENABLE_LOCAL_CLI` is explicitly enabled.

Next suggested Codex prompt:

```text
請檢查 AI 模型刷新流程，確認是否要讓每日 automation 顯式啟用 `AI_ENABLE_LOCAL_CLI`，並補上對 `codex_cli` / `antigravity_cli` 的刷新紀錄、測試與文件。
```
## 2026-06-18 - Daily AI model refresh automation

Task goal:

- Run `npm run ai-models:refresh` and report refreshed provider counts or failures.

Files changed:

- `docs/codex-session-log.md`
- `docs/fix-roadmap.md`

Validation:

```text
npm run ai-models:refresh
Result: passed
Refreshed across 6 workspaces: chatgpt=10, gemini=7, deepseek=2, xai=2
codex_cli / antigravity_cli: not refreshed, not failed. `refreshAllAiModels()` skips local CLI providers because `AI_ENABLE_LOCAL_CLI` is unset and `canUseAiProvider()` only enables them for explicit opt-in or local development.
```

Launch impact:

- No launch-state change.

New risks:

- No new product risk found.
- Local CLI model caches remain stale in the daily automation environment until `AI_ENABLE_LOCAL_CLI` is explicitly enabled.

Next suggested Codex prompt:

```text
檢查 AI 模型刷新 automation 是否要顯式開啟 `AI_ENABLE_LOCAL_CLI`，並補一份文件說明 `codex_cli` / `antigravity_cli` 在 daily refresh 中目前為何被略過。
```

## 2026-06-19 - Daily AI model refresh automation

Task goal:

- Run `npm run ai-models:refresh` and report refreshed provider counts or failures.

Files changed:

- `docs/codex-session-log.md`
- `docs/fix-roadmap.md`

Validation:

```text
npm run ai-models:refresh
Result: passed
Refreshed across 6 workspaces: chatgpt=10, gemini=7, deepseek=2, xai=2
codex_cli / antigravity_cli: not refreshed, not failed. src/lib/ai/providers.ts keeps local CLI providers behind canUseAiProvider(), and AI_ENABLE_LOCAL_CLI is unset in this automation environment.
```

Launch impact:

- No launch-state change.

New risks:

- No new product risk found.
- Local CLI model caches remain stale in the daily automation environment until `AI_ENABLE_LOCAL_CLI` is explicitly enabled.

Next suggested Codex prompt:

```text
檢查 AI 模�??�新 automation ?�否要顯式�???`AI_ENABLE_LOCAL_CLI=true`，並補�?`codex_cli` / `antigravity_cli` ??daily refresh ?�用?��?要�?路�?何被?��???```

## 2026-06-19 - Fixed Staging Alias And Vercel Release Env Split

Task goal:

- Configure a fixed staging URL for the full planned release.
- Keep production on the simple release.
- Keep staging / preview on the full release.
- Do not split DB yet.
- Add environment variable documentation and deployment documentation.

Vercel changes:

```text
npx vercel alias set inboxpilot-ap79iimgd-a25814740s-projects.vercel.app staging.carry-digital-nomad.in.net
Result: passed

npx vercel env add INBOXPILOT_RELEASE_CHANNEL production --value simple --yes --force --no-sensitive
Result: passed

npx vercel env add INBOXPILOT_RELEASE_CHANNEL preview --value full --yes --force --no-sensitive
Result: passed

npx vercel inspect https://staging.carry-digital-nomad.in.net
Result: resolved to Preview deployment inboxpilot-ap79iimgd-a25814740s-projects.vercel.app
```

Current URLs:

```text
Production: https://inboxpilot.carry-digital-nomad.in.net
Staging: https://staging.carry-digital-nomad.in.net
Backing Preview deployment: https://inboxpilot-ap79iimgd-a25814740s-projects.vercel.app
```

Files changed:

- `.env.example`
- `docs/deployment.md`
- `docs/environment-variables.md`
- `docs/project-launch-checklist.md`
- `docs/product-readiness-review.md`
- `docs/security-review.md`
- `docs/fix-roadmap.md`
- `docs/codex-session-log.md`

Important note:

- `staging.carry-digital-nomad.in.net` is currently a Vercel alias to the current Preview deployment.
- Future Preview deployments will need either branch-domain automation or a post-deploy `vercel alias set` step to keep this custom staging URL always current.
- Production / staging DB remains shared temporarily and must be separated before real customer onboarding.
- No DB schema, Prisma migration, OAuth callback, webhook, token storage, billing, affiliate payout, or deployment was changed.

Validation:

```text
npx vercel alias list
Result: staging.carry-digital-nomad.in.net appears under inboxpilot-ap79iimgd-a25814740s-projects.vercel.app

git diff --check
Result: passed with Windows line-ending warnings only
```

Next suggested Codex Prompt:

```text
請幫我新增 staging alias 自動更新流程：每次 staging branch 或 preview 部署完成後，自動把 staging.carry-digital-nomad.in.net 指到最新 Preview deployment；先不要拆 DB。
```

## 2026-06-19 - AI local CLI refresh policy clarification

Task goal:

- Decide whether the daily AI model refresh automation should enable `AI_ENABLE_LOCAL_CLI=true`.
- If not, document `codex_cli` and `antigravity_cli` as explicit opt-in providers.

Files changed:

- `.env.example`
- `README.md`
- `docs/environment-variables.md`
- `docs/deployment.md`
- `tests/ai-providers.test.ts`
- `docs/fix-roadmap.md`
- `docs/codex-session-log.md`

Decision:

- Keep `AI_ENABLE_LOCAL_CLI` disabled by default in shared SaaS / cron environments.
- `codex_cli` and `antigravity_cli` remain opt-in only.

Reason:

- Shared automation should not rely on machine-local CLI install state, login state, or local cache files.
- The stable daily refresh path should remain API-backed providers only.

Validation:

```text
npx vitest run tests/ai-providers.test.ts
Result: failed due existing database credential problem in the local test environment:
Authentication failed against database server for postgres.

npm run lint
Result: passed

npm run build
Result: passed
Existing Prisma Windows DLL lock fallback message appeared after build and reused the generated client.

npm test
Result: timed out after 244 seconds
```

Next suggested Codex prompt:

```text
���ˬd AI provider ������Ҫ� TEST_DATABASE_URL / TEST_DIRECT_URL �O�_���T�A�צn�᭫�] tests/ai-providers.test.ts �P npm test�A�T�{ local CLI opt-in �W�h���^�k���զ������q�L�C
```
## 2026-06-20 - Daily AI model refresh automation

Task goal:

- Run `npm run ai-models:refresh` in the project workspace.
- Report refreshed model counts for ChatGPT, Gemini, DeepSeek, XAI, Codex CLI, and Antigravity CLI.
- Distinguish provider failures from intentionally skipped local CLI providers.

Files changed:

- `docs/codex-session-log.md`
- `docs/fix-roadmap.md`

Implementation notes:

- Ran `npm run ai-models:refresh` from the workspace root.
- The refresh output covered 6 workspaces and returned the same counts for each workspace: `chatgpt=10`, `gemini=7`, `deepseek=2`, `xai=2`.
- `codex_cli` and `antigravity_cli` did not appear in the refresh result because `refreshAllAiModels()` skips providers that fail `canUseAiProvider()`.
- `canUseAiProvider()` only enables local CLI providers when `AI_ENABLE_LOCAL_CLI` is explicitly truthy, or when running local development outside Vercel.
- No provider failed during this run.

Validation:

```text
npm run ai-models:refresh
Result: passed.

Workspace refresh counts:
- segment-broadcast-workspace: chatgpt=10, gemini=7, deepseek=2, xai=2
- default-workspace: chatgpt=10, gemini=7, deepseek=2, xai=2
- cmpzdo1na0001vd6c5yaug9nr: chatgpt=10, gemini=7, deepseek=2, xai=2
- cmpzl2a740001jm04s74lyk0c: chatgpt=10, gemini=7, deepseek=2, xai=2
- cmpzn5vki0001kw04q4j3c72q: chatgpt=10, gemini=7, deepseek=2, xai=2
- cmq5xef4z0001vdgk22tqg4bz: chatgpt=10, gemini=7, deepseek=2, xai=2
```

Launch impact:

- No launch-state change. This was an operational cache refresh only.

New risks:

- No new product risk.
- Local CLI provider caches remain stale in shared automation unless `AI_ENABLE_LOCAL_CLI=true` is enabled in a runtime that also guarantees CLI installation and authentication.

Next suggested Codex Prompt:

```text
���ˬd `scripts/refresh-ai-models.ts` �P `src/lib/ai/providers.ts`�A���ڧ� daily AI model refresh ����X�榡�令����T�G
1. ���\ provider ��ܼҫ��ƶq
2. skipped provider ��ܭ�]
3. failed provider ��ܿ��~�K�n

����G
- ����J�� provider schema
- ���}�a cron route �P API route �^�Ǯ榡
- �ɤW�����椸����
```

## 2026-06-21 - Daily AI model refresh automation

Task goal:

- Run `npm run ai-models:refresh` in the project workspace.
- Report refreshed model counts for ChatGPT, Gemini, DeepSeek, XAI, Codex CLI, and Antigravity CLI.
- Distinguish provider failures from intentionally skipped local CLI providers.

Files changed:

- `docs/codex-session-log.md`
- `docs/fix-roadmap.md`

Implementation notes:

- Ran `npm run ai-models:refresh` from the workspace root.
- The refresh output covered 6 workspaces and returned the same counts for each workspace: `chatgpt=10`, `gemini=7`, `deepseek=2`, `xai=2`.
- No provider failures were reported by the refresh script in this run.
- `codex_cli` and `antigravity_cli` did not appear in the refresh result because `refreshAllAiModels()` only includes providers that pass `canUseAiProvider()`.
- In the current automation environment, `AI_ENABLE_LOCAL_CLI` is unset, so `isLocalAiCliEnabled()` keeps local CLI providers disabled outside explicit opt-in local development.

Validation:

```text
npm run ai-models:refresh
Result: passed.

Workspace refresh counts:
- segment-broadcast-workspace: chatgpt=10, gemini=7, deepseek=2, xai=2
- default-workspace: chatgpt=10, gemini=7, deepseek=2, xai=2
- cmpzdo1na0001vd6c5yaug9nr: chatgpt=10, gemini=7, deepseek=2, xai=2
- cmpzl2a740001jm04s74lyk0c: chatgpt=10, gemini=7, deepseek=2, xai=2
- cmpzn5vki0001kw04q4j3c72q: chatgpt=10, gemini=7, deepseek=2, xai=2
- cmq5xef4z0001vdgk22tqg4bz: chatgpt=10, gemini=7, deepseek=2, xai=2
```

Launch impact:

- No launch-state change. This was an operational cache refresh only.

New risks:

- No new product risk.
- Local CLI provider caches remain stale in shared automation unless `AI_ENABLE_LOCAL_CLI=true` is enabled in a runtime that also guarantees CLI installation and authentication.

Next suggested Codex Prompt:

```text
���ˬd `scripts/refresh-ai-models.ts` �P `src/lib/ai/providers.ts`�A���ڧ� daily AI model refresh ����X�榡�令����T�G
1. ���\ provider ��ܼҫ��ƶq
2. skipped provider ��ܭ�]
3. failed provider ��ܿ��~�K�n

����G
- ����J�� provider schema
- ���}�a cron route �P API route �^�Ǯ榡
- �ɤW�����椸����
```
## 2026-06-22 - Daily AI model refresh automation

Task goal:

- Run `npm run ai-models:refresh` in the project workspace.
- Report refreshed model counts for ChatGPT, Gemini, DeepSeek, XAI, Codex CLI, and Antigravity CLI.
- Distinguish provider failures from intentionally skipped local CLI providers.

Files changed:

- `docs/codex-session-log.md`
- `docs/fix-roadmap.md`

Implementation notes:

- Ran `npm run ai-models:refresh` from the workspace root.
- The refresh output covered 6 workspaces and returned the same counts for each workspace: `chatgpt=10`, `gemini=7`, `deepseek=2`, `xai=2`.
- No provider failures were reported by the refresh script in this run.
- `codex_cli` and `antigravity_cli` did not appear in the refresh result because local CLI providers are gated by `canUseAiProvider()`.
- `src/lib/ai/providers.ts` keeps CLI providers disabled unless `AI_ENABLE_LOCAL_CLI` is explicitly enabled, or the app is running local development outside Vercel.

Validation:

```text
npm run ai-models:refresh
Result: passed.

Workspace refresh counts:
- segment-broadcast-workspace: chatgpt=10, gemini=7, deepseek=2, xai=2
- default-workspace: chatgpt=10, gemini=7, deepseek=2, xai=2
- cmpzdo1na0001vd6c5yaug9nr: chatgpt=10, gemini=7, deepseek=2, xai=2
- cmpzl2a740001jm04s74lyk0c: chatgpt=10, gemini=7, deepseek=2, xai=2
- cmpzn5vki0001kw04q4j3c72q: chatgpt=10, gemini=7, deepseek=2, xai=2
- cmq5xef4z0001vdgk22tqg4bz: chatgpt=10, gemini=7, deepseek=2, xai=2
```

Launch impact:

- No launch-state change. This was an operational cache refresh only.

New risks:

- No new product risk.
- Local CLI provider caches remain stale in shared automation unless `AI_ENABLE_LOCAL_CLI=true` is enabled in a runtime that also guarantees CLI installation and authentication.

Next suggested Codex Prompt:

```text
請檢查 `scripts/refresh-ai-models.ts` 與 `src/app/api/ai-models/refresh/route.ts`，幫我把 daily AI model refresh 的輸出再整理清楚一點：
1. 成功 provider 顯示模型數量
2. skipped provider 顯示原因
3. failed provider 顯示錯誤摘要
4. local CLI provider 若被 gating 跳過，也要明確列出原因

限制：
- 不改既有 provider schema
- 不破壞 cron route 與 API route 回傳格式
- 補上對應單元測試
```
## 2026-06-23 - Daily AI model refresh automation

Task goal:

- Run `npm run ai-models:refresh` in the project workspace.
- Report refreshed model counts for ChatGPT, Gemini, DeepSeek, XAI, Codex CLI, and Antigravity CLI.
- Distinguish provider failures from intentionally skipped local CLI providers.

Files changed:

- `docs/codex-session-log.md`
- `docs/fix-roadmap.md`

Implementation notes:

- Ran `npm run ai-models:refresh` from the workspace root.
- The refresh output covered 6 workspaces and returned the same counts for each workspace: `chatgpt=10`, `gemini=7`, `deepseek=2`, `xai=2`.
- No provider failures were reported by the refresh script in this run.
- `codex_cli` and `antigravity_cli` did not appear in the refresh result, which matches the current provider gating behavior for local CLI providers when `AI_ENABLE_LOCAL_CLI` is unset.

Validation:

```text
npm run ai-models:refresh
Result: passed.

Workspace refresh counts:
- segment-broadcast-workspace: chatgpt=10, gemini=7, deepseek=2, xai=2
- default-workspace: chatgpt=10, gemini=7, deepseek=2, xai=2
- cmpzdo1na0001vd6c5yaug9nr: chatgpt=10, gemini=7, deepseek=2, xai=2
- cmpzl2a740001jm04s74lyk0c: chatgpt=10, gemini=7, deepseek=2, xai=2
- cmpzn5vki0001kw04q4j3c72q: chatgpt=10, gemini=7, deepseek=2, xai=2
- cmq5xef4z0001vdgk22tqg4bz: chatgpt=10, gemini=7, deepseek=2, xai=2
```

Launch impact:

- No launch-state change. This was an operational cache refresh only.

New risks:

- No new product risk.
- Local CLI provider caches remain stale in shared automation unless `AI_ENABLE_LOCAL_CLI=true` is enabled in a runtime that also guarantees CLI installation and authentication.

Next suggested Codex Prompt:

```text
請檢查 `scripts/refresh-ai-models.ts` 與 `src/lib/ai/providers.ts`，把 daily AI model refresh 的輸出整理成固定結構：
1. 成功 provider 的模型數量
2. skipped provider 的原因
3. failed provider 的錯誤摘要

限制：
- 不要改現有 provider schema
- 不要破壞 cron route 或 API route 呼叫格式
- 補最小範圍測試
```
## 2026-06-24 - Daily AI model refresh automation

Task goal:

- Run `npm run ai-models:refresh` in the project workspace.
- Report refreshed model counts for ChatGPT, Gemini, DeepSeek, XAI, Codex CLI, and Antigravity CLI.
- Distinguish provider failures from intentionally skipped local CLI providers.

Files changed:

- `docs/codex-session-log.md`
- `docs/fix-roadmap.md`

Implementation notes:

- Ran `npm run ai-models:refresh` from the workspace root.
- The refresh output covered 6 workspaces and returned the same counts for each workspace: `chatgpt=10`, `gemini=7`, `deepseek=2`, `xai=2`.
- No provider failures were reported by the refresh script in this run.
- `codex_cli` and `antigravity_cli` did not appear in the refresh result, matching the current local CLI opt-in behavior while `AI_ENABLE_LOCAL_CLI` is unset.

Validation:

```text
npm run ai-models:refresh
Result: passed.

Workspace refresh counts:
- segment-broadcast-workspace: chatgpt=10, gemini=7, deepseek=2, xai=2
- default-workspace: chatgpt=10, gemini=7, deepseek=2, xai=2
- cmpzdo1na0001vd6c5yaug9nr: chatgpt=10, gemini=7, deepseek=2, xai=2
- cmpzl2a740001jm04s74lyk0c: chatgpt=10, gemini=7, deepseek=2, xai=2
- cmpzn5vki0001kw04q4j3c72q: chatgpt=10, gemini=7, deepseek=2, xai=2
- cmq5xef4z0001vdgk22tqg4bz: chatgpt=10, gemini=7, deepseek=2, xai=2
```

Launch impact:

- No launch-state change. This was an operational cache refresh only.

New risks:

- No new product risk.
- Local CLI provider caches remain stale in shared automation unless `AI_ENABLE_LOCAL_CLI=true` is enabled in a runtime that also guarantees CLI installation and authentication.

Next suggested Codex Prompt:

```text
請檢查 `scripts/refresh-ai-models.ts` 與 `src/lib/ai/providers.ts`，把 daily AI model refresh 的輸出整理成固定結構：
1. 成功 provider 的模型數量
2. skipped provider 的原因
3. failed provider 的錯誤摘要
4. local CLI provider 若被 gating 跳過，也要明確列出原因

限制：
- 不改現有 provider schema
- 不破壞 cron route 或 API route 呼叫格式
- 補最小範圍測試
```

## 2026-06-26 - Public paid launch control room

Task goal:

- Continue launch readiness work without asking for additional confirmation.
- Merge the already-prepared launch package state into a final launch control room.
- Keep the task limited to documentation and read-only verification.
- Do not submit Meta App Review, enable PayUNI live charging, run production checkout, touch DB, or print secrets.

Files changed:

- `docs/public-paid-launch-control-room.md`
- `docs/project-launch-checklist.md`
- `docs/product-readiness-review.md`
- `docs/fix-roadmap.md`
- `docs/codex-session-log.md`

Implementation notes:

- Created a clean worktree from `origin/master` to avoid mixing unrelated dirty files from the main workspace.
- Added a single launch control room that links Meta App Review, PayUNI go-live, production/staging health, alias isolation, and final Go/Hold rules.
- Recorded that Codex-direct launch gates are complete enough for private beta / whitelist usage.
- Kept public paid launch on Hold because Meta App Review and PayUNI production operations require external approval and manual operator action.

Validation:

```text
PR #5
Result: merged into master.

Master CI
Result: passed after merge; lint, test, and build completed successfully.

npm ci
Result: passed. npm audit reports existing findings: 2 low, 3 moderate, 1 high.

npm run lint
Result: passed.

npm run build
Result: passed.

npx vitest run tests/meta-channel-config.test.ts tests/billing-checkout-route.test.ts --reporter=dot
Result: passed. 2 test files passed, 5 tests passed.

npm test
Result: blocked in the clean worktree because DATABASE_URL or TEST_DATABASE_URL is required. Production DB was not used for tests.

Production health
Result: status=ok, database.ok=true, redis.ok=true.

Staging health
Result: status=ok, dbEnv=staging, releaseChannel=full, vercelEnv=preview.
```

Launch impact:

- Launch state is clearer and more actionable.
- Private beta / whitelist remains Go.
- Public paid launch remains Hold until Meta approval and PayUNI live-payment gates are completed.

New risks:

- No new runtime, DB, deployment, or secret risk.
- The remaining risk is operational: public launch must not proceed until the external approval/payment gates are manually completed and recorded.

Next suggested Codex Prompt:

```text
請幫我依照 docs/public-paid-launch-control-room.md 跑一次最後 30 分鐘 pre-launch 只讀檢查：Production/Staging health、alias、latest CI、Vercel deployments、Meta/PayUNI 文件完整性；不要送審、不要刷卡、不要碰 DB。
```

## 2026-06-26 - Meta App Review operator submission workbook

Task goal:

- Prepare a human operator package for Meta App Review submission.
- Base it on `docs/public-paid-launch-control-room.md`, `docs/meta-app-review-submission-package.md`, and `docs/meta-reviewer-recording-shot-list.md`.
- Do not log in to Meta Dashboard, submit review, or output secrets.

Files changed:

- `docs/meta-app-review-operator-submission-workbook.md`
- `docs/meta-app-review-checklist.md`
- `docs/project-launch-checklist.md`
- `docs/fix-roadmap.md`
- `docs/codex-session-log.md`

Implementation notes:

- Added a single operator-facing workbook for the real manual Meta App Review preparation flow.
- The workbook covers safe working folder structure, reviewer-safe asset prep, recording order, screenshot list, Meta Dashboard field checklist, permission evidence mapping, safe submission text, redaction review, upload manifest, and Go / Hold rules.
- The workbook explicitly excludes Meta Dashboard login, upload, submission, secrets, raw OAuth values, and real customer data.

Validation:

```text
Read source docs
Result: public launch control room, submission package, recording shot list, screenshot redaction checklist, and reviewer asset handoff checklist reviewed.

Scope
Result: documentation-only; no Meta login, no App Review submission, no DB command, no payment action, and no secret output.

npm run lint
Result: passed.

npm run build
Result: passed.

npm test
Result: blocked in the clean worktree because DATABASE_URL or TEST_DATABASE_URL is required. Production DB was not used for tests.
```

Launch impact:

- Meta App Review preparation is more executable for a human operator.
- Public paid launch remains Hold until Meta approval is actually submitted and granted.

New risks:

- No new runtime risk.
- Operational risk remains: real reviewer credentials and artifacts must be handled outside git/docs through secure handoff and redaction review.

Next suggested Codex Prompt:

```text
請幫我把 Meta App Review operator workbook 做成乾淨 PR，跑 lint/build/docs checks，PR 建好後不要登入 Meta、不要送審、不要碰 DB。
```

## 2026-06-26 - Meta App Review day-of recording run card

Task goal:

- Create a concise day-of operating card for Meta App Review recording and submission preparation.
- Split the card into recording prep, during recording, screenshots, Dashboard fill checklist, and pre-submit check.
- Do not log in to Meta Dashboard, submit review, touch DB, or output secrets.

Files changed:

- `docs/meta-app-review-day-of-recording-run-card.md`
- `docs/meta-app-review-checklist.md`
- `docs/project-launch-checklist.md`
- `docs/fix-roadmap.md`
- `docs/codex-session-log.md`

Implementation notes:

- Added a short operator run card distilled from `docs/meta-app-review-operator-submission-workbook.md`.
- The card includes the exact recording sequence, screenshot filenames, Dashboard field checklist, permission evidence mapping, redaction search, and Go / Hold rules.
- The card repeats the hard boundaries against credentials, raw OAuth callback values, env screens, dashboard secrets, and real customer data.

Validation:

```text
Read source docs
Result: meta operator workbook and Meta App Review checklist reviewed.

Scope
Result: documentation-only; no Meta login, no App Review submission, no DB command, no payment action, and no secret output.

npm run lint
Result: passed.

npm run build
Result: passed.

npm test
Result: blocked in the clean worktree because DATABASE_URL or TEST_DATABASE_URL is required. Production DB was not used for tests.
```

Launch impact:

- Human Meta review prep is easier to execute on recording day.
- Public paid launch remains Hold until Meta approval and PayUNI production gates are completed.

New risks:

- No new runtime risk.
- Real artifacts still require secure external handling and manual redaction review.

Next suggested Codex Prompt:

```text
請幫我把 Meta App Review day-of recording run card 做成乾淨 PR，跑 lint/build/docs checks，PR 建好後不要登入 Meta、不要送審、不要碰 DB。
```
