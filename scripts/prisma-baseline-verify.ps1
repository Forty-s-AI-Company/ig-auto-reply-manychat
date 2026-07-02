param(
  [string]$DatabaseUrl = $env:BASELINE_DATABASE_URL,
  [int]$DockerPort = 55432,
  [switch]$DryRun
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

$ProductionProjectRef = 'lmwvzskffzozuiamjxvc'
$ContainerName = 'inboxpilot-baseline-' + [guid]::NewGuid().ToString('N').Substring(0, 12)
$LocalPassword = 'local-baseline-only'
$StartedContainer = $false

function Write-Step([string]$Message) {
  Write-Output "[baseline] $Message"
}

function Assert-NonProductionUrl([string]$Url) {
  if ([string]::IsNullOrWhiteSpace($Url)) {
    throw 'Database URL is empty.'
  }

  if ($Url.Contains($ProductionProjectRef)) {
    throw "Refusing to run baseline verification against production project ref $ProductionProjectRef."
  }

  if ($Url -match 'inboxpilot\.carry-digital-nomad\.in\.net') {
    throw 'Refusing to run baseline verification against production domain.'
  }
}

function Invoke-StepCommand([string]$Label, [scriptblock]$Command) {
  Write-Step $Label

  if ($DryRun) {
    Write-Step "dry-run: skipped command body for '$Label'"
    return
  }

  & $Command
  if ($LASTEXITCODE -ne 0) {
    throw "$Label failed with exit code $LASTEXITCODE."
  }
}

try {
  $migrations = Get-ChildItem -LiteralPath 'prisma/migrations' -Directory |
    Sort-Object Name |
    ForEach-Object { $_.Name }

  if ($migrations.Count -eq 0) {
    throw 'No local Prisma migrations found.'
  }

  if ([string]::IsNullOrWhiteSpace($DatabaseUrl)) {
    $DatabaseUrl = "postgresql://postgres:$LocalPassword@127.0.0.1:$DockerPort/postgres?schema=public"

    Invoke-StepCommand 'check docker daemon' {
      docker info | Out-Null
    }

    Write-Step "disposable clone target: $ContainerName on localhost:$DockerPort"

    if (-not $DryRun) {
      Write-Step "start disposable postgres container $ContainerName"
      docker run --name $ContainerName `
        -e POSTGRES_PASSWORD=$LocalPassword `
        -e POSTGRES_DB=postgres `
        -p "${DockerPort}:5432" `
        -d postgres:16-alpine | Out-Null
      $StartedContainer = $true
    }

    Write-Step 'wait for disposable postgres readiness'
    if (-not $DryRun) {
      $ready = $false
      for ($i = 0; $i -lt 30; $i++) {
        docker exec $ContainerName pg_isready -U postgres -d postgres | Out-Null
        if ($LASTEXITCODE -eq 0) {
          $ready = $true
          break
        }
        Start-Sleep -Seconds 1
      }
      if (-not $ready) {
        throw 'Disposable postgres did not become ready.'
      }
    }

    $env:DATABASE_URL = $DatabaseUrl
    $env:DIRECT_URL = $DatabaseUrl

    Invoke-StepCommand 'create production-like schema in disposable clone without migration history' {
      npx.cmd prisma db push --schema prisma/schema.prisma --skip-generate --accept-data-loss
    }

    Invoke-StepCommand 'confirm _prisma_migrations is absent before baseline' {
      docker exec $ContainerName psql -U postgres -d postgres -tAc "SELECT COALESCE(to_regclass('public._prisma_migrations')::text, 'missing');"
    }
  } else {
    Assert-NonProductionUrl $DatabaseUrl
    $env:DATABASE_URL = $DatabaseUrl
    $env:DIRECT_URL = $DatabaseUrl
    Write-Step 'using provided non-production BASELINE_DATABASE_URL'
  }

  Write-Step "mark $($migrations.Count) migrations as applied"
  foreach ($migration in $migrations) {
    Invoke-StepCommand "resolve applied $migration" {
      npx.cmd prisma migrate resolve --schema prisma/schema.prisma --applied $migration
    }
  }

  Invoke-StepCommand 'verify migrate status is clean after baseline' {
    npx.cmd prisma migrate status --schema prisma/schema.prisma
  }

  Invoke-StepCommand 'verify schema diff is empty after baseline' {
    $diffOutput = npx.cmd prisma migrate diff --from-url $DatabaseUrl --to-schema-datamodel prisma/schema.prisma --script
    $nonEmpty = @($diffOutput | Where-Object { $_.Trim() -ne '' -and $_ -notmatch '^-- This is an empty migration' })
    Write-Output "[baseline] diff non-empty lines: $($nonEmpty.Count)"
    if ($nonEmpty.Count -gt 0) {
      $nonEmpty | Select-Object -First 80 | ForEach-Object { Write-Output $_ }
      exit 1
    }
  }

  if ($DryRun) {
    Write-Step 'dry-run passed'
  } else {
    Write-Step 'baseline verification passed'
  }
} finally {
  $env:DATABASE_URL = $null
  $env:DIRECT_URL = $null

  if ($StartedContainer) {
    Write-Step "cleanup disposable postgres container $ContainerName"
    docker rm -f $ContainerName | Out-Null
  }
}
