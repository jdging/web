# CAPTURAR.md — instrucciones para la IA: llevar una idea a /x

> **Quién lee esto.** Vos, la IA, cuando JD está parado en un proyecto que tiene una forma de
> trabajo / patrón / herramienta que quiere replicar en otros proyectos, y te dice:
> *"Andá a C:\Proyectos\x y leé CAPTURAR.md. Llevá la idea «tal»"*.
>
> El objetivo: que la idea quede **generalizada** en `/x/ideas/` — despegada del proyecto de
> origen — lista para traerla a cualquier otro proyecto.

---

## 1. El proceso

1. **Entendé la idea en su contexto.** Leé SOLO los archivos del proyecto actual que la
   implementan o documentan (JD te dice dónde está; si no, preguntá). Token-economy: no
   escanees el repo entero.
2. **Destilá lo general de lo particular.** Separá el patrón reutilizable de los detalles del
   proyecto (nombres, rutas, stack). Lo particular se menciona solo como ejemplo de origen.
3. **Chequeá duplicados.** Leé `ideas/README.md`: si ya existe una idea que se superpone,
   proponé actualizar esa en vez de crear otra.
4. **Escribí `ideas/<slug>.md`** con el formato de abajo. Slug corto en kebab-case
   (ej. `qa-dom-first.md`, `hook-horas-por-commit.md`).
5. **Indexala** en `ideas/README.md` (una línea: nombre, qué resuelve, origen).
6. **Evaluá si toca los templates.** Si la idea debería pasar a ser **default** de todo
   proyecto nuevo (o sea, entrar en `base/` o en `INICIAR.md`), decíselo a JD como propuesta
   con el cambio concreto — **no edites `base/` sin su OK**.

## 2. Formato de una idea (`ideas/<slug>.md`)

```markdown
# <Nombre de la idea>

- **Origen:** <proyecto>, <fecha AAAA-MM-DD>
- **Qué resuelve:** <1-2 líneas del problema>
- **Cuándo aplica:** <tipo de proyecto/situación; cuándo NO aplica>

## La idea
<El patrón en general, autocontenido: alguien que nunca vio el proyecto de origen
tiene que poder aplicarlo leyendo solo esto.>

## Cómo llevarla a un proyecto
<Pasos concretos de instalación/adaptación, con placeholders [ASI] donde varíe.>

## Referencia de origen
<Rutas del proyecto original donde está implementada, por si hace falta ver el ejemplo real.>
```

## 3. Traer una idea a un proyecto (el camino inverso)

Cuando JD, parado en un proyecto, pida *"traé de /x la idea «tal»"*:

1. Leé `ideas/README.md` → encontrá el `.md` → leelo.
2. Adaptá la sección "Cómo llevarla a un proyecto" al contexto del proyecto actual.
3. Mostrá el plan de aplicación y esperá OK antes de crear/modificar nada (las reglas del
   CLAUDE.md del proyecto siguen valiendo: nada de código sin consulta).
4. Si al aplicarla descubrís una mejora a la idea, proponé actualizar el `.md` en `/x`.

## 4. Qué NO es una idea para /x

- Algo específico de un solo proyecto sin chance de reutilización → queda en la doc del proyecto.
- Una decisión (→ `docs/DECISIONES.md` del proyecto) o una lección puntual (→ `lessons.md`),
  salvo que el patrón detrás sea general.
- Código de aplicación. Las ideas son formas de trabajo, convenciones, herramientas chicas
  autocontenidas (como `horas/`) o templates.
