# Cómo armar un orquestador — guía reutilizable

> **Qué es este archivo.** La meta-guía para construir un **orquestador**: el documento-cerebro
> que dirige la ejecución de una feature o fase grande, partida en **etapas**, cada una trabajada
> en un **chat nuevo**. Versión genérica del `tutoriales/orquestador.md` de AREA VIVA (donde el
> formato se probó en varias features cerradas).
>
> **Cómo se invoca.** En un chat nuevo: *"Leé `tutoriales/orquestador.md` y armemos un orquestador
> para **\<feature\>**"*. Claude hace las preguntas de diseño que falten, propone el corte en
> etapas, y al aprobarse **escribe el orquestador** en la raíz del repo.

---

## 1. Cuándo crear un orquestador (vs. un task suelto)

Creá un orquestador cuando el trabajo:

- toca **varios subsistemas/archivos** y conviene partirlo en pasos verificables, **o**
- va a tomar **varios chats** (el contexto no entra en uno solo), **o**
- es lo bastante riesgoso como para querer **QA por etapa** y un tracker de avance.

Si es un cambio de 1-2 archivos que se hace y se QAea de una, **no** hace falta orquestador: va
como trabajo suelto en `tasks/` o directo. El orquestador es para cosas que se benefician de
**divide y vencerás con red de seguridad después de cada paso**.

---

## 2. Dónde vive y ciclo de vida

- **Raíz del repo = orquestadores ACTIVOS.** El archivo nace en la raíz.
  Nombre: `<feature>-<version>-etapas.md` (ej. `cuotas-v1.3.0-etapas.md`) o `<fase>-etapas.md`.
- **`tasks/` = solo trabajo abierto/futuro** (specs sueltas, ideas, backlog). No orquestadores vivos.
- **`archivo/` = material cerrado.** Al **cerrar** la última etapa, el orquestador **migra a
  `archivo/` con `git mv`** (queda como registro histórico, no se vuelve a leer salvo pedido).

El orquestador es **autocontenido**: toda la decisión vive adentro, para poder abrirlo en una
compu/chat que nunca vio el chat donde se diseñó.

---

## 3. El flujo de ejecución (Claude / Codex)

```
  [diseño cerrado en este orquestador]
        │
        ▼
  ┌─ por cada ETAPA, en un chat NUEVO ──────────────────────────────┐
  │ 1. Claude lee el orquestador → arma el SPEC de la etapa          │
  │    (qué entendió, archivos en alcance, enfoque, criterios,       │
  │     watch-outs) y AL FINAL emite el bloque listo para Codex.     │
  │ 2. Codex implementa SOLO ese spec.                              │
  │ 3. Claude (chat NUEVO, ojo fresco) AUDITA estático + hace el QA  │
  │    automático + deja la checklist del QA manual de JD.           │
  │ 4. JD hace el QA manual → se tacha la etapa en el tracker (§7).  │
  └─────────────────────────────────────────────────────────────────┘
```

- **Claude no escribe código de la app**; produce specs y audita. **Excepción:** las etapas que
  son pura documentación las escribe Claude directo, sin Codex.
- **Chat nuevo por etapa** y **chat nuevo para auditar** (ojo fresco, evita sesgo de autor).
- Si el proyecto no usa Codex y Claude implementa directo, el ciclo es el mismo pero sin el
  handoff: Claude spec → Claude implementa → auditoría en chat nuevo → QA → tracker.

---

## 4. Anatomía de un orquestador (secciones obligatorias)

1. **Encabezado / "Qué es este archivo".** Una caja `>` que explica que es el cerebro de
   ejecución, que cada etapa va en un chat nuevo, y el flujo Claude/Codex. **+ Estado del spec**
   (¿está todo decidido o hay algo gateado?) **+ Rama y versión** (si el proyecto las usa).

2. **§1 Reglas globales (válidas en TODAS las etapas).** Empieza por la **REGLA CERO** (verificar
   rama, si hay ramas) y sigue con las que apliquen (§6 de esta guía). Incluí acá los **prompts
   reutilizables** (§7): arranque de etapa, bloque para Codex, auditoría + QA.

3. **§2 Lo que YA está decidido (no re-discutir).** El congelado del diseño: alcance, decisiones
   de producto/UX, fórmulas, copys fijos. Evita que cada etapa reabra debates.

4. **§3 ETAPAS.** Cada una con: **Objetivo** · **Qué se hace** · **Watch-outs** · **Criterios de
   aceptación**. Numeradas y ordenadas por dependencia. (Un "mapa de etapas" en tabla con
   esfuerzo/riesgo/dependencias ayuda si son muchas.)

5. **§4 Modelo de datos.** El shape ilustrativo (jsonc con comentarios) de lo que se crea/cambia.
   Marcá defaults y compatibilidad hacia atrás.

6. **§5 Archivos en alcance.** Tabla `archivo → qué cambia`, **+ qué queda fuera de alcance**
   (explícito, para que Codex no se expanda).

7. **§6 Qué puede salir mal.** Los footguns concretos del proyecto (mirá las Alertas Críticas de
   `CLAUDE.md` + los específicos de la feature).

8. **§7 Tracker de estado.** Checklist `- [ ]` por etapa, que se tacha al aprobar cada una. Es el
   estado de avance que sobrevive entre chats.

9. **Pie:** fecha de creación + revisiones + orden recomendado + recordatorio de `git mv` a
   `archivo/` al cerrar.

---

## 5. Cómo cortar en etapas (principios)

- **Cada etapa deja el sistema consistente.** Se puede frenar entre etapas sin romper nada.
- **Cada etapa es QAeable por sí sola.** Criterio de aceptación probable sin las etapas
  siguientes (stubs/placeholders si hace falta).
- **Ordená por dependencia dura.** Lo que siembra datos/contratos va antes que lo que los consume.
- **Una pieza por etapa.** Tendé a "un archivo/subsistema por etapa". Etapas verticales
  (config→persistencia→UI→doc) también sirven si cada capa es testeable.
- **La etapa más riesgosa, sola y con QA completo después.**
- **Primera etapa = la que destraba al resto. Última etapa = Cierre** (QA integral + doc +
  release + `git mv` a `archivo/`).
- **Separá lo QAeable localmente de lo que solo se prueba en producción** (integraciones
  externas, permisos, envío real de emails) → eso se difiere al smoke del Cierre.

---

## 6. Reglas globales que casi siempre aplican

Copiá a §1 del orquestador las que correspondan:

0. **REGLA CERO — la rama** (si el repo tiene ramas paralelas). Antes de tocar nada:
   `git branch --show-current`. Si no es la rama de trabajo: FRENAR y avisar.
1. **Codex implementa el spec; Claude audita.** Codex no inventa alcance; la auditoría va en
   chat nuevo. Excepción: etapas de pura doc las escribe Claude.
2. **Cambios mínimos al pedido.** Nada de refactor de paso, **nada de docs por etapa** (la doc
   se actualiza una sola vez en el Cierre), **no levantar servidor** salvo en los pasos de QA.
3. **Deploy solo a entorno de prueba** durante el desarrollo (si el proyecto tiene entornos).
   Producción se toca recién en el Cierre, con JD confirmando.
4. **Contrato externo inmutable.** Las interfaces/firmas que consumen otros módulos no cambian
   de nombres/keys. Un split mueve código, no lo rediseña.
5. **Fix urgente de producción a mitad de etapa:** commitear/stashear, ir a la rama estable,
   fix + deploy, volver, mergear, seguir.
6. **QA por etapa = QA automático de Claude (chat nuevo) + QA manual de JD.**
7. [Sumar acá los footguns transversales propios del proyecto — ej. caché, orden de carga de
   scripts, invalidaciones.]

### Token-economy del QA automático (cuando se usa browser)

- El **browser por MCP es lo más caro** en tokens, y el **screenshot es lo más caro del browser**.
- Verificá con eval de JS (texto chico), lectura de consola y lecturas de DOM.
  **Screenshot = último recurso**, solo para algo visual que no se pueda leer por DOM.
- Etapas move-only/consolidación → **QA liviano** (grueso estático + un boot check). Etapas que
  cambian UI/comportamiento → **QA interactivo pero DOM-first**.

---

## 7. Plantillas de prompts (pegar en el orquestador, rellenar por feature)

### Prompt 1 — Arranque de etapa → Claude (devuelve spec + bloque Codex)
```
Leé <orquestador>.md y trabajamos en la ETAPA X.
Tu respuesta = el spec de la ETAPA X: qué entendiste, archivos a tocar (§5), enfoque en lenguaje
simple, criterios de aceptación (§3) y watch-outs. Verificá el estado real del código en los
archivos en alcance (NO re-escanees todo el repo). AL FINAL del spec, incorporá el bloque listo
para pegarle a Codex, ya completado con los detalles concretos de esta etapa.
```

### Bloque para Codex *(Claude lo incorpora al final del spec; JD lo pega en el chat de Codex)*
```
Implementá la ETAPA X de <orquestador>.md (ese archivo ES el spec).
[Si hay ramas] ANTES DE TOCAR NADA: git branch --show-current → debe decir <rama>. Si no, FRENÁ.
Seguí al pie el spec de la ETAPA X: §2 (lo ya decidido), §4 (modelo de datos), §5 (archivos en alcance).
Reglas:
- Cambios mínimos al pedido. Nada de refactor extra, ni docs (van al Cierre), ni levantar servidor.
- Compat hacia atrás según §2.
- No rompas el contrato externo (interfaces/firmas que consumen otros módulos).
Al terminar, reportá: archivos tocados · decisiones tomadas · riesgos · qué hay que QAear.
```

### Prompt 2 — Auditoría + QA → Claude (chat NUEVO)
```
Revisá críticamente la implementación de la ETAPA X de <orquestador>.md que hizo Codex, hacé vos
el QA automático, y dejá la checklist del QA manual para JD.

PASO 1 — AUDITORÍA (lectura estática): contrato externo intacto · comportamiento según §2/§3 ·
sin alcance de más · los watch-outs de la etapa. Reportá bugs reales, edge cases y drift.
Si está limpio, decilo (no inventes).

PASO 2 — QA AUTOMÁTICO (lo hacés vos, no JD). DISCIPLINA DE TOKENS: eval + consola + DOM;
screenshot solo si es visual e ineludible. Recorré el criterio de aceptación de la etapa (§3).
Distinguí lo QAeable acá de lo que solo se prueba en producción (diferido al Cierre).
Veredicto claro: APROBADO para QA de JD / o lista de lo que falta.

PASO 3 — QA MANUAL DE JD: checklist corta y accionable de qué abrir y mirar a mano.

SPEC que se le pasó a Codex:
()

RESULTADO de Codex (resumen + archivos tocados + diff):
()
```

---

## 8. Checklist para crear un orquestador nuevo

- [ ] Cerrar el diseño con JD (alcance, UX, fórmulas, copys, modelo de datos, decisiones abiertas).
- [ ] Confirmar **rama** y **versión** de salida (si aplican; semver: feature = minor).
- [ ] Cortar en **etapas** QAeables e independientes, ordenadas por dependencia; última = **Cierre**.
- [ ] Escribir el archivo en la **raíz** con la anatomía de §4, pegando las reglas de §6 y los
      prompts de §7 ya rellenados.
- [ ] Dejar el **tracker** con todas las etapas en `- [ ]`.
- [ ] Recordatorio final: al cerrar, **`git mv` a `archivo/`** y actualizar la doc típica UNA vez.

---

*Template de /x (2026-07-01), genericizado del orquestador de AREA VIVA. Al instalarlo en un
proyecto, ajustar §6 con los footguns y entornos propios.*
