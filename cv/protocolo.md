# PROTOCOLO DE ACTUALIZACIÓN DE cv_data.json
## Sistema JDG CV — v1.0

---

## CUÁNDO USAR ESTE PROTOCOLO

Cuando querés incorporar una nueva experiencia, proyecto o encargo al JSON de CV.
Pasale a la IA los tres insumos siguientes y va a hacer todo el trabajo:

1. **`cv_data.json`** — el archivo actual
2. **Este protocolo** — instrucciones completas
3. **Descripción libre del nuevo trabajo** — en el formato que quieras (texto, bullet points, notas de voz transcriptas)

---

## PASO 1 — LEER LA DESCRIPCIÓN

Extraer de la descripción libre las siguientes variables:

| Campo | Qué buscar |
|---|---|
| **Tipo de relación** | ¿Fue trabajo en relación de dependencia, freelance independiente, o proyecto propio? |
| **Empleador / cliente** | Nombre de la empresa o persona. ¿Ya existe en el JSON? |
| **Cargo o rol** | Qué función cumplió JDG en este trabajo |
| **Período** | Fecha de inicio y fin (o indicar si sigue activo). Formato YYYY-MM |
| **Proyectos individuales** | Listado de obras o encargos específicos dentro de ese empleo/cliente |
| **Por proyecto**: nombre, fecha, descripción, herramientas/software usados, tags |
| **Logros destacables** | Datos concretos: metros, toneladas, meses de duración, programas, cliente, complejidad |

---

## PASO 2 — IDENTIFICAR DÓNDE VA EN EL JSON

### ¿En qué sección?

```
Relación de dependencia       → experiencia_laboral.items[]
Freelance / independiente     → freelance_independiente.clientes[]
Proyecto propio/emprendimiento → proyectos_propios.items[]
```

### ¿El empleador/cliente ya existe?

**SÍ existe** → agregar los nuevos proyectos al array `proyectos[]` del empleador/cliente existente.
Si hay logros (`logros[]`) relevantes, actualizar o agregar bullets según corresponda.

**NO existe** → crear un nuevo objeto en la sección correspondiente con todos sus campos.

---

## PASO 3 — CONVENCIONES DE IDs

Los IDs son únicos en todo el JSON. Componentes:

```
{prefijo_empleador}_{descripcion_breve}
```

**Prefijos por empleador/cliente habituales:**
| Empleador/Cliente | Prefijo |
|---|---|
| Flexio | `flexio_` |
| Excel Consulting | `exc_` |
| Deprop SRL (empleado) | `dep_` |
| Deprop SRL (independiente) | `deprop_` |
| Ingeniería y Pilotes | `pil_` |
| AC Ingeniería | `ac_` |
| Ing. Yolanda Galassi | `galassi_` |
| Ing. Carlos Maldonado | `maldonado_` |
| Arq. Luisina Picco | `picco_` |
| Los Renovales SA | `renovales_` |
| Gustavo Fonseca | `fonseca_` |
| Cliente no identificado | `anonimo_` |
| Nuevo cliente | usar primeras letras del apellido o nombre empresa |

**Descripción breve del proyecto:** 2-4 palabras en minúsculas con guiones bajos.
Ejemplos: `exc_soporte_dhs_cargill`, `galassi_kcc`, `dep_bna_firmat`

**Regla:** si el ID ya existe, agregar un sufijo numérico: `galassi_ampliacion_casa_2`

---

## PASO 4 — ESTRUCTURA DE UN PROYECTO NUEVO

Cada proyecto individual sigue esta estructura:

```json
{
  "id": "{prefijo}_{descripcion}",
  "nombre": "Nombre descriptivo del proyecto — Cliente o Lugar",
  "fecha": "YYYY-MM",
  "fecha_fin": "YYYY-MM",
  "_aprox": true,
  "descripcion": "Qué se hizo, alcance, herramientas, resultado.",
  "tags": ["tag1", "tag2", "tag3"],
  "imagenes": []
}
```

**Notas:**
- `fecha_fin: null` = proyecto activo o sin fecha de cierre clara
- `_aprox: true` = la fecha es aproximada (omitir si la fecha es exacta)
- `imagenes: []` = siempre dejar vacío; se llena con la herramienta de gestión de imágenes
- `descripcion` debe ser suficientemente detallada para reconstruir el CV sin los datos originales

### Tags recomendados (no es una lista cerrada):

**Tipos de estructura:** `hormigón armado`, `estructura metálica`, `mixta`, `prefabricados`, `steelframe`

**Tipo de trabajo:** `cálculo`, `planos`, `supervisión`, `verificación`, `adintelamiento`, `rehabilitación estructural`, `fabricación`, `montaje`, `predimensionamiento`

**Especialidades:** `pilotes`, `fundaciones`, `cubierta`, `cubierta metálica`, `planillas de armado`, `recalce`, `demolición`, `hidrología`, `hidráulica`

**Software:** `SAP2000`, `STAAD.Pro`, `RFEM`, `Tekla Structures`, `AutoCAD`, `IDEA StatiCa`

**Clientes/sector:** `Cargill`, `Terminal 6`, `Louis Dreyfus Company`, `agroindustria`, `nave industrial`, `educación`, `vía pública`

---

## PASO 5 — LOGROS PARA EL CV (campo `logros[]`)

Los `logros` son los bullets que aparecen en el CV generado. Son distintos de los `proyectos` individuales.

**Cuándo actualizar los logros:**
- Si el nuevo trabajo es un empleador nuevo → crear `logros[]` representativos del conjunto de proyectos
- Si el nuevo trabajo es un proyecto adicional en un empleador existente → evaluar si algún logro existente debe actualizarse para reflejar mayor escala o nuevas capacidades
- Si el nuevo proyecto es especialmente relevante → agregar un logro específico para él

**Criterio de `incluir_en`:**
- `["estructural", "todoterreno"]` — para logros de cálculo/planos/supervisión
- `["sistemas", "todoterreno"]` — para logros de software/herramientas/automatización
- `["estructural", "sistemas", "todoterreno"]` — para logros transversales

---

## PASO 6 — ACTUALIZACIÓN DE METADATOS

Al guardar el JSON actualizado, modificar siempre:

```json
"_meta": {
  "version": "1.X.0",
  "ultima_actualizacion": "YYYY-MM-DD"
}
```

Incrementar la versión secundaria (1.2.0 → 1.3.0) para cambios de contenido.
Incrementar la versión mayor (1.x → 2.0) solo si cambia la estructura del JSON.

---

## PASO 7 — CHECKLIST ANTES DE ENTREGAR EL JSON ACTUALIZADO

- [ ] El nuevo ID no existe previamente en el JSON
- [ ] El campo `imagenes: []` está presente en todos los proyectos nuevos
- [ ] Las fechas están en formato YYYY-MM
- [ ] Si la fecha es aproximada, tiene `"_aprox": true`
- [ ] Los campos `_nota` no contienen información que deba estar en `descripcion`
- [ ] Los tags son consistentes con los ya usados en el JSON (revisar antes de inventar uno nuevo)
- [ ] Los `incluir_en` son correctos para el tipo de trabajo
- [ ] `_meta.version` y `_meta.ultima_actualizacion` fueron actualizados

---

## PASO 8 — CHEQUEOS PROACTIVOS (INTELIGENCIA DEL SISTEMA)

Cualquier IA que trabaje con este sistema (para actualizar data o generar CVs) debe, además de la tarea pedida:

1. **Recalcular años de experiencia**: comparar los años mencionados en los resúmenes de `perfiles_disponibles` contra `_meta.inicio_carrera` y la fecha actual. Si quedaron cortos, proponer la corrección.
2. **Detectar cambios de empleo implícitos**: si el usuario menciona una empresa nueva, verificar si el empleo anterior con `fecha_fin: null` debe cerrarse, y preguntar la fecha de cierre.
3. **Recordar pendientes**: revisar los `_nota` con textos tipo "Recordar..." o "Completar..." y los proyectos con `fecha: null`, y mencionárselos al usuario por si ya puede completarlos.
4. **Validar antes de entregar**: si hay Python disponible, correr `python validar.py` y corregir los errores que reporte.
5. **Mantener el sistema coherente**: si un cambio modifica la estructura del JSON (campos nuevos, secciones nuevas), actualizar también `cv_generator_prompt.md`, este protocolo y `validar.py` en el mismo cambio.
6. **Proponer, no imponer**: las mejoras detectadas se proponen al usuario; nunca se aplican en silencio cambios que alteren el contenido del CV.

---

## EJEMPLO COMPLETO

**Descripción libre de nueva experiencia:**
> "En diciembre de 2025 hice el cálculo y planos de una pasarela metálica para peatones en una planta de Cargill, para Excel Consulting. Fue de acero, con pilares y vigas IPN. Usé SAP2000 y Tekla."

**Resultado en JSON:**

```json
{
  "id": "exc_pasarela_peatonal_cargill",
  "nombre": "Pasarela Peatonal Metálica — Cargill",
  "fecha": "2025-12",
  "fecha_fin": null,
  "descripcion": "Cálculo y planos de pasarela peatonal metálica en planta Cargill. Estructura de acero con pilares y vigas IPN. Software: SAP2000 y Tekla Structures.",
  "tags": ["estructura metálica", "SAP2000", "Tekla Structures", "Cargill", "pasarela", "planos"],
  "imagenes": []
}
```

Se agrega al array `proyectos[]` dentro de `excel_consulting` en `experiencia_laboral.items`.

---

*Protocolo JDG CV | Archivos del sistema: cv_data.json · validar.py | La versión vigente de la data está en `_meta.version` de cv_data.json*
