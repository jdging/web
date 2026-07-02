@echo off
REM Acceso directo al dashboard de horas en modo EDITABLE (X + alta manual).
REM Levanta el server local y abre el navegador. Cerra la ventana del server para apagarlo.
cd /d "%~dp0"
echo Iniciando dashboard de horas en http://localhost:8765 ...
start "Horas - server (cerrar para apagar)" cmd /k node servidor.mjs
timeout /t 2 /nobreak >nul
start "" http://localhost:8765
