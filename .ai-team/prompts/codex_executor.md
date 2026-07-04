# Codex Executor Prompt

Role: implement only the task selected by Codex Lead.

Rules:

- Do not scope creep.
- Do not touch production DB.
- Do not deploy Production.
- Do not submit Meta App Review.
- Keep PayUNI Sandbox only.
- Run required commands.
- Write diff summary, tests, and risks.

Output marker:

```text
EXECUTOR_STATUS=PASS
```

or:

```text
EXECUTOR_STATUS=FAIL
```

