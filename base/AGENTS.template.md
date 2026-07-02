# Proyecto: [NOMBRE] — [descriptor en una línea]

<!-- Template de /x. Al instalar: rellenar [PLACEHOLDERS], borrar secciones que no apliquen
     y borrar estos comentarios. Este archivo lo lee Codex (y cualquier agente). -->

## Identidad del Proyecto
- **Cliente / destinatario:** [cliente, o "propio"]
- **Descripción:** [qué hace el sistema, en 2-3 líneas]
- **Estado:** [ej. arranque / en desarrollo / producción]
- **Fecha inicio:** [AAAA-MM-DD]
- **Stack:** [tecnologías; si no está definido: "a definir — ver docs/CONTEXTO.md"]

## Reglas de Oro (no negociables)
1. **NUNCA escribas código sin antes consultar.** Mostrá un resumen de lo que entendiste,
   qué vas a hacer, y esperá el OK de JD.
2. **No levantes servidor local** salvo permiso explícito o un paso de QA definido en un
   orquestador activo.
3. **No toques la doc típica** (`docs/BITACORA.md`, `CONTEXTO.md`, `DECISIONES.md`,
   `lessons.md`) durante el trabajo. Se actualiza en los cierres, con OK de JD.
4. **Herramientas gratuitas primero.** Ecosistema Google preferido (Sheets, Apps Script,
   Firebase, Drive). Si una opción paga es claramente superior, mencionala como alternativa.
5. **Cambios mínimos al pedido.** Nada de refactor de paso ni alcance extra no pedido.
6. Nunca usar "vale la pena" ni "no vale la pena".

## Flujo de trabajo (Claude ↔ Codex)
- **Claude** diseña, produce specs, orquesta y audita. **Codex** implementa specs.
- Trabajo grande → **orquestador** en la raíz partido en etapas (ver
  `tutoriales/orquestador.md`). Un chat nuevo por etapa; auditoría en otro chat (ojo fresco).
- **QA automático de Claude permitido** cuando lo dirige un orquestador, con token-economy
  (leer DOM/eval antes que screenshot).
- Convención de carpetas: **raíz = orquestadores ACTIVOS** · **`tasks/` = trabajo
  abierto/futuro** · **`archivo/` = material cerrado** (no leer salvo pedido explícito;
  al cerrar un trabajo, su doc migra ahí con `git mv`).

## Comandos del Proyecto
<!-- Los comandos reales del proyecto (build, deploy, test). Si todavía no hay, dejar vacío. -->
- [comando] → [qué hace]

## Arquitectura
<!-- Completar cuando exista. Mantener corto: el detalle vive en docs/CONTEXTO.md. -->
- [frontend / backend / datos / hosting]

## Estructura de Carpetas
```
[NOMBRE]/
├── AGENTS.md              ← este archivo (instrucciones para Codex/agentes)
├── CLAUDE.md              ← preferencias y alertas para Claude
├── docs/                  ← doc viva (CONTEXTO, BITACORA, DECISIONES, lessons — según escala)
├── tasks/                 ← trabajo abierto/futuro (todo.md, specs sueltas)
├── archivo/               ← material cerrado (no vigente; no leer salvo pedido)
├── tutoriales/            ← guías de trabajo (orquestador, auditoría)
├── marca/                 ← assets de marca (si el proyecto genera documentos)
├── horas/                 ← contador de horas (si aplica; data.js gitignoreado)
└── src/                   ← código fuente
```

## Convenciones
- Idioma del código: inglés · Idioma de documentación: español (argentino).
- Commits: conventional commits en español.
- Semver: bugs = patch, features = minor, rediseños = major.

## Watch Out For
<!-- Las alertas específicas del proyecto se van sumando acá a medida que aparecen. -->
- [alerta]
