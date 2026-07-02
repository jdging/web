# Módulo marca — JDG

> Assets de la marca personal JDG para cualquier proyecto que genere documentos o interfaces.
> Convención de instalación: `marca/jdg/` = marca propia · `marca/cliente/` = assets del
> cliente del proyecto (si aplica; logo, colores, datos — se crean por proyecto).

## Los DOS modos oficiales (decisión de JD, 2026-07-01)

No hay una paleta única: hay dos modos según el tipo de pieza. Al instalar en un proyecto,
elegir el que corresponde (o ambos, si el proyecto genera de los dos tipos).

| | Modo DOCUMENTO (claro) | Modo HERRAMIENTA (oscuro) |
|---|---|---|
| Para qué | Informes, presupuestos, propuestas — piezas que se imprimen/envían | Planillas de cálculo, apps técnicas, dashboards |
| Fuente | `jdg/colores.css` | `planillas/planillas-base.css` + `planillas/INSTRUCTIVO_PLANILLAS.md` |
| Tema default | Claro | **Oscuro** (con toggle a claro) |
| Azul | `--jdg-primary: #2b3263` (navy) | `--brand-blue: #1e2348` + acento `#34468f` (claro) / `#9eadea` (oscuro) |
| Tipografía | Montserrat (títulos) + Lato (cuerpo) | Sistema (Calibri en export Word) |

Los dos modos son el mismo universo (el `#1e2348` de herramientas = `--jdg-secondary` de
documentos).

## Datos fijos de contacto (fuente única: `jdg/datos.json`)

- **Email:** `ing.guzmanjuandavid@gmail.com` ← el oficial (decisión JD 2026-07-01)
- **Subtítulo de marca:** "Desarrollo de Estructuras & Sistemas"
- Nombre, teléfono, LinkedIn, portfolio, datos fiscales: ver `jdg/datos.json`.

⚠️ **Pendiente en los proyectos de origen:** los archivos originales de `area-viva/marca/jdg/`
todavía dicen `juandavidguzman96@gmail.com` y "Estructuras & Sistemas" — NO se tocaron desde
/x. Sincronizarlos cuando JD lo pida (los de /x ya están corregidos).

## Regla de uso

- Todo documento generado (presupuesto, informe, propuesta) usa estos assets — nunca colores
  inventados en el momento.
- En HTML standalone, el logo va **incrustado** en base64 (script y patrón en
  `planillas/INSTRUCTIVO_PLANILLAS.md`).
- Los datos de contacto salen de `jdg/datos.json`, no se tipean a mano.
- Header y footer obligatorios de herramientas: ver `planillas/INSTRUCTIVO_PLANILLAS.md`.
