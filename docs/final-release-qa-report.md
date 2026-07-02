# InboxPilot final release QA report

Date: 2026-07-02
Branch: `final-release-qa-fix`

## Scope

This QA pass verifies launch readiness from a product acceptance angle: route inventory, API/integration surface, visible-but-unusable UI, destructive-action UX, security-sensitive boundaries, and local validation.

Out of scope by instruction:

- Production DB mutation
- Production deployment
- Prisma migrate deploy / db push to production
- Meta App Review submission
- PayUNI production switch or live transaction
- Secret output

## Stack summary

| Layer | Current stack |
| --- | --- |
| App | Next.js App Router, React 19, TypeScript |
| DB | Prisma + Supabase Postgres |
| Auth | App-owned login/session flow |
| UI | Tailwind-style utility classes, lucide-react, selected local design skills |
| Charts | Recharts |
| Testing | Vitest, Playwright, ESLint, Next build |
| Integrations | Meta / Instagram OAuth + webhooks, PayUNI Sandbox, Vercel |

## Findings

| Severity | Count | Summary |
| --- | ---: | --- |
| P0 | 0 | No production data-loss, secret exposure, or payment-production mutation issue found in this pass. |
| P1 | 1 | Destructive user/admin actions still used native browser confirmation in several user-facing controls. Fixed in this branch. |
| P2 | 4 | Remaining manual gates: full browser QA across all routes, PayUNI Sandbox end-to-end payment simulation, Meta reviewer recording, and React Flow style warning follow-up. |
| P3 | 3 | Future polish: broader settings IA consolidation, richer analytics visuals, optional soft-delete/undo design. |

## Fixed in this branch

- Channel disconnect now uses an in-app confirmation dialog with clearer warning copy.
- Admin invoice refund / referral credit clawback now uses an in-app confirmation dialog and explicitly states PayUNI is not called automatically.
- Shared JSON CRUD delete now uses an in-app confirmation dialog instead of native `confirm()`.
- Sequence delete now uses an in-app confirmation dialog and explains when to use disable instead of delete.
- Source regression tests now guard these flows against returning to native `confirm()`.

## Validation status

| Command | Result |
| --- | --- |
| `npx vitest run tests/channel-client-feedback.test.ts tests/admin-invoices-page.test.ts tests/sequences-form-state.test.ts --reporter=dot` | Passed |
| `npx eslint src/components/DisconnectChannelButton.tsx src/components/AdminInvoiceRefundButton.tsx src/components/JsonCrudClient.tsx src/components/SequencesClient.tsx tests/channel-client-feedback.test.ts tests/admin-invoices-page.test.ts tests/sequences-form-state.test.ts` | Passed |
| `npm run lint` | Passed |
| `npm run build` | Passed |
| `npm test` | Passed. Windows Vitest batch `3221225477` appeared once and the project runner reran the affected files individually; all affected files passed. |
| `npm run e2e:admin:ensure` | Passed |
| `npm run test:e2e:auth` | Passed after refreshing local E2E admin fixtures. Final result: 27 passed, 1 skipped. |
| `npm run test:e2e:inbox` | Passed. Final result: 2 passed. |
| `npm run test:e2e:contacts` | Passed. Final result: 8 passed. |
| `npm run test:e2e:simple` | Skipped by current simple-release smoke guard in this local environment; not counted as passed. |

## Runtime notes

- The first `npm run test:e2e:auth` attempt reused an old local Next dev server on port 3041, causing a false landing-route failure. After stopping the stale server, Playwright started the current branch and the public route passed.
- After `npm test`, the local E2E admin fixture had to be refreshed with `npm run e2e:admin:ensure`; otherwise auth smoke returned HTTP 401. This is a local test-order dependency, not a production issue.
- Auth smoke still logs a React Flow style warning on the Automations route even after moving the CSS import to the root layout. The UI smoke passes, but this should remain a P2 follow-up for the automation editor polish pass.
- Browser hydration mismatch messages reference `cz-shortcut-listen`, which is consistent with a local browser extension attribute and not app-rendered markup.

## Go / No-Go

Current recommendation: **Conditional Go for preview/staging QA**, **Hold for public paid launch** until the remaining manual gates are completed.

Reasons to hold public paid launch:

- PayUNI remains Sandbox-only by design.
- Meta App Review has not been submitted.
- Full manual browser QA should still be executed after this PR merges.

## Remaining manual gates

1. Run the manual QA script in `docs/manual-qa-script.md`.
2. Run PayUNI Sandbox card / ATM / convenience-code scenarios without switching production credentials.
3. Produce Meta App Review screenshots and reviewer recording without submitting until ready.
4. After merge, verify Production and Staging health only; do not redeploy Production unless separately approved.
