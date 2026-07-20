# CHANGELOG de /x

> Registro de cambios del template maestro. Entradas nuevas ARRIBA. Se actualiza cada vez que
> cambia `base/`, `modulos/` o los documentos cerebro (LEEME/INICIAR/CAPTURAR).

## 2026-07-20 — Orquestador v2.0.2: selección de paquete Windows completo
- El wrapper evalúa todos los binarios de Codex disponibles y prioriza la versión más reciente que
  incluya los helpers del sandbox nativo, evitando instalaciones antiguas heredadas por `PATH`.
- Una CLI incompleta falla antes de iniciar el rol con un diagnóstico explícito; `invocation.json`
  registra si los helpers requeridos están presentes.
- El preflight del instalador informa la versión ejecutable más reciente en vez de la primera que
  resuelva el shell.
- El instalador deja de reescribir `.gitignore` cuando el bloque administrado no cambió.

## 2026-07-20 — Orquestador v2.0.1: sandbox nativo de Windows
- El wrapper y el preflight del instalador resuelven y validan un binario real de Codex antes de
  invocarlo, incluso cuando el alias empaquetado de `WindowsApps` no es ejecutable desde el runner.
- Las corridas fijan explícitamente sandbox, aprobación y `windows.sandbox = "elevated"`, también al
  reanudar un thread, sin depender de la configuración global ignorada por el orquestador.
- El `PATH` del proceso hijo excluye PowerShell instalado desde Microsoft Store y cae en un shell
  accesible para el usuario aislado; cada corrida registra sus permisos efectivos en
  `invocation.json`.

## 2026-07-18 — Orquestador Claude Code ↔ Codex CLI v2
- Nuevo `modulos/orquestador/`: payload portable con skill y agentes de Claude, siete roles de
  Codex, contratos JSON, wrapper PowerShell y guía humana.
- Instalador seguro con dry-run predeterminado, aplicación explícita, manifiesto de versión/hashes,
  actualización solo de archivos administrados intactos y rechazo de instalaciones parciales.
- Generalización del patrón de AREA VIVA DEC-084: sin Firebase, rutas de negocio, prompts ni corridas
  piloto; decisiones humanas, permisos y gates se conservan.
- `LEEME.md`, `INICIAR.md`, templates `AGENTS`/`CLAUDE` y `.gitignore` sincronizados con v2.
- El orquestador se instala por defecto en proyectos medianos/grandes y queda opcional en chicos.

## 2026-07-01 — Segunda pasada
- **`base/tutoriales/prompts.md`:** versión pulida de `prompts-codex-claude.md` de area-viva —
  los 4 prompts del ciclo (arranque de problema / spec / codex / auditoría) en una pantalla.
  Entra en TODOS los tamaños de proyecto (tabla de INICIAR.md actualizada).
- **Módulo firebase destilado** (ya no es stub): dos proyectos prod/dev, reglas por roles con
  custom claims (orden claims→relogin→deploy), qué se QAea en dev vs prod-only, red de costos
  pre-Blaze, checklist de instalación.
- **Primeras 3 ideas capturadas:** `flujo-git-prod-dev`, `indice-de-codigo`, `sellado-invisible`.
- **Marca — decisión cerrada por JD:** dos modos oficiales (DOCUMENTO claro = paleta `jdg/` ·
  HERRAMIENTA oscura = paleta `planillas/`); email oficial `ing.guzmanjuandavid@gmail.com`;
  subtítulo "Desarrollo de Estructuras & Sistemas". Actualizados `jdg/datos.json` y
  `jdg/colores.css` en /x. ⚠️ Los originales de `area-viva/marca/jdg/` quedaron sin tocar
  (pendiente sincronizar cuando JD lo pida).
- Creado este CHANGELOG.

## 2026-07-01 — Creación de /x (primera pasada)
- Documentos cerebro: `LEEME.md` (prompts), `INICIAR.md` (iniciar/migrar), `CAPTURAR.md` (ideas).
- `base/`: templates de `AGENTS.md`, `CLAUDE.md`, `.gitignore`, docs (CONTEXTO/BITACORA/
  DECISIONES/lessons/todo) y tutoriales genéricos (orquestador + auditoría).
- `modulos/`: `horas/` (copiado de area-viva + INSTALAR.md y templates de config) y `marca/`
  (jdg + planillas).
- Fuentes: area-viva (`AGENTS.md`, `CLAUDE.md`, `tutoriales/orquestador.md`,
  `archivo/Auditacion.md`, `horas/`, `marca/`, `.gitignore`) y `planillas-de-calculo/design/`.
