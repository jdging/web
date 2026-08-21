# RETOMAR — Sitio comercial JDG (reemplazo de Portafolio)

- **Estado:** `PLANNING` — decisiones del responsable cerradas; plan en ronda 2 de revisión.
- **Última sesión:** 2026-08-21
- **Conductor:** Claude, **fallback `orchestrator-opus` activado** (Fable no disponible).
- **Modo:** autónomo autorizado por el responsable el 2026-08-21, con freno duro vigente en
  producción, datos reales, merge, tag y deploy.
- **Gate actual:** `plan-reviewer` de Codex, **ronda 2 de 3** → `REQUEST_CHANGES`.
  Aplicado en la propuesta v4. Ronda 3 es la última antes de `WAITING_USER` forzado.

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
- **Resuelto el 2026-08-21:** el responsable autorizó
  `codex exec ... --dangerously-bypass-approvals-and-sandbox` dentro del contenedor y solo sobre
  copias temporales en `/tmp/rev-ws`. Después de cada corrida se verifica con `git status` que no
  escribió en la copia.
- **Modo de trabajo vigente (2026-08-21):** autónomo dentro del contenedor. Docker es la frontera de
  seguridad. Commits locales y push a rama de trabajo autorizados. Requieren aprobación explícita:
  force-push, borrar ramas remotas, deploy, publicar, cambiar permisos, gastar dinero y cualquier
  acción fuera del contenedor.

## 4. Decisiones del responsable — CERRADAS (2026-08-21)

| # | Decisión | Resolución |
|---|---|---|
| 1 | Fotos | Existen. Selección diferida al final. El gate de imágenes bloquea el deploy, no el diseño. |
| 2 | Empleo actual | El empleador **autoriza** la actividad freelance y la publicación de los proyectos del empleo actual. Constancia escrita requerida antes de publicar. |
| 3 | Nombres de clientes | **No se nombran.** Sector + magnitud + rol real. |
| 4 | Oferta | **Estructuras principal.** Sistemas como línea en impulso, visible y subordinada. |
| 5 | URL | Repo dedicado, base path `/`, preparado para dominio propio. |
| 6 | Contacto | WhatsApp + email. Sin formulario, sin backend. |

Decisiones del conductor, reversibles y documentadas en la propuesta:
`[C1]` repo destino `jdging.github.io`, base path `/`.
`[C2]` **revocada** por el pre-check: versionar en este repo público exponía material no aprobado.
`[C2-bis]` el sitio se desarrolla en **`/workspace/web/`, gitignoreado en este repo y con su propio
repo git local dentro del contenedor**; el remoto se crea recién en el gate de publicación.
`[C3]` sin analítica de terceros y sin medición cuantitativa de conversión en v1.
`[C4]` sin testimonios: la prueba es técnica.
`[C5]` "5 años" derivado en build desde `inicio_carrera`, que entra como dato público sanitizado del
contenido web (el build no puede leer `ref/`).
`[C6]` **el dominio propio no es parte del v1**: migración posterior e independiente, con su propio
plan. No se versiona `CNAME`.

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

**Único punto que requiere decisión humana irreversible:**

1. **Historia del repo** (§5): reescribir con `filter-repo` + force-push, o aceptar la exposición y
   documentar el riesgo residual. Force-push es externo e irreversible: no se ejecuta sin orden.
   **No bloquea la etapa 1.**

**Se resuelven dentro del trabajo, no requieren decisión previa:**

2. Constancia escrita de la autorización del empleador. Bloquea publicar esos casos, no construir.
3. Matrícula, alcance de firma y zona geográfica declarables: criterio de salida de la etapa 1.
4. Selección final de imágenes y su revisión visual de reidentificación: bloquea la etapa 7a.

## 7. Próximo paso exacto al retomar

1. Correr `plan-reviewer` **ronda 3** (última) sobre la propuesta v4, en el mismo thread de Codex.
2. Con `APPROVED`: etapa 0.5 (preflight de aislamiento de `/workspace/web`) y después etapa 1.
3. Si vuelve `REQUEST_CHANGES`, el skill obliga a `WAITING_USER`: no hay ronda 4.

**Freno activo:** no se crea el repo remoto, no se activa Pages, no se toca `Portafolio` y no se
reescribe historia. El scaffold local sí puede arrancar una vez que el plan esté en `APPROVED`.

## 8. Stack propuesto

Astro + Tailwind + TypeScript + Zod (Content Collections), estático, deploy a GitHub Pages por
Actions. Descartados: Next.js (SSR innecesario), WordPress (el problema original), HTML a mano.
UI/UX gobernada por el skill `front-end-developer`, acoplado al orquestador en `CLAUDE.md`.
