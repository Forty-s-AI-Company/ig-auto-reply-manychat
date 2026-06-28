param(
  [switch]$Once,
  [int]$Interval = 15,
  [switch]$AlwaysRun
)

Set-Location (Join-Path $PSScriptRoot "..\..")

$loopArgs = @("run", "ai-team:loop", "--", "--interval=$Interval")

if ($Once) {
  $loopArgs += "--once"
}

if ($AlwaysRun) {
  $loopArgs += "--always-run"
}

Write-Host "[AI_TEAM] 啟動本機長跑控制台..."
Write-Host "[AI_TEAM] 工作目錄: $(Get-Location)"
Write-Host "[AI_TEAM] 指令: npm $($loopArgs -join ' ')"

npm @loopArgs
