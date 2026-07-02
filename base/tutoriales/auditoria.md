# Auditoría integral — template de orquestador

> **Qué es este archivo.** Template genérico para montar una **auditoría integral** de un
> proyecto, destilado de `archivo/Auditacion.md` de AREA VIVA (12 fases, todas cerradas).
> Es el cerebro de la auditoría: cada fase se trabaja en un **chat nuevo** para no quemar
> tokens. JD abre un chat, setea la intensidad que indica la fase, y escribe:
> *"Leé `auditoria.md` y arrancamos la **FASE X**."*
> Claude lee esto, va a la sección de esa fase, y su **primera respuesta es un plan de
> investigación en etapas**. Después investiga (lee solo los archivos en alcance) y entrega
> hallazgos priorizados. JD decide qué arreglar → pide el SPEC → se lo da a Codex → en otro
> chat nuevo se audita lo que Codex implementó → se aprueba → siguiente fase.
>
> **Al instalar en un proyecto:** adaptar el mapa de fases (§4) al stack y a los riesgos
> reales; borrar fases que no apliquen; fijar los "archivos en alcance" de cada fase.

---

## 0. Reglas globales (válidas en TODAS las fases)

1. **No se escribe código en estos chats.** Claude audita, diagnostica y propone. El código lo
   escribe **Codex** a partir de un SPEC. Claude solo produce el SPEC cuando se lo piden.
2. **No actualizar documentación típica** (BITACORA, CONTEXTO, DECISIONES, lessons) en la
   instancia de auditoría. La doc se actualiza recién al **aprobar** una fase, en otro paso.
3. **No levantar servidor / no QA en vivo.** Todo es lectura estática + razonamiento. El QA lo
   hace JD a mano después de que Codex implemente.
4. **Lectura acotada (token-economy).** Cada fase lista sus *archivos en alcance*. No leer nada
   fuera de eso salvo que un hallazgo lo justifique. **Leer primero el mapa** (`tasks/auditoria/mapa.md`,
   lo genera la FASE 0) en vez de re-escanear el repo. Si no existe, correr la FASE 0 primero.
5. **Hallazgos, no opiniones sueltas.** Cada hallazgo: archivo + línea/función, descripción,
   impacto, severidad, esfuerzo. Sin código de solución (eso va al SPEC después).
6. **Una fase = un dominio.** No saltar de fase. Si aparece algo de otra fase, anotarlo como
   "referencia cruzada" y seguir.
7. **No reportar como nuevo lo ya conocido.** Antes de listar un hallazgo, chequear si ya está
   en `CLAUDE.md` (Alertas Críticas), `docs/DECISIONES.md` o este archivo.

---

## 1. El ciclo por fase (Claude ↔ Codex)

```
[Chat A · Claude]  Plan de investigación  →  Investigación  →  Hallazgos priorizados
        │
        │  (JD elige qué arreglar)
        ▼
[Chat A · Claude]  "Pasame esto a SPEC para Codex"  →  SPEC ejecutable
        │
        ▼
[Chat B · Codex]   Implementa SOLO el SPEC  →  cambios + decisiones + riesgos + QA manual
        │
        │  (JD hace QA manual)
        ▼
[Chat C · Claude]  Revisión crítica de lo que hizo Codex  →  fixes mínimos
        │
        ▼
[JD]  Aprueba la fase  →  actualiza doc  →  vuelve al orquestador por la próxima fase
```

### Prompt para generar el SPEC (fin del Chat A)
```
Transformá la propuesta anterior (la fase) en una SPEC ejecutable para Codex.
No código.
Formato:
# Objetivo
# Alcance
# No hacer
# Archivos a tocar
# Orden de implementación
# QA manual
# Riesgos
# Criterios de aceptación
Muy concreto. Sin ambigüedad.
```

### Prompt para Codex (Chat B, nuevo)
```
Implementar SOLO ESTA SPEC.
Reglas: cambios mínimos · no refactor innecesario · no docs todavía · no levantar servidor · esperar QA mío.
Antes de editar: resumir entendimiento.
Después: archivos tocados · decisiones · riesgos · QA manual.
```

### Prompt para auditar a Codex (Chat C, nuevo, Claude)
```
Revisá críticamente esta implementación.
OBJETIVO: detectar bugs y simplificar. No reescribir por gusto.
Buscar: drift · deuda técnica · edge cases · riesgos de mantenimiento · performance · inconsistencias.
Proponer fixes mínimos.

esto es lo que le pedí a codex:
()
esto es lo que me devolvió:
()
```

---

## 2. Leyenda de intensidad

Antes de pegar *"leé auditoria.md, FASE X"*, setear la intensidad que pide la fase (incluir la
palabra clave en el mensaje de arranque, o subir el *reasoning effort* si el cliente lo expone).

| Nivel | Palabra clave | Cuándo |
|---|---|---|
| **Media** | `think` | Barridos amplios y poco profundos, cosas mecánicas, creatividad. |
| **Alta** | `think hard` | Trazado de flujos, bugs sutiles, consistencia de modelo, integraciones. |
| **Máxima** | `ultrathink` | Decisiones de arquitectura irreversibles y/o con plata o seguridad en juego. |

---

## 3. Formato de entrega de hallazgos

Severidad:
🔴 **CRÍTICO** — pérdida de datos, exposición de info sensible, costo descontrolado, o caída en producción.
🟠 **ALTO** — comportamiento incorrecto en un flujo principal.
🟡 **MEDIO** — falla silenciosa, degradación de UX, riesgo latente bajo cierta condición.
🟢 **BAJO / MEJORA** — deuda técnica, legibilidad, performance no crítica.

Cada hallazgo:
```
[SEVERIDAD] Título corto
Archivo/función: ruta:línea aprox.
Descripción: qué está mal.
Impacto: qué pasa si no se arregla.
Esfuerzo: XS / S / M / L / XL
Dirección de fix: en una línea, sin código.
Nota: (opcional) condición que lo dispara / referencia cruzada a otra fase.
```

Al cierre de cada fase: **resumen ejecutivo (5-8 bullets)** + **tabla de hallazgos ordenada por
severidad** + **propuesta de qué meter en el primer SPEC**.

---

## 4. Mapa de fases (ADAPTAR POR PROYECTO — orden = prioridad, lo más crítico primero)

El principio de orden: primero lo que **ya mordió** o puede costar **plata/datos**; después
integridad y bugs; luego performance/UX/deuda; al final las fases de negocio, que necesitan
código estable.

| # | Fase | Sombrero | Intensidad | Depende de |
|---|---|---|---|---|
| **0** | Mapa & línea base | Arquitecto | Media (`think`) | — |
| **1** | [Costos / consumo de recursos — cuotas de API, DB, facturación] | Senior Dev + Emprendedor | Alta | 0 |
| **2** | [Red de seguridad de costos / kill-switch — si hay pago por uso] | Arquitecto + Emprendedor | Máxima | 1 |
| **3** | Seguridad (permisos, exposición de datos, XSS, secretos) | Senior Dev (seguridad) | Máxima | 0 |
| **4** | Integridad de datos & consistencia del modelo | Senior Dev | Alta | 0 |
| **5** | Bugs & robustez [frontend/backend] | Senior Dev | Alta | 0 |
| **6** | Integraciones externas [APIs, scripts, bridges] | Senior Dev | Alta | 0,1 |
| **7** | Performance & errores silenciosos | Senior Dev + PM | Media-Alta | 0 |
| **8** | UX / UI & flujos | PM + Marketing | Media | 0 |
| **9** | Deuda técnica estructural (inventario, no refactor) | Arquitecto | Media | 0,5 |
| **10+** | Fases de negocio *(post-fixes)*: templatización/whitelabel, naming & material de venta, reestructuración + índice de código | PM / Marketing / Arquitecto | según fase | 1-9 |

**Anatomía de cada fase (calcar):** Sombrero · Intensidad · **Objetivo** · **Por qué importa** ·
**Archivos en alcance** · **Qué investigar (checklist)** · **Entregable**.

### FASE 0 — Mapa & línea base (siempre va, y va primera)
- **Objetivo:** generar `tasks/auditoria/mapa.md`: un índice navegable del sistema que TODAS las
  fases siguientes leen en vez de re-escanear el repo. Es la inversión que abarata todo lo demás.
- **Qué producir:** tabla de cada archivo de código (ruta, líneas, responsabilidad en 1 frase,
  qué expone, de qué depende) · inventario de datos/colecciones y quién los lee/escribe ·
  inventario de endpoints/integraciones · orden de carga o entry points · "zonas calientes"
  (archivos gigantes) para fases posteriores.
- **Entregable:** el archivo `tasks/auditoria/mapa.md` (esto SÍ se escribe — es doc de
  auditoría, no código de la app).

### Pistas para armar los checklists de las demás fases (del caso AREA VIVA)
- **Costos:** lecturas de colección completa sin filtro/límite · N+1 en loops · listeners sin
  desuscribir · caches que se invalidan de más · writes por keystroke · peor caso por acción.
- **Seguridad:** reglas de acceso en modo dev · tokens hardcodeados visibles en el cliente ·
  exposición de datos internos en salidas al cliente · XSS en contenido que viene de la DB ·
  CDNs sin `integrity` · rutas sin verificación de sesión.
- **Integridad:** writes sin catch (fallo silencioso = dato perdido) · destructivos sin
  confirmación/snapshot · doble escritor del mismo dato · convenciones "ausencia = default"
  respetadas por TODOS los lectores · referencias a campos/colecciones muertos.
- **Bugs/robustez:** listeners que se apilan por re-render · estado `undefined` · race
  conditions en cargas concurrentes · `Promise.all` que deja pantalla en blanco ante un fallo.
- **Integraciones:** deuda de redeploy (código nuevo que falla silencioso porque el servicio
  externo no se republicó) · límites de tiempo del proveedor · content-types que rompen CORS ·
  normalizadores divergentes entre front y back.
- **Deuda:** helpers duplicados · funciones >100 líneas · código muerto · TODOs · núcleos
  copiados N veces. (Inventariar acá; el refactor es otra fase.)

---

## 5. Tracker de estado

> Marcá acá el avance. (Se actualiza al aprobar cada fase.)

- [ ] FASE 0 — Mapa & línea base
- [ ] FASE 1 — [nombre]
- [ ] FASE 2 — [nombre]
- [ ] ...

---

*Template de /x (2026-07-01), destilado de `archivo/Auditacion.md` de AREA VIVA. Al cerrar la
auditoría completa, este archivo migra a `archivo/` como registro histórico.*
