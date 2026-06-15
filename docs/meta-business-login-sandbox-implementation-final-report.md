# Meta Business Login Sandbox Implementation Final Report

Date: 2026-06-15  
Status: Sandbox coding complete, production implementation blocked  
Scope: Internal-only / dry-run-first / no-production-write Meta Business Login sandbox

## Summary

The sandbox-only Meta Business Login implementation scaffold is complete through SBL-01, SBL-03, SBL-04, SBL-05, SBL-06, SBL-07, SBL-08, and SBL-09.

This is not production implementation. The current implementation is an internal-only sandbox with dry-run responses, redacted evidence, workspace allowlist checks, state / nonce helpers, safe code exchange classification, and production write guards.

```text
Sandbox coding: Complete for internal dry-run scaffold
Internal beta: No-Go
Production implementation: No-Go
```

## Completed Tasks

| Task | Status | Evidence |
| --- | --- | --- |
| SBL-09 test scaffold | Complete | `tests/meta-business-login-sandbox-sbl09.test.ts` |
| SBL-01 internal route skeleton | Complete | `/api/internal/oauth/[provider]/authorize`, `/api/internal/oauth/[provider]/callback` |
| SBL-03 state / nonce helpers | Complete | `src/lib/meta-business-sandbox-state.ts` |
| SBL-04 code exchange safe stub | Complete | `src/lib/meta-business-sandbox-code-exchange.ts` |
| SBL-05 redacted logging helper | Complete | `src/lib/meta-business-sandbox-redaction.ts` |
| SBL-06 dry-run payload builder | Complete | `src/lib/meta-business-sandbox-dry-run.ts` |
| SBL-07 workspace allowlist guard | Complete | `src/lib/meta-business-sandbox-allowlist.ts` |
| SBL-08 production write guard | Complete | `src/lib/meta-business-sandbox-write-guard.ts` |
| SBL-10 runbook / report / go-no-go backfill | Complete | This report plus updated sandbox docs |
| Production isolation regression test | Complete | `tests/meta-business-login-sandbox-production-isolation.test.ts` |
| SBL-11 local evidence packet | Complete | `src/lib/meta-business-sandbox-evidence.ts`, `tests/meta-business-login-sandbox-sbl11-evidence-packet.test.ts` |
| External Meta evidence handoff | Hold | `docs/meta-business-login-sandbox-external-evidence-handoff.md` |

## Route Integration Update

The internal sandbox routes now use the sandbox helper chain:

- SBL-03 state / nonce helper for authorize dry-run state evidence.
- SBL-04 code exchange helper for callback dry-run exchange classification.
- SBL-06 dry-run payload builder for callback evidence.
- SBL-07 workspace allowlist guard, including query workspace spoofing rejection.
- SBL-08 production write guard for guarded operation evidence.

Route-level evidence:

```text
tests/meta-business-login-sandbox-sbl01-route.test.ts
```

The route integration remains internal-only and dry-run-first. It still does not redirect to Meta, exchange real codes, store tokens, or write production records.

## Validation

```text
npx vitest run tests/meta-business-login-sandbox-sbl06.test.ts tests/meta-business-login-sandbox-sbl07.test.ts tests/meta-business-login-sandbox-sbl08.test.ts tests/meta-business-login-sandbox-sbl05.test.ts tests/meta-business-login-sandbox-sbl04.test.ts tests/meta-business-login-sandbox-sbl03.test.ts tests/meta-business-login-sandbox-sbl01.test.ts tests/meta-business-login-sandbox-sbl01-route.test.ts tests/meta-business-login-sandbox-sbl09.test.ts
```

Result:

```text
9 test files passed
37 tests passed
```

Latest sandbox regression command:

```text
npx vitest run tests/meta-business-login-sandbox-production-isolation.test.ts tests/meta-business-login-sandbox-sbl01-route.test.ts tests/meta-business-login-sandbox-sbl01.test.ts tests/meta-business-login-sandbox-sbl03.test.ts tests/meta-business-login-sandbox-sbl04.test.ts tests/meta-business-login-sandbox-sbl05.test.ts tests/meta-business-login-sandbox-sbl06.test.ts tests/meta-business-login-sandbox-sbl07.test.ts tests/meta-business-login-sandbox-sbl08.test.ts tests/meta-business-login-sandbox-sbl09.test.ts
```

Result:

```text
10 test files passed
41 tests passed
```

SBL-11 local evidence packet validation:

```text
npx vitest run tests/meta-business-login-sandbox-sbl11-evidence-packet.test.ts
```

Result:

```text
1 test file passed
3 tests passed
```

Additional validation:

```text
npm run lint: passed
npm run build: passed with exit code 0
git diff --check: passed with Windows line ending warnings only
npm test: timed out after 244 seconds; targeted SBL tests passed and no targeted SBL failure was observed before timeout
```

Production isolation validation:

```text
npx vitest run tests/meta-business-login-sandbox-production-isolation.test.ts
```

Expected result:

```text
1 test file passed
4 tests passed
```

The existing local Prisma engine DLL lock fallback appeared during build and reused the generated client. It did not fail the build.

## Production Isolation

The sandbox implementation does not modify:

- Existing `meta-instagram` OAuth flow.
- Existing `meta-facebook` OAuth flow.
- Existing `/api/oauth/[provider]/authorize`.
- Existing `/api/oauth/[provider]/callback`.
- Existing `/api/meta/oauth/start`.
- Existing `/api/meta/oauth/callback`.
- Existing `/api/instagram/oauth/callback`.
- Login buttons.
- Env variables.
- Prisma schema.
- Production ConnectedAccount records.
- Production Channel records.
- Production webhook registration.
- Production token refresh jobs.

An automated production isolation regression test now checks:

- Existing production OAuth route files do not reference sandbox providers, sandbox helpers, or `/api/internal/oauth`.
- App and component UI source files do not expose `/api/internal/oauth`.
- `prisma/schema.prisma` does not include sandbox-specific Meta Business Login models or fields.
- Sandbox references stay limited to internal routes, sandbox helper modules, tests, and docs.

## Security Controls

Implemented sandbox controls:

- Production environment block for internal sandbox routes.
- Admin-only route access.
- Required `x-inboxpilot-sandbox: sbl-01` header.
- Sandbox provider id validation.
- Workspace allowlist guard.
- Query workspace spoofing rejection.
- State and nonce hash-only storage.
- State TTL and replay rejection.
- Provider / workspace / user binding.
- Code exchange skipped by default.
- Safe code exchange error classification.
- Token / code / secret / state / nonce / URL redaction.
- Business / Page / IG id masking.
- Production write guard for ConnectedAccount, Channel, webhook, sync, and token refresh operations.
- Local evidence packet validation that keeps raw code / state out of evidence and keeps production implementation at No-Go.

## App Review Status

App Review remains Not passed.

Missing evidence:

- Real Meta App Dashboard sandbox configuration.
- Real Facebook Login for Business dialog evidence.
- Real Instagram Business Login dialog evidence.
- Account selection UX evidence.
- Business / Page / IG account selection evidence.
- Redacted callback evidence from real Meta.
- Reviewer demo video.
- Permission usage evidence.
- Rollback evidence.

Browser evidence update:

```text
docs/meta-business-login-sandbox-browser-evidence-run-2026-06-15.md
```

The in-app Browser reached the Facebook login screen for Meta Developers but did not have an authenticated Meta session. No credentials, OTP, token, authorization code, app secret, raw state, raw nonce, callback URL, or browser storage were read or entered. External Meta dialog and account selection evidence remain missing.

Authenticated browser evidence update:

```text
docs/meta-business-login-sandbox-authenticated-browser-evidence-run-2026-06-15.md
```

After the browser was authenticated, InboxPilot App Dashboard evidence, Instagram API setup evidence, Instagram Business Login URL evidence, business login settings, permission status, and partial account selection UX evidence were captured. Callback evidence remains missing because the run stopped before selecting a profile and before final OAuth authorization.

## External Evidence Handoff Update

Chrome was opened to `https://developers.facebook.com/apps/` and reached the Meta Developers Apps page title `所有應用程式 - Meta for Developers`.

Automation could not inspect the page DOM because Chrome reported another extension UI was open on the page. This is not valid Meta evidence and does not change App Review status.

Handoff document:

```text
docs/meta-business-login-sandbox-external-evidence-handoff.md
```

## Go / No-Go

```text
Sandbox coding: Go / complete
SBL internal dry-run scaffold: Go / complete
Internal beta: No-Go
Production implementation: No-Go
```

Internal beta remains blocked until real sandbox execution evidence exists.

Production implementation remains blocked until App Review, account selection UX, callback security, workspace linking, channel sync, redaction, and rollback gates pass with real evidence.

## Next Required Phase

The next phase is not more scaffold coding. It is sandbox execution evidence collection:

- Configure Meta App Dashboard sandbox settings.
- Run the internal sandbox authorize / callback routes in a controlled workspace.
- Capture redacted Meta dialog UX evidence.
- Fill the runbook with real sandbox evidence.
- Fill the experiment report with real sandbox evidence.
- Re-evaluate the go/no-go checklist.
