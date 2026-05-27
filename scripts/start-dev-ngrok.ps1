param(
  [int]$Port = 3041,
  [string]$NgrokUrl = ""
)

$ErrorActionPreference = "Stop"

function Get-EnvValue {
  param([string]$Name)

  $envPath = Join-Path (Get-Location) ".env"
  if (-not (Test-Path -LiteralPath $envPath)) {
    return ""
  }

  $line = Get-Content -LiteralPath $envPath |
    Where-Object { $_ -match "^\s*$Name\s*=" } |
    Select-Object -First 1

  if (-not $line) {
    return ""
  }

  $value = ($line -split "=", 2)[1].Trim()
  return $value.Trim('"').Trim("'")
}

if (-not $NgrokUrl) {
  $NgrokUrl = $env:NGROK_URL
}

if (-not $NgrokUrl) {
  $NgrokUrl = Get-EnvValue "APP_URL"
}

if (-not $NgrokUrl) {
  $NgrokUrl = "https://superman-undiluted-hastily.ngrok-free.dev"
}

$ngrokCommand = Get-Command ngrok -ErrorAction SilentlyContinue
if (-not $ngrokCommand) {
  throw "ngrok was not found. Install ngrok or make sure ngrok.exe is in PATH."
}

$portOwner = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue |
  Select-Object -First 1
if ($portOwner) {
  throw "Port $Port is already used by PID $($portOwner.OwningProcess). Stop that service first."
}

$ngrokOut = Join-Path (Get-Location) ".ngrok.out.log"
$ngrokErr = Join-Path (Get-Location) ".ngrok.err.log"
$ngrokArgs = @("http", $Port, "--url", $NgrokUrl, "--log", "stdout")
$ngrokProcess = $null
$ngrokAlreadyRunning = $false

try {
  try {
    $existingTunnels = Invoke-RestMethod -Uri "http://127.0.0.1:4040/api/tunnels" -TimeoutSec 2
    $existingTunnel = $existingTunnels.tunnels |
      Where-Object { $_.public_url -eq $NgrokUrl } |
      Select-Object -First 1

    if ($existingTunnel) {
      $existingAddress = [string]$existingTunnel.config.addr
      if ($existingAddress -match "(:|/)$Port/?$") {
        $ngrokAlreadyRunning = $true
        Write-Host "Reusing existing ngrok: $NgrokUrl -> $existingAddress"
      } else {
        throw "The fixed ngrok URL is already running, but it points to $existingAddress instead of port $Port. Stop the old ngrok process and retry."
      }
    }
  } catch {
    if ($_.Exception.Message -like "The fixed ngrok URL is already running*") {
      throw
    }
  }

  if (-not $ngrokAlreadyRunning) {
    Write-Host "Starting ngrok: $NgrokUrl -> http://localhost:$Port"
    $ngrokProcess = Start-Process `
      -FilePath $ngrokCommand.Source `
      -ArgumentList $ngrokArgs `
      -WorkingDirectory (Get-Location) `
      -RedirectStandardOutput $ngrokOut `
      -RedirectStandardError $ngrokErr `
      -WindowStyle Hidden `
      -PassThru
  }

  $ready = $false
  for ($i = 0; $i -lt 20; $i++) {
    Start-Sleep -Milliseconds 500
    try {
      $tunnels = Invoke-RestMethod -Uri "http://127.0.0.1:4040/api/tunnels" -TimeoutSec 2
      $ready = [bool]($tunnels.tunnels | Where-Object { $_.public_url -eq $NgrokUrl })
      if ($ready) {
        break
      }
    } catch {
      # ngrok inspection API is still starting.
    }
  }

  if (-not $ready) {
    Write-Warning "ngrok started, but the fixed URL was not confirmed through the 4040 inspection API. If Meta webhooks do not arrive, check .ngrok.err.log."
  }

  Write-Host "Ensuring local admin account..."
  npm.cmd run admin:ensure

  Write-Host "Starting Next.js: http://localhost:$Port"
  Write-Host "Public URL: $NgrokUrl"
  npm.cmd run dev
} finally {
  if ($ngrokProcess -and -not $ngrokProcess.HasExited) {
    Write-Host "Stopping ngrok..."
    Stop-Process -Id $ngrokProcess.Id -Force -ErrorAction SilentlyContinue
  }
}
