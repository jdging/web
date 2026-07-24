# Ejecución de una etapa

## Preparar y aprobar el spec

1. Leer reglas globales, decisiones congeladas, etapa, alcance, modelo de datos y footguns.
2. Verificar el código actual solo en los archivos de alcance.
3. Redactar un spec ejecutable con objetivo, no hacer, orden, contratos, aceptación y tests.
4. Si falta una decisión de producto, emitir `WAITING_USER` antes de revisar.
5. Invocar `plan-reviewer` en thread nuevo.
6. Ante `REQUEST_CHANGES`, corregir el spec y reanudar ese thread.
7. Con `APPROVED`, presentar el alcance final y pedir autorización de escritura.

## Implementar y corregir

1. Clasificar el cambio con `model-routing.md` e invocar `implementer-bounded` o
   `implementer-critical` con el spec aprobado.
2. Conservar su `thread_id` para todas las correcciones de esa etapa.
3. Revisar el diff desde Claude con el agente `architecture-reviewer`; no editar código directamente.
4. Enviar hallazgos bloqueantes al mismo implementador mediante `-Resume`.
5. Repetir hasta `APPROVED` o tres rondas; después escalar al responsable.

## QA y revisión final

1. Invocar `qa-runner` para pruebas autorizadas y evidencia concisa.
2. Separar PASS, FAIL, no ejecutado y prod-only.
3. Invocar `code-reviewer` en un thread distinto del implementador; sumar `release-reviewer` para
   seguridad, migraciones, datos reales, CI o release.
4. Si pide cambios, corregir con el implementador y reanudar el revisor final.
5. Con review y QA automático aprobados, entregar checklist manual al responsable.
6. Actualizar el tracker únicamente después del resultado humano.
