# /x — Iniciador de proyectos claude-codex friendly

> **Qué es esta carpeta.** El template maestro del flujo de trabajo JD + Claude + Codex,
> destilado de AREA VIVA (el proyecto de referencia). Sirve para: (a) arrancar un proyecto
> nuevo con todo el entorno listo, (b) migrar un proyecto existente a este flujo, y
> (c) capturar ideas buenas de cualquier proyecto para reutilizarlas en los demás.
>
> **Regla de esta carpeta:** acá no vive ningún proyecto. Solo templates, módulos e ideas.

---

## Los 4 prompts (copiar, pegar, rellenar)

### 1. Proyecto NUEVO
Parate en la carpeta raíz del proyecto nuevo (puede estar vacía) y pegá:

```
Leé C:\Proyectos\x\INICIAR.md y transformá esta raíz en un proyecto claude-codex friendly.
Contexto del proyecto: <de qué trata, para quién es, stack si ya lo sé, si genera documentos
con marca, si voy a cobrar horas, si va a usar git/Firebase>.
```

### 2. Proyecto EXISTENTE (migración)
Parate en la raíz del proyecto que ya arrancó y pegá:

```
Leé C:\Proyectos\x\INICIAR.md y migrá este proyecto existente al flujo claude-codex friendly.
No toques código ni muevas archivos sin mostrarme el plan primero.
Contexto del proyecto: <de qué trata, en qué estado está, qué le falta>.
```

### 3. CAPTURAR una idea (de un proyecto hacia /x)
Parate en el proyecto que tiene la idea buena y pegá:

```
Andá a C:\Proyectos\x y leé CAPTURAR.md. Llevá a /x la idea "<nombre de la idea>":
<una o dos líneas de qué es y dónde está en este proyecto>.
```

### 4. TRAER una idea (de /x hacia un proyecto)
Parate en el proyecto destino y pegá:

```
Leé C:\Proyectos\x\ideas\README.md y traé a este proyecto la idea "<nombre>".
Adaptala al contexto de este proyecto antes de aplicar nada.
```

---

## Mapa de la carpeta

| Ruta | Qué es |
|---|---|
| `LEEME.md` | Este archivo — los prompts para JD. |
| `INICIAR.md` | Instrucciones para la IA: cómo iniciar/migrar un proyecto. |
| `CAPTURAR.md` | Instrucciones para la IA: cómo capturar una idea nueva en `/x`. |
| `ideas/` | Ideas reutilizables capturadas de proyectos (una por `.md`, indexadas en su README). |
| `base/` | Templates que se copian y adaptan a cada proyecto: `AGENTS.md`, `CLAUDE.md`, `.gitignore`, `docs/`, `tutoriales/` (orquestador + auditoría). |
| `modulos/horas/` | Contador de horas por git log (de AREA VIVA). Opcional, requiere git. |
| `modulos/marca/` | Marca JDG: dos modos oficiales (documento claro / herramienta oscura) + datos de contacto. |
| `modulos/firebase/` | Patrón Firebase: dos proyectos prod/dev, rules por roles, red de costos pre-Blaze. |
| `CHANGELOG.md` | Registro de cambios de /x (actualizar cada vez que cambie el template maestro). |

---

## Principios del flujo (el resumen de una pantalla)

1. **Claude diseña y audita, Codex implementa.** Claude no escribe código de la app sin OK
   explícito; produce specs, orquesta y hace QA.
2. **Divide y vencerás con red de seguridad:** trabajo grande → orquestador en la raíz,
   partido en etapas QAeables, un chat nuevo por etapa y otro para auditar (ojo fresco).
3. **Convención de carpetas:** raíz = orquestadores ACTIVOS · `tasks/` = trabajo abierto/futuro ·
   `archivo/` = material cerrado (no se lee salvo pedido explícito; al cerrar algo, migra ahí
   con `git mv`).
4. **Doc viva pero acotada:** la doc típica (`docs/`) se actualiza en los cierres, no por etapa.
   La cantidad de doc escala con el proyecto — no todo proyecto necesita el set completo.
5. **Token-economy siempre:** lectura acotada a los archivos en alcance, índices antes que
   re-escaneos, DOM antes que screenshot.
6. **Reglas default de sesión:** no levantar servidor local ni tocar doc típica salvo permiso
   de JD; QA automático de Claude permitido cuando lo dirige un orquestador.

---

*Creado 2026-07-01 a partir de AREA VIVA (`tutoriales/orquestador.md`, `archivo/Auditacion.md`,
`AGENTS.md`, `CLAUDE.md`, `horas/`, `marca/`) y `planillas-de-calculo/design/`.*
