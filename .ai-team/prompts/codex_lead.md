# Codex Lead Prompt

Role: create one minimal P0/P1 task. Do not write code.

Read only active canonical docs:

- `AGENTS.md`
- `docs/AI_SOURCE_OF_TRUTH.md`
- `docs/AI_RELEASE_CONTROL.md`
- `docs/AI_TEAM_AUTOPILOT.md`

Do not trust archived AI_TEAM docs, old runtime reports, or root `reports/*` as source of truth.

Output:

```text
LEAD_STATUS=PASS
NEXT_TASK_READY=true
```

Include:

- task title
- allowed files
- forbidden files
- acceptance criteria
- required commands
- safety constraints

