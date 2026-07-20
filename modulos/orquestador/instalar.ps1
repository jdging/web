[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)]
    [string]$ProjectRoot,

    [switch]$Apply
)

$ErrorActionPreference = 'Stop'

function Get-FileHashString([string]$Path) {
    return (Get-FileHash -LiteralPath $Path -Algorithm SHA256).Hash.ToLowerInvariant()
}

function Get-NormalizedTextHash([string]$Text) {
    $normalized = ($Text -replace "`r`n", "`n").Trim()
    $bytes = [System.Text.Encoding]::UTF8.GetBytes($normalized)
    $sha256 = [System.Security.Cryptography.SHA256]::Create()
    try {
        return ([System.BitConverter]::ToString($sha256.ComputeHash($bytes))).Replace('-', '').ToLowerInvariant()
    } finally {
        $sha256.Dispose()
    }
}

function Get-PreviousHash($Manifest, [string]$RelativePath) {
    if (-not $Manifest -or -not $Manifest.managed_files) { return $null }
    $property = $Manifest.managed_files.PSObject.Properties[$RelativePath]
    if ($property) { return [string]$property.Value }
    return $null
}

function Get-VersionOrNull([string]$CommandName) {
    $candidates = @()
    $versions = @()

    if ($CommandName -eq 'codex' -and $env:CODEX_CLI_PATH) {
        $candidates += $env:CODEX_CLI_PATH
    }

    foreach ($command in @(Get-Command $CommandName -All -ErrorAction SilentlyContinue)) {
        if ($command.Source) {
            $candidates += $command.Source
        }
    }

    if ($CommandName -eq 'codex' -and $env:LOCALAPPDATA) {
        $appBinRoot = Join-Path $env:LOCALAPPDATA 'OpenAI\Codex\bin'
        if (Test-Path -LiteralPath $appBinRoot -PathType Container) {
            $candidates += @(
                Get-ChildItem -LiteralPath $appBinRoot -Directory -ErrorAction SilentlyContinue |
                    ForEach-Object { Join-Path $_.FullName 'codex.exe' } |
                    Where-Object { Test-Path -LiteralPath $_ -PathType Leaf } |
                    Sort-Object { (Get-Item -LiteralPath $_).LastWriteTimeUtc } -Descending
            )
        }
    }

    foreach ($candidate in @($candidates | Where-Object { $_ } | Select-Object -Unique)) {
        if (-not (Test-Path -LiteralPath $candidate -PathType Leaf)) { continue }
        try {
            $text = (& $candidate --version 2>$null | Out-String).Trim()
            $exitCode = $LASTEXITCODE
        } catch {
            continue
        }
        if ($exitCode -eq 0 -and $text -match '(\d+\.\d+\.\d+)') {
            $versions += [version]$Matches[1]
        }
    }

    if ($versions.Count -gt 0) {
        return $versions | Sort-Object -Descending | Select-Object -First 1
    }

    return $null
}

$moduleRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$payloadRoot = Join-Path $moduleRoot 'payload'
$modulePath = Join-Path $moduleRoot 'module.json'
$fragmentPath = Join-Path $moduleRoot 'gitignore.fragment'

if (-not (Test-Path -LiteralPath $payloadRoot -PathType Container)) {
    throw "Falta el payload del modulo: $payloadRoot"
}
if (-not (Test-Path -LiteralPath $modulePath -PathType Leaf)) {
    throw "Falta module.json: $modulePath"
}

$resolvedRoot = [System.IO.Path]::GetFullPath($ProjectRoot)
$rootExists = Test-Path -LiteralPath $resolvedRoot -PathType Container
if (-not $rootExists) {
    Write-Output "CREATE_ROOT $resolvedRoot"
}

$module = Get-Content -Raw -Encoding UTF8 -LiteralPath $modulePath | ConvertFrom-Json
$manifestPath = Join-Path $resolvedRoot '.orchestrator-install.json'
$priorManifest = $null
if (Test-Path -LiteralPath $manifestPath -PathType Leaf) {
    $priorManifest = Get-Content -Raw -Encoding UTF8 -LiteralPath $manifestPath | ConvertFrom-Json
}

$actions = New-Object System.Collections.Generic.List[object]
$conflicts = New-Object System.Collections.Generic.List[string]
$managedHashes = [ordered]@{}

foreach ($source in Get-ChildItem -LiteralPath $payloadRoot -File -Recurse | Sort-Object FullName) {
    $relative = $source.FullName.Substring($payloadRoot.Length).TrimStart('\', '/')
    $destination = Join-Path $resolvedRoot $relative
    $sourceHash = Get-FileHashString $source.FullName
    $managedHashes[$relative] = $sourceHash

    if (-not (Test-Path -LiteralPath $destination -PathType Leaf)) {
        $actions.Add([pscustomobject]@{ Kind = 'CREATE'; Relative = $relative; Source = $source.FullName; Destination = $destination })
        continue
    }

    $destinationHash = Get-FileHashString $destination
    if ($destinationHash -eq $sourceHash) {
        $actions.Add([pscustomobject]@{ Kind = 'UNCHANGED'; Relative = $relative; Source = $source.FullName; Destination = $destination })
        continue
    }

    $previousHash = Get-PreviousHash $priorManifest $relative
    if ($previousHash -and $destinationHash -eq $previousHash) {
        $actions.Add([pscustomobject]@{ Kind = 'UPDATE'; Relative = $relative; Source = $source.FullName; Destination = $destination })
    } else {
        $conflicts.Add($relative)
        $actions.Add([pscustomobject]@{ Kind = 'CONFLICT'; Relative = $relative; Source = $source.FullName; Destination = $destination })
    }
}

if ($priorManifest -and $priorManifest.managed_files) {
    foreach ($property in $priorManifest.managed_files.PSObject.Properties) {
        $relative = [string]$property.Name
        if ($managedHashes.Contains($relative)) { continue }
        $destination = Join-Path $resolvedRoot $relative
        if (-not (Test-Path -LiteralPath $destination -PathType Leaf)) { continue }
        $conflicts.Add("$relative (archivo administrado obsoleto; revisar y retirar manualmente)")
        $actions.Add([pscustomobject]@{ Kind = 'OBSOLETE'; Relative = $relative; Source = $null; Destination = $destination })
    }
}

$gitignorePath = Join-Path $resolvedRoot '.gitignore'
$fragment = (Get-Content -Raw -Encoding UTF8 -LiteralPath $fragmentPath).TrimEnd()
$gitignoreBlockHash = Get-NormalizedTextHash $fragment
$startMarker = '# >>> orquestador-claude-codex >>>'
$endMarker = '# <<< orquestador-claude-codex <<<'
$gitignoreKind = 'CREATE'
$gitignoreContent = "$fragment`r`n"

if (Test-Path -LiteralPath $gitignorePath -PathType Leaf) {
    $currentGitignore = Get-Content -Raw -Encoding UTF8 -LiteralPath $gitignorePath
    $start = $currentGitignore.IndexOf($startMarker)
    $end = $currentGitignore.IndexOf($endMarker)
    if (($start -ge 0) -xor ($end -ge 0)) {
        $conflicts.Add('.gitignore (bloque administrado incompleto)')
        $gitignoreKind = 'CONFLICT'
    } elseif ($start -ge 0) {
        $end += $endMarker.Length
        $currentBlock = $currentGitignore.Substring($start, $end - $start)
        $currentBlockHash = Get-NormalizedTextHash $currentBlock
        $priorBlockHash = if ($priorManifest) { [string]$priorManifest.gitignore_block_hash } else { $null }
        if ($currentBlockHash -ne $gitignoreBlockHash -and $currentBlockHash -ne $priorBlockHash) {
            $conflicts.Add('.gitignore (bloque administrado modificado localmente)')
            $gitignoreKind = 'CONFLICT'
        } else {
            $parts = New-Object System.Collections.Generic.List[string]
            $prefix = $currentGitignore.Substring(0, $start).TrimEnd()
            $suffix = $currentGitignore.Substring($end).Trim()
            if ($prefix) { $parts.Add($prefix) }
            $parts.Add($fragment)
            if ($suffix) { $parts.Add($suffix) }
            $candidate = ($parts -join "`r`n`r`n") + "`r`n"
            $gitignoreContent = $candidate
            $gitignoreKind = if ($candidate -eq $currentGitignore) { 'UNCHANGED' } else { 'UPDATE' }
        }
    } else {
        $gitignoreContent = $currentGitignore.TrimEnd() + "`r`n`r`n" + $fragment + "`r`n"
        $gitignoreKind = 'UPDATE'
    }
}
$actions.Add([pscustomobject]@{ Kind = $gitignoreKind; Relative = '.gitignore'; Source = $fragmentPath; Destination = $gitignorePath })

Write-Output "Modulo: $($module.name) $($module.version)"
Write-Output "Destino: $resolvedRoot"
if ($Apply) { Write-Output 'Modo: APPLY' } else { Write-Output 'Modo: DRY-RUN (sin escritura)' }
$actions | ForEach-Object { Write-Output ("{0,-10} {1}" -f $_.Kind, $_.Relative) }

$claudeVersion = Get-VersionOrNull 'claude'
$codexVersion = Get-VersionOrNull 'codex'
$gitCommand = Get-Command git -ErrorAction SilentlyContinue
if ($claudeVersion) { Write-Output "PREFLIGHT Claude Code $claudeVersion" } else { Write-Output 'WARNING Claude Code no disponible o sin version detectable.' }
if ($codexVersion) { Write-Output "PREFLIGHT Codex CLI $codexVersion" } else { Write-Output 'WARNING Codex CLI no disponible o sin version detectable.' }
if ($gitCommand) { Write-Output 'PREFLIGHT Git disponible.' } else { Write-Output 'WARNING Git no disponible.' }

if ($codexVersion -and $codexVersion -lt [version]$module.minimums.codex_cli) {
    $conflicts.Add("Codex CLI $codexVersion es anterior al minimo $($module.minimums.codex_cli)")
}
if ($claudeVersion -and $claudeVersion -lt [version]$module.minimums.claude_code) {
    Write-Output "WARNING Claude Code $claudeVersion es anterior a la version de referencia $($module.minimums.claude_code)."
}

if ($conflicts.Count -gt 0) {
    Write-Output 'CONFLICTOS: no se aplicara ningun cambio.'
    $conflicts | ForEach-Object { Write-Output "- $_" }
    exit 2
}

if (-not $Apply) {
    Write-Output 'Simulacion completa. Repeti con -Apply para escribir.'
    exit 0
}

if (-not $rootExists) {
    New-Item -ItemType Directory -Path $resolvedRoot -Force | Out-Null
}

foreach ($action in $actions | Where-Object { $_.Relative -ne '.gitignore' -and $_.Kind -in @('CREATE', 'UPDATE') }) {
    $parent = Split-Path -Parent $action.Destination
    New-Item -ItemType Directory -Path $parent -Force | Out-Null
    Copy-Item -LiteralPath $action.Source -Destination $action.Destination -Force
}

if ($gitignoreKind -ne 'UNCHANGED') {
    $gitignoreParent = Split-Path -Parent $gitignorePath
    New-Item -ItemType Directory -Path $gitignoreParent -Force | Out-Null
    Set-Content -LiteralPath $gitignorePath -Value $gitignoreContent -Encoding UTF8 -NoNewline
}

$installedManifest = [ordered]@{
    module = [string]$module.name
    version = [string]$module.version
    installed_at = (Get-Date).ToString('o')
    source = $moduleRoot
    gitignore_block_hash = $gitignoreBlockHash
    managed_files = $managedHashes
}
$installedManifest | ConvertTo-Json -Depth 6 | Set-Content -LiteralPath $manifestPath -Encoding UTF8

Write-Output "INSTALLED $($module.name) $($module.version)"
Write-Output 'Pendiente humano: integrar/verificar AGENTS.md y CLAUDE.md antes de usar el flujo.'
