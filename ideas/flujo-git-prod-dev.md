# Flujo git prod/dev — ramas paralelas en un solo repo

- **Origen:** area-viva (`tutoriales/flujo-git-v1-v2.md`), 2026-06
- **Qué resuelve:** trabajar una versión nueva/refactor grande SIN que ningún deploy de
  producción arrastre trabajo a medias, y sin duplicar repositorio.
- **Cuándo aplica:** cualquier proyecto con algo en producción y trabajo grande en paralelo.
  NO aplica si el proyecto todavía no tiene nada productivo (una sola rama alcanza).

## La idea

Un solo repo con **dos ramas** (líneas de tiempo paralelas) + dos entornos de deploy:

- **`main`** = lo que está en producción. Entran SOLO fixes. Cada deploy a prod sale de acá.
- **`<rama-trabajo>`** = la mesa de trabajo (feature grande / refactor / v2). Deploya SOLO a
  un entorno de prueba.
- Los fixes **bajan** de `main` a la rama (merge `main → rama`) **apenas se hacen** — diez
  conflictos chicos en diez días son minutos; los mismos diez juntos, una tarde perdida.
- La rama **nunca sube** a `main` hasta el Cierre (QA integral → merge → deploy → tag).
- **Por qué NO duplicar el repo:** dos repos divergen sin historia común; incorporar un fix
  sería copy-paste a mano. Las ramas existen exactamente para esto.

**REGLA CERO de toda sesión:** `git branch --show-current` antes de trabajar (en VS Code, la
barra de estado abajo a la izquierda es la brújula). Trabajo de la rama NUNCA se commitea en
`main`; fixes de prod NUNCA nacen en la rama de trabajo.

**Flujo hotfix:** commitear/stashear lo de la rama → ir a `main` → fix + deploy prod → volver
a la rama → `git merge main` YA. Caso típico de conflicto en refactors: el fix toca una función
que en la rama se mudó de archivo → se acepta "Current" y se aplica el fix a mano en la nueva
ubicación (trabajo fino: pedírselo a Claude).

**Semver:** tag en cada deploy significativo de prod. Bug = patch (`1.0.x`), feature = minor
(`1.x.0`), versión mayor = major (`2.0.0`). El bump de versión visible es parte del Cierre.

**Errores comunes y salida:** commit en `main` sin push → `git reset --soft HEAD~1` y commitear
en la rama. "Desaparecieron archivos al cambiar de rama" → es lo esperado, cada rama muestra lo
suyo. Deploy a prod desde rama equivocada → pararse en `main` y redeployar.

## Cómo llevarla a un proyecto

1. Dejar `main` = producción exacta (commitear todo lo suelto) y taggear el punto de retorno.
2. Crear y publicar la rama de trabajo.
3. Definir el par de entornos de deploy (con Firebase: módulo `/x/modulos/firebase/`, aliases
   `-P prod`/`-P dev`; con otro hosting: el equivalente — prod solo desde `main`).
4. Copiar al `CLAUDE.md` del proyecto: la REGLA CERO + "deploy solo a dev durante desarrollo".
5. Al armar orquestadores, incluir la REGLA CERO como regla global §1.

## Referencia de origen

`area-viva/tutoriales/flujo-git-v1-v2.md` (completo, con capturas del flujo en VS Code,
merge editor y tabla de comandos).
