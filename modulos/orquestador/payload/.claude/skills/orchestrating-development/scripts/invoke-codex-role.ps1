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

$codexCommand = Get-Command codex -ErrorAction SilentlyContinue
if (-not $codexCommand) {
    Fail 'Codex CLI no esta disponible en PATH.'
}

$versionText = (& $codexCommand.Source --version 2>$null | Out-String).Trim()
if ($versionText -notmatch '(\d+\.\d+\.\d+)') {
    Fail "No se pudo determinar la version de Codex CLI: $versionText"
}
$installedVersion = [version]$Matches[1]
$minimumVersion = [version]'0.134.0'
if ($installedVersion -lt $minimumVersion) {
    Fail "Codex CLI $installedVersion es incompatible. Se requiere $minimumVersion o posterior. Actualizalo unicamente con autorizacion."
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

Push-Location $ProjectRoot
try {
    if ($Resume) {
        $priorState = Get-Content -Raw -LiteralPath $statePath | ConvertFrom-Json
        $threadId = [string]$priorState.thread_id
        if (-not $threadId) {
            Fail "state.json no contiene thread_id para $RunKey/$Role."
        }

        $arguments = @(
            'exec', 'resume', '--json',
            '--ignore-user-config',
            '--model', $model,
            '--config', $effortOverride,
            '--output-schema', $schemaPath,
            '--output-last-message', $resultPath,
            $threadId, '-'
        )
    } else {
        $arguments = @(
            'exec', '--json',
            '--ignore-user-config',
            '--model', $model,
            '--config', $effortOverride,
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
        $effectivePrompt | & $codexCommand.Source @arguments 2> $errorsPath | Tee-Object -FilePath $eventsPath | Out-Null
        $exitCode = $LASTEXITCODE
    } finally {
        $ErrorActionPreference = $previousErrorActionPreference
    }
} finally {
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
}
$state | ConvertTo-Json -Depth 5 | Set-Content -LiteralPath $statePath -Encoding UTF8

Write-Output ($state | ConvertTo-Json -Depth 5)
