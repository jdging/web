---
name: orchestrating-development
description: Orquesta features de software desde el descubrimiento hasta el cierre mediante Claude Code y Codex CLI, con revisión adversarial de planes, implementación por etapas, threads persistentes, modelos fijados, gates de QA y aprobación humana. Usar al diseñar una feature nueva, crear o ejecutar un orquestador por etapas, agregar una etapa no prevista, revisar un spec, coordinar implementación y auditoría, reanudar un trabajo o explicar el estado del flujo.
---

# Orquestar desarrollo

Operar como conductor único. Coordinar Codex CLI; no permitir que dos conductores se llamen entre sí.
Usar `guided` salvo que el responsable pida explícitamente otro modo.

## Determinar el flujo

1. Si no existe orquestador aprobado, leer `references/discovery.md`.
2. Si la etapa ya existe, leer `references/stage-execution.md`.
3. Si apareció una etapa no prevista, seguir "Control de cambio" en `references/discovery.md`.
4. Para estados y permisos, leer `references/states.md`.
5. Antes de invocar un agente, clasificar riesgo con `references/model-routing.md`.
6. Para uso humano ampliado, consultar `tutoriales/orquestador.md`.

## Mostrar siempre en modo guided

Antes de cada transición informar:

```text
DÓNDE ESTAMOS
QUÉ VA A PASAR
QUÉ PUEDE MODIFICARSE
QUÉ RESULTADO ESPERAMOS
QUÉ NECESITA DECIDIR EL RESPONSABLE
```

Ejecutar revisiones read-only después del aviso. Antes de cualquier escritura, cumplir la regla de
consulta previa de `AGENTS.md`. Frenar siempre ante producto, alcance nuevo, producción, merge, tag,
deploy o datos reales.

## Invocar roles de Codex

Crear el prompt bajo `.orchestration/prompts/` y ejecutar:

```powershell
./.claude/skills/orchestrating-development/scripts/invoke-codex-role.ps1 `
  -Role <rol-de-references/model-routing.md> `
  -RunKey <feature-etapa> `
  -PromptFile <ruta>
```

Para continuar el mismo rol y etapa:

```powershell
./.claude/skills/orchestrating-development/scripts/invoke-codex-role.ps1 `
  -Role <rol> -RunKey <feature-etapa> -PromptFile <ruta> -Resume
```

No usar `-Resume` entre roles ni etapas. El script fija modelo, esfuerzo, sandbox y contrato desde
`references/roles.json`. No cambiar de modelo silenciosamente si falla.

Usar `implementer-bounded` solo para cambios locales, acotados y reversibles. Usar
`implementer-critical` ante seguridad, persistencia delicada, migraciones, integraciones operativas,
cambios transversales o release. Una reclasificación abre un thread nuevo: no reutilizar el thread
de Luna con Sol.

## Gates obligatorios

### Antes de implementar

- Diseño/producto aprobado por el responsable.
- Spec contrastado con el código real.
- `plan-reviewer` en `APPROVED`.
- Rama y alcance confirmados.
- Autorización explícita de escritura.

### Después de implementar

- Implementador en `COMPLETED`.
- Revisión arquitectónica de Claude sin corregir directamente.
- Correcciones aplicadas por el mismo thread implementador.
- QA automático con evidencia; usar `evidence-runner` cuando el QA no requiera navegador.
- `code-reviewer` independiente en `APPROVED`.
- `release-reviewer` en `APPROVED` si hay seguridad, migración, CI, datos reales o release.
- QA manual del responsable.

No marcar una etapa completa mientras falte un gate.

## Límites

- Máximo tres rondas consecutivas de `REQUEST_CHANGES` por gate; luego `WAITING_USER`.
- No ejecutar agentes de escritura en paralelo sobre el mismo working tree.
- Mantener revisión e implementación en threads diferentes.
- Mantener documentación en `documentation-runner` solo cuando el alcance documental esté aprobado.
- No archivar un orquestador con etapas pendientes salvo reemplazo explícito y estado migrado.
- Actualizar el tracker humano; `.orchestration/` es evidencia local, no fuente única.

## Cierre

Consolidar QA, documentación y versión. Pedir confirmación separada para producción, merge, tag y
deploy. Archivar el orquestador solo después del cierre real.
