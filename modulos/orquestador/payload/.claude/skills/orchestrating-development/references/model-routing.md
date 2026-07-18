# Selección de modelos y riesgo

Elegir el rol antes de invocar Codex; no cambiarlo durante un thread.

| Trabajo | Rol | Modelo / esfuerzo |
|---|---|---|
| Plan o spec | `plan-reviewer` | Sol / high |
| Implementación local, acotada y reversible | `implementer-bounded` | Luna / high |
| Seguridad, persistencia delicada, migración o cambio transversal | `implementer-critical` | Sol / high |
| Revisión normal de código | `code-reviewer` | Sol / high |
| Arquitectura, seguridad, migración, CI o release | `release-reviewer` | Sol / xhigh |
| Actualización documental autorizada | `documentation-runner` | Luna / high |
| Tests, inventario y evidencia read-only | `evidence-runner` | Luna / high |

Clasificar como crítico ante cualquiera de estas señales: autenticación/autorización, datos reales,
migraciones, reglas o índices de datos, integraciones operativas, concurrencia, pagos/precios,
cambios transversales, CI/release o rollback complejo. Si una implementación acotada encuentra una
señal crítica, frenar en `BLOCKED` y abrir un thread nuevo con el rol crítico.

Terra queda reservado para exploración o lectura masiva de bajo riesgo; no usarlo para escribir ni
para aprobar gates críticos. `max`/`ultra` no son defaults: subir desde `high`/`xhigh` solo con una
evaluación que demuestre una mejora necesaria.

Claude conduce con Fable/high. Si Fable no está disponible al iniciar la sesión, el responsable
elige de forma explícita `orchestrator-opus` y, si Opus tampoco está disponible,
`orchestrator-sonnet`. El revisor de arquitectura usa `inherit` y acompaña el modelo del conductor.
Nunca cambiar de modelo dentro de una sesión existente ni ocultar el fallback.
