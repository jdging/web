# RETOMAR — Sitio comercial JDG (reemplazo de Portafolio)

- **Estado:** `WAITING_USER` — bloqueado esperando decisiones del responsable.
- **Última sesión:** 2026-08-20
- **Conductor:** Claude, modo `guided`, **fallback `orchestrator-opus` activado** (Fable no disponible).
- **Gate actual:** `plan-reviewer` → `REQUEST_CHANGES` (ronda 1 de 3).

> La evidencia completa vive en `.orchestration/` (`PROPUESTA-sitio-jdg.md`,
> `reviews/etapa0-planreview.json`), que **está en `.gitignore` y NO viaja en el push**.
> Si retomás desde otra máquina, este archivo es la fuente de verdad.

---

## 1. Qué se quiere hacer

Reemplazar `jdging.github.io/Portafolio` por un sitio estático propio, **orientado a conseguir
clientes**, con la impronta de JD. Referencia de arquitectura de información (no de código):
`civilworksestructuras.ar`. Explícitamente fuera de alcance: PechaKucha.

## 2. Hechos verificados (no re-investigar)

- El sitio actual es una **exportación estática de WordPress 6.5.3** + Hello Elementor +
  Elementor 3.21 + Qi Addons + Joinchat. 116 KB de HTML autogenerado, 47 imágenes, jQuery.
  **No hay fuente editable.** Contenido de 2024.
- `civilworksestructuras.ar` también es WordPress. Lo valioso es su IA offer-led:
  Trayectoria / Cómo Trabajo / Cálculos / Inspecciones / Obras / FAQ / Contacto.
- **Este repo (`/workspace`) ES `jdging/web`**, el toolkit del orquestador. Es **público**.
  GitHub Pages NO está configurado acá; `jdging.github.io/web` da 404.
- `jdging.github.io` (user site, URL raíz) da 404: **el nombre está libre**.
- Repos con Pages activo: `Portafolio`, `LIFE`, `Distocracia`, `Estudio`.
- `ref/cv_data.json` (48 KB) es la base de contenido: 6 empleos, 8 clientes freelance con ~17
  proyectos, 2 proyectos propios, 27 skills, 4 destacados. Tiene `perfiles_disponibles`
  (`estructural` / `sistemas` / `todoterreno`) y filtros `incluir_en`.
  **Está gitignorado a propósito** (ver §5).
- Marca declarada en el JSON: **"JDG · Sistemas & Estructuras"**.

## 3. Entorno (limitaciones encontradas)

- **No hay `pwsh`** → `invoke-codex-role.ps1` no corre. Se invoca `codex exec` replicando
  modelo/esfuerzo/sandbox desde `references/roles.json`.
- **El sandbox de Codex (bubblewrap) no arranca** dentro del contenedor: falla con
  `No permissions to create new namespace` en cualquier modo.
  *Workaround usado:* copiar los archivos a revisar a `/tmp/rev-ws`, `git init`, correr Codex con
  `-s danger-full-access` ahí, y verificar con `git status` que no escribió nada.
  El read-only se garantiza por aislamiento físico, no por sandbox.

## 4. Veredicto del plan-reviewer (Sol / high) — 10 bloqueantes

1. **Fuente única contradicha por el propio JSON.** `_meta.descripcion` remite imágenes y proyectos
   de empleadores a un `proyectos.json` aparte. Copiar el JSON al repo del sitio crea una segunda
   copia sin sincronización. → Definir propietario canónico + capa de contenido propia del sitio
   que referencie IDs estables.
2. **Publicar el JSON completo filtra contenido no aprobado** (teléfono, email, notas internas,
   clientes de empleadores, proyectos del empleo actual). → Proyección con *allowlist*; nunca
   serializar el JSON entero al artefacto público; control automatizado antifiltración.
3. **Los datos no soportan un grid uniforme por tags.** 27 proyectos, **87 tags únicos** que mezclan
   servicios, materiales, clientes, software, sectores y lugares. 2 proyectos sin tags ni fecha,
   3 con `fecha: null`. `proyectos_destacados_por_escala` referencia `deprop`, que es un **empleo**,
   no un proyecto. → Modelo web normalizado + taxonomía controlada.
4. **La IA todavía no define una oferta comprable.** "Dos vías" separa disciplinas pero no
   especifica cliente, problema, alcance, entregable ni próximo paso. Además no hay contenido en el
   JSON para "Cómo trabajo" ni FAQ. → Matriz aprobada de audiencia/necesidad/servicio/prueba/CTA
   **antes** de cerrar la IA.
5. **Las métricas de escala pueden inducir a error.** 5.000 t y 50.000 m³ son un **cómputo para
   CAPEX ±30 %**, no una obra diseñada. La celda de 200.000 t fue **predimensionamiento**. La torre
   de 34 m y varios clientes son de relación de dependencia. → Ficha de procedencia por claim
   (comitente, rol, alcance, etapa, evidencia, autorización).
6. **Confidencialidad y conflicto laboral son gates de publicación**, no riesgos a mitigar después.
7. **Contenido e imágenes están clasificados demasiado tarde y demasiado livianos.**
   **Los 27 proyectos tienen `imagenes: []`. Cero imágenes.** → Mover inventario, permisos y
   selección de casos **antes** del sistema de diseño.
8. **El orden de etapas construye el sitio antes de resolver su modelo y su contenido.**
   Zod en etapa 1 validaría el modelo de CV, no el contrato web inexistente.
9. **Estrategia de URL subespecificada.** GitHub Pages **no ofrece 301 real**; un redirect HTML no
   da las mismas garantías. `persona.portfolio_url` apunta a `/Portafolio`, URL ya presente en CVs
   enviados.
10. **SEO tratado como pulido final** pese a ser parte del objetivo de adquisición.

No bloqueantes: justificar Tailwind y la isla interactiva por criterio propio y no por el skill;
separar esquema de entrada del esquema web; **corregir "más de 5 años"** (`inicio_carrera` es
`2021-08`, hoy 2026-08 → son 5 exactos); cerrar el sistema contacto/privacidad/medición.

## 5. Decisión ya tomada en esta sesión

`ref/` agregado a `.gitignore`. **`cv_data.json` no se versiona en este repo público.**
Contiene teléfono, email, notas internas y nombres de clientes de empleadores.
Si se necesita en otra máquina, se transfiere fuera de git.

## 6. LO QUE FALTA: 6 decisiones del responsable

| # | Decisión | Recomendación del conductor |
|---|---|---|
| 1 | **Fotos.** ¿Hay fotos de obra propias? ¿De qué proyectos? | Si no hay: apoyarse en renders/modelos Tekla-SAP (propios) + capturas de los sistemas (Wash Motion, AREA VIVA). Viable, pero cambia la dirección visual. |
| 2 | **Flexio.** ¿Autoriza actividad freelance y publicar proyectos del empleo actual (pórtico de ensayos, alero Aeropuerto de Rosario)? | Sin autorización escrita, Flexio queda fuera del sitio. |
| 3 | **Nombres de clientes** (Cargill, Terminal 6, Louis Dreyfus, COFCO, BNA). Fueron clientes de sus **empleadores**. | Describir sector y magnitud sin nombre, con el rol real explícito. Nombrar solo con autorización verificable. |
| 4 | **Qué vende hoy.** ¿Estructuras, sistemas, o ambas con igual jerarquía? ¿Qué encargo quiere que entre por el sitio? | Estructuras como oferta principal (5 años + prueba dura), sistemas como diferenciador visible. Una sola página. |
| 5 | **URL.** El responsable pidió `jdging.github.io/web`, pero ese repo es este toolkit. | Repo nuevo **`jdging.github.io`** (raíz, nombre libre). Mantener `Portafolio` vivo con página puente y actualizar `persona.portfolio_url`. |
| 6 | **Canal de captación.** | WhatsApp como CTA principal + mail ofuscado. Formulario solo si se acepta backend y política de datos. |

Menores, pendientes: ¿se autoriza analítica de conversión y con qué restricciones de privacidad?
¿Hay testimonios o referencias verificables, o la prueba se limita a casos técnicos anonimizados?

## 7. Próximo paso exacto al retomar

1. Recolectar las 6 respuestas de §6.
2. Reescribir `.orchestration/PROPUESTA-sitio-jdg.md` incorporando los 10 bloqueantes:
   proyección publicable con allowlist, reordenar etapas (permisos → contenido → IA+SEO → diseño →
   build → QA → deploy), taxonomía controlada, fichas de procedencia, matriz de migración de URLs.
3. Reenviar al **mismo thread** de `plan-reviewer` (ronda 2 de 3).
4. Con `APPROVED`, recién ahí crear el repo del sitio y hacer scaffold.

**Freno activo:** no se crea el repo del sitio, no hay scaffold y no se invoca implementador hasta
tener §6 respondido y el plan en `APPROVED`.

## 8. Stack propuesto (sujeto a ronda 2)

Astro + Tailwind + TypeScript + Zod, estático, deploy a GitHub Pages por Actions.
Descartados: Next.js (SSR innecesario), WordPress (el problema original), HTML a mano (no escala a
~27 proyectos con filtros).
