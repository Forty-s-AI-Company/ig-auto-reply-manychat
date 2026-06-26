import os
import re
import shutil
import subprocess
import sys
import threading
import time
import urllib.request
from pathlib import Path

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")

ROOT_DIR = Path(__file__).resolve().parents[1]
REPORTS_DIR = ROOT_DIR / "reports"
DEV_PORT = int(os.environ.get("INBOXPILOT_AUTOPILOT_PORT", "3041"))
APP_URL = f"http://localhost:{DEV_PORT}"

MAX_LOOPS = int(os.environ.get("AUTOPILOT_MAX_LOOPS", "8"))
CODEX_TIMEOUT_SECONDS = int(os.environ.get("CODEX_TIMEOUT_SECONDS", "1200"))
CODEX_CMD = "codex.cmd" if os.name == "nt" else "codex"
PREVIEW_DEPLOY = os.environ.get("INBOXPILOT_AUTOPILOT_PREVIEW_DEPLOY", "1") == "1"
RUN_E2E = os.environ.get("INBOXPILOT_AUTOPILOT_E2E", "0") == "1"
ALLOW_PRODUCTION = os.environ.get("INBOXPILOT_AUTOPILOT_ALLOW_PRODUCTION", "0") == "1"

PRODUCTION_HOST = "inboxpilot.carry-digital-nomad.in.net"
STAGING_HOST = "staging.carry-digital-nomad.in.net"
VERCEL_SCOPE = os.environ.get("VERCEL_SCOPE", "a25814740s-projects")

FORBIDDEN_COMMAND_PATTERNS = [
    r"\bprisma\s+db\s+push\b",
    r"\bprisma\s+migrate\s+deploy\b",
    r"\bprisma\s+migrate\s+reset\b",
    r"\bDROP\s+",
    r"\bTRUNCATE\s+",
    r"\bDELETE\s+FROM\s+",
    r"\bvercel\s+(--prod|deploy\s+--prod|redeploy\s+--prod)\b",
    r"PAYUNI_ALLOW_PRODUCTION\s*=\s*true",
]


AUTOMATION_GUARD = f"""

InboxPilot unattended automation guard:
- All replies, reports, and summaries must be Traditional Chinese unless a command output is quoted.
- Do not ask the operator questions. Make the safest reasonable decision and continue.
- If a login, OTP, CAPTCHA, external approval, account selection, missing secret, or dashboard-only action is required, write `HUMAN_REQUIRED: <exact item>` to reports/human-required.md and continue other safe work.
- Do not print, commit, log, or document secrets, tokens, DB URLs, service role keys, cookies, OAuth codes, callback query strings, or PayUNI signing values.
- Do not modify or commit `.env*` files.
- Do not run `npm run dev`, `next dev`, `npm start`, `next start`, or any long-running server/watch command. The autopilot runner owns the dev server.
- Do not run Prisma/Supabase schema writes against production. Do not run prisma db push, prisma migrate deploy, prisma migrate reset, DROP, TRUNCATE, or broad DELETE.
- Do not deploy Production unless INBOXPILOT_AUTOPILOT_ALLOW_PRODUCTION=1 and all gates pass. Current value: {int(ALLOW_PRODUCTION)}.
- Even if Production deployment is later allowed, PayUNI must remain sandbox until a separate production go-live task explicitly changes it.
- Do not submit Meta App Review, log in to Meta Dashboard, upload reviewer assets, or change Meta app settings.
- Vercel CLI may inspect project/deployments/env names without printing env values. Preview deployment is allowed when authenticated.
- Supabase CLI may inspect status/project metadata and run safe local/staging checks only; no production schema/data writes.
- Keep changes small, reviewed, and aligned with InboxPilot docs.
"""


DEVELOPER_PHASES = """
Unattended InboxPilot phases:

PHASE 0 - Preflight and context
- Read AGENTS.md, README.md, AUTOPILOT.md, DESIGN.md if present, PRODUCT.md if present, docs/project-launch-checklist.md, docs/product-readiness-review.md, docs/security-review.md, docs/meta-app-review-checklist.md, docs/billing-affiliate-readiness.md, docs/fix-roadmap.md, docs/codex-session-log.md, package.json, .env.example, vercel.json, and current reports.
- Inspect code before editing.
- Check Vercel CLI and Supabase CLI availability/auth/link status without printing secrets.
- Check PayUNI sandbox env names only; do not print values.
- Record blockers in reports/human-required.md.

PHASE 1 - Product completion
- Prioritize launch blockers for simple Production release and full staging release.
- Fix critical UX, auth, route guard, tenant isolation, and payment sandbox issues when they are code-only.
- Do not add unrelated providers or large rewrites.

PHASE 2 - Database and Supabase safety
- Review Prisma schema/migrations and Supabase notes.
- Do not apply production DB/schema changes.
- If staging/fresh test DB is available, prefer read-only or reversible validation.
- If DB env is missing, leave HUMAN_REQUIRED and continue non-DB work.

PHASE 3 - PayUNI sandbox
- Keep PayUNI sandbox.
- Verify checkout/return/notify code and sandbox smoke path.
- Never switch to production PayUNI endpoint or set PAYUNI_ALLOW_PRODUCTION=true.

PHASE 4 - Vercel Preview readiness
- Inspect Vercel project link and deployments without printing env values.
- Preview deployments are allowed when authenticated and project link is clear.
- Production deployment is not part of the default autopilot path.

PHASE 5 - Quality gates
- npm install
- npm run lint
- npm test
- npm run build
- npm run payuni:smoke
- Focused tests for changed areas.

PHASE 6 - QA and safety
- Use local route smoke, test outputs, and code review evidence.
- Ensure Production/Staging aliases are not crossed.
- Ensure reports/qa-report.md and reports/safety-report.md are current.

PHASE 7 - Final report
- Create reports/final-report.md with PREVIEW_READY, LAUNCH_READY, or HUMAN_REQUIRED.
- Include exact commands run, blockers, preview URL if created, and production go/no-go.
"""


def write_step(message: str) -> None:
    print("\n" + "=" * 72, flush=True)
    print(message, flush=True)
    print("=" * 72, flush=True)


def ensure_dirs() -> None:
    REPORTS_DIR.mkdir(parents=True, exist_ok=True)


def resolve_command(command: list[str]) -> list[str]:
    executable = shutil.which(command[0])
    if executable:
        return [executable, *command[1:]]
    return command


def append_human_required(message: str) -> None:
    REPORTS_DIR.mkdir(parents=True, exist_ok=True)
    path = REPORTS_DIR / "human-required.md"
    existing = path.read_text(encoding="utf-8", errors="replace") if path.exists() else ""
    line = f"HUMAN_REQUIRED: {message}".strip()
    if line not in existing:
        with path.open("a", encoding="utf-8") as handle:
            if existing and not existing.endswith("\n"):
                handle.write("\n")
            handle.write(line + "\n")


def run_command(
    command: list[str],
    output_file: Path | None = None,
    timeout: int | None = None,
    input_text: str | None = None,
    allow_failure: bool = True,
) -> int:
    command = resolve_command(command)
    write_step(f"Running command: {' '.join(command)}")

    if output_file:
        output_file.parent.mkdir(parents=True, exist_ok=True)

    env = os.environ.copy()
    env["PYTHONUTF8"] = "1"
    env["PYTHONIOENCODING"] = "utf-8"
    env["NO_COLOR"] = "1"

    try:
        process = subprocess.Popen(
            command,
            cwd=ROOT_DIR,
            stdin=subprocess.PIPE if input_text is not None else subprocess.DEVNULL,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            text=True,
            encoding="utf-8",
            errors="replace",
            env=env,
            shell=False,
        )
    except FileNotFoundError:
        message = f"Command not found: {command[0]}"
        print(message, flush=True)
        if output_file:
            output_file.write_text(message + "\n", encoding="utf-8")
        return 127

    output_lines: list[str] = []
    assert process.stdout is not None

    if input_text is not None:
        assert process.stdin is not None
        process.stdin.write(input_text)
        process.stdin.close()

    def stream_output() -> None:
        for line in process.stdout:
            print(line, end="", flush=True)
            output_lines.append(line)

    reader = threading.Thread(target=stream_output, daemon=True)
    reader.start()

    started_at = time.monotonic()
    while process.poll() is None:
        if timeout is not None and time.monotonic() - started_at > timeout:
            kill_process_tree(process.pid)
            reader.join(timeout=2)
            output_lines.append("Command timed out.\n")
            if output_file:
                output_file.write_text("".join(output_lines), encoding="utf-8")
            return 124
        time.sleep(0.2)

    reader.join(timeout=5)
    if output_file:
        output_file.write_text("".join(output_lines), encoding="utf-8")

    if process.returncode != 0 and not allow_failure:
        print(f"Command failed with exit code {process.returncode}", flush=True)

    return process.returncode


def run_codex(prompt: str, output_file: Path) -> int:
    stop_dev_server()
    guarded_prompt = f"{prompt.rstrip()}\n{AUTOMATION_GUARD}"
    prompt_file = output_file.with_suffix(".prompt.txt")
    prompt_file.parent.mkdir(parents=True, exist_ok=True)
    prompt_file.write_text(guarded_prompt, encoding="utf-8")

    exit_code = run_command(
        [CODEX_CMD, "exec", "--color", "never", "-"],
        output_file,
        timeout=CODEX_TIMEOUT_SECONDS,
        input_text=guarded_prompt,
    )
    stop_dev_server()
    return exit_code


def kill_process_tree(pid: int) -> None:
    if os.name == "nt":
        subprocess.run(
            ["taskkill", "/PID", str(pid), "/T", "/F"],
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
        )
    else:
        subprocess.run(["kill", "-TERM", str(pid)], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)


def stop_dev_server() -> None:
    if os.name == "nt":
        subprocess.run(
            [
                "powershell",
                "-NoProfile",
                "-Command",
                f"""
                $connections = Get-NetTCPConnection -LocalPort {DEV_PORT} -ErrorAction SilentlyContinue
                if ($connections) {{
                    $pids = $connections | Select-Object -ExpandProperty OwningProcess -Unique
                    foreach ($processId in $pids) {{
                        Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
                    }}
                }}
                """,
            ],
            cwd=ROOT_DIR,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
        )
    else:
        subprocess.run(
            ["bash", "-lc", f"lsof -ti:{DEV_PORT} | xargs -r kill -9"],
            cwd=ROOT_DIR,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
        )


def start_dev_server() -> bool:
    write_step(f"Starting local dev server on {APP_URL}")
    stop_dev_server()

    dev_log = REPORTS_DIR / "dev-server.log"
    with dev_log.open("w", encoding="utf-8") as log:
        subprocess.Popen(
            resolve_command(["npm.cmd" if os.name == "nt" else "npm", "run", "dev"]),
            cwd=ROOT_DIR,
            stdout=log,
            stderr=subprocess.STDOUT,
            shell=False,
        )

    deadline = time.monotonic() + 45
    while time.monotonic() < deadline:
        try:
            with urllib.request.urlopen(APP_URL, timeout=5) as response:
                if 200 <= response.getcode() < 500:
                    return True
        except Exception:
            time.sleep(3)
    return False


def route_smoke() -> int:
    report = REPORTS_DIR / "route-smoke.md"
    routes = ["/", "/login", "/dashboard", "/pricing", "/channels/connect/instagram"]
    lines = ["# Route smoke", ""]
    failed = False

    for route in routes:
        url = APP_URL + route
        try:
            with urllib.request.urlopen(url, timeout=10) as response:
                status = response.getcode()
                lines.append(f"- `{route}`: HTTP {status}")
                if status >= 500:
                    failed = True
        except Exception as exc:
            lines.append(f"- `{route}`: FAIL {exc}")
            failed = True

    report.write_text("\n".join(lines) + "\n", encoding="utf-8")
    return 1 if failed else 0


def file_contains(path: Path, pattern: str) -> bool:
    if not path.exists():
        return False
    return re.search(pattern, path.read_text(encoding="utf-8", errors="replace")) is not None


def scan_for_forbidden_commands() -> bool:
    text_parts: list[str] = []
    for path in REPORTS_DIR.glob("*.md"):
        text_parts.append(path.read_text(encoding="utf-8", errors="replace"))
    for pattern in FORBIDDEN_COMMAND_PATTERNS:
        if re.search(pattern, "\n".join(text_parts), flags=re.IGNORECASE):
            append_human_required(f"Autopilot report mentions forbidden command pattern: {pattern}")
            return False
    return True


def preflight_cli_report() -> None:
    lines = ["# Autopilot preflight", ""]
    for tool, command in [
        ("git", ["git", "--version"]),
        ("node", ["node", "--version"]),
        ("npm", ["npm", "--version"]),
        ("vercel", ["npx", "vercel", "whoami"]),
        ("supabase", ["supabase", "--version"]),
        ("codex", [CODEX_CMD, "--version"]),
    ]:
        exit_code = run_command(command, REPORTS_DIR / f"preflight-{tool}.log", timeout=30)
        status = "ok" if exit_code == 0 else f"exit {exit_code}"
        lines.append(f"- `{tool}`: {status}")
        if tool == "vercel" and exit_code != 0:
            append_human_required("Vercel CLI is not authenticated or unavailable. Run `npx vercel login`.")
        if tool == "supabase" and exit_code == 127:
            append_human_required("Supabase CLI is unavailable on PATH.")
    (REPORTS_DIR / "preflight-report.md").write_text("\n".join(lines) + "\n", encoding="utf-8")


def vercel_readiness(loop: int) -> None:
    lines = ["# Vercel readiness", ""]
    inspect_commands = [
        ["npx", "vercel", "ls", "inboxpilot", "--scope", VERCEL_SCOPE],
        ["npx", "vercel", "inspect", f"https://{PRODUCTION_HOST}", "--scope", VERCEL_SCOPE],
        ["npx", "vercel", "inspect", f"https://{STAGING_HOST}", "--scope", VERCEL_SCOPE],
    ]
    for index, command in enumerate(inspect_commands, start=1):
        exit_code = run_command(command, REPORTS_DIR / f"vercel-inspect-{loop}-{index}.log", timeout=60)
        lines.append(f"- `{' '.join(command)}`: exit {exit_code}")

    if PREVIEW_DEPLOY:
        exit_code = run_command(
            ["npx", "vercel", "deploy", "--yes", "--scope", VERCEL_SCOPE],
            REPORTS_DIR / f"vercel-preview-deploy-loop-{loop}.log",
            timeout=900,
        )
        lines.append(f"- Preview deploy: exit {exit_code}")
        if exit_code != 0:
            append_human_required("Vercel Preview deployment failed or requires login/project linking.")
    else:
        lines.append("- Preview deploy: skipped by INBOXPILOT_AUTOPILOT_PREVIEW_DEPLOY=0")

    (REPORTS_DIR / "vercel-report.md").write_text("\n".join(lines) + "\n", encoding="utf-8")


def supabase_readiness(loop: int) -> None:
    lines = ["# Supabase readiness", ""]
    commands = [
        ["supabase", "projects", "list"],
    ]
    for index, command in enumerate(commands, start=1):
        exit_code = run_command(command, REPORTS_DIR / f"supabase-check-{loop}-{index}.log", timeout=60)
        lines.append(f"- `{' '.join(command)}`: exit {exit_code}")
        if exit_code == 127:
            append_human_required("Supabase CLI is unavailable on PATH.")
            break
        if exit_code != 0:
            append_human_required("Supabase CLI is not authenticated/linked enough for automated checks.")
    lines.append("- No production Supabase schema/data write was attempted.")
    (REPORTS_DIR / "supabase-report.md").write_text("\n".join(lines) + "\n", encoding="utf-8")


def health_checks() -> None:
    lines = ["# Remote health checks", ""]
    urls = [
        f"https://{PRODUCTION_HOST}/api/health",
        f"https://{STAGING_HOST}/api/health/staging",
    ]
    for url in urls:
        try:
            with urllib.request.urlopen(url, timeout=20) as response:
                body = response.read(2000).decode("utf-8", errors="replace")
                lines.append(f"- `{url}`: HTTP {response.getcode()} `{body}`")
        except Exception as exc:
            lines.append(f"- `{url}`: FAIL `{exc}`")
            append_human_required(f"Remote health check failed for {url}: {exc}")
    (REPORTS_DIR / "health-report.md").write_text("\n".join(lines) + "\n", encoding="utf-8")


def main() -> None:
    ensure_dirs()
    write_step("Starting InboxPilot Autopilot")
    print(f"Root: {ROOT_DIR}", flush=True)
    print(f"Reports: {REPORTS_DIR}", flush=True)
    stop_dev_server()
    preflight_cli_report()

    for loop in range(1, MAX_LOOPS + 1):
        write_step(f"LOOP {loop} / {MAX_LOOPS}")

        developer_prompt = f"""
You are the InboxPilot unattended Codex developer.

Read first:
- AGENTS.md
- README.md
- AUTOPILOT.md
- docs/project-launch-checklist.md
- docs/product-readiness-review.md
- docs/security-review.md
- docs/meta-app-review-checklist.md
- docs/billing-affiliate-readiness.md
- docs/fix-roadmap.md
- docs/codex-session-log.md
- package.json
- .env.example
- vercel.json
- current reports in reports/ if present

Goal:
Move InboxPilot toward unattended staging / preview launch readiness while preserving production safety.

Phases:
{DEVELOPER_PHASES}

Loop context:
- Current loop: {loop}
- If reports/qa-report.md exists and has QA_STATUS=FAIL, fix blocker/critical/major issues first.
- If reports/safety-report.md exists and has SAFETY_STATUS=FAIL, fix critical safety issues first.
- If reports/human-required.md exists, continue safe code/docs work that does not need those missing items.

Required outputs:
- Update docs/codex-session-log.md and docs/fix-roadmap.md when you change code/docs.
- If product/security/billing/Meta readiness changes, update the matching docs.
- Write reports/codex-dev-report.md summarizing files changed, commands considered, remaining blockers, and human-required items.

Do not ask questions. Continue until a safe stopping point.
"""
        codex_exit = run_codex(developer_prompt, REPORTS_DIR / f"codex-output-loop-{loop}.md")
        if codex_exit != 0:
            append_human_required(f"Codex developer step failed in loop {loop}; see reports/codex-output-loop-{loop}.md.")
            break

        install_exit = run_command(
            ["npm.cmd" if os.name == "nt" else "npm", "install"],
            REPORTS_DIR / f"npm-install-loop-{loop}.log",
            timeout=600,
        )
        if install_exit != 0:
            append_human_required(f"npm install failed in loop {loop}.")
            continue

        lint_exit = run_command(
            ["npm.cmd" if os.name == "nt" else "npm", "run", "lint"],
            REPORTS_DIR / f"lint-loop-{loop}.log",
            timeout=600,
        )
        if lint_exit != 0:
            continue

        test_exit = run_command(
            ["npm.cmd" if os.name == "nt" else "npm", "test"],
            REPORTS_DIR / f"test-loop-{loop}.log",
            timeout=900,
        )
        if test_exit != 0:
            append_human_required(f"npm test failed or needs a non-production TEST_DATABASE_URL in loop {loop}.")

        build_exit = run_command(
            ["npm.cmd" if os.name == "nt" else "npm", "run", "build"],
            REPORTS_DIR / f"build-loop-{loop}.log",
            timeout=900,
        )
        if build_exit != 0:
            continue

        payuni_exit = run_command(
            ["npm.cmd" if os.name == "nt" else "npm", "run", "payuni:smoke"],
            REPORTS_DIR / f"payuni-smoke-loop-{loop}.log",
            timeout=300,
        )
        if payuni_exit != 0:
            append_human_required(f"PayUNI sandbox smoke failed or missing sandbox env in loop {loop}.")

        if RUN_E2E:
            run_command(
                ["npm.cmd" if os.name == "nt" else "npm", "run", "test:e2e"],
                REPORTS_DIR / f"e2e-loop-{loop}.log",
                timeout=900,
            )

        server_ok = start_dev_server()
        if server_ok:
            route_smoke()
        else:
            append_human_required(f"Local dev server did not become reachable at {APP_URL}.")

        vercel_readiness(loop)
        supabase_readiness(loop)
        health_checks()

        qa_prompt = f"""
You are the InboxPilot QA reviewer for an unattended autopilot run.

Read:
- AUTOPILOT.md
- reports/codex-dev-report.md
- reports/route-smoke.md
- reports/lint-loop-{loop}.log
- reports/test-loop-{loop}.log
- reports/build-loop-{loop}.log
- reports/payuni-smoke-loop-{loop}.log
- reports/vercel-report.md
- reports/supabase-report.md
- reports/health-report.md

Review homepage, login, dashboard, inbox, contacts, channels/connect/instagram, analytics, automations, referrals, pricing/billing, and docs readiness from available code/test evidence.

Write reports/qa-report.md.
Include exactly one line:
QA_STATUS=PASS
or
QA_STATUS=FAIL

Use QA_STATUS=FAIL for any blocker, critical, or major issue.
"""
        run_codex(qa_prompt, REPORTS_DIR / f"qa-output-loop-{loop}.md")

        safety_prompt = """
You are the InboxPilot safety reviewer for an unattended autopilot run.

Review:
- source code changes
- docs changes
- reports
- git diff

Check:
1. hardcoded secrets or leaked env values
2. `.env*` committed or modified
3. production DB/schema risk
4. Prisma/Supabase destructive commands
5. tenant isolation risk
6. auth / CSRF / webhook signature / idempotency risks
7. Meta App Review submission or dashboard actions
8. PayUNI sandbox/prod separation
9. Vercel Production deployment risk
10. custom domain alias crossing

Fix only critical documentation/code issues if safe.
Write reports/safety-report.md.
Include exactly one line:
SAFETY_STATUS=PASS
or
SAFETY_STATUS=FAIL
"""
        run_codex(safety_prompt, REPORTS_DIR / f"safety-output-loop-{loop}.md")

        qa_passed = file_contains(REPORTS_DIR / "qa-report.md", r"QA_STATUS=PASS")
        safety_passed = file_contains(REPORTS_DIR / "safety-report.md", r"SAFETY_STATUS=PASS")
        forbidden_clean = scan_for_forbidden_commands()

        if qa_passed and safety_passed and forbidden_clean and build_exit == 0 and lint_exit == 0:
            final_prompt = f"""
Create reports/final-report.md for InboxPilot Autopilot.

Summarize:
1. launch status: PREVIEW_READY, LAUNCH_READY, or HUMAN_REQUIRED
2. completed loops and phases
3. lint/test/build/payuni results
4. Vercel Preview readiness and URL if created
5. Supabase readiness
6. production/staging alias and health status
7. remaining human-required items
8. exact commands run
9. production go/no-go
10. PayUNI status, confirming sandbox remains active

Do not modify product code.
"""
            run_codex(final_prompt, REPORTS_DIR / "final-output.md")
            stop_dev_server()
            write_step("AUTOPILOT COMPLETE")
            return

        print("QA or safety did not pass; continuing next loop.", flush=True)

    stop_dev_server()
    stop_prompt = """
Create reports/final-report.md.

The autopilot stopped before all gates passed.

Summarize:
1. completed work
2. latest failing gate
3. latest QA issues
4. latest safety issues
5. latest Vercel / Supabase / PayUNI status
6. exact HUMAN_REQUIRED items
7. exact command to rerun autopilot

Do not modify product code.
"""
    run_codex(stop_prompt, REPORTS_DIR / "final-output-maxloops.md")


if __name__ == "__main__":
    main()
