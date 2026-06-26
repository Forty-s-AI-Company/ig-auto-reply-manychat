$ErrorActionPreference = "Stop"

$ProjectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$ScriptsDir = Join-Path $ProjectRoot "scripts"
$ReportsDir = Join-Path $ProjectRoot "reports"
$LogPath = Join-Path $ReportsDir "autopilot-live.log"

New-Item -ItemType Directory -Force -Path $ReportsDir | Out-Null
Set-Location $ProjectRoot

chcp 65001 | Out-Null
$Utf8NoBom = [System.Text.UTF8Encoding]::new($false)
[Console]::InputEncoding = $Utf8NoBom
[Console]::OutputEncoding = $Utf8NoBom
$OutputEncoding = $Utf8NoBom

$env:PYTHONUTF8 = "1"
$env:PYTHONIOENCODING = "utf-8"
$env:LANG = "zh_TW.UTF-8"
$env:LC_ALL = "zh_TW.UTF-8"
$env:LESSCHARSET = "utf-8"

if (-not $env:AUTOPILOT_MAX_LOOPS) {
    $env:AUTOPILOT_MAX_LOOPS = "8"
}

if (-not $env:CODEX_TIMEOUT_SECONDS) {
    $env:CODEX_TIMEOUT_SECONDS = "1200"
}

if (-not $env:INBOXPILOT_AUTOPILOT_PREVIEW_DEPLOY) {
    $env:INBOXPILOT_AUTOPILOT_PREVIEW_DEPLOY = "1"
}

if (-not $env:INBOXPILOT_AUTOPILOT_E2E) {
    $env:INBOXPILOT_AUTOPILOT_E2E = "0"
}

if (-not $env:INBOXPILOT_AUTOPILOT_ALLOW_PRODUCTION) {
    $env:INBOXPILOT_AUTOPILOT_ALLOW_PRODUCTION = "0"
}

$ScriptPath = Join-Path $ScriptsDir "autopilot_full_start.py"
py $ScriptPath 2>&1 | Tee-Object -FilePath $LogPath
