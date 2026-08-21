# RETOMAR — Sitio comercial JDG (reemplazo de Portafolio)

- **Estado:** `PLANNING` — decisiones del responsable cerradas; plan en ronda 2 de revisión.
- **Última sesión:** 2026-08-21
- **Conductor:** Claude, **fallback `orchestrator-opus` activado** (Fable no disponible).
- **Modo:** autónomo autorizado por el responsable el 2026-08-21, con freno duro vigente en
  producción, datos reales, merge, tag y deploy.
- **Gate actual:** pre-check de arquitectura sobre la propuesta v2 → `REQUEST_CHANGES`
  (16 hallazgos nuevos). `plan-reviewer` de Codex **bloqueado por permisos del entorno**.

> Regla de este archivo: es público. **No se nombran clientes, empleadores, proyectos de terceros,
> teléfonos ni emails.** Sector, magnitud y rol, nada más. Ver §5.

---

## 1. Qué se quiere hacer

Reemplazar `jdging.github.io/Portafolio` por un sitio estático propio **orientado a conseguir
clientes de cálculo estructural**. Referencia de arquitectura de información (no de código):
un sitio de ingeniería estructural argentino, offer-led. Fuera de alcance: PechaKucha.

## 2. Hechos verificados (no re-investigar)

- El sitio actual es una **exportación estática de WordPress 6.5.3** + Hello Elementor +
  Elementor 3.21. 116 KB de HTML autogenerado, 47 imágenes, jQuery. **No hay fuente editable.**
  Contenido de 2024.
- El sitio de referencia también es WordPress. Lo valioso es su IA offer-led:
  Trayectoria / Cómo Trabajo / Cálculos / Inspecciones / Obras / FAQ / Contacto.
- **Este repo (`/workspace`) ES `jdging/web`**, el toolkit del orquestador. Es **público**.
  GitHub Pages NO está configurado acá.
- `jdging.github.io` (user site, URL raíz) da 404: **el nombre está libre**.
- Repos con Pages activo: `Portafolio`, `LIFE`, `Distocracia`, `Estudio`. Los cuatro se ven
  afectados si algún día se pone un `CNAME` en el user site.
- La base de contenido vive en `ref/cv_data.json` (48 KB): 6 empleos, 8 clientes freelance con
  ~17 proyectos, 2 proyectos propios, 27 skills. **Gitignorado a propósito.**
  Los 27 proyectos tienen `imagenes: []`: cero imágenes referenciadas.
- 87 tags únicos que mezclan servicios, materiales, clientes, software, sectores y lugares.
- Carrera desde **2021-08**. Al 2026-08 son **5 años**, no "más de 5".

## 3. Entorno (limitaciones encontradas)

- **No hay `pwsh`** → `invoke-codex-role.ps1` no corre. Se invoca `codex exec` replicando
  modelo/esfuerzo/sandbox desde `references/roles.json`.
- **El sandbox de Codex (bubblewrap) no arranca** en el contenedor: `No permissions to create new
  namespace` en cualquier modo. Único workaround: copiar los archivos a `/tmp/rev-ws`, `git init`,
  correr Codex sin sandbox ahí y verificar con `git status` que no escribió nada. El read-only se
  garantiza por aislamiento físico.
- **Bloqueo nuevo (2026-08-21):** el clasificador de permisos de auto mode rechaza esa invocación.
  Sin una regla de permiso Bash explícita del responsable, **el `plan-reviewer` de Codex no puede
  correr** y el gate no se puede cerrar con el revisor previsto.

## 4. Decisiones del responsable — CERRADAS (2026-08-21)

| # | Decisión | Resolución |
|---|---|---|
| 1 | Fotos | Existen. Selección diferida al final. El gate de imágenes bloquea el deploy, no el diseño. |
| 2 | Empleo actual | El empleador **autoriza** la actividad freelance y la publicación de los proyectos del empleo actual. Constancia escrita requerida antes de publicar. |
| 3 | Nombres de clientes | **No se nombran.** Sector + magnitud + rol real. |
| 4 | Oferta | **Estructuras principal.** Sistemas como línea en impulso, visible y subordinada. |
| 5 | URL | Repo dedicado, base path `/`, preparado para dominio propio. |
| 6 | Contacto | WhatsApp + email. Sin formulario, sin backend. |

Decisiones del conductor bajo autorización, reversibles: `[C1]` repo destino `jdging.github.io`
(base path `/`); `[C2]` desarrollo en `web/` de este repo — **impugnada, ver §6**; `[C3]` sin
analítica de terceros en v1; `[C4]` sin testimonios; `[C5]` "5 años", derivado en build.

## 5. Incidente de datos — 2026-08-21

La versión anterior de este archivo, commiteada en `63bbbbd` y **ya pusheada a un repo público**,
nombraba en claro cinco clientes de empleadores, el empleador actual y dos proyectos suyos.
Contradecía la propia frontera de datos del plan y la regla 4 de `CLAUDE.md`.

- **Corregido en el working tree**: este archivo ya no los nombra.
- **Pendiente de decisión del responsable**: si se reescribe la historia
  (`git filter-repo` + force-push, borra la exposición del historial) o se acepta la exposición.
  Reescribir historia es force-push: **está bajo freno duro**, no se ejecuta sin orden explícita.
- Preexistente, fuera del alcance de este trabajo pero conviene revisarlo:
  `modulos/marca/planillas/INSTRUCTIVO_PLANILLAS.md` publica un teléfono en claro.

## 6. Lo que falta decidir

1. **Permiso para correr el `plan-reviewer` de Codex** (regla Bash en `.claude/settings.local.json`).
   Sin esto no hay gate `APPROVED` con el revisor independiente previsto por el skill.
2. **Dónde se desarrolla** (`[C2]` impugnada). Versionar el sitio en este repo público antes de que
   el contenido esté autorizado expone material no aprobado de forma permanente, y
   `git subtree split` arrastra todos los commits intermedios al repo destino. Opciones:
   crear `jdging.github.io` **privado** ahora y trabajar ahí, o trabajar en un directorio
   gitignoreado hasta el gate de deploy.
3. **Historia del repo** (§5): reescribir o aceptar.
4. Constancia escrita de la autorización del empleador (bloquea deploy, no desarrollo).
5. Matrícula, alcance de firma y zona geográfica declarables en el copy. Criterio de salida de la
   etapa 1: define qué se puede ofrecer legalmente.

## 7. Próximo paso exacto al retomar

1. Resolver los 5 puntos de §6.
2. Aplicar a la propuesta los hallazgos del pre-check (`.orchestration/` local).
3. Correr `plan-reviewer` ronda 2 en el mismo thread de Codex.
4. Con `APPROVED`, recién ahí crear el repo destino y hacer scaffold.

**Freno activo:** no se crea repo, no hay scaffold, no se invoca implementador, no se toca
`Portafolio` y no se reescribe historia hasta tener §6 resuelto y el plan en `APPROVED`.

## 8. Stack propuesto

Astro + Tailwind + TypeScript + Zod (Content Collections), estático, deploy a GitHub Pages por
Actions. Descartados: Next.js (SSR innecesario), WordPress (el problema original), HTML a mano.
UI/UX gobernada por el skill `front-end-developer`, acoplado al orquestador en `CLAUDE.md`.
