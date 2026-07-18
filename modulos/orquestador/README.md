# Orquestador Claude Code ↔ Codex CLI

Módulo portable del flujo de desarrollo v2 probado en AREA VIVA. Claude Code conduce el
descubrimiento y las transiciones; Codex CLI revisa planes, implementa con un rol fijado por riesgo,
recolecta evidencia y audita el resultado mediante contratos JSON.

## Qué instala

- El skill `orchestrating-development` y sus contratos.
- Los agentes de Claude para conducción, revisión arquitectónica y QA.
- Los roles de Codex para plan, implementación, revisión, documentación y evidencia.
- La guía humana `tutoriales/orquestador.md`.
- Un manifiesto `.orchestrator-install.json` para actualizaciones seguras.
- Un bloque administrado en `.gitignore` para versionar la configuración y excluir las corridas.

No instala reglas de negocio, Firebase, servidores, credenciales ni artefactos de AREA VIVA.

## Uso rápido

Primero simular:

```powershell
C:\Proyectos\x\modulos\orquestador\instalar.ps1 -ProjectRoot C:\Proyectos\mi-proyecto
```

Si la vista previa es correcta, aplicar:

```powershell
C:\Proyectos\x\modulos\orquestador\instalar.ps1 `
  -ProjectRoot C:\Proyectos\mi-proyecto `
  -Apply
```

Después hay que integrar las reglas del flujo en `AGENTS.md` y `CLAUDE.md`. En proyectos creados con
`C:\Proyectos\x\INICIAR.md`, los templates ya contienen esas reglas. Para una migración existente,
seguir `INSTALAR.md` y aprobar el diff documental antes de editarlo.

## Política de seguridad

- Sin `-Apply`, el script no escribe.
- Nunca sobrescribe un archivo ajeno o modificado localmente.
- Una actualización reemplaza solo archivos cuyo hash coincide con la versión previamente instalada.
- Si encuentra un conflicto, no realiza una instalación parcial.
- Producción, merge, tag, deploy y datos reales siguen requiriendo autorización puntual.

