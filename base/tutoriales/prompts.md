# Prompts de bolsillo — el ciclo Claude ↔ Codex en una pantalla

> Tarjeta de referencia rápida con los 4 prompts del ciclo de trabajo. Versión pulida del
> `prompts-codex-claude.md` de AREA VIVA. Para trabajo grande, el flujo completo con etapas
> vive en `orquestador.md`; para auditar un proyecto entero, en `auditoria.md` — los prompts
> son los mismos, acá están a mano.

---

## 1. ARRANCAR un problema (Claude, fase de diseño — sin código)

El prompt para desmembrar un problema ANTES de decidir cómo se implementa. Sirve para features,
decisiones de arquitectura, o cualquier cosa que todavía no está clara.

```
PROBLEMA
<qué está pasando / qué falta>

OBJETIVO
<qué quiero lograr>

RESTRICCIONES
- no actualizar documentación típica en esta instancia
- no levantar servidor para hacer QA
- NO QUIERO CÓDIGO

Necesito desmembrar por completo, a tu criterio, el problema y la solución. Los puntos de
abajo son una guía típica — dame los que apliquen (o lo que creas necesario):
1. arquitectura propuesta
2. tradeoffs
3. riesgos
4. modelo de datos
5. UX
6. archivos a tocar
7. plan de implementación
8. criterios de aceptación
9. qué podría salir mal
10. challenge de mis supuestos
```

> Si de este diseño sale trabajo de varios subsistemas/chats → pasar a `orquestador.md`
> ("armemos un orquestador para <feature>"). Si es chico, seguir directo al paso 2.

## 2. Pedir el SPEC (Claude, al final del chat de diseño)

```
Transformá la propuesta anterior en una SPEC ejecutable para Codex.
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

## 3. Implementar (Codex, chat NUEVO)

```
Implementar SOLO ESTA SPEC.
Reglas: cambios mínimos · no refactor innecesario · no docs todavía · no levantar servidor · esperar QA mío.
Antes de editar: resumir entendimiento.
Después: archivos tocados · decisiones · riesgos · QA manual.
```

## 4. Auditar lo que hizo Codex (Claude, chat NUEVO — ojo fresco)

```
Revisá críticamente esta implementación.
OBJETIVO: detectar bugs y simplificar. No reescribir por gusto.
Buscar: drift · deuda técnica · edge cases · riesgos de mantenimiento · performance · inconsistencias.
Proponer fixes mínimos.
Si está limpio, decilo (no inventes).
Después decime cómo hacer el QA manual.

esto es lo que le pedí a codex:
()

esto es lo que me devolvió:
()
```

---

## El cierre (después del QA)

La doc de cierre NO se toca durante el ciclo. Cuando la auditoría da OK y el QA manual pasa,
JD da el OK explícito y recién ahí se actualiza la doc típica (BITACORA, CONTEXTO, DECISIONES,
lessons — una sola vez, todo junto).

## Intensidad (setear al arrancar cada chat, según el trabajo)

| Palabra clave | Cuándo |
|---|---|
| `think` | Barridos amplios, cosas mecánicas, creatividad. |
| `think hard` | Trazado de flujos, bugs sutiles, integraciones. |
| `ultrathink` | Decisiones irreversibles y/o con plata o seguridad en juego. |
