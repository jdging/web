[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)]
    [ValidateSet(
        'plan-reviewer',
        'implementer-bounded',
        'implementer-critical',
        'code-reviewer',
        'release-reviewer',
        'documentation-runner',
        'evidence-runner'
    )]
    [string]$Role,

    [Parameter(Mandatory = $true)]
    [ValidatePattern('^[A-Za-z0-9][A-Za-z0-9._-]{0,119}$')]
    [string]$RunKey,

    [Parameter(Mandatory = $true)]
    [string]$PromptFile,

    [switch]$Resume,

    [string]$ProjectRoot
)

$ErrorActionPreference = 'Stop'

function Fail([string]$Message) {
    Write-Error $Message
    exit 1
}

function Resolve-CodexExecutable {
    $candidates = @()

    if ($env:CODEX_CLI_PATH) {
        $candidates += $env:CODEX_CLI_PATH
    }

    $commands = @(Get-Command codex -All -ErrorAction SilentlyContinue)
    foreach ($command in $commands) {
        if ($command.Source) {
            $candidates += $command.Source
        }
    }

    if ($env:LOCALAPPDATA) {
        $appBinRoot = Join-Path $env:LOCALAPPDATA 'OpenAI\Codex\bin'
        if (Test-Path -LiteralPath $appBinRoot -PathType Container) {
            $appCandidates = @(
                Get-ChildItem -LiteralPath $appBinRoot -Directory -ErrorAction SilentlyContinue |
                    ForEach-Object { Join-Path $_.FullName 'codex.exe' } |
                    Where-Object { Test-Path -LiteralPath $_ -PathType Leaf } |
                    Sort-Object { (Get-Item -LiteralPath $_).LastWriteTimeUtc } -Descending
            )
            $candidates += $appCandidates
        }
    }

    $attempted = @()
    $usable = @()
    foreach ($candidate in @($candidates | Where-Object { $_ } | Select-Object -Unique)) {
        if (-not (Test-Path -LiteralPath $candidate -PathType Leaf)) {
            continue
        }

        try {
            $versionText = (& $candidate --version 2>$null | Out-String).Trim()
            $exitCode = $LASTEXITCODE
        } catch {
            $attempted += "$candidate ($($_.Exception.Message))"
            continue
        }

        if ($exitCode -eq 0 -and $versionText -match '(\d+\.\d+\.\d+)') {
            $candidateDirectory = Split-Path -Parent $candidate
            $hasWindowsSandboxHelpers = if ($env:OS -eq 'Windows_NT') {
                (Test-Path -LiteralPath (Join-Path $candidateDirectory 'codex-windows-sandbox-setup.exe') -PathType Leaf) -and
                (Test-Path -LiteralPath (Join-Path $candidateDirectory 'codex-command-runner.exe') -PathType Leaf)
            } else {
                $true
            }
            $usable += [pscustomobject]@{
                Path = [System.IO.Path]::GetFullPath($candidate)
                VersionText = $versionText
                Version = [version]$Matches[1]
                WindowsSandboxHelpersPresent = $hasWindowsSandboxHelpers
            }
            continue
        }

        $attempted += "$candidate ($versionText)"
    }

    if ($usable.Count -gt 0) {
        return $usable |
            Sort-Object -Property @(
                @{ Expression = 'WindowsSandboxHelpersPresent'; Descending = $true },
                @{ Expression = 'Version'; Descending = $true }
            ) |
            Select-Object -First 1
    }

    $detail = if ($attempted.Count -gt 0) { $attempted -join '; ' } else { 'sin candidatos ejecutables' }
    Fail "Codex CLI no esta disponible o no puede ejecutarse. Intentos: $detail"
}

function Get-SandboxCompatiblePath([string]$CurrentPath) {
    if ($env:OS -ne 'Windows_NT') {
        return $CurrentPath
    }

    $pathSeparator = [System.IO.Path]::PathSeparator
    $programFilesWindowsApps = if ($env:ProgramFiles) {
        Join-Path $env:ProgramFiles 'WindowsApps\Microsoft.PowerShell_'
    } else {
        $null
    }
    $userWindowsApps = if ($env:LOCALAPPDATA) {
        Join-Path $env:LOCALAPPDATA 'Microsoft\WindowsApps'
    } else {
        $null
    }

    $filtered = @(
        $CurrentPath.Split($pathSeparator, [System.StringSplitOptions]::RemoveEmptyEntries) |
            Where-Object {
                $entry = $_.TrimEnd('\', '/')
                $isStorePowerShell = $programFilesWindowsApps -and
                    $entry.StartsWith($programFilesWindowsApps, [System.StringComparison]::OrdinalIgnoreCase)
                $isUserWindowsApps = $userWindowsApps -and
                    $entry.Equals($userWindowsApps.TrimEnd('\', '/'), [System.StringComparison]::OrdinalIgnoreCase)
                -not ($isStorePowerShell -or $isUserWindowsApps)
            }
    )

    $windowsPowerShell = if ($env:SystemRoot) {
        Join-Path $env:SystemRoot 'System32\WindowsPowerShell\v1.0'
    } else {
        $null
    }
    if ($windowsPowerShell -and (Test-Path -LiteralPath $windowsPowerShell -PathType Container)) {
        $hasFallback = @($filtered | Where-Object {
            $_.TrimEnd('\', '/').Equals(
                $windowsPowerShell.TrimEnd('\', '/'),
                [System.StringComparison]::OrdinalIgnoreCase
            )
        }).Count -gt 0
        if (-not $hasFallback) {
            $filtered += $windowsPowerShell
        }
    }

    return ($filtered -join $pathSeparator)
}

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$skillDir = Split-Path -Parent $scriptDir
$referencesDir = Join-Path $skillDir 'references'
$rolesPath = Join-Path $referencesDir 'roles.json'

if (-not (Test-Path -LiteralPath $rolesPath)) {
    Fail "No se encontro la configuracion de roles: $rolesPath"
}
if (-not (Test-Path -LiteralPath $PromptFile -PathType Leaf)) {
    Fail "No se encontro el prompt: $PromptFile"
}

if (-not $ProjectRoot) {
    $ProjectRoot = (& git rev-parse --show-toplevel 2>$null | Out-String).Trim()
}
if (-not $ProjectRoot -or -not (Test-Path -LiteralPath $ProjectRoot -PathType Container)) {
    Fail 'No se pudo resolver la raiz del repositorio.'
}
$ProjectRoot = [System.IO.Path]::GetFullPath($ProjectRoot)

$codexInfo = Resolve-CodexExecutable
$codexExecutable = [string]$codexInfo.Path
$versionText = [string]$codexInfo.VersionText
$installedVersion = [version]$codexInfo.Version
$windowsSandboxHelpersPresent = [bool]$codexInfo.WindowsSandboxHelpersPresent
$minimumVersion = [version]'0.134.0'
if ($installedVersion -lt $minimumVersion) {
    Fail "Codex CLI $installedVersion es incompatible. Se requiere $minimumVersion o posterior. Actualizalo unicamente con autorizacion."
}
if ($env:OS -eq 'Windows_NT' -and -not $windowsSandboxHelpersPresent) {
    Fail "Codex CLI $installedVersion no incluye los helpers del sandbox nativo junto a $codexExecutable. Instala o selecciona un paquete completo de Codex para Windows."
}

$rolesConfig = Get-Content -Raw -Encoding UTF8 -LiteralPath $rolesPath | ConvertFrom-Json
$roleConfig = $rolesConfig.roles.$Role
if (-not $roleConfig) {
    Fail "El rol '$Role' no existe en roles.json."
}

$preludePath = Join-Path $referencesDir $roleConfig.prelude
$schemaPath = Join-Path (Join-Path $scriptDir 'schemas') $roleConfig.schema
if (-not (Test-Path -LiteralPath $preludePath -PathType Leaf)) {
    Fail "Falta el preambulo del rol: $preludePath"
}
if (-not (Test-Path -LiteralPath $schemaPath -PathType Leaf)) {
    Fail "Falta el schema del rol: $schemaPath"
}

$runtimeDir = Join-Path $ProjectRoot ".orchestration/runs/$RunKey/$Role"
New-Item -ItemType Directory -Force -Path $runtimeDir | Out-Null

$statePath = Join-Path $runtimeDir 'state.json'
$eventsPath = Join-Path $runtimeDir 'events.jsonl'
$errorsPath = Join-Path $runtimeDir 'stderr.log'
$resultPath = Join-Path $runtimeDir 'result.json'
$effectivePromptPath = Join-Path $runtimeDir 'effective-prompt.md'
$invocationPath = Join-Path $runtimeDir 'invocation.json'

if ($Resume -and -not (Test-Path -LiteralPath $statePath -PathType Leaf)) {
    Fail "No existe un thread previo para $RunKey/$Role. Ejecuta primero sin -Resume."
}
if (-not $Resume -and (Test-Path -LiteralPath $statePath -PathType Leaf)) {
    Fail "Ya existe un thread para $RunKey/$Role. Usa -Resume o elegi otro RunKey."
}

$prelude = Get-Content -Raw -Encoding UTF8 -LiteralPath $preludePath
$userPrompt = Get-Content -Raw -Encoding UTF8 -LiteralPath $PromptFile
$effectivePrompt = "$prelude`n`n--- MATERIAL DE ESTA RONDA ---`n`n$userPrompt"
Set-Content -LiteralPath $effectivePromptPath -Value $effectivePrompt -Encoding UTF8

$model = [string]$roleConfig.model
$effort = [string]$roleConfig.reasoning_effort
$sandbox = [string]$roleConfig.sandbox
$effortOverride = "model_reasoning_effort=`"$effort`""
$sandboxOverride = "sandbox_mode=`"$sandbox`""
$approvalOverride = 'approval_policy="never"'
$windowsSandbox = if ($env:OS -eq 'Windows_NT') { 'elevated' } else { $null }

$configArguments = @(
    '--config', $effortOverride,
    '--config', $sandboxOverride,
    '--config', $approvalOverride
)
if ($windowsSandbox) {
    $configArguments += @('--config', "windows.sandbox=`"$windowsSandbox`"")
}

$commonArguments = @(
    '--json',
    '--ignore-user-config',
    '--model', $model
) + $configArguments

$originalPath = $env:Path
$sandboxCompatiblePath = Get-SandboxCompatiblePath $originalPath

$invocation = [ordered]@{
    codex_executable = $codexExecutable
    codex_version = $versionText
    project_root = $ProjectRoot
    role = $Role
    model = $model
    reasoning_effort = $effort
    sandbox = $sandbox
    approval_policy = 'never'
    windows_sandbox = $windowsSandbox
    windows_sandbox_helpers_present = $windowsSandboxHelpersPresent
    store_powershell_removed_from_path = ($sandboxCompatiblePath -ne $originalPath)
}
$invocation | ConvertTo-Json -Depth 5 | Set-Content -LiteralPath $invocationPath -Encoding UTF8

Push-Location $ProjectRoot
try {
    $env:Path = $sandboxCompatiblePath
    if ($Resume) {
        $priorState = Get-Content -Raw -LiteralPath $statePath | ConvertFrom-Json
        $threadId = [string]$priorState.thread_id
        if (-not $threadId) {
            Fail "state.json no contiene thread_id para $RunKey/$Role."
        }

        $arguments = @('exec', 'resume') + $commonArguments + @(
            '--output-schema', $schemaPath,
            '--output-last-message', $resultPath,
            $threadId, '-'
        )
    } else {
        $arguments = @('exec') + $commonArguments + @(
            '--sandbox', $sandbox,
            '--cd', $ProjectRoot,
            '--output-schema', $schemaPath,
            '--output-last-message', $resultPath,
            '-'
        )
    }

    $previousErrorActionPreference = $ErrorActionPreference
    $ErrorActionPreference = 'Continue'
    try {
        $effectivePrompt | & $codexExecutable @arguments 2> $errorsPath | Tee-Object -FilePath $eventsPath | Out-Null
        $exitCode = $LASTEXITCODE
    } finally {
        $ErrorActionPreference = $previousErrorActionPreference
    }
} finally {
    $env:Path = $originalPath
    Pop-Location
}

if ($exitCode -ne 0) {
    Fail "Codex CLI termino con codigo $exitCode. Revisa $errorsPath y $eventsPath."
}
if (-not (Test-Path -LiteralPath $resultPath -PathType Leaf)) {
    Fail "Codex no genero el resultado esperado: $resultPath"
}

$threadIdFromEvents = $null
foreach ($line in Get-Content -LiteralPath $eventsPath) {
    if ([string]::IsNullOrWhiteSpace($line)) { continue }
    try {
        $event = $line | ConvertFrom-Json
        if ($event.type -eq 'thread.started' -and $event.thread_id) {
            $threadIdFromEvents = [string]$event.thread_id
            break
        }
    } catch {
        continue
    }
}

$finalThreadId = if ($Resume) { [string]$priorState.thread_id } else { $threadIdFromEvents }
if (-not $finalThreadId) {
    Fail "No se pudo obtener thread_id desde $eventsPath."
}

try {
    $result = Get-Content -Raw -LiteralPath $resultPath | ConvertFrom-Json
} catch {
    Fail "La respuesta final no es JSON valido: $resultPath"
}
if (-not $result.verdict) {
    Fail "La respuesta final no contiene verdict: $resultPath"
}

$state = [ordered]@{
    run_key = $RunKey
    role = $Role
    thread_id = $finalThreadId
    model = $model
    reasoning_effort = $effort
    sandbox = $sandbox
    verdict = [string]$result.verdict
    updated_at = (Get-Date).ToString('o')
    result_file = $resultPath
    events_file = $eventsPath
    invocation_file = $invocationPath
}
$state | ConvertTo-Json -Depth 5 | Set-Content -LiteralPath $statePath -Encoding UTF8

Write-Output ($state | ConvertTo-Json -Depth 5)
