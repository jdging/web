# INICIAR.md — instrucciones para la IA (Claude / Codex)

> **Quién lee esto.** Vos, la IA, cuando JD te invoca parado en la raíz de un proyecto
> (nuevo o existente) con el prompt de `LEEME.md`. Tu trabajo: dejar esa raíz lista para
> trabajar con el flujo JD + Claude + Codex, adaptada al contexto que JD te dé.
>
> **Regla de oro de esta operación:** NO tocás código existente, NO movés ni borrás archivos
> sin mostrar el plan y esperar OK. Crear archivos nuevos sí está permitido.

---

## 0. Antes de crear nada

1. **Inventariá la raíz** (nombres de archivos/carpetas, no contenido profundo). Determiná el
   modo: **NUEVO** (vacía o casi) o **EXISTENTE** (ya hay código/estructura).
2. **Levantá el contexto.** Si JD no lo dio completo, preguntá SOLO lo que cambia decisiones
   (máximo 4-5 preguntas, juntas):
   - ¿De qué trata el proyecto y para quién es? (¿hay cliente final o es propio?)
   - ¿Stack? (¿usa o va a usar git? ¿Firebase u otro backend? ¿genera documentos con marca?)
   - ¿Se cobran horas? (→ módulo `horas`)
   - ¿Tamaño esperado? (chico/una herramienta · mediano · sistema grande)
3. **Proponé el plan de instalación** (qué vas a crear, qué módulos entran, qué queda afuera)
   en una lista corta y esperá el OK. En modo EXISTENTE incluí además qué encontraste y qué
   NO vas a tocar.

## 1. Qué se instala (escalado por tamaño)

La doc escala con el proyecto. No instales el set completo por defecto.

| Pieza | Chico | Mediano | Grande | Fuente en /x |
|---|---|---|---|---|
| `AGENTS.md` (adaptado al contexto) | ✅ | ✅ | ✅ | `base/AGENTS.template.md` |
| `CLAUDE.md` (adaptado) | ✅ | ✅ | ✅ | `base/CLAUDE.template.md` |
| `.gitignore` (si usa git) | ✅ | ✅ | ✅ | `base/gitignore.base` |
| `docs/CONTEXTO.md` | ✅ | ✅ | ✅ | `base/docs/` |
| `docs/BITACORA.md` | — | ✅ | ✅ | `base/docs/` |
| `docs/DECISIONES.md` + `docs/lessons.md` | — | ✅ | ✅ | `base/docs/` |
| `tasks/todo.md` | ✅ | ✅ | ✅ | `base/docs/todo.md` |
| Carpeta `archivo/` (vacía, con README de 2 líneas) | — | ✅ | ✅ | convención |
| `tutoriales/prompts.md` (ciclo Claude↔Codex de bolsillo) | ✅ | ✅ | ✅ | `base/tutoriales/` |
| `tutoriales/orquestador.md` | — | ✅ | ✅ | `base/tutoriales/` |
| `tutoriales/auditoria.md` (adaptar fases al stack) | — | opcional | ✅ | `base/tutoriales/` |
| Módulo `horas/` (si se cobran horas y hay git) | opcional | opcional | opcional | `modulos/horas/` |
| `marca/jdg/` (si genera documentos) | opcional | opcional | opcional | `modulos/marca/` |

**Adaptar ≠ copiar.** Los templates tienen placeholders `[ASI]` y secciones marcadas
"completar según proyecto". Rellenalos con el contexto real; borrá lo que no aplique.
Lo que no sepas, dejalo con el placeholder y anotalo como pendiente en `tasks/todo.md`.

## 2. Reglas default que SIEMPRE van al CLAUDE.md del proyecto

Estas vienen de serie (ya están en el template; no las quites):

1. No escribir código sin consultar antes y mostrar resumen.
2. **No levantar servidor local** salvo permiso explícito o paso de QA de un orquestador.
3. **No tocar la doc típica** (BITACORA, CONTEXTO, DECISIONES, lessons) durante el trabajo;
   se actualiza en los cierres, con OK de JD.
4. QA automático de Claude **permitido** cuando lo dirige un orquestador (con token-economy:
   DOM/eval antes que screenshot).
5. Convención raíz = orquestadores activos · `tasks/` = abierto · `archivo/` = cerrado (no leer
   salvo pedido).
6. Herramientas gratuitas primero; ecosistema Google preferido.
7. Nunca usar "vale la pena" / "no vale la pena".

## 3. Modo EXISTENTE — extras de la migración

- **Nada se mueve sin plan aprobado.** Si el proyecto ya tiene doc dispersa (README, notas),
  proponé dónde queda cada cosa (¿se referencia desde CONTEXTO? ¿migra a `archivo/`?), no lo
  hagas de una.
- Si ya hay `.gitignore`, proponé un diff aditivo (qué líneas de `gitignore.base` faltan),
  no lo pises.
- Si ya hay git con historia, el módulo `horas` puede reconstruir horas pasadas: configurá
  `desde` con la fecha que JD te diga.
- El `CONTEXTO.md` inicial se escribe con lo que JD contó + lo que se ve de la estructura.
  No inventes estado: lo no verificado va como "a confirmar".

## 4. Instalación del módulo `horas` (si entra)

1. Copiá `modulos/horas/` a `<proyecto>/horas/` (todo menos esta instrucción).
2. Creá `horas/config.json` desde `config.template.json`: tarifa, ramas reales del repo,
   fecha `desde`.
3. Creá `horas/ajustes.json` con `{ "excluidos": [], "extra": [] }` si no existe.
4. Agregá `horas/data.js` al `.gitignore` del proyecto (es artefacto generado).
5. Deciles a JD los 2 pasos manuales: activar el hook (`cp horas/hooks/post-commit
   .git/hooks/post-commit`) y generar la primera corrida (`node horas/generar.mjs`).
   **No los corras vos sin OK** (tocan `.git/`).

## 5. Retroalimentación del contexto (después de instalar)

El entorno crece **ordenado y cauteloso**, no de una:

- Cuando JD explique algo nuevo del proyecto en una sesión, **ofrecé** actualizar la pieza
  que corresponde ("¿actualizo CONTEXTO con esto?" / "¿esto es una DEC?"). No actualices
  doc sin ofrecerlo antes (regla 3).
- No dupliques: cada dato vive en UN archivo (contexto → CONTEXTO, decisión → DECISIONES,
  error aprendido → lessons, tarea → todo).
- Si el proyecto empieza chico y crece, proponé subir de nivel (sumar BITACORA/DECISIONES,
  orquestador) recién cuando el trabajo lo pida — no antes.
- Si en el proyecto aparece una práctica nueva que serviría en otros, sugerile a JD
  capturarla con el flujo de `CAPTURAR.md`.

## 6. Cierre de la instalación

Terminá reportando: qué se creó (lista de archivos), qué módulos quedaron afuera y por qué,
los placeholders pendientes, y los pasos manuales de JD (hook de horas, git init si falta,
decisiones de marca). Registrá la instalación como primera entrada de la BITACORA (si se
instaló) o al pie del CONTEXTO.
