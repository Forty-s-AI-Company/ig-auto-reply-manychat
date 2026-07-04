# CLI Discovery - 2026-07-04

- OS: `Windows-10-10.0.19045-SP0`
- Root: `C:\Users\eden\Downloads\AI\ig-auto-reply-manychat`
- Package manager: `npm`

## Probes

| Command | Found | Exit | Path | Notes |
|---|---:|---:|---|---|
| `codex --help` | True | 0 | `C:\nvm4w\nodejs\codex.CMD` |      Print this message or the help of the given subcommand(s)  Arguments:   [PROMPT]           Optional user prompt to start the session  Options:   -c, --config <key=value>       |
| `codex exec --help` | True | 0 | `C:\nvm4w\nodejs\codex.CMD` | Run Codex non-interactively  Usage: codex exec [OPTIONS] [PROMPT]        codex exec [OPTIONS] <COMMAND> [ARGS]  Commands:   resume  Resume a previous session by id or pick the most |
| `antigravity --help` | False | None | `None` |  |
| `agy --help` | True | 0 | `C:\Users\eden\AppData\Local\agy\bin\agy.EXE` | Usage of agy:   --add-dir                       Add a directory to the workspace (repeatable) (default [])   -c                              Short alias for --continue   --continue |
| `gemini --help` | True | 0 | `C:\nvm4w\nodejs\gemini.CMD` | Usage: gemini [options] [command]  Gemini CLI - Defaults to interactive mode. Use -p/--prompt for non-interactive (headless) mode.  Commands:   gemini mcp                   Manage  |
| `node --version` | True | 0 | `C:\nvm4w\nodejs\node.EXE` | v24.13.0  |
| `npm --version` | True | 0 | `C:\nvm4w\nodejs\npm.CMD` | 11.6.2  |
| `python --version` | True | 0 | `C:\Program Files\Python311\python.EXE` | Python 3.11.9  |
| `git --version` | True | 0 | `C:\Program Files\Git\cmd\git.EXE` | git version 2.52.0.windows.1  |

## Detected Project Commands

- `install`: `npm install`
- `lint`: `eslint`
- `build`: `node scripts/prisma-generate-safe.mjs && next build`
- `test`: `node scripts/run-tests.mjs`
- `e2e`: `playwright test`
- `reviewer_e2e`: `npm run e2e:reviewer:ensure && playwright test tests/e2e/meta-reviewer-rehearsal.spec.ts --workers=1`
- `payuni_sandbox`: `tsx scripts/payuni-smoke-test.mjs`
