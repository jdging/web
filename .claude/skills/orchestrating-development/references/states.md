# Estados, permisos y evidencia

## Estados

- `APPROVED`: gate aprobado; habilita la próxima transición definida.
- `REQUEST_CHANGES`: correcciones bloqueantes; no avanzar.
- `BLOCKED`: impedimento que el agente no puede resolver dentro del alcance.
- `WAITING_USER`: decisión, dato, permiso o acción humana.
- `FAILED_RETRYABLE`: fallo transitorio de CLI, herramienta o entorno.
- `COMPLETED`: implementación terminada; no equivale a etapa aprobada.

## Reglas de transición

- Diseño `APPROVED` + aprobación humana → crear orquestador.
- Spec `APPROVED` + autorización de escritura → implementar.
- Implementación `COMPLETED` → revisión arquitectónica.
- Review arquitectónico `APPROVED` → QA automático.
- QA PASS + review final `APPROVED` → QA humano.
- QA humano aprobado → etapa completa.

## Evidencia mínima

Guardar por rol y etapa:

- prompt enviado;
- modelo, esfuerzo y sandbox;
- `thread_id`;
- respuesta final estructurada;
- eventos JSONL y errores;
- fecha y código de salida.

El script guarda esto en `.orchestration/runs/<run-key>/<role>/`. El tracker Markdown conserva solo
el estado humano resumido y sigue siendo la fuente compartida entre máquinas.

## Permisos

- Revisores: `read-only`.
- Implementadores y documentación: `workspace-write`, solo después de autorización y con alcance explícito.
- QA: sin edición; comandos permitidos por el proyecto.
- Producción, datos reales, merge, tag y deploy: confirmación puntual del responsable.
