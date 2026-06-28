param(
  [switch]$Once,
  [int]$Interval = 15,
  [switch]$AlwaysRun,
  [ValidateSet("general", "sleep")]
  [string]$Mode = "general"
)

Set-Location (Join-Path $PSScriptRoot "..\..")

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
Write-Host "[AI_TEAM] 指令: npm $($loopArgs -join ' ')"

npm @loopArgs
