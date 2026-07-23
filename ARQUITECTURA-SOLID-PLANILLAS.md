# Orquestador — Arquitectura SOLID para planillas de cálculo y herramientas técnicas standalone

> Estado general: **PAUSADO** (sesión cerrada 2026-07-23; retomar con
> `RETOMAR-arquitectura-solid-planillas.md`). Rama: `main`. Riesgo: bajo (solo documentación en
> `ideas/`, sin código de producto ni datos reales). Conductor: Claude (Fable/high). Revisor de
> plan: Codex `plan-reviewer` (Sol/high, read-only). Implementador de esta etapa: Codex
> `documentation-runner` (Luna/high, workspace-write).

## 1. Objetivo

Diseñar una base arquitectónica reutilizable para planillas HTML/JavaScript standalone que
separe Dominio, Aplicación, Presentación, Infraestructura y Configuración, aplicando SOLID de
forma pragmática (sin clases, interfaces formales ni contenedores de DI si funciones puras y
módulos chicos alcanzan). Doble propósito: (a) base para planillas nuevas, (b) guía para
refactorizar planillas existentes que no consideraron esta separación.

Ubicación decidida: `ideas/arquitectura-solid-planillas.md` (idea conceptual, no módulo — falta
validar contra un caso real antes de evaluar promoción a `modulos/` u otro mecanismo).

## 2. Decisiones congeladas (rondas 1-6 de `plan-reviewer`, `APPROVED` el 2026-07-23)

### 2.1 Capas y matriz de dependencias permitidas

| Módulo | Puede importar de |
|---|---|
| `config/` | nada |
| `dominio/` | `config/` |
| `aplicación/` | `dominio/`, `config/` |
| `infraestructura/` | `config/` |
| `presentación/` | `config/` (solo etiquetas/unidades de UI) |
| `main/` (composition root) | `aplicación/`, `infraestructura/`, `presentación/`, `config/` |

`presentación/` nunca importa `aplicación/` estáticamente: expone `montarUI(dependencias)` y
recibe los casos de uso ya resueltos como parámetro en runtime, inyectados por `main/`.
`aplicación/` nunca importa `infraestructura/` directo: recibe adapters/puertos por parámetro
(factories). `main/` es el único módulo que conoce las cinco piezas a la vez.

### 2.2 Manifiesto de ensamblado (mapea el orden ya exigido por `INSTRUCTIVO_PLANILLAS.md:186-196`)

| # | Slot del instructivo | Capa/origen real |
|---|---|---|
| 1 | Constantes y tablas normativas | `config/` |
| 2 | `SAVED_STATE` | escrito a mano en la plantilla base (Etapa 1); leído/normalizado por `main/` al arrancar |
| 3 | Helpers generales (`$`, `fmt`) | `presentación/` |
| 4 | Funciones de cálculo puras | `dominio/` |
| 4.5 (slot nuevo, aditivo) | casos de uso | `aplicación/` — entre cálculo puro (4) y renderizado (5) |
| 5 | Funciones de renderizado | `presentación/` |
| 6 | Tema | `presentación/` |
| 7 | Estado y guardado standalone | `infraestructura/` (`guardarStandalone`) |
| 8 | Exportaciones | `infraestructura/` (`exportarWord`, `exportarPdf`, registro por `formato`) |
| 9 | Carga inicial y listeners | `main/` ensambla; `presentación/` registra listeners |

No contradice el instructivo: mantiene su orden macro y solo nombra dónde vive la orquestación
que antes quedaba implícita.

### 2.3 Contratos mínimos congelados (dominio/aplicación/infraestructura)

- Cálculo y validación: síncronos, puros, sin `document`/`window`/`fetch`; validación nunca hace
  `throw` para errores esperados de usuario (`{ok, errores}`); usa `Number.isFinite`, no
  `typeof === "number"` (evita aceptar `NaN`/`Infinity`).
- `DEFAULT_STATE` (config, defaults de fábrica) vs `SAVED_STATE` (embebido, último guardado):
  `main/` normaliza `SAVED_STATE` contra `DEFAULT_STATE` al arrancar (clona y completa claves
  faltantes; nunca renombra/transforma — cualquier cambio de shape persistido es una migración
  aparte).
- Limpiar: resetea datos/resultado a `DEFAULT_STATE`, conserva el tema vigente en pantalla (el
  tema es preferencia de UI, no dato de cálculo).
- Exportación: un solo caso de uso con selector `formato` (`"word"|"pdf"|...`) contra un registro
  de adapters en `main/`; DTO único y clonado (`structuredClone`); reloj (`ahoraIso`) inyectado
  como dependencia explícita, nunca leído directo de `Date` global dentro de `aplicación/`; guard
  `resultado == null` se evalúa **antes** de invocar el reloj.
- Todo exportador cumple `(dto) => Blob`; agregar uno nuevo = módulo nuevo + una línea en el
  registro de `main/`, sin tocar `aplicación/` ni `dominio/`.
- Tests de caracterización — comparador de equivalencia: finitos con tolerancia relativa `1e-9`
  (absoluta `1e-12` si el esperado es `0`); no finitos con `Object.is` (cubre `NaN`/±Infinity);
  `-0`/`0` se consideran equivalentes.

### 2.4 Alcance del ejemplo de Etapa 1

El ejemplo antes/después del documento es **pseudocódigo ilustrativo**, no ejecutado ni testeado
en esta etapa. Casos de runtime (transición atómica entrada/resultado al recalcular; persistencia
de valores no finitos en `SAVED_STATE`) quedan diferidos, por diseño, al spec propio de Etapa 2.

### 2.5 Antipatrón conocido (se documenta, no se corrige aquí)

El patrón de guardado de `INSTRUCTIVO_PLANILLAS.md:350-357` reemplaza el bloque `SAVED_STATE`
con un `.replace(regex, ...)` directo sobre `JSON.stringify(estado)`, sin escapar `</script>`,
los centinelas `/*__STATE_END__*/` ni secuencias `$&`/`$$`. Con estados numéricos simples no
ocurre, pero es un footgun conocido heredado del instructivo actual. **No se toca
`INSTRUCTIVO_PLANILLAS.md` en esta iniciativa**; se deja documentado como antipatrón con
recomendación para una iniciativa futura separada (serialización segura con callback de
reemplazo + test de round-trip).

### 2.6 Otras decisiones

- Node mínimo: 22 LTS o superior (Node 20 ya fuera de mantenimiento).
- `CHANGELOG.md`: no se toca — su alcance declarado (líneas 3-4) cubre `base/`, `modulos/` y
  documentos cerebro; `ideas/` queda fuera por definición propia del archivo.
- Referencia de origen de la idea: `modulos/marca/planillas/INSTRUCTIVO_PLANILLAS.md` (visual) y
  este orquestador (mientras exista en la raíz; si se archiva, actualizar la referencia).
- Primer caso real de validación (fuera de este orquestador, requiere `CHANGE_REQUEST` propio):
  `C:\proyectos\planillas-de-calculo\work\301-18\alma-variable`.

## 3. QA de alcance (Etapa 1)

Manifiesto de hashes SHA-256 de todo el árbol (excluyendo `.git/` y `.orchestration/`) antes y
después de `documentation-runner`. Único resultado aceptable: alta de
`ideas/arquitectura-solid-planillas.md`, cambio de hash de `ideas/README.md`, sin ninguna otra
alta/baja/cambio. Evidencia en
`.orchestration/runs/arquitectura-solid-planillas/etapa-1/{baseline,after}-sha256.json` y
`qa-alcance.json`.

## 4. Etapas

| Etapa | Spec | Implementación | Review arquitectónico | QA auto | code-reviewer | QA humano | Estado |
|---|---|---|---|---|---|---|---|
| 1 — Documento de arquitectura | `APPROVED` (plan-reviewer, 6 rondas) | `COMPLETED` (documentation-runner) | hecha por el conductor (Claude), sin correcciones necesarias | `PASS` (manifiesto de hashes, alcance limitado a los 2 archivos autorizados) | `APPROVED` | pendiente | `WAITING_USER` (falta QA humano para cerrar) |
| 2 — Ejemplo runnable de juguete | pendiente (spec propio, no escrito) | — | — | — | — | — | `WAITING_USER` (prevista desde el descubrimiento; no requiere `CHANGE_REQUEST`; sí requiere spec propio + ronda de `plan-reviewer` antes de implementar) |

## 5. Archivos afectados por Etapa 1

- `ideas/arquitectura-solid-planillas.md` (nuevo)
- `ideas/README.md` (una fila nueva de índice)

## 6. Qué no se toca

`modulos/marca/planillas/INSTRUCTIVO_PLANILLAS.md`, `modulos/` (nada se promueve todavía),
`INICIAR.md`, `LEEME.md`, `CAPTURAR.md`, `CHANGELOG.md`, cualquier repositorio externo de
planillas, cualquier fórmula o criterio normativo real.

## 7. Evidencia

Prompts, hilos y resultados de `plan-reviewer` en
`.orchestration/runs/arquitectura-solid-planillas/plan-reviewer/` (6 rondas, `APPROVED` final).
Evidencia de Etapa 1 (`documentation-runner`, QA, `code-reviewer`) en
`.orchestration/runs/arquitectura-solid-planillas/etapa-1/` y
`.orchestration/runs/arquitectura-solid-planillas/documentation-runner|code-reviewer/`.

*Creado 2026-07-23.*
