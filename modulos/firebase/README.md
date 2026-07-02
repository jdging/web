# Módulo firebase — patrón de dos entornos + seguridad (destilado de AREA VIVA)

> **Cuándo aplica.** Todo proyecto que use Firebase (Auth + Firestore + Hosting). El patrón
> probado en AREA VIVA: **dos proyectos Firebase** (prod/dev) espejados por **dos ramas git**,
> reglas cerradas por roles, y red de seguridad de costos antes de pasar a plan pago.
> El flujo git es independiente de Firebase y está como idea propia:
> `/x/ideas/flujo-git-prod-dev.md` — este módulo lo asume instalado.

---

## 1. Dos proyectos Firebase por app (siempre)

| | `<app>` (prod) | `<app>-dev` |
|---|---|---|
| Para qué | Producción. **Intocable** salvo fix. | QA / trabajo en curso. Datos descartables, se re-siembran. |
| Plan | El que corresponda | Spark (gratis) |
| Deploy desde | rama `main` (`firebase deploy -P prod ...`) | rama de trabajo (`firebase deploy -P dev ...`) |
| Usuarios | Reales | UNO descartable, admin (ej. `dev@<dominio>` / clave trivial) para que JD **y la IA** (QA automático) entren |

**Setup (una vez):**
1. Crear el proyecto dev en la console (sin Analytics). Habilitar el mismo proveedor de Auth
   que prod; crear Firestore en la misma región.
2. `firebase use --add` → alias `dev` (y el actual como `prod`). Commitear `.firebaserc`.
3. `firebase deploy -P dev --only firestore` (reglas + índices) y después hosting.
4. Crear el usuario dev en la console y asignarle rol (ver §3 — sin claim no lee nada).
5. Seed mínimo a mano desde la propia app dev (config, 1-2 registros de cada entidad).

**La magia que evita tocar código:** `index.html` carga `/__/firebase/init.js` — Hosting
inyecta la config del proyecto donde está deployado. El mismo código apunta a prod en prod
y a dev en dev, sin config por entorno en el repo.

**Reglas duras de deploy:**
- Siempre `-P` explícito. **Nunca `firebase deploy` pelado** (usa el alias activo → se pisa
  producción por accidente).
- A `prod` SOLO desde `main`; a `dev` desde la rama de trabajo. Antes de cada deploy, dos
  miradas: la rama (barra de VS Code) y el `-P` del comando.
- ⚠️ La clave del usuario dev queda pública en el repo/doc: no reusarla JAMÁS en nada real,
  y el proyecto dev nunca tiene datos sensibles.

## 2. Qué se QAea en dev y qué no

Todo lo que es **Firestore puro + render client-side** funciona idéntico en dev → 100% QAeable
(incluido el QA automático de la IA). Lo que **no** funciona en dev: integraciones que validan
identidad contra prod (en AREA VIVA, el bridge de Apps Script verifica el `idToken` contra el
proyecto prod → tokens de dev son rechazados, y ESO ES CORRECTO: aceptar tokens dev en el
bridge de prod haría que un QA escriba en Drive/Gmail/Sheets REALES).

- Consecuencia: esas features se difieren al **smoke en prod del Cierre** del orquestador.
- Si algún día dev necesita la integración: se **clona** el servicio apuntando a recursos
  propios de dev (aislamiento completo), no se mezclan entornos. Runbook de referencia:
  `area-viva/tutoriales/clonado-tenant.md`.

## 3. Reglas Firestore cerradas por roles (custom claims)

Guía completa paso a paso: `area-viva/tutoriales/roles-y-accesos.md`. El resumen:

- **El rol viaja en el token** (custom claim `request.auth.token.role` ∈ `admin`/`editor`/
  `lector`), NO en un doc `usuarios/{uid}` (leerlo en rules costaría una lectura por operación).
- Estructura de `firestore.rules`: helpers (`signedIn`/`canRead`/`canEditOps`/`isAdmin`) →
  una regla por colección → **piso final `match /{document=**} { allow read, write: if false; }`**
  (todo lo no contemplado queda cerrado; colección nueva sin regla = cerrada — recordarlo).
- **La UI esconde, las reglas prohíben.** Ocultar botones por rol es cosmético; la seguridad
  real es `firestore.rules`.
- Los claims se setean con un script local del Admin SDK (`scripts/admin/set-role.js` +
  clave de servicio **fuera del repo o gitignoreada** — es acceso admin total).
- Dos trampas: colecciones por año se matchean con regex
  (`col.matches('^proyectos_[0-9]{4}$')`, la sintaxis `match /proyectos_{year}` NO existe);
  las subcolecciones necesitan su `match /{document=**}` anidado o el piso rompe el guardado.

**⚠️ EL ORDEN IMPORTA (invertirlo = lockout total):**
```
1. Escribir las rules nuevas (NO deployar todavía)
2. Correr el script de claims  → todos con rol
3. Logout/login de cada usuario → el token toma el sello
4. RECIÉN AHÍ: firebase deploy --only firestore:rules
5. QA (acciones normales OK · colección inventada → permission-denied)
```
Plan de emergencia: volver al comodín viejo y redeployar rules mientras se resuelve.

## 4. Red de costos antes del plan pago (Blaze)

En Spark el cap diario te protege gratis (50k reads / 20k writes). Antes de activar Blaze,
tener lista la red (referencia completa: `area-viva/tasks/auditoria/fase-2-kit-dia-blaze.md`):

| Capa | Vector que cubre | ¿Requiere Blaze? |
|---|---|---|
| Circuit breaker en el cliente (envuelve el SDK, corta ráfagas anómalas) | Tu propio bug (loop) | No — implementar YA |
| App Check (reCAPTCHA) — primero en modo *monitor*, enforce el día Blaze | Abuso externo | No |
| Budget Alerts (25/50/90/100%) | Aviso de costo | Sí |
| Kill-switch (budget → Pub/Sub → Function que desconecta billing) | Freno duro | Sí — backstop **opcional** |

Y la condición de proceso: **no activar Blaze sin haber auditado antes** consumo, seguridad y
la propia red de costos (en AREA VIVA: "puerta de Blaze" = fases 1+2+3 de la auditoría cerradas).

## 5. Checklist de instalación en un proyecto nuevo

- [ ] Proyecto prod + proyecto dev creados; aliases `prod`/`dev` en `.firebaserc`.
- [ ] Rama de trabajo + `main`, con las reglas del flujo git (idea `flujo-git-prod-dev`).
- [ ] `firestore.rules` por roles con piso cerrado (adaptar colecciones al modelo del proyecto).
- [ ] Script de claims en `scripts/admin/` + clave de servicio en `.gitignore`.
- [ ] Usuario dev descartable con rol, para QA de JD y de la IA.
- [ ] Reglas de sesión en el `CLAUDE.md` del proyecto: deploy SOLO `-P dev` durante desarrollo;
      prod solo desde `main` con JD; qué features son dev-QAeables y cuáles prod-only.
- [ ] Si se acerca Blaze: circuit breaker + App Check en monitor + este §4 como runbook.

---
*Destilado 2026-07-01 de `area-viva/tutoriales/flujo-git-v1-v2.md`, `roles-y-accesos.md`,
`archivo/Auditacion.md` (FASES 2-3) y `tasks/auditoria/fase-2-kit-dia-blaze.md`.*
