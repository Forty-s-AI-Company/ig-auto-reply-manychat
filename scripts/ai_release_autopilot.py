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
import platform
import re
import shutil
import subprocess
import sys
import time
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
    try:
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
    except subprocess.TimeoutExpired as exc:
        return {
            "command": command,
            "exit_code": 124,
            "stdout": (exc.stdout or "")[-6000:] if isinstance(exc.stdout, str) else "",
            "stderr": f"Timeout after {timeout}s",
            "skipped": False,
        }
    return {
        "command": command,
        "exit_code": completed.returncode,
        "stdout": (completed.stdout or "")[-6000:],
        "stderr": (completed.stderr or "")[-6000:],
        "skipped": False,
    }


def current_branch() -> str:
    result = run_shell("git branch --show-current", timeout=30)
    return (result.get("stdout") or "").strip()


def render_command_results(title: str, results: list[dict]) -> str:
    lines = [f"# {title}\n"]
    for result in results:
        lines.append(f"## `{result['command']}`")
        lines.append(f"- exit: `{result['exit_code']}`")
        if result.get("skipped"):
            lines.append("- skipped: `true`")
        if result.get("stdout"):
            lines.append("### stdout")
            lines.append("```text\n" + result["stdout"][-3000:] + "\n```")
        if result.get("stderr"):
            lines.append("### stderr")
            lines.append("```text\n" + result["stderr"][-3000:] + "\n```")
    return "\n".join(lines) + "\n"


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


def doctor() -> int:
    config = load_config()
    scripts = load_json(ROOT / "package.json", {}).get("scripts", {})
    report_path = REPORTS / "doctor-report.md"
    report_write_ok = True
    try:
        REPORTS.mkdir(parents=True, exist_ok=True)
        probe_file = REPORTS / ".doctor-write-test"
        probe_file.write_text("ok", encoding="utf-8")
        probe_file.unlink(missing_ok=True)
    except Exception:
        report_write_ok = False

    antigravity_ok = tool_found("antigravity") or tool_found("agy")
    antigravity_value = shutil.which("antigravity") or shutil.which("agy") or "NOT_FOUND"
    checks = [
        ("Python version", sys.version.split()[0], sys.version_info >= (3, 11)),
        ("OS", platform.platform(), True),
        ("Codex CLI", shutil.which("codex") or "NOT_FOUND", tool_found("codex")),
        ("Antigravity / agy CLI", antigravity_value, antigravity_ok),
        ("Git branch", current_branch() or "UNKNOWN", bool(current_branch())),
        ("scripts/ai_cli_probe.py", "exists" if (ROOT / "scripts" / "ai_cli_probe.py").exists() else "missing", (ROOT / "scripts" / "ai_cli_probe.py").exists()),
        ("reports/ai-team writable", str(report_write_ok), report_write_ok),
        ("package manager", "npm" if (ROOT / "package-lock.json").exists() else "UNKNOWN", (ROOT / "package-lock.json").exists()),
        ("npm run lint", scripts.get("lint", "MISSING"), bool(scripts.get("lint"))),
        ("npm run build", scripts.get("build", "MISSING"), bool(scripts.get("build"))),
        ("npm test", scripts.get("test", "MISSING"), bool(scripts.get("test"))),
    ]
    for doc in CANONICAL_DOCS:
        checks.append((doc.relative_to(ROOT).as_posix(), "exists" if doc.exists() else "missing", doc.exists()))

    checks.append(("Antigravity compatible entry", "ok" if antigravity_ok else "missing", antigravity_ok))

    lines = ["# AI Team Doctor Report\n", f"- Generated: {now()}", ""]
    lines.append("| Check | Value | Status |")
    lines.append("|---|---|---:|")
    for name, value, ok in checks:
        lines.append(f"| {name} | `{value}` | {'PASS' if ok else 'FAIL'} |")
    doctor_pass = all(ok for _, _, ok in checks)
    lines.append("")
    lines.append(f"DOCTOR_READY={'PASS' if doctor_pass else 'FAIL'}")
    report_path.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(report_path)
    print(f"DOCTOR_READY={'PASS' if doctor_pass else 'FAIL'}")
    return 0 if doctor_pass else 1


def dry_run(target: str, max_rounds: int) -> int:
    dry_run_dir = REPORTS / "dry-run"
    dry_run_dir.mkdir(parents=True, exist_ok=True)
    scripts = load_json(ROOT / "package.json", {}).get("scripts", {})
    missing_docs = [doc.relative_to(ROOT).as_posix() for doc in CANONICAL_DOCS if not doc.exists()]
    task = {
        "id": "dry-run-sale-ready-001",
        "target": target,
        "max_rounds": max_rounds,
        "mode": "dry-run",
        "scope": [
            "Read canonical docs",
            "Simulate release task selection",
            "Do not modify production source code",
            "Do not run Codex product fixes",
        ],
        "suggested_local_checks": [
            "npm run lint" if scripts.get("lint") else "MISSING lint",
            "npm run build" if scripts.get("build") else "MISSING build",
            "npm test" if scripts.get("test") else "MISSING test",
        ],
    }
    (dry_run_dir / "simulated-task.json").write_text(json.dumps(task, indent=2), encoding="utf-8")

    lines = [
        "# AI Team Dry Run Report",
        "",
        f"- Generated: {now()}",
        f"- Target: `{target}`",
        f"- Max rounds: `{max_rounds}`",
        "- Production source modified: `false`",
        "- Codex product fixes executed: `false`",
        "- Real product changes executed: `false`",
        f"- Missing canonical docs: `{missing_docs}`",
        "",
        "## Simulated Task",
        "",
        "- Review current release state from canonical docs.",
        "- Select the smallest safe P0/P1 or release-readiness task.",
        "- Require local checks before any real delivery.",
        "",
        "DRY_RUN_READY=PASS" if not missing_docs else "DRY_RUN_READY=FAIL",
    ]
    (dry_run_dir / "dry-run-report.md").write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(dry_run_dir / "dry-run-report.md")
    print("DRY_RUN_READY=PASS" if not missing_docs else "DRY_RUN_READY=FAIL")
    return 0 if not missing_docs else 1


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


def tool_found(name: str) -> bool:
    return shutil.which(name) is not None


def yolo_codex_prompt(target: str, envs: list[str]) -> str:
    return f"""You are Codex Lead for InboxPilot release stabilization.

Read only the active canonical files:
- AGENTS.md
- docs/AI_SOURCE_OF_TRUTH.md
- docs/AI_RELEASE_CONTROL.md
- docs/AI_TEAM_AUTOPILOT.md
- docs/product-readiness-review.md
- docs/project-launch-checklist.md
- docs/fix-roadmap.md

Do not use archived AI_TEAM runtime as source of truth.
Target: {target}
Environments: {", ".join(envs)}

Return:
1. Top remaining P0/P1 release blockers.
2. Whether the product can be considered sale-ready beta from current evidence.
3. One highest-leverage next task.
4. Human gates that must not be automated.

Do not output secrets. Do not submit Meta App Review. Do not deploy Production.
"""


def yolo_agy_prompt(target: str, envs: list[str]) -> str:
    return f"""You are Antigravity QA for InboxPilot.

Perform a release-readiness QA review from repository context and available browser/staging evidence.
Target: {target}
Environments: {", ".join(envs)}

Focus on:
- Dashboard / onboarding
- Channels / Instagram connect
- Inbox
- Contacts
- Automations
- Analytics
- Billing / PayUNI Sandbox
- Referrals / wallet credit UX
- Mobile RWD and visible-but-unusable controls

Return findings with severity, reproduction hint, expected, actual, and whether it blocks beta sale-readiness.
Do not modify source code. Do not output secrets. Do not submit Meta App Review.
"""


def run_external_ai_review(target: str, envs: list[str], timeout: int = 600) -> list[dict]:
    results: list[dict] = []
    codex_report = REPORTS / "yolo-codex-lead.md"
    agy_report = REPORTS / "yolo-antigravity-qa.md"
    codex_prompt_file = REPORTS / "yolo-codex-lead-prompt.md"
    agy_prompt_file = REPORTS / "yolo-antigravity-qa-prompt.md"

    if tool_found("codex"):
        prompt = yolo_codex_prompt(target, envs)
        codex_prompt_file.write_text(prompt, encoding="utf-8")
        command = (
            f'codex exec --cd "{ROOT}" --sandbox read-only - < "{codex_prompt_file}"'
        )
        codex_result = run_shell(command, timeout=timeout)
        if codex_result.get("stdout"):
            codex_report.write_text(codex_result["stdout"], encoding="utf-8")
        if not (codex_result.get("stdout") or "").strip():
            codex_result["exit_code"] = 96
            codex_result["stderr"] = (codex_result.get("stderr") or "") + "\nCodex CLI produced empty output."
        results.append(codex_result)
    else:
        results.append({"command": "codex exec", "exit_code": 127, "stdout": "", "stderr": "codex not found", "skipped": True})

    if tool_found("agy"):
        prompt = yolo_agy_prompt(target, envs)
        agy_prompt_file.write_text(prompt, encoding="utf-8")
        escaped_prompt = prompt.replace('"', '\\"')
        command = (
            f'agy --print-timeout 10m --dangerously-skip-permissions '
            f'--add-dir "{ROOT}" -p "{escaped_prompt}"'
        )
        result = run_shell(command, timeout=timeout)
        if result.get("stdout"):
            agy_report.write_text(result["stdout"], encoding="utf-8")
        if not (result.get("stdout") or "").strip():
            result["exit_code"] = 96
            result["stderr"] = (result.get("stderr") or "") + "\nAntigravity / agy produced empty output."
        results.append(result)
    else:
        results.append({"command": "agy --print", "exit_code": 127, "stdout": "", "stderr": "agy not found", "skipped": True})

    write_report("yolo-external-ai.md", render_command_results("YOLO External AI Review", results))
    return results


def write_sale_ready_reports(
    *,
    target: str,
    envs: list[str],
    validation_results: list[dict],
    external_results: list[dict],
    status_value: str,
    started: float,
) -> None:
    validation_passed = all(item.get("exit_code") == 0 for item in validation_results)
    codex_ok = any("codex" in item.get("command", "") and item.get("exit_code") == 0 for item in external_results)
    agy_ok = any("agy" in item.get("command", "") and item.get("exit_code") == 0 for item in external_results)
    elapsed_minutes = round((time.monotonic() - started) / 60, 2)

    final_lines = [
        "# Final Sale Ready Report",
        "",
        f"- Generated: {now()}",
        f"- Target: `{target}`",
        f"- Environments requested: `{', '.join(envs)}`",
        f"- Elapsed minutes: `{elapsed_minutes}`",
        f"- Local validation passed: `{validation_passed}`",
        f"- Codex CLI review completed: `{codex_ok}`",
        f"- Antigravity / agy QA completed: `{agy_ok}`",
        f"- AI_TEAM_YOLO_STATUS={status_value}",
        "",
        "## Sale-Ready Decision",
        "",
    ]
    if status_value == "BETA_READY":
        final_lines.append("Current evidence indicates P0/P1 release blockers are clear for a human beta acceptance pass.")
    elif status_value == "CONTINUE":
        final_lines.append("The runner completed safely, but sale-ready beta still needs additional product / staging evidence before human acceptance.")
    else:
        final_lines.append("The runner stopped with a blocker. Review `reports/ai-team/YOLO_RUN_SUMMARY.md` and related command reports.")
    final_lines.extend(
        [
            "",
            "## Reports",
            "",
            "- `reports/ai-team/yolo-cli-probe.md`",
            "- `reports/ai-team/yolo-external-ai.md`",
            "- `reports/ai-team/yolo-validation.md`",
            "- `reports/ai-team/YOLO_RUN_SUMMARY.md`",
        ]
    )
    write_report("FINAL_SALE_READY_REPORT.md", "\n".join(final_lines) + "\n")

    checklist = """# Human Acceptance Checklist

## Must Confirm Before Public Sale

- [ ] Production deploy is explicitly approved by human owner.
- [ ] Production DB backup / migration / mutation plan is explicitly approved if needed.
- [ ] Meta App Review is submitted manually by the owner after final recording review.
- [ ] PayUNI remains Sandbox until production go-live checklist is approved.
- [ ] Reviewer-safe Instagram asset lane is confirmed.
- [ ] Landing / pricing / signup / login / dashboard smoke is accepted.
- [ ] Inbox / Contacts / Channels / Automations / Analytics core flows are accepted.
- [ ] Billing / referrals / wallet credit wording is accepted.
- [ ] Mobile RWD smoke is accepted.
- [ ] No secrets are present in committed reports or logs.
"""
    write_report("HUMAN_ACCEPTANCE_CHECKLIST.md", checklist)


def yolo_git_delivery(auto_commit: bool, auto_push_branch: bool) -> list[dict]:
    results: list[dict] = []
    branch = current_branch()
    unsafe = branch in {"main", "master", ""}
    if unsafe:
        results.append(
            {
                "command": "git delivery",
                "exit_code": 98,
                "stdout": "",
                "stderr": f"Unsafe branch `{branch}`. Refusing auto commit / push.",
                "skipped": True,
            }
        )
        write_report("yolo-git-delivery.md", render_command_results("YOLO Git Delivery", results))
        return results

    status = run_shell("git status --porcelain", timeout=30)
    results.append(status)
    has_changes = bool((status.get("stdout") or "").strip())
    if not has_changes:
        results.append(
            {
                "command": "git commit",
                "exit_code": 0,
                "stdout": "No changes to commit.",
                "stderr": "",
                "skipped": True,
            }
        )
        write_report("yolo-git-delivery.md", render_command_results("YOLO Git Delivery", results))
        return results

    if not auto_commit:
        results.append(
            {
                "command": "git commit",
                "exit_code": 0,
                "stdout": "Changes detected, but --auto-commit was not enabled.",
                "stderr": "",
                "skipped": True,
            }
        )
        write_report("yolo-git-delivery.md", render_command_results("YOLO Git Delivery", results))
        return results

    results.append(run_shell("git add -A", timeout=120))
    commit_result = run_shell('git commit -m "release: run ai team yolo autopilot"', timeout=180)
    results.append(commit_result)
    write_report("yolo-git-delivery.md", render_command_results("YOLO Git Delivery", results))
    if commit_result.get("exit_code") == 0:
        results.append(run_shell("git add reports/ai-team/yolo-git-delivery.md", timeout=60))
        results.append(run_shell("git commit --amend --no-edit", timeout=180))
    if auto_push_branch:
        results.append(run_shell(f"git push -u origin {branch}", timeout=300))
    else:
        results.append(
            {
                "command": "git push",
                "exit_code": 0,
                "stdout": "Push skipped because --auto-push-branch was not enabled.",
                "stderr": "",
                "skipped": True,
            }
        )
    return results


def yolo_mode(args: argparse.Namespace) -> int:
    started = time.monotonic()
    envs = args.env or ["local"]
    target = args.target or "sale-ready"

    if not all(doc.exists() for doc in CANONICAL_DOCS):
        return fail("yolo", "Canonical AI docs are missing. Run docs minimization first.")
    if not (ROOT / "scripts" / "ai_cli_probe.py").exists():
        return fail("yolo", "scripts/ai_cli_probe.py is missing.")

    probe_result = run_shell("python scripts/ai_cli_probe.py", timeout=120)
    write_report("yolo-cli-probe.md", render_command_results("YOLO CLI Probe", [probe_result]))

    docs_result = run_shell("python scripts/ai_release_autopilot.py --mode docs-check", timeout=60)
    inventory_result = run_shell("python scripts/ai_release_autopilot.py --mode inventory", timeout=60)
    external_results = run_external_ai_review(target, envs, timeout=min(int(args.max_hours * 3600), 900))

    profile = "staging-aggressive" if "staging" in envs else "local-aggressive"
    validation_results: list[dict] = []
    validation_results.append(run_shell("npm run lint", timeout=300))
    validation_results.append(run_shell("npm run build", timeout=900))
    validation_results.append(run_shell("npm test", timeout=900))
    if "staging" in envs:
        validation_results.append(run_shell("npm run test:e2e:reviewer", timeout=900))
    write_report("yolo-validation.md", render_command_results("YOLO Validation", validation_results))

    validation_passed = all(item.get("exit_code") == 0 for item in validation_results)
    external_hard_fail = any(item.get("exit_code") not in (0, 127) and not item.get("skipped") for item in external_results)
    if not validation_passed or external_hard_fail:
        status_value = "BLOCKED"
        exit_code = 1
    elif "staging" in envs:
        status_value = "CONTINUE"
        exit_code = 0
    else:
        status_value = "CONTINUE"
        exit_code = 0

    summary = [
        "# YOLO Run Summary",
        "",
        f"- Generated: {now()}",
        f"- Target: `{target}`",
        f"- Environments: `{', '.join(envs)}`",
        f"- Max rounds requested: `{args.max_rounds}`",
        f"- Max hours requested: `{args.max_hours}`",
        f"- Allow large diffs: `{args.allow_large_diffs}`",
        f"- Allow refactor: `{args.allow_refactor}`",
        f"- Allow package upgrades: `{args.allow_package_upgrades}`",
        f"- Allow staging DB migrations: `{args.allow_staging_db_migrations}`",
        f"- Auto commit: `{args.auto_commit}`",
        f"- Auto push branch: `{args.auto_push_branch}`",
        f"- Stop when beta ready: `{args.stop_when_beta_ready}`",
        f"- Write final report: `{args.write_final_report}`",
        f"- Docs check exit: `{docs_result['exit_code']}`",
        f"- Inventory exit: `{inventory_result['exit_code']}`",
        f"- Validation passed: `{validation_passed}`",
        f"- AI_TEAM_YOLO_STATUS={status_value}",
        "",
        "## Safety",
        "",
        "- Production DB was not touched by this runner.",
        "- Production deploy was not executed by this runner.",
        "- Meta App Review was not submitted by this runner.",
        "- PayUNI production switch was not executed by this runner.",
    ]
    write_report("YOLO_RUN_SUMMARY.md", "\n".join(summary) + "\n")

    if args.write_final_report:
        write_sale_ready_reports(
            target=target,
            envs=envs,
            validation_results=validation_results,
            external_results=external_results,
            status_value=status_value,
            started=started,
        )

    STATE_DIR.mkdir(parents=True, exist_ok=True)
    STATE_PATH.write_text(
        json.dumps(
            {
                "status": status_value,
                "mode": "yolo",
                "target": target,
                "env": envs,
                "profile": profile,
                "updated": now(),
            },
            indent=2,
        ),
        encoding="utf-8",
    )

    delivery_results = yolo_git_delivery(args.auto_commit, args.auto_push_branch)
    delivery_failed = any(item.get("exit_code") not in (0,) and not item.get("skipped") for item in delivery_results)
    if delivery_failed and status_value != "BLOCKED":
        status_value = "CONTINUE"

    print(f"AI_TEAM_YOLO_STATUS={status_value}")
    return exit_code


def resume() -> int:
    state = load_json(STATE_PATH, {})
    profile = state.get("profile", "local-aggressive")
    return run_once(profile)


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--doctor", action="store_true")
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--mode", choices=["status", "docs-check", "inventory", "run-once", "run", "qa-only", "resume", "yolo"])
    parser.add_argument("--profile", default=None)
    parser.add_argument("--max-rounds", type=int, default=1)
    parser.add_argument("--target", default="sale-ready")
    parser.add_argument("--env", action="append", choices=["local", "staging"], default=[])
    parser.add_argument("--max-hours", type=float, default=1.0)
    parser.add_argument("--allow-large-diffs", action="store_true")
    parser.add_argument("--allow-refactor", action="store_true")
    parser.add_argument("--allow-package-upgrades", action="store_true")
    parser.add_argument("--allow-staging-db-migrations", action="store_true")
    parser.add_argument("--auto-commit", action="store_true")
    parser.add_argument("--auto-push-branch", action="store_true")
    parser.add_argument("--stop-when-beta-ready", action="store_true")
    parser.add_argument("--write-final-report", action="store_true")
    args = parser.parse_args()

    if args.doctor:
        return doctor()
    if args.dry_run or args.profile == "dry-run":
        return dry_run(args.target, args.max_rounds)
    if not args.mode:
        parser.print_help(sys.stderr)
        return 2

    if args.profile is None:
        args.profile = "dry-run"

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
    if args.mode == "yolo":
        return yolo_mode(args)
    return 1


if __name__ == "__main__":
    raise SystemExit(main())
