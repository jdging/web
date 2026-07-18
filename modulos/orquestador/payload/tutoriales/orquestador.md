# Orquestador de desarrollo v2 — guía humana

> Sistema guiado para descubrir, planificar, implementar, auditar y cerrar features con Claude Code
> como conductor y Codex CLI como revisor/implementador. El modo predeterminado es `guided`: explica
> cada transición y nunca inicia escritura, producción, merge, tag o deploy sin autorización humana.

## 1. Modelo mental

El sistema tiene dos flujos conectados:

1. **Descubrimiento:** convertir una necesidad todavía abierta en un orquestador aprobado.
2. **Ejecución:** convertir cada etapa aprobada en código verificado y QA manual.

Claude Code es el único conductor. Codex CLI no llama a Claude: Claude inicia cada consulta, recibe
una respuesta estructurada y decide la transición permitida.

```text
Necesidad → Descubrimiento → Orquestador aprobado → Etapa → Spec aprobado
          → Implementación → Auditorías → QA humano → Cierre
```

## 2. Flujos

### Feature nueva

1. Capturar problema, objetivo, restricciones y decisiones de producto.
2. Inspeccionar el código en modo lectura.
3. Claude propone la arquitectura.
4. `plan-reviewer` la revisa adversarialmente sin editar.
5. Claude consolida hasta obtener `APPROVED`.
6. El responsable aprueba las decisiones de producto y la escritura.
7. Crear el orquestador activo en la raíz.

### Etapa existente

1. Claude contrasta la etapa con el código real y redacta el spec ejecutable.
2. `plan-reviewer` revisa el spec.
3. Con `APPROVED` y autorización, Codex implementa con Luna o Sol según el riesgo.
4. Claude revisa el diff; el mismo thread implementador corrige.
5. QA ejecuta las pruebas permitidas.
6. Otro thread de Codex revisa el resultado final.
7. El responsable hace el QA manual y se cierra la etapa.

### Etapa nueva no prevista

Crear primero un `CHANGE_REQUEST`: premisa nueva, evidencia, alcance, dependencias, compatibilidad,
versión y decisión requerida. Revisarlo, aprobarlo y recién después modificar el orquestador.

## 3. Roles y modelos

La fuente ejecutable vive en
`.claude/skills/orchestrating-development/references/roles.json`.

| Rol | Modelo | Función | Escritura |
|---|---|---|---|
| Conductor | Claude Fable / high | decisiones, síntesis y comunicación | solo estado/docs autorizados |
| Revisor de plan | Codex Sol / high | detectar huecos antes de programar | no |
| Implementador acotado | Codex Luna / high | cambio local y reversible | workspace |
| Implementador crítico | Codex Sol / high | seguridad, datos o cambio transversal | workspace |
| Revisor arquitectónico | Hereda conductor / high | verificar intención y contratos | no |
| QA runner | Claude Sonnet / high | ejecutar pruebas y resumir evidencia | no |
| Evidencia | Codex Luna / high | tests e inventario read-only | no |
| Documentación | Codex Luna / high | actualizar docs autorizadas | solo alcance aprobado |
| Revisor final | Codex Sol / high | verificar código contra spec | no |
| Revisor crítico/release | Codex Sol / xhigh | seguridad, migraciones y release | no |

Los modelos se fijan por rol. Si uno deja de estar disponible, el sistema frena; no lo sustituye
silenciosamente. El conductor usa **Fable → Opus → Sonnet** como fallback explícito.

```powershell
claude --agent orchestrator --chrome
claude --agent orchestrator-opus --chrome
claude --agent orchestrator-sonnet --chrome
```

## 4. Estados

- `APPROVED`: gate aprobado.
- `REQUEST_CHANGES`: correcciones concretas; no avanzar.
- `BLOCKED`: impedimento técnico o contractual.
- `WAITING_USER`: falta una decisión, dato, permiso o acción humana.
- `FAILED_RETRYABLE`: fallo transitorio.
- `COMPLETED`: implementación terminada; todavía falta revisar.

Después de tres rondas consecutivas de `REQUEST_CHANGES`, frenar en `WAITING_USER`.

## 5. Modo guided

Antes de cada transición mostrar:

```text
DÓNDE ESTAMOS
QUÉ VA A PASAR
QUÉ PUEDE MODIFICARSE
QUÉ RESULTADO ESPERAMOS
QUÉ NECESITA DECIDIR EL RESPONSABLE
```

Las revisiones read-only pueden ejecutarse después del aviso. Toda escritura requiere aprobación.

## 6. Orquestador activo

El Markdown versionado debe incluir estado, rama/versión, reglas, decisiones congeladas, etapas,
dependencias, riesgo, archivos, modelo de datos, compatibilidad, footguns, aceptación y tracker:

| Etapa | Spec | Implementación | Review | QA auto | QA humano | Estado |
|---|---|---|---|---|---|---|
| 1 | aprobado | completa | aprobado | pasó | pendiente | `WAITING_USER` |

Los threads, prompts, JSONL y resultados viven localmente en `.orchestration/`; nunca reemplazan el
tracker humano.

## 7. Comunicación con Codex CLI

```powershell
./.claude/skills/orchestrating-development/scripts/invoke-codex-role.ps1 `
  -Role plan-reviewer -RunKey feature-etapa-1 -PromptFile <prompt>

./.claude/skills/orchestrating-development/scripts/invoke-codex-role.ps1 `
  -Role implementer-bounded -RunKey feature-etapa-1 -PromptFile <prompt>

./.claude/skills/orchestrating-development/scripts/invoke-codex-role.ps1 `
  -Role implementer-bounded -RunKey feature-etapa-1 -PromptFile <corrección> -Resume
```

El wrapper fija modelo, esfuerzo, sandbox y schema; conserva el `thread_id`; guarda evidencia local;
y falla ante un modelo ausente o una respuesta inválida.

## 8. Autorizaciones humanas

Siempre requieren decisión humana: producto/UX, alcance nuevo, escritura, QA manual, datos reales,
producción, merge, tag, deploy y archivado final. Si hay branding o UX visual, consultar a la persona
responsable de diseño definida por el proyecto.

## 9. Ciclo de vida

- Raíz: orquestadores activos.
- `tasks/`: trabajo abierto que todavía no es un orquestador.
- `archivo/`: material cerrado o explícitamente reemplazado.

No archivar un orquestador incompleto. Al cerrar: consolidar QA, documentación, versión y release.

## 10. Arranque rápido

```text
Usá /orchestrating-development en modo guided.
Quiero descubrir una feature nueva: <problema>.
```

```text
Usá /orchestrating-development en modo guided.
Trabajemos la ETAPA X de <orquestador>.md.
```

*Versión portable 2.0.0. Mantener alineada con el skill, agentes y roles instalados.*
