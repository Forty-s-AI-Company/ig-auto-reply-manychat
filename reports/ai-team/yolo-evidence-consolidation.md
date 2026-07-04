# YOLO Evidence Consolidation

- Generated: 2026-07-04 11:39:46
- Local validation evidence: `FAIL`
- External QA classification: `EXTERNAL_QA_LIMITED`
- Human blocker evidence present: `True`
- Environments requested: `local, staging`
- AI_TEAM_YOLO_STATUS=PRODUCT_FIX_REQUIRED

## Local Validation Commands

- `npm run lint` -> `0`
- `npm run build` -> `0`
- `npm test` -> `0`
- `npm run test:e2e:reviewer` -> `1`

## Classification Rules Applied

- Passing `yolo-validation.md` is treated as `LOCAL_VALIDATION_PASS`.
- Missing staging / third-party screenshots or reviewer-safe proof is `EVIDENCE_GAP`, not a product bug.
- Meta App Review, Business Verification, PayUNI production keys, production deploy, and production DB work are `HUMAN_BLOCKER` / `HUMAN_ACCEPTANCE_REQUIRED`.
- Antigravity sandbox or subprocess limitations are `EXTERNAL_QA_LIMITED` when local validation already passed.
