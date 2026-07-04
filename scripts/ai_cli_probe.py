#!/usr/bin/env python3
"""Detect local AI / QA CLI capabilities for InboxPilot.

This script intentionally uses only the Python standard library and redacts
secret-looking output before writing reports.
"""

from __future__ import annotations

import json
import platform
import re
import shutil
import subprocess
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
REPORTS = ROOT / "reports" / "ai-team"
STATE_DIR = ROOT / ".ai-team"

SECRET_PATTERNS = [
    re.compile(r"sk-[A-Za-z0-9_\-]{16,}"),
    re.compile(r"sbp_[A-Za-z0-9_\-]{16,}"),
    re.compile(r"postgres(?:ql)?://[^\s)]+", re.I),
    re.compile(r"(?i)(secret|token|password|hash_key|hash_iv)\s*[:=]\s*[^\s]+"),
]


def redact(value: str) -> str:
    redacted = value
    for pattern in SECRET_PATTERNS:
        redacted = pattern.sub("[REDACTED]", redacted)
    return redacted


def run_probe(command: list[str], timeout: int = 8) -> dict:
    executable = shutil.which(command[0])
    result = {
        "command": command,
        "found": bool(executable),
        "path": executable,
        "exit_code": None,
        "stdout": "",
        "stderr": "",
    }
    if not executable:
        return result
    try:
        command_text = subprocess.list2cmdline(command)
        completed = subprocess.run(
            command_text if sys.platform.startswith("win") else command,
            cwd=ROOT,
            shell=sys.platform.startswith("win"),
            text=True,
            encoding="utf-8",
            errors="replace",
            capture_output=True,
            timeout=timeout,
            check=False,
        )
        result["exit_code"] = completed.returncode
        result["stdout"] = redact(completed.stdout[-4000:])
        result["stderr"] = redact(completed.stderr[-4000:])
    except Exception as exc:  # pragma: no cover - environment dependent
        result["stderr"] = f"{type(exc).__name__}: {exc}"
    return result


def load_package_scripts() -> dict:
    package_path = ROOT / "package.json"
    if not package_path.exists():
        return {}
    return json.loads(package_path.read_text(encoding="utf-8")).get("scripts", {})


def main() -> int:
    REPORTS.mkdir(parents=True, exist_ok=True)
    STATE_DIR.mkdir(parents=True, exist_ok=True)

    probes = [
        ["codex", "--help"],
        ["codex", "exec", "--help"],
        ["antigravity", "--help"],
        ["agy", "--help"],
        ["gemini", "--help"],
        ["node", "--version"],
        ["npm", "--version"],
        ["python", "--version"],
        ["git", "--version"],
    ]
    results = [run_probe(command) for command in probes]
    scripts = load_package_scripts()

    profile = {
        "generated": "2026-07-04",
        "os": platform.platform(),
        "root": str(ROOT),
        "probes": results,
        "package_manager": "npm" if (ROOT / "package-lock.json").exists() else "UNKNOWN",
        "commands": {
            "install": "npm install",
            "lint": scripts.get("lint"),
            "build": scripts.get("build"),
            "test": scripts.get("test"),
            "e2e": scripts.get("test:e2e"),
            "reviewer_e2e": scripts.get("test:e2e:reviewer"),
            "payuni_sandbox": scripts.get("payuni:smoke"),
        },
    }

    (STATE_DIR / "cli_profiles.detected.json").write_text(
        json.dumps(profile, indent=2, ensure_ascii=False),
        encoding="utf-8",
    )

    lines = ["# CLI Discovery - 2026-07-04\n"]
    lines.append(f"- OS: `{profile['os']}`")
    lines.append(f"- Root: `{ROOT}`")
    lines.append(f"- Package manager: `{profile['package_manager']}`")
    lines.append("\n## Probes\n")
    lines.append("| Command | Found | Exit | Path | Notes |")
    lines.append("|---|---:|---:|---|---|")
    for item in results:
        command = " ".join(item["command"])
        notes = item["stderr"] or item["stdout"]
        notes = notes.replace("\n", " ")[:180]
        lines.append(
            f"| `{command}` | {item['found']} | {item['exit_code']} | `{item['path']}` | {notes} |"
        )
    lines.append("\n## Detected Project Commands\n")
    for key, value in profile["commands"].items():
        lines.append(f"- `{key}`: `{value or 'UNKNOWN'}`")
    (REPORTS / "02_CLI_DISCOVERY.md").write_text("\n".join(lines) + "\n", encoding="utf-8")

    print("CLI discovery written to reports/ai-team/02_CLI_DISCOVERY.md")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
