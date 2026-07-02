# Índice de código — el mapa "¿dónde toco para…?"

- **Origen:** area-viva (`docs/INDICE.md`, nacido como `mapa.md` en la FASE 0 de la auditoría), 2026-06
- **Qué resuelve:** que cualquier IA o dev ubique el archivo y la función a tocar **sin leer
  todo el repo** (token-economy). Es la inversión que abarata todas las sesiones siguientes.
- **Cuándo aplica:** proyectos medianos/grandes (muchos archivos, o archivos >1.000 líneas).
  En un proyecto chico el CONTEXTO.md alcanza.

## La idea

Un único `docs/INDICE.md` con:

1. **Inventario de archivos:** tabla por archivo — ruta, líneas, responsabilidad en 1 frase,
   qué interfaz expone (globals/exports), de qué depende.
2. **Tablas de dominio "¿Dónde…?":** por pregunta frecuente → puntero `archivo:función` +
   watch-out/DEC asociado. Se apunta `archivo:función` (estable), NO `archivo:línea` (se corre
   con cada edición).
3. **Inventario de datos:** colecciones/tablas reales vistas en el código y quién las lee/escribe.
4. **Orden de carga / entry points** (si el orden importa, ej. `<script>` sin bundler).
5. **Zonas calientes:** archivos gigantes, candidatos a split (deuda futura).

**Cómo se usa:** buscás el dominio, seguís el puntero, mirás el watch-out, y **recién entonces**
abrís el archivo real.

**Regla de mantenimiento (la clave para que no muera):** se actualiza en el MISMO paso que la
bitácora, cada vez que un SPEC **cree, mueva o elimine** un archivo o una función expuesta.
NO se toca por cambios internos a una función. En el `CLAUDE.md` del proyecto se declara al
índice como **fuente autoritativa** de "qué función vive en qué archivo" (las alertas viejas
pueden citar archivos que ya se movieron).

**Cómo nace barato:** como FASE 0 de una auditoría (un barrido de nombres/firmas, no lectura
profunda) o como etapa de pura doc de un orquestador — la escribe Claude directo.

## Cómo llevarla a un proyecto

1. Correr un barrido tipo FASE 0 (`/x/base/tutoriales/auditoria.md`) que genere el índice.
2. Guardarlo en `docs/INDICE.md` con las 5 secciones de arriba (omitir las que no apliquen).
3. Sumar al `CLAUDE.md`: "consultar `docs/INDICE.md` antes de abrir archivos" + la regla de
   mantenimiento en los cierres.

## Referencia de origen

`area-viva/docs/INDICE.md` (ejemplo completo post-refactor) y `area-viva/tasks/auditoria/mapa.md`
(la semilla generada por la FASE 0).
