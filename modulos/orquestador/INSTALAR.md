# Instalar o actualizar el orquestador

## Requisitos

- Windows PowerShell 5.1 o PowerShell 7.
- Claude Code autenticado.
- Codex CLI autenticado, versión compatible con `module.json`.
- Git antes de ejecutar el orquestador. La instalación puede prepararse sin Git, pero el wrapper no
  podrá resolver la raíz hasta que el repositorio exista.

## Proyecto nuevo

1. Ejecutar `instalar.ps1 -ProjectRoot <raíz>` sin `-Apply`.
2. Revisar la vista previa y los preflight.
3. Repetir con `-Apply`.
4. Crear/adaptar `AGENTS.md` y `CLAUDE.md` desde `C:\Proyectos\x\base\`.
5. Inicializar Git solo con autorización si todavía no existe.
6. Arrancar Claude con `claude --agent orchestrator --chrome`.

## Proyecto existente

1. Inventariar `.claude/`, `.codex/`, `AGENTS.md`, `CLAUDE.md` y `.gitignore`.
2. Ejecutar primero la simulación. Un archivo coincidente se conserva; uno ajeno o modificado se
   informa como conflicto.
3. Resolver cada conflicto mediante un diff aprobado. No usar copias forzadas.
4. Aplicar el payload con `-Apply`.
5. Integrar en `AGENTS.md` y `CLAUDE.md`: conductor único, consulta previa a toda escritura, gates,
   política documental del proyecto y autorizaciones separadas para producción/release.
6. Confirmar que las reglas documentales no se contradigan entre sí antes del primer piloto.

## Actualizar desde `/x`

1. Actualizar primero este módulo y su `module.json`.
2. Ejecutar la simulación contra el proyecto destino.
3. Los archivos administrados sin cambios locales aparecen como `UPDATE`.
4. Los archivos personalizados aparecen como `CONFLICT`; se integran manualmente, nunca se pisan.
5. Un archivo retirado del payload aparece como `OBSOLETE`; revisar su uso y eliminarlo manualmente
   mediante un cambio aprobado antes de continuar.
6. Aplicar y revisar `.orchestrator-install.json`.

## Validación mínima posterior

```powershell
codex --version
claude --version
git status --short
```

Luego usar un gate retrospectivo read-only antes de habilitar una implementación. La corrida local
debe quedar bajo `.orchestration/` y no aparecer en Git.

## Sandbox nativo en Windows

El wrapper conserva `--ignore-user-config` para que cada rol sea reproducible, pero fija de manera
explícita `approval_policy = "never"`, el sandbox del rol y `windows.sandbox = "elevated"`. Los roles
de implementación y documentación usan `workspace-write`; los revisores continúan en `read-only`.

PowerShell 7 instalado desde Microsoft Store vive bajo `WindowsApps` y puede no ser ejecutable por
el usuario aislado del sandbox. El wrapper excluye esas rutas únicamente del `PATH` del proceso hijo
y permite que Codex use Windows PowerShell 5.1 o una instalación de PowerShell 7 accesible para todo
el equipo. No modifica el `PATH` permanente del usuario.

Cada corrida guarda `.orchestration/runs/<RunKey>/<Role>/invocation.json` con el ejecutable, versión,
workspace y permisos efectivos. Si una ejecución falla antes de iniciar, revisar primero ese archivo
y `stderr.log`; no habilitar `--dangerously-bypass-approvals-and-sandbox` como workaround.

En Windows puede coexistir una instalación antigua en `%LOCALAPPDATA%\Programs\OpenAI\Codex\bin`
con el paquete actual de la app. El wrapper prueba todos los candidatos, prefiere la versión más
reciente que incluya `codex-windows-sandbox-setup.exe` y `codex-command-runner.exe`, y rechaza antes
de iniciar una CLI incompleta. `invocation.json` registra también
`windows_sandbox_helpers_present` para auditar esa selección.
