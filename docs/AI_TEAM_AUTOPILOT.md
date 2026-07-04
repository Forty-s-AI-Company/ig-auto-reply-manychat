# AI Team Autopilot

Last updated: 2026-07-04.

This is the active autopilot guide. The old Node `AI_TEAM/scripts/*` runner and old queue/runtime state are archived. The only active autopilot entry is:

```bash
python scripts/ai_release_autopilot.py
```

## Roles

| Role | Responsibility |
| --- | --- |
| Codex Lead | Reads canonical docs and creates one minimal P0/P1 task. |
| Codex Executor | Implements only the selected task, runs checks, writes evidence. |
| Local checks | Runs repo-specific lint/build/test/e2e commands. |
| Antigravity QA | Browser/visual/integration QA only; does not edit source. |
| Codex Arbitrator | Classifies QA findings and decides continue / candidate / blocked. |
| Release Reporter | Writes final round and handoff reports. |

## Commands

```bash
python scripts/ai_cli_probe.py
python scripts/ai_release_autopilot.py --mode status
python scripts/ai_release_autopilot.py --mode inventory
python scripts/ai_release_autopilot.py --mode docs-check
python scripts/ai_release_autopilot.py --mode run-once --profile local-aggressive
python scripts/ai_release_autopilot.py --mode run --profile local-aggressive --max-rounds 10
python scripts/ai_release_autopilot.py --mode run --profile staging-aggressive --max-rounds 10
python scripts/ai_release_autopilot.py --mode qa-only --profile staging-aggressive
python scripts/ai_release_autopilot.py --mode resume
```

## Profiles

| Profile | Purpose | Production access |
| --- | --- | --- |
| `dry-run` | inventory/docs/checks without code or external writes | none |
| `local-aggressive` | local repair loop with lint/build/test/e2e | none |
| `staging-aggressive` | staging smoke / browser QA with guardrails | staging only |

## Round Contract

Each round writes:

- `reports/ai-team/round-XXX-task.md`
- `reports/ai-team/round-XXX-executor.md`
- `reports/ai-team/round-XXX-local-checks.md`
- `reports/ai-team/round-XXX-staging-checks.md` when staging profile is enabled
- `reports/ai-team/round-XXX-qa.md`
- `reports/ai-team/round-XXX-decision.md`

## Prompt Templates

Prompt templates live in `.ai-team/prompts/`:

- `codex_lead.md`
- `codex_executor.md`
- `antigravity_qa.md`
- `codex_arbitrator.md`
- `release_reporter.md`

Do not hardcode long prompts into Python.

## Report And State Files

Active generated state:

- `.ai-team/state.example.json`
- `.ai-team/cli_profiles.detected.json`
- `.ai-team/ai_artifacts.detected.json`

Active reports:

- `reports/ai-team/`

Old runtime reports are archived or ignored. They are not source of truth.

## Stop Conditions

Autopilot must stop or mark blocked if it needs:

- production DB mutation
- production deploy
- Meta App Review submit
- PayUNI production switch
- real payment capture
- secret value
- unsafe third-party login action
- unresolved P0/P1 that cannot be safely fixed locally/staging

## Status Markers

The final report must include:

```text
AI_ARTIFACT_DISCOVERY_STATUS=PASS|FAIL
AI_DOCS_MINIMIZATION_STATUS=PASS|FAIL
LEGACY_AUTOMATION_CONSOLIDATION_STATUS=PASS|FAIL
AUTOPILOT_BUILD_STATUS=PASS|FAIL
AUTOPILOT_VALIDATION_STATUS=PASS|FAIL
FINAL_STATUS=READY_FOR_LOCAL_AUTOPILOT|READY_FOR_STAGING_AUTOPILOT|BLOCKED
```

