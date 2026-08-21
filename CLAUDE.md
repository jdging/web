# Preferencias y Reglas para Claude (jdging/web — toolkit)

## Qué es este repo
Toolkit propio de orquestación y módulos reutilizables (`modulos/`, `base/`, `ideas/`,
`tutoriales/`). **Es un repo público.** Nada sensible se versiona acá.

## Reglas de Oro
1. NUNCA escribas código de aplicación directamente. Implementa Codex con el rol que corresponda.
2. Antes de cualquier escritura, consultá y mostrá un resumen. Excepción: cuando el responsable
   otorgó autorización explícita y vigente para el alcance en curso.
3. Freno duro e innegociable: **producción, datos reales, merge, tag y deploy**. Ahí se para y se
   pide confirmación separada, siempre, aunque haya autorización general.
4. `ref/` está gitignorado a propósito (`cv_data.json` tiene teléfono, email, notas internas y
   nombres de clientes de empleadores). No versionarlo, no copiarlo a un artefacto público, no
   citarlo textualmente en documentos versionados.
5. `archivo/` es material cerrado. No leerlo salvo pedido explícito.
6. Priorizá herramientas gratuitas y el ecosistema Google.
7. Nunca uses "vale la pena" ni "no vale la pena".

## Flujo de trabajo
- **Orquestación v2:** skill `orchestrating-development`, modo `guided` salvo instrucción explícita
  del responsable. Claude es conductor único; Codex revisa e implementa con roles fijados por riesgo.
- Conductor: Fable/high. Si Fable no está disponible, el responsable elige `orchestrator-opus` y
  luego `orchestrator-sonnet`. **El fallback se declara en la conversación y en el commit.**
- Antes de implementar: diseño aprobado, spec contrastado con código real, `plan-reviewer APPROVED`,
  rama y alcance confirmados. Después: revisión arquitectónica, QA con evidencia, `code-reviewer`
  independiente y QA manual del responsable.
- Los roles de escritura no corren en paralelo sobre el mismo working tree.

## Skills acoplados al orquestador
- **`front-end-developer` se levanta SIEMPRE junto a `orchestrating-development` cuando el trabajo
  toca UI, UX, HTML, CSS, componentes, layout, accesibilidad o diseño visual.** No es opcional ni
  queda a criterio del conductor.
- Ese skill es **la autoridad de UI/UX del repo**. Sus reglas (Tailwind exclusivo, early returns,
  `const` arrow functions tipadas, handlers con prefijo `handle`, accesibilidad con `tabindex` /
  `aria-label` / handlers de teclado, cero placeholders o TODOs) son **contrato**, no sugerencia.
- El conductor **copia ese contrato dentro de todo prompt de implementación de UI que va a Codex**.
  Codex no tiene acceso al skill: si el contrato no viaja en el prompt, no existe.
- El `code-reviewer` verifica el diff contra ese contrato además del spec de la etapa.
- Versión fijada en `skills-lock.json`. Instalación local en `.agents/skills/`, expuesta por symlink
  en `.claude/skills/`. No editar el SKILL.md a mano sin actualizar el hash del lock.

## Entorno (limitaciones conocidas)
- **No hay `pwsh`**: `invoke-codex-role.ps1` no corre. Se invoca `codex exec` replicando modelo,
  esfuerzo y sandbox desde `references/roles.json`, y se registra qué se replicó.
- **El sandbox de Codex (bubblewrap) no arranca** en el contenedor: `No permissions to create new
  namespace`. Workaround para revisiones read-only: copiar los archivos a `/tmp/rev-ws`, `git init`,
  correr con `-s danger-full-access` ahí y verificar con `git status` que no escribió nada.
  El read-only se garantiza por aislamiento físico, no por sandbox. Declararlo en cada revisión.

## Alertas Críticas (Watch Out)
- Este repo se llama `web`, pero **no** es el sitio comercial. Un repo de GitHub Pages llamado `web`
  serviría en `/web/` y ataría todo el sitio a ese base path: mudarse a un dominio propio rompería
  URLs y SEO. El sitio va a un repo con base path `/`.
- `.orchestration/` es evidencia local gitignoreada. El tracker humano (`RETOMAR-*.md` en la raíz) es
  la fuente de verdad entre máquinas.
