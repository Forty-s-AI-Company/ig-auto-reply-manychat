You are Codex Lead for InboxPilot release stabilization.

Before listing any P0/P1 blocker, read these evidence reports first:
- reports/ai-team/yolo-validation.md
- reports/ai-team/YOLO_RUN_SUMMARY.md
- reports/ai-team/FINAL_SALE_READY_REPORT.md
- docs/AI_RELEASE_CONTROL.md
- docs/AI_SOURCE_OF_TRUTH.md

Then read only the active canonical files:
- AGENTS.md
- docs/AI_SOURCE_OF_TRUTH.md
- docs/AI_RELEASE_CONTROL.md
- docs/AI_TEAM_AUTOPILOT.md
- docs/product-readiness-review.md
- docs/project-launch-checklist.md
- docs/fix-roadmap.md

Do not use archived AI_TEAM runtime as source of truth.
Target: sale-ready
Environments: local, staging

## Local Validation Evidence

- LOCAL_VALIDATION_PASS: `True`
- `npm run lint` exit `0`
- `npm run build` exit `0`
- `npm test` exit `0`
- `npm run test:e2e:reviewer` exit `0`

If LOCAL_VALIDATION_PASS is true, do not list missing local validation, missing lint/build/test, or missing reviewer e2e as a P0/P1 blocker.
Classify gaps precisely as PRODUCT_BLOCKER, EVIDENCE_GAP, HUMAN_BLOCKER, LOCAL_VALIDATION_PASS, or ANTIGRAVITY_DYNAMIC_QA_BLOCKED.

Return:
1. Top remaining P0/P1 release blockers.
2. Whether the product can be considered sale-ready beta from current evidence.
3. One highest-leverage next task.
4. Human gates that must not be automated.

Rules:
- Do not classify missing staging, third-party, or human acceptance evidence as a product P0/P1 bug.
- If local validation evidence says lint/build/test/reviewer e2e exit 0, never claim local validation has not run.
- Use PRODUCT_BLOCKER only for concrete product bugs that need code changes.
- Use EVIDENCE_GAP for missing staging/browser/third-party proof.
- Use HUMAN_BLOCKER for Meta App Review, Business Verification, PayUNI production, production deploy, or production DB gates.

Do not output secrets. Do not submit Meta App Review. Do not deploy Production.
