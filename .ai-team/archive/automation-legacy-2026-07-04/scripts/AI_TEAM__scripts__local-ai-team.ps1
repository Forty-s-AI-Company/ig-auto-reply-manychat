param(
  [switch]$QaOnly,
  [switch]$Once,
  [int]$Interval = 15,
  [switch]$AlwaysRun,
  [switch]$EnableGitDelivery,
  [switch]$EnableMerge,
  [switch]$EnableDeploy,
  [switch]$DisableDryRun,
  [switch]$DisableAutoBranch,
  [switch]$AllowMergeWithoutChecks,
  [ValidateSet("preview", "production")]
  [string]$DeployTarget = "preview",
  [string]$TestDatabaseUrl,
  [string]$TestDirectUrl,
  [string]$LogPath,
  [ValidateSet("general", "advanced", "sleep")]
  [string]$Mode = "general"
)

& chcp.com 65001 > $null

try {
  [Console]::InputEncoding = [System.Text.UTF8Encoding]::new($false)
  [Console]::OutputEncoding = [System.Text.UTF8Encoding]::new($false)
  $OutputEncoding = [System.Text.UTF8Encoding]::new($false)
} catch {
}

if ($PSStyle) {
  $PSStyle.OutputRendering = "PlainText"
}

$env:NO_COLOR = "1"
if (Test-Path Env:FORCE_COLOR) {
  Remove-Item Env:FORCE_COLOR
}

Set-Location (Join-Path $PSScriptRoot "..\..")

if ($TestDatabaseUrl) {
  $env:TEST_DATABASE_URL = $TestDatabaseUrl
}

if ($TestDirectUrl) {
  $env:TEST_DIRECT_URL = $TestDirectUrl
}

$env:AI_TEAM_MODE = $Mode
$env:AI_TEAM_RUNNER_MODE = $Mode

if ($Mode -eq "advanced") {
  $env:AI_TEAM_QA_LEVEL = "full"
  $env:AI_TEAM_BROWSER_QA_MODEL = "Gemini 3.5 Flash"
  $env:AI_TEAM_BROWSER_QA_FALLBACK_MODEL = "Gemini 3.5 Pro"
}

if ($EnableGitDelivery) {
  $env:AI_TEAM_ENABLE_GIT_DELIVERY = "1"
  $env:AI_TEAM_GIT_COMMIT = "1"
  $env:AI_TEAM_GIT_PUSH = "1"
  $env:AI_TEAM_GIT_PR = "1"
}

if ($EnableMerge) {
  $env:AI_TEAM_GIT_MERGE = "1"
}

if ($EnableDeploy) {
  $env:AI_TEAM_DEPLOY = "1"
  $env:AI_TEAM_DEPLOY_TARGET = $DeployTarget
}

if ($DisableDryRun) {
  $env:AI_TEAM_GIT_DRY_RUN = "0"
}

if ($DisableAutoBranch) {
  $env:AI_TEAM_GIT_AUTO_BRANCH = "0"
}

if ($AllowMergeWithoutChecks) {
  $env:AI_TEAM_GIT_ALLOW_MERGE_WITHOUT_CHECKS = "1"
}

if ($QaOnly) {
  Write-Host "[AI_TEAM] 啟動本機 QA 控制台..."
  Write-Host "[AI_TEAM] 工作目錄: $(Get-Location)"
  if ($env:TEST_DATABASE_URL) {
    Write-Host "[AI_TEAM] TEST_DATABASE_URL 已設定。"
  }
  if ($LogPath) {
    npm run ai-team:qa 2>&1 | Out-File -FilePath $LogPath -Encoding utf8
    Get-Content -Path $LogPath
    exit $LASTEXITCODE
  }

  npm run ai-team:qa
  exit $LASTEXITCODE
}

$loopCommand = if ($Mode -eq "sleep") { "ai-team:loop:sleep" } elseif ($Mode -eq "advanced") { "ai-team:loop:advanced" } else { "ai-team:loop:general" }
$loopArgs = @("run", $loopCommand, "--", "--interval=$Interval")

if ($Once) {
  $loopArgs += "--once"
}

if ($AlwaysRun) {
  $loopArgs += "--always-run"
}

Write-Host "[AI_TEAM] 啟動本機長跑控制台..."
Write-Host "[AI_TEAM] 工作目錄: $(Get-Location)"
Write-Host "[AI_TEAM] 本地模型模式: $Mode"
if ($env:TEST_DATABASE_URL) {
  Write-Host "[AI_TEAM] TEST_DATABASE_URL 已設定。"
}
if ($EnableGitDelivery) {
  Write-Host "[AI_TEAM] Git delivery: ENABLED"
}
if ($EnableMerge) {
  Write-Host "[AI_TEAM] Auto merge: ENABLED"
}
if ($EnableDeploy) {
  Write-Host "[AI_TEAM] Deploy: ENABLED ($DeployTarget)"
}
Write-Host "[AI_TEAM] 指令: npm $($loopArgs -join ' ')"

if ($LogPath) {
  npm @loopArgs 2>&1 | Out-File -FilePath $LogPath -Encoding utf8
  Get-Content -Path $LogPath
  exit $LASTEXITCODE
}

npm @loopArgs
