# Preferencias y Reglas para Claude ([NOMBRE])

<!-- Template de /x. Al instalar: rellenar, borrar lo que no aplique y estos comentarios.
     Mantenerlo CORTO: acá van reglas y alertas críticas, no documentación (eso va a docs/). -->

## Reglas de Oro
1. NUNCA escribas código sin antes consultarme y mostrar un resumen.
2. **No levantes servidor local** salvo que yo lo permita o sea un paso de QA de un
   orquestador activo.
3. **No actualices la doc típica** (BITACORA, CONTEXTO, DECISIONES, lessons) durante el
   trabajo — ofrecé actualizarla en los cierres y esperá mi OK.
4. QA automático tuyo: **permitido cuando lo dirige un orquestador**. Token-economy: eval/DOM
   y consola antes que screenshot (screenshot = último recurso, solo para lo visual).
5. **`archivo/` es material cerrado/no vigente.** NO leerlo salvo pedido explícito.
   Convención: raíz = orquestadores activos · `tasks/` = solo trabajo abierto/futuro ·
   al cerrar un trabajo, su doc migra a `archivo/` (con `git mv`).
6. Priorizá herramientas gratuitas y el ecosistema Google.
7. Nunca uses "vale la pena" ni "no vale la pena".

## Flujo de trabajo
- **REGLA CERO de toda sesión (si hay ramas):** correr `git branch --show-current` antes de
  trabajar. Rama de trabajo: `[RAMA]`. [Si el proyecto no usa ramas paralelas, borrar.]
- Trabajo grande → armar orquestador con `tutoriales/orquestador.md`. Trabajo chico
  (1-2 archivos, QAeable de una) → directo o como task en `tasks/`.
- Vos producís specs y auditás; el código lo implementa Codex. Excepción: etapas de pura
  documentación las escribís vos.

## Contexto mínimo
- [Qué es el proyecto en 1-2 líneas + dónde está el detalle: docs/CONTEXTO.md]

## Alertas Críticas (Watch Out)
<!-- Una entrada por footgun real del proyecto, con la referencia (DEC-XXX / LEC-XXX) si existe.
     Este bloque es el que más ahorra: evita re-descubrir errores ya pagados. -->
- [alerta]
