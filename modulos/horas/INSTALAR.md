# Módulo horas — instalación en un proyecto

> Copiado de AREA VIVA (`horas/`). Registro privado de horas por git log: agrupa commits en
> sesiones, estima horas por tarea, dashboard HTML con exclusiones y alta manual.
> **Requiere:** git en el proyecto + Node. El funcionamiento completo está en `README.md`.

## Pasos (los hace la IA, salvo 4 y 5)

1. Copiar esta carpeta a `<proyecto>/horas/` (sin este `INSTALAR.md` ni los `*.template.json`).
2. Crear `horas/config.json` desde `config.template.json` (borrar `_instrucciones`; rellenar
   tarifa, ramas reales y fecha `desde`).
3. Crear `horas/ajustes.json` desde `ajustes.template.json`.
4. **(JD, manual)** Activar el hook: `cp horas/hooks/post-commit .git/hooks/post-commit`
   (en Windows con Git Bash funciona igual; el hook regenera `data.js` tras cada commit).
5. **(JD, manual)** Primera corrida: `node horas/generar.mjs` → abre `horas/index.html`.

## No olvidar

- Agregar `horas/data.js` al `.gitignore` del proyecto (artefacto generado, reproducible).
- Si el proyecto se deploya, verificar que `horas/` quede FUERA del deploy (es privado;
  en AREA VIVA el hosting solo sube `src/`, por eso la clienta nunca lo ve).
- Para editar (excluir tareas / alta manual): `node horas/servidor.mjs` → `http://localhost:8765`.
  Este servidor local es una excepción permitida a la regla "no levantar servidor" — es una
  herramienta interna de JD, no la app.
