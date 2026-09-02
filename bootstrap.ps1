[CmdletBinding()]
param(
    [string]$HomePath = $HOME,
    [string]$Project,
    [switch]$ProjectOnly,
    [ValidateSet("fail", "skip", "backup")]
    [string]$Conflict = "fail",
    [switch]$NoLaunch,
    [switch]$StructuralOnly
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"

$NodeVersion = "v24.20.0"
$RepoDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$TargetHome = [System.IO.Path]::GetFullPath($HomePath)
if ($ProjectOnly -and [string]::IsNullOrWhiteSpace($Project)) {
    throw "-ProjectOnly requires -Project."
}
if (-not [string]::IsNullOrWhiteSpace($Project)) {
    $Project = [System.IO.Path]::GetFullPath($Project)
    if (-not (Test-Path -LiteralPath $Project -PathType Container)) {
        throw "Project directory does not exist: $Project"
    }
}

$RuntimeDir = Join-Path $TargetHome ".local\share\agent-orchestra"
$BinDir = Join-Path $RuntimeDir "bin"
$NpmPrefix = Join-Path $RuntimeDir "npm"
New-Item -ItemType Directory -Force -Path $BinDir, $NpmPrefix | Out-Null
$env:HOME = $TargetHome
$env:USERPROFILE = $TargetHome
$env:Path = "$BinDir;$NpmPrefix;$env:Path"

function Write-Step([string]$Message) {
    Write-Host "`n==> $Message"
}

function Test-UsableNode {
    $node = Get-Command node -ErrorAction SilentlyContinue
    $npm = Get-Command npm.cmd -ErrorAction SilentlyContinue
    if ($null -eq $node -or $null -eq $npm) { return $false }
    $major = [int]((& $node.Source -p 'Number(process.versions.node.split(".")[0])').Trim())
    return $major -ge 20
}

if (-not (Test-UsableNode)) {
    # Herdr and OpenCode publish Windows x86_64 binaries. Windows ARM64 runs
    # these through its documented x86_64 emulation layer.
    $Architecture = "x64"
    $Archive = "node-$NodeVersion-win-$Architecture.zip"
    $NodeDir = Join-Path $RuntimeDir "node-$NodeVersion-win-$Architecture"
    $NodeExe = Join-Path $NodeDir "node.exe"
    if (-not (Test-Path -LiteralPath $NodeExe -PathType Leaf)) {
        Write-Step "Installing isolated Node.js $NodeVersion"
        $Temporary = Join-Path ([System.IO.Path]::GetTempPath()) ("agent-orchestra-" + [guid]::NewGuid().ToString("N"))
        New-Item -ItemType Directory -Path $Temporary | Out-Null
        try {
            $Base = "https://nodejs.org/dist/$NodeVersion"
            $Checksums = Join-Path $Temporary "SHASUMS256.txt"
            $ArchivePath = Join-Path $Temporary $Archive
            Invoke-WebRequest -UseBasicParsing -Uri "$Base/SHASUMS256.txt" -OutFile $Checksums
            Invoke-WebRequest -UseBasicParsing -Uri "$Base/$Archive" -OutFile $ArchivePath
            $ChecksumLine = Get-Content -LiteralPath $Checksums | Where-Object { $_ -match "\s+$([regex]::Escape($Archive))$" } | Select-Object -First 1
            if ([string]::IsNullOrWhiteSpace($ChecksumLine)) { throw "Node.js checksum is missing for $Archive" }
            $Expected = ($ChecksumLine -split '\s+')[0].ToLowerInvariant()
            $Actual = (Get-FileHash -Algorithm SHA256 -LiteralPath $ArchivePath).Hash.ToLowerInvariant()
            if ($Actual -ne $Expected) { throw "Node.js checksum did not match." }
            $Extracted = Join-Path $Temporary "extracted"
            Expand-Archive -LiteralPath $ArchivePath -DestinationPath $Extracted
            $Source = Get-ChildItem -LiteralPath $Extracted -Directory | Select-Object -First 1
            New-Item -ItemType Directory -Force -Path $NodeDir | Out-Null
            Copy-Item -Path (Join-Path $Source.FullName "*") -Destination $NodeDir -Recurse -Force
        } finally {
            Remove-Item -LiteralPath $Temporary -Recurse -Force -ErrorAction SilentlyContinue
        }
    }
    $env:Path = "$NodeDir;$env:Path"
}

if ($null -eq (Get-Command herdr.exe -ErrorAction SilentlyContinue)) {
    Write-Step "Installing Herdr into the isolated runtime"
    $Temporary = Join-Path ([System.IO.Path]::GetTempPath()) ("agent-orchestra-herdr-" + [guid]::NewGuid().ToString("N"))
    New-Item -ItemType Directory -Path $Temporary | Out-Null
    try {
        $Manifest = Invoke-RestMethod -UseBasicParsing -Uri "https://herdr.dev/latest.json"
        $AssetProperty = $Manifest.assets.PSObject.Properties["windows-x86_64"]
        if ($null -eq $AssetProperty) { throw "Herdr manifest has no Windows x86_64 package." }
        $Asset = $AssetProperty.Value
        $Url = if ($Asset -is [string]) { [string]$Asset } else { [string]$Asset.url }
        $ShaProperty = $Manifest.sha256.PSObject.Properties["windows-x86_64"]
        $Expected = if ($null -ne $ShaProperty) { [string]$ShaProperty.Value } elseif ($Asset -isnot [string]) { [string]$Asset.sha256 } else { "" }
        if ($Expected -notmatch '^[0-9a-fA-F]{64}$') { throw "Herdr manifest has no valid Windows SHA-256 checksum." }
        $ArchivePath = Join-Path $Temporary "herdr-windows-x86_64.zip"
        Invoke-WebRequest -UseBasicParsing -Uri $Url -OutFile $ArchivePath
        $Actual = (Get-FileHash -Algorithm SHA256 -LiteralPath $ArchivePath).Hash
        if ($Actual -ine $Expected) { throw "Herdr checksum did not match." }
        $Extracted = Join-Path $Temporary "extracted"
        Expand-Archive -LiteralPath $ArchivePath -DestinationPath $Extracted
        $HerdrExe = Get-ChildItem -LiteralPath $Extracted -Recurse -File -Filter "herdr.exe" | Select-Object -First 1
        if ($null -eq $HerdrExe) { throw "Herdr package did not contain herdr.exe." }
        Copy-Item -Path (Join-Path $HerdrExe.Directory.FullName "*") -Destination $BinDir -Recurse -Force
    } finally {
        Remove-Item -LiteralPath $Temporary -Recurse -Force -ErrorAction SilentlyContinue
    }
}

if ($null -eq (Get-Command opencode.exe -ErrorAction SilentlyContinue) -and $null -eq (Get-Command opencode.cmd -ErrorAction SilentlyContinue)) {
    Write-Step "Installing OpenCode into the isolated runtime"
    & npm.cmd install --global --prefix $NpmPrefix opencode-ai
    if ($LASTEXITCODE -ne 0) { throw "OpenCode installation failed." }
}

$Node = (Get-Command node.exe).Source
$Herdr = (Get-Command herdr.exe).Source
$OpenCodeCommand = Get-Command opencode.exe -ErrorAction SilentlyContinue
if ($null -eq $OpenCodeCommand) { $OpenCodeCommand = Get-Command opencode.cmd -ErrorAction Stop }

Write-Step "Detected tools"
& $Node --version
& $Herdr --version
& $OpenCodeCommand.Source --version

$InstallArgs = @("install", "--home", $TargetHome, "--conflict", $Conflict)
$DoctorArgs = @("doctor", "--home", $TargetHome, "--installed")
if (-not [string]::IsNullOrWhiteSpace($Project)) {
    $InstallArgs += @("--project", $Project)
    $DoctorArgs += @("--project", $Project)
}
if ($ProjectOnly) {
    $InstallArgs += "--project-only"
    $DoctorArgs += "--project-only"
}
if ($StructuralOnly) { $InstallArgs += "--structural" }

Write-Step "Installing the agent team"
& $Node (Join-Path $RepoDir "orchestra.mjs") @InstallArgs
if ($LASTEXITCODE -ne 0) { throw "Agent team installation failed." }

if ($StructuralOnly) {
    Write-Step "Verifying files and runtime structurally"
    & $Node (Join-Path $RepoDir "orchestra.mjs") @DoctorArgs --structural
    if ($LASTEXITCODE -ne 0) { throw "Structural verification failed." }
} else {
    Write-Step "Verifying authenticated model routes"
    & $Node (Join-Path $RepoDir "orchestra.mjs") @DoctorArgs
    if ($LASTEXITCODE -ne 0) { throw "Model verification failed. Connect an OpenCode provider and run bootstrap.ps1 again." }
}

Write-Host "`nREADY: agent-orchestra is installed and verified."
if ($NoLaunch) { exit 0 }

$LaunchDir = if ([string]::IsNullOrWhiteSpace($Project)) { $RepoDir } else { $Project }
Set-Location -LiteralPath $LaunchDir
Write-Step "Opening the dedicated agent-orchestra Herdr session"
$OpenCodeExe = Join-Path $NpmPrefix "node_modules\opencode-ai\bin\opencode.exe"
if (-not (Test-Path -LiteralPath $OpenCodeExe -PathType Leaf)) {
    if ($OpenCodeCommand.Source.EndsWith(".exe", [System.StringComparison]::OrdinalIgnoreCase)) {
        $OpenCodeExe = $OpenCodeCommand.Source
    } else {
        $GlobalNpmRoot = (& npm.cmd root --global).Trim()
        $GlobalNpmOpenCode = Join-Path $GlobalNpmRoot "opencode-ai\bin\opencode.exe"
        if (Test-Path -LiteralPath $GlobalNpmOpenCode -PathType Leaf) {
            $OpenCodeExe = $GlobalNpmOpenCode
        } else {
            throw "Could not resolve the native OpenCode executable required by Herdr."
        }
    }
}
$HerdrConfig = Join-Path $RuntimeDir "herdr.toml"
$TomlOpenCode = $OpenCodeExe.Replace("\", "\\").Replace('"', '\"')
$HerdrConfigContent = @"
[terminal]
default_shell = "$TomlOpenCode"
shell_mode = "non_login"
new_cwd = "current"
"@
$Utf8WithoutBom = [System.Text.UTF8Encoding]::new($false)
[System.IO.File]::WriteAllText($HerdrConfig, $HerdrConfigContent, $Utf8WithoutBom)
$env:HERDR_CONFIG_PATH = $HerdrConfig
$env:OPENCODE_CONFIG_CONTENT = '{"default_agent":"lenka"}'
& $Herdr --session agent-orchestra
