# Descubrimiento y control de cambio

## Feature sin orquestador

1. Capturar problema, objetivo, restricciones y señales de éxito.
2. Separar hechos verificados, supuestos y decisiones del responsable.
3. Inspeccionar solo los subsistemas necesarios en modo lectura.
4. Redactar propuesta Claude: arquitectura, UX, datos, compatibilidad, riesgos y etapas.
5. Enviar la propuesta a `plan-reviewer` con sandbox read-only.
6. Corregir hallazgos bloqueantes y reanudar el mismo thread de revisión.
7. Tras `APPROVED`, presentar al responsable decisiones congeladas y mapa de etapas.
8. Con su aprobación, escribir el orquestador activo según `tutoriales/orquestador.md`.

No usar al revisor para decidir producto. Sus preguntas de negocio pasan a `WAITING_USER`.

## Control de cambio

Cuando aparezca una etapa no prevista, crear antes un `CHANGE_REQUEST` con:

- premisa anterior y nueva;
- evidencia que provocó el cambio;
- etapas, contratos y archivos afectados;
- dependencias y orden;
- compatibilidad y migraciones;
- impacto en versión, QA y producción;
- alternativas y decisión requerida.

Revisar el cambio con `plan-reviewer`, pedir aprobación del responsable y recién entonces modificar
el orquestador. Registrar excepciones de dependencia explícitamente; no fingir que una dependencia
terminó si solo se usaron datos simulados.
