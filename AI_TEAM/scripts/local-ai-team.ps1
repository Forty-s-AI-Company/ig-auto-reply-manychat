param(
  [switch]$QaOnly,
  [switch]$Once,
  [int]$Interval = 15,
  [switch]$AlwaysRun,
  [string]$TestDatabaseUrl,
  [string]$TestDirectUrl,
  [string]$LogPath,
  [ValidateSet("general", "sleep")]
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

$loopCommand = if ($Mode -eq "sleep") { "ai-team:loop:sleep" } else { "ai-team:loop:general" }
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
Write-Host "[AI_TEAM] 指令: npm $($loopArgs -join ' ')"

if ($LogPath) {
  npm @loopArgs 2>&1 | Out-File -FilePath $LogPath -Encoding utf8
  Get-Content -Path $LogPath
  exit $LASTEXITCODE
}

npm @loopArgs
