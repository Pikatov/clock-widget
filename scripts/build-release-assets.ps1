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

function Assert-Command([string]$name, [string]$hint) {
  if (-not (Get-Command $name -ErrorAction SilentlyContinue)) {
    throw "Missing '$name'. $hint"
  }
}

$root = Get-ProjectRoot
Push-Location $root

try {
  Assert-Command "cargo" "Install Rust: https://www.rust-lang.org/tools/install"

  & cargo tauri --version | Out-Null
  if ($LASTEXITCODE -ne 0) {
    throw "Missing Tauri CLI. Install it with: cargo install tauri-cli --version ""^1"" --locked"
  }

  $version = Get-CargoVersion (Join-Path $root "Cargo.toml")
  $out = Join-Path $root $OutDir
  New-Item -ItemType Directory -Force -Path $out | Out-Null

  Write-Host "Building MSI installer..."
  & cargo tauri build --bundles msi
  if ($LASTEXITCODE -ne 0) {
    throw "Tauri MSI build failed."
  }

  $msiDir = Join-Path $root "target\release\bundle\msi"
  $msi = Get-ChildItem -Path $msiDir -Filter "*.msi" -ErrorAction Stop |
    Sort-Object LastWriteTime -Descending |
    Select-Object -First 1

  if (-not $msi) {
    throw "MSI build finished, but no .msi file was found in: $msiDir"
  }

  Copy-Item -Force $msi.FullName (Join-Path $out $msi.Name)

  $exe = Join-Path $root "target\release\clock-widget.exe"
  if (-not (Test-Path $exe)) {
    throw "Release executable was not found at: $exe"
  }

  $zipName = "ClockWidget-$version-portable-win11.zip"
  $zipPath = Join-Path $out $zipName
  $staging = Join-Path $env:TEMP ("clock-widget-release-" + [Guid]::NewGuid().ToString("N"))

  New-Item -ItemType Directory -Force -Path $staging | Out-Null
  Copy-Item -Force $exe (Join-Path $staging "ClockWidget.exe")
  Copy-Item -Force (Join-Path $root "PORTABLE.txt") (Join-Path $staging "README.txt")
  Copy-Item -Force (Join-Path $root "LICENSE") (Join-Path $staging "LICENSE.txt")

  if (Test-Path $zipPath) { Remove-Item -Force $zipPath }
  Compress-Archive -Path (Join-Path $staging "*") -DestinationPath $zipPath -Force
  Remove-Item -Recurse -Force $staging

  Write-Host "Release assets:"
  Get-ChildItem -Path $out -File | Sort-Object Name | ForEach-Object {
    Write-Host ("- " + $_.FullName)
  }
} finally {
  Pop-Location
}
