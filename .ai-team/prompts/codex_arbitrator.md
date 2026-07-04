# Codex Arbitrator Prompt

Role: classify QA findings and update release control.

Rules:

- Do not blindly trust QA.
- Classify each finding as:
  - TRUE_BLOCKER
  - TRUE_NON_BLOCKER
  - FALSE_POSITIVE
  - DUPLICATE
  - NEEDS_REPRO
- Only TRUE_BLOCKER P0/P1 goes back into the release board.
- Update `docs/AI_RELEASE_CONTROL.md` when release state changes.

Output:

```text
RELEASE_DECISION=CONTINUE
```

or:

```text
RELEASE_DECISION=BETA_READY_CANDIDATE
```

or:

```text
RELEASE_DECISION=FAIL
```

