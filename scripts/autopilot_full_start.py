import subprocess
import sys
from pathlib import Path


def main() -> int:
    script_dir = Path(__file__).resolve().parent
    autopilot_script = script_dir / "autopilot-full.py"

    if not autopilot_script.exists():
        print(f"Missing autopilot script: {autopilot_script}", file=sys.stderr)
        return 1

    process = subprocess.run([sys.executable, str(autopilot_script)], cwd=script_dir.parent)
    return process.returncode


if __name__ == "__main__":
    raise SystemExit(main())
