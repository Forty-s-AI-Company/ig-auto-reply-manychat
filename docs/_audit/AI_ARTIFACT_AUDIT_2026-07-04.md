# AI Artifact Audit - 2026-07-04

## Summary

Discovery found `387` AI / release / QA / autopilot related artifacts.

| Decision | Count |
| --- | ---: |
| ARCHIVE | 218 |
| MERGE_INTO_NEW | 58 |
| REUSE_PART | 109 |
| REWRITE | 2 |

Detailed inventory:

- `.ai-team/ai_artifacts.detected.json`
- `reports/ai-team/01_AI_ARTIFACT_DISCOVERY.md`

## Answers Required By Phase 2

1. Current AI related files: 387 detected by path/content scan.
2. Historical reports / handoffs / runtime memory: mostly under `AI_TEAM/reports`, `AI_TEAM/runtime`, and root `reports/`.
3. Existing autopilot / automation scripts: old active runner lived under `AI_TEAM/scripts`; root `reports/` also contains historical Codex / QA / safety loop outputs.
4. Conflicts:
   - `README.md` pointed agents to old `AI_TEAM/README.md`.
   - `package.json` pointed `ai-team:*` scripts to old Node runners.
   - `AI_TEAM/tasks/queue.json` and `AI_TEAM/runtime/*` could be mistaken as active state.
   - Old reports contained outdated blockers and prior runner failures.
5. Old constraints binding AI:
   - Old queue/runtime state treated the runner itself as the main product.
   - Old prompt loops encouraged stopping at next prompt instead of source-of-truth release control.
   - Old reports contained warnings from historical failures that should not block current work without repro.
6. Reusable logic:
   - Product safety rules from old AI_TEAM docs.
   - Antigravity QA model preference.
   - Playwright / local QA command knowledge.
   - Production guard and PayUNI Sandbox guard.
7. Scripts to archive:
   - All `AI_TEAM/scripts/*` tracked runner scripts.
   - The untracked `AI_TEAM/scripts/qa-staging.js` was moved into automation archive as historical staging QA helper.
8. Minimal source of truth:
   - `AGENTS.md`
   - `docs/AI_SOURCE_OF_TRUTH.md`
   - `docs/AI_RELEASE_CONTROL.md`
   - `docs/AI_TEAM_AUTOPILOT.md`
9. Unique autopilot entry:
   - `scripts/ai_release_autopilot.py`
10. Mapping:
   - See table below.

## Legacy Constraint Audit

| Constraint found in old material | Decision | Replacement |
| --- | --- | --- |
| Stop after producing next prompt | DEPRECATED | Autopilot can continue when explicitly invoked; reports are not stop points. |
| Old `AI_TEAM/tasks/queue.json` is active truth | DEPRECATED | Use `docs/AI_RELEASE_CONTROL.md`; runtime queue is generated state only. |
| Old Node runner is canonical | DEPRECATED | Use `scripts/ai_release_autopilot.py`. |
| Production deploy can happen inside normal loop | ACTIVE as block | Production deploy requires explicit human task. |
| PayUNI production can be switched by automation | ACTIVE as block | PayUNI remains Sandbox until explicit production go-live approval. |
| Meta App Review may be prepared by docs | ACTIVE | Preparation is allowed. |
| Meta App Review submit may be automated | ACTIVE as block | Submission requires explicit human approval. |
| Production DB mutation is allowed in unattended mode | ACTIVE as block | Never mutate production DB without explicit task and backup/target proof. |

## Old Path Mapping

| Old path | Type | Decision | New location / replacement | Reason |
|---|---|---|---|---|
| `AGENTS.md` | Entry doc | REWRITE | `AGENTS.md` | Reduced to compact canonical entry. |
| `README.md` | Project doc | REWRITE | `README.md` + canonical docs | Remove old AI_TEAM-as-control-plane references. |
| `AI_TEAM/README.md` | AI doc | ARCHIVE | `docs/archive/ai-legacy-2026-07-04/AI_TEAM__README.md` | Superseded by `docs/AI_TEAM_AUTOPILOT.md`. |
| `AI_TEAM/PROJECT_STATE.md` | AI doc | ARCHIVE | `docs/AI_SOURCE_OF_TRUTH.md` | Merged into canonical source of truth. |
| `AI_TEAM/LAUNCH_CRITERIA.md` | AI doc | ARCHIVE | `docs/AI_RELEASE_CONTROL.md` | Merged into release criteria and bug board. |
| `AI_TEAM/MODEL_ASSIGNMENT.md` | AI doc | ARCHIVE | `docs/AI_TEAM_AUTOPILOT.md` | Merged into roles and prompt contracts. |
| `AI_TEAM/RUNNER_DESIGN.md` | AI doc | ARCHIVE | `docs/AI_TEAM_AUTOPILOT.md` | Old runner design replaced by single Python entry. |
| `AI_TEAM/tasks/*` | Task state | ARCHIVE | `docs/AI_RELEASE_CONTROL.md` | Queue state cannot be canonical. |
| `AI_TEAM/reports/*` | Reports | ARCHIVE | `reports/ai-team/` for new reports | Historical only. |
| `AI_TEAM/roles/*` | Role docs | ARCHIVE | `.ai-team/prompts/*.md` | Prompt contracts replace many role docs. |
| `AI_TEAM/runtime/*` | Runtime | ARCHIVE/IGNORE | `.ai-team/state.example.json` and generated reports | Runtime is not source of truth. |
| `AI_TEAM/scripts/*` | Automation scripts | ARCHIVE | `scripts/ai_release_autopilot.py` | Multiple active runners caused confusion. |
| `AI_TEAM/skills/*` | Skill references | REUSE_PART | Keep under `AI_TEAM/skills/` | Useful as optional skill references, not canonical source. |
| root `CODEX_DESKTOP_AI_DOCS_AND_RELEASE_AUTOPILOT_V2_MINIMAL.md` | Task prompt | ARCHIVE | `docs/archive/ai-legacy-2026-07-04/root__CODEX_DESKTOP_AI_DOCS_AND_RELEASE_AUTOPILOT_V2_MINIMAL.md` | Executed task prompt; historical reference only. |
| `docs/qa-analysis-report.md` | QA report | ARCHIVE | `docs/archive/ai-legacy-2026-07-04/docs__qa-analysis-report.md` | Historical QA report; not active source of truth. |
| root `qa-results.txt` | QA output | ARCHIVE | `docs/archive/ai-legacy-2026-07-04/root__qa-results.txt` | Historical QA output; not active source of truth. |
| root `reports/*` | Historical logs | EXCLUDE_FROM_COMMIT | `reports/ai-team/` for new reports | Large, untracked, may contain sensitive historical output. |

## Notes On Root Reports

Root `reports/` contains many historical loop logs and QA outputs. They were not moved into tracked archive because:

- They are untracked.
- Some are very large.
- Prior safety reports indicated possible secret-like patterns in historical logs.

They must remain excluded from PRs unless separately redacted and intentionally archived.
