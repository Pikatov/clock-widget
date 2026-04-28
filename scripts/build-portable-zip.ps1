param(
  [string]$OutDir = "dist"
)

$ErrorActionPreference = "Stop"

function Get-ProjectRoot {
  $here = $PSScriptRoot
  if (-not $here) {
    $here = Split-Path -Parent $PSCommandPath
  }
  return (Resolve-Path (Join-Path $here "..")).Path
}

function Get-CargoVersion([string]$cargoTomlPath) {
  $m = Select-String -Path $cargoTomlPath -Pattern '^\s*version\s*=\s*"([^"]+)"\s*$' -AllMatches
  if (-not $m) { return "0.0.0" }
  return $m.Matches[0].Groups[1].Value
}

function Assert-Command([string]$name) {
  if (-not (Get-Command $name -ErrorAction SilentlyContinue)) {
    throw "Missing '$name'. Install it and retry."
  }
}

function Get-ReleaseExe([string]$root) {
  $releaseDir = Join-Path $root "target\release"
  $knownNames = @(
    "clock-widget.exe",
    "Clock Widget.exe",
    "ClockWidget.exe"
  )

  foreach ($name in $knownNames) {
    $candidate = Join-Path $releaseDir $name
    if (Test-Path $candidate) {
      return $candidate
    }
  }

  $exe = Get-ChildItem -Path $releaseDir -Filter "*.exe" -File -ErrorAction SilentlyContinue |
    Sort-Object LastWriteTime -Descending |
    Select-Object -First 1

  if ($exe) {
    return $exe.FullName
  }

  throw "Release executable was not found in: $releaseDir"
}

$root = Get-ProjectRoot
Push-Location $root

try {
  Assert-Command "cargo"
  Assert-Command "powershell"

  $version = Get-CargoVersion (Join-Path $root "Cargo.toml")

  Write-Host "Building release (Windows)..."
  & cargo build --release
  if ($LASTEXITCODE -ne 0) {
    throw "Cargo release build failed."
  }

  $exe = Get-ReleaseExe $root
  Write-Host "Using release executable: $exe"

  $out = Join-Path $root $OutDir
  New-Item -ItemType Directory -Force -Path $out | Out-Null

  $zipName = "ClockWidget-$version-portable-win11.zip"
  $zipPath = Join-Path $out $zipName

  $staging = Join-Path $env:TEMP ("clock-widget-portable-" + [Guid]::NewGuid().ToString("N"))
  New-Item -ItemType Directory -Force -Path $staging | Out-Null

  Copy-Item -Force $exe (Join-Path $staging "ClockWidget.exe")
  Copy-Item -Force (Join-Path $root "PORTABLE.txt") (Join-Path $staging "README.txt")
  Copy-Item -Force (Join-Path $root "LICENSE") (Join-Path $staging "LICENSE.txt")

  if (Test-Path $zipPath) { Remove-Item -Force $zipPath }
  Compress-Archive -Path (Join-Path $staging "*") -DestinationPath $zipPath -Force
  Remove-Item -Recurse -Force $staging

  Write-Host "Created: $zipPath"
} finally {
  Pop-Location
}
