#!/usr/bin/env python3
"""Single entry release autopilot for InboxPilot.

The script is intentionally conservative: it writes structured reports, runs
repo commands selected by profile, and refuses production-like operations.
It does not submit Meta App Review, deploy Production, or mutate production DB.
"""

from __future__ import annotations

import argparse
import json
import os
import re
import shutil
import subprocess
import sys
from datetime import datetime
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
REPORTS = ROOT / "reports" / "ai-team"
STATE_DIR = ROOT / ".ai-team"
CONFIG_PATH = ROOT / "scripts" / "ai_release_autopilot_config.example.json"
STATE_PATH = STATE_DIR / "state.example.json"

CANONICAL_DOCS = [
    ROOT / "AGENTS.md",
    ROOT / "docs" / "AI_SOURCE_OF_TRUTH.md",
    ROOT / "docs" / "AI_RELEASE_CONTROL.md",
    ROOT / "docs" / "AI_TEAM_AUTOPILOT.md",
]

PRODUCTION_GUARD = re.compile(
    r"(vercel\s+deploy\s+--prod|prisma\s+db\s+push|migrate\s+deploy|production\s+db|PAYUNI_PRODUCTION|META_APP_REVIEW_SUBMIT)",
    re.I,
)


def now() -> str:
    return datetime.now().strftime("%Y-%m-%d %H:%M:%S")


def load_json(path: Path, fallback: dict) -> dict:
    if not path.exists():
        return fallback
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except Exception:
        return fallback


def load_config() -> dict:
    return load_json(CONFIG_PATH, default_config())


def default_config() -> dict:
    return {
        "reports_dir": "reports/ai-team",
        "state_file": ".ai-team/state.example.json",
        "profiles": {
            "dry-run": {"commands": [], "allow_staging": False},
            "local-aggressive": {
                "commands": ["npm run lint", "npm run build", "npm test"],
                "allow_staging": False,
            },
            "staging-aggressive": {
                "commands": ["npm run lint", "npm run build", "npm test", "npm run test:e2e:reviewer"],
                "allow_staging": True,
            },
        },
    }


def write_report(name: str, content: str) -> Path:
    REPORTS.mkdir(parents=True, exist_ok=True)
    path = REPORTS / name
    path.write_text(content, encoding="utf-8")
    return path


def command_safe(command: str) -> tuple[bool, str]:
    if PRODUCTION_GUARD.search(command):
        return False, "Blocked by production guard"
    return True, "ok"


def run_shell(command: str, timeout: int = 180) -> dict:
    safe, reason = command_safe(command)
    if not safe:
        return {"command": command, "exit_code": 99, "stdout": "", "stderr": reason, "skipped": True}
    completed = subprocess.run(
        command,
        cwd=ROOT,
        shell=True,
        text=True,
        encoding="utf-8",
        errors="replace",
        capture_output=True,
        timeout=timeout,
        check=False,
    )
    return {
        "command": command,
        "exit_code": completed.returncode,
        "stdout": (completed.stdout or "")[-6000:],
        "stderr": (completed.stderr or "")[-6000:],
        "skipped": False,
    }


def next_round_id() -> int:
    existing = sorted(REPORTS.glob("round-*-task.md")) if REPORTS.exists() else []
    if not existing:
        return 1
    numbers = []
    for path in existing:
        match = re.search(r"round-(\d+)-task\.md", path.name)
        if match:
            numbers.append(int(match.group(1)))
    return (max(numbers) + 1) if numbers else 1


def status() -> int:
    state = load_json(STATE_PATH, {"status": "NEW", "round": 0})
    lines = ["# AI Release Autopilot Status\n"]
    lines.append(f"- Time: {now()}")
    lines.append(f"- Root: `{ROOT}`")
    lines.append(f"- State: `{state.get('status', 'UNKNOWN')}`")
    lines.append(f"- Last round: `{state.get('round', 0)}`")
    lines.append("\n## Canonical docs\n")
    for doc in CANONICAL_DOCS:
        lines.append(f"- [{'x' if doc.exists() else ' '}] `{doc.relative_to(ROOT).as_posix()}`")
    path = write_report("status.md", "\n".join(lines) + "\n")
    print(path)
    return 0


def inventory() -> int:
    artifact_path = STATE_DIR / "ai_artifacts.detected.json"
    if not artifact_path.exists():
        return fail("inventory", "Missing .ai-team/ai_artifacts.detected.json. Run discovery first.")
    data = load_json(artifact_path, {})
    counts: dict[str, int] = {}
    for item in data.get("artifacts", []):
        counts[item.get("reuse_decision", "UNKNOWN")] = counts.get(item.get("reuse_decision", "UNKNOWN"), 0) + 1
    lines = ["# AI Artifact Inventory\n", f"- Count: `{data.get('count', 0)}`", "\n## Decisions\n"]
    for key in sorted(counts):
        lines.append(f"- {key}: {counts[key]}")
    write_report("inventory.md", "\n".join(lines) + "\n")
    print("inventory ok")
    return 0


def docs_check() -> int:
    missing = [doc.relative_to(ROOT).as_posix() for doc in CANONICAL_DOCS if not doc.exists()]
    archived_old_runner = (ROOT / ".ai-team/archive/automation-legacy-2026-07-04").exists()
    lines = ["# Docs Check\n", f"- Time: {now()}"]
    lines.append(f"- Missing canonical docs: `{missing}`")
    lines.append(f"- Legacy automation archive present: `{archived_old_runner}`")
    decision = "PASS" if not missing and archived_old_runner else "FAIL"
    lines.append(f"- DOCS_CHECK_STATUS={decision}")
    write_report("docs-check.md", "\n".join(lines) + "\n")
    print(f"DOCS_CHECK_STATUS={decision}")
    return 0 if decision == "PASS" else 1


def fail(name: str, message: str) -> int:
    write_report(f"{name}.md", f"# {name}\n\nSTATUS=FAIL\n\n{message}\n")
    print(message, file=sys.stderr)
    return 1


def generate_task(round_id: int, profile: str) -> str:
    task = f"""# Round {round_id:03d} Task

LEAD_STATUS=PASS
NEXT_TASK_READY=true

## Task

Review canonical release state and fix the smallest safe P0/P1 product or release-readiness blocker.

## Scope

- Read `AGENTS.md`
- Read `docs/AI_SOURCE_OF_TRUTH.md`
- Read `docs/AI_RELEASE_CONTROL.md`
- Read `docs/AI_TEAM_AUTOPILOT.md`
- Do not use archived AI_TEAM runtime or root reports as source of truth.

## Safety

- No production DB
- No Production deploy
- No Meta App Review submit
- PayUNI Sandbox only

## Profile

`{profile}`
"""
    write_report(f"round-{round_id:03d}-task.md", task)
    return task


def run_once(profile: str) -> int:
    config = load_config()
    profiles = config.get("profiles", {})
    if profile not in profiles:
        return fail("run-once", f"Unknown profile `{profile}`")
    round_id = next_round_id()
    generate_task(round_id, profile)

    commands = profiles[profile].get("commands", [])
    checks = []
    for command in commands:
        checks.append(run_shell(command))
    local_lines = [f"# Round {round_id:03d} Local Checks\n"]
    passed = True
    for result in checks:
        if result["exit_code"] != 0:
            passed = False
        local_lines.append(f"## `{result['command']}`")
        local_lines.append(f"- exit: `{result['exit_code']}`")
        if result["stderr"]:
            local_lines.append("```text\n" + result["stderr"][-2000:] + "\n```")
    write_report(f"round-{round_id:03d}-local-checks.md", "\n".join(local_lines) + "\n")
    write_report(
        f"round-{round_id:03d}-executor.md",
        f"# Round {round_id:03d} Executor\n\nEXECUTOR_STATUS={'PASS' if passed else 'FAIL'}\n\nNo source change is performed by the minimal validation runner.\n",
    )
    write_report(
        f"round-{round_id:03d}-qa.md",
        f"# Round {round_id:03d} QA\n\nQA_STATUS={'PASS' if passed else 'FAIL'}\nBLOCKING_FINDINGS_COUNT={0 if passed else 1}\n",
    )
    decision = "CONTINUE" if passed else "FAIL"
    write_report(
        f"round-{round_id:03d}-decision.md",
        f"# Round {round_id:03d} Decision\n\nRELEASE_DECISION={decision}\n",
    )
    STATE_DIR.mkdir(parents=True, exist_ok=True)
    STATE_PATH.write_text(
        json.dumps({"status": decision, "round": round_id, "profile": profile, "updated": now()}, indent=2),
        encoding="utf-8",
    )
    print(f"ROUND={round_id:03d} RELEASE_DECISION={decision}")
    return 0 if passed else 1


def run_loop(profile: str, max_rounds: int) -> int:
    code = 0
    for _ in range(max_rounds):
        code = run_once(profile)
        if code != 0:
            return code
    return code


def qa_only(profile: str) -> int:
    config = load_config()
    commands = config.get("profiles", {}).get(profile, {}).get("qa_commands", ["npm run test:e2e:reviewer"])
    results = [run_shell(command) for command in commands]
    passed = all(item["exit_code"] == 0 for item in results)
    lines = ["# QA Only\n", f"- Profile: `{profile}`"]
    for result in results:
        lines.append(f"- `{result['command']}` -> `{result['exit_code']}`")
    lines.append(f"\nQA_STATUS={'PASS' if passed else 'FAIL'}")
    write_report("qa-only.md", "\n".join(lines) + "\n")
    print(f"QA_STATUS={'PASS' if passed else 'FAIL'}")
    return 0 if passed else 1


def resume() -> int:
    state = load_json(STATE_PATH, {})
    profile = state.get("profile", "local-aggressive")
    return run_once(profile)


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--mode", required=True, choices=["status", "docs-check", "inventory", "run-once", "run", "qa-only", "resume"])
    parser.add_argument("--profile", default="dry-run")
    parser.add_argument("--max-rounds", type=int, default=1)
    args = parser.parse_args()

    if args.mode == "status":
        return status()
    if args.mode == "docs-check":
        return docs_check()
    if args.mode == "inventory":
        return inventory()
    if args.mode == "run-once":
        return run_once(args.profile)
    if args.mode == "run":
        return run_loop(args.profile, args.max_rounds)
    if args.mode == "qa-only":
        return qa_only(args.profile)
    if args.mode == "resume":
        return resume()
    return 1


if __name__ == "__main__":
    raise SystemExit(main())
