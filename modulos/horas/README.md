# Horas — registro interno de tiempo

Registro **privado** de las horas invertidas en el proyecto (ramas `main` + `v2`).
**No se deploya** a Firebase (Hosting solo sube `src/`), así que la clienta nunca lo ve.

## Ver el reporte
Dos modos:

- **Lectura rápida:** abrí `horas/index.html` con doble click. Ves todo, pero la X y el alta
  manual están desactivadas (un HTML local no puede escribir archivos).
- **Edición (X + alta manual):** corré el server y abrí el navegador:
  ```sh
  node horas/servidor.mjs
  # luego abrí http://localhost:8765
  ```

## Qué muestra
Total de horas, total a cobrar, promedio por sesión, y el desglose por **sesión → tarea**
(cada commit con su hora, hash, horas y monto). Cada tarea tiene una **X** para excluirla del
conteo, y abajo hay una sección "Excluidos" para restaurarlas.

## Cómo se calcula
- Lee `git log --no-merges` de las ramas de `config.json` (`main` + `v2`), deduplicado por hash,
  desde la fecha de `desde`.
- Agrupa commits en **sesiones** y estima **horas por tarea (= commit)**:
  - Horas = tiempo desde el commit anterior, si el hueco ≤ `umbralMin` (90 min).
  - Si el hueco es mayor (o es el primero) → **sesión nueva**, horas = `rampUpMin` (30 min de arranque).
- Cuenta **todo tu trabajo** (v1 en main + v2), una sola vez por commit. Los merge no inflan nada
  (`--no-merges` + dedup por hash).

Confiabilidad: **~70% automático**, **~90%** con ajustes. El automático mejora solo si commiteás
más seguido y granular (los ajustes manuales corrigen el resultado, no el algoritmo).

## La X y el alta manual (con el server)
- **X en una tarea** → excluye ese commit (se guarda en `ajustes.json` → `excluidos`). Persistente.
- **+ agregar trabajo manual** → suma horas que no quedaron en commits (research, QA, llamadas).
  Se guarda en `ajustes.json` → `extra`.
- Todo escribe en `ajustes.json` y regenera `data.js` al instante. Queda versionado en git.

## Configurar (`config.json`)
```json
{ "tarifaUsd": 20, "ramas": ["main","v2"], "desde": "2026-06-17 00:00", "umbralMin": 90, "rampUpMin": 30, "puerto": 8765 }
```
La tarifa también se cambia en vivo en el dashboard (se guarda en tu navegador).

## Automatizar (hook de git, una sola vez)
El hook regenera `data.js` tras cada commit en `main` o `v2`. Para activarlo en una máquina:
```sh
cp horas/hooks/post-commit .git/hooks/post-commit
chmod +x .git/hooks/post-commit
```
> `data.js` está **gitignoreado** (es un artefacto generado, reproducible desde el git log +
> `ajustes.json`). Por eso no aparece en `git status` ni complica cambiar de rama. El hook y el
> server lo mantienen fresco localmente; en un clon nuevo se regenera con `node horas/generar.mjs`.

## Archivos
| Archivo | Qué es |
|---|---|
| `index.html` | Dashboard (doble click = lectura; con server = editable). |
| `servidor.mjs` | Server local + API (excluir / agregar / restaurar). |
| `generar.mjs` | Recalcula `data.js` desde git. CLI o importable. |
| `data.js` | **Generado** (gitignoreado) — no editar a mano. |
| `config.json` | Tarifa, ramas, fecha de inicio, umbrales, puerto. |
| `ajustes.json` | Exclusiones + overrides + horas manuales. |
| `hooks/post-commit` | Automatización. |
